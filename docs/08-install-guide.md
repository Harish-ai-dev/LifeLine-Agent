# LifeLine Agent — Install Guide

## Prerequisites

| Tool | Min Version | Install |
|---|---|---|
| Python | 3.11+ | [python.org](https://python.org) |
| pip | 23+ | bundled with Python |
| Docker | 24+ | [docker.com](https://docker.com) |
| gcloud CLI | latest | [cloud.google.com/sdk](https://cloud.google.com/sdk) |

---

## 1. Clone & Unified Install

```bash
git clone https://github.com/your-org/lifeline-agent.git
cd lifeline-agent
lifeline install
# or: python -m lifeline install
```

This single command checks prerequisites (Python ≥ 3.11, Node.js ≥ 18, npm) and installs both backend Python packages and Next.js frontend dependencies with zero direct npm exposure.

---

## 2. Interactive Key Setup & Validation

```bash
lifeline setup
# or reconfigure a single key:
lifeline setup --key gemini
```

The interactive setup wizard walks through all credentials with **live validation** (including a live `gemini-3.5-flash` ping):
- **Gemini API Key (Mandatory)** → [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- **GCP / Firestore Project ID (Optional)** → e.g. `lifeline-3725b`
- **Firebase Service Account JSON (Optional)** → Project Settings → Service Accounts
- **Firebase Web API Key (Optional)** → Client Auth
- **Demo City & Auth Mode** → e.g. `mumbai`, `DEMO_AUTH_MODE=true`

All credentials are saved to `.env` and **AES-256 encrypted at rest** (`.admin_config.enc`).

Alternatively, access the web-based Super Admin Panel at:
```bash
lifeline admin
```

---

## 3. Verify Health & Status

```bash
lifeline status
```

Displays live system health, API key validation states, dataset files, Gemini model tiers, and Firestore connectivity/offline mode.

---

## 4. Pull Real Hospital Data & Seed

```bash
lifeline fetch-hospitals mumbai
lifeline seed
```

---

## 5. Start the Full Application Stack

```bash
lifeline run
```

Pre-flight checks validate mandatory keys before booting FastAPI backend (`http://localhost:8000`) and Next.js frontend (`http://localhost:3000`) concurrently.

Use `--backend-only` to launch just the API server.

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
