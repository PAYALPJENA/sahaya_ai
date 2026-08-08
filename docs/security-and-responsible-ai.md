# Security & Responsible AI

Sahaya AI is built for disaster scenarios where reliability, security, and safety are paramount.

## API Key Handling & Secrets
- **No secrets committed**: The repository uses `.env` files for configuration (`backend/config.py`). Secrets like `NIM_API_KEY` and `JWT_SECRET` are never hardcoded in the source code.
- **Authentication**: All Collector and Responder endpoints are protected by JWT token authentication.

## Responsible AI & Safety Constraints
- **AI Fallback**: The system features a deterministic fallback (`mock_responses.py`) to guarantee continuous operation even if external LLM APIs fail.
- **Human Approval**: The system is strictly "Human-in-the-Loop". The AI only recommends actions; it cannot autonomously dispatch resources, preventing catastrophic misallocations.
- **Input Validation**: All incoming SOS reports are strictly validated using Pydantic schemas. 
- **Non-Emergency Suppression**: The system utilizes a dual-layer filter (deterministic regex spam checking + LLM context evaluation) to suppress non-emergencies and protect system bandwidth.
- **Uncertain-Report Escalation**: Any report with a priority score indicating uncertainty is flagged for manual review rather than forcing an autonomous decision.

## Auditability
- The system includes an `AuditLog` table (`backend/models/audit_log.py`) that tracks all state changes to Incidents, particularly tracking *who* approved a dispatch and *when*.

## Limitations & Mock Data Boundaries
- **Mock Interfaces**: Audio transcription and image understanding currently utilize deterministic keyword-based simulations. True multimodal inference (e.g., Whisper, LLaVA) is not actively wired to the endpoints due to demo constraints.
- **Data Boundaries**: The system operates exclusively on seeded SQLite data. It is not connected to live government databases.
