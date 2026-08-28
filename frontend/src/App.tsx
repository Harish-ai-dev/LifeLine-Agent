import { useState } from 'react';
import { Activity, AlertTriangle, Building2, CheckCircle2, Navigation, Send, Stethoscope, Clock, MapPin, HeartPulse } from 'lucide-react';

const SCENARIOS = [
  {
    id: "mild",
    name: "Mild - Sprained Ankle",
    payload: {
      case: { age: 24, gender: "female", complaint: "Twisted right ankle, mild swelling", history: [] },
      patient_location: { lat: 19.076, lng: 72.877 }
    }
  },
  {
    id: "critical-cardiac",
    name: "Critical - Suspected STEMI",
    payload: {
      case: { age: 58, gender: "male", complaint: "Crushing chest pain, diaphoretic", history: ["hypertension"] },
      patient_location: { lat: 19.076, lng: 72.877 }
    }
  },
  {
    id: "critical-trauma",
    name: "Critical - MVA Trauma",
    payload: {
      case: { age: 31, gender: "male", complaint: "Motorcycle collision, confused", history: [] },
      patient_location: { lat: 19.076, lng: 72.877 }
    }
  }
];

export default function App() {
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[1]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0); // 0: idle, 1: triage, 2: bed matching, 3: routing, 4: briefing, 5: complete

  const handleDispatch = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setStep(1); // Start with triage
    try {
      const res = await fetch('http://localhost:8000/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedScenario.payload),
      });
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();

      // Simulate step progression for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      setStep(2);

      await new Promise(resolve => setTimeout(resolve, 800));
      setStep(3);

      await new Promise(resolve => setTimeout(resolve, 800));
      setStep(4);

      await new Promise(resolve => setTimeout(resolve, 800));
      setStep(5);

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 p-4 md:p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex items-center justify-between space-x-4 border-b border-slate-800/50 pb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-red-600/20 p-3 rounded-lg border border-red-600/30">
              <Activity className="w-7 h-7 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
                LifeLine Agent
              </h1>
              <p className="text-slate-400 text-sm">Autonomous Emergency Dispatch System</p>
            </div>
          </div>
          <div className="text-right text-slate-400 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </header>

        {/* Dispatch Controls */}
        <section className="grid md:grid-cols-[1fr_300px] gap-6">
          {/* Scenario Selection */}
          <div className="space-y-4 bg-slate-900/50 border border-slate-800/30 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span>Emergency Scenario Selection</span>
            </h2>
            <div className="flex flex-col space-y-3">
              {SCENARIOS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedScenario(s)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 hover:bg-slate-800/20
                    ${selectedScenario.id === s.id ? 'bg-blue-600/20 border-blue-500/50 text-blue-100' : 'bg-slate-950 border-slate-800/30 text-slate-300'}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {s.id === "mild" && <HeartPulse className="w-4 h-4 text-green-400" />}
                      {s.id === "critical-cardiac" && <Activity className="w-4 h-4 text-red-400" />}
                      {s.id === "critical-trauma" && <Building2 className="w-4 h-4 text-orange-400" />}
                    </div>
                    <div>
                      <h3 className="font-medium">{s.name}</h3>
                      <p className="text-xs text-slate-400">{getScenarioDescription(s.id)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Status Panel */}
          <div className="space-y-4 bg-slate-900/50 border border-slate-800/30 rounded-xl p-6 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-2">System Status</p>
              <p className="font-medium text-slate-200">
                {loading ? 'Agents Analyzing...' : 'Ready for Dispatch'}
              </p>
            </div>
            <button
              onClick={handleDispatch}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Processing Dispatch...' : 'Initiate Emergency Response'}</span>
            </button>
          </div>
        </section>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-600/30 text-red-200 p-4 rounded-lg backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Agent Pipeline Timeline */}
            <div className="relative">
              <div className="absolute inset-0 w-0.5 bg-red-600/20"></div>
              {['triage', 'bedMatch', 'routing', 'briefing'].map((agent, index) => (
                <div key={agent} className="relative z-10">
                  <div className="absolute left-0 -translate-x-1/2 -top-2.5 w-5 h-5 rounded-full bg-red-600 border-2 border-slate-950
                    {step > index + 1 ? 'bg-red-500' : step === index + 1 ? 'animate-pulse bg-red-400' : 'bg-slate-800'}">
                  </div>
                  <div className="ml-6 space-y-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-slate-200">{getAgentName(agent)}</h3>
                      <div className="text-xs px-2 py-0.5 rounded
                        {step > index + 1 ? 'bg-green-600/20 text-green-400' :
                         step === index + 1 ? 'bg-yellow-600/20 text-yellow-400 animate-pulse' :
                         'bg-slate-700/20 text-slate-400'}"
                      >
                        {step > index + 1 ? 'Completed' : step === index + 1 ? 'Processing...' : 'Pending'}
                      </div>
                    </div>
                    <p className="text-sm text-slate-400">{getAgentDescription(agent)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Results Cards */}
            <div className="space-y-6">
              {/* Triage Output */}
              {result.triage && (
                <div className="bg-slate-900/50 border border-slate-800/30 rounded-xl p-6 backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                    <Stethoscope className="w-16 h-16 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-4 border-b border-slate-800/30 pb-2">
                    1. Triage Analysis
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Severity Level</p>
                      <p className={`text-xl font-semibold capitalize
                        ${result.triage.severity_label === 'critical' ? 'text-red-400' :
                         result.triage.severity_label === 'moderate' ? 'text-yellow-400' : 'text-green-400'}`}>
                        {result.triage.severity_label}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Required Specialty</p>
                      <p className="text-xl font-semibold capitalize text-slate-100">
                        {result.triage.required_specialty}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-slate-400">Clinical Notes</p>
                      <p className="text-slate-300 italic">{result.triage.notes}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bed Match Output */}
              {result.bedMatch && (
                <div className="bg-slate-900/50 border border-slate-800/30 rounded-xl p-6 backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                    <Building2 className="w-16 h-16 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-orange-400 mb-4 border-b border-slate-800/30 pb-2">
                    2. Hospital Match
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-slate-400">Selected Destination</p>
                        <p className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <span>{result.bedMatch.chosen_hospital?.name || '—'}</span>
                        </p>
                      </div>
                      {result.bedMatch.chosen_hospital?.eta_minutes && (
                        <div className="text-right bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800/30">
                          <p className="text-xs text-slate-400">ETA</p>
                          <p className="font-bold text-xl text-green-400">{result.bedMatch.chosen_hospital.eta_minutes} min</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Reasoning</p>
                      <p className="text-slate-300 italic">{result.bedMatch.reasoning}</p>
                    </div>
                    {result.bedMatch.alternatives && result.bedMatch.alternatives.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-slate-300 mb-2">Alternative Options Considered:</p>
                        <div className="space-y-2">
                          {result.bedMatch.alternatives.map((alt: any, index: number) => (
                            <div key={index} className="bg-slate-800/30 p-3 rounded-lg">
                              <p className="font-medium">{alt.name}</p>
                              <p className="text-xs text-slate-400 italic">{alt.reason_not_chosen}</p>
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Briefing Output */}
              {result.briefing && result.briefing.pre_arrival_brief && (
                <div className="bg-slate-900/50 border border-slate-800/30 rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-teal-400 mb-4 border-b border-slate-800/30 pb-2 flex items-center space-x-2">
                    <Navigation className="w-5 h-5 text-teal-400" />
                    <span>3. Pre-Arrival Briefing</span>
                  </h3>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {result.briefing.pre_arrival_brief}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading Placeholder */}
        {loading && !result && (
          <div className="text-center py-12">
            <div className="inline-block animate-pulse bg-red-600/20 rounded-full p-4">
              <Activity className="w-10 h-10 text-red-400" />
            </div>
            <p className="mt-4 text-slate-400">Agents are analyzing the emergency case...</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function getScenarioDescription(id: string): string {
  switch (id) {
    case "mild": return "Low acuity case - suitable for urgent care or general ward";
    case "critical-cardiac": return "High acuity cardiac emergency - requires immediate cardiac intervention";
    case "critical-trauma": return "High acuity trauma case - needs trauma center capabilities";
    default: return "Emergency medical situation requiring immediate attention";
  }
}

function getAgentName(agent: string): string {
  switch (agent) {
    case "triage": return "Triage Agent";
    case "bedMatch": return "Bed-Matching Agent";
    case "routing": return "Routing Agent";
    case "briefing": return "Briefing Agent";
    default: return agent;
  }
}

function getAgentDescription(agent: string): string {
  switch (agent) {
    case "triage": return "Analyzing vitals and symptoms to determine severity and specialty needs";
    case "bedMatch": return "Matching patient needs with available hospital resources";
    case "routing": return "Calculating optimal transport route and ETA";
    case "briefing": return "Generating pre-arrival briefing for receiving team";
    default: return "Processing";
  }
}