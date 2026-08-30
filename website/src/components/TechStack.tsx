import React from 'react';
import { 
  Layers, 
  Cpu, 
  Database, 
  Globe, 
  ShieldCheck, 
  ExternalLink,
  Zap,
  Server,
  Activity
} from 'lucide-react';
import { TECH_STACK } from '../data/techStack';

export const TechStack: React.FC = () => {
  const categories = ['AI & Models', 'Backend & Cloud', 'Geospatial & Clinical', 'Frontend', 'Database & Storage'] as const;

  return (
    <section id="tech-stack" className="py-24 bg-[#080E1A] relative border-t border-slate-900 scroll-mt-20">
      <div id="architecture" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-mono uppercase tracking-wider mb-4">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Modern Systems Architecture</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Production-grade tech stack & protocols.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300 font-sans">
            Engineered with Google Gemini frontier AI models, high-performance C++ OSRM routing, serverless Cloud Run scaling, and Royal College of Physicians clinical protocols.
          </p>
        </div>

        {/* Architecture Flow Banner */}
        <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-[#0B1120] border border-cyan-950/80 shadow-2xl max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">System Data Flow & Agent Mesh</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="w-8 h-8 mx-auto rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-2">
                1
              </div>
              <div className="font-bold text-white mb-1">Ingest Layer</div>
              <p className="text-[11px] text-slate-400 font-sans">EMS Bluetooth vitals, 12-lead ECG, encrypted WebSocket</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-900/60 shadow-lg shadow-cyan-950/20">
              <div className="w-8 h-8 mx-auto rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-2">
                2
              </div>
              <div className="font-bold text-cyan-300 mb-1">Gemini Swarm</div>
              <p className="text-[11px] text-slate-400 font-sans">Triage (3.1 Pro), Bed-Match (3.5 Flash), Briefing (3.5 Flash)</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="w-8 h-8 mx-auto rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-2">
                3
              </div>
              <div className="font-bold text-white mb-1">Geospatial OSRM</div>
              <p className="text-[11px] text-slate-400 font-sans">Real street network matrices, emergency siren calibration</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="w-8 h-8 mx-auto rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-2">
                4
              </div>
              <div className="font-bold text-white mb-1">Sovereign Stream</div>
              <p className="text-[11px] text-slate-400 font-sans">Trauma screens, EMS tablet, Gov Authority daily reports</p>
            </div>
          </div>
        </div>

        {/* Tech Badges by Category */}
        <div className="mt-16 max-w-5xl mx-auto space-y-8">
          {categories.map((cat) => {
            const items = TECH_STACK.filter((t) => t.category === cat);
            if (items.length === 0) return null;

            return (
              <div key={cat} className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>{cat}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 transition-colors flex items-start justify-between"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-sm text-white">{item.name}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 text-[10px] font-mono">
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-xs text-cyan-400 font-mono mt-0.5">{item.role}</p>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed font-sans">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
