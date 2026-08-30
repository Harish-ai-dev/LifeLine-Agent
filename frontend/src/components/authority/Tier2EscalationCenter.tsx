import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Radio,
  Building2,
  Clock,
  ArrowRightLeft,
  FileCheck,
  CheckCircle2,
  MapPin,
  HeartPulse,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { EmergencyIncidentAlert } from '../../types/dashboard';

export const Tier2EscalationCenter: React.FC = () => {
  const { alerts, hospitals, authorityIntervene, authorityRole } = useDashboard();

  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [targetHospId, setTargetHospId] = useState<string>(hospitals[0].id);
  const [directiveNotes, setDirectiveNotes] = useState<string>(
    'Authority Directive: Immediate Level 1 Tertiary Re-Route. Mandatory priority intake authorized by Regional Director.'
  );

  const escalatedAlerts = alerts.filter(
    (a) => a.status === 'escalated_gov' || a.isTier2Escalated
  );

  const handleIntervene = (alertId: string) => {
    authorityIntervene(alertId, targetHospId, directiveNotes, 'Senior Authority Director');
    setSelectedIncidentId(null);
  };

  return (
    <div className="space-y-6">
      {/* Escalation Alert Hero */}
      <div className="bg-gradient-to-r from-alert-950 via-slate-900 to-indigo-950 border-2 border-alert-600 rounded-3xl p-6 sm:p-7 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-alert-600/30 text-alert-400 border border-alert-500/50 flex items-center justify-center font-black text-2xl shadow-lg shrink-0 animate-pulse">
              <ShieldAlert className="w-8 h-8 text-alert-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-alert-600 text-white px-2.5 py-0.5 rounded-full">
                  TIER 2 ESCALATION PROTOCOL ACTIVE
                </span>
                <span className="text-xs text-alert-300 font-bold">
                  {escalatedAlerts.length} Critical Case(s) Requiring Authority Intervention
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                Regional Escalation of Last Resort
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                When assigned hospitals fail to acknowledge emergency alerts within standard SLA grace periods, the system automatically escalates the incident directly to Government Health Authority monitors for mandatory re-assignment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Escalated Queue List */}
      {escalatedAlerts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Zero Unresolved Escalations</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            All regional hospitals are currently meeting their Tier 1 response SLA. No incidents require Government Authority intervention.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {escalatedAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white rounded-3xl p-6 border-2 border-alert-300 shadow-md space-y-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-alert-600 text-white text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      MISSED HOSPITAL SLA
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700">
                      {alert.trackingNumber}
                    </span>
                    <span className="text-xs text-slate-400">· Escalated at {alert.escalatedToGovAt}</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {alert.patient.fullName}, {alert.patient.age}yo {alert.patient.gender} — {alert.chiefComplaint}
                  </h3>
                  <p className="text-xs text-alert-700 font-semibold mt-1">
                    ⚠️ {alert.escalationReason || 'Initial hospital failed to acknowledge within SLA time limit.'}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-slate-500 block">NEWS2 Score</span>
                  <span className="text-2xl font-black text-alert-600 font-mono">
                    {alert.news2Score}/20 ({alert.news2RiskBand.toUpperCase()})
                  </span>
                </div>
              </div>

              {/* Patient & Location details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 font-bold block mb-1">Location Coordinates</span>
                  <p className="font-bold text-slate-800">{alert.location.address}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 font-bold block mb-1">Medical Profile</span>
                  <p className="text-slate-800">
                    <strong>Blood:</strong> {alert.patient.bloodType} · <strong>Allergies:</strong>{' '}
                    {alert.patient.allergies.join(', ')}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 font-bold block mb-1">Assigned / Failed Facilities</span>
                  <p className="text-slate-800">
                    <strong>Current:</strong>{' '}
                    {hospitals.find((h) => h.id === alert.assignedHospitalId)?.name || 'Unassigned'}
                  </p>
                </div>
              </div>

              {/* Authority Directive Controls */}
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-900">
                    Authority Intervention Action
                  </h4>
                  <p className="text-xs text-indigo-700">
                    Issue a mandatory ministerial directive to force immediate intake at a designated Level 1 center.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={targetHospId}
                    onChange={(e) => setTargetHospId(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-indigo-300 text-xs font-bold text-slate-800 bg-white"
                  >
                    {hospitals
                      .filter((h) => h.status === 'active')
                      .map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name} ({h.availableTraumaBays} Bays Free)
                        </option>
                      ))}
                  </select>

                  <button
                    onClick={() => handleIntervene(alert.id)}
                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition"
                  >
                    Issue Mandatory Reassignment
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
