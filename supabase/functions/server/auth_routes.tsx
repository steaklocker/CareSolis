/**
 * FDA-COMPLIANT AUTHENTICATION ROUTES
 * Server-side authentication, session management, and audit logging
 * 21 CFR Part 11 Compliance
 */

import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import { pbkdf2Sync, randomBytes } from "node:crypto";

const authApp = new Hono();

// Initialize Supabase client
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
};

// Password hashing utilities
function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const passwordSalt = salt || randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, passwordSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: passwordSalt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const verifyHash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

// Generate MFA code
function generateMFACode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Device fingerprinting
function generateDeviceId(deviceInfo: any): string {
  const components = [
    deviceInfo.browser,
    deviceInfo.platform,
    deviceInfo.screenResolution,
    deviceInfo.timezone,
    deviceInfo.language
  ].join('|');
  
  return pbkdf2Sync(components, 'device-salt', 1000, 32, 'sha256').toString('hex');
}

// Anomaly detection
async function detectAnomalies(userId: string, deviceInfo: any): Promise<any[]> {
  const anomalies: any[] = [];
  
  // Get user's login history
  const accessLogs = await kv.getByPrefix(`auth:access_log:user:${userId}`);
  
  if (accessLogs.length === 0) {
    // First time login - no anomalies
    return anomalies;
  }
  
  // Check for new device
  const knownDevices = await kv.getByPrefix(`auth:device:user:${userId}`);
  const isNewDevice = !knownDevices.some((d: any) => d.deviceId === deviceInfo.deviceId);
  
  if (isNewDevice) {
    anomalies.push({
      type: 'new_device',
      severity: 'medium',
      details: `Login from new device: ${deviceInfo.deviceName} (${deviceInfo.browser})`
    });
  }
  
  // Check for unusual location (if IP changed significantly)
  const recentLogins = accessLogs.slice(-10);
  const recentIPs = recentLogins.map((log: any) => log.ipAddress).filter(Boolean);
  const isNewIP = !recentIPs.includes(deviceInfo.ipAddress);
  
  if (isNewIP && recentIPs.length > 0) {
    anomalies.push({
      type: 'unusual_location',
      severity: 'medium',
      details: `Login from new IP address: ${deviceInfo.ipAddress}`
    });
  }
  
  // Check for unusual time
  const now = new Date();
  const hour = now.getHours();
  
  const loginHours = recentLogins.map((log: any) => new Date(log.timestamp).getHours());
  const avgHour = loginHours.reduce((a, b) => a + b, 0) / loginHours.length;
  const hourDiff = Math.abs(hour - avgHour);
  
  if (hourDiff > 6 && loginHours.length >= 5) {
    anomalies.push({
      type: 'unusual_time',
      severity: 'low',
      details: `Login at unusual hour: ${hour}:00 (typical: ${Math.round(avgHour)}:00)`
    });
  }
  
  // Check for multiple failed attempts recently
  const recentFailedAttempts = accessLogs
    .filter((log: any) => !log.success && log.action === 'login')
    .filter((log: any) => {
      const logTime = new Date(log.timestamp).getTime();
      const nowTime = now.getTime();
      return (nowTime - logTime) < 3600000; // Last hour
    });
  
  if (recentFailedAttempts.length >= 3) {
    anomalies.push({
      type: 'multiple_failed_attempts',
      severity: 'high',
      details: `${recentFailedAttempts.length} failed login attempts in the last hour`
    });
  }
  
  return anomalies;
}

// LOGIN
authApp.post('/login', async (c) => {
  try {
    const { email, password, deviceInfo } = await c.req.json();
    
    // Get user by email
    const users = await kv.getByPrefix('auth:user:email:');
    const userRecord = users.find((u: any) => u.email === email);
    
    if (!userRecord) {
      // Log failed attempt
      await logAccessEvent(null, null, 'login', false, deviceInfo, 'User not found');
      return c.json({ error: 'Invalid email or password' }, 401);
    }
    
    // Verify password
    const isValidPassword = verifyPassword(password, userRecord.passwordHash, userRecord.passwordSalt);
    
    if (!isValidPassword) {
      // Increment failed login attempts
      userRecord.failedLoginAttempts = (userRecord.failedLoginAttempts || 0) + 1;
      await kv.set(`auth:user:${userRecord.id}`, userRecord);
      
      // Check if account should be locked
      const securitySettings = await kv.get('auth:security_settings');
      const maxAttempts = securitySettings?.maxFailedLoginAttempts || 5;
      
      if (userRecord.failedLoginAttempts >= maxAttempts) {
        userRecord.status = 'locked';
        userRecord.lockedAt = new Date().toISOString();
        await kv.set(`auth:user:${userRecord.id}`, userRecord);
        
        await logAccessEvent(userRecord.id, userRecord.name, 'login', false, deviceInfo, 'Account locked due to too many failed attempts');
        
        return c.json({ error: 'Account locked due to too many failed login attempts. Contact administrator.' }, 423);
      }
      
      await logAccessEvent(userRecord.id, userRecord.name, 'login', false, deviceInfo, 'Invalid password');
      return c.json({ error: 'Invalid email or password' }, 401);
    }
    
    // Check if account is locked or suspended
    if (userRecord.status === 'locked') {
      await logAccessEvent(userRecord.id, userRecord.name, 'login', false, deviceInfo, 'Account locked');
      return c.json({ error: 'Account is locked. Contact administrator.' }, 423);
    }
    
    if (userRecord.status === 'suspended') {
      await logAccessEvent(userRecord.id, userRecord.name, 'login', false, deviceInfo, 'Account suspended');
      return c.json({ error: 'Account is suspended. Contact administrator.' }, 403);
    }
    
    // Detect anomalies
    const anomalies = await detectAnomalies(userRecord.id, deviceInfo);
    
    if (anomalies.length > 0) {
      // Log anomalies
      for (const anomaly of anomalies) {
        const alertId = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await kv.set(`auth:anomaly:${alertId}`, {
          id: alertId,
          userId: userRecord.id,
          userName: userRecord.name,
          userRole: userRecord.role,
          anomalyType: anomaly.type,
          severity: anomaly.severity,
          deviceId: deviceInfo.deviceId,
          ipAddress: deviceInfo.ipAddress,
          location: deviceInfo.location,
          timestamp: new Date().toISOString(),
          details: anomaly.details,
          resolved: false
        });
      }
    }
    
    // Check if MFA is required
    const securitySettings = await kv.get('auth:security_settings');
    const mfaRequired = userRecord.mfaEnabled || 
                       securitySettings?.mfaRequired || 
                       securitySettings?.mfaRequiredForRoles?.includes(userRecord.role);
    
    if (mfaRequired) {
      // Generate and send MFA code
      const mfaCode = generateMFACode();
      const mfaCodeHash = hashPassword(mfaCode).hash;
      
      await kv.set(`auth:mfa:${userRecord.id}`, {
        userId: userRecord.id,
        method: userRecord.mfaMethod || 'email',
        code: mfaCodeHash,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 5 * 60000).toISOString(), // 5 minutes
        attempts: 0,
        verified: false
      });
      
      // TODO: Send MFA code via email/SMS
      console.log(`📧 MFA Code for ${email}: ${mfaCode}`);
      
      return c.json({ requiresMFA: true, userId: userRecord.id });
    }
    
    // Create session
    const session = await createSession(userRecord, deviceInfo);
    
    // Reset failed login attempts
    userRecord.failedLoginAttempts = 0;
    userRecord.lastLogin = new Date().toISOString();
    await kv.set(`auth:user:${userRecord.id}`, userRecord);
    
    // Log successful login
    await logAccessEvent(userRecord.id, userRecord.name, 'login', true, deviceInfo, null, anomalies.length > 0);
    
    return c.json({
      user: sanitizeUser(userRecord),
      session,
      requiresMFA: false
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// VERIFY MFA
authApp.post('/verify-mfa', async (c) => {
  try {
    const { userId, code } = await c.req.json();
    
    const mfaRecord = await kv.get(`auth:mfa:${userId}`);
    
    if (!mfaRecord) {
      return c.json({ error: 'MFA verification not initiated' }, 400);
    }
    
    // Check expiration
    if (new Date() > new Date(mfaRecord.expiresAt)) {
      await kv.del(`auth:mfa:${userId}`);
      return c.json({ error: 'MFA code expired. Please login again.' }, 410);
    }
    
    // Check attempts
    if (mfaRecord.attempts >= 3) {
      await kv.del(`auth:mfa:${userId}`);
      return c.json({ error: 'Too many failed attempts. Please login again.' }, 429);
    }
    
    // Verify code
    const isValidCode = verifyPassword(code, mfaRecord.code, '');
    
    if (!isValidCode) {
      mfaRecord.attempts += 1;
      await kv.set(`auth:mfa:${userId}`, mfaRecord);
      return c.json({ error: 'Invalid MFA code' }, 401);
    }
    
    // MFA verified - get user and create session
    const userRecord = await kv.get(`auth:user:${userId}`);
    
    // Get device info from temporary storage (set during login)
    const deviceInfo = await kv.get(`auth:temp_device:${userId}`);
    
    const session = await createSession(userRecord, deviceInfo);
    
    // Clean up
    await kv.del(`auth:mfa:${userId}`);
    await kv.del(`auth:temp_device:${userId}`);
    
    // Update user
    userRecord.failedLoginAttempts = 0;
    userRecord.lastLogin = new Date().toISOString();
    await kv.set(`auth:user:${userRecord.id}`, userRecord);
    
    // Log MFA verification
    await logAccessEvent(userRecord.id, userRecord.name, 'mfa_verification', true, deviceInfo);
    
    return c.json({
      user: sanitizeUser(userRecord),
      session
    });
    
  } catch (error) {
    console.error('MFA verification error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// LOGOUT
authApp.post('/logout', async (c) => {
  try {
    const { sessionId } = await c.req.json();
    
    const session = await kv.get(`auth:session:${sessionId}`);
    
    if (session) {
      session.isActive = false;
      await kv.set(`auth:session:${sessionId}`, session);
      
      await logAccessEvent(
        session.userId,
        session.userName || 'Unknown',
        'logout',
        true,
        {
          deviceId: session.deviceId,
          deviceName: session.deviceName,
          deviceType: session.deviceType,
          browser: session.browser,
          ipAddress: session.ipAddress
        }
      );
    }
    
    return c.json({ success: true });
    
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET SESSION
authApp.get('/session', async (c) => {
  try {
    // Get from Authorization header
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return c.json({ error: 'No token provided' }, 401);
    }
    
    // In production, verify JWT token with Supabase
    // For now, use a simple session lookup
    const sessions = await kv.getByPrefix('auth:session:');
    const session = sessions.find((s: any) => s.isActive);
    
    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }
    
    const user = await kv.get(`auth:user:${session.userId}`);
    
    return c.json({
      user: sanitizeUser(user),
      session
    });
    
  } catch (error) {
    console.error('Session error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// REFRESH SESSION
authApp.post('/refresh-session', async (c) => {
  try {
    const { sessionId } = await c.req.json();
    
    const session = await kv.get(`auth:session:${sessionId}`);
    
    if (!session || !session.isActive) {
      return c.json({ error: 'Session not found or inactive' }, 404);
    }
    
    // Update last activity
    session.lastActivity = new Date().toISOString();
    await kv.set(`auth:session:${sessionId}`, session);
    
    return c.json(session);
    
  } catch (error) {
    console.error('Refresh session error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET ACCESS LOGS
authApp.get('/access-logs', async (c) => {
  try {
    const { userId, startDate, endDate, action, success, anomalyOnly } = c.req.query();
    
    let logs = await kv.getByPrefix('auth:access_log:');
    
    // Apply filters
    if (userId) {
      logs = logs.filter((log: any) => log.userId === userId);
    }
    
    if (startDate) {
      logs = logs.filter((log: any) => log.timestamp >= startDate);
    }
    
    if (endDate) {
      logs = logs.filter((log: any) => log.timestamp <= endDate);
    }
    
    if (action) {
      logs = logs.filter((log: any) => log.action === action);
    }
    
    if (success !== undefined) {
      const successBool = success === 'true';
      logs = logs.filter((log: any) => log.success === successBool);
    }
    
    if (anomalyOnly === 'true') {
      logs = logs.filter((log: any) => log.anomalyDetected);
    }
    
    // Sort by timestamp desc
    logs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return c.json(logs);
    
  } catch (error) {
    console.error('Access logs error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET ANOMALY ALERTS
authApp.get('/anomaly-alerts', async (c) => {
  try {
    const { userId, severity, resolved, startDate, endDate } = c.req.query();
    
    let alerts = await kv.getByPrefix('auth:anomaly:');
    
    if (userId) {
      alerts = alerts.filter((alert: any) => alert.userId === userId);
    }
    
    if (severity) {
      alerts = alerts.filter((alert: any) => alert.severity === severity);
    }
    
    if (resolved !== undefined) {
      const resolvedBool = resolved === 'true';
      alerts = alerts.filter((alert: any) => alert.resolved === resolvedBool);
    }
    
    if (startDate) {
      alerts = alerts.filter((alert: any) => alert.timestamp >= startDate);
    }
    
    if (endDate) {
      alerts = alerts.filter((alert: any) => alert.timestamp <= endDate);
    }
    
    alerts.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return c.json(alerts);
    
  } catch (error) {
    console.error('Anomaly alerts error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// RESOLVE ANOMALY
authApp.post('/resolve-anomaly', async (c) => {
  try {
    const { anomalyId, resolvedBy, resolution } = await c.req.json();
    
    const alert = await kv.get(`auth:anomaly:${anomalyId}`);
    
    if (!alert) {
      return c.json({ error: 'Anomaly not found' }, 404);
    }
    
    alert.resolved = true;
    alert.resolvedBy = resolvedBy;
    alert.resolvedAt = new Date().toISOString();
    alert.resolution = resolution;
    
    await kv.set(`auth:anomaly:${anomalyId}`, alert);
    
    return c.json({ success: true });
    
  } catch (error) {
    console.error('Resolve anomaly error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET SECURITY SETTINGS
authApp.get('/security-settings', async (c) => {
  try {
    let settings = await kv.get('auth:security_settings');
    
    if (!settings) {
      // Return default settings
      settings = getDefaultSecuritySettings();
      await kv.set('auth:security_settings', settings);
    }
    
    return c.json(settings);
    
  } catch (error) {
    console.error('Security settings error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// UPDATE SECURITY SETTINGS
authApp.put('/security-settings', async (c) => {
  try {
    const updates = await c.req.json();
    
    let settings = await kv.get('auth:security_settings');
    
    if (!settings) {
      settings = getDefaultSecuritySettings();
    }
    
    // Merge updates
    settings = { ...settings, ...updates };
    
    await kv.set('auth:security_settings', settings);
    
    return c.json(settings);
    
  } catch (error) {
    console.error('Update security settings error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// AUDIT LOG
authApp.post('/audit-log', async (c) => {
  try {
    const entry = await c.req.json();
    
    const logId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await kv.set(`auth:audit_log:${logId}`, {
      id: logId,
      ...entry,
      complianceRelevant: isComplianceRelevant(entry.action)
    });
    
    return c.json({ success: true });
    
  } catch (error) {
    console.error('Audit log error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET AUDIT TRAIL
authApp.get('/audit-trail', async (c) => {
  try {
    const { userId, action, resource, startDate, endDate, complianceRelevant } = c.req.query();
    
    let logs = await kv.getByPrefix('auth:audit_log:');
    
    if (userId) {
      logs = logs.filter((log: any) => log.userId === userId);
    }
    
    if (action) {
      logs = logs.filter((log: any) => log.action === action);
    }
    
    if (resource) {
      logs = logs.filter((log: any) => log.resource === resource);
    }
    
    if (startDate) {
      logs = logs.filter((log: any) => log.timestamp >= startDate);
    }
    
    if (endDate) {
      logs = logs.filter((log: any) => log.timestamp <= endDate);
    }
    
    if (complianceRelevant === 'true') {
      logs = logs.filter((log: any) => log.complianceRelevant);
    }
    
    logs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return c.json(logs);
    
  } catch (error) {
    console.error('Audit trail error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Helper functions
async function createSession(user: any, deviceInfo: any) {
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const securitySettings = await kv.get('auth:security_settings');
  const timeoutMinutes = user.sessionTimeoutMinutes || 
                        securitySettings?.sessionTimeoutByRole?.[user.role] || 
                        securitySettings?.defaultSessionTimeoutMinutes || 
                        30;
  
  const absoluteMaxHours = securitySettings?.absoluteSessionMaxHours || 8;
  
  const session = {
    id: sessionId,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    deviceId: deviceInfo.deviceId,
    deviceName: deviceInfo.deviceName,
    deviceType: deviceInfo.deviceType,
    browser: deviceInfo.browser,
    ipAddress: deviceInfo.ipAddress,
    location: deviceInfo.location,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + absoluteMaxHours * 3600000).toISOString(),
    lastActivity: new Date().toISOString(),
    mfaVerified: true,
    isActive: true
  };
  
  await kv.set(`auth:session:${sessionId}`, session);
  await kv.set(`auth:session:user:${user.id}:${sessionId}`, session);
  
  // Register device
  await registerDevice(user.id, deviceInfo);
  
  return session;
}

async function registerDevice(userId: string, deviceInfo: any) {
  const existingDevice = await kv.get(`auth:device:${deviceInfo.deviceId}`);
  
  if (existingDevice) {
    existingDevice.lastSeen = new Date().toISOString();
    existingDevice.accessCount += 1;
    await kv.set(`auth:device:${deviceInfo.deviceId}`, existingDevice);
  } else {
    const device = {
      deviceId: deviceInfo.deviceId,
      userId,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      approved: true, // Auto-approve for now
      userAgent: deviceInfo.browser,
      screenResolution: deviceInfo.screenResolution,
      timezone: deviceInfo.timezone,
      language: deviceInfo.language,
      platform: deviceInfo.platform,
      trusted: false,
      accessCount: 1
    };
    
    await kv.set(`auth:device:${deviceInfo.deviceId}`, device);
    await kv.set(`auth:device:user:${userId}:${deviceInfo.deviceId}`, device);
  }
}

async function logAccessEvent(
  userId: string | null,
  userName: string | null,
  action: string,
  success: boolean,
  deviceInfo: any,
  failureReason?: string | null,
  anomalyDetected?: boolean
) {
  const logId = `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const log = {
    id: logId,
    userId,
    userName,
    userRole: null, // Will be filled if user exists
    action,
    success,
    failureReason: failureReason || undefined,
    anomalyDetected: anomalyDetected || false,
    deviceId: deviceInfo.deviceId,
    deviceName: deviceInfo.deviceName,
    deviceType: deviceInfo.deviceType,
    browser: deviceInfo.browser,
    ipAddress: deviceInfo.ipAddress,
    location: deviceInfo.location,
    timestamp: new Date().toISOString()
  };
  
  await kv.set(`auth:access_log:${logId}`, log);
  
  if (userId) {
    await kv.set(`auth:access_log:user:${userId}:${logId}`, log);
  }
}

function sanitizeUser(user: any) {
  const { passwordHash, passwordSalt, ...safeUser } = user;
  return safeUser;
}

function isComplianceRelevant(action: string): boolean {
  const relevantActions = [
    'create_medication',
    'edit_medication',
    'delete_medication',
    'fill_medication',
    'approve_medication',
    'create_care_plan',
    'edit_care_plan',
    'sign_document',
    'update_patient_record',
    'export_data',
    'change_security_settings',
    'create_user',
    'delete_user',
    'change_user_role'
  ];
  
  return relevantActions.includes(action);
}

function getDefaultSecuritySettings() {
  return {
    mfaRequired: false,
    mfaRequiredForRoles: ['clinical_supervisor', 'system_admin'],
    mfaGracePeriodDays: 7,
    defaultSessionTimeoutMinutes: 30,
    sessionTimeoutByRole: {
      primary_caregiver: 60,
      secondary_caregiver: 45,
      clinical_supervisor: 120,
      system_admin: 180
    },
    absoluteSessionMaxHours: 8,
    allowMultipleSessions: true,
    passwordMinLength: 12,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
    passwordExpirationDays: 90,
    passwordHistoryCount: 5,
    maxFailedLoginAttempts: 5,
    lockoutDurationMinutes: 30,
    lockoutPermanentAfterAttempts: 10,
    anomalyDetectionEnabled: true,
    alertOnNewDevice: true,
    alertOnUnusualLocation: true,
    alertOnUnusualTime: false,
    alertOnRapidLocationChange: true,
    impossibleTravelSpeedMph: 600,
    logRetentionDays: 2555, // 7 years for FDA compliance
    auditLogEnabled: true,
    maxDevicesPerUser: 5,
    requireDeviceApproval: false,
    ipWhitelistEnabled: false,
    allowedIpRanges: [],
    updatedAt: new Date().toISOString(),
    updatedBy: 'system'
  };
}

export default authApp;
