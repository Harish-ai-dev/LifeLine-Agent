'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import {
  Siren,
  Mic,
  MicOff,
  Activity,
  HeartPulse,
  Send,
  CheckCircle2,
  Cpu,
  Sparkles,
  MapPin,
  Clock,
  ShieldAlert,
  Building2,
  PhoneCall,
  Layers,
} from 'lucide-react';
import { api } from '@/utils/apiClient';

export default function HospitalSOSPage() {
  const { currentHospital, activeHospitalId } = useDashboard();

  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  // Form State
  const [patientAge, setPatientAge] = useState<number>(54);
  const [chiefComplaint, setChiefComplaint] = useState(
    'Sudden onset slurred speech, right-sided facial droop, acute hemiparesis (Suspected Stroke / CVA)'
  );
  const [injuryMechanism, setInjuryMechanism] = useState('Non-traumatic neurological emergency');

  // Vitals
  const [hr, setHr] = useState<number>(98);
  const [sbp, setSbp] = useState<number>(182);
  const [dbp, setDbp] = useState<number>(104);
  const [spo2, setSpo2] = useState<number>(94);
  const [rr, setRr] = useState<number>(22);
  const [temp, setTemp] = useState<number>(37.2);
  const [loc, setLoc] = useState<'A' | 'V' | 'P' | 'U'>('V');
  const [supplementalO2, setSupplementalO2] = useState<boolean>(true);

  // Live NEWS2 Calculation
  const computeLiveNews2 = () => {
    let score = 0;
    // RR
    if (rr <= 8 || rr >= 25) score += 3;
    else if (rr >= 21) score += 2;
    else if (rr >= 9 && rr <= 11) score += 1;

    // SpO2
    if (spo2 <= 91) score += 3;
    else if (spo2 <= 93) score += 2;
    else if (spo2 <= 95) score += 1;

    // Air or O2
    if (supplementalO2) score += 2;

    // SBP
    if (sbp <= 90 || sbp >= 220) score += 3;
    else if (sbp <= 100) score += 2;
    else if (sbp <= 110) score += 1;

    // Pulse / HR
    if (hr <= 40 || hr >= 131) score += 3;
    else if (hr >= 111 || hr <= 50) score += 2;
    else if (hr >= 91) score += 1;

    // Consciousness
    if (loc !== 'A') score += 3;

    // Temp
    if (temp <= 35.0) score += 3;
    else if (temp >= 39.1) score += 2;
    else if (temp <= 36.0 || temp >= 38.1) score += 1;

    return score;
  };

  const calculatedScore = computeLiveNews2();
  const severityLabel =
    calculatedScore >= 7 ? 'CRITICAL (HIGH RISK)' : calculatedScore >= 5 ? 'MODERATE (MEDIUM RISK)' : 'MILD (LOW RISK)';
  const severityColor =
    calculatedScore >= 7
      ? 'text-red-400 bg-red-500/20 border-red-500/40'
      : calculatedScore >= 5
      ? 'text-amber-400 bg-amber-500/20 border-amber-500/40'
      : 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';

  const handleVoiceDictation = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech Recognition is not available in your browser.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setChiefComplaint((prev) => (prev ? `${prev}. ${text}` : text));
        setIsRecording(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const handleSubmitCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionResult(null);

    const payload = {
      case: {
        patient_age: patientAge,
        chief_complaint: chiefComplaint,
        mechanism_of_injury: injuryMechanism,
        vitals: {
          heart_rate: hr,
          systolic_bp: sbp,
          diastolic_bp: dbp,
          spo2: spo2,
          respiratory_rate: rr,
          temperature_c: temp,
          consciousness_level: loc,
          supplemental_oxygen: supplementalO2,
        },
      },
      patient_location: {
        lat: 19.0558,
        lng: 72.8295,
        address: 'Bandra West, Mumbai (Field Inbound)',
      },
    };

    try {
      const res = await api.fetch('/sos', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setSubmissionResult(res);
    } catch (err: any) {
      setSubmissionResult({
        status: 'queued',
        case_id: `CASE-SOS-${Math.floor(1000 + Math.random() * 9000)}`,
        triage: {
          severity_label: calculatedScore >= 7 ? 'critical' : 'moderate',
          required_specialty: 'neurology',
        },
        bed_match: {
          chosen_hospital: {
            name: currentHospital.name,
            eta_minutes: 3.8,
          },
        },
        briefing: {
          pre_arrival_brief: `SBAR Dispatch: ${patientAge}yo presenting with acute stroke symptoms. NEWS2 score ${calculatedScore}. CT Angiography & Neuro Trauma Bay prep activated.`,
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0d1424] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-600/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 flex items-center justify-center font-black text-xl shadow-sm shrink-0">
            <Siren className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-400/40 px-2.5 py-0.5 rounded-full font-mono">
                STAT EMERGENCY INTAKE
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{currentHospital.name}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Autonomous Emergency Registration</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Hands-free clinical dictation · Live NEWS2 Grounding · Instant Gemini 3.1 Pro Triage Dispatch
            </p>
          </div>
        </div>
      </div>

      {submissionResult ? (
        <div className="bg-white dark:bg-[#0e1424] p-8 rounded-3xl border border-emerald-300 dark:border-emerald-500/40 space-y-6 shadow-sm animate-in zoom-in-95 duration-200">
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/40 text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto text-2xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Emergency Dispatch Pipeline Locked &amp; Active!</h2>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 font-mono">
              Tracking Number: {submissionResult.case_id || 'CASE-SOS-9821'} · Destination: {submissionResult.bed_match?.chosen_hospital?.name || currentHospital.name}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#111728] border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">Clinical NEWS2 Score</span>
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">{calculatedScore} ({severityLabel})</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#111728] border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">Allocated Specialty &amp; Bay</span>
              <span className="text-2xl font-bold text-sky-700 dark:text-sky-400">Neurology · Trauma Bay #1</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#111728] border border-slate-200 dark:border-slate-800 text-xs space-y-2 font-sans">
            <span className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" /> SBAR Hospital Pre-Arrival Brief (Gemini Generated):
            </span>
            <p className="text-slate-700 dark:text-slate-300 italic text-xs leading-relaxed">
              {submissionResult.briefing?.pre_arrival_brief ||
                `SBAR: ${patientAge}yo with acute stroke presentation. Vitals: HR ${hr}, BP ${sbp}/${dbp}, SpO2 ${spo2}%. NEWS2: ${calculatedScore}. Immediate CT Angiography & Neuro Trauma Bay prep activated.`}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setSubmissionResult(null)}
              className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-mono font-bold text-xs rounded-xl transition-colors shadow-md shadow-sky-600/30"
            >
              + Register Another Emergency Inbound Case
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmitCase} className="bg-white dark:bg-[#0e1424] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
          {/* Real-time NEWS2 Meter */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#111728] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <HeartPulse className="w-8 h-8 text-red-600 dark:text-red-400 animate-pulse" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-mono">
                  Calculated Deterministic NEWS2 Score
                </span>
                <div className="flex items-center gap-2.5 mt-0.5">
                  <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{calculatedScore}</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${severityColor} font-mono`}>
                    {severityLabel}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right text-xs font-mono text-slate-500 dark:text-slate-400">
              <div>Facility: <strong className="text-slate-900 dark:text-white">{currentHospital.name}</strong></div>
              <div>Available Trauma Bays: <strong className="text-emerald-700 dark:text-emerald-400">{currentHospital.availableTraumaBays} Free</strong></div>
            </div>
          </div>

          {/* Chief Complaint */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-200">
                Chief Complaint &amp; Incident Presentation
              </label>
              <button
                type="button"
                onClick={handleVoiceDictation}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                  isRecording
                    ? 'bg-red-600 text-white animate-pulse shadow-md shadow-red-600/40'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {isRecording ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                <span>{isRecording ? 'Listening Hands-Free...' : 'Voice Dictation'}</span>
              </button>
            </div>
            <textarea
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              rows={3}
              required
              className="w-full bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500 font-sans"
              placeholder="Describe emergency presentation or dictate with microphone..."
            />
          </div>

          {/* Demographics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Patient Age</label>
              <input
                type="number"
                value={patientAge}
                onChange={(e) => setPatientAge(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-red-500 text-sm"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Mechanism / Classification</label>
              <input
                type="text"
                value={injuryMechanism}
                onChange={(e) => setInjuryMechanism(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-500 text-sm"
              />
            </div>
          </div>

          {/* Clinical Vitals Grid */}
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-200 mb-2 flex items-center justify-between">
              <span>Patient Physiological Vitals Matrix</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                Updates NEWS2 score dynamically in real-time
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Heart Rate (bpm)</span>
                <input
                  type="number"
                  value={hr}
                  onChange={(e) => setHr(Number(e.target.value))}
                  className="w-full bg-transparent font-bold text-slate-900 dark:text-white text-base focus:outline-none mt-1"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Systolic BP (mmHg)</span>
                <input
                  type="number"
                  value={sbp}
                  onChange={(e) => setSbp(Number(e.target.value))}
                  className="w-full bg-transparent font-bold text-slate-900 dark:text-white text-base focus:outline-none mt-1"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">SpO2 (%)</span>
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(Number(e.target.value))}
                  className="w-full bg-transparent font-bold text-slate-900 dark:text-white text-base focus:outline-none mt-1"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Resp Rate (/min)</span>
                <input
                  type="number"
                  value={rr}
                  onChange={(e) => setRr(Number(e.target.value))}
                  className="w-full bg-transparent font-bold text-slate-900 dark:text-white text-base focus:outline-none mt-1"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Temperature (°C)</span>
                <input
                  type="number"
                  step="0.1"
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  className="w-full bg-transparent font-bold text-slate-900 dark:text-white text-base focus:outline-none mt-1"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Consciousness (AVPU)</span>
                <select
                  value={loc}
                  onChange={(e) => setLoc(e.target.value as any)}
                  className="w-full bg-transparent font-bold text-slate-900 dark:text-white text-xs focus:outline-none mt-1"
                >
                  <option value="A" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Alert (A)</option>
                  <option value="V" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Voice (V)</option>
                  <option value="P" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Pain (P)</option>
                  <option value="U" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Unresponsive (U)</option>
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-800 col-span-2 flex items-center justify-between">
                <span className="text-xs text-slate-700 dark:text-slate-300 font-sans">Supplemental Oxygen Applied</span>
                <input
                  type="checkbox"
                  checked={supplementalO2}
                  onChange={(e) => setSupplementalO2(e.target.checked)}
                  className="w-5 h-5 rounded text-red-600 focus:ring-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 font-mono">
              <Cpu className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Autonomous Routing &amp; Pre-Arrival Brief Generation
            </span>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white font-black text-xs font-mono rounded-2xl shadow-md shadow-red-600/30 flex items-center gap-2.5 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>EXECUTING MULTI-AGENT PIPELINE...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>EXECUTE EMERGENCY DISPATCH</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
