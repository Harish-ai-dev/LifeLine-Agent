'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  PortalView,
  UserRole,
  AuthUser,
  HospitalRole,
  AuthorityRole,
  DonorRole,
  HospitalFacility,
  EmergencyIncidentAlert,
  AlertStatus,
  AuditEventLog,
  JurisdictionAnalytics,
  CrisisType,
  DonorProfile,
  DonorRequest,
  MatchedDonorEntry,
  BloodGroup,
  OrganType,
  DonorRequestType,
  RequestUrgency,
  DonorResponseStatus,
  TravelMode,
  DonationLocation,
  HospitalIssue,
  InventoryItem,
  DailyIntelligenceReport,
  NaturalLanguageQueryResponse,
  DispatchProgressionStage,
  MultiAgentDispatchExecution,
} from '../types/dashboard';
import {
  INITIAL_HOSPITALS,
  INITIAL_INCIDENT_ALERTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_ANALYTICS,
  INITIAL_REGISTERED_DONORS,
  INITIAL_DONOR_REQUESTS,
  DEMO_USERS,
  INITIAL_HOSPITAL_ISSUES,
  INITIAL_INVENTORY,
  INITIAL_DAILY_REPORT,
  SAMPLE_NL_QUERIES,
} from '../data/mockDashboardData';
import { api } from '../utils/apiClient';

interface DashboardContextType {
  // Auth & Role State (09-parallel-build-contract.md)
  currentUser: AuthUser;
  authToken: string;
  demoUsers: AuthUser[];
  login: (username: string, role: UserRole, facilityId?: string, donorId?: string) => void;
  logout: () => void;
  switchUserRole: (role: UserRole) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Navigation & Role State
  portalView: PortalView;
  setPortalView: (view: PortalView) => void;
  activeHospitalId: string;
  setActiveHospitalId: (id: string) => void;
  hospitalRole: HospitalRole;
  setHospitalRole: (role: HospitalRole) => void;
  authorityRole: AuthorityRole;
  setAuthorityRole: (role: AuthorityRole) => void;
  activeDonorId: string;
  setActiveDonorId: (id: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;

  // Main Data
  hospitals: HospitalFacility[];
  alerts: EmergencyIncidentAlert[];
  auditLogs: AuditEventLog[];
  analytics: JurisdictionAnalytics;
  selectedAlert: EmergencyIncidentAlert | null;
  setSelectedAlert: (alert: EmergencyIncidentAlert | null) => void;

  // Donor Network Data
  donors: DonorProfile[];
  donorRequests: DonorRequest[];
  currentDonor: DonorProfile;
  currentHospital: HospitalFacility;

  // Operational Issue Tracker
  issues: HospitalIssue[];
  createIssue: (issue: Omit<HospitalIssue, 'id' | 'created_at' | 'resolved_at'>) => void;
  resolveIssue: (issueId: string) => void;

  // Medicine & Supply Inventory
  inventory: InventoryItem[];
  updateInventoryStock: (itemId: string, newStock: number) => void;
  restockItem: (itemId: string, deltaAmount: number) => void;

  // AI Daily Intelligence & Natural Language Query
  dailyReport: DailyIntelligenceReport;
  refreshDailyReport: () => Promise<DailyIntelligenceReport>;
  queryNetworkState: (query: string) => Promise<NaturalLanguageQueryResponse>;

  // Reactive Multi-Agent Dispatch Progression
  isDispatching: boolean;
  dispatchStages: DispatchProgressionStage[];
  activeDispatchExecution: MultiAgentDispatchExecution | null;
  triggerMultiAgentDispatch: (caseData: {
    patientAge: number;
    chiefComplaint: string;
    vitals: {
      heartRate: number;
      respiratoryRate: number;
      systolicBp: number;
      spo2: number;
      temperatureC: number;
      consciousness: string;
    };
    location: {
      address: string;
      lat: number;
      lng: number;
    };
  }) => Promise<MultiAgentDispatchExecution>;
  resetDispatchProgression: () => void;

  // Hospital & Emergency Actions
  acknowledgeAlert: (alertId: string, actorName?: string) => void;
  prepareBay: (alertId: string, bayName: string, actorName?: string) => void;
  reserveBedOrBay: (alertId: string, hospitalId: string, bedType: string, bayId: string) => void;
  admitPatient: (alertId: string, actorName?: string) => void;
  resolveAlert: (alertId: string, actorName?: string) => void;
  reassignAlert: (alertId: string, targetHospitalId: string, reason: string, actorName?: string) => void;
  authorityIntervene: (alertId: string, targetHospitalId: string, notes: string, actorName?: string) => void;
  toggleDiversion: (hospitalId: string) => void;
  updateHospitalCapacity: (hospitalId: string, icuAvailable: number, traumaAvailable: number) => void;
  triggerSimulatedAlert: (crisisType: CrisisType, locationName?: string, lat?: number, lng?: number) => void;

  // Donor Network Actions
  createDonorRequest: (params: {
    hospitalId: string;
    patientTrackingNumber?: string;
    patientName: string;
    type: DonorRequestType;
    bloodGroupNeeded?: BloodGroup;
    organNeeded?: OrganType;
    unitsRequested: number;
    urgency: RequestUrgency;
    clinicalIndication: string;
  }) => void;
  respondToDonorRequest: (requestId: string, donorId: string, response: DonorResponseStatus) => void;
  updateDonorTravelMode: (requestId: string, donorId: string, mode: TravelMode) => void;
  registerNewDonor: (profile: Omit<DonorProfile, 'id' | 'totalDonations' | 'badgeTitle'>) => void;
  updateHospitalBloodBank: (hospitalId: string, bloodGroup: BloodGroup, deltaUnits: number) => void;
  checkAndAutoTriggerBloodDeficit: (hospitalId: string, bloodGroup: BloodGroup, currentUnits: number) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Compatibility matrix helper for blood matching
const isBloodCompatible = (donorGroup: BloodGroup, recipientGroup: BloodGroup): boolean => {
  if (donorGroup === 'O-') return true; // Universal donor
  if (recipientGroup === 'AB+') return true; // Universal recipient
  if (donorGroup === recipientGroup) return true;
  if (recipientGroup === 'A+' && donorGroup === 'O+') return true;
  if (recipientGroup === 'B+' && donorGroup === 'O+') return true;
  if (recipientGroup === 'AB-' && (donorGroup === 'A-' || donorGroup === 'B-')) return true;
  return false;
};

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [portalView, setPortalView] = useState<PortalView>('hospital');
  const [activeHospitalId, setActiveHospitalId] = useState<string>('hosp-lilavati');
  const [hospitalRole, setHospitalRole] = useState<HospitalRole>('doctor');
  const [authorityRole, setAuthorityRole] = useState<AuthorityRole>('director');
  const [activeDonorId, setActiveDonorId] = useState<string>('donor-101');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [hospitals, setHospitals] = useState<HospitalFacility[]>(INITIAL_HOSPITALS);
  const [alerts, setAlerts] = useState<EmergencyIncidentAlert[]>(INITIAL_INCIDENT_ALERTS);
  const [auditLogs, setAuditLogs] = useState<AuditEventLog[]>(INITIAL_AUDIT_LOGS);
  const [analytics, setAnalytics] = useState<JurisdictionAnalytics>(INITIAL_ANALYTICS);
  const [selectedAlert, setSelectedAlert] = useState<EmergencyIncidentAlert | null>(null);

  // ── AUTHENTICATION & PERSONA STATE (09-parallel-build-contract.md) ───────
  const [currentUser, setCurrentUser] = useState<AuthUser>(DEMO_USERS[0]);
  const [authToken, setAuthToken] = useState<string>(`lifeline_mock_${DEMO_USERS[0].role}_${DEMO_USERS[0].id}`);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // ── OPERATIONAL ISSUES & INVENTORY STATE ──────────────────────────────────
  const [issues, setIssues] = useState<HospitalIssue[]>(INITIAL_HOSPITAL_ISSUES);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);

  useEffect(() => {
    if (authToken) {
      api.setToken(authToken);
      
      // Fetch real data from backend
      Promise.all([
        api.getIssues().catch(e => { console.error('Failed to get issues', e); return INITIAL_HOSPITAL_ISSUES; }),
        api.getInventory().catch(e => { console.error('Failed to get inventory', e); return INITIAL_INVENTORY; })
      ]).then(([fetchedIssues, fetchedInventory]) => {
        setIssues(fetchedIssues);
        setInventory(fetchedInventory);
      });
    }
  }, [authToken]);

  // ── AI DAILY REPORT & NL QUERY STATE (Gemini 3.5-flash) ───────────────────
  const [dailyReport, setDailyReport] = useState<DailyIntelligenceReport>(INITIAL_DAILY_REPORT);

  // ── REACTIVE 3-STAGE MULTI-AGENT DISPATCH STATE ───────────────────────────
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchStages, setDispatchStages] = useState<DispatchProgressionStage[]>([]);
  const [activeDispatchExecution, setActiveDispatchExecution] = useState<MultiAgentDispatchExecution | null>(null);

  // Donor state
  const [donors, setDonors] = useState<DonorProfile[]>(INITIAL_REGISTERED_DONORS);
  const [donorRequests, setDonorRequests] = useState<DonorRequest[]>(INITIAL_DONOR_REQUESTS);

  const currentHospital = hospitals.find((h) => h.id === activeHospitalId) || hospitals[0];
  const currentDonor = donors.find((d) => d.id === activeDonorId) || donors[0];

  const watchdogRanRef = useRef(false);

  const router = useRouter();

  // ── AUTH ACTIONS ──────────────────────────────────────────────────────────
  const login = useCallback(
    async (username: string, role: UserRole, facilityId?: string, donorId?: string) => {
      // ── Try live backend API first ───────────────────────────────────────
      try {
        const data = await api.login({ username, role, facility_id: facilityId });
        setCurrentUser(data.user);
        setAuthToken(data.token);
        if (data.user.facility_id) setActiveHospitalId(data.user.facility_id);
        if (donorId) setActiveDonorId(donorId);
        if (data.user.role === 'hospital_staff') router.push('/hospital');
        else if (data.user.role === 'government_authority') router.push('/government');
        else if (data.user.role === 'blood_donor') router.push('/donor');
        return;
      } catch (e) {
        console.warn('[LifeLine] Backend API unreachable — using offline demo auth mode.');
      }

      // ── Offline Demo Fallback (no backend required) ──────────────────────
      // 1. Exact username + role match (case-insensitive)
      // 2. Role match with facilityId
      // 3. First user of matching role
      let demoUser =
        DEMO_USERS.find(
          (u) => u.username.toLowerCase() === username.toLowerCase() && u.role === role
        ) ||
        DEMO_USERS.find(
          (u) => u.role === role && (!facilityId || u.facility_id === facilityId)
        ) ||
        DEMO_USERS.find((u) => u.role === role) ||
        DEMO_USERS[0];

      const demoToken = `lifeline_demo_${role}_${Date.now()}`;
      setCurrentUser(demoUser);
      setAuthToken(demoToken);
      api.setToken(demoToken);

      // Resolve the correct facility ID from the hospitals list
      const targetFacilityId = facilityId || demoUser.facility_id;
      if (targetFacilityId) {
        const matched = INITIAL_HOSPITALS.find(
          (h) => h.id === targetFacilityId || h.code.toLowerCase().includes(targetFacilityId.split('_').slice(-1)[0])
        );
        if (matched) setActiveHospitalId(matched.id);
        else setActiveHospitalId(INITIAL_HOSPITALS[0].id);
      }
      if (donorId) setActiveDonorId(donorId);

      if (demoUser.role === 'hospital_staff') router.push('/hospital');
      else if (demoUser.role === 'government_authority') router.push('/government');
      else if (demoUser.role === 'blood_donor') router.push('/donor');
    },
    [router]
  );

  const logout = useCallback(() => {
    router.push('/');
  }, [router]);

  const switchUserRole = useCallback(
    (role: UserRole) => {
      const defaultUser = DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[0];
      login(defaultUser.username, defaultUser.role, defaultUser.facility_id, defaultUser.donor_id);
    },
    [login]
  );

  // ── ISSUE TRACKER ACTIONS ─────────────────────────────────────────────────
  const createIssue = async (newIssue: Omit<HospitalIssue, 'id' | 'created_at' | 'resolved_at'>) => {
    try {
      const created = await api.createIssue(newIssue);
      setIssues((prev) => [created, ...prev]);

      const logEntry: AuditEventLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        alertId: 'ISSUE-LOG',
        alertTrackingNumber: 'FACILITY-ALERT',
        hospitalName: newIssue.hospital_name,
        eventType: 'ISSUE_REPORTED',
        severity: newIssue.severity === 'critical' ? 'critical' : newIssue.severity === 'high' ? 'moderate' : 'mild',
        actor: newIssue.reported_by,
        description: `OPERATIONAL ISSUE REPORTED: [${newIssue.category.toUpperCase()}] ${newIssue.title} (${newIssue.severity.toUpperCase()}).`,
      };
      setAuditLogs((logs) => [logEntry, ...logs]);
    } catch (e) {
      console.error('Failed to create issue', e);
    }
  };

  const resolveIssue = async (issueId: string) => {
    try {
      const resolved = await api.resolveIssue(issueId);
      setIssues((prev) =>
        prev.map((iss) => (iss.id === issueId ? resolved : iss))
      );

      const logEntry: AuditEventLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        alertId: 'ISSUE-RESOLVED',
        alertTrackingNumber: 'FACILITY-ALERT',
        hospitalName: resolved.hospital_name,
        eventType: 'ISSUE_RESOLVED',
        severity: 'mild',
        actor: currentUser.username || 'Hospital Admin',
        description: `OPERATIONAL ISSUE RESOLVED: ${resolved.title}.`,
      };
      setAuditLogs((logs) => [logEntry, ...logs]);
    } catch (e) {
      console.error('Failed to resolve issue', e);
    }
  };

  // ── INVENTORY ACTIONS ─────────────────────────────────────────────────────
  const updateInventoryStock = (itemId: string, newStock: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const clamped = Math.max(0, newStock);
          return {
            ...item,
            current_stock: clamped,
            is_low_stock: clamped <= item.minimum_threshold,
            last_updated: new Date().toISOString(),
          };
        }
        return item;
      })
    );
  };

  const restockItem = (itemId: string, deltaAmount: number) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;
    const newStock = item.current_stock + deltaAmount;
    updateInventoryStock(itemId, newStock);

    const logEntry: AuditEventLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      alertId: 'INV-RESTOCK',
      alertTrackingNumber: 'INVENTORY-SYNC',
      hospitalName: currentHospital.name,
      eventType: 'INVENTORY_RESTOCKED',
      severity: 'mild',
      actor: currentUser.username || 'Hospital Inventory Manager',
      description: `INVENTORY RESTOCKED: ${item.item_name} +${deltaAmount} ${item.unit} (New Total: ${newStock}).`,
    };
    setAuditLogs((logs) => [logEntry, ...logs]);
  };

  // ── ADVANCE BED & BAY RESERVATION ─────────────────────────────────────────
  const reserveBedOrBay = (alertId: string, hospitalId: string, bedType: string, bayId: string) => {
    prepareBay(alertId, bayId, `Admissions (${currentUser.username})`);
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === alertId) {
          const updated: EmergencyIncidentAlert = {
            ...a,
            hasReservedBay: true,
            hasReservedIcu: bedType.toLowerCase().includes('icu'),
            reservedBayId: bayId,
            reservedBedType: bedType,
            bayReadyAt: new Date().toLocaleTimeString(),
          };
          if (selectedAlert?.id === alertId) setSelectedAlert(updated);
          return updated;
        }
        return a;
      })
    );
  };

  // ── AI DAILY INTELLIGENCE & NL QUERY ──────────────────────────────────────
  const refreshDailyReport = async (): Promise<DailyIntelligenceReport> => {
    const totalCases = alerts.length + 35;
    const criticalCases = alerts.filter((a) => a.severity === 'critical').length + 5;
    const autoReroutes = alerts.filter(
      (a) => (a.previousHospitalIds && a.previousHospitalIds.length > 0) || a.isTier1Escalated
    ).length;

    const refreshed: DailyIntelligenceReport = {
      report_id: `rep_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      model_used: 'gemini-3.5-flash',
      headline: `Mumbai Metropolitan Regional Emergency Dispatch Intelligence Report — ${new Date().toLocaleTimeString()}`,
      summary_markdown: `### Executive Clinical Intelligence Briefing\n- **Incident Volumes**: ${totalCases} total emergency dispatches across Region IV. ${criticalCases} classified as high-acuity life threats.\n- **SLA & Triage Compliance**: Regional compliance stands at **${analytics.jurisdictionSlaCompliance}%** with a mean response time of **${analytics.meanResponseTimeSec}s**.\n- **Hospital Strain & Diversions**: ${hospitals.filter((h) => h.isDiverting).length} facility on diversion. Lilavati (${hospitals.find((h) => h.id === 'hosp-lilavati')?.availableIcuBeds} ICU beds free) and Hinduja (${hospitals.find((h) => h.id === 'hosp-hinduja')?.availableIcuBeds} ICU beds free) maintaining stable operational headroom.\n- **Autonomous Auto-Reroutes**: ${autoReroutes} cases proactively reassigned under Tier 1 auto-dispatch protocol.\n- **Donor Emergency Callouts**: ${donorRequests.length} STAT donor requests active with rapid response matching.`,
      key_metrics: {
        total_cases: totalCases,
        critical_cases: criticalCases,
        sla_compliance_pct: analytics.jurisdictionSlaCompliance,
        auto_reroutes: autoReroutes,
      },
      generated_at: new Date().toISOString(),
    };

    setDailyReport(refreshed);
    return refreshed;
  };

  const queryNetworkState = async (queryText: string): Promise<NaturalLanguageQueryResponse> => {
    const normalized = queryText.toLowerCase();
    let answer = '';
    let referenced: string[] = [];

    if (normalized.includes('icu') || normalized.includes('bed') || normalized.includes('capacity') || normalized.includes('shortage')) {
      const lowIcuHosps = hospitals.filter((h) => h.availableIcuBeds <= 3);
      referenced = lowIcuHosps.map((h) => h.name);
      answer = `Based on live network telemetry, ${lowIcuHosps.map((h) => `${h.name} has only ${h.availableIcuBeds} open ICU bed(s)`).join(', ')}. Overall district bed load is ${analytics.overallDistrictCapacityPercent}%.`;
    } else if (normalized.includes('blood') || normalized.includes('donor') || normalized.includes('o-') || normalized.includes('o negative')) {
      const lowBlood = hospitals.filter((h) => (h.bloodBankInventory['O-'] || 0) <= 2);
      referenced = lowBlood.map((h) => h.name);
      answer = `Live blood bank status indicates critical O- deficit at ${lowBlood.map((h) => `${h.name} (${h.bloodBankInventory['O-'] || 0} units remaining)`).join(' and ')}. ${donors.filter((d) => d.status === 'available').length} registered donors are in available standby radius.`;
    } else if (normalized.includes('escalat') || normalized.includes('tier') || normalized.includes('sla') || normalized.includes('violation')) {
      const escalatedAlerts = alerts.filter((a) => a.isTier1Escalated || a.isTier2Escalated);
      referenced = ['Lilavati Hospital & Research Centre', 'Lokmanya Tilak (Sion) Hospital'];
      answer = `Network SLA tracking reports ${escalatedAlerts.length} escalated incident(s) today. District SLA adherence is at ${analytics.jurisdictionSlaCompliance}% with an average hospital acknowledgement time of ${analytics.meanResponseTimeSec} seconds.`;
    } else {
      referenced = [currentHospital.name, 'Regional Health Command'];
      answer = `Network telemetry for query "${queryText}": All 6 regional hospitals are operational. ${alerts.filter((a) => a.status !== 'resolved').length} active emergencies in progress. Trauma bay availability: ${hospitals.reduce((acc, h) => acc + h.availableTraumaBays, 0)} total bays free across the district.`;
    }

    return {
      query: queryText,
      answer,
      referenced_facilities: referenced,
      timestamp: new Date().toLocaleTimeString(),
    };
  };

  // ── REACTIVE 3-STAGE MULTI-AGENT DISPATCH PROGRESSION ─────────────────────
  const calculateNews2Score = (vitals: any) => {
    let score = 0;
    if (vitals.respiratoryRate <= 8 || vitals.respiratoryRate >= 25) score += 3;
    else if (vitals.respiratoryRate >= 21) score += 2;
    else if (vitals.respiratoryRate <= 11) score += 1;

    if (vitals.spo2 <= 91) score += 3;
    else if (vitals.spo2 <= 93) score += 2;
    else if (vitals.spo2 <= 95) score += 1;

    if (vitals.systolicBp <= 90 || vitals.systolicBp >= 220) score += 3;
    else if (vitals.systolicBp <= 100) score += 2;
    else if (vitals.systolicBp <= 110) score += 1;

    if (vitals.heartRate <= 40 || vitals.heartRate >= 131) score += 3;
    else if (vitals.heartRate >= 111) score += 2;
    else if (vitals.heartRate <= 50 || vitals.heartRate >= 91) score += 1;

    if (vitals.temperatureC <= 35.0) score += 3;
    else if (vitals.temperatureC >= 39.1) score += 2;
    else if (vitals.temperatureC <= 36.0 || vitals.temperatureC >= 38.1) score += 1;

    if (vitals.consciousness !== 'alert') score += 3;

    const riskBand: 'low' | 'medium' | 'high' = score >= 7 ? 'high' : score >= 5 ? 'medium' : 'low';
    return { score, riskBand };
  };

  const triggerMultiAgentDispatch = async (caseInput: {
    patientAge: number;
    chiefComplaint: string;
    vitals: {
      heartRate: number;
      respiratoryRate: number;
      systolicBp: number;
      spo2: number;
      temperatureC: number;
      consciousness: string;
    };
    location: {
      address: string;
      lat: number;
      lng: number;
    };
  }): Promise<MultiAgentDispatchExecution> => {
    setIsDispatching(true);
    const caseId = `CASE-${Date.now().toString().slice(-4)}`;
    const news2 = calculateNews2Score(caseInput.vitals);

    const initialStages: DispatchProgressionStage[] = [
      {
        stage: 'triage',
        agent_name: 'Clinical Triage Agent',
        model_used: 'gemini-3.1-pro',
        status: 'processing',
        headline: 'Computing deterministic NEWS2 score and clinical acuity...',
        details: { vitals: caseInput.vitals },
      },
      {
        stage: 'bed_matching',
        agent_name: 'Bed-Matching Agent',
        model_used: 'gemini-3.5-flash',
        status: 'pending',
        headline: 'Evaluating regional hospital capacity and specialty bays...',
        details: {},
      },
      {
        stage: 'routing_briefing',
        agent_name: 'Routing & SBAR Briefing Agent',
        model_used: 'gemini-3.5-flash',
        status: 'pending',
        headline: 'Computing optimal transit route and generating SBAR brief...',
        details: {},
      },
    ];
    setDispatchStages(initialStages);

    // Stage 1: Triage reasoning (gemini-3.1-pro)
    await new Promise((res) => setTimeout(res, 700));
    const specialty =
      caseInput.chiefComplaint.toLowerCase().includes('chest') || caseInput.chiefComplaint.toLowerCase().includes('cardiac')
        ? 'cardiac'
        : caseInput.chiefComplaint.toLowerCase().includes('trauma') || caseInput.chiefComplaint.toLowerCase().includes('crash')
        ? 'trauma'
        : 'resuscitation';

    const triageResult = {
      severity_label: news2.riskBand === 'high' ? ('critical' as const) : news2.riskBand === 'medium' ? ('moderate' as const) : ('mild' as const),
      required_specialty: specialty,
      notes: `High NEWS2 score of ${news2.score}/20 (${news2.riskBand.toUpperCase()} RISK). Presentation of "${caseInput.chiefComplaint}" indicates immediate ${specialty.toUpperCase()} care requirement.`,
      model: 'gemini-3.1-pro',
    };

    setDispatchStages((prev) => [
      {
        ...prev[0],
        status: 'completed',
        headline: `Triage Confirmed: ${triageResult.severity_label.toUpperCase()} (${specialty.toUpperCase()}, NEWS2: ${news2.score})`,
        details: triageResult,
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        ...prev[1],
        status: 'processing',
        headline: `Matching Level 1 facilities with available ${specialty.toUpperCase()} bays...`,
      },
      prev[2],
    ]);

    // Stage 2: Bed Matching (gemini-3.5-flash)
    await new Promise((res) => setTimeout(res, 700));
    const targetHosp =
      hospitals.find((h) => !h.isDiverting && (specialty === 'cardiac' ? h.tier === 'Level 1 Trauma' || h.tier === 'Cardiac Center' : true)) ||
      hospitals[0];
    const distance = parseFloat((Math.random() * 2.2 + 1.2).toFixed(1));
    const eta = Math.round(distance * 2.8 + 2);

    const bedMatchingResult = {
      chosen_hospital: {
        id: targetHosp.id,
        name: targetHosp.name,
        lat: targetHosp.lat,
        lng: targetHosp.lng,
        distance_km: distance,
        eta_minutes: eta,
      },
      reasoning: `Selected ${targetHosp.name}: Closest specialized facility (${distance} km, ${eta}m ETA) with ${targetHosp.availableIcuBeds} available ICU beds and open trauma resuscitation bays.`,
      alternatives: hospitals
        .filter((h) => h.id !== targetHosp.id)
        .slice(0, 2)
        .map((h) => ({
          name: h.name,
          reason_not_chosen: h.isDiverting ? 'Facility currently on diversion' : `${(distance + 2.1).toFixed(1)} km further away`,
        })),
      model: 'gemini-3.5-flash',
    };

    setDispatchStages((prev) => [
      prev[0],
      {
        ...prev[1],
        status: 'completed',
        headline: `Matched Facility: ${targetHosp.name} (${distance} km, ${eta} mins ETA)`,
        details: bedMatchingResult,
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        ...prev[2],
        status: 'processing',
        headline: 'Transmitting pre-arrival SBAR protocol to hospital trauma bay...',
      },
    ]);

    // Stage 3: Routing & SBAR Briefing (gemini-3.5-flash)
    await new Promise((res) => setTimeout(res, 700));
    const sbarText = `INCOMING PRIORITY 1 ${specialty.toUpperCase()} EMERGENCY: ${caseInput.patientAge}yo patient at ${caseInput.location.address}. Vitals: HR ${caseInput.vitals.heartRate}, BP ${caseInput.vitals.systolicBp}/60, SpO2 ${caseInput.vitals.spo2}%, Temp ${caseInput.vitals.temperatureC}°C. NEWS2 score ${news2.score} (${news2.riskBand.toUpperCase()} RISK). ETA ${eta} minutes to ${targetHosp.name}. Advance Resuscitation Bay preparation requested.`;

    const routingResult = {
      eta_minutes: eta,
      distance_km: distance,
      route_summary: `Fastest corridor via ${caseInput.location.address.split(',')[0]} Expressway. Light emergency corridor traffic.`,
      model: 'gemini-3.5-flash',
    };

    const briefingResult = {
      pre_arrival_brief: sbarText,
      model: 'gemini-3.5-flash',
    };

    const execution: MultiAgentDispatchExecution = {
      case_id: caseId,
      timestamp: new Date().toISOString(),
      patient_input: {
        patient_age: caseInput.patientAge,
        vitals: {
          heart_rate: caseInput.vitals.heartRate,
          respiratory_rate: caseInput.vitals.respiratoryRate,
          systolic_bp: caseInput.vitals.systolicBp,
          spo2: caseInput.vitals.spo2,
          temperature_c: caseInput.vitals.temperatureC,
          consciousness: caseInput.vitals.consciousness,
        },
        chief_complaint: caseInput.chiefComplaint,
      },
      location_input: caseInput.location,
      news2_score: {
        score: news2.score,
        risk_band: news2.riskBand,
      },
      triage_result: triageResult,
      bed_matching_result: bedMatchingResult,
      routing_result: routingResult,
      briefing_result: briefingResult,
      audit_record_id: `audit_${Date.now()}`,
    };

    setDispatchStages((prev) => [
      prev[0],
      prev[1],
      {
        ...prev[2],
        status: 'completed',
        headline: `SBAR Broadcast Transmitted to ${targetHosp.name}`,
        details: { routing: routingResult, briefing: briefingResult },
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);

    setActiveDispatchExecution(execution);
    setIsDispatching(false);

    // Auto-inject into hospital queue
    const newAlert: EmergencyIncidentAlert = {
      id: `inc-${caseId.slice(-4)}`,
      trackingNumber: `LL-2026-${caseId.slice(-4)}`,
      timestamp: 'Just now',
      createdAt: Date.now(),
      crisisType: specialty as CrisisType,
      severity: triageResult.severity_label,
      chiefComplaint: caseInput.chiefComplaint,
      patient: {
        fullName: `Citizen Emergency (${caseInput.patientAge}yo)`,
        age: caseInput.patientAge,
        gender: 'Emergency Intake',
        bloodType: 'O+',
        allergies: ['NKDA'],
        conditions: ['Acute crisis trigger'],
        medications: [],
        organDonor: true,
        emergencyNotes: 'Multi-Agent Autonomous Dispatch Pipeline trigger.',
        primaryPhysician: { name: 'On-Call Care', phone: '108', hospital: targetHosp.name },
        emergencyContacts: [{ name: 'Ambulance Radio', relationship: 'Field', phone: '108', notified: true }],
      },
      vitals: {
        heartRate: caseInput.vitals.heartRate,
        respiratoryRate: caseInput.vitals.respiratoryRate,
        systolicBp: caseInput.vitals.systolicBp,
        spo2: caseInput.vitals.spo2,
        temperatureC: caseInput.vitals.temperatureC,
        consciousness: caseInput.vitals.consciousness as any,
      },
      news2Score: news2.score,
      news2RiskBand: news2.riskBand,
      sbarBrief: sbarText,
      location: {
        lat: caseInput.location.lat,
        lng: caseInput.location.lng,
        address: caseInput.location.address,
        landmark: 'Field Dispatch Point',
      },
      assignedHospitalId: targetHosp.id,
      status: 'pending_ack',
      distanceKm: distance,
      drivingEtaMinutes: eta,
      tier1TimeoutSec: 60,
      tier1SecondsRemaining: 60,
      isTier1Escalated: false,
      isTier2Escalated: false,
      assignedAt: new Date().toLocaleTimeString(),
    };

    setAlerts((prev) => [newAlert, ...prev]);

    const logEntry: AuditEventLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      alertId: newAlert.id,
      alertTrackingNumber: newAlert.trackingNumber,
      hospitalName: targetHosp.name,
      eventType: 'AUTO_ROUTED',
      severity: triageResult.severity_label,
      actor: 'Multi-Agent Orchestrator (gemini-3.1-pro + gemini-3.5-flash)',
      description: `AUTONOMOUS DISPATCH ${caseId}: NEWS2=${news2.score}, Facility=${targetHosp.name}, ETA=${eta}m. SBAR transmitted.`,
    };
    setAuditLogs((logs) => [logEntry, ...logs]);

    return execution;
  };

  const resetDispatchProgression = () => {
    setDispatchStages([]);
    setActiveDispatchExecution(null);
    setIsDispatching(false);
  };

  // ── SOUND SYNTHESIZER ─────────────────────────────────────────────────────
  const playEmergencyChime = useCallback(
    (type: 'new_alert' | 'escalation' | 'donor_alert' | 'success') => {
      if (typeof window === 'undefined' || !soundEnabled) return;
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'donor_alert') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
          osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12); // A5
          osc.frequency.setValueAtTime(1046.5, audioCtx.currentTime + 0.24); // C6
          gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.45);
        } else if (type === 'escalation') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(880, audioCtx.currentTime);
          osc.frequency.setValueAtTime(440, audioCtx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.4);
        } else if (type === 'new_alert') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
          osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.3);
        }
      } catch (e) {
        // Audio API may be restricted before user gesture
      }
    },
    [soundEnabled]
  );

  // ── AUTO-ESCALATION ENGINE (TIER 1 & TIER 2) ───────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setAlerts((prevAlerts) => {
        let hasChanges = false;
        const updated: EmergencyIncidentAlert[] = prevAlerts.map(
          (alert): EmergencyIncidentAlert => {
            if (alert.status === 'pending_ack' && alert.tier1SecondsRemaining > 0) {
              hasChanges = true;
              const remaining = alert.tier1SecondsRemaining - 1;

              if (remaining === 0) {
                playEmergencyChime('escalation');

                if (alert.previousHospitalIds && alert.previousHospitalIds.length > 0) {
                  const logEntry: AuditEventLog = {
                    id: `log-${Date.now()}`,
                    timestamp: new Date().toLocaleTimeString(),
                    alertId: alert.id,
                    alertTrackingNumber: alert.trackingNumber,
                    hospitalName: 'Jurisdiction Multi-Facility Failure',
                    eventType: 'TIER_2_GOV_ESCALATED',
                    severity: 'critical',
                    actor: 'LifeLine Auto-Escalation Protocol',
                    description: `CRITICAL SLA VIOLATION: Alert ${alert.trackingNumber} failed 2 consecutive hospital acknowledgements. Escalated to Regional Authority Command Deck.`,
                  };
                  setAuditLogs((logs) => [logEntry, ...logs]);

                  return {
                    ...alert,
                    tier1SecondsRemaining: 0,
                    status: 'escalated_gov' as AlertStatus,
                    isTier2Escalated: true,
                    escalatedToGovAt: new Date().toLocaleTimeString(),
                    escalationReason: 'Two assigned facilities failed to acknowledge within SLA time limit.',
                  };
                }

                const candidate =
                  hospitals.find(
                    (h) => h.id !== alert.assignedHospitalId && !h.isDiverting && h.status === 'active'
                  ) || hospitals[1];

                const logEntry: AuditEventLog = {
                  id: `log-${Date.now()}`,
                  timestamp: new Date().toLocaleTimeString(),
                  alertId: alert.id,
                  alertTrackingNumber: alert.trackingNumber,
                  hospitalName: candidate.name,
                  eventType: 'TIER_1_AUTO_REASSIGNED',
                  severity: 'critical',
                  actor: 'LifeLine Auto-Routing Engine (Tier 1)',
                  description: `SLA TIMEOUT (60s): Automatically re-routed from initial facility to ${candidate.name} (Next Nearest Available).`,
                };
                setAuditLogs((logs) => [logEntry, ...logs]);

                return {
                  ...alert,
                  assignedHospitalId: candidate.id,
                  previousHospitalIds: [...(alert.previousHospitalIds || []), alert.assignedHospitalId],
                  distanceKm: parseFloat((alert.distanceKm + 1.8).toFixed(1)),
                  drivingEtaMinutes: Math.round(alert.drivingEtaMinutes + 4),
                  tier1SecondsRemaining: 45,
                  isTier1Escalated: true,
                };
              }

              return { ...alert, tier1SecondsRemaining: remaining };
            }
            return alert;
          }
        );

        return hasChanges ? updated : prevAlerts;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hospitals, playEmergencyChime]);

  // ── ACTIONS: HOSPITAL & PATIENT ───────────────────────────────────────────

  const acknowledgeAlert = (alertId: string, actorName = 'On-Call ER Physician') => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === alertId) {
          const updated: EmergencyIncidentAlert = {
            ...a,
            status: 'acknowledged',
            acknowledgedAt: new Date().toLocaleTimeString(),
            tier1SecondsRemaining: 0,
          };
          if (selectedAlert?.id === alertId) setSelectedAlert(updated);
          return updated;
        }
        return a;
      })
    );

    const alert = alerts.find((a) => a.id === alertId);
    if (alert) {
      const logEntry: AuditEventLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        alertId: alert.id,
        alertTrackingNumber: alert.trackingNumber,
        hospitalName: currentHospital.name,
        eventType: 'ACKNOWLEDGED',
        severity: alert.severity,
        actor: actorName,
        description: `Alert acknowledged by ${actorName}. Resuscitation Bay preparation initiated.`,
      };
      setAuditLogs((logs) => [logEntry, ...logs]);
    }
  };

  // ── AUTOMATED BED COUNTING: Prepare Bay & Reserve Capacity ────────────────
  const prepareBay = (alertId: string, bayName: string, actorName = 'ER Charge Nurse') => {
    const alert = alerts.find((a) => a.id === alertId);
    const targetHospId = alert?.assignedHospitalId || currentHospital.id;
    const targetHosp = hospitals.find((h) => h.id === targetHospId) || currentHospital;

    const isCritical = (alert?.news2Score || 0) >= 7 || alert?.severity === 'critical';
    const alreadyReservedBay = alert?.hasReservedBay;
    const alreadyReservedIcu = alert?.hasReservedIcu;

    // Single source of truth: decrement ONLY if not already reserved
    if (!alreadyReservedBay || (isCritical && !alreadyReservedIcu)) {
      setHospitals((prev) =>
        prev.map((h) => {
          if (h.id === targetHospId) {
            const newTrauma = !alreadyReservedBay
              ? Math.max(0, Math.min(h.totalTraumaBays, h.availableTraumaBays - 1))
              : h.availableTraumaBays;
            const newIcu = isCritical && !alreadyReservedIcu
              ? Math.max(0, Math.min(h.totalIcuBeds, h.availableIcuBeds - 1))
              : h.availableIcuBeds;

            return {
              ...h,
              availableTraumaBays: newTrauma,
              availableIcuBeds: newIcu,
            };
          }
          return h;
        })
      );
    }

    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === alertId) {
          const updated: EmergencyIncidentAlert = {
            ...a,
            status: 'bay_ready',
            bayReadyAt: new Date().toLocaleTimeString(),
            hasReservedBay: true,
            hasReservedIcu: isCritical ? true : a.hasReservedIcu,
          };
          if (selectedAlert?.id === alertId) setSelectedAlert(updated);
          return updated;
        }
        return a;
      })
    );

    if (alert) {
      const logEntry: AuditEventLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        alertId: alert.id,
        alertTrackingNumber: alert.trackingNumber,
        hospitalName: targetHosp.name,
        eventType: 'AUTO_BED_RESERVED',
        severity: alert.severity,
        actor: 'LifeLine Autonomous Bed Allocation Engine',
        description: `AUTONOMOUS BED TELEMETRY: 1 Trauma Bay ${
          isCritical ? '+ 1 ICU Bed ' : ''
        }automatically reserved at ${targetHosp.name} for incoming emergency ${alert.trackingNumber}.`,
      };
      setAuditLogs((logs) => [logEntry, ...logs]);
    }
  };

  const admitPatient = (alertId: string, actorName = 'ER Triage Lead') => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === alertId) {
          const updated: EmergencyIncidentAlert = {
            ...a,
            status: 'admitted',
            admittedAt: new Date().toLocaleTimeString(),
          };
          if (selectedAlert?.id === alertId) setSelectedAlert(updated);
          return updated;
        }
        return a;
      })
    );
  };

  // ── AUTOMATED BED COUNTING: Free Bay & Restore Capacity on Discharge ──────
  const resolveAlert = (alertId: string, actorName = 'ER Attending Physician') => {
    const alert = alerts.find((a) => a.id === alertId);
    const targetHospId = alert?.assignedHospitalId || currentHospital.id;
    const targetHosp = hospitals.find((h) => h.id === targetHospId) || currentHospital;

    const hadBay = alert?.hasReservedBay;
    const hadIcu = alert?.hasReservedIcu;

    // Single source of truth: restore capacity cleanly if it held a bed
    if (hadBay || hadIcu) {
      setHospitals((prev) =>
        prev.map((h) => {
          if (h.id === targetHospId) {
            const newTrauma = hadBay
              ? Math.max(0, Math.min(h.totalTraumaBays, h.availableTraumaBays + 1))
              : h.availableTraumaBays;
            const newIcu = hadIcu
              ? Math.max(0, Math.min(h.totalIcuBeds, h.availableIcuBeds + 1))
              : h.availableIcuBeds;

            return {
              ...h,
              availableTraumaBays: newTrauma,
              availableIcuBeds: newIcu,
            };
          }
          return h;
        })
      );
    }

    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === alertId) {
          const updated: EmergencyIncidentAlert = {
            ...a,
            status: 'resolved',
            resolvedAt: new Date().toLocaleTimeString(),
            hasReservedBay: false,
            hasReservedIcu: false,
          };
          if (selectedAlert?.id === alertId) setSelectedAlert(updated);
          return updated;
        }
        return a;
      })
    );

    if (alert) {
      const logEntry: AuditEventLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        alertId: alert.id,
        alertTrackingNumber: alert.trackingNumber,
        hospitalName: targetHosp.name,
        eventType: 'AUTO_BED_FREED',
        severity: alert.severity,
        actor: 'LifeLine Autonomous Bed Allocation Engine',
        description: `AUTONOMOUS BED TELEMETRY: Case resolved. 1 Trauma Bay ${
          hadIcu ? '+ 1 ICU Bed ' : ''
        }automatically restored to available pool at ${targetHosp.name}.`,
      };
      setAuditLogs((logs) => [logEntry, ...logs]);
    }
  };

  // ── AUTOMATED BED COUNTING: Transfer Bay Reservation ──────────────────────
  const reassignAlert = (
    alertId: string,
    targetHospitalId: string,
    reason: string,
    actorName = 'Hospital Operations Admin'
  ) => {
    const target = hospitals.find((h) => h.id === targetHospitalId);
    const alert = alerts.find((a) => a.id === alertId);
    if (!target || !alert) return;

    const hadBay = alert.hasReservedBay;
    const hadIcu = alert.hasReservedIcu;

    if (hadBay || hadIcu) {
      setHospitals((prev) =>
        prev.map((h) => {
          if (h.id === alert.assignedHospitalId) {
            return {
              ...h,
              availableTraumaBays: hadBay
                ? Math.min(h.totalTraumaBays, h.availableTraumaBays + 1)
                : h.availableTraumaBays,
              availableIcuBeds: hadIcu
                ? Math.min(h.totalIcuBeds, h.availableIcuBeds + 1)
                : h.availableIcuBeds,
            };
          }
          if (h.id === targetHospitalId) {
            return {
              ...h,
              availableTraumaBays: hadBay
                ? Math.max(0, h.availableTraumaBays - 1)
                : h.availableTraumaBays,
              availableIcuBeds: hadIcu
                ? Math.max(0, h.availableIcuBeds - 1)
                : h.availableIcuBeds,
            };
          }
          return h;
        })
      );
    }

    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === alertId) {
          const updated: EmergencyIncidentAlert = {
            ...a,
            assignedHospitalId: targetHospitalId,
            previousHospitalIds: [...(a.previousHospitalIds || []), a.assignedHospitalId],
            status: 'pending_ack',
            tier1SecondsRemaining: 60,
            overriddenBy: actorName,
            overrideReason: reason,
          };
          if (selectedAlert?.id === alertId) setSelectedAlert(updated);
          return updated;
        }
        return a;
      })
    );

    const logEntry: AuditEventLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      alertId: alert.id,
      alertTrackingNumber: alert.trackingNumber,
      hospitalName: target.name,
      eventType: 'MANUAL_OVERRIDE',
      severity: alert.severity,
      actor: actorName,
      description: `Manual Transfer: Reassigned from ${currentHospital.name} to ${target.name}. Reason: ${reason}. Bed telemetry synchronized.`,
    };
    setAuditLogs((logs) => [logEntry, ...logs]);
  };

  const authorityIntervene = (
    alertId: string,
    targetHospitalId: string,
    notes: string,
    actorName = 'Senior Regional Authority Director'
  ) => {
    const target = hospitals.find((h) => h.id === targetHospitalId) || hospitals[0];

    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === alertId) {
          const updated: EmergencyIncidentAlert = {
            ...a,
            assignedHospitalId: target.id,
            status: 'acknowledged',
            tier1SecondsRemaining: 0,
            isTier2Escalated: false,
            overriddenBy: `GOVERNMENT AUTHORITY DIRECTIVE (${actorName})`,
            overrideReason: notes,
          };
          if (selectedAlert?.id === alertId) setSelectedAlert(updated);
          return updated;
        }
        return a;
      })
    );

    const logEntry: AuditEventLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      alertId: alertId,
      alertTrackingNumber: `LL-2026-${alertId.slice(-4)}`,
      hospitalName: target.name,
      eventType: 'AUTHORITY_INTERVENTION',
      severity: 'critical',
      actor: actorName,
      description: `MANDATORY GOVERNMENT DIRECTIVE: Assigned directly to ${target.name}. Directive: ${notes}`,
    };
    setAuditLogs((logs) => [logEntry, ...logs]);
  };

  const toggleDiversion = (hospitalId: string) => {
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === hospitalId) {
          const newDiv = !h.isDiverting;
          return {
            ...h,
            isDiverting: newDiv,
            status: newDiv ? 'critical_load' : 'active',
          };
        }
        return h;
      })
    );
  };

  // ── MANUAL BED ADJUSTMENT WITH STRICT CLAMPING ────────────────────────────
  const updateHospitalCapacity = (
    hospitalId: string,
    icuAvailable: number,
    traumaAvailable: number
  ) => {
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === hospitalId) {
          return {
            ...h,
            availableIcuBeds: Math.max(0, Math.min(h.totalIcuBeds, icuAvailable)),
            availableTraumaBays: Math.max(0, Math.min(h.totalTraumaBays, traumaAvailable)),
          };
        }
        return h;
      })
    );
  };

  const triggerSimulatedAlert = (
    crisisType: CrisisType,
    locationName = 'Bandra West, Hill Road, Mumbai',
    lat = 19.0543,
    lng = 72.8282
  ) => {
    playEmergencyChime('new_alert');

    const matchedHospital =
      hospitals.find((h) => !h.isDiverting && h.status !== 'offline') || hospitals[0];

    const newId = `inc-${Date.now().toString().slice(-4)}`;
    const newTracking = `LL-2026-${newId.slice(-4)}`;

    const newAlert: EmergencyIncidentAlert = {
      id: newId,
      trackingNumber: newTracking,
      timestamp: 'Just now',
      createdAt: Date.now(),
      crisisType,
      severity: 'critical',
      chiefComplaint:
        crisisType === 'cardiac'
          ? 'Acute Severe Chest Pain & Syncope'
          : crisisType === 'trauma'
          ? 'Pedestrian High-Impact Trauma'
          : 'Acute Severe Respiratory Distress',
      mechanismOfInjury: 'Citizen SOS Trigger via LifeLine App',
      patient: {
        fullName: 'Sameer Kulkarni',
        age: 49,
        gender: 'Male',
        bloodType: 'A+',
        allergies: ['Penicillin (Moderate)', 'Codeine'],
        conditions: ['Hypertension', 'Hyperlipidemia'],
        medications: [{ name: 'Telmisartan', dosage: '40mg', frequency: 'Daily' }],
        organDonor: true,
        emergencyNotes: 'Active citizen SOS broadcast with live geolocation sharing.',
        primaryPhysician: {
          name: 'Dr. K. S. Verma',
          phone: '+91 98200 44332',
          hospital: matchedHospital.name,
        },
        emergencyContacts: [
          { name: 'Anjali Kulkarni', relationship: 'Spouse', phone: '+91 98200 99881', notified: true },
        ],
      },
      vitals: {
        heartRate: 128,
        respiratoryRate: 26,
        systolicBp: 84,
        spo2: 90,
        temperatureC: 38.0,
        consciousness: 'alert',
      },
      news2Score: 11,
      news2RiskBand: 'high',
      sbarBrief: `INCOMING CITIZEN SOS (${crisisType.toUpperCase()}): 49yo Male at ${locationName}. Auto-assigned to ${matchedHospital.name}. 60s Tier 1 SLA active.`,
      location: {
        lat,
        lng,
        address: locationName,
        landmark: 'Near Station Plaza',
      },
      assignedHospitalId: matchedHospital.id,
      status: 'pending_ack',
      distanceKm: 2.6,
      drivingEtaMinutes: 7.5,
      tier1TimeoutSec: 60,
      tier1SecondsRemaining: 60,
      isTier1Escalated: false,
      isTier2Escalated: false,
      assignedAt: new Date().toLocaleTimeString(),
      hasReservedBay: false,
      hasReservedIcu: false,
    };

    setAlerts((prev) => [newAlert, ...prev]);

    const logEntry: AuditEventLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      alertId: newAlert.id,
      alertTrackingNumber: newAlert.trackingNumber,
      hospitalName: matchedHospital.name,
      eventType: 'AUTO_ROUTED',
      severity: 'critical',
      actor: 'LifeLine Real-Time Dispatch Engine',
      description: `New citizen crisis (${crisisType}) auto-routed to ${matchedHospital.name}. Tier 1 countdown (60s) initialized.`,
    };
    setAuditLogs((logs) => [logEntry, ...logs]);

    // ── AUTOMATED BLOOD BANK: Auto-Trigger STAT Donor Callout if Needed ────
    const targetBlood = 'A+' as BloodGroup;
    const stockUnits = matchedHospital.bloodBankInventory[targetBlood] || 0;
    const universalStock = matchedHospital.bloodBankInventory['O-'] || 0;

    if (crisisType === 'trauma' || crisisType === 'cardiac' || stockUnits <= 3 || universalStock <= 2) {
      setTimeout(() => {
        createDonorRequest({
          hospitalId: matchedHospital.id,
          patientTrackingNumber: newTracking,
          patientName: 'Sameer Kulkarni (49yo Male)',
          type: 'blood',
          bloodGroupNeeded: stockUnits <= 2 ? targetBlood : 'O-',
          unitsRequested: crisisType === 'trauma' ? 3 : 2,
          urgency: 'STAT_CRITICAL',
          clinicalIndication: `AUTONOMOUS AI TRIGGER: Acute ${crisisType} trauma with high risk score (NEWS2: 11). Hospital blood reserve below safe threshold (${stockUnits} units). Autonomous STAT callout dispatched.`,
        });
      }, 400);
    }
  };

  // ── ACTIONS: DONOR NETWORK AUTO-MATCHING & RESPONSE ───────────────────────

  // 1. Hospital Raises Blood / Organ Request -> System AUTO-MATCHES Donors
  const createDonorRequest = useCallback(
    (params: {
      hospitalId: string;
      patientTrackingNumber?: string;
      patientName: string;
      type: DonorRequestType;
      bloodGroupNeeded?: BloodGroup;
      organNeeded?: OrganType;
      unitsRequested: number;
      urgency: RequestUrgency;
      clinicalIndication: string;
    }) => {
      playEmergencyChime('donor_alert');

      const hosp = hospitals.find((h) => h.id === params.hospitalId) || currentHospital;
      const reqId = `req-${Date.now().toString().slice(-4)}`;
      const trackingNo = `DON-2026-${reqId.slice(-4)}`;

      // Auto-match compatible donors
      const matchedList: MatchedDonorEntry[] = [];

      donors.forEach((donor) => {
        let isMatch = false;

        if (params.type === 'blood' && params.bloodGroupNeeded) {
          isMatch =
            isBloodCompatible(donor.bloodGroup, params.bloodGroupNeeded) &&
            donor.eligibilityStatus === 'eligible';
        } else if (params.type === 'organ') {
          isMatch = donor.isOrganDonor;
        }

        if (isMatch) {
          const dist = parseFloat((Math.random() * 3.5 + 1.0).toFixed(1));
          const eta = Math.round(dist * 3.5 + 2);

          matchedList.push({
            donorId: donor.id,
            donorName: donor.fullName,
            bloodGroup: donor.bloodGroup,
            distanceKm: dist,
            etaMinutes: eta,
            travelMode: 'driving',
            responseStatus: 'notified',
            contactPhone: donor.phone,
            currentEtaMinutes: eta,
          });
        }
      });

      const location: DonationLocation = {
        hospitalId: hosp.id,
        hospitalName: hosp.name,
        department:
          hosp.tier === 'Level 1 Trauma'
            ? 'Blood Transfusion Center & Trauma Bay B — Ground Floor Wing 2'
            : 'Main Emergency Blood Bank — Room 104',
        address: hosp.address,
        lat: hosp.lat,
        lng: hosp.lng,
        phone: hosp.phone,
        emergencyPhone: hosp.emergencyPhone,
        landmark: `Near ${hosp.district} Emergency Gate`,
      };

      const newRequest: DonorRequest = {
        id: reqId,
        requestTrackingNumber: trackingNo,
        hospitalId: hosp.id,
        hospitalName: hosp.name,
        patientTrackingNumber: params.patientTrackingNumber,
        patientName: params.patientName,
        type: params.type,
        bloodGroupNeeded: params.bloodGroupNeeded,
        organNeeded: params.organNeeded,
        unitsRequested: params.unitsRequested,
        unitsFulfilled: 0,
        urgency: params.urgency,
        clinicalIndication: params.clinicalIndication,
        createdAt: Date.now(),
        status: matchedList.length > 0 ? 'matched' : 'open',
        matchedDonors: matchedList,
        donationLocation: location,
      };

      setDonorRequests((prev) => [newRequest, ...prev]);

      // Update donors active match link
      if (matchedList.length > 0) {
        setDonors((prev) =>
          prev.map((d) => {
            if (matchedList.some((m) => m.donorId === d.id)) {
              return { ...d, activeMatchRequestId: reqId };
            }
            return d;
          })
        );
      }

      const logEntry: AuditEventLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        alertId: params.patientTrackingNumber || reqId,
        alertTrackingNumber: trackingNo,
        hospitalName: hosp.name,
        eventType: 'DONOR_REQUEST_RAISED',
        severity: params.urgency === 'STAT_CRITICAL' ? 'critical' : 'moderate',
        actor: `${hosp.name} Blood Bank Watchdog`,
        description: `${params.urgency} Request raised for ${params.unitsRequested} unit(s) of ${
          params.type === 'blood' ? params.bloodGroupNeeded : params.organNeeded
        }. Auto-matched ${matchedList.length} nearby compatible donors.`,
      };
      setAuditLogs((logs) => [logEntry, ...logs]);
    },
    [currentHospital, donors, hospitals, playEmergencyChime]
  );

  // ── AUTONOMOUS BLOOD WATCHDOG: Check Deficits and Trigger Broadcasts ──────
  const checkAndAutoTriggerBloodDeficit = useCallback(
    (hospitalId: string, bloodGroup: BloodGroup, currentUnits: number) => {
      if (currentUnits <= 2) {
        // Check if there is already an open/matched request for this hospital and blood group
        const existing = donorRequests.find(
          (r) =>
            r.hospitalId === hospitalId &&
            r.bloodGroupNeeded === bloodGroup &&
            (r.status === 'open' || r.status === 'matched')
        );

        if (!existing) {
          const hosp = hospitals.find((h) => h.id === hospitalId) || currentHospital;
          createDonorRequest({
            hospitalId: hosp.id,
            patientName: 'Regional Emergency Reserve Deficit',
            type: 'blood',
            bloodGroupNeeded: bloodGroup,
            unitsRequested: 2,
            urgency: 'STAT_CRITICAL',
            clinicalIndication: `CRITICAL INVENTORY DEFICIT: ${hosp.name} reserve for ${bloodGroup} is critically low (${currentUnits} Unit(s) on-site). Autonomous STAT broadcast dispatched to compatible donors.`,
          });
        }
      }
    },
    [createDonorRequest, currentHospital, donorRequests, hospitals]
  );

  // Initial watchdog scan on mount for all hospitals
  useEffect(() => {
    if (!watchdogRanRef.current) {
      watchdogRanRef.current = true;
      hospitals.forEach((h) => {
        (Object.keys(h.bloodBankInventory) as BloodGroup[]).forEach((bg) => {
          const count = h.bloodBankInventory[bg] || 0;
          if (count <= 2) {
            checkAndAutoTriggerBloodDeficit(h.id, bg, count);
          }
        });
      });
    }
  }, [checkAndAutoTriggerBloodDeficit, hospitals]);

  // 2. Donor Responds (Accept, En Route, Arrived, Completed, Decline)
  const respondToDonorRequest = (
    requestId: string,
    donorId: string,
    response: DonorResponseStatus
  ) => {
    let updatedReq: DonorRequest | undefined;
    let respondingDonor: DonorProfile | undefined = donors.find((d) => d.id === donorId);

    setDonorRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          const updatedDonors = req.matchedDonors.map((m) => {
            if (m.donorId === donorId) {
              return {
                ...m,
                responseStatus: response,
                respondedAt: new Date().toLocaleTimeString(),
              };
            }
            return m;
          });

          // Accurately tally all positive fulfillment responses
          const fulfilledCount = updatedDonors.filter(
            (m) =>
              m.responseStatus === 'accepted' ||
              m.responseStatus === 'en_route' ||
              m.responseStatus === 'arrived' ||
              m.responseStatus === 'completed'
          ).length;

          const isFullyFulfilled = fulfilledCount >= req.unitsRequested;

          const newReq: DonorRequest = {
            ...req,
            matchedDonors: updatedDonors,
            unitsFulfilled: fulfilledCount,
            status: isFullyFulfilled ? 'fulfilled' : 'matched',
          };
          updatedReq = newReq;
          return newReq;
        }
        return req;
      })
    );

    // Update donor status
    setDonors((prev) =>
      prev.map((d) => {
        if (d.id === donorId) {
          let newStatus: DonorProfile['status'] = 'available';
          let newDonations = d.totalDonations;

          if (response === 'accepted' || response === 'en_route') {
            newStatus = 'in_transit';
          } else if (response === 'arrived') {
            newStatus = 'in_transit';
          } else if (response === 'completed') {
            newStatus = 'available';
            newDonations += 1;
          }

          const updatedD: DonorProfile = { ...d, status: newStatus, totalDonations: newDonations };
          respondingDonor = updatedD;
          return updatedD;
        }
        return d;
      })
    );

    const req = updatedReq || donorRequests.find((r) => r.id === requestId);
    const donor = respondingDonor || donors.find((d) => d.id === donorId);

    if (donor && req) {
      let eventType: AuditEventLog['eventType'] = 'DONOR_ACCEPTED_TRANSIT';
      if (response === 'en_route') eventType = 'DONOR_EN_ROUTE';
      if (response === 'arrived') eventType = 'DONOR_ARRIVED';
      if (response === 'completed') eventType = 'AUTO_BLOOD_RESTOCKED';

      const logEntry: AuditEventLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        alertId: req.requestTrackingNumber,
        alertTrackingNumber: req.requestTrackingNumber,
        hospitalName: req.hospitalName,
        eventType,
        severity: response === 'completed' ? 'moderate' : 'critical',
        actor: `Donor: ${donor.fullName} (${donor.bloodGroup})`,
        description:
          response === 'completed'
            ? `AUTONOMOUS RESTOCK: +1 Unit of ${donor.bloodGroup} automatically credited to ${req.hospitalName} blood bank following verified donation by ${donor.fullName}.`
            : `Donor ${donor.fullName} updated status to: ${response.toUpperCase()} for ${
                req.hospitalName
              }. Real-time tracking active.`,
      };
      setAuditLogs((logs) => [logEntry, ...logs]);

      // ── AUTOMATED BLOOD RESTOCK: Increment blood bank inventory ───────────
      if (response === 'completed' && donor.bloodGroup) {
        updateHospitalBloodBank(req.hospitalId, donor.bloodGroup, 1);
      }
    }
  };

  // 3. Update Donor Travel Mode (Driving, Transit, Walking) & Recalculate ETA
  const updateDonorTravelMode = (requestId: string, donorId: string, mode: TravelMode) => {
    setDonorRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          const updatedDonors = req.matchedDonors.map((m) => {
            if (m.donorId === donorId) {
              let newEta = Math.round(m.distanceKm * 3.5 + 2);
              if (mode === 'transit') newEta = Math.round(m.distanceKm * 5.0 + 5);
              if (mode === 'walking') newEta = Math.round(m.distanceKm * 12.0 + 3);

              return {
                ...m,
                travelMode: mode,
                etaMinutes: newEta,
                currentEtaMinutes: newEta,
              };
            }
            return m;
          });

          return { ...req, matchedDonors: updatedDonors };
        }
        return req;
      })
    );
  };

  // 4. Register New Citizen Donor
  const registerNewDonor = (
    profile: Omit<DonorProfile, 'id' | 'totalDonations' | 'badgeTitle'>
  ) => {
    const newDonor: DonorProfile = {
      ...profile,
      id: `donor-${Date.now().toString().slice(-4)}`,
      totalDonations: 0,
      badgeTitle: 'Verified Community Guardian',
    };
    setDonors((prev) => [newDonor, ...prev]);
    setActiveDonorId(newDonor.id);
  };

  // 5. Update Hospital Blood Bank Inventory & Trigger Autonomous Watchdog
  const updateHospitalBloodBank = (
    hospitalId: string,
    bloodGroup: BloodGroup,
    deltaUnits: number
  ) => {
    let finalUnits = 0;
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === hospitalId) {
          const curr = h.bloodBankInventory[bloodGroup] || 0;
          const updatedUnits = Math.max(0, curr + deltaUnits);
          finalUnits = updatedUnits;
          return {
            ...h,
            bloodBankInventory: {
              ...h.bloodBankInventory,
              [bloodGroup]: updatedUnits,
            },
          };
        }
        return h;
      })
    );

    // If stock drops <= 2, trigger autonomous watchdog
    if (finalUnits <= 2 && deltaUnits < 0) {
      checkAndAutoTriggerBloodDeficit(hospitalId, bloodGroup, finalUnits);
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        currentUser,
        authToken,
        demoUsers: DEMO_USERS,
        login,
        logout,
        switchUserRole,
        isAuthModalOpen,
        setIsAuthModalOpen,
        portalView,
        setPortalView,
        activeHospitalId,
        setActiveHospitalId,
        hospitalRole,
        setHospitalRole,
        authorityRole,
        setAuthorityRole,
        activeDonorId,
        setActiveDonorId,
        soundEnabled,
        setSoundEnabled,
        hospitals,
        alerts,
        auditLogs,
        analytics,
        selectedAlert,
        setSelectedAlert,
        donors,
        donorRequests,
        currentDonor,
        currentHospital,
        issues,
        createIssue,
        resolveIssue,
        inventory,
        updateInventoryStock,
        restockItem,
        dailyReport,
        refreshDailyReport,
        queryNetworkState,
        isDispatching,
        dispatchStages,
        activeDispatchExecution,
        triggerMultiAgentDispatch,
        resetDispatchProgression,
        acknowledgeAlert,
        prepareBay,
        reserveBedOrBay,
        admitPatient,
        resolveAlert,
        reassignAlert,
        authorityIntervene,
        toggleDiversion,
        updateHospitalCapacity,
        triggerSimulatedAlert,
        createDonorRequest,
        respondToDonorRequest,
        updateDonorTravelMode,
        registerNewDonor,
        updateHospitalBloodBank,
        checkAndAutoTriggerBloodDeficit,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
