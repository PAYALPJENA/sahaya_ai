# Sahaya AI: Human-in-the-Loop Disaster Response Operating System

Sahaya AI is a prototype disaster response operating system that bridges the gap between chaotic citizen SOS requests and structured governmental emergency dispatch. It leverages Artificial Intelligence to triage raw inputs, but strictly requires a human-in-the-loop (the District Collector) to approve resource allocation and dispatch.

## 🚨 Problem Statement

During major natural disasters (like the frequent cyclones in Odisha, India), emergency response centers are overwhelmed with thousands of unstructured, duplicate, and sometimes false SOS calls. Operators struggle to prioritize these requests manually, leading to delayed responses and misallocation of critical resources.

## 💡 Solution

Sahaya AI provides a multi-modal intake system (text, voice, image) for citizens. Instead of sending these raw requests directly to human operators, an AI triage layer analyzes the content, classifies the emergency, extracts the affected count, determines severity, and recommends the nearest available resources (boats, medical teams, shelters). 

The parsed, structured incident is then presented to the District Collector on a dashboard. With a single click, the Collector can approve the AI's recommendation, triggering an automated zero-intervention dispatch engine that reserves resources, notifies hospitals, deploys teams, and sends real-time tracking updates back to the citizen.

---

## 🔄 End-to-End Workflow

1. **Citizen SOS**: A citizen submits an SOS report with text, optional media, and GPS coordinates.
2. **AI Triage**: The system processes the report, filtering out spam, and generating an AI recommendation (Severity, Disaster Type, Priority Score, Suggested Resources).
3. **Collector Approval**: The structured incident appears on the Collector's dashboard for human review.
4. **Automated Allocation**: Upon approval, the system reserves the nearest available resources (using Haversine distance calculations).
5. **Dispatch & Tracking**: A dispatch order is created, and the citizen receives real-time status updates (e.g., "Rescue Team Assigned").

---

## 🤖 AI Triage & Classification Rules

The AI pipeline classifies every incoming SOS report into one of three categories:

- **EMERGENCY**: Genuine disaster reports (Flood, Fire, Cyclone). The system creates an incident, assigns a severity score (LOW/MEDIUM/HIGH/CRITICAL), and routes it to the Collector.
- **NON_EMERGENCY**: Irrelevant or conversational messages (e.g., "Hi", "Send pizza"). The system auto-closes the incident and logs it for auditing.
- **UNCERTAIN**: Ambiguous requests (e.g., "Please help"). The system creates an incident but flags it as `UNDER_REVIEW`, requiring explicit manual review before triage.

---

## 🛠️ Technology Stack

- **Backend**: Python, FastAPI, SQLAlchemy, SQLite
- **Frontend**: Next.js 14, React, Tailwind CSS, TypeScript
- **AI Integration**: NVIDIA NIM (meta/llama3-70b-instruct) — *Note: Currently configured to use a deterministic mock fallback for demonstration.*

---

## 🏗️ Architecture & Project Structure

```
sahaya-ai/
├── backend/                  # FastAPI Backend
│   ├── api/v1/               # API Routing (Incidents, SOS, Approvals, Dispatches)
│   ├── core/                 # Enums, Config, Security
│   ├── models/               # SQLAlchemy ORM Models
│   ├── schemas/              # Pydantic Validation Schemas
│   ├── services/             # Business Logic (SOS, AI Pipeline, Approval Automation)
│   └── ai/                   # NVIDIA NIM Client & Mock Fallbacks
├── frontend/                 # Next.js Frontend
│   ├── src/app/              # Next.js App Router Pages
│   └── src/types/            # TypeScript Interfaces
├── tests/                    # E2E Submission Test Suite
└── docs/                     # Documentation & Demo Scripts
```

---

## 🚦 System Components: Real vs. Mock vs. Seeded

To maintain transparency for the evaluation, here is the exact state of the system's components:

| Component | Status | Description |
|-----------|--------|-------------|
| **Core API & Database** | **REAL** | The FastAPI backend and SQLite database are fully functional and persist all data. |
| **Collector Dashboard** | **REAL** | The UI reads/writes directly to the backend APIs. |
| **Approval Automation** | **REAL** | The backend genuinely calculates nearest resources, decrements capacity, and generates dispatches. |
| **E2E Testing** | **REAL** | The 10-scenario test suite executes against a real local database. |
| **Operational Data** | **SEEDED** | Hospitals, Shelters, Rescue Teams, and baseline Users are pre-seeded into the database on startup. |
| **AI Inference** | **FALLBACK**| Due to missing API keys in the demo environment, the NVIDIA NIM client uses a deterministic **mock** fallback (`mock_responses.py`) that returns structured JSON based on keyword matching. |
| **Speech-to-Text / Vision** | **MOCK** | Audio and image processing are simulated via keyword matching on the submitted media URLs. |
| **Weather Integration** | **MOCK** | The Open-Meteo weather API call exists, but falls back to mock data if the API times out. |
| **GIS Map** | **PLACEHOLDER**| The frontend GIS map view uses placeholder static coordinates for visual demonstration. |

---

## 🚀 How to Run Locally

### Prerequisites
- Python 3.11+
- Node.js 20+

### 1. Start the Backend
```bash
cd backend
python -m pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
*Note: The backend will automatically seed baseline data on startup.*

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:3000`.

### 3. Demo Credentials
- **Collector**: `collector@sahaya.ai` / `password123`

---

## 🧪 Testing

The system includes a comprehensive End-to-End test suite covering 10 core scenarios (Emergency, Non-Emergency, Spam, Ambiguous, Approval, Dispatch, etc.).

Run the tests from the project root:
```bash
python -m unittest tests.test_e2e_submission -v
```

---

## ⚠️ Known Limitations

1. **AI API Keys**: The system is designed to use NVIDIA NIM, but relies on a deterministic mock fallback for offline/keyless demonstration.
2. **GIS Maps**: Real interactive map components (e.g., Leaflet/Mapbox) are not fully integrated; the map view is a static representation.
3. **Authentication**: JWT authentication is implemented, but session management and token expiration are simplified for the prototype.
4. **Media Storage**: Uploaded media (audio/images) are not persisted to a blob store (like S3); the system only stores the provided media URLs.
