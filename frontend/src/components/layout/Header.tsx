import React from 'react';
import { ShieldCheck, MapPin, Activity, HelpCircle, HeartHandshake } from 'lucide-react';
import { ScreenType } from '../../types';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onTriggerSos: () => void;
  locationAddress: string;
  backendOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  onTriggerSos,
  locationAddress,
  backendOnline,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 transition-all">
      <div className="w-full px-2 sm:px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg p-1"
          aria-label="LifeLine Agent Home"
        >
          <img
            src="/logo.png"
            alt="LifeLine Agent Logo"
            className="w-10 h-10 rounded-xl shadow-md shadow-sky-600/20 hover:scale-105 transition-transform duration-300"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">LifeLine</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded">
                Agent
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Emergency Medical Alert System
            </p>
          </div>
        </button>

        {/* Center Live Location Pill (Calm, Informative) */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100/90 text-slate-700 px-3.5 py-1.5 rounded-full text-xs font-medium border border-slate-200">
          <MapPin className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
          <span className="truncate max-w-[280px]">{locationAddress}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="GPS Locked" />
        </div>

        {/* Right Status Badges & Quick Action */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Backend Status Pill */}
          <div
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              backendOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
            title="FastAPI Multi-Agent Engine Status"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span>{backendOnline ? 'AI Backend Online' : 'Local Mode'}</span>
          </div>

          {/* Medical Profile Status */}
          <button
            onClick={() => onNavigate('profile')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200/80 hover:bg-sky-100 text-xs font-semibold transition"
            title="Medical ID Complete & Ready"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>ID Ready (95%)</span>
          </button>

          {/* Quick SOS Trigger in Header for Instant Desktop Access */}
          <button
            onClick={onTriggerSos}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-alert-600 hover:bg-alert-700 active:bg-alert-800 text-white text-xs font-bold shadow-sm shadow-alert-600/30 transition focus-visible:ring-2 focus-visible:ring-alert-500 touch-target sm:min-h-[36px]"
            aria-label="Emergency SOS Quick Trigger"
          >
            <Activity className="w-4 h-4 animate-pulse" />
            <span className="tracking-wide uppercase">SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
