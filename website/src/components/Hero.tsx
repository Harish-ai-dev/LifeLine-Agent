import React from 'react';
import { 
  Activity, 
  ArrowRight, 
  ShieldAlert, 
  Sparkles, 
  Play, 
  Github, 
  Clock, 
  Zap, 
  Building2, 
  Layers, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  Cpu,
  Star
} from 'lucide-react';
import { PROJECT_METADATA } from '../data/team';

interface HeroProps {
  onOpenDemo: () => void;
  onOpenWaitlist: () => void;
  onScrollToSimulator: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenDemo, onOpenWaitlist, onScrollToSimulator }) => {
  return (
    <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[#0B1120]">
      {/* Edge-to-edge Glowing Effects & Background Telemetry Grid */}
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.18),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-rose-500/10 blur-[110px] rounded-full pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(to right, #0ea5e9 1px, transparent 1px), linear-gradient(to bottom, #0ea5e9 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        
        {/* Top Hackathon & Operational Pill */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-8">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-800/70 shadow-lg shadow-cyan-950/50">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-mono font-medium text-cyan-300">
              {PROJECT_METADATA.hackathonBadge}
            </span>
          </div>

          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 shadow-md">
            <span className="text-xs font-mono text-slate-300">
              ⚡ Multi-Agent Swarm on <span className="text-cyan-400 font-semibold">Google Gemini 3.1 & 3.5</span>
            </span>
          </div>
        </div>

        {/* Hero Title & Value Proposition */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            <span className="block text-slate-200">Zero phone calls.</span>
            <span className="block text-slate-300">Zero hold music.</span>
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Seconds, not minutes.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-300 font-normal leading-relaxed max-w-3xl mx-auto font-sans">
            In acute trauma and cardiac emergencies, the <span className="text-rose-400 font-semibold">golden hour</span> is lost to manual phone calls, fragmented radio channels, and hospital capacity uncertainty. <span className="text-white font-medium">LifeLine Agent</span> coordinates 6 autonomous AI agents on Google Gemini to triage vitals with NEWS2, calculate OSRM driving corridors, match hospital capabilities, and deliver plain-language trauma briefs before the ambulance rolls.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
            <button
              onClick={onScrollToSimulator}
              className="w-full sm:w-auto px-7 py-4 rounded-xl text-sm font-mono font-bold tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-400/40 transition-all flex items-center justify-center space-x-2 group"
            >
              <Sparkles className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform" />
              <span>LAUNCH LIVE SIMULATOR</span>
              <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onOpenDemo}
              className="w-full sm:w-auto px-6 py-4 rounded-xl text-sm font-mono font-semibold tracking-wide bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-cyan-500/50 shadow-lg transition-all flex items-center justify-center space-x-2.5"
            >
              <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                <Play className="w-3 h-3 text-rose-400 fill-rose-400 ml-0.5" />
              </div>
              <span>Watch 4-Min Demo Video</span>
            </button>

            <a
              href="https://github.com/Harish-ai-dev/LifeLine-Agent"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-4 rounded-xl text-sm font-mono text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-500 transition-all flex items-center justify-center space-x-2 shadow-sm"
            >
              <Github className="w-4 h-4 text-slate-300" />
              <span>GitHub (Apache 2.0)</span>
            </a>
          </div>
        </div>

        {/* Live Telemetry KPI Dashboard Bar */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800/90 shadow-lg backdrop-blur-sm relative overflow-hidden group hover:border-cyan-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Dispatch Latency</span>
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-3xl sm:text-4xl font-mono font-extrabold text-white">1.8s</span>
              <span className="text-xs font-mono text-emerald-400">vs 14.5m</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Sub-2s multi-agent workflow</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800/90 shadow-lg backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Clinical Triage</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-3xl sm:text-4xl font-mono font-extrabold text-white">100%</span>
              <span className="text-xs font-mono text-emerald-400">NEWS2</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Royal College of Physicians</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800/90 shadow-lg backdrop-blur-sm relative overflow-hidden group hover:border-blue-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Active AI Agents</span>
              <Cpu className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-3xl sm:text-4xl font-mono font-extrabold text-white">6</span>
              <span className="text-xs font-mono text-cyan-300">Gemini 3.1 & 3.5</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Specialized decoupled roster</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800/90 shadow-lg backdrop-blur-sm relative overflow-hidden group hover:border-rose-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Hold Music / Calls</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-3xl sm:text-4xl font-mono font-extrabold text-white">0</span>
              <span className="text-xs font-mono text-emerald-400">Direct Autonomy</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Zero phone-tree delays</p>
          </div>
        </div>

        {/* Live Simulated Dispatch Banner with Illustrative Disclosure */}
        <div className="mt-8 max-w-3xl mx-auto p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/50 flex items-center justify-between text-xs font-mono text-slate-300">
          <div className="flex items-center space-x-2 overflow-hidden">
            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-cyan-400 font-bold">LATEST DISPATCH:</span>
            <span className="truncate">EMS Unit 42 matched with St. Jude Trauma Level 1 • ETA: 4.8m • Pre-arrival SBAR brief confirmed</span>
          </div>
          <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">SIMULATED DEMO</span>
        </div>

      </div>
    </section>
  );
};
