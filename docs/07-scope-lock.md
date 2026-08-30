# 07 — Scope Lock

> **Status**: LOCKED  
> **Last Updated**: 2026-08-29 (Scope expanded for fuller product demo, strictly within hackathon requirements)

---

## 1. In Scope (Must Build)

### 1.1. Core Multi-Agent Emergency Dispatch Pipeline
- **NEWS2 Clinical Scoring Engine**: Deterministic calculation (Royal College of Physicians standard) executed in Python tool before LLM reasoning.
- **Triage Agent**: Clinical reasoning over vitals and NEWS2 score using **`gemini-3.1-pro`** (clinical flagship).
- **Bed-Matching Agent**: Facility ranking and specialty matching using **`gemini-3.5-flash`**, real OpenStreetMap Overpass geospatial data, and OSRM routing.
- **Routing Agent**: ETA and route summarization using **`gemini-3.5-flash`** / OSRM.
- **Briefing Agent**: Plain-language pre-arrival SBAR summary using **`gemini-3.5-flash`**.
- **Orchestrator**: Multi-agent sequential chain linking all agents with full state preservation.

### 1.2. Cloud Infrastructure & Storage
- **Cloud Run Deployment**: Containerized FastAPI service scaling to zero.
- **Firestore Operational & Audit Database**: Immutable audit logs and operational storage (`dispatch_cases`, `donors`, `requests`, `patients`, `issues`, `inventory`, `reports`) via Firebase Admin SDK with offline dev fallback.

### 1.3. Multi-Role Expanded Product Experience *(Added 2026-08-29)*
- **Demo / Mock Authentication**: Role-based login (`blood_donor`, `hospital_staff`, `government_authority`) generating standard `lifeline_mock_<role>_<uid>` bearer tokens for zero-friction evaluation.
- **Blood & Organ Donor Portal**: Personal profile, blood/organ pledge status, open emergency request feed, accept/decline action with live ETA, and donation history.
- **Hospital Operations Console**: Live emergency SOS inbox, patient list with admission status updates, advance bed/bay reservation, no-bed transfer rerouting, resource requests, issue tracking, and medicine/equipment inventory.
- **Government Authority Intelligence Dashboard**: Regional network overview, hospital capacity strain indices, SLA compliance rates, AI-generated Daily Intelligence Briefing (`GET /reports/daily`) via **`gemini-3.5-flash`**, and interactive NL query assistant (`POST /reports/query`).

### 1.4. Frontend UI
- **React + Vite + TypeScript Application**: Dedicated role-based screens with responsive layouts, dark clinical aesthetic, and real-time state management.

---

## 2. Stretch (Only if Ahead of Schedule)

- Live speech-to-text audio ingestion for simulated 911 dispatch calls.
- Dynamic multi-city selector without backend configuration restart.
- SMS / WhatsApp webhook simulation for donor callouts.

---

## 3. Explicitly Out-of-Scope (Do NOT Build)

The following capabilities are strictly excluded from the hackathon implementation and will only be referenced in the documentation as intended production integrations:

- **Live HL7 / FHIR Hospital EHR Integration**: Private hospital EHR connectivity is replaced with realistic simulated clinical dossiers.
- **Real-Time Live Hospital Bed IoT Sensors**: Physical bed sensor APIs are replaced with deterministic hospital seed data and in-memory reservations.
- **Payment Processing & Insurance Billing**: No commercial payment gateway or insurance claim integration.
- **Government Biometric / Citizen Identity Verification**: No live government identity database connectivity.
- **Production HIPAA / GDPR Compliance Certification**: System architecture follows compliance best practices (auditability, zero credential hardcoding) but formal certification is out of scope.

---

## 4. Scope Governance Rule

If a feature or build task is not explicitly listed in **In Scope** above or defined in `docs/09-parallel-build-contract.md`, it **must not** be built during this sprint. Any proposed additions must be logged in `docs/03-decision-log.md` and approved before code modifications begin.
