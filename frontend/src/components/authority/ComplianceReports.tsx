import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export const ComplianceReports: React.FC = () => {
  const { hospitals, analytics } = useDashboard();
  const [downloaded, setDownloaded] = useState(false);

  const handleExportCsv = () => {
    const headers = 'Hospital Name,District,Tier,Total Alerts,SLA Compliance (%),Mean Response (s),Missed Alerts,ICU Available\n';
    const rows = hospitals
      .map(
        (h) =>
          `"${h.name}","${h.district}","${h.tier}",${h.totalAlertsHandled},${h.complianceRate}%,${h.slaResponseTimeSec}s,${h.missedAlertsCount},${h.availableIcuBeds}/${h.totalIcuBeds}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `LifeLine_Hospital_Compliance_Report_Region_IV_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            <span>Regional Hospital Performance & SLA Compliance Audit</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Official regulatory response metrics and accountability records for all hospitals in Region IV.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>{downloaded ? 'Report Downloaded!' : 'Export Regulatory CSV'}</span>
          </button>
        </div>
      </div>

      {/* ── KPI Summary Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
          <span className="text-slate-500 font-bold block">District SLA Adherence</span>
          <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">
            {analytics.jurisdictionSlaCompliance}%
          </span>
          <span className="text-[10px] text-slate-400">Target: &ge; 95.0%</span>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
          <span className="text-slate-500 font-bold block">Mean Response Time</span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
            {analytics.meanResponseTimeSec}s
          </span>
          <span className="text-[10px] text-slate-400">Target: &le; 60s</span>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
          <span className="text-slate-500 font-bold block">Registered Facilities</span>
          <span className="text-2xl font-black text-sky-700 font-mono mt-1 block">
            {hospitals.length} Centers
          </span>
          <span className="text-[10px] text-slate-400">100% Monitored</span>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
          <span className="text-slate-500 font-bold block">Tier 2 Escalations (YTD)</span>
          <span className="text-2xl font-black text-alert-600 font-mono mt-1 block">
            {analytics.tier2EscalationCount}
          </span>
          <span className="text-[10px] text-alert-500 font-bold">Investigated</span>
        </div>
      </div>

      {/* ── Detailed Hospital Compliance Table ───────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
              <th className="py-3 px-4 rounded-l-xl">Hospital Facility</th>
              <th className="py-3 px-3">Accreditation Tier</th>
              <th className="py-3 px-3 text-center">Alerts Handled</th>
              <th className="py-3 px-3 text-center">Mean Response</th>
              <th className="py-3 px-3 text-center">Missed SLA</th>
              <th className="py-3 px-3 text-center">Compliance %</th>
              <th className="py-3 px-4 text-center rounded-r-xl">Regulatory Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {hospitals.map((hosp) => {
              const isCompliant = hosp.complianceRate >= 95.0;
              return (
                <tr key={hosp.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div>{hosp.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{hosp.code} · {hosp.district}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{hosp.tier}</td>
                  <td className="py-3 px-3 text-center font-mono font-bold">{hosp.totalAlertsHandled}</td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                    {hosp.slaResponseTimeSec}s
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-alert-600">
                    {hosp.missedAlertsCount}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`font-mono font-black ${
                        isCompliant ? 'text-emerald-700' : 'text-alert-600'
                      }`}
                    >
                      {hosp.complianceRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {isCompliant ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Compliant (Grade A)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-alert-50 text-alert-800 border border-alert-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <AlertTriangle className="w-3 h-3 text-alert-600" />
                        Audit Review Required
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
