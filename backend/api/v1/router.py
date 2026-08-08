from fastapi import APIRouter
from backend.api.v1 import auth, sos, incidents, triage, approvals, resources, dispatches, weather

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(sos.router, prefix="/sos", tags=["SOS Intake"])
api_router.include_router(incidents.router, prefix="/incidents", tags=["Incidents"])
api_router.include_router(triage.router, tags=["AI Triage & Recommendations"])
api_router.include_router(approvals.router, tags=["Human-in-the-Loop Approvals"])
api_router.include_router(resources.router, prefix="/resources", tags=["Resource Inventory"])
api_router.include_router(dispatches.router, prefix="/dispatches", tags=["Operational Dispatch"])
api_router.include_router(weather.router, prefix="/weather", tags=["IMD Weather"])
