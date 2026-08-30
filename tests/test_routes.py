"""
Comprehensive integration and unit test suite for LifeLine Agent REST API routes,
error schemas, and reporting agent.
Conforms strictly to docs/09-parallel-build-contract.md.
"""

import pytest
from fastapi.testclient import TestClient
from lifeline.main import app
from lifeline.tools.data_store import reset_data_store, get_data_store
from lifeline.agents.reporting_agent import run_daily_report, run_report_query

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_clean_store():
    """Reset data store before each test for clean isolation."""
    store = reset_data_store()
    yield store


# ── 1. Health & Core Dispatch Tests ───────────────────────────────────────────

def test_health_endpoint():
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["service"] == "lifeline-agent"
    assert data["version"] == "0.1.0"


def test_dispatch_endpoint_nested_format():
    payload = {
        "case": {
            "patient_age": 54,
            "vitals": {
                "heart_rate": 118,
                "respiratory_rate": 24,
                "systolic_bp": 88,
                "spo2": 91,
                "temperature_c": 38.6,
                "consciousness": "alert",
            },
            "chief_complaint": "Acute crushing chest pain",
            "mechanism_of_injury": None,
        },
        "patient_location": {
            "lat": 19.055,
            "lng": 72.840,
        },
    }
    resp = client.post("/dispatch", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "news2" in data
    assert "triage" in data
    assert "bed_match" in data
    assert "routing" in data
    assert "briefing" in data
    assert data["triage"]["severity_label"] in ["critical", "moderate"]


def test_dispatch_endpoint_flat_format():
    payload = {
        "patient_age": 29,
        "vitals": {
            "heart_rate": 82,
            "respiratory_rate": 16,
            "systolic_bp": 118,
            "spo2": 98,
            "temperature_c": 37.0,
            "consciousness": "alert",
        },
        "chief_complaint": "Minor ankle sprain",
        "mechanism_of_injury": "Twisted ankle",
        "patient_location": {
            "lat": 19.0760,
            "lng": 72.8777,
        },
    }
    resp = client.post("/dispatch", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["news2"]["score"] <= 4
    assert data["triage"]["severity_label"] == "mild"


def test_emergency_sos_endpoint():
    payload = {
        "case": {
            "patient_age": 54,
            "vitals": {
                "heart_rate": 120,
                "respiratory_rate": 26,
                "systolic_bp": 85,
                "spo2": 90,
                "temperature_c": 38.5,
                "consciousness": "alert",
            },
            "chief_complaint": "Acute crushing chest pain",
            "mechanism_of_injury": None,
        },
        "patient_location": {
            "lat": 19.055,
            "lng": 72.840,
        },
    }
    resp = client.post("/sos", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "alert_id" in data
    assert data["alert_id"].startswith("ALERT-")
    assert "patient_id" in data
    assert "bed_match" in data


# ── 2. Auth & Identity Tests ──────────────────────────────────────────────────

def test_auth_login_hospital_staff():
    payload = {
        "username": "dr_smith",
        "role": "hospital_staff",
        "facility_id": "hosp_mumbai_01",
    }
    resp = client.post("/auth/login", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["token"].startswith("lifeline_mock_hospital_staff_")
    assert data["user"]["role"] == "hospital_staff"
    assert data["user"]["facility_id"] == "hosp_mumbai_01"
    assert "Lilavati Hospital" in data["user"]["facility_name"]


def test_auth_login_blood_donor():
    payload = {
        "username": "rahul_sharma",
        "role": "blood_donor",
    }
    resp = client.post("/auth/login", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["token"].startswith("lifeline_mock_blood_donor_")
    assert data["user"]["role"] == "blood_donor"


def test_auth_login_invalid_role():
    payload = {
        "username": "hacker",
        "role": "super_admin",
    }
    resp = client.post("/auth/login", json=payload)
    assert resp.status_code == 422 or resp.status_code == 400


def test_auth_me_valid_bearer():
    login_resp = client.post(
        "/auth/login",
        json={"username": "dr_smith", "role": "hospital_staff", "facility_id": "hosp_mumbai_01"},
    )
    token = login_resp.json()["token"]

    resp = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["role"] == "hospital_staff"


def test_auth_me_missing_token():
    resp = client.get("/auth/me")
    assert resp.status_code == 401
    assert "detail" in resp.json()
    assert "code" in resp.json()


# ── 3. Blood & Organ Donor Tests ──────────────────────────────────────────────

def test_donor_registration_and_retrieval():
    payload = {
        "full_name": "Test Donor",
        "phone": "+91-99999-88888",
        "email": "test.donor@example.com",
        "blood_group": "O+",
        "is_organ_donor": True,
        "donor_category": "Dual",
        "location": {
            "lat": 19.055,
            "lng": 72.840,
            "address": "Bandra West, Mumbai",
            "pincode": "400050",
        },
        "status": "available",
        "last_donation_date": "2026-05-10",
        "eligibility_status": "eligible",
    }
    resp = client.post("/donors", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["full_name"] == "Test Donor"
    assert data["blood_group"] == "O+"
    assert data["badge_title"] == "Lifesaver"
    donor_id = data["id"]

    # Retrieve donor
    get_resp = client.get(f"/donors/{donor_id}")
    assert get_resp.status_code == 200
    donor_detail = get_resp.json()
    assert donor_detail["id"] == donor_id
    assert donor_detail["email"] == "test.donor@example.com"


def test_donor_not_found():
    resp = client.get("/donors/donor_non_existent_99999")
    assert resp.status_code == 404
    assert resp.json()["code"] == "RESOURCE_NOT_FOUND"


# ── 4. Resource & Blood Requests Tests ────────────────────────────────────────

def test_list_and_create_requests():
    # List initial requests from seed
    resp = client.get("/requests")
    assert resp.status_code == 200
    data = resp.json()
    assert "requests" in data
    initial_count = len(data["requests"])
    assert initial_count > 0

    # Create new request
    create_payload = {
        "hospital_id": "hosp_mumbai_01",
        "hospital_name": "Lilavati Hospital",
        "type": "blood",
        "blood_group_needed": "O-",
        "units_requested": 3,
        "urgency": "STAT_CRITICAL",
        "clinical_indication": "Massive transfusion protocol",
    }
    post_resp = client.post("/requests", json=create_payload)
    assert post_resp.status_code == 201
    new_req = post_resp.json()
    assert new_req["blood_group_needed"] == "O-"
    assert new_req["units_requested"] == 3
    assert new_req["status"] == "open"
    assert new_req["request_tracking_number"].startswith("REQ-")

    # Filter requests by blood group
    filter_resp = client.get("/requests?blood_group=O-")
    assert filter_resp.status_code == 200
    filtered = filter_resp.json()["requests"]
    assert any(r["blood_group_needed"] == "O-" for r in filtered)


def test_respond_to_request():
    # Fetch an open request
    list_resp = client.get("/requests?status=open")
    reqs = list_resp.json()["requests"]
    target_req = reqs[0]
    req_id = target_req["id"]

    respond_payload = {
        "donor_id": "donor_6721",
        "response_status": "accepted",
        "travel_mode": "driving",
        "eta_minutes": 14.0,
    }
    resp = client.post(f"/requests/{req_id}/respond", json=respond_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["request_id"] == req_id
    assert data["donor_id"] == "donor_6721"
    assert data["status"] == "matched"
    assert data["donor_response_status"] == "accepted"


# ── 5. Patients, Beds & Transfers Tests ───────────────────────────────────────

def test_patients_list_and_update():
    resp = client.get("/patients")
    assert resp.status_code == 200
    patients = resp.json()["patients"]
    assert len(patients) > 0
    first_patient = patients[0]
    pat_id = first_patient["id"]

    # Update patient
    update_payload = {
        "admission_status": "admitted",
        "clinical_notes": "Admitted to Cath Lab Bay 3.",
        "bed_number": "ICU-CARD-04",
    }
    patch_resp = client.patch(f"/patients/{pat_id}", json=update_payload)
    assert patch_resp.status_code == 200
    updated_patient = patch_resp.json()
    assert updated_patient["admission_status"] == "admitted"
    assert updated_patient["bed_number"] == "ICU-CARD-04"
    assert "Cath Lab" in updated_patient["clinical_notes"]


def test_bed_reservation():
    payload = {
        "patient_id": "pat_1092",
        "hospital_id": "hosp_mumbai_01",
        "bed_type": "cardiac_icu",
        "bay_id": "BAY-C3",
        "action": "reserve",
    }
    resp = client.post("/beds/ICU-CARD-04/reserve", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["bed_id"] == "ICU-CARD-04"
    assert data["bay_id"] == "BAY-C3"
    assert data["status"] == "reserved"
    assert data["patient_id"] == "pat_1092"


def test_case_transfer_rerouting():
    payload = {
        "current_hospital_id": "hosp_mumbai_01",
        "reason": "Sudden surge; 0 cardiac ICU beds available",
        "patient_location": {
            "lat": 19.052,
            "lng": 72.833,
        },
    }
    resp = client.post("/cases/CASE-9021/transfer", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["transfer_status"] == "reassigned"
    assert data["case_id"] == "CASE-9021"
    assert "Lilavati" in data["previous_hospital"]
    assert "transferred_to_hospital" in data
    assert data["transferred_to_hospital"]["name"] != "Lilavati Hospital & Research Centre"
    assert data["transferred_to_hospital"]["distance_km"] > 0
    assert "audit_id" in data


# ── 6. Issues & Inventory Tests ───────────────────────────────────────────────

def test_issues_crud():
    # List issues
    resp = client.get("/issues")
    assert resp.status_code == 200
    assert "issues" in resp.json()

    # Create issue
    create_payload = {
        "hospital_id": "hosp_mumbai_01",
        "category": "equipment",
        "title": "CT Scanner Calibration Issue",
        "description": "CT Gantry undergoing realignment",
        "severity": "moderate",
        "status": "investigating",
        "reported_by": "Dr. A. Mehta",
    }
    post_resp = client.post("/issues", json=create_payload)
    assert post_resp.status_code == 201
    created_issue = post_resp.json()
    assert created_issue["title"] == "CT Scanner Calibration Issue"
    issue_id = created_issue["id"]

    # Update issue to resolved
    patch_resp = client.patch(f"/issues/{issue_id}", json={"status": "resolved"})
    assert patch_resp.status_code == 200
    updated_issue = patch_resp.json()
    assert updated_issue["status"] == "resolved"
    assert updated_issue["resolved_at"] is not None


def test_inventory_list_and_update():
    resp = client.get("/inventory")
    assert resp.status_code == 200
    items = resp.json()["inventory"]
    assert len(items) > 0
    first_item = items[0]
    inv_id = first_item["id"]

    # Update stock
    patch_resp = client.patch(
        f"/inventory/{inv_id}",
        json={"current_stock": 1, "minimum_threshold": 5},
    )
    assert patch_resp.status_code == 200
    updated = patch_resp.json()
    assert updated["current_stock"] == 1
    assert updated["is_low_stock"] is True


# ── 7. Regional Intelligence & Reports Tests ──────────────────────────────────

def test_network_overview():
    resp = client.get("/network/overview")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_incidents_today" in data
    assert "jurisdiction_sla_compliance_percent" in data
    assert "hospital_summaries" in data
    assert len(data["hospital_summaries"]) > 0


def test_daily_report_generation():
    resp = client.get("/reports/daily")
    assert resp.status_code == 200
    data = resp.json()
    assert data["model_used"] == "gemini-3.5-flash"
    assert "headline" in data
    assert "summary_markdown" in data
    assert "key_metrics" in data
    assert data["key_metrics"]["total_cases"] > 0


def test_report_query_endpoint():
    payload = {"query": "Which hospitals are currently experiencing cardiac ICU bed shortages?"}
    resp = client.post("/reports/query", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["query"] == payload["query"]
    assert len(data["answer"]) > 10
    assert "referenced_facilities" in data
    assert len(data["referenced_facilities"]) > 0


def test_reporting_agent_direct_methods():
    telemetry = {
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
        "hospital_summaries": [
            {
                "id": "hosp_mumbai_01",
                "name": "Lilavati Hospital",
                "status": "active",
                "available_icu_beds": 2,
                "total_icu_beds": 20,
                "compliance_rate": 98.5,
                "open_issues_count": 1,
            }
        ],
    }

    report = run_daily_report(telemetry)
    assert report.model_used == "gemini-3.5-flash"
    assert report.key_metrics.total_cases == 48

    query_res = run_report_query("Which hospitals have low ICU beds?", telemetry)
    assert len(query_res.answer) > 0
    assert "Lilavati Hospital" in query_res.referenced_facilities
