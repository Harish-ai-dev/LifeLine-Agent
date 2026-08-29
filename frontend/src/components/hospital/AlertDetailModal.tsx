import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  MapPin,
  Clock,
  HeartPulse,
  AlertTriangle,
  FileText,
  UserCheck,
  CheckCircle2,
  Phone,
  ArrowRightLeft,
  Activity,
  Pill,
  Stethoscope,
  Building2,
  Navigation,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { EmergencyIncidentAlert, HospitalFacility } from '../../types/dashboard';

import { DonorRequestModal } from './DonorRequestModal';
import { BloodGroup } from '../../types/dashboard';

interface AlertDetailModalProps {
  alert: EmergencyIncidentAlert;
  onClose: () => void;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({ alert, onClose }) => {
  const {
    hospitals,
    currentHospital,
    acknowledgeAlert,
    prepareBay,
    admitPatient,
    resolveAlert,
    reassignAlert,
    hospitalRole,
  } = useDashboard();

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDonorModal, setShowDonorModal] = useState(false);
  const [targetHospitalId, setTargetHospitalId] = useState(
    hospitals.find((h) => h.id !== alert.assignedHospitalId)?.id || hospitals[0].id
  );
  const [transferReason, setTransferReason] = useState(
    'Surge capacity in Trauma Bay — transferring to Level 1 Center'
  );

  const isAssignedToUs = alert.assignedHospitalId === currentHospital.id;

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    reassignAlert(alert.id, targetHospitalId, transferReason, `Dr. On-Call (${currentHospital.name})`);
    setShowTransferModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto">
        {/* ── Modal Header Banner ──────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-700">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-alert-600/20 text-alert-400 border border-alert-500/40 flex items-center justify-center font-black text-xl shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-alert-600 text-white px-2 py-0.5 rounded">
                  {alert.crisisType.toUpperCase()} EMERGENCY
                </span>
                <span className="text-xs font-mono text-slate-300">
                  {alert.trackingNumber}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1">
                {alert.patient.fullName}, {alert.patient.age}yo {alert.patient.gender}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Driving ETA badge */}
            <div className="bg-sky-500/20 border border-sky-400/40 rounded-2xl px-4 py-2 text-right">
              <span className="text-[10px] uppercase font-bold text-sky-300 block">Ambulance ETA</span>
              <span className="text-xl font-black text-white font-mono">
                {alert.drivingEtaMinutes} mins
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* ── Modal Body Content ───────────────────────────────────────────── */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* 1. NEWS2 Scoring & Clinical Vitals Bar */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-alert-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  NEWS2 Clinical Triage Rating
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-alert-500/20 text-alert-300 border border-alert-500/40 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider">
                  Score: {alert.news2Score}/20 · {alert.news2RiskBand.toUpperCase()} RISK
                </span>
                <span className="bg-sky-500/20 text-sky-300 border border-sky-400/40 px-3 py-1 rounded-full text-xs font-bold font-mono">
                  Blood: {alert.patient.bloodType}
                </span>
              </div>
            </div>

            {/* Vitals Matrix */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Heart Rate</span>
                <span className="text-base font-black text-alert-400 font-mono">{alert.vitals.heartRate}</span>
                <span className="text-[10px] text-slate-400 block">bpm</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">BP (Sys)</span>
                <span className="text-base font-black text-sky-300 font-mono">{alert.vitals.systolicBp}</span>
                <span className="text-[10px] text-slate-400 block">mmHg</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">SpO2 Sat</span>
                <span className="text-base font-black text-emerald-400 font-mono">{alert.vitals.spo2}%</span>
                <span className="text-[10px] text-slate-400 block">Room Air</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Resp Rate</span>
                <span className="text-base font-black text-amber-300 font-mono">{alert.vitals.respiratoryRate}</span>
                <span className="text-[10px] text-slate-400 block">/min</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Temp</span>
                <span className="text-base font-black text-purple-300 font-mono">{alert.vitals.temperatureC}°C</span>
                <span className="text-[10px] text-slate-400 block">Core</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Consciousness</span>
                <span className="text-xs font-black text-white uppercase mt-1 block">
                  {alert.vitals.consciousness}
                </span>
                <span className="text-[10px] text-slate-400 block">AVPU</span>
              </div>
            </div>
          </div>

          {/* 2. Critical Allergies & Chronic Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Allergies */}
            <div className="bg-alert-50 border border-alert-200 rounded-2xl p-4 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-alert-900 uppercase tracking-wider mb-2">
                <AlertTriangle className="w-4 h-4 text-alert-600" />
                <span>Anaphylactic Allergies</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {alert.patient.allergies.map((allg, i) => (
                  <span
                    key={i}
                    className="bg-alert-100 text-alert-800 border border-alert-300 px-2.5 py-1 rounded-lg font-bold"
                  >
                    {allg}
                  </span>
                ))}
              </div>
            </div>

            {/* Chronic Conditions & Meds */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider mb-2">
                <Pill className="w-4 h-4 text-sky-600" />
                <span>Known Conditions & Daily Meds</span>
              </div>
              <div className="text-slate-700 space-y-1">
                <p>
                  <strong>Conditions:</strong> {alert.patient.conditions.join(', ') || 'None recorded'}
                </p>
                <p className="text-slate-500">
                  <strong>Medications:</strong>{' '}
                  {alert.patient.medications.map((m) => `${m.name} (${m.dosage})`).join(', ') || 'None'}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Pre-Arrival SBAR Radio Protocol */}
          <div className="bg-sky-50/70 border-l-4 border-sky-600 rounded-r-2xl p-4 text-xs sm:text-sm text-slate-800 leading-relaxed font-mono">
            <div className="flex items-center gap-2 font-bold text-sky-900 uppercase tracking-wider mb-1 font-sans">
              <FileText className="w-4 h-4 text-sky-700" />
              <span>Transmitted Pre-Arrival SBAR Radio Protocol</span>
            </div>
            {alert.sbarBrief}
          </div>

          {/* 4. Incident Location & Emergency Contacts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider mb-2">
                <MapPin className="w-4 h-4 text-sky-600" />
                <span>Incident Geolocation</span>
              </div>
              <p className="font-bold text-slate-800">{alert.location.address}</p>
              <p className="text-slate-500 mt-1 font-mono">
                GPS: {alert.location.lat.toFixed(4)}°N, {alert.location.lng.toFixed(4)}°E (±4m)
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider mb-2">
                <UserCheck className="w-4 h-4 text-sky-600" />
                <span>Emergency Contacts Broadcasted</span>
              </div>
              <div className="space-y-1.5">
                {alert.patient.emergencyContacts.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-slate-700">
                    <span>
                      <strong>{c.name}</strong> ({c.relationship})
                    </span>
                    <span className="font-mono text-slate-500">{c.phone}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Modal Footer Action Controls ─────────────────────────────────── */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Transfer / Reassign Button */}
            <button
              onClick={() => setShowTransferModal(true)}
              className="flex items-center gap-1.5 py-2.5 px-3.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <ArrowRightLeft className="w-4 h-4 text-amber-600" />
              <span>Transfer / Reassign</span>
            </button>

            {/* Raise STAT Blood Request Button */}
            <button
              onClick={() => setShowDonorModal(true)}
              className="flex items-center gap-1.5 py-2.5 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <span>🩸 Request Blood / Organ (STAT)</span>
            </button>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2.5">
            {alert.status === 'pending_ack' && (
              <button
                onClick={() => acknowledgeAlert(alert.id)}
                className="flex items-center gap-2 py-3 px-5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-sky-600/30 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Acknowledge Alert (Stop SLA)</span>
              </button>
            )}

            {alert.status === 'acknowledged' && (
              <button
                onClick={() => prepareBay(alert.id, 'Trauma Resuscitation Bay 1')}
                className="flex items-center gap-2 py-3 px-5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition"
              >
                <Building2 className="w-4 h-4" />
                <span>Designate Resuscitation Bay 1 Ready</span>
              </button>
            )}

            {(alert.status === 'bay_ready' || alert.status === 'bay_preparing') && (
              <button
                onClick={() => admitPatient(alert.id)}
                className="flex items-center gap-2 py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Patient Arrived — Admit to ER</span>
              </button>
            )}

            {alert.status === 'admitted' && (
              <button
                onClick={() => resolveAlert(alert.id)}
                className="flex items-center gap-2 py-3 px-5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete / Discharge Case</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Close
            </button>
          </div>
        </div>

        {/* ── Transfer / Reassignment Sub-Modal ────────────────────────────── */}
        {showTransferModal && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
                <ArrowRightLeft className="w-5 h-5 text-amber-600" />
                <span>Manual Emergency Reassignment</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Override auto-routing and divert this patient to another specialized regional facility.
              </p>

              <form onSubmit={handleExecuteTransfer} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Destination Facility
                  </label>
                  <select
                    value={targetHospitalId}
                    onChange={(e) => setTargetHospitalId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                  >
                    {hospitals
                      .filter((h) => h.id !== alert.assignedHospitalId)
                      .map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name} ({h.tier}) — {h.availableTraumaBays} Trauma Bays Free
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Clinical Reassignment Reason
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. Cath Lab at surge capacity, patient requires urgent Level 1 ECMO support."
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTransferModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    Execute Reassignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Donor Request Sub-Modal ───────────────────────────────────────── */}
        {showDonorModal && (
          <DonorRequestModal
            defaultPatientTracking={alert.trackingNumber}
            defaultPatientName={`${alert.patient.fullName} (${alert.patient.age}yo ${alert.patient.gender})`}
            defaultBloodGroup={(alert.patient.bloodType as BloodGroup) || 'O-'}
            onClose={() => setShowDonorModal(false)}
          />
        )}
      </div>
    </div>
  );
};
