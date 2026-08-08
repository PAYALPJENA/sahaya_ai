from sqlalchemy import Column, Integer, String, Text, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
import datetime
from backend.database import Base
from backend.core.enums import ResourceType, ResourceStatus

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(SQLEnum(ResourceType), nullable=False, default=ResourceType.RELIEF_KIT)
    status = Column(SQLEnum(ResourceStatus), nullable=False, default=ResourceStatus.AVAILABLE)
    current_location = Column(String, nullable=True)
    district = Column(String, nullable=False)
    capacity = Column(Integer, nullable=True)
    quantity_total = Column(Integer, nullable=False, default=0)
    quantity_available = Column(Integer, nullable=False, default=0)
    quantity_allocated = Column(Integer, nullable=False, default=0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    allocations = relationship("ResourceAllocation", back_populates="resource")
