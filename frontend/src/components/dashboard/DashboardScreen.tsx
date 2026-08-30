import React, { useState } from 'react';
import {
  AlertCircle,
  Phone,
  MessageSquare,
  ShieldAlert,
  ChevronRight,
  HeartPulse,
  Activity,
  Wind,
  ShieldCheck,
  UserCheck,
  MapPin,
  Sparkles,
  Radio,
} from 'lucide-react';
import { MedicalProfile, EmergencyContact, ScreenType } from '../../types';
import { CRISIS_CATEGORIES } from '../../data/mockData';

interface DashboardScreenProps {
  profile: MedicalProfile;
  contacts: EmergencyContact[];
  onTriggerSos: (category?: string) => void;
  onNavigate: (screen: ScreenType) => void;
  locationAddress: string;
  locationAccuracy: number;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  profile,
  contacts,
  onTriggerSos,
  onNavigate,
  locationAddress,
  locationAccuracy,
}) => {
  const [selectedCrisis, setSelectedCrisis] = useState<string>('cardiac');
  const [isPressing, setIsPressing] = useState(false);

  // Icon map for crisis presets
  const getCrisisIcon = (iconName: string) => {
    switch (iconName) {
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5" />;
      case 'Activity':
        return <Activity className="w-5 h-5" />;
      case 'Wind':
        return <Wind className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const primaryContacts = contacts.slice(0, 2);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 md:pb-8">
      {/* ── 1. HERO SOS TRIGGER UNIT ────────────────────────────────────────── */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm text-center relative overflow-hidden">
        {/* Subtle hospital-grade background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-sky-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-alert-100/30 rounded-full blur-3xl pointer-events-none" />

        {/* Live Protection Status Indicator */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-6 border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>LifeLine Guardian Active</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500 font-mono">±{locationAccuracy}m GPS Lock</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Emergency Assistance
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
          Tap the emergency button to immediately alert first responders and your emergency contacts.
        </p>

        {/* Central SOS Button (Thumb-reachable, high-contrast, reserved alert color) */}
        <div className="flex justify-center my-4">
          <div className="relative flex items-center justify-center">
            {/* Outer Pulsing Ring */}
            <div className="absolute inset-0 rounded-full bg-alert-600/20 animate-sos-pulse pointer-events-none" />

            <button
              onClick={() => onTriggerSos(selectedCrisis)}
              onMouseDown={() => setIsPressing(true)}
              onMouseUp={() => setIsPressing(false)}
              onTouchStart={() => setIsPressing(true)}
              onTouchEnd={() => setIsPressing(false)}
              className={`relative z-10 w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-b from-alert-500 to-alert-700 text-white font-black shadow-xl shadow-alert-600/40 flex flex-col items-center justify-center transition-transform active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-alert-400 border-4 border-white ${
                isPressing ? 'scale-95' : 'hover:scale-[1.02]'
              }`}
              aria-label="Trigger Emergency SOS Alert"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-1">
                <Radio className="w-7 h-7 text-white animate-pulse" />
              </div>
              <span className="text-3xl sm:text-4xl tracking-wider uppercase font-black drop-shadow-sm">
                SOS
              </span>
              <span className="text-[11px] font-semibold text-alert-100 uppercase tracking-widest mt-1">
                Tap to Trigger
              </span>
            </button>
          </div>
        </div>

        {/* Location Banner directly below SOS */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 max-w-lg mx-auto">
          <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
          <span className="truncate font-medium">{locationAddress}</span>
        </div>

        {/* Quick Crisis Category Buttons */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Select Crisis Type for Faster First Responder Triage
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto">
            {CRISIS_CATEGORIES.map((cat) => {
              const isSelected = selectedCrisis === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCrisis(cat.id)}
                  className={`flex flex-col items-center text-center p-3 rounded-xl border text-xs font-semibold transition touch-target ${
                    isSelected
                      ? 'bg-sky-50 border-sky-400 text-sky-950 font-bold shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg mb-1.5 ${
                      isSelected ? 'bg-sky-200/70 text-sky-800' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {getCrisisIcon(cat.icon)}
                  </div>
                  <span className="leading-tight">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 2. MEDICAL ID & PROFILE STATUS CARD ────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Medical ID Card Preview */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Medical ID Profile</h3>
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                    95% Complete · Ready for Responders
                  </span>
                </div>
              </div>
            </div>

            {/* Critical Vitals Grid */}
            <div className="grid grid-cols-3 gap-2 my-3 p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Blood Type</span>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  {profile.bloodType}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Organ Donor</span>
                <span className="font-bold text-slate-900">
                  {profile.organDonor ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Allergies</span>
                <span className="font-bold text-alert-700">{profile.allergies.length} Recorded</span>
              </div>
            </div>

            {/* Quick Allergies list */}
            <div className="text-xs text-slate-600 mb-2">
              <span className="font-semibold text-slate-700">Known Allergies: </span>
              <span className="text-slate-500">
                {profile.allergies.slice(0, 2).join(', ')}
                {profile.allergies.length > 2 && ' + more'}
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('profile')}
            className="w-full mt-3 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition touch-target"
          >
            <span>View Full Medical ID Card</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Priority Emergency Contacts Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-sky-50 text-sky-700">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Emergency Contacts</h3>
                  <p className="text-xs text-slate-500">Notified first during an alert</p>
                </div>
              </div>
              <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full">
                {contacts.length} Active
              </span>
            </div>

            <div className="space-y-2 my-2">
              {primaryContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/70"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">{contact.name}</span>
                      <span className="text-[10px] font-semibold bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                        {contact.relationship}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">{contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${contact.phone}`}
                      className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-sky-600 hover:border-sky-300 transition"
                      title="Direct Phone Call"
                      aria-label={`Call ${contact.name}`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={`sms:${contact.phone}`}
                      className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-sky-600 hover:border-sky-300 transition"
                      title="Direct SMS"
                      aria-label={`Message ${contact.name}`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('contacts')}
            className="w-full mt-3 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition touch-target"
          >
            <span>Manage All Contacts</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── 3. LIFELINE MULTI-AGENT PIPELINE INTEGRATION BANNER ──────────────── */}
      <section className="bg-gradient-to-br from-slate-900 to-navy-900 text-white rounded-2xl p-5 sm:p-6 shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                Autonomous AI Dispatch Engine
                <span className="text-[10px] uppercase tracking-wider font-bold bg-sky-500/30 text-sky-300 px-2 py-0.5 rounded-full border border-sky-400/30">
                  Online
                </span>
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                When SOS triggers, Gemini & Google ADK instantly compute clinical NEWS2 scores, match hospital ICU beds in real-time, and broadcast pre-arrival trauma briefings to the ER.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
