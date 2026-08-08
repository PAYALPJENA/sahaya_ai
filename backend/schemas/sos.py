from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime
from backend.core.enums import SOSSourceType, IncidentStatus, Severity

class SOSCreateRequest(BaseModel):
    raw_content: str
    reporter_name: Optional[str] = None
    reporter_phone: Optional[str] = None
    reporter_location_text: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    media_url: Optional[str] = None
    source_type: SOSSourceType = SOSSourceType.WEB

class SOSCreateResponse(BaseModel):
    tracking_token: str
    message: str

class SOSStatusResponse(BaseModel):
    tracking_token: str
    source_type: SOSSourceType
    processed: bool
    submitted_at: datetime
    incident_id: Optional[int] = None
    incident_status: Optional[IncidentStatus] = None
    incident_severity: Optional[Severity] = None
    location_text: Optional[str] = None
    citizen_status: str = "Report Submitted"

    class Config:
        from_attributes = True
