// Patient-scoped helper functions for multi-patient architecture
import * as kv from "./kv_store.tsx";

// Patient-scoped key generators - ensures data isolation between patients
export const PATIENT_KEYS = {
  STATE: (patientId: string) => `mds:patient:${patientId}:device:state:v1`,
  CONFIG: (patientId: string) => `mds:patient:${patientId}:device:config:v2`,
  AUDIT_PREFIX: (patientId: string) => `mds:patient:${patientId}:audit:`,
  CONTACT_PREFIX: (patientId: string) => `mds:patient:${patientId}:directory:`,
  NOTIFICATIONS_PREFIX: (patientId: string) => `mds:patient:${patientId}:notifications:`,
  EVENTS_PREFIX: (patientId: string) => `mds:patient:${patientId}:events:`,
  DOCS_LIBRARY: (patientId: string) => `mds:patient:${patientId}:docs:library`,
  SETTINGS: (patientId: string) => `mds:patient:${patientId}:settings:v1`,
  MEDICATIONS: (patientId: string) => `mds:patient:${patientId}:medications`,
  PROFILE: (patientId: string) => `patient:${patientId}:profile`,
  // Global keys (not patient-specific)
  GLOBAL_AUDIT_PREFIX: "mds:global:audit:",
};

// Extract patientId from request - checks query param, body, or URL param
export function getPatientId(c: any): string | null {
  // Try query param first
  const queryPatientId = c.req.query('patientId');
  if (queryPatientId) return queryPatientId;
  
  // Try URL param
  const paramPatientId = c.req.param('patientId');
  if (paramPatientId) return paramPatientId;
  
  // Try body (for POST/PUT requests) - this is async, so caller needs to handle
  return null;
}

// Get patientId from body for POST requests
export async function getPatientIdFromBody(c: any): Promise<string | null> {
  try {
    const body = await c.req.json();
    return body.patientId || null;
  } catch {
    return null;
  }
}

// Validate that patientId is provided
export function requirePatientId(patientId: string | null): string {
  if (!patientId) {
    throw new Error('patientId is required');
  }
  return patientId;
}
