import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  Star
} from 'lucide-react';
import { PROJECT_METADATA } from '../data/team';

interface NavbarProps {
  onOpenDemo: () => void;
  onOpenWaitlist: () => void;
  onOpenSearch: () => void;
  systemStatus: string;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenDemo, 
  onOpenWaitlist, 
  onOpenSearch, 
  systemStatus 
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (anchorId: string) => {
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById(anchorId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigate(`/#${anchorId}`);
    setTimeout(() => {
      const el = document.getElementById(anchorId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 120);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#0B1120]/95 backdrop-blur-xl border-b border-cyan-950/80 py-2.5 shadow-2xl shadow-cyan-950/40' 
        : 'bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-900/90 py-3.5'
    }`}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo & Live Telemetry Badge */}
          <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-400/50 transition-all">
                <div className="w-full h-full bg-[#0B1120] rounded-[11px] flex items-center justify-center">
                  <HeartPulse className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#0B1120]"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-base font-bold tracking-wider text-white group-hover:text-cyan-400 transition-colors">
                  LIFELINE<span className="text-cyan-400">AGENT</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-800 rounded">
                  GEMINI AI
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-mono">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>6 AGENTS LIVE • 1.8s SLA</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-1.5 text-xs font-mono text-slate-300">
            <button
              onClick={() => handleNavClick('problem')}
              className="px-2.5 py-1.5 rounded-lg hover:text-white hover:bg-slate-900/80 transition-colors"
            >
              Problem
            </button>

            <button
              onClick={() => handleNavClick('how-it-works')}
              className="px-2.5 py-1.5 rounded-lg hover:text-white hover:bg-slate-900/80 transition-colors flex items-center space-x-1 text-cyan-300 font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>How It Works</span>
            </button>

            <button
              onClick={() => handleNavClick('agents')}
              className="px-2.5 py-1.5 rounded-lg hover:text-white hover:bg-slate-900/80 transition-colors"
            >
              Agents (6)
            </button>

            <button
              onClick={() => handleNavClick('tech-stack')}
              className="px-2.5 py-1.5 rounded-lg hover:text-white hover:bg-slate-900/80 transition-colors"
            >
              Tech Stack
            </button>

            <button
              onClick={() => handleNavClick('real-vs-simulated')}
              className="px-2.5 py-1.5 rounded-lg hover:text-white hover:bg-slate-900/80 transition-colors"
            >
              Real vs Simulated
            </button>

            <button
              onClick={() => handleNavClick('demo')}
              className="px-2.5 py-1.5 rounded-lg hover:text-white hover:bg-slate-900/80 transition-colors"
            >
              Demo Video
            </button>

            <button
              onClick={() => handleNavClick('team')}
              className="px-2.5 py-1.5 rounded-lg hover:text-white hover:bg-slate-900/80 transition-colors"
            >
              Team
            </button>

            <button
              onClick={() => handleNavClick('open-source')}
              className="px-2.5 py-1.5 rounded-lg hover:text-white hover:bg-slate-900/80 transition-colors"
            >
              Open Source
            </button>
          </nav>

          {/* Right Action CTAs + Prominent GitHub Link */}
          <div className="hidden md:flex items-center space-x-2.5">
            {/* Quick Search palette trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 flex items-center space-x-1.5 text-xs font-mono"
              title="Quick Search (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[10px] text-slate-500">⌘K</span>
            </button>

            {/* Official GitHub Link */}
            <a
              href="https://github.com/Harish-ai-dev/LifeLine-Agent"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700 hover:border-slate-500 transition-all flex items-center space-x-2 group shadow-sm"
              aria-label="GitHub Repository at https://github.com/Harish-ai-dev/LifeLine-Agent"
            >
              <Github className="w-4 h-4 text-slate-300 group-hover:text-white" />
              <span>GitHub</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-cyan-300 border border-slate-700 flex items-center space-x-1">
                <Star className="w-2.5 h-2.5 fill-cyan-400 text-cyan-400" />
                <span>Star</span>
              </span>
            </a>

            {/* Watch Demo Video CTA */}
            <button
              onClick={onOpenDemo}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-rose-500/60 transition-all flex items-center space-x-1.5"
            >
              <Play className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span className="hidden xl:inline">Watch Demo</span>
              <span className="xl:hidden">Demo</span>
            </button>

            {/* Pilot Waitlist Button */}
            <button
              onClick={onOpenWaitlist}
              className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/30 transition-all"
            >
              Join Pilot
            </button>
          </div>

          {/* Mobile menu toggle & quick GitHub */}
          <div className="lg:hidden flex items-center space-x-2">
            <a
              href="https://github.com/Harish-ai-dev/LifeLine-Agent"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
              aria-label="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>

            <button
              onClick={onOpenSearch}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0B1120]/98 backdrop-blur-2xl border-b border-cyan-950/80 px-4 pt-4 pb-6 mt-2 space-y-3 shadow-2xl">
          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-200">
            <button
              onClick={() => handleNavClick('problem')}
              className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-left"
            >
              Problem
            </button>
            <button
              onClick={() => handleNavClick('how-it-works')}
              className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-800 text-cyan-300 text-left flex items-center space-x-1"
            >
              <span>How It Works ✨</span>
            </button>
            <button
              onClick={() => handleNavClick('agents')}
              className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-left"
            >
              6 AI Agents
            </button>
            <button
              onClick={() => handleNavClick('tech-stack')}
              className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-left"
            >
              Tech Stack
            </button>
            <button
              onClick={() => handleNavClick('real-vs-simulated')}
              className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-left"
            >
              Real vs Simulated
            </button>
            <button
              onClick={() => handleNavClick('demo')}
              className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-left"
            >
              Demo Video (4m)
            </button>
            <button
              onClick={() => handleNavClick('team')}
              className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-left"
            >
              Team & Credits
            </button>
            <button
              onClick={() => handleNavClick('open-source')}
              className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-left"
            >
              Open Source
            </button>
          </div>

          <div className="pt-2 flex flex-col gap-2 font-mono">
            <a
              href="https://github.com/Harish-ai-dev/LifeLine-Agent"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700 flex items-center justify-center space-x-2"
            >
              <Github className="w-4 h-4" />
              <span>View GitHub Repo (Apache 2.0)</span>
            </a>

            <button
              onClick={() => { setMobileMenuOpen(false); onOpenDemo(); }}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center space-x-2"
            >
              <Play className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>Watch 4-Min Demo Video</span>
            </button>

            <button
              onClick={() => { setMobileMenuOpen(false); onOpenWaitlist(); }}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950"
            >
              Join Pilot Waitlist
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
