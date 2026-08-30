# Project: LifeLine Agent Full Product Expansion

## Architecture
- **Multi-Agent Pipeline**: NEWS2 clinical scoring -> Triage Agent (Gemini 3.1-pro) -> Bed-Matching Agent (Gemini 3.5-flash) -> Routing Agent (Gemini 3.5-flash) -> Briefing Agent (Gemini 3.5-flash) -> Firestore Audit Trail.
- **Reporting Agent**: Regional Daily Intelligence Briefing & Natural Language Q&A via Gemini 3.5-flash.
- **Backend API**: FastAPI application with modular routers (`/auth`, `/donors`, `/requests`, `/patients`, `/issues`, `/transfers`, `/reports`, `/inventory`, `/dispatch`, `/network/overview`).
- **Data Layer**: Firestore collections (`dispatch_cases`, `donors`, `requests`, `patients`, `issues`, `inventory`, `reports`) with local in-memory mock fallback adapter.
- **Frontend Architecture**: Next.js 14 / React 18 / TypeScript with TailwindCSS, Leaflet geospatial mapping, Recharts analytics, and role-gated views (`blood_donor`, `hospital_staff`, `government_authority`).
- **Packaging & CLI**: Typer CLI entrypoints (`init`, `status`, `run`, `ui`, `dispatch`, `logs`, `test`, `version`) with Windows UTF-8 console safety.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Parallel Build Contract | docs/09-parallel-build-contract.md + doc updates | M0 | ORIGINAL_REQUEST §Part 2 |
| 2 | Firestore DataStore Adapter | Universal in-memory/offline & live Firestore adapter | M1 | ORIGINAL_REQUEST §Sub-Agent C |
| 3 | Seed Data & Collections | Mumbai realistic seed loader for 7 collections | M1 | ORIGINAL_REQUEST §Sub-Agent C |
| 4 | Auth API Endpoints | POST /auth/login, GET /auth/me (mock tokens) | M2 | ORIGINAL_REQUEST §Sub-Agent B |
| 5 | Donor API Endpoints | POST /donors, GET /donors/:id, GET /requests, POST /requests/:id/respond | M2 | ORIGINAL_REQUEST §Sub-Agent B |
| 6 | Hospital Operations API | GET/PATCH /patients, POST /sos, POST /beds/:id/reserve, POST /cases/:id/transfer, POST /requests | M2 | ORIGINAL_REQUEST §Sub-Agent B |
| 7 | Issues & Inventory API | GET/POST/PATCH /issues, GET/PATCH /inventory | M2 | ORIGINAL_REQUEST §Sub-Agent B |
| 8 | AI Reporting API | GET /reports/daily, POST /reports/query, GET /network/overview with gemini-3.5-flash | M2 | ORIGINAL_REQUEST §Sub-Agent B |
| 9 | Multi-Role Frontend UI | Role switcher & 3 distinct views (Donor, Hospital, Gov) | M3 | ORIGINAL_REQUEST §Sub-Agent A |
| 10 | Reactive Dispatch Feed | Live 3-stage agent progression feed & SOS trigger | M3 | ORIGINAL_REQUEST §Sub-Agent A |
| 11 | Hospital Operations UI | Patient triage cards, bed reservation, transfer flow, issue board, inventory | M3 | ORIGINAL_REQUEST §Sub-Agent A |
| 12 | Government Analytics UI | Regional map, strain index, AI daily brief, NL query assistant | M3 | ORIGINAL_REQUEST §Sub-Agent A |
| 13 | Donor Portal UI | Profile, blood/organ eligibility, SOS match card, accept/decline action | M3 | ORIGINAL_REQUEST §Sub-Agent A |
| 14 | Dockerfile & Cloud Run | Fix Dockerfile entrypoint (lifeline.main:app) and Cloud Run deployment config | M4 | ORIGINAL_REQUEST §Sub-Agent D |
| 15 | CLI & Packaging | Typer CLI commands, Windows UTF-8 safety, start.py | M4 | ORIGINAL_REQUEST §Sub-Agent D |
| 16 | Makefile & Environment | Unified make targets and .env.example configuration | M4 | ORIGINAL_REQUEST §Sub-Agent D |
| 17 | E2E Testing & Audit | Tier 1-4 test suite, zero-regression on /dispatch, forensic integrity audit | M5 | ORIGINAL_REQUEST §Part 4 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M0 | Parallel Build Contract & Governance | Create docs/09-parallel-build-contract.md, update docs/03 and docs/07 | none | DONE |
| M1 | Storage & Data Layer (Sub-Agent C) | Firestore collections, DataStore adapter, Mumbai seed data | M0 | DONE |
| M2 | Backend & API Layer (Sub-Agent B) | FastAPI routes, schemas, AI reporting agent (gemini-3.5-flash) | M0, M1 | DONE |
| M3 | Frontend & Role Views (Sub-Agent A) | Role switcher, Donor, Hospital Console, Government views | M0, M2 | DONE |
| M4 | Deploy & Infra (Sub-Agent D) | Dockerfile, Cloud Run config, CLI fixes, Makefile, README | M0 | DONE |
| M5 | E2E Integration & Verification | Comprehensive test suite (Tiers 1-4), forensic audit | M1, M2, M3, M4 | DONE |

## Code Layout
- `lifeline/`: Core Python backend package
  - `lifeline/agents/`: Gemini agents (`triage_agent.py`, `bed_matching_agent.py`, `routing_agent.py`, `briefing_agent.py`, `reporting_agent.py`)
  - `lifeline/routes/`: FastAPI routers (`auth.py`, `donors.py`, `requests.py`, `patients.py`, `issues.py`, `transfers.py`, `reports.py`, `inventory.py`)
  - `lifeline/tools/`: Deterministic tools (`news2.py`, `firestore_client.py`, `data_store.py`, `seed_data.py`, `osm.py`, `osrm.py`)
  - `lifeline/models.py`: Centralized model registry
  - `lifeline/schemas.py`: Pydantic data schemas
  - `lifeline/main.py`: FastAPI application entrypoint
  - `lifeline/cli.py`: Typer CLI application
- `frontend/`: Next.js 14 / React 18 / TypeScript frontend
  - `frontend/src/app/`: Page routes
  - `frontend/src/components/`: Reusable UI components for roles (Donor, Hospital, Government)
  - `frontend/src/context/`: Global state management
  - `frontend/src/types/`: TypeScript definitions
- `data/`: Reference data files (`hospitals.json`, `seed_data.json`)
- `deploy/`: Deployment artifacts (`Dockerfile`, `cloud_run.yaml`)
- `docs/` & `my-agent/docs/`: Architecture and decision documentation
- `tests/`: Automated pytest suite
