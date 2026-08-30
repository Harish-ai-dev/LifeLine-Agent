'use client';

import React from 'react';
import { Activity, RefreshCw } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50 dark:bg-[#060a12] text-slate-900 dark:text-slate-100 transition-colors duration-150">
      {/* Outer Glow & Radar Effect */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing Outer Rings */}
        <div className="absolute w-36 h-36 rounded-full border border-red-500/20 dark:border-red-500/10 animate-ping duration-[3000ms]" />
        <div className="absolute w-24 h-24 rounded-full border border-sky-500/20 dark:border-sky-500/10 animate-ping duration-[2000ms]" />
        
        {/* Rotating Circular Ring */}
        <div className="w-20 h-20 rounded-full border-[3px] border-slate-200 dark:border-slate-800 border-t-red-600 dark:border-t-rose-500 animate-spin" />
        
        {/* Center Pulsing Logo Container */}
        <div className="absolute w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-sky-600 flex items-center justify-center text-white shadow-xl shadow-red-500/20 animate-pulse">
          <Activity className="w-6 h-6 animate-pulse" />
        </div>
      </div>

      {/* Terminal-like status messages */}
      <div className="mt-8 text-center space-y-2">
        <h2 className="text-sm font-black tracking-wider uppercase font-mono text-slate-900 dark:text-white">
          LifeLine Emergency Grid
        </h2>
        <div className="flex flex-col items-center justify-center gap-1 font-mono text-[10px] text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Establishing Secure Handshake...</span>
          </div>
          <div className="flex items-center justify-between w-full max-w-[240px]">
            <span>Orchestrator (Root Agent):</span>
            <span className="text-emerald-400 font-bold animate-pulse flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" /> LOOPING
            </span>
          </div>
          <div className="flex items-center gap-1 text-[9px] opacity-75">
            <span>Triage L2: READY</span>
            <span className="mx-1.5">·</span>
            <span>Gemini: SYNCED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
