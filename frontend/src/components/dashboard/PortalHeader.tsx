import React, { useState } from 'react';
import {
  Building2,
  Landmark,
  HeartHandshake,
  Volume2,
  VolumeX,
  Bell,
  Sparkles,
  ShieldAlert,
  ChevronDown,
  User,
  Radio,
  PlusCircle,
  Activity,
  Droplet,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { PortalView, HospitalRole, AuthorityRole } from '../../types/dashboard';

interface PortalHeaderProps {
  onOpenSimulator: () => void;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({ onOpenSimulator }) => {
  const {
    currentUser,
    setIsAuthModalOpen,
    portalView,
    setPortalView,
    activeHospitalId,
    setActiveHospitalId,
    hospitalRole,
    setHospitalRole,
    authorityRole,
    setAuthorityRole,
    activeDonorId,
    setActiveDonorId,
    currentDonor,
    donors,
    soundEnabled,
    setSoundEnabled,
    hospitals,
    alerts,
    currentHospital,
    donorRequests,
  } = useDashboard();

  const [showFacilityMenu, setShowFacilityMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showDonorMenu, setShowDonorMenu] = useState(false);

  // Active unacknowledged & escalated count
  const pendingCount = alerts.filter(
    (a) =>
      a.status === 'pending_ack' &&
      (portalView === 'authority' || a.assignedHospitalId === activeHospitalId)
  ).length;

  const govEscalatedCount = alerts.filter((a) => a.status === 'escalated_gov').length;

  const activeDonorReqCount = donorRequests.filter((r) => r.status === 'matched' || r.status === 'open').length;

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* ── Brand Logo & Portal Switcher ────────────────────────────────────── */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white font-black shadow-md shadow-sky-600/30">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-black text-white text-base tracking-tight">LifeLine</span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30 px-1.5 py-0.5 rounded">
                  Command
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Hospital, Authority & Donor Network</p>
            </div>
          </div>

          {/* Portal Switcher Tabs */}
          <div className="hidden lg:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setPortalView('hospital')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                portalView === 'hospital'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Hospital Console</span>
              {pendingCount > 0 && portalView === 'hospital' && (
                <span className="bg-alert-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setPortalView('authority')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                portalView === 'authority'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Government Authority</span>
              {govEscalatedCount > 0 && (
                <span className="bg-alert-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-ping">
                  {govEscalatedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setPortalView('donor')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                portalView === 'donor'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Donor Network</span>
              {activeDonorReqCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                  {activeDonorReqCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setPortalView('dispatch')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                portalView === 'dispatch'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-sm font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Reactive Dispatch</span>
            </button>
          </div>
        </div>

        {/* ── Active Facility & Role Selectors ─────────────────────────────────── */}
        <div className="flex items-center gap-3">
          {/* If in Hospital mode: Facility Selector */}
          {portalView === 'hospital' && (
            <div className="relative">
              <button
                onClick={() => setShowFacilityMenu(!showFacilityMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition"
              >
                <Building2 className="w-3.5 h-3.5 text-sky-400" />
                <span className="truncate max-w-[170px]">{currentHospital.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showFacilityMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                    Switch Hospital Console
                  </div>
                  {hospitals.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => {
                        setActiveHospitalId(h.id);
                        setShowFacilityMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between ${
                        h.id === activeHospitalId
                          ? 'bg-sky-600 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate">{h.name}</span>
                      <span className="text-[10px] opacity-75 font-mono">{h.tier}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* If in Authority Mode: Jurisdiction Badge */}
          {portalView === 'authority' && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-700/60 text-xs font-bold text-indigo-200">
              <Landmark className="w-3.5 h-3.5 text-indigo-400" />
              <span>Region IV Directorate</span>
            </div>
          )}

          {/* If in Donor Mode: Donor Profile Selector */}
          {portalView === 'donor' && (
            <div className="relative">
              <button
                onClick={() => setShowDonorMenu(!showDonorMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-950/90 text-rose-200 border border-rose-800/80 text-xs font-bold transition"
              >
                <User className="w-3.5 h-3.5 text-rose-400" />
                <span className="truncate max-w-[150px]">{currentDonor.fullName}</span>
                <span className="font-mono text-[10px] bg-rose-900 px-1.5 py-0.5 rounded">
                  {currentDonor.bloodGroup}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-rose-400" />
              </button>

              {showDonorMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                    Switch Registered Donor
                  </div>
                  {donors.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        setActiveDonorId(d.id);
                        setShowDonorMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between ${
                        d.id === activeDonorId
                          ? 'bg-rose-600 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{d.fullName}</span>
                      <span className="font-mono text-[11px] font-bold bg-white/10 px-1.5 rounded">
                        {d.bloodGroup}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Role Switcher for Hospital & Authority */}
          {portalView !== 'donor' && (
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700"
              >
                <User className="w-3.5 h-3.5 text-sky-400" />
                <span className="capitalize">
                  {portalView === 'hospital' ? hospitalRole : authorityRole}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50">
                  <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                    Switch Active Role
                  </div>
                  {portalView === 'hospital' ? (
                    <>
                      {(['doctor', 'triage', 'blood_bank', 'admin'] as HospitalRole[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => {
                            setHospitalRole(r);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs capitalize ${
                            hospitalRole === r ? 'bg-sky-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {r === 'doctor'
                            ? 'On-Call ER Doctor'
                            : r === 'triage'
                            ? 'Triage Nurse'
                            : r === 'blood_bank'
                            ? 'Blood Bank Officer'
                            : 'Hospital Admin'}
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      {(['director', 'analyst'] as AuthorityRole[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => {
                            setAuthorityRole(r);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs capitalize ${
                            authorityRole === r ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {r === 'director' ? 'Senior Authority Director' : 'Regional Crisis Analyst'}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Auth Persona Quick Switcher Button */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition"
            title="Switch User Persona & Mock Token"
          >
            <span>{currentUser.avatar || '👤'}</span>
            <span className="truncate max-w-[100px] hidden sm:inline">{currentUser.username}</span>
            <span className="text-[10px] font-black uppercase text-sky-400 bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-800/60 hidden md:inline">
              {currentUser.role.replace('_', ' ')}
            </span>
          </button>

          {/* Sound Mute/Unmute Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs transition ${
              soundEnabled
                ? 'bg-slate-800 text-sky-400 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title={soundEnabled ? 'Emergency Chimes Sound Enabled' : 'Muted'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* ⚡ Trigger Live Crisis Simulation Button */}
          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-alert-600 to-alert-700 hover:from-alert-700 hover:to-alert-800 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-alert-600/30 transition"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Simulate SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
