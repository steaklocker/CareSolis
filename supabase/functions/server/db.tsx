/**
 * DATA ACCESS MODULE
 *
 * All KV reads/writes go through here. To swap the backing store (KV → Supabase
 * tables, Redis, etc.) change only this file — callers stay untouched.
 *
 * Key-space catalogue:
 *   mds:patient:{id}:device:state:v1          DeviceState
 *   mds:patient:{id}:device:config:v2         SystemConfig
 *   mds:patient:{id}:audit:{ts}_{uuid}        AuditEntry
 *   mds:patient:{id}:directory:{contactId}    ContactRecord
 *   mds:patient:{id}:notifications:{ms}_{id}  NotificationEntry
 *   mds:patient:{id}:events:{YYYY-MM-DD}      InteractionEvent[]
 *   mds:patient:{id}:docs:library             DocsLibrary
 *   mds:patient:{id}:settings:v1              PatientSettings
 *   mds:global:audit:{ts}_{uuid}              GlobalAuditEntry
 *   mds:medications:v3                        Medication[]
 *   mds:medications:schedule:v1               ScheduleObject
 *   mds:dose-events:v1                        DoseEvent[]
 *   mds:manual:updates:{ts}_{uuid}            ManualUpdate
 *   mds:environment:location:v1               LocationData
 *   mds:audit:location:{ms}:{uuid}            LocationAuditEntry
 *   patient:{id}:profile                      PatientProfile
 *   notifications:{userId}                    UserNotification[]  (JSON-serialised)
 *   billing:pathways:settings                 BillingPathways
 *   contacts:{patientId}                      Contact[]
 *   legal:acknowledgments:{patientId}         LegalAck
 *   rpm:enrollment:{patientId}                RpmEnrollment
 *   device:{deviceId}:config                  DeviceConfig
 *   device:{deviceId}:patient                 patientId (string)
 *   config:{patientId}                        OnboardingConfig
 *   audit:{patientId}                         OnboardingAuditLog[]
 *   chute:state:{patientId}                   ChuteState
 *   chute:dose:{doseId}                       DoseInChute
 *   chute:logs:{patientId}                    ChuteLog[]
 *   chute:pending_actions:{patientId}         PendingCaregiverAction[]
 *   audit:chute:{logId}                       ChuteAuditEntry
 *   auth:user:{id}                            UserRecord
 *   auth:user:email:{email}                   UserRecord
 *   auth:session:{sessionId}                  SessionRecord
 *   auth:session:user:{userId}:{sessionId}    SessionRecord
 *   auth:device:{deviceId}                    DeviceRecord
 *   auth:device:user:{userId}:{deviceId}      DeviceRecord
 *   auth:mfa:{userId}                         MfaRecord
 *   auth:temp_device:{userId}                 TempDeviceRecord
 *   auth:anomaly:{alertId}                    AnomalyAlert
 *   auth:access_log:{logId}                   AccessLog
 *   auth:access_log:user:{userId}:{logId}     AccessLog
 *   auth:audit_log:{logId}                    AuthAuditLog
 *   auth:security_settings                    SecuritySettings
 */

import * as kv from "./kv_store.tsx";

// ── key builders ─────────────────────────────────────────────────────────────

export const KEYS = {
  // patient device
  STATE:                (patientId: string) => `mds:patient:${patientId}:device:state:v1`,
  CONFIG:               (patientId: string) => `mds:patient:${patientId}:device:config:v2`,
  AUDIT_PREFIX:         (patientId: string) => `mds:patient:${patientId}:audit:`,
  CONTACT_PREFIX:       (patientId: string) => `mds:patient:${patientId}:directory:`,
  NOTIFICATIONS_PREFIX: (patientId: string) => `mds:patient:${patientId}:notifications:`,
  EVENTS_PREFIX:        (patientId: string) => `mds:patient:${patientId}:events:`,
  DOCS_LIBRARY:         "mds:docs:library:v1",
  SETTINGS:             (patientId: string) => `mds:patient:${patientId}:settings:v1`,
  // global
  GLOBAL_AUDIT_PREFIX: "mds:global:audit:",
  // medications
  MEDICATIONS:          "mds:medications:v3",
  MED_SCHEDULE:         "mds:medications:schedule:v1",
  DOSE_EVENTS:          "mds:dose-events:v1",
  // environment
  LOCATION:             "mds:environment:location:v1",
  // billing
  BILLING_PATHWAYS:     "billing:pathways:settings",
  // chute
  CHUTE_STATE:               (patientId: string) => `chute:state:${patientId}`,
  DOSE_IN_PROGRESS:          (doseId: string)    => `chute:dose:${doseId}`,
  CHUTE_LOGS:                (patientId: string) => `chute:logs:${patientId}`,
  PENDING_CAREGIVER_ACTIONS: (patientId: string) => `chute:pending_actions:${patientId}`,
};

// ── patient device state ──────────────────────────────────────────────────────

export const getDeviceState      = (id: string)        => kv.get(KEYS.STATE(id));
export const setDeviceState      = (id: string, v: unknown) => kv.set(KEYS.STATE(id), v);
export const deleteDeviceState   = (id: string)        => kv.del(KEYS.STATE(id));

// ── patient device config ─────────────────────────────────────────────────────

export const getDeviceConfig     = (id: string)        => kv.get(KEYS.CONFIG(id));
export const setDeviceConfig     = (id: string, v: unknown) => kv.set(KEYS.CONFIG(id), v);

// ── patient audit logs ────────────────────────────────────────────────────────

export const getPatientAuditLogs = (id: string)        => kv.getByPrefix(KEYS.AUDIT_PREFIX(id));
export const appendPatientAuditLog = (id: string, ts: string, uuid: string, entry: unknown) =>
  kv.set(`${KEYS.AUDIT_PREFIX(id)}${ts}_${uuid}`, entry);

// ── global audit ──────────────────────────────────────────────────────────────

export const appendGlobalAuditLog = (ts: string, uuid: string, entry: unknown) =>
  kv.set(`${KEYS.GLOBAL_AUDIT_PREFIX}${ts}_${uuid}`, entry);

// ── contacts ──────────────────────────────────────────────────────────────────

export const getContacts    = (id: string)                        => kv.getByPrefix(KEYS.CONTACT_PREFIX(id));
export const setContact     = (id: string, contactId: string, v: unknown) =>
  kv.set(`${KEYS.CONTACT_PREFIX(id)}${contactId}`, v);
export const deleteContact  = (id: string, contactId: string)    =>
  kv.del(`${KEYS.CONTACT_PREFIX(id)}${contactId}`);

// ── notifications (per-patient device log) ────────────────────────────────────

export const getPatientNotificationLogs = (id: string) => kv.getByPrefix(KEYS.NOTIFICATIONS_PREFIX(id));
export const appendPatientNotificationLog = (id: string, ms: number, uuid: string, entry: unknown) =>
  kv.set(`${KEYS.NOTIFICATIONS_PREFIX(id)}${ms}_${uuid}`, entry);

// ── events ────────────────────────────────────────────────────────────────────

export const getEvents  = (id: string, date: string) => kv.get(`${KEYS.EVENTS_PREFIX(id)}${date}`);
export const setEvents  = (id: string, date: string, v: unknown) =>
  kv.set(`${KEYS.EVENTS_PREFIX(id)}${date}`, v);

// archive helpers
export const getArchivedEvents  = (id: string, date: string) => kv.get(`events:archive:${id}:${date}`);
export const setArchivedEvents  = (id: string, date: string, v: unknown) =>
  kv.set(`events:archive:${id}:${date}`, v);
export const deleteEventsForDate = (id: string, date: string) =>
  kv.del(`${KEYS.EVENTS_PREFIX(id)}${date}`);
export const getAllArchivedEvents = () => kv.getByPrefix("events:archive:");

// ── patient settings ──────────────────────────────────────────────────────────

export const getPatientSettings  = (id: string)        => kv.get(KEYS.SETTINGS(id));
export const setPatientSettings  = (id: string, v: unknown) => kv.set(KEYS.SETTINGS(id), v);

// ── patient profile (legacy flat key used by onboarding / demo init) ──────────

export const getPatientProfile   = (id: string)        => kv.get(`patient:${id}:profile`);
export const setPatientProfile   = (id: string, v: unknown) => kv.set(`patient:${id}:profile`, v);
export const getAllPatients       = ()                  => kv.getByPrefix("patient:");

// ── user notifications (frontend-facing per-user list, JSON-serialised) ────────

export const getUserNotifications   = (userId: string) => kv.get(`notifications:${userId}`);
export const setUserNotifications   = (userId: string, v: unknown) =>
  kv.set(`notifications:${userId}`, typeof v === "string" ? v : JSON.stringify(v));

// ── medications ───────────────────────────────────────────────────────────────

export const getMedications        = ()               => kv.get(KEYS.MEDICATIONS);
export const setMedications        = (v: unknown)     => kv.set(KEYS.MEDICATIONS, v);

export const getMedicationSchedule = ()               => kv.get(KEYS.MED_SCHEDULE);
export const setMedicationSchedule = (v: unknown)     => kv.set(KEYS.MED_SCHEDULE, v);

export const getDoseEvents         = ()               => kv.get(KEYS.DOSE_EVENTS);
export const setDoseEvents         = (v: unknown)     => kv.set(KEYS.DOSE_EVENTS, v);

export const appendManualUpdate    = (ts: string, uuid: string, entry: unknown) =>
  kv.set(`mds:manual:updates:${ts}_${uuid}`, entry);

// ── environment / location ────────────────────────────────────────────────────

export const getLocation      = ()           => kv.get(KEYS.LOCATION);
export const setLocation      = (v: unknown) => kv.set(KEYS.LOCATION, v);
export const appendLocationAuditLog = (ms: number, uuid: string, entry: unknown) =>
  kv.set(`mds:audit:location:${ms}:${uuid}`, entry);

// ── billing ───────────────────────────────────────────────────────────────────

export const getBillingPathways  = ()           => kv.get(KEYS.BILLING_PATHWAYS);
export const setBillingPathways  = (v: unknown) => kv.set(KEYS.BILLING_PATHWAYS, v);

// ── onboarding (uses flatter legacy keys) ─────────────────────────────────────

export const getOnboardingContacts     = (id: string)        => kv.get(`contacts:${id}`);
export const setOnboardingContacts     = (id: string, v: unknown) => kv.set(`contacts:${id}`, v);

export const getLegalAcknowledgment    = (id: string)        => kv.get(`legal:acknowledgments:${id}`);
export const setLegalAcknowledgment    = (id: string, v: unknown) => kv.set(`legal:acknowledgments:${id}`, v);

export const getRpmEnrollment          = (id: string)        => kv.get(`rpm:enrollment:${id}`);
export const setRpmEnrollment          = (id: string, v: unknown) => kv.set(`rpm:enrollment:${id}`, v);

export const getHardwareDeviceConfig   = (deviceId: string)  => kv.get(`device:${deviceId}:config`);
export const setHardwareDeviceConfig   = (deviceId: string, v: unknown) => kv.set(`device:${deviceId}:config`, v);

export const getHardwareDevicePatient  = (deviceId: string)  => kv.get(`device:${deviceId}:patient`);
export const setHardwareDevicePatient  = (deviceId: string, patientId: string) =>
  kv.set(`device:${deviceId}:patient`, patientId);

export const getOnboardingConfig       = (id: string)        => kv.get(`config:${id}`);
export const setOnboardingConfig       = (id: string, v: unknown) => kv.set(`config:${id}`, v);

export const getOnboardingAudit        = (id: string)        => kv.get(`audit:${id}`);
export const setOnboardingAudit        = (id: string, v: unknown) => kv.set(`audit:${id}`, v);

// ── chute management ──────────────────────────────────────────────────────────

export const getChuteState              = (id: string)        => kv.get(KEYS.CHUTE_STATE(id));
export const setChuteState              = (id: string, v: unknown) => kv.set(KEYS.CHUTE_STATE(id), v);

export const getDoseInProgress          = (doseId: string)    => kv.get(KEYS.DOSE_IN_PROGRESS(doseId));
export const setDoseInProgress          = (doseId: string, v: unknown) => kv.set(KEYS.DOSE_IN_PROGRESS(doseId), v);

export const getChuteLogs               = (id: string)        => kv.get(KEYS.CHUTE_LOGS(id));
export const setChuteLogs               = (id: string, v: unknown) => kv.set(KEYS.CHUTE_LOGS(id), v);

export const getPendingCaregiverActions = (id: string)        => kv.get(KEYS.PENDING_CAREGIVER_ACTIONS(id));
export const setPendingCaregiverActions = (id: string, v: unknown) =>
  kv.set(KEYS.PENDING_CAREGIVER_ACTIONS(id), v);

export const appendChuteAudit           = (logId: string, entry: unknown) =>
  kv.set(`audit:chute:${logId}`, entry);

// ── auth: users ───────────────────────────────────────────────────────────────

export const getUserById        = (id: string)     => kv.get(`auth:user:${id}`);
export const setUserById        = (id: string, v: unknown) => kv.set(`auth:user:${id}`, v);

export const getUserByEmail     = (email: string)  => kv.get(`auth:user:email:${email}`);
export const setUserByEmail     = (email: string, v: unknown) => kv.set(`auth:user:email:${email}`, v);

export const getAllUsers         = ()               => kv.getByPrefix("auth:user:email:");

// ── auth: sessions ────────────────────────────────────────────────────────────

export const getSession         = (sid: string)    => kv.get(`auth:session:${sid}`);
export const setSession         = (sid: string, v: unknown) => kv.set(`auth:session:${sid}`, v);
export const getAllSessions      = ()               => kv.getByPrefix("auth:session:");

export const setUserSession     = (userId: string, sid: string, v: unknown) =>
  kv.set(`auth:session:user:${userId}:${sid}`, v);
export const getUserSessions    = (userId: string) => kv.getByPrefix(`auth:session:user:${userId}:`);

// ── auth: devices ─────────────────────────────────────────────────────────────

export const getAuthDevice      = (deviceId: string) => kv.get(`auth:device:${deviceId}`);
export const setAuthDevice      = (deviceId: string, v: unknown) => kv.set(`auth:device:${deviceId}`, v);

export const setUserAuthDevice  = (userId: string, deviceId: string, v: unknown) =>
  kv.set(`auth:device:user:${userId}:${deviceId}`, v);
export const getUserAuthDevices = (userId: string) => kv.getByPrefix(`auth:device:user:${userId}:`);

// ── auth: MFA & temp device ───────────────────────────────────────────────────

export const getMfaRecord       = (userId: string) => kv.get(`auth:mfa:${userId}`);
export const setMfaRecord       = (userId: string, v: unknown) => kv.set(`auth:mfa:${userId}`, v);
export const deleteMfaRecord    = (userId: string) => kv.del(`auth:mfa:${userId}`);

export const getTempDevice      = (userId: string) => kv.get(`auth:temp_device:${userId}`);
export const setTempDevice      = (userId: string, v: unknown) => kv.set(`auth:temp_device:${userId}`, v);
export const deleteTempDevice   = (userId: string) => kv.del(`auth:temp_device:${userId}`);

// ── auth: anomalies ───────────────────────────────────────────────────────────

export const getAnomaly         = (alertId: string) => kv.get(`auth:anomaly:${alertId}`);
export const setAnomaly         = (alertId: string, v: unknown) => kv.set(`auth:anomaly:${alertId}`, v);
export const getAllAnomalies     = ()                => kv.getByPrefix("auth:anomaly:");

// ── auth: access logs ─────────────────────────────────────────────────────────

export const getAllAccessLogs    = ()               => kv.getByPrefix("auth:access_log:");
export const appendAccessLog    = (logId: string, v: unknown) => kv.set(`auth:access_log:${logId}`, v);
export const appendUserAccessLog = (userId: string, logId: string, v: unknown) =>
  kv.set(`auth:access_log:user:${userId}:${logId}`, v);
export const getUserAccessLogs  = (userId: string) => kv.getByPrefix(`auth:access_log:user:${userId}`);

// ── auth: audit logs ──────────────────────────────────────────────────────────

export const getAllAuthAuditLogs  = ()               => kv.getByPrefix("auth:audit_log:");
export const appendAuthAuditLog   = (logId: string, v: unknown) => kv.set(`auth:audit_log:${logId}`, v);

// ── auth: security settings ───────────────────────────────────────────────────

export const getSecuritySettings  = ()           => kv.get("auth:security_settings");
export const setSecuritySettings  = (v: unknown) => kv.set("auth:security_settings", v);

// ── docs library (global) ─────────────────────────────────────────────────────

export const getDocsLibrary  = ()           => kv.get(KEYS.DOCS_LIBRARY);
export const setDocsLibrary  = (v: unknown) => kv.set(KEYS.DOCS_LIBRARY, v);

// ── RPM / billing ─────────────────────────────────────────────────────────────

export const getRpmEnrollmentGlobal   = ()                 => kv.get("rpm:enrollment");
export const setRpmEnrollmentGlobal   = (v: unknown)       => kv.set("rpm:enrollment", v);
export const getRpmActivities         = (month: string)    => kv.get(`rpm:activities:${month}`);
export const setRpmActivities         = (month: string, v: unknown) => kv.set(`rpm:activities:${month}`, v);
export const getRpmConsent            = (name: string)     => kv.get(`rpm:consent:${name}`);
export const setRpmConsent            = (name: string, v: unknown)  => kv.set(`rpm:consent:${name}`, v);
export const getMedicationAssignments = ()                 => kv.get("medications:assignments");

// ── malfunction reports ───────────────────────────────────────────────────────

export const getMalfunctionReport     = (id: string)       => kv.get(`malfunction:${id}`);
export const setMalfunctionReport     = (id: string, v: unknown) => kv.set(`malfunction:${id}`, v);
export const getDeviceMalfunctions    = (deviceId: string) => kv.get(`malfunction:device:${deviceId}`);
export const setDeviceMalfunctions    = (deviceId: string, v: unknown) => kv.set(`malfunction:device:${deviceId}`, v);
export const getAllMalfunctionReports = ()                 => kv.getByPrefix("malfunction:");
export const getFdaMalfunctionQueue   = ()                 => kv.get("malfunction:fda-queue");
export const setFdaMalfunctionQueue   = (v: unknown)       => kv.set("malfunction:fda-queue", v);

// ── static content docs ───────────────────────────────────────────────────────

export const getCaregiverManual       = ()           => kv.get("caregiver:manual");
export const setCaregiverManual       = (v: unknown) => kv.set("caregiver:manual", v);
export const getSystemsInfraDoc       = ()           => kv.get("systems:infrastructure");
export const setSystemsInfraDoc       = (v: unknown) => kv.set("systems:infrastructure", v);

// ── escalation configs ────────────────────────────────────────────────────────

export const getEscalationConfigs     = ()           => kv.get("mds:escalation:configs:v1");
export const setEscalationConfigs     = (v: unknown) => kv.set("mds:escalation:configs:v1", v);
export const getEscalationChangeLog   = ()           => kv.get("mds:escalation:change_log:v1");
export const setEscalationChangeLog   = (v: unknown) => kv.set("mds:escalation:change_log:v1", v);
export const getEscalationOverrides   = ()           => kv.get("mds:escalation:overrides:v1");
export const setEscalationOverrides   = (v: unknown) => kv.set("mds:escalation:overrides:v1", v);

// ── compliance logs ───────────────────────────────────────────────────────────

export const getComplianceLog                = ()           => kv.get("mds:compliance:log:v1");
export const setComplianceLog                = (v: unknown) => kv.set("mds:compliance:log:v1", v);
export const getIntegrationApprovalLog       = ()           => kv.get("mds:integrations:approval_logs:v1");
export const setIntegrationApprovalLog       = (v: unknown) => kv.set("mds:integrations:approval_logs:v1", v);
export const getComplianceIntegrationApprovals    = ()           => kv.get("mds:compliance:integration_approvals:v1");
export const setComplianceIntegrationApprovals    = (v: unknown) => kv.set("mds:compliance:integration_approvals:v1", v);
export const getComplianceIntegrationRevocations  = ()           => kv.get("mds:compliance:integration_revocations:v1");
export const setComplianceIntegrationRevocations  = (v: unknown) => kv.set("mds:compliance:integration_revocations:v1", v);

// ── AI adherence ──────────────────────────────────────────────────────────────

export const getAiAdherenceScore   = ()           => kv.get("mds:ai:adherence:current:v1");
export const getAiAdherenceHistory = ()           => kv.get("mds:ai:adherence:history:v1");
export const getAiAdherenceOverrides = ()         => kv.get("mds:ai:overrides:v1");
export const setAiAdherenceOverrides = (v: unknown) => kv.set("mds:ai:overrides:v1", v);

// ── system metrics ────────────────────────────────────────────────────────────

export const getSystemMetrics = () => kv.get("mds:system:metrics:v1");

// ── med fill / refills ────────────────────────────────────────────────────────

export const getMedFill      = (patientId: string)        => kv.get(`med_fill:patient:${patientId}`);
export const setMedFill      = (patientId: string, v: unknown) => kv.set(`med_fill:patient:${patientId}`, v);
export const getMedFillMany  = (patientIds: string[])     => kv.mget(patientIds.map(id => `med_fill:patient:${id}`));
export const setMedFillBatch = (patientId: string, requestId: string, request: unknown, updatedFill: unknown) =>
  kv.mset([
    { key: `refill_request:${requestId}`, value: request },
    { key: `refill_requests:patient:${patientId}`, value: requestId },
    { key: `med_fill:patient:${patientId}`, value: updatedFill },
  ]);
export const getLatestRefillRequestId = (patientId: string) => kv.get(`refill_requests:patient:${patientId}`);
export const getRefillRequest         = (requestId: string) => kv.get(`refill_request:${requestId}`);
export const setRefillRequest         = (requestId: string, v: unknown) => kv.set(`refill_request:${requestId}`, v);

// ── low-level pass-throughs ───────────────────────────────────────────────────
// Use these only for one-off keys not yet promoted to named functions above.
// When swapping the backing store, implement Supabase equivalents here.

export const get         = kv.get;
export const set         = kv.set;
export const del         = kv.del;
export const getByPrefix = kv.getByPrefix;
export const mget        = kv.mget;
export const mset        = kv.mset;
