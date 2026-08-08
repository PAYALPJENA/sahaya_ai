from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas.approval import ApprovalRequest, ApprovalResponse
from backend.services import approval_service
from backend.api import deps
from backend.models.user import User

router = APIRouter()

@router.post("/incidents/{incident_id}/approve", response_model=ApprovalResponse, status_code=status.HTTP_201_CREATED)
def approve_recommendation(
    incident_id: int,
    request: ApprovalRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.require_collector)
):
    return approval_service.process_approval(
        db,
        incident_id=incident_id,
        request=request,
        officer_id=current_user.id,
        officer_role=current_user.role.value
    )
