from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.schemas.recommendation import AIRecommendationResponse
from backend.services import triage_service
from backend.api import deps
from backend.models.user import User

router = APIRouter()

@router.post("/incidents/{incident_id}/triage", response_model=AIRecommendationResponse)
def trigger_triage(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.require_collector)
):
    return triage_service.triage_incident(
        db,
        incident_id=incident_id,
        actor_id=current_user.id,
        actor_role=current_user.role.value
    )

@router.get("/incidents/{incident_id}/recommendations", response_model=List[AIRecommendationResponse])
def get_recommendations(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return triage_service.get_recommendations_for_incident(db, incident_id=incident_id)
