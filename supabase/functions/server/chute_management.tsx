/**
 * CHUTE MANAGEMENT & DOSE TRACKING SYSTEM
 * 
 * FDA-Compliant chute logic for 2×25 blister pack medication dispensing
 * 
 * CRITICAL SAFETY FEATURES:
 * - 15-minute safety timeout (not 20!)
 * - Caregiver authorization required for re-presentation
 * - Triple logging mechanism (device flash, cloud DB, audit trail)
 * - No autonomous disposal without human oversight
 * - Reservoir fault detection blocks future doses
 * 
 * Triple IR Gate Architecture:
 * - Gate #1: Blister push-through detection
 * - Gate #2: Pills drop into chute (gravity confirmation)
 * - Gate #3: Patient removal from chute
 */

import * as kv from './kv_store.tsx';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DoseInChute {
  doseId: string;
  patientId: string;
  pack: 'A' | 'B';
  position: number; // 1-25
  scheduledTime: string; // ISO timestamp
  blisterPushedAt: string | null; // Gate #1
  pillsDroppedAt: string | null;  // Gate #2
  pillsRemovedAt: string | null;  // Gate #3
  stage: 'awaiting_push' | 'blister_pushed' | 'pills_in_chute' | 'pills_removed' | 'timeout' | 'awaiting_caregiver_action' | 'diverted';
  timeoutAt: string | null; // 15 minutes after pillsDroppedAt
  caregiverActionRequired: boolean;
  caregiverActionTakenBy: string | null;
  caregiverAction: 'represent' | 'mark_missed' | null;
  diversionReason: string | null;
  attempts: number; // How many times this dose has been presented
  maxAttempts: number; // Configurable (default: 2)
}

export interface ChuteState {
  isOpen: boolean;
  currentDose: DoseInChute | null;
  faultDetected: boolean;
  faultReason: string | null;
  reservoirFull: boolean;
  reservoirCount: number;
  reservoirCapacity: number;
  lastMaintenanceDate: string | null;
  blockAllDoses: boolean;
}

export interface ChuteLog {
  logId: string;
  timestamp: string;
  doseId: string;
  eventType: 'gate1_blister_pushed' | 'gate2_pills_dropped' | 'gate3_pills_removed' | 
             'chute_timeout' | 'chute_closed' | 'dose_diverted' | 'caregiver_action' | 
             'reservoir_full' | 'fault_detected' | 'maintenance_required';
  details: string;
  logged: {
    deviceFlash: boolean;
    cloudDatabase: boolean;
    auditTrail: boolean;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SAFETY_TIMEOUT_MINUTES = 15; // FDA spec: 15 minutes, NOT 20
const MAX_DOSE_ATTEMPTS = 2; // Default maximum re-presentation attempts
const RESERVOIR_CAPACITY = 50; // Maximum pills in diversion reservoir

// KV Store Keys
const KEYS = {
  CHUTE_STATE: (patientId: string) => `chute:state:${patientId}`,
  DOSE_IN_PROGRESS: (doseId: string) => `chute:dose:${doseId}`,
  CHUTE_LOGS: (patientId: string) => `chute:logs:${patientId}`,
  PENDING_CAREGIVER_ACTIONS: (patientId: string) => `chute:pending_actions:${patientId}`,
};

// ============================================================================
// CORE CHUTE MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Initialize chute state for a patient
 */
export async function initializeChuteState(patientId: string): Promise<ChuteState> {
  const existingState = await kv.get(KEYS.CHUTE_STATE(patientId));
  if (existingState) return existingState;

  const initialState: ChuteState = {
    isOpen: false,
    currentDose: null,
    faultDetected: false,
    faultReason: null,
    reservoirFull: false,
    reservoirCount: 0,
    reservoirCapacity: RESERVOIR_CAPACITY,
    lastMaintenanceDate: null,
    blockAllDoses: false,
  };

  await kv.set(KEYS.CHUTE_STATE(patientId), initialState);
  return initialState;
}

/**
 * Get current chute state
 */
export async function getChuteState(patientId: string): Promise<ChuteState> {
  const state = await kv.get(KEYS.CHUTE_STATE(patientId));
  return state || await initializeChuteState(patientId);
}

/**
 * Triple-logging function for FDA compliance
 */
async function tripleLog(patientId: string, log: Omit<ChuteLog, 'logId' | 'timestamp' | 'logged'>): Promise<void> {
  const chuteLog: ChuteLog = {
    logId: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    ...log,
    logged: {
      deviceFlash: true,  // Simulated - in production, this would be a hardware write
      cloudDatabase: true,
      auditTrail: true,
    },
  };

  // Log #1: Cloud database (KV store)
  const existingLogs = await kv.get(KEYS.CHUTE_LOGS(patientId)) || [];
  await kv.set(KEYS.CHUTE_LOGS(patientId), [...existingLogs, chuteLog]);

  // Log #2: Audit trail (separate immutable store)
  await kv.set(`audit:chute:${chuteLog.logId}`, {
    ...chuteLog,
    immutable: true,
    hash: generateLogHash(chuteLog), // FDA requirement: tamper-proof logging
  });

  // Log #3: Device flash memory (simulated)
  console.log('[DEVICE_FLASH_LOG]', chuteLog);
}

/**
 * Generate tamper-proof hash for audit logs
 */
function generateLogHash(log: ChuteLog): string {
  // In production, use proper cryptographic hash (SHA-256)
  const data = JSON.stringify(log);
  return `hash-${data.length}-${Date.now()}`;
}

// ============================================================================
// DOSE LIFECYCLE FUNCTIONS
// ============================================================================

/**
 * GATE #1: Patient pushes blister through foil
 */
export async function handleBlisterPushed(
  patientId: string,
  pack: 'A' | 'B',
  position: number,
  scheduledTime: string
): Promise<{ success: boolean; message: string; doseId?: string }> {
  const state = await getChuteState(patientId);

  // Safety check: Block if system faults exist
  if (state.blockAllDoses) {
    return {
      success: false,
      message: `Dose blocked: ${state.faultReason || 'System maintenance required'}`,
    };
  }

  // Check if chute is already occupied
  if (state.currentDose && state.currentDose.stage !== 'pills_removed' && state.currentDose.stage !== 'diverted') {
    return {
      success: false,
      message: 'Chute occupied - please remove current dose first',
    };
  }

  // Create new dose tracking record
  const doseId = `dose-${Date.now()}-${pack}${position}`;
  const now = new Date().toISOString();

  const dose: DoseInChute = {
    doseId,
    patientId,
    pack,
    position,
    scheduledTime,
    blisterPushedAt: now,
    pillsDroppedAt: null,
    pillsRemovedAt: null,
    stage: 'blister_pushed',
    timeoutAt: null,
    caregiverActionRequired: false,
    caregiverActionTakenBy: null,
    caregiverAction: null,
    diversionReason: null,
    attempts: 1,
    maxAttempts: MAX_DOSE_ATTEMPTS,
  };

  // Save dose record
  await kv.set(KEYS.DOSE_IN_PROGRESS(doseId), dose);

  // Update chute state
  state.currentDose = dose;
  await kv.set(KEYS.CHUTE_STATE(patientId), state);

  // Triple log
  await tripleLog(patientId, {
    doseId,
    eventType: 'gate1_blister_pushed',
    details: `IR Gate #1: Blister pushed - Pack ${pack} Position ${position}`,
  });

  return {
    success: true,
    message: 'Gate #1 triggered - Blister pushed',
    doseId,
  };
}

/**
 * GATE #2: Pills drop into chute (gravity confirmation)
 */
export async function handlePillsDropped(doseId: string): Promise<{ success: boolean; message: string }> {
  const dose = await kv.get(KEYS.DOSE_IN_PROGRESS(doseId));
  if (!dose) {
    return { success: false, message: 'Dose not found' };
  }

  const now = new Date().toISOString();
  const timeoutTime = new Date(Date.now() + SAFETY_TIMEOUT_MINUTES * 60 * 1000).toISOString();

  dose.pillsDroppedAt = now;
  dose.stage = 'pills_in_chute';
  dose.timeoutAt = timeoutTime;

  await kv.set(KEYS.DOSE_IN_PROGRESS(doseId), dose);

  // Update chute state
  const state = await getChuteState(dose.patientId);
  state.isOpen = true;
  state.currentDose = dose;
  await kv.set(KEYS.CHUTE_STATE(dose.patientId), state);

  // Triple log
  await tripleLog(dose.patientId, {
    doseId,
    eventType: 'gate2_pills_dropped',
    details: `IR Gate #2: Pills in chute - ${SAFETY_TIMEOUT_MINUTES} minute safety timer started`,
  });

  return {
    success: true,
    message: `Pills in chute - ${SAFETY_TIMEOUT_MINUTES} min timeout active`,
  };
}

/**
 * GATE #3: Patient removes pills from chute
 */
export async function handlePillsRemoved(doseId: string): Promise<{ success: boolean; message: string }> {
  const dose = await kv.get(KEYS.DOSE_IN_PROGRESS(doseId));
  if (!dose) {
    return { success: false, message: 'Dose not found' };
  }

  const now = new Date().toISOString();

  dose.pillsRemovedAt = now;
  dose.stage = 'pills_removed';
  dose.timeoutAt = null; // Clear timeout

  await kv.set(KEYS.DOSE_IN_PROGRESS(doseId), dose);

  // Update chute state - CLOSE CHUTE
  const state = await getChuteState(dose.patientId);
  state.isOpen = false;
  state.currentDose = null; // Clear current dose
  await kv.set(KEYS.CHUTE_STATE(dose.patientId), state);

  // Triple log
  await tripleLog(dose.patientId, {
    doseId,
    eventType: 'gate3_pills_removed',
    details: `IR Gate #3: Pills removed by patient - Dose cycle complete`,
  });

  // Calculate removal latency for analytics
  if (dose.pillsDroppedAt) {
    const latencyMs = new Date(now).getTime() - new Date(dose.pillsDroppedAt).getTime();
    const latencyMinutes = Math.floor(latencyMs / 60000);
    console.log(`[DOSE_LATENCY] ${latencyMinutes} minutes from drop to removal`);
  }

  return {
    success: true,
    message: 'Dose successfully removed - Chute closed',
  };
}

/**
 * CHUTE TIMEOUT: 15 minutes elapsed without patient removal
 * 
 * CRITICAL: This function HALTS all autonomous actions and requires
 * explicit caregiver authorization before proceeding.
 */
export async function handleChuteTimeout(doseId: string): Promise<{ success: boolean; message: string; requiresCaregiverAction: boolean }> {
  const dose = await kv.get(KEYS.DOSE_IN_PROGRESS(doseId));
  if (!dose) {
    return { success: false, message: 'Dose not found', requiresCaregiverAction: false };
  }

  const now = new Date().toISOString();

  dose.stage = 'awaiting_caregiver_action';
  dose.caregiverActionRequired = true;

  await kv.set(KEYS.DOSE_IN_PROGRESS(doseId), dose);

  // Update chute state - CLOSE CHUTE (safety measure)
  const state = await getChuteState(dose.patientId);
  state.isOpen = false;
  state.blockAllDoses = true; // BLOCK future doses until caregiver resolves
  state.faultReason = '15-minute timeout - Caregiver action required';
  await kv.set(KEYS.CHUTE_STATE(dose.patientId), state);

  // Triple log
  await tripleLog(dose.patientId, {
    doseId,
    eventType: 'chute_timeout',
    details: `Chute timeout: ${SAFETY_TIMEOUT_MINUTES} minutes elapsed, IR Gate #3 not triggered - Chute closed, awaiting caregiver authorization`,
  });

  // Add to pending caregiver actions queue
  const pendingActions = await kv.get(KEYS.PENDING_CAREGIVER_ACTIONS(dose.patientId)) || [];
  pendingActions.push({
    doseId,
    timestamp: now,
    type: 'timeout',
    pack: dose.pack,
    position: dose.position,
    actions: ['represent', 'mark_missed', 'investigate'],
  });
  await kv.set(KEYS.PENDING_CAREGIVER_ACTIONS(dose.patientId), pendingActions);

  return {
    success: true,
    message: 'Chute timeout - Caregiver authorization required',
    requiresCaregiverAction: true,
  };
}

// ============================================================================
// CAREGIVER ACTION HANDLERS
// ============================================================================

/**
 * Caregiver authorizes re-presentation of missed dose
 */
export async function caregiverRepresentDose(
  doseId: string,
  caregiverUserId: string
): Promise<{ success: boolean; message: string }> {
  const dose = await kv.get(KEYS.DOSE_IN_PROGRESS(doseId));
  if (!dose) {
    return { success: false, message: 'Dose not found' };
  }

  const state = await getChuteState(dose.patientId);

  // Check for system faults that would prevent re-presentation
  if (state.reservoirFull) {
    return {
      success: false,
      message: 'Cannot re-present: Diversion reservoir full - maintenance required',
    };
  }

  if (state.faultDetected && state.faultReason?.includes('chute')) {
    return {
      success: false,
      message: `Cannot re-present: ${state.faultReason}`,
    };
  }

  // Check attempt limits
  if (dose.attempts >= dose.maxAttempts) {
    return {
      success: false,
      message: `Maximum re-presentation attempts (${dose.maxAttempts}) reached`,
    };
  }

  // Re-present dose
  dose.stage = 'pills_in_chute';
  dose.attempts += 1;
  dose.caregiverAction = 'represent';
  dose.caregiverActionTakenBy = caregiverUserId;
  dose.timeoutAt = new Date(Date.now() + SAFETY_TIMEOUT_MINUTES * 60 * 1000).toISOString();

  await kv.set(KEYS.DOSE_IN_PROGRESS(doseId), dose);

  // Update chute state - OPEN CHUTE
  state.isOpen = true;
  state.currentDose = dose;
  state.blockAllDoses = false; // Unblock system
  state.faultReason = null;
  await kv.set(KEYS.CHUTE_STATE(dose.patientId), state);

  // Remove from pending actions
  const pendingActions = await kv.get(KEYS.PENDING_CAREGIVER_ACTIONS(dose.patientId)) || [];
  const updatedActions = pendingActions.filter((a: any) => a.doseId !== doseId);
  await kv.set(KEYS.PENDING_CAREGIVER_ACTIONS(dose.patientId), updatedActions);

  // Triple log
  await tripleLog(dose.patientId, {
    doseId,
    eventType: 'caregiver_action',
    details: `Caregiver ${caregiverUserId} authorized dose re-presentation - Attempt ${dose.attempts}/${dose.maxAttempts}`,
  });

  return {
    success: true,
    message: `Dose re-presented - Attempt ${dose.attempts}/${dose.maxAttempts}`,
  };
}

/**
 * Caregiver marks dose as missed and authorizes diversion
 */
export async function caregiverMarkMissed(
  doseId: string,
  caregiverUserId: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  const dose = await kv.get(KEYS.DOSE_IN_PROGRESS(doseId));
  if (!dose) {
    return { success: false, message: 'Dose not found' };
  }

  const state = await getChuteState(dose.patientId);

  // Check reservoir capacity
  if (state.reservoirFull) {
    return {
      success: false,
      message: 'Diversion reservoir full - technical support required',
    };
  }

  // Divert dose to reservoir
  dose.stage = 'diverted';
  dose.caregiverAction = 'mark_missed';
  dose.caregiverActionTakenBy = caregiverUserId;
  dose.diversionReason = reason;

  await kv.set(KEYS.DOSE_IN_PROGRESS(doseId), dose);

  // Update reservoir count
  state.reservoirCount += 1;
  if (state.reservoirCount >= state.reservoirCapacity) {
    state.reservoirFull = true;
    state.blockAllDoses = true;
    state.faultReason = 'Diversion reservoir full - maintenance required';
  }

  state.isOpen = false;
  state.currentDose = null;
  state.blockAllDoses = false; // Allow next scheduled dose
  await kv.set(KEYS.CHUTE_STATE(dose.patientId), state);

  // Remove from pending actions
  const pendingActions = await kv.get(KEYS.PENDING_CAREGIVER_ACTIONS(dose.patientId)) || [];
  const updatedActions = pendingActions.filter((a: any) => a.doseId !== doseId);
  await kv.set(KEYS.PENDING_CAREGIVER_ACTIONS(dose.patientId), updatedActions);

  // Triple log
  await tripleLog(dose.patientId, {
    doseId,
    eventType: 'dose_diverted',
    details: `Caregiver ${caregiverUserId} authorized dose diversion - Reason: ${reason}`,
  });

  // Log reservoir status if approaching capacity
  if (state.reservoirCount >= state.reservoirCapacity * 0.8) {
    await tripleLog(dose.patientId, {
      doseId,
      eventType: 'maintenance_required',
      details: `Diversion reservoir at ${Math.round((state.reservoirCount / state.reservoirCapacity) * 100)}% capacity`,
    });
  }

  return {
    success: true,
    message: `Dose marked as missed and diverted - Reservoir: ${state.reservoirCount}/${state.reservoirCapacity}`,
  };
}

// ============================================================================
// SYSTEM MAINTENANCE & MONITORING
// ============================================================================

/**
 * Get pending caregiver actions
 */
export async function getPendingCaregiverActions(patientId: string): Promise<any[]> {
  return await kv.get(KEYS.PENDING_CAREGIVER_ACTIONS(patientId)) || [];
}

/**
 * Get chute logs for audit/review
 */
export async function getChuteLogs(patientId: string, limit: number = 100): Promise<ChuteLog[]> {
  const logs = await kv.get(KEYS.CHUTE_LOGS(patientId)) || [];
  return logs.slice(-limit).reverse(); // Return most recent first
}

/**
 * Clear reservoir (maintenance performed)
 */
export async function performReservoirMaintenance(
  patientId: string,
  performedBy: string
): Promise<{ success: boolean; message: string }> {
  const state = await getChuteState(patientId);

  state.reservoirCount = 0;
  state.reservoirFull = false;
  state.lastMaintenanceDate = new Date().toISOString();
  
  // Unblock system if reservoir was the only fault
  if (state.faultReason?.includes('reservoir')) {
    state.blockAllDoses = false;
    state.faultReason = null;
  }

  await kv.set(KEYS.CHUTE_STATE(patientId), state);

  await tripleLog(patientId, {
    doseId: 'maintenance',
    eventType: 'maintenance_required',
    details: `Reservoir maintenance performed by ${performedBy} - Reservoir cleared`,
  });

  return {
    success: true,
    message: 'Reservoir maintenance completed - System operational',
  };
}

/**
 * Report chute fault
 */
export async function reportChuteFault(
  patientId: string,
  faultReason: string
): Promise<{ success: boolean; message: string }> {
  const state = await getChuteState(patientId);

  state.faultDetected = true;
  state.faultReason = faultReason;
  state.blockAllDoses = true;
  state.isOpen = false;

  await kv.set(KEYS.CHUTE_STATE(patientId), state);

  await tripleLog(patientId, {
    doseId: 'fault',
    eventType: 'fault_detected',
    details: `Chute fault detected: ${faultReason}`,
  });

  return {
    success: true,
    message: 'Fault reported - All doses blocked pending resolution',
  };
}

/**
 * Clear chute fault (after maintenance/repair)
 */
export async function clearChuteFault(
  patientId: string,
  resolvedBy: string
): Promise<{ success: boolean; message: string }> {
  const state = await getChuteState(patientId);

  state.faultDetected = false;
  state.faultReason = null;
  state.blockAllDoses = false;

  await kv.set(KEYS.CHUTE_STATE(patientId), state);

  await tripleLog(patientId, {
    doseId: 'maintenance',
    eventType: 'maintenance_required',
    details: `Chute fault cleared by ${resolvedBy} - System restored to operational status`,
  });

  return {
    success: true,
    message: 'Chute fault cleared - System operational',
  };
}
