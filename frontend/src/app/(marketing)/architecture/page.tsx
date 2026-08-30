import React from 'react';
import { TechStack } from '@/components/marketing/TechStack';
import { Layers } from 'lucide-react';

const ArchitecturePage: React.FC = () => {
  return (
    <div className="w-full pt-28 pb-24 bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 font-sans">
      <div className="w-full w-full px-2 sm:px-4 lg:px-6 px-4 sm:px-6 lg:px-8 xl:px-10">
        
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-mono uppercase tracking-wider mb-4">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Multi-Agent System Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            End-to-End System Architecture
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed font-sans">
            How LifeLine Agent orchestrates Google Gemini frontier models, high-performance OSRM geospatial engines, and serverless Cloud Run containers to deliver sub-2-second emergency dispatch.
          </p>
        </div>

        {/* Systems Architecture Deep Dive Component */}
        <div className="mt-8">
          <TechStack />
        </div>

      </div>
    </div>
  );
};

export default ArchitecturePage;
