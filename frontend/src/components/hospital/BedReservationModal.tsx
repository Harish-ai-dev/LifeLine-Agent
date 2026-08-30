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
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-sky-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold">
              <BedDouble className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30 px-2 py-0.5 rounded">
                Advance Bed Telemetry
              </span>
              <h3 className="text-lg font-black tracking-tight mt-0.5">
                Reserve Trauma Bay & ICU Bed
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

        {/* Body */}
        <form onSubmit={handleConfirm} className="p-5 space-y-4 text-xs">
          {/* Patient Quick Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-sm">
                {alert.patient.fullName} ({alert.patient.age}yo {alert.patient.gender})
              </span>
              <span className="bg-alert-100 text-alert-800 font-bold px-2 py-0.5 rounded font-mono text-[11px]">
                NEWS2: {alert.news2Score}/20
              </span>
            </div>
            <p className="text-slate-600">{alert.chiefComplaint}</p>
            <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px] pt-1">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              <span>ETA: {alert.drivingEtaMinutes} minutes</span>
              <span>·</span>
              <span>Facility: {currentHospital.name}</span>
            </div>
          </div>

          {/* Bay Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Designate Specific Trauma Bay / Suite
            </label>
            <select
              value={bayId}
              onChange={(e) => setBayId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-medium bg-white focus:ring-2 focus:ring-sky-500"
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
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Required Bed & Unit Capability
            </label>
            <div className="grid grid-cols-2 gap-2">
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
                  className={`p-2.5 rounded-xl border text-left transition ${
                    bedType === bt.id
                      ? 'bg-sky-50 border-sky-500 text-sky-900 ring-1 ring-sky-500 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-extrabold">{bt.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{bt.count}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Clinical Preparation Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Bay Preparation Directives for Nursing & Resus Team
            </label>
            <textarea
              rows={2}
              value={prepNotes}
              onChange={(e) => setPrepNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-sky-500"
              placeholder="e.g. Cath Lab warm prep, rapid infuser primed, airway team on standby."
            />
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={confirmed}
              className="py-2.5 px-5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-xl font-black uppercase tracking-wider shadow-md shadow-sky-600/30 transition flex items-center gap-1.5"
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
