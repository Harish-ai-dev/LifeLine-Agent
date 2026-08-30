# LifeLine Agent — Comprehensive Specification & Interface Mining Analysis

> **Author**: `spec_miner_1`  
> **Date**: 2026-08-29  
> **Workspace**: `c:\Users\shado\Documents\GitHub\ LifeLine Agent`  
> **Target Document**: `docs/09-parallel-build-contract.md` (and updates to `docs/03-decision-log.md`, `docs/07-scope-lock.md`)  
> **Authoritative Sources Analyzed**:
> - `ORIGINAL_REQUEST.md` (Brain snapshot `ee0aca1a-f7ca-4cf4-b62d-56b451fb669f`)
> - `my-agent/docs/01-architecture.md`
> - `my-agent/docs/03-decision-log.md`
> - `my-agent/docs/04-agent-contracts.md`
> - `my-agent/docs/06-demo-scenarios.md`
> - `my-agent/docs/07-scope-lock.md`
> - `my-agent/docs/08-install-guide.md`
> - `AGENTS.md` (Architectural guidelines)
> - `lifeline/` codebase (`models.py`, `schemas.py`, `main.py`, `firebase.py`, `orchestrator.py`, `tools/`)
> - `frontend/` codebase (`src/types/dashboard.ts`, component architecture)

---

## 1. Executive Summary & Context

LifeLine Agent is an autonomous emergency dispatch and hospital matchmaking system submitted to the **All Things Agentic Hackathon** under **The Taskmaster** track (Deadline: August 31, 2026, 5:00 PM PDT).

The core pipeline accepts emergency cases, computes deterministic **NEWS2 clinical scores**, orchestrates Gemini agents to assess severity and specialty, matches patients to optimal hospitals using real geospatial/ETA calculations and simulated bed availability, and records an immutable audit log to Google Cloud Firestore with zero human phone calls.

### Hackathon Eligibility Compliance Mandates
1. **Gemini Model Tier**: Gemini 3.5 or newer accessed via Gemini API / Vertex AI.
   - *Triage Agent*: `gemini-3.1-pro` (clinical reasoning flagship).
   - *All other agents & report generator*: `gemini-3.5-flash` (frontier intelligence, speed, cost efficiency; fallback: `gemini-3.7-flash`).
2. **Google Agent Framework**: Google ADK (`LlmAgent`, `SequentialAgent`) + Google Genkit.
3. **Google Cloud Infrastructure**: Cloud Run + Firestore (Firebase Admin SDK).
4. **Track**: The Taskmaster (autonomous multi-step, multi-agent pipeline).

### Expansion Goal
Expand the working 2-agent MVP into a complete multi-role platform supporting three dedicated role-based user experiences (**Blood Donor**, **Hospital Console**, **Government Authority**) across four parallel workstreams (**Frontend**, **Backend/API**, **Storage/Data**, **Deploy/Infra**) without regressing the existing `POST /dispatch` pipeline.

---

## 2. Architectural Invariants

1. **Non-Regression of Core Pipeline**: The `POST /dispatch` endpoint (NEWS2 -> Triage Agent -> Bed-Matching Agent -> Routing Agent -> Briefing Agent -> Firestore audit) must remain completely operational and intact.
2. **Deterministic Grounding Before LLM Reasoning**: Pure calculations (NEWS2 formula, OpenStreetMap Overpass queries, OSRM routing) must run in deterministic Python tools (`lifeline/tools/`). Agent LLMs reason over verified tool outputs, eliminating hallucinations.
3. **Single Schema Authority**: Every data contract must map 1:1 between Pydantic models (`lifeline/schemas.py`) and TypeScript definitions (`frontend/src/types/`).
4. **Single Model Registry**: All Gemini model configurations must reside in `lifeline/models.py` (`AGENT_MODELS` dictionary).
5. **No Silent Code Decisions (Golden Rule)**: Any new architectural or design decision must first be recorded in `docs/03-decision-log.md` before coding.
6. **Cross-Platform Windows Compatibility**:
   - Console outputs reconfigured to UTF-8 (`sys.stdout.reconfigure(encoding="utf-8")`) to prevent `cp1252` encoding exceptions.
   - Batch scripts use `start /B` for concurrent background processes.
7. **Secret Hygiene**: Zero hardcoded credentials. All configuration loaded via AES-256 encrypted local storage (`admin/config_manager.py`) or standard GCP environment variables (`GOOGLE_APPLICATION_CREDENTIALS`, `GOOGLE_API_KEY`).
8. **Graceful Offline / Dev Fallback**: When Firestore or external APIs are unreachable, system must automatically fall back to mock UUIDs, local simulation, and offline logs without throwing unhandled exceptions.

---

## 3. Role Definitions & Access Control

The application enforces three distinct role strings throughout frontend routes, backend authorization, and Firestore records:

| Role Identifier | Display Name | Target Persona & Capabilities | Visual Density & Aesthetic |
|---|---|---|---|
| `blood_donor` | Blood / Organ Donor | Profile, blood group, last donation, eligibility status, incoming SOS blood/organ request feed, accept/decline transit action, personal donation history. | Lightweight, personal app, card-based, mobile-friendly. |
| `hospital_staff` | Hospital Console / ER Operations | Live SOS alert queue, patient admission tracking, advance bed/trauma bay reservation, no-bed transfer rerouting, resource/donor request creation, operational issue tracker, medicine/equipment inventory with low-stock alerts, facility audit logs. | Dense, clinical operations dashboard, high information density, dark clinical theme. |
| `government_authority` | Regional Health Authority | Cross-hospital network overview, aggregate strain index, total emergencies, diversion count, district SLA compliance rate, AI-generated daily intelligence report, natural-language query assistant over network data. | High-level executive dashboard, macro-analytics, trends, regional summary. |

### Mock / Demo Authentication Specification
- **Mode**: Demo/Mock Auth (designed for zero-friction hackathon evaluation with clear upgrade path to Firebase Auth SDK).
- **Behavior**: Role-selector on `/login` or pre-populated demo user accounts.
- **Session Representation**: Client receives a JWT-like mock token `lifeline_mock_<role>_<uid>` and user profile object stored in central state.
- **Request Header**: `Authorization: Bearer <token>` and `X-User-Role: <role>` passed in HTTP requests.

---

## 4. API Endpoints Specification (for `docs/09-parallel-build-contract.md`)

All endpoints return JSON. Standard success status is `200 OK` (`201 Created` for creations). Standard error response format is `{ "detail": "<error message>", "code": "<error_code>" }`.

### 4.1. Authentication & Identity
```http
POST /auth/login
```
- **Request**:
  ```json
  {
    "username": "dr_smith",
    "role": "hospital_staff",
    "facility_id": "hosp_mumbai_01"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "token": "mock_token_hospital_staff_hosp_mumbai_01",
    "user": {
      "id": "usr_9812",
      "username": "dr_smith",
      "role": "hospital_staff",
      "facility_id": "hosp_mumbai_01",
      "facility_name": "Lilavati Hospital & Research Centre"
    }
  }
  ```

```http
GET /auth/me
```
- **Headers**: `Authorization: Bearer <token>`
- **Response** (`200 OK`): User object as above.

---

### 4.2. Blood & Organ Donor Workstream

```http
POST /donors
```
- **Description**: Register new donor or update existing profile.
- **Request**:
  ```json
  {
    "full_name": "Rahul Sharma",
    "phone": "+91-98765-43210",
    "email": "rahul.sharma@example.com",
    "blood_group": "O+",
    "is_organ_donor": true,
    "donor_category": "Dual",
    "location": { "lat": 19.055, "lng": 72.840, "address": "Bandra West, Mumbai", "pincode": "400050" },
    "status": "available",
    "last_donation_date": "2026-05-10",
    "eligibility_status": "eligible"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "id": "donor_6721",
    "full_name": "Rahul Sharma",
    "blood_group": "O+",
    "status": "available",
    "eligibility_status": "eligible",
    "total_donations": 4,
    "badge_title": "Lifesaver Gold",
    "_timestamp": "2026-08-29T16:30:00Z"
  }
  ```

```http
GET /donors/:id
```
- **Response** (`200 OK`): Full donor profile including donation history and matched active request ID.

```http
GET /requests?status=open&type=blood&blood_group=O+
```
- **Query Params**: `status` (`open` | `matched` | `fulfilled` | `cancelled`), `type` (`blood` | `organ`), `blood_group` (optional).
- **Response** (`200 OK`):
  ```json
  {
    "requests": [
      {
        "id": "req_8812",
        "request_tracking_number": "REQ-2026-0829-01",
        "hospital_id": "hosp_mumbai_01",
        "hospital_name": "Lilavati Hospital & Research Centre",
        "patient_tracking_number": "DISP-2026-901",
        "patient_name": "Pooja Verma",
        "type": "blood",
        "blood_group_needed": "O+",
        "units_requested": 2,
        "units_fulfilled": 0,
        "urgency": "STAT_CRITICAL",
        "clinical_indication": "Trauma laparotomy with hemorrhagic shock",
        "status": "open",
        "donation_location": {
          "hospital_id": "hosp_mumbai_01",
          "hospital_name": "Lilavati Hospital",
          "department": "Emergency Blood Bank - 2nd Floor",
          "address": "A-791, Bandra Reclamation, Mumbai",
          "lat": 19.052,
          "lng": 72.833,
          "phone": "+91-22-2675-1000"
        },
        "_timestamp": "2026-08-29T16:20:00Z"
      }
    ]
  }
  ```

```http
POST /requests/:id/respond
```
- **Description**: Donor responds to an open request.
- **Request**:
  ```json
  {
    "donor_id": "donor_6721",
    "response_status": "accepted",
    "travel_mode": "driving",
    "eta_minutes": 14
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "request_id": "req_8812",
    "donor_id": "donor_6721",
    "status": "matched",
    "donor_response_status": "accepted",
    "updated_at": "2026-08-29T16:32:00Z"
  }
  ```

---

### 4.3. Hospital Operations & Patient Management

```http
GET /patients?hospital_id=...&status=...
```
- **Query Params**: `hospital_id` (optional), `status` (`inbound` | `admitted` | `transferred` | `discharged`).
- **Response** (`200 OK`):
  ```json
  {
    "patients": [
      {
        "id": "pat_1092",
        "tracking_number": "CASE-9021",
        "full_name": "Vikram Patel",
        "age": 54,
        "gender": "Male",
        "blood_type": "B+",
        "severity": "critical",
        "assigned_hospital_id": "hosp_mumbai_01",
        "admission_status": "inbound",
        "reserved_bed_type": "cardiac_icu",
        "reserved_bay_id": "BAY-C3",
        "eta_minutes": 8.5,
        "vitals": {
          "heart_rate": 118,
          "respiratory_rate": 24,
          "systolic_bp": 88,
          "spo2": 91,
          "temperature_c": 38.6,
          "consciousness": "alert"
        },
        "news2_score": 9,
        "chief_complaint": "Acute crushing chest pain",
        "sbar_brief": "Incoming 54yo male, suspected STEMI, NEWS2 9. Cath lab prep requested."
      }
    ]
  }
  ```

```http
PATCH /patients/:id
```
- **Description**: Update patient status post-arrival/admission.
- **Request**:
  ```json
  {
    "admission_status": "admitted",
    "clinical_notes": "Admitted to Cath Lab Bay 3. Angiography in progress.",
    "bed_number": "ICU-CARD-04"
  }
  ```
- **Response** (`200 OK`): Updated patient record.

```http
POST /sos
```
- **Description**: Hospital or field ER manual SOS trigger (feeds directly to Orchestrator).
- **Request**: Same as `DispatchRequest` (`case` + `patient_location`).
- **Response** (`200 OK`): Full dispatch pipeline result + generated `alert_id`.

```http
POST /beds/:id/reserve
```
- **Description**: Advance bed / trauma bay reservation for incoming patient.
- **Request**:
  ```json
  {
    "patient_id": "pat_1092",
    "hospital_id": "hosp_mumbai_01",
    "bed_type": "cardiac_icu",
    "bay_id": "BAY-C3",
    "action": "reserve"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "bed_id": "ICU-CARD-04",
    "bay_id": "BAY-C3",
    "status": "reserved",
    "patient_id": "pat_1092",
    "reserved_at": "2026-08-29T16:35:00Z"
  }
  ```

```http
POST /cases/:id/transfer
```
- **Description**: Re-route / transfer case when current hospital hits capacity constraint.
- **Request**:
  ```json
  {
    "current_hospital_id": "hosp_mumbai_01",
    "reason": "Sudden surge; 0 cardiac ICU beds available",
    "patient_location": { "lat": 19.052, "lng": 72.833 }
  }
  ```
- **Backend Execution**: Calls `BedMatchingAgent` with current hospital flagged unavailable; returns next best hospital and records `TIER_1_AUTO_REASSIGNED` audit record.
- **Response** (`200 OK`):
  ```json
  {
    "transfer_status": "reassigned",
    "case_id": "CASE-9021",
    "previous_hospital": "Lilavati Hospital",
    "transferred_to_hospital": {
      "name": "Hinduja Hospital",
      "lat": 19.032,
      "lng": 72.841,
      "distance_km": 3.8,
      "eta_minutes": 9.2
    },
    "reasoning": "Rerouted to Hinduja Hospital: 2 open cardiac ICU beds, 9.2 min ETA.",
    "audit_id": "audit_tx_88192"
  }
  ```

```http
POST /requests
```
- **Description**: Raise hospital resource/equipment/blood request.
- **Request**:
  ```json
  {
    "hospital_id": "hosp_mumbai_01",
    "hospital_name": "Lilavati Hospital",
    "type": "blood",
    "blood_group_needed": "O-",
    "units_requested": 3,
    "urgency": "STAT_CRITICAL",
    "clinical_indication": "Massive trauma transfusion protocol"
  }
  ```
- **Response** (`201 Created`): Created request record.

```http
GET /issues
POST /issues
PATCH /issues/:id
```
- **Description**: Operational and equipment issue log.
- **Schema**:
  ```json
  {
    "id": "iss_501",
    "hospital_id": "hosp_mumbai_01",
    "hospital_name": "Lilavati Hospital",
    "category": "equipment",
    "title": "CT Scanner #2 Offline",
    "description": "Calibration fault in primary CT gantry; neuro cases redirected to MRI/CT #1.",
    "severity": "moderate",
    "status": "investigating",
    "reported_by": "Dr. A. Mehta",
    "created_at": "2026-08-29T14:10:00Z",
    "resolved_at": null
  }
  ```

```http
GET /inventory
PATCH /inventory/:id
```
- **Description**: Hospital medicine and critical supply inventory.
- **Schema**:
  ```json
  {
    "id": "inv_801",
    "hospital_id": "hosp_mumbai_01",
    "category": "blood_bank",
    "item_name": "O- Packed Red Blood Cells",
    "current_stock": 2,
    "minimum_threshold": 6,
    "unit": "units",
    "is_low_stock": true,
    "last_updated": "2026-08-29T16:00:00Z"
  }
  ```

---

### 4.4. Government Authority & Regional Analytics

```http
GET /network/overview
```
- **Description**: Regional cross-hospital health summary.
- **Response** (`200 OK`):
  ```json
  {
    "total_incidents_today": 48,
    "active_critical_alerts": 7,
    "jurisdiction_sla_compliance_percent": 97.2,
    "mean_response_time_seconds": 44.5,
    "total_hospitals_registered": 14,
    "hospitals_on_diversion": 1,
    "tier2_escalation_count": 0,
    "overall_district_bed_capacity_percent": 82.4,
    "total_registered_donors": 184,
    "active_donor_requests": 3,
    "blood_units_fulfilled_today": 12,
    "hospital_summaries": [
      {
        "id": "hosp_mumbai_01",
        "name": "Lilavati Hospital",
        "status": "active",
        "available_icu_beds": 3,
        "total_icu_beds": 20,
        "compliance_rate": 98.5,
        "open_issues_count": 1
      }
    ]
  }
  ```

```http
GET /reports/daily
```
- **Description**: AI-generated regional daily intelligence briefing using **`gemini-3.5-flash`**.
- **Backend Execution**: Aggregates daily incident volume, mean response times, hospital strain metrics, and open critical requests; generates a plain-language executive summary.
- **Response** (`200 OK`):
  ```json
  {
    "report_id": "rep_2026_0829",
    "date": "2026-08-29",
    "model_used": "gemini-3.5-flash",
    "headline": "Mumbai Metro Regional Emergency Dispatch Intelligence Report",
    "summary_markdown": "### Executive Briefing\n- **Incident Volume**: 48 total dispatches across Mumbai West and South. Cardiac emergencies accounted for 42% of critical cases.\n- **SLA Performance**: Average time to hospital bed assignment was 44.5 seconds with 97.2% compliance.\n- **Capacity Constraints**: Lilavati Hospital reached 85% ICU load at 15:00 UTC; 1 case automatically rerouted to Hinduja Hospital under Tier 1 auto-dispatch.\n- **Blood Bank Status**: O- inventory flagged low across 2 facilities; 3 donor callout requests successfully matched.",
    "key_metrics": {
      "total_cases": 48,
      "critical_cases": 7,
      "sla_compliance_pct": 97.2,
      "auto_reroutes": 1
    },
    "generated_at": "2026-08-29T16:45:00Z"
  }
  ```

```http
POST /reports/query
```
- **Description**: Natural language interactive queries over regional audit and operational data via `gemini-3.5-flash`.
- **Request**:
  ```json
  {
    "query": "Which hospitals are currently experiencing cardiac ICU bed shortages?"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "query": "Which hospitals are currently experiencing cardiac ICU bed shortages?",
    "answer": "Based on current network telemetry, Lilavati Hospital has only 1 remaining Cardiac ICU bed (95% capacity). Breach Candy and KEM Hospital have 4 and 6 open Cardiac ICU beds respectively.",
    "referenced_facilities": ["Lilavati Hospital", "Breach Candy Hospital", "KEM Hospital"],
    "timestamp": "2026-08-29T16:46:00Z"
  }
  ```

---

## 5. Firestore Collections & Document Shapes

All collections follow the immutable audit pattern already established in `lifeline/tools/firestore_client.py`:

```
Firestore Root
├── dispatch_cases/    [case_id]   -> Full multi-agent dispatch trace & audit trail
├── donors/            [donor_id]  -> Registered donor profile & status
├── requests/          [req_id]    -> Emergency blood/organ/equipment requests
├── patients/          [pat_id]    -> Admitted/inbound patient medical dossiers
├── issues/            [issue_id]  -> Operational & equipment issue reports
├── inventory/         [inv_id]    -> Medicine & medical supplies inventory
└── reports/           [rep_id]    -> Daily AI intelligence reports & executive briefs
```

### Standard Document Schema Metadata
Every document stored in Firestore must contain:
```json
{
  "_id": "auto_generated_or_passed",
  "_timestamp": "2026-08-29T16:30:00.000Z",
  "_version": "0.1.0",
  "_actor": "user_id_or_agent_name"
}
```

---

## 6. Workstream Ownership & File Boundaries

To prevent merge conflicts during 4-way parallel execution, strict file boundaries are locked:

| Workstream | Directory & File Ownership | Must NOT Touch |
|---|---|---|
| **Sub-Agent A: Frontend** | `frontend/`, `ui/`, `admin/` (React/TypeScript views, mock auth stubs, role dashboards, state context, Tailwind UI components) | `lifeline/` backend code, Firestore schema tools, `deploy/` |
| **Sub-Agent B: Backend / API** | `lifeline/main.py`, `lifeline/routes/`, `lifeline/agents/`, `lifeline/schemas.py`, `lifeline/orchestrator.py` | `frontend/`, `deploy/Dockerfile`, raw database schema scripts |
| **Sub-Agent C: Storage / Data** | `lifeline/tools/*_client.py`, `lifeline/firebase.py`, `lifeline/data_access/`, `scripts/seed_*.py`, `data/*.json` | `frontend/`, agent prompts, deploy configurations |
| **Sub-Agent D: Deploy / Infra** | `deploy/`, `Dockerfile`, `Makefile`, `README.md`, environment scripts, Cloud Run deployment configuration | `frontend/src/`, `lifeline/routes/`, `lifeline/agents/` |

---

## 7. Golden Rules for Updating Decision Log & Scope Lock

### 7.1. Updates to `docs/03-decision-log.md`
1. **Authentication Mode**: Add decision entry locking Demo/Mock Authentication (with role-based selector and authorization tokens) to enable frictionless testing of the 3 role-based experiences while maintaining interface compatibility with Firebase Auth.
2. **AI Daily Intelligence Model**: Add decision entry assigning `gemini-3.5-flash` for the `/reports/daily` and `/reports/query` endpoints, satisfying hackathon eligibility and cost/latency goals.
3. **Multi-Role Frontend Architecture**: Lock dedicated route-level screens for Blood Donor, Hospital Console, and Government Authority in React + TypeScript.
4. **Data Access Layer Pattern**: Lock thin data access helper module (`lifeline/data_access/` or `lifeline/tools/`) to decouple FastAPI route handlers from raw Firestore query constructs.

### 7.2. Updates to `docs/07-scope-lock.md`
1. **Move to In-Scope (Expanded Product Demo)**:
   - Role-based Authentication & Role Selection (Demo/Mock).
   - Blood Donor Portal & Request Response Workflow.
   - Hospital Operations Console (Patient Tracking, Advance Bed Reservation, No-Bed Transfer Flow, Resource Requests, Issue Tracker, Inventory).
   - Government Authority Executive Dashboard & AI Daily Intelligence Report (`gemini-3.5-flash`).
2. **Retain Explicitly Out-of-Scope**:
   - Live HL7/FHIR hospital EHR hospital integration.
   - Real-world live hospital bed APIs (simulated bed availability retained).
   - Real payment gateways / billing integrations.
   - Real biometric / government citizen identity validation.

---

## 8. Features Discovered & Specification Catalog

### Features Discovered
| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|---|---|---|---|---|---|---|
| 1 | Auth | Demo Mock Login | Role-based selector login generating mock JWT session | `{username, role, facility_id}` | `{token, user}` | `400 Bad Request` if role invalid | `ORIGINAL_REQUEST.md` |
| 2 | Auth | Session Verification | Returns current user profile from token | `Authorization: Bearer <token>` | `{user}` | `401 Unauthorized` if invalid token | `ORIGINAL_REQUEST.md` |
| 3 | Donor | Donor Registration | Registers or updates donor profile with blood/organ consent | Donor profile JSON | Saved donor with ID & badge | `422 Unprocessable Entity` on invalid fields | `ORIGINAL_REQUEST.md` & `dashboard.ts` |
| 4 | Donor | Donor Profile Fetch | Fetches donor stats, history, and status | `donor_id` | Full donor record | `404 Not Found` if donor missing | `ORIGINAL_REQUEST.md` |
| 5 | Donor | Open Request Feed | Queries open blood/organ requests matching donor criteria | `?status=open&blood_group=...` | List of open requests | Returns empty list if none match | `ORIGINAL_REQUEST.md` |
| 6 | Donor | Request Response | Accept/decline action updating donor transit & ETA | `{donor_id, response_status, eta_minutes}` | Updated request & match status | `400 Bad Request` if request closed | `ORIGINAL_REQUEST.md` |
| 7 | Hospital | Patient List | List admitted & inbound patients | `?hospital_id=...&status=...` | List of patient dossiers | Returns empty list if none match | `ORIGINAL_REQUEST.md` |
| 8 | Hospital | Patient Status Update | Update patient clinical/admission status | `{admission_status, clinical_notes}` | Updated patient record | `404 Not Found` if patient missing | `ORIGINAL_REQUEST.md` |
| 9 | Hospital | SOS Intake | Trigger multi-agent dispatch pipeline | Case vitals + location | Dispatch record + alert ID | `400 Bad Request` on missing fields | `lifeline/main.py` |
| 10 | Hospital | Advance Bed Reserve | Reserve trauma bay / ICU bed for inbound critical patient | `{patient_id, bed_type, bay_id}` | Bed reservation receipt | `409 Conflict` if bed already booked | `ORIGINAL_REQUEST.md` |
| 11 | Hospital | No-Bed Transfer Flow | Reroutes patient to next-best hospital when capacity full | `{case_id, reason, patient_location}` | New hospital destination + audit ID | `404 Not Found` if no hospital found | `ORIGINAL_REQUEST.md` |
| 12 | Hospital | Raise Resource Request | Hospital creates urgent request for blood/equipment | Request JSON | Created request with tracking number | `422 Unprocessable Entity` | `ORIGINAL_REQUEST.md` |
| 13 | Hospital | Issue Tracking | Log, list, and resolve hospital operational issues | Issue JSON | Issue status & resolution log | `404 Not Found` on patch missing ID | `ORIGINAL_REQUEST.md` |
| 14 | Hospital | Inventory Management | Track medicine & supplies with low-stock flags | Inventory update JSON | Updated stock status | `400 Bad Request` on negative stock | `ORIGINAL_REQUEST.md` |
| 15 | Government | Daily AI Intelligence | Generates executive report via `gemini-3.5-flash` | Aggregated network stats | Markdown briefing + key metrics | Fallback to template if Gemini API offline | `ORIGINAL_REQUEST.md` |
| 16 | Government | NL Query Assistant | Interactive natural-language Q&A over network state | `{query: str}` | `{query, answer, referenced_facilities}` | Graceful error string if model fails | `ORIGINAL_REQUEST.md` |
| 17 | Government | Network Overview | Macro cross-hospital load, diversion, and SLA stats | None | Regional metrics payload | `500 Internal Error` with dev mock fallback | `ORIGINAL_REQUEST.md` |
| 18 | Core Agent | NEWS2 Clinical Scoring | Deterministic Royal College of Physicians calculation | Patient vitals | Score + risk band | `ValueError` on out-of-range vitals | `lifeline/tools/news2.py` |
| 19 | Core Agent | Triage Agent | Clinical reasoning via `gemini-3.1-pro` | Vitals + NEWS2 + complaint | Severity + specialty + clinical notes | Fallback to NEWS2 rule-based heuristic | `lifeline/agents/triage_agent.py` |
| 20 | Core Agent | Bed-Matching Agent | Matches hospital via OSM + OSRM + `gemini-3.5-flash` | Triage output + patient location | Chosen hospital + reasoning + alternatives | Fallback to nearest available hospital | `lifeline/agents/bed_matching_agent.py` |
| 21 | Core Agent | Routing Agent | Turn-by-turn ETA & driving route summary | Origin + destination GPS | Distance (km) + ETA (min) + route | Fallback to Haversine distance & 30km/h | `lifeline/agents/routing_agent.py` |
| 22 | Core Agent | Briefing Agent | Generates pre-arrival SBAR summary paragraph | Case + Triage + Bed match | SBAR pre-arrival brief string | Template SBAR fallback | `lifeline/agents/briefing_agent.py` |
| 23 | Audit | Immutable Audit Log | Persists full lifecycle trace to Firestore | Any domain write record | Firestore document ID | Local mock ID if Firestore offline | `lifeline/tools/firestore_client.py` |

### Edge Cases Discovered
| # | Feature | Input | Observed / Specified Behavior |
|---|---|---|---|
| 1 | Bed-Matching Agent | Nearest hospital has `icu_beds: 0` | Agent evaluates alternatives, skips nearest full hospital, and selects next closest facility with open beds, documenting reasoning. |
| 2 | NEWS2 Scoring | Consciousness is `"unresponsive"` or `"confused"` | Automatically adds 3 points to NEWS2 score, forcing high-risk categorization. |
| 3 | Firestore Client | Firebase credentials missing or offline | Catches exception, generates `local_<uuid>` mock document ID, logs warning, and completes dispatch without crashing. |
| 4 | No-Bed Transfer Flow | Original hospital becomes full post-dispatch | Bed-Matching Agent is re-invoked with current hospital excluded, re-allocating patient to secondary hospital and creating `TIER_1_AUTO_REASSIGNED` audit record. |
| 5 | Daily Report Generator | Gemini API rate limit or key missing | System falls back to structured template summary of aggregate metrics with `offline_generator` notice. |
| 6 | Auth Login | Invalid or blank role string | Rejects with `400 Bad Request` and valid role suggestions (`blood_donor`, `hospital_staff`, `government_authority`). |
| 7 | Donor Response | Request already fulfilled by another donor | Returns `409 Conflict` or status notice that request quota is met. |
| 8 | Windows Console | Non-ASCII emoji or symbols logged to terminal | `sys.stdout.reconfigure(encoding="utf-8")` prevents `UnicodeEncodeError` in Windows `cp1252` environment. |
