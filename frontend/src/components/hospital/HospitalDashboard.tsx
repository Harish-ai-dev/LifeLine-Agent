import React, { useState } from 'react';
import {
  Building2,
  BedDouble,
  ShieldAlert,
  Clock,
  Activity,
  History,
  AlertTriangle,
  CheckCircle2,
  Users,
  Radio,
  Droplet,
  Navigation,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { LiveAlertQueue } from './LiveAlertQueue';
import { CapacityManager } from './CapacityManager';
import { HospitalBloodBank } from './HospitalBloodBank';
import { DonorNotificationPanel } from './DonorNotificationPanel';
import { HospitalAuditLog } from './HospitalAuditLog';
import { AlertDetailModal } from './AlertDetailModal';
import { EmergencyIncidentAlert } from '../../types/dashboard';

export const HospitalDashboard: React.FC = () => {
  const { currentHospital, alerts, activeHospitalId, selectedAlert, setSelectedAlert, donorRequests } =
    useDashboard();

  const [activeTab, setActiveTab] = useState<
    'queue' | 'blood_bank' | 'donor_activity' | 'capacity' | 'audit'
  >('queue');

  // Stats for current hospital
  const hospitalAlerts = alerts.filter((a) => a.assignedHospitalId === activeHospitalId);
  const pendingCount = hospitalAlerts.filter((a) => a.status === 'pending_ack').length;

  // Active inbound donors for THIS hospital
  const hospitalRequests = donorRequests.filter((r) => r.hospitalId === activeHospitalId);
  const inboundDonorsCount = hospitalRequests.reduce(
    (acc, req) =>
      acc +
      req.matchedDonors.filter((d) =>
        ['en_route', 'arrived', 'accepted'].includes(d.responseStatus)
      ).length,
    0
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16">
      {/* ── Top Facility Banner & Live Status Indicators ─────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-600/20 text-sky-400 border border-sky-500/40 flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
              🏥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-sky-500/30 text-sky-300 border border-sky-400/40 px-2 py-0.5 rounded">
                  {currentHospital.tier}
                </span>
                <span className="text-xs font-mono text-slate-400">{currentHospital.code}</span>
                {currentHospital.isDiverting && (
                  <span className="text-[10px] font-black uppercase bg-alert-600 text-white px-2 py-0.5 rounded animate-pulse">
                    On Diversion
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                {currentHospital.name}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentHospital.address} · Emergency Direct: <strong className="text-sky-300">{currentHospital.emergencyPhone}</strong>
              </p>
            </div>
          </div>

          {/* Quick Real-Time Status Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Active Emergencies</span>
              <span className="text-2xl font-black text-white font-mono">{hospitalAlerts.length}</span>
              {pendingCount > 0 && (
                <span className="text-[10px] text-alert-400 font-bold block mt-0.5 animate-pulse">
                  {pendingCount} Pending SLA
                </span>
              )}
            </div>

            <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Available ICU Beds</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {currentHospital.availableIcuBeds}
              </span>
              <span className="text-[10px] text-slate-400 block">/ {currentHospital.totalIcuBeds} Beds</span>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Trauma Bays Free</span>
              <span className="text-2xl font-black text-sky-300 font-mono">
                {currentHospital.availableTraumaBays}
              </span>
              <span className="text-[10px] text-slate-400 block">/ {currentHospital.totalTraumaBays} Bays</span>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Inbound Donors</span>
              <span className="text-2xl font-black text-rose-300 font-mono">
                {inboundDonorsCount}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold block">
                Live Responders
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sub-Navigation Tabs ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition ${
            activeTab === 'queue'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4 text-sky-500" />
          <span>Emergency Triage Queue</span>
          {pendingCount > 0 && (
            <span className="bg-alert-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('blood_bank')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition ${
            activeTab === 'blood_bank'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Droplet className="w-4 h-4 text-rose-500 fill-rose-500" />
          <span>Blood Bank Inventory</span>
        </button>

        <button
          onClick={() => setActiveTab('donor_activity')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition ${
            activeTab === 'donor_activity'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
          <span>Inbound Donors Feed</span>
          {inboundDonorsCount > 0 && (
            <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
              {inboundDonorsCount} Live
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('capacity')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition ${
            activeTab === 'capacity'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BedDouble className="w-4 h-4 text-emerald-500" />
          <span>Bed & Bay Inventory</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition ${
            activeTab === 'audit'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4 text-amber-500" />
          <span>Facility Audit Log</span>
        </button>
      </div>

      {/* ── Tab Views ────────────────────────────────────────────────────── */}
      {activeTab === 'queue' && <LiveAlertQueue onSelectAlert={(alert) => setSelectedAlert(alert)} />}
      {activeTab === 'blood_bank' && <HospitalBloodBank />}
      {activeTab === 'donor_activity' && <DonorNotificationPanel />}
      {activeTab === 'capacity' && <CapacityManager />}
      {activeTab === 'audit' && <HospitalAuditLog />}

      {/* ── Clinical Alert Dossier Modal ─────────────────────────────────── */}
      {selectedAlert && (
        <AlertDetailModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
      )}
    </div>
  );
};
