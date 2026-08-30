'use client';

import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import {
  Droplets,
  Heart,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  ArrowUpRight,
  UserCheck,
  Calendar,
  Sparkles,
  Radio,
} from 'lucide-react';

export default function DonorPage() {
  const { currentUser, authToken, currentDonor, donorRequests } = useDashboard();
  const router = useRouter();

  useEffect(() => {
    if (!authToken || currentUser?.role !== 'blood_donor') {
      router.push('/login');
    }
  }, [authToken, currentUser, router]);

  if (!authToken || currentUser?.role !== 'blood_donor') return null;

  // Find if there is any active request matched with THIS active donor
  const activeMatch = donorRequests.find((req) =>
    req.matchedDonors.some((m) => m.donorId === currentDonor.id)
  );

  const matchedEntry = activeMatch?.matchedDonors.find((m) => m.donorId === currentDonor.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* ── 1. DONOR HERO BADGE PASS ──────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0d1424] p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600 to-red-700 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-rose-600/20 shrink-0 border border-rose-400/40">
              <Droplets className="w-8 h-8 fill-white" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-400/40 px-2.5 py-0.5 rounded-full font-mono">
                  {currentDonor.badgeTitle}
                </span>
                <span className="text-xs font-mono font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-500/20">
                  BLOOD GROUP: {currentDonor.bloodGroup}
                </span>
                {currentDonor.isOrganDonor && (
                  <span className="text-[10px] font-bold bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-400/30 px-2.5 py-0.5 rounded-full font-mono">
                    NOTTO PLEDGED
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {currentDonor.fullName}
              </h1>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-sans">
                <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{currentDonor.address}</span>
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-800 text-center font-mono text-xs shrink-0 shadow-sm">
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block uppercase flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              ELIGIBLE TO DONATE
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 block">{currentDonor.totalDonations} Total Donations</span>
            <span className="text-[10px] text-slate-500">Lives Impacted: ~{currentDonor.totalDonations * 3}</span>
          </div>
        </div>
      </div>

      {/* ── 2. ACTIVE STAT MATCH ALERT (IF ANY) ────────────────────────────── */}
      {activeMatch && (
        <div className="p-6 rounded-3xl bg-red-50 dark:bg-gradient-to-r dark:from-red-950/60 dark:via-[#111728] dark:to-[#111728] border-2 border-red-500 shadow-md space-y-4 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black animate-pulse shadow-lg shadow-red-600/50">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-black uppercase bg-red-600 text-white px-2 py-0.5 rounded">
                  🚨 LIVE STAT EMERGENCY MATCH
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                  {activeMatch.hospitalName} Needs {activeMatch.unitsRequested} Unit(s) of {activeMatch.bloodGroupNeeded}
                </h3>
              </div>
            </div>

            {matchedEntry && (
              <div className="text-right font-mono text-xs">
                <span className="text-red-600 dark:text-red-400 font-bold block">Distance: {matchedEntry.distanceKm} km</span>
                <span className="text-slate-600 dark:text-slate-400">ETA: {matchedEntry.etaMinutes} mins</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
            <strong>Clinical Urgency:</strong> {activeMatch.clinicalIndication} Auto-matched by Google ADK RequestMatchingCoordinator based on verified {currentDonor.bloodGroup} compatibility.
          </p>

          <div className="flex justify-end gap-3 pt-2 border-t border-red-200 dark:border-red-500/30">
            <Link
              href="/donor/requests"
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs rounded-xl shadow-md shadow-red-600/40 transition-all flex items-center gap-2"
            >
              <span>View Emergency Navigation Radar</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* ── 3. QUICK NAVIGATION TILES ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/donor/requests"
          className="bg-white dark:bg-[#0e1424] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 block space-y-2 group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-600/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
              <Droplets className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-transform group-hover:translate-x-0.5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">STAT Callouts</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">View nearby hospital emergency requests</p>
        </Link>

        <Link
          href="/donor/donations"
          className="bg-white dark:bg-[#0e1424] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 block space-y-2 group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
              <Heart className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-transform group-hover:translate-x-0.5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Donation History</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Past verified donations &amp; certificates</p>
        </Link>

        <Link
          href="/donor/profile"
          className="bg-white dark:bg-[#0e1424] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 block space-y-2 group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-transform group-hover:translate-x-0.5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Digital Health ID</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Update location &amp; NOTTO pledge</p>
        </Link>
      </div>
    </div>
  );
}
