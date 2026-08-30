'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { soundEffects } from '@/utils/soundEffects';
import { Siren, PhoneCall, RefreshCw, AlertTriangle, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children?: ReactNode;
  fallbackMessage?: string;
  isRoot?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('LifeLine Uncaught Incident:', error, errorInfo);
    try {
      soundEffects.playFailureKlaxon();
    } catch (e) {
      // Audio fallback
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.isRoot) {
        return (
          <div className="min-h-screen bg-[#05080f] text-slate-100 flex flex-col items-center justify-center p-6 select-none">
            <div className="max-w-xl w-full bg-[#0d1424] rounded-3xl border-2 border-red-500 shadow-2xl p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-red-600/30 text-red-400 border border-red-500/50 flex items-center justify-center mx-auto shadow-xl shadow-red-600/40 animate-bounce">
                <Siren className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-red-600 text-white px-2.5 py-0.5 rounded-full animate-pulse">
                  CRITICAL INCIDENT INTERCEPTOR
                </span>
                <h1 className="text-2xl font-black text-white mt-2">
                  System Exception Trapped · Air-Gap Active
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  LifeLine fail-safe protocol prevented total lockout. Emergency dispatch capabilities remain 100% operational.
                </p>
              </div>

              <div className="bg-[#080d16] p-4 rounded-2xl border border-red-500/30 text-left overflow-hidden">
                <span className="text-[10px] font-mono text-slate-500 block mb-1">INTERCEPTED TRACE:</span>
                <code className="text-xs text-red-400 font-mono break-all">
                  {this.state.error?.message || 'Unspecified runtime exception'}
                </code>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <a
                  href="/emergency"
                  className="py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>AIR-GAP CONSOLE</span>
                </a>

                <button
                  onClick={() => window.location.reload()}
                  className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>RELOAD PORTAL</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-red-400" />
                <span>DIRECT REGIONAL DISPATCH HOTLINE: <strong className="text-white">+91 22 2675 1111</strong></span>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="p-6 bg-[#0e1424] border border-red-500/30 rounded-2xl text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-red-400 font-bold text-xs font-mono">
            <AlertTriangle className="w-4 h-4" />
            <span>Component Circuit-Breaker Engaged</span>
          </div>
          <p className="text-slate-400 text-xs font-mono">
            {this.props.fallbackMessage || 'This view encountered an error. Other modules remain active.'}
          </p>
          <div className="flex justify-center gap-3 pt-1">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-1.5 text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors border border-slate-700"
            >
              Retry Component
            </button>
            <a
              href="/emergency"
              className="px-4 py-1.5 text-xs font-mono font-bold bg-red-600/30 hover:bg-red-600/40 text-red-300 border border-red-500/40 rounded-xl transition-colors"
            >
              Open Air-Gap Console →
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
