import React, { useState } from 'react';
import { X, HeartHandshake, Droplet, ShieldCheck, CheckCircle2, User, MapPin } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { BloodGroup } from '../../types/dashboard';

interface DonorRegistrationModalProps {
  onClose: () => void;
}

export const DonorRegistrationModal: React.FC<DonorRegistrationModalProps> = ({ onClose }) => {
  const { registerNewDonor } = useDashboard();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [isOrganDonor, setIsOrganDonor] = useState(true);
  const [address, setAddress] = useState('Bandra West, Mumbai');
  const [pincode, setPincode] = useState('400050');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerNewDonor({
      fullName,
      phone,
      email,
      bloodGroup,
      isOrganDonor,
      organConsentRegistryNumber: isOrganDonor
        ? `NOTTO-MUM-${Math.floor(10000 + Math.random() * 90000)}`
        : undefined,
      donorCategory: isOrganDonor ? 'Dual' : 'Blood',
      lat: 19.0543,
      lng: 72.8282,
      address,
      pincode,
      status: 'available',
      lastDonationDate: 'First Time Donor (Eligible)',
      eligibilityStatus: 'eligible',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-black">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Register as a Verified LifeLine Donor
              </h3>
              <p className="text-xs text-slate-500">
                Get auto-matched and notified when a nearby hospital has an emergency need.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
              Full Legal Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Aditi Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold bg-white text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                Mobile Number (SMS Alerts)
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98200 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-slate-800 bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="donor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white"
              />
            </div>
          </div>

          {/* Blood Group Picker */}
          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1.5">
              Your Blood Group
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] as BloodGroup[]).map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setBloodGroup(bg)}
                  className={`py-2 rounded-xl font-black text-xs border transition ${
                    bloodGroup === bg
                      ? 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500/30'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Organ Donor Consent Switch */}
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="font-bold text-purple-950 block">State Organ Donor Pledge (NOTTO)</span>
              <span className="text-[10px] text-purple-700">
                Consent to pledge organs in case of certified brain death.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOrganDonor(!isOrganDonor)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase transition ${
                isOrganDonor ? 'bg-purple-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {isOrganDonor ? 'Pledged' : 'Opt Out'}
            </button>
          </div>

          {/* Address & Pincode */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                Area / Locality
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                Pincode
              </label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-slate-800 bg-white"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-black uppercase tracking-wider rounded-xl shadow-md transition"
            >
              Complete Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
