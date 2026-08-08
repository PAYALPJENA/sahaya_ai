from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import datetime
from backend.database import Base
from backend.core.enums import DisasterType, Severity, IncidentStatus

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    sos_report_id = Column(Integer, ForeignKey("sos_reports.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    disaster_type = Column(SQLEnum(DisasterType), nullable=False, default=DisasterType.OTHER)
    severity = Column(SQLEnum(Severity), nullable=False, default=Severity.MEDIUM)
    priority_score = Column(Integer, default=50) # 0 to 100
    status = Column(SQLEnum(IncidentStatus), nullable=False, default=IncidentStatus.NEW)
    location_text = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    district = Column(String, nullable=True)
    affected_count_estimate = Column(Integer, default=0)
    
    # Categorization flags
    needs_evacuation = Column(Boolean, default=False)
    needs_medical = Column(Boolean, default=False)
    needs_shelter = Column(Boolean, default=False)
    needs_food_water = Column(Boolean, default=False)
    
    is_spam = Column(Boolean, default=False)
    needs_manual_review = Column(Boolean, default=False)
    rejection_reason = Column(String, nullable=True)
    
    confidence_score = Column(Float, default=1.0)
    nearest_hospital = Column(String, nullable=True)
    nearest_shelter = Column(String, nullable=True)
    nearest_rescue_team = Column(String, nullable=True)
    estimated_response_time = Column(String, nullable=True)
    suggested_action = Column(Text, nullable=True)
    
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    sos_report = relationship("SOSReport", foreign_keys=[sos_report_id])
    sos_reports = relationship("SOSReport", back_populates="incident", foreign_keys="[SOSReport.incident_id]")
    recommendations = relationship("AIRecommendation", back_populates="incident")
    approvals = relationship("ApprovalDecision", back_populates="incident")
    allocations = relationship("ResourceAllocation", back_populates="incident")
    dispatches = relationship("Dispatch", back_populates="incident")
    notifications = relationship("Notification", back_populates="incident")
