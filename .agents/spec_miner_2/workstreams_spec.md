# LifeLine Agent — Comprehensive Workstream Specification Report
**Document Version**: 1.0.0  
**Target Track**: The Taskmaster (All Things Agentic Hackathon 2026)  
**Author**: Specification Miner (`spec_miner_2`)  
**Status**: Ready for Sub-Agent Dispatch

---

## 1. Executive Summary & Shared Architectural Invariants

LifeLine Agent is an autonomous emergency dispatch, clinical triage, and hospital matchmaking system. The platform is expanding from a core 2-agent MVP (`triage_agent` + `bed_matching_agent`) into a complete multi-role ecosystem serving **Blood Donors**, **Hospital Clinical & Operations Staff**, and **Government Health Authorities**.

### Mandatory Hackathon & Architectural Rules:
1. **Gemini Models**:
   - `triage_agent`: `gemini-3.1-pro` (accessed via Gemini API)
   - All other agents/reporting: `gemini-3.5-flash` (mandatory model) with `gemini-3.7-flash` as fallback.
   - Offline / No-API-Key fallback: Deterministic rule-based engines for zero-failure local testing and judge execution.
2. **Google Agent Framework**: Google ADK (`LlmAgent`, `Runner`, `InMemorySessionService`) + Google Genkit.
3. **Google Cloud Infra**: Google Cloud Run (containerized backend) + Google Cloud Firestore (audit & operational state).
4. **Windows & Console Invariant**: Strict UTF-8 console encoding (`sys.stdout.reconfigure(encoding="utf-8")`) and Typer CLI entrypoint (`lifeline` / `python -m lifeline`).
5. **No Cross-Contamination**: Each sub-agent owns designated directories and files to guarantee zero merge conflicts during parallel implementation.

---

## 2. Features Discovered & Probe Matrix

### ## Features Discovered
| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Auth / Identity | Mock/Demo Role Login (`POST /auth/login`) | Authenticates user via role selector or preset credentials without requiring external OAuth setup during demos. | JSON: `{"role": "blood_donor" \| "hospital_staff" \| "government_authority", "email": str, "password": str}` | JSON: `{"token": str, "user": {"id": str, "role": str, "name": str, "hospital_id"?: str}}` | Returns HTTP 400 if invalid role provided; defaults to guest if empty. | `ORIGINAL_REQUEST.md`, `admin/auth.py` |
| 2 | Emergency Dispatch | Multi-Agent Dispatch (`POST /dispatch`) | Executes complete pipeline: NEWS2 scoring -> Triage -> Bed-Matching -> Routing -> Briefing -> Firestore Audit. | JSON: `{"case": Case, "patient_location": Location}` or flat Case object with `patient_location`. | JSON: Full dispatch record containing `news2`, `triage`, `bed_match`, `routing`, `briefing`, `audit_id`. | Validates vitals range; uses deterministic fallback if Gemini API call times out. | `lifeline/main.py`, `lifeline/orchestrator.py` |
| 3 | Donor Management | Register Donor (`POST /donors`) | Registers new blood/organ donor with blood group, geolocation, and contact info. | JSON: `DonorCreate` (name, blood_group, phone, lat, lng, is_organ_donor) | JSON: `DonorProfile` with generated ID, status='available', eligibility='eligible'. | HTTP 422 if blood group invalid or phone missing. | `frontend/src/types/dashboard.ts`, `ORIGINAL_REQUEST.md` |
| 4 | Donor Management | List & Get Donors (`GET /donors`, `GET /donors/:id`) | Fetches registered donors filtered by blood group, status, or distance. | Query params: `blood_group`, `status`, `lat`, `lng`, `radius_km` | JSON array of `DonorProfile` objects or single `DonorProfile`. | HTTP 404 if donor ID not found. | `frontend/src/types/dashboard.ts` |
| 5 | Resource Requests | Create Resource Request (`POST /requests`) | Hospital creates emergency request for blood units, equipment, or specialist team. | JSON: `RequestCreate` (hospital_id, type, blood_group_needed, units_requested, urgency, clinical_indication) | JSON: `DonorRequest` object with tracking number, status='open', matched_donors=[]. | HTTP 400 if units <= 0 or hospital_id invalid. | `frontend/src/types/dashboard.ts`, `ORIGINAL_REQUEST.md` |
| 6 | Resource Requests | List Open Requests (`GET /requests`) | Fetches resource requests with optional status and hospital filtering. | Query params: `status` (open/matched/fulfilled), `hospital_id`, `type` | JSON array of `DonorRequest` objects. | Returns empty list if no matches found. | `frontend/src/types/dashboard.ts` |
| 7 | Resource Requests | Respond to Request (`POST /requests/:id/respond`) | Donor accepts, declines, or updates transit status for a matched request. | Path: `id`, Body: `{"donor_id": str, "response": "accepted" \| "declined" \| "en_route" \| "arrived"}` | JSON: Updated `DonorRequest` with matched donor status & ETA. | HTTP 404 if request not found, 400 if already fulfilled. | `frontend/src/types/dashboard.ts`, `ORIGINAL_REQUEST.md` |
| 8 | Patient Tracking | List & Filter Patients (`GET /patients`) | Retrieves post-admission ER patients by hospital and admission status. | Query params: `hospital_id`, `status` (inbound, admitted, in_treatment, transferred, discharged) | JSON array of `PatientRecord` objects. | Returns empty list on no matches. | `ORIGINAL_REQUEST.md`, `frontend/src/types/dashboard.ts` |
| 9 | Patient Tracking | Update Patient Status (`PATCH /patients/:id`) | Updates patient clinical progression, assigned bay/bed, or discharge status. | Path: `id`, Body: `{"status": str, "bed_id"?: str, "clinical_notes"?: str}` | JSON: Updated `PatientRecord` + audit log entry. | HTTP 404 if patient ID missing. | `ORIGINAL_REQUEST.md` |
| 10 | Issue Tracking | Create & List Issues (`POST /issues`, `GET /issues`) | Tracks operational ER issues (broken equipment, low oxygen, staffing shortages). | Body: `IssueCreate` (hospital_id, title, category, priority, description) | JSON: `IssueRecord` with status='open', timestamp, tracking number. | HTTP 422 on invalid category or empty title. | `frontend/src/types/dashboard.ts`, `ORIGINAL_REQUEST.md` |
| 11 | Issue Tracking | Resolve/Update Issue (`PATCH /issues/:id`) | Updates issue status to investigating or resolved with resolution notes. | Path: `id`, Body: `{"status": "resolved", "resolution_notes": str}` | JSON: Updated `IssueRecord` with `resolved_at` timestamp. | HTTP 404 if issue ID not found. | `ORIGINAL_REQUEST.md` |
| 12 | Bed Logistics | Advance Bed Reservation (`POST /beds/:id/reserve`) | Pre-allocates trauma bay or ICU bed for an inbound critical patient before arrival. | Path: `id` (bed_id), Body: `{"case_id": str, "hospital_id": str, "patient_name": str}` | JSON: `{"status": "reserved", "bed_id": str, "expires_at": str}` | HTTP 409 if bed already reserved or occupied. | `frontend/src/types/dashboard.ts`, `ORIGINAL_REQUEST.md` |
| 13 | Inter-Hospital Transfer | No-Bed Transfer Flow (`POST /cases/:id/transfer`) | Re-routes patient to next optimal hospital when assigned hospital is at full capacity. | Path: `id` (case_id), Body: `{"current_hospital_id": str, "reason": str}` | JSON: `BedMatchingOutput` with new hospital choice, ETA, and transfer confirmation. | HTTP 404 if case ID invalid; falls back to nearest available general hospital. | `ORIGINAL_REQUEST.md`, `lifeline/agents/bed_matching_agent.py` |
| 14 | Hospital Inventory | Medicine & Equipment Stock (`GET /inventory`, `PATCH /inventory/:id`) | Monitors blood bank units, critical medications, and oxygen reserves with low-stock flags. | Query: `hospital_id`, `low_stock_only`; Patch body: `{"current_stock": int, "action": "restock" \| "consume"}` | JSON array of `InventoryItem` or updated item. | HTTP 400 if stock falls below 0. | `frontend/src/types/dashboard.ts`, `ORIGINAL_REQUEST.md` |
| 15 | AI Intelligence | Daily AI Report (`GET /reports/daily`) | Generates plain-language executive summary and strain analysis across network via Gemini 3.5 Flash. | Query: `date` (default today), `district` (optional) | JSON: `{"date": str, "summary": str, "strain_index": float, "key_metrics": dict, "recommendations": list[str]}` | Returns structured fallback summary if Gemini API key absent. | `ORIGINAL_REQUEST.md`, `my-agent/docs/03-decision-log.md` |
| 16 | AI Intelligence | Natural-Language Report Query (`POST /reports/query`) | Queries live operational network data using natural language answered by Gemini 3.5 Flash. | JSON: `{"query": "Which hospitals in Mumbai had the highest trauma strain today?"}` | JSON: `{"query": str, "answer": str, "supporting_data": list[dict], "generated_by": "gemini-3.5-flash"}` | Returns grounded fallback query response if model unavailable. | `ORIGINAL_REQUEST.md`, `my-agent/docs/03-decision-log.md` |
| 17 | Network Analytics | Cross-Hospital Overview (`GET /network/overview`) | Provides aggregate KPIs (total incidents, active critical cases, SLA compliance, diversion counts). | Query: `district` (default 'all') | JSON: `JurisdictionAnalytics` KPI metrics dictionary. | Computes KPIs from in-memory / Firestore records. | `frontend/src/types/dashboard.ts` |
| 18 | Storage & Audit | Immutable Audit Logger (`write_audit_record`) | Persists all state mutations and agent reasoning to Firestore `audit_logs` and `dispatch_cases`. | Record dict with `_timestamp`, `actor`, `event_type`, `payload` | String: Document ID (e.g. `doc_12345` or `local_abc123`). | Gracefully writes to local in-memory store if Firestore offline. | `lifeline/tools/firestore_client.py` |
| 19 | CLI Management | Operational Verbs CLI (`lifeline <verb>`) | Typer CLI providing `init`, `status`, `run`, `ui`, `dispatch`, `logs`, `seed`, `test`, `admin`. | CLI arguments & flags | Rich formatted console tables and progress spinners. | Exits with status code 1 and error message on invalid input. | `lifeline/cli.py`, `AGENTS.md` |

---

### ## Edge Cases
| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | NEWS2 Scoring | Patient with zero heart rate / unrecorded vitals | `news2_score` raises `ValidationError` or handles default vitals safely without crashing. |
| 2 | Triage Agent | Vitals indicate NEWS2=0 but chief complaint is "gunshot wound to chest" | Agent prioritizes mechanism of injury and upgrades severity to `critical` with `trauma` specialty. |
| 3 | Bed Matching | All hospitals in 15km radius have 0 ICU beds for critical patient | Bed-Matching Agent selects closest hospital with emergency stabilization capability and flags `alternatives` with capacity warning. |
| 4 | Offline Dev Mode | Backend invoked without `GEMINI_API_KEY` or `GOOGLE_APPLICATION_CREDENTIALS` | System automatically falls back to deterministic NEWS2 rule engine, local hospital distance calculation, mock briefing, and in-memory mock Firestore. Zero crashes. |
| 5 | Auth Switcher | User attempts to access Hospital Console while authenticated as `blood_donor` | UI / API enforces role gate and redirects to Blood Donor dashboard or returns HTTP 403 Forbidden. |
| 6 | Rapid SOS Dispatch | Hospital receives 5 simultaneous critical dispatch alerts | Advance bed reservation locks individual bays; alerts queue in FIFO order with active Tier 1 countdown timers (60s SLA). |
| 7 | Resource Request | Blood request for rare group (e.g., AB-) with 0 matching local donors | System marks request status='open', triggers automated wider-radius broadcast, and flags as STAT_CRITICAL. |
| 8 | Windows CLI Execution | `lifeline status` executed in legacy Windows CMD terminal without UTF-8 | `sys.stdout.reconfigure(encoding="utf-8", errors="replace")` prevents `UnicodeEncodeError` and renders fallback characters. |

---

## 3. Workstream Specifications

```
📁 File Ownership Matrix to Prevent Parallel Merge Conflicts:
┌─────────────────────┬────────────────────────────────────────────────────────────────────────┐
│ Workstream          │ Primary Owned Files & Directories                                      │
├─────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Sub-Agent A         │ frontend/src/, frontend/public/, ui/, admin/superadmin.py (UI elements)│
│ (Frontend)          │                                                                        │
├─────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Sub-Agent B         │ lifeline/main.py, lifeline/routes/, lifeline/schemas.py,               │
│ (Backend / API)     │ lifeline/agents/report_agent.py                                        │
├─────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Sub-Agent C         │ lifeline/tools/firestore_client.py, lifeline/tools/data_store.py,       │
│ (Storage / Data)    │ lifeline/tools/seed_data.py, data/                                     │
├─────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Sub-Agent D         │ deploy/, Makefile, .env.example, pyproject.toml, lifeline/cli.py,      │
│ (Deploy / Infra)    │ README.md                                                              │
└─────────────────────┴────────────────────────────────────────────────────────────────────────┘
```

---

### Sub-Agent A — Frontend Specification

#### Objective:
Deliver a high-fidelity, multimodal role-based user interface with dedicated views for **Blood Donor**, **Hospital Console**, and **Government Authority**, gated by a central demo authentication system.

#### Key Deliverables:
1. **Demo Auth Switcher & Login Route (`/login` or Modal Switcher)**:
   - Dedicated authentication switcher supporting fast role switching:
     - `blood_donor`: "Rahul Sharma (O+ Donor)"
     - `hospital_staff`: "Dr. Aditi Rao (Lilavati Hospital Trauma Lead)"
     - `government_authority`: "Dr. Rajesh Verma (Mumbai Emergency Services Director)"
   - Store active user session, JWT/mock token, and permissions in `AuthContext`.
   - Gate all routes and portal views based on authenticated role.

2. **Role 1: Blood Donor Portal (`blood_donor`)**:
   - **Visual Aesthetic**: Lightweight, warm, mobile-first personal healthcare app.
   - **Components**:
     - *Donor Profile Card*: Name, Blood Group (e.g. O+), Organ Donor badge, donation count, eligibility countdown.
     - *Open Emergency Requests Feed*: Live list of hospital blood/organ requests matching donor group with distance (km), driving ETA, urgency badge (`STAT_CRITICAL`, `URGENT`), and hospital address.
     - *Action Center*: One-click "Accept & En Route", "Decline", and "Share Location" actions.
     - *Donation History & Rewards*: Timeline of past donations with impact badges (e.g., "3 Lives Saved").

3. **Role 2: Hospital Command Console (`hospital_staff`)**:
   - **Visual Aesthetic**: High-density, dark clinical operations center (`bg-slate-900`, cyan/amber/red telemetry accents).
   - **Components**:
     - *Live SOS Intake Inbox*: Shows incoming ambulances with 3-stage agent progression:
       `[1. NEWS2 / Severity Assessment] ➔ [2. Matched Hospital / OSRM ETA] ➔ [3. SBAR Clinical Brief]`.
     - *Tier 1 SLA Countdown*: Visual 60-second timer per inbound case with "Acknowledge" and "Prep Bay" buttons.
     - *Admitted Patient Management*: Active patient list with real-time status selector (`Inbound`, `Admitted`, `In Surgery`, `Transferred`, `Discharged`).
     - *No-Bed Transfer Modal*: Single-click transfer button triggering `/cases/:id/transfer` to find alternative facilities.
     - *Advance Bed / Bay Reservation*: Visual grid of ICU beds and Trauma Resuscitation Bays with quick reserve/release toggle.
     - *Resource Request Dispatcher*: Modal to raise immediate donor or equipment requests (`POST /requests`).
     - *Live ER Issue Board*: Log and track equipment/staffing incidents (`POST /issues`, `PATCH /issues/:id`).
     - *Inventory Monitor*: Visual gauges for blood bank units, oxygen, and critical medications with low-stock badges.

4. **Role 3: Government Authority Dashboard (`government_authority`)**:
   - **Visual Aesthetic**: Executive command dashboard, clean typography, broad metric cards.
   - **Components**:
     - *AI Daily Situation Report*: Renders the Gemini 3.5-flash generated executive daily briefing with strain highlights.
     - *Natural Language Query Console*: Input prompt for regional health directors (e.g., "Show me hospitals exceeding 90% ICU capacity in South Mumbai") communicating with `POST /reports/query`.
     - *Jurisdiction Aggregate Metrics*: KPI widgets for Total Incidents, Active Critical Alerts, Regional SLA Compliance %, Mean Response Time (sec), Hospitals on Diversion, and Blood Units Fulfilled.
     - *Cross-Hospital Capacity Matrix*: Aggregated status table showing diversion status, available beds, and open issues per hospital.
     - *Immutable Audit Trail Viewer*: Chronological log of all system routing, acknowledgments, and overrides.

5. **API Client & Mock Stubs (`frontend/src/api/client.ts`)**:
   - Centralized Axios/fetch wrapper with typed interfaces matching the Backend contract.
   - Toggleable `NEXT_PUBLIC_USE_MOCK_API=true` for standalone client development without requiring a live backend.

---

### Sub-Agent B — Backend / API Specification

#### Objective:
Extend the FastAPI application with clean, modular routers in `lifeline/routes/` for authentication, donor management, resource requests, patient tracking, issue resolution, bed reservations, transfers, and AI-generated reporting, preserving full backwards compatibility with `POST /dispatch`.

#### Router Directory Structure:
```
lifeline/
├── main.py                     # Main FastAPI app & router registrations
├── routes/
│   ├── __init__.py
│   ├── auth.py                 # POST /auth/login, GET /auth/me
│   ├── donors.py               # POST /donors, GET /donors, GET /donors/{id}
│   ├── requests.py             # POST /requests, GET /requests, POST /requests/{id}/respond
│   ├── patients.py             # GET /patients, GET /patients/{id}, PATCH /patients/{id}
│   ├── issues.py               # GET /issues, POST /issues, PATCH /issues/{id}
│   ├── logistics.py            # POST /beds/{id}/reserve, POST /cases/{id}/transfer
│   ├── inventory.py            # GET /inventory, PATCH /inventory/{id}
│   ├── reports.py              # GET /reports/daily, POST /reports/query
│   └── network.py              # GET /network/overview
```

#### Detailed Endpoint Specifications:

##### 1. `POST /auth/login`
- **Request Body**:
  ```json
  {
    "role": "blood_donor", // "blood_donor" | "hospital_staff" | "government_authority"
    "email": "donor@example.com",
    "password": "demo"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "token": "mock-jwt-token-role-blood_donor",
    "user": {
      "id": "usr_donor_01",
      "role": "blood_donor",
      "name": "Rahul Sharma",
      "email": "donor@example.com",
      "hospital_id": null
    }
  }
  ```

##### 2. `POST /donors` & `GET /donors`
- **POST /donors Request**:
  ```json
  {
    "full_name": "Pooja Patel",
    "phone": "+91 98200 11223",
    "email": "pooja@example.com",
    "blood_group": "O+",
    "is_organ_donor": true,
    "lat": 19.0178,
    "lng": 72.8478,
    "address": "Dadar, Mumbai"
  }
  ```
- **GET /donors Query Params**: `blood_group`, `status`, `lat`, `lng`, `radius_km`.

##### 3. `POST /requests` & `GET /requests` & `POST /requests/{id}/respond`
- **POST /requests Request**:
  ```json
  {
    "hospital_id": "hosp_lilavati",
    "hospital_name": "Lilavati Hospital",
    "patient_name": "Vikram Malhotra",
    "type": "blood", // "blood" | "organ" | "equipment"
    "blood_group_needed": "O-",
    "units_requested": 3,
    "urgency": "STAT_CRITICAL", // "STAT_CRITICAL" | "URGENT" | "STANDARD"
    "clinical_indication": "Emergency massive transfusion protocol - splenic rupture"
  }
  ```
- **POST /requests/{id}/respond Request**:
  ```json
  {
    "donor_id": "usr_donor_01",
    "response": "accepted", // "accepted" | "declined" | "en_route" | "arrived"
    "eta_minutes": 15
  }
  ```

##### 4. `GET /patients` & `PATCH /patients/{id}`
- **PATCH /patients/{id} Request**:
  ```json
  {
    "status": "admitted", // "inbound" | "admitted" | "in_treatment" | "transferred" | "discharged"
    "bed_id": "bay_resus_02",
    "clinical_notes": "Patient stabilized in trauma bay 2. Transfusion ongoing."
  }
  ```

##### 5. `GET /issues` & `POST /issues` & `PATCH /issues/{id}`
- **POST /issues Request**:
  ```json
  {
    "hospital_id": "hosp_kem",
    "hospital_name": "KEM Hospital",
    "title": "CT Scanner Unit 2 Calibration Error",
    "category": "equipment", // "equipment" | "staffing" | "facility" | "supply"
    "priority": "high", // "critical" | "high" | "medium" | "low"
    "description": "CT scanner in radiology wing throwing error code 402."
  }
  ```

##### 6. `POST /beds/{id}/reserve` & `POST /cases/{id}/transfer`
- **POST /beds/{id}/reserve Request**:
  ```json
  {
    "case_id": "case_9981",
    "hospital_id": "hosp_lilavati",
    "patient_name": "Anil Deshmukh"
  }
  ```
- **POST /cases/{id}/transfer Request**:
  ```json
  {
    "current_hospital_id": "hosp_kem",
    "reason": "Trauma ICU at 100% capacity"
  }
  ```

##### 7. `GET /inventory` & `PATCH /inventory/{id}`
- **PATCH /inventory/{id} Request**:
  ```json
  {
    "quantity_change": 5, // positive for restock, negative for consume
    "action": "restock"
  }
  ```

##### 8. `GET /reports/daily` & `POST /reports/query`
- **GET /reports/daily Response**:
  ```json
  {
    "date": "2026-08-29",
    "summary": "Regional Emergency Network Operating at Moderate Load. Total dispatches: 42. Critical cardiac: 14. Average response time: 8.4 minutes. KEM Hospital experiencing bed strain; 2 cases successfully auto-rerouted.",
    "strain_index": 0.68,
    "key_metrics": {
      "total_incidents": 42,
      "critical_alerts": 14,
      "sla_compliance_pct": 97.2,
      "blood_units_fulfilled": 18
    },
    "recommendations": [
      "Mobilize O- blood donors to Lilavati Hospital Blood Bank",
      "Place KEM Hospital on temporary trauma diversion"
    ],
    "generated_by": "gemini-3.5-flash"
  }
  ```
- **POST /reports/query Request & Response**:
  - Request: `{"query": "What is the average response time for cardiac cases in South Mumbai?"}`
  - Response: `{"query": "...", "answer": "The average response time for cardiac cases in South Mumbai today is 7.8 minutes across 9 incidents.", "supporting_data": [...]}`

##### 9. Existing `POST /dispatch`:
- Preserved exactly as implemented in `lifeline/orchestrator.py`, accepting both nested and flat payload shapes.

---

### Sub-Agent C — Storage / Data Specification

#### Objective:
Define canonical Firestore schemas, implement a universal data-access layer (`lifeline/tools/data_store.py`), build a robust offline in-memory adapter, and provide rich seed scripts (`lifeline/tools/seed_data.py`).

#### Firestore Collection Schemas:

1. **`dispatch_cases` Collection**:
   - `_id`: String (auto-gen / UUID)
   - `_timestamp`: ISO-8601 UTC
   - `_version`: "0.1.0"
   - `case`: `{"patient_age": int, "vitals": dict, "chief_complaint": str, "mechanism_of_injury": str}`
   - `patient_location`: `{"lat": float, "lng": float}`
   - `news2`: `{"score": int, "risk_band": "low" | "medium" | "high"}`
   - `triage`: `{"severity_label": "mild" | "moderate" | "critical", "required_specialty": str, "notes": str}`
   - `bed_match`: `{"chosen_hospital": dict, "reasoning": str, "alternatives": list}`
   - `routing`: `{"eta_minutes": float, "distance_km": float, "route_summary": str}`
   - `briefing`: `{"pre_arrival_brief": str}`

2. **`donors` Collection**:
   - `id`: `usr_donor_<num>`
   - `full_name`: String
   - `phone`: String
   - `email`: String
   - `blood_group`: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-"
   - `is_organ_donor`: Boolean
   - `donor_category`: "Blood" | "Organ" | "Dual"
   - `lat`: Float
   - `lng`: Float
   - `address`: String
   - `status`: "available" | "in_transit" | "standby" | "cooldown"
   - `last_donation_date`: YYYY-MM-DD
   - `eligibility_status`: "eligible" | "deferred"
   - `total_donations`: Integer
   - `badge_title`: String (e.g. "Centurion Lifesaver")
   - `created_at`: ISO-8601 UTC

3. **`requests` Collection**:
   - `id`: `req_<num>`
   - `tracking_number`: `REQ-2026-XXXX`
   - `hospital_id`: String
   - `hospital_name`: String
   - `patient_name`: String
   - `type`: "blood" | "organ" | "equipment"
   - `blood_group_needed`: String | null
   - `units_requested`: Integer
   - `units_fulfilled`: Integer
   - `urgency`: "STAT_CRITICAL" | "URGENT" | "STANDARD"
   - `clinical_indication`: String
   - `status`: "open" | "matched" | "fulfilled" | "cancelled"
   - `matched_donors`: Array of `MatchedDonor` objects
   - `created_at`: ISO-8601 UTC

4. **`issues` Collection**:
   - `id`: `iss_<num>`
   - `hospital_id`: String
   - `hospital_name`: String
   - `title`: String
   - `category`: "equipment" | "staffing" | "facility" | "supply"
   - `priority`: "critical" | "high" | "medium" | "low"
   - `description`: String
   - `status`: "open" | "investigating" | "resolved"
   - `reported_by`: String
   - `created_at`: ISO-8601 UTC
   - `resolved_at`: ISO-8601 UTC | null
   - `resolution_notes`: String | null

5. **`patients` Collection**:
   - `id`: `pat_<num>`
   - `case_id`: String
   - `name`: String
   - `age`: Integer
   - `gender`: String
   - `blood_type`: String
   - `assigned_hospital_id`: String
   - `assigned_bay_id`: String | null
   - `severity`: "critical" | "moderate" | "mild"
   - `status`: "inbound" | "admitted" | "in_treatment" | "transferred" | "discharged"
   - `admitted_at`: ISO-8601 UTC
   - `updated_at`: ISO-8601 UTC

6. **`inventory` Collection**:
   - `id`: `inv_<hospital_id>_<item_slug>`
   - `hospital_id`: String
   - `item_name`: String
   - `category`: "blood" | "medication" | "equipment" | "oxygen"
   - `current_stock`: Integer
   - `min_threshold`: Integer
   - `unit`: String (e.g. "units", "cylinders", "vials")
   - `status`: "optimal" | "low" | "critical"
   - `last_restocked_at`: ISO-8601 UTC

7. **`audit_logs` Collection**:
   - `id`: `log_<uuid>`
   - `timestamp`: ISO-8601 UTC
   - `event_type`: String (e.g. "AUTO_ROUTED", "ACKNOWLEDGED", "BAY_RESERVED", "DONOR_MATCHED")
   - `entity_type`: "dispatch" | "request" | "patient" | "issue" | "inventory"
   - `entity_id`: String
   - `actor`: String
   - `description`: String
   - `metadata`: Dict

#### Universal In-Memory & Offline Storage Adapter (`lifeline/tools/data_store.py`):
```python
# API surface required:
class DataStore:
    def create(collection: str, data: dict, doc_id: str = None) -> str
    def get(collection: str, doc_id: str) -> dict | None
    def update(collection: str, doc_id: str, updates: dict) -> dict
    def list(collection: str, filters: dict = None, order_by: str = None, limit: int = 50) -> list[dict]
    def delete(collection: str, doc_id: str) -> bool
```
- When Firestore is initialized, delegates directly to Google Cloud Firestore client.
- When offline or during local unit tests, writes to a synchronized thread-safe in-memory dictionary.

#### Seed Data Loader (`lifeline/tools/seed_data.py`):
- Invoked via `lifeline seed` or `make seed`.
- Populates 10+ realistic Mumbai hospitals with simulated ICU and trauma beds.
- Populates 15+ blood and organ donors across all blood groups in South and Central Mumbai.
- Populates 5 open requests (e.g. emergency O- blood for trauma at KEM Hospital).
- Populates 4 hospital operational issues.
- Populates complete inventory sets for demo facilities.

---

### Sub-Agent D — Deploy / Infra Specification

#### Objective:
Provide production-ready Docker containerization, Google Cloud Run deployment scripts, environment configuration templates, unified Makefile targets, and Typer CLI commands satisfying all hackathon judging criteria.

#### Key Deliverables:

1. **Production Dockerfile (`deploy/Dockerfile`)**:
   - Base image: `python:3.11-slim`
   - Configured with non-root runtime or container optimization.
   - Installs `uvicorn`, `fastapi`, `google-adk`, `google-genai`, `typer`, etc.
   - Exposes port `8080` (Cloud Run convention).
   - Entrypoint: `uvicorn lifeline.main:app --host 0.0.0.0 --port 8080`

2. **Cloud Run Deployment Script (`deploy/deploy.sh`)**:
   - Authenticates and deploys container to Cloud Run using `gcloud run deploy`.
   - Injects non-secret env vars (`GCP_PROJECT_ID`, `CLOUD_RUN_REGION`, `DEMO_CITY`).
   - Sets container concurrency and memory allocation (1GB RAM, 1 vCPU).

3. **Environment Template (`.env.example`)**:
   ```env
   # ── Gemini / Google AI ────────────────────────────────────────────────────────
   GEMINI_API_KEY=your-gemini-api-key-here

   # ── GCP / Firebase Project ───────────────────────────────────────────────────
   GCP_PROJECT_ID=lifeline-3725b
   CLOUD_RUN_REGION=us-central1
   FIREBASE_PROJECT_ID=lifeline-3725b
   FIREBASE_AUTH_DOMAIN=lifeline-3725b.firebaseapp.com
   FIREBASE_STORAGE_BUCKET=lifeline-3725b.firebasestorage.app
   FIREBASE_MESSAGING_SENDER_ID=413566367910
   FIREBASE_APP_ID=1:413566367910:web:602159713b9c7f2b5cdc67
   FIREBASE_MEASUREMENT_ID=G-4WFE47EYLS

   # ── App & Storage Config ──────────────────────────────────────────────────────
   FIRESTORE_COLLECTION=dispatch_cases
   DEMO_CITY=mumbai
   MOCK_LLM_MODE=false
   DEMO_AUTH_MODE=true
   CORS_ORIGINS=*
   ```

4. **Makefile Commands (`Makefile`)**:
   - `make install`: `pip install -e ".[dev]"`
   - `make admin`: `lifeline admin`
   - `make ui`: `lifeline ui`
   - `make run`: `lifeline run --reload`
   - `make fetch`: `lifeline fetch-hospitals --city mumbai`
   - `make seed`: `lifeline seed`
   - `make data`: `fetch + seed`
   - `make test`: `pytest tests/ -v --cov=lifeline`
   - `make test-fast`: `pytest tests/ -x -q`
   - `make lint`: `ruff check lifeline/ admin/ tests/`
   - `make format`: `ruff format lifeline/ admin/ tests/`
   - `make docker-build`: `docker build -f deploy/Dockerfile -t lifeline-agent:latest .`
   - `make docker-run`: `docker run --rm -p 8000:8080 --env-file .env lifeline-agent:latest`
   - `make deploy`: Cloud Run build and deploy sequence.

5. **Typer CLI (`lifeline/cli.py`) Operations**:
   - Ensure all verbs are implemented with rich terminal output:
     * `lifeline version`: display version (0.1.0) and runtime info.
     * `lifeline init`: setup wizard (checks dependencies, API keys, test suite).
     * `lifeline status`: live health dashboard showing Gemini API status, Firestore connection, hospital count, and seeded records.
     * `lifeline run [--port 8000] [--reload]`: start FastAPI backend.
     * `lifeline ui`: launch user frontend.
     * `lifeline dispatch`: execute interactive or preset emergency dispatch from terminal.
     * `lifeline logs [--limit 20]`: tail recent Firestore audit records.
     * `lifeline seed`: populate database with mock donors, requests, issues, and patients.
     * `lifeline fetch-hospitals [--city mumbai]`: download real hospitals via OpenStreetMap Overpass API.
     * `lifeline admin`: superadmin credential management panel.
     * `lifeline test`: execute test suite.
     * `lifeline report [--date today]`: generate and display the Gemini 3.5-flash daily regional report in the terminal.

---

## 4. Verification & Testing Strategy

Each workstream includes explicit, independent verification methods:
1. **Frontend (Sub-Agent A)**:
   - Verify role switching in `/login` updates `AuthContext` state.
   - Verify UI components render without runtime errors in mock mode (`NEXT_PUBLIC_USE_MOCK_API=true`).
2. **Backend / API (Sub-Agent B)**:
   - Execute `pytest tests/test_api_endpoints.py` testing all new routes with `TestClient(app)`.
   - Verify HTTP 200/201 and valid JSON response schemas matching Pydantic models.
3. **Storage / Data (Sub-Agent C)**:
   - Run `lifeline seed` and verify `DataStore` returns expected records in memory and Firestore.
   - Execute `pytest tests/test_data_store.py` verifying CRUD operations and audit trail writes.
4. **Deploy / Infra (Sub-Agent D)**:
   - Run `lifeline status` to confirm healthcheck dashboard.
   - Run `make lint` and `make test` to ensure 100% clean codebase.
   - Validate `deploy/Dockerfile` build with `make docker-build`.
