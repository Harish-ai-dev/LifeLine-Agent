import React, { useState, useEffect, useRef } from 'react';
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
  Star,
  Activity,
  Building2,
  Stethoscope,
  Droplets,
  ShieldCheck,
  ArrowRight,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { PROJECT_METADATA } from '../data/team';
import { CLINICAL_SCENARIOS } from '../data/pipeline';

interface NavbarProps {
  onOpenDemo: () => void;
  onOpenWaitlist: () => void;
  onOpenSearch: () => void;
  systemStatus: string;
}

// Next.js App dev URL fallback
const NEXT_APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000';

const PORTALS_INFO = [
  {
    id: 'hospital',
    label: 'Hospital Console',
    sublabel: 'Emergency Ward Admin',
    icon: Building2,
    hint: 'admin_lil',
    color: 'text-sky-400',
    borderColor: 'border-sky-500/20 hover:border-sky-500/50',
    hoverBg: 'hover:bg-sky-500/5',
    link: `${NEXT_APP_URL}/login`
  },
  {
    id: 'staff',
    label: 'Clinical Staff',
    sublabel: 'Doctor / Nurse Portal',
    icon: Stethoscope,
    hint: 'dr_mehta',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/20 hover:border-emerald-500/50',
    hoverBg: 'hover:bg-emerald-500/5',
    link: `${NEXT_APP_URL}/login`
  },
  {
    id: 'donor',
    label: 'Blood Donor',
    sublabel: 'Citizen Health Pass',
    icon: Droplets,
    hint: 'rahul_sharma',
    color: 'text-rose-400',
    borderColor: 'border-rose-500/20 hover:border-rose-500/50',
    hoverBg: 'hover:bg-rose-500/5',
    link: `${NEXT_APP_URL}/login`
  },
  {
    id: 'government',
    label: 'Health Authority',
    sublabel: 'Public Health Inspector',
    icon: ShieldCheck,
    hint: 'dir_sharma',
    color: 'text-indigo-400',
    borderColor: 'border-indigo-500/20 hover:border-indigo-500/50',
    hoverBg: 'hover:bg-indigo-500/5',
    link: `${NEXT_APP_URL}/login`
  }
];

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenDemo, 
  onOpenWaitlist, 
  onOpenSearch, 
  systemStatus 
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSimMode, setIsSimMode] = useState(true);
  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

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

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setPortalDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (anchorId: string) => {
    setMobileMenuOpen(false);
    setPortalDropdownOpen(false);
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

  const activeScenario = CLINICAL_SCENARIOS[activeScenarioIndex];

  return (
    <header className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#060B18]/95 backdrop-blur-xl border-b border-cyan-950/80 shadow-2xl' 
        : 'bg-[#060B18]/90 backdrop-blur-md border-b border-slate-900/60'
    }`}>
      
      {/* 1. Dynamic Telemetry Ribbon */}
      <div className={`w-full py-1.5 px-4 md:px-8 border-b transition-colors duration-300 font-mono text-[10px] tracking-wider flex items-center justify-between ${
        isSimMode 
          ? 'bg-rose-950/15 border-rose-950/40 text-rose-300/90' 
          : 'bg-cyan-950/15 border-cyan-950/40 text-cyan-300/90'
      }`}>
        <div className="flex items-center space-x-2.5 overflow-hidden flex-1 min-w-0">
          <span className={`flex items-center space-x-1.5 font-bold flex-shrink-0 ${isSimMode ? 'text-rose-400' : 'text-cyan-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isSimMode ? 'bg-rose-500 animate-ping' : 'bg-cyan-400 animate-pulse'}`} />
            <span>{isSimMode ? 'SIM TELEMETRY FEED' : 'LIVE CONSOLE STATUS'}</span>
          </span>
          <span className="text-slate-700 flex-shrink-0">|</span>
          
          {isSimMode ? (
            <div className="flex items-center space-x-3 truncate">
              <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold tracking-widest border border-rose-800/40 uppercase bg-rose-950/45 text-rose-400`}>
                {activeScenario.acuity}
              </span>
              <span className="text-slate-200 font-bold truncate max-w-[150px] sm:max-w-none">{activeScenario.name}</span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-slate-300 font-mono hidden sm:inline">
                HR: <strong className="text-white">{activeScenario.vitals.hr}</strong> | 
                BP: <strong className="text-white">{activeScenario.vitals.bp}</strong> | 
                SpO2: <strong className="text-white">{activeScenario.vitals.spo2}%</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400 font-semibold flex-shrink-0">NEWS2: {activeScenario.news2Score}</span>
              <span className="text-slate-600 hidden md:inline">•</span>
              <span className="text-emerald-400 font-bold hidden md:inline truncate">
                MATCH: {activeScenario.matchedHospital} ({activeScenario.travelEta})
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-3.5 truncate text-slate-300 font-mono">
              <span className="flex items-center space-x-1">
                <span>ORCHESTRATOR:</span>
                <strong className="text-emerald-400">ONLINE</strong>
              </span>
              <span className="text-slate-700">•</span>
              <span className="flex items-center space-x-1 hidden sm:inline">
                <span>TRIAGE:</span>
                <strong className="text-cyan-400">GEMINI-3.1-PRO</strong>
              </span>
              <span className="text-slate-700 hidden sm:inline">•</span>
              <span className="flex items-center space-x-1">
                <span>API:</span>
                <strong className={systemStatus === 'HEALTHY' ? 'text-emerald-400' : 'text-amber-400'}>
                  {systemStatus === 'HEALTHY' ? 'HEALTHY' : 'STDBY'}
                </strong>
              </span>
              <span className="text-slate-700 hidden md:inline">•</span>
              <span className="hidden md:inline">SLA: <strong className="text-cyan-400">1.8s</strong></span>
              <span className="text-slate-700 hidden md:inline">•</span>
              <span className="hidden md:inline text-emerald-400 font-bold">DB SYNC SECURE</span>
            </div>
          )}
        </div>
        
        {/* Toggle Switch */}
        <div className="flex items-center space-x-1.5 flex-shrink-0 ml-4">
          <span className="text-[9px] text-slate-500 font-mono uppercase hidden sm:inline">Simulation</span>
          <button
            onClick={() => setIsSimMode(!isSimMode)}
            className={`relative w-7 h-4 rounded-full transition-colors duration-200 ${
              isSimMode ? 'bg-rose-600 shadow-sm shadow-rose-500/20' : 'bg-slate-700'
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
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-3">
        <div className="flex items-center justify-between">
          
          {/* Logo Brand Block */}
          <Link to="/" className="flex items-center space-x-2.5 group flex-shrink-0">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-400/40 transition-all duration-300">
                <div className="w-full h-full bg-[#050A15] rounded-[11px] flex items-center justify-center">
                  <HeartPulse className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-[#050A15]"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-mono text-sm font-black tracking-widest text-white group-hover:text-cyan-400 transition-colors duration-250">
                  LIFELINE<span className="text-cyan-400 font-extrabold">AGENT</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 text-[8px] font-mono font-bold bg-cyan-950/70 text-cyan-300 border border-cyan-800/50 rounded">
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
          <nav className="hidden lg:flex items-center space-x-0.5 xl:space-x-1.5 text-xs font-mono text-slate-350">
            <button
              onClick={() => handleNavClick('problem')}
              className="px-2 py-1.5 rounded-lg hover:text-white hover:bg-slate-900/60 transition-colors"
            >
              Problem
            </button>

            <button
              onClick={() => handleNavClick('how-it-works')}
              className="px-2 py-1.5 rounded-lg text-cyan-300 hover:text-white hover:bg-slate-900/60 transition-colors flex items-center space-x-1 font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>How It Works</span>
            </button>

            <button
              onClick={() => handleNavClick('agents')}
              className="px-2 py-1.5 rounded-lg hover:text-white hover:bg-slate-900/60 transition-colors"
            >
              Agents (6)
            </button>

            <button
              onClick={() => handleNavClick('tech-stack')}
              className="px-2 py-1.5 rounded-lg hover:text-white hover:bg-slate-900/60 transition-colors"
            >
              Tech Stack
            </button>

            <button
              onClick={() => handleNavClick('real-vs-simulated')}
              className="px-2.5 py-1.5 rounded-lg hover:text-white hover:bg-slate-900/60 transition-colors"
            >
              Real vs Sim
            </button>

            <button
              onClick={() => handleNavClick('demo')}
              className="px-2 py-1.5 rounded-lg hover:text-white hover:bg-slate-900/60 transition-colors"
            >
              Video
            </button>

            <button
              onClick={() => handleNavClick('team')}
              className="px-2 py-1.5 rounded-lg hover:text-white hover:bg-slate-900/60 transition-colors"
            >
              Team
            </button>
          </nav>

          {/* Action CTAs (Desktop / Tablet) */}
          <div className="hidden md:flex items-center space-x-2.5">
            {/* Command Palette Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-lg bg-slate-950/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-900 hover:border-slate-800 flex items-center space-x-1.5 text-xs font-mono transition-all duration-200"
              title="Quick Search (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[9px] text-slate-600">⌘K</span>
            </button>

            {/* Official GitHub */}
            <a
              href={PROJECT_METADATA.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#0a0f1d] hover:bg-slate-900 text-slate-200 border border-slate-900 hover:border-slate-700 transition-all flex items-center space-x-2 group"
            >
              <Github className="w-4 h-4 text-slate-400 group-hover:text-white" />
              <span className="hidden lg:inline">GitHub</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-950 text-[9px] text-cyan-300 border border-slate-900 flex items-center space-x-0.5">
                <Star className="w-2.5 h-2.5 fill-cyan-400 text-cyan-400 border-none" />
                <span>Star</span>
              </span>
            </a>

            {/* Integrated Access Portal (Login Dropdown) */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all flex items-center space-x-1.5 shadow-sm ${
                  portalDropdownOpen 
                    ? 'bg-slate-900 border-cyan-500 text-white shadow-cyan-500/10' 
                    : 'bg-slate-950/90 border-slate-900 hover:border-slate-850 hover:bg-slate-900 text-slate-200'
                }`}
              >
                <Lock className={`w-3.5 h-3.5 ${portalDropdownOpen ? 'text-cyan-400' : 'text-slate-450'}`} />
                <span>Portal Login</span>
              </button>

              {portalDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-76 bg-[#070b15]/98 backdrop-blur-2xl border border-cyan-900/50 rounded-2xl p-3 shadow-2xl z-50 font-mono text-xs animate-fade-in-down">
                  <div className="px-2 pb-2 mb-2 border-b border-slate-900 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>Integrated Client Portals</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  
                  <div className="space-y-1">
                    {PORTALS_INFO.map((portal) => {
                      const PortalIcon = portal.icon;
                      return (
                        <a
                          key={portal.id}
                          href={portal.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center space-x-3 p-2 rounded-xl border border-transparent ${portal.borderColor} ${portal.hoverBg} transition-all duration-200 group`}
                        >
                          <div className={`p-2 rounded-lg bg-slate-950 border border-slate-900 group-hover:scale-105 transition-transform duration-200`}>
                            <PortalIcon className={`w-4 h-4 ${portal.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-bold text-slate-200 group-hover:text-white flex items-center justify-between">
                              <span>{portal.label}</span>
                              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" />
                            </div>
                            <div className="text-[9px] text-slate-500 mt-0.5">
                              ID: <strong className="text-slate-400 font-normal">{portal.hint}</strong>
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>

                  <div className="mt-3 p-2 bg-slate-950/70 border border-slate-900 rounded-xl text-[9px] text-slate-400 leading-normal font-sans">
                    <span className="font-bold text-cyan-400 block font-mono mb-0.5">DEV ACCESS NOTICE:</span>
                    Links connect to local Next.js client running on port 3000. Access password is <strong>lifeline2026</strong>.
                  </div>
                </div>
              )}
            </div>

            {/* Launch App Main CTA */}
            <a
              href={NEXT_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-400/25 transition-all flex items-center space-x-1.5 hover:scale-[1.02]"
            >
              <Activity className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
              <span>Launch App</span>
            </a>
          </div>

          {/* Hamburger + Quick Access triggers (Mobile viewports) */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-lg bg-slate-950 border border-slate-900 text-slate-400"
              aria-label="Quick Search"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-950 border border-slate-900 text-slate-300 hover:text-cyan-400 transition-colors"
              aria-label="Toggle navigation drawer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* 3. Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#060A14]/99 backdrop-blur-2xl border-b border-cyan-950/80 px-4 pt-3 pb-6 space-y-4 shadow-2xl animate-fade-in">
          
          {/* Navigation Anchors Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
            <button
              onClick={() => handleNavClick('problem')}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-900 text-left"
            >
              Problem
            </button>
            <button
              onClick={() => handleNavClick('how-it-works')}
              className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-cyan-300 text-left flex items-center space-x-1 font-semibold"
            >
              <span>How It Works ✨</span>
            </button>
            <button
              onClick={() => handleNavClick('agents')}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-900 text-left"
            >
              6 AI Agents
            </button>
            <button
              onClick={() => handleNavClick('tech-stack')}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-900 text-left"
            >
              Tech Stack
            </button>
            <button
              onClick={() => handleNavClick('real-vs-simulated')}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-900 text-left col-span-2"
            >
              Real vs Simulated Data
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenDemo(); }}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-900 text-left"
            >
              Demo Video
            </button>
            <button
              onClick={() => handleNavClick('team')}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-900 text-left"
            >
              Team & Credits
            </button>
          </div>

          <div className="border-t border-slate-900 pt-3">
            <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
              Launch App Portals
            </div>
            
            {/* Portals list for mobile users */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
              {PORTALS_INFO.map((portal) => {
                const PortalIcon = portal.icon;
                return (
                  <a
                    key={portal.id}
                    href={portal.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2.5 p-2 rounded-xl bg-slate-950 border border-slate-900 text-slate-200"
                  >
                    <PortalIcon className={`w-3.5 h-3.5 ${portal.color}`} />
                    <span className="font-bold flex-1">{portal.label}</span>
                    <span className="text-[9px] text-slate-500">({portal.hint})</span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Action buttons (Mobile) */}
          <div className="pt-2 flex flex-col gap-2 font-mono">
            <a
              href={NEXT_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/10"
            >
              <Activity className="w-4 h-4 text-slate-950" />
              <span>Launch Ambulance Console</span>
            </a>

            <a
              href={PROJECT_METADATA.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-slate-955 text-slate-200 border border-slate-900 flex items-center justify-center space-x-2"
            >
              <Github className="w-4 h-4 text-slate-400" />
              <span>View GitHub Repo (Star)</span>
            </a>

            <button
              onClick={() => { setMobileMenuOpen(false); onOpenWaitlist(); }}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-850 text-cyan-300 border border-cyan-950"
            >
              Join Pilot Waitlist
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
