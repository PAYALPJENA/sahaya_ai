from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine
from backend.models import Base, Hospital, Shelter, RescueTeam
from backend.models.user import User
from backend.models.resource import Resource
from backend.core.enums import UserRole, ResourceType, ResourceStatus
from backend.core.security import get_password_hash
from backend.models.hospital import HospitalStatus
from backend.models.shelter import ShelterStatus, ResourceAvailability
from backend.models.rescue_team import TeamType, TeamStatus

def seed_baseline(db: Session):
    print("[Seed] Seeding baseline users...")
    
    # 1. Check if users already exist
    if db.query(User).count() == 0:
        default_pwd = get_password_hash("password123")
        
        users = [
            User(
                name="Admin User",
                email="admin@sahaya.ai",
                password_hash=default_pwd,
                role=UserRole.ADMIN,
                phone="9999999999",
                designation="System Admin",
                district="Puri"
            ),
            User(
                name="Collector Puri",
                email="collector@sahaya.ai",
                password_hash=default_pwd,
                role=UserRole.COLLECTOR,
                phone="9876543210",
                designation="District Collector",
                district="Puri"
            ),
            User(
                name="NDRF Responder Lead",
                email="responder@sahaya.ai",
                password_hash=default_pwd,
                role=UserRole.RESPONDER,
                phone="9123456789",
                designation="NDRF Team Lead",
                district="Puri"
            )
        ]
        
        db.add_all(users)
        db.commit()
        print(f"[Seed] Added {len(users)} default users.")
    else:
        print("[Seed] Users already seeded.")

    # 2. Check if resources already exist
    if db.query(Resource).count() == 0:
        resources = [
            # Rescue Boats
            Resource(name="NDRF Rescue Boat Alpha", type=ResourceType.BOAT, status=ResourceStatus.AVAILABLE, current_location="Puri Coastal Station", district="Puri", capacity=10),
            Resource(name="NDRF Rescue Boat Beta", type=ResourceType.BOAT, status=ResourceStatus.AVAILABLE, current_location="Puri Coastal Station", district="Puri", capacity=10),
            Resource(name="Local Fisherman Rescue Group 1", type=ResourceType.BOAT, status=ResourceStatus.AVAILABLE, current_location="Chandrabhaga Beach", district="Puri", capacity=8),
            
            # Rescue Teams
            Resource(name="NDRF Team 1 (Rescue)", type=ResourceType.RESCUE_TEAM, status=ResourceStatus.AVAILABLE, current_location="District HQ", district="Puri", capacity=15),
            Resource(name="NDRF Team 2 (Rescue)", type=ResourceType.RESCUE_TEAM, status=ResourceStatus.AVAILABLE, current_location="District HQ", district="Puri", capacity=15),
            Resource(name="Odisha Disaster Rapid Action Force (ODRAF) A", type=ResourceType.RESCUE_TEAM, status=ResourceStatus.AVAILABLE, current_location="Konark Station", district="Puri", capacity=12),
            
            # Medical Teams
            Resource(name="District Hospital Medical Team Alpha", type=ResourceType.MEDICAL_TEAM, status=ResourceStatus.AVAILABLE, current_location="Puri District Hospital", district="Puri", capacity=6),
            Resource(name="Red Cross Mobile Health Unit", type=ResourceType.MEDICAL_TEAM, status=ResourceStatus.AVAILABLE, current_location="District HQ", district="Puri", capacity=4),
            
            # Vehicles
            Resource(name="Emergency Heavy Utility Truck 1", type=ResourceType.VEHICLE, status=ResourceStatus.AVAILABLE, current_location="Puri Transport Depot", district="Puri", capacity=20),
            Resource(name="Emergency Heavy Utility Truck 2", type=ResourceType.VEHICLE, status=ResourceStatus.AVAILABLE, current_location="Puri Transport Depot", district="Puri", capacity=20),
            
            # Relief & Supplies
            Resource(name="Standard Relief Kits (Batch A)", type=ResourceType.RELIEF_KIT, status=ResourceStatus.AVAILABLE, current_location="Red Cross Warehouse", district="Puri", capacity=500, notes="Contains dry food, candles, matches, ORS, sanitary pads"),
            Resource(name="Standard Relief Kits (Batch B)", type=ResourceType.RELIEF_KIT, status=ResourceStatus.AVAILABLE, current_location="Red Cross Warehouse", district="Puri", capacity=500),
            Resource(name="Clean Drinking Water Tanker 1", type=ResourceType.WATER_SUPPLY, status=ResourceStatus.AVAILABLE, current_location="Puri Water Board Depot", district="Puri", capacity=5000)
        ]
        
        db.add_all(resources)
        db.commit()
        print(f"[Seed] Added {len(resources)} default resources.")
    else:
        print("[Seed] Resources already seeded.")

    # 3. Seed hospitals
    if db.query(Hospital).count() == 0:
        hospitals = [
            Hospital(
                name="Puri District Headquarter Hospital",
                district="Puri",
                latitude=19.8118,
                longitude=85.8190,
                available_beds=120,
                icu_beds=15,
                ambulances=5,
                status=HospitalStatus.OPERATING,
                contact_number="+91-6752-223620"
            ),
            Hospital(
                name="Konark Community Health Centre",
                district="Puri",
                latitude=19.8876,
                longitude=86.0945,
                available_beds=30,
                icu_beds=2,
                ambulances=2,
                status=HospitalStatus.OPERATING,
                contact_number="+91-6752-236521"
            ),
            Hospital(
                name="Pipili Area Hospital",
                district="Puri",
                latitude=20.1147,
                longitude=85.8341,
                available_beds=45,
                icu_beds=4,
                ambulances=3,
                status=HospitalStatus.OPERATING,
                contact_number="+91-6758-240212"
            )
        ]
        db.add_all(hospitals)
        db.commit()
        print(f"[Seed] Added {len(hospitals)} default hospitals.")
    else:
        print("[Seed] Hospitals already seeded.")

    # 4. Seed shelters
    if db.query(Shelter).count() == 0:
        shelters = [
            Shelter(
                name="Govt High School Cyclone Shelter, Sector 4",
                district="Puri",
                latitude=19.8150,
                longitude=85.8310,
                capacity=500,
                current_occupancy=480,
                status=ShelterStatus.OPEN,
                food_availability=ResourceAvailability.LOW,
                medical_availability=ResourceAvailability.SUFFICIENT
            ),
            Shelter(
                name="Community Hall Shelter, Sector 2",
                district="Puri",
                latitude=19.8220,
                longitude=85.8150,
                capacity=200,
                current_occupancy=150,
                status=ShelterStatus.OPEN,
                food_availability=ResourceAvailability.SUFFICIENT,
                medical_availability=ResourceAvailability.SUFFICIENT
            ),
            Shelter(
                name="Puri Indoor Stadium Mega Shelter",
                district="Puri",
                latitude=19.8090,
                longitude=85.8250,
                capacity=1500,
                current_occupancy=400,
                status=ShelterStatus.OPEN,
                food_availability=ResourceAvailability.SUFFICIENT,
                medical_availability=ResourceAvailability.SUFFICIENT
            ),
            Shelter(
                name="Primary School Shelter, Sector 9",
                district="Puri",
                latitude=19.8310,
                longitude=85.8450,
                capacity=100,
                current_occupancy=110,
                status=ShelterStatus.FULL,
                food_availability=ResourceAvailability.EMPTY,
                medical_availability=ResourceAvailability.LOW
            )
        ]
        db.add_all(shelters)
        db.commit()
        print(f"[Seed] Added {len(shelters)} default shelters.")
    else:
        print("[Seed] Shelters already seeded.")

    # 5. Seed rescue teams
    if db.query(RescueTeam).count() == 0:
        teams = [
            RescueTeam(
                name="NDRF Unit Alpha",
                type=TeamType.NDRF,
                base_location="Puri Coastal Station",
                latitude=20.2900,
                longitude=85.8200,
                status=TeamStatus.AVAILABLE,
                vehicle_type="Rescue Boat & Truck",
                personnel_count=15
            ),
            RescueTeam(
                name="ODRAF Unit Alpha",
                type=TeamType.ODRAF,
                base_location="Konark Station",
                latitude=20.2960,
                longitude=85.8240,
                status=TeamStatus.BUSY,
                vehicle_type="Rescue Boat & Multi-utility Vehicle",
                personnel_count=12
            ),
            RescueTeam(
                name="Puri Fire Service Rescue Team B",
                type=TeamType.FIRE_SERVICE,
                base_location="District HQ",
                latitude=19.8100,
                longitude=85.8300,
                status=TeamStatus.AVAILABLE,
                vehicle_type="Fire Tender & Emergency Van",
                personnel_count=10
            )
        ]
        db.add_all(teams)
        db.commit()
        print(f"[Seed] Added {len(teams)} default rescue teams.")
    else:
        print("[Seed] Rescue teams already seeded.")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_baseline(db)
    finally:
        db.close()
