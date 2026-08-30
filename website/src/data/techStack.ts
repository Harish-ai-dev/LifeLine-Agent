export interface TechItem {
  name: string;
  category: 'AI & Models' | 'Frontend' | 'Backend & Cloud' | 'Geospatial & Clinical' | 'Database & Storage';
  role: string;
  badge: string;
  description: string;
  link?: string;
}

export const TECH_STACK: TechItem[] = [
  {
    name: 'Google Gemini 3.1 Pro',
    category: 'AI & Models',
    role: 'Primary Clinical Reasoning & NEWS2 Triage Agent',
    badge: 'gemini-3.1-pro',
    description: 'High-reasoning frontier model for complex clinical deduction, multi-specialty triage, and critical risk identification.'
  },
  {
    name: 'Google Gemini 3.5 Flash',
    category: 'AI & Models',
    role: 'Fast Bed-Matching, Briefing & Report Agents',
    badge: 'gemini-3.5-flash',
    description: 'Ultra-low latency model powering sub-second hospital matching, SBAR brief drafting, and authority report generation.'
  },
  {
    name: 'FastAPI & Python 3.11',
    category: 'Backend & Cloud',
    role: 'Autonomous Agent Orchestration Engine',
    badge: 'FastAPI',
    description: 'Asynchronous event-driven microservices managing agent state transitions, tool execution, and WebSockets.'
  },
  {
    name: 'Google Cloud Run',
    category: 'Backend & Cloud',
    role: 'Serverless Auto-Scaling Container Infrastructure',
    badge: 'Cloud Run',
    description: 'High-concurrency, containerized execution scaling to zero during idle periods and scaling instantly during trauma surges.'
  },
  {
    name: 'OSRM (Open Source Routing Machine)',
    category: 'Geospatial & Clinical',
    role: 'High-Performance Road Network & Distance Matrix Engine',
    badge: 'OSRM Engine',
    description: 'C++ routing engine computing street-level travel times, distance matrices, and turn-by-turn navigation in milliseconds.'
  },
  {
    name: 'NEWS2 Clinical Protocol',
    category: 'Geospatial & Clinical',
    role: 'Standardized Royal College of Physicians Acuity Standard',
    badge: 'NEWS2 RCP',
    description: 'Peer-reviewed clinical standard computing early warning scores from physiological parameters with 100% deterministic accuracy.'
  },
  {
    name: 'React 19 & TypeScript',
    category: 'Frontend',
    role: 'Public Portal & Command Center User Experience',
    badge: 'React 19 + TS',
    description: 'Type-safe, component-driven client architecture with sub-second render performance and rich interactive visualizations.'
  },
  {
    name: 'Tailwind CSS v4 & Framer Motion',
    category: 'Frontend',
    role: 'Command-Center Dark UI & Animated Visualizations',
    badge: 'Tailwind v4',
    description: 'Sleek, telemetry-grade styling with dark navy aesthetic, glowing neon status accents, and fluid state transitions.'
  },
  {
    name: 'Supabase & PostgreSQL',
    category: 'Database & Storage',
    role: 'Persistent Storage, Audit Streams & Judge Community Feedback',
    badge: 'PostgreSQL',
    description: 'ACID-compliant relational storage for dispatch records, feedback reviews, pilot waitlist signups, and telemetry logs.'
  },
  {
    name: 'Cloud Firestore & Pub/Sub',
    category: 'Database & Storage',
    role: 'Real-Time Telemetry Streaming & Hospital State Sync',
    badge: 'Firestore Realtime',
    description: 'Distributed document store delivering sub-100ms real-time event updates to receiving hospital monitors and paramedic tablets.'
  }
];
