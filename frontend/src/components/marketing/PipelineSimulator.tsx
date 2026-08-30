'use client';

import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Activity, 
  Cpu, 
  Building2, 
  Navigation, 
  FileText, 
  ShieldCheck,
  ChevronRight,
  Code2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { 
  CLINICAL_SCENARIOS, 
  PIPELINE_STEPS, 
  ClinicalScenario 
} from '@/data/marketing/pipeline';

export const PipelineSimulator: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<ClinicalScenario>(CLINICAL_SCENARIOS[0]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showJsonInspector, setShowJsonInspector] = useState<boolean>(false);

  // Auto-run simulation sequence across the 6 steps
  const runSimulation = () => {
    setIsRunning(true);
    setActiveStepIndex(0);

    const stepInterval = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev < PIPELINE_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          setIsRunning(false);
          return prev;
        }
      });
    }, 1800);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setActiveStepIndex(0);
  };

  return (
    <section id="how-it-works" className="py-24 bg-[#F8FAFC] dark:bg-[#060a12] relative border-t border-slate-200 dark:border-slate-800 scroll-mt-20 transition-colors">
      <div id="pipeline" />
      <div id="simulator" />
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-cyan-500/5 blur-[140px] pointer-events-none" />

      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-mono uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>How It Works • Visual Pipeline Walkthrough</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            From emergency intake to hospital briefing in seconds.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 font-sans">
            Step through the autonomous 6-stage dispatch pipeline below. Each step triggers a dedicated agent that transforms raw emergency data into clinical severity scores, geospatial routes, hospital locks, and surgical handoffs.
          </p>
        </div>

        {/* Scenario Selector Pills */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full">
          {CLINICAL_SCENARIOS.map((sc) => {
            const isSelected = selectedScenario.id === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  setSelectedScenario(sc);
                  setActiveStepIndex(0);
                }}
                className={`p-4 rounded-2xl text-left transition-all border font-mono ${
                  isSelected
                    ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 text-cyan-900 dark:text-cyan-200 shadow-sm'
                    : 'bg-white dark:bg-[#0c1322] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider ${sc.badgeColor}`}>
                    {sc.acuity}
                  </span>
                  <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold">NEWS2: {sc.news2Score}</span>
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white truncate">{sc.name}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{sc.category}</div>
              </button>
            );
          })}
        </div>

        {/* Simulator Control HUD */}
        <div className="mt-8 w-full p-5 rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 shadow-md shadow-slate-100 dark:shadow-none flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-500/20 border border-cyan-200 dark:border-cyan-500/40 flex items-center justify-center text-cyan-700 dark:text-cyan-300 font-mono font-bold">
              #{activeStepIndex + 1}
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-450 dark:text-slate-400">Current Pipeline Stage</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white font-mono flex items-center space-x-2">
                <span>{PIPELINE_STEPS[activeStepIndex].title}</span>
                <span className="text-cyan-600 dark:text-cyan-400 text-xs">({PIPELINE_STEPS[activeStepIndex].durationMs})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <button
              onClick={runSimulation}
              disabled={isRunning}
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center space-x-2 transition-all ${
                isRunning 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/10 font-black'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'PIPELINE EXECUTING...' : 'RUN SCENARIO SIMULATION'}</span>
            </button>

            <button
              onClick={resetSimulation}
              className="p-2.5 rounded-xl bg-white dark:bg-[#111728] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm"
              title="Reset Simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowJsonInspector(!showJsonInspector)}
              className={`px-3 py-2.5 rounded-xl text-xs font-mono border flex items-center space-x-1.5 shadow-sm ${
                showJsonInspector 
                  ? 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-500 text-cyan-700 dark:text-cyan-300' 
                  : 'bg-white dark:bg-[#111728] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>JSON Schema</span>
            </button>
          </div>
        </div>

        {/* Pipeline Step Sequence Horizontal Tracker */}
        <div className="mt-8 w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {PIPELINE_STEPS.map((step, idx) => {
            const isActive = activeStepIndex === idx;
            const isCompleted = activeStepIndex > idx;

            return (
              <button
                key={step.id}
                onClick={() => setActiveStepIndex(idx)}
                className={`p-3 rounded-xl border text-left transition-all font-mono ${
                  isActive
                    ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 shadow-sm text-cyan-900 dark:text-cyan-200'
                    : isCompleted
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-white dark:bg-[#0c1322] border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span>STEP {step.stepNumber}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : isActive ? (
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                  ) : null}
                </div>
                <div className="text-xs font-bold truncate">{step.title}</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{step.durationMs}</div>
              </button>
            );
          })}
        </div>

        {/* Main Stage Detail Card */}
        <div className="mt-8 w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Step Execution Detail */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 shadow-md shadow-slate-100 dark:shadow-none space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                  Responsible Agent: {PIPELINE_STEPS[activeStepIndex].agentResponsible}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                  {PIPELINE_STEPS[activeStepIndex].title}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded bg-slate-50 dark:bg-[#111728] border border-slate-200 dark:border-slate-700 text-cyan-700 dark:text-cyan-300 text-xs font-mono font-bold">
                Model: {PIPELINE_STEPS[activeStepIndex].agentModel}
              </span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              {PIPELINE_STEPS[activeStepIndex].description}
            </p>

            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                Deterministic Stage Operations:
              </h4>
              <div className="space-y-2">
                {PIPELINE_STEPS[activeStepIndex].actionItems.map((action, i) => (
                  <div key={i} className="flex items-center space-x-2.5 text-xs font-mono text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scenario specific telemetry output */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#111728] border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-700 dark:text-cyan-400 mb-2 font-bold">
                Active Scenario Telemetry • {selectedScenario.name}
              </div>
              
              {activeStepIndex === 0 && (
                <div className="text-xs font-mono text-slate-600 dark:text-slate-300 space-y-1">
                  <p><strong>Chief Complaint:</strong> {selectedScenario.patientDescription}</p>
                  <p><strong>Vitals Intake:</strong> HR {selectedScenario.vitals.hr} bpm | BP {selectedScenario.vitals.bp} | RR {selectedScenario.vitals.rr}/min | SpO2 {selectedScenario.vitals.spo2}% | Temp {selectedScenario.vitals.temp}°C | GCS {selectedScenario.vitals.gcs}</p>
                </div>
              )}

              {activeStepIndex === 1 && (
                <div className="text-xs font-mono text-slate-600 dark:text-slate-300 space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/40 text-red-700 dark:text-red-300 font-bold">NEWS2 SCORE = {selectedScenario.news2Score}</span>
                    <span className="text-rose-600 dark:text-rose-400 font-bold">ACUITY: {selectedScenario.acuity}</span>
                  </div>
                  <p><strong>Required Care Specialty:</strong> {selectedScenario.primarySpecialty}</p>
                </div>
              )}

              {activeStepIndex === 2 && (
                <div className="text-xs font-mono text-slate-600 dark:text-slate-300 space-y-1">
                  <p><strong>Matched Facility:</strong> <span className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedScenario.matchedHospital}</span></p>
                  <p><strong>Selection Rationale:</strong> Matched 100% required specialty capabilities with available bed lock and zero active diversion.</p>
                </div>
              )}

              {activeStepIndex === 3 && (
                <div className="text-xs font-mono text-slate-600 dark:text-slate-300 space-y-1">
                  <p><strong>OSRM Road Distance:</strong> {selectedScenario.distanceKm}</p>
                  <p><strong>Code-3 Emergency ETA:</strong> <span className="text-cyan-600 dark:text-cyan-400 font-bold">{selectedScenario.travelEta}</span></p>
                  <p><strong>Corridor:</strong> Direct trauma bay ramp clearance confirmed via GPS coordinate routing.</p>
                </div>
              )}

              {activeStepIndex === 4 && (
                <div className="text-xs font-mono text-slate-600 dark:text-slate-300 space-y-1.5">
                  <p className="text-amber-700 dark:text-amber-400 font-bold">Pre-Arrival SBAR Briefing Delivered:</p>
                  <p className="italic text-slate-700 dark:text-slate-300">&quot;{selectedScenario.briefingHeadline}&quot;</p>
                </div>
              )}

              {activeStepIndex === 5 && (
                <div className="text-xs font-mono text-slate-600 dark:text-slate-300 space-y-1">
                  <p><strong>Cryptographic Audit Hash:</strong> <span className="text-purple-700 dark:text-purple-400 font-bold">{selectedScenario.simulatedAuditHash}</span></p>
                  <p><strong>Municipal Telemetry:</strong> Regional bed stress index & dispatch latency logged to Government Authority daily stream.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Patient Vitals & Clinical Monitor */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 shadow-md shadow-slate-100 dark:shadow-none flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-bold">PATIENT MONITOR</span>
                <span className="flex items-center space-x-1.5 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>STREAMING</span>
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#111728] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">HEART RATE</span>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{selectedScenario.vitals.hr} <span className="text-xs font-normal text-slate-500">bpm</span></div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#111728] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">BLOOD PRESSURE</span>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{selectedScenario.vitals.bp}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#111728] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">RESP RATE</span>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{selectedScenario.vitals.rr} <span className="text-xs font-normal text-slate-500">/min</span></div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#111728] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">SpO2 LEVEL</span>
                  <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">{selectedScenario.vitals.spo2}%</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#111728] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">TEMPERATURE</span>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{selectedScenario.vitals.temp}°C</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#111728] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">GCS SCALE</span>
                  <div className="text-lg font-bold text-amber-700 dark:text-amber-400">{selectedScenario.vitals.gcs} / 15</div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-[#111728] border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                <div className="text-slate-400 dark:text-slate-500 mb-1">PRESENTATION NOTES:</div>
                <p>{selectedScenario.patientDescription}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 dark:text-slate-400">End-to-End Latency:</span>
              <span className="text-cyan-700 dark:text-cyan-400 font-bold">1.78s</span>
            </div>
          </div>

        </div>

        {/* JSON Schema Inspector Drawer */}
        {showJsonInspector && (
          <div className="mt-6 w-full p-5 rounded-2xl bg-slate-50 dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 shadow-lg font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-cyan-700 dark:text-cyan-400">
              <span className="font-bold flex items-center space-x-2">
                <Code2 className="w-4 h-4" />
                <span>LifeLine Agent Contract Schema • Step #{activeStepIndex + 1} ({PIPELINE_STEPS[activeStepIndex].agentResponsible})</span>
              </span>
              <button 
                onClick={() => setShowJsonInspector(false)}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold"
              >
                Close ✕
              </button>
            </div>
            
            <pre className="mt-3 p-4 rounded-xl bg-white dark:bg-[#111728] text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-800 overflow-x-auto text-[11px] max-h-64 leading-relaxed">
{JSON.stringify({
  stage: PIPELINE_STEPS[activeStepIndex].title,
  agent: PIPELINE_STEPS[activeStepIndex].agentResponsible,
  model: PIPELINE_STEPS[activeStepIndex].agentModel,
  scenario: selectedScenario.name,
  input: {
    patientVitals: selectedScenario.vitals,
    clinicalComplaint: selectedScenario.patientDescription
  },
  output: {
    news2Calculated: selectedScenario.news2Score,
    acuityTier: selectedScenario.acuity,
    assignedSpecialty: selectedScenario.primarySpecialty,
    destination: selectedScenario.matchedHospital,
    osrmDriveEta: selectedScenario.travelEta,
    sbarHandoff: selectedScenario.briefingHeadline
  },
  auditSignature: selectedScenario.simulatedAuditHash
}, null, 2)}
            </pre>
          </div>
        )}

      </div>
    </section>
  );
};
