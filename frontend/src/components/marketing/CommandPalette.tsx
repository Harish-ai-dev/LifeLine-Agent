'use client';

import React, { useState, useEffect } from 'react';
import { useRouter as useNavigate } from 'next/navigation';
import { 
  Search, 
  X, 
  ArrowRight, 
  Activity, 
  Cpu, 
  Sparkles, 
  Layers, 
  BookOpen, 
  ShieldCheck, 
  Star,
  Users
} from 'lucide-react';
import { AGENT_ROSTER } from '@/data/marketing/agents';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    { title: 'Home Overview', path: '/', icon: <Activity className="w-4 h-4 text-cyan-400" />, desc: 'Value prop, problem framing, and product showcase' },
    { title: 'Interactive Simulator', path: '/simulator', icon: <Sparkles className="w-4 h-4 text-emerald-400" />, desc: 'Execute live clinical scenarios (STEMI, Trauma, Stroke, Sepsis)' },
    { title: '6 Autonomous AI Agents', path: '/agents', icon: <Cpu className="w-4 h-4 text-blue-400" />, desc: 'Triage, Bed-Matching, Routing, Briefing, Report, Resource' },
    { title: 'System Architecture', path: '/architecture', icon: <Layers className="w-4 h-4 text-indigo-400" />, desc: 'Gemini models, OSRM routing, Cloud Run serverless topology' },
    { title: 'Real vs Simulated Provenance', path: '/provenance', icon: <ShieldCheck className="w-4 h-4 text-teal-400" />, desc: 'Transparent provenance matrix and verification methods' },
    { title: 'Developer Docs & API', path: '/docs', icon: <BookOpen className="w-4 h-4 text-purple-400" />, desc: 'API endpoints, Docker Compose setup, and test suite' },
    { title: 'About & Team', path: '/about', icon: <Users className="w-4 h-4 text-rose-400" />, desc: 'Core team, emergency clinical advisors, and mission' },
  ];

  const filteredLinks = quickLinks.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.desc.toLowerCase().includes(query.toLowerCase())
  );

  const filteredAgents = AGENT_ROSTER.filter(ag =>
    ag.name.toLowerCase().includes(query.toLowerCase()) ||
    ag.role.toLowerCase().includes(query.toLowerCase()) ||
    ag.model.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate.push(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden font-mono text-xs">
        
        {/* Search Input Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center space-x-3">
          <Search className="w-5 h-5 text-cyan-600" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, page name, or agent (e.g. STEMI, Triage, OSRM, Docs)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-500 focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded bg-white border border-slate-200 text-slate-500 hover:text-slate-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Stream */}
        <div className="p-3 max-h-96 overflow-y-auto space-y-3">
          
          {/* Quick Pages */}
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider px-2 py-1">Pages & Sections</div>
            <div className="space-y-1 mt-1">
              {filteredLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => handleSelect(link.path)}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-50 text-left flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                      {link.icon}
                    </div>
                    <div>
                      <div className="text-slate-900 font-bold group-hover:text-cyan-700">{link.title}</div>
                      <div className="text-[11px] text-slate-500">{link.desc}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-700" />
                </button>
              ))}
            </div>
          </div>

          {/* Agents */}
          {filteredAgents.length > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider px-2 py-1">AI Agents</div>
              <div className="space-y-1 mt-1">
                {filteredAgents.map((ag) => (
                  <button
                    key={ag.id}
                    onClick={() => handleSelect('/agents')}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-50 text-left flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <div className="text-slate-900 font-bold group-hover:text-cyan-700">{ag.name}</div>
                      <div className="text-[11px] text-slate-500">{ag.role} • Model: {ag.model}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200 font-bold">
                      {ag.latencyMs}ms
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Hint */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Navigate with mouse or click</span>
          <span>ESC to close</span>
        </div>

      </div>
    </div>
  );
};
