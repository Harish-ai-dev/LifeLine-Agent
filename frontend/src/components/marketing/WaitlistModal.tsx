'use client';

import React, { useState } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  Loader2 
} from 'lucide-react';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({ isOpen, onClose }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [orgType, setOrgType] = useState('EMS Agency');
  const [orgName, setOrgName] = useState('');
  const [interestArea, setInterestArea] = useState('Full Multi-Agent Pipeline');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setError('Please provide your name and email.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          organization_type: orgType,
          organization_name: orgName,
          role: 'Pilot Evaluator',
          interest_area: interestArea,
          notes
        })
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit registration.');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with waitlist service.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl text-slate-800">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-8 space-y-4 font-mono">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 mx-auto flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Pilot Registration Confirmed!</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              Thank you for registering. You have been added to our pilot cohort queue. We will notify you when sandbox API keys and self-hosted docker images are dispatched.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs font-mono"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="text-left">
            <div className="flex items-center space-x-2 text-cyan-600 text-xs font-mono mb-1 font-bold">
              <Sparkles className="w-4 h-4 text-cyan-600" />
              <span>PILOT & EARLY ADOPTER COHORT</span>
            </div>
            
            <h3 className="text-2xl font-bold font-mono text-slate-900">
              Join the LifeLine Agent Pilot
            </h3>
            
            <p className="text-xs text-slate-500 mt-1 font-mono">
              For EMS agencies, hospital trauma directors, and municipal 911 dispatch networks.
            </p>

            {error && (
              <div className="p-3 my-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-500 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Work / Professional Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. alex@ems-region4.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">Organization Type</label>
                  <select
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="EMS Agency">EMS Agency</option>
                    <option value="Trauma Center / Hospital">Hospital Trauma Center</option>
                    <option value="911 CAD Dispatch">911 CAD Dispatch</option>
                    <option value="Health Authority / Gov">Gov Health Authority</option>
                    <option value="AI Researcher">AI Researcher</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Organization Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Metro EMS"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Primary Interest Area</label>
                <select
                  value={interestArea}
                  onChange={(e) => setInterestArea(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Full Multi-Agent Pipeline">Full Multi-Agent Pipeline</option>
                  <option value="Triage & NEWS2 Agent Only">Triage & NEWS2 Scoring</option>
                  <option value="OSRM Routing & Bed Match">OSRM Routing & Bed Match</option>
                  <option value="Pre-Arrival SBAR Briefing">Pre-Arrival SBAR Briefing</option>
                  <option value="Self-Hosted Docker Deployment">Self-Hosted Docker Deployment</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-4 py-3 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>REGISTERING PILOT ACCESS...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-slate-950" />
                    <span>CONFIRM PILOT REGISTRATION</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
