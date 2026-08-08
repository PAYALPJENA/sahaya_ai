# System Audit

This document is a comprehensive audit of the Sahaya AI repository based on the actual implemented codebase.

## Current Frontend Architecture
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **State Management**: React hooks
- **API Communication**: Custom `src/lib/api.ts` making fetch calls to the FastAPI backend.
- **Key Modules**: 
  - `src/app/sos`: Public-facing citizen SOS reporting interface and tracking.
  - `src/app/login`: Authentication interface.
  - `src/app/dashboard`: Protected Collector dashboard showing map, incidents, and resources.

## Current Backend Architecture
- **Framework**: FastAPI (Python)
- **Database ORM**: SQLAlchemy
- **Database Engine**: SQLite (`sahaya_ai.db`)
- **Key Services**:
  - `sos_service.py`: Intake and routing of SOS reports.
  - `ai_pipeline.py`: Orchestrates multimodal ingestion, spam checking, AI inference, and duplicate clustering.
  - `triage_service.py`: Re-triage incidents on demand.
  - `approval_service.py`: Handles Collector authorization and generates resource allocations.

## Authentication Architecture
- JWT-based token authentication (`auth.py`).
- Users are pre-seeded with specific roles: `ADMIN`, `COLLECTOR`, `RESPONDER`.

## Workflows Audited
- **Citizen Workflow**: The `POST /api/v1/sos` endpoint correctly captures raw text, media URL, and GPS coordinates, generating a short `tracking_token`. 
- **Collector Workflow**: The dashboard queries `GET /api/v1/incidents`. Collectors view the AI's parsed data and submit `POST /api/v1/incidents/{id}/approve` to authorize.
- **Dispatch Workflow**: Approval triggers `dispatch_service.py` to create `Dispatch` records linked to seeded `RescueTeam`s.
- **Citizen Tracking Workflow**: Citizens query `GET /api/v1/sos/{token}/status` which reads the underlying incident state to provide updates.

## External API Integrations
- **NVIDIA NIM API**: Live integration with `meta/llama3-70b-instruct` for NLP triage.
- **Open-Meteo API**: Live integration for real-time weather alerts (used as a fallback for IMD data).

## Known Limitations & Mocked Components
- **Voice/Image Processing**: Audio transcription and computer vision are simulated using deterministic keyword matching within `ai_pipeline.py`.
- **Maps**: Uses generic coordinate rendering; no active routing API (like Google Maps API) is integrated for response time calculations (uses simple Haversine formula).
- **Deployment Assumptions**: Designed to run locally. Uses SQLite rather than a production PostgreSQL instance.
