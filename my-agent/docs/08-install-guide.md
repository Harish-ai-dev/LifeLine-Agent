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
pip install -e ".[dev]"
```

After install, the `lifeline` CLI is available:
```bash
lifeline --help
```

---

## 2. First-Run: Configure API Keys (Super Admin Panel)

```bash
lifeline admin
# or: python start.py
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

## 3. Pull Real Hospital Data & Seed

```bash
lifeline fetch-hospitals --city mumbai
lifeline seed
```

---

## 4. Run the API Server

```bash
lifeline run
# or: python -m uvicorn lifeline.main:app --port 8000 --reload
```

API live at: `http://localhost:8000`  
Health check: `http://localhost:8000/health`  
API docs: `http://localhost:8000/docs`

---

## 5. Launch the Frontend UI

```bash
cd frontend
npm install
npm run dev
```

Opens Frontend Portal at `http://localhost:3000` or `http://localhost:5173`.

---

## 6. Run Tests

```bash
pytest tests/ -v
```

---

## 7. Docker Build & Cloud Run Deploy

```bash
docker build -t lifeline-agent -f deploy/Dockerfile .
gcloud run deploy lifeline-agent --source . --region us-central1 --allow-unauthenticated
```

---

## Models Used

| Agent / Service | Model | Reason |
|---|---|---|
| Triage Agent | `gemini-3.1-pro` | Deepest clinical reasoning (Clinical Flagship) |
| Bed-Matching Agent | `gemini-3.5-flash` | Fast matching + ranking |
| Routing Agent | `gemini-3.5-flash` | Format OSRM output |
| Briefing Agent | `gemini-3.5-flash` | Single SBAR summary call |
| Daily AI Intelligence Report | `gemini-3.5-flash` | Executive regional intelligence briefing |

To change models: edit [`lifeline/models.py`](../lifeline/models.py)
