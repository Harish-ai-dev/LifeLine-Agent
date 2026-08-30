import React, { useState } from 'react';
import {
  Activity,
  HeartPulse,
  Building2,
  Navigation,
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
  Radio,
  AlertTriangle,
  Play,
  RotateCcw,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export const ReactiveDispatchFeed: React.FC = () => {
  const {
    isDispatching,
    dispatchStages,
    activeDispatchExecution,
    triggerMultiAgentDispatch,
    resetDispatchProgression,
    alerts,
    currentHospital,
  } = useDashboard();

  // Manual Trigger Form
  const [patientAge, setPatientAge] = useState<number>(54);
  const [chiefComplaint, setChiefComplaint] = useState<string>('Acute crushing retrosternal chest pain radiating to left arm');
  const [heartRate, setHeartRate] = useState<number>(118);
  const [respiratoryRate, setRespiratoryRate] = useState<number>(24);
  const [systolicBp, setSystolicBp] = useState<number>(88);
  const [spo2, setSpo2] = useState<number>(91);
  const [temperatureC, setTemperatureC] = useState<number>(38.6);
  const [consciousness, setConsciousness] = useState<string>('alert');
  const [address, setAddress] = useState<string>('Hill Road, Bandra West, Mumbai 400050');

  const applyPreset = (preset: 'cardiac' | 'trauma' | 'sepsis') => {
    if (preset === 'cardiac') {
      setPatientAge(54);
      setChiefComplaint('Acute crushing chest pain, diaphoresis & dyspnea (suspected STEMI)');
      setHeartRate(122);
      setRespiratoryRate(24);
      setSystolicBp(86);
      setSpo2(91);
      setTemperatureC(37.4);
      setConsciousness('alert');
      setAddress('Bandra Reclamation, Mumbai 400050');
    } else if (preset === 'trauma') {
      setPatientAge(29);
      setChiefComplaint('High-velocity motorcycle collision, open femur fracture with arterial bleed');
      setHeartRate(138);
      setRespiratoryRate(28);
      setSystolicBp(76);
      setSpo2(88);
      setTemperatureC(35.6);
      setConsciousness('voice');
      setAddress('BKC Connector Flyover, Mumbai 400051');
    } else if (preset === 'sepsis') {
      setPatientAge(68);
      setChiefComplaint('Severe post-chemo neutropenic fever, refractory hypotension & altered mental state');
      setHeartRate(126);
      setRespiratoryRate(26);
      setSystolicBp(82);
      setSpo2(92);
      setTemperatureC(39.6);
      setConsciousness('alert');
      setAddress('Shivaji Park, Dadar West, Mumbai 400028');
    }
  };

  const handleRunDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    await triggerMultiAgentDispatch({
      patientAge,
      chiefComplaint,
      vitals: {
        heartRate,
        respiratoryRate,
        systolicBp,
        spo2,
        temperatureC,
        consciousness,
      },
      location: {
        address,
        lat: 19.055,
        lng: 72.84,
      },
    });
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16">
      {/* ── Top Header Banner ────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-600/30 text-sky-400 border border-sky-500/40 flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-sky-500/30 text-sky-300 border border-sky-400/40 px-2 py-0.5 rounded">
                  Autonomous AI Pipeline
                </span>
                <span className="text-xs font-mono text-slate-400">Gemini 3.1-pro + Gemini 3.5-flash</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                Reactive Multi-Agent Dispatch Progression Feed
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Deterministic NEWS2 Calculation → Clinical Triage Reasoning → Bed Matching → Routing & SBAR Handover
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => applyPreset('cardiac')}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition"
            >
              🫀 STEMI Preset
            </button>
            <button
              onClick={() => applyPreset('trauma')}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition"
            >
              🩸 Trauma Preset
            </button>
            <button
              onClick={() => applyPreset('sepsis')}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition"
            >
              🌡️ Sepsis Preset
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Layout: Trigger Form (Left) & 3-Stage Agent Progression (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Manual SOS Trigger Config (4 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-alert-600 animate-pulse" />
              <h3 className="text-base font-extrabold text-slate-900">
                Manual Emergency Intake
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Field Dispatch Form</span>
          </div>

          <form onSubmit={handleRunDispatch} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Chief Complaint / Presenting Condition
              </label>
              <textarea
                rows={2}
                required
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Patient Age
                </label>
                <input
                  type="number"
                  min="1"
                  max="110"
                  required
                  value={patientAge}
                  onChange={(e) => setPatientAge(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Consciousness (AVPU)
                </label>
                <select
                  value={consciousness}
                  onChange={(e) => setConsciousness(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium capitalize"
                >
                  <option value="alert">Alert (A)</option>
                  <option value="voice">Voice Response (V)</option>
                  <option value="pain">Pain Response (P)</option>
                  <option value="unresponsive">Unresponsive (U)</option>
                </select>
              </div>
            </div>

            {/* Vitals Matrix */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
              <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">
                Physiological Vitals (NEWS2 Inputs)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Heart Rate (bpm)</span>
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-alert-700"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Resp Rate (/min)</span>
                  <input
                    type="number"
                    value={respiratoryRate}
                    onChange={(e) => setRespiratoryRate(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-amber-700"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Systolic BP (mmHg)</span>
                  <input
                    type="number"
                    value={systolicBp}
                    onChange={(e) => setSystolicBp(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-sky-700"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">SpO2 (%)</span>
                  <input
                    type="number"
                    value={spo2}
                    onChange={(e) => setSpo2(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Temp (°C)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={temperatureC}
                    onChange={(e) => setTemperatureC(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-purple-700"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Incident Location Address
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isDispatching}
              className="w-full py-3 bg-gradient-to-r from-alert-600 to-alert-700 hover:from-alert-700 hover:to-alert-800 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-wider shadow-lg shadow-alert-600/30 transition flex items-center justify-center gap-2 mt-4"
            >
              {isDispatching ? (
                <span className="animate-pulse flex items-center gap-2">
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Executing 3-Stage Pipeline...</span>
                </span>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Execute Multi-Agent Dispatch</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: 3-Stage Agent Progression Visualization (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Live Agent Progression Pipeline
                </h3>
              </div>

              {activeDispatchExecution && (
                <button
                  onClick={resetDispatchProgression}
                  className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 font-bold transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset View</span>
                </button>
              )}
            </div>

            {/* Stages Sequence */}
            <div className="space-y-4">
              {/* Stage 1: Clinical Triage */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border transition ${
                  dispatchStages[0]?.status === 'completed'
                    ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-400/30'
                    : dispatchStages[0]?.status === 'processing'
                    ? 'bg-sky-50/50 border-sky-400 ring-2 ring-sky-400/30 animate-pulse'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      1
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded font-mono">
                          gemini-3.1-pro
                        </span>
                        <h4 className="font-black text-slate-900 text-sm">
                          Stage 1: Clinical Acuity Triage & NEWS2
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        {dispatchStages[0]?.headline ||
                          'Awaiting dispatch trigger to evaluate physiological vitals and risk rating...'}
                      </p>
                    </div>
                  </div>

                  {dispatchStages[0]?.status === 'completed' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />
                  )}
                </div>

                {/* Triage Output Details */}
                {dispatchStages[0]?.status === 'completed' && (
                  <div className="mt-3 pt-3 border-t border-emerald-200 text-xs text-slate-700 bg-white p-3 rounded-xl border border-emerald-100 space-y-1">
                    <p>
                      <strong>NEWS2 Score:</strong>{' '}
                      <span className="font-bold text-alert-700 font-mono">
                        {activeDispatchExecution?.news2_score.score}/20 ({activeDispatchExecution?.news2_score.risk_band.toUpperCase()} RISK)
                      </span>
                    </p>
                    <p>
                      <strong>Clinical Indication:</strong> {dispatchStages[0]?.details?.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Stage 2: Bed Matching */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border transition ${
                  dispatchStages[1]?.status === 'completed'
                    ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-400/30'
                    : dispatchStages[1]?.status === 'processing'
                    ? 'bg-sky-50/50 border-sky-400 ring-2 ring-sky-400/30 animate-pulse'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      2
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200 px-2 py-0.5 rounded font-mono">
                          gemini-3.5-flash
                        </span>
                        <h4 className="font-black text-slate-900 text-sm">
                          Stage 2: Regional Facility & Specialty Bay Matching
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        {dispatchStages[1]?.headline ||
                          'Spatial geospatial query and bed telemetry evaluation across regional centers...'}
                      </p>
                    </div>
                  </div>

                  {dispatchStages[1]?.status === 'completed' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />
                  )}
                </div>

                {/* Bed Matching Output */}
                {dispatchStages[1]?.status === 'completed' && (
                  <div className="mt-3 pt-3 border-t border-emerald-200 text-xs text-slate-700 bg-white p-3 rounded-xl border border-emerald-100 space-y-1">
                    <p>
                      <strong>Selected Hospital:</strong>{' '}
                      <span className="font-extrabold text-slate-900">
                        {dispatchStages[1]?.details?.chosen_hospital?.name}
                      </span>
                    </p>
                    <p>
                      <strong>Spatial Reason:</strong> {dispatchStages[1]?.details?.reasoning}
                    </p>
                  </div>
                )}
              </div>

              {/* Stage 3: Routing & SBAR Briefing */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border transition ${
                  dispatchStages[2]?.status === 'completed'
                    ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-400/30'
                    : dispatchStages[2]?.status === 'processing'
                    ? 'bg-sky-50/50 border-sky-400 ring-2 ring-sky-400/30 animate-pulse'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      3
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded font-mono">
                          gemini-3.5-flash
                        </span>
                        <h4 className="font-black text-slate-900 text-sm">
                          Stage 3: Ambulance Routing & SBAR Handover Protocol
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        {dispatchStages[2]?.headline ||
                          'Generates turn-by-turn routing ETA and pre-arrival clinical SBAR radio protocol...'}
                      </p>
                    </div>
                  </div>

                  {dispatchStages[2]?.status === 'completed' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />
                  )}
                </div>

                {/* SBAR Protocol Box */}
                {dispatchStages[2]?.status === 'completed' && (
                  <div className="mt-3 pt-3 border-t border-emerald-200 text-xs bg-slate-900 text-white p-3.5 rounded-xl space-y-2 font-mono">
                    <div className="text-[10px] text-sky-400 font-bold uppercase">
                      Transmitted Pre-Arrival SBAR Radio Protocol:
                    </div>
                    <p className="leading-relaxed text-slate-200">
                      {activeDispatchExecution?.briefing_result.pre_arrival_brief}
                    </p>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
                      <span>ETA: {activeDispatchExecution?.routing_result.eta_minutes} mins</span>
                      <span>Case ID: {activeDispatchExecution?.case_id}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
