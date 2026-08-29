import React, { useState } from 'react';
import { History, ShieldCheck, Filter, Search, Clock, FileText } from 'lucide-react';
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
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-sky-600" />
            <span>Facility Dispatch & Response Audit Log</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable, timestamped record of emergency acknowledgements, triage actions, and bed allocations.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none w-64"
          />
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-xs">
          No audit entries matching search criteria.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded">
                    {log.alertTrackingNumber}
                  </span>
                  <span className="font-extrabold text-slate-900">{log.eventType}</span>
                  <span className="text-slate-400 font-mono">({log.timestamp})</span>
                </div>
                <p className="text-slate-700">{log.description}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                  {log.actor}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
