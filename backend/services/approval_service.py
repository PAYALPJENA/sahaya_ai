from sqlalchemy.orm import Session
from backend.models.approval import ApprovalDecision
from backend.models.ai_recommendation import AIRecommendation
from backend.models.incident import Incident
from backend.models.dispatch import Dispatch
from backend.models.notification import Notification
from backend.models.resource import Resource
from backend.models.rescue_team import RescueTeam, TeamStatus
from backend.models.hospital import Hospital, HospitalStatus
from backend.models.shelter import Shelter, ShelterStatus
from backend.schemas.approval import ApprovalRequest
from backend.core.enums import (
    IncidentStatus, ApprovalDecision as DecEnum, DispatchStatus, DispatchType,
    ResourceType, ResourceStatus, RecipientType, NotificationChannel, NotificationStatus,
    Severity
)
from backend.services import resource_service, audit_service, incident_service
from backend.services.ai_pipeline import haversine_distance
from backend.core.exceptions import EntityNotFoundException
import datetime

def process_approval(
    db: Session,
    incident_id: int,
    request: ApprovalRequest,
    officer_id: int,
    officer_role: str
) -> ApprovalDecision:
    # Fetch incident
    incident = incident_service.get_incident_by_id(db, incident_id)
    
    # Fetch AI recommendation
    rec = db.query(AIRecommendation).filter(AIRecommendation.id == request.recommendation_id).first()
    if not rec:
        raise EntityNotFoundException("AIRecommendation", request.recommendation_id)
        
    # Save approval decision
    db_decision = ApprovalDecision(
        incident_id=incident_id,
        ai_recommendation_id=request.recommendation_id,
        officer_id=officer_id,
        decision=request.decision,
        modifications=request.modifications,
        reason=request.reason,
        decided_at=datetime.datetime.utcnow()
    )
    db.add(db_decision)
    db.commit()
    db.refresh(db_decision)

    # Log action to incident audit log
    audit_service.log_action(
        db,
        entity_type="INCIDENT",
        entity_id=incident_id,
        action="DECISION_RECORDED",
        actor_id=officer_id,
        actor_role=officer_role,
        details={
            "decision": request.decision.value,
            "reason": request.reason,
            "approval_id": db_decision.id
        }
    )

    if request.decision in [DecEnum.APPROVED, DecEnum.MODIFIED]:
        # =============================================
        # AUTOMATION ENGINE — Zero Manual Intervention
        # =============================================
        automation_log = []

        # --- STEP 1: Find nearest available rescue team ---
        assigned_team = _find_and_reserve_rescue_team(db, incident)
        if assigned_team:
            automation_log.append(f"Rescue team '{assigned_team.name}' assigned and set to BUSY.")
            audit_service.log_action(db, entity_type="INCIDENT", entity_id=incident_id,
                action="RESCUE_TEAM_ASSIGNED", actor_id=officer_id, actor_role="SYSTEM",
                details={"team_id": assigned_team.id, "team_name": assigned_team.name})

        # --- STEP 2: Reserve rescue boat ---
        reserved_boat = _reserve_resource(db, ResourceType.BOAT)
        if reserved_boat:
            automation_log.append(f"Rescue boat '{reserved_boat.name}' reserved and deployed.")
            audit_service.log_action(db, entity_type="INCIDENT", entity_id=incident_id,
                action="BOAT_RESERVED", actor_id=officer_id, actor_role="SYSTEM",
                details={"resource_id": reserved_boat.id, "resource_name": reserved_boat.name})

        # --- STEP 3: Reserve ambulance (decrement hospital ambulance count) ---
        ambulance_hospital = _reserve_ambulance(db, incident)
        if ambulance_hospital:
            automation_log.append(f"Ambulance reserved from '{ambulance_hospital.name}'.")
            audit_service.log_action(db, entity_type="INCIDENT", entity_id=incident_id,
                action="AMBULANCE_RESERVED", actor_id=officer_id, actor_role="SYSTEM",
                details={"hospital_id": ambulance_hospital.id, "hospital_name": ambulance_hospital.name})

        # --- STEP 4: Reserve medical team ---
        reserved_medteam = _reserve_resource(db, ResourceType.MEDICAL_TEAM)
        if reserved_medteam:
            automation_log.append(f"Medical team '{reserved_medteam.name}' reserved and deployed.")
            audit_service.log_action(db, entity_type="INCIDENT", entity_id=incident_id,
                action="MEDICAL_TEAM_RESERVED", actor_id=officer_id, actor_role="SYSTEM",
                details={"resource_id": reserved_medteam.id, "resource_name": reserved_medteam.name})

        # --- STEP 5: Reserve shelter ---
        reserved_shelter = _reserve_shelter(db, incident)
        if reserved_shelter:
            automation_log.append(f"Shelter '{reserved_shelter.name}' reserved ({incident.affected_count_estimate} people).")
            audit_service.log_action(db, entity_type="INCIDENT", entity_id=incident_id,
                action="SHELTER_RESERVED", actor_id=officer_id, actor_role="SYSTEM",
                details={"shelter_id": reserved_shelter.id, "shelter_name": reserved_shelter.name,
                         "people_added": incident.affected_count_estimate})

        # --- STEP 6: Notify hospital ---
        notified_hospital = _notify_hospital(db, incident)
        if notified_hospital:
            automation_log.append(f"Hospital '{notified_hospital.name}' notified about incoming casualties.")
            audit_service.log_action(db, entity_type="INCIDENT", entity_id=incident_id,
                action="HOSPITAL_NOTIFIED", actor_id=officer_id, actor_role="SYSTEM",
                details={"hospital_id": notified_hospital.id, "hospital_name": notified_hospital.name})

        # --- STEP 7: Allocate resources from recommendation ---
        rec_resources = rec.recommendation_data.get("resources", [])
        if request.decision == DecEnum.MODIFIED and request.modifications and "resources" in request.modifications:
            rec_resources = request.modifications["resources"]

        allocated = resource_service.allocate_resources_for_incident(
            db, incident_id=incident_id, approval_id=db_decision.id, resources_needed=rec_resources
        )
        automation_log.append(f"Resources allocated: {len(allocated)} items.")

        # --- STEP 8: Create dispatch ---
        disp_type = DispatchType.RELIEF
        if incident.needs_evacuation:
            disp_type = DispatchType.EVACUATION
        elif incident.needs_medical:
            disp_type = DispatchType.MEDICAL
        if incident.severity == Severity.CRITICAL and incident.needs_evacuation:
            disp_type = DispatchType.RESCUE

        # Calculate ETA from assigned team distance
        eta_minutes = None
        if assigned_team and incident.latitude and incident.longitude:
            dist = haversine_distance(incident.latitude, incident.longitude, assigned_team.latitude, assigned_team.longitude)
            eta_minutes = int(dist * 5 + 10)

        instructions_parts = [
            f"AUTOMATED DISPATCH — Incident #{incident_id}",
            f"Team: {assigned_team.name if assigned_team else 'Unassigned'}",
            f"Boat: {reserved_boat.name if reserved_boat else 'N/A'}",
            f"Medical: {reserved_medteam.name if reserved_medteam else 'N/A'}",
            f"Shelter: {reserved_shelter.name if reserved_shelter else 'N/A'}",
            f"Hospital notified: {notified_hospital.name if notified_hospital else 'N/A'}",
            f"Affected: {incident.affected_count_estimate} people",
            f"ETA: {eta_minutes} mins" if eta_minutes else "ETA: Unknown"
        ]

        db_dispatch = Dispatch(
            incident_id=incident_id,
            approval_id=db_decision.id,
            dispatch_type=disp_type,
            status=DispatchStatus.DISPATCHED,
            instructions="\n".join(instructions_parts),
            eta_minutes=eta_minutes,
            dispatched_at=datetime.datetime.utcnow(),
            created_at=datetime.datetime.utcnow()
        )
        db.add(db_dispatch)
        db.commit()
        db.refresh(db_dispatch)
        automation_log.append(f"Dispatch #{db_dispatch.id} created with status DISPATCHED.")

        # --- STEP 9: Update citizen tracking (send notification to citizen) ---
        sos_report = incident.sos_report
        if sos_report and sos_report.reporter_phone:
            citizen_msg = (
                f"[Sahaya AI] Your SOS report #{sos_report.tracking_token} has been APPROVED. "
                f"Rescue team '{assigned_team.name if assigned_team else 'N/A'}' is being dispatched. "
                f"ETA: {eta_minutes or '~15'} mins. Stay safe. — District Collector, Puri"
            )
            citizen_notif = Notification(
                recipient_type=RecipientType.CITIZEN,
                recipient_identifier=sos_report.reporter_phone,
                incident_id=incident_id,
                channel=NotificationChannel.SMS,
                message=citizen_msg,
                status=NotificationStatus.SENT,
                sent_at=datetime.datetime.utcnow()
            )
            db.add(citizen_notif)
            db.commit()
            automation_log.append(f"Citizen notified via SMS at {sos_report.reporter_phone}.")

        # --- STEP 10: Write automation summary log ---
        audit_service.log_action(
            db,
            entity_type="INCIDENT",
            entity_id=incident_id,
            action="AUTOMATION_COMPLETE",
            actor_id=officer_id,
            actor_role="SYSTEM",
            details={
                "dispatch_id": db_dispatch.id,
                "automation_steps": automation_log,
                "eta_minutes": eta_minutes,
                "team_assigned": assigned_team.name if assigned_team else None,
                "boat_reserved": reserved_boat.name if reserved_boat else None,
                "medical_team": reserved_medteam.name if reserved_medteam else None,
                "shelter_reserved": reserved_shelter.name if reserved_shelter else None,
                "hospital_notified": notified_hospital.name if notified_hospital else None
            }
        )

        # Update incident status to DISPATCHED
        incident.status = IncidentStatus.DISPATCHED
        db.commit()

    elif request.decision == DecEnum.REJECTED:
        incident.status = IncidentStatus.TRIAGED
        db.commit()

    return db_decision


# =============================================
# Automation Helper Functions
# =============================================

def _find_and_reserve_rescue_team(db: Session, incident: Incident) -> RescueTeam:
    """Find nearest AVAILABLE rescue team to incident and set it to BUSY."""
    teams = db.query(RescueTeam).filter(RescueTeam.status == TeamStatus.AVAILABLE).all()
    if not teams:
        return None

    nearest = None
    min_dist = float('inf')
    for t in teams:
        dist = haversine_distance(incident.latitude or 0, incident.longitude or 0, t.latitude, t.longitude)
        if dist < min_dist:
            min_dist = dist
            nearest = t

    if nearest:
        nearest.status = TeamStatus.BUSY
        db.commit()
    return nearest


def _reserve_resource(db: Session, resource_type: ResourceType) -> Resource:
    """Find first AVAILABLE resource of the given type and set it to DEPLOYED."""
    resource = db.query(Resource).filter(
        Resource.type == resource_type,
        Resource.status == ResourceStatus.AVAILABLE
    ).first()

    if resource:
        resource.status = ResourceStatus.DEPLOYED
        db.commit()
    return resource


def _reserve_ambulance(db: Session, incident: Incident) -> Hospital:
    """Find nearest OPERATING hospital with ambulances and decrement count."""
    hospitals = db.query(Hospital).filter(
        Hospital.status == HospitalStatus.OPERATING,
        Hospital.ambulances > 0
    ).all()
    if not hospitals:
        return None

    nearest = None
    min_dist = float('inf')
    for h in hospitals:
        dist = haversine_distance(incident.latitude or 0, incident.longitude or 0, h.latitude, h.longitude)
        if dist < min_dist:
            min_dist = dist
            nearest = h

    if nearest:
        nearest.ambulances -= 1
        db.commit()
    return nearest


def _reserve_shelter(db: Session, incident: Incident) -> Shelter:
    """Find nearest OPEN shelter with remaining capacity and increment occupancy."""
    shelters = db.query(Shelter).filter(Shelter.status == ShelterStatus.OPEN).all()
    if not shelters:
        return None

    people = incident.affected_count_estimate or 1
    nearest = None
    min_dist = float('inf')
    for s in shelters:
        remaining = s.capacity - s.current_occupancy
        if remaining >= people:
            dist = haversine_distance(incident.latitude or 0, incident.longitude or 0, s.latitude, s.longitude)
            if dist < min_dist:
                min_dist = dist
                nearest = s

    if nearest:
        nearest.current_occupancy += people
        if nearest.current_occupancy >= nearest.capacity:
            nearest.status = ShelterStatus.FULL
        db.commit()
    return nearest


def _notify_hospital(db: Session, incident: Incident) -> Hospital:
    """Notify nearest operating hospital about incoming casualties."""
    hospitals = db.query(Hospital).filter(Hospital.status == HospitalStatus.OPERATING).all()
    if not hospitals:
        return None

    nearest = None
    min_dist = float('inf')
    for h in hospitals:
        dist = haversine_distance(incident.latitude or 0, incident.longitude or 0, h.latitude, h.longitude)
        if dist < min_dist:
            min_dist = dist
            nearest = h

    if nearest:
        # Create a notification record for the hospital
        hospital_msg = (
            f"[Sahaya AI Alert] Incoming disaster casualties from Incident #{incident.id} — "
            f"{incident.title}. Disaster: {incident.disaster_type.value}. "
            f"Estimated {incident.affected_count_estimate} affected. "
            f"Severity: {incident.severity.value}. Prepare emergency beds."
        )
        notif = Notification(
            recipient_type=RecipientType.OFFICER,
            recipient_identifier=nearest.contact_number or "HOSPITAL",
            incident_id=incident.id,
            channel=NotificationChannel.SMS,
            message=hospital_msg,
            status=NotificationStatus.SENT,
            sent_at=datetime.datetime.utcnow()
        )
        db.add(notif)
        db.commit()

    return nearest
