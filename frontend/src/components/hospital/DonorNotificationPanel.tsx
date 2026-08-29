import React, { useState } from 'react';
import {
  Radio,
  Navigation,
  CheckCircle2,
  Clock,
  Phone,
  Droplet,
  Car,
  Train,
  Footprints,
  UserCheck,
  Building2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { DonorRequest, MatchedDonorEntry, BloodGroup } from '../../types/dashboard';

export const DonorNotificationPanel: React.FC = () => {
  const { currentHospital, donorRequests, respondToDonorRequest } = useDashboard();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Find all matched donors for THIS hospital's requests
  const hospitalRequests = donorRequests.filter((r) => r.hospitalId === currentHospital.id);

  // Flatten active donors with request context
  const donorActivities: Array<{
    donor: MatchedDonorEntry;
    request: DonorRequest;
  }> = [];

  hospitalRequests.forEach((req) => {
    req.matchedDonors.forEach((donor) => {
      if (['accepted', 'en_route', 'arrived', 'completed'].includes(donor.responseStatus)) {
        donorActivities.push({ donor, request: req });
      }
    });
  });

  const filteredActivities = donorActivities.filter(({ donor }) => {
    if (filterStatus === 'ALL') return true;
    return donor.responseStatus === filterStatus;
  });

  const enRouteCount = donorActivities.filter((d) => d.donor.responseStatus === 'en_route').length;
  const arrivedCount = donorActivities.filter((d) => d.donor.responseStatus === 'arrived').length;
  const acceptedCount = donorActivities.filter((d) => d.donor.responseStatus === 'accepted').length;
  const completedCount = donorActivities.filter((d) => d.donor.responseStatus === 'completed').length;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
      {/* ── Top Header & Telemetry Status ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-md shadow-rose-600/20">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Inbound Donor Activity & Live Response Stream</span>
              </h3>
              <p className="text-xs text-slate-500">
                Real-time tracking of community donors responding to STAT blood requests for {currentHospital.name}.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'ALL', label: `All (${donorActivities.length})` },
            { id: 'en_route', label: `🚗 En Route (${enRouteCount})` },
            { id: 'arrived', label: `📍 Arrived (${arrivedCount})` },
            { id: 'accepted', label: `🟡 Accepted (${acceptedCount})` },
            { id: 'completed', label: `✅ Completed (${completedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`py-1.5 px-3 rounded-xl font-bold transition ${
                filterStatus === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Quick Summary Metrics Bar ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-center">
          <span className="text-[10px] uppercase font-bold text-emerald-800 block">🚗 En Route</span>
          <span className="text-2xl font-black text-emerald-950 font-mono mt-0.5 block">
            {enRouteCount}
          </span>
          <span className="text-[10px] text-emerald-700">Inbound to Blood Bank</span>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3.5 text-center">
          <span className="text-[10px] uppercase font-bold text-indigo-800 block">📍 At Reception</span>
          <span className="text-2xl font-black text-indigo-950 font-mono mt-0.5 block">
            {arrivedCount}
          </span>
          <span className="text-[10px] text-indigo-700">Ready for Intake</span>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-center">
          <span className="text-[10px] uppercase font-bold text-amber-800 block">🟡 Preparing Transit</span>
          <span className="text-2xl font-black text-amber-950 font-mono mt-0.5 block">
            {acceptedCount}
          </span>
          <span className="text-[10px] text-amber-700">Departing Shortly</span>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-center">
          <span className="text-[10px] uppercase font-bold text-rose-800 block">✅ Completed Today</span>
          <span className="text-2xl font-black text-rose-950 font-mono mt-0.5 block">
            {completedCount}
          </span>
          <span className="text-[10px] text-rose-700">Units Restocked</span>
        </div>
      </div>

      {/* ── Live Donor Activity Stream Cards ──────────────────────────────── */}
      <div className="space-y-3">
        {filteredActivities.length === 0 ? (
          <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
            No active inbound donor activity matching the selected filter.
          </div>
        ) : (
          filteredActivities.map(({ donor, request }) => {
            const isEnRoute = donor.responseStatus === 'en_route';
            const isArrived = donor.responseStatus === 'arrived';
            const isAccepted = donor.responseStatus === 'accepted';
            const isCompleted = donor.responseStatus === 'completed';

            return (
              <div
                key={`${request.id}-${donor.donorId}`}
                className={`p-4 sm:p-5 rounded-2xl border transition shadow-sm space-y-3 ${
                  isArrived
                    ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-400'
                    : isEnRoute
                    ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400'
                    : isCompleted
                    ? 'bg-slate-50 border-slate-200 opacity-90'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Top Row: Donor Name, Blood Group, Case tracking */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                      {donor.bloodGroup}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900">{donor.donorName}</h4>
                        <span className="text-rose-700 font-mono font-bold bg-rose-100 border border-rose-300 text-[10px] px-1.5 py-0.2 rounded">
                          Group: {donor.bloodGroup}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Fulfilling STAT Request: <strong className="text-slate-800 font-mono">{request.requestTrackingNumber}</strong> ({request.patientName})
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isEnRoute ? (
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-600 text-white shadow-sm flex items-center gap-1.5 animate-pulse">
                        <Navigation className="w-3.5 h-3.5 animate-spin" />
                        <span>En Route · ETA {donor.etaMinutes}m ({donor.distanceKm} km)</span>
                      </span>
                    ) : isArrived ? (
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-600 text-white shadow-sm flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Arrived at ER Blood Bank</span>
                      </span>
                    ) : isAccepted ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Accepted — Preparing Travel</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-900 text-white shadow-sm flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Donation Completed (+1 Unit Restocked)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Details & Actions Grid */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="space-y-1 text-slate-600">
                    <p>
                      <strong>Travel Mode:</strong>{' '}
                      {donor.travelMode === 'transit'
                        ? '🚆 Public Transit'
                        : donor.travelMode === 'walking'
                        ? '🚶 Walking'
                        : '🚗 Driving Vehicle'}
                      {donor.respondedAt && <span> · Response Logged: {donor.respondedAt}</span>}
                    </p>
                    <p className="text-slate-500">
                      <strong>Destination:</strong> {request.donationLocation.department}
                    </p>
                  </div>

                  {/* Hospital Nurse Action Controls */}
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${donor.contactPhone}`}
                      className="py-2 px-3.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5 text-sky-600" />
                      <span>{donor.contactPhone}</span>
                    </a>

                    {isEnRoute && (
                      <button
                        onClick={() => respondToDonorRequest(request.id, donor.donorId, 'arrived')}
                        className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Arrived</span>
                      </button>
                    )}

                    {isArrived && (
                      <button
                        onClick={() => respondToDonorRequest(request.id, donor.donorId, 'completed')}
                        className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition flex items-center gap-1.5"
                      >
                        <Droplet className="w-3.5 h-3.5 fill-white" />
                        <span>Verify & Complete (+1 Unit)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
