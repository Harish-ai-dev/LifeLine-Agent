'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDashboard } from '@/context/DashboardContext';
import {
  Building2,
  BedDouble,
  Activity,
  MapPin,
  Phone,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Radio,
  Clock,
  Droplets,
  Package,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Minus,
  Sparkles,
} from 'lucide-react';
import { LiveAlertQueue } from '@/components/hospital/LiveAlertQueue';
import { CapacityManager } from '@/components/hospital/CapacityManager';
import { HospitalBloodBank } from '@/components/hospital/HospitalBloodBank';
import { HospitalInventoryManager } from '@/components/hospital/HospitalInventoryManager';
import { HospitalIssueTracker } from '@/components/hospital/HospitalIssueTracker';
import { AlertDetailModal } from '@/components/hospital/AlertDetailModal';
import { EmergencyBroadcastModal } from '@/components/EmergencyBroadcastModal';
import { EmergencyIncidentAlert } from '@/types/dashboard';
import { soundEffects } from '@/utils/soundEffects';
import Link from 'next/link';

export default function DedicatedFacilityPage() {
  const params = useParams();
  const router = useRouter();
  const facilityId = params?.id as string;

  const {
    hospitals,
    alerts,
    issues,
    inventory,
    toggleDiversion,
    setActiveHospitalId,
    activeHospitalId,
  } = useDashboard();

  const [activeTab, setActiveTab] = useState<'triage' | 'capacity' | 'blood' | 'inventory' | 'issues'>('triage');
  const [selectedAlert, setSelectedAlert] = useState<EmergencyIncidentAlert | null>(null);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

  const hospital = hospitals.find((h) => h.id === facilityId) || hospitals[0];

  useEffect(() => {
    if (hospital && hospital.id !== activeHospitalId) {
      setActiveHospitalId(hospital.id);
    }
  }, [hospital, activeHospitalId, setActiveHospitalId]);

  if (!hospital) {
    return (
      <div className="p-12 text-center text-slate-500 font-mono">
        Facility not found. <Link href="/hospital/facilities" className="text-sky-600 underline">Return to Directory</Link>
      </div>
    );
  }

  const hospitalAlerts = alerts.filter(
    (a) => a.assignedHospitalId === hospital.id && a.status !== 'resolved'
  );
  const isDiverting = hospital.isDiverting;

  return (
    <div className="space-y-6 w-full px-2 sm:px-4 lg:px-6 pb-16">
      {/* Back to Directory Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/hospital/facilities"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Accredited Facilities</span>
        </Link>

        <button
          onClick={() => {
            soundEffects.playEmergencySiren();
            setIsBroadcastOpen(true);
          }}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-mono font-bold shadow-md shadow-red-600/30 flex items-center gap-1.5 transition-all"
        >
          <Radio className="w-4 h-4 animate-pulse" />
          <span>STAT Staff Broadcast</span>
        </button>
      </div>

      {/* Facility Master Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
              <Building2 className="w-8 h-8" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md">
                  CODE: {hospital.code}
                </span>
                <span className="text-xs font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 rounded-md">
                  {hospital.tier}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Sector: {hospital.district}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {hospital.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1 font-mono">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {hospital.address}
                </span>
                <span className="flex items-center gap-1 text-slate-700 font-bold">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Emergency: {hospital.emergencyPhone}
                </span>
              </div>
            </div>
          </div>

          {/* Diversion & Quick Status */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center font-mono">
              <span className="text-[10px] text-slate-500 uppercase block">Active Inbound</span>
              <span className="text-xl font-black text-slate-900">{hospitalAlerts.length} Cases</span>
            </div>

            <button
              onClick={() => toggleDiversion(hospital.id)}
              className={`p-3.5 rounded-2xl border text-left font-mono transition-all ${
                isDiverting
                  ? 'bg-red-50 border-red-300 text-red-950 shadow-sm'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-sm'
              }`}
            >
              <span className="text-[10px] uppercase font-bold block flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isDiverting ? 'bg-red-600 animate-ping' : 'bg-emerald-600'}`} />
                {isDiverting ? 'DIVERSION ACTIVE' : 'OPEN FOR INTAKE'}
              </span>
              <span className="text-xs font-bold block mt-0.5">
                {isDiverting ? 'Click to Open Intake' : 'Click to Divert'}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 text-xs font-mono font-bold">
          {[
            { id: 'triage', label: 'Live Triage Queue', count: hospitalAlerts.length },
            { id: 'capacity', label: 'Bed & Bay Capacity' },
            { id: 'blood', label: 'Blood Reserves' },
            { id: 'inventory', label: 'Pharmacy & Supplies' },
            { id: 'issues', label: 'Facility Issues' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-600 text-white">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Panels */}
      {activeTab === 'triage' && (
        <LiveAlertQueue onSelectAlert={(alert) => setSelectedAlert(alert)} />
      )}

      {activeTab === 'capacity' && (
        <CapacityManager />
      )}

      {activeTab === 'blood' && (
        <HospitalBloodBank />
      )}

      {activeTab === 'inventory' && (
        <HospitalInventoryManager />
      )}

      {activeTab === 'issues' && (
        <HospitalIssueTracker />
      )}

      {/* Modals */}
      {selectedAlert && (
        <AlertDetailModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
      )}

      <EmergencyBroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
      />
    </div>
  );
}
