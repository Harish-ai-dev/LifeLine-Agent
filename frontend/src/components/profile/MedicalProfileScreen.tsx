import React, { useState } from 'react';
import {
  FileHeart,
  ShieldCheck,
  Printer,
  QrCode,
  Edit3,
  Plus,
  Trash2,
  Save,
  AlertOctagon,
  HeartPulse,
  Pill,
  Stethoscope,
  FileText,
} from 'lucide-react';
import { MedicalProfile } from '../../types';

interface MedicalProfileScreenProps {
  profile: MedicalProfile;
  onUpdateProfile: (profile: MedicalProfile) => void;
}

export const MedicalProfileScreen: React.FC<MedicalProfileScreenProps> = ({
  profile,
  onUpdateProfile,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<MedicalProfile>(profile);
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);

  const handleSave = () => {
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setFormData({
        ...formData,
        allergies: [...formData.allergies, newAllergy.trim()],
      });
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (idx: number) => {
    setFormData({
      ...formData,
      allergies: formData.allergies.filter((_, i) => i !== idx),
    });
  };

  const handleAddCondition = () => {
    if (newCondition.trim()) {
      setFormData({
        ...formData,
        conditions: [...formData.conditions, newCondition.trim()],
      });
      setNewCondition('');
    }
  };

  const handleRemoveCondition = (idx: number) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24 md:pb-12">
      {/* Header with Edit & Print actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileHeart className="w-6 h-6 text-sky-600" />
            Medical ID Profile
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Critical health data instantly shared with Paramedics & Emergency Rooms during an SOS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-1.5 py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Emergency ID</span>
          </button>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-md"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          )}
        </div>
      </div>

      {/* ── DIGITAL FIRST RESPONDER CARD ────────────────────────────────────── */}
      <div className="bg-gradient-to-tr from-slate-900 via-navy-900 to-sky-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-alert-600/20 text-alert-400 border border-alert-500/40 flex items-center justify-center font-black text-xl">
              🏥
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400">
                EMERGENCY MEDICAL IDENTIFICATION
              </span>
              <h3 className="text-2xl font-black tracking-tight">{profile.fullName}</h3>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Blood Type</span>
              <span className="text-3xl font-black text-white font-mono">{profile.bloodType}</span>
            </div>
            <div className="text-right pl-4 border-l border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Organ Donor</span>
              <span className="text-base font-extrabold text-emerald-400">
                {profile.organDonor ? 'YES' : 'NO'}
              </span>
            </div>
          </div>
        </div>

        {/* Vital Demographics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-6">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 block">Age & Gender</span>
            <span className="font-bold text-white text-sm">{profile.age} yrs · {profile.gender}</span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 block">Date of Birth</span>
            <span className="font-bold text-white text-sm font-mono">{profile.dob}</span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 block">Height / Weight</span>
            <span className="font-bold text-white text-sm">{profile.heightCm} cm · {profile.weightKg} kg</span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 block">Insurance Policy</span>
            <span className="font-bold text-white text-xs truncate block font-mono">{profile.insurance.policyNumber}</span>
          </div>
        </div>

        {/* Critical Alerts Banner */}
        <div className="bg-alert-950/80 border border-alert-600/60 rounded-2xl p-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-alert-300 uppercase tracking-wider mb-2">
            <AlertOctagon className="w-4 h-4 text-alert-400" />
            <span>Critical Allergies & Anaphylaxis Risk</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.allergies.map((allergy, i) => (
              <span
                key={i}
                className="bg-alert-900/90 text-alert-200 border border-alert-700/80 px-2.5 py-1 rounded-lg font-bold"
              >
                {allergy}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── DETAILED MEDICAL SECTIONS ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Chronic Conditions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
            <HeartPulse className="w-4 h-4 text-sky-600" />
            <span>Chronic Medical Conditions</span>
          </div>

          <div className="space-y-2">
            {formData.conditions.map((cond, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
              >
                <span>{cond}</span>
                {isEditing && (
                  <button
                    onClick={() => handleRemoveCondition(i)}
                    className="text-slate-400 hover:text-alert-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            {isEditing && (
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add condition..."
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
                <button
                  onClick={handleAddCondition}
                  className="p-1.5 bg-sky-600 text-white rounded-lg text-xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. Current Medications */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
            <Pill className="w-4 h-4 text-sky-600" />
            <span>Current Medications & Dosages</span>
          </div>

          <div className="space-y-2 text-xs">
            {formData.medications.map((med, i) => (
              <div
                key={i}
                className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{med.name} ({med.dosage})</span>
                </div>
                <span className="text-slate-500 text-[11px] block mt-0.5">{med.frequency}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Primary Physician & Care Team */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
            <Stethoscope className="w-4 h-4 text-sky-600" />
            <span>Primary Physician & Hospital</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="font-bold text-slate-900">{profile.primaryPhysician.name}</div>
            <div className="text-slate-500">{profile.primaryPhysician.hospital}</div>
            <div className="text-sky-700 font-mono font-bold pt-1">{profile.primaryPhysician.phone}</div>
          </div>
        </div>

        {/* 4. First Responder Direct Notes */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
            <FileText className="w-4 h-4 text-sky-600" />
            <span>Emergency Resuscitation Notes</span>
          </div>
          {isEditing ? (
            <textarea
              value={formData.emergencyNotes}
              onChange={(e) => setFormData({ ...formData, emergencyNotes: e.target.value })}
              rows={3}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          ) : (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
              {profile.emergencyNotes}
            </div>
          )}
        </div>
      </div>

      {/* Print / Export Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">First Responder Medical Card</h3>
            <p className="text-xs text-slate-500">
              Print this card or save it to your phone wallet so paramedics can scan your critical info during a crisis.
            </p>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-center">
              <div className="w-36 h-36 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xs font-mono font-bold p-2 text-center">
                [FIRST RESPONDER MEDICAL QR]
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPrintModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  setShowPrintModal(false);
                }}
                className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-md"
              >
                Print Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
