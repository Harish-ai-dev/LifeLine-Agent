'use client';

import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Activity,
  Building2,
  Stethoscope,
  Droplets,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Zap,
} from 'lucide-react';
import { DEMO_USERS } from '../../data/mockDashboardData';
import { soundEffects } from '../../utils/soundEffects';

type LoginCategory = 'hospital' | 'staff' | 'donor' | 'government';

const PORTALS: { id: LoginCategory; label: string; sublabel: string; icon: React.ElementType; color: string; accent: string; hint: string }[] = [
  {
    id: 'hospital',
    label: 'Hospital Console',
    sublabel: 'Institutional Access',
    icon: Building2,
    color: 'sky',
    accent: 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/30',
    hint: 'admin_lil / any password',
  },
  {
    id: 'staff',
    label: 'Clinical Staff',
    sublabel: 'Doctor / Nurse Sign-In',
    icon: Stethoscope,
    color: 'sky',
    accent: 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/30',
    hint: 'dr_mehta  ·  nurse_rao  ·  dr_verma',
  },
  {
    id: 'donor',
    label: 'Blood Donor',
    sublabel: 'Citizen Health Pass',
    icon: Droplets,
    color: 'rose',
    accent: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-600/30',
    hint: 'rahul_sharma  ·  sneha_patil  ·  vikram_deshpande',
  },
  {
    id: 'government',
    label: 'Health Authority',
    sublabel: 'Inspector / Director',
    icon: ShieldCheck,
    color: 'indigo',
    accent: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30',
    hint: 'dir_sharma  ·  analyst_rao',
  },
];

const ROLE_MAP: Record<LoginCategory, string> = {
  hospital: 'hospital_staff',
  staff: 'hospital_staff',
  donor: 'blood_donor',
  government: 'government_authority',
};

export default function LoginPage() {
  const { login } = useDashboard();
  const { theme, toggleTheme } = useTheme();

  const [activePortal, setActivePortal] = useState<LoginCategory>('hospital');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const portal = PORTALS.find((p) => p.id === activePortal)!;

  const handlePortalSwitch = (id: LoginCategory) => {
    setActivePortal(id);
    setError('');
    setUsername('');
    setPassword('');
    soundEffects.playTelemetryPing();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter your username or credentials.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password or access code.');
      return;
    }

    setIsLoggingIn(true);
    soundEffects.playAcknowledgeChime();

    const targetRole = ROLE_MAP[activePortal];

    // Find user in demo list — match by username (case-insensitive)
    const demoUser = DEMO_USERS.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.role === targetRole
    ) || DEMO_USERS.find(
      (u) => u.role === targetRole // fallback: first user of that role
    );

    if (!demoUser) {
      setError(`No account found for "${username}" in the ${portal.label} portal.`);
      setIsLoggingIn(false);
      soundEffects.playEmergencySiren();
      return;
    }

    try {
      setSuccess(`Authenticating ${demoUser.username}...`);
      await login(demoUser.username, demoUser.role as any, demoUser.facility_id, demoUser.donor_id);
    } catch {
      setError('Authentication error. Please try again.');
      setIsLoggingIn(false);
    }
  };

  const fillDemoCredentials = (uname: string) => {
    setUsername(uname);
    setPassword('lifeline2026');
    setError('');
    soundEffects.playTelemetryPing();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060a12] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-150">
      {/* ── TOP HEADER BAR ───────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f1e]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-sky-600 flex items-center justify-center text-white shadow-md shadow-red-500/20">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="font-black text-base text-slate-900 dark:text-white tracking-tight">LifeLine</span>
            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 font-mono font-bold">
              AGENT v2.4
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            SYSTEM ONLINE
          </div>
          <button
            onClick={() => {
              soundEffects.playTelemetryPing();
              toggleTheme();
            }}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-8 items-start lg:items-stretch">

          {/* ── LEFT: Portal Selector ──────────────────────────────────── */}
          <div className="w-full lg:w-72 shrink-0 space-y-3">
            <div className="mb-4">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Sign In</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">Select your portal, then enter credentials</p>
            </div>

            {PORTALS.map((p) => {
              const Icon = p.icon;
              const isActive = activePortal === p.id;
              const colorMap: Record<string, string> = {
                sky: 'text-sky-600 dark:text-sky-400',
                rose: 'text-rose-600 dark:text-rose-400',
                indigo: 'text-indigo-600 dark:text-indigo-400',
              };
              const activeBgMap: Record<string, string> = {
                sky: 'bg-sky-50 dark:bg-sky-500/10 border-sky-500 dark:border-sky-500',
                rose: 'bg-rose-50 dark:bg-rose-500/10 border-rose-500 dark:border-rose-500',
                indigo: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 dark:border-indigo-500',
              };
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePortalSwitch(p.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border text-left transition-all duration-200 ${
                    isActive
                      ? `${activeBgMap[p.color]} shadow-sm`
                      : 'bg-white dark:bg-[#0d1424] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${isActive ? (p.color === 'rose' ? 'bg-rose-100 dark:bg-rose-500/20' : p.color === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-500/20' : 'bg-sky-100 dark:bg-sky-500/20') : 'bg-slate-100 dark:bg-slate-800'}`}>
                    <Icon className={`w-4 h-4 ${isActive ? colorMap[p.color] : 'text-slate-500 dark:text-slate-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-bold ${isActive ? 'text-slate-900 dark:text-white' : ''}`}>{p.label}</div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">{p.sublabel}</div>
                  </div>
                  {isActive && <div className={`w-1.5 h-1.5 rounded-full ${p.color === 'rose' ? 'bg-rose-500' : p.color === 'indigo' ? 'bg-indigo-500' : 'bg-sky-500'} animate-pulse shrink-0`} />}
                </button>
              );
            })}

            {/* System Status Block */}
            <div className="mt-6 p-4 bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">
                <Cpu className="w-3 h-3" /> AI Pipeline Status
              </div>
              {[
                { label: 'L1 Orchestrator', val: 'ACTIVE', color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'L2 Triage Agent', val: 'READY', color: 'text-sky-600 dark:text-sky-400' },
                { label: 'Gemini 3.5 Flash', val: 'CONNECTED', color: 'text-purple-600 dark:text-purple-400' },
              ].map((s) => (
                <div key={s.label} className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-slate-600 dark:text-slate-400">{s.label}</span>
                  <span className={`font-bold ${s.color}`}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Login Form ──────────────────────────────────────── */}
          <div className="flex-1">
            <div className="bg-white dark:bg-[#0d1424] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {/* Form Header Banner */}
              <div className={`px-8 py-6 border-b border-slate-100 dark:border-slate-800 ${
                portal.color === 'rose'
                  ? 'bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/40 dark:to-[#0d1424]'
                  : portal.color === 'indigo'
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-[#0d1424]'
                  : 'bg-gradient-to-r from-sky-50 to-slate-50 dark:from-sky-950/40 dark:to-[#0d1424]'
              }`}>
                <div className="flex items-center gap-3">
                  {React.createElement(portal.icon, {
                    className: `w-5 h-5 ${portal.color === 'rose' ? 'text-rose-600' : portal.color === 'indigo' ? 'text-indigo-600' : 'text-sky-600'}`,
                  })}
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">{portal.label} Sign-In</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{portal.sublabel}</p>
                  </div>
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                {/* Username Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Username / Staff ID
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => { setUsername(e.target.value); setError(''); }}
                      placeholder={
                        activePortal === 'hospital' ? 'e.g.  admin_lil' :
                        activePortal === 'staff' ? 'e.g.  dr_mehta' :
                        activePortal === 'donor' ? 'e.g.  rahul_sharma' :
                        'e.g.  dir_sharma'
                      }
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40 dark:focus:ring-sky-500/30 focus:border-sky-500 transition-all font-mono"
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Password / Access Code
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      placeholder="Enter your access code"
                      className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40 dark:focus:ring-sky-500/30 focus:border-sky-500 transition-all font-mono"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error / Success Banner */}
                {error && (
                  <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30 text-xs text-red-700 dark:text-red-300 font-mono">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {success && !error && (
                  <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 font-mono">
                    <CheckCircle2 className="w-4 h-4 shrink-0 animate-pulse" />
                    <span>{success}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className={`w-full py-3.5 px-6 ${portal.accent} text-white font-mono font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2`}
                >
                  {isLoggingIn ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>AUTHENTICATING...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>SIGN IN TO {portal.label.toUpperCase()}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Demo Credentials</span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                </div>

                {/* Demo Credential Quick-Fill Buttons */}
                <div className="space-y-2">
                  <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    Click to auto-fill demo user credentials for this portal:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activePortal === 'hospital' && (
                      <button type="button" onClick={() => fillDemoCredentials('admin_lil')}
                        className="px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 text-sky-800 dark:text-sky-300 text-[11px] font-mono font-bold hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-colors">
                        👨‍⚕️ admin_lil (Lilavati Admin)
                      </button>
                    )}
                    {activePortal === 'staff' && (
                      <>
                        <button type="button" onClick={() => fillDemoCredentials('dr_mehta')}
                          className="px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 text-sky-800 dark:text-sky-300 text-[11px] font-mono font-bold hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-colors">
                          👨‍⚕️ dr_mehta (ER Physician)
                        </button>
                        <button type="button" onClick={() => fillDemoCredentials('nurse_rao')}
                          className="px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 text-sky-800 dark:text-sky-300 text-[11px] font-mono font-bold hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-colors">
                          👩‍⚕️ nurse_rao (Charge Nurse)
                        </button>
                        <button type="button" onClick={() => fillDemoCredentials('dr_verma')}
                          className="px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 text-sky-800 dark:text-sky-300 text-[11px] font-mono font-bold hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-colors">
                          👨‍⚕️ dr_verma (Cardiologist)
                        </button>
                      </>
                    )}
                    {activePortal === 'donor' && (
                      <>
                        <button type="button" onClick={() => fillDemoCredentials('rahul_sharma')}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-[11px] font-mono font-bold hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors">
                          🩸 rahul_sharma (O- Universal)
                        </button>
                        <button type="button" onClick={() => fillDemoCredentials('sneha_patil')}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-[11px] font-mono font-bold hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors">
                          🩸 sneha_patil (B+)
                        </button>
                        <button type="button" onClick={() => fillDemoCredentials('vikram_deshpande')}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-[11px] font-mono font-bold hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors">
                          🩸 vikram_deshpande (AB-)
                        </button>
                      </>
                    )}
                    {activePortal === 'government' && (
                      <>
                        <button type="button" onClick={() => fillDemoCredentials('dir_sharma')}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-800 dark:text-indigo-300 text-[11px] font-mono font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
                          🏛️ dir_sharma (Health Director)
                        </button>
                        <button type="button" onClick={() => fillDemoCredentials('analyst_rao')}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-800 dark:text-indigo-300 text-[11px] font-mono font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
                          📊 analyst_rao (Operations Analyst)
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Footer Note */}
            <p className="text-center text-[11px] font-mono text-slate-400 dark:text-slate-600 mt-5">
              LifeLine Agent · Multi-Role Emergency Auth Gateway · Demo Mode Active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
