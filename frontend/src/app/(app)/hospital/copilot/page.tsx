'use client';

import React, { Suspense } from 'react';
import { UnifiedCopilotPage } from '@/components/layout/UnifiedCopilotPage';

export default function HospitalCopilotPage() {
  return (
    <div className="flex flex-col h-full min-h-0 gap-3">
      {/* Compact page label — minimal height so copilot gets maximum room */}
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
            AI Operations &amp; Dispatch Copilot
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            Hospital Console · Grounded in live ICU telemetry and dispatcher logs
          </p>
        </div>
        <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 px-3 py-1.5 rounded-xl">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
          HOSPITAL CONSOLE
        </span>
      </div>

      {/* Copilot workspace — flex-1 so it fills remaining height */}
      <div className="flex-1 min-h-0">
        <Suspense fallback={<div className="text-xs font-mono p-6 text-slate-400">Loading workspace...</div>}>
          <UnifiedCopilotPage role="hospital_staff" />
        </Suspense>
      </div>
    </div>
  );
}
