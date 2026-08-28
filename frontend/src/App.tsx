import { useState } from 'react';
import { Activity, AlertTriangle, Building2, CheckCircle2, Navigation, Send, Stethoscope } from 'lucide-react';

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

  const handleDispatch = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('http://localhost:8000/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedScenario.payload),
      });
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12 font-sans selection:bg-blue-500/30">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center space-x-3 border-b border-slate-800 pb-6">
          <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            <Activity className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">LifeLine Agent</h1>
            <p className="text-slate-400 text-sm">Autonomous Emergency Dispatch (React + Vite + FastAPI)</p>
          </div>
        </header>

        {/* Dispatch Controls */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4 bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span>Incoming Case Scenario</span>
            </h2>
            <div className="flex flex-col space-y-3">
              {SCENARIOS.map(s => (
                <button 
                  key={s.id}
                  onClick={() => setSelectedScenario(s)}
                  className={`text-left px-4 py-3 rounded-lg border transition-all ` + 
                    (selectedScenario.id === s.id ? 'bg-blue-500/10 border-blue-500/50 text-blue-100' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700')}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-center items-center space-y-4">
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-1">Status</p>
              <p className="font-medium text-slate-200">
                {loading ? 'Agents Analyzing...' : 'Ready for Dispatch'}
              </p>
            </div>
            <button 
              onClick={handleDispatch}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              <span>{loading ? 'Processing...' : 'Run Dispatch'}</span>
            </button>
          </div>
        </div>

        {/* Errors */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Triage Output */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <Stethoscope className="w-32 h-32" />
              </div>
              <h3 className="text-lg font-bold text-blue-400 mb-4 border-b border-slate-800 pb-2">1. Triage Analysis</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Severity Label</p>
                  <p className="text-xl font-semibold capitalize">{result.triage?.severity_label || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Required Specialty</p>
                  <p className="text-xl font-semibold capitalize">{result.triage?.required_specialty || '—'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-500">Clinical Notes</p>
                  <p className="text-slate-300">{result.triage?.notes || '—'}</p>
                </div>
              </div>
            </div>

            {/* Bed Match Output */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-5">
                <Building2 className="w-32 h-32" />
              </div>
              <h3 className="text-lg font-bold text-orange-400 mb-4 border-b border-slate-800 pb-2">2. Hospital Match</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-slate-500">Selected Destination</p>
                    <p className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                      <span>{result.bed_match?.chosen_hospital?.name || '—'}</span>
                    </p>
                  </div>
                  {result.bed_match?.chosen_hospital?.eta_minutes && (
                    <div className="text-right bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
                      <p className="text-sm text-slate-500">ETA</p>
                      <p className="font-bold text-xl text-green-400">{result.bed_match.chosen_hospital.eta_minutes} min</p>
                    </div>
                  )}
                </div>
                <div>
                   <p className="text-sm text-slate-500">Reasoning</p>
                   <p className="text-slate-300 italic">"{result.bed_match?.reasoning || '—'}"</p>
                </div>
              </div>
            </div>
            
            {/* Briefing Output */}
            {result.briefing?.pre_arrival_brief && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-teal-400 mb-4 border-b border-slate-800 pb-2 flex items-center space-x-2">
                  <Navigation className="w-5 h-5" />
                  <span>3. Pre-Arrival Briefing</span>
                </h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {result.briefing.pre_arrival_brief}
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
