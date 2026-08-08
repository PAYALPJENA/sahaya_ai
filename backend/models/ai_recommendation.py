from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
import datetime
from backend.database import Base
from backend.core.enums import RecommendationType

class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    recommendation_type = Column(SQLEnum(RecommendationType), nullable=False, default=RecommendationType.TRIAGE)
    recommendation_data = Column(JSON, nullable=False) # Stores structured details (e.g. recommended resource counts)
    confidence_score = Column(Float, nullable=False, default=1.0)
    reasoning = Column(Text, nullable=True)
    model_used = Column(String, nullable=True)
    prompt_used = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    incident = relationship("Incident", back_populates="recommendations")
    approvals = relationship("ApprovalDecision", back_populates="ai_recommendation")
