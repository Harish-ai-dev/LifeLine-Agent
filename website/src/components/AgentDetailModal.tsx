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
import { AgentInfo } from '../data/agents';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl bg-[#0B1120] border border-cyan-800 shadow-2xl text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono text-xs">
            Model: {agent.model}
          </div>
          <div className="text-xs font-mono text-slate-400">
            Avg Latency: <strong className="text-white">{agent.latencyMs}ms</strong>
          </div>
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold font-mono text-white">
          {agent.name}
        </h3>
        <p className="text-xs font-mono text-cyan-400 mt-1">{agent.role}</p>

        <p className="mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-mono">
          {agent.description}
        </p>

        {/* Clinical Purpose Callout */}
        <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs space-y-1">
          <div className="text-cyan-400 font-bold uppercase tracking-wider text-[10px]">Clinical Purpose:</div>
          <p className="text-slate-300">{agent.clinicalPurpose}</p>
        </div>

        {/* Tabs for Schema & Prompt */}
        <div className="mt-6 flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex space-x-2 font-mono text-xs">
            <button
              onClick={() => setActiveTab('INPUT')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'INPUT'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Input JSON Schema
            </button>
            <button
              onClick={() => setActiveTab('OUTPUT')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'OUTPUT'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Output JSON Schema
            </button>
            <button
              onClick={() => setActiveTab('PROMPT')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'PROMPT'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
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
            className="text-xs font-mono text-slate-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
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
            <pre className="p-4 rounded-xl bg-black/60 text-emerald-400 overflow-x-auto text-[11px] max-h-72 leading-relaxed">
              {JSON.stringify(agent.inputSample, null, 2)}
            </pre>
          )}

          {activeTab === 'OUTPUT' && (
            <pre className="p-4 rounded-xl bg-black/60 text-cyan-300 overflow-x-auto text-[11px] max-h-72 leading-relaxed">
              {JSON.stringify(agent.outputSample, null, 2)}
            </pre>
          )}

          {activeTab === 'PROMPT' && (
            <pre className="p-4 rounded-xl bg-black/60 text-amber-300 overflow-x-auto text-[11px] max-h-72 whitespace-pre-wrap leading-relaxed">
              {agent.promptExcerpt}
            </pre>
          )}
        </div>

        {/* Key capabilities list */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2">Key Guardrails & Capabilities:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {agent.keyCapabilities.map((cap, i) => (
              <div key={i} className="flex items-center space-x-2 text-xs font-mono text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span>{cap}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
