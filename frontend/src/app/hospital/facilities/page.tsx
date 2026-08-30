'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import {
  Building2,
  BedDouble,
  Activity,
  MapPin,
  Phone,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Search,
  Radio,
  Clock,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function FacilitiesDirectoryPage() {
  const { hospitals, alerts, setActiveHospitalId } = useDashboard();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHospitals = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.tier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full px-2 sm:px-4 lg:px-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full font-mono">
                REGIONAL TRAUMA NETWORK
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-0.5">
                Accredited Hospital Facilities ({hospitals.length})
              </h1>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-2">
            Inspect individual hospital entities, live ICU/trauma bay capacities, active patient queues, and diversion statuses across Mumbai Metro.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search facility name, tier, district..."
            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-900 focus:outline-none focus:border-sky-500 w-72"
          />
        </div>
      </div>

      {/* Hospital Facilities Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
        {filteredHospitals.map((hospital) => {
          const hospitalAlerts = alerts.filter(
            (a) => a.assignedHospitalId === hospital.id && a.status !== 'resolved'
          );
          const isDiverting = hospital.isDiverting;

          return (
            <div
              key={hospital.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {hospital.code} · {hospital.district}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isDiverting
                        ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isDiverting ? 'DIVERSION ACTIVE' : 'OPEN FOR INTAKE'}
                  </span>
                </div>

                <div>
                  <Link
                    href={`/hospital/facility/${hospital.id}`}
                    onClick={() => setActiveHospitalId(hospital.id)}
                    className="hover:text-sky-600 transition-colors group block"
                  >
                    <h3
                      className="text-lg font-black text-slate-900 group-hover:text-sky-600 leading-snug whitespace-normal break-words flex items-start justify-between gap-2"
                      title={hospital.name}
                    >
                      <span>{hospital.name}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-sky-600 shrink-0 mt-1" />
                    </h3>
                  </Link>
                  <span className="text-xs font-mono font-bold text-sky-700">{hospital.tier}</span>
                  <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="whitespace-normal break-words" title={hospital.address}>{hospital.address}</span>
                  </p>
                </div>

                {/* Capacity Stat Boxes */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase">ICU Beds Free</span>
                    <span className="text-base font-black text-emerald-700">
                      {hospital.availableIcuBeds} / {hospital.totalIcuBeds}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase">Trauma Bays Free</span>
                    <span className="text-base font-black text-sky-700">
                      {hospital.availableTraumaBays} / {hospital.totalTraumaBays}
                    </span>
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-600 flex items-center justify-between pt-1">
                  <span>Active Inbound Patients:</span>
                  <strong className="text-slate-900 font-bold">{hospitalAlerts.length} Cases</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100">
                <Link
                  href={`/hospital/facility/${hospital.id}`}
                  onClick={() => setActiveHospitalId(hospital.id)}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-sky-600 text-white rounded-xl text-xs font-mono font-bold text-center transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Enter Facility Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
