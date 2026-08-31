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

## 🎯 Executive Summary & Value Proposition

In acute medical crises—such as cardiac arrest, severe trauma, or hemorrhagic shock—**seconds save lives**. However, traditional emergency dispatch systems remain heavily fragmented and reliant on manual coordination. Paramedics wait on hold to secure open ICU beds; emergency room teams receive minimal advance clinical briefings; and blood bank shortages trigger frantic, time-consuming searches.

**LifeLine Agent replaces manual delays with autonomous, deterministic multi-agent intelligence:**

1. **Clinically Grounded Triage**: Computes validated NEWS2 scores before invoking **Gemini 3.1 Pro** for advanced clinical reasoning.
2. **Dynamic Hospital Bed Matching**: Evaluates real OpenStreetMap facilities, live road network ETAs, and bed specialties autonomously using **Gemini 3.5 Flash**.
3. **Automated ER Pre-Arrival Briefing**: Generates structured, compliant SBAR dossiers for receiving trauma teams.
4. **Community Donor Mobilization**: Broadcasts hyper-targeted STAT blood and organ requests directly to nearby eligible donors.
5. **Regional Health Intelligence**: Synthesizes district-wide hospital telemetry into daily executive briefings.
6. **Immutable Audit Trail**: Logs every autonomous decision to Google Cloud Firestore, ensuring HIPAA-defensible accountability.

---

## 🛠️ The Unified lifeline CLI Toolkit

LifeLine Agent is entirely driven by its robust, unified command-line interface. Whether you are running locally in VS Code or deploying to production, **you never need to manually run 
pm install or pip**. The lifeline CLI handles everything.

In your VS Code terminal, simply use lifeline (or python -m lifeline / ./lifeline) to execute any command:

`ash
# View all available operational commands
lifeline --help
`

| Command | Usage | Description |
|---|---|---|
| **install** | lifeline install | Installs both the Python backend and Next.js frontend dependencies securely. |
| **setup** | lifeline setup | Interactive wizard to configure API keys (Gemini, Firebase, GCP) with live validation. |
| **status** | lifeline status | Displays a live system health dashboard checking environment variables and Gemini models. |
| **run** | lifeline run | Starts the FastAPI backend server, Next.js frontend, and Google ADK Web UI concurrently. |
| **dispatch** | lifeline dispatch | Executes the autonomous multi-agent pipeline directly in the terminal for testing. |
| **seed** | lifeline seed | Enriches raw OSM data with simulated bed counts & specialties into data/hospitals.json. |
| **logs** | lifeline logs | Streams recent Firestore audit records in a formatted terminal table. |

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Python**: ≥ 3.11
- **Node.js**: ≥ 18 (for the Next.js frontend)
- **Gemini API Key**: [Google AI Studio](https://aistudio.google.com/apikey)

### 3-Step Setup

The entire installation is managed through the lifeline CLI. Open your VS Code terminal and run:

`ash
# 1. Install all dependencies (Backend + Frontend)
lifeline install

# 2. Configure your environment securely (requires Gemini API Key)
lifeline setup

# 3. Start the entire platform (Backend on 8000, Frontend on 3000, ADK on 8088)
lifeline run
`

*(Note: If the lifeline alias isn'\''t immediately available in your terminal path, you can always run python -m lifeline [command] or ./lifeline [command].)*

---

## 🏗️ System Architecture & Workflow

`	ext
┌─────────────────────────────────────────────────────────────────────────┐
│                        LIFELINE AGENT ECOSYSTEM                         │
├──────────────────┬─────────────────────────────┬────────────────────────┤
│   BLOOD DONOR    │       HOSPITAL STAFF        │  GOVERNMENT AUTHORITY  │
│  lood_donor   │      hospital_staff       │ government_authority │
│ (Mobile/Portal)  │   (ER Ops Console & Bays)   │ (Regional Exec Brief)  │
└─────────┬────────┴──────────────┬──────────────┴───────────┬────────────┘
          │                       │                          │
          ▼                       ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   FASTAPI UNIFIED REST API GATEWAY                      │
│   • Demo/Mock Auth (POST /auth/login, GET /auth/me)                 │
│   • Donor Coordination (/donors, /requests, /requests/:id/respond)│
│   • Hospital ER Operations (/patients, /sos, /beds, /inventory) │
│   • Regional Intelligence (/network/overview, /reports/daily)       │
│   • Core Multi-Agent Dispatch (POST /dispatch, GET /health)         │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
          ┌───────────────────────┴───────────────────────┐
          ▼                                               ▼
┌──────────────────────────────────┐    ┌─────────────────────────────────┐
│  CORE MULTI-AGENT PIPELINE       │    │  GOOGLE CLOUD FIRESTORE         │
│  1. Deterministic NEWS2 Engine   │    │  • dispatch_cases (Audit Log) │
│  2. Triage (gemini-3.1-pro)    │    │  • donors, 
equests         │
│  3. Bed-Match (gemini-3.5-flash)    │  • patients, issues         │
│  4. Routing & SBAR Briefing      │    │  • inventory, 
eports       │
└──────────────────────────────────┘    └─────────────────────────────────┘
`

---

## 👥 Multi-Role Portal Walkthroughs

The Next.js unified portal provides three dedicated role personas accessible via instant demo authentication.

### 1. 🩸 Blood & Organ Donor (lood_donor)
- **Donor Profile & Pledge**: Manage contact info, blood type (e.g., O-, AB+), and organ donor pledge.
- **STAT Emergency Callouts**: Real-time feed of urgent blood/organ requests raised by regional hospitals.
- **One-Tap Transit Response**: Accept requests with estimated transit ETAs, receiving instant hospital routing.

### 2. 🏥 Hospital ER Operations Console (hospital_staff)
- **Real-Time Intake Inbox**: Track inbound ambulance cases, vital telemetry, and live countdown ETAs.
- **Clinical Admission Dossiers**: Review full patient summaries featuring computed NEWS2 risk scores and SBAR briefs.
- **Advance Bay Reservation**: Reserve Cardiac ICU, Trauma, or General bays before patient arrival.
- **Resource Requests**: Raise STAT blood requests and monitor blood bank / medication stock thresholds.

### 3. 🏛️ Regional Health Authority (government_authority)
- **District Telemetry Overview**: Real-time metrics across all regional hospitals—active critical alerts, mean response times, and SLAs.
- **Hospital Strain Monitoring**: Live occupancy heatmaps identifying facilities nearing critical capacity.
- **AI Executive Briefing**: Daily plain-language regional intelligence reports automatically generated by **Gemini 3.5 Flash**.

---

## ☁️ Google Cloud Run Deployment

LifeLine Agent is packaged with a multi-stage Dockerfile and deployment manifests ready for production on Google Cloud Run.

`ash
# 1. Authenticate with Google Cloud
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID

# 2. Deploy directly via gcloud
gcloud run deploy lifeline-agent \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars GOOGLE_API_KEY=your-key,DEMO_AUTH_MODE=true,FIRESTORE_PROJECT_ID=your-gcp-project-id
`

---

## 📊 Data Sources & Grounding

| Component | Source | Verification |
|---|---|---|
| **Hospital Names & GPS** | OpenStreetMap (Overpass API) | ✅ **Real** |
| **Clinical Triage Formula** | Royal College of Physicians NEWS2 Standard | ✅ **Real** |
| **Driving ETAs & Routes** | OSRM Road Network Demo Server | ✅ **Real** |
| **Agent Reasoning** | Gemini 3.1 Pro (Triage) & Gemini 3.5 Flash (Operations) | ✅ **Real** |
| **Bed Counts & Specialties** | Algorithmic Simulation via lifeline seed | ⚠️ **Simulated** |

---

## 📄 License

Apache 2.0 — see [LICENSE](LICENSE)
