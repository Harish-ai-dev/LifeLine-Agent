import React from 'react';
import {
  Settings,
  Bell,
  MapPin,
  Activity,
  Volume2,
  Shield,
  Server,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { UserSettings } from '../../types';

interface SettingsScreenProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const toggle = (key: keyof UserSettings) => {
    onUpdateSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-24 md:pb-12">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-sky-600" />
          Settings & Emergency Preferences
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure automated crash detection, alarm triggers, and LifeLine agent endpoints.
        </p>
      </div>

      {/* 1. SOS Trigger & Safety Preferences */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
          <Shield className="w-4 h-4 text-sky-600" />
          <span>SOS Trigger & Dispatch Rules</span>
        </h3>

        {/* Fall Detection */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-slate-900 block">Automatic Fall & Impact Detection</span>
            <span className="text-xs text-slate-500">
              Uses device accelerometer to trigger emergency countdown if a hard impact is detected.
            </span>
          </div>
          <button
            onClick={() => toggle('fallDetection')}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              settings.fallDetection ? 'bg-sky-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.fallDetection ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Countdown Grace Period */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <span className="text-sm font-bold text-slate-900 block">Cancellation Grace Period</span>
            <span className="text-xs text-slate-500">
              Time to cancel an accidental trigger before first responders are notified.
            </span>
          </div>
          <select
            value={settings.countdownDuration}
            onChange={(e) =>
              onUpdateSettings({ ...settings, countdownDuration: Number(e.target.value) })
            }
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white"
          >
            <option value={3}>3 Seconds</option>
            <option value={5}>5 Seconds (Recommended)</option>
            <option value={10}>10 Seconds</option>
          </select>
        </div>

        {/* Auto Location Sharing */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <span className="text-sm font-bold text-slate-900 block">Continuous GPS Location Sharing</span>
            <span className="text-xs text-slate-500">
              Share real-time coordinates with ambulance and contacts during an active SOS.
            </span>
          </div>
          <button
            onClick={() => toggle('autoLocationSharing')}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              settings.autoLocationSharing ? 'bg-sky-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.autoLocationSharing ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 2. Alarm & Audio */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
          <Volume2 className="w-4 h-4 text-sky-600" />
          <span>Alarms & Audio Beacon</span>
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-slate-900 block">Loud Siren Audio Beacon</span>
            <span className="text-xs text-slate-500">
              Play loud audio siren from phone speaker when SOS is triggered to alert bystanders.
            </span>
          </div>
          <button
            onClick={() => toggle('sirenAudioEnabled')}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              settings.sirenAudioEnabled ? 'bg-sky-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.sirenAudioEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 3. LifeLine AI Backend API Endpoint */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
          <Server className="w-4 h-4 text-sky-600" />
          <span>LifeLine Multi-Agent Dispatch API</span>
        </h3>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            FastAPI Backend Endpoint
          </label>
          <input
            type="text"
            value={settings.backendApiUrl}
            onChange={(e) => onUpdateSettings({ ...settings, backendApiUrl: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            placeholder="http://localhost:8000"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Connects to local `python start.py` backend for live Gemini 3.5 & ADK hospital bed matching.
          </p>
        </div>
      </div>
    </div>
  );
};
