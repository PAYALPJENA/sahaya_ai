from sqlalchemy import Column, Integer, String, Float, Enum
import enum
from backend.database import Base

class ShelterStatus(str, enum.Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    FULL = "FULL"

class ResourceAvailability(str, enum.Enum):
    SUFFICIENT = "SUFFICIENT"
    LOW = "LOW"
    EMPTY = "EMPTY"

class Shelter(Base):
    __tablename__ = "shelters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    district = Column(String, index=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity = Column(Integer, nullable=False)
    current_occupancy = Column(Integer, default=0)
    status = Column(Enum(ShelterStatus), default=ShelterStatus.OPEN)
    food_availability = Column(Enum(ResourceAvailability), default=ResourceAvailability.SUFFICIENT)
    medical_availability = Column(Enum(ResourceAvailability), default=ResourceAvailability.SUFFICIENT)
