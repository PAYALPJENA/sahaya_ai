from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from backend.core.enums import DispatchType, DispatchStatus

class DispatchCreateRequest(BaseModel):
    incident_id: int
    approval_id: int
    dispatch_type: DispatchType
    team_lead_id: Optional[int] = None
    instructions: Optional[str] = None
    eta_minutes: Optional[int] = None

class DispatchStatusUpdateRequest(BaseModel):
    status: DispatchStatus
    instructions: Optional[str] = None

class DispatchResponse(BaseModel):
    id: int
    incident_id: int
    approval_id: int
    dispatch_type: DispatchType
    status: DispatchStatus
    team_lead_id: Optional[int] = None
    instructions: Optional[str] = None
    eta_minutes: Optional[int] = None
    dispatched_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
