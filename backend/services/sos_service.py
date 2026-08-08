from sqlalchemy.orm import Session
from backend.models.sos_report import SOSReport
from backend.models.incident import Incident
from backend.models.ai_recommendation import AIRecommendation
from backend.schemas.sos import SOSCreateRequest, SOSStatusResponse
from backend.core.enums import IncidentStatus, SOSSourceType, DisasterType, Severity, RecommendationType, DispatchStatus
from backend.ai import nim_client
from backend.services import audit_service
import datetime

def create_sos_report(db: Session, request: SOSCreateRequest) -> SOSReport:
    # 1. Save raw SOS report
    db_sos = SOSReport(
        source_type=request.source_type,
        raw_content=request.raw_content,
        media_url=request.media_url,
        reporter_name=request.reporter_name,
        reporter_phone=request.reporter_phone,
        reporter_location_text=request.reporter_location_text,
        latitude=request.latitude,
        longitude=request.longitude,
        processed=False,
        submitted_at=datetime.datetime.utcnow()
    )
    db.add(db_sos)
    db.commit()
    db.refresh(db_sos)
    
    # Log SOS intake to audit
    audit_service.log_action(
        db,
        entity_type="SOS",
        entity_id=db_sos.id,
        action="CREATED",
        details={"source_type": request.source_type}
    )

    # 2. Run AI pipeline (processing all modalities: text, audio, image, weather, geocoding)
    from backend.services import ai_pipeline
    pipeline_res = ai_pipeline.run_ai_pipeline(db, db_sos)

    if pipeline_res.get("is_spam"):
        # Report is classified as spam
        db_sos.is_spam = True
        db_sos.needs_manual_review = pipeline_res.get("needs_manual_review", False)
        db_sos.rejection_reason = pipeline_res.get("rejection_reason")
        db_sos.processed = True
        db.commit()
        db.refresh(db_sos)

        # Create a closed incident for records
        db_incident = Incident(
            sos_report_id=db_sos.id,
            title="Spam / Non-Emergency Request",
            description=db_sos.raw_content,
            disaster_type=DisasterType.OTHER,
            severity=Severity.LOW,
            priority_score=10,
            status=IncidentStatus.CLOSED,
            is_spam=True,
            needs_manual_review=db_sos.needs_manual_review,
            rejection_reason=db_sos.rejection_reason,
            district="Puri",
            affected_count_estimate=0
        )
        db.add(db_incident)
        db.commit()
        db.refresh(db_incident)

        db_sos.incident_id = db_incident.id
        db.commit()

        # Log spam detection
        audit_service.log_action(
            db,
            entity_type="SOS",
            entity_id=db_sos.id,
            action="REJECTED_AS_SPAM",
            details={"reason": db_sos.rejection_reason, "needs_manual_review": db_sos.needs_manual_review}
        )
        return db_sos

    ai_data = pipeline_res.get("ai_data", {})
    disaster_type = pipeline_res.get("disaster_type", DisasterType.OTHER)
    severity = pipeline_res.get("severity", Severity.MEDIUM)
    priority_score = pipeline_res.get("priority_score", 50)
    location_details = pipeline_res.get("location_details", {})
    facilities = pipeline_res.get("facilities", {})
    image_analysis = pipeline_res.get("image_analysis", {})

    if pipeline_res.get("clustered"):
        # Duplicate report clustered into an existing incident
        existing_incident_id = pipeline_res["incident_id"]
        db_sos.incident_id = existing_incident_id
        db_sos.processed = True
        db.commit()
        db.refresh(db_sos)

        # Update existing incident's affected count estimate if new estimate is higher
        existing_inc = db.query(Incident).filter(Incident.id == existing_incident_id).first()
        if existing_inc:
            new_est = max(existing_inc.affected_count_estimate, ai_data.get("affected_count_estimate", 1))
            existing_inc.affected_count_estimate = new_est
            db.commit()

        # Log duplicate intake to audit log of existing incident
        audit_service.log_action(
            db,
            entity_type="INCIDENT",
            entity_id=existing_incident_id,
            action="DUPLICATE_SOS_CLUSTERED",
            details={
                "duplicate_sos_id": db_sos.id,
                "reporter_name": db_sos.reporter_name,
                "reporter_phone": db_sos.reporter_phone,
                "raw_content": db_sos.raw_content
            }
        )
        return db_sos

    classification = ai_data.get("classification", "EMERGENCY")
    incident_status = IncidentStatus.TRIAGED
    needs_manual_review = False
    rejection_reason = None
    
    if classification == "NON_EMERGENCY":
        incident_status = IncidentStatus.CLOSED
        rejection_reason = "AI classified as NON_EMERGENCY"
    elif classification == "UNCERTAIN":
        incident_status = IncidentStatus.UNDER_REVIEW
        needs_manual_review = True

    # Create a new incident from AI pipeline output (enriched with structured metadata)
    db_incident = Incident(
        sos_report_id=db_sos.id,
        title=ai_data.get("title", "SOS Emergency Request"),
        description=ai_data.get("description", request.raw_content),
        disaster_type=disaster_type,
        severity=severity,
        priority_score=priority_score,
        status=incident_status,
        location_text=ai_data.get("location_text") or request.reporter_location_text,
        latitude=request.latitude,
        longitude=request.longitude,
        district=pipeline_res.get("district", "Puri"),
        affected_count_estimate=ai_data.get("affected_count_estimate", 1),
        needs_evacuation=ai_data.get("needs_evacuation", False),
        needs_medical=ai_data.get("needs_medical", False),
        needs_shelter=ai_data.get("needs_shelter", False),
        needs_food_water=ai_data.get("needs_food_water", False),
        needs_manual_review=needs_manual_review,
        rejection_reason=rejection_reason,
        # Enriched AI fields
        confidence_score=pipeline_res.get("confidence_score", 0.95),
        nearest_hospital=pipeline_res.get("nearest_hospital"),
        nearest_shelter=pipeline_res.get("nearest_shelter"),
        nearest_rescue_team=pipeline_res.get("nearest_rescue_team"),
        estimated_response_time=pipeline_res.get("estimated_response_time"),
        suggested_action=pipeline_res.get("suggested_action")
    )
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)

    # Link SOS report to incident
    db_sos.incident_id = db_incident.id
    db_sos.processed = True
    db.commit()
    db.refresh(db_sos)

    # Log Incident creation
    audit_service.log_action(
        db,
        entity_type="INCIDENT",
        entity_id=db_incident.id,
        action="CREATED",
        details={"source_sos_id": db_sos.id, "title": db_incident.title, "priority_score": db_incident.priority_score}
    )

    # Compile recommendation details including facilities and alerts
    recommendation_details = {
        "resources": ai_data.get("resources", []),
        "severity": severity,
        "disaster_type": disaster_type,
        "priority_score": priority_score,
        "nearest_facilities": {
            "hospital": {
                "name": facilities["hospital"].name,
                "distance_km": facilities["hospital_distance_km"],
                "contact_number": facilities["hospital"].contact_number
            } if facilities.get("hospital") else None,
            "shelter": {
                "name": facilities["shelter"].name,
                "distance_km": facilities["shelter_distance_km"]
            } if facilities.get("shelter") else None
        },
        "image_analysis": image_analysis
    }

    # Save AI Recommendation
    db_rec = AIRecommendation(
        incident_id=db_incident.id,
        recommendation_type=RecommendationType.TRIAGE,
        recommendation_data=recommendation_details,
        confidence_score=0.95,
        reasoning=ai_data.get("reasoning", "AI parsed from citizen emergency report."),
        model_used="meta/llama3-70b-instruct",
        is_active=True
    )
    db.add(db_rec)
    db.commit()
    db.refresh(db_rec)

    # Log AI Triage to audit
    audit_service.log_action(
        db,
        entity_type="AI_RECOMMENDATION",
        entity_id=db_rec.id,
        action="CREATED",
        details={"incident_id": db_incident.id, "reasoning": db_rec.reasoning}
    )

    return db_sos

def get_sos_status(db: Session, token: str) -> SOSStatusResponse:
    report = db.query(SOSReport).filter(SOSReport.tracking_token == token).first()
    if not report:
        return None
        
    response_data = {
        "tracking_token": report.tracking_token,
        "source_type": report.source_type,
        "processed": report.processed,
        "submitted_at": report.submitted_at,
        "citizen_status": "Report Submitted"
    }
    
    if report.incident:
        inc = report.incident
        response_data["incident_id"] = inc.id
        response_data["incident_status"] = inc.status
        response_data["incident_severity"] = inc.severity
        response_data["location_text"] = inc.location_text
        
        # Determine citizen_status
        citizen_status = "Report Submitted"
        if inc.status in [IncidentStatus.UNDER_REVIEW]:
            citizen_status = "AI Verified"
        elif inc.status in [IncidentStatus.APPROVED, IncidentStatus.DISPATCHED, IncidentStatus.IN_PROGRESS]:
            citizen_status = "Collector Approved"
            
            # Check for dispatches to upgrade status
            if inc.dispatches:
                # We take the most advanced dispatch status
                dispatch_statuses = [d.status for d in inc.dispatches]
                if DispatchStatus.COMPLETED in dispatch_statuses or DispatchStatus.CANCELLED in dispatch_statuses:
                    citizen_status = "Mission Completed"
                elif DispatchStatus.ON_SITE in dispatch_statuses or DispatchStatus.EN_ROUTE in dispatch_statuses:
                    citizen_status = "Team En Route"
                elif DispatchStatus.DISPATCHED in dispatch_statuses:
                    citizen_status = "Rescue Team Assigned"
                elif DispatchStatus.CREATED in dispatch_statuses:
                    citizen_status = "Dispatch Created"
        
        if inc.status in [IncidentStatus.RESOLVED, IncidentStatus.CLOSED]:
            citizen_status = "Mission Completed"
            
        response_data["citizen_status"] = citizen_status
        
    return SOSStatusResponse(**response_data)
