export type ScreenType = 'dashboard' | 'contacts' | 'profile' | 'settings' | 'active-sos';

export type AlertSeverity = 'critical' | 'moderate' | 'mild';

export interface VitalsData {
  heartRate: number;
  respiratoryRate: number;
  systolicBp: number;
  spo2: number;
  temperatureC: number;
  consciousness: 'alert' | 'voice' | 'pain' | 'unresponsive';
}

export interface MedicalProfile {
  fullName: string;
  dob: string;
  age: number;
  gender: string;
  bloodType: string;
  weightKg: number;
  heightCm: number;
  organDonor: boolean;
  allergies: string[];
  conditions: string[];
  medications: Array<{ name: string; dosage: string; frequency: string }>;
  emergencyNotes: string;
  primaryPhysician: {
    name: string;
    hospital: string;
    phone: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
  };
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  priority: 1 | 2 | 3;
  isPrimary: boolean;
  notifySms: boolean;
  notifyCall: boolean;
  status?: 'idle' | 'notifying' | 'delivered' | 'acknowledged';
}

export interface DispatchedHospital {
  name: string;
  distanceKm: number;
  etaMinutes: number;
  specialty: string;
  address: string;
  phone: string;
}

export interface ActiveSosState {
  isActive: boolean;
  isCountdown: boolean;
  countdownSeconds: number;
  category: string;
  triggerTime: string | null;
  location: {
    lat: number;
    lng: number;
    address: string;
    accuracyMeters: number;
  };
  vitals: VitalsData;
  hospital: DispatchedHospital | null;
  triageSeverity: AlertSeverity;
  news2Score: number;
  sbarBrief: string;
  timeline: Array<{
    id: string;
    time: string;
    title: string;
    description: string;
    status: 'complete' | 'in-progress' | 'pending';
  }>;
}

export interface UserSettings {
  fallDetection: boolean;
  autoLocationSharing: boolean;
  countdownDuration: number;
  sirenAudioEnabled: boolean;
  strobeFlashEnabled: boolean;
  voiceActivation: boolean;
  backendApiUrl: string;
  highContrast: boolean;
}
