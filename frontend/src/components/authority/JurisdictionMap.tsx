'use client';

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
  Radio,
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
    <div className="bg-white dark:bg-[#0e1424] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Jurisdiction-Wide Emergency Proximity &amp; Hospital Radar
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Live telemetry of all accredited emergency centers, active ambulances, and citizen SOS clusters in Mumbai Metropolitan Zone.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Normal Intake
          </span>
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> High Load
          </span>
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" /> Active SOS
          </span>
        </div>
      </div>

      {/* ── Interactive Proximity Radar Board ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Interactive Visual Radar / Map Canvas */}
        <div className="lg:col-span-2 bg-slate-50 dark:bg-[#080d16] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 relative min-h-[440px] overflow-hidden flex flex-col justify-between shadow-inner">
          {/* Subtle Map Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-30 pointer-events-none" />

          {/* District Header */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="bg-white dark:bg-[#111728]/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold font-mono flex items-center gap-2 shadow-sm text-slate-800 dark:text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>RADAR SECTOR: MUMBAI-WEST / SOUTH METRO</span>
            </div>
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
              OSRM Geodesic Mesh: Active
            </div>
          </div>

          {/* Radar Nodes Simulation Display */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3 my-6">
            {hospitals.map((h) => {
              const isSelected = selectedHospital?.id === h.id;
              const isDiverting = h.isDiverting;

              return (
                <button
                  key={h.id}
                  onClick={() => setSelectedHospital(h)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-600/30 border-indigo-500 dark:border-indigo-400 text-slate-900 dark:text-white shadow-md'
                      : isDiverting
                      ? 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-500/40 text-slate-700 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-slate-900'
                      : 'bg-white dark:bg-[#111728]/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#111728] shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {h.code}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${isDiverting ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
                  </div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate">{h.name}</div>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                    {h.availableIcuBeds} ICU Beds · {h.availableTraumaBays} Bays Free
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Live Dispatch Ticker */}
          <div className="relative z-10 bg-white dark:bg-[#111728]/90 backdrop-blur-md p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono shadow-sm">
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              <span>Active GPS Traces: {activeIncidents.length} Ambulances En Route</span>
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">100% SLA Maintained</span>
          </div>
        </div>

        {/* Right Selected Facility Inspector */}
        <div className="bg-white dark:bg-[#111728] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">Facility Telemetry</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                {selectedHospital?.tier}
              </span>
            </div>

            {selectedHospital ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">{selectedHospital.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">{selectedHospital.address}</p>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-0.5 font-mono">Emergency: {selectedHospital.emergencyPhone}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block text-[10px]">ICU Capacity</span>
                    <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{selectedHospital.availableIcuBeds} / {selectedHospital.totalIcuBeds}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Trauma Bays</span>
                    <span className="text-lg font-bold text-sky-700 dark:text-sky-400">{selectedHospital.availableTraumaBays} / {selectedHospital.totalTraumaBays}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-800 text-xs font-mono">
                  <span className="text-slate-500 block text-[10px] uppercase mb-1">Status</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${selectedHospital.isDiverting ? 'bg-red-500' : 'bg-emerald-500'}`} />
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedHospital.isDiverting ? 'DIVERSION ACTIVE (Bypassing)' : 'NORMAL ADMISSION INTAKE'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Select a hospital node from radar canvas.</p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-400 dark:text-slate-500 text-center">
            LifeLine Region IV Super-Orchestrator
          </div>
        </div>
      </div>
    </div>
  );
};
