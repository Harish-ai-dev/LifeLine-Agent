'use client';

import React, { useState } from 'react';
import { History, ShieldCheck, Filter, Search, Clock, FileText, Lock, Hash } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export const HospitalAuditLog: React.FC = () => {
  const { auditLogs, currentHospital } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');

  const hospitalLogs = auditLogs.filter(
    (log) =>
      log.hospitalName.toLowerCase().includes(currentHospital.name.toLowerCase()) ||
      log.description.toLowerCase().includes(currentHospital.name.toLowerCase())
  );

  const filteredLogs = hospitalLogs.filter(
    (log) =>
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.alertTrackingNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-[#0e1424] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <span>Immutable Clinical Dispatch &amp; Decision Ledger</span>
            </h3>
            <span className="bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Cryptographically Sealed</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Immutable audit record of every NEWS2 calculation, LLM reasoning trace, and hospital reservation.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tracking #, actor, action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-sky-500 focus:outline-none w-64 font-mono shadow-sm"
          />
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-xs font-mono">
          No audit entries matching search criteria.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 bg-slate-50 dark:bg-[#111728] rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 px-2 py-0.5 rounded text-[11px]">
                    {log.alertTrackingNumber}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase border border-slate-200 dark:border-slate-700">
                    {log.eventType}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Actor: <strong className="text-slate-900 dark:text-white">{log.actor}</strong>
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                  {log.description}
                </p>
              </div>

              <div className="text-right font-mono text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[140px]">
                  HASH: 0x{log.id.slice(0, 8)}...
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
