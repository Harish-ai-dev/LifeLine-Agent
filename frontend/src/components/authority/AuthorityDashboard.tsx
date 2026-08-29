import React, { useState } from 'react';
import {
  Landmark,
  ShieldAlert,
  Navigation,
  FileSpreadsheet,
  Building2,
  History,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { JURISDICTION_NAME } from '../../data/mockDashboardData';
import { JurisdictionMap } from './JurisdictionMap';
import { Tier2EscalationCenter } from './Tier2EscalationCenter';
import { RegionalBloodNetwork } from './RegionalBloodNetwork';
import { ComplianceReports } from './ComplianceReports';
import { HospitalRegistry } from './HospitalRegistry';
import { JurisdictionAuditLog } from './JurisdictionAuditLog';

export const AuthorityDashboard: React.FC = () => {
  const { analytics, alerts, hospitals, donorRequests } = useDashboard();
  const [activeTab, setActiveTab] = useState<
    'radar' | 'escalations' | 'compliance' | 'blood_network' | 'registry' | 'audit'
  >('radar');

  const escalatedCount = alerts.filter(
    (a) => a.status === 'escalated_gov' || a.isTier2Escalated
  ).length;

  const activeIncidentsCount = alerts.filter((a) => a.status !== 'resolved').length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16">
      {/* ── Government Authority Header Banner ────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-indigo-800/60 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 text-indigo-300 border border-indigo-400/40 flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 px-2 py-0.5 rounded">
                  REGULATORY HEALTH SURVEILLANCE
                </span>
                <span className="text-xs font-mono text-slate-300">GOV-REG-IV</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                {JURISDICTION_NAME}
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Central Medical Oversight, Cross-Hospital Auto-Routing & Escalation Command Deck
              </p>
            </div>
          </div>

          {/* Regional Oversight KPI Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="bg-slate-900/80 p-3 rounded-2xl border border-indigo-900">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                Regional Active Alerts
              </span>
              <span className="text-2xl font-black text-white font-mono">{activeIncidentsCount}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Across 6 Centers</span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-2xl border border-indigo-900">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                Regional SLA Adherence
              </span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {analytics.jurisdictionSlaCompliance}%
              </span>
              <span className="text-[10px] text-emerald-300 font-bold block">Target: &gt;95%</span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-2xl border border-indigo-900">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                Mean Response Time
              </span>
              <span className="text-2xl font-black text-amber-300 font-mono">
                {analytics.meanResponseTimeSec}s
              </span>
              <span className="text-[10px] text-slate-400 block">District Average</span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-2xl border border-indigo-900">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                Tier 2 Escalations
              </span>
              <span className="text-2xl font-black text-alert-400 font-mono">
                {escalatedCount}
              </span>
              {escalatedCount > 0 ? (
                <span className="text-[10px] text-alert-400 font-black block animate-pulse">
                  Action Required
                </span>
              ) : (
                <span className="text-[10px] text-emerald-400 font-bold block">All Clear</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sub-Navigation Tabs ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('radar')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition ${
            activeTab === 'radar'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Navigation className="w-4 h-4 text-indigo-400" />
          <span>Regional Proximity Radar</span>
        </button>

        <button
          onClick={() => setActiveTab('escalations')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition ${
            activeTab === 'escalations'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-alert-500" />
          <span>Tier 2 Escalation Center</span>
          {escalatedCount > 0 && (
            <span className="bg-alert-600 text-white text-[10px] font-black px-2 py-0.2 rounded-full animate-ping">
              {escalatedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('blood_network')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition ${
            activeTab === 'blood_network'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4 text-rose-500" />
          <span>Blood & Organ Network</span>
          {donorRequests.length > 0 && (
            <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {donorRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('compliance')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition ${
            activeTab === 'compliance'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
          <span>Hospital Compliance & Reports</span>
        </button>

        <button
          onClick={() => setActiveTab('registry')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition ${
            activeTab === 'registry'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4 text-sky-500" />
          <span>Hospital Registry</span>
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
          <span>Regulatory Audit Log</span>
        </button>
      </div>

      {/* ── Active Tab View ──────────────────────────────────────────────── */}
      {activeTab === 'radar' && <JurisdictionMap />}
      {activeTab === 'escalations' && <Tier2EscalationCenter />}
      {activeTab === 'blood_network' && <RegionalBloodNetwork />}
      {activeTab === 'compliance' && <ComplianceReports />}
      {activeTab === 'registry' && <HospitalRegistry />}
      {activeTab === 'audit' && <JurisdictionAuditLog />}
    </div>
  );
};
