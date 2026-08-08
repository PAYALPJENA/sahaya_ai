from sqlalchemy.orm import Session
from typing import List, Optional
from backend.models.resource import Resource
from backend.models.resource_allocation import ResourceAllocation
from backend.core.enums import ResourceStatus, ResourceType, AllocationStatus
from backend.services import audit_service
from backend.core.exceptions import EntityNotFoundException

def get_resources(
    db: Session,
    type: Optional[ResourceType] = None,
    status: Optional[ResourceStatus] = None,
    district: Optional[str] = None
) -> List[Resource]:
    query = db.query(Resource)
    if type:
        query = query.filter(Resource.type == type)
    if status:
        query = query.filter(Resource.status == status)
    if district:
        query = query.filter(Resource.district == district)
    return query.all()

def allocate_resources_for_incident(
    db: Session,
    incident_id: int,
    approval_id: int,
    resources_needed: List[dict] # list of {"type": ResourceType, "quantity": int}
) -> List[ResourceAllocation]:
    allocations = []
    
    for item in resources_needed:
        res_type = item.get("type")
        qty = item.get("quantity", 1)
        
        # Find available resources of this type
        available_resources = db.query(Resource).filter(
            Resource.type == res_type,
            Resource.status == ResourceStatus.AVAILABLE
        ).limit(qty).all()
        
        for res in available_resources:
            # Create allocation record
            alloc = ResourceAllocation(
                incident_id=incident_id,
                resource_id=res.id,
                approval_id=approval_id,
                quantity=1, # 1 unit per item for trackability
                status=AllocationStatus.ALLOCATED
            )
            db.add(alloc)
            db.flush() # Populate alloc.id
            
            # Update resource status
            res.status = ResourceStatus.DEPLOYED
            allocations.append(alloc)
            
            # Log allocation under the INCIDENT entity so it shows in timeline
            audit_service.log_action(
                db,
                entity_type="INCIDENT",
                entity_id=incident_id,
                action="RESOURCE_ALLOCATED",
                details={
                    "resource_id": res.id,
                    "resource_name": res.name,
                    "resource_type": res.type.value,
                    "allocation_id": alloc.id
                }
            )
            
    db.commit()
    return allocations
