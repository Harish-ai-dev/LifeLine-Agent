'use client';

import React, { useState } from 'react';
import { useDashboard } from '../../../context/DashboardContext';
import {
  Users,
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  Heart,
  Droplets,
  Save,
  CheckCircle,
  Bell,
} from 'lucide-react';
import { soundEffects } from '../../../utils/soundEffects';

export default function DonorProfilePage() {
  const { currentDonor } = useDashboard();
  
  // Local state for toggle preferences
  const [availability, setAvailability] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [organPledge, setOrganPledge] = useState(currentDonor.isOrganDonor || false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playAcknowledgeChime();
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0d1424] p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-4 h-4 text-rose-600" />
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-rose-600 dark:text-rose-400">
            Secure Member Profile
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Digital Donor ID Profile
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
          Manage your credentials, organ donor NOTTO pledge, and alert preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Card: Digital Donor Pass */}
        <div className="md:col-span-1 bg-gradient-to-br from-rose-600 to-red-700 text-white rounded-3xl p-6 shadow-xl border border-rose-500 flex flex-col justify-between h-[380px] relative overflow-hidden">
          {/* Wave/Glow Decor */}
          <div className="absolute right-0 bottom-0 w-36 h-36 bg-white/5 rounded-full blur-2xl" />

          {/* Card Top */}
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase font-mono opacity-80 block">
                  LIFELINE EMERGENCY ID
                </span>
                <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded mt-1 inline-block">
                  BLOOD GROUP: {currentDonor.bloodGroup}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center border border-white/25">
                <Droplets className="w-5 h-5 fill-white" />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black tracking-tight">{currentDonor.fullName}</h3>
              <span className="text-[10px] font-mono opacity-80 mt-0.5 block">ID: {currentDonor.id}</span>
            </div>
          </div>

          {/* QR Code / Scan Placeholder */}
          <div className="bg-white p-3 rounded-2xl w-32 h-32 mx-auto flex flex-col items-center justify-center border border-rose-700/20 shadow-md">
            {/* Simple simulated QR blocks using SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
              <rect x="0" y="0" width="25" height="25" fill="currentColor" />
              <rect x="75" y="0" width="25" height="25" fill="currentColor" />
              <rect x="0" y="75" width="25" height="25" fill="currentColor" />
              <rect x="35" y="35" width="30" height="30" fill="currentColor" />
              <rect x="10" y="45" width="15" height="15" fill="currentColor" />
              <rect x="45" y="10" width="20" height="15" fill="currentColor" />
              <rect x="70" y="45" width="10" height="25" fill="currentColor" />
            </svg>
          </div>

          {/* Card Bottom */}
          <div className="flex justify-between items-center text-[10px] font-mono border-t border-white/10 pt-3">
            <span>REGIONAL DIVISION IV</span>
            <span className="font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> SECURE
            </span>
          </div>
        </div>

        {/* Right Area: Preferences & Forms */}
        <div className="md:col-span-2 space-y-6">
          <form
            onSubmit={handleSaveSettings}
            className="bg-white dark:bg-[#0d1424] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-6"
          >
            <h3 className="font-bold text-slate-900 dark:text-white font-mono text-xs uppercase border-b border-slate-100 dark:border-slate-800 pb-3">
              Member Configuration
            </h3>

            {/* Profile Fields (Read-Only/Static) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Registered Name</span>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{currentDonor.fullName}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Emergency Opt-In</span>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Platinum Member</div>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Emergency Dispatch Location</span>
                <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{currentDonor.address}</span>
                </div>
              </div>
            </div>

            {/* Switch Configs */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Active Availability Status
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                    Receive STAT emergency donor requests within 5km radius
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAvailability(!availability)}
                  className={`w-10 h-6 rounded-full transition-all relative ${
                    availability ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      availability ? 'left-5' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    SMS Priority Dispatch Callouts
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                    Bypass notifications and text alerts for STAT critical units
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSmsAlerts(!smsAlerts)}
                  className={`w-10 h-6 rounded-full transition-all relative ${
                    smsAlerts ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      smsAlerts ? 'left-5' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    NOTTO Pledge Organ Donation
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                    Affiliated with National Organ and Tissue Transplant Organisation
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOrganPledge(!organPledge)}
                  className={`w-10 h-6 rounded-full transition-all relative ${
                    organPledge ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      organPledge ? 'left-5' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Save Buttons & Confirmation Banner */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
              {isSaved ? (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">
                  <CheckCircle className="w-4 h-4" />
                  <span>PREFERENCES UPDATED SECURELY</span>
                </div>
              ) : (
                <div className="text-[10px] font-mono text-slate-400">
                  Last login: {new Date().toLocaleDateString()}
                </div>
              )}
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-mono font-bold text-[11px] rounded-xl flex items-center gap-2 shadow"
              >
                <Save className="w-3.5 h-3.5" />
                <span>SAVE PREFERENCES</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
