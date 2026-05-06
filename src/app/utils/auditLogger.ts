/**
 * FDA COMPLIANCE AUDIT LOGGING SYSTEM
 * 
 * Three-Tier Logging Architecture:
 * 1. Audit Log - All user actions (add/edit/delete medications)
 * 2. Clinical Event Log - Medication adherence, dose events
 * 3. Compliance Log - Security events, access control violations
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;

export interface AuditLogEntry {
  timestamp: string;
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface ClinicalEventEntry {
  timestamp: string;
  patientId: string;
  eventType: 'dose_taken' | 'dose_missed' | 'medication_added' | 'medication_modified' | 'medication_removed';
  medicationId?: string;
  medicationName?: string;
  details: Record<string, any>;
}

export interface ComplianceEventEntry {
  timestamp: string;
  eventType: 'access_denied' | 'unauthorized_attempt' | 'role_violation' | 'security_alert';
  userId: string;
  resource: string;
  action: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Log user action to Audit Log
 * FDA Requirement: Track all user modifications to medication schedules
 */
export async function logAuditEvent(entry: Omit<AuditLogEntry, 'timestamp' | 'ipAddress' | 'userAgent'>): Promise<void> {
  try {
    const fullEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      // Note: IP address will be captured on server-side for accuracy
    };

    console.log('📋 [AUDIT LOG]', fullEntry);

    await fetch(`${SERVER_URL}/audit-log`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fullEntry),
    });
  } catch (error) {
    console.error('❌ Failed to log audit event:', error);
    // Store locally as backup
    const localLogs = JSON.parse(localStorage.getItem('caresolis_audit_backup') || '[]');
    localLogs.push({ ...entry, timestamp: new Date().toISOString() });
    localStorage.setItem('caresolis_audit_backup', JSON.stringify(localLogs.slice(-100))); // Keep last 100
  }
}

/**
 * Log clinical event to Clinical Event Log
 * FDA Requirement: Track all medication-related clinical events
 */
export async function logClinicalEvent(entry: Omit<ClinicalEventEntry, 'timestamp'>): Promise<void> {
  try {
    const fullEntry: ClinicalEventEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    console.log('🏥 [CLINICAL LOG]', fullEntry);

    await fetch(`${SERVER_URL}/clinical-log`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fullEntry),
    });
  } catch (error) {
    console.error('❌ Failed to log clinical event:', error);
  }
}

/**
 * Log compliance/security event to Compliance Log
 * FDA Requirement: Track all access control violations and security events
 */
export async function logComplianceEvent(entry: Omit<ComplianceEventEntry, 'timestamp'>): Promise<void> {
  try {
    const fullEntry: ComplianceEventEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    console.log('🔒 [COMPLIANCE LOG]', fullEntry);

    // Always log compliance events even if server fails
    await fetch(`${SERVER_URL}/compliance-log`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fullEntry),
    });

    // CRITICAL: Also store critical compliance events locally
    if (entry.severity === 'critical' || entry.severity === 'high') {
      const localLogs = JSON.parse(localStorage.getItem('caresolis_compliance_backup') || '[]');
      localLogs.push(fullEntry);
      localStorage.setItem('caresolis_compliance_backup', JSON.stringify(localLogs.slice(-50))); // Keep last 50
    }
  } catch (error) {
    console.error('❌ Failed to log compliance event:', error);
    // CRITICAL: Store locally as this is a security event
    const localLogs = JSON.parse(localStorage.getItem('caresolis_compliance_backup') || '[]');
    localLogs.push({ ...entry, timestamp: new Date().toISOString() });
    localStorage.setItem('caresolis_compliance_backup', JSON.stringify(localLogs.slice(-50)));
  }
}

/**
 * Convenience function to log medication modification
 */
export async function logMedicationChange(
  action: 'add' | 'edit' | 'delete',
  medicationId: string,
  medicationName: string,
  userId: string,
  userRole: string,
  details: Record<string, any>
): Promise<void> {
  // Log to Audit Log (user action)
  await logAuditEvent({
    userId,
    userRole,
    action: `medication_${action}`,
    resource: 'medication',
    resourceId: medicationId,
    details: {
      medicationName,
      ...details,
    },
  });

  // Log to Clinical Log (clinical event)
  await logClinicalEvent({
    patientId: details.patientId || 'unknown',
    eventType: `medication_${action === 'edit' ? 'modified' : action === 'add' ? 'added' : 'removed'}` as any,
    medicationId,
    medicationName,
    details,
  });
}
