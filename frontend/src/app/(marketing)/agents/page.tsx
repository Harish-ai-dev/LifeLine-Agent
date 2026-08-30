'use client';

import React, { useState } from 'react';
import { 
  Cpu, 
  Activity, 
  Building2, 
  Navigation, 
  FileText, 
  BarChart3, 
  Boxes, 
  ArrowRight, 
  CheckCircle2, 
  Code2, 
  Copy, 
  Sparkles,
  Zap,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { AGENT_ROSTER, AgentInfo } from '@/data/marketing/agents';

const AgentsPage: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<AgentInfo>(AGENT_ROSTER[0]);
  const [activeTab, setActiveTab] = useState<'INPUT' | 'OUTPUT' | 'PROMPT'>('INPUT');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const iconMap: Record<string, React.ReactNode> = {
    Activity: <Activity className="w-5 h-5" />,
    Building2: <Building2 className="w-5 h-5" />,
    Navigation: <Navigation className="w-5 h-5" />,
    FileText: <FileText className="w-5 h-5" />,
    BarChart3: <BarChart3 className="w-5 h-5" />,
    Boxes: <Boxes className="w-5 h-5" />
  };

  return (
    <div className="w-full pt-28 pb-24 bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 font-sans">
      <div className="w-full w-full px-2 sm:px-4 lg:px-6 px-4 sm:px-6 lg:px-8 xl:px-10">
        
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono uppercase tracking-wider mb-4">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Autonomous Agent Roster & Schema Contracts</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            The 6 Decoupled AI Agents
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed font-sans">
            Every clinical decision, geospatial route calculation, trauma briefing, and municipal health report is handled by an explicitly engineered agent running on Google Gemini 3.1 Pro or Gemini 3.5 Flash.
          </p>
        </div>

        {/* 6 Agent Tabs Horizontal Switcher */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {AGENT_ROSTER.map((agent) => {
            const isSelected = selectedAgent.id === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`p-3.5 rounded-2xl border text-left font-mono transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-400 shadow-xl shadow-cyan-500/20 text-slate-900 dark:text-white'
                    : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-cyan-400">
                      {iconMap[agent.iconName] || <Activity className="w-4 h-4" />}
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400">{agent.latencyMs}ms</span>
                  </div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">{agent.name}</div>
                  <div className="text-[10px] text-cyan-400 truncate mt-0.5">{agent.model}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Agent Interactive Workspace */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Col: Agent Specifications & Description */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-cyan-950/80 shadow-2xl space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono mb-2">
                <span className="px-2.5 py-1 rounded-md bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
                  Model: {selectedAgent.model}
                </span>
                <span className="text-slate-400 dark:text-slate-400">
                  Latency SLA: <strong className="text-emerald-400">{selectedAgent.latencyMs}ms</strong>
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                {selectedAgent.name}
              </h2>
              <p className="text-xs font-mono text-cyan-400 mt-1">{selectedAgent.role}</p>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              {selectedAgent.description}
            </p>

            {/* Clinical Purpose Box */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-1.5">
              <div className="text-cyan-400 font-bold uppercase tracking-wider text-[10px]">Clinical Purpose:</div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans">{selectedAgent.clinicalPurpose}</p>
            </div>

            {/* Input & Output Plain Language Descriptions */}
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-400 font-bold block mb-1">RAW INPUT PAYLOAD:</span>
                <span className="text-slate-700 dark:text-slate-200 font-sans">{selectedAgent.inputDescription}</span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-cyan-400 font-bold block mb-1">DETERMINISTIC OUTPUT:</span>
                <span className="text-slate-700 dark:text-slate-200 font-sans">{selectedAgent.outputDescription}</span>
              </div>
            </div>

            {/* Guardrails */}
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-2">
                Clinical Guardrails & Verification:
              </div>
              <div className="space-y-1.5">
                {selectedAgent.keyCapabilities.map((cap, i) => (
                  <div key={i} className="flex items-center space-x-2 text-xs font-mono text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Schema & Prompt Inspector */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#090D16] border border-cyan-900/60 shadow-2xl flex flex-col justify-between">
            <div>
              {/* Tab Selector */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex space-x-2 font-mono text-xs">
                  <button
                    onClick={() => setActiveTab('INPUT')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      activeTab === 'INPUT'
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:text-white bg-white dark:bg-slate-900'
                    }`}
                  >
                    Input Sample JSON
                  </button>
                  <button
                    onClick={() => setActiveTab('OUTPUT')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      activeTab === 'OUTPUT'
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:text-white bg-white dark:bg-slate-900'
                    }`}
                  >
                    Output JSON Schema
                  </button>
                  <button
                    onClick={() => setActiveTab('PROMPT')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      activeTab === 'PROMPT'
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:text-white bg-white dark:bg-slate-900'
                    }`}
                  >
                    System Prompt
                  </button>
                </div>

                <button
                  onClick={() => handleCopy(
                    activeTab === 'INPUT' ? JSON.stringify(selectedAgent.inputSample, null, 2) :
                    activeTab === 'OUTPUT' ? JSON.stringify(selectedAgent.outputSample, null, 2) :
                    selectedAgent.promptExcerpt
                  )}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white flex items-center space-x-1"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Schema</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Canvas */}
              <div className="mt-4 font-mono text-xs">
                {activeTab === 'INPUT' && (
                  <pre className="p-4 rounded-2xl bg-black/80 text-emerald-400 overflow-x-auto text-[11px] max-h-[460px] leading-relaxed border border-slate-200 dark:border-slate-900">
                    {JSON.stringify(selectedAgent.inputSample, null, 2)}
                  </pre>
                )}

                {activeTab === 'OUTPUT' && (
                  <pre className="p-4 rounded-2xl bg-black/80 text-cyan-300 overflow-x-auto text-[11px] max-h-[460px] leading-relaxed border border-slate-200 dark:border-slate-900">
                    {JSON.stringify(selectedAgent.outputSample, null, 2)}
                  </pre>
                )}

                {activeTab === 'PROMPT' && (
                  <pre className="p-4 rounded-2xl bg-black/80 text-amber-300 overflow-x-auto text-[11px] max-h-[460px] whitespace-pre-wrap leading-relaxed border border-slate-200 dark:border-slate-900">
                    {selectedAgent.promptExcerpt}
                  </pre>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-400 dark:text-slate-400 flex items-center justify-between">
              <span>Standard Contract: Strict Pydantic / TypeScript JSON</span>
              <span className="text-cyan-400 font-bold">100% Deterministic Validated</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AgentsPage;
