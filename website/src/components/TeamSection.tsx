import React from 'react';
import { 
  Users, 
  Github, 
  Linkedin, 
  ExternalLink,
  Award,
  Heart
} from 'lucide-react';
import { TEAM_MEMBERS, PROJECT_METADATA } from '../data/team';

export const TeamSection: React.FC = () => {
  return (
    <section id="team" className="py-24 bg-[#0B1120] relative border-t border-slate-900 scroll-mt-20 w-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono uppercase tracking-wider mb-4">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Project Team & Credits</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Built for the Google Gemini AI Hackathon.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300 font-sans">
            Engineered at the intersection of emergency medicine clinical rigor, frontier Google Gemini multi-agent reasoning, and resilient distributed systems.
          </p>
        </div>

        {/* Team Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {TEAM_MEMBERS.map((member, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 p-[1px] shadow-lg mb-4">
                  <div className="w-full h-full bg-[#0B1120] rounded-[15px] flex items-center justify-center font-mono font-bold text-cyan-400 text-lg">
                    {member.avatarText}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white font-mono">{member.name}</h3>
                <p className="text-xs font-mono text-cyan-400 mt-0.5">{member.role}</p>
                <p className="text-[11px] font-mono text-slate-400 mt-1">Specialty: {member.specialty}</p>

                <p className="mt-4 text-xs text-slate-300 leading-relaxed font-sans">
                  {member.bio}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center space-x-3 text-slate-400">
                <a 
                  href="https://github.com/Harish-ai-dev/LifeLine-Agent" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors flex items-center space-x-1 font-mono text-xs" 
                  aria-label="GitHub Profile"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Acknowledgments */}
        <div className="mt-12 max-w-3xl mx-auto p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center font-mono text-xs text-slate-400 leading-relaxed">
          <span className="text-cyan-400 font-bold">Special Acknowledgments:</span> Royal College of Physicians for the open NEWS2 clinical standard, the Open Source Routing Machine (OSRM) contributors, and the Google Gemini AI Hackathon organizers.
        </div>

      </div>
    </section>
  );
};
