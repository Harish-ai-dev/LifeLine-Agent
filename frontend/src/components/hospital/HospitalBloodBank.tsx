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
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { BloodGroup } from '../../types/dashboard';
import { DonorRequestModal } from './DonorRequestModal';

export const HospitalBloodBank: React.FC = () => {
  const { currentHospital, donorRequests, updateHospitalBloodBank, checkAndAutoTriggerBloodDeficit } =
    useDashboard();
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
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
      {/* ── Top Header & Actions ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-rose-600 fill-rose-600" />
              <span>Facility Blood Bank Reserve & Donor Match Dispatch</span>
            </h3>
            <span className="bg-rose-100 text-rose-800 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-rose-300 flex items-center gap-1">
              <span>🤖 Auto-Callout Watchdog Active</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time blood reserves. Stocks &le; 2 units autonomously trigger STAT donor match broadcasts. Completed donations auto-credit inventory.
          </p>
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="flex items-center gap-2 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-rose-600/30 transition"
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Raise STAT Donor Request</span>
        </button>
      </div>

      {/* ── Autonomous Blood Bank Surveillance Banner ─────────────────────── */}
      <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 rounded-2xl p-4 border border-rose-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
            <Droplet className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h4 className="font-extrabold text-rose-950">
              Autonomous Blood Watchdog & STAT Dispatcher
            </h4>
            <p className="text-[11px] text-slate-600">
              • <strong>Threshold Deficit:</strong> Any group &le; 2 units triggers automated STAT donor callouts · • <strong>Auto-Restock:</strong> Completed donations auto-credit inventory.
            </p>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-rose-300 text-xs font-bold text-rose-900 font-mono shadow-sm">
          Active Broadcasts: <strong className="text-rose-600 text-sm">{hospitalRequests.length}</strong>
        </div>
      </div>

      {/* ── 8-Group Blood Bank Inventory Matrix ──────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
            Current On-Site Blood Inventory (Units)
          </h4>
          <span className="text-[11px] text-slate-400">
            Auto-dispatch triggered when units &le; 2
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {bloodGroups.map((bg) => {
            const count = currentHospital.bloodBankInventory[bg] || 0;
            const isCritical = count <= 2;
            const isLow = count <= 4;
            const activeReq = hospitalRequests.find(
              (r) => r.bloodGroupNeeded === bg && (r.status === 'open' || r.status === 'matched')
            );

            return (
              <div
                key={bg}
                className={`p-3.5 rounded-2xl border text-center transition flex flex-col justify-between ${
                  isCritical
                    ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-400'
                    : isLow
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <span className="font-mono text-base font-black text-slate-900 block">{bg}</span>
                  <span className="text-2xl font-black text-rose-600 font-mono my-1 block">
                    {count}
                  </span>
                  <span className="text-[10px] font-bold block">
                    {isCritical ? (
                      <span className="text-rose-700 animate-pulse">🚨 Critical Low</span>
                    ) : isLow ? (
                      <span className="text-amber-700">⚠️ Low</span>
                    ) : (
                      <span className="text-emerald-700">Adequate</span>
                    )}
                  </span>

                  {activeReq && (
                    <span className="mt-1 text-[9px] font-mono font-bold bg-rose-600 text-white px-1.5 py-0.5 rounded block">
                      STAT Broadcast Active
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-center gap-1 mt-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => handleManualDecrement(bg)}
                    disabled={count <= 0}
                    className="w-6 h-6 rounded bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-30 text-xs shadow-sm font-bold"
                    aria-label={`Decrease ${bg} units`}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleManualIncrement(bg)}
                    className="w-6 h-6 rounded bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 text-xs shadow-sm font-bold"
                    aria-label={`Increase ${bg} units`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Active Hospital Donor Callout Requests ───────────────────────── */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-sky-600" />
            <span>Active Automated Donor Broadcasts ({hospitalRequests.length})</span>
          </h4>
          <span className="text-[11px] text-slate-400">
            Real-time fulfillment & matched donors
          </span>
        </div>

        {hospitalRequests.length === 0 ? (
          <div className="p-8 bg-slate-50 rounded-2xl text-center text-xs text-slate-500 border border-slate-200">
            No active blood or organ requests currently open for this facility. All inventory levels are within safe operating limits.
          </div>
        ) : (
          <div className="space-y-3">
            {hospitalRequests.map((req) => (
              <div
                key={req.id}
                className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 text-xs shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded">
                      {req.requestTrackingNumber}
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {req.unitsRequested} Unit(s) of{' '}
                      {req.type === 'blood' ? req.bloodGroupNeeded : req.organNeeded}
                    </span>
                    <span className="text-[10px] uppercase font-black bg-alert-600 text-white px-2 py-0.5 rounded">
                      {req.urgency}
                    </span>
                  </div>

                  <span className="text-xs text-slate-600">
                    Fulfilled:{' '}
                    <strong className="text-rose-700 font-mono text-sm">
                      {req.unitsFulfilled} / {req.unitsRequested}
                    </strong>
                  </span>
                </div>

                <p className="text-slate-700 font-medium leading-relaxed">
                  <strong>Patient / Indication:</strong> {req.patientName} · {req.clinicalIndication}
                </p>

                {/* Matched Donors Status */}
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                    Live Matched Donor Responses ({req.matchedDonors.length}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {req.matchedDonors.map((donor) => {
                      const isEnRoute = donor.responseStatus === 'en_route';
                      const isArrived = donor.responseStatus === 'arrived';
                      const isAccepted = donor.responseStatus === 'accepted';
                      const isCompleted = donor.responseStatus === 'completed';

                      return (
                        <div
                          key={donor.donorId}
                          className={`p-3 rounded-xl border flex items-center justify-between transition ${
                            isArrived
                              ? 'bg-indigo-50/80 border-indigo-300 ring-1 ring-indigo-400'
                              : isEnRoute
                              ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400'
                              : isCompleted
                              ? 'bg-slate-100 border-slate-300'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-900">{donor.donorName}</span>
                              <span className="text-rose-700 font-mono font-bold bg-rose-50 border border-rose-200 text-[10px] px-1.5 rounded">
                                {donor.bloodGroup}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                              <span>{donor.distanceKm} km away</span>
                              <span>·</span>
                              <span className="font-mono font-bold text-slate-700">
                                {donor.travelMode === 'transit'
                                  ? '🚆 Transit'
                                  : donor.travelMode === 'walking'
                                  ? '🚶 Walk'
                                  : '🚗 Drive'}
                              </span>
                              <span>·</span>
                              <span className="font-mono text-slate-600">ETA {donor.etaMinutes}m</span>
                            </div>
                          </div>

                          <div>
                            {isArrived ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-sm flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Arrived at ER</span>
                              </span>
                            ) : isEnRoute ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-sm flex items-center gap-1 animate-pulse">
                                <Navigation className="w-3 h-3 animate-spin" />
                                <span>En Route ({donor.etaMinutes}m)</span>
                              </span>
                            ) : isAccepted ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                                Accepted
                              </span>
                            ) : isCompleted ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white shadow-sm">
                                Completed (+1)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase bg-slate-100 text-slate-600">
                                {donor.responseStatus}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showRequestModal && <DonorRequestModal onClose={() => setShowRequestModal(false)} />}
    </div>
  );
};
