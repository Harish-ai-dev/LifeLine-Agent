'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Terminal, 
  Code2, 
  Copy, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  Server,
  Zap,
  Github
} from 'lucide-react';
import { PROJECT_METADATA } from '@/data/marketing/team';

const DocsPage: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="w-full pt-28 pb-24 bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 font-sans">
      <div className="w-full w-full px-2 sm:px-4 lg:px-6 px-4 sm:px-6 lg:px-8 xl:px-10">
        
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 text-xs font-mono uppercase tracking-wider mb-4">
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>Developer Documentation & API Reference</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            LifeLine Agent Developer Guide
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed font-sans">
            API contracts, local environment spin-up, Docker compose topology, and clinical test execution.
          </p>
        </div>

        {/* Documentation Sections */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Docs Content */}
          <div className="lg:col-span-8 space-y-10 font-mono text-xs">
            
            {/* Quickstart */}
            <section className="p-6 rounded-3xl bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <span>1. Local Quickstart & Setup</span>
              </h2>
              
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans text-sm">
                To run the multi-agent orchestration engine locally with live Gemini API keys and a local OSRM routing backend:
              </p>

              <div className="relative">
                <pre className="p-4 rounded-xl bg-black/70 text-cyan-300 overflow-x-auto text-[11px] leading-relaxed">
{`# 1. Clone official repository
git clone https://github.com/Harish-ai-dev/LifeLine-Agent.git
cd LifeLine-Agent

# 2. Configure environment
cp .env.example .env
# Set GEMINI_API_KEY and GCP_PROJECT_ID

# 3. Install Python dependencies
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 4. Run local agent coordinator
python -m lifeline.server --port 8000`}
                </pre>
                <button
                  onClick={() => handleCopy(`git clone https://github.com/Harish-ai-dev/LifeLine-Agent.git\ncd LifeLine-Agent\ncp .env.example .env\npip install -r requirements.txt\npython -m lifeline.server --port 8000`, 'quickstart')}
                  className="absolute top-3 right-3 p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white"
                >
                  {copiedKey === 'quickstart' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </section>

            {/* Docker Deployment */}
            <section className="p-6 rounded-3xl bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Server className="w-5 h-5 text-emerald-400" />
                <span>2. Docker Compose Infrastructure</span>
              </h2>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans text-sm">
                Deploy the complete stack including the C++ OSRM car routing engine, FastAPI coordinator, and Redis message queue:
              </p>

              <pre className="p-4 rounded-xl bg-black/70 text-emerald-300 overflow-x-auto text-[11px] leading-relaxed">
{`version: '3.8'
services:
  lifeline-coordinator:
    build: .
    ports:
      - "8000:8000"
    environment:
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
      - OSRM_BACKEND_URL=http://osrm-engine:5000
    depends_on:
      - osrm-engine

  osrm-engine:
    image: osrm/osrm-backend:latest
    ports:
      - "5000:5000"
    volumes:
      - ./data/osrm:/data
    command: osrm-routed --algorithm mld /data/california-latest.osrm`}
              </pre>
            </section>

            {/* Clinical Test Suite */}
            <section className="p-6 rounded-3xl bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <span>3. Running the Clinical NEWS2 Test Suite</span>
              </h2>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans text-sm">
                Every commit must pass 250+ deterministic NEWS2 clinical test fixtures validated against the Royal College of Physicians test matrix:
              </p>

              <pre className="p-4 rounded-xl bg-black/70 text-amber-300 overflow-x-auto text-[11px] leading-relaxed">
{`# Execute clinical pytest suite
pytest tests/clinical/test_news2_deterministic.py -v

# Run agent schema validation
pytest tests/agents/test_gemini_schemas.py --benchmark`}
              </pre>
            </section>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6 font-mono text-xs">
            <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Repository Specs</h3>
              <div className="space-y-2 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                  <span>License:</span>
                  <strong className="text-slate-900 dark:text-white">Apache 2.0</strong>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                  <span>Python:</span>
                  <strong className="text-slate-900 dark:text-white">3.11+</strong>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                  <span>FastAPI:</span>
                  <strong className="text-slate-900 dark:text-white">0.110.0</strong>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                  <span>Gemini SDK:</span>
                  <strong className="text-cyan-400">google-genai 0.1+</strong>
                </div>
              </div>

              <a
                href="https://github.com/Harish-ai-dev/LifeLine-Agent"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center justify-center space-x-2"
              >
                <Github className="w-4 h-4" />
                <span>Open GitHub Repo</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DocsPage;
