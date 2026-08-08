from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
import datetime
from backend.database import Base
from backend.core.enums import RecipientType, NotificationChannel, NotificationStatus

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    recipient_type = Column(SQLEnum(RecipientType), nullable=False, default=RecipientType.CITIZEN)
    recipient_identifier = Column(String, nullable=False) # e.g. Phone number or email
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    channel = Column(SQLEnum(NotificationChannel), nullable=False, default=NotificationChannel.SMS)
    message = Column(Text, nullable=False)
    status = Column(SQLEnum(NotificationStatus), nullable=False, default=NotificationStatus.PENDING)
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    incident = relationship("Incident", back_populates="notifications")
