from sqlalchemy import Column, Integer, String, Float, Enum
import enum
from backend.database import Base

class TeamType(str, enum.Enum):
    NDRF = "NDRF"
    ODRAF = "ODRAF"
    FIRE_SERVICE = "FIRE_SERVICE"
    POLICE = "POLICE"
    CIVIL_DEFENCE = "CIVIL_DEFENCE"

class TeamStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    BUSY = "BUSY"
    OFFLINE = "OFFLINE"

class RescueTeam(Base):
    __tablename__ = "rescue_teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    type = Column(Enum(TeamType), nullable=False)
    base_location = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(Enum(TeamStatus), default=TeamStatus.AVAILABLE)
    vehicle_type = Column(String, nullable=True)
    personnel_count = Column(Integer, nullable=False)
