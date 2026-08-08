# API Documentation

This document describes the implemented APIs in Sahaya AI, found in `backend/api/v1/`.

## SOS Intake

### Submit SOS Report
- **Endpoint**: `POST /api/v1/sos`
- **Purpose**: Intake an unstructured citizen emergency report. Triggers the AI pipeline.
- **Request Body**: `SOSCreate` (raw_content, media_url, reporter_name, reporter_phone, latitude, longitude)
- **Response**: `SOSCreateResponse` (Includes `tracking_token`, status)
- **Database Effect**: Creates `SOSReport`. If classified as an emergency, creates `Incident` and `AIRecommendation`.
- **Frontend Consumer**: `/sos` citizen facing form.
- **Status**: REAL (AI fallback available if NIM is down).

### Check SOS Status
- **Endpoint**: `GET /api/v1/sos/{token}/status`
- **Purpose**: Allows a citizen to check the real-time status of their SOS report.
- **Response**: `SOSStatusResponse` (status of the report or linked incident, e.g., "UNDER_REVIEW", "DISPATCHED").
- **Status**: REAL.

## Incidents

### List Incidents
- **Endpoint**: `GET /api/v1/incidents`
- **Purpose**: Fetch incidents for the Collector dashboard.
- **Response**: List of `IncidentResponse`.
- **Status**: REAL.

### Get Incident Details
- **Endpoint**: `GET /api/v1/incidents/{id}`
- **Purpose**: Fetch details of a specific incident, including its AI recommendations and timeline.
- **Response**: `IncidentResponse`.
- **Status**: REAL.

### Update Incident
- **Endpoint**: `PATCH /api/v1/incidents/{id}`
- **Purpose**: Manually modify incident details.
- **Status**: REAL.

### Get Incident Timeline
- **Endpoint**: `GET /api/v1/incidents/{id}/timeline`
- **Purpose**: Returns dynamic JSON list of timeline events.
- **Status**: REAL.

## Human-in-the-Loop Approvals

### Approve AI Recommendation
- **Endpoint**: `POST /api/v1/incidents/{id}/approve`
- **Purpose**: Collector approves or modifies an AI recommendation, triggering resource allocation and dispatch.
- **Request Body**: `ApprovalCreate` (decision, notes)
- **Database Effect**: Creates `ApprovalDecision`, updates `Incident` status, generates `ResourceAllocation` and `Dispatch` entries.
- **Status**: REAL.

## Operations (Dispatches & Resources)

### List Resources
- **Endpoint**: `GET /api/v1/resources`
- **Endpoint**: `GET /api/v1/resources/available`
- **Purpose**: Get inventory of all or available seeded resources (boats, trucks, relief kits).
- **Status**: SEEDED DATA.

### List Dispatches
- **Endpoint**: `GET /api/v1/dispatches`
- **Purpose**: View all operational dispatches.
- **Status**: REAL.

### Update Dispatch Status
- **Endpoint**: `PATCH /api/v1/dispatches/{id}/status`
- **Purpose**: Responder updates the status of their assigned dispatch (e.g. EN_ROUTE, ON_SCENE, COMPLETED).
- **Status**: REAL.

## External APIs

### IMD Weather Fallback
- **Endpoint**: `GET /api/v1/weather` (and internally in `ai_pipeline.py`)
- **Purpose**: Fetches real-time weather alerts for a location.
- **Status**: REAL (Uses Open-Meteo as a fallback for IMD data).
