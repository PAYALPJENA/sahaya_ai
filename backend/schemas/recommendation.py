from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from backend.core.enums import RecommendationType

class AIRecommendationResponse(BaseModel):
    id: int
    incident_id: int
    recommendation_type: RecommendationType
    recommendation_data: Dict[str, Any]
    confidence_score: float
    reasoning: Optional[str] = None
    model_used: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
