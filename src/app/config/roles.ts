/**
 * CARESOLIS ROLE-BASED ACCESS CONTROL (RBAC)
 * FDA 21 CFR Part 11 & HIPAA Compliant
 */

export const ROLES = {
  SYSTEM_ADMIN: 'system_admin',
  CLINICAL_SUPERVISOR: 'clinical_supervisor',
  PRIMARY_CAREGIVER: 'primary_caregiver',
  SECONDARY_CAREGIVER: 'secondary_caregiver',
  VIEWER: 'viewer'
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export interface RoleDefinition {
  id: UserRole;
  name: string;
  description: string;
  level: number; // Higher = more access
  permissions: {
    // System Access
    viewCode: boolean;
    viewLogs: boolean;
    viewAuditTrail: boolean;
    viewAnalytics: boolean;
    
    // User Management
    createUsers: boolean;
    editUsers: boolean;
    deleteUsers: boolean;
    
    // Patient Data
    viewPatientData: boolean;
    editPatientData: boolean;
    deletePatientData: boolean;
    exportPatientData: boolean;
    
    // Medications
    viewMedications: boolean;
    editMedications: boolean;
    approveMedications: boolean;
    
    // System Configuration
    editSettings: boolean;
    editEscalation: boolean;
    editIntegrations: boolean;
    
    // Testing & Development
    accessTestingTools: boolean;
    accessSimulator: boolean;
    
    // Security
    copyPaste: boolean;
    printPages: boolean;
    downloadReports: boolean;
  };
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  system_admin: {
    id: 'system_admin',
    name: 'System Administrator',
    description: 'Full system access - complete control over all features, settings, and data. Reserved for technical administrators.',
    level: 100,
    permissions: {
      viewCode: true,
      viewLogs: true,
      viewAuditTrail: true,
      viewAnalytics: true,
      createUsers: true,
      editUsers: true,
      deleteUsers: true,
      viewPatientData: true,
      editPatientData: true,
      deletePatientData: true,
      exportPatientData: true,
      viewMedications: true,
      editMedications: true,
      approveMedications: true,
      editSettings: true,
      editEscalation: true,
      editIntegrations: true,
      accessTestingTools: true,
      accessSimulator: true,
      copyPaste: true,
      printPages: true,
      downloadReports: true
    }
  },
  
  clinical_supervisor: {
    id: 'clinical_supervisor',
    name: 'Clinical Supervisor',
    description: 'Clinical oversight role - can approve medications, access analytics, and supervise care delivery. Cannot access system code or technical settings.',
    level: 75,
    permissions: {
      viewCode: false,
      viewLogs: false,
      viewAuditTrail: true,
      viewAnalytics: true,
      createUsers: false,
      editUsers: false,
      deleteUsers: false,
      viewPatientData: true,
      editPatientData: true,
      deletePatientData: false,
      exportPatientData: true,
      viewMedications: true,
      editMedications: true,
      approveMedications: true,
      editSettings: false,
      editEscalation: false,
      editIntegrations: false,
      accessTestingTools: false,
      accessSimulator: false,
      copyPaste: false,
      printPages: true,
      downloadReports: true
    }
  },
  
  primary_caregiver: {
    id: 'primary_caregiver',
    name: 'Primary Caregiver',
    description: 'Main caregiver role - full access to patient care features, medications, and notifications. Cannot modify system settings or access technical features.',
    level: 50,
    permissions: {
      viewCode: false,
      viewLogs: false,
      viewAuditTrail: false,
      viewAnalytics: false,
      createUsers: false,
      editUsers: false,
      deleteUsers: false,
      viewPatientData: true,
      editPatientData: true,
      deletePatientData: false,
      exportPatientData: false,
      viewMedications: true,
      editMedications: true,
      approveMedications: false,
      editSettings: false,
      editEscalation: false,
      editIntegrations: false,
      accessTestingTools: false,
      accessSimulator: false,
      copyPaste: false,
      printPages: false,
      downloadReports: false
    }
  },
  
  secondary_caregiver: {
    id: 'secondary_caregiver',
    name: 'Secondary Caregiver',
    description: 'Support caregiver role - can view patient data and medications, receive notifications. Cannot modify critical settings or patient records.',
    level: 25,
    permissions: {
      viewCode: false,
      viewLogs: false,
      viewAuditTrail: false,
      viewAnalytics: false,
      createUsers: false,
      editUsers: false,
      deleteUsers: false,
      viewPatientData: true,
      editPatientData: false,
      deletePatientData: false,
      exportPatientData: false,
      viewMedications: true,
      editMedications: false,
      approveMedications: false,
      editSettings: false,
      editEscalation: false,
      editIntegrations: false,
      accessTestingTools: false,
      accessSimulator: false,
      copyPaste: false,
      printPages: false,
      downloadReports: false
    }
  },
  
  viewer: {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access - can view patient status and receive notifications only. Cannot modify any data or settings.',
    level: 10,
    permissions: {
      viewCode: false,
      viewLogs: false,
      viewAuditTrail: false,
      viewAnalytics: false,
      createUsers: false,
      editUsers: false,
      deleteUsers: false,
      viewPatientData: true,
      editPatientData: false,
      deletePatientData: false,
      exportPatientData: false,
      viewMedications: true,
      editMedications: false,
      approveMedications: false,
      editSettings: false,
      editEscalation: false,
      editIntegrations: false,
      accessTestingTools: false,
      accessSimulator: false,
      copyPaste: false,
      printPages: false,
      downloadReports: false
    }
  }
};

export function getRoleDefinition(role: UserRole): RoleDefinition {
  return ROLE_DEFINITIONS[role];
}

export function hasPermission(role: UserRole, permission: keyof RoleDefinition['permissions']): boolean {
  const roleDefinition = ROLE_DEFINITIONS[role];
  return roleDefinition?.permissions[permission] || false;
}

export function canAccessRoute(role: UserRole, routePath: string): boolean {
  const roleDefinition = ROLE_DEFINITIONS[role];
  
  // Admin-only routes
  const adminOnlyRoutes = [
    '/user-management',
    '/access-and-permissions',
    '/security-center',
    '/system-settings',
    '/system-monitoring',
    '/systems',
    '/escalation',
    '/integrations',
    '/setup-wizard',
    '/solis',
    '/simulation',
    '/device-simulator',
    '/testing-tools',
    '/diagnostic-test',
    '/testing-checklist',
    '/data-recovery',
    '/provider-manual',
    '/medication-maintenance'
  ];
  
  if (adminOnlyRoutes.includes(routePath)) {
    return role === ROLES.SYSTEM_ADMIN;
  }
  
  // Clinical Supervisor routes
  const clinicalRoutes = [
    '/analytics',
    '/clinical-operations',
    '/regulatory-compliance',
    '/data-governance'
  ];
  
  if (clinicalRoutes.includes(routePath)) {
    return roleDefinition.level >= 75;
  }
  
  // All authenticated users can access these
  return true;
}
