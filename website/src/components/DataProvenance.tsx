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
import { DATA_PROVENANCE_ROWS, ProvenanceRow } from '../data/transparency';

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
    <section id="real-vs-simulated" className="py-24 bg-[#0B1120] relative border-t border-slate-900 scroll-mt-20">
      <div id="provenance" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-mono uppercase tracking-wider mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Honest Data Provenance</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Real vs. Simulated Data Matrix
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300 font-sans">
            We are completely transparent about data provenance. Hospital locations, street routing networks, and NEWS2 clinical scoring are 100% real. Protected health information and bed occupancies are simulated safely.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                filterType === 'ALL'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              All Items ({DATA_PROVENANCE_ROWS.length})
            </button>
            <button
              onClick={() => setFilterType('REAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                filterType === 'REAL'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              Real Live Data
            </button>
            <button
              onClick={() => setFilterType('SIMULATED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                filterType === 'SIMULATED'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
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
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Matrix Table Card */}
        <div className="mt-6 max-w-5xl mx-auto rounded-2xl bg-[#0F172A] border border-slate-800 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Data Layer & Field</th>
                  <th className="py-3.5 px-4 font-semibold">Classification</th>
                  <th className="py-3.5 px-4 font-semibold">Live Data Source</th>
                  <th className="py-3.5 px-4 font-semibold">Engineering & Safety Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filteredRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-white">
                      {row.field}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {row.sourceType === 'REAL' && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>100% LIVE REAL</span>
                        </span>
                      )}
                      {row.sourceType === 'SIMULATED' && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-800 text-amber-300 font-bold text-[10px]">
                          <AlertCircle className="w-3 h-3 text-amber-400" />
                          <span>SIMULATED MODEL</span>
                        </span>
                      )}
                      {row.sourceType === 'SYNTHETIC' && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-purple-950/80 border border-purple-800 text-purple-300 font-bold text-[10px]">
                          <Database className="w-3 h-3 text-purple-400" />
                          <span>HIPAA SYNTHETIC</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-cyan-300">
                      {row.dataSource}
                    </td>
                    <td className="py-4 px-4 text-slate-400 max-w-xs sm:max-w-md">
                      <p>{row.rationale}</p>
                      <p className="text-[11px] text-slate-500 mt-1 italic">
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
