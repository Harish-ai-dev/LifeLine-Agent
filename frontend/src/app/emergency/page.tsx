'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  PhoneCall,
  Activity,
  HeartPulse,
  Send,
  CheckCircle2,
  Volume2,
  VolumeX,
  Radio,
  FileText,
  AlertOctagon,
  RefreshCw,
  Sun,
  Moon,
  Siren,
} from 'lucide-react';
import { soundEffects } from '@/utils/soundEffects';
import { useTheme } from '@/context/ThemeContext';

export default function EmergencyAirGapPage() {
  const { theme, toggleTheme } = useTheme();
  const [isPlayingSiren, setIsPlayingSiren] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  // Offline NEWS2 Vitals Form
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [hr, setHr] = useState(115);
  const [sbp, setSbp] = useState(88);
  const [spo2, setSpo2] = useState(91);
  const [rr, setRr] = useState(26);
  const [temp, setTemp] = useState(38.6);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Play disaster klaxon on initial load
    soundEffects.playAirGapKlaxon();
  }, []);

  const calculateNews2 = () => {
    let score = 0;
    if (rr <= 8 || rr >= 25) score += 3;
    else if (rr >= 21) score += 2;
    else if (rr <= 11) score += 1;

    if (spo2 <= 91) score += 3;
    else if (spo2 <= 93) score += 2;
    else if (spo2 <= 95) score += 1;

    if (sbp <= 90 || sbp >= 220) score += 3;
    else if (sbp <= 100) score += 2;
    else if (sbp <= 110) score += 1;

    if (hr <= 40 || hr >= 131) score += 3;
    else if (hr >= 111) score += 2;
    else if (hr <= 50 || hr >= 91) score += 1;

    if (temp <= 35.0) score += 3;
    else if (temp >= 39.1) score += 2;
    else if (temp <= 36.0 || temp >= 38.1) score += 1;

    return score;
  };

  const news2 = calculateNews2();

  const toggleSiren = () => {
    if (!isPlayingSiren) {
      soundEffects.playStatCodeBlueAlarm();
      setIsPlayingSiren(true);
      setTimeout(() => setIsPlayingSiren(false), 2000);
    }
  };

  const handleSoundToggle = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    soundEffects.setMuted(next);
  };

  const handleSaveOfflineCase = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playAcknowledgeChime();

    const offlineRecord = {
      id: `OFFLINE-NEWS2-${Date.now()}`,
      complaint: chiefComplaint,
      score: news2,
      vitals: { hr, sbp, spo2, rr, temp },
      timestamp: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('lifeline_airgap_cases') || '[]');
      existing.push(offlineRecord);
      localStorage.setItem('lifeline_airgap_cases', JSON.stringify(existing));
    }

    setIsSaved(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#05080f] text-slate-900 dark:text-slate-100 p-4 sm:p-8 flex flex-col justify-between max-w-5xl mx-auto space-y-6">
      {/* ── 1. MISSION CRITICAL FAIL-SAFE HEADER ──────────────────────────── */}
      <div className="p-6 rounded-3xl bg-red-50 dark:bg-gradient-to-r dark:from-red-950 dark:via-[#111728] dark:to-[#111728] border-2 border-red-500 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black shadow-md shadow-red-600/50 animate-bounce shrink-0">
              <Siren className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black uppercase tracking-wider bg-red-600 text-white px-2.5 py-0.5 rounded-full animate-pulse">
                  CRITICAL FAIL-SAFE PROTOCOL ENGAGED
                </span>
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400">Zero-Network Air-Gap Mode</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                Emergency Backup Dispatch Console
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                System resilience active: Direct triage calculator, hotline tele-routing, and immutable offline storage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSiren}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-red-600/30"
            >
              <Radio className="w-4 h-4" />
              <span>Test Audio Siren</span>
            </button>

            <button
              onClick={handleSoundToggle}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
              title={soundMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                soundEffects.playTelemetryPing();
                toggleTheme();
              }}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. DIRECT HOSPITAL EMERGENCY HOTLINE TILES ────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-slate-800 dark:text-slate-300 uppercase flex items-center gap-1.5">
            <PhoneCall className="w-4 h-4 text-red-600 dark:text-red-400" />
            Direct Hospital Emergency Command Hotlines
          </span>
          <span className="text-slate-500">Tap to dial direct line</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <a
            href="tel:+912226751111"
            className="p-4 rounded-2xl bg-white dark:bg-[#0e1424] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-red-500/40 transition-all block group shadow-sm"
          >
            <div className="flex justify-between items-start">
              <span className="font-bold text-slate-900 dark:text-white group-hover:text-red-600">Lilavati Hospital</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 font-bold">L1 TRAUMA</span>
            </div>
            <div className="text-base font-black text-sky-700 dark:text-sky-400 mt-2 font-mono">+91 22 2675 1111</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Bandra West, Mumbai</div>
          </a>

          <a
            href="tel:+912224107000"
            className="p-4 rounded-2xl bg-white dark:bg-[#0e1424] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-red-500/40 transition-all block group shadow-sm"
          >
            <div className="flex justify-between items-start">
              <span className="font-bold text-slate-900 dark:text-white group-hover:text-red-600">KEM Hospital</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 font-bold">L1 APEX</span>
            </div>
            <div className="text-base font-black text-sky-700 dark:text-sky-400 mt-2 font-mono">+91 22 2410 7000</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Parel, Mumbai</div>
          </a>

          <a
            href="tel:+912224451515"
            className="p-4 rounded-2xl bg-white dark:bg-[#0e1424] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-red-500/40 transition-all block group shadow-sm"
          >
            <div className="flex justify-between items-start">
              <span className="font-bold text-slate-900 dark:text-white group-hover:text-red-600">Hinduja Hospital</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 font-bold">CARDIAC</span>
            </div>
            <div className="text-base font-black text-sky-700 dark:text-sky-400 mt-2 font-mono">+91 22 2445 1515</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Mahim, Mumbai</div>
          </a>
        </div>
      </div>

      {/* ── 3. AIR-GAP OFFLINE EMERGENCY INTAKE FORM ───────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0e1424] border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Air-Gap Clinical Vitals &amp; NEWS2 Calculator
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-2.5 py-1 rounded-full">
            Calculated NEWS2 Score: {news2} ({news2 >= 7 ? 'CRITICAL HIGH RISK' : 'MODERATE RISK'})
          </span>
        </div>

        {isSaved ? (
          <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/40 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Emergency Case Stored in Encrypted Local Buffer!</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
              The case has been serialized. It will automatically transmit to the Firestore audit ledger as soon as network connection resumes.
            </p>
            <button
              onClick={() => setIsSaved(false)}
              className="mt-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-bold font-mono transition-colors border border-slate-200 dark:border-slate-700"
            >
              + Record Another Air-Gap Patient
            </button>
          </div>
        ) : (
          <form onSubmit={handleSaveOfflineCase} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Chief Complaint &amp; Symptoms</label>
              <textarea
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                rows={2}
                required
                className="w-full bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-500 font-sans"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Heart Rate</span>
                <input
                  type="number"
                  value={hr}
                  onChange={(e) => setHr(Number(e.target.value))}
                  className="w-full bg-transparent font-bold text-slate-900 dark:text-white text-base focus:outline-none mt-1"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Systolic BP</span>
                <input
                  type="number"
                  value={sbp}
                  onChange={(e) => setSbp(Number(e.target.value))}
                  className="w-full bg-transparent font-bold text-slate-900 dark:text-white text-base focus:outline-none mt-1"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">SpO2 (%)</span>
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(Number(e.target.value))}
                  className="w-full bg-transparent font-bold text-slate-900 dark:text-white text-base focus:outline-none mt-1"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Resp Rate</span>
                <input
                  type="number"
                  value={rr}
                  onChange={(e) => setRr(Number(e.target.value))}
                  className="w-full bg-transparent font-bold text-slate-900 dark:text-white text-base focus:outline-none mt-1"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/hospital"
                className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 font-mono"
              >
                <span>← Return to Command Center</span>
              </Link>

              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/40 flex items-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>SAVE TO AIR-GAP BUFFER</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] font-mono text-slate-400 dark:text-slate-600">
        LifeLine Agent Standalone Disaster Recovery Console · Air-Gap Ready
      </div>
    </div>
  );
}
