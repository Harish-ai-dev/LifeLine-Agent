# Milestone M0 Review Report — LifeLine Agent Expansion

**Reviewer**: `reviewer_m0_2` (Reviewer & Critic)  
**Date**: 2026-08-29  
**Milestone**: M0 (Planning, Scope-Lock, and Parallel Build Contract)  
**Target Documents**:
- `docs/09-parallel-build-contract.md`
- `docs/03-decision-log.md`
- `docs/07-scope-lock.md`

---

## 1. Review Summary

**Verdict**: **`APPROVE`**

### Summary Assessment
Milestone M0 documentation artifacts (`docs/09-parallel-build-contract.md`, `docs/03-decision-log.md`, and `docs/07-scope-lock.md`) establish a rock-solid, unambiguous, and authoritative interface contract for parallel sub-agent execution. 

Key strengths:
1. **Model Compliance**: Exact assignments of `gemini-3.1-pro` for clinical Triage and `gemini-3.5-flash` for Bed-Matching, Routing, Briefing, and Regional Intelligence Reports are maintained consistently across all documentation and `lifeline/models.py`.
2. **Deterministic Grounding & Zero Regressions**: The existing multi-agent emergency pipeline (`NEWS2` -> `Triage` -> `Bed-Matching` -> `Routing` -> `Briefing` -> `Firestore`) remains intact, and the new multi-role endpoints build upon it without disrupting the working baseline.
3. **Role & Endpoint Clarity**: Role identifiers (`blood_donor`, `hospital_staff`, `government_authority`), mock authentication token formats (`lifeline_mock_<role>_<uid>`), REST schemas, and Firestore collection definitions are comprehensively specified with concrete JSON examples.
4. **File Ownership Isolation**: Strict boundaries for Sub-Agents A (Frontend), B (Backend/API), C (Storage/Data), and D (Deploy/Infra) are clearly locked to prevent merge conflicts during parallel execution.

---

## 2. Detailed Verification Checklist

| Check Category | Contract / Doc Spec | Codebase Alignment | Status |
|---|---|---|---|
| **Gemini Models** | `gemini-3.1-pro` (Triage), `gemini-3.5-flash` (all others + `/reports/*`) | `lifeline/models.py` (`TRIAGE_MODEL`, `DEFAULT_MODEL`) | ✅ **VERIFIED** |
| **Role Definitions** | `blood_donor`, `hospital_staff`, `government_authority` | Consistent across `09-parallel-build-contract.md`, `03-decision-log.md`, `07-scope-lock.md` | ✅ **VERIFIED** |
| **Error Schemas** | Standard `{ "detail": "...", "code": "..." }` + HTTP 200/201/400/401/403/404/409/422/500 | Standard FastAPI HTTP exception pattern | ✅ **VERIFIED** |
| **Core Pipeline Compatibility** | `POST /dispatch`, `POST /sos` | Matches `lifeline/schemas.py` (`DispatchRequest`, `TriageOutput`, `BedMatchingOutput`, etc.) and `lifeline/orchestrator.py` | ✅ **VERIFIED** |
| **Firestore Collections** | `dispatch_cases`, `donors`, `requests`, `patients`, `issues`, `inventory`, `reports` with `_id`, `_timestamp`, `_version`, `_actor` | Extended from existing `dispatch_cases` audit logging pattern in `lifeline/tools/firestore_client.py` | ✅ **VERIFIED** |
| **Workstream Boundaries** | Matrix in Section 8 of `09-parallel-build-contract.md` cleanly splits Frontend, Backend, Storage, Deploy | Zero overlapping file writes across sub-agents | ✅ **VERIFIED** |
| **Integrity & Cheating Checks** | Real NEWS2 clinical calculations, real OSRM and OSM data fetching, genuine ADK LLM Agents with graceful fallbacks | No facades, hardcoded answers, or fabricated proofs | ✅ **VERIFIED** |
| **AGENTS.md Compliance** | `docs/` contains ONLY `.md` markdown files | 9 `.md` files in `docs/`, no code/binaries | ✅ **VERIFIED** |

---

## 3. Findings & Recommendations (Minor / Non-Blocking)

### [Minor] Finding 1 — Consciousness Value Permissiveness in Pydantic Schema
- **What**: In `lifeline/schemas.py`, `Vitals.consciousness` is typed as `Literal["alert", "confused", "unresponsive"]`, whereas `frontend/src/types/dashboard.ts` uses `'alert' | 'voice' | 'pain' | 'unresponsive'` (standard AVPU), and Royal College of Physicians NEWS2 uses ACVPU.
- **Where**: `lifeline/schemas.py:16`, `lifeline/tools/news2.py:108`
- **Impact**: If a client sends `"voice"` or `"pain"` into `POST /dispatch` or `POST /sos`, FastAPI will return a `422 Unprocessable Entity` validation error even though `news2.py` handles any non-`"alert"` value as score 3.
- **Suggestion**: When Sub-Agent B updates `lifeline/schemas.py`, update `Vitals.consciousness` to:
  `consciousness: Literal["alert", "confused", "voice", "pain", "unresponsive"]` (or `str` with custom validator).

### [Minor] Finding 2 — Hospital Facility & Bed Reservation ID Parameter
- **What**: `POST /beds/:id/reserve` uses a URL parameter `:id`, while the body payload contains `patient_id`, `hospital_id`, `bed_type`, and `bay_id`.
- **Where**: `docs/09-parallel-build-contract.md:359-380`
- **Impact**: Minor ambiguity on whether `:id` represents `bed_id` or `hospital_id`.
- **Suggestion**: Sub-Agent B can bind `:id` as either `bed_id` or `hospital_id` (e.g. `POST /beds/{bed_id}/reserve` or `POST /facilities/{hospital_id}/beds/reserve`), while accepting the full payload body as specified.

---

## 4. Adversarial Attack Surface & Stress-Test Analysis

1. **Offline / Cold Start Resilience**:
   - *Attack*: Cloud Run starts with missing `GOOGLE_API_KEY` or unavailable Firebase credentials.
   - *Verification*: Agents in `lifeline/agents/` have robust deterministic fallbacks (NEWS2 rule engine, nearest OSRM distance fallback, deterministic briefing generator). Firestore client logs a warning and falls back to in-memory/mock ID generation.
   - *Result*: Pass.

2. **Concurrency & Race Conditions during Multi-Agent Parallel Build**:
   - *Attack*: Sub-Agent B (Backend) and Sub-Agent C (Storage) modifying same client files.
   - *Verification*: Section 8 explicitly allocates `lifeline/tools/*_client.py` and `lifeline/firebase.py` to Sub-Agent C, while Sub-Agent B consumes these via clean imports and implements FastAPI routes in `lifeline/routes/` and `lifeline/main.py`.
   - *Result*: Pass.

3. **Role Escalation & Unauthorized Access**:
   - *Attack*: A `blood_donor` token attempting to hit `/patients` or `/beds/:id/reserve`.
   - *Verification*: Contract specifies HTTP `403 Forbidden` (`INSUFFICIENT_ROLE_PERMISSIONS`) and role guards.
   - *Result*: Pass.

---

## 5. Explicit Review Verdict

**`APPROVE`** — Milestone M0 documents and parallel build contract are fully compliant, robust, and ready for concurrent multi-agent execution (Sub-Agents A, B, C, D).
