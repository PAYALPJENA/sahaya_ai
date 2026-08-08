# Real vs. Seeded vs. Mock Audit

This document clarifies exactly what is functional, what uses pre-seeded database data, and what is mocked for demonstration purposes in the Sahaya AI submission. 

| Component | Status | Evidence | Explanation |
|-----------|--------|----------|-------------|
| **Citizen GPS** | REAL | `POST /api/v1/sos` | The frontend captures and sends actual device latitude/longitude coordinates to the backend via the SOS API. |
| **Citizen Text** | REAL | `POST /api/v1/sos` | User-submitted unstructured text is passed directly to the AI for analysis. |
| **Voice Transcription** | MOCK | `ai_pipeline.py: process_audio_speech_to_text()` | A deterministic fallback translates specific voice/audio file strings into pre-defined emergency transcripts. |
| **Camera Capture / Image Understanding** | MOCK | `ai_pipeline.py: process_image_understanding()` | Specific keywords in media URLs simulate image analysis confidence and object detection. |
| **SOS API** | REAL | `backend/api/v1/sos.py` | Fully functional REST endpoint capturing data into SQLite. |
| **Database Persistence** | REAL | `backend/database.py` | All created reports, incidents, and approvals are genuinely stored in a relational SQLite database (SQLAlchemy). |
| **AI Processing (NVIDIA NIM)** | REAL | `backend/ai/nim_client.py` | Makes live API calls to NVIDIA NIM (`meta/llama3-70b-instruct`) for NLP parsing, severity classification, and recommendations. |
| **AI Fallback** | FALLBACK | `backend/ai/nim_client.py` & `backend/ai/mock_responses.py` | If NIM is unconfigured or unreachable, the system gracefully falls back to deterministic keyword matching. |
| **Weather API** | REAL | `ai_pipeline.py: get_imd_weather_alert()` | Fetches live weather data from the Open-Meteo API as a fallback to simulate IMD meteorological alerts. |
| **Hospitals** | SEEDED DATA | `backend/seed/seed_data.py` | Populates SQLite with default hospital coordinates, bed capacity, and details during app startup. |
| **Shelters** | SEEDED DATA | `backend/seed/seed_data.py` | Populates SQLite with default cyclone shelters, coordinates, and capacities. |
| **Rescue Teams** | SEEDED DATA | `backend/seed/seed_data.py` | NDRF, ODRAF, and local teams are pre-populated in the database. |
| **Resources** | SEEDED DATA | `backend/seed/seed_data.py` | Boats, vehicles, medical teams, and relief kits are pre-seeded. |
| **Dispatch Workflow** | REAL | `backend/api/v1/dispatches.py` | Dispatches are programmatically generated upon Collector approval and persisted to the database. |
| **Citizen Tracking** | REAL | `GET /api/v1/sos/{token}/status` | The tracking token allows genuine status lookup against the real database incident state. |
| **Dashboard Polling** | REAL | `frontend/src/app` | Dashboard genuinely queries backend APIs for real-time data. |

> [!IMPORTANT]
> At no point does Sahaya AI interact with live government production databases or trigger live rescue deployments. All operations are sandboxed to the local SQLite database.
