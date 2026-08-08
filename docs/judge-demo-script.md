# Judge Demo Script — Sahaya AI

This document provides a step-by-step guide for judges to evaluate Sahaya AI's complete disaster response pipeline. The demo covers citizen SOS intake, AI triage, collector approval, automated dispatch, and real-time citizen tracking.

---

## Prerequisites

Start both the backend and frontend servers:

```bash
# Terminal 1 — Backend (FastAPI)
cd backend
uvicorn backend.main:app --reload --port 8000

# Terminal 2 — Frontend (Next.js)
cd frontend
npm run dev
```

The frontend is available at `http://localhost:3000` and the backend API at `http://localhost:8000`.

---

## Demo Flow Overview

```
Citizen SOS → AI Triage → Collector Dashboard → Approve → Auto Dispatch → Citizen Tracking
```

---

## Step 1: Submit a Citizen SOS Report

**Goal**: Demonstrate the citizen-facing SOS intake form.

1. Open `http://localhost:3000/sos` in a browser.
2. Fill in the SOS form:
   - **Message**: `"Flood water entered our village. Four people are trapped on the roof. Please send help."`
   - **Name**: `Test Citizen`
   - **Phone**: `9876543210`
   - **Location** (if GPS is available, it auto-fills): `Latitude: 19.81, Longitude: 85.82`
3. Click **Submit**.
4. **What to observe**:
   - A **tracking token** is returned (e.g., `SAH-XXXXXXXX`).
   - The system confirms submission.
   - Save this token — you'll use it in Step 5.

**API equivalent** (if testing via curl):
```bash
curl -X POST http://localhost:8000/api/v1/sos \
  -H "Content-Type: application/json" \
  -d '{
    "raw_content": "Flood water entered our village. Four people are trapped on the roof. Please send help.",
    "reporter_name": "Test Citizen",
    "reporter_phone": "9876543210",
    "latitude": 19.81,
    "longitude": 85.82
  }'
```

---

## Step 2: Observe AI Triage (Automatic)

**Goal**: Show that AI processes the SOS immediately upon submission.

1. The AI pipeline runs automatically when an SOS is submitted.
2. Navigate to the **Collector Dashboard** at `http://localhost:3000/login`.
3. Log in with:
   - **Email**: `collector@sahaya.ai`
   - **Password**: `password123`
4. Go to `http://localhost:3000/dashboard/incidents`.
5. **What to observe**:
   - The incident appears with:
     - **Disaster Type**: FLOOD
     - **Severity**: CRITICAL (priority score ≥ 90)
     - **Affected Count**: 4 (extracted from "Four people")
     - **Status**: TRIAGED
   - Click the incident to see the **AI Recommendation** card with:
     - Suggested resources (Rescue Boat, Rescue Team, Relief Kits)
     - Nearest hospital, shelter, and rescue team
     - Confidence score and reasoning

---

## Step 3: Test Classification Scenarios

**Goal**: Demonstrate the AI's three-tier classification (Emergency / Non-Emergency / Uncertain).

Submit these via the SOS form or curl and observe results in the dashboard:

| Input | Expected Classification | Dashboard Behavior |
|-------|------------------------|-------------------|
| `"Flood water entered our village. Four people trapped."` | **EMERGENCY** | New incident created, TRIAGED status |
| `"Hi, my name is Payal."` | **NON_EMERGENCY** | Incident created with CLOSED status |
| `"please send pizza"` | **SPAM** | Flagged as spam, closed incident |
| `"Please help."` | **UNCERTAIN** | Incident created with UNDER_REVIEW, needs manual review |
| `"There is a fire in the market and people are trapped."` | **EMERGENCY (FIRE)** | Fire incident with appropriate resources |

---

## Step 4: Approve Incident as Collector

**Goal**: Demonstrate human-in-the-loop approval and the automation engine.

1. In the collector dashboard, click on the triaged flood incident.
2. Review the AI recommendation.
3. Click **Approve** (or use the approval API).
4. **What to observe** upon approval:
   - ✅ Nearest rescue team assigned (status changes to BUSY)
   - ✅ Rescue boat reserved
   - ✅ Ambulance reserved from nearest hospital
   - ✅ Medical team deployed
   - ✅ Nearest shelter reserved (occupancy updated)
   - ✅ Hospital notified via SMS notification
   - ✅ Dispatch record created
   - ✅ Citizen notified via SMS
   - ✅ Incident status → `DISPATCHED`
5. Check the **Dispatches** page at `http://localhost:3000/dashboard/dispatches` to see the auto-created dispatch.

**API equivalent**:
```bash
# First, get the auth token
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -d "username=collector@sahaya.ai&password=password123" | python -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# Approve the incident (replace INCIDENT_ID and RECOMMENDATION_ID)
curl -X POST http://localhost:8000/api/v1/incidents/1/approve \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recommendation_id": 1, "decision": "APPROVED", "reason": "Verified emergency"}'
```

---

## Step 5: Citizen Tracking

**Goal**: Show that citizens can track their SOS report status in real time.

1. Use the tracking token from Step 1.
2. Call the tracking API:
   ```bash
   curl http://localhost:8000/api/v1/sos/SAH-XXXXXXXX/status
   ```
3. **What to observe**:
   - `citizen_status` progresses through:
     - `"Report Submitted"` → `"AI Verified"` → `"Collector Approved"` → `"Rescue Team Assigned"` → `"Team En Route"` → `"Mission Completed"`
   - After approval in Step 4, it should show `"Rescue Team Assigned"`.

---

## Step 6: Explore the Dashboard

**Goal**: Showcase the full operational dashboard.

### GIS Map (`/dashboard/gis`)
- View all incidents plotted on a real-time map
- Color-coded by severity (CRITICAL = red, HIGH = orange, MEDIUM = yellow)

### Analytics (`/dashboard/analytics`)
- Incident counts by disaster type
- Response time metrics
- Resource utilization

### Resources (`/dashboard/resources`)
- View all rescue boats, teams, vehicles, medical teams, and relief kits
- Status shows AVAILABLE / DEPLOYED / MAINTENANCE

### Shelters (`/dashboard/shelters`)
- Shelter capacity vs. occupancy
- Food and medical availability status

### AI Insights (`/dashboard/ai`)
- View all AI recommendations
- Confidence scores and reasoning
- Model used (meta/llama3-70b-instruct)

### Audit Log (`/dashboard/audit`)
- Full audit trail of every action
- Shows actor (SYSTEM AI or human), action, timestamp, and details

---

## Step 7: Run Automated Tests

**Goal**: Prove all 10 scenarios pass automatically.

```bash
python -m unittest tests.test_e2e_submission -v
```

Expected output:
```
test_01_emergency_flood ... ok
test_02_non_emergency ... ok
test_03_spam ... ok
test_04_uncertain ... ok
test_05_fire ... ok
test_06_explicit_count ... ok
test_07_gps ... ok
test_08_tracking ... ok
test_09_10_approval_and_dispatch ... ok
----------------------------------------------------------------------
Ran 9 tests in ~10s
OK
```

---

## Key Features to Highlight

1. **Multi-modal AI**: Text NLP + audio speech-to-text + image understanding
2. **Deterministic mock fallback**: Works without API keys for offline demo
3. **Human-in-the-Loop**: AI recommends, collector decides
4. **Zero-click automation**: Single approve triggers 10-step resource orchestration
5. **Real-time tracking**: Citizens see status updates without calling a helpline
6. **Full audit trail**: Every AI decision and human action is logged
7. **Duplicate detection**: Same-location, same-disaster reports are clustered
8. **Weather integration**: Live Open-Meteo data adjusts priority scores
9. **Nearest-facility matching**: Haversine distance for hospitals, shelters, rescue teams
10. **Three-tier classification**: EMERGENCY / NON_EMERGENCY / UNCERTAIN with guardrails

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@sahaya.ai` | `password123` |
| Collector | `collector@sahaya.ai` | `password123` |
| Responder | `responder@sahaya.ai` | `password123` |
