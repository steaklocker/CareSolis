import { usePatient } from '../context/PatientContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;

/**
 * Hook that provides patient-scoped API calls
 * Automatically includes the current patient ID in all requests
 */
export function usePatientAPI() {
  const { currentPatient } = usePatient();
  
  const patientFetch = async (
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const patientId = currentPatient?.id || '1';
    
    // Add patientId to query params or body depending on request type
    const url = new URL(`${SERVER_URL}${endpoint}`);
    
    // For GET requests, add patientId as query param
    if (!options.method || options.method === 'GET') {
      url.searchParams.set('patientId', patientId);
    }
    
    // For POST/PUT requests, add patientId to body
    if (options.method === 'POST' || options.method === 'PUT') {
      const body = options.body ? JSON.parse(options.body as string) : {};
      body.patientId = patientId;
      options.body = JSON.stringify(body);
    }
    
    // Ensure headers are set
    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${publicAnonKey}`);
    }
    
    return fetch(url.toString(), {
      ...options,
      headers
    });
  };
  
  return {
    patientFetch,
    currentPatientId: currentPatient?.id || '1',
    SERVER_URL
  };
}
