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
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export const CapacityManager: React.FC = () => {
  const { currentHospital, updateHospitalCapacity, toggleDiversion, hospitalRole } = useDashboard();

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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-sky-600" />
            <span>Emergency Department Bed & Trauma Bay Inventory</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time capacity signals used by LifeLine Auto-Routing Engine for incoming ambulance allocation.
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

      {/* ── Bed Counters Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. Critical Care ICU Beds */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Available ICU Beds
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
                className={`h-full ${
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
              Available Trauma / Cath Bays
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
                className={`h-full ${
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
    </div>
  );
};
