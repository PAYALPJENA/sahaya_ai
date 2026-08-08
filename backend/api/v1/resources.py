from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database import get_db
from backend.schemas.resource import ResourceResponse
from backend.services import resource_service
from backend.api import deps
from backend.core.enums import ResourceType, ResourceStatus
from backend.models.user import User

router = APIRouter()

@router.get("", response_model=List[ResourceResponse])
def list_resources(
    type: Optional[ResourceType] = None,
    status: Optional[ResourceStatus] = None,
    district: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return resource_service.get_resources(db, type=type, status=status, district=district)

@router.get("/available", response_model=List[ResourceResponse])
def list_available_resources(
    type: Optional[ResourceType] = None,
    district: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return resource_service.get_resources(
        db, type=type, status=ResourceStatus.AVAILABLE, district=district
    )
