export interface TeamMember {
  name: string;
  role: string;
  specialty: string;
  bio: string;
  avatarText: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Harish & LifeLine Engineering Core',
    role: 'Multi-Agent System Architecture & AI Pipeline',
    specialty: 'Google Gemini 3.1/3.5, Multi-Agent Systems, Distributed Systems',
    bio: 'Built the end-to-end autonomous dispatch mesh, integrating Gemini 3.1 Pro & 3.5 Flash with deterministic clinical protocols and real-time geospatial engines.',
    avatarText: 'HA',
    github: 'https://github.com/Harish-ai-dev/LifeLine-Agent',
    linkedin: 'https://linkedin.com'
  },
  {
    name: 'Clinical & Emergency Medicine Advisors',
    role: 'Clinical Protocol & NEWS2 Safety Validation',
    specialty: 'Emergency Medicine, Trauma Resuscitation, SBAR Handoffs',
    bio: 'Calibrated the deterministic NEWS2 acuity scoring matrices, physiological threshold rules, and SBAR clinical trauma briefing requirements.',
    avatarText: 'EM',
    github: 'https://github.com/Harish-ai-dev/LifeLine-Agent',
    linkedin: 'https://linkedin.com'
  },
  {
    name: 'Geospatial & Cloud Infrastructure Lead',
    role: 'OSRM Routing & Google Cloud Run Scale',
    specialty: 'OSRM Engine, High-Concurrency WebSockets, Pub/Sub',
    bio: 'Engineered the high-throughput OSRM distance matrix pipelines and serverless Cloud Run container deployment with sub-2-second end-to-end SLA.',
    avatarText: 'GC',
    github: 'https://github.com/Harish-ai-dev/LifeLine-Agent',
    linkedin: 'https://linkedin.com'
  }
];

export const PROJECT_METADATA = {
  title: 'LifeLine Agent — Autonomous Emergency Dispatch & Hospital Coordination',
  shortTitle: 'LifeLine Agent',
  tagline: 'Zero phone calls, zero hold music, seconds not minutes.',
  subtext: 'A multi-agent AI system on Google Gemini that eliminates fatal communication latency between emergency dispatch, EMS ambulances, receiving hospitals, and public health authorities.',
  hackathonBadge: 'Google Gemini AI Hackathon 2025 Submission',
  license: 'Apache 2.0 Open Source License',
  repoUrl: 'https://github.com/Harish-ai-dev/LifeLine-Agent',
  demoVideoDuration: '4:15',
  demoVideoUrl: 'https://www.youtube.com',
  architectureDiagramUrl: '#architecture',
  contactEmail: 'team@lifelineagent.io'
};
