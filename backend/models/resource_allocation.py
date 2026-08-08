from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
import datetime
from backend.database import Base
from backend.core.enums import AllocationStatus

class ResourceAllocation(Base):
    __tablename__ = "resource_allocations"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    approval_id = Column(Integer, ForeignKey("approval_decisions.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    status = Column(SQLEnum(AllocationStatus), nullable=False, default=AllocationStatus.ALLOCATED)
    allocated_at = Column(DateTime, default=datetime.datetime.utcnow)
    dispatched_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    incident = relationship("Incident", back_populates="allocations")
    resource = relationship("Resource", back_populates="allocations")
    approval = relationship("ApprovalDecision", back_populates="allocations")
