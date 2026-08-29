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
  const { currentHospital, updateHospitalCapacity, toggleDiversion, alerts } = useDashboard();

  // Active alerts holding beds at THIS hospital
  const hospitalAlerts = alerts.filter(
    (a) =>
      a.assignedHospitalId === currentHospital.id &&
      (a.status === 'bay_ready' || a.status === 'bay_preparing' || a.status === 'admitted' || a.status === 'acknowledged')
  );

  const handleIcuChange = (delta: number) => {
    updateHospitalCapacity(
      currentHospital.id,
      currentHospital.availableIcuBeds + delta,
      currentHospital.availableTraumaBays
    );
  };

  const handleTraumaChange = (delta: number) => {
    updateHospitalCapacity(
      currentHospital.id,
      currentHospital.availableIcuBeds,
      currentHospital.availableTraumaBays + delta
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
      {/* ── Header with Diversion & Autonomous Engine Badge ────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-sky-600" />
              <span>Emergency Department Bed & Trauma Bay Inventory</span>
            </h3>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
              <Bot className="w-3 h-3 text-emerald-600" />
              <span>Autonomous Bed Telemetry Active</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time capacity signals automatically synchronize with incoming citizen dispatches, bay preparations, and discharges.
          </p>
        </div>

        {/* Emergency Diversion Switch */}
        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
          <div>
            <span className="text-xs font-black text-slate-900 block">Emergency Diversion Status</span>
            <span className="text-[10px] text-slate-500">
              {currentHospital.isDiverting
                ? '🔴 Active — Incoming alerts auto-bypass this facility'
                : '🟢 Normal Intake — Ready for incoming dispatches'}
            </span>
          </div>
          <button
            onClick={() => toggleDiversion(currentHospital.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
              currentHospital.isDiverting
                ? 'bg-alert-600 hover:bg-alert-700 text-white shadow-md'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
            }`}
          >
            {currentHospital.isDiverting ? 'Divert Active' : 'Enable Diversion'}
          </button>
        </div>
      </div>

      {/* ── Autonomous Telemetry Overview Banner ──────────────────────────── */}
      <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 rounded-2xl p-4 border border-sky-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sky-950">
              Automated Bed Allocation Rules Active
            </h4>
            <p className="text-[11px] text-slate-600">
              • <strong>Bay Prep:</strong> Auto-decrements Trauma Bay · • <strong>NEWS2 &ge; 7:</strong> Auto-reserves ICU Bed · • <strong>Discharge:</strong> Auto-restores capacity.
            </p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-sky-300 text-[11px] font-bold text-sky-900 font-mono">
          Active In-Bay Patients: {hospitalAlerts.length}
        </div>
      </div>

      {/* ── Bed Counters Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. Critical Care ICU Beds */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Available ICU Beds (Automated)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900 font-mono">
                {currentHospital.availableIcuBeds}
              </span>
              <span className="text-xs font-bold text-slate-500">
                / {currentHospital.totalIcuBeds} Total
              </span>
            </div>
            <div className="w-36 bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  currentHospital.availableIcuBeds <= 2 ? 'bg-alert-500' : 'bg-sky-600'
                }`}
                style={{
                  width: `${(currentHospital.availableIcuBeds / currentHospital.totalIcuBeds) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleIcuChange(-1)}
              disabled={currentHospital.availableIcuBeds <= 0}
              className="w-10 h-10 rounded-xl bg-white border border-slate-300 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition shadow-sm"
              aria-label="Decrease ICU bed count"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleIcuChange(1)}
              disabled={currentHospital.availableIcuBeds >= currentHospital.totalIcuBeds}
              className="w-10 h-10 rounded-xl bg-white border border-slate-300 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition shadow-sm"
              aria-label="Increase ICU bed count"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Trauma Resuscitation Bays */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Available Trauma Bays (Automated)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900 font-mono">
                {currentHospital.availableTraumaBays}
              </span>
              <span className="text-xs font-bold text-slate-500">
                / {currentHospital.totalTraumaBays} Total
              </span>
            </div>
            <div className="w-36 bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  currentHospital.availableTraumaBays <= 1 ? 'bg-alert-500' : 'bg-emerald-600'
                }`}
                style={{
                  width: `${
                    (currentHospital.availableTraumaBays / currentHospital.totalTraumaBays) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleTraumaChange(-1)}
              disabled={currentHospital.availableTraumaBays <= 0}
              className="w-10 h-10 rounded-xl bg-white border border-slate-300 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition shadow-sm"
              aria-label="Decrease trauma bay count"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleTraumaChange(1)}
              disabled={currentHospital.availableTraumaBays >= currentHospital.totalTraumaBays}
              className="w-10 h-10 rounded-xl bg-white border border-slate-300 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition shadow-sm"
              aria-label="Increase trauma bay count"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Active Automated Bed Holdings List ────────────────────────────── */}
      {hospitalAlerts.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
            Current Autonomous Bay Reservations ({hospitalAlerts.length})
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {hospitalAlerts.map((a) => (
              <div
                key={a.id}
                className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-sky-600" />
                  <div>
                    <span className="font-bold text-slate-900">{a.patient.fullName}</span>
                    <div className="text-[10px] text-slate-500">
                      {a.chiefComplaint.slice(0, 35)}...
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold bg-sky-100 text-sky-900 px-1.5 py-0.5 rounded">
                    NEWS2: {a.news2Score}/20
                  </span>
                  <span className="text-[10px] font-black uppercase text-emerald-700 block mt-0.5">
                    {a.status === 'bay_ready' ? 'Bay Reserved' : a.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
