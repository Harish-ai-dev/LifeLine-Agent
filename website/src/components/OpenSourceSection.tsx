import React, { useState } from 'react';
import { 
  FileCode, 
  Github, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Terminal, 
  GitPullRequest, 
  ShieldCheck, 
  BookOpen
} from 'lucide-react';
import { PROJECT_METADATA } from '../data/team';

export const OpenSourceSection: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const quickstartSnippets = [
    {
      label: '1. Clone Official Repository',
      code: `git clone https://github.com/Harish-ai-dev/LifeLine-Agent.git\ncd LifeLine-Agent`
    },
    {
      label: '2. Configure Environment & Dependencies',
      code: `cp .env.example .env\n# Set GEMINI_API_KEY, OSRM_URL, and SUPABASE_ANON_KEY\npip install -r requirements.txt`
    },
    {
      label: '3. Run Autonomous Multi-Agent Mesh',
      code: `docker compose up -d\n# Or run local agent coordinator:\npython -m lifeline_agent.server --port 8000`
    }
  ];

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section id="open-source" className="py-24 bg-[#080E1A] relative border-t border-slate-900 scroll-mt-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono uppercase tracking-wider mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open Source & Permissive Licensing</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Apache 2.0 Licensed. Built for the Public Good.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300 font-sans">
            LifeLine Agent is open source under the Apache 2.0 license. Emergency medical infrastructure belongs in the open so municipal dispatchers, healthcare providers, and developers can audit, extend, and deploy it anywhere in the world.
          </p>
        </div>

        {/* Quickstart Developer Code Cards */}
        <div className="mt-16 max-w-4xl mx-auto space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs pb-2 border-b border-slate-800">
            <span className="font-bold text-white flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Developer Quickstart Guide</span>
            </span>
            <a
              href="https://github.com/Harish-ai-dev/LifeLine-Agent"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>View on GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {quickstartSnippets.map((snippet, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#0B1120] border border-slate-800 relative group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 font-semibold">{snippet.label}</span>
                <button
                  onClick={() => handleCopy(snippet.code, idx)}
                  className="text-slate-400 hover:text-cyan-300 flex items-center space-x-1 text-[11px]"
                >
                  {copiedIndex === idx ? (
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
              <pre className="p-3 rounded-lg bg-black/60 text-cyan-300 overflow-x-auto text-[11px] leading-relaxed">
                {snippet.code}
              </pre>
            </div>
          ))}
        </div>

        {/* Contributing & Roadmap Pointer */}
        <div className="mt-12 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 flex flex-col justify-between">
            <div>
              <GitPullRequest className="w-6 h-6 text-cyan-400 mb-3" />
              <h4 className="font-bold text-white text-sm">How to Contribute</h4>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed font-sans">
                We welcome PRs for clinical protocol test fixtures, regional OSRM profiles, and FHIR interoperability connectors.
              </p>
            </div>
            <a 
              href="https://github.com/Harish-ai-dev/LifeLine-Agent/blob/main/CONTRIBUTING.md" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mt-4 text-[11px] text-cyan-400 hover:underline flex items-center space-x-1"
            >
              <span>CONTRIBUTING.md in Repo</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 flex flex-col justify-between">
            <div>
              <BookOpen className="w-6 h-6 text-emerald-400 mb-3" />
              <h4 className="font-bold text-white text-sm">Clinical Safety Testing</h4>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed font-sans">
                Every PR runs our automated 250+ NEWS2 deterministic test suite to guarantee 100% adherence to clinical scoring.
              </p>
            </div>
            <div className="mt-4 text-[11px] text-emerald-400">pytest tests/clinical/ →</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 flex flex-col justify-between">
            <div>
              <FileCode className="w-6 h-6 text-purple-400 mb-3" />
              <h4 className="font-bold text-white text-sm">Apache 2.0 License</h4>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed font-sans">
                Permissive open-source license allows non-profit EMS agencies and commercial healthcare networks to deploy freely.
              </p>
            </div>
            <a 
              href="https://github.com/Harish-ai-dev/LifeLine-Agent/blob/main/LICENSE" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mt-4 text-[11px] text-purple-400 hover:underline flex items-center space-x-1"
            >
              <span>LICENSE.md Included</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
