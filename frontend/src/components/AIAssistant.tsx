'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import {
  Bot,
  Sparkles,
  Send,
  X,
  Mic,
  MicOff,
  Cpu,
  ShieldAlert,
  Activity,
  Terminal,
  ChevronDown,
  RefreshCw,
  Zap,
  GitBranch,
  Layers,
  Flame,
  BedDouble,
} from 'lucide-react';

interface AIAssistantProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AIAssistant({ isOpen: externalIsOpen, onClose: externalOnClose }: AIAssistantProps) {
  const { currentUser, alerts, hospitals, currentHospital, dailyReport, issues, inventory } = useDashboard();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (externalOnClose && !open) {
      externalOnClose();
    }
    setInternalIsOpen(open);
  };

  const [activeTab, setActiveTab] = useState<'chat' | 'pipeline' | 'logs'>('chat');
  const [messages, setMessages] = useState<
    { id: string; role: 'user' | 'assistant'; text: string; timestamp: string; agentTrace?: any }[]
  >([
    {
      id: 'msg-init',
      role: 'assistant',
      text: `Hello ${currentUser?.username || 'Supervisor'}. I am the **LifeLine Autonomous Dispatch Supervisor Co-Pilot**. I am monitoring the Google ADK Multi-Level Agent Pipeline, NEWS2 telemetry, bed capacities, and active clinical dispatches in real time. How can I assist?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Global hotkey: Cmd/Ctrl + K or Backquote
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleVoiceToggle = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech Recognition is not available in your browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const query = (customPrompt || input).trim();
    if (!query || isThinking) return;

    const userMsgId = `usr-${Date.now()}`;
    const userMsg = {
      id: userMsgId,
      role: 'user' as const,
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    // Simulate Agentic Supervisor Reasoning Engine
    setTimeout(() => {
      let responseText = '';
      let agentTrace = null;

      const lowerQuery = query.toLowerCase();

      if (lowerQuery.includes('triage') || lowerQuery.includes('news2') || lowerQuery.includes('patient')) {
        const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
        responseText = `### 🏥 Clinical Triage & Dispatch Analysis\n\n- **Active Monitored Emergencies:** ${alerts.length} cases\n- **Critical (NEWS2 ≥ 7):** ${criticalCount} patients en route to Level 1 trauma bays.\n- **Orchestrator Decision Quality:** 100% matched within clinical SLA (< 15s latency).\n- **Specialty Routing:** Neuro-trauma and Cardiac catheterization pathways locked.`;
        agentTrace = {
          agent: 'TriageCoordinator (Level 2 LoopAgent)',
          model: 'gemini-3.1-pro',
          schemaValidated: true,
          iterations: 1,
          fallbacksTriggered: 0,
        };
      } else if (lowerQuery.includes('capacity') || lowerQuery.includes('bed') || lowerQuery.includes('icu')) {
        responseText = `### 🛏️ Hospital Bed & Diversion Status\n\n- **Facility:** ${currentHospital.name}\n- **Available ICU Beds:** ${currentHospital.availableIcuBeds} of ${currentHospital.totalIcuBeds}\n- **Trauma Bays:** ${currentHospital.availableTraumaBays} of ${currentHospital.totalTraumaBays}\n- **Diversion Status:** ${currentHospital.isDiverting ? '⚠️ ACTIVE DIVERSION' : '✅ OPEN FOR ADMISSIONS'}\n- **Recommendation:** Keep general trauma bay reserved for inbound ambulance ETA 4m.`;
        agentTrace = {
          agent: 'BedMatchingCoordinator (Level 2 LoopAgent)',
          model: 'gemini-3.5-flash',
          osrmEnriched: true,
          heuristicDistanceKm: 2.8,
        };
      } else if (lowerQuery.includes('blood') || lowerQuery.includes('donor')) {
        responseText = `### 🩸 Regional Blood Bank & Inbound Responders\n\n- **Urgent Shortages:** O-Negative reserve below safety buffer (2 units remaining).\n- **Autonomous Donor Broadcast:** Activated 14 minutes ago.\n- **Matched Live Responders:** 2 verified donors en-route with estimated arrival in 18 mins.`;
        agentTrace = {
          agent: 'RequestMatchingCoordinator (Level 2 LoopAgent)',
          model: 'gemini-3.5-flash',
          targetBloodGroup: 'O-',
          notifiedDonors: 5,
          acceptedDonors: 2,
        };
      } else {
        responseText = `### 🤖 LifeLine Autonomous Supervisor Response\n\nAnalyzed multi-agent telemetry for **${currentHospital.name}**:\n- All 3 Level-2 Coordinators (Triage, Bed-Matching, Resource) are executing deterministically.\n- Audit logs cryptographically signed and stored in Firestore audit collection.\n- Current Regional SLA compliance is **99.8%**.`;
        agentTrace = {
          agent: 'SequentialOrchestrator (Level 1 RootAgent)',
          subagents: ['TriageLeaf', 'BedMatchLeaf', 'BriefingLeaf'],
          status: 'SUCCESS',
        };
      }

      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant' as const,
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        agentTrace,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);
    }, 900);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl h-full bg-[#0d131f] border-l border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between bg-[#080d16] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-white">AI Agent Supervisor</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  CO-PILOT
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">Google ADK & Gemini Multi-Agent Inspector</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#090e18] border-b border-slate-800/80 text-xs font-mono">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'chat'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'pipeline'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>ADK Hierarchy</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'logs'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Agent Telemetry Logs</span>
          </button>
        </div>

        {/* TAB 1: INTERACTIVE CHAT */}
        {activeTab === 'chat' && (
          <>
            {/* Quick Prompt Chips */}
            <div className="p-3 bg-[#0a0f1b] border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0 no-scrollbar">
              <span className="text-slate-400 font-mono shrink-0">Quick Queries:</span>
              <button
                onClick={() => handleSendMessage('Analyze active critical triage cases')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 shrink-0 transition-colors"
              >
                🚨 Critical Triage Feed
              </button>
              <button
                onClick={() => handleSendMessage('Check ICU and Trauma Bay capacity status')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 shrink-0 transition-colors"
              >
                🛏️ Bed Capacity & Diversion
              </button>
              <button
                onClick={() => handleSendMessage('Summarize blood bank stock and donor broadcasts')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 shrink-0 transition-colors"
              >
                🩸 Blood Bank Reserves
              </button>
            </div>

            {/* Chat Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-4 space-y-2 shadow-lg ${
                      m.role === 'user'
                        ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-br-none'
                        : 'bg-[#141b2d] border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-1.5 text-[10px] text-slate-300 font-mono">
                      <span>{m.role === 'user' ? 'Supervisor Command' : 'LifeLine Co-Pilot'}</span>
                      <span>{m.timestamp}</span>
                    </div>

                    <div className="prose prose-invert prose-xs leading-relaxed whitespace-pre-wrap">
                      {m.text}
                    </div>

                    {m.agentTrace && (
                      <div className="mt-3 pt-2 border-t border-slate-800/80 font-mono text-[10px] bg-[#090d16] p-2 rounded-lg border border-slate-800">
                        <div className="text-sky-400 font-bold flex items-center gap-1.5 mb-1">
                          <Cpu className="w-3 h-3" />
                          <span>Agent Execution Audit Trace</span>
                        </div>
                        <pre className="text-slate-400 overflow-x-auto text-[10px]">
                          {JSON.stringify(m.agentTrace, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex items-center gap-2 p-3 bg-[#141b2d] rounded-2xl max-w-xs border border-slate-800 text-slate-300 text-xs animate-pulse">
                  <Bot className="w-4 h-4 text-sky-400 animate-spin" />
                  <span>Reasoning over Multi-Agent graph...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-[#080d16] border-t border-slate-800 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 bg-[#111726] border border-slate-700/80 rounded-2xl p-1.5 pl-3 focus-within:border-sky-500 transition-colors"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask AI supervisor (e.g. 'Why was Patient #4 routed to ICU?')..."
                  className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                />

                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  className={`p-2 rounded-xl transition-all ${
                    isListening
                      ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={isListening ? 'Listening...' : 'Voice Dictate'}
                >
                  {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>

                <button
                  type="submit"
                  disabled={!input.trim() || isThinking}
                  className="p-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-xl transition-colors shadow-md shadow-sky-600/30"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        )}

        {/* TAB 2: ADK MULTI-LEVEL PIPELINE HIERARCHY */}
        {activeTab === 'pipeline' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-5 font-mono text-xs text-slate-300 bg-[#0a0f1b]">
            <div className="p-4 rounded-2xl bg-[#111728] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-sky-400 flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Level 1: Root Sequential Orchestrator
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Manages complete dispatch lifecycle without domain coupling. Passes state sequentially across Level 2 coordinators and seals the cryptographic audit record.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Level 2: Domain Loop Coordinators
              </div>

              {/* Triage Coordinator */}
              <div className="p-3.5 rounded-xl bg-[#111728] border border-sky-500/30 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-sky-400" /> TriageCoordinator (LoopAgent)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Max Loops: 3</span>
                </div>
                <div className="text-[11px] text-slate-400 font-sans">
                  Validates clinical NEWS2 calculation → calls Level 3 <code className="text-purple-300">TriageLeaf (Gemini 3.1 Pro)</code> → Self-corrects on schema deviation → Fallback: Raw NEWS2 score.
                </div>
              </div>

              {/* Bed Matching Coordinator */}
              <div className="p-3.5 rounded-xl bg-[#111728] border border-emerald-500/30 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white flex items-center gap-2">
                    <BedDouble className="w-3.5 h-3.5 text-emerald-400" /> BedMatchingCoordinator (LoopAgent)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Max Loops: 3</span>
                </div>
                <div className="text-[11px] text-slate-400 font-sans">
                  Enriches with OSRM driving duration & OSM coordinates → verifies real-time ICU/Trauma bed reservation → Fallback: Haversine distance heuristic.
                </div>
              </div>

              {/* Report Coordinator */}
              <div className="p-3.5 rounded-xl bg-[#111728] border border-purple-500/30 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white flex items-center gap-2">
                    <Bot className="w-3.5 h-3.5 text-purple-400" /> ReportCoordinator (LoopAgent)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Draft → Critique → Revise</span>
                </div>
                <div className="text-[11px] text-slate-400 font-sans">
                  Aggregates regional metrics → generates executive briefing via Gemini 3.5 Flash → evaluates coherence → stores daily intelligence.
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-[11px]">
              <div className="font-bold text-slate-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" /> Circuit Breaker & Failover Guarantees
              </div>
              <p className="text-slate-400 font-sans">
                Zero human phone calls required. If external LLM or network times out (&gt;10s), the pipeline instantly engages deterministic clinical heuristics and writes a failover audit record.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: AGENT TELEMETRY LOGS */}
        {activeTab === 'logs' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[11px] bg-[#05080f] text-slate-300">
            <div className="text-slate-500 pb-2 border-b border-slate-800 flex justify-between">
              <span>[LIVE AGENT LOG STREAM - REALTIME]</span>
              <span className="text-emerald-400">● 100% HEALTHY</span>
            </div>

            <div className="text-slate-400">
              <span className="text-slate-600">[23:14:02]</span> <span className="text-sky-400">[INFO]</span> SequentialOrchestrator initialized session 0x9f82...
            </div>
            <div className="text-slate-400">
              <span className="text-slate-600">[23:14:03]</span> <span className="text-emerald-400">[OK]</span> news2_score(vitals) computed Score=8 (CRITICAL) in 0.4ms
            </div>
            <div className="text-slate-400">
              <span className="text-slate-600">[23:14:04]</span> <span className="text-purple-400">[GENAI]</span> TriageLeafAgent invoked gemini-3.1-pro with NEWS2 grounding
            </div>
            <div className="text-slate-400">
              <span className="text-slate-600">[23:14:05]</span> <span className="text-sky-400">[INFO]</span> TriageCoordinator schema validated: severity=&quot;critical&quot;, specialty=&quot;trauma&quot;
            </div>
            <div className="text-slate-400">
              <span className="text-slate-600">[23:14:06]</span> <span className="text-emerald-400">[OK]</span> BedMatchingCoordinator allocated Lilavati Trauma Bay #1 (ETA: 4.2m)
            </div>
            <div className="text-slate-400">
              <span className="text-slate-600">[23:14:07]</span> <span className="text-amber-400">[AUDIT]</span> Immutable record 0x88219 committed to Firestore audit log
            </div>
            <div className="text-slate-400">
              <span className="text-slate-600">[23:15:10]</span> <span className="text-sky-400">[POLL]</span> Hospital inventory sync completed: 0 critical depleted items
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
