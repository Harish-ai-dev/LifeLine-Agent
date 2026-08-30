import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Github, 
  ExternalLink, 
  Play, 
  HeartPulse, 
  Cpu, 
  Layers, 
  FileCode, 
  ShieldCheck,
  Star,
  Info
} from 'lucide-react';
import { PROJECT_METADATA } from '../data/team';

interface FooterProps {
  onOpenDemo: () => void;
  onOpenWaitlist: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDemo, onOpenWaitlist }) => {
  const scrollToAnchor = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#060A12] border-t border-slate-900 pt-16 pb-12 text-slate-400 font-mono text-xs">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-slate-900">
          
          {/* Col 1: Brand & Hackathon Context */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-3 group inline-flex">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-[1px]">
                <div className="w-full h-full bg-[#0B1120] rounded-[11px] flex items-center justify-center">
                  <HeartPulse className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <span className="font-bold text-white text-base tracking-wider">
                LIFELINE<span className="text-cyan-400">AGENT</span>
              </span>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-sans">
              Autonomous multi-agent emergency dispatch & hospital coordination on Google Gemini. Zero phone calls, zero hold music, seconds not minutes.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 max-w-sm space-y-1.5">
              <div className="text-cyan-400 font-bold flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Google Gemini AI Hackathon 2025</span>
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Public marketing & architecture documentation portal. Open-source under Apache 2.0 License.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href="https://github.com/Harish-ai-dev/LifeLine-Agent"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-600 text-slate-200 hover:text-white transition-all flex items-center space-x-2"
                aria-label="GitHub Repository at https://github.com/Harish-ai-dev/LifeLine-Agent"
              >
                <Github className="w-4 h-4 text-slate-300" />
                <span>GitHub Repo</span>
                <span className="text-[10px] text-cyan-400 flex items-center space-x-0.5">
                  <Star className="w-2.5 h-2.5 fill-cyan-400 text-cyan-400" />
                  <span>Star</span>
                </span>
              </a>

              <button
                onClick={onOpenDemo}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:text-rose-400 hover:border-rose-900 transition-colors flex items-center space-x-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Demo Video (4m)</span>
              </button>
            </div>
          </div>

          {/* Col 2: The 6 AI Agents */}
          <div className="space-y-2.5">
            <div className="text-white font-bold uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>The 6 Agents</span>
            </div>
            <ul className="space-y-2 text-slate-400">
              <li><button onClick={() => scrollToAnchor('agents')} className="hover:text-cyan-400 transition-colors text-left">Triage Agent (gemini-3.1-pro)</button></li>
              <li><button onClick={() => scrollToAnchor('agents')} className="hover:text-cyan-400 transition-colors text-left">Bed-Matching Agent (3.5 Flash)</button></li>
              <li><button onClick={() => scrollToAnchor('agents')} className="hover:text-cyan-400 transition-colors text-left">Routing Agent (OSRM Engine)</button></li>
              <li><button onClick={() => scrollToAnchor('agents')} className="hover:text-cyan-400 transition-colors text-left">Briefing Agent (SBAR Trauma)</button></li>
              <li><button onClick={() => scrollToAnchor('agents')} className="hover:text-cyan-400 transition-colors text-left">Report Agent (Gov Intel)</button></li>
              <li><button onClick={() => scrollToAnchor('agents')} className="hover:text-cyan-400 transition-colors text-left">Resource Agent (Blood/Logistics)</button></li>
              <li><button onClick={() => scrollToAnchor('how-it-works')} className="text-cyan-400 hover:underline text-left font-bold">Launch Live Simulator →</button></li>
            </ul>
          </div>

          {/* Col 3: Architecture & Data */}
          <div className="space-y-2.5">
            <div className="text-white font-bold uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Architecture & Data</span>
            </div>
            <ul className="space-y-2 text-slate-400">
              <li><button onClick={() => scrollToAnchor('tech-stack')} className="hover:text-cyan-400 transition-colors text-left">Architecture Flow & Swarm</button></li>
              <li><button onClick={() => scrollToAnchor('real-vs-simulated')} className="hover:text-cyan-400 transition-colors text-left">Real vs Simulated Data Matrix</button></li>
              <li><button onClick={() => scrollToAnchor('tech-stack')} className="hover:text-cyan-400 transition-colors text-left">OSRM Road Routing Engine</button></li>
              <li><button onClick={() => scrollToAnchor('real-vs-simulated')} className="hover:text-cyan-400 transition-colors text-left">NEWS2 Clinical Algorithm (RCP)</button></li>
              <li><button onClick={() => scrollToAnchor('tech-stack')} className="hover:text-cyan-400 transition-colors text-left">Google Cloud Run & FastAPIs</button></li>
              <li><button onClick={() => scrollToAnchor('reviews')} className="hover:text-cyan-400 transition-colors text-left">Judge & Clinician Reviews</button></li>
            </ul>
          </div>

          {/* Col 4: Links & Open Source */}
          <div className="space-y-2.5">
            <div className="text-white font-bold uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
              <FileCode className="w-3.5 h-3.5 text-purple-400" />
              <span>Links & Open Source</span>
            </div>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a 
                  href="https://github.com/Harish-ai-dev/LifeLine-Agent" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-cyan-400 transition-colors flex items-center space-x-1 text-slate-200"
                >
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li><button onClick={() => scrollToAnchor('demo')} className="hover:text-cyan-400 transition-colors text-left">Demo Video Embed (4m)</button></li>
              <li><button onClick={() => scrollToAnchor('tech-stack')} className="hover:text-cyan-400 transition-colors text-left">Architecture Diagram</button></li>
              <li><button onClick={() => scrollToAnchor('open-source')} className="hover:text-cyan-400 transition-colors text-left">How to Contribute (CONTRIBUTING)</button></li>
              <li><button onClick={() => scrollToAnchor('open-source')} className="hover:text-cyan-400 transition-colors text-left">Apache 2.0 License Terms</button></li>
              <li><button onClick={() => scrollToAnchor('team')} className="hover:text-cyan-400 transition-colors text-left">Team & Credits</button></li>
            </ul>
          </div>

        </div>

        {/* Disclaimer on Illustrative Telemetry */}
        <div className="py-4 text-[10px] text-slate-500 border-b border-slate-900 leading-relaxed font-mono">
          <span className="text-slate-400 font-bold uppercase">Public Marketing & Documentation Disclosure:</span> Any sample dispatch statistics, telemetry numbers, and simulated case timelines shown on this public website are illustrative for demonstration and clinical benchmarking purposes, generated from synthetic HIPAA-compliant emergency scenarios. No Protected Health Information (PHI) is ingested or stored.
        </div>

        {/* Bottom Status Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} LifeLine Agent Project. Apache 2.0 Permissive Open Source License.
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center space-x-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>All 6 Agents Operational (Sub-2s SLA)</span>
            </span>
            <a
              href="https://github.com/Harish-ai-dev/LifeLine-Agent"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-cyan-400 flex items-center space-x-1"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub (Harish-ai-dev/LifeLine-Agent)</span>
            </a>
            <Link to="/legal" className="hover:text-slate-300">Privacy & Terms</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
