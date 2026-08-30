import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  Car,
  Train,
  Footprints,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Sparkles,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { DonorRequest, MatchedDonorEntry, TravelMode } from '../../types/dashboard';
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('../maps/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400 font-mono text-xs">
      INITIALIZING MAP SATELLITE UPLINK...
    </div>
  ),
});

interface DonorNavigationMapProps {
  request: DonorRequest;
  matchedEntry: MatchedDonorEntry;
}

export const DonorNavigationMap: React.FC<DonorNavigationMapProps> = ({
  request,
  matchedEntry,
}) => {
  const { currentDonor, respondToDonorRequest, updateDonorTravelMode } = useDashboard();
  const [activeTravelMode, setActiveTravelMode] = useState<TravelMode>(
    matchedEntry.travelMode || 'driving'
  );

  const loc = request.donationLocation;
  const status = matchedEntry.responseStatus;

  // Calculate mode ETA
  const calculateEta = (mode: TravelMode) => {
    if (mode === 'driving') return Math.round(matchedEntry.distanceKm * 3.5 + 2);
    if (mode === 'transit') return Math.round(matchedEntry.distanceKm * 5.0 + 5);
    if (mode === 'walking') return Math.round(matchedEntry.distanceKm * 12.0 + 3);
    return matchedEntry.etaMinutes;
  };

  const currentEta = calculateEta(activeTravelMode);

  const handleModeChange = (mode: TravelMode) => {
    setActiveTravelMode(mode);
    updateDonorTravelMode(request.id, currentDonor.id, mode);
  };

  // Google Maps Deep Link
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentDonor.lat},${currentDonor.lng}&destination=${loc.lat},${loc.lng}&travelmode=${activeTravelMode}`;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden space-y-0">
      {/* ── Top Calm Header Card ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 text-white p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-700">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-400/40 flex items-center justify-center font-black text-xl shrink-0">
            <Navigation className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500/30 text-rose-200 border border-rose-400/40 px-2 py-0.5 rounded">
                DONOR TRANSIT NAVIGATION
              </span>
              <span className="text-xs font-mono text-slate-300">
                {request.requestTrackingNumber}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
              Route to {loc.hospitalName}
            </h2>
          </div>
        </div>

        {/* Live Distance & ETA Pill */}
        <div className="bg-rose-500/20 border border-rose-400/40 rounded-2xl px-4 py-2 text-right">
          <span className="text-[10px] uppercase font-bold text-rose-300 block">
            Estimated Travel Time
          </span>
          <span className="text-2xl font-black text-white font-mono">
            {currentEta} mins
          </span>
          <span className="text-[10px] text-slate-300 font-mono block">
            ({matchedEntry.distanceKm} km away)
          </span>
        </div>
      </div>

      {/* ── Interactive Proximity Map Canvas ─────────────────────────────── */}
      <div className="bg-slate-950 p-6 relative min-h-[380px] flex flex-col justify-between text-white overflow-hidden">
        {/* Radar grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-30 pointer-events-none" />

        {/* Top Floating Legend */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span>LIVE GPS NAVIGATION STREAM</span>
          </div>

          {/* Travel Mode Switcher */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-700 text-xs font-bold gap-1">
            <button
              onClick={() => handleModeChange('driving')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeTravelMode === 'driving'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Drive ({calculateEta('driving')}m)</span>
            </button>

            <button
              onClick={() => handleModeChange('transit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeTravelMode === 'transit'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Train className="w-3.5 h-3.5" />
              <span>Transit ({calculateEta('transit')}m)</span>
            </button>

            <button
              onClick={() => handleModeChange('walking')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeTravelMode === 'walking'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>Walk ({calculateEta('walking')}m)</span>
            </button>
          </div>
        </div>

        {/* Central Visual Route between Donor and Destination Hospital */}
        <div className="relative z-0 mt-4 flex-1 min-h-[260px] rounded-2xl overflow-hidden border border-slate-800">
          <LeafletMap 
            markers={[
              {
                id: 'donor',
                lat: currentDonor.lat,
                lng: currentDonor.lng,
                color: '#e11d48', // rose-600
                popupHtml: '<b>You (Donor)</b><br/>' + currentDonor.address,
                isPulsing: true
              },
              {
                id: 'hospital',
                lat: loc.lat,
                lng: loc.lng,
                color: '#059669', // emerald-600
                popupHtml: '<b>' + loc.hospitalName + '</b><br/>' + loc.department
              }
            ]}
            drawRoute={{
              start: { lat: currentDonor.lat, lng: currentDonor.lng },
              end: { lat: loc.lat, lng: loc.lng }
            }}
            centerLat={(currentDonor.lat + loc.lat) / 2}
            centerLng={(currentDonor.lng + loc.lng) / 2}
            zoom={13}
          />
        </div>

        {/* Bottom Fast Action: Get Directions in Google Maps */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-300">
              Navigation ready · Destination: <strong>{loc.address}</strong>
            </span>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 py-2 px-4 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-sky-600/30 transition"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open in Google / Apple Maps</span>
          </a>
        </div>
      </div>

      {/* ── Destination Details & Live Transit Progression Card ──────────── */}
      <div className="p-6 bg-slate-50 space-y-6">
        {/* Hospital Room / Department & Direct Phone Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4 text-rose-600" />
              <span>Donation Intake Location</span>
            </div>
            <p className="font-extrabold text-slate-800 text-sm">{loc.hospitalName}</p>
            <p className="text-rose-700 font-bold">{loc.department}</p>
            <p className="text-slate-600">{loc.address}</p>
            {loc.landmark && <p className="text-slate-500 font-medium">Landmark: {loc.landmark}</p>}
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider mb-1">
                <Phone className="w-4 h-4 text-sky-600" />
                <span>Hospital Front Desk & Blood Bank Direct</span>
              </div>
              <p className="text-slate-600">
                If you require assistance locating the entrance or blood bank reception:
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={`tel:${loc.phone}`}
                className="flex-1 py-2 px-3 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 rounded-xl text-center font-mono font-bold transition"
              >
                📞 Front Desk: {loc.phone}
              </a>
              <a
                href={`tel:${loc.emergencyPhone}`}
                className="flex-1 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 rounded-xl text-center font-mono font-bold transition"
              >
                🚨 ER Direct: {loc.emergencyPhone}
              </a>
            </div>
          </div>
        </div>

        {/* ── Live Transit Progression Controls ────────────────────────────── */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Live Donor Transit Status
              </h4>
              <p className="text-xs text-slate-500">
                Tap to broadcast your real-time progress to the hospital triage & blood bank team.
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                status === 'arrived'
                  ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                  : status === 'en_route'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 animate-pulse'
                  : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}
            >
              {status === 'accepted'
                ? 'Accepted — Ready to Depart'
                : status === 'en_route'
                ? '🚗 En Route to Hospital'
                : status === 'arrived'
                ? '📍 Arrived at Blood Bank'
                : 'Completed'}
            </span>
          </div>

          {/* Action Step Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {status === 'accepted' && (
              <button
                onClick={() => respondToDonorRequest(request.id, currentDonor.id, 'en_route')}
                className="flex-1 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
              >
                <Car className="w-4 h-4" />
                <span>🚗 I&apos;m on My Way (Start Travel)</span>
              </button>
            )}

            {status === 'en_route' && (
              <button
                onClick={() => respondToDonorRequest(request.id, currentDonor.id, 'arrived')}
                className="flex-1 py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>📍 I&apos;ve Arrived at Hospital</span>
              </button>
            )}

            {status === 'arrived' && (
              <div className="w-full bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-emerald-950 uppercase">
                      Welcome! You&apos;re at {loc.hospitalName}
                    </h5>
                    <p className="text-xs text-emerald-800">
                      Please show your Digital Fast-Track QR Pass at Blood Bank Reception ({loc.department}).
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => respondToDonorRequest(request.id, currentDonor.id, 'completed')}
                  className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
                >
                  Donation Finished
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
