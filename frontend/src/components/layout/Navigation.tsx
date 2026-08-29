import React from 'react';
import { Home, Users, FileHeart, Settings, AlertCircle } from 'lucide-react';
import { ScreenType } from '../../types';

interface NavigationProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onTriggerSos: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentScreen,
  onNavigate,
  onTriggerSos,
}) => {
  const navItems = [
    { id: 'dashboard' as ScreenType, label: 'Home', icon: Home },
    { id: 'contacts' as ScreenType, label: 'Contacts', icon: Users },
    { id: 'profile' as ScreenType, label: 'Medical ID', icon: FileHeart },
    { id: 'settings' as ScreenType, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* ── Desktop Sidebar (>= 768px) ─────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 p-4 min-h-[calc(100vh-65px)] sticky top-[65px] justify-between">
        <div className="space-y-6">
          {/* Section Label */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Navigation
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all touch-target ${
                      isActive
                        ? 'bg-sky-50 text-sky-900 font-bold border border-sky-200/70 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isActive ? 'text-sky-600' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Emergency SOS Banner in Sidebar */}
          <div className="bg-alert-50 border border-alert-200/80 rounded-2xl p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-alert-100 text-alert-700 flex items-center justify-center mx-auto mb-2.5">
              <AlertCircle className="w-5 h-5 text-alert-600 animate-pulse" />
            </div>
            <h4 className="text-sm font-bold text-alert-950 mb-1">In an Emergency?</h4>
            <p className="text-xs text-alert-800 mb-3 leading-relaxed">
              Press to immediately broadcast location & medical profile to ER & contacts.
            </p>
            <button
              onClick={onTriggerSos}
              className="w-full py-2.5 px-4 bg-alert-600 hover:bg-alert-700 active:bg-alert-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-md shadow-alert-600/30 transition touch-target"
            >
              Trigger SOS Alert
            </button>
          </div>
        </div>

        {/* First Responder ID Tag */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500 flex items-center justify-between">
          <div>
            <span className="font-semibold text-slate-700 block">LifeLine Guard</span>
            <span className="text-[11px]">v0.1 · Active Protection</span>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="System Normal" />
        </div>
      </aside>

      {/* ── Mobile Bottom Navigation (< 768px) ─────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg min-w-[64px] min-h-[48px] transition ${
                isActive ? 'text-sky-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-sky-600 stroke-[2.5]' : 'text-slate-400'}`} />
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
