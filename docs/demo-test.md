# Demo & Test Guide

Sahaya AI includes a comprehensive end-to-end test suite that validates all 10 core scenarios of the disaster response pipeline — from SOS intake through AI triage, approval, and dispatch.

## Running the Tests

```bash
# From the project root
python -m unittest tests.test_e2e_submission -v
```

> **Note**: Tests use a separate SQLite database (`test_sahaya_ai.db`) and the deterministic mock AI client. No API keys are required.

## The 10 Scenarios

| # | Test Method | Scenario | Input | Expected Outcome |
|---|-------------|----------|-------|------------------|
| 1 | `test_01_emergency_flood` | Emergency Flood | "Sir flood water entered our village. Four people are trapped on the roof. Please send help." | Incident created with `FLOOD` type, `CRITICAL` severity, `affected_count = 4`, AI recommendation generated |
| 2 | `test_02_non_emergency` | Non-Emergency | "Hi, my name is Payal." | Incident created with `CLOSED` status and rejection reason `"AI classified as NON_EMERGENCY"` |
| 3 | `test_03_spam` | Spam / Food Request | "please send pizza" | SOS flagged as spam, closed incident created with `is_spam = True` |
| 4 | `test_04_uncertain` | Uncertain / Ambiguous | "Please help." | Incident created with `UNDER_REVIEW` status and `needs_manual_review = True` |
| 5 | `test_05_fire` | Fire Emergency | "There is a fire in the market and several people are trapped." | Incident created with `FIRE` type, `affected_count = 0` (does not fabricate count for vague "several") |
| 6 | `test_06_explicit_count` | Explicit Affected Count | "There are 12 people trapped inside the building." | Incident with `affected_count = 12` (extracts numeric count from text) |
| 7 | `test_07_gps` | GPS Coordinates | "Emergency here." with lat/lon | Report stores exact GPS coordinates `(20.29, 85.82)` |
| 8 | `test_08_tracking` | Citizen Tracking | "Flood emergency." | Tracking token issued, `/sos/{token}/status` returns valid `citizen_status` |
| 9 | `test_09_10_approval_and_dispatch` (part 1) | Collector Approval | "Building collapsed, 3 people stuck." + login as collector + approve | Incident status transitions to `DISPATCHED`, resource allocations created |
| 10 | `test_09_10_approval_and_dispatch` (part 2) | Automated Dispatch | (continuation of scenario 9) | Dispatch record created, citizen tracking status = `"Rescue Team Assigned"` |

## Test Architecture

```
tests/
└── test_e2e_submission.py    ← Single file covering all 10 scenarios
```

### Key Design Decisions

- **Isolated test database**: Each test run creates a fresh `test_sahaya_ai.db`, drops all tables, recreates schema, and seeds baseline data.
- **Deterministic mock AI**: With no `NIM_API_KEY` set, the system uses `backend/ai/mock_responses.py` which provides predictable, keyword-based responses.
- **Sequential test ordering**: Tests are numbered `test_01` through `test_09_10` to run in order (unittest sorts alphabetically).
- **Auth flow tested**: Test 9/10 logs in as `collector@sahaya.ai` using seeded credentials to test the full approval → dispatch pipeline.

## What Each Test Validates

### Test 1 — Emergency Flood (Happy Path)
- SOS report created with tracking token
- Incident linked to SOS report
- Disaster type = `FLOOD`, severity = `CRITICAL`
- Affected count = 4 (extracted from "Four people")
- AI recommendation generated

### Test 2 — Non-Emergency Classification
- Mock AI classifies "Hi, my name is Payal" as `NON_EMERGENCY`
- Incident created with `CLOSED` status
- Rejection reason recorded for audit trail

### Test 3 — Spam Detection
- Spam checker catches "please send pizza" via keyword matching
- Report flagged as spam (`is_spam = True`)
- Closed incident created for record-keeping

### Test 4 — Uncertain / Manual Review
- Mock AI classifies "Please help." as `UNCERTAIN`
- Incident created with `UNDER_REVIEW` status
- `needs_manual_review = True` flag set

### Test 5 — Fire Emergency
- Disaster type correctly identified as `FIRE`
- Affected count = 0 (system does NOT fabricate numbers for vague words like "several")

### Test 6 — Explicit Count Extraction
- Regex-based count extraction picks up "12 people"
- `affected_count_estimate = 12`

### Test 7 — GPS Preservation
- Latitude and longitude stored exactly as submitted
- Used for nearest-facility calculations

### Test 8 — Citizen Tracking
- Tracking token returned in SOS response
- Status endpoint returns valid JSON with `citizen_status`

### Test 9 — Collector Approval
- Authenticated login as collector
- Approval triggers the automation engine:
  - Rescue team assigned
  - Resources allocated
  - Dispatch auto-created
  - Hospital notified
  - Shelter reserved

### Test 10 — Dispatch Verification
- Dispatch record exists in database
- Citizen tracking status = `"Rescue Team Assigned"`
