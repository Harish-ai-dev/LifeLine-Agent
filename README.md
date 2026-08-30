# 🚑 LifeLine Agent

> **Autonomous Emergency Healthcare Coordination Platform & Hospital Bed Matchmaker**  
> An autonomous multi-agent pipeline powered by **Gemini 3.1 Pro**, **Gemini 3.5 Flash**, **Google ADK**, **Genkit**, and **Google Cloud Run + Firestore**.

[![Hackathon](https://img.shields.io/badge/Hackathon-All%20Things%20Agentic-blue)](https://allthingsagentichackathon.devpost.com/)
[![Track](https://img.shields.io/badge/Track-The%20Taskmaster-red)](https://allthingsagentichackathon.devpost.com/)
[![Clinical%20Reasoning](https://img.shields.io/badge/Triage%20Model-Gemini%203.1%20Pro-purple)](https://ai.google.dev/models)
[![Agent%20Operations](https://img.shields.io/badge/Agents%20Model-Gemini%203.5%20Flash-orange)](https://ai.google.dev/models)
[![Framework](https://img.shields.io/badge/Framework-Google%20ADK%20%2B%20Genkit-green)](https://github.com/google/adk-python)
[![Cloud](https://img.shields.io/badge/Cloud-Google%20Cloud%20Run%20%2B%20Firestore-blue)](https://cloud.google.com/)

---

## 🎯 Problem & Value Proposition

In acute medical crises — cardiac arrest, severe trauma, hemorrhagic shock — **seconds save lives**. Yet traditional emergency dispatch systems remain heavily fragmented and manual:
- Paramedics wait on hold with hospitals trying to find open ICU beds or cath labs.
- Hospital ER teams receive little to no advance clinical briefing prior to arrival.
- Emergency blood bank shortages require frantic manual phone coordination.
- Health authorities lack real-time visibility into regional hospital strain and diversions.

**LifeLine Agent replaces manual delays with autonomous multi-agent intelligence:**
1. **Clinically Grounded Triage**: Computes validated NEWS2 scores before invoking **Gemini 3.1 Pro** for clinical reasoning.
2. **Dynamic Hospital Bed Matching**: Evaluates real OpenStreetMap facilities, real road network ETAs, and bed specialties with **Gemini 3.5 Flash**.
3. **Automated ER Pre-Arrival Briefing**: Generates structured SBAR dossiers for receiving trauma teams.
4. **Community Donor Mobilization**: Broadcasts hyper-targeted STAT blood and organ requests to nearby donors.
5. **Regional Health Intelligence**: Synthesizes district-wide hospital telemetry into daily executive briefings.
6. **HIPAA-Defensible Audit Trail**: Logs every autonomous decision to Google Cloud Firestore with immutable timestamps.

---

## 🏆 Hackathon Track: The Taskmaster

LifeLine Agent is built strictly for **The Taskmaster** track:
- **Autonomous Multi-Step Execution**: Executes end-to-end clinical triage, facility selection, routing, ER briefing, and audit logging with **zero human intervention** in the decision loop.
- **Deterministic Grounding + Generative Reasoning**: All LLM reasoning is grounded in deterministic mathematical models (NEWS2 vital score calculation, Haversine/OSRM geo-routing).
- **Structured Pydantic Schemas**: Every agent step consumes and produces typed Pydantic schemas, eliminating string parsing failure modes.

---

## 🏗️ System Architecture & Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        LIFELINE AGENT ECOSYSTEM                         │
├──────────────────┬─────────────────────────────┬────────────────────────┤
│   BLOOD DONOR    │       HOSPITAL STAFF        │  GOVERNMENT AUTHORITY  │
│  `blood_donor`   │      `hospital_staff`       │ `government_authority` │
│ (Mobile/Portal)  │   (ER Ops Console & Bays)   │ (Regional Exec Brief)  │
└─────────┬────────┴──────────────┬──────────────┴───────────┬────────────┘
          │                       │                          │
          ▼                       ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   FASTAPI UNIFIED REST API GATEWAY                      │
│   • Demo/Mock Auth (`POST /auth/login`, `GET /auth/me`)                 │
│   • Donor Coordination (`/donors`, `/requests`, `/requests/:id/respond`)│
│   • Hospital ER Operations (`/patients`, `/sos`, `/beds`, `/inventory`) │
│   • Regional Intelligence (`/network/overview`, `/reports/daily`)       │
│   • Core Multi-Agent Dispatch (`POST /dispatch`, `GET /health`)         │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
          ┌───────────────────────┴───────────────────────┐
          ▼                                               ▼
┌──────────────────────────────────┐    ┌─────────────────────────────────┐
│  CORE MULTI-AGENT PIPELINE       │    │  GOOGLE CLOUD FIRESTORE         │
│  1. Deterministic NEWS2 Engine   │    │  • `dispatch_cases` (Audit Log) │
│  2. Triage (`gemini-3.1-pro`)    │    │  • `donors`, `requests`         │
│  3. Bed-Match (`gemini-3.5-flash`)    │  • `patients`, `issues`         │
│  4. Routing & SBAR Briefing      │    │  • `inventory`, `reports`       │
└──────────────────────────────────┘    └─────────────────────────────────┘
```

---

## 👥 Multi-Role Portal Walkthroughs

The unified Next.js portal provides three dedicated role personas accessible via instant demo authentication:

### 1. 🩸 Blood & Organ Donor (`blood_donor`)
- **Donor Profile & Pledge**: Manage contact info, blood type (e.g. `O-`, `AB+`), organ donor pledge, and donation streak badges.
- **STAT Emergency Callouts**: Real-time feed of urgent blood/organ requests raised by hospitals.
- **One-Tap Transit Response**: Accept requests with estimated transit ETA (`POST /requests/:id/respond`), receiving hospital blood bank directions.
- **Donation History Log**: Track total units contributed and verified impact records.

### 2. 🏥 Hospital ER Operations Console (`hospital_staff`)
- **Real-Time Intake Inbox**: Track inbound ambulance cases, vital telemetry, and live countdown ETAs.
- **Clinical Admission Dossiers**: Full patient summaries with computed NEWS2 risk scores, specialty requirements, and SBAR briefs.
- **Advance Bay Reservation**: Reserve Cardiac ICU, Trauma, or General bays before patient arrival (`POST /beds/:id/reserve`).
- **Emergency Transfer Rerouting**: One-click autonomous rerouting to nearby facilities if capacity surges (`POST /cases/:id/transfer`).
- **Resource Requests & Inventory**: Raise STAT blood requests and monitor blood bank / medication stock thresholds (`/inventory`, `/issues`).

### 3. 🏛️ Regional Health Authority (`government_authority`)
- **District Telemetry Overview**: Real-time metrics across 14+ hospitals — active critical alerts, mean response time, and SLA compliance (`GET /network/overview`).
- **Hospital Strain & Diversion Monitoring**: Live occupancy heatmap identifying facilities nearing 100% capacity.
- **AI Executive Briefing**: Daily plain-language regional intelligence reports generated by **Gemini 3.5 Flash** (`GET /reports/daily`).
- **Natural Language Query Assistant**: Interactive query tool to ask questions over regional healthcare telemetry (`POST /reports/query`).

---

## 📡 Canonical REST API Reference

All API routes return standard JSON envelopes and adhere to `docs/09-parallel-build-contract.md`.

| Method | Endpoint | Role / Access | Description |
|---|---|---|---|
| `POST` | `/auth/login` | Public / Demo | Authenticate persona (`hospital_staff`, `blood_donor`, `government_authority`). |
| `GET` | `/auth/me` | Authenticated | Retrieve current user profile and facility binding from Bearer token. |
| `POST` | `/dispatch` | System / Core | End-to-end autonomous dispatch workflow (NEWS2 → Triage → Bed-Match → Routing → Briefing). |
| `GET` | `/health` | Public | Service health probe and version check (`{"status": "ok"}`). |
| `POST` | `/donors` | Donor / Admin | Register new donor or update eligibility profile. |
| `GET` | `/donors/:id` | Donor / Hospital | Retrieve complete donor dossier and donation history. |
| `GET` | `/requests` | All Roles | Query open emergency blood, organ, or equipment requests. |
| `POST` | `/requests` | Hospital Staff | Hospital raises urgent STAT blood or resource callout. |
| `POST` | `/requests/:id/respond`| Blood Donor | Donor accepts/declines emergency blood transit request with ETA. |
| `GET` | `/patients` | Hospital Staff | Query active inbound, admitted, or transferred emergency patients. |
| `PATCH`| `/patients/:id` | Hospital Staff | Update patient clinical notes and admission status. |
| `POST` | `/sos` | Field / Hospital | Emergency field SOS trigger executing full dispatch pipeline. |
| `POST` | `/beds/:id/reserve` | Hospital Staff | Advance trauma bay or ICU bed reservation for incoming patient. |
| `POST` | `/cases/:id/transfer`| Hospital Staff | Autonomous reroute/transfer when assigned hospital reaches capacity. |
| `GET` | `/issues` | Hospital / Gov | List equipment breakdowns and operational facility issues. |
| `POST` | `/issues` | Hospital Staff | Log facility issue (e.g. CT Scanner Offline). |
| `GET` | `/inventory` | Hospital Staff | View hospital blood bank and medication supply levels. |
| `PATCH`| `/inventory/:id` | Hospital Staff | Update stock counts and trigger low-stock alerts. |
| `GET` | `/network/overview` | Gov Authority | Aggregate regional metrics, SLA compliance, and hospital summaries. |
| `GET` | `/reports/daily` | Gov Authority | Plain-language AI executive daily intelligence report (**Gemini 3.5 Flash**). |
| `POST` | `/reports/query` | Gov Authority | Natural language query assistant over regional hospital telemetry. |

---

## 💻 Typer CLI Reference

LifeLine Agent provides a command-line interface supporting all standard operational verbs:

```bash
# Global CLI command after installation
lifeline --help
```

| Command | Usage | Description |
|---|---|---|
| `version` | `lifeline version` | Displays version (`v0.1.0`), author, Python runtime, and OS platform. |
| `init` | `lifeline init` | Interactive setup wizard (dependencies, API keys, city selection, data seeding). |
| `status` | `lifeline status` | Live system health dashboard checking environment variables, datasets, and Gemini model registry. |
| `run` | `lifeline run [--port 8000] [--reload] [--backend-only]` | Starts FastAPI backend server and Next.js frontend concurrently. |
| `ui` | `lifeline ui [--port 3000] [--no-browser]` | Launches the Next.js multi-role portal at `http://localhost:3000`. |
| `dispatch` | `lifeline dispatch [scenario] [--lat LAT] [--lng LNG]` | Executes the autonomous multi-agent dispatch pipeline directly in terminal. |
| `logs` | `lifeline logs [--limit 10]` | Streams recent Firestore audit records in a formatted terminal table. |
| `seed` | `lifeline seed [--icu-max 12]` | Enriches raw OSM data with simulated bed counts & specialties into `data/hospitals.json`. |
| `fetch-hospitals` | `lifeline fetch-hospitals [city]` | Queries OpenStreetMap Overpass API to pull real hospital GPS locations. |
| `test` | `lifeline test [-v] [--cov]` | Runs the full pytest test suite with code coverage. |

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Python**: `≥ 3.11`
- **Node.js**: `≥ 18` (for Next.js frontend)
- **Gemini API Key**: [Google AI Studio](https://aistudio.google.com/apikey)

### Quick Setup in 4 Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-org/lifeline-agent.git
cd lifeline-agent

# 2. Install package and dependencies
make install
# or: pip install -e ".[dev]"

# 3. Configure environment
cp .env.example .env
# Edit .env and set GOOGLE_API_KEY=your_key_here

# 4. Ingest real hospital data and seed bed availability
make data CITY=mumbai

# 5. Start full stack (FastAPI Backend :8000 + Next.js Frontend :3000)
make dev
```

### Windows One-Click Launch
On Windows systems, simply run `start.bat`:
```cmd
start.bat
```
*(Runs backend and frontend concurrently in a single terminal window using `start /B` per AGENTS.md invariant).*

---

## ☁️ Google Cloud Run Deployment

LifeLine Agent is packaged with a multi-stage Dockerfile and deployment manifests ready for Google Cloud Run:

```bash
# 1. Authenticate with Google Cloud
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID

# 2. Build multi-stage production container
make build-docker

# 3. Deploy to Google Cloud Run
make deploy-cloudrun
```

Or deploy directly via gcloud:
```bash
gcloud run deploy lifeline-agent \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars GOOGLE_API_KEY=your-key,DEMO_AUTH_MODE=true,FIRESTORE_PROJECT_ID=your-gcp-project-id
```

See [`deploy/README.md`](deploy/README.md) and [`deploy/cloud_run.yaml`](deploy/cloud_run.yaml) for complete Knative configuration and Secret Manager integration.

---

## 🧪 Testing & Quality Assurance

Run the comprehensive unit test suite:
```bash
make test
# or: python -m pytest tests/ -v --cov=lifeline
```

The test suite validates:
- Clinical NEWS2 score computation for mild, cardiac, and trauma presentations.
- Gemini 3.1 Pro Triage schema validation and clinical prompting.
- Bed-Matching Haversine geo-distance calculation and facility ranking.
- Routing and pre-arrival SBAR briefing generation.
- CLI operational commands, options, and error handling.

---

## 📊 Data Sources — Real vs. Simulated

| Component | Source | Verification |
|---|---|---|
| **Hospital Names & GPS** | OpenStreetMap (Overpass API) | ✅ **Real** |
| **Clinical Triage Formula** | Royal College of Physicians NEWS2 Standard | ✅ **Real** |
| **Driving ETAs & Routes** | OSRM Road Network Demo Server | ✅ **Real** |
| **Agent Reasoning** | Gemini 3.1 Pro (Triage) & Gemini 3.5 Flash (Operations) | ✅ **Real** |
| **Bed Counts & Specialties** | Randomized plausible simulation (`lifeline seed`) | ⚠️ **Simulated** (EHR integration is future work) |

---

## 📄 License

Apache 2.0 — see [LICENSE](LICENSE)
