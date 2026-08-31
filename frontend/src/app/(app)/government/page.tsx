'use client';

import React from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  ShieldCheck,
  Activity,
  Network,
  FileBarChart2,
  Bot,
  Building2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Sparkles,
  Layers,
  Cpu,
} from 'lucide-react';
import Link from 'next/link';

export default function GovernmentPage() {
  const { currentUser, authToken, dailyReport, alerts, hospitals } = useDashboard();
  const router = useRouter();

  useEffect(() => {
    if (!authToken || currentUser?.role !== 'government_authority') {
      router.push('/login');
    }
  }, [authToken, currentUser, router]);

  if (!authToken || currentUser?.role !== 'government_authority') return null;

  const totalIncidents = alerts.length;
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const acknowledgedCount = alerts.filter((a) => a.status !== 'pending_ack').length;
  const compliancePct = Math.round((acknowledgedCount / Math.max(1, totalIncidents)) * 100);

  // Total Regional Bed Capacity
  const totalIcuCapacity = hospitals.reduce((acc, h) => acc + h.totalIcuBeds, 0);
  const totalIcuAvailable = hospitals.reduce((acc, h) => acc + h.availableIcuBeds, 0);
  const regionalOccupancy = Math.round(((totalIcuCapacity - totalIcuAvailable) / Math.max(1, totalIcuCapacity)) * 100);

  return (
    <div className="space-y-6 w-full pb-16">
      {/* ── 1. REGIONAL AUTHORITY HERO COMMAND BANNER ────────────────────── */}
      <div className="bg-white dark:bg-[#0d1424] p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-indigo-600/20 shrink-0 border border-indigo-400/30">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-400/40 px-2.5 py-0.5 rounded-full font-mono">
                  REGIONAL HEALTH AUTHORITY
                </span>
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400 font-bold">
                  ZONE: MUMBAI METROPOLITAN
                </span>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  5/5 REGIONAL NODES ONLINE
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Autonomous Healthcare Oversight &amp; Crisis Orchestration
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                Google ADK Multi-Agent Telemetry · Cross-Hospital Bed Balancing · Zero Human Phone Call Latency
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs self-start lg:self-center">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase">Regional Bed Occupancy</span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{regionalOccupancy}%</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <span className="text-[10px] text-indigo-700 dark:text-indigo-400 block uppercase">SLA Compliance</span>
              <span className="text-2xl font-black text-indigo-800 dark:text-indigo-300">{compliancePct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. FOUR CORE REGIONAL TELEMETRY CARDS ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/government/network"
          className="glass-panel-glow-blue p-5 rounded-3xl transition-all duration-300 hover:scale-[1.02] cursor-pointer block space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-sky-800 dark:text-sky-300 font-mono flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Regional Active Cases
            </span>
            <ArrowUpRight className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <span className="text-4xl font-black text-slate-900 dark:text-white">{totalIncidents}</span>
            <span className="text-xs text-red-600 dark:text-red-400 font-bold">{criticalCount} Critical</span>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-sky-500/20 text-[11px] font-mono text-slate-500 dark:text-slate-400 flex justify-between">
            <span>Dispatched via ADK</span>
            <span className="text-sky-700 dark:text-sky-300">Live Grid →</span>
          </div>
        </Link>

        <Link
          href="/government/report"
          className="glass-panel-glow-emerald p-5 rounded-3xl transition-all duration-300 hover:scale-[1.02] cursor-pointer block space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 font-mono flex items-center gap-1.5">
              <FileBarChart2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              AI Intelligence Briefing
            </span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">DAILY REPORT</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Gemini 3.5</span>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-emerald-500/20 text-[11px] font-mono text-slate-500 dark:text-slate-400 flex justify-between">
            <span>Generated 06:00 IST</span>
            <span className="text-emerald-700 dark:text-emerald-300">Read Brief →</span>
          </div>
        </Link>

        <Link
          href="/government/network"
          className="glass-panel-glow-amber p-5 rounded-3xl transition-all duration-300 hover:scale-[1.02] cursor-pointer block space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 font-mono flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Regional Hospital Nodes
            </span>
            <ArrowUpRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <span className="text-4xl font-black text-slate-900 dark:text-white">{hospitals.length}</span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">{totalIcuAvailable} ICU Beds Free</span>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-amber-500/20 text-[11px] font-mono text-slate-500 dark:text-slate-400 flex justify-between">
            <span>1 Facility Diverting</span>
            <span className="text-amber-800 dark:text-amber-300">Inspect Grid →</span>
          </div>
        </Link>

        <Link
          href="/government/ask-ai"
          className="glass-panel-glow-blue p-5 rounded-3xl transition-all duration-300 hover:scale-[1.02] cursor-pointer block space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-purple-800 dark:text-purple-300 font-mono flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Ask AI Query Engine
            </span>
            <ArrowUpRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <span className="text-2xl font-black text-purple-800 dark:text-purple-300">CO-PILOT</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Natural Lang</span>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-purple-500/20 text-[11px] font-mono text-slate-500 dark:text-slate-400 flex justify-between">
            <span>Multi-Agent Search</span>
            <span className="text-purple-800 dark:text-purple-300">Launch Query →</span>
          </div>
        </Link>
      </div>

      {/* ── 3. REGIONAL HOSPITAL LOAD BALANCING MATRIX ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hospital Capacity Load Bars */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0a0f1d] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                Regional Hospital Node Telemetry &amp; Bed Reserves
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">5 Tier-1/2 Trauma Centers</span>
          </div>

          <div className="space-y-4">
            {hospitals.map((h) => {
              const occPct = Math.round(((h.totalIcuBeds - h.availableIcuBeds) / Math.max(1, h.totalIcuBeds)) * 100);
              const isHigh = occPct >= 80;

              return (
                <div key={h.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#111728] border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{h.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {h.tier}
                      </span>
                      {h.isDiverting && (
                        <span className="text-[9px] font-mono font-bold uppercase bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-500/40 px-2 py-0.5 rounded-full animate-pulse">
                          DIVERSION
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-mono text-slate-700 dark:text-slate-300">
                      <strong className={isHigh ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}>
                        {h.availableIcuBeds}
                      </strong>
                      <span className="text-slate-500"> / {h.totalIcuBeds} ICU Beds Free</span>
                    </div>
                  </div>

                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isHigh ? 'bg-red-500' : occPct >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${occPct}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-1">
                    <span>Trauma Bays: {h.availableTraumaBays} Free</span>
                    <span>Load: {occPct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Executive Action Launcher */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0a0f1d] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                Executive Oversight Tools
              </h3>
            </div>

            <div className="space-y-2.5">
              <Link
                href="/government/report"
                className="w-full p-3.5 rounded-2xl bg-indigo-50 dark:bg-gradient-to-r dark:from-indigo-950/40 dark:via-[#131b2e] dark:to-[#131b2e] hover:bg-indigo-100 dark:hover:from-indigo-900/40 dark:hover:to-slate-800 border border-indigo-200 dark:border-indigo-500/40 text-left transition-all block group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-indigo-800 dark:text-indigo-300 font-mono flex items-center gap-2">
                    <FileBarChart2 className="w-4 h-4" />
                    AI Daily Intelligence Report
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-sans">
                  Plain-language executive synthesis of regional dispatch volume &amp; strain
                </p>
              </Link>

              <Link
                href="/government/ask-ai"
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-[#111728] hover:bg-slate-100 dark:hover:bg-slate-800/90 border border-slate-200 dark:border-slate-800 text-left transition-all block group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-purple-800 dark:text-purple-300 font-mono flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    Ask AI Natural Language Search
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-sans">
                  Query across hospital incident archives and dispatch histories
                </p>
              </Link>

              <Link
                href="/government/audit"
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-[#111728] hover:bg-slate-100 dark:hover:bg-slate-800/90 border border-slate-200 dark:border-slate-800 text-left transition-all block group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-sky-800 dark:text-sky-300 font-mono flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Jurisdiction Audit Trail
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-sans">
                  Inspect immutable cryptographic logs of all autonomous dispatches
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

