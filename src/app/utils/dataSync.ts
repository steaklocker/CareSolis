/**
 * CareSolis Data Synchronization Utility
 * Copy this file to all three apps (Caregiver, Device, Command Centre)
 * 
 * Provides:
 * - Real-time data sync across apps via Supabase
 * - Polling with exponential backoff
 * - Offline detection and queue management
 * - Cross-app event broadcasting
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';

// ============================================================================
// Configuration
// ============================================================================

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;
const POLL_INTERVAL = 5000; // 5 seconds
const MAX_RETRY_DELAY = 60000; // 1 minute
const OFFLINE_QUEUE_KEY = 'caresolis_offline_queue';

// ============================================================================
// Types
// ============================================================================

export interface SyncConfig {
  patientId: string;
  pollInterval?: number;
  onStateUpdate?: (state: any) => void;
  onError?: (error: Error) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

export interface QueuedAction {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  timestamp: string;
  retries: number;
}

// ============================================================================
// Sync Manager Class
// ============================================================================

export class DataSyncManager {
  private config: SyncConfig;
  private pollTimer: number | null = null;
  private retryDelay: number = POLL_INTERVAL;
  private isOnline: boolean = navigator.onLine;
  private offlineQueue: QueuedAction[] = [];
  private lastStateHash: string = '';

  constructor(config: SyncConfig) {
    this.config = config;
    this.loadOfflineQueue();
    this.setupNetworkListeners();
  }

  // --------------------------------------------------------------------------
  // Public Methods
  // --------------------------------------------------------------------------

  /**
   * Start polling for updates
   */
  start() {
    this.stopPolling();
    this.poll();
  }

  /**
   * Stop polling
   */
  stop() {
    this.stopPolling();
  }

  /**
   * Force immediate sync
   */
  async sync() {
    await this.poll();
  }

  /**
   * Queue an action for when online
   */
  async queueAction(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: any
  ): Promise<void> {
    const action: QueuedAction = {
      id: crypto.randomUUID(),
      endpoint,
      method,
      body,
      timestamp: new Date().toISOString(),
      retries: 0,
    };

    this.offlineQueue.push(action);
    this.saveOfflineQueue();

    // If online, try to process immediately
    if (this.isOnline) {
      await this.processOfflineQueue();
    }
  }

  /**
   * Get current sync status
   */
  getStatus() {
    return {
      isOnline: this.isOnline,
      queuedActions: this.offlineQueue.length,
      pollInterval: this.retryDelay,
    };
  }

  // --------------------------------------------------------------------------
  // Private Methods
  // --------------------------------------------------------------------------

  private async poll() {
    try {
      // Fetch current state
      const response = await this.fetchWithTimeout(
        `${SERVER_URL}/status?patientId=${this.config.patientId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      // Check if state has changed
      const stateHash = this.hashState(data.state);
      if (stateHash !== this.lastStateHash) {
        this.lastStateHash = stateHash;
        this.config.onStateUpdate?.(data.state);
      }

      // Success - reset retry delay
      this.retryDelay = this.config.pollInterval || POLL_INTERVAL;
      this.markOnline();

      // Process any queued actions
      await this.processOfflineQueue();
    } catch (error) {
      console.error('[DataSync] Poll error:', error);
      this.config.onError?.(error as Error);

      // Exponential backoff
      this.retryDelay = Math.min(this.retryDelay * 2, MAX_RETRY_DELAY);

      // Check if offline
      if (!navigator.onLine) {
        this.markOffline();
      }
    } finally {
      // Schedule next poll
      this.pollTimer = window.setTimeout(() => this.poll(), this.retryDelay);
    }
  }

  private stopPolling() {
    if (this.pollTimer !== null) {
      window.clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout = 8000
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private hashState(state: any): string {
    // Simple hash for change detection
    return JSON.stringify(state);
  }

  private markOnline() {
    if (!this.isOnline) {
      this.isOnline = true;
      console.log('[DataSync] Back online');
      this.config.onOnline?.();
      this.processOfflineQueue();
    }
  }

  private markOffline() {
    if (this.isOnline) {
      this.isOnline = false;
      console.log('[DataSync] Gone offline');
      this.config.onOffline?.();
    }
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      console.log('[DataSync] Network online event');
      this.markOnline();
    });

    window.addEventListener('offline', () => {
      console.log('[DataSync] Network offline event');
      this.markOffline();
    });
  }

  private loadOfflineQueue() {
    try {
      const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (stored) {
        this.offlineQueue = JSON.parse(stored);
        console.log(
          `[DataSync] Loaded ${this.offlineQueue.length} queued actions`
        );
      }
    } catch (error) {
      console.error('[DataSync] Failed to load offline queue:', error);
      this.offlineQueue = [];
    }
  }

  private saveOfflineQueue() {
    try {
      localStorage.setItem(
        OFFLINE_QUEUE_KEY,
        JSON.stringify(this.offlineQueue)
      );
    } catch (error) {
      console.error('[DataSync] Failed to save offline queue:', error);
    }
  }

  private async processOfflineQueue() {
    if (!this.isOnline || this.offlineQueue.length === 0) {
      return;
    }

    console.log(
      `[DataSync] Processing ${this.offlineQueue.length} queued actions`
    );

    const toProcess = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const action of toProcess) {
      try {
        await this.executeAction(action);
        console.log(`[DataSync] Processed queued action: ${action.endpoint}`);
      } catch (error) {
        console.error(
          `[DataSync] Failed to process action ${action.id}:`,
          error
        );

        // Re-queue if retries left
        if (action.retries < 3) {
          action.retries++;
          this.offlineQueue.push(action);
        } else {
          console.error(
            `[DataSync] Dropped action ${action.id} after 3 retries`
          );
        }
      }
    }

    this.saveOfflineQueue();
  }

  private async executeAction(action: QueuedAction): Promise<void> {
    const url = `${SERVER_URL}${action.endpoint}`;
    const options: RequestInit = {
      method: action.method,
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    };

    if (action.body) {
      options.body = JSON.stringify(action.body);
    }

    const response = await this.fetchWithTimeout(url, options);

    if (!response.ok) {
      throw new Error(`Action failed with status ${response.status}`);
    }
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Create a sync manager instance
 */
export function createSyncManager(config: SyncConfig): DataSyncManager {
  return new DataSyncManager(config);
}

/**
 * Broadcast an event to all connected apps (future Supabase Realtime)
 */
export async function broadcastEvent(
  patientId: string,
  event: string,
  payload: any
) {
  // TODO: Implement Supabase Realtime broadcasting
  console.log('[DataSync] Broadcasting event:', event, payload);
}

/**
 * Subscribe to events from other apps (future Supabase Realtime)
 */
export function subscribeToEvents(
  patientId: string,
  callback: (event: string, payload: any) => void
) {
  // TODO: Implement Supabase Realtime subscriptions
  console.log('[DataSync] Subscribing to events for patient:', patientId);
  
  // Return unsubscribe function
  return () => {
    console.log('[DataSync] Unsubscribing from events');
  };
}

// ============================================================================
// React Hook (Optional)
// ============================================================================

/**
 * React hook for data synchronization
 * Usage:
 * 
 * const { isOnline, queuedActions, sync } = useDataSync({
 *   patientId: currentPatient.id,
 *   onStateUpdate: (state) => setStatusData(state)
 * });
 */
export function useDataSync(config: SyncConfig) {
  const [manager] = React.useState(() => new DataSyncManager(config));
  const [status, setStatus] = React.useState(manager.getStatus());

  React.useEffect(() => {
    manager.start();

    // Update status periodically
    const statusInterval = setInterval(() => {
      setStatus(manager.getStatus());
    }, 1000);

    return () => {
      manager.stop();
      clearInterval(statusInterval);
    };
  }, [manager]);

  return {
    isOnline: status.isOnline,
    queuedActions: status.queuedActions,
    pollInterval: status.pollInterval,
    sync: () => manager.sync(),
    queueAction: (endpoint: string, method: any, body?: any) =>
      manager.queueAction(endpoint, method, body),
  };
}

// Import React only if available
let React: any;
try {
  React = require('react');
} catch {
  // React not available, hook won't work
}
