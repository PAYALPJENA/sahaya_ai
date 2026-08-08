from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
import datetime
from backend.database import Base
from backend.core.enums import DispatchType, DispatchStatus

class Dispatch(Base):
    __tablename__ = "dispatches"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    approval_id = Column(Integer, ForeignKey("approval_decisions.id"), nullable=False)
    dispatch_type = Column(SQLEnum(DispatchType), nullable=False, default=DispatchType.RELIEF)
    status = Column(SQLEnum(DispatchStatus), nullable=False, default=DispatchStatus.CREATED)
    team_lead_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    instructions = Column(Text, nullable=True)
    eta_minutes = Column(Integer, nullable=True)
    dispatched_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    incident = relationship("Incident", back_populates="dispatches")
    approval = relationship("ApprovalDecision", back_populates="dispatches")
    team_lead = relationship("User", back_populates="dispatches")
