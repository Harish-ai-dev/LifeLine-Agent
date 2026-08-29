import React, { useState } from 'react';
import {
  MapPin,
  Building2,
  ShieldAlert,
  Activity,
  BedDouble,
  Phone,
  Navigation,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { HospitalFacility, EmergencyIncidentAlert } from '../../types/dashboard';

export const JurisdictionMap: React.FC = () => {
  const { hospitals, alerts } = useDashboard();
  const [selectedHospital, setSelectedHospital] = useState<HospitalFacility | null>(hospitals[0]);
  const [selectedAlert, setSelectedAlert] = useState<EmergencyIncidentAlert | null>(null);

  // Active incidents across the entire region
  const activeIncidents = alerts.filter((a) => a.status !== 'resolved');

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-indigo-600" />
            <span>Jurisdiction-Wide Emergency Proximity & Hospital Radar</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Live telemetry of all accredited emergency centers, active ambulances, and citizen SOS clusters in Region IV.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Normal Intake
          </span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Surge / Busy
          </span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-alert-600 animate-ping" /> Active SOS Pin
          </span>
        </div>
      </div>

      {/* ── Interactive Proximity Radar Board ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Interactive Visual Radar / Map Canvas */}
        <div className="lg:col-span-2 bg-slate-950 rounded-3xl p-6 border border-slate-800 relative min-h-[420px] overflow-hidden flex flex-col justify-between text-white">
          {/* Subtle Map Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 pointer-events-none" />

          {/* District Header */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MUMBAI HEALTH REGION IV RADAR</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">Center: 19.0760° N, 72.8777° E</span>
          </div>

          {/* Visual Interactive Hospital & Incident Pins Grid */}
          <div className="relative z-10 my-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {hospitals.map((hosp) => {
              const isSelected = selectedHospital?.id === hosp.id;
              const hasAlert = activeIncidents.some((a) => a.assignedHospitalId === hosp.id);

              return (
                <button
                  key={hosp.id}
                  onClick={() => {
                    setSelectedHospital(hosp);
                    setSelectedAlert(null);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? 'bg-sky-950/90 border-sky-400 ring-2 ring-sky-500/40 shadow-xl'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {hasAlert && (
                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-alert-500 animate-ping" />
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        hosp.isDiverting
                          ? 'bg-alert-500'
                          : hosp.status === 'busy'
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                    <span className="text-[10px] font-mono text-slate-400">{hosp.code}</span>
                  </div>

                  <h4 className="text-xs font-black text-white truncate">{hosp.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{hosp.district}</p>

                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-300 font-mono">
                    <span>ICU: {hosp.availableIcuBeds}/{hosp.totalIcuBeds}</span>
                    <span>·</span>
                    <span>Trauma: {hosp.availableTraumaBays}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Incidents Banner Bar */}
          <div className="relative z-10 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300">
              🚨 {activeIncidents.length} Active Real-Time Emergency Dispatches in Jurisdiction
            </span>
            <span className="font-mono text-sky-400">OSRM Road Routing Matrix Connected</span>
          </div>
        </div>

        {/* Right Selected Facility / Incident Dossier View */}
        <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200 flex flex-col justify-between space-y-4">
          {selectedHospital ? (
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                    {selectedHospital.tier}
                  </span>
                  <h4 className="text-base font-black text-slate-900 mt-1">{selectedHospital.name}</h4>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">{selectedHospital.code}</span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700">
                <p>
                  <strong>Address:</strong> {selectedHospital.address}
                </p>
                <p>
                  <strong>District:</strong> {selectedHospital.district}
                </p>
                <p>
                  <strong>Emergency Direct:</strong> <span className="font-mono font-bold text-sky-700">{selectedHospital.emergencyPhone}</span>
                </p>
                <p>
                  <strong>Specialties:</strong> {selectedHospital.specialties.join(', ')}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 text-center font-mono">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">ICU BEDS</span>
                    <span className="text-base font-black text-slate-900">
                      {selectedHospital.availableIcuBeds} / {selectedHospital.totalIcuBeds}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">TRAUMA BAYS</span>
                    <span className="text-base font-black text-slate-900">
                      {selectedHospital.availableTraumaBays} / {selectedHospital.totalTraumaBays}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 mt-3 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">SLA Compliance:</span>
                    <strong className="text-emerald-700">{selectedHospital.complianceRate}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mean Response Time:</span>
                    <strong className="text-slate-900">{selectedHospital.slaResponseTimeSec}s</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Alerts Handled:</span>
                    <strong className="text-slate-900">{selectedHospital.totalAlertsHandled}</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Click a hospital pin on the map to inspect live metrics.
            </div>
          )}

          <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-3">
            District Health Authority Regulatory Surveillance Active.
          </div>
        </div>
      </div>
    </div>
  );
};
