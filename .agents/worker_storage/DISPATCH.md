## 2026-08-29T16:35:18Z
You are Worker C (worker_storage) responsible for the Storage & Data Workstream (Milestone M1) of LifeLine Agent.

Workspace Root: c:\Users\shado\Documents\GitHub\ LifeLine Agent
Your Working Directory: c:\Users\shado\Documents\GitHub\ LifeLine Agent\.agents\worker_storage\
Authoritative Request: C:\Users\shado\.gemini\antigravity\brain\ee0aca1a-f7ca-4cf4-b62d-56b451fb669f\ORIGINAL_REQUEST.md
Parallel Build Contract: c:\Users\shado\Documents\GitHub\ LifeLine Agent\docs\09-parallel-build-contract.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

File Ownership: You own `lifeline/tools/data_store.py`, `lifeline/tools/firestore_client.py`, `lifeline/tools/seed_data.py`, `data/seed_data.json`, `data/hospitals.json`, and `tests/test_data_store.py`. DO NOT modify `frontend/`, `lifeline/routes/`, or `deploy/`.

Tasks:
1. Read `docs/09-parallel-build-contract.md` (Section 6: Firestore Collections & Schemas) and `lifeline/tools/firestore_client.py`.
2. Implement `lifeline/tools/data_store.py`:
   - Universal DataStore class providing asynchronous/synchronous CRUD operations across all 7 collections (`dispatch_cases`, `donors`, `requests`, `patients`, `issues`, `inventory`, `reports`).
   - Seamlessly uses live Google Cloud Firestore when configured (`GOOGLE_APPLICATION_CREDENTIALS` / initialized app) and automatically falls back to thread-safe in-memory storage seeded from `data/seed_data.json` when offline.
   - Enforces standard audit metadata injection (`_id`, `_timestamp`, `_version`, `_actor`).
3. Update `lifeline/tools/seed_data.py` and `data/seed_data.json`:
   - Rich realistic seed dataset for Mumbai Metro region:
     - 14 hospital facilities with coordinates, specialties, and bed stats.
     - 10+ registered donors covering O+, O-, A+, B+, AB- with donation history.
     - 5+ inbound and admitted patient cases with vitals and NEWS2 scores.
     - 3+ open emergency blood/organ requests.
     - 4+ operational equipment/facility issues.
     - 10+ medicine and blood unit inventory items with low-stock warnings.
     - 2+ historical AI daily intelligence reports.
4. Integrate with `lifeline/tools/firestore_client.py` so all existing audit logging calls use the enhanced DataStore.
5. Write tests in `tests/test_data_store.py` verifying in-memory CRUD, querying, audit metadata, and seeding.
6. Run `pytest tests/` to confirm all tests pass.
7. Write a handoff report to `c:\Users\shado\Documents\GitHub\ LifeLine Agent\.agents\worker_storage\handoff.md` and notify orchestrator via `send_message`.
