'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  PortalView,
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
} from '../types/dashboard';
import {
  INITIAL_HOSPITALS,
  INITIAL_INCIDENT_ALERTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_ANALYTICS,
  INITIAL_REGISTERED_DONORS,
  INITIAL_DONOR_REQUESTS,
} from '../data/mockDashboardData';

interface DashboardContextType {
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

  // Hospital & Emergency Actions
  acknowledgeAlert: (alertId: string, actorName?: string) => void;
  prepareBay: (alertId: string, bayName: string, actorName?: string) => void;
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

  // Donor state
  const [donors, setDonors] = useState<DonorProfile[]>(INITIAL_REGISTERED_DONORS);
  const [donorRequests, setDonorRequests] = useState<DonorRequest[]>(INITIAL_DONOR_REQUESTS);

  const currentHospital = hospitals.find((h) => h.id === activeHospitalId) || hospitals[0];
  const currentDonor = donors.find((d) => d.id === activeDonorId) || donors[0];

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

  const prepareBay = (alertId: string, bayName: string, actorName = 'ER Charge Nurse') => {
    const alert = alerts.find((a) => a.id === alertId);
    const targetHospId = alert?.assignedHospitalId || currentHospital.id;
    const targetHosp = hospitals.find((h) => h.id === targetHospId) || currentHospital;

    // ── AUTOMATED BED COUNTING: Reserve Trauma Bay & ICU Bed ───────────────
    const isCritical = (alert?.news2Score || 0) >= 7 || alert?.severity === 'critical';

    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === targetHospId) {
          return {
            ...h,
            availableTraumaBays: Math.max(0, h.availableTraumaBays - 1),
            availableIcuBeds: isCritical ? Math.max(0, h.availableIcuBeds - 1) : h.availableIcuBeds,
          };
        }
        return h;
      })
    );

    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === alertId) {
          const updated: EmergencyIncidentAlert = {
            ...a,
            status: 'bay_ready',
            bayReadyAt: new Date().toLocaleTimeString(),
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

  const resolveAlert = (alertId: string, actorName = 'ER Attending Physician') => {
    const alert = alerts.find((a) => a.id === alertId);
    const targetHospId = alert?.assignedHospitalId || currentHospital.id;
    const targetHosp = hospitals.find((h) => h.id === targetHospId) || currentHospital;

    // ── AUTOMATED BED COUNTING: Free Trauma Bay & ICU Bed on Discharge ──────
    const isCritical = (alert?.news2Score || 0) >= 7 || alert?.severity === 'critical';

    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === targetHospId) {
          return {
            ...h,
            availableTraumaBays: Math.min(h.totalTraumaBays, h.availableTraumaBays + 1),
            availableIcuBeds: isCritical
              ? Math.min(h.totalIcuBeds, h.availableIcuBeds + 1)
              : h.availableIcuBeds,
          };
        }
        return h;
      })
    );

    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === alertId) {
          const updated: EmergencyIncidentAlert = {
            ...a,
            status: 'resolved',
            resolvedAt: new Date().toLocaleTimeString(),
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
          isCritical ? '+ 1 ICU Bed ' : ''
        }automatically restored to available pool at ${targetHosp.name}.`,
      };
      setAuditLogs((logs) => [logEntry, ...logs]);
    }
  };

  const reassignAlert = (
    alertId: string,
    targetHospitalId: string,
    reason: string,
    actorName = 'Hospital Operations Admin'
  ) => {
    const target = hospitals.find((h) => h.id === targetHospitalId);
    const alert = alerts.find((a) => a.id === alertId);
    if (!target || !alert) return;

    // ── AUTOMATED BED COUNTING: Transfer Bay Reservation ───────────────────
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === alert.assignedHospitalId) {
          // Free bay at old facility
          return {
            ...h,
            availableTraumaBays: Math.min(h.totalTraumaBays, h.availableTraumaBays + 1),
          };
        }
        if (h.id === targetHospitalId) {
          // Reserve bay at new facility
          return {
            ...h,
            availableTraumaBays: Math.max(0, h.availableTraumaBays - 1),
          };
        }
        return h;
      })
    );

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
    };

    // ── AUTOMATED BED COUNTING: Reserve Trauma Bay at Destination Facility ─
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === matchedHospital.id) {
          return {
            ...h,
            availableTraumaBays: Math.max(0, h.availableTraumaBays - 1),
            availableIcuBeds: Math.max(0, h.availableIcuBeds - 1),
          };
        }
        return h;
      })
    );

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
      description: `New citizen crisis (${crisisType}) auto-routed to ${matchedHospital.name}. 1 Trauma Bay + 1 ICU Bed autonomously reserved.`,
    };
    setAuditLogs((logs) => [logEntry, ...logs]);

    // ── AUTOMATED BLOOD BANK & DONOR CALLOUT: Auto-Trigger STAT Broadcast ──
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
          clinicalIndication: `AUTONOMOUS AI TRIGGER: Patient in acute ${crisisType} shock with high NEWS2 risk score (11/20). Hospital reserve below threshold (${stockUnits} units). Autonomous STAT callout dispatched.`,
        });
      }, 400);
    }
  };

  // ── ACTIONS: DONOR NETWORK AUTO-MATCHING & RESPONSE ───────────────────────

  // 1. Hospital Raises Blood / Organ Request -> System AUTO-MATCHES Donors
  const createDonorRequest = (params: {
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
      actor: `${hosp.name} Blood Bank / Transplant Unit`,
      description: `${params.urgency} Request raised for ${params.unitsRequested} unit(s) of ${
        params.type === 'blood' ? params.bloodGroupNeeded : params.organNeeded
      }. Auto-matched ${matchedList.length} nearby donors.`,
    };
    setAuditLogs((logs) => [logEntry, ...logs]);
  };

  // 2. Donor Responds (Accept, En Route, Arrived, Completed, Decline)
  const respondToDonorRequest = (
    requestId: string,
    donorId: string,
    response: DonorResponseStatus
  ) => {
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

          const fulfilledCount = updatedDonors.filter(
            (m) =>
              m.responseStatus === 'accepted' ||
              m.responseStatus === 'en_route' ||
              m.responseStatus === 'arrived' ||
              m.responseStatus === 'completed'
          ).length;

          return {
            ...req,
            matchedDonors: updatedDonors,
            unitsFulfilled: fulfilledCount,
            status: fulfilledCount >= req.unitsRequested ? 'fulfilled' : 'matched',
          };
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

          return { ...d, status: newStatus, totalDonations: newDonations };
        }
        return d;
      })
    );

    const donor = donors.find((d) => d.id === donorId);
    const req = donorRequests.find((r) => r.id === requestId);

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
            ? `AUTONOMOUS RESTOCK: +1 Unit of ${donor.bloodGroup} automatically credited to ${req.hospitalName} reserve following verified donation by ${donor.fullName}.`
            : `Donor ${donor.fullName} updated status to: ${response.toUpperCase()} for ${
                req.hospitalName
              }. Live travel route active.`,
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

  // 5. Update Hospital Blood Bank Inventory
  const updateHospitalBloodBank = (
    hospitalId: string,
    bloodGroup: BloodGroup,
    deltaUnits: number
  ) => {
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === hospitalId) {
          const curr = h.bloodBankInventory[bloodGroup] || 0;
          return {
            ...h,
            bloodBankInventory: {
              ...h.bloodBankInventory,
              [bloodGroup]: Math.max(0, curr + deltaUnits),
            },
          };
        }
        return h;
      })
    );
  };

  return (
    <DashboardContext.Provider
      value={{
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
        acknowledgeAlert,
        prepareBay,
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
