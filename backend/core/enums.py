from enum import Enum

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    COLLECTOR = "COLLECTOR"
    RESPONDER = "RESPONDER"

class SOSSourceType(str, Enum):
    WEB = "WEB"
    PHONE = "PHONE"
    SMS = "SMS"
    WHATSAPP = "WHATSAPP"

class DisasterType(str, Enum):
    FLOOD = "FLOOD"
    CYCLONE = "CYCLONE"
    EARTHQUAKE = "EARTHQUAKE"
    FIRE = "FIRE"
    LANDSLIDE = "LANDSLIDE"
    OTHER = "OTHER"

class Severity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class IncidentStatus(str, Enum):
    NEW = "NEW"
    TRIAGED = "TRIAGED"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    DISPATCHED = "DISPATCHED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

class RecommendationType(str, Enum):
    TRIAGE = "TRIAGE"
    RESOURCE_ALLOCATION = "RESOURCE_ALLOCATION"
    DISPATCH_PLAN = "DISPATCH_PLAN"

class ApprovalDecision(str, Enum):
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    MODIFIED = "MODIFIED"

class ResourceType(str, Enum):
    RESCUE_TEAM = "RESCUE_TEAM"
    MEDICAL_TEAM = "MEDICAL_TEAM"
    BOAT = "BOAT"
    VEHICLE = "VEHICLE"
    HELICOPTER = "HELICOPTER"
    RELIEF_KIT = "RELIEF_KIT"
    FOOD_SUPPLY = "FOOD_SUPPLY"
    WATER_SUPPLY = "WATER_SUPPLY"

class ResourceStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    DEPLOYED = "DEPLOYED"
    MAINTENANCE = "MAINTENANCE"
    UNAVAILABLE = "UNAVAILABLE"

class AllocationStatus(str, Enum):
    ALLOCATED = "ALLOCATED"
    EN_ROUTE = "EN_ROUTE"
    ON_SITE = "ON_SITE"
    RETURNED = "RETURNED"
    CANCELLED = "CANCELLED"

class DispatchStatus(str, Enum):
    CREATED = "CREATED"
    DISPATCHED = "DISPATCHED"
    EN_ROUTE = "EN_ROUTE"
    ON_SITE = "ON_SITE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class DispatchType(str, Enum):
    RESCUE = "RESCUE"
    MEDICAL = "MEDICAL"
    RELIEF = "RELIEF"
    EVACUATION = "EVACUATION"

class RecipientType(str, Enum):
    CITIZEN = "CITIZEN"
    OFFICER = "OFFICER"

class NotificationChannel(str, Enum):
    SMS = "SMS"
    EMAIL = "EMAIL"
    IN_APP = "IN_APP"
    PUSH = "PUSH"

class NotificationStatus(str, Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    DELIVERED = "DELIVERED"
    FAILED = "FAILED"
