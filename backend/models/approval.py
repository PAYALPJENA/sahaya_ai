from sqlalchemy import Column, Integer, Text, ForeignKey, JSON, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
import datetime
from backend.database import Base
from backend.core.enums import ApprovalDecision as ApprovalDecisionEnum

class ApprovalDecision(Base):
    __tablename__ = "approval_decisions"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    ai_recommendation_id = Column(Integer, ForeignKey("ai_recommendations.id"), nullable=True)
    officer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    decision = Column(SQLEnum(ApprovalDecisionEnum), nullable=False, default=ApprovalDecisionEnum.APPROVED)
    modifications = Column(JSON, nullable=True) # Any deviations from recommendation
    reason = Column(Text, nullable=True)
    decided_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    incident = relationship("Incident", back_populates="approvals")
    ai_recommendation = relationship("AIRecommendation", back_populates="approvals")
    officer = relationship("User", back_populates="approvals")
    allocations = relationship("ResourceAllocation", back_populates="approval")
    dispatches = relationship("Dispatch", back_populates="approval")
