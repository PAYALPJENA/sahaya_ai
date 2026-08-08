from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database import get_db
from backend.schemas.incident import IncidentResponse, IncidentUpdateRequest
from backend.schemas.audit import AuditLogResponse # We will create schemas/audit.py next
from backend.services import incident_service
from backend.api import deps
from backend.models.user import User
from backend.core.enums import IncidentStatus, Severity, DisasterType

router = APIRouter()

@router.get("", response_model=List[IncidentResponse])
def list_incidents(
    status: Optional[IncidentStatus] = None,
    severity: Optional[Severity] = None,
    disaster_type: Optional[DisasterType] = None,
    search: Optional[str] = None,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return incident_service.get_incidents(
        db,
        status=status,
        severity=severity,
        disaster_type=disaster_type,
        search=search,
        limit=limit,
        offset=offset
    )

@router.get("/{id}", response_model=IncidentResponse)
def get_incident(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return incident_service.get_incident_by_id(db, id)

@router.patch("/{id}", response_model=IncidentResponse)
def update_incident(
    id: int,
    request: IncidentUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.require_collector)
):
    return incident_service.update_incident(
        db,
        incident_id=id,
        request=request,
        actor_id=current_user.id,
        actor_role=current_user.role.value
    )

@router.get("/{id}/timeline") # We'll return dynamic JSON list of timeline events
def get_timeline(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    timeline = incident_service.get_incident_timeline(db, id)
    # Return formatted list for UI ease
    return [
        {
            "id": log.id,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "action": log.action,
            "actor_id": log.actor_id,
            "actor_name": log.actor.name if log.actor else "SYSTEM AI",
            "actor_role": log.actor_role,
            "details": log.details,
            "timestamp": log.timestamp
        }
        for log in timeline
    ]
