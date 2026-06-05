/**
 * Supabase Helper Functions for Caresolis
 * Provides type-safe wrappers around API calls to backend
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050/api`;

// ==================== HELPER FUNCTIONS ====================

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API call failed: ${response.statusText}`);
  }

  return response.json();
}

// ==================== NOTIFICATIONS ====================

export interface Notification {
  id: string;
  type: 'medication' | 'escalation' | 'system' | 'safety' | 'routine' | 'environmental' | 'device';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  urgent: boolean;
  actionUrl?: string;
  patientId?: string;
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  try {
    const data = await apiCall(`/notifications/${userId}`);
    return data.notifications || [];
  } catch (error) {
    // Silent fallback - expected when notification API endpoint is initializing
    return [];
  }
}

export async function addNotification(userId: string, notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<void> {
  try {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    await apiCall(`/notifications/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ notification: newNotification }),
    });
  } catch (error) {
    console.error('Error adding notification:', error);
  }
}

export async function markNotificationRead(userId: string, notificationId: string): Promise<void> {
  try {
    await apiCall(`/notifications/${userId}/${notificationId}/read`, {
      method: 'PUT',
    });
  } catch (error) {
    console.error('Error marking notification read:', error);
  }
}

export async function deleteNotification(userId: string, notificationId: string): Promise<void> {
  try {
    await apiCall(`/notifications/${userId}/${notificationId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
}

// ==================== PATIENT PROFILES ====================

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  dateOfBirth: string;
  medicalRecordNumber: string;
  photoUrl?: string;
  primaryPhysician: {
    name: string;
    specialty: string;
    phone: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
  allergies: string[];
  conditions: string[];
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  medicalHistory: Array<{
    date: string;
    type: 'hospitalization' | 'diagnosis' | 'procedure' | 'medication_change';
    description: string;
    provider?: string;
  }>;
}

export async function getPatientProfile(patientId: string): Promise<PatientProfile | null> {
  try {
    const data = await apiCall(`/patient/${patientId}/profile`);
    return data.profile;
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    return null;
  }
}

export async function savePatientProfile(profile: PatientProfile): Promise<void> {
  try {
    await apiCall(`/patient/${profile.id}/profile`, {
      method: 'POST',
      body: JSON.stringify({ profile }),
    });
  } catch (error) {
    console.error('Error saving patient profile:', error);
  }
}

// ==================== CALENDAR EVENTS ====================

export interface CalendarEvent {
  id: string;
  patientId: string;
  title: string;
  date: string;
  time: string;
  type: 'medication' | 'appointment' | 'visit' | 'other';
  description?: string;
  status: 'pending' | 'completed' | 'missed';
}

export async function getCalendarEvents(patientId: string, month: string): Promise<CalendarEvent[]> {
  // TODO: Implement API endpoint
  return [];
}

export async function addCalendarEvent(event: Omit<CalendarEvent, 'id'>): Promise<void> {
  // TODO: Implement API endpoint
  console.log('Calendar event would be saved:', event);
}

// ==================== CARE MESSAGES ====================

export interface CareMessage {
  id: string;
  careCircleId: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'caregiver' | 'nurse' | 'physician' | 'family';
  message: string;
  timestamp: string;
}

export async function getCareMessages(careCircleId: string): Promise<CareMessage[]> {
  // TODO: Implement API endpoint
  return [];
}

export async function addCareMessage(message: Omit<CareMessage, 'id' | 'timestamp'>): Promise<void> {
  // TODO: Implement API endpoint
  console.log('Care message would be saved:', message);
}

// ==================== SHIFT NOTES ====================

export interface ShiftNote {
  id: string;
  patientId: string;
  caregiverId: string;
  caregiverName: string;
  date: string;
  shift: 'morning' | 'afternoon' | 'evening' | 'night';
  notes: string;
  vitals?: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
  };
  timestamp: string;
}

export async function getShiftNotes(patientId: string): Promise<ShiftNote[]> {
  // TODO: Implement API endpoint
  return [];
}

export async function addShiftNote(note: Omit<ShiftNote, 'id' | 'timestamp'>): Promise<void> {
  // TODO: Implement API endpoint
  console.log('Shift note would be saved:', note);
}

// ==================== VIDEO CALLS ====================

export interface VideoCall {
  id: string;
  patientId: string;
  participant: string;
  startTime: string;
  endTime?: string;
  duration?: string;
  type: 'video' | 'audio';
  billable: boolean;
  cptCode?: string;
  recordingUrl?: string;
}

export async function getVideoCallHistory(patientId: string): Promise<VideoCall[]> {
  // TODO: Implement API endpoint
  return [];
}

export async function saveVideoCall(call: VideoCall): Promise<void> {
  // TODO: Implement API endpoint
  console.log('Video call would be saved:', call);
}

// ==================== 2FA SETTINGS ====================

export interface TwoFactorSettings {
  userId: string;
  enabled: boolean;
  method: 'authenticator' | 'sms' | 'email';
  phoneNumber?: string;
  email?: string;
  secretKey?: string;
  backupCodes: string[];
  createdAt: string;
  lastUsed?: string;
}

export async function get2FASettings(userId: string): Promise<TwoFactorSettings | null> {
  // TODO: Implement API endpoint
  return null;
}

export async function save2FASettings(settings: TwoFactorSettings): Promise<void> {
  // TODO: Implement API endpoint
  console.log('2FA settings would be saved:', settings);
}

// ==================== ANALYTICS DATA ====================

export interface AnalyticsData {
  patientId: string;
  period: string; // YYYY-MM
  adherenceRate: number;
  onTimeDoses: number;
  totalDoses: number;
  avgResponseTime: number;
  totalEscalations: number;
  dailyAdherence: Array<{
    date: string;
    onTime: number;
    late: number;
    missed: number;
  }>;
  monitoringMinutes: number;
  cptCodes: string[];
}

export async function getAnalyticsData(patientId: string, period: string): Promise<AnalyticsData | null> {
  // TODO: Implement API endpoint
  return null;
}

export async function saveAnalyticsData(data: AnalyticsData): Promise<void> {
  // TODO: Implement API endpoint
  console.log('Analytics data would be saved:', data);
}

// ==================== DEMO DATA SEEDING ====================

export async function seedDemoData(userId: string, patientId: string): Promise<void> {
  console.log('🌱 Seeding demo data for:', { userId, patientId });

  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050/api/seed-demo-data`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ userId, patientId }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to seed demo data');
    }

    const data = await response.json();
    console.log('✅ Demo data seeded successfully!', data);
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  }
}