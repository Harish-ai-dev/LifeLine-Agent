# Handoff Report — Codebase Survey & Architecture Boundary Mapping

**Agent**: `explorer_1` (Codebase Explorer)  
**Recipient**: `parent` (Orchestrator, ID: `0cd2652f-dd29-4279-a0c5-b5857344f55f`)  
**Timestamp**: `2026-08-29T16:32:00Z`  
**Handoff Type**: Hard (Task Complete)  

---

## 1. Observation

1. **Working Dispatch Pipeline**:
   - `lifeline/main.py:30-50`: Exposes `POST /dispatch` which parses `Case` and `Location` payloads and calls `run_dispatch(case_obj, loc_obj)` in `lifeline/orchestrator.py`.
   - `lifeline/orchestrator.py:18-84`: Coordinates `news2_score()` (`lifeline/tools/news2.py`), `run_triage()` (`lifeline/agents/triage_agent.py`), `run_bed_matching()` (`lifeline/agents/bed_matching_agent.py`), `run_routing()` (`lifeline/agents/routing_agent.py`), `run_briefing()` (`lifeline/agents/briefing_agent.py`), and `write_audit_record()` (`lifeline/tools/firestore_client.py`).
   - `lifeline/models.py:16-30`: Assigns `TRIAGE_MODEL = "gemini-3.1-pro"` for `triage_agent` and `DEFAULT_MODEL = "gemini-3.5-flash"` for all other agents (`bed_matching_agent`, `routing_agent`, `briefing_agent`).

2. **Existing Test Suite Baseline**:
   - 4 test files located in `tests/`: `test_news2.py` (3 tests), `test_triage_agent.py` (2 tests), `test_bed_matching_agent.py` (3 tests), and `test_routing_and_briefing.py` (2 tests).
   - Tests run fully offline without live Gemini API or network dependencies thanks to deterministic fallbacks in `triage_agent.py:130-156` and `bed_matching_agent.py:84-105, 215-238`.

3. **Frontend & Admin Implementations**:
   - `frontend/`: Full Next.js 14 / React 18 / TypeScript application with TailwindCSS, Leaflet maps, Recharts, and Lucide icons (`frontend/package.json`).
   - `frontend/src/app/page.tsx:80-165` and `frontend/src/context/DashboardContext.tsx:1-1105`: Contain rich state management for `hospital` (Hospital Console), `authority` (Government Oversight), `donor` (Donor Network), and `patient-simulator`.
   - `admin/`: Streamlit superadmin interface (`admin/superadmin.py`) backed by machine-locked AES-256 Fernet encrypted config (`admin/config_manager.py:62-108`) and Firebase Auth REST client (`admin/auth.py:93-129`).

4. **Identified Technical Debt & Bugs**:
   - `deploy/Dockerfile:10`: `CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8080"]` -> references `src.main:app` instead of `lifeline.main:app`.
   - `lifeline/cli.py:413`: `ui_script = PROJECT_ROOT / "ui" / "streamlit_app.py"` -> references nonexistent `ui/` directory.
   - `my-agent/docs/` vs `docs/`: Architecture and decision documentation (`01-architecture.md`, `03-decision-log.md`, `04-agent-contracts.md`, `07-scope-lock.md`) are in `my-agent/docs/`, whereas `ORIGINAL_REQUEST.md` expects `docs/09-parallel-build-contract.md`.

---

## 2. Logic Chain

1. **Baseline Preservation**: Because `lifeline/main.py` and `lifeline/orchestrator.py` implement the core hackathon MVP (`POST /dispatch`), expanding the backend via modular FastAPI routers in `lifeline/routes/` attached to `lifeline/main.py` via `app.include_router()` will prevent any regressions in `/dispatch` or existing tests.
2. **Parallel Workstream Safety**: By separating ownership across files (`frontend/` for Sub-Agent A, `lifeline/routes/` + `lifeline/agents/` for Sub-Agent B, `lifeline/tools/*_client.py` + `data/` + `scripts/` for Sub-Agent C, and `deploy/` + `Makefile` + `start.py` for Sub-Agent D), all 4 sub-agents can work simultaneously without git merge conflicts.
3. **Contract Authority**: Writing `docs/09-parallel-build-contract.md` (and mirroring in `my-agent/docs/09-parallel-build-contract.md`) with explicit role strings (`blood_donor`, `hospital_staff`, `government_authority`), REST endpoints, Firestore collection schemas, and environment variables allows Sub-Agent A (Frontend) and Sub-Agent B (Backend) to build independently using typed stubs.

---

## 3. Caveats

- Live Gemini LLM calls require `GEMINI_API_KEY` set in environment or encrypted admin config; without it, agents execute deterministic fallback logic.
- Live Firestore writes require `GOOGLE_APPLICATION_CREDENTIALS` or Firebase service account; without it, `firestore_client.py` logs locally with mock IDs.
- No other caveats.

---

## 4. Conclusion

The codebase is in an excellent, highly organized state for parallel expansion. The core pipeline is well-modularized, deterministic fallbacks ensure testing reliability, and the frontend already contains well-structured UI prototypes for the three required roles. The project is ready for Phase 1 contract authoring (`docs/09-parallel-build-contract.md`) followed by the 4-subagent parallel build.

---

## 5. Verification Method

To verify the findings:
1. Inspect `lifeline/main.py`, `lifeline/orchestrator.py`, and `lifeline/schemas.py`.
2. Inspect `tests/` and run `pytest -v tests/` (all 10 tests should pass).
3. Inspect `frontend/package.json` and `frontend/src/context/DashboardContext.tsx`.
4. Check `deploy/Dockerfile` line 10 for the `src.main:app` reference.
5. Check `lifeline/cli.py` line 413 for the `ui/streamlit_app.py` reference.
6. Verify detailed analysis report at `.agents/explorer_1/codebase_analysis.md`.
