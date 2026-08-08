from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.schemas.dispatch import DispatchCreateRequest, DispatchResponse, DispatchStatusUpdateRequest
from backend.services import dispatch_service
from backend.api import deps
from backend.models.user import User

router = APIRouter()

@router.post("", response_model=DispatchResponse, status_code=status.HTTP_201_CREATED)
def create_dispatch_order(
    request: DispatchCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.require_collector)
):
    return dispatch_service.create_dispatch(
        db,
        request=request,
        actor_id=current_user.id,
        actor_role=current_user.role.value
    )

@router.get("", response_model=List[DispatchResponse])
def list_dispatches(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return dispatch_service.get_dispatches(db)

@router.get("/{id}", response_model=DispatchResponse)
def get_dispatch(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return dispatch_service.get_dispatch_by_id(db, id)

@router.patch("/{id}/status", response_model=DispatchResponse)
def update_status(
    id: int,
    request: DispatchStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.require_responder)
):
    return dispatch_service.update_dispatch_status(
        db,
        dispatch_id=id,
        request=request,
        actor_id=current_user.id,
        actor_role=current_user.role.value
    )
