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
  ChevronDown,
  RefreshCw,
  UserCheck,
  Volume2,
  VolumeX,
  ShieldAlert,
  Radio,
  Sun,
  Moon,
  Menu,
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
    openCopilot,
    toggleMobileSidebar,
  } = useDashboard();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isFacilityMenuOpen, setIsFacilityMenuOpen] = useState(false);
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
      <header className="h-16 bg-white dark:bg-[#0c1322] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 sm:px-6 shrink-0 z-20 shadow-sm transition-colors duration-150">
        {/* Left: Mobile Menu Trigger, Breadcrumbs & Hospital Facility Selector */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile Hamburger Trigger (<md) */}
          <button
            onClick={toggleMobileSidebar}
            className="md:hidden p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Open Navigation Menu"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 min-w-0">
            <span className="uppercase tracking-wider font-semibold hidden sm:inline">{currentUser.role.replace('_', ' ')}</span>
            <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">/</span>
            <span className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm tracking-tight font-sans truncate">{pageTitle}</span>
          </div>

          {currentUser.role === 'hospital_staff' && (
            <div className="relative ml-1 sm:ml-2 hidden md:block">
              <button
                onClick={() => setIsFacilityMenuOpen(!isFacilityMenuOpen)}
                className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-all font-mono"
              >
                <Building2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span
                  className="font-semibold text-slate-900 dark:text-white max-w-[280px] truncate"
                  title={currentHospital.name}
                >
                  {currentHospital.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 font-bold shrink-0">
                  {currentHospital.tier}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {isFacilityMenuOpen && (
                <div className="absolute left-0 mt-2 w-96 bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 space-y-1.5 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                    <span>Switch Facility ({hospitals.length})</span>
                    <Link href="/hospital/facilities" className="text-sky-600 dark:text-sky-400 hover:underline">
                      Directory →
                    </Link>
                  </div>
                  {hospitals.map((h) => (
                    <Link
                      key={h.id}
                      href={`/hospital/facility/${h.id}`}
                      onClick={() => {
                        setActiveHospitalId(h.id);
                        setIsFacilityMenuOpen(false);
                      }}
                      title={h.name}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between gap-3 transition-colors ${
                        h.id === activeHospitalId
                          ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200 font-bold border border-sky-200 dark:border-sky-800'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-white leading-snug whitespace-normal break-words">
                          {h.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          {h.code} · {h.availableIcuBeds} ICU Beds Free · {h.district}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0 self-start">
                        {h.tier}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions, Telemetry, Voice, AI Co-Pilot, SOS, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Live Telemetry Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold">TELEMETRY</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">42ms</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-sky-700 dark:text-sky-400 font-bold">SLA 99.8%</span>
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={() => {
              soundEffects.playTelemetryPing();
              toggleTheme();
            }}
            className="p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Audio Synthesizer Tone Toggle */}
          <button
            onClick={handleAudioToggle}
            className={`p-1.5 sm:p-2 rounded-xl transition-all ${
              !isAudioMuted
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                : 'text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
            }`}
            title={isAudioMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects (Audio Active)'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Air-Gap / Fail-Safe Direct Link */}
          <Link
            href="/emergency"
            className="p-1.5 sm:p-2 rounded-xl text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-950/40 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 transition-colors"
            title="Air-Gap Disaster Recovery / Fail-Safe Console"
          >
            <ShieldAlert className="w-4 h-4" />
          </Link>

          {/* Voice Command Toggle */}
          <button
            onClick={() => {
              soundEffects.playTelemetryPing();
              openCopilot('copilot', true);
            }}
            className={`p-1.5 sm:p-2 rounded-xl transition-all ${
              isVoiceActive
                ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
            title="Voice Commands / Ask Copilot"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* AI Supervisor Co-Pilot Button */}
          <button
            onClick={() => {
              soundEffects.playTelemetryPing();
              openCopilot('copilot');
            }}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30 text-xs font-bold transition-all shadow-sm"
            title="Open AI Supervisor Co-Pilot"
          >
            <Bot className="w-4 h-4 text-sky-600 dark:text-sky-400 animate-pulse shrink-0" />
            <span className="hidden sm:inline">Ask AI Co-Pilot</span>
          </button>

          {/* Emergency SOS Button (Hospital Only) */}
          {currentUser.role === 'hospital_staff' && (
            <button
              onClick={() => {
                soundEffects.playEmergencySiren();
                setIsSosOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black tracking-wider transition-all shadow-md shadow-red-600/20 font-mono shrink-0"
            >
              <Siren className="w-3.5 h-3.5 animate-pulse" />
              <span>STAT SOS</span>
            </button>
          )}

          {/* Notification Bell */}
          <button
            onClick={() => {
              soundEffects.playTelemetryPing();
              openCopilot('notifications');
            }}
            className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors relative"
            title="Emergency Notifications & Alerts"
          >
            <Bell className="w-4 h-4" />
            {pendingCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
            )}
            {pendingCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full" />
            )}
          </button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-0.5 sm:mx-1 hidden sm:block"></div>

          {/* User Profile / Identity Pill */}
          <div className="flex items-center gap-1.5 sm:gap-2 pl-1">
            <Link
              href="/"
              className="text-right hidden md:block group cursor-pointer hover:opacity-80 transition-opacity"
              title="Click to Switch Portal / Change User Profile"
            >
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-end gap-1.5">
                <span>{currentUser.username}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[130px]">
                {currentUser.title || currentUser.role}
              </div>
            </Link>

            <Link
              href="/"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs sm:text-sm font-bold shadow-inner hover:scale-105 transition-transform"
              title="Click to Switch Portal / Change User Profile"
            >
              {currentUser.avatar || '👨‍⚕️'}
            </Link>

            <button
              onClick={logout}
              className="p-1.5 sm:p-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-600 rounded-xl transition-colors"
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
