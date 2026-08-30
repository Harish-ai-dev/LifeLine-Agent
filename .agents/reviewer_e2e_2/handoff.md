# Handoff Report — Reviewer 2 (reviewer_e2e_2)

## 1. Observation
- **Test Executions**:
  - `python -m pytest -v`: 51 PASSED, 2 FAILED (78.85s).
    - Failed: `tests/test_routes.py::test_patients_list_and_update` with `ValidationError: 1 validation error for PatientRecord - severity: Input should be 'mild', 'moderate' or 'critical' [type=literal_error, input_value='urgent', input_type=str]` in `lifeline/routes/patients.py:47`.
    - Failed: `tests/test_routes.py::test_issues_crud` with `ValidationError: 1 validation error for IssueRecord - category: Input should be 'equipment', 'facility', 'staffing', 'supplies' or 'it' [type=literal_error, input_value='supply', input_type=str]` in `lifeline/routes/issues.py:56`.
  - `python .agents/reviewer_e2e_2/adversarial_audit.py`: 51/51 PASSED (100%).
- **Codebase Audits**:
  - `lifeline/models.py`: `TRIAGE_MODEL = "gemini-3.1-pro"`, `DEFAULT_MODEL = "gemini-3.5-flash"`, `FALLBACK_MODEL = "gemini-3.7-flash"`.
  - `lifeline/routes/auth.py`: `VALID_ROLES = {"blood_donor", "hospital_staff", "government_authority"}`. Bearer token format parsed: `lifeline_mock_<role>_<uid>`.
  - `lifeline/main.py`: `custom_http_exception_handler` and `validation_exception_handler` ensure all errors return `{"detail": "...", "code": "..."}`.
  - `data/seed_data.json`:
    - Lines 801, 831: `"severity": "urgent"`
    - Line 861: `"severity": "standard"`
    - Line 954: `"category": "supply"`

## 2. Logic Chain
1. `docs/09-parallel-build-contract.md` and `lifeline/schemas.py` lock `PatientRecord.severity` to `Literal["mild", "moderate", "critical"]` and `IssueRecord.category` to `Literal["equipment", "facility", "staffing", "supplies", "it"]`.
2. When the FastAPI application loads seed data from `data/seed_data.json`, `DataStore` successfully stores the raw dictionaries.
3. However, when route handlers `GET /patients` and `GET /issues` query the store and instantiate Pydantic models `PatientRecord(**p)` and `IssueRecord(**issue)`, Pydantic performs runtime validation.
4. Because the raw seed items contain `"urgent"`, `"standard"`, and `"supply"`, Pydantic raises `ValidationError`, causing the endpoints to return HTTP 500 / error on valid GET requests.
5. All other systems (auth, mock tokens, model tiering, offline fallback, agent reasoning, NEWS2 calculations, and frontend views) comply 100% with the interface contract.

## 3. Caveats
- No live Firebase or live Gemini API keys were present in the test environment. Live API calls were not evaluated against Google Cloud production servers, but the offline fallback paths and error handlers were thoroughly stress-tested and verified.

## 4. Conclusion
- **Verdict**: `REQUEST_CHANGES`
- The system architecture, agent contracts, error format, role schemas, and offline resilience are rock solid.
- To achieve 100% test pass rate and full release readiness, the seed data values in `data/seed_data.json` must be aligned with `lifeline/schemas.py`.

## 5. Verification Method
1. Fix `data/seed_data.json`:
   - Line 801: change `"urgent"` → `"critical"`
   - Line 831: change `"urgent"` → `"moderate"`
   - Line 861: change `"standard"` → `"mild"`
   - Line 954: change `"supply"` → `"supplies"`
2. Run the test commands:
   ```bash
   python -m pytest -v
   python .agents/reviewer_e2e_2/adversarial_audit.py
   ```
3. Invalidation condition: Any test failure in `pytest` or `adversarial_audit.py` invalidates this report.
