import unittest
from unittest.mock import MagicMock
from datetime import datetime
from backend.services.sos_service import get_sos_status
from backend.core.enums import SOSSourceType, IncidentStatus, Severity, DispatchStatus

class TestCitizenTracking(unittest.TestCase):
    def test_report_submitted(self):
        db = MagicMock()
        mock_report = MagicMock()
        mock_report.tracking_token = "TOKEN123"
        mock_report.source_type = SOSSourceType.WEB
        mock_report.processed = False
        mock_report.submitted_at = datetime.utcnow()
        mock_report.incident = None
        
        db.query().filter().first.return_value = mock_report
        
        response = get_sos_status(db, "TOKEN123")
        self.assertEqual(response.citizen_status, "Report Submitted")

    def test_ai_verified(self):
        db = MagicMock()
        mock_report = MagicMock()
        mock_report.tracking_token = "TOKEN123"
        mock_report.source_type = SOSSourceType.WEB
        mock_report.processed = True
        mock_report.submitted_at = datetime.utcnow()
        
        mock_incident = MagicMock()
        mock_incident.id = 1
        mock_incident.status = IncidentStatus.UNDER_REVIEW
        mock_incident.severity = Severity.HIGH
        mock_incident.location_text = "Test Location"
        mock_incident.dispatches = []
        
        mock_report.incident = mock_incident
        db.query().filter().first.return_value = mock_report
        
        response = get_sos_status(db, "TOKEN123")
        self.assertEqual(response.citizen_status, "AI Verified")

    def test_collector_approved(self):
        db = MagicMock()
        mock_report = MagicMock()
        mock_report.tracking_token = "TOKEN123"
        mock_report.source_type = SOSSourceType.WEB
        mock_report.processed = True
        mock_report.submitted_at = datetime.utcnow()
        
        mock_incident = MagicMock()
        mock_incident.id = 1
        mock_incident.status = IncidentStatus.APPROVED
        mock_incident.severity = Severity.HIGH
        mock_incident.location_text = "Test Location"
        mock_incident.dispatches = []
        
        mock_report.incident = mock_incident
        db.query().filter().first.return_value = mock_report
        
        response = get_sos_status(db, "TOKEN123")
        self.assertEqual(response.citizen_status, "Collector Approved")
        
    def test_dispatch_statuses(self):
        db = MagicMock()
        mock_report = MagicMock()
        mock_report.tracking_token = "TOKEN123"
        mock_report.source_type = SOSSourceType.WEB
        mock_report.processed = True
        mock_report.submitted_at = datetime.utcnow()
        
        mock_incident = MagicMock()
        mock_incident.id = 1
        mock_incident.status = IncidentStatus.DISPATCHED
        mock_incident.severity = Severity.HIGH
        mock_incident.location_text = "Test Location"
        
        # Test Dispatch Created
        mock_dispatch1 = MagicMock()
        mock_dispatch1.status = DispatchStatus.CREATED
        mock_incident.dispatches = [mock_dispatch1]
        mock_report.incident = mock_incident
        db.query().filter().first.return_value = mock_report
        response = get_sos_status(db, "TOKEN123")
        self.assertEqual(response.citizen_status, "Dispatch Created")
        
        # Test Rescue Team Assigned
        mock_dispatch1.status = DispatchStatus.DISPATCHED
        response = get_sos_status(db, "TOKEN123")
        self.assertEqual(response.citizen_status, "Rescue Team Assigned")

        # Test Team En Route
        mock_dispatch1.status = DispatchStatus.EN_ROUTE
        response = get_sos_status(db, "TOKEN123")
        self.assertEqual(response.citizen_status, "Team En Route")
        
        # Test Mission Completed via dispatch
        mock_dispatch1.status = DispatchStatus.COMPLETED
        response = get_sos_status(db, "TOKEN123")
        self.assertEqual(response.citizen_status, "Mission Completed")

if __name__ == "__main__":
    unittest.main()
