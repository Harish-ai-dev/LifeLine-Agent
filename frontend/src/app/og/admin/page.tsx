'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldAlert,
  Play,
  Pause,
  RefreshCw,
  Flame,
  Radio,
  Clock,
  Send,
  MessageSquare,
  Activity,
  Bed,
  Droplet,
  Users,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Building2,
  Phone,
  Sparkles,
  Zap,
  TrendingUp,
  MapPin,
  Compass,
  ArrowRight,
  LogOut,
  Sliders,
} from 'lucide-react';
import { useDashboard } from '../../../context/DashboardContext';
import { CrisisType, BloodGroup } from '../../../types/dashboard';

interface SimulatedSms {
  id: string;
  timestamp: string;
  recipient: string;
  phone: string;
  role: 'doctor' | 'ambulance' | 'donor' | 'authority';
  message: string;
  status: 'delivered' | 'sent';
}

interface SimulatedEvent {
  id: string;
  timestamp: string;
  type: 'dispatch' | 'bed' | 'blood' | 'sms' | 'issue';
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
}

const EMERGENCY_PRESETS: Array<{
  crisisType: CrisisType;
  patientAge: number;
  complaint: string;
  mechanism: string;
  vitals: {
    heartRate: number;
    respiratoryRate: number;
    systolicBp: number;
    spo2: number;
    temperatureC: number;
    consciousness: string;
  };
  location: { name: string; lat: number; lng: number };
  bloodNeeded?: { group: BloodGroup; units: number };
}> = [
  {
    crisisType: 'cardiac',
    patientAge: 58,
    complaint: 'Crushing retrosternal chest pain with diaphoresis and radiating left arm numbness',
    mechanism: 'Acute non-traumatic coronary syndrome',
    vitals: { heartRate: 118, respiratoryRate: 24, systolicBp: 88, spo2: 91, temperatureC: 37.6, consciousness: 'alert' },
    location: { name: 'Bandra West, Hill Road, Mumbai', lat: 19.0543, lng: 72.8282 },
    bloodNeeded: { group: 'O+', units: 2 },
  },
  {
    crisisType: 'trauma',
    patientAge: 34,
    complaint: 'Severe polytrauma following high-speed Western Express Highway collision, open femur fracture, hemorrhagic shock',
    mechanism: 'Motor vehicle collision with dashboard entrapment',
    vitals: { heartRate: 132, respiratoryRate: 28, systolicBp: 82, spo2: 89, temperatureC: 36.2, consciousness: 'voice' },
    location: { name: 'Western Express Highway near BKC Flyover, Mumbai', lat: 19.0657, lng: 72.8687 },
    bloodNeeded: { group: 'O-', units: 4 },
  },
  {
    crisisType: 'breathing',
    patientAge: 8,
    complaint: 'Acute severe pediatric asthma exacerbation, severe stridor, intercostal retractions, cyanotic lips',
    mechanism: 'Acute reactive airway status asthmaticus',
    vitals: { heartRate: 140, respiratoryRate: 34, systolicBp: 95, spo2: 88, temperatureC: 38.1, consciousness: 'alert' },
    location: { name: 'Dadar Central Station Western Gate, Mumbai', lat: 19.0178, lng: 72.8478 },
    bloodNeeded: { group: 'A+', units: 1 },
  },
  {
    crisisType: 'sepsis',
    patientAge: 64,
    complaint: 'Septic shock secondary to pneumonia, high spiking fever, profound hypotension and confusion',
    mechanism: 'Severe systemic inflammatory response syndrome',
    vitals: { heartRate: 126, respiratoryRate: 26, systolicBp: 84, spo2: 92, temperatureC: 39.4, consciousness: 'voice' },
    location: { name: 'Andheri East Metro Hub Corridor, Mumbai', lat: 19.1136, lng: 72.8697 },
    bloodNeeded: { group: 'B+', units: 2 },
  },
  {
    crisisType: 'cardiac',
    patientAge: 71,
    complaint: 'Acute left ventricular failure, pulmonary edema, pink frothy sputum, severe respiratory distress',
    mechanism: 'Cardiogenic decompensation',
    vitals: { heartRate: 122, respiratoryRate: 30, systolicBp: 195, spo2: 86, temperatureC: 37.0, consciousness: 'alert' },
    location: { name: 'South Mumbai, Marine Drive Promenade', lat: 18.9432, lng: 72.8234 },
    bloodNeeded: { group: 'AB+', units: 2 },
  },
];

export default function OgAdminPage() {
  const {
    hospitals,
    alerts,
    donorRequests,
    auditLogs,
    triggerMultiAgentDispatch,
    triggerSimulatedAlert,
    createDonorRequest,
    updateHospitalBedCount,
    updateHospitalBloodBankUnits,
    createIssue,
    currentHospital,
  } = useDashboard();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Simulation Engine State
  const [isSimRunning, setIsSimRunning] = useState<boolean>(false);
  const [intervalSeconds, setIntervalSeconds] = useState<number>(60);
  const [countdown, setCountdown] = useState<number>(60);
  const [simStepIndex, setSimStepIndex] = useState<number>(0);
  const [simTotalEvents, setSimTotalEvents] = useState<number>(0);

  // Live Outbox Feeds
  const [smsOutbox, setSmsOutbox] = useState<SimulatedSms[]>([]);
  const [liveEvents, setLiveEvents] = useState<SimulatedEvent[]>([]);
  const [isTriggeringManual, setIsTriggeringManual] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check saved session auth on load
  useEffect(() => {
    const saved = sessionStorage.getItem('lifeline_og_admin_auth');
    if (saved === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Handle Login submission
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim().toLowerCase() === 'lifeline' && passwordInput.trim() === 'lifeline') {
      setIsAuthenticated(true);
      sessionStorage.setItem('lifeline_og_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Invalid credentials. Access is restricted to authorized operators.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('lifeline_og_admin_auth');
    setIsSimRunning(false);
  };

  // Helper to log a simulated SMS
  const sendSimulatedSms = (sms: Omit<SimulatedSms, 'id' | 'timestamp' | 'status'>) => {
    const newSms: SimulatedSms = {
      ...sms,
      id: `SMS-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'delivered',
    };
    setSmsOutbox((prev) => [newSms, ...prev.slice(0, 19)]);
  };

  // Helper to log a simulation event
  const logSimEvent = (event: Omit<SimulatedEvent, 'id' | 'timestamp'>) => {
    const newEv: SimulatedEvent = {
      ...event,
      id: `EV-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setLiveEvents((prev) => [newEv, ...prev.slice(0, 24)]);
    setSimTotalEvents((prev) => prev + 1);
  };

  // Core Simulation Step Executor
  const executeSimulationTick = async () => {
    const preset = EMERGENCY_PRESETS[simStepIndex % EMERGENCY_PRESETS.length];
    setSimStepIndex((prev) => prev + 1);

    logSimEvent({
      type: 'dispatch',
      title: `Inbound ${preset.crisisType.toUpperCase()} SOS: Patient (${preset.patientAge}yo)`,
      description: preset.complaint,
      badge: 'AI DISPATCH',
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    });

    // 1. Run Live Multi-Agent Dispatch (Triage -> Bed Matching -> Routing -> SBAR)
    try {
      await triggerMultiAgentDispatch({
        patientAge: preset.patientAge,
        chiefComplaint: preset.complaint,
        vitals: {
          heartRate: preset.vitals.heartRate,
          respiratoryRate: preset.vitals.respiratoryRate,
          systolicBp: preset.vitals.systolicBp,
          spo2: preset.vitals.spo2,
          temperatureC: preset.vitals.temperatureC,
          consciousness: preset.vitals.consciousness,
        },
        location: {
          address: preset.location.name,
          lat: preset.location.lat,
          lng: preset.location.lng,
        },
      });
    } catch (err) {
      console.error('Simulation dispatch execution error:', err);
    }

    // 2. Decrement hospital bed at target hospital
    const targetHosp = hospitals[simStepIndex % hospitals.length] || currentHospital;
    if (targetHosp) {
      const currentIcu = targetHosp.availableIcuBeds || 2;
      const newIcu = Math.max(0, currentIcu - 1);
      updateHospitalBedCount(targetHosp.id, 'icu', newIcu);

      logSimEvent({
        type: 'bed',
        title: `Bed Allocation: ${targetHosp.name}`,
        description: `Reserved ICU Bay for acute case. Remaining free ICU beds: ${newIcu}`,
        badge: 'BED OCCUPIED',
        badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
      });

      // SMS to Receiving ER Trauma Chief
      sendSimulatedSms({
        recipient: `${targetHosp.name} ER Trauma Bay`,
        phone: '+91 98201 44892',
        role: 'doctor',
        message: `🚨 STAT ALERT: Inbound ${preset.patientAge}yo ${preset.crisisType.toUpperCase()} case allocated. Vitals: HR ${preset.vitals.heartRate}, SpO2 ${preset.vitals.spo2}%. ETA 4.5m. Prepare ICU Bay.`,
      });
    }

    // 3. Trigger Blood Network Broadcast if applicable
    if (preset.bloodNeeded) {
      const bg = preset.bloodNeeded.group;
      const units = preset.bloodNeeded.units;

      createDonorRequest({
        hospitalId: targetHosp.id,
        patientName: `Inbound ${preset.crisisType.toUpperCase()} Emergency (${preset.patientAge}yo)`,
        type: 'blood',
        bloodGroupNeeded: bg,
        unitsRequested: units,
        urgency: 'STAT_CRITICAL',
        clinicalIndication: `STAT Blood callout for acute ${preset.crisisType} resuscitation and surgical stabilization.`,
      });

      logSimEvent({
        type: 'blood',
        title: `STAT Blood Broadcast Dispatched: ${bg} (${units} Units)`,
        description: `Autonomous SMS callout sent to matching registered ${bg} donors in 5km radius of ${targetHosp.name}`,
        badge: 'DONOR CALLOUT',
        badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      });

      // SMS to Nearby Registered Blood Donors
      sendSimulatedSms({
        recipient: `LifeLine Verified ${bg} Donors (4 Near ${targetHosp.name.slice(0, 15)})`,
        phone: '+91 97692 88104',
        role: 'donor',
        message: `🩸 CRITICAL NEED: ${targetHosp.name} urgently requires ${units} units of ${bg} blood for incoming trauma. Reply 'YES' to accept automated transit routing.`,
      });
    }

    // 4. SMS to Ambulance Pilot
    sendSimulatedSms({
      recipient: 'ALS Ambulance Unit 104',
      phone: '+91 98330 11928',
      role: 'ambulance',
      message: `🛰️ ROUTE CLEARED: Hospital ${targetHosp.name} confirmed bay ready. Proceed via Western Express Corridor. Verified ETA: 4.8 min.`,
    });
  };

  // Main simulation timer loop
  useEffect(() => {
    if (!isAuthenticated || !isSimRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setCountdown(intervalSeconds);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          executeSimulationTick();
          return intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = interval;
    return () => clearInterval(interval);
  }, [isAuthenticated, isSimRunning, intervalSeconds, simStepIndex]);

  // Manual Trigger Handlers
  const handleTriggerManualSOS = async () => {
    setIsTriggeringManual(true);
    await executeSimulationTick();
    setIsTriggeringManual(false);
  };

  const handleTriggerBloodShortage = () => {
    const bgList: BloodGroup[] = ['O-', 'A-', 'B-', 'AB+'];
    const chosenBg = bgList[Math.floor(Math.random() * bgList.length)];
    const hosp = hospitals[Math.floor(Math.random() * hospitals.length)] || currentHospital;

    createDonorRequest({
      hospitalId: hosp.id,
      patientName: `Critical Surge Reserve Depletion (${hosp.name.slice(0, 12)})`,
      type: 'blood',
      bloodGroupNeeded: chosenBg,
      unitsRequested: 3,
      urgency: 'STAT_CRITICAL',
      clinicalIndication: `Regional blood bank depleted below safety threshold. Emergency AI donor broadcast activated.`,
    });

    logSimEvent({
      type: 'blood',
      title: `Blood Deficit Surge: ${chosenBg} at ${hosp.name}`,
      description: `Reserve dropped below 2 units. 6 nearby matching donors notified via SMS.`,
      badge: 'RESERVE DEFICIT',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    });

    sendSimulatedSms({
      recipient: `Registered ${chosenBg} Donors (Mumbai Central)`,
      phone: '+91 99200 48192',
      role: 'donor',
      message: `🚨 URGENT BLOOD NEED: ${hosp.name} has low ${chosenBg} reserves. Please schedule donation at nearest camp today.`,
    });
  };

  const handleFluctuateBeds = () => {
    hospitals.forEach((h) => {
      const delta = Math.random() > 0.5 ? 1 : -1;
      const current = h.availableIcuBeds || 2;
      const updated = Math.max(1, Math.min(8, current + delta));
      updateHospitalBedCount(h.id, 'icu', updated);
    });

    logSimEvent({
      type: 'bed',
      title: 'Regional Bed Capacities Fluctuated',
      description: 'Simulated real-time patient discharges and emergency bed turnarounds across network.',
      badge: 'BED SYNC',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    });
  };

  const handleTriggerEquipmentIssue = () => {
    const hosp = hospitals[Math.floor(Math.random() * hospitals.length)] || currentHospital;
    createIssue({
      hospital_id: hosp.id,
      category: 'medical_equipment',
      title: 'CT Scanner Calibration In Progress',
      description: 'Emergency radiology performing rapid diagnostic recalibration. Diverting neuro imaging 15 mins.',
      severity: 'medium',
      logged_by: 'BioMed Operations',
    });

    logSimEvent({
      type: 'issue',
      title: `Equipment Issue: ${hosp.name}`,
      description: 'CT Scanner recalibration logged. AI routing adjusts specialty matchmaking.',
      badge: 'FACILITY ISSUE',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    });
  };

  const handleResetData = () => {
    hospitals.forEach((h) => {
      updateHospitalBedCount(h.id, 'icu', 4);
      updateHospitalBedCount(h.id, 'general', 12);
      updateHospitalBloodBankUnits(h.id, 'O-', 5);
      updateHospitalBloodBankUnits(h.id, 'O+', 8);
      updateHospitalBloodBankUnits(h.id, 'A+', 7);
      updateHospitalBloodBankUnits(h.id, 'B+', 6);
    });

    logSimEvent({
      type: 'dispatch',
      title: 'All Hospital Capacities Restored',
      description: 'Reset ICU beds, trauma bays, and blood inventories to standard factory baseline.',
      badge: 'RESET OK',
      badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    });
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 1. Password Lock Screen (if not authenticated)
  // ───────────────────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070b12] text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0d1424] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-600/30 text-white font-black">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-white">LifeLine Operator Console</h1>
            <p className="text-xs text-slate-400 font-mono">
              Protected Secret Route: <span className="text-sky-400">/og/admin</span>
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                Operator Username
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter operator username..."
                className="w-full bg-[#060a12] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                Access Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter access password..."
                className="w-full bg-[#060a12] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Admin & Simulator</span>
            </button>
          </form>

          <div className="pt-3 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500">
              Demo Credentials: <code className="text-sky-400 font-mono">lifeline</code> / <code className="text-sky-400 font-mono">lifeline</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 2. Full Admin & Simulator Command Center (Authenticated)
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="h-16 px-6 bg-[#0c1220] border-b border-slate-800/80 flex items-center justify-between shrink-0 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-600/20 font-black">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-white tracking-tight">LifeLine Demo & Hackathon Simulator</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-bold">
                SECRET: /OG/ADMIN
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Continuous Multi-Agent Emergency Dispatch Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/hospital"
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Hospital Console</span>
          </Link>

          <Link
            href="/donor"
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1.5"
          >
            <Droplet className="w-3.5 h-3.5 text-rose-400" />
            <span>Donor Network</span>
          </Link>

          <Link
            href="/government"
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            <span>Authority Intel</span>
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
            title="Lock Console"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Simulation Control Hero Card */}
        <div className="rounded-3xl bg-gradient-to-r from-[#111728] via-[#10182c] to-[#151c33] border border-slate-700/60 p-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    isSimRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
                  }`}
                />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  {isSimRunning ? 'Continuous Simulation Active' : 'Simulation Engine Idle'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Auto-Dispatches Every {intervalSeconds}s
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Live Hackathon Emergency Stream & Swarm Orchestrator
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                When active, LifeLine continuously generates emergency cases, computes real NEWS2 scores, executes the 4-stage
                AI Agent swarm (Triage → Bed-Matching → Routing → SBAR), decrements live hospital beds, and dispatches automated SMS callouts to matching blood donors.
              </p>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
              <button
                onClick={() => setIsSimRunning(!isSimRunning)}
                className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-xl ${
                  isSimRunning
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30 animate-pulse'
                }`}
              >
                {isSimRunning ? (
                  <>
                    <Pause className="w-5 h-5" />
                    <span>Pause Continuous Mode</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-white" />
                    <span>Start Continuous Demo</span>
                  </>
                )}
              </button>

              <button
                onClick={handleTriggerManualSOS}
                disabled={isTriggeringManual}
                className="px-5 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition"
              >
                <Zap className={`w-4 h-4 ${isTriggeringManual ? 'animate-spin' : ''}`} />
                <span>{isTriggeringManual ? 'Dispatching...' : 'Trigger 1x Instant SOS'}</span>
              </button>
            </div>
          </div>

          {/* Progress Bar & Rate Selector */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-slate-400 font-mono text-[11px] shrink-0">Cycle Interval:</span>
              <div className="flex items-center gap-1.5 bg-[#090d16] p-1 rounded-xl border border-slate-800">
                {[
                  { label: '10s (Fast)', val: 10 },
                  { label: '30s', val: 30 },
                  { label: '60s (1 Min)', val: 60 },
                  { label: '120s (2 Min)', val: 120 },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => {
                      setIntervalSeconds(item.val);
                      setCountdown(item.val);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition ${
                      intervalSeconds === item.val
                        ? 'bg-sky-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {isSimRunning && (
              <div className="flex items-center gap-3 w-full sm:w-72 font-mono text-[11px]">
                <Clock className="w-4 h-4 text-sky-400 animate-spin" />
                <div className="flex-1">
                  <div className="flex justify-between mb-1 text-slate-400">
                    <span>Next Autonomous Event:</span>
                    <span className="text-sky-400 font-bold">{countdown}s</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-500 h-full transition-all duration-1000 ease-linear"
                      style={{ width: `${((intervalSeconds - countdown) / intervalSeconds) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Telemetry Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#0e1424] border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>ACTIVE DISPATCHES</span>
              <Activity className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{alerts.length}</div>
            <p className="text-[10px] text-slate-500 font-mono">Real-time emergency feed</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0e1424] border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>NETWORK ICU BEDS</span>
              <Bed className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-black text-sky-400 font-mono">
              {hospitals.reduce((acc, h) => acc + (h.availableIcuBeds || 0), 0)} Free
            </div>
            <p className="text-[10px] text-slate-500 font-mono">Across 5 Mumbai centers</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0e1424] border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>STAT BLOOD CALLOUTS</span>
              <Droplet className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400 font-mono">{donorRequests.length}</div>
            <p className="text-[10px] text-slate-500 font-mono">Active donor matches</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0e1424] border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>OUTBOUND SMS LOGS</span>
              <MessageSquare className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-400 font-mono">{smsOutbox.length} Sent</div>
            <p className="text-[10px] text-slate-500 font-mono">Live doctor & donor SMS</p>
          </div>
        </div>

        {/* Quick Simulator Action Trigger Buttons */}
        <div className="p-5 rounded-2xl bg-[#0d1322] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase font-bold text-slate-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>Instant Multi-Agent Stress Test Actions</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">Triggers real-time state updates across all tabs</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <button
              onClick={handleTriggerBloodShortage}
              className="p-3 rounded-xl bg-[#131b2f] hover:bg-rose-950/40 border border-slate-700/80 hover:border-rose-500/50 text-left transition space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-300">Trigger Blood Shortage</span>
                <Droplet className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-[10px] text-slate-400 font-sans">Simulates reserve drop & sends donor SMS broadcast</p>
            </button>

            <button
              onClick={handleFluctuateBeds}
              className="p-3 rounded-xl bg-[#131b2f] hover:bg-sky-950/40 border border-slate-700/80 hover:border-sky-500/50 text-left transition space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-300">Fluctuate Bed Capacities</span>
                <Bed className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-[10px] text-slate-400 font-sans">Simulates discharges & hospital surge shifts</p>
            </button>

            <button
              onClick={handleTriggerEquipmentIssue}
              className="p-3 rounded-xl bg-[#131b2f] hover:bg-purple-950/40 border border-slate-700/80 hover:border-purple-500/50 text-left transition space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-300">Log Equipment Issue</span>
                <AlertTriangle className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-[10px] text-slate-400 font-sans">Triggers CT scanner or oxygen line maintenance</p>
            </button>

            <button
              onClick={handleResetData}
              className="p-3 rounded-xl bg-[#131b2f] hover:bg-slate-800 border border-slate-700/80 text-left transition space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300">Reset Hospital Baseline</span>
                <RefreshCw className="w-4 h-4 text-slate-400 group-hover:rotate-180 transition-transform" />
              </div>
              <p className="text-[10px] text-slate-400 font-sans">Restores clean bed counts and inventory levels</p>
            </button>
          </div>
        </div>

        {/* 2-Column Live Feed Console: Real-time Event Stream & SMS Outbox */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Activity & Agent Stream */}
          <div className="rounded-3xl bg-[#0c1220] border border-slate-800 p-5 space-y-4 flex flex-col h-[520px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs uppercase font-mono text-white">Live Multi-Agent Event Stream</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>CONNECTED</span>
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
              {liveEvents.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 font-mono text-center p-6 space-y-2">
                  <Clock className="w-8 h-8 opacity-40 animate-spin" />
                  <p>Simulation idle. Click "Start Continuous Demo" or "Trigger 1x Instant SOS" to stream live events.</p>
                </div>
              ) : (
                liveEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-xl bg-[#111728] border border-slate-800/80 space-y-1 animate-in slide-in-from-top-2 duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${ev.badgeColor}`}>
                        {ev.badge}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{ev.timestamp}</span>
                    </div>
                    <h4 className="font-bold text-white text-xs">{ev.title}</h4>
                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">{ev.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Outbound SMS Broadcast Feed */}
          <div className="rounded-3xl bg-[#0c1220] border border-slate-800 p-5 space-y-4 flex flex-col h-[520px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-xs uppercase font-mono text-white">Live SMS Broadcast Outbox</span>
              </div>
              <span className="text-[10px] font-mono text-purple-300">GSM / Twilio Outbound Feed</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs font-mono">
              {smsOutbox.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-6 space-y-2">
                  <Phone className="w-8 h-8 opacity-40" />
                  <p>No SMS sent yet. Automated donor callouts and ER alerts will display here as cases occur.</p>
                </div>
              ) : (
                smsOutbox.map((sms) => (
                  <div
                    key={sms.id}
                    className="p-3 rounded-xl bg-[#101726] border border-purple-500/20 space-y-1.5 animate-in slide-in-from-top-2 duration-200"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <div className="flex items-center gap-1.5 font-bold text-purple-300">
                        <Send className="w-3 h-3 text-purple-400" />
                        <span>{sms.recipient}</span>
                        <span className="text-slate-500 font-normal">({sms.phone})</span>
                      </div>
                      <span>{sms.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-200 bg-[#090d16] p-2 rounded-lg border border-slate-800 leading-relaxed">
                      {sms.message}
                    </p>
                    <div className="flex justify-end">
                      <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>DELIVERED TO CARRIER</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
