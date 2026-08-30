# 09 — Parallel Build Contract

> **Status**: LOCKED & AUTHORITATIVE  
> **Build Phase**: LifeLine Agent Platform Expansion (Multi-Role Portal & API Layer)  
> **Track**: The Taskmaster — All Things Agentic Hackathon (Deadline: Aug 31, 2026, 5:00 PM PDT)  
> **Compliance**: Gemini 3.1-pro (Triage), Gemini 3.5-flash (All Other Agents/Reports), Google ADK + Genkit, Cloud Run + Firestore  

---

## 1. Executive Summary & Parallel Execution Model

This contract establishes the definitive, immutable interface specification for expanding the LifeLine Agent emergency dispatch pipeline into a complete, multi-role emergency healthcare coordination system.

To enable **four sub-agents (Frontend, Backend, Storage, Deploy)** to build concurrently without blocking or introducing integration mismatches, every endpoint, JSON payload, status code, Firestore schema, role identifier, and environment variable is locked below.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        LIFELINE AGENT ECOSYSTEM                         │
├──────────────────┬─────────────────────────────┬────────────────────────┤
│   BLOOD DONOR    │       HOSPITAL STAFF        │  GOVERNMENT AUTHORITY  │
│  `blood_donor`   │      `hospital_staff`       │ `government_authority` │
│ (Mobile/Portal)  │   (ER Ops Console & Bays)   │ (Regional Exec Brief)  │
└─────────┬────────┴──────────────┬──────────────┴───────────┬────────────┘
          │                       │                          │
          ▼                       ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              FASTAPI GATEWAY / UNIFIED REST API LAYER                   │
│   • Demo/Mock Auth (`POST /auth/login`, `GET /auth/me`)                 │
│   • Donor Coordination (`/donors`, `/requests`)                         │
│   • Hospital ER Operations (`/patients`, `/sos`, `/beds`, `/inventory`) │
│   • Regional Intelligence (`/network/overview`, `/reports/daily`)       │
│   • Core Multi-Agent Dispatch (`POST /dispatch`, `GET /health`)         │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
          ┌───────────────────────┴───────────────────────┐
          ▼                                               ▼
┌──────────────────────────────────┐    ┌─────────────────────────────────┐
│  CORE MULTI-AGENT PIPELINE       │    │  UNIVERSAL FIRESTORE STORAGE    │
│  • Deterministic NEWS2 Engine    │    │  • `dispatch_cases` (Audit Log) │
│  • Triage (`gemini-3.1-pro`)     │    │  • `donors`, `requests`         │
│  • Bed-Matching (`gemini-3.5-fl`)│    │  • `patients`, `issues`         │
│  • Routing & SBAR Briefing       │    │  • `inventory`, `reports`       │
└──────────────────────────────────┘    └─────────────────────────────────┘
```

---

## 2. Mandatory Hackathon Compliance Checklist

All sub-agents must adhere strictly to these non-negotiable hackathon rules:

| Requirement | Implementation in LifeLine Agent | Enforcement File |
|---|---|---|
| **Mandatory LLM Tier** | `gemini-3.1-pro` for clinical triage reasoning; `gemini-3.5-flash` for bed-matching, routing, briefing, and regional intelligence reports. (Fallback: `gemini-3.7-flash`). | `lifeline/models.py` |
| **Agent Framework** | Google ADK (`LlmAgent`, `SequentialAgent`) + Google Genkit for agent flows and prompts. | `lifeline/orchestrator.py` |
| **Cloud Infrastructure** | Google Cloud Run (Containerized FastAPI service) + Google Cloud Firestore (Audit & Operational DB). | `deploy/Dockerfile`, `lifeline/firebase.py` |
| **Hackathon Track** | **The Taskmaster** (Multi-agent deterministic + generative orchestration with zero human calls). | `my-agent/ROADMAP.md` |
| **Windows Compatibility** | UTF-8 console output (`sys.stdout.reconfigure(encoding="utf-8")`) and batch script concurrency (`start /B`). | `lifeline/cli.py`, `start.bat` |
| **Secret Management** | Zero hardcoded keys. Encrypted config via AES-256 (`admin/config_manager.py`) with Cloud Run env overrides. | `lifeline/firebase.py` |

---

## 3. Role Definitions & Access Control

The platform defines three primary role strings. Every authentication check, UI route guard, and API permission validation must use these exact strings:

| Role Identifier String | Display Title | Persona & Purpose | Visual Theme & UX Style |
|---|---|---|---|
| `blood_donor` | Blood & Organ Donor | Individual donor profile, blood/organ pledge, real-time emergency blood request feed, accept/decline transit, donation history. | Lightweight, card-based, personal app feel, mobile/tablet optimized. |
| `hospital_staff` | Hospital ER Operations Console | Emergency intake inbox, patient admission dossiers, advance bed/bay reservations, no-bed transfer rerouting, resource requests, issue tracking, and inventory. | High-density clinical operations dashboard, dark theme, real-time status badges. |
| `government_authority` | Regional Health Authority | Regional network health, hospital strain index, SLA compliance, diversion tracking, AI daily intelligence executive briefing, NL data query. | Executive overview dashboard, macro data visualizations, aggregate tables. |

### 3.1. Demo/Mock Authentication Specification
- **Token Format**: `lifeline_mock_<role>_<uid>`  
  *(e.g., `lifeline_mock_hospital_staff_usr_9812`, `lifeline_mock_blood_donor_donor_6721`, `lifeline_mock_government_authority_gov_01`)*
- **HTTP Header**: `Authorization: Bearer lifeline_mock_<role>_<uid>`
- **Role Header (Optional Pass-through)**: `X-User-Role: <role>`
- **Behavior**: Zero-friction evaluation mode. Any valid role string generates a session. Client stores token and user profile in central state (`context/DashboardContext.tsx` or equivalent).

---

## 4. Standard Error Response Schema

All API endpoints return standard HTTP error codes and a consistent JSON payload when an error occurs:

```json
{
  "detail": "Descriptive human-readable error explanation",
  "code": "ERROR_CODE_UPPERCASE_STRING"
}
```

### Standard Status Codes:
- `200 OK`: Request succeeded, response body returned.
- `201 Created`: Resource created successfully.
- `400 Bad Request`: (`INVALID_PAYLOAD`, `MISSING_FIELD`, `INVALID_ROLE`)
- `401 Unauthorized`: (`MISSING_TOKEN`, `INVALID_TOKEN`)
- `403 Forbidden`: (`INSUFFICIENT_ROLE_PERMISSIONS`)
- `404 Not Found`: (`RESOURCE_NOT_FOUND`, `HOSPITAL_NOT_FOUND`, `PATIENT_NOT_FOUND`)
- `409 Conflict`: (`BED_ALREADY_RESERVED`, `REQUEST_ALREADY_FULFILLED`)
- `422 Unprocessable Entity`: Validation failure on Pydantic / TypeScript schema.
- `500 Internal Server Error`: (`INTERNAL_ERROR`, fallback to mock/dev mode).

---

## 5. Canonical REST API Endpoints Specification

### 5.1. Authentication & Identity

#### `POST /auth/login`
- **Description**: Authenticates a user or demo persona into one of the three roles.
- **Request Body**:
  ```json
  {
    "username": "dr_smith",
    "role": "hospital_staff",
    "facility_id": "hosp_mumbai_01"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "token": "lifeline_mock_hospital_staff_usr_9812",
    "user": {
      "id": "usr_9812",
      "username": "dr_smith",
      "role": "hospital_staff",
      "facility_id": "hosp_mumbai_01",
      "facility_name": "Lilavati Hospital & Research Centre"
    }
  }
  ```

#### `GET /auth/me`
- **Description**: Resolves the current user's profile from the Authorization Bearer token.
- **Headers**: `Authorization: Bearer <token>`
- **Response** (`200 OK`): Same `user` object as in `/auth/login`.

---

### 5.2. Blood & Organ Donor Workstream

#### `POST /donors`
- **Description**: Register a new donor or update an existing donor profile.
- **Request Body**:
  ```json
  {
    "full_name": "Rahul Sharma",
    "phone": "+91-98765-43210",
    "email": "rahul.sharma@example.com",
    "blood_group": "O+",
    "is_organ_donor": true,
    "donor_category": "Dual",
    "location": {
      "lat": 19.055,
      "lng": 72.840,
      "address": "Bandra West, Mumbai",
      "pincode": "400050"
    },
    "status": "available",
    "last_donation_date": "2026-05-10",
    "eligibility_status": "eligible"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "id": "donor_6721",
    "full_name": "Rahul Sharma",
    "blood_group": "O+",
    "is_organ_donor": true,
    "donor_category": "Dual",
    "status": "available",
    "eligibility_status": "eligible",
    "total_donations": 4,
    "badge_title": "Lifesaver Gold",
    "_timestamp": "2026-08-29T16:30:00Z"
  }
  ```

#### `GET /donors/:id`
- **Description**: Fetch detailed donor dossier including donation history.
- **Response** (`200 OK`):
  ```json
  {
    "id": "donor_6721",
    "full_name": "Rahul Sharma",
    "phone": "+91-98765-43210",
    "email": "rahul.sharma@example.com",
    "blood_group": "O+",
    "is_organ_donor": true,
    "donor_category": "Dual",
    "location": {
      "lat": 19.055,
      "lng": 72.840,
      "address": "Bandra West, Mumbai",
      "pincode": "400050"
    },
    "status": "available",
    "last_donation_date": "2026-05-10",
    "eligibility_status": "eligible",
    "total_donations": 4,
    "badge_title": "Lifesaver Gold",
    "active_match_request_id": null,
    "donation_history": [
      {
        "donation_id": "don_hist_101",
        "hospital_name": "Lilavati Hospital",
        "date": "2026-05-10",
        "units": 1,
        "type": "blood"
      }
    ]
  }
  ```

#### `GET /requests`
- **Description**: Query open resource requests matching filters.
- **Query Parameters**:
  - `status` (`open` | `matched` | `fulfilled` | `cancelled`, default: `open`)
  - `type` (`blood` | `organ` | `equipment`, optional)
  - `blood_group` (optional, e.g. `O+`)
- **Response** (`200 OK`):
  ```json
  {
    "requests": [
      {
        "id": "req_8812",
        "request_tracking_number": "REQ-2026-0829-01",
        "hospital_id": "hosp_mumbai_01",
        "hospital_name": "Lilavati Hospital & Research Centre",
        "patient_tracking_number": "DISP-2026-901",
        "patient_name": "Pooja Verma",
        "type": "blood",
        "blood_group_needed": "O+",
        "units_requested": 2,
        "units_fulfilled": 0,
        "urgency": "STAT_CRITICAL",
        "clinical_indication": "Trauma laparotomy with hemorrhagic shock",
        "status": "open",
        "donation_location": {
          "hospital_id": "hosp_mumbai_01",
          "hospital_name": "Lilavati Hospital",
          "department": "Emergency Blood Bank - 2nd Floor",
          "address": "A-791, Bandra Reclamation, Mumbai",
          "lat": 19.052,
          "lng": 72.833,
          "phone": "+91-22-2675-1000"
        },
        "_timestamp": "2026-08-29T16:20:00Z"
      }
    ]
  }
  ```

#### `POST /requests/:id/respond`
- **Description**: Donor accepts or declines an open blood/organ transit request.
- **Request Body**:
  ```json
  {
    "donor_id": "donor_6721",
    "response_status": "accepted",
    "travel_mode": "driving",
    "eta_minutes": 14
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "request_id": "req_8812",
    "donor_id": "donor_6721",
    "status": "matched",
    "donor_response_status": "accepted",
    "eta_minutes": 14,
    "updated_at": "2026-08-29T16:32:00Z"
  }
  ```

---

### 5.3. Hospital Operations & Patient Management

#### `GET /patients`
- **Description**: Retrieve active emergency patients for a facility or district.
- **Query Parameters**:
  - `hospital_id` (optional, string)
  - `status` (`inbound` | `admitted` | `transferred` | `discharged`, optional)
- **Response** (`200 OK`):
  ```json
  {
    "patients": [
      {
        "id": "pat_1092",
        "tracking_number": "CASE-9021",
        "full_name": "Vikram Patel",
        "age": 54,
        "gender": "Male",
        "blood_type": "B+",
        "severity": "critical",
        "assigned_hospital_id": "hosp_mumbai_01",
        "admission_status": "inbound",
        "reserved_bed_type": "cardiac_icu",
        "reserved_bay_id": "BAY-C3",
        "eta_minutes": 8.5,
        "vitals": {
          "heart_rate": 118,
          "respiratory_rate": 24,
          "systolic_bp": 88,
          "spo2": 91,
          "temperature_c": 38.6,
          "consciousness": "alert"
        },
        "news2_score": 9,
        "chief_complaint": "Acute crushing chest pain",
        "sbar_brief": "Incoming 54yo male, suspected STEMI, NEWS2 9. Cath lab prep requested."
      }
    ]
  }
  ```

#### `PATCH /patients/:id`
- **Description**: Update patient status during/after arrival.
- **Request Body**:
  ```json
  {
    "admission_status": "admitted",
    "clinical_notes": "Admitted to Cath Lab Bay 3. Angiography in progress.",
    "bed_number": "ICU-CARD-04"
  }
  ```
- **Response** (`200 OK`): Full updated patient record.

#### `POST /sos`
- **Description**: Trigger immediate emergency dispatch intake from hospital/field.
- **Request Body**:
  ```json
  {
    "case": {
      "patient_age": 54,
      "vitals": {
        "heart_rate": 118,
        "respiratory_rate": 24,
        "systolic_bp": 88,
        "spo2": 91,
        "temperature_c": 38.6,
        "consciousness": "alert"
      },
      "chief_complaint": "Acute crushing chest pain",
      "mechanism_of_injury": null
    },
    "patient_location": {
      "lat": 19.055,
      "lng": 72.840
    }
  }
  ```
- **Response** (`200 OK`): Full dispatch pipeline execution payload with generated `alert_id`.

#### `POST /beds/:id/reserve`
- **Description**: Advance bed or trauma bay reservation for incoming patient.
- **Request Body**:
  ```json
  {
    "patient_id": "pat_1092",
    "hospital_id": "hosp_mumbai_01",
    "bed_type": "cardiac_icu",
    "bay_id": "BAY-C3",
    "action": "reserve"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "bed_id": "ICU-CARD-04",
    "bay_id": "BAY-C3",
    "status": "reserved",
    "patient_id": "pat_1092",
    "reserved_at": "2026-08-29T16:35:00Z"
  }
  ```

#### `POST /cases/:id/transfer`
- **Description**: Reroute/transfer a patient when the assigned hospital reaches capacity constraint.
- **Request Body**:
  ```json
  {
    "current_hospital_id": "hosp_mumbai_01",
    "reason": "Sudden surge; 0 cardiac ICU beds available",
    "patient_location": {
      "lat": 19.052,
      "lng": 72.833
    }
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "transfer_status": "reassigned",
    "case_id": "CASE-9021",
    "previous_hospital": "Lilavati Hospital",
    "transferred_to_hospital": {
      "name": "Hinduja Hospital",
      "lat": 19.032,
      "lng": 72.841,
      "distance_km": 3.8,
      "eta_minutes": 9.2
    },
    "reasoning": "Rerouted to Hinduja Hospital: 2 open cardiac ICU beds, 9.2 min ETA.",
    "audit_id": "audit_tx_88192"
  }
  ```

#### `POST /requests`
- **Description**: Hospital raises an urgent resource, blood, or equipment request.
- **Request Body**:
  ```json
  {
    "hospital_id": "hosp_mumbai_01",
    "hospital_name": "Lilavati Hospital",
    "type": "blood",
    "blood_group_needed": "O-",
    "units_requested": 3,
    "urgency": "STAT_CRITICAL",
    "clinical_indication": "Massive trauma transfusion protocol"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "id": "req_9921",
    "request_tracking_number": "REQ-2026-0829-02",
    "hospital_id": "hosp_mumbai_01",
    "type": "blood",
    "blood_group_needed": "O-",
    "units_requested": 3,
    "units_fulfilled": 0,
    "urgency": "STAT_CRITICAL",
    "status": "open",
    "_timestamp": "2026-08-29T16:36:00Z"
  }
  ```

#### `GET /issues`, `POST /issues`, `PATCH /issues/:id`
- **Description**: Operational and equipment issue log.
- **Issue Document Schema**:
  ```json
  {
    "id": "iss_501",
    "hospital_id": "hosp_mumbai_01",
    "hospital_name": "Lilavati Hospital",
    "category": "equipment",
    "title": "CT Scanner #2 Offline",
    "description": "Calibration fault in primary CT gantry; neuro cases redirected to MRI/CT #1.",
    "severity": "moderate",
    "status": "investigating",
    "reported_by": "Dr. A. Mehta",
    "created_at": "2026-08-29T14:10:00Z",
    "resolved_at": null
  }
  ```

#### `GET /inventory`, `PATCH /inventory/:id`
- **Description**: Medicine, blood units, and equipment inventory tracker.
- **Inventory Item Schema**:
  ```json
  {
    "id": "inv_801",
    "hospital_id": "hosp_mumbai_01",
    "category": "blood_bank",
    "item_name": "O- Packed Red Blood Cells",
    "current_stock": 2,
    "minimum_threshold": 6,
    "unit": "units",
    "is_low_stock": true,
    "last_updated": "2026-08-29T16:00:00Z"
  }
  ```

---

### 5.4. Government Authority & Regional Intelligence

#### `GET /network/overview`
- **Description**: Regional health authority overview of cross-hospital capacity, diversion, and emergencies.
- **Response** (`200 OK`):
  ```json
  {
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
        "available_icu_beds": 3,
        "total_icu_beds": 20,
        "compliance_rate": 98.5,
        "open_issues_count": 1
      }
    ]
  }
  ```

#### `GET /reports/daily`
- **Description**: Plain-language executive daily briefing generated by **`gemini-3.5-flash`** summarizing incident volumes, SLAs, capacity strain, and donor actions.
- **Response** (`200 OK`):
  ```json
  {
    "report_id": "rep_2026_0829",
    "date": "2026-08-29",
    "model_used": "gemini-3.5-flash",
    "headline": "Mumbai Metro Regional Emergency Dispatch Intelligence Report",
    "summary_markdown": "### Executive Briefing\n- **Incident Volume**: 48 total dispatches across Mumbai West and South. Cardiac emergencies accounted for 42% of critical cases.\n- **SLA Performance**: Average time to hospital bed assignment was 44.5 seconds with 97.2% compliance.\n- **Capacity Constraints**: Lilavati Hospital reached 85% ICU load at 15:00 UTC; 1 case automatically rerouted to Hinduja Hospital under Tier 1 auto-dispatch.\n- **Blood Bank Status**: O- inventory flagged low across 2 facilities; 3 donor callout requests successfully matched.",
    "key_metrics": {
      "total_cases": 48,
      "critical_cases": 7,
      "sla_compliance_pct": 97.2,
      "auto_reroutes": 1
    },
    "generated_at": "2026-08-29T16:45:00Z"
  }
  ```

#### `POST /reports/query`
- **Description**: Natural language interactive query assistant powered by **`gemini-3.5-flash`** answering executive questions over regional dispatch and capacity data.
- **Request Body**:
  ```json
  {
    "query": "Which hospitals are currently experiencing cardiac ICU bed shortages?"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "query": "Which hospitals are currently experiencing cardiac ICU bed shortages?",
    "answer": "Based on current network telemetry, Lilavati Hospital has only 1 remaining Cardiac ICU bed (95% capacity). Breach Candy and KEM Hospital have 4 and 6 open Cardiac ICU beds respectively.",
    "referenced_facilities": [
      "Lilavati Hospital",
      "Breach Candy Hospital",
      "KEM Hospital"
    ],
    "timestamp": "2026-08-29T16:46:00Z"
  }
  ```

---

### 5.5. Core Multi-Agent Pipeline & Health Check

#### `POST /dispatch`
- **Description**: Executes the end-to-end autonomous multi-agent dispatch workflow: NEWS2 calculation → Triage reasoning (`gemini-3.1-pro`) → Bed matching (`gemini-3.5-flash`) → Routing & ETA → SBAR brief → Firestore audit logging.
- **Request Body**:
  ```json
  {
    "case": {
      "patient_age": 54,
      "vitals": {
        "heart_rate": 118,
        "respiratory_rate": 24,
        "systolic_bp": 88,
        "spo2": 91,
        "temperature_c": 38.6,
        "consciousness": "alert"
      },
      "chief_complaint": "Acute crushing chest pain",
      "mechanism_of_injury": null
    },
    "patient_location": {
      "lat": 19.055,
      "lng": 72.840
    }
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "case_id": "CASE-9021",
    "timestamp": "2026-08-29T16:30:00Z",
    "news2_score": {
      "score": 9,
      "risk_band": "high"
    },
    "triage_result": {
      "severity_label": "critical",
      "required_specialty": "cardiac",
      "notes": "High NEWS2 score with acute chest pain and hypoxia strongly indicates acute coronary syndrome. Cardiac ICU bed required immediately."
    },
    "bed_matching_result": {
      "chosen_hospital": {
        "name": "Lilavati Hospital & Research Centre",
        "lat": 19.052,
        "lng": 72.833,
        "distance_km": 1.4,
        "eta_minutes": 4.5
      },
      "reasoning": "Closest Level 1 facility with 3 available cardiac ICU beds and active cath lab.",
      "alternatives": [
        {
          "name": "Hinduja Hospital",
          "reason_not_chosen": "1.8 km further away"
        }
      ]
    },
    "routing_result": {
      "eta_minutes": 4.5,
      "distance_km": 1.4,
      "route_summary": "Via Bandra Reclamation Rd, light traffic"
    },
    "briefing_result": {
      "pre_arrival_brief": "Incoming 54yo male, suspected STEMI. NEWS2 score 9 (high risk). Vitals: HR 118, BP 88/60, SpO2 91%. ETA 4.5 minutes. Cardiac team and Cath Lab prep requested."
    },
    "audit_record_id": "audit_doc_991823"
  }
  ```

#### `GET /health`
- **Description**: Basic service health and version probe.
- **Response** (`200 OK`):
  ```json
  {
    "status": "ok",
    "service": "lifeline-agent",
    "version": "0.1.0"
  }
  ```

---

## 6. Canonical Firestore Collections & Document Schemas

All collections share standard audit metadata headers:
- `_id`: String document identifier.
- `_timestamp`: ISO 8601 UTC string (`YYYY-MM-DDTHH:MM:SSZ`).
- `_version`: String schema version (e.g. `"0.1.0"`).
- `_actor`: String user ID, role, or agent name generating the record.

```
Firestore Root
├── dispatch_cases/    [case_id]   -> Complete multi-agent dispatch trace & audit log
├── donors/            [donor_id]  -> Registered donor profiles & stats
├── requests/          [req_id]    -> Emergency blood/organ/resource requests
├── patients/          [pat_id]    -> Patient medical dossiers & admission records
├── issues/            [issue_id]  -> Hospital operational & equipment issues
├── inventory/         [inv_id]    -> Medicine, blood units, & supply levels
└── reports/           [rep_id]    -> Daily AI intelligence reports & summaries
```

### 6.1. `dispatch_cases` Collection Schema
```json
{
  "_id": "CASE-9021",
  "_timestamp": "2026-08-29T16:30:00Z",
  "_version": "0.1.0",
  "_actor": "orchestrator",
  "input_case": {
    "patient_age": 54,
    "vitals": {
      "heart_rate": 118,
      "respiratory_rate": 24,
      "systolic_bp": 88,
      "spo2": 91,
      "temperature_c": 38.6,
      "consciousness": "alert"
    },
    "chief_complaint": "Acute crushing chest pain",
    "mechanism_of_injury": null
  },
  "patient_location": {
    "lat": 19.055,
    "lng": 72.840
  },
  "news2_score": {
    "score": 9,
    "risk_band": "high"
  },
  "triage_output": {
    "severity_label": "critical",
    "required_specialty": "cardiac",
    "notes": "High NEWS2 score..."
  },
  "bed_matching_output": {
    "chosen_hospital": {
      "name": "Lilavati Hospital",
      "lat": 19.052,
      "lng": 72.833,
      "distance_km": 1.4,
      "eta_minutes": 4.5
    },
    "reasoning": "...",
    "alternatives": []
  },
  "routing_output": {
    "eta_minutes": 4.5,
    "distance_km": 1.4,
    "route_summary": "Via Bandra Reclamation Rd"
  },
  "briefing_output": {
    "pre_arrival_brief": "Incoming 54yo male..."
  }
}
```

### 6.2. `donors` Collection Schema
```json
{
  "_id": "donor_6721",
  "_timestamp": "2026-08-29T16:30:00Z",
  "_version": "0.1.0",
  "_actor": "user_or_seed",
  "full_name": "Rahul Sharma",
  "phone": "+91-98765-43210",
  "email": "rahul.sharma@example.com",
  "blood_group": "O+",
  "is_organ_donor": true,
  "donor_category": "Dual",
  "location": {
    "lat": 19.055,
    "lng": 72.840,
    "address": "Bandra West, Mumbai",
    "pincode": "400050"
  },
  "status": "available",
  "last_donation_date": "2026-05-10",
  "eligibility_status": "eligible",
  "total_donations": 4,
  "badge_title": "Lifesaver Gold",
  "active_match_request_id": null
}
```

### 6.3. `requests` Collection Schema
```json
{
  "_id": "req_8812",
  "_timestamp": "2026-08-29T16:20:00Z",
  "_version": "0.1.0",
  "_actor": "hosp_mumbai_01",
  "request_tracking_number": "REQ-2026-0829-01",
  "hospital_id": "hosp_mumbai_01",
  "hospital_name": "Lilavati Hospital & Research Centre",
  "patient_tracking_number": "DISP-2026-901",
  "patient_name": "Pooja Verma",
  "type": "blood",
  "blood_group_needed": "O+",
  "organ_needed": null,
  "units_requested": 2,
  "units_fulfilled": 0,
  "urgency": "STAT_CRITICAL",
  "clinical_indication": "Trauma laparotomy with hemorrhagic shock",
  "status": "open",
  "donation_location": {
    "hospital_id": "hosp_mumbai_01",
    "hospital_name": "Lilavati Hospital",
    "department": "Emergency Blood Bank - 2nd Floor",
    "address": "A-791, Bandra Reclamation, Mumbai",
    "lat": 19.052,
    "lng": 72.833,
    "phone": "+91-22-2675-1000"
  },
  "matched_donors": []
}
```

### 6.4. `patients` Collection Schema
```json
{
  "_id": "pat_1092",
  "_timestamp": "2026-08-29T16:30:00Z",
  "_version": "0.1.0",
  "_actor": "orchestrator",
  "tracking_number": "CASE-9021",
  "full_name": "Vikram Patel",
  "age": 54,
  "gender": "Male",
  "blood_type": "B+",
  "severity": "critical",
  "assigned_hospital_id": "hosp_mumbai_01",
  "admission_status": "inbound",
  "reserved_bed_type": "cardiac_icu",
  "reserved_bay_id": "BAY-C3",
  "eta_minutes": 8.5,
  "vitals": {
    "heart_rate": 118,
    "respiratory_rate": 24,
    "systolic_bp": 88,
    "spo2": 91,
    "temperature_c": 38.6,
    "consciousness": "alert"
  },
  "news2_score": 9,
  "chief_complaint": "Acute crushing chest pain",
  "sbar_brief": "Incoming 54yo male, suspected STEMI, NEWS2 9. Cath lab prep requested."
}
```

### 6.5. `issues` Collection Schema
```json
{
  "_id": "iss_501",
  "_timestamp": "2026-08-29T14:10:00Z",
  "_version": "0.1.0",
  "_actor": "dr_a_mehta",
  "hospital_id": "hosp_mumbai_01",
  "hospital_name": "Lilavati Hospital",
  "category": "equipment",
  "title": "CT Scanner #2 Offline",
  "description": "Calibration fault in primary CT gantry; neuro cases redirected to MRI/CT #1.",
  "severity": "moderate",
  "status": "investigating",
  "reported_by": "Dr. A. Mehta",
  "created_at": "2026-08-29T14:10:00Z",
  "resolved_at": null
}
```

### 6.6. `inventory` Collection Schema
```json
{
  "_id": "inv_801",
  "_timestamp": "2026-08-29T16:00:00Z",
  "_version": "0.1.0",
  "_actor": "inventory_manager",
  "hospital_id": "hosp_mumbai_01",
  "category": "blood_bank",
  "item_name": "O- Packed Red Blood Cells",
  "current_stock": 2,
  "minimum_threshold": 6,
  "unit": "units",
  "is_low_stock": true,
  "last_updated": "2026-08-29T16:00:00Z"
}
```

### 6.7. `reports` Collection Schema
```json
{
  "_id": "rep_2026_0829",
  "_timestamp": "2026-08-29T16:45:00Z",
  "_version": "0.1.0",
  "_actor": "gemini-3.5-flash",
  "date": "2026-08-29",
  "model_used": "gemini-3.5-flash",
  "headline": "Mumbai Metro Regional Emergency Dispatch Intelligence Report",
  "summary_markdown": "### Executive Briefing\n- **Incident Volume**: 48 total dispatches...",
  "key_metrics": {
    "total_cases": 48,
    "critical_cases": 7,
    "sla_compliance_pct": 97.2,
    "auto_reroutes": 1
  }
}
```

---

## 7. Environment Variables & Runtime Configuration

The table below lists all required and optional environment variables across backend, frontend, and deployment layers:

| Variable Name | Required | Default Value | Description |
|---|---|---|---|
| `GOOGLE_API_KEY` | **Yes** (for live AI) | `""` | Gemini API key for `gemini-3.1-pro` and `gemini-3.5-flash`. |
| `GOOGLE_APPLICATION_CREDENTIALS` | Optional | `""` | Path to GCP Service Account JSON for Firestore. |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Optional | `""` | Raw Service Account JSON stored via encrypted Admin Config. |
| `FIRESTORE_COLLECTION` | No | `dispatch_cases` | Primary audit collection name. |
| `DEMO_AUTH_MODE` | No | `true` | When `true`, enables zero-friction demo auth token generation. |
| `DEMO_CITY` | No | `mumbai` | Default city for hospital geospatial queries. |
| `PORT` | No | `8000` | FastAPI server port. |
| `VITE_API_BASE_URL` | No | `http://localhost:8000` | Backend API URL used by React frontend. |

---

## 8. Workstream Ownership & Strict File Boundaries

To prevent merge conflicts during concurrent execution of Sub-Agents A, B, C, and D, the following boundary rules are enforced:

| Sub-Agent | Workstream | Owned Directories & Files | Prohibited / Read-Only Files |
|---|---|---|---|
| **Sub-Agent A** | Frontend | `frontend/`, `ui/`, `admin/` (React/TypeScript views, mock auth stubs, role dashboards, state context, Tailwind UI components) | `lifeline/` backend code, Firestore schema tools, `deploy/` |
| **Sub-Agent B** | Backend / API | `lifeline/main.py`, `lifeline/routes/`, `lifeline/agents/`, `lifeline/schemas.py`, `lifeline/orchestrator.py` | `frontend/`, `deploy/Dockerfile`, raw database schema scripts |
| **Sub-Agent C** | Storage / Data | `lifeline/tools/*_client.py`, `lifeline/firebase.py`, `lifeline/data_access/`, `scripts/seed_*.py`, `data/*.json` | `frontend/`, agent prompts, deploy configurations |
| **Sub-Agent D** | Deploy / Infra | `deploy/`, `Dockerfile`, `Makefile`, `README.md`, environment scripts, Cloud Run deployment configuration | `frontend/src/`, `lifeline/routes/`, `lifeline/agents/` |

---

## 9. Verification & Change Protocol

1. **Golden Rule**: No agent may change any endpoint path, parameter name, or schema definition without first submitting a proposed modification to this contract document.
2. **Deterministic Isolation**: All backend tools (`lifeline/tools/`) must remain independently testable via unit tests without requiring a running frontend or external live cloud credentials (automatic fallback to mock mode).
3. **Documentation Invariant**: Per `AGENTS.md`, documentation directories (`docs/`, `my-agent/docs/`) must contain ONLY `.md` markdown files.
