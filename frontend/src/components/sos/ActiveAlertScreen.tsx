import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  MapPin,
  Phone,
  MessageSquare,
  Volume2,
  VolumeX,
  Flashlight,
  CheckCircle2,
  Clock,
  Navigation as NavIcon,
  HeartPulse,
  Building2,
  X,
  AlertTriangle,
  Radio,
  FileText,
  Sparkles,
} from 'lucide-react';
import { ActiveSosState, EmergencyContact, MedicalProfile } from '../../types';

interface ActiveAlertScreenProps {
  sosState: ActiveSosState;
  profile: MedicalProfile;
  contacts: EmergencyContact[];
  onCancelCountdown: () => void;
  onResolveSos: () => void;
}

export const ActiveAlertScreen: React.FC<ActiveAlertScreenProps> = ({
  sosState,
  profile,
  contacts,
  onCancelCountdown,
  onResolveSos,
}) => {
  const [sirenActive, setSirenActive] = useState(false);
  const [strobeActive, setStrobeActive] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [simulatedEta, setSimulatedEta] = useState(11);

  // Countdown timer effect
  useEffect(() => {
    if (sosState.isActive && !sosState.isCountdown) {
      const interval = setInterval(() => {
        setSimulatedEta((prev) => (prev > 1 ? prev - 1 : 1));
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [sosState.isActive, sosState.isCountdown]);

  // ── 1. COUNTDOWN STATE (5-Second Grace Window to prevent false alarms) ──────
  if (sosState.isCountdown) {
    const progressPercent = (sosState.countdownSeconds / 5) * 100;

    return (
      <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="max-w-md w-full bg-slate-900 border-2 border-alert-600 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Pulsing Alert Glow */}
          <div className="absolute inset-0 bg-alert-600/10 animate-pulse pointer-events-none" />

          <div className="w-16 h-16 rounded-full bg-alert-600/20 text-alert-500 border border-alert-600/40 flex items-center justify-center mx-auto mb-4">
            <Radio className="w-8 h-8 animate-ping" />
          </div>

          <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-1">
            Emergency SOS Triggered
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Broadcasting location & medical ID to Emergency Services in:
          </p>

          {/* Large Countdown Digit */}
          <div className="my-6">
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#334155"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#ef4444"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * progressPercent) / 100}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <span className="absolute text-5xl font-black text-white font-mono">
                {sosState.countdownSeconds}
              </span>
            </div>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-3 text-xs text-slate-300 mb-6 border border-slate-700">
            <span className="font-semibold text-alert-400">Crisis Type: </span>
            <span className="capitalize">{sosState.category}</span>
          </div>

          {/* Cancellation Button */}
          <button
            onClick={onCancelCountdown}
            className="w-full py-4 px-6 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-600 text-white rounded-2xl text-sm font-bold uppercase tracking-wider transition touch-target shadow-lg"
          >
            ❌ Cancel (I am Safe)
          </button>
        </div>
      </div>
    );
  }

  // ── 2. ACTIVE LIVE EMERGENCY STATE ──────────────────────────────────────────
  return (
    <div className={`fixed inset-0 z-50 bg-slate-950 overflow-y-auto ${strobeActive ? 'animate-pulse' : ''}`}>
      <div className="min-h-screen text-white p-4 sm:p-6 max-w-4xl mx-auto flex flex-col justify-between pb-24">
        {/* High-Urgency Emergency Beacon Header */}
        <header className="bg-alert-700 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-alert-600 flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white text-alert-700 flex items-center justify-center font-black text-xl shadow-md shrink-0">
              <ShieldAlert className="w-7 h-7 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded text-white">
                  LIVE SOS ACTIVATED
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
                Emergency Response En Route
              </h1>
            </div>
          </div>

          {/* Quick Audio & Strobe Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSirenActive(!sirenActive)}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                sirenActive ? 'bg-white text-alert-700 border-white' : 'bg-alert-800 text-white border-alert-600'
              }`}
              title="Emergency Siren"
            >
              {sirenActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{sirenActive ? 'Siren ON' : 'Siren'}</span>
            </button>
            <button
              onClick={() => setStrobeActive(!strobeActive)}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                strobeActive ? 'bg-white text-alert-700 border-white' : 'bg-alert-800 text-white border-alert-600'
              }`}
              title="Strobe Flash"
            >
              <Flashlight className="w-4 h-4" />
              <span>{strobeActive ? 'Strobe ON' : 'Strobe'}</span>
            </button>
          </div>
        </header>

        {/* ── Main Content Grid ──────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* 1. Live GPS Location Broadcast Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 animate-pulse text-sky-400" />
                Live Location Broadcasted
              </span>
              <span className="text-xs font-mono text-slate-400">
                Lat: {sosState.location.lat.toFixed(4)}, Lng: {sosState.location.lng.toFixed(4)}
              </span>
            </div>
            <p className="text-base font-bold text-white mb-2">{sosState.location.address}</p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Precision: ±{sosState.location.accuracyMeters}m · Updated Real-Time</span>
            </div>
          </div>

          {/* 2. Matched Receiving Facility & Ambulance ETA Hero */}
          <div className="bg-gradient-to-br from-sky-950 via-slate-900 to-slate-900 border border-sky-800/80 rounded-2xl p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-300 bg-sky-900/60 px-2.5 py-1 rounded-md border border-sky-700/60">
                  🎯 Allocated Primary Receiving Facility
                </span>
                <h3 className="text-2xl font-black text-white mt-2">
                  {sosState.hospital ? sosState.hospital.name : 'Lilavati Hospital & Research Centre'}
                </h3>
                <p className="text-xs text-sky-200 mt-1">
                  Specialty Bed Allocated · Resuscitation Bay Ready · Pre-Arrival SBAR Transmitted
                </p>
              </div>

              {/* Driving ETA Countdown Banner */}
              <div className="bg-sky-600 text-white px-4 py-3 rounded-2xl text-center shadow-lg shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-90">
                  Driving ETA
                </span>
                <span className="text-3xl font-black font-mono">{simulatedEta}</span>
                <span className="text-xs font-bold block">MINS</span>
              </div>
            </div>

            {/* Quick hospital action shortcuts */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
              <a
                href="tel:108"
                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-900/80 hover:bg-sky-800 text-sky-200 rounded-xl font-bold transition"
              >
                <Phone className="w-4 h-4 text-sky-400" />
                <span>Call Ambulance Dispatch</span>
              </a>
              <div className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 text-slate-300 rounded-xl font-medium">
                <NavIcon className="w-4 h-4 text-sky-400" />
                <span>Trauma Routing Active</span>
              </div>
            </div>
          </div>

          {/* 3. Emergency Contacts Notification Checklist */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Emergency Contacts Broadcast Status
            </h4>
            <div className="space-y-2.5">
              {contacts.map((contact, idx) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 bg-slate-800/80 rounded-xl border border-slate-700/60"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                      {idx + 1}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">{contact.name}</span>
                      <span className="text-xs text-slate-400">{contact.relationship} · {contact.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Notified (SMS & Call)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. SBAR Emergency Briefing Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <span>Transmitted First Responder Handover (SBAR)</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed font-mono">
              <strong className="text-sky-400">[INCOMING EMERGENCY DISPATCH]:</strong> Patient {profile.fullName}, {profile.age}yo {profile.gender}. Presenting with acute {sosState.category} symptoms. Blood Type: {profile.bloodType}. Allergies: {profile.allergies.join(', ')}. Known conditions: {profile.conditions.join(', ')}. Allocated to Primary Trauma Unit. ETA ~{simulatedEta} minutes.
            </div>
          </div>
        </div>

        {/* ── 3. Bottom Safe Action Bar ───────────────────────────────────────── */}
        <div className="mt-8 pt-4 border-t border-slate-800">
          {!showConfirmCancel ? (
            <button
              onClick={() => setShowConfirmCancel(true)}
              className="w-full py-4 px-6 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-white rounded-2xl text-base font-extrabold uppercase tracking-wider transition touch-target shadow-xl"
            >
              ✅ I am Safe — Cancel Emergency Alert
            </button>
          ) : (
            <div className="bg-slate-900 border border-alert-600/80 rounded-2xl p-4 text-center space-y-3">
              <p className="text-sm font-bold text-white">
                Are you sure you want to cancel the emergency alert?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onResolveSos}
                  className="py-3 px-4 bg-alert-600 hover:bg-alert-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider"
                >
                  Yes, Cancel Alert
                </button>
                <button
                  onClick={() => setShowConfirmCancel(false)}
                  className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider"
                >
                  Keep Alert Active
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
