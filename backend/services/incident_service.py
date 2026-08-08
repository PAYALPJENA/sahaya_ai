from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from backend.models.incident import Incident
from backend.models.audit_log import AuditLog
from backend.schemas.incident import IncidentUpdateRequest
from backend.core.enums import IncidentStatus, Severity, DisasterType
from backend.services import audit_service
from backend.core.exceptions import EntityNotFoundException

def get_incidents(
    db: Session,
    status: Optional[IncidentStatus] = None,
    severity: Optional[Severity] = None,
    disaster_type: Optional[DisasterType] = None,
    search: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
) -> List[Incident]:
    query = db.query(Incident)
    
    if status:
        query = query.filter(Incident.status == status)
    if severity:
        query = query.filter(Incident.severity == severity)
    if disaster_type:
        query = query.filter(Incident.disaster_type == disaster_type)
        
    if search:
        query = query.filter(
            or_(
                Incident.title.ilike(f"%{search}%"),
                Incident.description.ilike(f"%{search}%"),
                Incident.location_text.ilike(f"%{search}%")
            )
        )
        
    # Sort by priority score descending and then created_at descending
    return query.order_by(Incident.priority_score.desc(), Incident.created_at.desc()).limit(limit).offset(offset).all()

def get_incident_by_id(db: Session, incident_id: int) -> Incident:
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise EntityNotFoundException("Incident", incident_id)
    return incident

def update_incident(
    db: Session,
    incident_id: int,
    request: IncidentUpdateRequest,
    actor_id: int,
    actor_role: str
) -> Incident:
    incident = get_incident_by_id(db, incident_id)
    
    update_data = request.dict(exclude_unset=True)
    old_status = incident.status
    
    for key, value in update_data.items():
        setattr(incident, key, value)
        
    db.commit()
    db.refresh(incident)
    
    # Log audit trail
    details = {
        "changes": update_data
    }
    if "status" in update_data and old_status != incident.status:
        details["old_status"] = old_status
        details["new_status"] = incident.status
        
    audit_service.log_action(
        db,
        entity_type="INCIDENT",
        entity_id=incident.id,
        action="UPDATED",
        actor_id=actor_id,
        actor_role=actor_role,
        details=details
    )
    
    return incident

def get_incident_timeline(db: Session, incident_id: int) -> List[AuditLog]:
    # Verify incident exists
    get_incident_by_id(db, incident_id)
    
    # Fetch all logs related to this incident
    return db.query(AuditLog).filter(
        AuditLog.entity_type == "INCIDENT",
        AuditLog.entity_id == incident_id
    ).order_by(AuditLog.timestamp.asc()).all()

def request_info(
    db: Session,
    incident_id: int,
    actor_id: int,
    actor_role: str,
    reason: Optional[str] = None
) -> Incident:
    incident = get_incident_by_id(db, incident_id)
    
    details = {"note": reason} if reason else {}
    
    audit_service.log_action(
        db,
        entity_type="INCIDENT",
        entity_id=incident.id,
        action="INFO_REQUESTED",
        actor_id=actor_id,
        actor_role=actor_role,
        details=details
    )
    
    return incident

def escalate_incident(
    db: Session,
    incident_id: int,
    actor_id: int,
    actor_role: str,
    reason: Optional[str] = None
) -> Incident:
    incident = get_incident_by_id(db, incident_id)
    
    old_severity = incident.severity
    incident.severity = Severity.CRITICAL
    db.commit()
    db.refresh(incident)
    
    details = {
        "old_severity": old_severity,
        "new_severity": incident.severity.value if hasattr(incident.severity, "value") else incident.severity
    }
    if reason:
        details["note"] = reason
        
    audit_service.log_action(
        db,
        entity_type="INCIDENT",
        entity_id=incident.id,
        action="ESCALATED",
        actor_id=actor_id,
        actor_role=actor_role,
        details=details
    )
    
    return incident
