import React, { useState } from 'react';
import { History, ShieldAlert, Filter, Search, Download, FileText } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export const JurisdictionAuditLog: React.FC = () => {
  const { auditLogs } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.alertTrackingNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = eventFilter === 'ALL' || log.eventType === eventFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <span>Jurisdiction-Wide Regulatory Audit Trail</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable, cross-hospital legal log of all emergency dispatches, Tier 1 reassignments, and Tier 2 Government Authority interventions.
          </p>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
          >
            <option value="ALL">All Event Types</option>
            <option value="AUTO_ROUTED">Auto-Routed</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="TIER_1_AUTO_REASSIGNED">Tier 1 Reassigned</option>
            <option value="TIER_2_GOV_ESCALATED">Tier 2 Escalated</option>
            <option value="AUTHORITY_INTERVENTION">Authority Interventions</option>
          </select>

          <input
            type="text"
            placeholder="Search audit records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none w-56"
          />
        </div>
      </div>

      <div className="space-y-2.5">
        {filteredLogs.map((log) => {
          const isGov =
            log.eventType === 'TIER_2_GOV_ESCALATED' || log.eventType === 'AUTHORITY_INTERVENTION';

          return (
            <div
              key={log.id}
              className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isGov
                  ? 'bg-indigo-50/60 border-indigo-200'
                  : log.eventType === 'TIER_1_AUTO_REASSIGNED'
                  ? 'bg-amber-50/60 border-amber-200'
                  : 'bg-slate-50 border-slate-200/80'
              }`}
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-indigo-800 bg-white border border-indigo-200 px-2 py-0.5 rounded">
                    {log.alertTrackingNumber}
                  </span>
                  <span
                    className={`font-black uppercase tracking-wider ${
                      isGov
                        ? 'text-indigo-950'
                        : log.eventType === 'TIER_1_AUTO_REASSIGNED'
                        ? 'text-amber-900'
                        : 'text-slate-900'
                    }`}
                  >
                    {log.eventType}
                  </span>
                  <span className="text-slate-400 font-mono">({log.timestamp})</span>
                </div>
                <p className="text-slate-800 font-medium">{log.description}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                  {log.actor}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
