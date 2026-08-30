# LifeLine Agent Expansion Plan

## Objective
Expand the existing 2-agent MVP into a full product with 3 role-based experiences (Blood Donor, Hospital Console, Government Authority) across 4 parallel workstreams without breaking the existing working Triage -> Bed-Matching pipeline.

## Execution Strategy
1. **Phase 1: Survey & Build Contract**
   - Survey documentation (`docs/01-architecture.md`, `docs/03-decision-log.md`, `docs/04-agent-contracts.md`, `docs/07-scope-lock.md`, `ORIGINAL_REQUEST.md`).
   - Create `docs/09-parallel-build-contract.md` defining strict API schemas, data models, state management, and file boundaries for parallel execution.
   - Update `docs/03-decision-log.md` and `docs/07-scope-lock.md` per the golden rule.
2. **Phase 2: Parallel Workstream Execution**
   - **Workstream A (Frontend)**: Role-based views (Donor, Hospital Console, Government), mock auth, reactive dispatch feed.
   - **Workstream B (Backend/API)**: FastAPI routes (`/auth`, `/donors`, `/requests`, `/patients`, `/issues`, `/transfers`, `/reports/daily` with Gemini 3.5-flash).
   - **Workstream C (Storage/Data)**: Firestore schemas, audit logging, mock/seed data, data access layer.
   - **Workstream D (Deploy/Infra)**: Dockerfile, Cloud Run config, env vars, Makefile, README updates.
3. **Phase 3: E2E Integration & Verification**
   - Run full unit & integration test suites across all endpoints and UI flows.
   - Forensic audit to guarantee authentic implementation and zero regression on MVP.
4. **Phase 4: Synthesis & Reporting**
   - Compile final report and notify Sentinel.
