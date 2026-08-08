from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas.sos import SOSCreateRequest, SOSCreateResponse, SOSStatusResponse
from backend.services import sos_service

router = APIRouter()

@router.post("", response_model=SOSCreateResponse, status_code=status.HTTP_201_CREATED)
def submit_sos(
    request: SOSCreateRequest,
    db: Session = Depends(get_db)
):
    report = sos_service.create_sos_report(db, request)
    return SOSCreateResponse(
        tracking_token=report.tracking_token,
        message="SOS received. We have initiated emergency triage. Please use your tracking token to monitor live updates."
    )

@router.get("/{token}/status", response_model=SOSStatusResponse)
def get_sos_status(
    token: str,
    db: Session = Depends(get_db)
):
    status_response = sos_service.get_sos_status(db, token)
    if not status_response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tracking token not found or invalid."
        )
    return status_response
