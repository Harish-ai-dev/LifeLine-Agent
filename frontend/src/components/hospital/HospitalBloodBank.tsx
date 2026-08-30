'use client';

import React, { useState } from 'react';
import {
  Droplet,
  HeartHandshake,
  ShieldAlert,
  Clock,
  Plus,
  Minus,
  CheckCircle2,
  Navigation,
  Phone,
  UserCheck,
  Radio,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Send,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { BloodGroup } from '../../types/dashboard';
import { DonorRequestModal } from './DonorRequestModal';

export const HospitalBloodBank: React.FC = () => {
  const { currentHospital, donorRequests, updateHospitalBloodBank } = useDashboard();
  const [showRequestModal, setShowRequestModal] = useState(false);

  const hospitalRequests = donorRequests.filter((r) => r.hospitalId === currentHospital.id);
  const bloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  const handleManualDecrement = (bg: BloodGroup) => {
    updateHospitalBloodBank(currentHospital.id, bg, -1);
  };

  const handleManualIncrement = (bg: BloodGroup) => {
    updateHospitalBloodBank(currentHospital.id, bg, 1);
  };

  return (
    <div className="bg-white dark:bg-[#0e1424] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* ── Top Header & Actions ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Droplet className="w-5 h-5 text-rose-600 fill-rose-600" />
              <span>Facility Blood Bank Reserve &amp; Rapid Transfusion Matrix</span>
            </h3>
            <span className="bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-500/30 flex items-center gap-1">
              <span>🤖 Auto-Callout Watchdog Active</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Stocks &le; 2 units autonomously engage Google ADK RequestCoordinator to broadcast STAT donor alerts.
          </p>
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="flex items-center gap-2 py-2.5 px-5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-md shadow-rose-600/30 transition-all"
        >
          <Send className="w-4 h-4" />
          <span>Broadcast Donor Request</span>
        </button>
      </div>

      {/* ── Blood Reserves Grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {bloodGroups.map((bg) => {
          const units = currentHospital.bloodBankInventory?.[bg] || 0;
          const isCriticalLow = units <= 2;
          const isWarning = units > 2 && units <= 5;

          return (
            <div
              key={bg}
              className={`p-5 rounded-2xl border transition-all duration-200 shadow-sm ${
                isCriticalLow
                  ? 'bg-rose-50/70 dark:bg-gradient-to-br dark:from-red-950/40 dark:via-[#111728] dark:to-[#111728] border-rose-300 dark:border-red-500/50'
                  : isWarning
                  ? 'bg-amber-50/60 dark:bg-gradient-to-br dark:from-amber-950/30 dark:via-[#111728] dark:to-[#111728] border-amber-300 dark:border-amber-500/40'
                  : 'bg-slate-50 dark:bg-[#111728] border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{bg}</span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    isCriticalLow
                      ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/40 animate-pulse'
                      : isWarning
                      ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/40'
                      : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/40'
                  }`}
                >
                  {isCriticalLow ? 'CRITICAL DEFICIT' : isWarning ? 'LOW RESERVE' : 'OPTIMAL'}
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-4">
                <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">{units}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Units Available</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono">Stock Level:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleManualDecrement(bg)}
                    disabled={units <= 0}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-white flex items-center justify-center font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-sm"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleManualIncrement(bg)}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-white flex items-center justify-center font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-sm"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Active Broadcast Feed ────────────────────────────────────────── */}
      <div className="space-y-3 pt-3">
        <h4 className="text-xs font-mono font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
          Active Inbound Responders &amp; Open Broadcasts ({hospitalRequests.length})
        </h4>

        {hospitalRequests.length === 0 ? (
          <div className="p-8 bg-slate-50 dark:bg-[#080d16] rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 font-mono">
            No active blood broadcast requests. All inventories stabilized.
          </div>
        ) : (
          <div className="space-y-3">
            {hospitalRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-[#111728] border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40">
                      {req.bloodGroupNeeded} Urgent Callout
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      {req.requestTrackingNumber}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                    {req.matchedDonors.length} Donors Matched · Status: {req.status}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 font-sans">
                  <strong>Indication:</strong> {req.clinicalIndication}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  {req.matchedDonors.map((d) => (
                    <div key={d.donorId} className="p-2.5 rounded-xl bg-white dark:bg-[#080d16] border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="text-slate-900 dark:text-white font-bold">{d.donorName}</div>
                      <div className="text-emerald-700 dark:text-emerald-400 font-bold">{d.responseStatus.toUpperCase()} · ETA {d.etaMinutes}m ({d.distanceKm}km)</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showRequestModal && (
        <DonorRequestModal onClose={() => setShowRequestModal(false)} />
      )}
    </div>
  );
};
