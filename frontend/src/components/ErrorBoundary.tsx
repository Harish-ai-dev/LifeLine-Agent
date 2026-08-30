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
          <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 select-none">
            <div className="max-w-xl w-full bg-white rounded-3xl border-2 border-red-500 shadow-2xl p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 border border-red-200 flex items-center justify-center mx-auto shadow-xl shadow-red-600/20 animate-bounce">
                <Siren className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-red-600 text-white px-2.5 py-0.5 rounded-full animate-pulse">
                  CRITICAL INCIDENT INTERCEPTOR
                </span>
                <h1 className="text-2xl font-black text-slate-900 mt-2">
                  System Exception Trapped · Air-Gap Active
                </h1>
                <p className="text-xs text-slate-600 font-mono mt-1">
                  LifeLine fail-safe protocol prevented total lockout. Emergency dispatch capabilities remain 100% operational.
                </p>
              </div>

              <div className="bg-red-50/60 p-4 rounded-2xl border border-red-200 text-left overflow-hidden">
                <span className="text-[10px] font-mono text-red-700 font-bold block mb-1">INTERCEPTED TRACE:</span>
                <code className="text-xs text-red-700 font-mono break-all">
                  {this.state.error?.message || 'Unspecified runtime exception'}
                </code>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <a
                  href="/emergency"
                  className="py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-mono font-bold text-xs rounded-xl shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 transition-all"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>AIR-GAP CONSOLE</span>
                </a>

                <button
                  onClick={() => window.location.reload()}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>RELOAD PORTAL</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-200 text-xs font-mono text-slate-600 flex items-center justify-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-red-600" />
                <span>DIRECT REGIONAL DISPATCH HOTLINE: <strong className="text-slate-900">+91 22 2675 1111</strong></span>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="p-6 bg-white border border-red-200 rounded-2xl text-center space-y-3 shadow-sm">
          <div className="flex items-center justify-center gap-2 text-red-600 font-bold text-xs font-mono">
            <AlertTriangle className="w-4 h-4" />
            <span>Component Circuit-Breaker Engaged</span>
          </div>
          <p className="text-slate-600 text-xs font-mono">
            {this.props.fallbackMessage || 'This section encountered an unexpected render issue.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-mono font-bold border border-slate-200 transition-colors"
          >
            Retry Component
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
