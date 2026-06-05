import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';
import { usePatient } from './PatientContext';
import { getTimeSync, initializeTimeSync, type TimeSyncStatus } from '../utils/timeSync';
import { getLocationSync, type LocationData } from '../utils/locationSync';

// v6.46.1 - Fixed patientId persistence for multi-patient support
const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;

// Fetch timeout in milliseconds
const FETCH_TIMEOUT = 8000;
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

/**
 * Defensive fetch wrapper with timeout protection
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = FETCH_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Fetch with automatic retry on failure
 */
async function fetchWithRetry(url: string, options: RequestInit = {}, retries = MAX_RETRIES): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options);
      return response;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on abort
      if (lastError.name === 'AbortError' || lastError.message.includes('aborted')) {
        throw lastError;
      }

      // Wait before retrying (except on last attempt)
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }

  throw lastError || new Error('Fetch failed after retries');
}

interface CaresolisContextType {
    statusData: any;
    health: any;
    logs: any[];
    contacts: any[];
    notifications: any[];
    settings: any;
    stabilityData: any[];
    stabilityScore: number;
    stabilityStatus: 'stable' | 'minor_drift' | 'significant_drift';
    isLoading: boolean;
    interact: () => Promise<void>;
    acknowledge: () => Promise<void>;
    updateSettings: (newSettings: any) => Promise<void>;
    addContact: (contact: any) => Promise<void>;
    updateContact: (contact: any) => Promise<void>;
    deleteContact: (id: string) => Promise<void>;
    refresh: () => void;
    forceClearCache: () => void; // NEW: Force clear server-side cache
    // Simulation
    timeOffset: number;
    simulateTime: (offset: number) => void;
    getNow: () => Date;
    // Location Sync
    locationData: LocationData;
    updateLocation: (newLocation: LocationData) => Promise<void>;
    // TIER 3: Caregiver Timezone (Session-Only, Never Persisted)
    caregiverTimezone: string;
    // Timezone Verification
    updatePatientTimezone: (timezone: string, reason: string) => Promise<void>;
    // Timezone Acknowledgment (Shift-based)
    acknowledgeTimezone: () => Promise<void>;
}

const CaresolisContext = createContext<CaresolisContextType | undefined>(undefined);

export function CaresolisProvider({ children }: { children: React.ReactNode }) {
    const { currentPatient, refreshPatient } = usePatient();
    const [statusData, setStatusData] = useState<any>({
        status: 'pending',
        lastInteraction: '--:--',
        nextScheduled: 'Checking...'
    });
    const [logs, setLogs] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>({});
    const [stabilityData, setStabilityData] = useState<any[]>([]);
    const [health, setHealth] = useState<any>({ system: 'Caresolis_Core_v1', status: 'unknown', integrity: 'unknown' });
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false); // CRITICAL: Track if data has been loaded at least once
    const [timeSyncStatus, setTimeSyncStatus] = useState<TimeSyncStatus | null>(null);
    
    // Simulation Mode State
    const [timeOffset, setTimeOffset] = useState(0);

    // STABILITY FIX: Request deduplication and loading locks
    const fetchLocksRef = React.useRef({
        status: false,
        logs: false,
        contacts: false,
        notifications: false,
        settings: false,
        stability: false,
        health: false
    });

    // STABILITY FIX: Abort controllers for cleanup
    const abortControllersRef = React.useRef<Map<string, AbortController>>(new Map());

    // Initialize TimeSync on mount
    useEffect(() => {
        const initSync = async () => {
            try {
                const timeSync = await initializeTimeSync({
                    serverUrl: SERVER_URL,
                    authToken: publicAnonKey,
                    maxAcceptableDrift: 30000, // 30 seconds (relaxed for development; tighten to 5000ms for production FDA compliance)
                    syncInterval: 60000 // 1 minute
                });

                // Subscribe to time sync status updates
                const unsubscribe = timeSync.subscribe((status) => {
                    setTimeSyncStatus(status);
                    
                    // Show warning if time drift is detected
                    if (!status.isSystemTimeAccurate && status.warningMessage) {
                        toast.warning(status.warningMessage, {
                            duration: 10000,
                            id: 'time-sync-warning',
                        });
                    }
                });

                return unsubscribe;
            } catch (error) {
                console.error('⏰ TimeSync: Initialization failed, using fallback', error);
                // Return no-op unsubscribe
                return () => {};
            }
        };

        let unsubscribe: (() => void) | undefined;
        initSync().then(unsub => { unsubscribe = unsub; }).catch(err => {
            console.error('⏰ TimeSync: Failed to initialize', err);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    // Helper to get current time with offset (for simulation mode) or synced time
    const getNow = useCallback(() => {
        try {
            // If in simulation mode, use offset
            if (timeOffset !== 0) {
                return new Date(Date.now() + timeOffset);
            }
            
            // Otherwise use time sync
            const timeSync = getTimeSync();
            return timeSync.getNow();
        } catch (error) {
            // Fallback to system time if any error occurs
            console.warn('⏰ getNow(): Falling back to system time', error);
            return new Date();
        }
    }, [timeOffset]);

    const fetchHealth = async () => {
        try {
            const res = await fetchWithTimeout(`${SERVER_URL}/health?t=${new Date().getTime()}`, {
                headers: { 'Authorization': `Bearer ${publicAnonKey}` }
            });
            if (res.ok) {
                const data = await res.json();
                setHealth(data);
            }
        } catch (e) {
            // Silent fallback - health check expected to fail on first load
            // Only set to degraded if we don't have existing health data
            if (!health || health.status === 'unknown') {
                setHealth({ system: 'Caresolis_Core_v1', status: 'degraded', integrity: 'unknown' });
            }
        }
    };

    // Fetch combined status from server
    const fetchStatus = async () => {
        try {
            const patientId = currentPatient?.id || '1';
            
            // Get patient's timezone (fallback to America/Los_Angeles for local dev)
            const patientTimezone = currentPatient?.timezone || settings?.timezone || 'America/Los_Angeles';
            
            console.log(`[fetchStatus] 🌍 Patient timezone: ${patientTimezone}`);
            
            // Get patient's local date and time using their timezone
            const now = new Date();
            const patientLocalDate = new Intl.DateTimeFormat('en-CA', { 
                timeZone: patientTimezone, 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
            }).format(now); // Returns YYYY-MM-DD
            
            const patientLocalTime = new Intl.DateTimeFormat('en-US', { 
                timeZone: patientTimezone, 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            }).format(now); // Returns HH:MM
            
            console.log(`[fetchStatus] 📅 Using patient timezone: ${patientTimezone}, date: ${patientLocalDate}, time: ${patientLocalTime}`);
            
            // CRITICAL FIX: Add cache-busting parameter to force fresh calculation
            // This prevents stale cached responses that don't reflect real-time state
            const cacheBuster = `&t=${Date.now()}`;
            const url = `${SERVER_URL}/status?patientId=${patientId}&date=${patientLocalDate}&localTime=${patientLocalTime}${cacheBuster}`;
            console.log(`[fetchStatus] 🌐 Calling: ${url}`);
            
            // ============================================================================
            // Fetch with retry logic for reliable initial connection
            // ============================================================================
            const res = await fetchWithRetry(url, {
                headers: { 'Authorization': `Bearer ${publicAnonKey}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                console.log('[fetchStatus] ✅ Received from backend:', JSON.stringify(data, null, 2));
                setStatusData(data);
                
                // Set initialized after first successful fetch
                setIsInitialized(true);
            } else {
                const errorText = await res.text().catch(() => 'Unable to read error');
                console.error('[fetchStatus] ❌ Backend returned error:', res.status, errorText);
                // Show more specific error message to help debug
                console.error('[fetchStatus] ❌ Full URL was:', url);
                console.error('[fetchStatus] ❌ Check that Supabase Edge Function is deployed and running');
            }
        } catch (e) {
            // Silently handle abort errors (backend may not be ready)
            if (e instanceof Error && (e.name === 'AbortError' || e.message.includes('aborted'))) {
                console.log('[fetchStatus] Status fetch aborted - retrying...');
                return;
            }
            // Backend temporarily unavailable - using fallback data (this is expected during initialization)
            console.log('[fetchStatus] Using cached data, backend will sync when available');
            if (e instanceof Error) {
                console.debug('[fetchStatus] Connection details:', e.message);
            }
            // Don't throw error - gracefully degrade
            setIsInitialized(true); // Allow app to continue with cached/fallback data
        }
    };

    const fetchLogs = async () => {
        try {
            const patientId = currentPatient?.id || '1';
            const res = await fetchWithTimeout(`${SERVER_URL}/logs?patientId=${patientId}&t=${new Date().getTime()}`, {
                headers: { 'Authorization': `Bearer ${publicAnonKey}` },
                cache: 'no-store'
            });
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (e) {
            // Silent fallback - expected on initial load
        }
    };

    const fetchContacts = async () => {
        try {
            const patientId = currentPatient?.id || '1';
            const res = await fetchWithTimeout(`${SERVER_URL}/contacts?patientId=${patientId}&t=${new Date().getTime()}`, {
                headers: { 'Authorization': `Bearer ${publicAnonKey}` }
            });
            if (res.ok) {
                const data = await res.json();
                setContacts(data);
            }
        } catch (e) {
            // Silent fallback - expected on initial load and timeout
        }
    };

    const fetchNotifications = async () => {
        try {
            const patientId = currentPatient?.id || '1';
            const res = await fetchWithTimeout(`${SERVER_URL}/notifications?patientId=${patientId}&t=${new Date().getTime()}`, {
                headers: { 'Authorization': `Bearer ${publicAnonKey}` },
                cache: 'no-store'
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (e) {
            // Silent fallback - expected on initial load and timeout
        }
    };
    
    const fetchSettings = async () => {
        try {
            const patientId = currentPatient?.id || '1';
            const url = `${SERVER_URL}/settings?patientId=${patientId}&t=${new Date().getTime()}`;
            console.log('[CARESOLIS_CONTEXT] 📡 Fetching settings from:', url);

            const res = await fetchWithTimeout(url, {
                headers: { 'Authorization': `Bearer ${publicAnonKey}` },
            });

            if (res.ok) {
                const data = await res.json();
                console.log('[CARESOLIS_CONTEXT] 📥 Raw settings response (schedule type):', {
                    scheduleType: typeof data.schedule,
                    isArray: Array.isArray(data.schedule),
                    slotCount: data.schedule?.slots?.length || 0,
                    scheduleKeys: data.schedule ? Object.keys(data.schedule) : 'NO SCHEDULE',
                    slots: data.schedule?.slots?.map((s: any) => ({ id: s.id, time: s.time, enabled: s.enabled })) || []
                });
                console.log('[CARESOLIS_CONTEXT] 📥 FULL SETTINGS DATA:', JSON.stringify(data, null, 2));
                setSettings(data);
            }
        } catch (e) {
            // Silently handle abort errors (backend may not be ready)
            if (e instanceof Error && (e.name === 'AbortError' || e.message.includes('aborted'))) {
                console.log('[CARESOLIS_CONTEXT] ⚠️ Settings fetch aborted (backend may not be ready)');
                return;
            }
            console.error('[CARESOLIS_CONTEXT] ❌ Error fetching settings:', e);
        }
    };

    const fetchStability = async () => {
        try {
            const patientId = currentPatient?.id || '1';
            const now = getNow();
            const localDateStr = now.toISOString().split('T')[0];
            const res = await fetchWithTimeout(`${SERVER_URL}/analytics/stability?patientId=${patientId}&localDateStr=${localDateStr}&t=${new Date().getTime()}`, {
                headers: { 'Authorization': `Bearer ${publicAnonKey}` },
                cache: 'no-store'
            });
            if (res.ok) {
                const data = await res.json();
                setStabilityData(data);
            }
        } catch (e) {
            // Silent fallback - expected on initial load
        }
    };

    const runCron = async () => {
        try {
            const patientId = currentPatient?.id || '1';
            const now = getNow();
            const clientTime = now.toISOString();
            
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const localTime = `${hours}:${minutes}`;

            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const localDate = `${year}-${month}-${day}`;

            const res = await fetchWithTimeout(`${SERVER_URL}/cron`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${publicAnonKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    patientId,
                    clientTime,
                    localTime,
                    localDate
                })
            });
            
            if (!res.ok) {
                throw new Error(`Cron failed: ${res.status}`);
            }
            await res.json();
        } catch (e) {
            // Silent fallback - cron failures are handled gracefully by the system
        }
    };

    const interact = async () => {
        setIsLoading(true);
        try {
            const patientId = currentPatient?.id || '1';
            const now = getNow();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const timeStr = `${hours}:${minutes}`;
            
            console.log('🟣 [INTERACT] Starting interact() call');
            console.log('🟣 [INTERACT] Request params:', { patientId, localDate: dateStr, localTime: timeStr, clientTime: now.toISOString() });

            const res = await fetchWithTimeout(`${SERVER_URL}/interact`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${publicAnonKey}`,
                    'Content-Type': 'application/json'
                },
                // CRITICAL FIX: Send patientId and clientTime for accurate Routine Stability sync
                body: JSON.stringify({ patientId, localDate: dateStr, localTime: timeStr, clientTime: now.toISOString() })
            });
            
            console.log('🟣 [INTERACT] Server response status:', res.status, res.ok);
            
            if (res.ok) {
                const responseData = await res.json();
                console.log('🟣 [INTERACT] Server response data:', responseData);
                console.log('🟣 [INTERACT] Server responded OK, applying optimistic update');
                
                // Optimistic Update for instant visual feedback
                setStatusData((prev: any) => {
                    if (!prev || !prev.slots) {
                        console.log('🟣 [INTERACT] No prev data or slots, skipping optimistic update');
                        return prev;
                    }
                    
                    console.log('🟣 [INTERACT] Prev slots:', prev.slots);
                    
                    // Find index of target (prioritize active/escalated)
                    const targetIndex = prev.slots.findIndex((s: any) => 
                        ['ReminderActive', 'EscalationLevel1', 'EscalationLevel2', 'EscalationLevel3', 'Acknowledged', 'Check-In Not Logged'].includes(s.status)
                    );
                    
                    // If no active/escalated slot, look for Scheduled
                    const effectiveIndex = targetIndex !== -1 ? targetIndex : prev.slots.findIndex((s: any) => s.status === 'Scheduled');
                    
                    console.log('🟣 [INTERACT] Target index:', effectiveIndex);
                    
                    if (effectiveIndex !== -1) {
                         const target = prev.slots[effectiveIndex];
                         const isLate = target.status.startsWith('Escalation') || target.status === 'Check-In Not Logged' || target.status === 'Acknowledged';
                         const newStatus = isLate ? 'Check-In Delayed' : 'Check-In On Time';
                         
                         console.log(`🟣 [INTERACT] Optimistic update: ${target.time} ${target.status} → ${newStatus}`);
                         
                         const updatedSlots = [...prev.slots];
                         updatedSlots[effectiveIndex] = { ...target, status: newStatus };
                         
                         console.log('🟣 [INTERACT] Updated slots:', updatedSlots);
                         
                         return { ...prev, slots: updatedSlots, status: 'nominal', lastInteraction: timeStr };
                    }
                    console.log(' [INTERACT] No effective index found, returning prev');
                    return prev;
                });

                toast.success("Interaction verified successfully.");
                
                console.log('🟣 [INTERACT] Calling fetchStatus to get server update');
                // CRITICAL: Small delay to ensure backend write is committed before reading back
                await new Promise(resolve => setTimeout(resolve, 100));
                await fetchStatus();
                await fetchLogs();
                await fetchStability(); // CRITICAL: Refresh stability after interaction
            } else {
                const errorText = await res.text().catch(() => 'Could not read error');
                console.error('🟣 [INTERACT] ❌ Server returned error:', res.status, errorText);
                toast.error("Failed to verify interaction.");
            }
        } catch (e) {
            console.error('🟣 [INTERACT] ❌ Network error:', e);
            toast.error("Network error.");
        } finally {
            setIsLoading(false);
        }
    };

    const acknowledge = async () => {
        setIsLoading(true);
        try {
            const patientId = currentPatient?.id || '1';
            const now = getNow();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

            console.log('[ACKNOWLEDGE] Sending to backend:', { 
                patientId, 
                localDate: dateStr, 
                localTime: timeStr,
                currentTime: now.toISOString() 
            });

            const res = await fetchWithTimeout(`${SERVER_URL}/acknowledge`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${publicAnonKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ patientId, localDate: dateStr, localTime: timeStr })
            });
            
            console.log('[ACKNOWLEDGE] Backend response status:', res.status);
            
            if (res.ok) {
                const data = await res.json();
                console.log('[ACKNOWLEDGE] Backend response data:', data);
                if (data.success) {
                    toast.success(data.message);
                    // CRITICAL: Force refresh immediately to sync frontend with backend state
                    await fetchStatus();
                    await fetchLogs();
                } else {
                    console.error('[ACKNOWLEDGE] Backend returned success=false:', data);
                    
                    // CRITICAL FIX: Always refresh status when backend says no actionable events
                    // This ensures frontend syncs with actual backend state
                    await fetchStatus();
                    
                    // User-friendly message based on the actual state
                    if (data.debug && data.debug.statusBreakdown) {
                        const breakdown = data.debug.statusBreakdown;
                        const hasCompleted = (breakdown['Check-In On Time'] || 0) + (breakdown['Check-In Delayed'] || 0);
                        const hasClosed = breakdown['Closed'] || 0;
                        
                        if (hasCompleted > 0) {
                            toast.info("All check-ins are already verified. Nothing to acknowledge.");
                        } else if (hasClosed > 0) {
                            toast.info("All check-in windows have closed. No action needed.");
                        } else {
                            toast.info(data.message || "No active escalation to acknowledge.");
                        }
                    } else if (data.message && data.message.includes('already handled')) {
                        toast.info("All check-ins are already complete. Nothing to acknowledge.");
                    } else {
                        toast.info(data.message || "No active escalation to acknowledge.");
                    }
                }
            } else {
                const errorText = await res.text();
                console.error('[ACKNOWLEDGE] Backend returned error:', { status: res.status, body: errorText });
                toast.error("Failed to acknowledge");
                // Refresh even on error to sync state
                await fetchStatus();
            }
        } catch (e) {
            console.error('[ACKNOWLEDGE] Network error:', e);
            toast.error("Network error");
            // Refresh even on network error to sync state
            await fetchStatus();
        } finally {
            setIsLoading(false);
        }
    };

    const updateSettings = async (newSettings: any) => {
        try {
            const patientId = currentPatient?.id || '1';
            const now = getNow();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const localDate = `${year}-${month}-${day}`;
            const localTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

            // TIMEZONE SAFETY: Include patient timezone/location for FDA compliance
            const payload = {
                ...newSettings,
                patientId,
                localDate,
                localTime,
                patientTimezone: locationData.timezone,
                patientLocation: {
                    city: locationData.city,
                    state: locationData.state,
                    country: locationData.country,
                    timezone: locationData.timezone
                }
            };

            console.log('[CARESOLIS_CONTEXT] updateSettings called with:', {
                hasSchedule: !!newSettings.schedule,
                slotCount: newSettings.schedule?.slots?.length || 0,
                slots: newSettings.schedule?.slots?.map((s: any) => ({ id: s.id, time: s.time, enabled: s.enabled })) || [],
                patientId
            });

            console.log('[CARESOLIS_CONTEXT] 📦 FULL SETTINGS OBJECT:', JSON.stringify(newSettings, null, 2));

            console.log('[CARESOLIS_CONTEXT] Full payload being sent to backend:', {
                url: `${SERVER_URL}/settings`,
                payloadKeys: Object.keys(payload),
                scheduleKeys: payload.schedule ? Object.keys(payload.schedule) : 'NO SCHEDULE',
                fullSlots: payload.schedule?.slots
            });
            
            console.log('[CARESOLIS_CONTEXT] 📦 FULL PAYLOAD BEING SENT:', JSON.stringify(payload, null, 2));
            
            const res = await fetchWithTimeout(`${SERVER_URL}/settings`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${publicAnonKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                toast.success("Settings updated");
                setSettings(newSettings);
                console.log('[CARESOLIS_CONTEXT] Settings updated successfully. Local state now:', {
                    slotCount: newSettings.schedule?.slots?.length || 0
                });
                
                // IMMEDIATE VERIFICATION: Read back what was actually saved
                console.log('[CARESOLIS_CONTEXT] 🔍 Performing immediate verification read...');
                setTimeout(async () => {
                    const verifyRes = await fetchWithTimeout(`${SERVER_URL}/settings?patientId=${patientId}&t=${new Date().getTime()}`, {
                        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
                    });
                    if (verifyRes.ok) {
                        const savedData = await verifyRes.json();
                        console.log('[CARESOLIS_CONTEXT] 🔍 VERIFICATION READ - What was actually saved:', {
                            hasSchedule: !!savedData.schedule,
                            scheduleType: typeof savedData.schedule,
                            isArray: Array.isArray(savedData.schedule),
                            slotCount: savedData.schedule?.slots?.length || 0,
                            slots: savedData.schedule?.slots?.map((s: any) => ({ id: s.id, time: s.time, enabled: s.enabled })) || [],
                            fullSchedule: JSON.stringify(savedData.schedule, null, 2)
                        });
                        
                        // Compare what we sent vs what was saved
                        const sentSlotCount = newSettings.schedule?.slots?.length || 0;
                        const savedSlotCount = savedData.schedule?.slots?.length || 0;
                        if (sentSlotCount !== savedSlotCount) {
                            console.error('[CARESOLIS_CONTEXT] ❌ DATA LOSS DETECTED!', {
                                sent: sentSlotCount,
                                saved: savedSlotCount,
                                lost: sentSlotCount - savedSlotCount
                            });
                        } else {
                            console.log('[CARESOLIS_CONTEXT] ✅ Verification passed - all slots persisted correctly');
                        }
                    }
                }, 500);
                
                fetchStatus();
            } else {
                const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
                console.error('[CARESOLIS_CONTEXT] Failed to update settings. Server response:', errorData);
            }
        } catch (e) {
            console.error('[CARESOLIS_CONTEXT] Error updating settings:', e);
            toast.error("Failed to update settings");
        }
    };

    const addContact = async (contact: any) => {
        try {
            const res = await fetchWithTimeout(`${SERVER_URL}/contacts`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${publicAnonKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(contact)
            });
            if (res.ok) {
                toast.success("Contact added");
                fetchContacts();
            }
        } catch (e) {
            toast.error("Failed to add contact");
        }
    };

    const updateContact = async (contact: any) => {
        try {
            const res = await fetchWithTimeout(`${SERVER_URL}/contacts`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${publicAnonKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(contact)
            });
            if (res.ok) {
                toast.success("Contact updated");
                fetchContacts();
            }
        } catch (e) {
            toast.error("Failed to update contact");
        }
    };

    const deleteContact = async (id: string) => {
        try {
            const res = await fetchWithTimeout(`${SERVER_URL}/contacts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${publicAnonKey}` }
            });
            if (res.ok) {
                toast.success("Contact deleted");
                fetchContacts();
            }
        } catch (e) {
            toast.error("Failed to delete contact");
        }
    };

    const refresh = () => {
        fetchStatus();
        fetchLogs();
        fetchContacts();
        fetchNotifications();
        fetchSettings();
        fetchStability();
        
        // Refresh patient profile from backend (new SOT architecture)
        if (currentPatient?.id) {
            console.log('[CARESOLIS_CONTEXT] 🔄 Refreshing patient profile from backend SOT...');
            refreshPatient(currentPatient.id).catch(err => {
                console.error('[CARESOLIS_CONTEXT] ❌ Failed to refresh patient profile:', err);
            });
        }
    };

    // Refresh data when patient changes
    useEffect(() => {
        refresh();
    }, [currentPatient?.id]);

    useEffect(() => {
        const runHeartbeat = async () => {
          try {
            const response = await fetchWithTimeout(`${SERVER_URL}/heartbeat`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json'
              }
            });
            // Silent execution - heartbeat runs in background
          } catch (e) {
            // Silently fail - heartbeat errors are expected during development
            // and shouldn't break the app functionality
          }
        };

        runCron();
        runHeartbeat();
        refresh();
        const interval = setInterval(() => {
            runCron().then(() => {
                fetchStatus();
                fetchLogs();
                fetchNotifications();
            });
            fetchHealth();
            fetchStability(); 
        }, 60000); 

        const hbInterval = setInterval(runHeartbeat, 30000);

        return () => {
            clearInterval(interval);
            clearInterval(hbInterval);
        };
    }, [currentPatient?.id]); // CRITICAL FIX: Add currentPatient?.id to dependencies so intervals recreate on patient change

    // --- Unified Stability Calculation ---
    const { stabilityScore, stabilityStatus } = useMemo(() => {
        if (!logs || logs.length === 0) {
            return { stabilityScore: 0, stabilityStatus: 'stable' as const };
        }

        const threshold = settings?.driftThreshold || 15;
        const verifiedLogs = logs.filter(l => 
            l.type === 'success' && 
            (l.message.includes('Verified') || l.message.includes('User Interaction'))
        );

        const now = getNow();
        const lookbackDate = new Date(now);
        // CRITICAL FIX: Changed from 14 days to 7 days to match server default and reduce mismatch
        lookbackDate.setDate(now.getDate() - 7);

        const relevantLogs = verifiedLogs.filter(log => {
            const logDate = new Date(log.isoTimestamp || log.timestamp);
            return logDate >= lookbackDate;
        });

        if (relevantLogs.length === 0) {
            return { stabilityScore: 0, stabilityStatus: 'stable' as const };
        }

        let totalScore = 0;
        let weightedDriftSum = 0;
        let validLogCount = 0;

        relevantLogs.forEach(log => {
             const match = log.message.match(/at\s+(\d{1,2}:\d{2})/);
             
             if (match && match[1]) {
                 const scheduledTimeStr = match[1];
                 const [sH, sM] = scheduledTimeStr.split(':').map(Number);
                 const logDate = new Date(log.isoTimestamp || log.timestamp);
                 const scheduledDate = new Date(logDate);
                 scheduledDate.setHours(sH, sM, 0, 0);
                 const driftMs = logDate.getTime() - scheduledDate.getTime();
                 const driftMins = Math.round(driftMs / 60000);
                 const drift = Math.max(0, driftMins);
                 
                 // Match server-side scoring algorithm exactly
                 if (drift <= 5) totalScore += 100;
                 else if (drift <= threshold) totalScore += 85;
                 else totalScore += Math.max(0, 100 - (drift * 2));

                 weightedDriftSum += drift;
                 validLogCount++;
             }
        });

        if (validLogCount === 0) {
            return { stabilityScore: 0, stabilityStatus: 'stable' as const };
        }

        const score = Math.round(totalScore / validLogCount);
        const avgDrift = weightedDriftSum / validLogCount;

        let status: 'stable' | 'minor_drift' | 'significant_drift' = 'stable';
        if (avgDrift > threshold) status = 'significant_drift';
        else if (avgDrift > 5) status = 'minor_drift';

        console.log('📊 [STABILITY CALC] Dashboard calculation:', {
            lookbackDays: 7,
            relevantLogs: relevantLogs.length,
            validLogCount,
            score,
            avgDrift: avgDrift.toFixed(2),
            status,
            threshold
        });

        return { stabilityScore: score, stabilityStatus: status };
    }, [logs, settings, timeOffset, currentPatient?.id, currentPatient?.name]); // Add currentPatient to dependencies

    // Location Sync
    const [locationData, setLocationData] = useState<LocationData>({
        city: 'Unknown',
        state: 'Unknown',
        country: 'US',
        timezone: 'America/New_York',
        latitude: 0,
        longitude: 0,
        lastUpdated: Date.now(),
        source: 'manual'
    });

    useEffect(() => {
        const initLocation = async () => {
            try {
                const locationSync = getLocationSync();
                
                // Subscribe to location updates
                const unsubscribe = locationSync.subscribe((location) => {
                    setLocationData(location);
                    console.log('📍 Location updated:', location);
                });

                // Get initial location (uses cache if available)
                const initialLocation = await locationSync.getLocation();
                setLocationData(initialLocation);

                return unsubscribe;
            } catch (error) {
                console.error('📍 LocationSync: Initialization failed, using default', error);
                // Return no-op unsubscribe
                return () => {};
            }
        };

        let unsubscribe: (() => void) | undefined;
        initLocation().then(unsub => { unsubscribe = unsub; }).catch(err => {
            console.error('📍 LocationSync: Failed to initialize', err);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const updateLocation = async (newLocation: LocationData) => {
        setLocationData(newLocation);
        // Location is automatically cached by LocationSync
    };

    // TIER 3: Caregiver Timezone (Session-Only, Never Persisted)
    const [caregiverTimezone, setCaregiverTimezone] = useState('America/New_York');

    // Detect caregiver timezone on EVERY app load and every 5 minutes (for caregivers who travel mid-session)
    useEffect(() => {
        const detectCaregiverTz = () => {
            try {
                const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                setCaregiverTimezone(browserTz);
                console.log('🧑‍⚕️ Caregiver timezone detected:', browserTz);
            } catch (error) {
                console.error('🧑‍⚕️ Failed to detect caregiver timezone, using default', error);
                setCaregiverTimezone('America/New_York');
            }
        };

        // Detect immediately on mount
        detectCaregiverTz();

        // Re-detect every 5 minutes (in case caregiver travels mid-session)
        const interval = setInterval(detectCaregiverTz, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    // Timezone Verification
    const updatePatientTimezone = async (timezone: string, reason: string) => {
        try {
            const patientId = currentPatient?.id || '1';
            const now = getNow();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const localDate = `${year}-${month}-${day}`;
            const localTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

            const payload = {
                patientId,
                localDate,
                localTime,
                timezone,
                reason
            };

            console.log('[CARESOLIS_CONTEXT] updatePatientTimezone called with:', {
                patientId,
                localDate,
                localTime,
                timezone,
                reason
            });

            const res = await fetchWithTimeout(`${SERVER_URL}/timezone`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${publicAnonKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                toast.success("Timezone updated");
                setCaregiverTimezone(timezone);
                console.log('[CARESOLIS_CONTEXT] Timezone updated successfully. Local state now:', {
                    timezone
                });
                // Refresh patient data
                await refresh();
            } else {
                const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
                console.error('[CARESOLIS_CONTEXT] Failed to update timezone. Server response:', errorData);
            }
        } catch (e) {
            console.error('[CARESOLIS_CONTEXT] Error updating timezone:', e);
            toast.error("Failed to update timezone");
        }
    };

    // Timezone Acknowledgment (Shift-based)
    const acknowledgeTimezone = async () => {
        try {
            const patientId = currentPatient?.id || '1';
            const caregiverId = 'admin'; // In production, use actual caregiver ID

            console.log('[CARESOLIS_CONTEXT] acknowledgeTimezone called for patient:', patientId);

            const res = await fetchWithTimeout(`${SERVER_URL}/timezone/acknowledge`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${publicAnonKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ patientId, caregiverId })
            });

            if (res.ok) {
                toast.success("Timezone status acknowledged");
                console.log('[CARESOLIS_CONTEXT] Timezone acknowledged successfully');
                // Refresh patient data
                await refresh();
            } else {
                const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
                console.error('[CARESOLIS_CONTEXT] Failed to acknowledge timezone. Server response:', errorData);
            }
        } catch (e) {
            console.error('[CARESOLIS_CONTEXT] Error acknowledging timezone:', e);
            toast.error("Failed to acknowledge timezone");
        }
    };

    // Force clear server-side cache
    const forceClearCache = async () => {
        try {
            const patientId = currentPatient?.id || '1';
            const now = new Date();
            const localTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            
            console.log('🔥 [FORCE CLEAR CACHE] Clearing server-side cache for patient', patientId);
            
            const res = await fetchWithTimeout(`${SERVER_URL}/status?patientId=${patientId}&localTime=${localTime}&clearCache=true&t=${Date.now()}`, {
                headers: { 
                    'Authorization': `Bearer ${publicAnonKey}`,
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                },
                cache: 'no-store'
            });
            
            if (res.ok) {
                const data = await res.json();
                console.log('🔥 [FORCE CLEAR CACHE] Cache cleared, new data:', data);
                toast.success("Server cache cleared - refreshing...");
                setStatusData(data);
                
                // Also refresh all other data
                await fetchLogs();
                await fetchStability();
            } else {
                const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
                console.error('[CARESOLIS_CONTEXT] Failed to clear server cache. Server response:', errorData);
                toast.error("Failed to clear server cache");
            }
        } catch (e) {
            console.error('[CARESOLIS_CONTEXT] Error clearing server cache:', e);
            toast.error("Failed to clear server cache");
        }
    };

    const value = {
        statusData,
        health,
        logs,
        contacts,
        notifications,
        settings,
        stabilityData,
        stabilityScore,
        stabilityStatus,
        isLoading,
        interact,
        acknowledge,
        updateSettings,
        addContact,
        updateContact,
        deleteContact,
        refresh,
        forceClearCache, // NEW: Force clear server-side cache
        timeOffset,
        simulateTime: setTimeOffset,
        getNow,
        locationData,
        updateLocation,
        caregiverTimezone,
        updatePatientTimezone,
        acknowledgeTimezone
    };

    return (
        <CaresolisContext.Provider value={{ 
            statusData, 
            logs, 
            contacts,
            notifications,
            settings,
            stabilityData,
            health,
            isLoading, 
            isInitialized, // CRITICAL: Export initialization flag
            interact, 
            acknowledge,
            updateSettings, // FIXED: Added missing updateSettings export
            addContact,
            updateContact,
            deleteContact,
            refresh,
            forceClearCache,
            stabilityScore,
            getNow,
            caregiverTimezone,
            locationData,
            timeSyncStatus,
            updatePatientTimezone,
            acknowledgeTimezone
        }}>
            {children}
        </CaresolisContext.Provider>
    );
}

export function useCaresolisContext() {
    const context = useContext(CaresolisContext);
    if (context === undefined) {
        // Safe fallback for components that render before provider is ready
        // This is expected during initial mount and is handled gracefully
        return {
            statusData: { status: 'pending', lastInteraction: '--:--', nextScheduled: 'Checking...' },
            health: { system: 'Caresolis_Core_v1', status: 'unknown', integrity: 'unknown' },
            logs: [],
            contacts: [],
            notifications: [],
            settings: {},
            stabilityData: [],
            stabilityScore: 0,
            stabilityStatus: 'stable' as const,
            isLoading: true,
            interact: async () => {},
            acknowledge: async () => {},
            updateSettings: async () => {},
            addContact: async () => {},
            updateContact: async () => {},
            deleteContact: async () => {},
            refresh: () => {},
            forceClearCache: () => {}, // NEW: Force clear server-side cache
            timeOffset: 0,
            simulateTime: () => {},
            getNow: () => new Date(),
            locationData: { 
                city: '',
                state: '',
                country: '',
                timezone: 'America/New_York',
                latitude: 0,
                longitude: 0,
                lastUpdated: Date.now(),
                source: 'cached' as const
            },
            updateLocation: async () => {},
            caregiverTimezone: 'America/New_York',
            updatePatientTimezone: async () => {},
            acknowledgeTimezone: async () => {}
        } as any;
    }
    return context;
}

export const useCaresolis = useCaresolisContext;