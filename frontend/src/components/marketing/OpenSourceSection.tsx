'use client';

import React, { useState } from 'react';
import { 
  FileCode, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Terminal, 
  GitPullRequest, 
  ShieldCheck, 
  BookOpen
} from 'lucide-react';
import { Github } from '@/components/icons/GithubIcon';
import { PROJECT_METADATA } from '@/data/marketing/team';

export const OpenSourceSection: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const quickstartSnippets = [
    {
      label: '1. Clone Official Repository',
      code: `git clone https://github.com/Harish-ai-dev/LifeLine-Agent.git\ncd LifeLine-Agent`
    },
    {
      label: '2. Configure Environment & Dependencies',
      code: `cp .env.example .env\n# Set GEMINI_API_KEY and GCP_PROJECT_ID\npip install -r requirements.txt`
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
    <section id="open-source" className="py-12 bg-[#F8FAFC] relative border-t border-slate-200 scroll-mt-20">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-655 text-xs font-mono uppercase tracking-wider mb-4 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
            <span>Open Source & Permissive Licensing</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Apache 2.0 Licensed. Built for the Public Good.
          </h2>

          <p className="mt-4 text-sm sm:text-base text-slate-650 font-sans">
            LifeLine Agent is open source under the Apache 2.0 license. Emergency medical infrastructure belongs in the open so municipal dispatchers, healthcare providers, and developers can audit, extend, and deploy it anywhere in the world.
          </p>
        </div>

        {/* Quickstart Developer Code Cards */}
        <div className="mt-8 max-w-4xl mx-auto space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs pb-2 border-b border-slate-250">
            <span className="font-bold text-slate-900 flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-cyan-600" />
              <span>Developer Quickstart Guide</span>
            </span>
            <a
              href="https://github.com/Harish-ai-dev/LifeLine-Agent"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-700 hover:text-cyan-800 flex items-center space-x-1"
            >
              <span>View on GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {quickstartSnippets.map((snippet, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative group shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-500 font-semibold">{snippet.label}</span>
                <button
                  onClick={() => handleCopy(snippet.code, idx)}
                  className="text-slate-550 hover:text-cyan-700 flex items-center space-x-1 text-[11px]"
                >
                  {copiedIndex === idx ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-650" />
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
              <pre className="p-3 rounded-lg bg-white border border-slate-250 text-cyan-850 overflow-x-auto text-[11px] leading-relaxed shadow-inner">
                {snippet.code}
              </pre>
            </div>
          ))}
        </div>

        {/* Contributing & Roadmap Pointer */}
        <div className="mt-12 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-5 rounded-2xl bg-white border border-slate-250 shadow-sm flex flex-col justify-between">
            <div>
              <GitPullRequest className="w-6 h-6 text-cyan-650 mb-3" />
              <h4 className="font-bold text-slate-900 text-sm">How to Contribute</h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed font-sans">
                We welcome PRs for clinical protocol test fixtures, regional OSRM profiles, and FHIR interoperability connectors.
              </p>
            </div>
            <a 
              href="https://github.com/Harish-ai-dev/LifeLine-Agent/blob/main/CONTRIBUTING.md" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mt-4 text-[11px] text-cyan-700 hover:underline flex items-center space-x-1 font-bold"
            >
              <span>CONTRIBUTING.md in Repo</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-250 shadow-sm flex flex-col justify-between">
            <div>
              <BookOpen className="w-6 h-6 text-emerald-650 mb-3" />
              <h4 className="font-bold text-slate-900 text-sm">Clinical Safety Testing</h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed font-sans">
                Every PR runs our automated 250+ NEWS2 deterministic test suite to guarantee 100% adherence to clinical scoring.
              </p>
            </div>
            <div className="mt-4 text-[11px] text-emerald-700 font-bold">pytest tests/clinical/ →</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-250 shadow-sm flex flex-col justify-between">
            <div>
              <FileCode className="w-6 h-6 text-purple-650 mb-3" />
              <h4 className="font-bold text-slate-900 text-sm">Apache 2.0 License</h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed font-sans">
                Permissive open-source license allows non-profit EMS agencies and commercial healthcare networks to deploy freely.
              </p>
            </div>
            <a 
              href="https://github.com/Harish-ai-dev/LifeLine-Agent/blob/main/LICENSE" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mt-4 text-[11px] text-purple-700 hover:underline flex items-center space-x-1 font-bold"
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
