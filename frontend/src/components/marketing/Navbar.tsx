'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Github, 
  Play, 
  Sparkles, 
  HeartPulse, 
  Search, 
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Cpu,
  Layers,
  Star,
  Activity,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { PROJECT_METADATA } from '@/data/marketing/team';
import { CLINICAL_SCENARIOS } from '@/data/marketing/pipeline';
import { DESIGN_TOKENS } from '@/data/marketing/tokens';

interface NavbarProps {
  onOpenDemo: () => void;
  onOpenWaitlist: () => void;
  onOpenSearch: () => void;
  systemStatus: string;
}

export function Navbar({ 
  onOpenDemo, 
  onOpenWaitlist, 
  onOpenSearch, 
  systemStatus 
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSimMode, setIsSimMode] = useState(true);
  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);
  const pathname = usePathname();

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Telemetry case switcher (Sim Mode)
  useEffect(() => {
    if (!isSimMode) return;
    const interval = setInterval(() => {
      setActiveScenarioIndex((prev) => (prev + 1) % CLINICAL_SCENARIOS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isSimMode]);

  const handleNavClick = (anchorId: string) => {
    setMobileMenuOpen(false);
    if (pathname === '/') {
      const el = document.getElementById(anchorId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = `/#${anchorId}`;
    }
  };

  const activeScenario = CLINICAL_SCENARIOS[activeScenarioIndex];

  return (
    <header className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 dark:bg-[#060B18]/95 backdrop-blur-xl border-b border-slate-200 dark:border-cyan-950/80 shadow-md dark:shadow-2xl' 
        : 'bg-white/90 dark:bg-[#060B18]/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-900/60'
    }`}>
      
      {/* 1. Dynamic Telemetry Ribbon */}
      <div className={`w-full py-1.5 px-4 md:px-8 border-b transition-colors duration-300 font-mono text-[10px] tracking-wider flex items-center justify-between ${
        isSimMode 
          ? 'bg-rose-50 dark:bg-rose-950/15 border-rose-100 dark:border-rose-950/40 text-rose-700 dark:text-rose-300/90' 
          : 'bg-cyan-50 dark:bg-cyan-950/15 border-cyan-100 dark:border-cyan-950/40 text-cyan-700 dark:text-cyan-300/90'
      }`}>
        <div className="flex items-center space-x-2.5 overflow-hidden flex-1 min-w-0">
          <span className={`flex items-center space-x-1.5 font-bold flex-shrink-0 ${isSimMode ? 'text-rose-600 dark:text-rose-450' : 'text-cyan-600 dark:text-cyan-455'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isSimMode ? 'bg-rose-500 animate-ping' : 'bg-cyan-500 animate-pulse'}`} />
            <span>{isSimMode ? 'SIM TELEMETRY' : 'LIVE STATUS'}</span>
          </span>
          <span className="text-slate-300 dark:text-slate-800 flex-shrink-0">|</span>
          
          {isSimMode ? (
            <div className="flex items-center space-x-3 truncate">
              <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold tracking-widest border border-rose-300/50 dark:border-rose-800/40 uppercase bg-rose-100/60 dark:bg-rose-950/45 text-rose-600 dark:text-rose-400`}>
                {activeScenario.acuity}
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-[140px] sm:max-w-none">{activeScenario.name}</span>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
              <span className="text-slate-600 dark:text-slate-350 font-mono hidden sm:inline">
                HR: <strong className="text-slate-900 dark:text-white font-bold">{activeScenario.vitals.hr}</strong> | 
                BP: <strong className="text-slate-900 dark:text-white font-bold">{activeScenario.vitals.bp}</strong> | 
                SpO2: <strong className="text-slate-900 dark:text-white font-bold">{activeScenario.vitals.spo2}%</strong>
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-semibold flex-shrink-0">NEWS2: {activeScenario.news2Score}</span>
              <span className="text-slate-300 dark:text-slate-700 hidden md:inline">•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold hidden md:inline truncate">
                MATCH: {activeScenario.matchedHospital} ({activeScenario.travelEta})
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-3.5 truncate text-slate-600 dark:text-slate-300 font-mono">
              <span className="flex items-center space-x-1">
                <span>ORCHESTRATOR:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">ONLINE</strong>
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="flex items-center space-x-1 hidden sm:inline">
                <span>TRIAGE:</span>
                <strong className="text-cyan-600 dark:text-cyan-400">GEMINI-3.1-PRO</strong>
              </span>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
              <span className="flex items-center space-x-1">
                <span>API:</span>
                <strong className={systemStatus === 'HEALTHY' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400'}>
                  {systemStatus === 'HEALTHY' ? 'HEALTHY' : 'STDBY'}
                </strong>
              </span>
              <span className="text-slate-300 dark:text-slate-700 hidden md:inline">•</span>
              <span className="hidden md:inline">SLA: <strong className="text-cyan-600 dark:text-cyan-400">1.8s</strong></span>
              <span className="text-slate-300 dark:text-slate-700 hidden md:inline">•</span>
              <span className="hidden md:inline text-emerald-600 dark:text-emerald-400 font-bold">DB SYNC SECURE</span>
            </div>
          )}
        </div>
        
        {/* Toggle Switch */}
        <div className="flex items-center space-x-1.5 flex-shrink-0 ml-4">
          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono uppercase hidden sm:inline">Simulation</span>
          <button
            onClick={() => setIsSimMode(!isSimMode)}
            className={`relative w-7 h-4 rounded-full transition-colors duration-200 ${
              isSimMode ? 'bg-rose-500 dark:bg-rose-600 shadow-sm' : 'bg-slate-300 dark:bg-slate-700'
            }`}
            aria-label="Toggle simulation telemetry"
          >
            <span className={`absolute top-0.5 left-0.5 bg-white w-3 h-3 rounded-full transition-transform duration-200 ${
              isSimMode ? 'translate-x-3' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {/* 2. Main Navigation Header */}
      <div className="w-full w-full px-2 sm:px-4 lg:px-6 px-4 sm:px-8 py-3">
        <div className="flex items-center justify-between w-full">
          
          {/* Logo Brand Block */}
          <Link href="/" className="flex items-center space-x-2.5 group flex-shrink-0">
            <div className="relative">
              <img 
                src="/logo.png" 
                alt="LifeLine Agent Logo" 
                className="w-9 h-9 rounded-[11px] shadow-md group-hover:scale-105 transition-transform duration-300" 
              />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-mono text-sm font-black tracking-widest text-slate-900 group-hover:text-cyan-600 transition-colors duration-250">
                  LIFELINE<span className="text-cyan-500 font-extrabold">AGENT</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 text-[8px] font-mono font-bold bg-cyan-100 text-cyan-700 border border-cyan-200 rounded">
                  GEMINI AI
                </span>
              </div>
              <div className="text-[9px] text-slate-500 font-mono mt-0.5 tracking-tight flex items-center space-x-1">
                <Activity className="w-2.5 h-2.5 text-cyan-500/70" />
                <span>6 CORE AGENTS MESH</span>
              </div>
            </div>
          </Link>

          {/* Navigation Anchors (Large Viewports) */}
          <nav className="hidden lg:flex items-center space-x-6 text-xs font-mono font-semibold text-slate-650 dark:text-slate-300">
            <button
              onClick={() => handleNavClick('problem')}
              className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              Problem
            </button>

            <button
              onClick={() => handleNavClick('how-it-works')}
              className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-750 dark:hover:text-cyan-300 transition-colors flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
              <span>How It Works</span>
            </button>

            <button
              onClick={() => handleNavClick('agents')}
              className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              Agents (6)
            </button>

            <button
              onClick={() => handleNavClick('tech-stack')}
              className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              Tech Stack
            </button>

            <button
              onClick={() => handleNavClick('simulation')}
              className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              Simulation
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>

            <button
              onClick={onOpenSearch}
              className="flex items-center space-x-1.5 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>

            <a
              href={PROJECT_METADATA.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </nav>

          {/* Action CTAs (Desktop / Tablet) */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Portal Login Link */}
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all flex items-center space-x-1.5 shadow-sm bg-white dark:bg-[#0a0f1d] border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200 hover:scale-[1.02]"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Portal Login</span>
            </Link>

            {/* Launch App Main CTA */}
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-600 hover:bg-cyan-700 dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-600 dark:hover:from-cyan-400 dark:hover:to-blue-500 text-white dark:text-slate-950 shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5 hover:scale-[1.02]"
            >
              <Activity className="w-3.5 h-3.5 text-white dark:text-slate-950 animate-pulse" />
              <span>Launch App</span>
            </Link>
          </div>

          {/* Hamburger + Quick Access triggers (Mobile viewports) */}
          <div className="lg:hidden flex items-center space-x-2">
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-md text-xs font-mono font-bold bg-cyan-600 text-white shadow-sm flex items-center space-x-1"
            >
              <span>Launch</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
              aria-label="Toggle navigation drawer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* 3. Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-[#060A14] border-b border-slate-200 dark:border-cyan-950/80 px-4 pt-3 pb-6 space-y-4 shadow-xl">
          
          {/* Navigation Anchors Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono font-semibold text-slate-700 dark:text-slate-350">
            <button
              onClick={() => handleNavClick('problem')}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900 text-left"
            >
              Problem
            </button>
            <button
              onClick={() => handleNavClick('how-it-works')}
              className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-800/40 text-cyan-700 dark:text-cyan-300 text-left flex items-center space-x-1"
            >
              <span>How It Works ✨</span>
            </button>
            <button
              onClick={() => handleNavClick('agents')}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900 text-left"
            >
              6 AI Agents
            </button>
            <button
              onClick={() => handleNavClick('tech-stack')}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900 text-left"
            >
              Tech Stack
            </button>
            <button
              onClick={() => handleNavClick('simulation')}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900 text-left col-span-2"
            >
              Pipeline Simulation
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenDemo(); }}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900 text-left"
            >
              Demo Video
            </button>
            <a
              href={PROJECT_METADATA.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900 text-left flex items-center space-x-1.5"
            >
              <Github className="w-3.5 h-3.5 text-slate-500" />
              <span>GitHub (Star)</span>
            </a>
          </div>

          {/* Action buttons (Mobile) */}
          <div className="pt-2 flex flex-col gap-2 font-mono">
            <Link
              href="/login"
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-cyan-600 text-white dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-600 dark:text-slate-950 flex items-center justify-center space-x-2 shadow-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Activity className="w-4 h-4" />
              <span>Launch Ambulance Console</span>
            </Link>

            <button
              onClick={() => { setMobileMenuOpen(false); onOpenWaitlist(); }}
              className="w-full py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-cyan-950 text-slate-700 dark:text-cyan-300 bg-white dark:bg-slate-900"
            >
              Join Pilot Waitlist
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
