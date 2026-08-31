'use client';

import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Building2,
  Stethoscope,
  Droplets,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  Activity,
  Heart,
  MapPin,
  Cpu,
  Radio,
  Users,
  Zap,
} from 'lucide-react';
import { DEMO_USERS } from '../../data/mockDashboardData';
import { soundEffects } from '../../utils/soundEffects';
import { Suspense } from 'react';

type RoleKey = 'hospital_staff' | 'blood_donor' | 'government_authority';

const PORTALS = [
  {
    id: 'hospital',
    role: 'hospital_staff' as RoleKey,
    label: 'Hospital Console',
    sublabel: 'Institutional Access',
    emoji: '🏥',
    Icon: Building2,
    gradient: 'from-sky-600 to-cyan-600',
    gradientHover: 'hover:from-sky-500 hover:to-cyan-500',
    glow: 'shadow-sky-500/30',
    border: 'border-sky-200 dark:border-sky-700',
    ring: 'focus:ring-sky-500/30 focus:border-sky-500',
    btnBg: 'bg-sky-600 hover:bg-sky-500',
    btnShadow: 'shadow-sky-600/25',
    hintColor: 'text-sky-700 dark:text-sky-300',
    hintBg: 'bg-sky-50 dark:bg-sky-500/10 border-sky-100 dark:border-sky-500/20',
    activeBorder: 'border-sky-500 dark:border-sky-400',
    hint: 'dr_mehta · nurse_rao · dr_verma',
    placeholder: 'e.g. dr_mehta',
    stats: [
      { icon: Activity, text: 'ER Bays Active' },
      { icon: Users, text: 'ICU Occupancy 78%' },
      { icon: Cpu, text: 'Triage Agent Ready' },
    ],
  },
  {
    id: 'staff',
    role: 'hospital_staff' as RoleKey,
    label: 'Clinical Staff',
    sublabel: 'Doctor / Nurse',
    emoji: '🩺',
    Icon: Stethoscope,
    gradient: 'from-teal-600 to-emerald-600',
    gradientHover: 'hover:from-teal-500 hover:to-emerald-500',
    glow: 'shadow-teal-500/30',
    border: 'border-teal-200 dark:border-teal-700',
    ring: 'focus:ring-teal-500/30 focus:border-teal-500',
    btnBg: 'bg-teal-600 hover:bg-teal-500',
    btnShadow: 'shadow-teal-600/25',
    hintColor: 'text-teal-700 dark:text-teal-300',
    hintBg: 'bg-teal-50 dark:bg-teal-500/10 border-teal-100 dark:border-teal-500/20',
    activeBorder: 'border-teal-500 dark:border-teal-400',
    hint: 'dr_mehta · nurse_rao · dr_verma',
    placeholder: 'e.g. nurse_rao',
    stats: [
      { icon: Heart, text: 'Vitals Monitoring Live' },
      { icon: Activity, text: '3 Patients In Care' },
    ],
  },
  {
    id: 'donor',
    role: 'blood_donor' as RoleKey,
    label: 'Blood Donor',
    sublabel: 'Citizen Health Pass',
    emoji: '🩸',
    Icon: Droplets,
    gradient: 'from-rose-600 to-red-600',
    gradientHover: 'hover:from-rose-500 hover:to-red-500',
    glow: 'shadow-rose-500/30',
    border: 'border-rose-200 dark:border-rose-700',
    ring: 'focus:ring-rose-500/30 focus:border-rose-500',
    btnBg: 'bg-rose-600 hover:bg-rose-500',
    btnShadow: 'shadow-rose-600/25',
    hintColor: 'text-rose-700 dark:text-rose-300',
    hintBg: 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20',
    activeBorder: 'border-rose-500 dark:border-rose-400',
    hint: 'rahul_sharma · sneha_patil · vikram_deshpande',
    placeholder: 'e.g. rahul_sharma',
    stats: [
      { icon: Droplets, text: 'Eligibility Tracker Live' },
      { icon: MapPin, text: '2 STAT Requests Nearby' },
      { icon: Radio, text: 'Dispatch Radar Active' },
    ],
  },
  {
    id: 'government',
    role: 'government_authority' as RoleKey,
    label: 'Health Authority',
    sublabel: 'Director / Inspector',
    emoji: '🏛️',
    Icon: ShieldCheck,
    gradient: 'from-indigo-700 to-purple-700',
    gradientHover: 'hover:from-indigo-600 hover:to-purple-600',
    glow: 'shadow-indigo-500/30',
    border: 'border-indigo-200 dark:border-indigo-700',
    ring: 'focus:ring-indigo-500/30 focus:border-indigo-500',
    btnBg: 'bg-indigo-700 hover:bg-indigo-600',
    btnShadow: 'shadow-indigo-700/25',
    hintColor: 'text-indigo-700 dark:text-indigo-300',
    hintBg: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20',
    activeBorder: 'border-indigo-500 dark:border-indigo-400',
    hint: 'dir_sharma · analyst_rao',
    placeholder: 'e.g. dir_sharma',
    stats: [
      { icon: ShieldCheck, text: '12 Hospitals Monitored' },
      { icon: Activity, text: 'Compliance 94%' },
      { icon: Cpu, text: 'AI Reporting Ready' },
    ],
  },
] as const;

type PortalDef = (typeof PORTALS)[number];

export function LoginView({ isModal = false }: { isModal?: boolean }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100 dark:bg-[#060a12]" />}>
      <LoginContent isModal={isModal} />
    </Suspense>
  );
}

function LoginContent({ isModal = false }: { isModal?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const [selected, setSelected] = useState<PortalDef | null>(null);

  const handleSelect = (portal: PortalDef) => {
    soundEffects.playTelemetryPing();
    setSelected(portal);
  };

  const handleBack = () => {
    soundEffects.playTelemetryPing();
    setSelected(null);
  };

  return (
    <div
      className={`${
        isModal ? 'h-full rounded-2xl overflow-y-auto' : 'min-h-screen'
      } flex flex-col bg-slate-100 dark:bg-[#050810] transition-colors duration-200`}
    >
      {/* ── Top bar ──────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#08091a] border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          {/* Square logo — no distortion */}
          <div className="w-9 h-9 overflow-hidden bg-white border border-slate-200 dark:border-slate-700 shadow-md shrink-0">
            <img
              src="/logo.png"
              alt="LifeLine"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="font-black text-base text-slate-900 dark:text-white tracking-tight">
              LifeLine
            </span>
            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 font-mono font-bold">
              AGENT v2.4
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            SYSTEM ONLINE
          </div>
          <button
            onClick={() => { soundEffects.playTelemetryPing(); toggleTheme(); }}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </header>

      {/* ── Step content ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        {!selected ? (
          // ── STEP 1: Portal selection grid ─────────────────────
          <div className="w-full max-w-4xl">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Select Your Portal
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-mono">
                Click a card to open the sign-in form
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {PORTALS.map((portal) => {
                const { Icon } = portal;
                return (
                  <button
                    key={portal.id}
                    onClick={() => handleSelect(portal)}
                    className={`group flex flex-col rounded-3xl border-2 ${portal.border} bg-white dark:bg-[#0e1120] shadow-md hover:shadow-xl hover:${portal.glow} overflow-hidden transition-all duration-300 hover:-translate-y-1 text-left cursor-pointer`}
                  >
                    {/* Card gradient header */}
                    <div className={`bg-gradient-to-br ${portal.gradient} ${portal.gradientHover} px-5 py-6 relative overflow-hidden transition-all`}>
                      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
                      <div className="absolute right-0 bottom-0 w-12 h-12 rounded-full bg-white/10 translate-x-4 translate-y-4" />
                      <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mb-3 shadow-inner group-hover:scale-110 transition-transform">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-base font-black text-white tracking-tight">{portal.label}</h2>
                        <p className="text-[11px] text-white/70 font-mono mt-0.5">{portal.sublabel}</p>
                      </div>
                    </div>

                    {/* Stats + CTA */}
                    <div className="flex-1 px-5 py-4 space-y-2">
                      {portal.stats.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          <s.icon className="w-3 h-3 shrink-0" />
                          {s.text}
                        </div>
                      ))}
                    </div>

                    <div className={`mx-5 mb-5 py-2.5 rounded-xl bg-gradient-to-r ${portal.gradient} text-white text-xs font-black font-mono flex items-center justify-center gap-2 group-hover:gap-3 transition-all`}>
                      SIGN IN <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          // ── STEP 2: Login form for selected portal ─────────────
          <div className="w-full max-w-md">
            {/* Back button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to portal selection
            </button>

            {/* Form card */}
            <div className={`rounded-3xl border-2 ${selected.activeBorder} bg-white dark:bg-[#0e1120] shadow-xl ${selected.glow} overflow-hidden`}>
              {/* Portal header */}
              <div className={`bg-gradient-to-br ${selected.gradient} px-7 py-7 relative overflow-hidden`}>
                <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
                <div className="absolute right-4 -bottom-8 w-20 h-20 rounded-full bg-white/10" />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shadow-inner shrink-0">
                    <selected.Icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono font-bold text-white/60 uppercase tracking-widest mb-1">
                      {selected.sublabel}
                    </p>
                    <h2 className="text-xl font-black text-white tracking-tight">{selected.label}</h2>
                    <p className="text-xs text-white/70 font-mono mt-0.5">Enter your credentials below</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <LoginForm portal={selected} />
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-[10px] font-mono text-slate-400 dark:text-slate-600 pb-6">
        LifeLine Agent · Multi-Role Emergency System · Demo Mode
      </p>
    </div>
  );
}

// ── Login form (shown after portal selected) ─────────────────────────────────
function LoginForm({ portal }: { portal: PortalDef }) {
  const { login } = useDashboard();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) { setError('Please enter your username.'); return; }
    if (!password.trim()) { setError('Please enter your password.'); return; }

    setIsLoading(true);
    soundEffects.playAcknowledgeChime();

    const match =
      DEMO_USERS.find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.role === portal.role
      ) || DEMO_USERS.find((u) => u.role === portal.role);

    if (!match) {
      setError(`No account found for "${username}" in this portal.`);
      setIsLoading(false);
      soundEffects.playEmergencySiren();
      return;
    }

    try {
      setSuccess(`Authenticating ${match.username}…`);
      await login(match.username, match.role, match.facility_id, match.donor_id);
    } catch {
      setError('Authentication error. Please try again.');
      setIsLoading(false);
      setSuccess('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-7 py-6 space-y-4">
      {/* Username */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-mono font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Username
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={portal.placeholder}
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(''); }}
            autoFocus
            className={`w-full pl-10 pr-4 py-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 ${portal.ring} text-slate-900 dark:text-white placeholder:text-slate-400 font-mono transition-all`}
            autoComplete="username"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-mono font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type={showPw ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            className={`w-full pl-10 pr-11 py-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 ${portal.ring} text-slate-900 dark:text-white placeholder:text-slate-400 font-mono transition-all`}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Error / Success */}
      {error && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30 text-xs text-red-700 dark:text-red-300 font-mono">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
        </div>
      )}
      {success && !error && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 animate-pulse" />{success}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3.5 px-6 ${portal.btnBg} text-white font-mono font-black text-sm rounded-2xl shadow-lg ${portal.btnShadow} flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed transition-all mt-2`}
      >
        {isLoading ? (
          <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />AUTHENTICATING…</>
        ) : (
          <><Zap className="w-4 h-4" />SIGN IN<ArrowRight className="w-4 h-4" /></>
        )}
      </button>

      {/* Demo hint */}
      <div className={`flex items-start gap-2 p-3 rounded-xl border text-[11px] font-mono ${portal.hintBg} ${portal.hintColor}`}>
        <span className="shrink-0 mt-0.5">💡</span>
        <span>
          <span className="font-bold opacity-70">Demo: </span>
          {portal.hint}
          <span className="block opacity-60 mt-0.5">Any password works in demo mode.</span>
        </span>
      </div>
    </form>
  );
}
