"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Ambulance,
  ArrowRight,
  BellRing,
  Building2,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Copy,
  FileText,
  HeartPulse,
  LogOut,
  MapPinned,
  Radio,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";

type Severity = "low" | "moderate" | "critical" | "trauma";
type DispatchStatus = "idle" | "reviewing" | "complete";

type StepKey = "call" | "acuity" | "destination" | "route" | "brief";

interface Vitals {
  heartRate: number;
  respiratoryRate: number;
  systolicBp: number;
  spo2: number;
  temperature: number;
}

interface DemoCase {
  id: string;
  shortName: string;
  title: string;
  subtitle: string;
  severity: Severity;
  acuityLabel: string;
  patient: string;
  complaint: string;
  history: string;
  location: string;
  notes: string;
  vitals: Vitals;
  recommendation: {
    acuity: string;
    destination: string;
    eta: string;
    specialty: string;
    reason: string;
  };
  brief: string;
  alternatives: Array<{ name: string; note: string }>;
}

const DEMO_USER = {
  username: "lifeline",
  password: "demo123",
};

const STORAGE_KEY = "lifeline-demo-session";

const STEP_LABELS: Array<{ key: StepKey; label: string; detail: string }> = [
  { key: "call", label: "Call received", detail: "Case opened" },
  { key: "acuity", label: "Acuity checked", detail: "Vitals reviewed" },
  { key: "destination", label: "Destination matched", detail: "Capacity considered" },
  { key: "route", label: "Route prepared", detail: "ETA estimated" },
  { key: "brief", label: "Brief ready", detail: "Handoff written" },
];

const CASES: DemoCase[] = [
  {
    id: "ankle-injury",
    shortName: "Ankle injury",
    title: "24F, ankle injury",
    subtitle: "Stable patient, mobility concern",
    severity: "low",
    acuityLabel: "Low acuity",
    patient: "24-year-old female",
    complaint: "Ankle pain after a fall during sport",
    history: "No loss of consciousness. No known cardiac or respiratory history.",
    location: "Bandra West, Mumbai",
    notes: "Able to speak in full sentences. Pain on weight bearing.",
    vitals: { heartRate: 82, respiratoryRate: 16, systolicBp: 118, spo2: 98, temperature: 37.0 },
    recommendation: {
      acuity: "Low acuity",
      destination: "City General Emergency Unit",
      eta: "9 min",
      specialty: "X-ray and minor injury care",
      reason: "Nearby emergency unit with imaging available and no critical-care bed requirement.",
    },
    brief:
      "24-year-old female with isolated ankle injury after a fall. Stable vital signs and no reported head injury. Ambulance ETA 9 minutes. Prepare minor injury bay and X-ray review.",
    alternatives: [
      { name: "Metro Trauma Centre", note: "Higher-acuity trauma capacity preserved for major injuries." },
      { name: "Harbour Clinic", note: "Limited imaging availability in this demo view." },
    ],
  },
  {
    id: "chest-pain",
    shortName: "Chest pain",
    title: "58M, chest pain",
    subtitle: "Crushing pain, sweating, cardiac history",
    severity: "critical",
    acuityLabel: "Critical",
    patient: "58-year-old male",
    complaint: "Crushing central chest pain with sweating and shortness of breath",
    history: "Hypertension. Previous cardiac evaluation noted by family.",
    location: "Lower Parel, Mumbai",
    notes: "Looks pale and anxious. Symptoms started around 35 minutes ago.",
    vitals: { heartRate: 118, respiratoryRate: 24, systolicBp: 88, spo2: 91, temperature: 38.2 },
    recommendation: {
      acuity: "Critical",
      destination: "City Heart Institute",
      eta: "12 min",
      specialty: "Cardiac cath lab",
      reason: "Closest cardiac-ready facility in this demo with immediate cath lab intake available.",
    },
    brief:
      "58-year-old male with crushing chest pain, sweating, hypotension, and low oxygen saturation. Suspected STEMI. Ambulance ETA 12 minutes. Prepare cardiac team, monitored bay, and cath lab intake.",
    alternatives: [
      { name: "General Hospital", note: "Longer cardiac intake time for this case." },
      { name: "Metro ER", note: "No cath lab availability shown in the demo board." },
    ],
  },
  {
    id: "motorcycle-collision",
    shortName: "Motorcycle collision",
    title: "33M, motorcycle collision",
    subtitle: "Confused after impact, bleeding reported",
    severity: "trauma",
    acuityLabel: "Trauma alert",
    patient: "33-year-old male",
    complaint: "Multiple injuries after motorcycle collision",
    history: "Helmet found nearby. Bystanders report brief confusion after impact.",
    location: "Eastern Express Highway, Mumbai",
    notes: "Active bleeding from leg wound. Responds slowly to questions.",
    vitals: { heartRate: 132, respiratoryRate: 28, systolicBp: 82, spo2: 89, temperature: 36.1 },
    recommendation: {
      acuity: "Trauma alert",
      destination: "Metro Trauma Centre",
      eta: "14 min",
      specialty: "Trauma surgery and CT",
      reason: "Trauma-capable destination with surgical team, CT access, and resuscitation bay availability.",
    },
    brief:
      "33-year-old male after motorcycle collision with confusion, suspected blood loss, and low blood pressure. Ambulance ETA 14 minutes. Prepare trauma bay, surgical review, blood products, and CT pathway.",
    alternatives: [
      { name: "City General Emergency Unit", note: "Closer, but not the preferred trauma destination in this scenario." },
      { name: "Northside Hospital", note: "Longer route and limited immediate trauma theatre access." },
    ],
  },
];

function severityClasses(severity: Severity) {
  const styles = {
    low: {
      badge: "bg-emerald-100 text-emerald-900 ring-emerald-200",
      bar: "bg-emerald-600",
      text: "text-emerald-800",
      soft: "bg-emerald-50 border-emerald-200",
    },
    moderate: {
      badge: "bg-amber-100 text-amber-900 ring-amber-200",
      bar: "bg-amber-600",
      text: "text-amber-800",
      soft: "bg-amber-50 border-amber-200",
    },
    critical: {
      badge: "bg-red-100 text-red-900 ring-red-200",
      bar: "bg-red-600",
      text: "text-red-800",
      soft: "bg-red-50 border-red-200",
    },
    trauma: {
      badge: "bg-orange-100 text-orange-950 ring-orange-200",
      bar: "bg-orange-600",
      text: "text-orange-800",
      soft: "bg-orange-50 border-orange-200",
    },
  } as const;

  return styles[severity];
}

function getCompletedStepCount(status: DispatchStatus, activeStep: number) {
  if (status === "complete") return STEP_LABELS.length;
  if (status === "reviewing") return activeStep;
  return 0;
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [username, setUsername] = useState(DEMO_USER.username);
  const [password, setPassword] = useState(DEMO_USER.password);
  const [loginError, setLoginError] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState(CASES[1].id);
  const [status, setStatus] = useState<DispatchStatus>("idle");
  const [activeStep, setActiveStep] = useState(0);
  const [briefCopied, setBriefCopied] = useState(false);
  const [briefSent, setBriefSent] = useState(false);

  const selectedCase = useMemo(
    () => CASES.find((item) => item.id === selectedCaseId) ?? CASES[0],
    [selectedCaseId]
  );

  const severity = severityClasses(selectedCase.severity);
  const completedSteps = getCompletedStepCount(status, activeStep);

  useEffect(() => {
    setIsLoggedIn(window.localStorage.getItem(STORAGE_KEY) === "active");
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    if (status !== "reviewing") return;

    setActiveStep(1);
    const timers = STEP_LABELS.map((_, index) =>
      window.setTimeout(() => {
        setActiveStep(index + 1);
        if (index === STEP_LABELS.length - 1) {
          setStatus("complete");
        }
      }, 480 + index * 520)
    );

    return () => timers.forEach(window.clearTimeout);
  }, [status]);

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (username.trim() === DEMO_USER.username && password === DEMO_USER.password) {
      window.localStorage.setItem(STORAGE_KEY, "active");
      setIsLoggedIn(true);
      setLoginError("");
      return;
    }

    setLoginError("Use the sample username and password shown on this page.");
  };

  const handleLogout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setIsLoggedIn(false);
    setStatus("idle");
    setActiveStep(0);
    setBriefCopied(false);
    setBriefSent(false);
  };

  const runDispatch = () => {
    setStatus("reviewing");
    setActiveStep(0);
    setBriefCopied(false);
    setBriefSent(false);
  };

  const resetCase = () => {
    setStatus("idle");
    setActiveStep(0);
    setBriefCopied(false);
    setBriefSent(false);
  };

  const selectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setStatus("idle");
    setActiveStep(0);
    setBriefCopied(false);
    setBriefSent(false);
  };

  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(selectedCase.brief);
      setBriefCopied(true);
    } catch {
      setBriefCopied(false);
    }
  };

  if (!authChecked) {
    return <main className="min-h-screen bg-[#f7f3ea]" aria-label="Loading LifeLine" />;
  }

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-[#f7f3ea] text-[#142433]">
        <div className="absolute inset-x-0 top-0 h-2 bg-[#c84a3d]" />
        <section className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-[#d8d0c0] bg-white/70 px-4 py-2 text-sm font-semibold text-[#245b73] shadow-sm">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#c84a3d]" />
              Demo access only
            </div>

            <div className="max-w-2xl space-y-5">
              <p className="font-mono text-sm uppercase tracking-[0.28em] text-[#64717c]">
                LifeLine Agent
              </p>
              <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.06em] text-[#142433] sm:text-6xl lg:text-7xl">
                Emergency handoff board for clear dispatch decisions.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-[#485866]">
                A frontend-only demo view for reviewing cases, destination recommendations,
                route timing, and hospital handoff notes without connecting to a backend.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["3", "demo cases"],
                ["5", "handoff stages"],
                ["0", "backend calls"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-[#ddd4c4] bg-white/65 p-4 shadow-sm">
                  <div className="font-mono text-3xl font-bold text-[#245b73]">{value}</div>
                  <div className="text-sm font-semibold text-[#64717c]">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#d8d0c0] bg-white p-6 shadow-[0_24px_80px_rgba(20,36,51,0.12)] sm:p-8">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-[-0.04em]">Sign in</h2>
                <p className="mt-2 text-sm leading-6 text-[#64717c]">
                  Use the sample login now. Real authentication can be added later.
                </p>
              </div>
              <div className="rounded-2xl bg-[#cfe5da] p-3 text-[#245b73]">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
              <label className="block space-y-2">
                <span className="text-sm font-bold text-[#263847]">Username</span>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-[#d8d0c0] bg-[#fbf8f0] px-4 text-base font-semibold outline-none transition focus:border-[#245b73] focus:ring-4 focus:ring-[#245b73]/15"
                  autoComplete="username"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-bold text-[#263847]">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-[#d8d0c0] bg-[#fbf8f0] px-4 text-base font-semibold outline-none transition focus:border-[#245b73] focus:ring-4 focus:ring-[#245b73]/15"
                  autoComplete="current-password"
                />
              </label>

              {loginError && (
                <div className="rounded-2xl border border-[#e7b5a9] bg-[#fff3ef] px-4 py-3 text-sm font-semibold text-[#9c332b]" role="alert">
                  {loginError}
                </div>
              )}

              <button className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#142433] px-5 text-base font-black text-white shadow-lg shadow-[#142433]/20 transition hover:bg-[#20384d] focus:outline-none focus:ring-4 focus:ring-[#245b73]/25">
                Open demo board
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-dashed border-[#d8d0c0] bg-[#fbf8f0] p-4 text-sm text-[#485866]">
              <p className="font-bold text-[#142433]">Sample credentials</p>
              <p className="mt-2 font-mono">Username: {DEMO_USER.username}</p>
              <p className="font-mono">Password: {DEMO_USER.password}</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#142433]">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="rounded-[1.75rem] border border-[#ddd4c4] bg-white/75 px-5 py-4 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#142433] text-white shadow-lg shadow-[#142433]/15">
                <Ambulance className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#64717c]">LifeLine Agent</p>
                <h1 className="text-2xl font-black tracking-[-0.04em]">Emergency handoff board</h1>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d8d0c0] bg-[#fbf8f0] px-4 py-2 text-sm font-bold text-[#485866]">
                <span className={`h-2.5 w-2.5 rounded-full ${status === "complete" ? "bg-emerald-600" : status === "reviewing" ? "bg-[#d99a32]" : "bg-[#245b73]"}`} />
                {status === "complete" ? "Brief ready" : status === "reviewing" ? "Reviewing case" : "Ready"}
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#d8d0c0] bg-white px-4 text-sm font-bold text-[#485866] transition hover:border-[#245b73] hover:text-[#142433] focus:outline-none focus:ring-4 focus:ring-[#245b73]/15"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-6 py-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
          <div className="overflow-hidden rounded-[2rem] border border-[#ddd4c4] bg-[#142433] text-white shadow-[0_24px_80px_rgba(20,36,51,0.16)]">
            <div className="relative p-6 sm:p-8 lg:p-10">
              <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#cfe5da]/15 blur-3xl" />
              <div className="relative max-w-3xl space-y-6">
                <p className="font-mono text-sm uppercase tracking-[0.3em] text-[#cfe5da]">Frontend-only demo</p>
                <h2 className="text-5xl font-black leading-[0.95] tracking-[-0.065em] sm:text-6xl lg:text-7xl">
                  Keep the next handoff clear.
                </h2>
                <p className="max-w-2xl text-lg leading-8 text-slate-200">
                  Review the case, destination, route, and receiving-team brief from one calm clinical board.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={runDispatch}
                    disabled={status === "reviewing"}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-base font-black text-[#142433] transition hover:bg-[#f7f3ea] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-white/25"
                  >
                    {status === "reviewing" ? "Reviewing case" : "Run demo dispatch"}
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    onClick={resetCase}
                    className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-6 text-base font-black text-white transition hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-white/15"
                  >
                    Reset case
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-[#ddd4c4] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#64717c]">Case intake</p>
                <h3 className="mt-1 text-2xl font-black tracking-[-0.04em]">Choose a demo case</h3>
              </div>
              <FileText className="h-6 w-6 text-[#245b73]" aria-hidden="true" />
            </div>

            <div className="space-y-3" role="radiogroup" aria-label="Demo cases">
              {CASES.map((caseItem) => {
                const itemSeverity = severityClasses(caseItem.severity);
                const selected = selectedCaseId === caseItem.id;
                return (
                  <button
                    key={caseItem.id}
                    onClick={() => selectCase(caseItem.id)}
                    disabled={status === "reviewing"}
                    aria-pressed={selected}
                    className={`w-full rounded-2xl border bg-[#fbf8f0] p-4 text-left transition focus:outline-none focus:ring-4 focus:ring-[#245b73]/15 disabled:cursor-not-allowed disabled:opacity-70 ${
                      selected ? "border-[#245b73] shadow-sm" : "border-[#e3dacb] hover:border-[#b8c5c8]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-1 h-12 w-1.5 rounded-full ${itemSeverity.bar}`} />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-black tracking-[-0.02em]">{caseItem.shortName}</span>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-black ring-1 ${itemSeverity.badge}`}>
                            {caseItem.acuityLabel}
                          </span>
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-[#64717c]">{caseItem.subtitle}</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        </section>

        <section className="rounded-[2rem] border border-[#ddd4c4] bg-white p-4 shadow-sm sm:p-6" aria-live="polite" aria-busy={status === "reviewing"}>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#64717c]">Handoff progress</p>
              <h3 className="mt-1 text-2xl font-black tracking-[-0.04em]">The bay board</h3>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[#64717c]">
              Built as a local demo. It uses sample case data and does not call the backend.
            </p>
          </div>

          <div className="lifeline-ribbon" data-severity={selectedCase.severity}>
            {STEP_LABELS.map((step, index) => {
              const complete = completedSteps > index;
              const active = status === "reviewing" && completedSteps === index;
              return (
                <div key={step.key} className={`lifeline-step ${complete ? "is-complete" : ""} ${active ? "is-active" : ""}`}>
                  <div className="lifeline-marker">
                    {complete ? <Check className="h-4 w-4" aria-hidden="true" /> : <span>{index + 1}</span>}
                  </div>
                  <div>
                    <p className="font-black tracking-[-0.02em]">{step.label}</p>
                    <p className="text-sm text-[#64717c]">{step.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 py-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-[#ddd4c4] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#64717c]">Incoming case</p>
                <h3 className="mt-1 text-3xl font-black tracking-[-0.05em]">{selectedCase.title}</h3>
              </div>
              <span className={`rounded-full px-3 py-1.5 text-xs font-black ring-1 ${severity.badge}`}>
                {selectedCase.acuityLabel}
              </span>
            </div>

            <div className="space-y-4">
              {[
                ["Patient", selectedCase.patient],
                ["Main complaint", selectedCase.complaint],
                ["Relevant history", selectedCase.history],
                ["Approximate location", selectedCase.location],
                ["Crew notes", selectedCase.notes],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-[#eee7da] bg-[#fbf8f0] p-4">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#64717c]">{label}</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-[#263847]">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <Vital label="HR" value={`${selectedCase.vitals.heartRate}`} unit="bpm" />
              <Vital label="RR" value={`${selectedCase.vitals.respiratoryRate}`} unit="/min" />
              <Vital label="SBP" value={`${selectedCase.vitals.systolicBp}`} unit="mmHg" />
              <Vital label="SpO₂" value={`${selectedCase.vitals.spo2}`} unit="%" />
              <Vital label="Temp" value={selectedCase.vitals.temperature.toFixed(1)} unit="°C" />
            </div>
          </div>

          <div className="space-y-6">
            <div className={`rounded-[2rem] border p-5 shadow-sm sm:p-6 ${status === "complete" ? severity.soft : "border-[#ddd4c4] bg-white"}`}>
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#64717c]">Recommended response</p>
                  <h3 className="mt-1 text-3xl font-black tracking-[-0.05em]">
                    {status === "complete" ? selectedCase.recommendation.destination : "Awaiting dispatch run"}
                  </h3>
                </div>
                <div className="rounded-2xl bg-white/75 p-3 text-[#245b73] ring-1 ring-black/5">
                  <Building2 className="h-6 w-6" aria-hidden="true" />
                </div>
              </div>

              {status === "complete" ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  <SummaryMetric icon={<HeartPulse className="h-5 w-5" />} label="Acuity" value={selectedCase.recommendation.acuity} />
                  <SummaryMetric icon={<Clock3 className="h-5 w-5" />} label="ETA" value={selectedCase.recommendation.eta} />
                  <SummaryMetric icon={<Stethoscope className="h-5 w-5" />} label="Specialty" value={selectedCase.recommendation.specialty} />
                  <div className="rounded-2xl border border-black/5 bg-white/70 p-4 sm:col-span-3">
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#64717c]">Reason</p>
                    <p className="mt-2 text-base font-semibold leading-7 text-[#263847]">{selectedCase.recommendation.reason}</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#d8d0c0] bg-[#fbf8f0] p-5 text-sm leading-7 text-[#64717c]">
                  Select a case and run the demo dispatch to build a destination recommendation, route estimate, and hospital brief.
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <MiniStatus icon={<Radio className="h-5 w-5" />} label="Crew channel" value="Medic 4" />
              <MiniStatus icon={<MapPinned className="h-5 w-5" />} label="Route window" value={status === "complete" ? selectedCase.recommendation.eta : "—"} />
              <MiniStatus icon={<BellRing className="h-5 w-5" />} label="Hospital status" value={briefSent ? "Brief sent" : status === "complete" ? "Ready" : "Waiting"} />
            </div>
          </div>
        </section>

        {status === "complete" && (
          <section className="grid gap-6 pb-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-[#ddd4c4] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#64717c]">Hospital brief</p>
                  <h3 className="mt-1 text-3xl font-black tracking-[-0.05em]">Receiving-team note</h3>
                </div>
                <ClipboardCheck className="h-7 w-7 text-[#245b73]" aria-hidden="true" />
              </div>

              <div className="rounded-[1.5rem] border border-[#e3dacb] bg-[#fbf8f0] p-5 text-lg font-semibold leading-8 text-[#263847]">
                {selectedCase.brief}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={copyBrief}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#d8d0c0] bg-white px-5 text-sm font-black text-[#263847] transition hover:border-[#245b73] focus:outline-none focus:ring-4 focus:ring-[#245b73]/15"
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  {briefCopied ? "Brief copied" : "Copy brief"}
                </button>
                <button
                  onClick={() => setBriefSent(true)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#245b73] px-5 text-sm font-black text-white transition hover:bg-[#1d4d62] focus:outline-none focus:ring-4 focus:ring-[#245b73]/20"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  {briefSent ? "Marked as sent" : "Mark brief sent"}
                </button>
              </div>
            </div>

            <aside className="rounded-[2rem] border border-[#ddd4c4] bg-white p-5 shadow-sm sm:p-6">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#64717c]">Alternatives considered</p>
              <div className="mt-4 space-y-3">
                {selectedCase.alternatives.map((alternative) => (
                  <div key={alternative.name} className="rounded-2xl border border-[#eee7da] bg-[#fbf8f0] p-4">
                    <p className="font-black tracking-[-0.02em] text-[#142433]">{alternative.name}</p>
                    <p className="mt-1 text-sm leading-6 text-[#64717c]">{alternative.note}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-[#e6d4a4] bg-[#fff8e7] p-4 text-sm leading-6 text-[#6f4a11]">
                <p className="font-black text-[#543806]">Safety note</p>
                <p className="mt-1">
                  Decision support only. Confirm destination and care decisions through local emergency protocols.
                </p>
              </div>
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}

function Vital({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-2xl border border-[#eee7da] bg-white p-3">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#64717c]">{label}</p>
      <p className="mt-1 font-mono text-xl font-black text-[#142433]">
        {value} <span className="text-xs font-bold text-[#64717c]">{unit}</span>
      </p>
    </div>
  );
}

function SummaryMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/70 p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#cfe5da] text-[#245b73]">
        {icon}
      </div>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#64717c]">{label}</p>
      <p className="mt-1 text-lg font-black tracking-[-0.03em] text-[#142433]">{value}</p>
    </div>
  );
}

function MiniStatus({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[#ddd4c4] bg-white p-4 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#cfe5da] text-[#245b73]">
        {icon}
      </div>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#64717c]">{label}</p>
      <p className="mt-1 text-lg font-black tracking-[-0.03em] text-[#142433]">{value}</p>
    </div>
  );
}
