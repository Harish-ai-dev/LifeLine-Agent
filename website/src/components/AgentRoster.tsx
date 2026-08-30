import React, { useState } from 'react';
import { 
  Activity, 
  Building2, 
  Navigation, 
  FileText, 
  BarChart3, 
  Boxes, 
  Cpu, 
  ExternalLink, 
  Code2, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { AGENT_ROSTER, AgentInfo } from '../data/agents';

interface AgentRosterProps {
  onSelectAgent: (agent: AgentInfo) => void;
}

export const AgentRoster: React.FC<AgentRosterProps> = ({ onSelectAgent }) => {
  const iconMap: Record<string, React.ReactNode> = {
    Activity: <Activity className="w-6 h-6" />,
    Building2: <Building2 className="w-6 h-6" />,
    Navigation: <Navigation className="w-6 h-6" />,
    FileText: <FileText className="w-6 h-6" />,
    BarChart3: <BarChart3 className="w-6 h-6" />,
    Boxes: <Boxes className="w-6 h-6" />
  };

  return (
    <section id="agents" className="py-24 bg-[#080E1A] relative border-t border-slate-900 scroll-mt-20 w-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-300 text-xs font-mono uppercase tracking-wider mb-4">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>Autonomous Agent Roster</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Every AI agent explicitly specified.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300 font-sans">
            LifeLine Agent is not a monolithic black box. Each clinical, geospatial, and reporting task is decoupled into a dedicated agent with explicit model assignments, deterministic guardrails, and strict schema contracts.
          </p>
        </div>

        {/* 6 Agent Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AGENT_ROSTER.map((agent) => (
            <div
              key={agent.id}
              className="p-6 rounded-2xl bg-[#0F172A]/90 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between shadow-xl group"
            >
              <div>
                {/* Agent Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.modelBadgeColor} p-[1px] shadow-lg`}>
                    <div className="w-full h-full bg-[#0B1120] rounded-[11px] flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                      {iconMap[agent.iconName] || <Activity className="w-6 h-6" />}
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-[11px] font-mono text-cyan-300 font-semibold">
                    {agent.model}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white font-mono">{agent.name}</h3>
                <p className="text-xs font-mono text-cyan-400 mt-0.5">{agent.role}</p>

                <p className="mt-3 text-xs text-slate-300 leading-relaxed font-sans">
                  {agent.description}
                </p>

                {/* Input -> Output Plain Language Summary */}
                <div className="mt-5 space-y-2.5 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-400 font-semibold block mb-0.5">INPUT:</span>
                    <span className="text-slate-200">{agent.inputDescription}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-cyan-400 font-semibold block mb-0.5">OUTPUT:</span>
                    <span className="text-slate-200">{agent.outputDescription}</span>
                  </div>
                </div>

                {/* Key capabilities */}
                <div className="mt-4 space-y-1.5">
                  {agent.keyCapabilities.slice(0, 3).map((cap, i) => (
                    <div key={i} className="flex items-center space-x-2 text-[11px] font-mono text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="truncate">{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="text-[11px] font-mono text-slate-400">
                  Latency: <span className="text-white font-bold">{agent.latencyMs}ms</span>
                </div>

                <button
                  onClick={() => onSelectAgent(agent)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-mono font-medium flex items-center space-x-1 transition-colors"
                >
                  <span>Inspect Schema</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
