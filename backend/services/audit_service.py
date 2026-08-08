from sqlalchemy.orm import Session
from backend.models.audit_log import AuditLog
from typing import Any, Dict, Optional
import datetime

def log_action(
    db: Session,
    entity_type: str,
    entity_id: int,
    action: str,
    actor_id: Optional[int] = None,
    actor_role: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None
) -> AuditLog:
    db_log = AuditLog(
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        actor_id=actor_id,
        actor_role=actor_role,
        details=details,
        ip_address=ip_address,
        timestamp=datetime.datetime.utcnow()
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log
