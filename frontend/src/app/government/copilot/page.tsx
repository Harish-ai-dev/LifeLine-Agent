'use client';

import React, { Suspense } from 'react';
import { UnifiedCopilotPage } from '@/components/layout/UnifiedCopilotPage';

export default function GovernmentCopilotPage() {
  return (
    <div className="flex flex-col h-full min-h-0 gap-3">
      {/* Compact page label */}
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
            Directorate Surveillance &amp; AI Copilot
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            Government Authority · Regional cross-hospital oversight
          </p>
        </div>
        <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono font-bold bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 px-3 py-1.5 rounded-xl">
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
          HEALTH AUTHORITY
        </span>
      </div>

      {/* Copilot workspace — flex-1 so it fills remaining height */}
      <div className="flex-1 min-h-0">
        <Suspense fallback={<div className="text-xs font-mono p-6 text-slate-400">Loading workspace...</div>}>
          <UnifiedCopilotPage role="government_authority" />
        </Suspense>
      </div>
    </div>
  );
}
