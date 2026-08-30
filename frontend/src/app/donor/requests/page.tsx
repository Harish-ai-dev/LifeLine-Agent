'use client';

import React, { useState } from 'react';
import { useDashboard } from '../../../context/DashboardContext';
import {
  Droplets,
  Building2,
  Navigation,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Phone,
  User,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { soundEffects } from '../../../utils/soundEffects';

import { DonorResponseStatus } from '../../../types/dashboard';

export default function DonorRequestsPage() {
  const { currentDonor, donorRequests, respondToDonorRequest } = useDashboard();
  const [activeRequestTab, setActiveRequestTab] = useState<'all' | 'my-active'>('all');

  // Find requests relevant to this donor's blood type OR that they are matched to
  const relevantRequests = donorRequests.filter(
    (req) =>
      req.bloodGroupNeeded === currentDonor.bloodGroup ||
      req.matchedDonors.some((m) => m.donorId === currentDonor.id)
  );

  const myMatchedRequests = donorRequests.filter((req) =>
    req.matchedDonors.some((m) => m.donorId === currentDonor.id)
  );

  const displayedRequests = activeRequestTab === 'all' ? relevantRequests : myMatchedRequests;

  const handleResponse = (requestId: string, statusType: DonorResponseStatus) => {
    soundEffects.playAcknowledgeChime();
    respondToDonorRequest(requestId, currentDonor.id, statusType);
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#0d1424] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span className="text-[10px] font-black tracking-wider uppercase font-mono text-red-600 dark:text-red-400">
              Emergency Dispatch Radar
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            STAT Blood &amp; Organ Callouts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Active medical dispatcher requests matched to your profile
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] font-bold">
          <button
            onClick={() => setActiveRequestTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeRequestTab === 'all'
                ? 'bg-white dark:bg-sky-600/30 text-sky-800 dark:text-sky-300 shadow-sm border border-slate-200/50 dark:border-sky-500/20'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Matching ({relevantRequests.length})
          </button>
          <button
            onClick={() => setActiveRequestTab('my-active')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeRequestTab === 'my-active'
                ? 'bg-white dark:bg-rose-600/30 text-rose-800 dark:text-rose-300 shadow-sm border border-slate-200/50 dark:border-rose-500/20'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            My Active ({myMatchedRequests.length})
          </button>
        </div>
      </div>

      {displayedRequests.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#0d1424] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 mx-auto">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">All Channels Clear</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono max-w-sm mx-auto">
            No active STAT blood requests for your type in this district at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {displayedRequests.map((req) => {
            const matchedEntry = req.matchedDonors.find((m) => m.donorId === currentDonor.id);
            const currentStatus = matchedEntry?.responseStatus || 'pending';

            return (
              <div
                key={req.id}
                className={`bg-white dark:bg-[#0d1424] rounded-3xl border-2 shadow-sm overflow-hidden transition-all ${
                  currentStatus === 'accepted' || currentStatus === 'en_route' || currentStatus === 'arrived'
                    ? 'border-rose-500'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Request Header Banner */}
                <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center shrink-0">
                      <Droplets className="w-5 h-5 fill-rose-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded">
                          {req.bloodGroupNeeded} CRITICAL
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {req.requestTrackingNumber}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white mt-0.5">
                        {req.hospitalName}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-right">
                      <span className="text-slate-400 block text-[9px]">DISTANCE</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {matchedEntry?.distanceKm || '2.4'} km
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[9px]">ESTIMATED ETA</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        {matchedEntry?.etaMinutes || '8'} mins
                      </span>
                    </div>
                  </div>
                </div>

                {/* Request Body */}
                <div className="p-6 space-y-6">
                  {/* Clinical Details */}
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
                    <div className="space-y-3">
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        Patient Indication / Dispatch Brief
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Recipient: {req.patientName || 'Emergency Resuscitation Case'}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                          {req.clinicalIndication}
                        </p>
                      </div>
                    </div>

                    {/* Routing Radar / Navigation Preview */}
                    <div className="space-y-3">
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        Donation Station &amp; Location
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {req.donationLocation.department}
                            </span>
                            <p className="text-slate-500 mt-0.5">{req.donationLocation.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 pt-1 font-mono text-[10px] text-slate-500 border-t border-slate-200/50 dark:border-slate-800">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {req.donationLocation.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Dispatch Tracker */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    {/* Status Tracker */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                        Current Status:
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                          currentStatus === 'pending'
                            ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 border-amber-200'
                            : currentStatus === 'accepted'
                            ? 'bg-sky-50 dark:bg-sky-950/20 text-sky-700 border-sky-200 animate-pulse'
                            : currentStatus === 'en_route'
                            ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 border-rose-200 animate-pulse'
                            : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {currentStatus === 'pending' ? 'MATCHED — RESPONSE REQUESTED' : currentStatus.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Action Buttons Container */}
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                      {currentStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleResponse(req.id, 'declined')}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono font-bold text-[11px] rounded-xl border border-slate-200 dark:border-slate-700"
                          >
                            DECLINE
                          </button>
                          <button
                            onClick={() => handleResponse(req.id, 'accepted')}
                            className="flex-1 md:flex-none px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-[11px] rounded-xl shadow-md shadow-rose-600/30 flex items-center justify-center gap-2"
                          >
                            <span>ACCEPT MISSION</span>
                            <Navigation className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      {currentStatus === 'accepted' && (
                        <button
                          onClick={() => handleResponse(req.id, 'en_route')}
                          className="w-full md:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-[11px] rounded-xl shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 animate-pulse"
                        >
                          <span>I AM EN ROUTE (START NAV)</span>
                          <Navigation className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {currentStatus === 'en_route' && (
                        <button
                          onClick={() => handleResponse(req.id, 'arrived')}
                          className="w-full md:w-auto px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-mono font-bold text-[11px] rounded-xl shadow-md shadow-sky-600/30 flex items-center justify-center gap-2"
                        >
                          <span>I HAVE ARRIVED AT STATION</span>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {currentStatus === 'arrived' && (
                        <button
                          onClick={() => handleResponse(req.id, 'completed')}
                          className="w-full md:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-[11px] rounded-xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2"
                        >
                          <span>DONATION INTAKE COMPLETE</span>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {currentStatus === 'completed' && (
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>MISSION CONCLUDED — THANK YOU</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
