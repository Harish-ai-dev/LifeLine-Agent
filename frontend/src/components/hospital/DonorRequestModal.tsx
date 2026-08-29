import React, { useState } from 'react';
import {
  X,
  HeartHandshake,
  Droplet,
  ShieldAlert,
  Sparkles,
  Building2,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { BloodGroup, OrganType, RequestUrgency, DonorRequestType } from '../../types/dashboard';

interface DonorRequestModalProps {
  onClose: () => void;
  defaultPatientTracking?: string;
  defaultPatientName?: string;
  defaultBloodGroup?: BloodGroup;
}

export const DonorRequestModal: React.FC<DonorRequestModalProps> = ({
  onClose,
  defaultPatientTracking,
  defaultPatientName,
  defaultBloodGroup = 'O-',
}) => {
  const { currentHospital, createDonorRequest } = useDashboard();

  const [requestType, setRequestType] = useState<DonorRequestType>('blood');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(defaultBloodGroup);
  const [organType, setOrganType] = useState<OrganType>('Kidney');
  const [units, setUnits] = useState<number>(2);
  const [urgency, setUrgency] = useState<RequestUrgency>('STAT_CRITICAL');
  const [patientName, setPatientName] = useState<string>(
    defaultPatientName || 'Emergency Trauma Resuscitation Patient'
  );
  const [clinicalIndication, setClinicalIndication] = useState<string>(
    'Massive Transfusion Protocol required for hypovolemic hemorrhagic shock.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDonorRequest({
      hospitalId: currentHospital.id,
      patientTrackingNumber: defaultPatientTracking,
      patientName,
      type: requestType,
      bloodGroupNeeded: requestType === 'blood' ? bloodGroup : undefined,
      organNeeded: requestType === 'organ' ? organType : undefined,
      unitsRequested: units,
      urgency,
      clinicalIndication,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-black">
              <Droplet className="w-5 h-5 fill-rose-600 text-rose-600" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Raise Automated Donor Request
              </h3>
              <p className="text-xs text-slate-500">
                Auto-matches nearby compatible donors and broadcasts instant alerts.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Request Type Selector (Blood vs Organ) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRequestType('blood')}
              className={`py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 border transition ${
                requestType === 'blood'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/30'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Droplet className="w-4 h-4" />
              <span>Blood / Platelets Request</span>
            </button>

            <button
              type="button"
              onClick={() => setRequestType('organ')}
              className={`py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 border transition ${
                requestType === 'organ'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/30'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Organ Allocation Request</span>
            </button>
          </div>

          {/* Blood Group or Organ Type */}
          {requestType === 'blood' ? (
            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1.5">
                Required Blood Group
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodGroup[]).map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setBloodGroup(bg)}
                    className={`py-2 rounded-xl font-black text-xs border transition ${
                      bloodGroup === bg
                        ? 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500/30'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1.5">
                Required Organ Type
              </label>
              <select
                value={organType}
                onChange={(e) => setOrganType(e.target.value as OrganType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold bg-white"
              >
                {(['Kidney', 'Liver', 'Heart', 'Lungs', 'Cornea', 'Pancreas'] as OrganType[]).map((org) => (
                  <option key={org} value={org}>
                    {org}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Urgency Level & Units */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                Urgency Level
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as RequestUrgency)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
              >
                <option value="STAT_CRITICAL">🚨 STAT / Immediate Threat</option>
                <option value="URGENT">⚠️ Urgent (&lt; 2 Hours)</option>
                <option value="STANDARD">Standard Planned</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                Units Required
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={units}
                onChange={(e) => setUnits(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold bg-white"
              />
            </div>
          </div>

          {/* Clinical Indication */}
          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
              Clinical Indication / Diagnosis
            </label>
            <textarea
              rows={2}
              required
              value={clinicalIndication}
              onChange={(e) => setClinicalIndication(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
              placeholder="e.g. Ruptured aortic aneurysm, severe hemorrhagic shock."
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-black uppercase tracking-wider rounded-xl shadow-lg shadow-rose-600/30 transition"
            >
              🚀 Dispatch Auto-Match
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
