'use client';

import React from 'react';
import Link from 'next/link';
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
import { PROJECT_METADATA } from '@/data/marketing/team';
import { Logo } from '@/components/ui/Logo';

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
    <footer className="w-full bg-[#F8FAFC] border-t border-slate-200 pt-16 pb-12 text-slate-500 font-mono text-xs">
      <div className="w-full w-full px-2 sm:px-4 lg:px-6 px-4 sm:px-6 lg:px-8 xl:px-10">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-slate-200">
          
          {/* Col 1: Brand & Hackathon Context */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-3 group inline-flex">
              <Logo />
              <span className="font-bold text-slate-900 text-base tracking-wider">
                LIFELINE<span className="text-cyan-500 font-extrabold">AGENT</span>
              </span>
            </Link>

            <p className="text-xs text-slate-500 leading-relaxed max-w-sm font-sans">
              Autonomous multi-agent emergency dispatch & hospital coordination on Google Gemini. Zero phone calls, zero hold music, seconds not minutes.
            </p>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-650 max-w-sm space-y-1.5 shadow-sm">
              <div className="text-cyan-600 font-bold flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                <span>Google Gemini AI Hackathon 2025</span>
              </div>
              <p className="text-slate-500 text-[10px] leading-relaxed font-sans">
                Public marketing & architecture documentation portal. Open-source under Apache 2.0 License.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href="https://github.com/Harish-ai-dev/LifeLine-Agent"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-400 text-slate-600 hover:text-slate-900 transition-all flex items-center space-x-2 shadow-sm"
                aria-label="GitHub Repository at https://github.com/Harish-ai-dev/LifeLine-Agent"
              >
                <Github className="w-4 h-4 text-slate-500" />
                <span>GitHub Repo</span>
                <span className="text-[10px] text-cyan-600 flex items-center space-x-0.5">
                  <Star className="w-2.5 h-2.5 fill-cyan-500 text-cyan-500 border-none" />
                  <span>Star</span>
                </span>
              </a>

              <button
                onClick={onOpenDemo}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:text-rose-600 hover:border-rose-350 text-slate-600 transition-colors flex items-center space-x-1.5 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current text-rose-500" />
                <span>Demo Video (4m)</span>
              </button>
            </div>
          </div>

          {/* Col 2: The 6 AI Agents */}
          <div className="space-y-2.5">
            <div className="text-slate-900 dark:text-white font-bold uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>The 6 Agents</span>
            </div>
            <ul className="space-y-2 text-slate-400 dark:text-slate-400">
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
            <div className="text-slate-900 dark:text-white font-bold uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Architecture & Data</span>
            </div>
            <ul className="space-y-2 text-slate-400 dark:text-slate-400">
              <li><button onClick={() => scrollToAnchor('tech-stack')} className="hover:text-cyan-400 transition-colors text-left">Architecture Flow & Swarm</button></li>
              <li><button onClick={() => scrollToAnchor('real-vs-simulated')} className="hover:text-cyan-400 transition-colors text-left">Real vs Simulated Data Matrix</button></li>
              <li><button onClick={() => scrollToAnchor('tech-stack')} className="hover:text-cyan-400 transition-colors text-left">OSRM Road Routing Engine</button></li>
              <li><button onClick={() => scrollToAnchor('real-vs-simulated')} className="hover:text-cyan-400 transition-colors text-left">NEWS2 Clinical Algorithm (RCP)</button></li>
              <li><button onClick={() => scrollToAnchor('tech-stack')} className="hover:text-cyan-400 transition-colors text-left">Google Cloud Run & FastAPIs</button></li>
            </ul>
          </div>

          {/* Col 4: Links & Open Source */}
          <div className="space-y-2.5">
            <div className="text-slate-900 dark:text-white font-bold uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
              <FileCode className="w-3.5 h-3.5 text-purple-400" />
              <span>Links & Open Source</span>
            </div>
            <ul className="space-y-2 text-slate-400 dark:text-slate-400">
              <li>
                <a 
                  href="https://github.com/Harish-ai-dev/LifeLine-Agent" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-cyan-400 transition-colors flex items-center space-x-1 text-slate-700 dark:text-slate-200"
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
        <div className="py-4 text-[10px] text-slate-500 border-b border-slate-200 leading-relaxed font-mono">
          <span className="text-slate-500 font-bold uppercase">Public Marketing & Documentation Disclosure:</span> Any sample dispatch statistics, telemetry numbers, and simulated case timelines shown on this public website are illustrative for demonstration and clinical benchmarking purposes, generated from synthetic HIPAA-compliant emergency scenarios. No Protected Health Information (PHI) is ingested or stored.
        </div>

        {/* Bottom Status Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} LifeLine Agent Project. Apache 2.0 Permissive Open Source License.
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center space-x-1.5 text-emerald-650">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>All 6 Agents Operational (Sub-2s SLA)</span>
            </span>
            <a
              href="https://github.com/Harish-ai-dev/LifeLine-Agent"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-cyan-600 flex items-center space-x-1"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub (Harish-ai-dev/LifeLine-Agent)</span>
            </a>
            <Link href="/legal" className="hover:text-slate-700 text-slate-500">Privacy & Terms</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
