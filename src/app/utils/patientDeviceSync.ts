/**
 * Patient Device Sync Utility
 * 
 * Handles data synchronization FROM CareSolis (Caregiver App) 
 * TO Patient Device App backend (make-server-2a443375)
 * 
 * CareSolis WRITES data, Patient Device READS data
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';

// Patient Device backend server (different from CareSolis backend)
// Server URL is constructed lazily to avoid initialization issues
function getPatientDeviceServer(): string {
  return `https://${projectId}.supabase.co/functions/v1/make-server-2a443375`;
}

const FETCH_TIMEOUT = 10000; // 10 seconds

/**
 * Fetch with timeout wrapper
 */
async function fetchWithTimeout(
  url: string, 
  options: RequestInit = {}, 
  timeout = FETCH_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface MedicationDose {
  id: string;
  patientId: string;
  patientName: string;
  medicationName: string;
  strength: string;
  scheduledAt: number; // Unix timestamp (milliseconds)
  scheduledTime: string; // Display format (e.g., "2:30 PM")
  priority: 'time_critical' | 'non_time_critical';
  compartmentId: string;
  instructions?: string;
}

export interface MedicationScheduleData {
  doses: MedicationDose[];
  timezone: string;
  updatedAt: number;
}

export interface CaregiverContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  photoUrl?: string;
  preferredContactMethod?: 'phone' | 'sms' | 'email';
  availableHours?: {
    start: string;
    end: string;
  };
  timezone?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  priority: number;
}

export interface CaregiverContactData {
  primary: CaregiverContact;
  backup: CaregiverContact[];
  emergencyContacts: EmergencyContact[];
  updatedAt: number;
}

export interface MedicationCompartment {
  id: string;
  medicationName: string;
  strength: string;
  pillCount: number;
  maxCapacity: number;
  lastRefilled: number; // Unix timestamp
  lastDispensed?: number; // Unix timestamp
  expirationDate?: string; // ISO date string
}

export interface MedicationInventoryData {
  compartments: MedicationCompartment[];
  lowStockThreshold: number; // Days of medication remaining
  lastRefill: number;
  updatedAt: number;
}

export interface DeviceStatus {
  state: 'IDLE' | 'DOSE_READY' | 'ACTIVE' | 'WARNING' | 'ESCALATION';
  chuteOpen: boolean;
  reservoirCount: number;
  elapsedSeconds: number;
  lastHeartbeat: number;
  isOnline: boolean;
  batteryLevel: number;
  isCharging: boolean;
  signalStrength: 'strong' | 'medium' | 'weak' | 'none';
  updatedAt: number;
}

// ============================================================================
// SYNC FUNCTIONS
// ============================================================================

/**
 * 1. MEDICATION SCHEDULE SYNC
 * Push medication schedule to Patient Device
 */
export async function syncMedicationSchedule(
  patientId: string,
  scheduleData: MedicationScheduleData
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[PatientDeviceSync] 📅 Syncing medication schedule for patient ${patientId}`, scheduleData);

    const response = await fetchWithTimeout(
      `${getPatientDeviceServer()}/patient/${patientId}/schedule`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(scheduleData)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[PatientDeviceSync] ❌ Schedule sync failed:`, errorText);
      return { success: false, error: errorText };
    }

    const result = await response.json();
    console.log(`[PatientDeviceSync] ✅ Schedule synced successfully:`, result);
    return { success: true };
  } catch (error) {
    console.error(`[PatientDeviceSync] ❌ Schedule sync error:`, error);
    return { success: false, error: String(error) };
  }
}

/**
 * 2. CAREGIVER CONTACT INFO SYNC
 * Push caregiver contact information to Patient Device
 */
export async function syncCaregiverContacts(
  patientId: string,
  contactData: CaregiverContactData
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[PatientDeviceSync] 👥 Syncing caregiver contacts for patient ${patientId}`, contactData);

    const response = await fetchWithTimeout(
      `${getPatientDeviceServer()}/patient/${patientId}/caregivers`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(contactData)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[PatientDeviceSync] ❌ Contacts sync failed:`, errorText);
      return { success: false, error: errorText };
    }

    const result = await response.json();
    console.log(`[PatientDeviceSync] ✅ Contacts synced successfully:`, result);
    return { success: true };
  } catch (error) {
    console.error(`[PatientDeviceSync] ❌ Contacts sync error:`, error);
    return { success: false, error: String(error) };
  }
}

/**
 * 3. MEDICATION INVENTORY SYNC
 * Push medication inventory to Patient Device
 */
export async function syncMedicationInventory(
  patientId: string,
  inventoryData: MedicationInventoryData
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[PatientDeviceSync] 💊 Syncing medication inventory for patient ${patientId}`, inventoryData);

    const response = await fetchWithTimeout(
      `${getPatientDeviceServer()}/patient/${patientId}/inventory`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(inventoryData)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[PatientDeviceSync] ❌ Inventory sync failed:`, errorText);
      return { success: false, error: errorText };
    }

    const result = await response.json();
    console.log(`[PatientDeviceSync] ✅ Inventory synced successfully:`, result);
    return { success: true };
  } catch (error) {
    console.error(`[PatientDeviceSync] ❌ Inventory sync error:`, error);
    return { success: false, error: String(error) };
  }
}

/**
 * 4. DEVICE STATUS MONITORING (READ-ONLY)
 * Read device status from Patient Device
 */
export async function getDeviceStatus(
  patientId: string
): Promise<{ success: boolean; data?: DeviceStatus; error?: string }> {
  try {
    console.log(`[PatientDeviceSync] 📊 Fetching device status for patient ${patientId}`);

    const response = await fetchWithTimeout(
      `${getPatientDeviceServer()}/patient/${patientId}/device-status`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[PatientDeviceSync] ❌ Device status fetch failed:`, errorText);
      return { success: false, error: errorText };
    }

    const result = await response.json();
    console.log(`[PatientDeviceSync] ✅ Device status fetched:`, result);
    return { success: true, data: result.data };
  } catch (error) {
    console.error(`[PatientDeviceSync] ❌ Device status fetch error:`, error);
    return { success: false, error: String(error) };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate sample medication schedule for testing
 */
export function generateSampleSchedule(
  patientId: string,
  patientName: string,
  timezone: string = 'America/Los_Angeles'
): MedicationScheduleData {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  const doses: MedicationDose[] = [];

  // Create 7 days of medication schedule (3 doses per day)
  for (let day = 0; day < 7; day++) {
    const baseDate = now + (day * oneDayMs);

    // Morning dose (9:00 AM)
    doses.push({
      id: `dose-${day}-morning`,
      patientId,
      patientName,
      medicationName: 'Lisinopril',
      strength: '10mg',
      scheduledAt: baseDate + (9 * 60 * 60 * 1000),
      scheduledTime: '9:00 AM',
      priority: 'time_critical',
      compartmentId: 'compartment-1',
      instructions: 'Take with water'
    });

    // Afternoon dose (2:30 PM)
    doses.push({
      id: `dose-${day}-afternoon`,
      patientId,
      patientName,
      medicationName: 'Metformin',
      strength: '500mg',
      scheduledAt: baseDate + (14.5 * 60 * 60 * 1000),
      scheduledTime: '2:30 PM',
      priority: 'time_critical',
      compartmentId: 'compartment-2',
      instructions: 'Take with food'
    });

    // Evening dose (9:00 PM)
    doses.push({
      id: `dose-${day}-evening`,
      patientId,
      patientName,
      medicationName: 'Atorvastatin',
      strength: '20mg',
      scheduledAt: baseDate + (21 * 60 * 60 * 1000),
      scheduledTime: '9:00 PM',
      priority: 'non_time_critical',
      compartmentId: 'compartment-3',
      instructions: 'Take at bedtime'
    });
  }

  return {
    doses,
    timezone,
    updatedAt: Date.now()
  };
}

/**
 * Generate sample caregiver contacts for testing
 */
export function generateSampleContacts(): CaregiverContactData {
  return {
    primary: {
      id: 'cg-001',
      name: 'Sarah Johnson',
      relationship: 'Daughter',
      phone: '+1-555-123-4567',
      email: 'sarah@example.com',
      preferredContactMethod: 'phone',
      availableHours: {
        start: '09:00',
        end: '17:00'
      },
      timezone: 'America/New_York'
    },
    backup: [
      {
        id: 'cg-002',
        name: 'Michael Johnson',
        relationship: 'Son',
        phone: '+1-555-987-6543',
        email: 'michael@example.com',
        preferredContactMethod: 'sms',
        availableHours: {
          start: '18:00',
          end: '22:00'
        },
        timezone: 'America/Los_Angeles'
      }
    ],
    emergencyContacts: [
      {
        id: 'em-001',
        name: 'Dr. Smith',
        relationship: 'Primary Care Physician',
        phone: '+1-555-111-2222',
        priority: 1
      },
      {
        id: 'em-002',
        name: 'Lisa Johnson',
        relationship: 'Neighbor',
        phone: '+1-555-333-4444',
        priority: 2
      }
    ],
    updatedAt: Date.now()
  };
}

/**
 * Generate sample medication inventory for testing
 */
export function generateSampleInventory(): MedicationInventoryData {
  const now = Date.now();

  return {
    compartments: [
      {
        id: 'compartment-1',
        medicationName: 'Lisinopril',
        strength: '10mg',
        pillCount: 28,
        maxCapacity: 30,
        lastRefilled: now,
        expirationDate: '2025-12-31'
      },
      {
        id: 'compartment-2',
        medicationName: 'Metformin',
        strength: '500mg',
        pillCount: 56,
        maxCapacity: 60,
        lastRefilled: now,
        expirationDate: '2026-06-30'
      },
      {
        id: 'compartment-3',
        medicationName: 'Atorvastatin',
        strength: '20mg',
        pillCount: 27,
        maxCapacity: 30,
        lastRefilled: now,
        expirationDate: '2026-03-15'
      }
    ],
    lowStockThreshold: 7,
    lastRefill: now,
    updatedAt: now
  };
}