import { MedicalProfile, EmergencyContact, UserSettings, VitalsData } from '../types';

export const INITIAL_MEDICAL_PROFILE: MedicalProfile = {
  fullName: 'Arjun Mehta',
  dob: '1984-06-15',
  age: 42,
  gender: 'Male',
  bloodType: 'O+',
  weightKg: 78,
  heightCm: 176,
  organDonor: true,
  allergies: ['Penicillin (Anaphylaxis)', 'Shellfish / Iodine (Severe)', 'Latex (Mild)'],
  conditions: ['Type 2 Diabetes', 'Mild Hypertension', 'Asthma (Exercise-induced)'],
  medications: [
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily with meals' },
    { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily (morning)' },
    { name: 'Albuterol Inhaler', dosage: '90mcg', frequency: 'As needed for shortness of breath' },
  ],
  emergencyNotes: 'Carries EpiPen in backpack. Has coronary stent implanted in 2023 at Lilavati Hospital.',
  primaryPhysician: {
    name: 'Dr. Rajesh Deshmukh, MD (Cardiology)',
    hospital: 'Lilavati Hospital & Research Centre, Mumbai',
    phone: '+91 98201 54321',
  },
  insurance: {
    provider: 'Star Health Premier Care',
    policyNumber: 'SH-MUM-884920-A',
  },
};

export const INITIAL_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'c-1',
    name: 'Priya Mehta',
    relationship: 'Spouse',
    phone: '+91 98200 11223',
    email: 'priya.mehta@example.com',
    priority: 1,
    isPrimary: true,
    notifySms: true,
    notifyCall: true,
    status: 'idle',
  },
  {
    id: 'c-2',
    name: 'Dr. Rajesh Deshmukh',
    relationship: 'Primary Cardiologist',
    phone: '+91 98201 54321',
    email: 'dr.deshmukh@lilavati.org',
    priority: 2,
    isPrimary: false,
    notifySms: true,
    notifyCall: true,
    status: 'idle',
  },
  {
    id: 'c-3',
    name: 'Rohan Mehta',
    relationship: 'Brother',
    phone: '+91 98199 44556',
    email: 'rohan.m@example.com',
    priority: 3,
    isPrimary: false,
    notifySms: true,
    notifyCall: false,
    status: 'idle',
  },
];

export const INITIAL_SETTINGS: UserSettings = {
  fallDetection: true,
  autoLocationSharing: true,
  countdownDuration: 5,
  sirenAudioEnabled: false,
  strobeFlashEnabled: false,
  voiceActivation: true,
  backendApiUrl: 'http://localhost:8000',
  highContrast: false,
};

export const DEFAULT_VITALS: VitalsData = {
  heartRate: 88,
  respiratoryRate: 18,
  systolicBp: 122,
  spo2: 98,
  temperatureC: 37.0,
  consciousness: 'alert',
};

export const CRISIS_CATEGORIES = [
  {
    id: 'cardiac',
    label: 'Cardiac / Chest Pain',
    icon: 'HeartPulse',
    severity: 'critical' as const,
    description: 'Crushing chest pressure, left arm pain, severe palpitations',
    vitals: {
      heartRate: 124,
      respiratoryRate: 24,
      systolicBp: 86,
      spo2: 91,
      temperatureC: 38.2,
      consciousness: 'alert' as const,
    },
  },
  {
    id: 'trauma',
    label: 'Fall / High Trauma',
    icon: 'Activity',
    severity: 'critical' as const,
    description: 'Vehicle accident, severe fall, bleeding, head trauma',
    vitals: {
      heartRate: 132,
      respiratoryRate: 28,
      systolicBp: 78,
      spo2: 89,
      temperatureC: 36.1,
      consciousness: 'voice' as const,
    },
  },
  {
    id: 'breathing',
    label: 'Breathing Distress',
    icon: 'Wind',
    severity: 'moderate' as const,
    description: 'Severe asthma, choking, wheezing, gasping for air',
    vitals: {
      heartRate: 108,
      respiratoryRate: 26,
      systolicBp: 115,
      spo2: 92,
      temperatureC: 37.4,
      consciousness: 'alert' as const,
    },
  },
  {
    id: 'general',
    label: 'General Emergency',
    icon: 'AlertTriangle',
    severity: 'moderate' as const,
    description: 'Sudden collapse, acute abdominal pain, unconsciousness',
    vitals: {
      heartRate: 96,
      respiratoryRate: 20,
      systolicBp: 110,
      spo2: 96,
      temperatureC: 38.0,
      consciousness: 'alert' as const,
    },
  },
];
