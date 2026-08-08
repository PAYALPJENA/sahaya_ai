from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from backend.core.enums import ResourceType, ResourceStatus, AllocationStatus

class ResourceResponse(BaseModel):
    id: int
    name: str
    type: ResourceType
    status: ResourceStatus
    current_location: str
    district: str
    capacity: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ResourceAllocationResponse(BaseModel):
    id: int
    incident_id: int
    resource_id: int
    approval_id: int
    quantity: int
    status: AllocationStatus
    allocated_at: datetime
    dispatched_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
