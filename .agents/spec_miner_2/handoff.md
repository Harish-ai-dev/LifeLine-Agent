# Handoff Report — Specification Mining for LifeLine Agent Expansion

- **Agent Name**: `spec_miner_2`
- **Role**: Specification Miner
- **Date**: 2026-08-29
- **Status**: Complete (Hard Handoff)

---

## 1. Observation

1. **Authoritative Request (`ORIGINAL_REQUEST.md`)**:
   - Master System Prompt states: "expanding the original 2-agent MVP (Triage + Bed-Matching) into a fuller product with three role-based experiences (Blood Donor, Hospital Console, Government Authority)... without breaking the existing, working Triage → Bed-Matching pipeline." (lines 49–53).
   - Non-negotiable hackathon requirements: "Gemini 3.5 or newer via Gemini API or Vertex AI (Triage Agent uses `gemini-3.1-pro`, all other agents use `gemini-3.5-flash`... Google ADK + Genkit... Cloud Run + Firestore)" (lines 32–36).
   - Four sub-agent workstreams defined: Sub-Agent A (Frontend), Sub-Agent B (Backend/API), Sub-Agent C (Storage/Data), Sub-Agent D (Deploy/Infra) (lines 114–225).

2. **Decision Log (`my-agent/docs/03-decision-log.md`)**:
   - Locked models: `gemini-3.1-pro` for Triage Agent, `gemini-3.5-flash` for all other agents (lines 8–9).
   - Frontend: React + TypeScript + Tailwind (line 19).
   - Deployment: Cloud Run + Firestore (lines 12–13).
   - Demo city: `mumbai` (line 18).

3. **Existing Agent Contracts (`my-agent/docs/04-agent-contracts.md` & `lifeline/schemas.py`)**:
   - Exact input/output shapes for `triage_agent` (vitals, NEWS2 score -> `severity_label`, `required_specialty`, `notes`), `bed_matching_agent` (triage result, patient location -> `chosen_hospital`, `reasoning`, `alternatives`), `routing_agent` (`eta_minutes`, `distance_km`, `route_summary`), `briefing_agent` (`pre_arrival_brief`), and `dispatch_cases` Firestore audit record.

4. **Existing Codebase State**:
   - `lifeline/orchestrator.py`: Implements `run_dispatch(case, patient_location)` chaining NEWS2 -> Triage -> Bed Match -> Routing -> Briefing -> Firestore audit record.
   - `lifeline/main.py`: Exposes `GET /health` and `POST /dispatch`.
   - `lifeline/models.py`: Centralized model mapping `AGENT_MODELS` with `gemini-3.1-pro` and `gemini-3.5-flash`.
   - `lifeline/tools/firestore_client.py`: Implements `write_audit_record(record)` with graceful offline fallback `mock_id = f"local_{uuid.uuid4().hex[:8]}"`.
   - `frontend/src/types/dashboard.ts`: Contains extensive TypeScript type definitions for `HospitalFacility`, `EmergencyIncidentAlert`, `DonorRequest`, `DonorProfile`, `JurisdictionAnalytics`, and `AuditEventLog`.
   - `pyproject.toml` and `Makefile`: Set up package dependencies (`google-adk`, `google-genai`, `fastapi`, `typer`, `firebase-admin`), CLI scripts, and make targets.

---

## 2. Logic Chain

1. **Backward Compatibility & Pipeline Preservation**:
   - *Premise*: The existing Triage → Bed-Matching → Routing → Briefing pipeline is functional and verified by unit tests in `tests/`.
   - *Inference*: The new endpoints (`/auth`, `/donors`, `/requests`, `/patients`, `/issues`, `/transfers`, `/reports/daily`, `/network/overview`) must be added in modular routers under `lifeline/routes/` without modifying the core `run_dispatch()` signature or payload schema.

2. **Decoupled Parallel Development**:
   - *Premise*: Four sub-agents will implement features concurrently.
   - *Inference*: Clear file and module boundaries are mandatory. Sub-Agent A touches `frontend/` only; Sub-Agent B touches `lifeline/routes/` and `lifeline/main.py`; Sub-Agent C touches `lifeline/tools/firestore_client.py`, `lifeline/tools/data_store.py`, and `lifeline/tools/seed_data.py`; Sub-Agent D touches `deploy/`, `Makefile`, `.env.example`, and `lifeline/cli.py`.

3. **Offline & Test Resilience**:
   - *Premise*: Unit test runs in CI or local evaluations may lack live Google Cloud credentials or Gemini API keys.
   - *Inference*: Every component (LLM calls, Firestore storage, authentication) must feature an automatic deterministic / in-memory fallback mode so tests and demos run without failure.

4. **Multi-Role Portal UX**:
   - *Premise*: Three distinct user personas (Blood Donor, Hospital Staff, Government Authority) require distinct information density and visual hierarchy.
   - *Inference*: The frontend must feature a dedicated role switcher/auth state gating three distinct views: lightweight mobile-first for Donor, high-density dark clinical for Hospital Console, and executive KPI/AI reporting for Government.

---

## 3. Caveats

1. **Live EHR Integration**: Real hospital HL7/FHIR systems remain strictly out-of-scope per `my-agent/docs/07-scope-lock.md`. Simulated bed data and OpenStreetMap hospital coordinates are used.
2. **Next.js vs. Streamlit**: The original hackathon draft mentioned Streamlit, but `my-agent/docs/03-decision-log.md` (Decision 19) locked `React + Vite / Next.js` for best multimodal UX. The specification accommodates the React/TypeScript frontend present in `frontend/`.
3. **External Routes API**: Routing uses OSRM demo server and Haversine distance fallbacks so no paid Google Maps billing is required for judging.

---

## 4. Conclusion

The 4 workstreams have been fully specified in `.agents/spec_miner_2/workstreams_spec.md`:
- **Sub-Agent A (Frontend)**: Role-gated portal (Donor, Hospital, Government), mock auth switcher, 3-stage agent progression feed, bed reservation UI, issue board, inventory gauges, and AI query console.
- **Sub-Agent B (Backend/API)**: Modular FastAPI routers (`/auth`, `/donors`, `/requests`, `/patients`, `/issues`, `/transfers`, `/reports/daily`, `/network/overview`), Pydantic schemas, and Gemini 3.5-flash integration with fallback.
- **Sub-Agent C (Storage/Data)**: Canonical Firestore collection schemas, universal in-memory/offline `DataStore` adapter, and rich realistic seed loader for Mumbai.
- **Sub-Agent D (Deploy/Infra)**: Production Dockerfile, Cloud Run configuration, complete `.env.example`, unified Makefile targets, and rich Typer CLI commands with Windows UTF-8 safety.

All specifications are locked, backward-compatible, and ready for parallel execution by sub-agents.

---

## 5. Verification Method

To verify the specifications and implementation:
1. **Inspect Specification Artifact**:
   - Check `c:\Users\shado\Documents\GitHub\ LifeLine Agent\.agents\spec_miner_2\workstreams_spec.md` for complete schemas, endpoint shapes, and workstream assignments.
2. **Execute Current Unit Tests**:
   - Command: `pytest tests/ -v`
   - Expected Result: All existing unit tests pass cleanly (NEWS2, Triage, Bed-Matching, Routing & Briefing).
3. **Verify CLI Health Status**:
   - Command: `python -m lifeline status` or `lifeline status`
   - Expected Result: System status dashboard renders without UTF-8 encoding errors.
