from sqlalchemy.orm import Session
from typing import List, Optional
from backend.models.dispatch import Dispatch
from backend.schemas.dispatch import DispatchCreateRequest, DispatchStatusUpdateRequest
from backend.core.enums import DispatchStatus, IncidentStatus
from backend.services import audit_service, incident_service
from backend.core.exceptions import EntityNotFoundException
import datetime

def create_dispatch(
    db: Session,
    request: DispatchCreateRequest,
    actor_id: int,
    actor_role: str
) -> Dispatch:
    db_dispatch = Dispatch(
        incident_id=request.incident_id,
        approval_id=request.approval_id,
        dispatch_type=request.dispatch_type,
        status=DispatchStatus.CREATED,
        team_lead_id=request.team_lead_id,
        instructions=request.instructions,
        eta_minutes=request.eta_minutes,
        created_at=datetime.datetime.utcnow()
    )
    db.add(db_dispatch)
    db.commit()
    db.refresh(db_dispatch)

    # Log dispatch creation
    audit_service.log_action(
        db,
        entity_type="INCIDENT",
        entity_id=request.incident_id,
        action="DISPATCH_CREATED",
        actor_id=actor_id,
        actor_role=actor_role,
        details={
            "dispatch_id": db_dispatch.id,
            "dispatch_type": db_dispatch.dispatch_type.value
        }
    )

    return db_dispatch

def get_dispatches(db: Session) -> List[Dispatch]:
    return db.query(Dispatch).all()

def get_dispatch_by_id(db: Session, dispatch_id: int) -> Dispatch:
    dispatch = db.query(Dispatch).filter(Dispatch.id == dispatch_id).first()
    if not dispatch:
        raise EntityNotFoundException("Dispatch", dispatch_id)
    return dispatch

def update_dispatch_status(
    db: Session,
    dispatch_id: int,
    request: DispatchStatusUpdateRequest,
    actor_id: int,
    actor_role: str
) -> Dispatch:
    dispatch = get_dispatch_by_id(db, dispatch_id)
    
    old_status = dispatch.status
    dispatch.status = request.status
    
    if request.status == DispatchStatus.DISPATCHED:
        dispatch.dispatched_at = datetime.datetime.utcnow()
        # Update incident status to DISPATCHED
        incident = incident_service.get_incident_by_id(db, dispatch.incident_id)
        if incident.status == IncidentStatus.APPROVED:
            incident.status = IncidentStatus.DISPATCHED
            
    elif request.status == DispatchStatus.EN_ROUTE:
        incident = incident_service.get_incident_by_id(db, dispatch.incident_id)
        if incident.status == IncidentStatus.DISPATCHED:
            incident.status = IncidentStatus.IN_PROGRESS
            
    elif request.status == DispatchStatus.COMPLETED:
        dispatch.completed_at = datetime.datetime.utcnow()
        incident = incident_service.get_incident_by_id(db, dispatch.incident_id)
        incident.status = IncidentStatus.RESOLVED

    if request.instructions:
        dispatch.instructions = request.instructions
        
    db.commit()
    db.refresh(dispatch)
    
    # Log status change under the Incident entity
    audit_service.log_action(
        db,
        entity_type="INCIDENT",
        entity_id=dispatch.incident_id,
        action="DISPATCH_STATUS_CHANGED",
        actor_id=actor_id,
        actor_role=actor_role,
        details={
            "dispatch_id": dispatch.id,
            "old_status": old_status.value,
            "new_status": dispatch.status.value,
            "instructions": request.instructions
        }
    )
    
    return dispatch
