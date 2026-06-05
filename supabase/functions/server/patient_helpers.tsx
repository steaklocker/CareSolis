// Patient-scoped helper functions for multi-patient architecture
import * as db from "./db.tsx";

// Re-export the canonical key-space from the data-access module so
// callers have a single import for both helpers and key constants.
export const PATIENT_KEYS = db.KEYS;

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
