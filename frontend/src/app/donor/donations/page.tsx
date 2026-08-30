'use client';

import React from 'react';
import { useDashboard } from '../../../context/DashboardContext';
import {
  Calendar,
  Award,
  Building2,
  Droplets,
  Clock,
  Heart,
  TrendingUp,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { soundEffects } from '../../../utils/soundEffects';

export default function DonorDonationsPage() {
  const { currentDonor } = useDashboard();

  // Create a realistic timeline based on totalDonations count
  const nextEligibleDate = new Date();
  // Assume last donation was 20 days ago
  const lastDonationDate = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
  nextEligibleDate.setTime(lastDonationDate.getTime() + 56 * 24 * 60 * 60 * 1000); // 56 days cycle

  const daysRemaining = Math.max(
    0,
    Math.ceil((nextEligibleDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  // Generate historical donations array
  const donationHistory = [
    {
      id: 'don-1',
      date: lastDonationDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      facility: 'Lilavati Hospital & Research Centre',
      type: 'Whole Blood',
      units: 1,
      status: 'verified',
      impact: 'Emergency STEMI Case Support',
    },
    {
      id: 'don-2',
      date: new Date(lastDonationDate.getTime() - 75 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      facility: 'P. D. Hinduja National Hospital',
      type: 'Whole Blood',
      units: 1,
      status: 'verified',
      impact: 'Cardiac Surgery Support',
    },
    {
      id: 'don-3',
      date: new Date(lastDonationDate.getTime() - 150 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      facility: 'KEM Hospital Parel',
      type: 'Whole Blood',
      units: 1,
      status: 'verified',
      impact: 'Trauma Transfusion Protocol',
    },
  ].slice(0, currentDonor.totalDonations || 3);

  const handleDownloadCertificate = (id: string) => {
    soundEffects.playTelemetryPing();
    alert(`Downloading verified clinical donation certificate for transaction: ${id}`);
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#0d1424] p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Award className="w-4 h-4 text-rose-600" />
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-rose-600 dark:text-rose-400">
            Donor Recognition Log
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Your Donation Milestones
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
          History of verified clinical donations, logs, and impact telemetry
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Eligibility Card */}
        <div className="bg-white dark:bg-[#0d1424] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/50 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-slate-400 block uppercase">NEXT ELIGIBILITY</span>
            <span className="text-base font-bold text-slate-900 dark:text-white block mt-0.5">
              {daysRemaining > 0 ? `In ${daysRemaining} Days` : 'Eligible Now'}
            </span>
            <span className="text-[10px] text-slate-500">Cycle: 56 days whole blood</span>
          </div>
        </div>

        {/* Lives Impacted Card */}
        <div className="bg-white dark:bg-[#0d1424] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/50 shrink-0">
            <Heart className="w-5 h-5 fill-emerald-600" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-slate-400 block uppercase">ESTIMATED LIVES SAVED</span>
            <span className="text-base font-bold text-slate-900 dark:text-white block mt-0.5">
              ~{(currentDonor.totalDonations || 3) * 3} Lives
            </span>
            <span className="text-[10px] text-slate-500">1 unit whole blood saves 3 lives</span>
          </div>
        </div>

        {/* Level / Streak Card */}
        <div className="bg-white dark:bg-[#0d1424] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/50 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-slate-400 block uppercase">RECOGNITION RANK</span>
            <span className="text-base font-bold text-slate-900 dark:text-white block mt-0.5">
              {currentDonor.badgeTitle || 'Platinum Guardian'}
            </span>
            <span className="text-[10px] text-slate-500">Active community health responder</span>
          </div>
        </div>
      </div>

      {/* Donation History Timeline */}
      <div className="bg-white dark:bg-[#0d1424] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
        <h3 className="font-bold text-slate-900 dark:text-white font-mono text-xs uppercase border-b border-slate-100 dark:border-slate-800 pb-3">
          Verified Donation Chronology
        </h3>

        {donationHistory.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs font-mono">
            No donation logs registered on this account yet.
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3.5 pl-6 space-y-8">
            {donationHistory.map((don) => (
              <div key={don.id} className="relative">
                {/* Timeline Node Point */}
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-rose-600 border-4 border-white dark:border-[#0d1424]" />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {don.date}
                      </span>
                      <span className="text-[9px] font-mono font-bold uppercase bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.2 rounded border border-emerald-100 dark:border-emerald-500/20">
                        {don.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{don.facility}</span>
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {don.units} Unit ({don.type})
                      </span>
                      <span>·</span>
                      <span>{don.impact}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleDownloadCertificate(don.id)}
                    className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Download className="w-3 h-3" />
                    <span>CERTIFICATE</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

