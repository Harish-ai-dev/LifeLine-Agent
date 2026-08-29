import React, { useState } from 'react';
import {
  X,
  Radio,
  MapPin,
  HeartPulse,
  Activity,
  Wind,
  AlertTriangle,
  Sparkles,
  Droplet,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { CrisisType, BloodGroup } from '../../types/dashboard';

interface EmergencySimulatorModalProps {
  onClose: () => void;
}

export const EmergencySimulatorModal: React.FC<EmergencySimulatorModalProps> = ({ onClose }) => {
  const { triggerSimulatedAlert, createDonorRequest, currentHospital } = useDashboard();

  const [crisisType, setCrisisType] = useState<CrisisType>('cardiac');
  const [locationPreset, setLocationPreset] = useState('Bandra West, Hill Road, Mumbai');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 19.0543, lng: 72.8282 });
  const [includeBloodCallout, setIncludeBloodCallout] = useState(true);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');

  const locations = [
    { name: 'Bandra West, Hill Road, Mumbai', lat: 19.0543, lng: 72.8282 },
    { name: 'Dadar Central Station Western Gate, Mumbai', lat: 19.0178, lng: 72.8478 },
    { name: 'Bandra Kurla Complex (BKC), Mumbai', lat: 19.0657, lng: 72.8687 },
    { name: 'Andheri East Metro Hub, Mumbai', lat: 19.1136, lng: 72.8697 },
    { name: 'South Mumbai / Nariman Point', lat: 18.9256, lng: 72.8242 },
  ];

  const handleLocationChange = (name: string) => {
    setLocationPreset(name);
    const loc = locations.find((l) => l.name === name);
    if (loc) setCoords({ lat: loc.lat, lng: loc.lng });
  };

  const handleLaunchSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSimulatedAlert(crisisType, locationPreset, coords.lat, coords.lng);

    if (includeBloodCallout) {
      createDonorRequest({
        hospitalId: currentHospital.id,
        patientName: 'Simulated STAT Emergency Case',
        type: 'blood',
        bloodGroupNeeded: bloodGroup,
        unitsRequested: 2,
        urgency: 'STAT_CRITICAL',
        clinicalIndication: `STAT Blood callout for acute ${crisisType} trauma resuscitation.`,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-alert-100 text-alert-700 flex items-center justify-center">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Trigger Live Emergency Simulation
              </h3>
              <p className="text-xs text-slate-500">
                Simulates citizen SOS app trigger with instant auto-routing & donor callouts.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleLaunchSimulation} className="space-y-4 text-xs">
          {/* Crisis Category Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Emergency Crisis Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'cardiac' as CrisisType, label: 'Acute Cardiac (STEMI)', icon: HeartPulse },
                { id: 'trauma' as CrisisType, label: 'High-Impact Trauma', icon: Activity },
                { id: 'breathing' as CrisisType, label: 'Severe Respiratory', icon: Wind },
                { id: 'sepsis' as CrisisType, label: 'Severe Sepsis Alert', icon: AlertTriangle },
              ].map((c) => {
                const Icon = c.icon;
                const isSelected = crisisType === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCrisisType(c.id)}
                    className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-bold text-left transition ${
                      isSelected
                        ? 'bg-alert-50 border-alert-400 text-alert-950 ring-1 ring-alert-400'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-alert-600' : 'text-slate-400'}`} />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Incident Geolocation
            </label>
            <select
              value={locationPreset}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white"
            >
              {locations.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* STAT Blood Callout Toggle */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-950 flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-rose-600 fill-rose-600" />
                <span>Simultaneously Dispatch STAT Donor Callout</span>
              </span>
              <input
                type="checkbox"
                checked={includeBloodCallout}
                onChange={(e) => setIncludeBloodCallout(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded"
              />
            </div>

            {includeBloodCallout && (
              <div className="flex items-center gap-2 pt-1 border-t border-rose-200">
                <span className="text-[11px] font-bold text-rose-800">Target Blood Group:</span>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                  className="px-2 py-1 rounded-lg border border-rose-300 font-mono font-bold bg-white text-xs text-rose-900"
                >
                  {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodGroup[]).map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-alert-600 hover:bg-alert-700 active:bg-alert-800 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-alert-600/30 transition"
            >
              🚀 Launch SOS Broadcast
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
