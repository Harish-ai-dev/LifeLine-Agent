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

  if (!currentUser || pathname === '/') return null;

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
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20 shadow-sm">
        {/* Left: Breadcrumbs & Hospital Facility Selector */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span className="uppercase tracking-wider font-semibold">{currentUser.role.replace('_', ' ')}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold text-sm tracking-tight font-sans truncate">{pageTitle}</span>
          </div>

          {currentUser.role === 'hospital_staff' && (
            <div className="relative ml-2 hidden md:block">
              <button
                onClick={() => setIsFacilityMenuOpen(!isFacilityMenuOpen)}
                className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 hover:text-slate-900 hover:border-slate-300 transition-all font-mono"
              >
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span className="truncate max-w-[180px] font-semibold">{currentHospital.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 font-bold">
                  {currentHospital.tier}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isFacilityMenuOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                  <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-mono font-bold text-slate-500 uppercase border-b border-slate-100">
                    <span>Switch Facility</span>
                    <Link href="/hospital/facilities" className="text-sky-600 hover:underline">
                      Directory →
                    </Link>
                  </div>
                  {hospitals.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => {
                        setActiveHospitalId(h.id);
                        setIsFacilityMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        h.id === activeHospitalId
                          ? 'bg-sky-50 text-sky-900 font-bold border border-sky-200'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-semibold text-slate-900">{h.name}</div>
                        <div className="text-[10px] text-slate-500">{h.code} · {h.availableIcuBeds} ICU Beds Free</div>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {h.tier}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions, Telemetry, Voice, AI Co-Pilot, SOS, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Telemetry Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold">TELEMETRY</span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 font-bold">42ms</span>
            <span className="text-slate-300">|</span>
            <span className="text-sky-700 font-bold">SLA 99.8%</span>
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={() => {
              soundEffects.playTelemetryPing();
              toggleTheme();
            }}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Audio Synthesizer Tone Toggle */}
          <button
            onClick={handleAudioToggle}
            className={`p-2 rounded-xl transition-all ${
              !isAudioMuted
                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'
                : 'text-slate-400 bg-slate-100 border border-slate-200'
            }`}
            title={isAudioMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects (Audio Active)'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Air-Gap / Fail-Safe Direct Link */}
          <Link
            href="/emergency"
            className="p-2 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-100 bg-red-50 border border-red-200 transition-colors"
            title="Air-Gap Disaster Recovery / Fail-Safe Console"
          >
            <ShieldAlert className="w-4 h-4" />
          </Link>

          {/* Voice Command Toggle */}
          <button
            onClick={handleVoiceToggle}
            className={`p-2 rounded-xl transition-all ${
              isVoiceActive
                ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-slate-50 border border-slate-200'
            }`}
            title="Voice Commands / Hands-free dictation"
          >
            {isVoiceActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          {/* AI Supervisor Co-Pilot Button */}
          <button
            onClick={() => setIsAiOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold transition-all shadow-sm"
            title="Open AI Supervisor Co-Pilot (⌘K)"
          >
            <Bot className="w-4 h-4 text-sky-600 animate-pulse" />
            <span className="hidden sm:inline">Ask AI Co-Pilot</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono font-normal rounded bg-white text-slate-500 border border-slate-200">
              ⌘K
            </kbd>
          </button>

          {/* Emergency SOS Button (Hospital Only) */}
          {currentUser.role === 'hospital_staff' && (
            <button
              onClick={() => {
                soundEffects.playEmergencySiren();
                setIsSosOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black tracking-wider transition-all shadow-md shadow-red-600/20 font-mono"
            >
              <Siren className="w-3.5 h-3.5 animate-pulse" />
              <span>STAT SOS</span>
            </button>
          )}

          {/* Notification Bell */}
          <button
            onClick={() => {
              soundEffects.playTelemetryPing();
              setIsNotificationOpen(true);
            }}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl bg-slate-50 border border-slate-200 transition-colors relative"
            title="Emergency Notifications & Inbound Tracking"
          >
            <Bell className="w-4 h-4" />
            {pendingCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
            )}
            {pendingCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full" />
            )}
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          {/* User Profile / Identity Pill */}
          <div className="flex items-center gap-2 pl-1">
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
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm font-bold shadow-inner hover:scale-105 transition-transform"
              title="Click to Switch Portal / Change User Profile"
            >
              {currentUser.avatar || '👨‍⚕️'}
            </Link>

            <button
              onClick={logout}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-600 rounded-xl transition-colors"
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
