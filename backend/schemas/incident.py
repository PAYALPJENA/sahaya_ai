from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from backend.core.enums import DisasterType, Severity, IncidentStatus

class IncidentUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    disaster_type: Optional[DisasterType] = None
    severity: Optional[Severity] = None
    priority_score: Optional[int] = None
    status: Optional[IncidentStatus] = None
    location_text: Optional[str] = None
    assigned_to: Optional[int] = None

class IncidentResponse(BaseModel):
    id: int
    sos_report_id: Optional[int] = None
    title: str
    description: str
    disaster_type: DisasterType
    severity: Severity
    priority_score: int
    status: IncidentStatus
    location_text: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    district: Optional[str] = None
    affected_count_estimate: int
    needs_evacuation: bool
    needs_medical: bool
    needs_shelter: bool
    needs_food_water: bool
    is_spam: Optional[bool] = False
    needs_manual_review: Optional[bool] = False
    rejection_reason: Optional[str] = None
    confidence_score: Optional[float] = None
    nearest_hospital: Optional[str] = None
    nearest_shelter: Optional[str] = None
    nearest_rescue_team: Optional[str] = None
    estimated_response_time: Optional[str] = None
    suggested_action: Optional[str] = None
    assigned_to: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
