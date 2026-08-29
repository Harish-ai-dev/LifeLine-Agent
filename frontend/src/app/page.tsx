'use client';

import React, { useState } from 'react';
import { DashboardProvider, useDashboard } from '../context/DashboardContext';
import { PortalHeader } from '../components/dashboard/PortalHeader';
import { HospitalDashboard } from '../components/hospital/HospitalDashboard';
import { AuthorityDashboard } from '../components/authority/AuthorityDashboard';
import { DonorPortal } from '../components/donor/DonorPortal';
import { EmergencySimulatorModal } from '../components/simulator/EmergencySimulatorModal';

// Patient App Views for companion mode
import { Header as PatientHeader } from '../components/layout/Header';
import { Navigation as PatientNav } from '../components/layout/Navigation';
import { DashboardScreen as PatientDashboard } from '../components/dashboard/DashboardScreen';
import { ContactsScreen as PatientContacts } from '../components/contacts/ContactsScreen';
import { MedicalProfileScreen as PatientProfile } from '../components/profile/MedicalProfileScreen';
import { SettingsScreen as PatientSettings } from '../components/settings/SettingsScreen';
import { ActiveAlertScreen as PatientActiveSos } from '../components/sos/ActiveAlertScreen';

import {
  ScreenType,
  MedicalProfile,
  EmergencyContact,
  UserSettings,
  ActiveSosState,
} from '../types';
import {
  INITIAL_MEDICAL_PROFILE,
  INITIAL_EMERGENCY_CONTACTS,
  INITIAL_SETTINGS,
  DEFAULT_VITALS,
} from '../data/mockData';

function MainAppShell() {
  const { portalView, setPortalView, triggerSimulatedAlert } = useDashboard();
  const [showSimulator, setShowSimulator] = useState(false);

  // Patient Companion App State
  const [patientScreen, setPatientScreen] = useState<ScreenType>('dashboard');
  const [profile, setProfile] = useState<MedicalProfile>(INITIAL_MEDICAL_PROFILE);
  const [contacts, setContacts] = useState<EmergencyContact[]>(INITIAL_EMERGENCY_CONTACTS);
  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);

  const [sosState, setSosState] = useState<ActiveSosState>({
    isActive: false,
    isCountdown: false,
    countdownSeconds: 5,
    category: 'Cardiac / Chest Pain',
    triggerTime: null,
    location: {
      lat: 19.0178,
      lng: 72.8478,
      address: 'Dadar Central Station Western Gate, Senapati Bapat Marg, Mumbai 400013',
      accuracyMeters: 4,
    },
    vitals: DEFAULT_VITALS,
    hospital: null,
    triageSeverity: 'critical',
    news2Score: 11,
    sbarBrief: '',
    timeline: [],
  });

  const handlePatientTriggerSos = (category = 'Cardiac Emergency') => {
    // Injects into hospital & authority dashboard live feed!
    triggerSimulatedAlert('cardiac', 'Dadar Central Station Western Gate, Mumbai', 19.0178, 72.8478);

    setSosState((prev) => ({
      ...prev,
      isActive: true,
      isCountdown: true,
      countdownSeconds: 5,
      category,
    }));
    setPatientScreen('active-sos');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* ── Global Unified Command Portal Header ──────────────────────────── */}
      <PortalHeader onOpenSimulator={() => setShowSimulator(true)} />

      {/* ── View Switcher Bar for Mobile / Compact Screens ───────────────── */}
      <div className="lg:hidden bg-slate-900 text-white px-3 py-2 flex items-center justify-around border-b border-slate-800 text-xs font-bold gap-1 overflow-x-auto">
        <button
          onClick={() => setPortalView('hospital')}
          className={`py-1.5 px-3 rounded-lg shrink-0 ${
            portalView === 'hospital' ? 'bg-sky-600 text-white' : 'text-slate-400'
          }`}
        >
          🏥 Hospital Console
        </button>
        <button
          onClick={() => setPortalView('authority')}
          className={`py-1.5 px-3 rounded-lg shrink-0 ${
            portalView === 'authority' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          🏛️ Government Oversight
        </button>
        <button
          onClick={() => setPortalView('donor')}
          className={`py-1.5 px-3 rounded-lg shrink-0 ${
            portalView === 'donor' ? 'bg-rose-600 text-white' : 'text-slate-400'
          }`}
        >
          🩸 Donor Network
        </button>
        <button
          onClick={() => setPortalView('patient-simulator')}
          className={`py-1.5 px-3 rounded-lg shrink-0 ${
            portalView === 'patient-simulator' ? 'bg-emerald-600 text-white' : 'text-slate-400'
          }`}
        >
          📱 Patient App
        </button>
      </div>

      {/* ── Main Dashboard Content Area ───────────────────────────────────── */}
      <main className="flex-1 p-3 sm:p-6 lg:p-8">
        {portalView === 'hospital' && <HospitalDashboard />}

        {portalView === 'authority' && <AuthorityDashboard />}

        {portalView === 'donor' && <DonorPortal />}

        {portalView === 'patient-simulator' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 flex items-center justify-between">
              <div>
                <strong>📱 Patient Mobile Companion Mode Active:</strong> Triggering an SOS here immediately dispatches alerts to the Hospital Console & Government Authority Radar.
              </div>
              <button
                onClick={() => setPortalView('hospital')}
                className="py-1 px-3 bg-emerald-700 text-white rounded-lg font-bold"
              >
                Back to Hospital
              </button>
            </div>

            <PatientDashboard
              profile={profile}
              contacts={contacts}
              onTriggerSos={handlePatientTriggerSos}
              onNavigate={setPatientScreen}
              locationAddress={sosState.location.address}
              locationAccuracy={4}
            />

            {sosState.isActive && (
              <PatientActiveSos
                sosState={sosState}
                profile={profile}
                contacts={contacts}
                onCancelCountdown={() => setSosState((p) => ({ ...p, isActive: false, isCountdown: false }))}
                onResolveSos={() => setSosState((p) => ({ ...p, isActive: false, isCountdown: false }))}
              />
            )}
          </div>
        )}
      </main>

      {/* ── Crisis Simulator Modal ────────────────────────────────────────── */}
      {showSimulator && <EmergencySimulatorModal onClose={() => setShowSimulator(false)} />}
    </div>
  );
}

export default function Home() {
  return (
    <DashboardProvider>
      <MainAppShell />
    </DashboardProvider>
  );
}
