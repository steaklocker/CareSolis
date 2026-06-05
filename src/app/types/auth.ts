/**
 * FDA-COMPLIANT AUTHENTICATION TYPES
 * 21 CFR Part 11 Compliance for Electronic Records & Signatures
 */

export type UserRole = 'primary_caregiver' | 'secondary_caregiver' | 'clinical_supervisor' | 'system_admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phoneNumber?: string;
  mfaEnabled: boolean;
  mfaMethod?: 'sms' | 'email' | 'authenticator';
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'suspended' | 'locked';
  failedLoginAttempts: number;
  passwordLastChanged: string;
  mustChangePassword: boolean;
  sessionTimeoutMinutes: number; // Per-user override
}

export interface Session {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  browser: string;
  ipAddress: string;
  location?: string; // City, State based on IP
  createdAt: string;
  expiresAt: string;
  lastActivity: string;
  mfaVerified: boolean;
  isActive: boolean;
}

export interface DeviceAccessLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'login' | 'logout' | 'session_timeout' | 'forced_logout' | 'mfa_verification' | 'password_change';
  deviceId: string;
  deviceName: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  browser: string;
  ipAddress: string;
  location?: string;
  timestamp: string;
  success: boolean;
  failureReason?: string;
  anomalyDetected?: boolean;
  anomalyType?: 'new_device' | 'unusual_location' | 'unusual_time' | 'rapid_location_change' | 'multiple_failed_attempts';
}

export interface LoginAnomalyAlert {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  anomalyType: 'new_device' | 'unusual_location' | 'unusual_time' | 'rapid_location_change' | 'multiple_failed_attempts' | 'impossible_travel';
  severity: 'low' | 'medium' | 'high' | 'critical';
  deviceId: string;
  ipAddress: string;
  location?: string;
  timestamp: string;
  details: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: string;
}

export interface SecuritySettings {
  // MFA Configuration
  mfaRequired: boolean; // Global MFA requirement
  mfaRequiredForRoles: UserRole[]; // Which roles MUST use MFA
  mfaGracePeriodDays: number; // Days to enable MFA before enforcement
  
  // Session Configuration
  defaultSessionTimeoutMinutes: number; // Default: 30 minutes
  sessionTimeoutByRole: Record<UserRole, number>; // Role-specific timeouts
  absoluteSessionMaxHours: number; // Max session length regardless of activity (e.g., 8 hours)
  allowMultipleSessions: boolean; // Can user have multiple active sessions?
  
  // Password Policy
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  passwordExpirationDays: number; // 0 = never expires
  passwordHistoryCount: number; // Prevent reuse of last N passwords
  
  // Account Lockout
  maxFailedLoginAttempts: number; // Default: 5
  lockoutDurationMinutes: number; // Default: 30
  lockoutPermanentAfterAttempts: number; // Default: 10 (requires admin unlock)
  
  // Anomaly Detection
  anomalyDetectionEnabled: boolean;
  alertOnNewDevice: boolean;
  alertOnUnusualLocation: boolean;
  alertOnUnusualTime: boolean;
  alertOnRapidLocationChange: boolean;
  impossibleTravelSpeedMph: number; // Default: 600 (plane speed)
  
  // Audit Trail
  logRetentionDays: number; // FDA requires 7 years = 2555 days
  auditLogEnabled: boolean;
  
  // Device Management
  maxDevicesPerUser: number; // Default: 5
  requireDeviceApproval: boolean; // Admin must approve new devices
  
  // IP Restrictions
  ipWhitelistEnabled: boolean;
  allowedIpRanges: string[]; // CIDR notation
  
  updatedAt: string;
  updatedBy: string;
}

export interface RolePermissions {
  role: UserRole;
  permissions: {
    // Dashboard & Monitoring
    viewDashboard: boolean;
    viewPatientData: boolean;
    viewMedicalRecords: boolean;
    
    // Care Circle
    viewCareCircle: boolean;
    editCareCircle: boolean;
    
    // Medications
    viewMedications: boolean;
    editMedications: boolean;
    fillMedications: boolean;
    approveMedications: boolean; // Clinical supervisor only
    
    // Escalations
    viewEscalations: boolean;
    respondToEscalations: boolean;
    configureEscalations: boolean;
    
    // Settings
    viewSettings: boolean;
    editSchedule: boolean;
    editDeviceSettings: boolean;
    
    // Billing & Clinical
    viewRPMBilling: boolean;
    editRPMBilling: boolean;
    viewClinicalManual: boolean;
    editClinicalManual: boolean;
    
    // System Administration
    manageUsers: boolean;
    manageRoles: boolean;
    manageSecurity: boolean;
    viewAuditLogs: boolean;
    viewAccessLogs: boolean;
    manageDevices: boolean;
    exportData: boolean;
    
    // Integrations
    viewIntegrations: boolean;
    configureIntegrations: boolean;
    
    // Testing/Simulation (Dev only)
    accessSimulation: boolean;
    accessTestingTools: boolean;
  };
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: Record<string, { old: any; new: any }>;
  timestamp: string;
  ipAddress: string;
  deviceId: string;
  success: boolean;
  errorMessage?: string;
  complianceRelevant: boolean; // FDA 21 CFR Part 11 relevant action
}

export interface MFAVerification {
  userId: string;
  method: 'sms' | 'email' | 'authenticator';
  code: string; // Hashed
  createdAt: string;
  expiresAt: string; // Valid for 5 minutes
  attempts: number;
  verified: boolean;
}

// FDA 21 CFR Part 11 Electronic Signature
export interface ElectronicSignature {
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string; // What was signed
  resourceType: string; // e.g., "medication_administration", "care_plan_update"
  resourceId: string;
  timestamp: string;
  ipAddress: string;
  deviceId: string;
  signature: string; // Cryptographic hash
  meaning: string; // FDA requires "meaning" of signature
}

// Device fingerprinting for anomaly detection
export interface DeviceFingerprint {
  deviceId: string;
  userId: string;
  firstSeen: string;
  lastSeen: string;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  trusted: boolean;
  accessCount: number;
}

// Device information for login requests
export interface DeviceInfo {
  deviceName: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  browser: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
}