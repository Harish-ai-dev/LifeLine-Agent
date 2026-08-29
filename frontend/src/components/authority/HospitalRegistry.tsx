import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  BedDouble,
  Phone,
  Activity,
  Plus,
  Edit2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { HospitalFacility } from '../../types/dashboard';

export const HospitalRegistry: React.FC = () => {
  const { hospitals, toggleDiversion } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHospitals = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.tier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <span>District Hospital Infrastructure & Accreditation Registry</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage accredited emergency trauma facilities, specialty designations, and live intake channels in Region IV.
          </p>
        </div>

        <input
          type="text"
          placeholder="Filter hospitals by name, tier, or district..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none w-72"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHospitals.map((hosp) => (
          <div
            key={hosp.id}
            className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                    {hosp.tier}
                  </span>
                  <h4 className="text-base font-black text-slate-900 mt-1">{hosp.name}</h4>
                  <p className="text-xs text-slate-500 font-mono">{hosp.code} · {hosp.district}</p>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    hosp.isDiverting
                      ? 'bg-alert-100 text-alert-800 border border-alert-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {hosp.isDiverting ? 'Diversion Active' : 'Intake Ready'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <p><strong>Address:</strong> {hosp.address}</p>
                <p><strong>Emergency Direct:</strong> <span className="font-mono font-bold text-slate-800">{hosp.emergencyPhone}</span></p>
                <p><strong>Specialties:</strong> {hosp.specialties.join(', ')}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200 text-center font-mono text-xs">
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] block">ICU BEDS</span>
                  <span className="font-black text-slate-900">{hosp.availableIcuBeds}/{hosp.totalIcuBeds}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] block">TRAUMA BAYS</span>
                  <span className="font-black text-slate-900">{hosp.availableTraumaBays}/{hosp.totalTraumaBays}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] block">SLA ADHERENCE</span>
                  <span className="font-black text-emerald-700">{hosp.complianceRate}%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
              <span className="text-[11px] text-slate-500 font-medium">
                Accreditation: <strong>NABH Level 1 Verified</strong>
              </span>
              <button
                onClick={() => toggleDiversion(hosp.id)}
                className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900"
              >
                {hosp.isDiverting ? 'Lift Diversion' : 'Set Diversion'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
