'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboard } from '../context/DashboardContext';
import { Activity, ShieldCheck, Droplets, Building2, Stethoscope, ChevronDown, Bot, ArrowRight } from 'lucide-react';

const LOGIN_OPTIONS = [
  { role: 'hospital_staff', label: 'Hospital Admin', icon: Building2, color: 'text-sky-500', user: 'dr_mehta' },
  { role: 'hospital_staff', label: 'Clinical Staff (ER)', icon: Stethoscope, color: 'text-sky-400', user: 'dr_mehta' },
  { role: 'government_authority', label: 'Health Authority', icon: ShieldCheck, color: 'text-indigo-500', user: 'dir_sharma' },
  { role: 'blood_donor', label: 'Blood Donor', icon: Droplets, color: 'text-rose-500', user: 'rahul_sharma' },
];

export default function LandingPage() {
  const router = useRouter();
  const { login } = useDashboard();
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleQuickLogin = async (username: string, role: string) => {
    setIsLoggingIn(true);
    setIsLoginDropdownOpen(false);
    try {
      await login(username, role as any, 'hosp_mumbai_01', 'DNR-001');
      if (role === 'blood_donor') router.push('/donor');
      else if (role === 'hospital_staff') router.push('/hospital');
      else if (role === 'government_authority') router.push('/government');
    } catch (e) {
      console.error(e);
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-blue-500/30 overflow-hidden relative flex flex-col transition-colors">
      
      {/* Navbar */}
      <header className="absolute top-0 w-full p-6 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-xl font-black tracking-tight">LifeLine <span className="text-red-600">AGENT</span></span>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
            disabled={isLoggingIn}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-200/50 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 border border-slate-300 dark:border-white/10 rounded-full font-semibold transition-all backdrop-blur-md text-slate-800 dark:text-white"
          >
            <span>{isLoggingIn ? 'Authenticating...' : 'Sign In'}</span>
            <ChevronDown className="w-4 h-4 opacity-70" />
          </button>
          
          {isLoginDropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden py-2 backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
              <div className="px-4 py-2 text-xs font-mono text-slate-500 uppercase font-bold tracking-wider mb-1">
                Select Portal Access
              </div>
              {LOGIN_OPTIONS.map((opt, i) => (
                <button 
                  key={i}
                  onClick={() => handleQuickLogin(opt.user, opt.role)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                >
                  <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ${opt.color}`}>
                    <opt.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{opt.label}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Sign in as {opt.user}</div>
                  </div>
                </button>
              ))}
              <div className="border-t border-slate-200 dark:border-slate-800 mt-2 p-2">
                <button onClick={() => setIsLoginDropdownOpen(false)} className="w-full text-center text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white py-2">
                  Close menu
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 text-center">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-sky-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-mono mb-8 animate-pulse">
          <Bot className="w-3.5 h-3.5" />
          <span>V2.4 Autonomous AI Task Manager Active</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 max-w-4xl text-slate-900 dark:text-white">
          The First Autonomous <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500 dark:from-red-500 dark:to-rose-400">Emergency Dispatch Network</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-12">
          LifeLine Agent uses AI to automatically triage patients, locate free ICU beds, calculate optimal routing, and alert hospitals—all with human-in-the-loop oversight.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button 
            onClick={() => setIsLoginDropdownOpen(true)}
            className="px-8 py-4 bg-slate-900 text-white dark:bg-white dark:text-black font-bold rounded-full hover:scale-105 transition-transform flex items-center gap-2 shadow-xl shadow-slate-900/20 dark:shadow-white/10"
          >
            Launch Command Center <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => router.push('/emergency')}
            className="px-8 py-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-full transition-colors flex items-center gap-2 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> View Air-Gap Failsafe
          </button>
        </div>
      </main>

    </div>
  );
}
