'use client';

import React from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { LiveAlertQueue } from '@/components/hospital/LiveAlertQueue';
import { AlertDetailModal } from '@/components/hospital/AlertDetailModal';
import { Users, Activity, ShieldAlert, Sparkles, Filter } from 'lucide-react';

export default function PatientsPage() {
  const { selectedAlert, setSelectedAlert, alerts, activeHospitalId, currentHospital } = useDashboard();
  const hospitalAlerts = alerts.filter((a) => a.assignedHospitalId === activeHospitalId);
  const criticalCount = hospitalAlerts.filter((a) => a.severity === 'critical').length;

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0d1424] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-600/20 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30 flex items-center justify-center font-black text-xl shadow-sm shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-400/40 px-2.5 py-0.5 rounded-full font-mono">
                CLINICAL ROSTER &amp; INTAKE QUEUE
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{currentHospital.name}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">Emergency Patient Tracking</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Live SBAR pre-arrival dossiers · Real-time NEWS2 vitals stream · Resuscitation bay prep
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-800 text-center shadow-sm">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase">Total In-Flight / ER</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{hospitalAlerts.length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-800 text-center shadow-sm">
            <span className="text-[10px] text-red-600 dark:text-red-400 block uppercase">Critical (NEWS2 ≥ 7)</span>
            <span className="text-xl font-bold text-red-600 dark:text-red-400">{criticalCount}</span>
          </div>
        </div>
      </div>

      {/* Main Queue */}
      <LiveAlertQueue onSelectAlert={(alert) => setSelectedAlert(alert)} />

      {/* Detail Dossier Modal */}
      {selectedAlert && (
        <AlertDetailModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
      )}
    </div>
  );
}
