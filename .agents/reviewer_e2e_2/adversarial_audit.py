"""
LifeLine Agent — Adversarial Integration Test & Verification Script.
Author: Reviewer 2 (reviewer_e2e_2)
"""

import sys
import os
import json
import pytest
from fastapi.testclient import TestClient
from starlette.exceptions import HTTPException as StarletteHTTPException

# Add workspace root to sys.path
WORKSPACE_ROOT = r"c:\Users\shado\Documents\GitHub\ LifeLine Agent"
if WORKSPACE_ROOT not in sys.path:
    sys.path.insert(0, WORKSPACE_ROOT)

from lifeline.main import app
from lifeline.models import TRIAGE_MODEL, DEFAULT_MODEL, FALLBACK_MODEL, AGENT_MODELS
from lifeline.schemas import (
    UserRole,
    ErrorResponse,
    Case,
    Location,
    Vitals,
    News2Result,
    TriageInput,
    TriageOutput,
    BedMatchingInput,
    BedMatchingOutput,
    RoutingOutput,
    BriefingOutput,
    DailyReportResponse,
    ReportQueryResponse,
)
from lifeline.agents.triage_agent import run_triage
from lifeline.agents.bed_matching_agent import run_bed_matching
from lifeline.agents.routing_agent import run_routing
from lifeline.agents.briefing_agent import run_briefing
from lifeline.agents.reporting_agent import run_daily_report, run_report_query
from lifeline.tools.data_store import reset_data_store, get_data_store, DataStore

client = TestClient(app)

audit_results = {
    "model_compliance": {},
    "role_strings": {},
    "mock_token_format": {},
    "error_response_consistency": {},
    "offline_resilience": {},
    "integrity_checks": {},
}

def log_test(category, name, passed, details=""):
    audit_results[category][name] = {"passed": passed, "details": details}
    status_str = "[PASS]" if passed else "[FAIL]"
    print(f"{status_str} [{category}] {name}: {details}")


# ── 1. MODEL COMPLIANCE AUDIT ──────────────────────────────────────────────────
print("\n=== 1. MODEL COMPLIANCE AUDIT ===")

log_test("model_compliance", "Triage Agent Model", TRIAGE_MODEL == "gemini-3.1-pro", f"TRIAGE_MODEL={TRIAGE_MODEL}")
log_test("model_compliance", "Default Model (Bed, Brief, Report)", DEFAULT_MODEL == "gemini-3.5-flash", f"DEFAULT_MODEL={DEFAULT_MODEL}")
log_test("model_compliance", "Fallback Model", FALLBACK_MODEL == "gemini-3.7-flash", f"FALLBACK_MODEL={FALLBACK_MODEL}")
log_test("model_compliance", "AGENT_MODELS Mapping Triage", AGENT_MODELS.get("triage_agent") == "gemini-3.1-pro", f"triage_agent={AGENT_MODELS.get('triage_agent')}")
log_test("model_compliance", "AGENT_MODELS Mapping Bed-Matching", AGENT_MODELS.get("bed_matching_agent") == "gemini-3.5-flash", f"bed_matching_agent={AGENT_MODELS.get('bed_matching_agent')}")
log_test("model_compliance", "AGENT_MODELS Mapping Routing", AGENT_MODELS.get("routing_agent") == "gemini-3.5-flash", f"routing_agent={AGENT_MODELS.get('routing_agent')}")
log_test("model_compliance", "AGENT_MODELS Mapping Briefing", AGENT_MODELS.get("briefing_agent") == "gemini-3.5-flash", f"briefing_agent={AGENT_MODELS.get('briefing_agent')}")
log_test("model_compliance", "AGENT_MODELS Mapping Reporting", AGENT_MODELS.get("reporting_agent") == "gemini-3.5-flash", f"reporting_agent={AGENT_MODELS.get('reporting_agent')}")

# Check DailyReportResponse model default
sample_report = DailyReportResponse(
    report_id="rep_test",
    date="2026-08-29",
    headline="Test",
    summary_markdown="Test",
    key_metrics={"total_cases": 1, "critical_cases": 0, "sla_compliance_pct": 99.0, "auto_reroutes": 0},
    generated_at="2026-08-29T16:00:00Z",
)
log_test("model_compliance", "DailyReportResponse Default Model", sample_report.model_used == "gemini-3.5-flash", f"model_used={sample_report.model_used}")


# ── 2. ROLE STRINGS AUDIT ─────────────────────────────────────────────────────
print("\n=== 2. ROLE STRINGS AUDIT ===")

expected_roles = {"blood_donor", "hospital_staff", "government_authority"}
from typing import get_args
schema_roles = set(get_args(UserRole))
log_test("role_strings", "UserRole Schema Literal", schema_roles == expected_roles, f"schema_roles={schema_roles}")

from lifeline.routes.auth import VALID_ROLES
log_test("role_strings", "Auth Route VALID_ROLES", VALID_ROLES == expected_roles, f"VALID_ROLES={VALID_ROLES}")

# Adversarial role tests: reject invalid role strings
for bad_role in ["admin", "superadmin", "donor", "doctor", "hospital", "government", "gov_authority", "blood-donor", ""]:
    resp = client.post("/auth/login", json={"username": "attacker", "role": bad_role})
    passed = resp.status_code in [400, 422]
    log_test("role_strings", f"Reject invalid role '{bad_role}'", passed, f"status={resp.status_code}")


# ── 3. MOCK TOKEN FORMAT AUDIT ────────────────────────────────────────────────
print("\n=== 3. MOCK TOKEN FORMAT AUDIT ===")

# Test login for each valid role
for valid_role in expected_roles:
    resp = client.post("/auth/login", json={"username": "valid_user", "role": valid_role, "facility_id": "hosp_mumbai_01"})
    passed = resp.status_code == 200
    token = resp.json().get("token", "")
    token_valid = token.startswith(f"lifeline_mock_{valid_role}_")
    log_test("mock_token_format", f"Token generation for {valid_role}", passed and token_valid, f"token={token}")

    # Test /auth/me with valid Bearer token
    me_resp = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    me_passed = me_resp.status_code == 200 and me_resp.json().get("role") == valid_role
    log_test("mock_token_format", f"Token verification for {valid_role}", me_passed, f"user={me_resp.json()}")

# Adversarial mock token format challenges
bad_tokens = [
    ("No Bearer Prefix", "lifeline_mock_hospital_staff_usr_123", 401),
    ("Invalid Prefix", "Bearer my_secret_token_123", 401),
    ("Unknown Role in Token", "Bearer lifeline_mock_superadmin_usr_123", 401),
    ("Malformed Short Token", "Bearer lifeline_mock_hospital", 401),
    ("Empty Bearer", "Bearer ", 401),
    ("No Header", None, 401),
]

for name, header_val, expected_status in bad_tokens:
    headers = {"Authorization": header_val} if header_val is not None else {}
    resp = client.get("/auth/me", headers=headers)
    passed = resp.status_code == expected_status
    body = resp.json()
    has_error_shape = "detail" in body and "code" in body
    log_test("mock_token_format", f"Adversarial token: {name}", passed and has_error_shape, f"status={resp.status_code}, body={body}")


# ── 4. ERROR RESPONSE CONSISTENCY AUDIT ─────────────────────────────────────────
print("\n=== 4. ERROR RESPONSE CONSISTENCY AUDIT ===")

error_scenarios = [
    ("400 Bad Request (Invalid Query)", "/reports/query", "POST", {"query": "   "}, 400, "BAD_REQUEST"),
    ("401 Unauthorized (Missing Token)", "/auth/me", "GET", None, 401, "UNAUTHORIZED"),
    ("404 Not Found (Missing Donor)", "/donors/donor_ghost_9999", "GET", None, 404, "RESOURCE_NOT_FOUND"),
    ("404 Not Found (Missing Patient)", "/patients/pat_ghost_9999", "PATCH", {"admission_status": "admitted"}, 404, "RESOURCE_NOT_FOUND"),
    ("404 Not Found (Missing Issue)", "/issues/iss_ghost_9999", "PATCH", {"status": "resolved"}, 404, "RESOURCE_NOT_FOUND"),
    ("404 Not Found (Missing Inventory)", "/inventory/inv_ghost_9999", "PATCH", {"current_stock": 5}, 404, "RESOURCE_NOT_FOUND"),
    ("404 Not Found (Missing Request Respond)", "/requests/req_ghost_9999/respond", "POST", {"donor_id": "donor_01", "response_status": "accepted"}, 404, "RESOURCE_NOT_FOUND"),
    ("422 Validation Error (Missing required fields)", "/donors", "POST", {"full_name": "Incomplete"}, 422, "VALIDATION_ERROR"),
    ("422 Validation Error (Invalid Vitals Schema)", "/patients/pat_1092", "PATCH", {"admission_status": "INVALID_STATUS"}, 422, "VALIDATION_ERROR"),
]

for name, path, method, payload, expected_status, expected_code in error_scenarios:
    if method == "GET":
        resp = client.get(path)
    elif method == "POST":
        resp = client.post(path, json=payload)
    elif method == "PATCH":
        resp = client.patch(path, json=payload)
    
    passed_status = resp.status_code == expected_status
    body = resp.json()
    has_detail = "detail" in body
    has_code = "code" in body
    correct_code = body.get("code") == expected_code
    passed = passed_status and has_detail and has_code and correct_code
    log_test("error_response_consistency", name, passed, f"status={resp.status_code}, code={body.get('code')}, detail={body.get('detail')}")

# Test 409 Conflict: Fulfill request and try responding again
reset_data_store()
# Create and fulfill request
created_req = client.post("/requests", json={
    "hospital_id": "hosp_mumbai_01",
    "hospital_name": "Lilavati Hospital",
    "type": "blood",
    "blood_group_needed": "O-",
    "units_requested": 1,
    "urgency": "STAT_CRITICAL",
}).json()
req_id = created_req["id"]
# Update request in store to 'fulfilled'
store = get_data_store()
store.update("requests", req_id, {"status": "fulfilled"})
# Try responding
resp_409 = client.post(f"/requests/{req_id}/respond", json={"donor_id": "donor_6721", "response_status": "accepted"})
passed_409 = resp_409.status_code == 409 and resp_409.json().get("code") == "CONFLICT"
log_test("error_response_consistency", "409 Conflict (Request already fulfilled)", passed_409, f"status={resp_409.status_code}, body={resp_409.json()}")


# ── 5. OFFLINE / DEV RESILIENCE AUDIT ───────────────────────────────────────────
print("\n=== 5. OFFLINE / DEV RESILIENCE AUDIT ===")

# Test all agent runners with live Gemini disabled / missing keys
test_vitals = Vitals(heart_rate=118, respiratory_rate=24, systolic_bp=88, spo2=91, temperature_c=38.6, consciousness="alert")
test_case = Case(patient_age=54, vitals=test_vitals, chief_complaint="Acute crushing chest pain")
test_news2 = News2Result(score=9, risk_band="high")
test_triage_input = TriageInput(patient_age=54, vitals=test_vitals, chief_complaint="Acute crushing chest pain", news2_score=test_news2)

# 1. Triage Agent Offline Fallback
triage_out = run_triage(test_triage_input)
log_test("offline_resilience", "Triage Agent offline fallback", isinstance(triage_out, TriageOutput) and triage_out.severity_label == "critical" and triage_out.required_specialty == "cardiac", f"out={triage_out}")

# 2. Bed-Matching Agent Offline Fallback
test_loc = Location(lat=19.055, lng=72.840)
bed_input = BedMatchingInput(triage_result=triage_out, patient_location=test_loc)
bed_out = run_bed_matching(bed_input)
log_test("offline_resilience", "Bed-Matching Agent offline fallback", isinstance(bed_out, BedMatchingOutput) and bed_out.chosen_hospital is not None, f"hospital={bed_out.chosen_hospital.name}")

# 3. Routing Agent Fallback
routing_out = run_routing(test_loc, Location(lat=19.052, lng=72.833))
log_test("offline_resilience", "Routing Agent fallback", isinstance(routing_out, RoutingOutput) and routing_out.distance_km > 0, f"routing={routing_out}")

# 4. Briefing Agent Fallback
briefing_out = run_briefing(test_case, triage_out, bed_out, routing_out)
log_test("offline_resilience", "Briefing Agent fallback", isinstance(briefing_out, BriefingOutput) and len(briefing_out.pre_arrival_brief) > 20, f"brief={briefing_out.pre_arrival_brief}")

# 5. Reporting Agent Fallback
dummy_telemetry = {
    "total_incidents_today": 48,
    "active_critical_alerts": 7,
    "jurisdiction_sla_compliance_percent": 97.2,
    "mean_response_time_seconds": 44.5,
    "total_hospitals_registered": 14,
    "hospitals_on_diversion": 1,
    "tier2_escalation_count": 0,
    "overall_district_bed_capacity_percent": 82.4,
    "total_registered_donors": 184,
    "active_donor_requests": 3,
    "blood_units_fulfilled_today": 12,
    "hospital_summaries": [{"id": "hosp_mumbai_01", "name": "Lilavati Hospital", "available_icu_beds": 1}],
}
report_out = run_daily_report(dummy_telemetry)
log_test("offline_resilience", "Daily Report offline fallback", isinstance(report_out, DailyReportResponse) and report_out.model_used == "gemini-3.5-flash", f"headline={report_out.headline}")

query_out = run_report_query("Which hospitals have cardiac bed shortages?", dummy_telemetry)
log_test("offline_resilience", "Report Query offline fallback", isinstance(query_out, ReportQueryResponse) and len(query_out.referenced_facilities) > 0, f"answer={query_out.answer}")

# 6. DataStore In-Memory Fallback
store = reset_data_store()
log_test("offline_resilience", "DataStore in-memory auto-seed", store.count("hospitals") == 14 and store.count("donors") >= 10, f"counts: hosp={store.count('hospitals')}, donors={store.count('donors')}")


# ── 6. INTEGRITY AUDIT ────────────────────────────────────────────────────────
print("\n=== 6. INTEGRITY AUDIT ===")

# Check if code has hardcoded bypasses or facade implementations
# Verify NEWS2 calculation logic is real
from lifeline.tools.news2 import news2_score
n2_low = news2_score(Vitals(heart_rate=72, respiratory_rate=14, systolic_bp=120, spo2=98, temperature_c=37.0, consciousness="alert"))
n2_high = news2_score(Vitals(heart_rate=135, respiratory_rate=28, systolic_bp=80, spo2=88, temperature_c=39.2, consciousness="unresponsive"))
log_test("integrity_checks", "NEWS2 deterministic engine calculation", n2_low.score == 0 and n2_low.risk_band == "low" and n2_high.score >= 11 and n2_high.risk_band == "high", f"low={n2_low.score}, high={n2_high.score}")

# Verify Transfer Logic filters out previous hospital
transfer_resp = client.post("/cases/CASE-9021/transfer", json={
    "current_hospital_id": "hosp_mumbai_01",
    "reason": "ICU saturation",
    "patient_location": {"lat": 19.052, "lng": 72.833},
}).json()
dest_hosp = transfer_resp.get("transferred_to_hospital", {}).get("name", "")
prev_hosp = transfer_resp.get("previous_hospital", "")
log_test("integrity_checks", "Transfer Reroute selects alternative hospital", dest_hosp != prev_hosp and len(dest_hosp) > 0, f"prev={prev_hosp}, dest={dest_hosp}")


# ── SUMMARY ───────────────────────────────────────────────────────────────────
print("\n=== AUDIT SUMMARY ===")
total_tests = 0
passed_tests = 0
for cat, tests in audit_results.items():
    cat_total = len(tests)
    cat_passed = sum(1 for t in tests.values() if t["passed"])
    total_tests += cat_total
    passed_tests += cat_passed
    print(f"Category '{cat}': {cat_passed}/{cat_total} passed")

print(f"\nOVERALL RESULT: {passed_tests}/{total_tests} tests passed ({passed_tests/total_tests*100:.1f}%)")

# Save results to json
with open(os.path.join(os.path.dirname(__file__), "adversarial_results.json"), "w", encoding="utf-8") as f:
    json.dump(audit_results, f, indent=2)
