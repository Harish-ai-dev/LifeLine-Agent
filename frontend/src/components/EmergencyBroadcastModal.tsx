'use client';

import React, { useState } from 'react';
import {
  Radio,
  X,
  Send,
  AlertTriangle,
  Siren,
  HeartPulse,
  Droplets,
  Users,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { soundEffects } from '@/utils/soundEffects';
import { useDashboard } from '@/context/DashboardContext';

interface EmergencyBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmergencyBroadcastModal({ isOpen, onClose }: EmergencyBroadcastModalProps) {
  const { currentHospital, currentUser } = useDashboard();
  const [broadcastType, setBroadcastType] = useState<'CODE_BLUE' | 'TRAUMA_ALERT' | 'MCI_SURGE' | 'BLOOD_CALLOUT'>('TRAUMA_ALERT');
  const [targetTeam, setTargetTeam] = useState('All On-Call Emergency & Trauma Teams');
  const [message, setMessage] = useState('Critical trauma patient en route with high NEWS2 score. Trauma Bay 1 on standby.');
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playEmergencySiren();
    setIsSent(true);

    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center font-black shadow-sm">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                STAT Emergency Staff Broadcast
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Initiating from {currentHospital.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSent ? (
          <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-emerald-950">Broadcast Transmitted to All On-Call Pagers &amp; Terminals!</h3>
            <p className="text-xs text-emerald-700 font-mono">
              Audible alarms triggered across {targetTeam}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs font-mono">
            {/* Preset Types */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5 uppercase text-[11px]">
                Select Alert Protocol
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'TRAUMA_ALERT', label: '🚨 Trauma Alert Alpha', team: 'Emergency Trauma Surgery, Ortho, Blood Bank' },
                  { id: 'CODE_BLUE', label: '⚡ STAT Code Blue', team: 'Cardiology & Resuscitation Team' },
                  { id: 'MCI_SURGE', label: '🔥 Mass Casualty Surge', team: 'All Hospital Personnel & Regional Authority' },
                  { id: 'BLOOD_CALLOUT', label: '🩸 STAT Blood Callout', team: 'Central Blood Bank & Registered Donors' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setBroadcastType(item.id as any);
                      setTargetTeam(item.team);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      broadcastType === item.id
                        ? 'bg-red-50 border-red-500 text-red-950 font-bold shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 uppercase text-[11px]">
                Target Recipient Group
              </label>
              <input
                type="text"
                value={targetTeam}
                onChange={(e) => setTargetTeam(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-sans focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 uppercase text-[11px]">
                Broadcast Message &amp; Clinical Directives
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-sans focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-600/30 flex items-center gap-1.5"
              >
                <Radio className="w-4 h-4" />
                <span>Transmit Broadcast (STAT)</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
