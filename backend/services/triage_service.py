from sqlalchemy.orm import Session
from backend.models.incident import Incident
from backend.models.ai_recommendation import AIRecommendation
from backend.core.enums import IncidentStatus, DisasterType, Severity, RecommendationType
from backend.ai import nim_client
from backend.services import audit_service, incident_service

def triage_incident(db: Session, incident_id: int, actor_id: int, actor_role: str) -> AIRecommendation:
    # 1. Fetch incident
    incident = incident_service.get_incident_by_id(db, incident_id)
    
    # 2. Update status to UNDER_REVIEW since triage was manually requested/started
    incident.status = IncidentStatus.UNDER_REVIEW
    
    # 3. Call AI
    ai_data = nim_client.analyze_sos_report(
        content=incident.description,
        location=incident.location_text
    )
    
    # 4. Deactivate old recommendations
    db.query(AIRecommendation).filter(
        AIRecommendation.incident_id == incident_id,
        AIRecommendation.is_active == True
    ).update({"is_active": False})
    
    # 5. Save new AI Recommendation
    try:
        disaster_type = DisasterType(ai_data.get("disaster_type", "OTHER"))
    except ValueError:
        disaster_type = DisasterType.OTHER

    try:
        severity = Severity(ai_data.get("severity", "MEDIUM"))
    except ValueError:
        severity = Severity.MEDIUM
        
    incident.priority_score = ai_data.get("priority_score", 50)
    incident.disaster_type = disaster_type
    incident.severity = severity
    incident.needs_evacuation = ai_data.get("needs_evacuation", False)
    incident.needs_medical = ai_data.get("needs_medical", False)
    incident.needs_shelter = ai_data.get("needs_shelter", False)
    incident.needs_food_water = ai_data.get("needs_food_water", False)
    
    db_rec = AIRecommendation(
        incident_id=incident.id,
        recommendation_type=RecommendationType.TRIAGE,
        recommendation_data={
            "resources": ai_data.get("resources", []),
            "severity": severity,
            "disaster_type": disaster_type,
            "priority_score": incident.priority_score
        },
        confidence_score=0.92,
        reasoning=ai_data.get("reasoning", "AI re-triaged incident details."),
        model_used="meta/llama3-70b-instruct",
        is_active=True
    )
    db.add(db_rec)
    db.commit()
    db.refresh(db_rec)
    
    # Log triage event under the Incident entity
    audit_service.log_action(
        db,
        entity_type="INCIDENT",
        entity_id=incident.id,
        action="TRIAGED",
        actor_id=actor_id,
        actor_role=actor_role,
        details={
            "recommendation_id": db_rec.id,
            "severity": severity,
            "priority_score": incident.priority_score
        }
    )
    
    return db_rec

def get_recommendations_for_incident(db: Session, incident_id: int) -> list[AIRecommendation]:
    # Verify incident exists
    incident_service.get_incident_by_id(db, incident_id)
    return db.query(AIRecommendation).filter(AIRecommendation.incident_id == incident_id).order_by(AIRecommendation.created_at.desc()).all()
