import React, { useState } from 'react';
import {
  X,
  User,
  Building2,
  Landmark,
  HeartHandshake,
  ShieldCheck,
  Key,
  Copy,
  Check,
  LogIn,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { UserRole, AuthUser } from '../../types/dashboard';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const {
    currentUser,
    authToken,
    demoUsers,
    login,
    logout,
    hospitals,
    donors,
  } = useDashboard();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'personas' | 'custom'>('personas');

  // Custom login state
  const [customUsername, setCustomUsername] = useState('');
  const [customRole, setCustomRole] = useState<UserRole>('hospital_staff');
  const [customFacilityId, setCustomFacilityId] = useState(hospitals[0]?.id || '');
  const [customDonorId, setCustomDonorId] = useState(donors[0]?.id || '');

  const handleCopyToken = () => {
    navigator.clipboard.writeText(authToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUsername.trim()) return;
    login(
      customUsername.trim(),
      customRole,
      customRole === 'hospital_staff' ? customFacilityId : undefined,
      customRole === 'blood_donor' ? customDonorId : undefined
    );
    onClose();
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'hospital_staff':
        return <Building2 className="w-5 h-5 text-sky-400" />;
      case 'government_authority':
        return <Landmark className="w-5 h-5 text-indigo-400" />;
      case 'blood_donor':
        return <HeartHandshake className="w-5 h-5 text-rose-400" />;
    }
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'hospital_staff':
        return 'bg-sky-500/20 text-sky-300 border-sky-400/30';
      case 'government_authority':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30';
      case 'blood_donor':
        return 'bg-rose-500/20 text-rose-300 border-rose-400/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-3xl max-w-2xl w-full border border-slate-800 shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-600/20 border border-sky-500/40 flex items-center justify-center text-2xl">
              🔐
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-sky-500/30 text-sky-300 border border-sky-400/40 px-2 py-0.5 rounded">
                  Authentication & Role Matrix
                </span>
                <span className="text-xs font-mono text-slate-400">09-Contract Compliant</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
                Select Active Persona & Access Tier
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Active Session Info Card */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl border border-slate-700">
                {currentUser.avatar || '👤'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base text-white">{currentUser.username}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getRoleBadgeStyle(currentUser.role)}`}>
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentUser.title || currentUser.facility_name || 'Active Platform Session'}
                </p>
              </div>
            </div>

            {/* Token Badge with 1-Click Copy */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
              <Key className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left font-mono text-[11px] text-slate-300 max-w-[200px] truncate">
                {authToken}
              </div>
              <button
                onClick={handleCopyToken}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                title="Copy Bearer Token"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="px-6 pt-4 flex gap-2 border-b border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('personas')}
            className={`pb-3 px-3 transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'personas'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pre-Configured Demo Personas ({demoUsers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-3 px-3 transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Custom Identity Login</span>
          </button>
        </div>

        {/* Tab 1: Demo Personas Grid */}
        {activeTab === 'personas' && (
          <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
            <p className="text-xs text-slate-400">
              Click any demo account to instantly assume their authenticated identity, permissions, and contextual view:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {demoUsers.map((user) => {
                const isActive = currentUser.id === user.id && currentUser.role === user.role;
                return (
                  <button
                    key={`${user.role}-${user.id}`}
                    onClick={() => {
                      login(user.username, user.role, user.facility_id, user.donor_id);
                      onClose();
                    }}
                    className={`text-left p-4 rounded-2xl border transition flex items-start justify-between gap-3 ${
                      isActive
                        ? 'bg-sky-950/60 border-sky-500 shadow-md shadow-sky-900/30 ring-1 ring-sky-500'
                        : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl shrink-0 mt-0.5">
                        {user.avatar || '👤'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-sm text-white">{user.username}</span>
                          {isActive && (
                            <span className="text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 font-medium mt-0.5">{user.title}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[180px] mt-0.5">
                          {user.facility_name}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 mt-1">{getRoleIcon(user.role)}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Custom Login Form */}
        {activeTab === 'custom' && (
          <form onSubmit={handleCustomLogin} className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Username / Identifier
              </label>
              <input
                type="text"
                required
                value={customUsername}
                onChange={(e) => setCustomUsername(e.target.value)}
                placeholder="e.g. dr_adams or citizen_raj"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { role: 'hospital_staff', label: '🏥 Hospital Staff' },
                    { role: 'government_authority', label: '🏛️ Gov Authority' },
                    { role: 'blood_donor', label: '🩸 Blood Donor' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.role}
                    type="button"
                    onClick={() => setCustomRole(opt.role)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition ${
                      customRole === opt.role
                        ? 'bg-sky-600 text-white border-sky-400 shadow-md'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {customRole === 'hospital_staff' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Assigned Facility
                </label>
                <select
                  value={customFacilityId}
                  onChange={(e) => setCustomFacilityId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.tier})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {customRole === 'blood_donor' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Link to Donor Registry Profile
                </label>
                <select
                  value={customDonorId}
                  onChange={(e) => setCustomDonorId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:ring-2 focus:ring-rose-500"
                >
                  {donors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName} ({d.bloodGroup} · {d.badgeTitle})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-2 mt-4"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Custom Persona</span>
            </button>
          </form>
        )}

        {/* Modal Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>LifeLine Agent Mock Auth Engine · Zero-friction evaluation mode</span>
          <button
            onClick={logout}
            className="text-slate-400 hover:text-white flex items-center gap-1.5 font-bold transition"
          >
            <LogOut className="w-3.5 h-3.5 text-alert-400" />
            <span>Reset to Default</span>
          </button>
        </div>
      </div>
    </div>
  );
};
