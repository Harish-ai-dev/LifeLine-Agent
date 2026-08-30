# LifeLine Agent — Comprehensive Codebase Analysis & Architecture Survey

**Explorer**: `explorer_1`  
**Timestamp**: `2026-08-29T16:30:00Z`  
**Workspace Root**: `c:\Users\shado\Documents\GitHub\ LifeLine Agent`  
**Status**: Complete  

---

## 1. Executive Summary

LifeLine Agent is an autonomous emergency medical dispatch and hospital bed matching system built for the **All Things Agentic Hackathon (The Taskmaster track)**. The codebase currently contains a fully functional, verified 2-agent MVP pipeline (Triage Agent + Bed-Matching Agent, plus stretch Routing and Briefing agents) that takes patient vitals, computes a deterministic clinical NEWS2 score, reasons over clinical indicators using Google Gemini (via Google ADK), enriches candidate hospitals using OpenStreetMap / OSRM routing, and writes immutable audit logs to Google Cloud Firestore.

The current project phase expands this core pipeline into a comprehensive multi-role healthcare emergency platform supporting three distinct roles:
1. **Blood / Organ Donor Network** (`blood_donor`)
2. **Hospital Operations Console** (`hospital_staff`)
3. **Regional Government Authority Deck** (`government_authority`)

This survey provides the structural blueprint, boundary mapping, and risk analysis required for the 4 parallel sub-agents (Frontend, Backend/API, Storage/Data, Deploy/Infra) to execute without breaking the working MVP pipeline or causing merge collisions.

---

## 2. Codebase Inventory & Component Layout

```
LifeLine Agent/
├── .agents/                      # Teamwork agent metadata & briefing logs
├── admin/                        # Super Admin panel & AES-256 config encryption
│   ├── __init__.py
│   ├── auth.py                   # Firebase Auth REST + Admin SDK verification
│   ├── config_manager.py         # Hardware-bound AES-256 Fernet encrypted config
│   └── superadmin.py             # Streamlit admin interface for key management
├── data/                         # Persistent & seed dataset files
│   ├── demo_cases.json           # 5 preset emergency scenarios
│   ├── hospitals.json            # Enriched hospital dataset with beds/specialties (seeded)
│   └── hospitals_raw.json        # Raw OpenStreetMap Overpass pull
├── deploy/                       # Infrastructure & container configs
│   ├── Dockerfile                # Container definition for Cloud Run
│   └── deploy.sh                 # Cloud Run deployment script
├── docs/                         # Root documentation & architecture diagrams
│   └── architecture.jpg          # System flow diagram
├── frontend/                     # Next.js 14 / React 18 / TypeScript Web Application
│   ├── package.json              # Next.js 14, React 18, Leaflet, Recharts, TailwindCSS
│   ├── src/
│   │   ├── app/                  # Next.js App Router (layout.tsx, page.tsx, globals.css)
│   │   ├── components/           # Role-based UI components (authority, donor, hospital, etc.)
│   │   ├── context/              # DashboardContext.tsx (state management & auto-routing)
│   │   ├── data/                 # mockDashboardData.ts, mockData.ts
│   │   └── types/                # dashboard.ts (comprehensive TypeScript domain types)
├── lifeline/                     # Core Python installable package (`pip install -e .`)
│   ├── __init__.py               # Package metadata (v0.1.0)
│   ├── __main__.py               # CLI entrypoint alias
│   ├── agents/                   # Google ADK LLM Agents
│   │   ├── bed_matching_agent.py # Gemini 3.5 Flash hospital selection & bed filtering
│   │   ├── briefing_agent.py     # Gemini 3.5 Flash pre-arrival clinical briefing
│   │   ├── routing_agent.py      # OSRM road distance & driving duration summary
│   │   └── triage_agent.py       # Gemini 3.1 Pro clinical reasoning grounded in NEWS2
│   ├── async_utils.py            # Event loop safe coroutine executor (Thread pool runner)
│   ├── cli.py                    # Typer + Rich CLI (`lifeline` command)
│   ├── firebase.py               # Firebase Admin SDK bootstrap & singleton DB provider
│   ├── main.py                   # FastAPI application (`/health`, `/dispatch`)
│   ├── models.py                 # Single source of truth for Gemini model strings
│   ├── orchestrator.py           # Pipeline sequencer (`run_dispatch`)
│   ├── schemas.py                # Shared Pydantic data schemas (contracts)
│   └── tools/                    # Deterministic calculations & external APIs
│       ├── firestore_client.py   # Firestore audit logging (`dispatch_cases`)
│       ├── news2.py              # Pure-function Royal College of Physicians NEWS2 formula
│       ├── places_api.py         # OpenStreetMap Overpass API client
│       └── routes_api.py         # OSRM routing engine client
├── my-agent/                     # Original design documentation & decision records
│   ├── README.md
│   ├── ROADMAP.md
│   ├── docs/                     # Source-of-truth docs (01 to 08)
│   └── reports/                  # Iteration reports & test logs
├── scripts/                      # Utility and setup scripts
│   ├── fetch_hospitals.py        # OSM Overpass fetcher
│   ├── seed_mock_data.py         # Hospital bed & specialty simulation generator
│   └── store_firebase_config.py  # Interactive encrypted config builder
├── tests/                        # Pytest suite
│   ├── test_bed_matching_agent.py
│   ├── test_news2.py
│   ├── test_routing_and_briefing.py
│   └── test_triage_agent.py
├── pyproject.toml                # Hatchling build configuration & dependencies
├── requirements.txt              # `-e ".[dev]"`
├── Makefile                      # Standard operational tasks
├── start.py                      # Multi-process orchestrator (FastAPI + Next.js)
└── start.bat                     # Windows concurrent launcher (`start /B`)
```

---

## 3. Deep Dive: Working Triage -> Bed-Matching Pipeline

### 3.1 Data Flow and Sequence
The emergency dispatch workflow executes sequentially through `lifeline.orchestrator.run_dispatch(case: Case, patient_location: Location)`:

```
[Inbound Case JSON] 
         │
         ▼
1. [NEWS2 Tool] ────────────> Computes clinical score (0–20) & risk band (low, medium, high)
         │                    (Pure Python, zero hallucination, Royal College of Physicians standard)
         ▼
2. [Triage Agent] ──────────> ADK LlmAgent (Gemini 3.1 Pro / fallback rule engine)
         │                    Classifies severity ('mild', 'moderate', 'critical') & specialty
         ▼
3. [Hospital Enrichment] ───> Reads candidate facilities from `data/hospitals.json`, calculates
         │                    Haversine distances, queries OSRM for live driving duration/route
         ▼
4. [Bed-Matching Agent] ────> ADK LlmAgent (Gemini 3.5 Flash / fallback closest capable)
         │                    Matches ICU/trauma bed availability against triage severity
         ▼
5. [Routing Agent] ─────────> Computes turn-by-turn driving summary & exact road distance
         │
         ▼
6. [Briefing Agent] ────────> ADK LlmAgent (Gemini 3.5 Flash)
         │                    Synthesizes SBAR resuscitation pre-arrival briefing for ER team
         ▼
7. [Firestore Audit] ───────> `write_audit_record()` persists full immutable record with timestamp
         │
         ▼
[Consolidated Dispatch Response Payload]
```

### 3.2 Key Schemas (`lifeline/schemas.py`)
- `Vitals`: `heart_rate: int`, `respiratory_rate: int`, `systolic_bp: int`, `spo2: int`, `temperature_c: float`, `consciousness: Literal["alert", "confused", "unresponsive"]`
- `News2Result`: `score: int` (0-20), `risk_band: Literal["low", "medium", "high"]`
- `Case`: `patient_age: int`, `vitals: Vitals`, `chief_complaint: str`, `mechanism_of_injury: Optional[str]`
- `TriageInput`: extends `Case` with `news2_score: News2Result`
- `TriageOutput`: `severity_label: Literal["mild", "moderate", "critical"]`, `required_specialty: str`, `notes: str`
- `BedMatchingOutput`: `chosen_hospital: HospitalChoice(name, lat, lng, distance_km, eta_minutes)`, `reasoning: str`, `alternatives: list[AlternativeHospital]`
- `RoutingOutput`: `eta_minutes: float`, `distance_km: float`, `route_summary: str`
- `BriefingOutput`: `pre_arrival_brief: str`
- `Location`: `lat: float`, `lng: float`

### 3.3 Reliability & Deterministic Fallbacks
All agents in `lifeline/agents/` are designed with **graceful deterministic fallbacks**:
- If Google GenAI API credentials are not present or network calls fail, `triage_agent.py` evaluates clinical rules based on NEWS2 thresholds (`score >= 7` -> critical, `score >= 5` -> moderate, keyword matching for cardiac/trauma).
- `bed_matching_agent.py` selects the nearest hospital with available beds via Haversine distance and OSRM routing.
- `briefing_agent.py` constructs a formatted clinical SBAR summary string.
- `firestore_client.py` logs locally with mock ID `local_<uuid>` if Firestore is offline.
- `async_utils.py` uses `ThreadPoolExecutor` with a dedicated event loop to ensure ADK synchronous runner calls execute safely inside FastAPI's async event loop.

---

## 4. Test Suite Analysis (`tests/`)

The test suite consists of 4 test modules with 10 unit tests:
1. `test_news2.py`:
   - `test_mild_case_low_score`: Validates low score (≤4) for normal vitals.
   - `test_critical_cardiac_high_score`: Validates high score (≥7) for cardiac distress vitals.
   - `test_critical_trauma_high_score`: Validates high score (≥7) for trauma/shock vitals.
2. `test_triage_agent.py`:
   - `test_triage_prompt_builder`: Verifies prompt formatting includes vitals, score, and complaints.
   - `test_triage_output_schema`: Validates `TriageOutput` Pydantic model serialization.
3. `test_bed_matching_agent.py`:
   - `test_haversine_distance`: Verifies distance formula precision between Mumbai coordinates.
   - `test_get_enriched_hospitals`: Verifies hospital enrichment and fallback handling.
   - `test_bed_matching_output_schema`: Validates `BedMatchingOutput` schema.
4. `test_routing_and_briefing.py`:
   - `test_routing_agent`: Verifies `run_routing` returns valid `RoutingOutput`.
   - `test_briefing_prompt_builder`: Verifies `_build_briefing_prompt` includes hospital, triage, and complaint data.

**Key Observation**: The test suite runs in under 1 second without network dependencies and without requiring live Gemini API keys. All proposed changes must preserve this test suite without breaking changes.

---

## 5. Extension Boundaries & Parallel Workstream Isolation

To enable 4 sub-agents to develop simultaneously without file collisions, boundaries are strictly mapped as follows:

| Workstream | Sub-Agent | Owned Files & Directories | Read-Only Dependencies |
|---|---|---|---|
| **A: Frontend** | `frontend_1` | `frontend/src/app/`, `frontend/src/components/`, `frontend/src/context/`, `frontend/src/types/`, `frontend/package.json` | `docs/09-parallel-build-contract.md` |
| **B: Backend / API** | `backend_1` | `lifeline/main.py`, `lifeline/routes/` (new), `lifeline/agents/` (new agents e.g. report generator) | `lifeline/schemas.py`, `lifeline/tools/`, `docs/09-parallel-build-contract.md` |
| **C: Storage / Data** | `storage_1` | `lifeline/tools/*_client.py`, `scripts/seed_mock_data.py`, `data/` | `lifeline/firebase.py`, `docs/09-parallel-build-contract.md` |
| **D: Deploy / Infra** | `deploy_1` | `deploy/Dockerfile`, `deploy/deploy.sh`, `Makefile`, `start.py`, `README.md`, `pyproject.toml` | `docs/09-parallel-build-contract.md` |

### 5.1 Route Attachment Boundary (Backend API)
- `lifeline/main.py` currently mounts CORS and defines `/health` and `POST /dispatch`.
- New capabilities should be implemented as modular `APIRouter` instances in `lifeline/routes/`:
  - `lifeline/routes/auth.py` (`POST /auth/login`, `GET /auth/me`)
  - `lifeline/routes/donors.py` (`GET /donors`, `POST /donors`, `GET /donors/{id}`)
  - `lifeline/routes/requests.py` (`GET /requests`, `POST /requests`, `POST /requests/{id}/respond`, `PATCH /requests/{id}`)
  - `lifeline/routes/patients.py` (`GET /patients`, `PATCH /patients/{id}`)
  - `lifeline/routes/issues.py` (`GET /issues`, `POST /issues`, `PATCH /issues/{id}`)
  - `lifeline/routes/transfers.py` (`POST /cases/{id}/transfer`, `POST /sos`)
  - `lifeline/routes/reports.py` (`GET /reports/daily`, `POST /reports/query`, `GET /network/overview`)
- In `lifeline/main.py`, include routers via `app.include_router(...)`.
- The existing `/dispatch` handler and `lifeline.orchestrator` must remain unchanged.

### 5.2 Storage Layer Boundary (Firestore & Data Access)
- Firestore collections to establish:
  - `dispatch_cases` (existing)
  - `donors`
  - `donor_requests`
  - `patients`
  - `hospital_issues`
  - `jurisdiction_reports`
- Every collection write must include:
  - `_timestamp`: ISO 8601 UTC string
  - `_version`: `"0.1.0"`
  - Document ID returned upon write
- Create clean data-access helpers in `lifeline/tools/` (e.g. `donors_client.py`, `requests_client.py`, etc.) providing methods like `create_donor_request(...)`, `list_open_requests(...)`, `resolve_issue(...)` so route handlers avoid writing raw Firestore queries.

### 5.3 Frontend Role View Boundary (Next.js / React)
- Frontend is located in `frontend/` using Next.js 14 App Router.
- Existing components in `frontend/src/components/`:
  - `donor/DonorPortal.tsx`, `DonorNavigationMap.tsx`, `DonorRegistrationModal.tsx`
  - `hospital/HospitalDashboard.tsx`, `LiveAlertQueue.tsx`, `CapacityManager.tsx`, `HospitalBloodBank.tsx`, `HospitalAuditLog.tsx`
  - `authority/AuthorityDashboard.tsx`, `JurisdictionMap.tsx`, `JurisdictionAuditLog.tsx`, `RegionalBloodNetwork.tsx`, `Tier2EscalationCenter.tsx`, `ComplianceReports.tsx`
- Attach mock authentication state in `frontend/src/context/` to support demo login (`blood_donor`, `hospital_staff`, `government_authority`).
- Ensure API integration client is typed to match `docs/09-parallel-build-contract.md`.

---

## 6. Technical Debt, Latent Bugs & Implementation Guardrails

1. **`deploy/Dockerfile` Uvicorn Module Bug**:
   - `deploy/Dockerfile:10` specifies `CMD ["uvicorn", "src.main:app", ...]` which fails because the package is `lifeline`, not `src`.
   - **Fix Required**: Update to `CMD ["uvicorn", "lifeline.main:app", "--host", "0.0.0.0", "--port", "8080"]`.
2. **`lifeline/cli.py` Streamlit UI Path**:
   - `lifeline/cli.py:413` expects `ui/streamlit_app.py`, which is absent. The active UI is the Next.js app in `frontend/` (or Streamlit admin in `admin/superadmin.py`).
   - **Fix Required**: Align CLI `ui` command with `start.py` Next.js frontend runner.
3. **Doc Directory Invariant**:
   - Master docs currently reside in `my-agent/docs/` while `ORIGINAL_REQUEST.md` expects `docs/09-parallel-build-contract.md`.
   - **Action**: Place `docs/09-parallel-build-contract.md` in root `docs/` and mirror updates to `my-agent/docs/` to satisfy all tooling and references.
4. **Hackathon Compliance Invariants**:
   - **Model Strings**: Maintain `gemini-3.1-pro` for Triage Agent and `gemini-3.5-flash` for all other agents (including new report generation agent) per `docs/03-decision-log.md`.
   - **Google ADK & Genkit**: Used for agent orchestration and prompt flows.
   - **Cloud Run + Firestore**: Satisfies Google Cloud infrastructure requirements.

---

## 7. Next Steps for Parallel Execution

1. Orchestrator authors and locks `docs/09-parallel-build-contract.md`, updating `docs/03-decision-log.md` and `docs/07-scope-lock.md`.
2. Launch 4 parallel workstreams:
   - **Frontend sub-agent**: Build login gating, role views, and API client against the contract.
   - **Backend sub-agent**: Implement FastAPI route handlers and Gemini 3.5 Flash daily report agent.
   - **Storage sub-agent**: Implement Firestore client access functions, schemas, and seeding scripts.
   - **Deploy sub-agent**: Fix Dockerfile, update environment documentation, Makefile, and README.
3. Integrate and verify with full test coverage.
