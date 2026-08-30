export interface ClinicalScenario {
  id: string;
  name: string;
  acuity: 'CRITICAL' | 'EMERGENT' | 'URGENT';
  category: string;
  badgeColor: string;
  patientDescription: string;
  vitals: {
    hr: number;
    bp: string;
    rr: number;
    spo2: number;
    temp: number;
    gcs: number;
  };
  news2Score: number;
  primarySpecialty: string;
  matchedHospital: string;
  travelEta: string;
  distanceKm: string;
  briefingHeadline: string;
  simulatedAuditHash: string;
}

export const CLINICAL_SCENARIOS: ClinicalScenario[] = [
  {
    id: 'stemi',
    name: 'Acute STEMI / Anterior Wall Infarction',
    acuity: 'CRITICAL',
    category: 'Cardiovascular',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    patientDescription: '63yo Male, crushing substernal chest pressure radiating to jaw, diaphoresis, dyspneic. 12-lead ECG shows >2mm ST elevation in V1-V4.',
    vitals: {
      hr: 118,
      bp: '88/54',
      rr: 26,
      spo2: 93,
      temp: 36.8,
      gcs: 15
    },
    news2Score: 8,
    primarySpecialty: 'Interventional Cardiology (24/7 Primary PCI)',
    matchedHospital: 'St. Jude Regional Medical Center (Cath Lab 2)',
    travelEta: '5.8 minutes',
    distanceKm: '4.2 km',
    briefingHeadline: 'STAT Cath Lab activation: 63yo M in cardiogenic shock risk with anterior STEMI. Pre-staged heparin and norepinephrine.',
    simulatedAuditHash: '0x8f2a...7c91'
  },
  {
    id: 'polytrauma',
    name: 'Level 1 Polytrauma / High-Speed MVC',
    acuity: 'CRITICAL',
    category: 'Trauma Surgery',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    patientDescription: '28yo Female, restrained driver in rollover collision. Flail chest right hemithorax, pelvic instability, GCS 9 with sluggish pupils.',
    vitals: {
      hr: 134,
      bp: '78/42',
      rr: 34,
      spo2: 88,
      temp: 35.6,
      gcs: 9
    },
    news2Score: 12,
    primarySpecialty: 'Level 1 Trauma Surgery & Neurotrauma',
    matchedHospital: 'Metro Health University Trauma Center',
    travelEta: '7.2 minutes',
    distanceKm: '5.8 km',
    briefingHeadline: 'Level 1 Trauma Red Alert: 28yo F flail chest & pelvic ring disruption. Massive Transfusion Protocol (MTP) activated in trauma bay.',
    simulatedAuditHash: '0x3e11...9a44'
  },
  {
    id: 'stroke',
    name: 'Hyperacute Ischemic Stroke (LVO)',
    acuity: 'EMERGENT',
    category: 'Neurology / Endovascular',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    patientDescription: '71yo Female, sudden onset right hemiplegia and expressive aphasia. Last known normal 42 minutes ago (FAST+ score: 3).',
    vitals: {
      hr: 86,
      bp: '184/102',
      rr: 18,
      spo2: 97,
      temp: 37.1,
      gcs: 13
    },
    news2Score: 5,
    primarySpecialty: 'Comprehensive Stroke Center (Endovascular Thrombectomy)',
    matchedHospital: 'Pacific Neuroscience & Stroke Pavilion',
    travelEta: '6.4 minutes',
    distanceKm: '4.9 km',
    briefingHeadline: 'Code Stroke: 71yo F within 45m thrombolytic window. CT Perfusion and Neuro-Interventional biplane suite on immediate hold.',
    simulatedAuditHash: '0x7b54...2e09'
  },
  {
    id: 'sepsis',
    name: 'Severe Sepsis / Septic Shock',
    acuity: 'CRITICAL',
    category: 'Critical Care / Infectious',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    patientDescription: '54yo Male with indwelling catheter presenting with rigors, altered mental status, warm peripheries, and severe hypotension.',
    vitals: {
      hr: 126,
      bp: '82/48',
      rr: 28,
      spo2: 91,
      temp: 39.6,
      gcs: 12
    },
    news2Score: 10,
    primarySpecialty: 'Medical Intensive Care Unit (MICU)',
    matchedHospital: 'Valley Memorial Hospital (ICU Bed 4)',
    travelEta: '8.1 minutes',
    distanceKm: '6.3 km',
    briefingHeadline: 'Sepsis Resuscitation Alert: NEWS2 of 10. Lactate elevated. Broad spectrum IV antibiotics and 30ml/kg crystalloid bolus queued.',
    simulatedAuditHash: '0x1c89...6f55'
  }
];

export interface PipelineStep {
  stepNumber: number;
  id: string;
  title: string;
  subtitle: string;
  agentResponsible: string;
  agentModel: string;
  durationMs: string;
  description: string;
  actionItems: string[];
}

export const PIPELINE_STEPS: PipelineStep[] = [
  {
    stepNumber: 1,
    id: 'intake',
    title: 'Emergency Case Ingestion',
    subtitle: 'Vitals & Telemetry Ingestion',
    agentResponsible: 'System Ingest Service',
    agentModel: 'FastAPI / WebSocket / PubSub',
    durationMs: '40ms',
    description: 'Ingests paramedic tablet telemetry, patient vitals, 12-lead ECG findings, and voice-to-text transcript over encrypted TLS channel.',
    actionItems: [
      'Parse continuous Bluetooth vital stream',
      'Standardize payload into clinical FHIR format',
      'Generate immutable dispatch tracking UUID'
    ]
  },
  {
    stepNumber: 2,
    id: 'triage',
    title: 'NEWS2 Clinical Scoring & Triage',
    subtitle: 'Acuity & Specialty Reasoning',
    agentResponsible: 'Triage Agent',
    agentModel: 'gemini-3.1-pro',
    durationMs: '640ms',
    description: 'Executes standard Royal College of Physicians NEWS2 algorithm to compute deterministic score (0-20) and reasons over medical complexity to define required care capability.',
    actionItems: [
      'Calculate deterministic NEWS2 clinical acuity',
      'Identify critical failure modes (e.g. cardiogenic shock)',
      'Tag mandatory surgical specialties (Cath Lab, Trauma 1, Thrombectomy)'
    ]
  },
  {
    stepNumber: 3,
    id: 'bed-match',
    title: 'Capability & Bed Matching',
    subtitle: 'Hospital Matrix Optimization',
    agentResponsible: 'Bed-Matching Agent',
    agentModel: 'gemini-3.5-flash',
    durationMs: '380ms',
    description: 'Matches patient constraints with regional hospital capacity, trauma accreditations, active Cath Labs, diversion alerts, and verified ICU beds.',
    actionItems: [
      'Filter hospitals by mandatory clinical capability',
      'Cross-reference live bed occupancy and diversion status',
      'Initiate automated soft-lock on receiving unit bed'
    ]
  },
  {
    stepNumber: 4,
    id: 'routing',
    title: 'Geospatial Driving & Corridor Routing',
    subtitle: 'OSRM Turn-by-Turn Matrix',
    agentResponsible: 'Routing Agent',
    agentModel: 'gemini-3.5-flash + OSRM',
    durationMs: '190ms',
    description: 'Calculates driving distance and Code-3 siren transit times using street networks from OpenStreetMap and the high-speed OSRM routing engine.',
    actionItems: [
      'Query OSRM table engine for road distances',
      'Apply Code-3 emergency siren travel calibration factor',
      'Route directly to designated ambulance trauma bay entrance'
    ]
  },
  {
    stepNumber: 5,
    id: 'briefing',
    title: 'Pre-Arrival SBAR Briefing',
    subtitle: 'Direct Trauma Team Notification',
    agentResponsible: 'Briefing Agent',
    agentModel: 'gemini-3.5-flash',
    durationMs: '420ms',
    description: 'Synthesizes clinical vitals, NEWS2 score, medications given en route, and vehicle ETA into a concise SBAR trauma brief delivered directly to the receiving hospital.',
    actionItems: [
      'Generate standardized SBAR trauma brief',
      'Push notification to trauma surgeon pagers & bedside screens',
      'Pre-stage critical blood products and resuscitation pharmacology'
    ]
  },
  {
    stepNumber: 6,
    id: 'audit-report',
    title: 'Sovereign Audit & Authority Intelligence',
    subtitle: 'Real-Time Event Ledger & Reporting',
    agentResponsible: 'Report Agent',
    agentModel: 'gemini-3.5-flash',
    durationMs: '130ms',
    description: 'Commits cryptographically verifiable audit log of all decisions and compiles regional health authority daily situational reports.',
    actionItems: [
      'Write immutable dispatch record with agent reasonings',
      'Update regional hospital stress index & diversion tracking',
      'Feed public health authority operational intelligence summary'
    ]
  }
];
