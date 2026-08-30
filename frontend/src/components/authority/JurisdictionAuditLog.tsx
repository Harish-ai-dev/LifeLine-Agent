'use client';

import React, { useState } from 'react';
import { History, ShieldAlert, Filter, Search, Download, FileText, Clock, ChevronDown, ChevronUp, Lock, Copy, Check } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export const JurisdictionAuditLog: React.FC = () => {
  const { auditLogs } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.alertTrackingNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = eventFilter === 'ALL' || log.eventType === eventFilter;
    return matchesSearch && matchesFilter;
  });

  const copyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-[#0e1424] rounded-3xl p-5 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Jurisdiction-Wide Regulatory Audit Trail</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            Immutable, cross-hospital legal log of all emergency dispatches, Tier 1 reassignments, and Tier 2 Government Authority interventions.
          </p>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold bg-slate-50 dark:bg-[#080d16] text-slate-900 dark:text-white font-mono"
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
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-[#080d16] placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full sm:w-56 font-mono"
          />
        </div>
      </div>

      <div className="space-y-2.5">
        {filteredLogs.map((log) => {
          const isGov =
            log.eventType === 'TIER_2_GOV_ESCALATED' || log.eventType === 'AUTHORITY_INTERVENTION';
          const isExpanded = expandedLogId === log.id;
          const fullHash = `0x${log.id}${log.timestamp.replace(/[^0-9]/g, '')}`;
          const shortHash = `0x${log.id.slice(0, 8)}...`;

          return (
            <div
              key={log.id}
              className={`p-4 rounded-2xl border text-xs flex flex-col space-y-2 transition-colors ${
                isGov
                  ? 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/60'
                  : log.eventType === 'TIER_1_AUTO_REASSIGNED'
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'
                  : 'bg-slate-50 dark:bg-[#111728] border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-indigo-800 dark:text-indigo-300 bg-white dark:bg-[#080d16] border border-indigo-200 dark:border-indigo-800/60 px-2 py-0.5 rounded text-[11px]">
                      {log.alertTrackingNumber}
                    </span>
                    <span
                      className={`font-black uppercase tracking-wider text-[10px] font-mono ${
                        isGov
                          ? 'text-indigo-950 dark:text-indigo-300'
                          : log.eventType === 'TIER_1_AUTO_REASSIGNED'
                          ? 'text-amber-900 dark:text-amber-300'
                          : 'text-slate-900 dark:text-slate-200'
                      }`}
                    >
                      {log.eventType}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">({log.timestamp})</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-300 font-medium font-sans leading-relaxed">{log.description}</p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center font-mono text-[11px] text-slate-500 dark:text-slate-400 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#080d16] border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-lg">
                    {log.actor}
                  </span>
                  <button
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="text-[10px] text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mt-0.5 flex items-center gap-1 transition-colors"
                  >
                    <span>HASH: {shortHash}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 mt-2 space-y-2 animate-in fade-in duration-150">
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-[#080d16] border border-slate-200 dark:border-slate-800 text-[10px] font-mono">
                    <div className="truncate max-w-md">
                      <span className="text-slate-400">SIGNATURE: </span>
                      <span className="text-indigo-700 dark:text-indigo-400 font-bold">{fullHash}</span>
                    </div>
                    <button
                      onClick={() => copyHash(fullHash, log.id)}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-1 font-bold"
                    >
                      {copiedId === log.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === log.id ? 'Copied' : 'Copy Hash'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
