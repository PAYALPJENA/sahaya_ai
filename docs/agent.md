# Agent Specification: Sahaya Emergency Triage Agent

## 1. Goal
To autonomously ingest multimodal citizen emergency reports, filter noise/spam, extract structured operational data (disaster type, severity, affected count), cross-reference with environmental data (weather, geography), and propose a localized resource allocation plan for human authorization.

## 2. Tools & Capabilities
- **LLM Engine**: NVIDIA NIM (`meta/llama3-70b-instruct`) for NLP and reasoning.
- **Geospatial Engine**: Haversine distance calculator for mapping GPS coordinates to nearest seeded facilities.
- **Weather Integration**: Open-Meteo API for real-time validation of meteorological hazards (e.g., confirming a reported cyclone).
- **Multimodal Simulators**: Fallback extraction engines for voice and image analysis.

## 3. Core Logic Flow
1. **Receive SOS**: Ingest raw text/voice/image and GPS.
2. **Filter**: Drop non-emergencies (Spam Filter).
3. **Analyze**: Prompt NIM to extract severity, disaster type, and resource needs.
4. **Enrich**: Fetch local weather and locate nearest Hospital/Shelter/Rescue Team.
5. **Score**: Calculate Priority Score (0-100). Boost score if weather confirms hazard.
6. **Decide**: 
   - If Priority >= 70: Create EMERGENCY Incident & AI Recommendation.
   - If Priority 40-69: Flag for MANUAL REVIEW.
   - If Priority < 40: Log as LOW SEVERITY.

## 4. Constraints
- The agent **cannot** dispatch resources autonomously.
- The agent **cannot** invent specific numbers for affected people if the input is vague.

*For detailed architectural implementation, see [agent-engineering.md](./agent-engineering.md).*
