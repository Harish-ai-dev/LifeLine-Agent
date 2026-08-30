export type PortalView = 'hospital' | 'authority' | 'donor' | 'dispatch' | 'patient-simulator';

export type UserRole = 'blood_donor' | 'hospital_staff' | 'government_authority';

export type HospitalRole = 'triage' | 'doctor' | 'admin' | 'blood_bank';
export type AuthorityRole = 'analyst' | 'director';
export type DonorRole = 'donor_individual';

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
  facility_id?: string;
  facility_name?: string;
  donor_id?: string;
  avatar?: string;
  title?: string;
}

export type BloodGroup = 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';

export type OrganType = 'Kidney' | 'Liver' | 'Heart' | 'Lungs' | 'Cornea' | 'Pancreas';

export type DonorRequestType = 'blood' | 'organ' | 'equipment';

export type RequestUrgency = 'STAT_CRITICAL' | 'URGENT' | 'STANDARD';

export type TravelMode = 'driving' | 'transit' | 'walking';

export type DonorResponseStatus =
  | 'matched'
  | 'notified'
  | 'accepted'
  | 'en_route'
  | 'arrived'
  | 'completed'
  | 'declined';

export type AlertStatus =
  | 'pending_ack'      // Auto-assigned, awaiting hospital acknowledgement (Tier 1 countdown active)
  | 'acknowledged'     // Hospital acknowledged, ambulance en-route
  | 'bay_preparing'    // ER trauma bay / cardiac cath lab prepared
  | 'bay_ready'        // Resuscitation bay standing by
  | 'admitted'         // Patient arrived and admitted to ER
  | 'reassigned'       // Reassigned to another hospital via Tier 1 or manual override
  | 'escalated_gov'    // Escalated to Tier 2 (Government Authority) due to hospital non-response
  | 'resolved';        // Emergency resolved / discharged

export type AlertSeverity = 'critical' | 'moderate' | 'mild';

export type CrisisType = 'cardiac' | 'trauma' | 'breathing' | 'sepsis' | 'general';

export interface HospitalFacility {
  id: string;
  name: string;
  code: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  emergencyPhone: string;
  tier: 'Level 1 Trauma' | 'Level 2 Trauma' | 'Cardiac Center' | 'General Hospital';
  specialties: string[];
  totalIcuBeds: number;
  availableIcuBeds: number;
  totalTraumaBays: number;
  availableTraumaBays: number;
  isDiverting: boolean; // On diversion status (bypassed by auto-routing)
  status: 'active' | 'busy' | 'critical_load' | 'offline';
  slaResponseTimeSec: number;
  totalAlertsHandled: number;
  missedAlertsCount: number;
  complianceRate: number; // 0 - 100%
  bloodBankInventory: Record<BloodGroup, number>;
}

export interface PatientMedicalDossier {
  fullName: string;
  age: number;
  gender: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  medications: Array<{ name: string; dosage: string; frequency: string }>;
  organDonor: boolean;
  emergencyNotes: string;
  primaryPhysician: {
    name: string;
    phone: string;
    hospital: string;
  };
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    notified: boolean;
  }>;
}

export interface EmergencyIncidentAlert {
  id: string;
  trackingNumber: string;
  timestamp: string;
  createdAt: number; // epoch ms
  crisisType: CrisisType;
  severity: AlertSeverity;
  chiefComplaint: string;
  mechanismOfInjury?: string;
  
  // Patient & Clinical
  patient: PatientMedicalDossier;
  vitals: {
    heartRate: number;
    respiratoryRate: number;
    systolicBp: number;
    spo2: number;
    temperatureC: number;
    consciousness: 'alert' | 'voice' | 'pain' | 'unresponsive';
  };
  news2Score: number;
  news2RiskBand: 'low' | 'medium' | 'high';
  sbarBrief: string;

  // Location & Proximity
  location: {
    lat: number;
    lng: number;
    address: string;
    landmark: string;
  };

  // Hospital Routing & Escalation
  assignedHospitalId: string;
  previousHospitalIds?: string[];
  status: AlertStatus;
  distanceKm: number;
  drivingEtaMinutes: number;

  // SLA & Escalation Timers (seconds)
  tier1TimeoutSec: number; // e.g. 60s for hospital to acknowledge
  tier1SecondsRemaining: number;
  isTier1Escalated: boolean;
  isTier2Escalated: boolean; // Escalated to Government Authority
  escalatedToGovAt?: string;
  escalationReason?: string;

  // Logs & Overrides
  assignedAt: string;
  acknowledgedAt?: string;
  bayReadyAt?: string;
  admittedAt?: string;
  resolvedAt?: string;
  overriddenBy?: string;
  overrideReason?: string;

  // Bed & Bay Capacity Tracking
  hasReservedBay?: boolean;
  hasReservedIcu?: boolean;
  reservedBayId?: string;
  reservedBedType?: string;
}

export interface DonationLocation {
  hospitalId: string;
  hospitalName: string;
  department: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  emergencyPhone: string;
  landmark?: string;
}

export interface MatchedDonorEntry {
  donorId: string;
  donorName: string;
  bloodGroup: BloodGroup;
  distanceKm: number;
  etaMinutes: number;
  travelMode?: TravelMode;
  responseStatus: DonorResponseStatus;
  respondedAt?: string;
  contactPhone: string;
  currentEtaMinutes?: number;
}

export interface DonorRequest {
  id: string;
  requestTrackingNumber: string;
  hospitalId: string;
  hospitalName: string;
  patientTrackingNumber?: string;
  patientName: string;
  type: DonorRequestType;
  bloodGroupNeeded?: BloodGroup;
  organNeeded?: OrganType;
  unitsRequested: number;
  unitsFulfilled: number;
  urgency: RequestUrgency;
  clinicalIndication: string;
  createdAt: number;
  status: 'open' | 'matched' | 'fulfilled' | 'cancelled';
  matchedDonors: MatchedDonorEntry[];
  donationLocation: DonationLocation;
}

export interface DonationHistoryRecord {
  donation_id: string;
  hospital_name: string;
  date: string;
  units: number;
  type: 'blood' | 'platelets' | 'plasma';
}

export interface DonorProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  bloodGroup: BloodGroup;
  isOrganDonor: boolean;
  organConsentRegistryNumber?: string;
  donorCategory: 'Blood' | 'Organ' | 'Dual';
  lat: number;
  lng: number;
  address: string;
  pincode: string;
  status: 'available' | 'in_transit' | 'standby' | 'cooldown';
  lastDonationDate: string;
  eligibilityStatus: 'eligible' | 'deferred';
  totalDonations: number;
  badgeTitle: string;
  activeMatchRequestId?: string;
  donation_history?: DonationHistoryRecord[];
}

export interface HospitalIssue {
  id: string;
  hospital_id: string;
  hospital_name: string;
  category: 'equipment' | 'facility' | 'staffing' | 'supplies';
  title: string;
  description: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  status: 'investigating' | 'in_progress' | 'resolved';
  reported_by: string;
  created_at: string;
  resolved_at?: string | null;
}

export interface InventoryItem {
  id: string;
  hospital_id: string;
  category: 'blood_bank' | 'medication' | 'equipment' | 'trauma_supplies';
  item_name: string;
  current_stock: number;
  minimum_threshold: number;
  unit: string;
  is_low_stock: boolean;
  last_updated: string;
}

export interface DailyIntelligenceReport {
  report_id: string;
  date: string;
  model_used: string;
  headline: string;
  summary_markdown: string;
  key_metrics: {
    total_cases: number;
    critical_cases: number;
    sla_compliance_pct: number;
    auto_reroutes: number;
  };
  generated_at: string;
}

export interface NaturalLanguageQueryResponse {
  query: string;
  answer: string;
  referenced_facilities: string[];
  timestamp: string;
}

export interface DispatchProgressionStage {
  stage: 'triage' | 'bed_matching' | 'routing_briefing';
  agent_name: string;
  model_used: 'gemini-3.1-pro' | 'gemini-3.5-flash';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  headline: string;
  details: Record<string, any>;
  timestamp?: string;
}

export interface MultiAgentDispatchExecution {
  case_id: string;
  timestamp: string;
  patient_input: {
    patient_age: number;
    vitals: {
      heart_rate: number;
      respiratory_rate: number;
      systolic_bp: number;
      spo2: number;
      temperature_c: number;
      consciousness: string;
    };
    chief_complaint: string;
    mechanism_of_injury?: string | null;
  };
  location_input: {
    lat: number;
    lng: number;
    address?: string;
  };
  news2_score: {
    score: number;
    risk_band: 'low' | 'medium' | 'high';
  };
  triage_result: {
    severity_label: 'critical' | 'moderate' | 'mild';
    required_specialty: string;
    notes: string;
    model: string;
  };
  bed_matching_result: {
    chosen_hospital: {
      id: string;
      name: string;
      lat: number;
      lng: number;
      distance_km: number;
      eta_minutes: number;
    };
    reasoning: string;
    alternatives: Array<{ name: string; reason_not_chosen: string }>;
    model: string;
  };
  routing_result: {
    eta_minutes: number;
    distance_km: number;
    route_summary: string;
    model: string;
  };
  briefing_result: {
    pre_arrival_brief: string;
    model: string;
  };
  audit_record_id: string;
}

export interface AuditEventLog {
  id: string;
  timestamp: string;
  alertId: string;
  alertTrackingNumber: string;
  hospitalName: string;
  eventType:
    | 'AUTO_ROUTED'
    | 'ACKNOWLEDGED'
    | 'BAY_PREPARED'
    | 'AUTO_BED_RESERVED'
    | 'AUTO_BED_FREED'
    | 'TIER_1_AUTO_REASSIGNED'
    | 'TIER_2_GOV_ESCALATED'
    | 'AUTHORITY_INTERVENTION'
    | 'MANUAL_OVERRIDE'
    | 'DONOR_REQUEST_RAISED'
    | 'AUTO_DONOR_CALLOUT_TRIGGERED'
    | 'DONOR_AUTO_MATCHED'
    | 'DONOR_ACCEPTED_TRANSIT'
    | 'DONOR_EN_ROUTE'
    | 'DONOR_ARRIVED'
    | 'AUTO_BLOOD_RESTOCKED'
    | 'ISSUE_REPORTED'
    | 'ISSUE_RESOLVED'
    | 'INVENTORY_RESTOCKED'
    | 'DAILY_REPORT_GENERATED'
    | 'RESOLVED';
  severity: AlertSeverity;
  actor: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface JurisdictionAnalytics {
  totalIncidentsToday: number;
  activeCriticalAlerts: number;
  jurisdictionSlaCompliance: number; // e.g. 96.4%
  meanResponseTimeSec: number;
  totalHospitalsRegistered: number;
  hospitalsOnDiversion: number;
  tier2EscalationCount: number;
  overallDistrictCapacityPercent: number;
  totalRegisteredDonors: number;
  activeDonorRequests: number;
  bloodUnitsFulfilledToday: number;
}
