/**
 * CareSolis Shared Types
 * Copy this file to all three apps (Caregiver, Device, Command Centre)
 * to ensure consistent data structures across the ecosystem.
 */

// ============================================================================
// Base Types
// ============================================================================

export type ISO8601String = string;
export type UUID = string;

// ============================================================================
// Patient & User Types
// ============================================================================

export interface Patient {
  id: UUID;
  name: string;
  dateOfBirth?: string;
  deviceId?: string;
  enrollmentDate: ISO8601String;
  status: 'active' | 'paused' | 'inactive';
  timezone?: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  // TIER 1: Timezone Source of Truth (FDA Compliant)
  timezoneVerifiedAt?: ISO8601String; // Last timezone verification timestamp
  timezoneVerifiedBy?: UUID; // Caregiver who verified
  timezoneSource?: 'manual' | 'environmental' | 'derived'; // How timezone was determined
  // TIER 2: Device-Reported Timezone (Validation Layer)
  deviceTimezone?: string; // Device's OS-detected timezone
  deviceTimezoneLastReported?: ISO8601String; // Last time device reported timezone
  // Timezone Acknowledgments (Shift-based FDA compliance)
  timezoneAcknowledgments?: Array<{
    timestamp: ISO8601String;
    caregiverId: UUID;
    patientTz: string;
    deviceTz: string;
    mismatch: boolean;
    acknowledged: boolean;
  }>;
}

export interface User {
  id: UUID;
  email: string;
  name: string;
  role: 'caregiver' | 'admin' | 'clinician' | 'patient';
  patientId?: UUID; // For patient users
  assignedPatients?: UUID[]; // For caregivers/clinicians
  createdAt: ISO8601String;
}

// ============================================================================
// Interaction & Event Types
// ============================================================================

export type InteractionStatus =
  | 'Scheduled'
  | 'ReminderActive'
  | 'EscalationLevel1'
  | 'EscalationLevel2'
  | 'EscalationLevel3'
  | 'Acknowledged'
  | 'Check-In On Time'
  | 'Check-In Delayed'
  | 'Check-In Not Logged'
  | 'Closed';

export interface EscalationLog {
  timestamp: ISO8601String;
  level: number;
  action: string;
  recipient?: string;
}

export interface InteractionEvent {
  id: UUID;
  patientId: UUID;
  date: string; // YYYY-MM-DD format
  createdAt?: ISO8601String;
  scheduledTime: string; // HH:MM format
  status: InteractionStatus;
  interactionTime: ISO8601String | null;
  acknowledgedTime: ISO8601String | null;
  acknowledgedBy?: string;
  escalationLevel: 0 | 1 | 2 | 3;
  logs: EscalationLog[];
  metadata?: {
    deviceId?: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

// ============================================================================
// Device State Types
// ============================================================================

export type DeviceStatus = 'nominal' | 'pending' | 'escalated' | 'system_fault';

export interface DeviceState {
  status: DeviceStatus;
  lastInteraction: ISO8601String | null;
  nextScheduled: ISO8601String;
  integrityHash: string;
  updatedAt: ISO8601String;
  patientId: UUID;
  metadata?: {
    firmwareVersion?: string;
    batteryLevel?: number;
    signalStrength?: number;
    lastHealthCheck?: ISO8601String;
  };
}

// ============================================================================
// Care Circle Types
// ============================================================================

export interface ContactRecord {
  id: UUID;
  patientId: UUID;
  name: string;
  role: string; // e.g., "Daughter", "Son", "Neighbor", "Clinician"
  phone: string;
  email: string;
  priority: number; // 1 = highest priority
  active: boolean;
  createdAt: ISO8601String;
  updatedAt: ISO8601String;
  notificationPreferences?: {
    sms: boolean;
    email: boolean;
    voice: boolean;
  };
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface TimeSlot {
  id: string;
  time: string; // HH:MM format
  enabled: boolean;
}

export interface ComplexSchedule {
  slots: TimeSlot[];
  appliesTo: string; // e.g., "weekdays", "weekends", "all", "custom"
  customDays?: number[]; // 0 = Sunday, 6 = Saturday
}

export interface VacationMode {
  enabled: boolean;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  enabledBy?: string;
  enabledAt?: ISO8601String;
  reason?: string;
  ipAddress?: string;
}

export interface SystemConfig {
  patientId: UUID;
  schedule: string[] | ComplexSchedule;
  reminderOffset: number; // minutes before scheduled time
  level1Offset: number; // minutes after scheduled time
  level2Offset: number; // minutes after level 1
  level3Offset: number; // minutes after level 2
  gracePeriod: number; // minutes of tolerance for on-time check-ins
  driftThreshold: number; // minutes of routine drift before alert
  vacationMode?: VacationMode;
  timezone?: string;
  updatedAt: ISO8601String;
  updatedBy?: string;
}

// ============================================================================
// Audit & Logging Types
// ============================================================================

export interface AuditLog {
  id: UUID;
  timestamp: ISO8601String;
  actor: string; // User ID or "system"
  action: string; // e.g., "interact", "acknowledge", "update_config"
  details: string;
  patientId?: UUID;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
  };
}

export interface NotificationLog {
  id: UUID;
  timestamp: ISO8601String;
  patientId: UUID;
  to: string; // Phone number or email
  subject: string;
  body: string;
  sent: boolean;
  error?: string;
  contactId?: UUID;
  escalationLevel?: number;
}

// ============================================================================
// Medication Management Types (Service Module)
// ============================================================================

export interface MedicationSchedule {
  id: UUID;
  patientId: UUID;
  medicationName: string;
  dosage: string;
  frequency: string; // e.g., "Daily", "Twice daily", "PRN"
  times: string[]; // HH:MM format
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  active: boolean;
  prescribedBy?: string;
  instructions?: string;
  blisterPackConfig?: {
    packId: string;
    row: number; // 1 or 2 (new 2x25 system)
    column: number; // 1-25
  };
}

export interface MedicationDispenseEvent {
  id: UUID;
  patientId: UUID;
  medicationId: UUID;
  scheduledTime: ISO8601String;
  actualTime: ISO8601String | null;
  status: 'scheduled' | 'dispensed' | 'confirmed' | 'missed' | 'skipped';
  blisterPackSlot?: {
    row: number;
    column: number;
  };
  gateStatus?: {
    gate1: 'clear' | 'blocked';
    gate2: 'clear' | 'blocked';
    gate3: 'clear' | 'blocked';
  };
  confirmedAt?: ISO8601String;
  confirmedBy?: 'patient' | 'caregiver';
}

// ============================================================================
// Environmental Telemetry Types
// ============================================================================

export interface EnvironmentalReading {
  id: UUID;
  patientId: UUID;
  timestamp: ISO8601String;
  temperature?: number; // Celsius
  humidity?: number; // Percentage
  lightLevel?: number; // Lux
  motionDetected?: boolean;
  doorStatus?: 'open' | 'closed';
  metadata?: {
    deviceId?: string;
    sensorType?: string;
  };
}

// ============================================================================
// Stability & Analytics Types
// ============================================================================

export type StabilityStatus = 'stable' | 'minor_drift' | 'significant_drift';

export interface StabilityDataPoint {
  date: string; // YYYY-MM-DD
  avgCheckInTime: string; // HH:MM format
  variance: number; // minutes
  onTimeRate: number; // percentage
  escalationCount: number;
}

export interface StabilityMetrics {
  patientId: UUID;
  period: '7day' | '30day' | '90day';
  score: number; // 0-100
  status: StabilityStatus;
  dataPoints: StabilityDataPoint[];
  calculatedAt: ISO8601String;
}

// ============================================================================
// RPM Billing Types
// ============================================================================

export interface RPMBillingPeriod {
  id: UUID;
  patientId: UUID;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  cptCodes: {
    code: string; // e.g., "99453", "99454", "99457"
    eligible: boolean;
    criteria: string;
    reimbursement: number; // USD
  }[];
  totalMinutes: number;
  totalDays: number;
  totalReimbursement: number; // USD
  status: 'draft' | 'ready_to_bill' | 'submitted' | 'paid';
  generatedAt: ISO8601String;
}

// ============================================================================
// System Health Types
// ============================================================================

export interface SystemHealth {
  system: string; // e.g., "Caresolis_Core_v1"
  status: 'healthy' | 'degraded' | 'fault' | 'unknown';
  integrity: 'verified' | 'corrupted' | 'unknown';
  lastCheck: ISO8601String;
  components?: {
    backend: 'online' | 'offline' | 'degraded';
    database: 'online' | 'offline' | 'degraded';
    timeSync: 'synced' | 'drift_detected' | 'unknown';
    location: 'available' | 'unavailable';
  };
  errors?: string[];
}

// ============================================================================
// Time Synchronization Types
// ============================================================================

export interface TimeSyncStatus {
  isSystemTimeAccurate: boolean;
  driftMs: number;
  lastSyncTime: ISO8601String;
  syncQuality: 'excellent' | 'good' | 'poor';
  warningMessage?: string;
  serverTime?: ISO8601String;
  clientTime?: ISO8601String;
}

// ============================================================================
// Location Types
// ============================================================================

export interface LocationData {
  address: string;
  city: string;
  state: string;
  zip: string;
  timezone: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  updatedAt: ISO8601String;
}

// ============================================================================
// Blister Pack Types (2x25 Pharmacy System)
// ============================================================================

export interface BlisterPackConfig {
  id: UUID;
  patientId: UUID;
  packId: string; // Pharmacy-assigned ID
  deliveryDate: string; // YYYY-MM-DD
  expirationDate: string; // YYYY-MM-DD
  layout: {
    rows: 2;
    columns: 25;
  };
  slots: BlisterPackSlot[];
  active: boolean;
}

export interface BlisterPackSlot {
  row: 1 | 2;
  column: number; // 1-25
  medicationId?: UUID;
  scheduledTime?: string; // HH:MM format
  dispensed: boolean;
  dispensedAt?: ISO8601String;
  confirmed: boolean;
  confirmedAt?: ISO8601String;
}

// ============================================================================
// Triple IR Gate Architecture
// ============================================================================

export interface IRGateReading {
  id: UUID;
  timestamp: ISO8601String;
  patientId: UUID;
  gate1: boolean; // true = clear, false = blocked
  gate2: boolean;
  gate3: boolean;
  allClear: boolean; // All three gates clear
  medicationDetected: boolean; // Derived from gate pattern
  blisterPackSlot?: {
    row: number;
    column: number;
  };
}

// ============================================================================
// Webhook & Integration Types
// ============================================================================

export interface WebhookConfig {
  id: UUID;
  patientId?: UUID; // null = global webhook
  name: string;
  url: string;
  events: string[]; // e.g., ["interaction", "escalation", "medication_dispensed"]
  active: boolean;
  secret?: string;
  headers?: Record<string, string>;
  createdAt: ISO8601String;
  lastTriggered?: ISO8601String;
}

export interface WebhookLog {
  id: UUID;
  webhookId: UUID;
  timestamp: ISO8601String;
  event: string;
  payload: any;
  statusCode: number;
  success: boolean;
  error?: string;
  responseTime: number; // milliseconds
}

// ============================================================================
// Document Library Types
// ============================================================================

export interface Document {
  id: UUID;
  patientId: UUID;
  title: string;
  type: 'care_plan' | 'medication_list' | 'emergency_contact' | 'insurance' | 'other';
  url?: string;
  fileSize?: number;
  mimeType?: string;
  uploadedBy: string;
  uploadedAt: ISO8601String;
  updatedAt: ISO8601String;
  metadata?: {
    version?: string;
    expirationDate?: string;
  };
}

// ============================================================================
// API Response Types
// ============================================================================

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: ISO8601String;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// Frontend State Types
// ============================================================================

export interface AppState {
  isLoading: boolean;
  isOnline: boolean;
  currentPatient?: Patient;
  currentUser?: User;
  theme: 'light' | 'dark';
  timeSync: TimeSyncStatus;
  location: LocationData;
}