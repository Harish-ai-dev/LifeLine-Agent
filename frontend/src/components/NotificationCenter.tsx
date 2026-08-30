'use client';

import React, { useState } from 'react';
import {
  Bell,
  X,
  Ambulance,
  Droplets,
  Radio,
  CheckCircle2,
  Clock,
  MapPin,
  AlertTriangle,
  Siren,
  HeartPulse,
  Send,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { soundEffects } from '@/utils/soundEffects';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBroadcastModal: () => void;
}

export function NotificationCenter({ isOpen, onClose, onOpenBroadcastModal }: NotificationCenterProps) {
  const { alerts, donorRequests, currentHospital, acknowledgeAlert, prepareBay } = useDashboard();
  const [activeTab, setActiveTab] = useState<'all' | 'ambulances' | 'donors' | 'broadcasts'>('all');

  if (!isOpen) return null;

  // Active inbound ambulances assigned to this hospital
  const inboundAmbulances = alerts.filter(
    (a) => a.assignedHospitalId === currentHospital.id && a.status !== 'resolved'
  );

  // Active matched donors across donor requests
  const activeDonorMatches = donorRequests.flatMap((req) =>
    req.matchedDonors
      .filter((m) => m.responseStatus === 'accepted' || m.responseStatus === 'en_route' || m.responseStatus === 'arrived')
      .map((m) => ({
        ...m,
        requestId: req.id,
        hospitalName: req.hospitalName,
        bloodGroupNeeded: req.bloodGroupNeeded,
        urgency: req.urgency,
      }))
  );

  // Mock staff broadcasts
  const staffBroadcasts = [
    {
      id: 'BC-101',
      type: 'CODE_BLUE',
      headline: 'STAT Code Blue — Resuscitation Bay 2',
      sender: 'Dr. Priya Mehta (Chief of Triage)',
      timestamp: '2 mins ago',
      target: 'Cardiology & Intensive Care Team Alpha',
      active: true,
    },
    {
      id: 'BC-102',
      type: 'TRAUMA_ALERT',
      headline: 'Level-1 Trauma Inbound — Polytrauma MVA',
      sender: 'EMS Dispatch Unit #4',
      timestamp: '5 mins ago',
      target: 'Emergency Trauma Surgery, Ortho, Blood Bank',
      active: true,
    },
    {
      id: 'BC-103',
      type: 'DONOR_CALLOUT',
      headline: 'Urgent O- Negative Deficit — 2 Units Remaining',
      sender: 'Lilavati Central Blood Bank',
      timestamp: '14 mins ago',
      target: 'Registered O- Donors within 10km radius',
      active: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>Emergency Notifications</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  LIVE
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {currentHospital.name} Operations Hub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onOpenBroadcastModal()}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-md shadow-red-600/20 flex items-center gap-1"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Broadcast</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex border-b border-slate-200 bg-white p-2 gap-1 text-xs font-mono">
          {[
            { id: 'all', label: 'All Feeds', count: inboundAmbulances.length + activeDonorMatches.length },
            { id: 'ambulances', label: 'Ambulances', count: inboundAmbulances.length },
            { id: 'donors', label: 'Donors', count: activeDonorMatches.length },
            { id: 'broadcasts', label: 'Staff Alerts', count: staffBroadcasts.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center transition-colors flex items-center justify-center gap-1 ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === tab.id ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notification Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {/* TAB: AMBULANCES / ALL */}
          {(activeTab === 'all' || activeTab === 'ambulances') && (
            <div className="space-y-2">
              <div className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Ambulance className="w-3.5 h-3.5 text-red-600" />
                <span>Inbound Ambulance Dispatch ({inboundAmbulances.length})</span>
              </div>

              {inboundAmbulances.length === 0 ? (
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500 font-mono">
                  No ambulances currently en route.
                </div>
              ) : (
                inboundAmbulances.map((alert) => {
                  const isCritical = alert.severity === 'critical';

                  return (
                    <div
                      key={alert.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full uppercase ${
                            isCritical ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {alert.severity} (NEWS2: {alert.news2Score})
                        </span>
                        <span className="text-xs font-mono font-bold text-sky-700 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          ETA: {alert.drivingEtaMinutes}m
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {alert.patient.age}yo {alert.patient.gender} · {alert.trackingNumber}
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                          {alert.chiefComplaint}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] font-mono">
                        <span className="text-slate-500">Bay: {alert.reservedBayId || 'BAY-EM1'}</span>
                        <div className="flex items-center gap-1.5">
                          {alert.status === 'pending_ack' && (
                            <button
                              onClick={() => {
                                soundEffects.playAcknowledgeChime();
                                acknowledgeAlert(alert.id);
                              }}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-[10px]"
                            >
                              Ack SLA
                            </button>
                          )}
                          <button
                            onClick={() => {
                              soundEffects.playAcknowledgeChime();
                              prepareBay(alert.id, alert.reservedBayId || 'BAY-EM1');
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-[10px]"
                          >
                            Ready Bay
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB: DONORS / ALL */}
          {(activeTab === 'all' || activeTab === 'donors') && (
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-rose-600" />
                <span>Donor Movements &amp; Arrivals ({activeDonorMatches.length})</span>
              </div>

              {activeDonorMatches.length === 0 ? (
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500 font-mono">
                  No donors currently in transit.
                </div>
              ) : (
                activeDonorMatches.map((donor, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{donor.donorName}</span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                        {donor.bloodGroup} Donor
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                      <span>Status: <strong className="text-emerald-600 capitalize">{donor.responseStatus.replace('_', ' ')}</strong></span>
                      <span>ETA: {donor.etaMinutes} mins ({donor.distanceKm} km)</span>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Destination: {donor.hospitalName} Blood Bank ({donor.bloodGroupNeeded} Need)
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: STAFF BROADCASTS / ALL */}
          {(activeTab === 'all' || activeTab === 'broadcasts') && (
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-purple-600" />
                <span>Emergency Staff Broadcasts ({staffBroadcasts.length})</span>
              </div>

              {staffBroadcasts.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                      {b.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{b.timestamp}</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900">{b.headline}</h4>
                  <p className="text-[11px] text-slate-600">Target: {b.target}</p>
                  <div className="text-[10px] font-mono text-slate-400">By: {b.sender}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
