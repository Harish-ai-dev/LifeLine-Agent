## 2026-08-29T16:24:00Z

<USER_REQUEST>
You are a Spec Miner (spec_miner_2) working on the LifeLine Agent expansion project.

Workspace Root: c:\Users\shado\Documents\GitHub\ LifeLine Agent
Your Working Directory: c:\Users\shado\Documents\GitHub\ LifeLine Agent\.agents\spec_miner_2\
Authoritative Request: C:\Users\shado\.gemini\antigravity\brain\ee0aca1a-f7ca-4cf4-b62d-56b451fb669f\ORIGINAL_REQUEST.md

Task:
1. Read the Authoritative Request (C:\Users\shado\.gemini\antigravity\brain\ee0aca1a-f7ca-4cf4-b62d-56b451fb669f\ORIGINAL_REQUEST.md) and all docs/ files.
2. Formulate the precise specifications for the 4 workstreams:
   - Sub-Agent A (Frontend): Streamlit/UI layouts for 3 roles (Donor, Hospital Console, Government), mock auth switcher, live feed, metrics, issue tracking UI.
   - Sub-Agent B (Backend/API): FastAPI routers, /auth, /donors, /requests, /patients, /issues, /transfers, /reports/daily with Gemini 3.5-flash fallback/mock.
   - Sub-Agent C (Storage/Data): Firestore collections, document structures, mock/in-memory adapter for offline testing, seed data loader, audit logs.
   - Sub-Agent D (Deploy/Infra): Dockerfile, Cloud Run configuration, environment variables (.env.example), Makefile targets, CLI commands (Typer).
3. Write a comprehensive workstream specification report to c:\Users\shado\Documents\GitHub\ LifeLine Agent\.agents\spec_miner_2\workstreams_spec.md and handoff report at c:\Users\shado\Documents\GitHub\ LifeLine Agent\.agents\spec_miner_2\handoff.md.
4. Notify the orchestrator via send_message when complete.
</USER_REQUEST>
