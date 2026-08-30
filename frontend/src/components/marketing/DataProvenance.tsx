'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Database,
  Search,
  ExternalLink,
  Info
} from 'lucide-react';
import { DATA_PROVENANCE_ROWS, ProvenanceRow } from '@/data/marketing/transparency';

export const DataProvenance: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredRows = DATA_PROVENANCE_ROWS.filter((row) => {
    const matchesFilter = filterType === 'ALL' || row.sourceType === filterType;
    const matchesSearch = row.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          row.dataSource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          row.rationale.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <section id="real-vs-simulated" className="py-24 bg-[#F8FAFC] relative border-t border-slate-200 scroll-mt-20">
      <div id="provenance" />

      <div className="w-full px-2 sm:px-4 lg:px-6 px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono uppercase tracking-wider mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Honest Data Provenance</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Real vs. Simulated Data Matrix
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-655 font-sans">
            We are completely transparent about data provenance. Hospital locations, street routing networks, and NEWS2 clinical scoring are 100% real. Protected health information and bed occupancies are simulated safely.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                filterType === 'ALL'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              All Items ({DATA_PROVENANCE_ROWS.length})
            </button>
            <button
              onClick={() => setFilterType('REAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                filterType === 'REAL'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              Real Live Data
            </button>
            <button
              onClick={() => setFilterType('SIMULATED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                filterType === 'SIMULATED'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              Simulated Data
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter data provenance..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-900 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Matrix Table Card */}
        <div className="mt-6 w-full rounded-2xl bg-white border border-slate-200 shadow-md shadow-slate-100/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Data Layer & Field</th>
                  <th className="py-3.5 px-4 font-semibold">Classification</th>
                  <th className="py-3.5 px-4 font-semibold">Live Data Source</th>
                  <th className="py-3.5 px-4 font-semibold">Engineering & Safety Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {filteredRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {row.field}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {row.sourceType === 'REAL' && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-250 text-emerald-700 font-bold text-[10px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>100% LIVE REAL</span>
                        </span>
                      )}
                      {row.sourceType === 'SIMULATED' && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-250 text-amber-700 font-bold text-[10px]">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>SIMULATED MODEL</span>
                        </span>
                      )}
                      {row.sourceType === 'SYNTHETIC' && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-250 text-purple-700 font-bold text-[10px]">
                          <Database className="w-3.5 h-3.5 text-purple-600" />
                          <span>HIPAA SYNTHETIC</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-cyan-700 font-bold">
                      {row.dataSource}
                    </td>
                    <td className="py-4 px-4 text-slate-600 max-w-xs sm:max-w-md">
                      <p>{row.rationale}</p>
                      <p className="text-[11px] text-slate-500 mt-1 italic font-bold">
                        Verification: {row.verificationMethod}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
