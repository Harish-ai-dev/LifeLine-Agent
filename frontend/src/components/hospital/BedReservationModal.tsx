import React, { useState } from 'react';
import {
  X,
  BedDouble,
  Building2,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { EmergencyIncidentAlert } from '../../types/dashboard';

interface BedReservationModalProps {
  alert: EmergencyIncidentAlert;
  onClose: () => void;
}

export const BedReservationModal: React.FC<BedReservationModalProps> = ({ alert, onClose }) => {
  const { currentHospital, reserveBedOrBay } = useDashboard();

  const [bayId, setBayId] = useState('BAY-T1 (Resuscitation Bay 1)');
  const [bedType, setBedType] = useState('cardiac_icu');
  const [prepNotes, setPrepNotes] = useState('Rapid transfuser on standby; Cath lab team paged.');
  const [confirmed, setConfirmed] = useState(false);

  const availableBays = [
    { id: 'BAY-T1', name: 'Trauma Resuscitation Bay 1 (Ground Floor)', status: 'ready' },
    { id: 'BAY-T2', name: 'Trauma Resuscitation Bay 2 (Ground Floor)', status: 'ready' },
    { id: 'BAY-C1', name: 'Interventional Cardiac Cath Suite 1', status: 'ready' },
    { id: 'BAY-N1', name: 'Neurotrauma Rapid Resus Bay', status: 'ready' },
  ];

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    reserveBedOrBay(alert.id, currentHospital.id, bedType, bayId);
    setConfirmed(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-[#0e1424] rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="shrink-0 bg-gradient-to-r from-slate-900 to-sky-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold">
              <BedDouble className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30 px-2 py-0.5 rounded">
                Advance Bed Telemetry
              </span>
              <h3 className="text-lg font-black tracking-tight mt-0.5">
                Reserve Trauma Bay &amp; ICU Bed
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Container (<85vh) */}
        <form onSubmit={handleConfirm} className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Patient Quick Summary */}
          <div className="bg-slate-50 dark:bg-[#111728] border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                {alert.patient.fullName} ({alert.patient.age}yo {alert.patient.gender})
              </span>
              <span className="bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 font-bold px-2 py-0.5 rounded font-mono text-[11px] border border-red-200 dark:border-red-500/40">
                NEWS2: {alert.news2Score}/20
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{alert.chiefComplaint}</p>
            <div className="flex flex-wrap items-center gap-2 text-slate-500 dark:text-slate-400 font-mono text-[11px] pt-1">
              <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-bold">
                <Clock className="w-3.5 h-3.5" />
                ETA: {alert.drivingEtaMinutes}m
              </span>
              <span>·</span>
              <span>Facility: {currentHospital.name}</span>
            </div>
          </div>

          {/* Bay Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 font-mono">
              Designate Specific Trauma Bay / Suite
            </label>
            <select
              value={bayId}
              onChange={(e) => setBayId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium bg-white dark:bg-[#080d16] focus:ring-2 focus:ring-sky-500 font-mono"
            >
              {availableBays.map((bay) => (
                <option key={bay.id} value={`${bay.id} (${bay.name})`}>
                  {bay.id} — {bay.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bed Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 font-mono">
              Required Bed &amp; Unit Capability
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'cardiac_icu', label: '🫀 Cardiac ICU Bed', count: `${currentHospital.availableIcuBeds} open` },
                { id: 'trauma_icu', label: '🩸 Trauma Bay Resus', count: `${currentHospital.availableTraumaBays} open` },
                { id: 'general_icu', label: '🏥 Level 1 Multi-ICU', count: `${currentHospital.availableIcuBeds} open` },
                { id: 'rapid_resus', label: '⚡ Crash Bay Standing', count: 'Immediate' },
              ].map((bt) => (
                <button
                  key={bt.id}
                  type="button"
                  onClick={() => setBedType(bt.id)}
                  className={`p-2.5 rounded-xl border text-left transition font-mono ${
                    bedType === bt.id
                      ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-500 text-sky-900 dark:text-sky-200 ring-1 ring-sky-500 font-bold shadow-sm'
                      : 'bg-white dark:bg-[#111728] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="font-extrabold">{bt.label}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{bt.count}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Clinical Preparation Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 font-mono">
              Bay Preparation Directives for Nursing &amp; Resus Team
            </label>
            <textarea
              rows={2}
              value={prepNotes}
              onChange={(e) => setPrepNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white bg-white dark:bg-[#080d16] focus:ring-2 focus:ring-sky-500 font-mono text-xs"
              placeholder="e.g. Cath Lab warm prep, rapid infuser primed, airway team on standby."
            />
          </div>

          {/* Action Footer */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={confirmed}
              className="py-2.5 px-5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-xl font-black uppercase tracking-wider shadow-md shadow-sky-600/30 transition flex items-center gap-1.5 font-mono"
            >
              {confirmed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Bay Reserved!</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Advance Reservation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
