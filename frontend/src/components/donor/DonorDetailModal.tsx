import React from 'react';
import {
  X,
  User,
  Droplet,
  HeartHandshake,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Award,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  QrCode,
  Building2,
  Navigation,
} from 'lucide-react';
import { DonorProfile } from '../../types/dashboard';
import { useDashboard } from '../../context/DashboardContext';

interface DonorDetailModalProps {
  donor: DonorProfile;
  onClose: () => void;
}

export const DonorDetailModal: React.FC<DonorDetailModalProps> = ({ donor, onClose }) => {
  const { setActiveDonorId, setPortalView, donorRequests } = useDashboard();

  // Find if this donor has an active match
  const activeMatch = donorRequests.find((req) =>
    req.matchedDonors.some((m) => m.donorId === donor.id)
  );
  const matchedEntry = activeMatch?.matchedDonors.find((m) => m.donorId === donor.id);

  const handleSelectDonor = () => {
    setActiveDonorId(donor.id);
    setPortalView('donor');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* ── Modal Header ─────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 text-white p-6 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-600/30 text-rose-300 border border-rose-500/40 flex items-center justify-center font-black text-2xl">
              🩸
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500/30 text-rose-200 border border-rose-400/40 px-2 py-0.5 rounded">
                  {donor.badgeTitle}
                </span>
                <span className="text-xs font-mono font-bold text-rose-300">
                  ID: {donor.id.toUpperCase()}
                </span>
              </div>
              <h3 className="text-xl font-black tracking-tight mt-0.5">{donor.fullName}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Modal Body ───────────────────────────────────────────────────── */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-700 block">Blood Group</span>
              <span className="text-2xl font-black text-rose-950 font-mono">{donor.bloodGroup}</span>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-purple-700 block">Organ Pledge</span>
              <span className="text-xs font-black text-purple-950 mt-1 block">
                {donor.isOrganDonor ? '✓ NOTTO Registered' : 'Not Pledged'}
              </span>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-700 block">Donations</span>
              <span className="text-2xl font-black text-amber-950 font-mono">{donor.totalDonations}</span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Eligibility</span>
              <span className="text-xs font-black text-emerald-950 mt-1 block uppercase">
                {donor.eligibilityStatus}
              </span>
            </div>
          </div>

          {/* Active Incident / Match Status (If any) */}
          {activeMatch && matchedEntry && (
            <div className="bg-rose-500/10 border border-rose-300 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-rose-600 animate-spin" />
                  <span>CURRENT ACTIVE STAT CALLOUT MATCH</span>
                </span>
                <span className="text-[10px] font-mono font-bold bg-rose-600 text-white px-2 py-0.5 rounded">
                  {matchedEntry.responseStatus.toUpperCase()}
                </span>
              </div>
              <p className="text-slate-700">
                Matched with <strong>{activeMatch.hospitalName}</strong> for{' '}
                <strong>{activeMatch.unitsRequested} Unit(s) of {activeMatch.bloodGroupNeeded}</strong>.
              </p>
              <p className="text-[11px] text-slate-500">
                Proximity: {matchedEntry.distanceKm} km · ETA: {matchedEntry.etaMinutes} mins
              </p>
            </div>
          )}

          {/* Contact & Location Dossier */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>Contact & Verified Geolocation</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 block">Registered Address</span>
                <p className="font-semibold text-slate-800">{donor.address}</p>
                <p className="text-slate-500 font-mono">PIN: {donor.pincode}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Contact Info</span>
                <p className="font-semibold text-slate-800 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-sky-600" /> {donor.phone}
                </p>
                <p className="text-slate-600 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-sky-600" /> {donor.email}
                </p>
              </div>
            </div>
          </div>

          {/* Donation History & Standing */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Donation Records & Clinical Interval</span>
            </h4>
            <div className="space-y-2 text-slate-700">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span>Last Whole Blood Donation:</span>
                <strong className="text-slate-900">{donor.lastDonationDate}</strong>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span>Organ Pledge Consent ID:</span>
                <strong className="text-purple-900 font-mono">
                  {donor.organConsentRegistryNumber || 'None'}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Community Lifesaver Standing:</span>
                <span className="text-emerald-700 font-bold">Top 5% Rapid Responders</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Modal Footer ─────────────────────────────────────────────────── */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleSelectDonor}
            className="py-2.5 px-5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md shadow-rose-600/30 transition flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            <span>Switch Active View to this Donor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
