import React from 'react';
import { TeamSection } from '../components/TeamSection';
import { 
  Users, 
  HeartHandshake, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Award, 
  Github,
  ExternalLink
} from 'lucide-react';
import { PROJECT_METADATA } from '../data/team';

export const AboutPage: React.FC = () => {
  return (
    <div className="w-full pt-28 pb-24 bg-[#0B1120] text-slate-100 font-sans">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono uppercase tracking-wider mb-4">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mission & Team Background</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            About LifeLine Agent
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 font-normal leading-relaxed font-sans">
            Eliminating fatal communication latency in emergency medical dispatch through deterministic clinical standards and Google Gemini multi-agent reasoning.
          </p>
        </div>

        {/* Mission Narrative */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-cyan-950/80 shadow-2xl max-w-4xl space-y-4 font-mono text-xs text-slate-300 leading-relaxed">
          <h2 className="text-xl font-bold text-white font-sans">Why We Built LifeLine Agent</h2>
          <p className="font-sans text-sm text-slate-300">
            In emergency medicine, the first 60 minutes after a traumatic injury or myocardial infarction is known as the <strong>"Golden Hour."</strong> Every minute of delay increases the mortality rate by 7-10%.
          </p>
          <p className="font-sans text-sm text-slate-300">
            Yet today, 911 dispatchers and paramedics still manually call receiving hospitals on landlines, waiting on hold while charge nurses check ICU bed boards or verify if an interventional catheterization lab is staffed.
          </p>
          <p className="font-sans text-sm text-slate-300">
            LifeLine Agent solves this by orchestrating 6 autonomous Gemini agents in an event-driven mesh. In 1.8 seconds, vitals are triaged with NEWS2, the optimal accredited hospital is matched via live OSRM routing, and a structured SBAR trauma briefing is delivered to the receiving surgical team before the ambulance even begins rolling.
          </p>
          <div className="pt-4 border-t border-slate-800 flex items-center space-x-4">
            <a
              href="https://github.com/Harish-ai-dev/LifeLine-Agent"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold font-mono text-xs flex items-center space-x-1.5"
            >
              <Github className="w-4 h-4" />
              <span>GitHub Repository</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Team Component */}
        <div className="mt-8">
          <TeamSection />
        </div>

      </div>
    </div>
  );
};
