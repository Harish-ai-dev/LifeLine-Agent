# LifeLine Agent — Authoritative Specification & Verification Master Report (Phase 1)

> **Document Type**: Source-of-Truth Specification Mining & Requirements Inventory  
> **Status**: APPROVED FOR SCANNER & REMEDIATION WORKSTREAMS  
> **Target System**: LifeLine Agent (Autonomous Emergency Healthcare Coordination Platform)  
> **Working Directory**: `c:\Users\shado\Documents\GitHub\ LifeLine Agent\.agents\spec_miner_scan_1`  
> **Authority Level**: Authoritative / Derived from `docs/` Baseline & Codebase Verification  

---

## 1. Executive Summary & Source of Truth Inventory

LifeLine Agent is an autonomous, multi-agent emergency healthcare triage, bed matching, routing, and donor dispatch platform built on the **Google Agent Development Kit (ADK)** and **Gemini** models.

This specification report establishes the definitive technical contracts, design tokens, responsive layout rules, data binding invariants, security/privacy constraints, severity classifications, and verification checklists governing the full application scan (Phase 1) and subsequent remediation (Phase 2).

### 1.1. Authoritative Source Documents

| Source Document | Path | Key Authority Area |
|---|---|---|
| **System Architecture** | `docs/01-architecture.md` | Multi-agent sequential pipeline, deterministic tools, Firestore audit trail |
| **Decision Log** | `docs/03-decision-log.md` | Non-negotiable architectural choices, model registry (`gemini-3.1-pro`, `gemini-3.5-flash`), zero-re-litigation lock |
| **Agent Contracts** | `docs/04-agent-contracts.md` | Exact JSON I/O schemas for Triage, Bed-Matching, Routing, Briefing, and Firestore records |
| **Scope Lock** | `docs/07-scope-lock.md` | Locked features (In-Scope vs. Stretch vs. Out-of-Scope), scope governance rules |
| **Parallel Build Contract** | `docs/09-parallel-build-contract.md` | REST API endpoints (all 18+), error formats, Firestore collection schemas, role definitions, env configs |
| **Verification Report** | `docs/10-verification-report.md` | Verified test suite execution (89 passed tests), 5 demo scenario outputs, benchmark criteria |
| **Original Request** | `.agents/ORIGINAL_REQUEST.md` | Multi-role portal scanning, 5 viewport breakpoints (375, 768, 1024, 1440, 1920px), P0/P1/P2 severity rubric |
| **Agent Architecture Guidelines** | `AGENTS.md` | Packaging standards, Typer CLI, AES-256 secret security, Windows UTF-8 invariants (`sys.stdout.reconfigure`), multi-agent Pydantic contracts |

---

## 2. Architectural & Multi-Agent Contracts

### 2.1. Multi-Agent Pipeline Pattern (ADK Sequential Agent)

```
                       [Incoming Case Payload]
                                  │
                                  ▼
                     [Deterministic NEWS2 Engine]
                       (Royal College of Physicians)
                                  │
        ┌─────────────────────────┴─────────────────────────┐
        ▼                                                   ▼
[Triage Agent]                                     [Bed-Matching Agent]
Model: gemini-3.1-pro                              Model: gemini-3.5-flash
Output: severity_label, required_specialty, notes  Output: chosen_hospital, reasoning, alternatives
        │                                                   │
        └─────────────────────────┬─────────────────────────┘
                                  ▼
                           [Routing Agent]
                       Model: gemini-3.5-flash / OSRM
                       Output: eta_minutes, distance_km, route_summary
                                  │
                                  ▼
                          [Briefing Agent]
                       Model: gemini-3.5-flash
                       Output: pre_arrival_brief (SBAR format)
                                  │
                                  ▼
                 [Firestore Audit & Operational Log]
                  Collection: dispatch_cases, patients
```

### 2.2. Agent Role & Model Allocation

| Agent Name | Model Assigned | Source File | Core Responsibility |
|---|---|---|---|
| **NEWS2 Engine** | Deterministic Python (No LLM) | `lifeline/tools/news2.py` | Calculates Royal College of Physicians NEWS2 score (0-20) and risk band (`low`, `medium`, `high`). |
| **Triage Agent** | `gemini-3.1-pro` | `lifeline/agents/triage_agent.py` | Evaluates patient vitals + calculated NEWS2 score + chief complaint; outputs clinical severity and specialty. |
| **Bed-Matching Agent** | `gemini-3.5-flash` | `lifeline/agents/bed_matching_agent.py` | Matches patient specialty, filters facilities by available ICU/general beds, uses OSRM for live distance/ETA, ranks facilities. |
| **Routing Agent** | `gemini-3.5-flash` / OSRM | `lifeline/agents/routing_agent.py` | Determines optimal driving route, distance in km, and travel duration in minutes. |
| **Briefing Agent** | `gemini-3.5-flash` | `lifeline/agents/briefing_agent.py` | Formats a concise SBAR (Situation, Background, Assessment, Recommendation) pre-arrival handoff note for ER staff. |
| **Reporting Agent** | `gemini-3.5-flash` | `lifeline/agents/reporting_agent.py` | Generates daily executive intelligence summaries (`/reports/daily`) and answers natural-language queries (`/reports/query`). |
| **Supervisor Co-Pilot** | `gemini-2.5-flash` / `gemini-3.5-flash` | `lifeline/routes/chat.py` | Role-tailored streaming assistant (`/chat`) for Hospital Clinicians, Blood Donors, and Health Authority executives. |

---

## 3. Canonical REST API Surface & Data Schemas

### 3.1. Standard Error Envelope
All error responses adhere strictly to the JSON contract:
```json
{
  "detail": "Descriptive human-readable error explanation",
  "code": "ERROR_CODE_UPPERCASE_STRING"
}
```

### 3.2. REST Endpoint Inventory

| # | HTTP Verb | Path | Request Schema | Response Schema | Success Code | Error Codes |
|---|---|---|---|---|---|---|
| 1 | `GET` | `/health` | None | `{"status":"ok", "service":"lifeline-agent", "version":"0.1.0"}` | 200 | 500 |
| 2 | `POST` | `/auth/login` | `AuthLoginRequest` (username, role, facility_id?) | `AuthLoginResponse` (token, user profile) | 200 | 400 |
| 3 | `GET` | `/auth/me` | Header `Authorization: Bearer <token>` | `AuthUser` profile object | 200 | 401 |
| 4 | `POST` | `/donors` | `DonorCreateRequest` | `DonorSummary` | 201 | 400 |
| 5 | `GET` | `/donors/{id}` | Path `id` | `DonorDetail` (with `donation_history[]`) | 200 | 404 |
| 6 | `GET` | `/requests` | Query: `status`, `type`, `blood_group` | `ResourceRequestsResponse` (`requests[]`) | 200 | 400 |
| 7 | `POST` | `/requests` | `ResourceRequestCreate` | `ResourceRequestItem` | 201 | 400 |
| 8 | `POST` | `/requests/{id}/respond` | `RequestRespondPayload` (donor_id, response_status, travel_mode, eta_minutes) | `RequestRespondResponse` | 200 | 404, 409 |
| 9 | `GET` | `/patients` | Query: `hospital_id`, `status` | `PatientsResponse` (`patients[]`) | 200 | 400 |
| 10 | `PATCH` | `/patients/{id}` | `PatientUpdateRequest` (admission_status, bed_number, notes) | `PatientRecord` | 200 | 404 |
| 11 | `POST` | `/beds/{id}/reserve` | `BedReserveRequest` (patient_id, bed_type, bay_id, action) | `BedReserveResponse` | 200 | 400, 404 |
| 12 | `POST` | `/cases/{id}/transfer` | `TransferRequest` (current_hospital_id, reason, patient_location) | `TransferResponse` (transferred_to_hospital, reasoning, audit_id) | 200 | 400, 404 |
| 13 | `GET` | `/issues` | Query: `hospital_id`, `category`, `status` | `IssuesResponse` (`issues[]`) | 200 | 400 |
| 14 | `POST` | `/issues` | `IssueCreateRequest` | `IssueRecord` | 201 | 400 |
| 15 | `PATCH` | `/issues/{id}` | `IssueUpdateRequest` (status, severity, notes) | `IssueRecord` | 200 | 404 |
| 16 | `GET` | `/inventory` | Query: `hospital_id`, `category`, `low_stock_only` | `InventoryResponse` (`inventory[]`) | 200 | 400 |
| 17 | `PATCH` | `/inventory/{id}` | `InventoryUpdateRequest` (current_stock, minimum_threshold) | `InventoryItemRecord` | 200 | 404 |
| 18 | `GET` | `/network/overview` | None | `NetworkOverviewResponse` (telemetry, strain, summaries) | 200 | 500 |
| 19 | `GET` | `/reports/daily` | None | `DailyReportResponse` (AI markdown briefing + metrics) | 200 | 500 |
| 20 | `POST` | `/reports/query` | `ReportQueryRequest` (query) | `ReportQueryResponse` (answer, referenced_facilities[]) | 200 | 400 |
| 21 | `POST` | `/dispatch` | `DispatchRequest` or flat case payload | Full multi-agent dispatch trace JSON | 200 | 400 |
| 22 | `POST` | `/sos` | `DispatchRequest` or flat case payload | Multi-agent dispatch trace + created patient record | 200 | 400 |
| 23 | `POST` | `/chat` | `ChatRequest` (messages[], context) | SSE Streaming Text (`text/event-stream`) | 200 | 400, 500 |

### 3.3. Firestore Collections Schema Invariant
The system utilizes a Universal Firestore Client (`lifeline/firebase.py` & `lifeline/tools/data_store.py`) managing 7 core collections:
1. `dispatch_cases` (Emergency cases, vitals, multi-agent reasoning, audit trails)
2. `donors` (Citizen profiles, blood group, organ pledge, active transit matches, donation history)
3. `requests` (STAT emergency blood and organ callout requests)
4. `patients` (Inbound emergency dossiers, bay reservations, bed allocations)
5. `issues` (Operational, medical equipment, and facility breakdown logs)
6. `inventory` (Blood units, pharmaceuticals, trauma supplies, low-stock flags)
7. `reports` (Daily AI intelligence summaries and natural language query logs)

---

## 4. UI/UX Specifications, Design Tokens, & Styling Contract

### 4.1. Color System & Dark/Light Mode Contract

The application supports seamless Light and Dark modes. Light mode is the default root theme (`:root`).

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           COLOR SYSTEM TOKENS                             │
├───────────────────┬───────────────────────────┬───────────────────────────┤
│ Token Family      │ Light Mode Hex / Classes  │ Dark Mode Hex / Classes   │
├───────────────────┼───────────────────────────┼───────────────────────────┤
│ Background Root   │ #f8fafc (`bg-slate-50`)   │ #080c14 (`bg-[#080c14]`)  │
│ Text Foreground   │ #0f172a (`text-slate-900`)│ #f1f5f9 (`text-slate-100`)│
│ Panel / Card Base │ #ffffff (`glass-panel`)   │ #0d1424 (`glass-panel`)   │
│ Panel Borders     │ #e2e8f0 (`border-slate-200`)│ #1e293b (`border-slate-800`)│
│ Alert (Red/Coral) │ alert-500: #ef4444        │ alert-500: #ef4444        │
│                   │ alert-50:  #fef2f2        │ alert-950: #450a0a        │
│ Medical (Teal)    │ medical-500: #14b8a6      │ medical-500: #14b8a6      │
│                   │ medical-50:  #f0fdfa      │ medical-900: #134e4a      │
│ Navy Clinical     │ navy-800: #0f2942         │ navy-950: #061320         │
│ Focus Ring        │ #0284c7 (Sky-600)         │ #0284c7 (Sky-600)         │
└───────────────────┴───────────────────────────┴───────────────────────────┘
```

#### Panel Variants:
- `.glass-panel`: Standard hospital workstation card with soft border.
- `.glass-panel-glow-red`: High-urgency alert card with 3px red top border (`#ef4444`).
- `.glass-panel-glow-blue`: Informational/telemetry card with 3px blue top border (`#0284c7`).
- `.glass-panel-glow-amber`: Warning/pending card with 3px amber top border (`#f59e0b`).
- `.glass-panel-glow-emerald`: Stabilized/success card with 3px emerald top border (`#10b981`).

### 4.2. Typography & Font Stacks
- **Interface Body**: `'Inter', 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Code & Diagnostics**: `'JetBrains Mono', Menlo, monospace`
- **Telemetry & Vital Numbers**: `.font-telemetry` (`font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-feature-settings: "tnum" 1;`) ensuring fixed-width numeric column alignment.

### 4.3. Accessibility, Focus, & Animations
- **Focus Rings**: `*:focus-visible { outline: 2px solid #0284c7; outline-offset: 2px; }`
- **Scrollbars**: Width `6px`, Thumb `#cbd5e1` (Light) / `#1e293b` (Dark).
- **Radar & Scanning**: `animate-radar` (4-second linear 360° sweep for radar components).
- **Urgency Pulses**: `animate-pulse-fast` (1.2s), `animate-ping-slow` (2s), `animate-ripple` (2.5s).

---

## 5. Responsive Layout Requirements Across All 5 Viewports

Every page and component must maintain complete usability, clear hierarchy, and zero layout overflow across the 5 standard evaluation breakpoints:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       5-VIEWPORT RESPONSIVE CONTRACT                        │
├───────────────┬───────────────┬─────────────────────────────────────────────┤
│ Breakpoint    │ Width (px)    │ Mandatory Layout & UX Invariants            │
├───────────────┼───────────────┼─────────────────────────────────────────────┤
│ Mobile Small  │ 375px         │ • Single-column vertical stacking           │
│               │ (iPhone SE)   │ • Sidebar collapased into bottom / drawer   │
│               │               │ • Topbar telemetry pill hidden (`hidden lg`)│
│               │               │ • Touch targets minimum 44x44px             │
│               │               │ • Tables transform to cards or scroll-x     │
├───────────────┼───────────────┼─────────────────────────────────────────────┤
│ Tablet Port.  │ 768px         │ • 2-column card grid                        │
│               │ (iPad Mini)   │ • Compact topbar with icon buttons          │
│               │               │ • Modals max-width 90% with safe padding    │
│               │               │ • Map / telemetry panels stack below triage │
├───────────────┼───────────────┼─────────────────────────────────────────────┤
│ Tablet Land.  │ 1024px        │ • Persistent condensed sidebar (64-80px)    │
│               │ (iPad Pro)    │ • 2 to 3-column dashboard grid              │
│               │               │ • Telemetry pill visible in header          │
│               │               │ • Dual-pane view for alerts + details       │
├───────────────┼───────────────┼─────────────────────────────────────────────┤
│ Desktop Std.  │ 1440px        │ • Full sidebar navigation (240-260px)       │
│               │ (MacBook / FHD│ • 3 to 4-column clinical workstation        │
│               │ Workstation)  │ • Side-by-side live queue + dossier + map   │
│               │               │ • Live telemetry charts & SLA sparklines    │
├───────────────┼───────────────┼─────────────────────────────────────────────┤
│ Ultra-Wide    │ 1920px        │ • High-density command center layout        │
│               │ (FHD Monitor /│ • Max content width constraint or balanced  │
│               │ EOC Wall)     │   flex stretch (no awkward empty gaps)      │
│               │               │ • Panoramic multi-panel visualization       │
└───────────────┴───────────────┴─────────────────────────────────────────────┘
```

---

## 6. Data Binding Invariants

1. **Facility Mapping Invariant**:
   - Every facility ID (e.g. `hosp_mumbai_01`) must strictly map to its registered name (*Lilavati Hospital & Research Centre*), address (*Bandra Reclamation*), and GPS coordinate (`19.0522, 72.8336`).
   - Facility switcher dropdown in Topbar must synchronize `activeHospitalId`, dynamically updating bed capacity, active patient dossiers, inventory levels, and operational issues without requiring page refresh.

2. **Telemetry Invariant**:
   - System telemetry displays live ping (e.g. `42ms`), district SLA compliance (`99.8%`), and heartbeat indicator.
   - Values must remain consistent across screens and never display `NaN`, `undefined`, or unformatted decimals.

3. **Donor Invariants & Transit Workflow**:
   - Donor profiles track blood group, organ donation consent, eligibility status (minimum 56 days between donations), and total lifetime donations.
   - When a donor responds `accepted` / `en_route`, donor status switches to `in_transit`.
   - When status reaches `completed`, the system autonomously increments `totalDonations` by +1 and increments hospital blood bank inventory by +1 unit.

4. **NEWS2 Clinical Calculation Invariant**:
   - Deterministic Royal College of Physicians scoring formula: Score `0-4` (Low Risk), `5-6` or single parameter score of 3 (Medium Risk), `7+` (High Risk).
   - Agent prompts must receive the pre-calculated integer score and risk band; LLMs are prohibited from hallucinating raw scores.

5. **Audit Invariant**:
   - All state transitions (`AUTO_ROUTED`, `ACKNOWLEDGED`, `BAY_PREPARED`, `AUTO_BED_RESERVED`, `PATIENT_TRANSFER`, `DONOR_ACCEPTED_TRANSIT`, `AUTO_BLOOD_RESTOCKED`) generate immutable audit records with UTC timestamps, tracking IDs, and actor attribution.

---

## 7. Security, Privacy, & Secret Invariants

1. **Zero Hardcoded Credentials**:
   - No API keys (`GOOGLE_API_KEY`), service account credentials, Firebase admin keys, or auth secrets in client source code, markdown docs, or public git commits.
   - Backend loads secrets via `os.environ` with AES-256 encrypted configuration at rest (`admin/config_manager.py`).

2. **Evaluation Auth Tokens**:
   - Mock bearer token format: `lifeline_mock_<role>_<uid>`.
   - Role guard validation rejects arbitrary strings and restricts access based on persona permissions (`blood_donor`, `hospital_staff`, `government_authority`).
   - Authentication tokens stored in `localStorage` (`lifeline_token`, `lifeline_user`).

3. **Clinical Data Privacy (Simulated Dossiers)**:
   - Real patient PII is prohibited. All patient records use realistic simulated profiles (*Vikram Patel, Pooja Verma, Rahul Sharma*) with synthetic vitals.

---

## 8. Severity Classification Rules & The Golden Rule

### 8.1. Severity Rubric

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SEVERITY CLASSIFICATION RUBRIC                        │
├──────────┬──────────────────────┬───────────────────────────────────────────┤
│ Severity │ Classification       │ Trigger Criteria & Examples               │
├──────────┼──────────────────────┼───────────────────────────────────────────┤
│   P0     │ Critical / Blocker   │ • Exposed API keys, service account JSON  │
│          │                      │ • Broken core auth / cannot login         │
│          │                      │ • Multi-agent dispatch pipeline crash     │
│          │                      │ • Data corruption or database state loss  │
├──────────┼──────────────────────┼───────────────────────────────────────────┤
│   P1     │ High / Demo-Breaking │ • Visible UI bug causing demo embarrassment│
│          │                      │ • Broken responsive layout / clipped text │
│          │                      │ • Overlapping elements or unreadable text │
│          │                      │ • Facility URL / data binding mismatch    │
│          │                      │ • Lingering dark/light mode token clash   │
│          │                      │ • Dead navigation buttons or broken links │
├──────────┼──────────────────────┼───────────────────────────────────────────┤
│   P2     │ Normal / Polish      │ • Minor spacing / padding asymmetry       │
│          │                      │ • Typography hierarchy polish             │
│          │                      │ • Non-critical wording or label nuance    │
│          │                      │ • Micro-animation or transition refinement│
└──────────┴──────────────────────┴───────────────────────────────────────────┘
```

### 8.2. The Golden Rule
> **"If you are about to make a decision not already written in `docs/03-decision-log.md`, stop and add it there first, then code."**

---

## 9. Requirements Inventory & Verification Checklist

### 9.1. Navigation & Route Surface Checklist

- [ ] **Public Landing & Marketing Showcase**
  - [ ] `/` (Marketing Homepage with Hero, Problem/Solution, Agent Roster, Tech Stack, Interactive Simulator preview)
  - [ ] `/web` (Alternate web showcase redirect / view)
  - [ ] `/(marketing)/about` (`/about` — Mission, leadership, open-source principles)
  - [ ] `/(marketing)/agents` (`/agents` — Live interactive multi-agent roster)
  - [ ] `/(marketing)/architecture` (`/architecture` — System diagram, data flow, telemetry)
  - [ ] `/(marketing)/contribute` (`/contribute` — Open-source guidelines, community)
  - [ ] `/(marketing)/docs` (`/docs` — API reference, architecture specs)
  - [ ] `/(marketing)/legal` (`/legal` — Privacy policy, medical disclaimers)
  - [ ] `/(marketing)/provenance` (`/provenance` — Clinical data provenance & standards)
  - [ ] `/(marketing)/simulator` (`/simulator` — Standalone full-screen pipeline simulator)

- [ ] **Authentication Gateway**
  - [ ] `/login` (Portal selector with 4 quick-switch demo personas: Hospital Console, Clinical Staff, Blood Donor, Health Authority)

- [ ] **Hospital ER Operations Console (`hospital_staff`)**
  - [ ] `/hospital` (Live ER Command Dashboard, emergency alert queue, capacity cards, SLA metrics)
  - [ ] `/hospital/facility/[id]` (Facility-specific deep-dive view)
  - [ ] `/hospital/facilities` (Regional hospital directory and capacity strain index)
  - [ ] `/hospital/beds` (Bed & trauma bay manager, ICU reservations, release bay)
  - [ ] `/hospital/blood-bank` (Hospital blood inventory, deficit monitor, donor callout trigger)
  - [ ] `/hospital/requests` (Active blood & organ callout requests list and creation modal)
  - [ ] `/hospital/issues` (Facility & equipment issue logging and status management)
  - [ ] `/hospital/inventory` (Medical supplies, blood units, pharmaceutical stock levels)
  - [ ] `/hospital/patients` (Emergency patient dossiers, vitals, admission status updates)
  - [ ] `/hospital/sos` (STAT emergency intake trigger & ambulance dispatch dispatch)
  - [ ] `/hospital/audit` (Immutable clinical audit log feed)
  - [ ] `/hospital/copilot` (Full-page clinical operations supervisor co-pilot)

- [ ] **Blood & Organ Donor Portal (`blood_donor`)**
  - [ ] `/donor` (Personal donor dashboard, pledge status, live STAT requests feed)
  - [ ] `/donor/profile` (Donor profile dossier, blood group, organ consent registry, eligibility status)
  - [ ] `/donor/requests` (Emergency blood & organ callouts, accept/decline actions, travel mode selection, live ETA)
  - [ ] `/donor/donations` (Historical donation timeline, badge status, units donated)

- [ ] **Regional Health Authority Dashboard (`government_authority`)**
  - [ ] `/government` (Regional overview, district capacity strain index, diversion tracker, macro KPIs)
  - [ ] `/government/network` (Regional hospital grid, bed strain heatmaps, live diversion toggle)
  - [ ] `/government/report` (AI-generated Daily Intelligence Briefing via Gemini 3.5 Flash)
  - [ ] `/government/audit` (Cross-jurisdiction immutable audit logs and SLA compliance)
  - [ ] `/government/ask-ai` (Natural-language data query assistant)
  - [ ] `/government/copilot` (Full-page health authority executive co-pilot)

- [ ] **Air-Gap / Fail-Safe Emergency Console**
  - [ ] `/emergency` (Offline-ready fail-safe emergency intake and protocol checklists)

- [ ] **Modals & Overlays**
  - [ ] Topbar Unified Copilot & Notification overlay (`UnifiedCopilotModal`)
  - [ ] Topbar Facility Switcher Dropdown
  - [ ] Emergency STAT SOS Modal (`FloatingSOS` / `EmergencySimulatorModal`)
  - [ ] Emergency Broadcast Modal (`EmergencyBroadcastModal`)
  - [ ] Bed & Trauma Bay Reservation Modal (`BedReservationModal`)
  - [ ] Donor Request Creation Modal (`DonorRequestModal`)
  - [ ] Donor Registration Modal (`DonorRegistrationModal`)
  - [ ] Donor Dossier Detail Modal (`DonorDetailModal`)
  - [ ] Alert Detail Dossier Modal (`AlertDetailModal`)
  - [ ] Agent Architecture Detail Modal (`AgentDetailModal`)
  - [ ] Command Palette Modal (`CommandPalette` — `Ctrl+K`)

---

## 10. Spec Miner Output Tables

## Features Discovered
| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Multi-Agent Core | Deterministic NEWS2 Calculator | Computes Royal College of Physicians clinical risk score (0-20) from 6 vitals | Heart rate, RR, SBP, SpO2, Temp, Consciousness | Score (int), Risk Band (`low`, `medium`, `high`) | Clamps out-of-range values, logs warning | `lifeline/tools/news2.py`, `01-architecture.md` |
| 2 | Multi-Agent Core | Clinical Triage Agent | Reasons over patient vitals, NEWS2 score, and complaint using `gemini-3.1-pro` | Case vitals, complaint, NEWS2 score | `severity_label`, `required_specialty`, `notes` | Falls back to rule-based triage heuristic if offline | `lifeline/agents/triage_agent.py`, `04-agent-contracts.md` |
| 3 | Multi-Agent Core | Bed-Matching Agent | Matches clinical specialty and filters facilities by ICU/general beds via `gemini-3.5-flash` | Triage output, GPS coordinates, hospital inventory | `chosen_hospital`, `reasoning`, `alternatives[]` | Falls back to nearest facility with positive capacity | `lifeline/agents/bed_matching_agent.py`, `04-agent-contracts.md` |
| 4 | Multi-Agent Core | OSRM Routing Agent | Calculates road distance and driving ETA via OSRM demo server and Gemini 3.5 Flash | Origin GPS, Destination GPS | `eta_minutes`, `distance_km`, `route_summary` | Falls back to Haversine distance * 3.5 min/km | `lifeline/agents/routing_agent.py`, `04-agent-contracts.md` |
| 5 | Multi-Agent Core | SBAR Pre-Arrival Briefing Agent | Generates plain-text SBAR clinical handoff note using `gemini-3.5-flash` | Case history, vitals, triage, chosen facility | `pre_arrival_brief` paragraph string | Generates deterministic template SBAR string | `lifeline/agents/briefing_agent.py`, `04-agent-contracts.md` |
| 6 | Regional AI | AI Daily Intelligence Report | Generates executive daily regional summary via `gemini-3.5-flash` | Regional incident volume, SLA rate, strain metrics | Markdown report headline, summary, key metrics | Returns cached/fallback executive briefing | `lifeline/routes/reports.py`, `09-parallel-build-contract.md` |
| 7 | Regional AI | NL Network Query Assistant | Q&A assistant for executives querying hospital telemetry via `gemini-3.5-flash` | Query string, regional telemetry | Answer markdown string, `referenced_facilities[]` | Returns 400 on empty query, heuristic answer on error | `lifeline/routes/reports.py`, `09-parallel-build-contract.md` |
| 8 | Multi-Role AI | Role-Aware Co-Pilot Streaming Chat | Token streaming SSE chat proxying to Gemini with persona-specific prompts | Message history, user role, facility name | SSE `data: <chunk>` stream, `data: [DONE]` | Falls back to local mock guidance if API key missing | `lifeline/routes/chat.py`, `UnifiedCopilotModal.tsx` |
| 9 | Authentication | Zero-Friction Demo Auth Gateway | Multi-persona authentication generating standard `lifeline_mock_<role>_<uid>` tokens | Username, role string, optional facility/donor ID | Auth Bearer token, User profile object | Returns 400 on invalid role string | `lifeline/routes/auth.py`, `AuthContext.tsx` |
| 10 | Donor Operations | Emergency Blood/Organ Request Feed | Real-time open emergency callouts with distance and ETA calculation | Filter query (status, blood group, type) | List of open requests matching filters | Returns empty array if no requests match | `lifeline/routes/requests.py`, `DonorPortal.tsx` |
| 11 | Donor Operations | Donor Transit Response & Restock | Donor accepts/declines request with travel mode, auto-credits hospital inventory | `donor_id`, `response_status`, `travel_mode`, `eta` | Updated request, transit audit log, +1 inventory credit | Returns 404 if request not found, 409 if fulfilled | `lifeline/routes/requests.py`, `DashboardContext.tsx` |
| 12 | Hospital Operations | Emergency SOS Intake & Dispatch | Field emergency intake triggering full multi-agent pipeline and creating patient record | Vitals, age, complaint, location | Dispatch trace JSON, patient ID, alert ID | Returns 400 on missing vitals/location | `lifeline/main.py`, `EmergencySimulatorModal.tsx` |
| 13 | Hospital Operations | Advance Bed & Bay Reservation | Reserves ICU/general bed or trauma bay for inbound critical patient | `bed_id`, `bay_id`, `patient_id`, `bed_type`, action | Updated bed status, timestamp, patient linkage | Returns 404 if patient not found | `lifeline/routes/patients.py`, `BedReservationModal.tsx` |
| 14 | Hospital Operations | Bed Shortage Transfer Reroute | Reroutes patient to secondary facility when primary reaches 100% capacity | Case ID, current hospital ID, reason, GPS | New facility destination, ETA, reasoning, audit ID | Returns 404 if case or hospital not found | `lifeline/routes/transfers.py`, `09-parallel-build-contract.md` |
| 15 | Hospital Operations | Facility & Equipment Issue Tracker | Logs and tracks broken medical equipment (CT scanners, oxygen lines) | Hospital ID, category, severity, description | Created issue record, tracking ID | Returns 400 on invalid schema | `lifeline/routes/issues.py`, `HospitalIssueTracker.tsx` |
| 16 | Hospital Operations | Medicine & Supply Inventory Manager | Tracks stock levels with automatic low-stock threshold detection | Hospital ID, category, low_stock_only filter | Inventory item records with `is_low_stock` boolean | Returns 404 on invalid item ID | `lifeline/routes/inventory.py`, `HospitalInventoryManager.tsx` |
| 17 | Regional Authority | Jurisdiction Network & Strain Grid | Macro overview of all district hospitals, bed strain, and diversion status | None | Regional totals, hospital summaries, SLA % | Returns 500 on datastore failure | `lifeline/routes/reports.py`, `AuthorityDashboard.tsx` |
| 18 | Storage & Audit | Universal Firestore Client & Dev Fallback | Multi-collection storage (`dispatch_cases`, `donors`, etc.) with in-memory fallback | Collection name, document ID, payload | CRUD document dict, ISO timestamp | Falls back to in-memory store if no credentials | `lifeline/firebase.py`, `lifeline/tools/data_store.py` |
| 19 | UI Layout | Light/Dark Mode Switcher | Persistent theme toggle controlling `:root` vs `.dark` root styling | User toggle click | Updated `localStorage` (`lifeline_theme`) & DOM class | Defaults to Light Mode (`#f8fafc`) on first load | `ThemeContext.tsx`, `globals.css` |
| 20 | UI Layout | Topbar Facility Selector | Synchronizes active hospital ID across entire operations workspace | Dropdown selection | Updates `activeHospitalId` in `DashboardContext` | Defaults to `hosp_mumbai_01` (Lilavati) | `Topbar.tsx`, `DashboardContext.tsx` |
| 21 | UI Layout | Audio Synthesizer Sound System | Web Audio API synthesize real-time emergency sirens, telemetry pings, chimes | Sound trigger action (ping, siren, alert, success) | Synthesized audio oscillator output | Gracefully no-ops if browser audio is muted | `frontend/src/utils/soundEffects.ts`, `Topbar.tsx` |
| 22 | Air-Gap Mode | Disaster Recovery Fail-Safe Console | Standalone offline console for crisis communication when cloud is degraded | Field checklist / intake data | Local offline validation & emergency routing guidance | Operates with zero external network dependencies | `frontend/src/app/emergency/page.tsx` |

## Edge Cases
| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | NEWS2 Calculator | Vitals with extreme low values (HR: 20, RR: 6, BP: 60, SpO2: 70, Temp: 32) | Computes theoretical maximum score of 20, categorizes as `high` risk band. |
| 2 | NEWS2 Calculator | Perfect healthy vitals (HR: 72, RR: 14, BP: 120, SpO2: 99, Temp: 37.0) | Computes score of 0, categorizes as `low` risk band. |
| 3 | NEWS2 Calculator | Single vital trigger of 3 (e.g. SpO2 <= 91%) with normal other vitals | Assigns score 3, flags as Medium/High single-trigger clinical risk per RCP protocol. |
| 4 | Bed-Matching Agent | Nearest hospital has 0 available ICU beds for cardiac patient | Automatically skips nearest full hospital and assigns next closest cardiac facility. |
| 5 | Bed Shortage Transfer | Overloaded hospital reroutes active patient via `/cases/{id}/transfer` | Successfully transfers patient, excludes source hospital, updates patient dossier to `transferred`. |
| 6 | Donor Response | Donor attempts to respond `accepted` to a request that is already `fulfilled` | API rejects with `409 Conflict` and error code `CONFLICT`. |
| 7 | Donor Response | Donor responds with non-existent request ID | API returns `404 Not Found` and error code `RESOURCE_NOT_FOUND`. |
| 8 | Donor Travel Mode | Donor switches travel mode from Driving to Walking | ETA dynamically recalculates from distance (e.g. 1.4 km -> ~20 min) and updates live dashboard. |
| 9 | Autonomous Restock | Donor completes donation (`completed` response status) | System automatically increments hospital blood stock by +1 unit and logs `AUTO_BLOOD_RESTOCKED` audit event. |
| 10 | Blood Deficit Watchdog | Hospital blood stock for blood group drops to <= 2 units | Autonomous watchdog detects critical deficit and triggers emergency donor callout broadcast. |
| 11 | AI Report Query | Empty query string submitted to `POST /reports/query` | API returns `400 Bad Request` with detail "Query string cannot be empty". |
| 12 | Co-Pilot Streaming | Missing `GOOGLE_API_KEY` in environment variables | Co-Pilot gracefully streams mock guidance without throwing unhandled server error. |
| 13 | Mobile 375px Viewport | Viewing high-density hospital ER dashboard at 375px width | Header collapses telemetry pill, sidebar transitions to drawer/bottom navigation, cards stack cleanly. |
| 14 | Ultra-Wide 1920px Viewport | Viewing jurisdiction macro map at 1920px width | Dashboard utilizes full panoramic grid without empty dead zones or awkward element stretching. |
| 15 | Theme Switching | User toggles theme while viewing complex clinical charts and glass cards | Background seamlessly transitions between `#f8fafc` and `#080c14` with zero token inversion bugs. |

---

## 11. Conclusion & Next Steps

This specification report establishes the baseline for Phase 1 scanning and Phase 2 remediation. All discovered features, contracts, and invariants are locked and ready for verification by the scanner agent and developer agents.
