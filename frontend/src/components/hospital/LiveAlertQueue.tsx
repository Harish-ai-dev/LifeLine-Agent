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
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { EmergencyIncidentAlert, AlertStatus } from '../../types/dashboard';

interface LiveAlertQueueProps {
  onSelectAlert: (alert: EmergencyIncidentAlert) => void;
}

export const LiveAlertQueue: React.FC<LiveAlertQueueProps> = ({ onSelectAlert }) => {
  const { alerts, activeHospitalId, currentHospital, acknowledgeAlert, prepareBay } = useDashboard();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'resolved'>('all');

  // Filter alerts assigned to this hospital (or all if specified)
  const hospitalAlerts = alerts.filter((a) => a.assignedHospitalId === activeHospitalId);

  const filteredAlerts = hospitalAlerts.filter((alert) => {
    if (statusFilter === 'pending') return alert.status === 'pending_ack';
    if (statusFilter === 'active')
      return ['acknowledged', 'bay_preparing', 'bay_ready', 'admitted', 'escalated_gov'].includes(
        alert.status
      );
    if (statusFilter === 'resolved') return alert.status === 'resolved';
    return true;
  });

  const getStatusBadge = (alert: EmergencyIncidentAlert) => {
    if (alert.status === 'pending_ack') {
      return (
        <span className="bg-alert-100 text-alert-800 border border-alert-300 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-alert-600 animate-ping" />
          Pending Ack (SLA: {alert.tier1SecondsRemaining}s)
        </span>
      );
    }
    if (alert.status === 'escalated_gov') {
      return (
        <span className="bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
          🚨 Tier 2 Authority Escalated
        </span>
      );
    }
    if (alert.status === 'acknowledged') {
      return (
        <span className="bg-sky-100 text-sky-800 border border-sky-300 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          En Route · ETA {alert.drivingEtaMinutes}m
        </span>
      );
    }
    if (alert.status === 'bay_ready') {
      return (
        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          Resuscitation Bay Ready
        </span>
      );
    }
    if (alert.status === 'admitted') {
      return (
        <span className="bg-indigo-100 text-indigo-800 border border-indigo-300 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          Patient Admitted in ER
        </span>
      );
    }
    return (
      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
        Resolved
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* ── Queue Controls & Filters ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-600" />
          <span className="text-sm font-black text-slate-900">Live Triage Dispatch Feed</span>
          <span className="text-xs text-slate-500 font-medium">({filteredAlerts.length} Cases)</span>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          {(
            [
              { id: 'all', label: 'All Alerts' },
              { id: 'pending', label: 'Pending SLA' },
              { id: 'active', label: 'Active In-Bay' },
              { id: 'resolved', label: 'Resolved' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Alerts List ──────────────────────────────────────────────────── */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Active Emergency Alerts</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Emergency department queue is currently clear for {currentHospital.name}. New alerts auto-route here in real-time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const isPending = alert.status === 'pending_ack';
            const isCritical = alert.severity === 'critical';

            return (
              <div
                key={alert.id}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition shadow-sm hover:shadow-md ${
                  isPending
                    ? 'border-alert-400/90 ring-2 ring-alert-500/20 bg-alert-50/10'
                    : 'border-slate-200/90'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Patient & Clinical Info */}
                  <div className="flex items-start gap-3.5">
                    {/* Severity Icon Box */}
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black shrink-0 ${
                        isCritical
                          ? 'bg-alert-600 text-white shadow-md shadow-alert-600/30'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      <HeartPulse className="w-5 h-5 animate-pulse" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="text-base font-black text-slate-900">
                          {alert.patient.fullName} ({alert.patient.age}yo {alert.patient.gender})
                        </h4>
                        <span className="bg-slate-100 text-slate-700 font-mono text-[11px] font-bold px-2 py-0.5 rounded">
                          {alert.patient.bloodType}
                        </span>
                        {getStatusBadge(alert)}
                      </div>

                      <p className="text-xs font-semibold text-slate-800 leading-tight">
                        {alert.chiefComplaint}
                      </p>

                      {/* Location & Meta */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-sky-600" />
                          {alert.location.address}
                        </span>
                        <span>·</span>
                        <span className="font-mono text-slate-700 font-bold">
                          NEWS2 Score: {alert.news2Score}/20 ({alert.news2RiskBand.toUpperCase()})
                        </span>
                        <span>·</span>
                        <span className="text-slate-500 font-mono">{alert.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions & SLA Countdown */}
                  <div className="flex flex-wrap items-center gap-2.5 self-end lg:self-center">
                    {/* If Pending Ack: Large Acknowledge Button */}
                    {isPending && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="flex items-center gap-1.5 py-2.5 px-4 bg-alert-600 hover:bg-alert-700 active:bg-alert-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-alert-600/30 transition touch-target"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Acknowledge ({alert.tier1SecondsRemaining}s)</span>
                      </button>
                    )}

                    {alert.status === 'acknowledged' && (
                      <button
                        onClick={() => prepareBay(alert.id, 'Resuscitation Bay 1')}
                        className="flex items-center gap-1.5 py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Ready Bay 1</span>
                      </button>
                    )}

                    <button
                      onClick={() => onSelectAlert(alert)}
                      className="flex items-center gap-1 py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition"
                    >
                      <span>Clinical Dossier</span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>

                {/* Tier 1 SLA Progress Bar if Pending Ack */}
                {isPending && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] font-bold text-alert-700 mb-1">
                      <span>Tier 1 SLA Acknowledgement Timeout (Auto-Reassigns if expired)</span>
                      <span className="font-mono font-black">{alert.tier1SecondsRemaining}s remaining</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-alert-600 h-full transition-all duration-1000 ease-linear"
                        style={{ width: `${(alert.tier1SecondsRemaining / alert.tier1TimeoutSec) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
