from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from backend.core.enums import ApprovalDecision

class ApprovalRequest(BaseModel):
    recommendation_id: int
    decision: ApprovalDecision = ApprovalDecision.APPROVED
    modifications: Optional[Dict[str, Any]] = None # custom resources, severity overrides, etc.
    reason: Optional[str] = None

class ApprovalResponse(BaseModel):
    id: int
    incident_id: int
    ai_recommendation_id: Optional[int] = None
    officer_id: int
    decision: ApprovalDecision
    modifications: Optional[Dict[str, Any]] = None
    reason: Optional[str] = None
    decided_at: datetime

    class Config:
        from_attributes = True
