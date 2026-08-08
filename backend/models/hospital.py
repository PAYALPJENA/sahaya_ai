from sqlalchemy import Column, Integer, String, Float, Enum
import enum
from backend.database import Base

class HospitalStatus(str, enum.Enum):
    OPERATING = "OPERATING"
    OVER_CAPACITY = "OVER_CAPACITY"
    DAMAGED = "DAMAGED"
    OFFLINE = "OFFLINE"

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    district = Column(String, index=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    available_beds = Column(Integer, default=0)
    icu_beds = Column(Integer, default=0)
    ambulances = Column(Integer, default=0)
    status = Column(Enum(HospitalStatus), default=HospitalStatus.OPERATING)
    contact_number = Column(String, nullable=True)
