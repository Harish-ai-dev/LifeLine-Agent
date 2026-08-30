import React from 'react';
import { ShieldCheck, Scale, Lock, FileCode, ExternalLink } from 'lucide-react';

export const PrivacyTermsPage: React.FC = () => {
  return (
    <div className="w-full pt-28 pb-24 bg-[#0B1120] text-slate-100 font-sans">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 space-y-12 font-mono text-xs">
        
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 text-xs uppercase tracking-wider mb-4">
            <Scale className="w-3.5 h-3.5" />
            <span>Legal, Safety & Governance</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-sans">
            Privacy Policy & Apache 2.0 Open Source Terms
          </h1>
          <p className="mt-2 text-slate-400">Last updated: February 2025 • LifeLine Agent Project</p>
        </div>

        {/* Section 1: Apache 2.0 License */}
        <section className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span>1. Apache License Version 2.0</span>
          </h2>
          <p className="text-slate-300 leading-relaxed font-sans text-xs">
            LifeLine Agent is open source software licensed under the Apache License, Version 2.0. You may obtain a copy of the License at{' '}
            <a 
              href="https://github.com/Harish-ai-dev/LifeLine-Agent/blob/main/LICENSE" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-cyan-400 underline"
            >
              https://github.com/Harish-ai-dev/LifeLine-Agent/blob/main/LICENSE
            </a>.
          </p>
          <p className="text-slate-400 leading-relaxed">
            Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
          </p>
        </section>

        {/* Section 2: Clinical Safety Disclaimer */}
        <section className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>2. Clinical Safety & Simulation Disclaimer</span>
          </h2>
          <p className="text-slate-300 leading-relaxed font-sans text-xs">
            LifeLine Agent is a technology demonstration built for the Google Gemini AI Hackathon. While clinical calculations conform to the published Royal College of Physicians NEWS2 algorithm, the software is provided for research, testing, and evaluation purposes and must not be used as an unvalidated primary diagnostic device without proper regulatory certification.
          </p>
        </section>

        {/* Section 3: HIPAA & Synthetic Data */}
        <section className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Lock className="w-4 h-4 text-purple-400" />
            <span>3. HIPAA Compliance & Zero-PHI Architecture</span>
          </h2>
          <p className="text-slate-300 leading-relaxed font-sans text-xs">
            All clinical cases, patient profiles, and medical telemetry displayed on this public project website are 100% synthetic scenarios generated according to standard ATLS/ACLS medical education guidelines. Zero Protected Health Information (PHI) is stored or ingested.
          </p>
        </section>

      </div>
    </div>
  );
};
