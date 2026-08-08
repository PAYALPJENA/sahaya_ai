from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
import datetime
from backend.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String, nullable=False) # e.g. "INCIDENT", "APPROVAL", etc.
    entity_id = Column(Integer, nullable=False)
    action = Column(String, nullable=False) # e.g. "CREATED", "STATUS_CHANGED", etc.
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Null means SYSTEM / AI
    actor_role = Column(String, nullable=True)
    details = Column(JSON, nullable=True) # Details about the changes
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationship to user if logged in
    actor = relationship("User")
