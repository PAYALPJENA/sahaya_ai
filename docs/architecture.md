# System Architecture

Sahaya AI employs a modern, decoupled architecture designed to funnel unstructured citizen data through an AI pipeline before presenting it to a human decision-maker.

## Architecture Diagram

```mermaid
flowchart TD
    subclass1(Citizen Device)
    subclass2(Collector Dashboard)
    
    subgraph Frontend [Frontend (Next.js)]
        C_PHONE[SOS Web App]
        D_BOARD[Collector Dashboard]
    end

    subgraph Backend [Backend API (FastAPI)]
        API_SOS[POST /api/v1/sos]
        API_INC[GET /incidents]
        API_APP[POST /approve]
    end

    subgraph AI_Layer [AI Processing Pipeline]
        MODALITY[Audio/Image Extraction]
        SPAM[Spam Filter]
        NIM[NVIDIA NIM llama3-70b-instruct]
        GEO[GPS Geocoding]
        FALLBACK[Deterministic Fallback]
    end

    subgraph External_APIs [External Integrations]
        WEATHER[Open-Meteo Weather API]
    end

    subgraph DB [Database (SQLite)]
        DB_SOS[(SOS Reports)]
        DB_INC[(Incidents)]
        DB_REC[(AI Recommendations)]
        DB_RES[(Seeded Resources & Facilities)]
        DB_DIS[(Dispatches)]
    end

    %% Workflow
    C_PHONE -- "Text/Voice/GPS" --> API_SOS
    API_SOS -- "Unstructured Data" --> MODALITY
    MODALITY --> SPAM
    SPAM -- "Valid Emergency" --> NIM
    NIM -. "If Unavailable" .-> FALLBACK
    NIM -- "Analyzed Incident" --> GEO
    GEO -- "Checks Weather" --> WEATHER
    
    GEO -- "Creates" --> DB_SOS
    GEO -- "Creates" --> DB_INC
    GEO -- "Creates" --> DB_REC
    
    D_BOARD -- "Fetches" --> API_INC
    API_INC -- "Reads" --> DB_INC
    
    D_BOARD -- "Approves" --> API_APP
    API_APP -- "Updates Status" --> DB_INC
    API_APP -- "Assigns" --> DB_RES
    API_APP -- "Creates" --> DB_DIS
    
    C_PHONE -- "Polls Status" --> DB_SOS
```

## Central Workflow

1. **Citizen SOS**: A citizen accesses the SOS frontend (mobile-friendly) and submits text, audio, or images along with their GPS coordinates.
2. **AI Triage**: The backend `POST /api/v1/sos` receives the data.
   - Converts audio/images if present.
   - Checks for spam (filters out non-emergencies).
   - Prompts NVIDIA NIM to parse disaster type, severity, priority, and required resources.
   - Cross-references GPS with seeded Facilities (Hospitals/Shelters/Teams) and Open-Meteo Weather API.
3. **Emergency Classification**:
   - **NON_EMERGENCY**: Dropped or flagged as spam; no dispatch occurs.
   - **UNCERTAIN/EMERGENCY**: A structured `Incident` is generated, alongside an `AIRecommendation`.
4. **Human-in-the-Loop**: The Collector views the incident on their dashboard, reviews the AI recommendation, and clicks 'Approve'.
5. **Resource Allocation**: The system automatically allocates nearest seeded resources and generates `Dispatch` entities.
6. **Citizen Tracking**: The citizen tracks their unique token to see the response status update to `APPROVED` and `DISPATCHED`.
