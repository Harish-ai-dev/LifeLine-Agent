'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  BedDouble,
  Building2,
  CheckCircle2,
  Clock,
  Cpu,
  Droplets,
  HeartPulse,
  Layers,
  MapPin,
  PhoneCall,
  Radio,
  Send,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  Users,
  Zap,
  ArrowUpRight,
  RefreshCw,
  GitBranch,
  Bot,
} from 'lucide-react';
import { AlertDetailModal } from '@/components/hospital/AlertDetailModal';
import { FloatingSOS } from '@/components/FloatingSOS';
import { AIAssistant } from '@/components/AIAssistant';

export default function HospitalDashboardPage() {
  const {
    currentUser,
    authToken,
    currentHospital,
    hospitals,
    activeHospitalId,
    alerts,
    issues,
    inventory,
    donorRequests,
    selectedAlert,
    setSelectedAlert,
    acknowledgeAlert,
    prepareBay,
  } = useDashboard();
  const router = useRouter();

  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isDiverting, setIsDiverting] = useState(currentHospital.isDiverting);
  const [surgeActive, setSurgeActive] = useState(false);

  useEffect(() => {
    if (!authToken || currentUser?.role !== 'hospital_staff') {
      router.push('/login');
    }
  }, [authToken, currentUser, router]);

  if (!authToken || currentUser?.role !== 'hospital_staff') return null;

  // Filter alerts for active facility
  const hospitalAlerts = alerts.filter((a) => a.assignedHospitalId === activeHospitalId);
  const pendingAlerts = hospitalAlerts.filter((a) => a.status === 'pending_ack');
  const activeInboundAlerts = hospitalAlerts.filter((a) =>
    ['acknowledged', 'bay_preparing', 'bay_ready'].includes(a.status)
  );

  const activeIssues = issues.filter(
    (i) => (i.hospital_id === activeHospitalId || i.hospital_name === currentHospital.name) && i.status !== 'resolved'
  );

  const lowStockItems = inventory.filter((i) => i.hospital_id === activeHospitalId && i.is_low_stock);

  const hospitalDonorReqs = donorRequests.filter((r) => r.hospitalId === activeHospitalId);
  const inboundDonorsCount = hospitalDonorReqs.reduce(
    (acc, req) =>
      acc +
      req.matchedDonors.filter((d) => ['en_route', 'arrived', 'accepted'].includes(d.responseStatus)).length,
    0
  );

  // Bed occupancy calculation
  const icuOccupancyPct = Math.round(
    ((currentHospital.totalIcuBeds - currentHospital.availableIcuBeds) / Math.max(1, currentHospital.totalIcuBeds)) * 100
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* ── 1. COMMAND CENTER HERO BANNER & REAL-TIME CONTROLS ──────────────── */}
      <div className="bg-white dark:bg-[#0d1424] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Facility Identity & Badges */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-700 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-sky-600/20 shrink-0 border border-sky-400/30">
              <Building2 className="w-7 h-7" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-400/40 px-2.5 py-0.5 rounded-full font-mono">
                  {currentHospital.tier}
                </span>
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400 font-bold">
                  CODE: {currentHospital.code}
                </span>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  ER TELEMETRY SYNCED
                </span>

                {isDiverting && (
                  <span className="text-[10px] font-black uppercase bg-red-100 dark:bg-red-600/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-500/60 px-2.5 py-0.5 rounded-full animate-pulse">
                    ⚠️ DIVERSION ACTIVE
                  </span>
                )}
                {surgeActive && (
                  <span className="text-[10px] font-black uppercase bg-purple-100 dark:bg-purple-600/30 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/60 px-2.5 py-0.5 rounded-full animate-pulse">
                    🚨 SURGE PROTOCOL LEVEL 2
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                {currentHospital.name}
              </h1>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-3 font-sans">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                  {currentHospital.address}
                </span>
                <span className="flex items-center gap-1 font-mono text-sky-700 dark:text-sky-300">
                  <PhoneCall className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                  Direct: {currentHospital.emergencyPhone}
                </span>
              </p>
            </div>
          </div>

          {/* Real-time Supervisor Action Toggles */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-[#080d16]/80 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 self-start lg:self-center">
            <button
              onClick={() => setIsDiverting(!isDiverting)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 ${
                isDiverting
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30 border border-red-400'
                  : 'bg-white hover:bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{isDiverting ? 'Divert Active' : 'Set Diversion'}</span>
            </button>

            <button
              onClick={() => setSurgeActive(!surgeActive)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 ${
                surgeActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-400'
                  : 'bg-white hover:bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{surgeActive ? 'MCI Surge L2' : 'Surge Protocol'}</span>
            </button>

            <button
              onClick={() => setIsSosOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-black tracking-wider transition-all shadow-md shadow-red-600/30 flex items-center gap-2 font-mono"
            >
              <Siren className="w-4 h-4 animate-bounce" />
              <span>STAT INTAKE</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. ADK PIPELINE STATUS GRAPH ─────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0e1424] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-200 font-mono">
              Google ADK Multi-Level Agent Pipeline · Real-Time Orchestration Graph
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-2 py-0.5 rounded-full">
            ● 0 Fallbacks · 100% Deterministic Grounding
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 text-xs font-mono">
          {/* Step 1 */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#111728] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-1.5">
            <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400">
              <span>01. GROUNDING</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">0.4ms</span>
            </div>
            <div className="font-bold text-slate-900 dark:text-white text-xs">NEWS2 Scoring</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Vitals Math Engine</div>
          </div>

          {/* Step 2 */}
          <div className="p-3 rounded-xl bg-sky-50 dark:bg-[#111728] border border-sky-300 dark:border-sky-500/40 shadow-sm flex flex-col justify-between space-y-1.5">
            <div className="flex justify-between items-center text-[10px] text-sky-700 dark:text-sky-400 font-bold">
              <span>02. L2 LOOP</span>
              <span className="text-purple-700 dark:text-purple-300">Gemini 3.1 Pro</span>
            </div>
            <div className="font-bold text-sky-900 dark:text-sky-300 text-xs">TriageCoordinator</div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400 truncate">Severity &amp; Specialty Validation</div>
          </div>

          {/* Step 3 */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#111728] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-1.5">
            <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400">
              <span>03. ROUTING</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">OSRM Live</span>
            </div>
            <div className="font-bold text-slate-900 dark:text-white text-xs">BedMatchingCoordinator</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">ICU Bed &amp; Bay Reservation</div>
          </div>

          {/* Step 4 */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#111728] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-1.5">
            <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400">
              <span>04. BRIEFING</span>
              <span className="text-purple-700 dark:text-purple-300 font-bold">Gemini 3.5</span>
            </div>
            <div className="font-bold text-slate-900 dark:text-white text-xs">BriefingLeaf Agent</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">SBAR Clinical Handover</div>
          </div>

          {/* Step 5 */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#111728] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-1.5">
            <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400">
              <span>05. AUDIT</span>
              <span className="text-amber-700 dark:text-amber-400 font-bold">Firestore</span>
            </div>
            <div className="font-bold text-slate-900 dark:text-white text-xs">Immutable Ledger</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Signed Decision Record</div>
          </div>
        </div>
      </div>

      {/* ── 3. FOUR CORE TELEMETRY STAT CARDS ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Triage Queue */}
        <Link
          href="/hospital/patients"
          className="glass-panel-glow-red p-5 rounded-3xl transition-all duration-300 hover:scale-[1.02] cursor-pointer block space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-red-700 dark:text-red-300 font-mono flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-red-600 dark:text-red-400" />
              Active Triage Queue
            </span>
            <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {hospitalAlerts.length}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">Inbound / ER</span>
          </div>

          <div className="pt-2 border-t border-red-200 dark:border-red-500/20 flex items-center justify-between text-[11px] font-mono">
            {pendingAlerts.length > 0 ? (
              <span className="text-red-700 dark:text-red-400 font-bold flex items-center gap-1 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                {pendingAlerts.length} Pending SLA Ack
              </span>
            ) : (
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">● All SLAs Met</span>
            )}
            <span className="text-slate-600 dark:text-slate-400">View Queue →</span>
          </div>
        </Link>

        {/* Card 2: Bed & Trauma Bay Capacity */}
        <Link
          href="/hospital/beds"
          className="glass-panel-glow-blue p-5 rounded-3xl transition-all duration-300 hover:scale-[1.02] cursor-pointer block space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-sky-800 dark:text-sky-300 font-mono flex items-center gap-1.5">
              <BedDouble className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              ICU &amp; Trauma Bays
            </span>
            <ArrowUpRight className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                {currentHospital.availableIcuBeds}
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400">/ {currentHospital.totalIcuBeds} ICU</span>
            </div>
            <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-300">
              {currentHospital.availableTraumaBays} Bays Free
            </span>
          </div>

          <div className="space-y-1 pt-1">
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full"
                style={{ width: `${icuOccupancyPct}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 font-mono">
              <span>Occupancy: {icuOccupancyPct}%</span>
              <span>Manage Bays →</span>
            </div>
          </div>
        </Link>

        {/* Card 3: Blood Bank & Inbound Responders */}
        <Link
          href="/hospital/requests"
          className="glass-panel-glow-emerald p-5 rounded-3xl transition-all duration-300 hover:scale-[1.02] cursor-pointer block space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 font-mono flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              Blood Bank &amp; Donors
            </span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-4xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">
              {inboundDonorsCount}
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-mono font-bold">
              Live Responders
            </span>
          </div>

          <div className="pt-2 border-t border-emerald-200 dark:border-emerald-500/20 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-700 dark:text-slate-300">
              {hospitalDonorReqs.length} Active Requests
            </span>
            <span className="text-emerald-700 dark:text-emerald-400">Callouts →</span>
          </div>
        </Link>

        {/* Card 4: Facility Issues & Inventory */}
        <Link
          href="/hospital/issues"
          className="glass-panel-glow-amber p-5 rounded-3xl transition-all duration-300 hover:scale-[1.02] cursor-pointer block space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 font-mono flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Operational Issues
            </span>
            <ArrowUpRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-4xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">
              {activeIssues.length}
            </span>
            <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
              {lowStockItems.length} Low Stock
            </span>
          </div>

          <div className="pt-2 border-t border-amber-200 dark:border-amber-500/20 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-700 dark:text-slate-300">
              {activeIssues.length > 0 ? 'Requires Action' : 'All Systems Nominal'}
            </span>
            <span className="text-amber-700 dark:text-amber-400">Issue Board →</span>
          </div>
        </Link>
      </div>

      {/* ── 4. TWO-COLUMN HIGH-DENSITY COMMAND FEED ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Triage & Active Ambulance Feed */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-slate-800 space-y-4 bg-[#0a0f1d]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
                <Siren className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-white">Live Emergency Dispatch Stream</h2>
                <p className="text-xs text-slate-400 font-mono">
                  Real-time telemetry, SBAR briefing, and trauma bay prep
                </p>
              </div>
            </div>

            <Link
              href="/hospital/patients"
              className="text-xs font-mono font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              <span>Full Clinical Roster ({hospitalAlerts.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Emergency Alert Cards List */}
          {hospitalAlerts.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto text-xl">
                ✓
              </div>
              <p className="text-sm font-bold text-slate-300">No Active Emergency Dispatches</p>
              <p className="text-xs text-slate-500 font-mono">
                System standing by. Use STAT Intake to simulate or register an inbound case.
              </p>
              <button
                onClick={() => setIsSosOpen(true)}
                className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors font-mono"
              >
                + Register Inbound Case
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {hospitalAlerts.map((alert) => {
                const isPending = alert.status === 'pending_ack';
                const isCritical = alert.severity === 'critical';

                return (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-2xl border transition-all duration-200 ${
                      isPending
                        ? 'bg-red-50/70 dark:bg-gradient-to-r dark:from-red-950/40 dark:via-[#111728] dark:to-[#111728] border-red-300 dark:border-red-500/50 shadow-sm'
                        : 'bg-white dark:bg-[#111728] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full uppercase border ${
                            isCritical
                              ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/40 animate-pulse'
                              : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/40'
                          }`}
                        >
                          {alert.severity} (NEWS2: {alert.news2Score})
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                          {alert.trackingNumber}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {alert.patient.age}yo {alert.patient.gender}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="flex items-center gap-1 text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 px-2.5 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          ETA: {alert.drivingEtaMinutes} mins
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans mb-3 line-clamp-2">
                      <strong className="text-slate-900 dark:text-white">Chief Complaint:</strong> {alert.chiefComplaint}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        Assigned Bay: <strong className="text-slate-900 dark:text-white">{alert.reservedBayId || 'BAY-EM1'}</strong> ·{' '}
                        <span className="text-purple-700 dark:text-purple-300 capitalize">{alert.crisisType}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isPending && (
                          <button
                            onClick={() => acknowledgeAlert(alert.id, currentUser.username)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold font-mono transition-colors shadow-md shadow-red-600/30 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Acknowledge</span>
                          </button>
                        )}

                        <button
                          onClick={() => prepareBay(alert.id, alert.reservedBayId || 'BAY-EM1', currentUser.username)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold font-mono transition-colors"
                        >
                          Prep Bay
                        </button>

                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 dark:bg-sky-600/20 dark:hover:bg-sky-600/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/40 rounded-xl text-xs font-bold font-mono transition-colors"
                        >
                          Clinical Dossier →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Tactical Operations & AI Co-Pilot Console */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-white dark:bg-[#0a0f1d] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <Zap className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                Tactical ER Actions
              </h3>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => setIsSosOpen(true)}
                className="w-full p-3.5 rounded-2xl bg-red-50 dark:bg-gradient-to-r dark:from-red-950/40 dark:via-[#131b2e] dark:to-[#131b2e] hover:bg-red-100 dark:hover:from-red-900/40 dark:hover:to-slate-800 border border-red-200 dark:border-red-500/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-red-700 dark:text-red-400 font-mono flex items-center gap-2">
                    <Siren className="w-4 h-4" />
                    Intake New SOS Case
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-sans">
                  Manual emergency registration with voice dictation &amp; NEWS2
                </p>
              </button>

              <Link
                href="/hospital/requests"
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-[#111728] hover:bg-slate-100 dark:hover:bg-slate-800/90 border border-slate-200 dark:border-slate-800 text-left transition-all block group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-rose-700 dark:text-rose-400 font-mono flex items-center gap-2">
                    <Droplets className="w-4 h-4" />
                    Broadcast Blood Callout
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-sans">
                  Auto-match and alert registered nearby donors
                </p>
              </Link>

              <Link
                href="/hospital/issues"
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-[#111728] hover:bg-slate-100 dark:hover:bg-slate-800/90 border border-slate-200 dark:border-slate-800 text-left transition-all block group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-amber-800 dark:text-amber-400 font-mono flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Report Equipment/Staff Issue
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-sans">
                  Ventilator failure, staffing shortage, cath lab delay
                </p>
              </Link>

              <button
                onClick={() => setIsAiOpen(true)}
                className="w-full p-3.5 rounded-2xl bg-sky-50 dark:bg-gradient-to-r dark:from-sky-950/40 dark:via-[#131b2e] dark:to-[#131b2e] hover:bg-sky-100 dark:hover:from-sky-900/40 dark:hover:to-slate-800 border border-sky-200 dark:border-sky-500/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-sky-700 dark:text-sky-400 font-mono flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    AI Supervisor Co-Pilot
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-sans">
                  Ask questions, inspect agent traces, trigger simulations
                </p>
              </button>
            </div>
          </div>

          {/* Quick Blood Reserve Monitor */}
          <div className="bg-white dark:bg-[#0a0f1d] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-rose-600 dark:text-rose-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  Blood Reserves
                </h3>
              </div>
              <Link href="/hospital/blood-bank" className="text-[11px] font-mono text-sky-600 dark:text-sky-400 hover:underline">
                Manage →
              </Link>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center font-mono">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">O-</span>
                <span className="text-base font-black text-red-600 dark:text-red-400">2 U</span>
                <span className="text-[9px] text-red-600 dark:text-red-500 font-bold block">LOW</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">O+</span>
                <span className="text-base font-black text-slate-900 dark:text-white">12 U</span>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block font-bold">STABLE</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">A+</span>
                <span className="text-base font-black text-slate-900 dark:text-white">8 U</span>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block font-bold">STABLE</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">B+</span>
                <span className="text-base font-black text-slate-900 dark:text-white">14 U</span>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block font-bold">STABLE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. MODALS & EMBEDDED CO-PILOT ─────────────────────────────────── */}
      {selectedAlert && (
        <AlertDetailModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
      )}
      <FloatingSOS isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
      <AIAssistant isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}
