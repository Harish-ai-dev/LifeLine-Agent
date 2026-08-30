import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CommandPalette } from './components/CommandPalette';
import { WaitlistModal } from './components/WaitlistModal';
import { AgentDetailModal } from './components/AgentDetailModal';
import { AgentInfo } from './data/agents';

// Pages
import { HomePage } from './pages/HomePage';
import { AgentsPage } from './pages/AgentsPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { DocsPage } from './pages/DocsPage';
import { ProvenancePage } from './pages/ProvenancePage';
import { ContributePage } from './pages/ContributePage';
import { ReviewsPage } from './pages/ReviewsPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyTermsPage } from './pages/PrivacyTermsPage';

export default function App() {
  const [isDemoOpen, setIsDemoOpen] = useState<boolean>(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentInfo | null>(null);
  const [systemStatus, setSystemStatus] = useState<string>('HEALTHY');

  useEffect(() => {
    // Ping status API
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        if (data.status) setSystemStatus(data.status);
      })
      .catch(err => console.log('Status ping error:', err));
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 flex flex-col justify-between">
        
        {/* Fixed Header */}
        <Navbar 
          onOpenDemo={() => setIsDemoOpen(true)}
          onOpenWaitlist={() => setIsWaitlistOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          systemStatus={systemStatus}
        />

        {/* Main Content Router */}
        <main className="flex-grow">
          <Routes>
            <Route 
              path="/" 
              element={
                <HomePage 
                  onOpenDemo={() => setIsDemoOpen(true)}
                  onOpenWaitlist={() => setIsWaitlistOpen(true)}
                  onSelectAgent={(agent) => setSelectedAgent(agent)}
                />
              } 
            />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/simulator" element={<SimulatorPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/provenance" element={<ProvenancePage />} />
            <Route path="/contribute" element={<ContributePage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/legal" element={<PrivacyTermsPage />} />
            {/* Catch-all fallback */}
            <Route 
              path="*" 
              element={
                <HomePage 
                  onOpenDemo={() => setIsDemoOpen(true)}
                  onOpenWaitlist={() => setIsWaitlistOpen(true)}
                  onSelectAgent={(agent) => setSelectedAgent(agent)}
                />
              } 
            />
          </Routes>
        </main>

        {/* Global Enhanced Footer */}
        <Footer 
          onOpenDemo={() => setIsDemoOpen(true)}
          onOpenWaitlist={() => setIsWaitlistOpen(true)}
        />

        {/* Modals & Overlays */}
        <CommandPalette 
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />

        <WaitlistModal 
          isOpen={isWaitlistOpen}
          onClose={() => setIsWaitlistOpen(false)}
        />

        <AgentDetailModal 
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />

        {/* Demo Video Modal */}
        {isDemoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="relative w-full max-w-4xl rounded-3xl bg-[#080D1A] border border-cyan-800 shadow-2xl overflow-hidden font-mono text-xs">
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-200">
                <span className="font-bold flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span>LifeLine Agent — 4-Minute Hackathon Demo Video</span>
                </span>
                <button 
                  onClick={() => setIsDemoOpen(false)}
                  className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                >
                  Close ✕
                </button>
              </div>

              <div className="aspect-video bg-black flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 mb-4">
                  <span className="text-2xl">▶</span>
                </div>
                <h3 className="text-lg font-bold text-white">Full Multi-Agent Walkthrough Video</h3>
                <p className="mt-2 text-slate-400 max-w-md">
                  Demonstrating live STEMI vitals intake, deterministic NEWS2 scoring on Gemini 3.1 Pro, sub-second OSRM bed matching, and automated trauma SBAR handoff.
                </p>
                <div className="mt-6 flex items-center space-x-3">
                  <button 
                    onClick={() => setIsDemoOpen(false)}
                    className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </BrowserRouter>
  );
}
