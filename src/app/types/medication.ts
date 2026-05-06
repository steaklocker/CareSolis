// Shared medication types for Caresolis medication management system

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  appearance: {
    color: string;
    shape: 'round' | 'oval' | 'capsule' | 'tablet' | 'other';
    size: 'small' | 'medium' | 'large';
  };
  instructions?: string;
  prescriber?: string;
  refillDate?: string;
  photoUrl?: string;
  notes?: string;
  createdAt: string;
  active: boolean;
  timeCritical?: boolean;  // NEW: TC flag for time-sensitive medications
}

export interface MedicationSchedule {
  id: string;
  medicationId: string;
  pattern: {
    type: 'daily' | 'weekly' | 'custom' | 'as-needed';
    times?: string[];           // ["08:00", "20:00"]
    daysOfWeek?: number[];      // [0,2,4] = Sun, Tue, Thu
    customRule?: string;
  };
  quantity: number;             // Pills per event
  startDate: string;
  endDate?: string;
  active: boolean;
}

export interface CompartmentAssignment {
  compartmentId: string;        // e.g., "A1", "B3", "G7"
  position: { row: number; col: number }; // row 0-6, col 0-6
  
  // Schedule-specific assignment
  scheduleId: string;           // Links to MedicationSchedule
  medicationId: string;
  
  // Time and day mapping
  scheduledTime: string;        // "09:00", "18:00"
  dayOfWeek: number;            // 0=Mon, 1=Tue, ... 6=Sun (columns)
  
  // Physical loading state
  currentQuantity: number;      // How many pills currently loaded
  expectedQuantity: number;     // How many should be loaded
  lastRefilled?: string;
  loadedAt?: string;
  loadedBy?: string;
  verificationPhotoUrl?: string;
}

export interface DispensingEvent {
  id: string;
  scheduledTime: string;        // ISO timestamp
  medications: Array<{
    medicationId: string;
    compartmentId: number;
    quantity: number;
  }>;
  status: 'pending' | 'alerting' | 'dispensing' | 'completed' | 'failed' | 'missed';
  execution?: {
    alertedAt?: string;
    dispensedAt?: string;
    completedAt?: string;
    failedAt?: string;
  };
  interaction?: {
    acknowledgedAt?: string;
    retrievedAt?: string;
    confirmedAt?: string;
  };
  telemetry?: DispensingTelemetry[];
  errors?: DispensingError[];
}

export interface DispensingTelemetry {
  timestamp: string;
  rotationAngle: number;
  rotationDuration: number;
  torqueReading: number;
  pillCountBefore: number;
  pillCountAfter: number;
  dispensedCount: number;
  weightBefore?: number;
  weightAfter?: number;
  mechanicalStatus: 'ok' | 'jam' | 'misalignment' | 'sensor_error';
  dispensingStatus: 'success' | 'underdispense' | 'overdispense' | 'failed';
  retriesAttempted: number;
}

export interface DispensingError {
  timestamp: string;
  type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  recoveryAction?: string;
}

export interface LoadingSession {
  id: string;
  startTime: string;
  completedAt?: string;
  compartmentChecklist: LoadingInstruction[];
  verificationPhotos: string[];
  completedBy: string;
  verifiedBy?: string;
  status: 'in-progress' | 'completed' | 'verified';
}

export interface LoadingInstruction {
  compartmentId: number;
  position: { row: number; col: number };
  medication: {
    name: string;
    dosage: string;
    appearance: { color: string; shape: string };
    photoUrl?: string;
  };
  quantity: number;
  loaded: boolean;
  verifiedAt?: string;
  photoUrl?: string;
}

export interface DeviceHealth {
  lastCheck: string;
  mechanicalStatus: 'ok' | 'degraded' | 'failed';
  sensorStatus: 'ok' | 'degraded' | 'failed';
  powerStatus: 'ac' | 'battery' | 'critical';
  batteryLevel?: number;
  temperature?: number;
  enclosureSecure: boolean;
  faultCount: number;
  lastDispenseSuccess: boolean;
  lastDispenseTime?: string;
}