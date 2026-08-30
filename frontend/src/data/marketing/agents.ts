export interface AgentInfo {
  id: string;
  name: string;
  shortName: string;
  role: string;
  model: string;
  modelBadgeColor: string;
  tagline: string;
  description: string;
  clinicalPurpose: string;
  inputDescription: string;
  outputDescription: string;
  inputSample: Record<string, any>;
  outputSample: Record<string, any>;
  promptExcerpt: string;
  keyCapabilities: string[];
  latencyMs: number;
  tokensAvg: number;
  iconName: string;
}

export const AGENT_ROSTER: AgentInfo[] = [
  {
    id: 'triage-agent',
    name: 'Triage Agent',
    shortName: 'Triage',
    role: 'Clinical NEWS2 Scoring & Specialty Triage',
    model: 'gemini-3.1-pro',
    modelBadgeColor: 'from-blue-500 to-indigo-600',
    tagline: 'Deterministic NEWS2 scoring and clinical severity reasoning in under 700ms.',
    description: 'Computes the standard Royal College of Physicians NEWS2 score from raw vital signs and reasons over patient chief complaint, history, and physical findings to assign clinical urgency tier and required hospital specialty.',
    clinicalPurpose: 'Replaces error-prone mental triage with deterministic clinical scoring while understanding nuanced medical context (e.g., hypercapnic respiratory drive, acute ST elevation, GCS changes).',
    inputDescription: 'Patient age, sex, chief complaint, raw vitals (HR, BP, SpO2, Resp Rate, Temp, GCS), supplemental oxygen status, and known allergies/history.',
    outputDescription: 'Calculated NEWS2 score (0-20), clinical severity tier (RED/AMBER/YELLOW), primary required medical specialty, secondary specialties, and immediate clinical alerts.',
    inputSample: {
      patient: {
        age: 63,
        sex: 'Male',
        chiefComplaint: 'Crushing retrosternal chest pain radiating to left arm and jaw for 45 minutes with diaphoresis',
        vitals: {
          heartRate: 118,
          bloodPressure: '88/54',
          respiratoryRate: 26,
          spo2Percent: 93,
          temperatureC: 36.8,
          gcs: 15,
          onOxygen: false
        },
        ecgFinding: 'ST elevation > 2mm in V1-V4 (Anterior STEMI)'
      }
    },
    outputSample: {
      news2Score: 8,
      severityTier: 'TIER_1_CRITICAL_RED',
      requiredSpecialty: 'Interventional Cardiology / 24-7 Primary PCI Cath Lab',
      secondarySpecialties: ['Cardiothoracic Surgery', 'Cardiovascular ICU'],
      clinicalReasoning: 'NEWS2 of 8 indicates acute clinical deterioration. Hypotension (MAP < 65) with tachycardia and ST elevation confirms high-risk Anterior STEMI with impending cardiogenic shock.',
      immediateActions: ['Pre-activate Cardiac Catheterization Team', 'Dual Antiplatelet Administration Protocol', 'Direct-to-Cath-Lab Bed Bypass']
    },
    promptExcerpt: `You are the LifeLine Clinical Triage Agent. Given structured vital signs and presentation notes:
1. Compute the exact NEWS2 score according to the 2017 Royal College of Physicians protocol.
2. Deduce the primary surgical/medical specialty required for definitive care.
3. Return strict JSON conforming to LifeLineTriageResponseSchema.`,
    keyCapabilities: [
      '100% Deterministic NEWS2 algorithm adherence',
      'Understands oxygen delivery scale 1 vs scale 2 for COPD',
      'Detects atypical presentations in geriatric & diabetic patients',
      'Tags required hospital capabilities (PCI, ECMO, Level 1 Trauma)'
    ],
    latencyMs: 640,
    tokensAvg: 480,
    iconName: 'Activity'
  },
  {
    id: 'bed-matching-agent',
    name: 'Bed-Matching Agent',
    shortName: 'Bed Match',
    role: 'Multi-Constraint Hospital & Capability Matching',
    model: 'gemini-3.5-flash',
    modelBadgeColor: 'from-emerald-500 to-teal-600',
    tagline: 'Optimizes patient-hospital matching across distance, beds, specialties, and diversion status.',
    description: 'Matches the triaged patient to the optimal receiving hospital by evaluating real-time travel times (from OSRM), accredited trauma tiers, active catheterization labs, ICU bed availability, and hospital diversion status.',
    clinicalPurpose: 'Eliminates hospital phone calls and hold music by continuously maintaining a real-time capability matrix and selecting the best facility that can deliver immediate definitive care.',
    inputDescription: 'Triage payload (severity tier, required specialty), patient GPS coordinates, candidate regional hospital database with live capacity and distance metrics.',
    outputDescription: 'Ranked list of hospitals with match score (0-100), primary chosen facility, estimated bed reservation ID, and bypass rationale.',
    inputSample: {
      severityTier: 'TIER_1_CRITICAL_RED',
      requiredSpecialty: 'Interventional Cardiology / 24-7 Primary PCI Cath Lab',
      patientLocation: { lat: 37.7749, lng: -122.4194 },
      candidateHospitals: [
        { id: 'HOSP_01', name: 'St. Jude Regional Medical Center', distanceKm: 4.2, etaMins: 7.5, cathLabActive: true, icuBedsAvailable: 3, traumaLevel: 1, diversionStatus: false },
        { id: 'HOSP_02', name: 'Bayview General Hospital', distanceKm: 2.1, etaMins: 4.0, cathLabActive: false, icuBedsAvailable: 8, traumaLevel: 3, diversionStatus: false },
        { id: 'HOSP_03', name: 'Metro Health University', distanceKm: 8.5, etaMins: 14.2, cathLabActive: true, icuBedsAvailable: 0, traumaLevel: 1, diversionStatus: true }
      ]
    },
    outputSample: {
      recommendedHospital: {
        id: 'HOSP_01',
        name: 'St. Jude Regional Medical Center',
        matchScore: 98,
        driveEtaMinutes: 7.5,
        traumaLevel: 1,
        selectedSpecialtyUnit: 'Cath Lab 2 (Pre-alerted)',
        justification: 'Bayview is closer (4m vs 7.5m) but lacks an active 24/7 Primary PCI Cath Lab. St. Jude has active Cath Lab, 3 available CCU beds, and zero diversion.'
      },
      alternativeHospitals: [
        { id: 'HOSP_03', name: 'Metro Health University', matchScore: 62, note: 'On diversion status; secondary backup' }
      ]
    },
    promptExcerpt: `You are the Bed-Matching Agent. Analyze patient requirements vs candidate hospital capabilities. Prioritize definitive clinical capability over marginal proximity differences when clinical tier is Red. Output JSON.`,
    keyCapabilities: [
      'Multi-factor optimization (ETA, capability, bed count, diversion)',
      'Clinical specialty validation (Cath Lab, Stroke Center, Burn Unit)',
      'Prevents secondary inter-facility transfers by routing right the first time',
      'Real-time automated bed lock protocol initiation'
    ],
    latencyMs: 380,
    tokensAvg: 390,
    iconName: 'Building2'
  },
  {
    id: 'routing-agent',
    name: 'Routing Agent',
    shortName: 'Routing (OSRM)',
    role: 'Geospatial Driving Matrix & Emergency Corridor Routing',
    model: 'gemini-3.5-flash + OSRM',
    modelBadgeColor: 'from-cyan-500 to-blue-600',
    tagline: 'Real driving distance and live traffic ETA formatting via OSRM engine.',
    description: 'Queries the open-source Open Source Routing Machine (OSRM) engine for exact street-level road networks, turn-by-turn vectors, emergency siren speed adjustments, and traffic corridor bottlenecks.',
    clinicalPurpose: 'Provides sub-second precision on ambulance travel times to ensure the receiving surgical team is in scrubs before the ambulance rolls through bay doors.',
    inputDescription: 'Live EMS vehicle geocoordinates, destination hospital geocoordinates, vehicle class (Ambulance with siren vs standard transport), and current road network constraints.',
    outputDescription: 'Exact road distance in kilometers, estimated travel time with emergency siren offset, optimal turn-by-turn waypoints, and alternative emergency corridors.',
    inputSample: {
      origin: { lat: 37.7749, lng: -122.4194, label: 'EMS Unit 42 (Market & 4th)' },
      destination: { lat: 37.7885, lng: -122.4072, label: 'St. Jude Regional Trauma Bay' },
      emergencyPriority: 'CODE_3_LIGHTS_AND_SIRENS',
      osrmRawMatrix: { distanceMeters: 4180, durationSeconds: 450 }
    },
    outputSample: {
      drivingDistanceKm: 4.18,
      estimatedMinutes: 5.8,
      sirenTimeSavedMinutes: 1.7,
      optimalCorridor: 'Mission St -> 5th St Expressway -> Trauma Bay North Entrance',
      trafficCondition: 'Moderate congestion mitigated via emergency siren clearance',
      estimatedArrivalTimestamp: '2025-02-14T18:32:48Z'
    },
    promptExcerpt: `You are the LifeLine Routing Agent. Format and calibrate real-time OSRM routing data for emergency ambulance operations. Calculate exact Code-3 travel time windows and bottleneck contingencies.`,
    keyCapabilities: [
      'Real OpenStreetMap street network integration',
      'OSRM sub-second table and route calculation',
      'Code 3 emergency siren time calibration model',
      'Hospital ambulance entrance GPS routing'
    ],
    latencyMs: 190,
    tokensAvg: 220,
    iconName: 'Navigation'
  },
  {
    id: 'briefing-agent',
    name: 'Briefing Agent',
    shortName: 'Briefing',
    role: 'Plain-Language SBAR Clinical Trauma Briefing',
    model: 'gemini-3.5-flash',
    modelBadgeColor: 'from-amber-500 to-orange-600',
    tagline: 'Generates structured SBAR pre-arrival handoffs for emergency surgical & nursing teams.',
    description: 'Synthesizes complex, fast-moving EMS telemetry, vitals progression, NEWS2 score, and vehicle ETA into an instant, plain-language SBAR (Situation, Background, Assessment, Recommendation) trauma briefing delivered directly to the receiving hospital.',
    clinicalPurpose: 'Eliminates illegible handwritten notes, garbled radio static, and verbal telephone miscommunications. The trauma team reads an executive clinical brief 5+ minutes prior to patient arrival.',
    inputDescription: 'Patient demographics, mechanism of injury / complaint, serial vitals, calculated NEWS2, medications given by paramedics, ETA, and matched receiving unit.',
    outputDescription: 'Formatted SBAR clinical brief, bulleted trauma checklist, red-flag alerts, and equipment pre-stage recommendations.',
    inputSample: {
      patient: '63yo M',
      eta: '5.8 minutes',
      news2: 8,
      vitalsTrend: 'BP dropping from 104/65 to 88/54; HR 118 regular',
      interventionsEnRoute: 'Aspirin 325mg PO, Heparin 5000U IV bolus, 2L O2 via nasal cannula, 18G IV established left antecubital',
      destination: 'St. Jude Hospital - Cath Lab 2'
    },
    outputSample: {
      sbarBrief: {
        situation: '63yo male with acute Anterior STEMI presenting with cardiogenic shock risk. ETA 5.8 mins to Cath Lab 2.',
        background: 'Acute onset substernal chest pressure with radiation to jaw. No prior CABG or PCI history.',
        assessment: 'NEWS2 of 8. Hypotensive (88/54) and tachycardic (118). ST elevation in V1-V4. High risk of rapid hemodynamic collapse.',
        recommendation: 'Direct bypass of ED triage to Cath Lab 2. Pre-stage Norepinephrine infusion line, activate interventional team, and prepare for immediate angiography/stenting.'
      },
      preArrivalChecklist: ['Cath Lab Team In Scrubs', 'Defibrillator Pads Pre-opened', 'Norepinephrine & Dopamine Pre-drawn', 'Blood Bank Type & Cross Match Queued']
    },
    promptExcerpt: `You are the LifeLine Clinical Briefing Agent. Convert raw telemetry and clinical triage into a world-class SBAR handoff. Keep language crisp, authoritative, and actionable for trauma leaders.`,
    keyCapabilities: [
      'Standardized SBAR clinical handoff format',
      'Highlights critical vital trends (e.g. widening pulse pressure, MAP drops)',
      'Recommends immediate bedside equipment pre-staging',
      'Syncs directly to hospital receiving monitors & mobile pagers'
    ],
    latencyMs: 420,
    tokensAvg: 410,
    iconName: 'FileText'
  },
  {
    id: 'report-agent',
    name: 'Report Agent',
    shortName: 'Report (Gov)',
    role: 'Government Authority AI Daily Summaries & Telemetry Aggregation',
    model: 'gemini-3.5-flash',
    modelBadgeColor: 'from-purple-500 to-pink-600',
    tagline: 'Aggregates municipal emergency dispatches, hospital stress index, and system bottlenecks.',
    description: 'Powers the Government & Health Authority dashboard by crunching thousands of daily dispatch logs, hospital diversion alerts, bed occupancy spikes, and mutual aid requests into executive operational intelligence.',
    clinicalPurpose: 'Provides public health officials and emergency medical directors with actionable situational awareness, identifying regional ICU shortages, ambulance offload delays, and surge patterns.',
    inputDescription: 'Aggregated 24-hour dispatch logs, hospital bed turnover numbers, regional diversion hours, average dispatch latencies, and mutual aid resource requests.',
    outputDescription: 'Executive public health daily brief, critical bottleneck index, regional hospital stress heatmap summary, and policy recommendations.',
    inputSample: {
      region: 'Metropolitan EMS Region 4',
      date: '2025-02-14',
      totalDispatches: 247,
      averageDispatchTime: '1.9 seconds',
      hospitalDiversionsCount: 3,
      cathLabUtilizationPct: 88,
      pediatricIcuOccupancyPct: 94
    },
    outputSample: {
      executiveSummary: 'Region 4 operated at High Surge Capacity over the last 24h. 247 total dispatches completed with zero telephonic bottleneck delays (average AI dispatch latency: 1.9s).',
      criticalAlerts: [
        'Pediatric ICU beds reached 94% capacity across Region 4; triggered voluntary pediatric surge protocols at St. Jude and Metro General.',
        'Metro West Hospital placed on temporary diversion for 90 minutes due to power generator testing; traffic re-routed seamlessly by Bed-Matching Agent.'
      ],
      systemEfficiencyScore: 98.4,
      policyRecommendations: 'Consider pre-positioning mutual-aid pediatric transport units along Northern corridor between 18:00-22:00.'
    },
    promptExcerpt: `You are the LifeLine Report Agent for Public Health Authorities. Analyze the daily regional emergency logs. Highlight systemic bottlenecks, bed utilization spikes, and provide actionable municipal recommendations.`,
    keyCapabilities: [
      'Regional hospital capacity stress modeling',
      'Ambulance offload delay (wall time) tracking',
      'Automated government compliance & audit generation',
      'Surge prediction and mutual-aid trigger suggestions'
    ],
    latencyMs: 820,
    tokensAvg: 650,
    iconName: 'BarChart3'
  },
  {
    id: 'resource-agent',
    name: 'Resource & Request Agent',
    shortName: 'Resource (Donor)',
    role: 'Inter-Facility Critical Resource & Donor Logistics Matching',
    model: 'gemini-3.5-flash',
    modelBadgeColor: 'from-rose-500 to-red-600',
    tagline: 'Matches emergency blood bank reserves, rare antivenom, ECMO circuits, and donor transfers.',
    description: 'Monitors critical resource deficits across regional facilities and autonomously matches inter-hospital transfer requests with available donors, central blood banks, and specialized emergency equipment.',
    clinicalPurpose: 'Ensures no trauma center runs out of O-negative blood, ECMO circuits, or specialized surgical gear during mass casualty incidents by automating logistics routing.',
    inputDescription: 'Hospital supply deficit requests, regional blood bank inventory levels, donor availability schedules, and transit time limits.',
    outputDescription: 'Optimized transfer logistics order, cold-chain transport protocol, matched donor/supplier facility, and live dispatch coordination.',
    inputSample: {
      requestingHospital: 'St. Jude Trauma Center',
      resourceNeeded: '6 Units O-Negative PRBC (Packed Red Blood Cells) for Active Massive Transfusion Protocol',
      urgency: 'STAT_CRITICAL',
      localStock: '1 Unit Remaining'
    },
    outputSample: {
      matchedSupplier: 'Metropolitan Central Blood Bank (Depot 3)',
      availableStock: '24 Units O-Neg',
      transferRouteEta: '8.2 minutes via Medical Drone / Priority Courier',
      logisticsId: 'RES-TX-8821',
      coldChainRequirements: '1°C - 6°C validated refrigerated transport box #4',
      status: 'DISPATCHED_IN_TRANSIT'
    },
    promptExcerpt: `You are the LifeLine Resource & Logistics Agent. Match critical supply deficits with nearest capable regional suppliers with minimal cold-chain transit time.`,
    keyCapabilities: [
      'Stat blood bank inventory balancing',
      'Medical drone & rapid courier coordination',
      'Massive transfusion protocol resource safeguarding',
      'Inter-hospital mutual aid ledger verification'
    ],
    latencyMs: 350,
    tokensAvg: 310,
    iconName: 'Boxes'
  }
];
