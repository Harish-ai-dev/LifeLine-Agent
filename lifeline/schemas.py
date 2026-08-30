"""
Shared Pydantic models for every agent's input/output and REST API endpoints.
Conforms strictly to docs/09-parallel-build-contract.md.
"""
from typing import Optional, Literal, List, Dict, Any
from pydantic import BaseModel, Field
import datetime


# ── Standard Error Model ───────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    detail: str
    code: str


# ── Vitals, NEWS2 & Clinical Pipeline Models ──────────────────────────────────

class Vitals(BaseModel):
    heart_rate: int
    respiratory_rate: int
    systolic_bp: int
    spo2: int
    temperature_c: float
    consciousness: Literal["alert", "confused", "unresponsive"]


class News2Result(BaseModel):
    score: int
    risk_band: Literal["low", "medium", "high"]


class Case(BaseModel):
    patient_age: int
    vitals: Vitals
    chief_complaint: str
    mechanism_of_injury: Optional[str] = None


class TriageInput(Case):
    news2_score: News2Result


class TriageOutput(BaseModel):
    severity_label: Literal["mild", "moderate", "critical"]
    required_specialty: str
    notes: str


class Location(BaseModel):
    lat: float
    lng: float


class BedMatchingInput(BaseModel):
    triage_result: TriageOutput
    patient_location: Location


class DispatchRequest(BaseModel):
    case: Case
    patient_location: Location


class HospitalChoice(BaseModel):
    name: str
    lat: float
    lng: float
    distance_km: Optional[float] = None
    eta_minutes: Optional[float] = None


class AlternativeHospital(BaseModel):
    name: str
    reason_not_chosen: str


class BedMatchingOutput(BaseModel):
    chosen_hospital: HospitalChoice
    reasoning: str
    alternatives: List[AlternativeHospital] = []


class RoutingOutput(BaseModel):
    eta_minutes: float
    distance_km: float
    route_summary: str


class BriefingOutput(BaseModel):
    pre_arrival_brief: str


# ── Auth & Identity Models ────────────────────────────────────────────────────

UserRole = Literal["blood_donor", "hospital_staff", "government_authority"]


class LoginRequest(BaseModel):
    username: str
    role: UserRole
    facility_id: Optional[str] = None


class UserProfile(BaseModel):
    id: str
    username: str
    role: UserRole
    facility_id: Optional[str] = None
    facility_name: Optional[str] = None


class LoginResponse(BaseModel):
    token: str
    user: UserProfile


# ── Blood & Organ Donor Models ────────────────────────────────────────────────

class DonorLocation(BaseModel):
    lat: float
    lng: float
    address: Optional[str] = None
    pincode: Optional[str] = None


class DonationRecord(BaseModel):
    donation_id: str
    hospital_name: str
    date: str
    units: int = 1
    type: str = "blood"


class DonorCreateRequest(BaseModel):
    full_name: str
    phone: str
    email: str
    blood_group: str
    is_organ_donor: bool = False
    donor_category: Optional[str] = "Blood"
    location: DonorLocation
    status: Optional[str] = "available"
    last_donation_date: Optional[str] = None
    eligibility_status: Optional[str] = "eligible"


class DonorSummary(BaseModel):
    id: str
    full_name: str
    blood_group: str
    is_organ_donor: bool
    donor_category: Optional[str] = "Blood"
    status: str = "available"
    eligibility_status: str = "eligible"
    total_donations: int = 0
    badge_title: Optional[str] = "Lifesaver"
    _timestamp: Optional[str] = None


class DonorDetail(DonorCreateRequest):
    id: str
    total_donations: int = 0
    badge_title: Optional[str] = "Lifesaver Gold"
    active_match_request_id: Optional[str] = None
    donation_history: List[DonationRecord] = []
    _timestamp: Optional[str] = None


# ── Resource & Blood Requests Models ──────────────────────────────────────────

class DonationLocation(BaseModel):
    hospital_id: str
    hospital_name: str
    department: Optional[str] = "Emergency Blood Bank - 2nd Floor"
    address: Optional[str] = None
    lat: float
    lng: float
    phone: Optional[str] = None


class ResourceRequestCreate(BaseModel):
    hospital_id: str
    hospital_name: Optional[str] = None
    type: Literal["blood", "organ", "equipment", "resource"] = "blood"
    blood_group_needed: Optional[str] = None
    organ_needed: Optional[str] = None
    units_requested: int = 1
    urgency: Literal["STAT_CRITICAL", "URGENT", "ROUTINE"] = "STAT_CRITICAL"
    clinical_indication: Optional[str] = None
    patient_tracking_number: Optional[str] = None
    patient_name: Optional[str] = None
    donation_location: Optional[DonationLocation] = None


class ResourceRequestItem(BaseModel):
    id: str
    request_tracking_number: str
    hospital_id: str
    hospital_name: str
    patient_tracking_number: Optional[str] = None
    patient_name: Optional[str] = None
    type: str = "blood"
    blood_group_needed: Optional[str] = None
    organ_needed: Optional[str] = None
    units_requested: int = 1
    units_fulfilled: int = 0
    urgency: str = "STAT_CRITICAL"
    clinical_indication: Optional[str] = None
    status: Literal["open", "matched", "fulfilled", "cancelled"] = "open"
    donation_location: Optional[DonationLocation] = None
    matched_donors: List[Dict[str, Any]] = []
    _timestamp: Optional[str] = None


class ResourceRequestsResponse(BaseModel):
    requests: List[ResourceRequestItem]


class RequestRespondPayload(BaseModel):
    donor_id: str
    response_status: Literal["accepted", "declined"]
    travel_mode: Optional[str] = "driving"
    eta_minutes: Optional[float] = None


class RequestRespondResponse(BaseModel):
    request_id: str
    donor_id: str
    status: str
    donor_response_status: str
    eta_minutes: Optional[float] = None
    updated_at: str


# ── Patients, Bed Reservation & Transfers ─────────────────────────────────────

class PatientRecord(BaseModel):
    id: str
    tracking_number: str
    full_name: str
    age: int
    gender: Optional[str] = "Unknown"
    blood_type: Optional[str] = None
    severity: Literal["mild", "moderate", "critical"]
    assigned_hospital_id: str
    admission_status: Literal["inbound", "admitted", "transferred", "discharged"] = "inbound"
    reserved_bed_type: Optional[str] = None
    reserved_bay_id: Optional[str] = None
    bed_number: Optional[str] = None
    clinical_notes: Optional[str] = None
    eta_minutes: Optional[float] = None
    vitals: Vitals
    news2_score: int
    chief_complaint: str
    sbar_brief: Optional[str] = None
    _timestamp: Optional[str] = None


class PatientsResponse(BaseModel):
    patients: List[PatientRecord]


class PatientUpdateRequest(BaseModel):
    admission_status: Optional[Literal["inbound", "admitted", "transferred", "discharged"]] = None
    clinical_notes: Optional[str] = None
    bed_number: Optional[str] = None
    reserved_bed_type: Optional[str] = None
    reserved_bay_id: Optional[str] = None


class BedReserveRequest(BaseModel):
    patient_id: str
    hospital_id: str
    bed_type: str
    bay_id: Optional[str] = None
    action: Literal["reserve", "release"] = "reserve"


class BedReserveResponse(BaseModel):
    bed_id: str
    bay_id: Optional[str] = None
    status: str = "reserved"
    patient_id: str
    reserved_at: str


class TransferRequest(BaseModel):
    current_hospital_id: str
    reason: str
    patient_location: Location
    case_details: Optional[Case] = None


class TransferredHospitalInfo(BaseModel):
    name: str
    lat: float
    lng: float
    distance_km: Optional[float] = None
    eta_minutes: Optional[float] = None


class TransferResponse(BaseModel):
    transfer_status: str = "reassigned"
    case_id: str
    previous_hospital: str
    transferred_to_hospital: TransferredHospitalInfo
    reasoning: str
    audit_id: str


# ── Issues Logging Models ─────────────────────────────────────────────────────

class IssueCreateRequest(BaseModel):
    hospital_id: str
    hospital_name: Optional[str] = None
    category: Literal["equipment", "facility", "staffing", "supplies", "it"]
    title: str
    description: str
    severity: Literal["low", "moderate", "high", "critical"] = "moderate"
    status: Literal["open", "investigating", "in_progress", "resolved"] = "investigating"
    reported_by: str


class IssueRecord(IssueCreateRequest):
    id: str
    created_at: str
    resolved_at: Optional[str] = None
    _timestamp: Optional[str] = None


class IssueUpdateRequest(BaseModel):
    status: Optional[Literal["open", "investigating", "in_progress", "resolved"]] = None
    severity: Optional[Literal["low", "moderate", "high", "critical"]] = None
    description: Optional[str] = None
    resolved_at: Optional[str] = None


class IssuesResponse(BaseModel):
    issues: List[IssueRecord]


# ── Inventory Tracking Models ─────────────────────────────────────────────────

class InventoryItemRecord(BaseModel):
    id: str
    hospital_id: str
    category: Literal["blood_bank", "medicine", "equipment", "ppe", "consumables"]
    item_name: str
    current_stock: int
    minimum_threshold: int
    unit: str = "units"
    is_low_stock: bool
    last_updated: str
    _timestamp: Optional[str] = None


class InventoryUpdateRequest(BaseModel):
    current_stock: Optional[int] = None
    minimum_threshold: Optional[int] = None
    item_name: Optional[str] = None


class InventoryResponse(BaseModel):
    inventory: List[InventoryItemRecord]


# ── Regional Intelligence & Reports Models ────────────────────────────────────

class HospitalSummary(BaseModel):
    id: str
    name: str
    status: str = "active"
    available_icu_beds: int
    total_icu_beds: int
    compliance_rate: float
    open_issues_count: int


class NetworkOverviewResponse(BaseModel):
    total_incidents_today: int
    active_critical_alerts: int
    jurisdiction_sla_compliance_percent: float
    mean_response_time_seconds: float
    total_hospitals_registered: int
    hospitals_on_diversion: int
    tier2_escalation_count: int
    overall_district_bed_capacity_percent: float
    total_registered_donors: int
    active_donor_requests: int
    blood_units_fulfilled_today: int
    hospital_summaries: List[HospitalSummary]


class DailyReportKeyMetrics(BaseModel):
    total_cases: int
    critical_cases: int
    sla_compliance_pct: float
    auto_reroutes: int


class DailyReportResponse(BaseModel):
    report_id: str
    date: str
    model_used: str = "gemini-3.5-flash"
    headline: str
    summary_markdown: str
    key_metrics: DailyReportKeyMetrics
    generated_at: str


class ReportQueryRequest(BaseModel):
    query: str


class ReportQueryResponse(BaseModel):
    query: str
    answer: str
    referenced_facilities: List[str] = []
    timestamp: str
