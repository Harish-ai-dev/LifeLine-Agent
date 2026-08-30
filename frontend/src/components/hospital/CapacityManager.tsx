'use client';

import React from 'react';
import {
  Building2,
  BedDouble,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Plus,
  Minus,
  Bot,
  Zap,
  Sparkles,
  RefreshCw,
  Stethoscope,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export const CapacityManager: React.FC = () => {
  const { currentHospital, updateHospitalCapacity, toggleDiversion, alerts, setSelectedAlert } =
    useDashboard();

  // Active alerts strictly holding beds / bays at THIS hospital
  const inBayAlerts = alerts.filter(
    (a) =>
      a.assignedHospitalId === currentHospital.id &&
      (a.status === 'bay_ready' || a.status === 'bay_preparing' || a.status === 'admitted')
  );

  const handleIcuChange = (delta: number) => {
    const nextVal = currentHospital.availableIcuBeds + delta;
    updateHospitalCapacity(
      currentHospital.id,
      Math.max(0, Math.min(currentHospital.totalIcuBeds, nextVal)),
      currentHospital.availableTraumaBays
    );
  };

  const handleTraumaChange = (delta: number) => {
    const nextVal = currentHospital.availableTraumaBays + delta;
    updateHospitalCapacity(
      currentHospital.id,
      currentHospital.availableIcuBeds,
      Math.max(0, Math.min(currentHospital.totalTraumaBays, nextVal))
    );
  };

  return (
    <div className="bg-white dark:bg-[#0e1424] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* ── Header with Diversion & Autonomous Engine Badge ────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <span>Emergency Department Bed &amp; Trauma Bay Matrix</span>
            </h3>
            <span className="bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
              <Bot className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Autonomous Telemetry Active</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Direct sync: Bed counts auto-decrement upon bay prep / NEWS2 admission and auto-restore upon discharge.
          </p>
        </div>

        {/* Emergency Diversion Switch */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#080d16] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Emergency Diversion Status</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              {currentHospital.isDiverting
                ? '🔴 Active — Incoming alerts auto-bypass this facility'
                : '🟢 Normal Intake — Ready for incoming dispatches'}
            </span>
          </div>
          <button
            onClick={() => toggleDiversion(currentHospital.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all ${
              currentHospital.isDiverting
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/40 border border-red-400'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm'
            }`}
          >
            {currentHospital.isDiverting ? 'Divert Active' : 'Enable Diversion'}
          </button>
        </div>
      </div>

      {/* ── Autonomous Telemetry Overview Banner ──────────────────────────── */}
      <div className="bg-sky-50 dark:bg-gradient-to-r dark:from-sky-950/40 dark:via-[#111728] dark:to-[#111728] rounded-2xl p-4 border border-sky-200 dark:border-sky-500/30 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-600/30 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-500/40 flex items-center justify-center font-bold shrink-0 shadow-sm">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white">
              Autonomous Bed Allocation Rules (Google ADK Grounded)
            </h4>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] font-mono">
              NEWS2 ≥ 7 cases lock Level-1 Trauma Bays. Sub-acute cases routed to Step-Down. Diversion immediately updates BedMatchingCoordinator OSRM weights.
            </p>
          </div>
        </div>
      </div>

      {/* ── Capacity Steppers & Counters ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ICU Bed Matrix */}
        <div className="bg-slate-50 dark:bg-[#111728] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase font-bold text-slate-500 dark:text-slate-400">Critical Care</span>
              <h4 className="text-base font-black text-slate-900 dark:text-white">ICU Bed Availability</h4>
            </div>
            <div className="text-right font-mono">
              <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                {currentHospital.availableIcuBeds}
              </span>
              <span className="text-slate-500 text-sm"> / {currentHospital.totalIcuBeds} Free</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Manual Override Increment:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleIcuChange(-1)}
                disabled={currentHospital.availableIcuBeds <= 0}
                className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-white flex items-center justify-center font-bold border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleIcuChange(1)}
                disabled={currentHospital.availableIcuBeds >= currentHospital.totalIcuBeds}
                className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-white flex items-center justify-center font-bold border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Trauma Bay Matrix */}
        <div className="bg-slate-50 dark:bg-[#111728] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase font-bold text-slate-500 dark:text-slate-400">Emergency Resuscitation</span>
              <h4 className="text-base font-black text-slate-900 dark:text-white">Trauma Bay Availability</h4>
            </div>
            <div className="text-right font-mono">
              <span className="text-3xl font-black text-sky-700 dark:text-sky-400">
                {currentHospital.availableTraumaBays}
              </span>
              <span className="text-slate-500 text-sm"> / {currentHospital.totalTraumaBays} Free</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Manual Override Increment:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTraumaChange(-1)}
                disabled={currentHospital.availableTraumaBays <= 0}
                className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-white flex items-center justify-center font-bold border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleTraumaChange(1)}
                disabled={currentHospital.availableTraumaBays >= currentHospital.totalTraumaBays}
                className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-white flex items-center justify-center font-bold border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Active In-Bay Patients Holding Beds ────────────────────────────── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
            Active Patients Currently Occupying Bays / ICU ({inBayAlerts.length})
          </h4>
        </div>

        {inBayAlerts.length === 0 ? (
          <div className="p-6 bg-slate-50 dark:bg-[#080d16] rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 font-mono">
            No patients currently occupying designated resuscitation bays.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {inBayAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-[#111728] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-colors space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-400">
                    {alert.reservedBayId || 'BAY-EM1'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {alert.status}
                  </span>
                </div>
                <div className="text-xs text-slate-900 dark:text-white font-bold">{alert.patient.age}yo {alert.patient.gender} · {alert.trackingNumber}</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{alert.chiefComplaint}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
