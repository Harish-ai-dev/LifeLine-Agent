import React, { useState } from 'react';
import {
  HeartHandshake,
  Droplet,
  ShieldCheck,
  MapPin,
  Clock,
  CheckCircle2,
  Navigation,
  QrCode,
  AlertTriangle,
  Award,
  ChevronDown,
  User,
  PlusCircle,
  FileCheck,
  Car,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Users,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { DonorRegistrationModal } from './DonorRegistrationModal';
import { DonorNavigationMap } from './DonorNavigationMap';
import { DonorDetailModal } from './DonorDetailModal';
import { DonorProfile, DonorResponseStatus, BloodGroup } from '../../types/dashboard';

export const DonorPortal: React.FC = () => {
  const {
    donors,
    activeDonorId,
    setActiveDonorId,
    currentDonor,
    donorRequests,
    respondToDonorRequest,
  } = useDashboard();

  const [portalSubTab, setPortalSubTab] = useState<'my_profile' | 'explore_all'>('my_profile');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showDonorMenu, setShowDonorMenu] = useState(false);
  const [selectedDonorForModal, setSelectedDonorForModal] = useState<DonorProfile | null>(null);

  // One-by-One Carousel state
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [filterBloodGroup, setFilterBloodGroup] = useState<string>('ALL');

  const filteredDonors = donors.filter((d) => {
    if (filterBloodGroup === 'ALL') return true;
    return d.bloodGroup === filterBloodGroup;
  });

  const safeIndex = Math.min(carouselIndex, Math.max(0, filteredDonors.length - 1));
  const oneDonor = filteredDonors[safeIndex] || donors[0];

  const handlePrevDonor = () => {
    setCarouselIndex((prev) => (prev > 0 ? prev - 1 : filteredDonors.length - 1));
  };

  const handleNextDonor = () => {
    setCarouselIndex((prev) => (prev < filteredDonors.length - 1 ? prev + 1 : 0));
  };

  // Find if there is any active request matched with THIS active donor
  const activeMatch = donorRequests.find((req) =>
    req.matchedDonors.some((m) => m.donorId === currentDonor.id)
  );

  const myMatchedEntry = activeMatch?.matchedDonors.find((m) => m.donorId === currentDonor.id);

  const handleRespond = (responseStatus: DonorResponseStatus) => {
    if (activeMatch) {
      respondToDonorRequest(activeMatch.id, currentDonor.id, responseStatus);
    }
  };

  const isAcceptedOrTraveling =
    myMatchedEntry &&
    (myMatchedEntry.responseStatus === 'accepted' ||
      myMatchedEntry.responseStatus === 'en_route' ||
      myMatchedEntry.responseStatus === 'arrived');

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      {/* ── Top Donor Header Card ────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 border border-rose-900/60 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-600/30 text-rose-400 border border-rose-500/40 flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
              🩸
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500/30 text-rose-200 border border-rose-400/40 px-2 py-0.5 rounded">
                  {currentDonor.badgeTitle}
                </span>
                <span className="text-xs font-mono font-bold text-rose-300">
                  Group: {currentDonor.bloodGroup}
                </span>
                {currentDonor.isOrganDonor && (
                  <span className="text-[10px] font-bold bg-purple-500/30 text-purple-300 border border-purple-400/40 px-2 py-0.5 rounded">
                    NOTTO Pledged
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                {currentDonor.fullName}
              </h1>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>{currentDonor.address}</span>
              </p>
            </div>
          </div>

          {/* Sub-tab Switcher & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Switcher: My Profile vs Browse Donors One-by-One */}
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-700 text-xs font-bold gap-1">
              <button
                onClick={() => setPortalSubTab('my_profile')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  portalSubTab === 'my_profile'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>My Active Profile</span>
              </button>

              <button
                onClick={() => setPortalSubTab('explore_all')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  portalSubTab === 'explore_all'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Browse Donors (One-by-One)</span>
              </button>
            </div>

            {/* Switch Donor Profile */}
            <div className="relative">
              <button
                onClick={() => setShowDonorMenu(!showDonorMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 text-slate-200 border border-slate-700 text-xs font-bold transition"
              >
                <User className="w-3.5 h-3.5 text-rose-400" />
                <span>Switch ({currentDonor.bloodGroup})</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showDonorMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                    Quick Switch Donor
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

            <button
              onClick={() => setShowRegisterModal(true)}
              className="flex items-center gap-1.5 py-1.5 px-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-md"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── SUB-TAB 1: MY ACTIVE PROFILE & STAT CALLOUT MATCH ─────────────── */}
      {portalSubTab === 'my_profile' && (
        <>
          {/* If Accepted / En Route: Render DEDICATED NAVIGATION MAP SCREEN */}
          {activeMatch && myMatchedEntry && isAcceptedOrTraveling ? (
            <DonorNavigationMap request={activeMatch} matchedEntry={myMatchedEntry} />
          ) : activeMatch && myMatchedEntry && myMatchedEntry.responseStatus === 'notified' ? (
            /* If Notified: Urgent STAT Match Alert Card */
            <div className="bg-gradient-to-r from-rose-50 via-white to-rose-50 rounded-3xl p-6 border-2 border-rose-500 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black animate-pulse">
                    <Droplet className="w-6 h-6 fill-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-rose-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
                        🚨 STAT EMERGENCY BLOOD CALLOUT
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-700">
                        {activeMatch.requestTrackingNumber}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mt-0.5">
                      {activeMatch.hospitalName} Needs {activeMatch.unitsRequested} Unit(s) of{' '}
                      {activeMatch.bloodGroupNeeded}
                    </h3>
                  </div>
                </div>

                {/* Proximity & ETA Pill */}
                <div className="bg-rose-100 border border-rose-300 rounded-2xl px-4 py-2 text-right">
                  <span className="text-[10px] uppercase font-bold text-rose-800 block">Proximity</span>
                  <span className="text-base font-black text-rose-900 font-mono">
                    {myMatchedEntry.distanceKm} km · {myMatchedEntry.etaMinutes} mins ETA
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                <strong>Clinical Urgency:</strong> {activeMatch.clinicalIndication} Auto-matched based on your verified compatible blood group ({currentDonor.bloodGroup}) and close geographic proximity.
              </p>

              {/* Action Response Buttons */}
              <div className="bg-white p-4 rounded-2xl border border-rose-200 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs">
                  <span className="text-slate-500 font-bold block">Action Required:</span>
                  <strong className="text-slate-900 font-mono text-sm">
                    Can you respond to this urgent callout?
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRespond('accepted')}
                    className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept Callout & Open Navigation Map</span>
                  </button>
                  <button
                    onClick={() => handleRespond('declined')}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                  >
                    Unable to Respond
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Fast-Track Digital Donor Pass & History */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Digital Donor Pass */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      Digital Fast-Track Donor Pass
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>

                <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-200 my-2">
                  <div className="w-24 h-24 mx-auto bg-white p-2 rounded-xl border border-slate-300 shadow-inner flex items-center justify-center">
                    <QrCode className="w-20 h-20 text-slate-800" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 mt-2 block">
                    ID: {currentDonor.id.toUpperCase()} · SCAN AT ER RECEPTION
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700">
                  <p><strong>Donor Name:</strong> {currentDonor.fullName}</p>
                  <p><strong>Blood Group:</strong> <span className="font-bold text-rose-700">{currentDonor.bloodGroup}</span></p>
                  <p><strong>Organ Pledge:</strong> {currentDonor.organConsentRegistryNumber || 'Not registered'}</p>
                  <p><strong>Eligibility:</strong> <span className="text-emerald-700 font-bold">{currentDonor.eligibilityStatus.toUpperCase()}</span></p>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2">
                Priority ER entry authorized for emergency STAT callout responders.
              </div>
            </div>

            {/* Medical Eligibility & Preparation Checklist */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileCheck className="w-5 h-5 text-sky-600" />
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Eligibility & Guidelines
                </h4>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Weight & Age:</strong> 18–65 years, weight &ge; 45 kg.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Hemoglobin:</strong> Minimum 12.5 g/dL (tested on site).</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Cooldown Interval:</strong> 90 days for whole blood donations.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Hydration:</strong> Drink 500ml water prior to arrival.</span>
                </div>
              </div>

              <div className="bg-sky-50 rounded-2xl p-3 border border-sky-100 text-xs text-sky-900">
                <strong>💡 Fast-Track Protocol:</strong> Show your QR pass upon arrival at the hospital blood bank to bypass the outpatient queue.
              </div>
            </div>

            {/* Community Impact & Badges */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Community Impact
                  </h4>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center my-2">
                  <span className="text-3xl font-black text-amber-900 font-mono">
                    {currentDonor.totalDonations}
                  </span>
                  <span className="text-xs font-bold text-amber-800 block mt-0.5">
                    Life-Saving Donations Completed
                  </span>
                  <span className="text-[10px] text-amber-700 font-medium">
                    ~{currentDonor.totalDonations * 3} Potential Lives Impacted
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <p><strong>Last Donation:</strong> {currentDonor.lastDonationDate}</p>
                  <p><strong>Community Standing:</strong> Top 5% Responders in Mumbai</p>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2">
                LifeLine Donor Network — Verified Good Samaritan Community.
              </div>
            </div>
          </div>

          {/* ── Verified Donation History Log ────────────────────────────────── */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-rose-600 fill-rose-600" />
                <h4 className="text-base font-black text-slate-900">
                  Verified Donation History & Certificates
                </h4>
                <span className="text-xs font-mono font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded">
                  {currentDonor.donation_history?.length || 0} Verified Records
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                NBTC & NOTTO National Registry Sync
              </span>
            </div>

            {(!currentDonor.donation_history || currentDonor.donation_history.length === 0) ? (
              <p className="text-xs text-slate-500 text-center py-4">
                No past donation records logged yet. Your first donation certificate will appear here!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {currentDonor.donation_history.map((record) => (
                  <div
                    key={record.donation_id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900">{record.hospital_name}</span>
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                        {record.units} Unit ({record.type.replace('_', ' ')})
                      </span>
                    </div>

                    <div className="text-slate-500 space-y-0.5">
                      <p><strong>Date:</strong> {record.date}</p>
                      <p className="text-[11px] font-mono text-slate-400">
                        Certificate: {record.donation_id}
                      </p>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-emerald-700 font-bold">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified & Stored</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── SUB-TAB 2: BROWSE DONORS ONE-BY-ONE (CAROUSEL & DOSSIER) ─────── */}
      {portalSubTab === 'explore_all' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Filter className="w-4 h-4 text-slate-500" />
              <span>Filter by Blood Group:</span>
            </div>

            <div className="flex flex-wrap gap-1.5 text-xs">
              {['ALL', 'O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((bg) => (
                <button
                  key={bg}
                  onClick={() => {
                    setFilterBloodGroup(bg);
                    setCarouselIndex(0);
                  }}
                  className={`py-1 px-3 rounded-lg font-bold transition font-mono ${
                    filterBloodGroup === bg
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* One-by-One Interactive Donor Spotlight Card */}
          {oneDonor && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
              {/* Carousel Navigation Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                    Donor {safeIndex + 1} of {filteredDonors.length}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    (Showing {filteredDonors.length} registered donors)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevDonor}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition flex items-center gap-1 text-xs"
                    aria-label="Previous donor"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                  <button
                    onClick={handleNextDonor}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition flex items-center gap-1 text-xs"
                    aria-label="Next donor"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Spotlight Donor Profile */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Col: Avatar, Blood Group & Status */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-3xl bg-rose-600 text-white flex items-center justify-center font-black text-2xl shadow-lg">
                      🩸
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider">
                        {oneDonor.badgeTitle}
                      </span>
                      <h3 className="text-xl font-black text-slate-900">{oneDonor.fullName}</h3>
                      <span className="text-xs font-mono text-slate-500">{oneDonor.id.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center">
                    <span className="text-xs font-bold text-rose-800 block">Verified Blood Group</span>
                    <span className="text-4xl font-black text-rose-950 font-mono mt-1 block">
                      {oneDonor.bloodGroup}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <p><strong>Phone:</strong> {oneDonor.phone}</p>
                    <p><strong>Email:</strong> {oneDonor.email}</p>
                    <p><strong>Location:</strong> {oneDonor.address}</p>
                  </div>
                </div>

                {/* Middle Col: Clinical History & Standings */}
                <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
                  <h4 className="font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
                    Clinical & Registry Data
                  </h4>

                  <div className="space-y-2 text-slate-700">
                    <div className="flex items-center justify-between">
                      <span>Total Donations:</span>
                      <strong className="text-slate-900 font-mono text-sm">{oneDonor.totalDonations}</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Organ Donor Pledge:</span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          oneDonor.isOrganDonor
                            ? 'bg-purple-100 text-purple-900 border border-purple-300'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {oneDonor.isOrganDonor ? '✓ PLEDGED (NOTTO)' : 'No Pledge'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Last Whole Blood Donation:</span>
                      <span className="text-slate-800 font-medium">{oneDonor.lastDonationDate}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Eligibility Status:</span>
                      <span className="text-emerald-700 font-bold uppercase">{oneDonor.eligibilityStatus}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Current Availability:</span>
                      <span className="text-slate-900 font-bold uppercase">{oneDonor.status}</span>
                    </div>
                  </div>
                </div>

                {/* Right Col: Actions & Quick Switch */}
                <div className="space-y-3 flex flex-col justify-between">
                  <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-rose-300">
                      Quick Donor Action
                    </h4>
                    <p className="text-xs text-slate-300">
                      You can inspect this donor&apos;s complete medical dossier or switch active session to test emergency matching as this donor.
                    </p>

                    <button
                      onClick={() => setSelectedDonorForModal(oneDonor)}
                      className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Full Dossier</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setActiveDonorId(oneDonor.id);
                      setPortalSubTab('my_profile');
                    }}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 border border-slate-300"
                  >
                    <User className="w-4 h-4 text-rose-600" />
                    <span>Switch Active View to {oneDonor.fullName.split(' ')[0]}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* All Donors Mini Cards Grid */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
              All Registered Community Donors ({donors.length})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {donors.map((d, index) => (
                <div
                  key={d.id}
                  onClick={() => setSelectedDonorForModal(d)}
                  className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-rose-300 hover:shadow-md transition cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-black font-mono flex items-center justify-center text-sm">
                      {d.bloodGroup}
                    </div>
                    <div>
                      <h5 className="font-extrabold text-slate-900">{d.fullName}</h5>
                      <p className="text-[11px] text-slate-500">{d.address.split(',')[0]}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDonorForModal(d);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Donor Dossier Detail Modal ────────────────────────────────────── */}
      {selectedDonorForModal && (
        <DonorDetailModal
          donor={selectedDonorForModal}
          onClose={() => setSelectedDonorForModal(null)}
        />
      )}

      {showRegisterModal && <DonorRegistrationModal onClose={() => setShowRegisterModal(false)} />}
    </div>
  );
};
