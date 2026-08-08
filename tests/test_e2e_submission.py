import unittest
import os
import json
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup test DB environment variable before importing anything that loads config
os.environ["DATABASE_URL"] = "sqlite:///./test_sahaya_ai.db"

from backend.main import app
from backend.database import Base, get_db
from backend.models.incident import Incident
from backend.models.sos_report import SOSReport
from backend.models.ai_recommendation import AIRecommendation
from backend.models.dispatch import Dispatch
from backend.models.resource_allocation import ResourceAllocation
from backend.models.user import User
from backend.core.enums import IncidentStatus, DisasterType, Severity, UserRole
from backend.core.security import get_password_hash
from backend.seed.seed_data import seed_baseline

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_sahaya_ai.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

class TestE2ESubmission(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        db = TestingSessionLocal()
        seed_baseline(db)
        db.close()

    def setUp(self):
        self.db = TestingSessionLocal()

    def tearDown(self):
        self.db.close()

    def test_01_emergency_flood(self):
        # TEST 1 — EMERGENCY FLOOD
        response = client.post("/api/v1/sos", json={
            "raw_content": "Sir flood water entered our village. Four people are trapped on the roof. Please send help.",
            "latitude": 19.8118,
            "longitude": 85.8190
        })
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertIn("tracking_token", data)
        
        # Verify DB
        report = self.db.query(SOSReport).filter_by(tracking_token=data["tracking_token"]).first()
        self.assertIsNotNone(report)
        self.assertIsNotNone(report.incident_id)
        
        incident = self.db.query(Incident).filter_by(id=report.incident_id).first()
        self.assertEqual(incident.disaster_type, DisasterType.FLOOD)
        self.assertEqual(incident.severity, Severity.CRITICAL)
        self.assertEqual(incident.affected_count_estimate, 4)
        
        rec = self.db.query(AIRecommendation).filter_by(incident_id=incident.id).first()
        self.assertIsNotNone(rec)

    def test_02_non_emergency(self):
        # TEST 2 — NON EMERGENCY
        response = client.post("/api/v1/sos", json={
            "raw_content": "Hi, my name is Payal."
        })
        self.assertEqual(response.status_code, 201)
        data = response.json()
        
        report = self.db.query(SOSReport).filter_by(tracking_token=data["tracking_token"]).first()
        self.assertIsNotNone(report)
        self.assertIsNotNone(report.incident_id)
        
        incident = self.db.query(Incident).filter_by(id=report.incident_id).first()
        self.assertEqual(incident.status, IncidentStatus.CLOSED)
        self.assertEqual(incident.rejection_reason, "AI classified as NON_EMERGENCY")

    def test_03_spam(self):
        # TEST 3 — SPAM
        response = client.post("/api/v1/sos", json={
            "raw_content": "please send pizza"
        })
        self.assertEqual(response.status_code, 201)
        data = response.json()
        
        report = self.db.query(SOSReport).filter_by(tracking_token=data["tracking_token"]).first()
        self.assertIsNotNone(report)
        self.assertTrue(report.is_spam)
        # Spam flow creates a closed incident for audit trail
        self.assertIsNotNone(report.incident_id)
        incident = self.db.query(Incident).filter_by(id=report.incident_id).first()
        self.assertEqual(incident.status, IncidentStatus.CLOSED)
        self.assertTrue(incident.is_spam)

    def test_04_uncertain(self):
        # TEST 4 — UNCERTAIN
        response = client.post("/api/v1/sos", json={
            "raw_content": "Please help."
        })
        self.assertEqual(response.status_code, 201)
        data = response.json()
        
        report = self.db.query(SOSReport).filter_by(tracking_token=data["tracking_token"]).first()
        self.assertIsNotNone(report)
        self.assertIsNotNone(report.incident_id)
        
        incident = self.db.query(Incident).filter_by(id=report.incident_id).first()
        self.assertEqual(incident.status, IncidentStatus.UNDER_REVIEW)
        self.assertTrue(incident.needs_manual_review)

    def test_05_fire(self):
        # TEST 5 — FIRE
        response = client.post("/api/v1/sos", json={
            "raw_content": "There is a fire in the market and several people are trapped."
        })
        self.assertEqual(response.status_code, 201)
        data = response.json()
        
        report = self.db.query(SOSReport).filter_by(tracking_token=data["tracking_token"]).first()
        incident = self.db.query(Incident).filter_by(id=report.incident_id).first()
        self.assertEqual(incident.disaster_type, DisasterType.FIRE)
        # Should not fabricate count for "several"
        self.assertEqual(incident.affected_count_estimate, 0)

    def test_06_explicit_count(self):
        # TEST 6 — EXPLICIT COUNT
        response = client.post("/api/v1/sos", json={
            "raw_content": "There are 12 people trapped inside the building.",
            "latitude": 19.8,
            "longitude": 85.8
        })
        self.assertEqual(response.status_code, 201)
        data = response.json()
        
        report = self.db.query(SOSReport).filter_by(tracking_token=data["tracking_token"]).first()
        incident = self.db.query(Incident).filter_by(id=report.incident_id).first()
        self.assertEqual(incident.affected_count_estimate, 12)

    def test_07_gps(self):
        # TEST 7 — GPS
        response = client.post("/api/v1/sos", json={
            "raw_content": "Emergency here.",
            "latitude": 20.29,
            "longitude": 85.82
        })
        data = response.json()
        report = self.db.query(SOSReport).filter_by(tracking_token=data["tracking_token"]).first()
        self.assertEqual(report.latitude, 20.29)
        self.assertEqual(report.longitude, 85.82)

    def test_08_tracking(self):
        # TEST 8 — TRACKING
        response = client.post("/api/v1/sos", json={
            "raw_content": "Flood emergency."
        })
        token = response.json()["tracking_token"]
        
        status_response = client.get(f"/api/v1/sos/{token}/status")
        self.assertEqual(status_response.status_code, 200)
        self.assertIn("citizen_status", status_response.json())

    def test_09_10_approval_and_dispatch(self):
        # Need to login as collector first
        login_resp = client.post("/api/v1/auth/login", data={
            "username": "collector@sahaya.ai",
            "password": "password123"
        })
        self.assertEqual(login_resp.status_code, 200)
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create an incident
        response = client.post("/api/v1/sos", json={
            "raw_content": "Building collapsed, 3 people stuck.",
            "latitude": 19.8,
            "longitude": 85.8
        })
        report = self.db.query(SOSReport).filter_by(tracking_token=response.json()["tracking_token"]).first()
        incident_id = report.incident_id
        self.assertIsNotNone(incident_id)
        
        rec = self.db.query(AIRecommendation).filter_by(incident_id=incident_id).first()
        self.assertIsNotNone(rec)
        
        # TEST 9 — APPROVAL
        approve_resp = client.post(f"/api/v1/incidents/{incident_id}/approve", json={
            "recommendation_id": rec.id,
            "decision": "APPROVED",
            "reason": "Approved for immediate action"
        }, headers=headers)
        
        self.assertEqual(approve_resp.status_code, 201)
        
        incident = self.db.query(Incident).filter_by(id=incident_id).first()
        # Approval automation engine sets status to DISPATCHED immediately
        self.assertEqual(incident.status, IncidentStatus.DISPATCHED)
        
        # Verify allocation was created
        allocations = self.db.query(ResourceAllocation).filter_by(incident_id=incident_id).all()
        self.assertTrue(len(allocations) > 0)
        
        # TEST 10 — DISPATCH (auto-created by approval engine)
        dispatches = self.db.query(Dispatch).filter_by(incident_id=incident_id).all()
        self.assertTrue(len(dispatches) > 0)
        
        # Verify tracking updates
        status_response = client.get(f"/api/v1/sos/{report.tracking_token}/status")
        self.assertEqual(status_response.json()["citizen_status"], "Rescue Team Assigned")

if __name__ == '__main__':
    unittest.main()
