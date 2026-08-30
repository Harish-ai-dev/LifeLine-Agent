# Empirical Challenge Report — LifeLine Agent Platform Expansion

**Challenger**: Challenger 1 (`challenger_e2e_1`)  
**Date**: 2026-08-29  
**Target**: LifeLine Agent Expansion (All 18 REST Endpoints, Multi-Role Portal API, Edge Cases)  
**Contract Baseline**: `docs/09-parallel-build-contract.md`  
**Verdict**: **REQUEST_CHANGES** (Blocking Defects in `GET /patients` and `GET /issues`)

---

## Challenge Summary

**Overall risk assessment**: **HIGH**

While 16 out of 18 REST endpoints and the core multi-agent dispatch pipeline operate smoothly with robust fallbacks, **2 critical REST endpoints (`GET /patients` and `GET /issues`) fail with unhandled Pydantic `ValidationError` exceptions upon loading default database records**, causing 2 automated test failures in `tests/test_routes.py` and 4 test failures in `tests/test_challenger_e2e.py`.

The root cause is a schema mismatch between `data/seed_data.json` and `lifeline/schemas.py`:
1. `data/seed_data.json` defines patients with `"severity": "urgent"` and `"severity": "standard"`, whereas `PatientRecord.severity` is strictly constrained to `Literal["mild", "moderate", "critical"]`.
2. `data/seed_data.json` defines an issue with `"category": "supply"`, whereas `IssueRecord.category` is strictly constrained to `Literal["equipment", "facility", "staffing", "supplies", "it"]`.

---

## Challenges

### [High] Challenge 1: `GET /patients` Server Crash on Seed Data Query

- **Assumption challenged**: Assumed that all patient records stored in Firestore / DataStore conform to the strict Pydantic `PatientRecord` schema.
- **Attack scenario**: A frontend client for the Hospital Console calls `GET /patients` without filters on initial dashboard load.
- **Blast radius**: The endpoint iterates over `patients` and attempts `filtered.append(PatientRecord(**p))`. It crashes with `pydantic_core._pydantic_core.ValidationError: 1 validation error for PatientRecord: severity Input should be 'mild', 'moderate' or 'critical' [type=literal_error, input_value='urgent', input_type=str]`. The Hospital Staff portal fails to load incoming or admitted patient lists.
- **Affected Records**:
  - `pat_1095` (`data/seed_data.json:801`): `"severity": "urgent"`
  - `pat_1096` (`data/seed_data.json:831`): `"severity": "urgent"`
  - `pat_1097` (`data/seed_data.json:861`): `"severity": "standard"`
- **Mitigation**:
  - Update `data/seed_data.json` lines 801, 831, 861 to valid severity values: `moderate` (for `pat_1095`, `pat_1096`) and `mild` (for `pat_1097`).
  - Add defensive data-coercion/filtering in `lifeline/routes/patients.py` or fallback handling when instantiating `PatientRecord`.

---

### [High] Challenge 2: `GET /issues` Server Crash on Seed Data Query

- **Assumption challenged**: Assumed that all issue records stored in Firestore / DataStore conform to `IssueRecord` category literal definitions.
- **Attack scenario**: A hospital operator opens the Issues Log board triggering `GET /issues`.
- **Blast radius**: The endpoint crashes with `pydantic_core._pydantic_core.ValidationError: 1 validation error for IssueRecord: category Input should be 'equipment', 'facility', 'staffing', 'supplies' or 'it' [type=literal_error, input_value='supply', input_type=str]`.
- **Affected Records**:
  - `iss_505` (`data/seed_data.json:954`): `"category": "supply"` (singular instead of `"supplies"`).
- **Mitigation**:
  - Update `data/seed_data.json:954` to `"category": "supplies"`.
  - Alternatively, expand `lifeline/schemas.py` `IssueRecord.category` to accept `"supply"` and `"supplies"`.

---

### [Low] Challenge 3: Deprecation Warnings for Timezone-Naive UTC Datetimes

- **Assumption challenged**: `datetime.datetime.utcnow()` is widely used across route handlers and agents.
- **Attack scenario**: Running on Python 3.14 emits 12+ `DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in Python 3.17. Use datetime.datetime.now(datetime.UTC)`.
- **Blast radius**: Non-breaking currently, but causes noisy logs and eventual breakage in Python 3.17+.
- **Mitigation**: Replace `datetime.datetime.utcnow()` with `datetime.datetime.now(datetime.UTC)` across `lifeline/routes/` and `lifeline/agents/`.

---

## Stress Test Results

| Test ID | Scenario | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|---|
| **E2E-01** | `POST /auth/login` for all 3 roles (`hospital_staff`, `blood_donor`, `government_authority`) | 200 OK + `lifeline_mock_<role>_*` token | 200 OK with role-specific payload | **PASS** |
| **E2E-02** | `GET /auth/me` with valid bearer token | 200 OK + current user profile | 200 OK matching logged in user | **PASS** |
| **E2E-03** | `GET /auth/me` without Authorization header | 401 Unauthorized | 401 Unauthorized (`{"detail": "...", "code": "UNAUTHORIZED"}`) | **PASS** |
| **E2E-04** | `POST /donors` donor registration | 201 Created + ID + badge title | 201 Created with auto-generated ID | **PASS** |
| **E2E-05** | `GET /donors/:id` fetch donor dossier | 200 OK + donation history | 200 OK with donation history | **PASS** |
| **E2E-06** | `GET /donors/:id` with non-existent ID | 404 Not Found (`RESOURCE_NOT_FOUND`) | 404 Not Found with error schema | **PASS** |
| **E2E-07** | `GET /requests` list open resource requests | 200 OK + request list | 200 OK with active requests | **PASS** |
| **E2E-08** | `POST /requests` raise urgent blood request | 201 Created + REQ tracking number | 201 Created with tracking number | **PASS** |
| **E2E-09** | `POST /requests/:id/respond` (accept) | 200 OK + status -> `matched` + donor linked | 200 OK, request matched, donor updated | **PASS** |
| **E2E-10** | `POST /requests/:id/respond` (decline) | 200 OK + status remains `open` | 200 OK, request remains open | **PASS** |
| **E2E-11** | `POST /requests/:id/respond` on fulfilled request | 409 Conflict (`CONFLICT`) | 409 Conflict | **PASS** |
| **E2E-12** | `GET /patients` query active emergency patients | 200 OK + patient dossiers | **CRASH (500 / ValidationError on seed data)** | **FAIL** |
| **E2E-13** | `PATCH /patients/:id` update post-arrival status | 200 OK + updated record | 200 OK with updated status & notes | **PASS** |
| **E2E-14** | `POST /beds/:id/reserve` advance bed reservation | 200 OK + status `reserved` | 200 OK, bed & patient linked | **PASS** |
| **E2E-15** | `POST /cases/:id/transfer` (bed shortage reroute) | 200 OK + reroutes away from overloaded hospital | 200 OK, Lilavati excluded, Hinduja chosen, patient marked `transferred`, audit written | **PASS** |
| **E2E-16** | `GET /issues` list hospital issues | 200 OK + issues list | **CRASH (500 / ValidationError on seed data)** | **FAIL** |
| **E2E-17** | `POST /issues` create operational issue | 201 Created + issue ID | 201 Created | **PASS** |
| **E2E-18** | `PATCH /issues/:id` resolve issue | 200 OK + `status: resolved` + `resolved_at` | 200 OK with timestamp | **PASS** |
| **E2E-19** | `GET /inventory` list stock with low-stock flags | 200 OK + dynamic `is_low_stock` | 200 OK with accurate flags | **PASS** |
| **E2E-20** | `PATCH /inventory/:id` update stock count | 200 OK + recalculated low-stock | 200 OK with recalculated flag | **PASS** |
| **E2E-21** | `GET /network/overview` regional health telemetry | 200 OK + 14 hospital summaries + metrics | 200 OK, 14 hospitals aggregated | **PASS** |
| **E2E-22** | `GET /reports/daily` AI executive report | 200 OK + `gemini-3.5-flash` summary | 200 OK with markdown summary | **PASS** |
| **E2E-23** | `POST /reports/query` natural language Q&A | 200 OK + answer + facility list | 200 OK with referenced facilities | **PASS** |
| **E2E-24** | `POST /sos` emergency intake | 200 OK + `alert_id` + patient record | 200 OK with auto patient creation | **PASS** |
| **E2E-25** | `POST /dispatch` full multi-agent pipeline | 200 OK + NEWS2 + Triage + Bed + Routing | 200 OK with full pipeline output | **PASS** |
| **E2E-26** | `GET /health` health & version probe | 200 OK (`status: ok`, `0.1.0`) | 200 OK | **PASS** |
| **NEWS2-01** | Normal vitals (Score 0) | score = 0, risk_band = `low` | score = 0, risk_band = `low` | **PASS** |
| **NEWS2-02** | Extreme vitals (Max Score 18-20) | score >= 18, risk_band = `high` | score = 18, risk_band = `high` | **PASS** |
| **NEWS2-03** | Single parameter trigger = 3 | score = 3, elevated risk flag | score = 3 | **PASS** |
| **NEWS2-04** | Medium score (Score 5) | score = 5, risk_band = `medium` | score = 5, risk_band = `medium` | **PASS** |
| **AI-FALLBACK-01** | Missing `GOOGLE_API_KEY` Daily Report | Clean fallback adhering to `DailyReportResponse` | Clean fallback adhering to schema | **PASS** |
| **AI-FALLBACK-02** | Missing `GOOGLE_API_KEY` Report Query | Clean fallback answering domain questions | Clean fallback answering domain questions | **PASS** |

---

## Unchallenged Areas

- **Live Vertex AI / Cloud Run deployment**: Live deployment to GCP Cloud Run requires active Google Cloud billing credentials and service accounts, which are exercised via Dockerfile / configuration validation rather than live cloud provisioning in this local test pass.
- **Frontend UI rendering**: Challenger tested backend API endpoints and data layer contracts; frontend UI DOM rendering is verified separately by UI test harness.

---

## Recommendation & Action Items

To achieve 100% clean test passage and unlock full `APPROVE` verdict:
1. **Fix `data/seed_data.json`**:
   - Change `pat_1095.severity` from `"urgent"` to `"moderate"`.
   - Change `pat_1096.severity` from `"urgent"` to `"moderate"`.
   - Change `pat_1097.severity` from `"standard"` to `"mild"`.
   - Change `iss_505.category` from `"supply"` to `"supplies"`.
2. **Re-run `python -m pytest tests/ -v`** to confirm 100% (53/53) tests pass.
