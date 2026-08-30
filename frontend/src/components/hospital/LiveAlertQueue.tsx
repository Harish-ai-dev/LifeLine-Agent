'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Clock,
  MapPin,
  HeartPulse,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Activity,
  Building2,
  ArrowUpRight,
  Filter,
  Users,
  Search,
  Sparkles,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { EmergencyIncidentAlert, AlertStatus } from '../../types/dashboard';

interface LiveAlertQueueProps {
  onSelectAlert: (alert: EmergencyIncidentAlert) => void;
}

export const LiveAlertQueue: React.FC<LiveAlertQueueProps> = ({ onSelectAlert }) => {
  const { alerts, activeHospitalId, currentHospital, currentUser, acknowledgeAlert, prepareBay } = useDashboard();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter alerts assigned to this hospital
  const hospitalAlerts = alerts.filter((a) => a.assignedHospitalId === activeHospitalId);

  const filteredAlerts = hospitalAlerts.filter((alert) => {
    if (statusFilter === 'pending' && alert.status !== 'pending_ack') return false;
    if (
      statusFilter === 'active' &&
      !['acknowledged', 'bay_preparing', 'bay_ready', 'admitted', 'escalated_gov'].includes(alert.status)
    )
      return false;
    if (statusFilter === 'resolved' && alert.status !== 'resolved') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        alert.trackingNumber.toLowerCase().includes(q) ||
        alert.chiefComplaint.toLowerCase().includes(q) ||
        alert.crisisType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (alert: EmergencyIncidentAlert) => {
    if (alert.status === 'pending_ack') {
      return (
        <span className="bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-500/40 px-2.5 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
          Pending Ack (SLA: {alert.tier1SecondsRemaining}s)
        </span>
      );
    }
    if (alert.status === 'escalated_gov') {
      return (
        <span className="bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-500/40 px-2.5 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider">
          🚨 Tier 2 Authority Escalated
        </span>
      );
    }
    if (alert.status === 'acknowledged') {
      return (
        <span className="bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-500/40 px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
          En Route · ETA {alert.drivingEtaMinutes}m
        </span>
      );
    }
    if (alert.status === 'bay_ready') {
      return (
        <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40 px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
          Bay Ready
        </span>
      );
    }
    if (alert.status === 'admitted') {
      return (
        <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40 px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
          Admitted in ER
        </span>
      );
    }
    return (
      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
        Resolved
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* ── Queue Controls & Filters ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0e1424] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-600/20 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-black text-slate-900 dark:text-white">Live Triage Dispatch Queue</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono block">({filteredAlerts.length} Cases Active)</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search case, complaint, specialty..."
              className="bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 w-56 font-mono"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#080d16] p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono">
            {[
              { id: 'all', label: 'All Alerts' },
              { id: 'pending', label: 'Pending SLA' },
              { id: 'active', label: 'Active Inbound' },
              { id: 'resolved', label: 'Resolved' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === tab.id
                    ? 'bg-white dark:bg-sky-600 text-sky-900 dark:text-white font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Alert Cards List ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white dark:bg-[#0e1424] border border-slate-200 dark:border-slate-800 p-12 text-center rounded-2xl shadow-sm">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No triage cases found for this filter.</p>
            <p className="text-xs text-slate-500 mt-1 font-mono">All incoming emergency cases will appear here live.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isPending = alert.status === 'pending_ack';
            const isCritical = alert.severity === 'critical';

            return (
              <div
                key={alert.id}
                className={`bg-white dark:bg-[#0e1424] border rounded-2xl p-5 transition-all duration-200 shadow-sm ${
                  isPending
                    ? 'border-red-300 dark:border-red-500/50 bg-red-50/70 dark:bg-gradient-to-r dark:from-red-950/30 dark:via-[#0e1424] dark:to-[#0e1424]'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Patient Details */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(alert)}

                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          isCritical
                            ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/40'
                            : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/40'
                        }`}
                      >
                        NEWS2: {alert.news2Score}
                      </span>

                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-bold">
                        {alert.trackingNumber}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{alert.patient.age}yo {alert.patient.gender}</span>
                        <span className="text-slate-400 font-normal">·</span>
                        <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300 uppercase">
                          {alert.crisisType}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                        {alert.chiefComplaint}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400 pt-1">
                      <span className="flex items-center gap-1 text-sky-700 dark:text-sky-400 font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        ETA {alert.drivingEtaMinutes}m ({alert.distanceKm} km)
                      </span>
                      <span>Assigned Bay: <strong className="text-slate-900 dark:text-white">{alert.reservedBayId || 'BAY-EM1'}</strong></span>
                      <span className="text-slate-500">Origin: {alert.location?.address || 'Field Location'}</span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                    {isPending && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id, currentUser?.username)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-md shadow-red-600/30 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Acknowledge SLA</span>
                      </button>
                    )}

                    <button
                      onClick={() => prepareBay(alert.id, alert.reservedBayId || 'BAY-EM1', currentUser?.username)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-mono font-bold transition-colors border border-slate-200 dark:border-slate-700"
                    >
                      Prep Bay
                    </button>

                    <button
                      onClick={() => onSelectAlert(alert)}
                      className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 dark:bg-sky-600/20 dark:hover:bg-sky-600/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/40 rounded-xl text-xs font-mono font-bold transition-colors flex items-center gap-1"
                    >
                      <span>Full Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
