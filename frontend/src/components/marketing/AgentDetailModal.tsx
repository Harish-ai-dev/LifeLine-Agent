'use client';

import React, { useState } from 'react';
import { 
  X, 
  Code2, 
  Copy, 
  CheckCircle2, 
  Activity, 
  Building2, 
  Navigation, 
  FileText, 
  BarChart3, 
  Boxes,
  Cpu,
  Clock,
  Sparkles
} from 'lucide-react';
import { AgentInfo } from '@/data/marketing/agents';

interface AgentDetailModalProps {
  agent: AgentInfo | null;
  onClose: () => void;
}

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({ agent, onClose }) => {
  const [activeTab, setActiveTab] = useState<'INPUT' | 'OUTPUT' | 'PROMPT'>('INPUT');
  const [copied, setCopied] = useState(false);

  if (!agent) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl text-slate-800">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 font-mono text-xs font-bold">
            Model: {agent.model}
          </div>
          <div className="text-xs font-mono text-slate-500">
            Avg Latency: <strong className="text-slate-900">{agent.latencyMs}ms</strong>
          </div>
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
          {agent.name}
        </h3>
        <p className="text-xs font-mono text-cyan-700 mt-0.5 font-semibold">{agent.role}</p>

        <p className="mt-4 text-xs sm:text-sm text-slate-650 leading-relaxed font-mono">
          {agent.description}
        </p>

        {/* Clinical Purpose Callout */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-250 font-mono text-xs space-y-1">
          <div className="text-cyan-755 font-bold uppercase tracking-wider text-[10px]">Clinical Purpose:</div>
          <p className="text-slate-655">{agent.clinicalPurpose}</p>
        </div>

        {/* Tabs for Schema & Prompt */}
        <div className="mt-6 flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex space-x-2 font-mono text-xs">
            <button
              onClick={() => setActiveTab('INPUT')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'INPUT'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-550 hover:text-slate-900'
              }`}
            >
              Input JSON Schema
            </button>
            <button
              onClick={() => setActiveTab('OUTPUT')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'OUTPUT'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-550 hover:text-slate-900'
              }`}
            >
              Output JSON Schema
            </button>
            <button
              onClick={() => setActiveTab('PROMPT')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'PROMPT'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-550 hover:text-slate-900'
              }`}
            >
              System Prompt Excerpt
            </button>
          </div>

          <button
            onClick={() => handleCopy(
              activeTab === 'INPUT' ? JSON.stringify(agent.inputSample, null, 2) :
              activeTab === 'OUTPUT' ? JSON.stringify(agent.outputSample, null, 2) :
              agent.promptExcerpt
            )}
            className="text-xs font-mono text-slate-500 hover:text-cyan-700 flex items-center space-x-1"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-emerald-700 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Code Canvas */}
        <div className="mt-4 font-mono text-xs">
          {activeTab === 'INPUT' && (
            <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-emerald-700 overflow-x-auto text-[11px] max-h-72 leading-relaxed shadow-inner">
              {JSON.stringify(agent.inputSample, null, 2)}
            </pre>
          )}

          {activeTab === 'OUTPUT' && (
            <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-cyan-750 overflow-x-auto text-[11px] max-h-72 leading-relaxed shadow-inner">
              {JSON.stringify(agent.outputSample, null, 2)}
            </pre>
          )}

          {activeTab === 'PROMPT' && (
            <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-amber-700 overflow-x-auto text-[11px] max-h-72 whitespace-pre-wrap leading-relaxed shadow-inner">
              {agent.promptExcerpt}
            </pre>
          )}
        </div>

        {/* Key capabilities list */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2">Key Guardrails & Capabilities:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
            {agent.keyCapabilities.map((cap, i) => (
              <div key={i} className="flex items-center space-x-2 text-xs font-mono text-slate-655">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
                <span>{cap}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
