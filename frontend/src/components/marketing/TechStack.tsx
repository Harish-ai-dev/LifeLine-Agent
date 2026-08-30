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
import { TECH_STACK } from '@/data/marketing/techStack';

export const TechStack: React.FC = () => {
  const categories = ['AI & Models', 'Backend & Cloud', 'Geospatial & Clinical', 'Frontend', 'Database & Storage'] as const;

  return (
    <section id="tech-stack" className="py-24 bg-[#F8FAFC] relative border-t border-slate-200 scroll-mt-20">
      <div id="architecture" />

      <div className="w-full px-2 sm:px-4 lg:px-6 px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono uppercase tracking-wider mb-4">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Modern Systems Architecture</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Production-grade tech stack & protocols.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 font-sans">
            Engineered with Google Gemini frontier AI models, high-performance C++ OSRM routing, serverless Cloud Run scaling, and Royal College of Physicians clinical protocols.
          </p>
        </div>

        {/* Architecture Flow Banner */}
        <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md w-full">
          <div className="text-center mb-6">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-700 font-bold">System Data Flow & Agent Mesh</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-8 h-8 mx-auto rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 mb-2 font-bold">
                1
              </div>
              <div className="font-bold text-slate-900 mb-1">Ingest Layer</div>
              <p className="text-[11px] text-slate-500 font-sans">EMS Bluetooth vitals, 12-lead ECG, encrypted WebSocket</p>
            </div>

            <div className="p-4 rounded-xl bg-cyan-50/40 border border-cyan-200/80 shadow-sm shadow-cyan-100/50">
              <div className="w-8 h-8 mx-auto rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 mb-2 font-bold">
                2
              </div>
              <div className="font-bold text-cyan-800 mb-1">Gemini Swarm</div>
              <p className="text-[11px] text-slate-500 font-sans">Triage (3.1 Pro), Bed-Match (3.5 Flash), Briefing (3.5 Flash)</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-8 h-8 mx-auto rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 mb-2 font-bold">
                3
              </div>
              <div className="font-bold text-slate-900 mb-1">Geospatial OSRM</div>
              <p className="text-[11px] text-slate-500 font-sans">Real street network matrices, emergency siren calibration</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-8 h-8 mx-auto rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 mb-2 font-bold">
                4
              </div>
              <div className="font-bold text-slate-900 mb-1">Sovereign Stream</div>
              <p className="text-[11px] text-slate-500 font-sans">Trauma screens, EMS tablet, Gov Authority daily reports</p>
            </div>
          </div>
        </div>

        {/* Tech Badges by Category */}
        <div className="mt-16 w-full space-y-8">
          {categories.map((cat) => {
            const items = TECH_STACK.filter((t) => t.category === cat);
            if (items.length === 0) return null;

            return (
              <div key={cat} className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span>{cat}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors flex items-start justify-between shadow-sm"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-sm text-slate-900">{item.name}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-cyan-700 text-[10px] font-mono font-bold">
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-xs text-cyan-700 font-mono mt-0.5 font-semibold">{item.role}</p>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed font-sans">{item.description}</p>
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
