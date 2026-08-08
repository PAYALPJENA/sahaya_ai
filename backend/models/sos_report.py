from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import datetime
import uuid
from backend.database import Base
from backend.core.enums import SOSSourceType

def generate_short_token():
    return str(uuid.uuid4())[:8].upper()

class SOSReport(Base):
    __tablename__ = "sos_reports"

    id = Column(Integer, primary_key=True, index=True)
    tracking_token = Column(String, unique=True, index=True, nullable=False, default=generate_short_token)
    source_type = Column(SQLEnum(SOSSourceType), nullable=False, default=SOSSourceType.WEB)
    raw_content = Column(Text, nullable=False)
    media_url = Column(String, nullable=True)
    reporter_name = Column(String, nullable=True)
    reporter_phone = Column(String, nullable=True)
    reporter_location_text = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    language = Column(String, default="en")
    processed = Column(Boolean, default=False)
    is_spam = Column(Boolean, default=False)
    needs_manual_review = Column(Boolean, default=False)
    rejection_reason = Column(String, nullable=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    incident = relationship("Incident", back_populates="sos_reports", foreign_keys=[incident_id])
