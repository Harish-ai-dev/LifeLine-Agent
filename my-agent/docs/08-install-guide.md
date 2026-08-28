# LifeLine Agent — Install Guide

## Prerequisites

| Tool | Min Version | Install |
|---|---|---|
| Python | 3.11+ | [python.org](https://python.org) |
| pip | 23+ | bundled with Python |
| Docker | 24+ | [docker.com](https://docker.com) |
| gcloud CLI | latest | [cloud.google.com/sdk](https://cloud.google.com/sdk) |

---

## 1. Clone & Install

```bash
git clone https://github.com/your-org/lifeline-agent.git
cd lifeline-agent
make install
# or:  pip install -e ".[dev]"
```

After install, the `lifeline` CLI is available globally:
```bash
lifeline --help
```

---

## 2. First-Run: Configure API Keys (Super Admin Panel)

```bash
lifeline admin
# or: make admin
```

This opens the **Super Admin Panel** in your browser.

1. **First visit** → Setup Wizard: create your Firebase admin email + password
2. **Login** with those credentials
3. Go to **🔑 API Keys** tab and fill in:
   - `Gemini API Key` → [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
   - `GCP Project ID` → your Firebase/GCP project ID
   - `Firebase Web API Key` → Firebase Console → Project Settings → General
   - `Firebase Service Account JSON` → Firebase Console → Project Settings → Service Accounts → Generate New Key (paste full JSON)
   - `Firestore Collection` → `dispatch_cases`
   - `Demo City` → e.g. `mumbai`

Keys are **AES-256 encrypted** on disk and never written to source code.

---

## 3. Pull Real Hospital Data

```bash
lifeline fetch-hospitals --city mumbai
# or: make fetch CITY=mumbai
```

Saves real hospital locations from OpenStreetMap → `data/hospitals_raw.json`

```bash
lifeline seed
# or: make seed
```

Enriches with simulated bed/specialty data → `data/hospitals.json`

---

## 4. Run the API Server

```bash
lifeline run
# or: make run
```

API live at: `http://localhost:8000`  
Health check: `http://localhost:8000/health`  
API docs: `http://localhost:8000/docs`

---

## 5. Launch the Demo UI

```bash
lifeline ui
# or: make ui
```

Opens Streamlit at `http://localhost:8501` — pick a scenario and hit **Dispatch**.

---

## 6. Run Tests

```bash
make test
# or: pytest tests/ -v
```

---

## 7. Docker Build & Cloud Run Deploy

```bash
make docker-build          # build image
make docker-run            # test locally

make deploy                # push to GCR + deploy to Cloud Run
```

Requires `GCP_PROJECT_ID` set in `.env`.

---

## Models Used

| Agent | Model | Reason |
|---|---|---|
| Triage Agent | `gemini-3.1-pro` | Deepest clinical reasoning |
| Bed-Matching Agent | `gemini-3.5-flash` | Fast matching + ranking |
| Routing Agent | `gemini-3.5-flash` | Format OSRM output |
| Briefing Agent | `gemini-3.5-flash` | Single summary call |

To change models: edit [`lifeline/models.py`](../lifeline/models.py)
