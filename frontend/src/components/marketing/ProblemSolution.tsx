import React from 'react';
import { 
  PhoneOff, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  Radio, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Activity, 
  HeartHandshake
} from 'lucide-react';

export const ProblemSolution: React.FC = () => {
  return (
    <section id="problem" className="py-24 bg-[#F8FAFC] relative border-t border-slate-200 scroll-mt-20 w-full">
      <div className="w-full w-full px-2 sm:px-4 lg:px-6 px-4 sm:px-6 lg:px-8 xl:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-mono uppercase tracking-wider mb-4">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>The Golden Hour Crisis</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Why manual emergency dispatch is dangerously slow.
          </h2>
          
          <p className="mt-4 text-base sm:text-lg text-slate-600 font-sans">
            When minutes determine irreversible brain damage or cardiac necrosis, emergency communication still relies on 1980s telephone chains, scratchpad notes, and hold music.
          </p>
        </div>

        {/* The 4 Failure Modes of Manual Dispatch */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-rose-500/40 transition-all group flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 mb-4 group-hover:scale-105 transition-transform">
                <PhoneOff className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">The Hold-Music Bottleneck</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                Paramedics and 911 dispatchers spend 4 to 9 minutes on hold waiting for hospital charge nurses to check if beds, CT scanners, or cath labs are open.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-rose-500/40 transition-all group flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 mb-4 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Fragmented Specialty Routing</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                Patients with acute STEMI or large-vessel strokes are frequently routed to the closest hospital, only to be transferred again because that facility lacks an active interventional suite.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-rose-500/40 transition-all group flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 mb-4 group-hover:scale-105 transition-transform">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Garbled Pre-Arrival Handoffs</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                Radio static and rushed verbal calls leave trauma surgeons unaware of vital signs or pharmacological interventions until the patient is physically wheeled through the doors.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-rose-500/40 transition-all group flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 mb-4 group-hover:scale-105 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Zero Sovereign Audit Trail</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                Public health authorities and EMS medical directors have no real-time auditability of regional bed shortages or diversion spikes until days or weeks after incidents occur.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Comparison Timeline */}
        <div className="mt-20 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md shadow-slate-100/55">
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Manual Dispatch Pipeline vs. LifeLine Agent Swarm
            </h3>
            <p className="mt-2 text-sm text-slate-500 font-sans">
              Measuring the critical elapsed time from first clinical vitals assessment to hospital surgical pre-activation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* The Manual Old Way */}
            <div className="p-6 rounded-2xl bg-rose-50/40 border border-rose-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-rose-200">
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-5 h-5 text-rose-500" />
                    <span className="font-mono font-bold text-rose-700 uppercase tracking-wider text-sm">
                      Traditional Manual Dispatch
                    </span>
                  </div>
                  <span className="font-mono text-xl font-extrabold text-rose-600">~14m 30s</span>
                </div>

                <div className="mt-6 space-y-4 text-xs font-mono text-slate-700">
                  <div className="flex items-start space-x-3">
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">00:00</span>
                    <p>EMS arrives on scene, takes vitals, performs manual calculation.</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">03:15</span>
                    <p>Radio dispatcher calls Hospital A ED desk; put on hold for bed charge nurse.</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">07:40</span>
                    <p>Hospital A reports Cath Lab occupied; dispatcher redials Hospital B.</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">11:20</span>
                    <p>Hospital B accepts patient; verbal radio patch relays partial vitals through static.</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">14:30</span>
                    <p>Ambulance arrives; trauma team first learns full clinical picture at triage bay.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-rose-200 text-xs text-rose-600 font-mono flex items-center justify-between">
                <span>Result: Fatal delays, secondary transfers</span>
                <span className="font-bold">HIGH RISK</span>
              </div>
            </div>

            {/* The LifeLine Autonomous Way */}
            <div className="p-6 rounded-2xl bg-cyan-50/30 border border-cyan-200/80 shadow-md shadow-cyan-50/50 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between pb-4 border-b border-cyan-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-mono font-bold text-cyan-700 uppercase tracking-wider text-sm">
                      LifeLine Multi-Agent Swarm
                    </span>
                  </div>
                  <span className="font-mono text-xl font-extrabold text-emerald-600">1.8 SECONDS</span>
                </div>

                <div className="mt-6 space-y-4 text-xs font-mono text-slate-700">
                  <div className="flex items-start space-x-3">
                    <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 text-[10px] font-bold">0.04s</span>
                    <p><strong className="text-slate-900 font-bold">Ingest:</strong> Vitals stream ingested via encrypted telemetry.</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 text-[10px] font-bold">0.68s</span>
                    <p><strong className="text-cyan-700 font-bold">Triage Agent (gemini-3.1-pro):</strong> NEWS2 = 8. Identifies STEMI & cardiogenic shock.</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 text-[10px] font-bold">1.06s</span>
                    <p><strong className="text-emerald-700 font-bold">Bed-Matching & Routing:</strong> St. Jude matched (active Cath Lab 2, 0 diversion, 5.8m ETA via OSRM).</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 text-[10px] font-bold">1.48s</span>
                    <p><strong className="text-amber-700 font-bold">Briefing Agent:</strong> Plain-language SBAR delivered to St. Jude surgical scrub monitors.</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 text-[10px] font-bold">1.80s</span>
                    <p><strong className="text-purple-700 font-bold">Audit Complete:</strong> Hospital team pre-activated before ambulance wheels roll.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-cyan-200 text-xs text-emerald-600 font-mono flex items-center justify-between">
                <span>Result: Direct Cath Lab / Trauma Bay bypass</span>
                <span className="font-bold uppercase tracking-wider text-emerald-700">99.8% TIME SAVED</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
