'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  Bell,
  Mic,
  MicOff,
  LogOut,
  Bot,
  Siren,
  Building2,
  Sparkles,
  Search,
  Shield,
  RefreshCw,
  UserCheck,
  Volume2,
  VolumeX,
  ShieldAlert,
  Radio,
  Sun,
  Moon,
} from 'lucide-react';
import { AIAssistant } from '@/components/AIAssistant';
import { FloatingSOS } from '@/components/FloatingSOS';
import { NotificationCenter } from '@/components/NotificationCenter';
import { EmergencyBroadcastModal } from '@/components/EmergencyBroadcastModal';
import { soundEffects } from '@/utils/soundEffects';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';

export function Topbar() {
  const {
    currentUser,
    currentHospital,
    hospitals,
    activeHospitalId,
    setActiveHospitalId,
    logout,
    alerts,
    issues,
  } = useDashboard();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const handleAudioToggle = () => {
    const nextState = !isAudioMuted;
    setIsAudioMuted(nextState);
    soundEffects.setMuted(nextState);
    if (!nextState) {
      soundEffects.playTelemetryPing();
    }
  };

  const isDashboardRoute =
    pathname.startsWith('/hospital') ||
    pathname.startsWith('/government') ||
    pathname.startsWith('/donor') ||
    pathname.startsWith('/emergency');
  if (!currentUser || !isDashboardRoute) return null;

  // Real-time badge calculations
  const hospitalAlerts = alerts.filter((a) => a.assignedHospitalId === activeHospitalId);
  const pendingCount = hospitalAlerts.filter((a) => a.status === 'pending_ack').length;

  const handleVoiceToggle = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech Recognition API is not supported in this browser. Please use Chrome/Edge.');
      return;
    }

    if (isVoiceActive) {
      setIsVoiceActive(false);
      return;
    }

    setIsVoiceActive(true);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setIsVoiceActive(false);

      if (transcript.includes('sos') || transcript.includes('emergency')) {
        soundEffects.playEmergencySiren();
        setIsSosOpen(true);
      } else if (transcript.includes('ai') || transcript.includes('assistant') || transcript.includes('copilot')) {
        soundEffects.playTelemetryPing();
        setIsAiOpen(true);
      } else if (transcript.includes('broadcast') || transcript.includes('staff')) {
        soundEffects.playEmergencySiren();
        setIsBroadcastOpen(true);
      } else if (transcript.includes('notifications') || transcript.includes('alerts')) {
        soundEffects.playTelemetryPing();
        setIsNotificationOpen(true);
      } else if (transcript.includes('beds') || transcript.includes('capacity')) {
        router.push('/hospital/beds');
      } else if (transcript.includes('patients') || transcript.includes('queue')) {
        router.push('/hospital/patients');
      } else if (transcript.includes('facilities') || transcript.includes('hospitals')) {
        router.push('/hospital/facilities');
      }
    };

    recognition.onerror = () => setIsVoiceActive(false);
    recognition.onend = () => setIsVoiceActive(false);
    recognition.start();
  };

  const pageTitle =
    pathname
      .split('/')
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' '))
      .join(' / ') || 'Overview';

  return (
    <>
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 sm:px-5 shrink-0 z-20 shadow-sm select-none gap-2 min-w-0">
        {/* Left: Breadcrumbs & Assigned Hospital Facility Badge */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 min-w-0">
            <span className="uppercase tracking-wider font-semibold text-[11px] whitespace-nowrap shrink-0">
              {currentUser.role.replace('_', ' ')}
            </span>
            <span className="text-slate-300 dark:text-slate-600 shrink-0">/</span>
            <span className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm tracking-tight font-sans truncate max-w-[120px] md:max-w-[200px] whitespace-nowrap">
              {pageTitle}
            </span>
          </div>

          {currentUser.role === 'hospital_staff' && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 h-8 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-200 whitespace-nowrap shrink-0 ml-1">
              <Building2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
              <span className="font-semibold truncate max-w-[140px] lg:max-w-[220px]">
                {currentHospital.name}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300 font-bold shrink-0">
                {currentHospital.tier}
              </span>
            </div>
          )}
        </div>

        {/* Right: Actions, Telemetry, Voice, AI Co-Pilot, SOS, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Live Telemetry Pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 h-8 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-300 shrink-0 whitespace-nowrap">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold">TELEMETRY</span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">42ms</span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-sky-600 dark:text-sky-400 font-bold">SLA 99.8%</span>
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={() => {
              soundEffects.playTelemetryPing();
              toggleTheme();
            }}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors shrink-0"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Audio Synthesizer Tone Toggle */}
          <button
            onClick={handleAudioToggle}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              !isAudioMuted
                ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                : 'text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
            }`}
            title={isAudioMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects (Audio Active)'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Air-Gap / Fail-Safe Direct Link */}
          <Link
            href="/emergency"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-950/40 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 transition-colors shrink-0"
            title="Air-Gap Disaster Recovery / Fail-Safe Console"
          >
            <ShieldAlert className="w-4 h-4" />
          </Link>

          {/* Voice Command Toggle */}
          <button
            onClick={() => {
              soundEffects.playTelemetryPing();
              if (currentUser.role === 'hospital_staff') {
                router.push('/hospital/copilot?listen=true');
              } else if (currentUser.role === 'government_authority') {
                router.push('/government/copilot?listen=true');
              } else {
                handleVoiceToggle();
              }
            }}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              isVoiceActive
                ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/50'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
            }`}
            title="Voice Commands / Hands-free dictation"
          >
            {isVoiceActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          {/* AI Supervisor Co-Pilot Button */}
          <button
            onClick={() => {
              soundEffects.playTelemetryPing();
              if (currentUser.role === 'hospital_staff') {
                router.push('/hospital/copilot');
              } else if (currentUser.role === 'government_authority') {
                router.push('/government/copilot');
              } else {
                setIsAiOpen(true);
              }
            }}
            className="flex items-center gap-1.5 px-3 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-bold transition-all shadow-sm shrink-0 whitespace-nowrap"
            title="Open AI Supervisor Co-Pilot"
          >
            <Bot className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
            <span className="whitespace-nowrap">Ask AI Co-Pilot</span>
          </button>

          {/* Emergency SOS Button (Hospital Only) */}
          {currentUser.role === 'hospital_staff' && (
            <button
              onClick={() => {
                soundEffects.playEmergencySiren();
                setIsSosOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 h-8 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black tracking-wider transition-all shadow-md shadow-red-600/20 font-mono shrink-0 whitespace-nowrap"
            >
              <Siren className="w-3.5 h-3.5 animate-pulse shrink-0" />
              <span>STAT SOS</span>
            </button>
          )}

          {/* Notification Bell */}
          <button
            onClick={() => {
              soundEffects.playTelemetryPing();
              if (currentUser.role === 'hospital_staff') {
                router.push('/hospital/copilot?tab=notifications');
              } else if (currentUser.role === 'government_authority') {
                router.push('/government/copilot?tab=notifications');
              } else {
                setIsNotificationOpen(true);
              }
            }}
            className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors relative shrink-0"
            title="Emergency Notifications & Inbound Tracking"
          >
            <Bell className="w-4 h-4" />
            {pendingCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full animate-ping" />
            )}
            {pendingCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" />
            )}
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5 hidden sm:block shrink-0"></div>

          {/* User Profile / Identity Pill */}
          <div className="flex items-center gap-1.5 pl-0.5 shrink-0">
            <Link
              href="/"
              className="text-right hidden lg:block group cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap shrink-0 max-w-[120px]"
              title="Click to Switch Portal / Change User Profile"
            >
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-end gap-1">
                <span className="truncate">{currentUser.username}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                {currentUser.title || currentUser.role}
              </div>
            </Link>

            <Link
              href="/"
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm font-bold shadow-inner hover:scale-105 transition-transform shrink-0"
              title="Click to Switch Portal / Change User Profile"
            >
              {currentUser.avatar || '👨‍⚕️'}
            </Link>

            <button
              onClick={logout}
              className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-600 transition-colors shrink-0"
              title="Log Out to Login Gateway (/login)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Drawers & Modals */}
      <AIAssistant isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
      <FloatingSOS isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
      <NotificationCenter
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onOpenBroadcastModal={() => {
          setIsNotificationOpen(false);
          setIsBroadcastOpen(true);
        }}
      />
      <EmergencyBroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
      />
    </>
  );
}
