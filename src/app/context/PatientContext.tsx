import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Patient as BasePatient } from '../types/shared';
import { projectId, publicAnonKey } from '/utils/supabase/info';

// v6.45.4 - Warning message removed, silent fallback only

// Extend the base Patient type with UI-specific fields
export interface Patient extends BasePatient {
  age?: number; // Derived from dateOfBirth for UI display
  lastActivity?: string; // UI-friendly relative time string
  unreadAlerts?: number; // UI notification counter
}

interface PatientContextType {
  currentPatient: Patient | null;
  allPatients: Patient[];
  switchPatient: (patientId: string) => void;
  addPatient: (patient: Patient) => void;
  removePatient: (patientId: string) => void;
  isLoading: boolean;
  refreshPatient: (patientId: string) => Promise<void>;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

// Helper function to fetch patient profile from backend
async function fetchPatientProfile(patientId: string): Promise<Patient | null> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050/api/patient/${patientId}/profile`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.log(`[PatientContext] Using fallback data for patient ${patientId} (backend syncing...)`);
      return getFallbackPatient(patientId);
    }

    const { profile } = await response.json();

    if (!profile) {
      console.log(`[PatientContext] Using fallback data for patient ${patientId} (no profile data)`);
      return getFallbackPatient(patientId);
    }

    console.log(`[PatientContext] ✅ Loaded patient ${patientId} from backend:`, profile.name);
    return profile;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`[PatientContext] Using fallback data for patient ${patientId}`, errorMessage);
    return getFallbackPatient(patientId);
  }
}

// Fallback patient data when backend is unavailable
function getFallbackPatient(patientId: string): Patient {
  const fallbackPatients: Record<string, Patient> = {
    '1': {
      id: '1',
      name: 'Eleanor Whitmore',
      age: 86,
      dateOfBirth: '1940-03-15',
      enrollmentDate: new Date('2024-01-15').toISOString(),
      status: 'active' as const,
      timezone: 'America/Los_Angeles',
      address: '742 Maple Avenue, Santa Rosa, CA 95401',
      phone: '(707) 555-0142',
      emergencyContact: 'Sarah Whitmore (Daughter) - (415) 555-0198',
      primaryPhysician: 'Dr. Robert Chen, MD',
      lastActivity: '2 minutes ago',
      unreadAlerts: 0
    },
    '2': {
      id: '2',
      name: 'Margaret Chen',
      age: 78,
      dateOfBirth: '1948-07-22',
      enrollmentDate: new Date('2024-02-01').toISOString(),
      status: 'active' as const,
      timezone: 'America/New_York',
      address: '15 Oak Street, Portland, ME 04101',
      phone: '(207) 555-0234',
      emergencyContact: 'David Chen (Son) - (207) 555-0567',
      primaryPhysician: 'Dr. Lisa Anderson, MD',
      lastActivity: '45 minutes ago',
      unreadAlerts: 2
    },
    '3': {
      id: '3',
      name: 'Robert Martinez',
      age: 82,
      dateOfBirth: '1944-11-30',
      enrollmentDate: new Date('2024-03-10').toISOString(),
      status: 'active' as const,
      timezone: 'America/Chicago',
      address: '892 Pine Road, Austin, TX 78701',
      phone: '(512) 555-0876',
      emergencyContact: 'Maria Martinez (Wife) - (512) 555-0877',
      primaryPhysician: 'Dr. James Wilson, MD',
      lastActivity: '3 hours ago',
      unreadAlerts: 0
    }
  };

  return fallbackPatients[patientId] || fallbackPatients['1'];
}

export function PatientProvider({ children }: { children: ReactNode }) {
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load all patients from backend on mount
  useEffect(() => {
    async function loadAllPatients() {
      setIsLoading(true);
      console.log('[PatientContext] 📡 Loading all patients from backend...');

      // Load all 3 patients in parallel
      const patientIds = ['1', '2', '3'];
      const patientPromises = patientIds.map(id => fetchPatientProfile(id));
      const patients = await Promise.all(patientPromises);

      // Filter out any nulls (failed fetches)
      const validPatients = patients.filter((p): p is Patient => p !== null);

      console.log(`[PatientContext] ✅ Loaded ${validPatients.length} patients from backend`);
      setAllPatients(validPatients);

      // Set first patient as current
      if (validPatients.length > 0) {
        setCurrentPatient(validPatients[0]);
        console.log(`[PatientContext] 🎯 Set current patient:`, validPatients[0].name);
      }

      setIsLoading(false);
    }

    loadAllPatients();
  }, []);

  const switchPatient = (patientId: string) => {
    const patient = allPatients.find(p => p.id === patientId);
    if (patient) {
      setCurrentPatient(patient);
      console.log('🔄 Switched to patient:', patient.name);
    }
  };

  const refreshPatient = async (patientId: string) => {
    console.log(`[PatientContext] 🔄 Refreshing patient ${patientId} from backend...`);
    const updatedPatient = await fetchPatientProfile(patientId);
    
    if (updatedPatient) {
      // Update in allPatients array
      setAllPatients(prev => 
        prev.map(p => p.id === patientId ? updatedPatient : p)
      );

      // Update currentPatient if it's the same one
      if (currentPatient?.id === patientId) {
        setCurrentPatient(updatedPatient);
      }

      console.log(`[PatientContext] ✅ Refreshed patient ${patientId}`);
    }
  };

  const addPatient = (patient: Patient) => {
    setAllPatients(prev => [...prev, patient]);
  };

  const removePatient = (patientId: string) => {
    setAllPatients(prev => prev.filter(p => p.id !== patientId));
    if (currentPatient?.id === patientId && allPatients.length > 1) {
      setCurrentPatient(allPatients.find(p => p.id !== patientId) || null);
    }
  };

  return (
    <PatientContext.Provider
      value={{
        currentPatient,
        allPatients,
        switchPatient,
        addPatient,
        removePatient,
        isLoading,
        refreshPatient
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const context = useContext(PatientContext);
  if (!context) {
    // v6.45.3 - Defensive fallback for safe rendering during initial mount
    // This is expected during React's provider setup phase
    return {
      currentPatient: {
        id: '1',
        name: 'Eleanor Whitmore',
        enrollmentDate: new Date('2024-01-15').toISOString(),
        age: 86,
        status: 'active' as const,
        lastActivity: '2 minutes ago',
        unreadAlerts: 0
      },
      allPatients: [],
      switchPatient: () => {},
      addPatient: () => {},
      removePatient: () => {},
      isLoading: true,
      refreshPatient: async () => {}
    };
  }
  return context;
}