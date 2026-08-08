# Agent Engineering

This document details the engineering behind Sahaya AI's core autonomous capability: the Emergency Triage Pipeline.

## Agent Definition
Sahaya AI is not a generic chatbot. It acts as an **Action-Oriented Triage Agent**. Its primary function is to interpret unstructured multimodal data, structure it, evaluate severity, and propose actionable resource allocations while deferring final authority to a human.

## Inputs
The AI pipeline (`backend/services/ai_pipeline.py`) accepts the following multimodal inputs:
1. **Citizen Text**: Raw descriptions of the emergency.
2. **Voice Transcript**: Audio inputs (converted via simulated STT fallback).
3. **Camera/Image Input**: Visual data (simulated computer vision object detection fallback).
4. **GPS Coordinates**: Exact `latitude` and `longitude`.
5. **Timestamp**: Implicit time of submission.
6. **Operational Context**: Proximity to seeded Hospitals, Shelters, and Rescue Teams (calculated via Haversine distance), and IMD Weather conditions.

## AI Processing Pipeline

1. **Modality Extraction**: `process_audio_speech_to_text` and `process_image_understanding` extract metadata from media.
2. **Spam Checking**: `check_spam` deterministically drops greetings, selfies, and non-emergency requests.
3. **NVIDIA NIM Inference**: The core text/transcript is sent to `meta/llama3-70b-instruct` via `nim_client.py`. The LLM extracts:
   - `disaster_type` (e.g., FLOOD, FIRE)
   - `severity` (LOW to CRITICAL)
   - `priority_score` (0-100)
   - `needs_evacuation`, `needs_medical`, etc.
4. **Contextual Enrichment**: The system reverse-geocodes the GPS and calls the Open-Meteo API. If extreme weather (e.g., Cyclone) is confirmed, the priority score is autonomously boosted.
5. **Duplicate Clustering**: `check_duplicates` scans for similar disaster types within 2km over the last 24 hours.

## Classifications

The AI categorizes reports into three operational states:

1. **EMERGENCY**: High priority score (>= 70). The system generates a structured `Incident` and an `AIRecommendation` outlining exactly which teams/hospitals to deploy. Passes to Collector workflow.
2. **NON_EMERGENCY**: Flagged by spam filter or scored exceptionally low. Does not generate an Incident. No dispatch occurs.
3. **UNCERTAIN**: Mid-range priority (40-69) or ambiguous context. Automatically marked as `needs_manual_review = True`. Defers entirely to human review before recommendation generation.

## Human-in-the-Loop (HITL)

Sahaya AI enforces strict safety boundaries through HITL:
**AI Recommends. Collector Authorizes. System Executes.**
This is critical for emergency-response software. Autonomous dispatch of limited government resources (like NDRF teams or ICU beds) is too risky. The AI serves as an accelerator for the Collector, reducing cognitive load during mass-casualty events without bypassing legal or operational authority.

## AI Fallback

If the NVIDIA NIM API is unavailable, the system utilizes a deterministic fallback (`mock_responses.py`). 
- **When used**: Automatically triggered upon API timeout or missing API key.
- **Why it matters**: In a disaster, internet connectivity and external APIs can fail. The fallback preserves application reliability by using keyword matching to generate structured responses, ensuring the triage pipeline never halts.

## AI Safety Principles

Sahaya AI enforces the following prompt constraints (enforced in `prompts.py`):
- **Do not invent numbers**: Do not hallucinate affected-person counts; if a citizen says "several", do not output a specific integer.
- **Evidence-based**: Do not assume an emergency without evidence.
- **Separation of Concerns**: Separate facts from inference, and inference from recommendation.
- **Low Confidence Escapes**: Low-confidence NIM responses trigger human review.
- **Suppression**: Non-emergencies must not trigger dispatch.
