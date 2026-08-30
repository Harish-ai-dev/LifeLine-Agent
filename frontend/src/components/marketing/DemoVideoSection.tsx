'use client';

import React, { useState } from 'react';
import { 
  Play, 
  Monitor, 
  Smartphone, 
  Building2, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Volume2, 
  VolumeX,
  Maximize2
} from 'lucide-react';
import { PROJECT_METADATA } from '@/data/marketing/team';

export const DemoVideoSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DISPATCH' | 'EMS' | 'HOSPITAL'>('DISPATCH');
  const [isPlayingSim, setIsPlayingSim] = useState<boolean>(false);

  return (
    <section id="demo" className="py-24 bg-[#F8FAFC] relative border-t border-slate-200 scroll-mt-20 w-full">
      <div className="w-full w-full px-2 sm:px-4 lg:px-6 px-4 sm:px-6 lg:px-8 xl:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono uppercase tracking-wider mb-4">
            <Play className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Interactive Demo & Product Showcase</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            See LifeLine Agent in Action.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-650 font-sans">
            Watch the 4-minute submission walkthrough below, or toggle between the three operational product views (EMS Mobile, Hospital Receiving Command, and Municipal Authority).
          </p>
        </div>

        {/* Video Player Embed Placeholder */}
        <div className="mt-12 max-w-4xl mx-auto rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden relative group">
          {/* Video Header Bar */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-mono text-slate-600">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="ml-2 font-bold text-slate-900">LifeLine Agent — Full 4-Minute Hackathon Demo Video</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-cyan-700 font-bold">
              Duration: {PROJECT_METADATA.demoVideoDuration}
            </span>
          </div>

          {/* Video Simulation Canvas */}
          <div className="relative aspect-video bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 p-[1px] shadow-2xl shadow-rose-500/30">
                <button
                  onClick={() => setIsPlayingSim(!isPlayingSim)}
                  className="w-full h-full bg-white hover:bg-slate-50 rounded-[15px] flex items-center justify-center text-rose-500 transition-all group-hover:scale-105"
                  aria-label="Play video"
                >
                  <Play className="w-8 h-8 fill-rose-500 ml-1" />
                </button>
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">
              LifeLine Agent — Autonomous Dispatch Walkthrough
            </h3>
            
            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-lg font-mono">
              A comprehensive live screen capture demonstrating STEMI clinical triage on Gemini 3.1 Pro, sub-second OSRM bed matching, and automated SBAR briefing delivery.
            </p>

            {/* Video Chapters Timeline Bar */}
            <div className="mt-8 w-full max-w-xl bg-white border border-slate-200 rounded-xl p-3 text-left font-mono text-[11px] shadow-sm">
              <div className="text-slate-450 uppercase tracking-wider text-[10px] mb-2">Video Chapters:</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600">
                <div className="p-1.5 rounded bg-slate-50 border border-slate-100">00:00 Problem & Hold Times</div>
                <div className="p-1.5 rounded bg-slate-50 border border-slate-100">01:10 NEWS2 Triage Agent</div>
                <div className="p-1.5 rounded bg-slate-50 border border-slate-100">02:25 OSRM Bed Matching</div>
                <div className="p-1.5 rounded bg-slate-50 border border-slate-100">03:40 Trauma SBAR Brief</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Role-Based Product Views Preview Switcher */}
        <div className="mt-20 w-full">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900 font-mono">
              Explore the 3 Operational Product Interfaces
            </h3>
            <p className="mt-1 text-sm text-slate-500 font-sans">
              LifeLine Agent delivers tailored interfaces for each stakeholder in the trauma chain.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 mb-8 font-mono">
            <button
              onClick={() => setActiveTab('DISPATCH')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-sm ${
                activeTab === 'DISPATCH'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/10'
                  : 'bg-white text-slate-500 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>911 Dispatch Command</span>
            </button>

            <button
              onClick={() => setActiveTab('EMS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-sm ${
                activeTab === 'EMS'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/10'
                  : 'bg-white text-slate-500 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>EMS Paramedic Tablet</span>
            </button>

            <button
              onClick={() => setActiveTab('HOSPITAL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-sm ${
                activeTab === 'HOSPITAL'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/10'
                  : 'bg-white text-slate-500 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Hospital Trauma Receiver</span>
            </button>
          </div>

          {/* Tab View Content */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-250 shadow-md shadow-slate-100/50">
            {activeTab === 'DISPATCH' && (
              <div className="space-y-4 font-mono">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs text-cyan-700 font-bold uppercase tracking-wider">911 CAD & Regional Dispatch Console</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 border border-emerald-250 text-emerald-700 font-bold">AUTONOMOUS DISPATCH ACTIVE</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-450">ACTIVE REGIONAL INCIDENTS</span>
                    <div className="text-xl font-bold text-slate-900 mt-1">14 In Progress</div>
                    <span className="text-[10px] text-emerald-650 font-bold">0 On Hold / Phone Delay</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-450">AVERAGE MATCH SPEED</span>
                    <div className="text-xl font-bold text-cyan-700 mt-1">1.84 Seconds</div>
                    <span className="text-[10px] text-slate-500">via Gemini 3.5 Flash</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-455">REGIONAL DIVERSIONS</span>
                    <div className="text-xl font-bold text-amber-700 mt-1">1 Hospital (Metro West)</div>
                    <span className="text-[10px] text-slate-500">Traffic automatically bypassed</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'EMS' && (
              <div className="space-y-4 font-mono">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs text-cyan-700 font-bold uppercase tracking-wider">EMS Field Unit 42 Mobile Brief</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-50 border border-cyan-200 text-cyan-700 font-bold">CODE-3 TRANSIT</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <div className="text-slate-450 text-[10px]">ASSIGNED HOSPITAL DESTINATION</div>
                    <div className="text-base font-bold text-emerald-700">St. Jude Regional Medical Center</div>
                    <div className="text-slate-650">Trauma Bay 2 • Cath Lab Pre-Alerted • ETA 5.8m</div>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <div className="text-slate-450 text-[10px]">PRE-ARRIVAL SBAR STATUS</div>
                    <div className="text-base font-bold text-cyan-700">Briefing Delivered & Acknowledged</div>
                    <div className="text-slate-650">Surgeon Dr. Chen in scrub suite</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'HOSPITAL' && (
              <div className="space-y-4 font-mono">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs text-rose-600 font-bold uppercase tracking-wider">St. Jude Trauma Bay & Cath Lab Receiver Screen</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-bold">PRE-ARRIVAL INCOMING (5.8m)</span>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                  <div className="font-bold text-rose-650">SITUATION & BACKGROUND (SBAR):</div>
                  <p>63yo Male with acute Anterior STEMI presenting with cardiogenic shock risk. NEWS2 of 8. Hypotensive (88/54) and tachycardic (118). ST elevation in V1-V4.</p>
                  <div className="font-bold text-cyan-700 pt-2">PRE-STAGE RECOMMENDATIONS:</div>
                  <p>Cath Lab 2 direct bypass. Prepare Norepinephrine line and standard heparinized angiography equipment.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
