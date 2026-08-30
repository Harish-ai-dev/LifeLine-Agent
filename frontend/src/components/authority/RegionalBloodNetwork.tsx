import React, { useState } from 'react';
import {
  Droplet,
  HeartHandshake,
  ShieldCheck,
  Building2,
  TrendingUp,
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { BloodGroup } from '../../types/dashboard';

export const RegionalBloodNetwork: React.FC = () => {
  const { hospitals, donors, donorRequests, updateHospitalBloodBank } = useDashboard();
  const [transferSource, setTransferSource] = useState(hospitals[1].id);
  const [transferDest, setTransferDest] = useState(hospitals[0].id);
  const [transferGroup, setTransferGroup] = useState<BloodGroup>('O-');
  const [transferUnits, setTransferUnits] = useState(2);
  const [transferSuccess, setTransferSuccess] = useState(false);

  const bloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  // Compute total units per group across all district hospitals
  const districtTotals: Record<BloodGroup, number> = bloodGroups.reduce((acc, bg) => {
    acc[bg] = hospitals.reduce((sum, h) => sum + (h.bloodBankInventory[bg] || 0), 0);
    return acc;
  }, {} as Record<BloodGroup, number>);

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferSource === transferDest) return;
    updateHospitalBloodBank(transferSource, transferGroup, -transferUnits);
    updateHospitalBloodBank(transferDest, transferGroup, transferUnits);
    setTransferSuccess(true);
    setTimeout(() => setTransferSuccess(false), 3000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Droplet className="w-5 h-5 text-rose-600 fill-rose-600" />
            <span>Jurisdiction-Wide Blood & Organ Donor Network Surveillance</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            District-level blood inventory aggregation, rare group shortage monitoring, and inter-hospital transfer coordination.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold bg-rose-50 text-rose-900 px-3 py-1.5 rounded-xl border border-rose-200">
          <ShieldCheck className="w-4 h-4 text-rose-600" />
          <span>{donors.length} Verified Donors on Standby</span>
        </div>
      </div>

      {/* ── District Aggregate Blood Inventory Board ─────────────────────── */}
      <div>
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
          Total District Reserves Across 6 Hospitals
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {bloodGroups.map((bg) => {
            const count = districtTotals[bg] || 0;
            const isRare = bg === 'O-' || bg === 'AB-';

            return (
              <div
                key={bg}
                className={`p-3.5 rounded-2xl border text-center ${
                  isRare ? 'bg-rose-50/80 border-rose-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="font-mono text-base font-black text-slate-900 block">{bg}</span>
                <span className="text-2xl font-black text-rose-600 font-mono my-1 block">
                  {count}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {isRare ? '⚡ Rare Type' : 'Total Units'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Inter-Hospital Blood Transfer & Green Corridor Dispatcher ─────── */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
              <span>Inter-Hospital Emergency Blood Redistribution Protocol</span>
            </h4>
            <p className="text-xs text-slate-500">
              Transfer critical blood units from surplus hospitals to centers experiencing severe trauma surge.
            </p>
          </div>

          {transferSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg animate-pulse">
              ✓ Inter-Hospital Transfer Executed!
            </span>
          )}
        </div>

        <form onSubmit={handleExecuteTransfer} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 font-bold mb-1">Source Hospital (Surplus)</label>
            <select
              value={transferSource}
              onChange={(e) => setTransferSource(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-slate-800"
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.bloodBankInventory[transferGroup]} Units {transferGroup})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-bold mb-1">Destination Hospital (Surge)</label>
            <select
              value={transferDest}
              onChange={(e) => setTransferDest(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-slate-800"
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.bloodBankInventory[transferGroup]} Units {transferGroup})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-bold mb-1">Blood Group & Units</label>
            <div className="flex gap-1.5">
              <select
                value={transferGroup}
                onChange={(e) => setTransferGroup(e.target.value as BloodGroup)}
                className="w-1/2 px-2 py-2 rounded-xl border border-slate-300 font-black font-mono bg-white"
              >
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                max={10}
                value={transferUnits}
                onChange={(e) => setTransferUnits(parseInt(e.target.value) || 1)}
                className="w-1/2 px-2 py-2 rounded-xl border border-slate-300 font-mono font-bold bg-white text-center"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold transition shadow-md"
            >
              Authorize Transfer
            </button>
          </div>
        </form>
      </div>

      {/* ── Active District-Wide Donor Callout Broadcasts ────────────────── */}
      <div>
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
          District-Wide Active Donor Callouts ({donorRequests.length})
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {donorRequests.map((req) => (
            <div
              key={req.id}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                  <div>
                    <span className="font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                      {req.requestTrackingNumber}
                    </span>
                    <h5 className="font-extrabold text-slate-900 mt-1">{req.hospitalName}</h5>
                  </div>
                  <span className="text-[10px] uppercase font-black bg-alert-600 text-white px-2 py-0.5 rounded">
                    {req.urgency}
                  </span>
                </div>

                <p className="text-slate-700">
                  <strong>Need:</strong> {req.unitsRequested} Unit(s) of{' '}
                  <strong className="text-rose-700">{req.bloodGroupNeeded || req.organNeeded}</strong> for{' '}
                  {req.patientName}
                </p>
                <p className="text-slate-500 text-[11px] mt-1">{req.clinicalIndication}</p>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-500">
                <span>
                  Matched Donors: <strong>{req.matchedDonors.length} Notified</strong>
                </span>
                <span>
                  Fulfilled: <strong>{req.unitsFulfilled}/{req.unitsRequested}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
