# 02 — Build Plan

Each step is a checkpoint: don't move to the next step until the current one runs and produces sane output. No new decisions during build — if something isn't covered here, check `03-decision-log.md` first; if it's truly not decided, that's the one thing worth pausing for.

## Milestone M0 — Contract & Architecture Lock (Worker M0)
- [x] Author comprehensive Parallel Build Contract (`docs/09-parallel-build-contract.md`)
- [x] Update Decision Log (`docs/03-decision-log.md`) with mock auth, Gemini 3.5-flash report model, multi-role portal, and universal datastore
- [x] Update Scope Lock (`docs/07-scope-lock.md`) with expanded product demo scope
- [x] Synchronize documentation across `docs/` and `my-agent/docs/`

## Sub-Agent Parallel Build Sprints (Milestones M1–M4)

### Sub-Agent A — Frontend Workstream
- [x] Implement role-based login screen (`/login`) with demo auth token storage (`lifeline_mock_<role>_<uid>`)
- [x] Build Blood & Organ Donor portal views (profile, pledge, live request feed, accept/decline action)
- [x] Build Hospital Operations Console (inbox, patient dossiers, advance bed/bay reservations, transfer flow, resource requests, issues, inventory)
- [x] Build Government Authority Executive Dashboard (network overview, AI daily intelligence report, NL query box)

### Sub-Agent B — Backend / API Workstream
- [x] Implement demo authentication endpoints (`POST /auth/login`, `GET /auth/me`)
- [x] Implement Donor & Request REST endpoints (`/donors`, `/requests`, `/requests/:id/respond`)
- [x] Implement Hospital Operations REST endpoints (`/patients`, `/sos`, `/beds/:id/reserve`, `/cases/:id/transfer`, `/issues`, `/inventory`)
- [x] Implement Government Authority & AI Intelligence endpoints (`/network/overview`, `/reports/daily`, `/reports/query`) using `gemini-3.5-flash`
- [x] Maintain 100% non-regression on core `POST /dispatch` multi-agent pipeline

### Sub-Agent C — Storage / Data Workstream
- [x] Implement canonical Firestore collections (`dispatch_cases`, `donors`, `requests`, `patients`, `issues`, `inventory`, `reports`)
- [x] Extend immutable timestamped audit logging pattern with offline mock fallback
- [x] Create realistic seed data scripts for donors, hospital inventory, and open requests
- [x] Build thin data-access layer for backend endpoints

### Sub-Agent D — Deploy / Infra Workstream
- [x] Update Cloud Run Dockerfile and deployment scripts
- [x] Verify environment variable pass-through (`DEMO_AUTH_MODE`, `DEMO_CITY`, `GOOGLE_API_KEY`, etc.)
- [x] Update root `README.md` and installation documentation
