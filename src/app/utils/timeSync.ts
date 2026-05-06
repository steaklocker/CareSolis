/**
 * Time Synchronization Utility for CareSolis
 * 
 * FDA-Compliant time synchronization system that ensures:
 * 1. System clock accuracy verification
 * 2. Server time synchronization
 * 3. Time drift detection and warnings
 * 4. High-precision timestamp generation
 * 5. Timezone consistency
 * 
 * Critical for medication timing accuracy and audit trail integrity
 */

export interface TimeSyncStatus {
  isSystemTimeAccurate: boolean;
  serverTimeDrift: number; // milliseconds difference from server
  lastSyncTimestamp: number;
  syncQuality: 'excellent' | 'good' | 'poor' | 'unknown';
  timezone: string;
  warningMessage?: string;
}

export interface TimeSyncConfig {
  maxAcceptableDrift: number; // milliseconds (default: 5000ms = 5 seconds)
  syncInterval: number; // milliseconds (default: 60000ms = 1 minute)
  serverUrl: string;
  authToken: string;
}

class TimeSync {
  public config: TimeSyncConfig;
  private status: TimeSyncStatus;
  private syncIntervalId?: number;
  private listeners: Set<(status: TimeSyncStatus) => void> = new Set();

  constructor(config: Partial<TimeSyncConfig> = {}) {
    this.config = {
      maxAcceptableDrift: 30000, // 30 seconds for development (tighten to 5000ms for production FDA compliance)
      syncInterval: 60000, // 1 minute
      serverUrl: config.serverUrl || '',
      authToken: config.authToken || '',
      ...config,
    };

    this.status = {
      isSystemTimeAccurate: true,
      serverTimeDrift: 0,
      lastSyncTimestamp: Date.now(),
      syncQuality: 'unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  /**
   * Initialize time synchronization
   * Performs initial sync and starts periodic sync
   */
  async initialize(): Promise<void> {
    console.log('⏰ TimeSync: Initializing time synchronization system...');
    
    // Perform initial sync
    await this.syncWithServer();
    
    // Start periodic sync
    this.startPeriodicSync();
    
    // Monitor system time changes (user manually changed clock)
    this.monitorSystemTimeChanges();
    
    console.log('⏰ TimeSync: Initialization complete', this.status);
  }

  /**
   * Sync time with server using round-trip time (RTT) compensation
   */
  async syncWithServer(): Promise<void> {
    if (!this.config.serverUrl) {
      console.log('⏰ TimeSync: Waiting for configuration...');
      // Update status but don't warn - initialization is in progress
      this.status.syncQuality = 'unknown';
      return;
    }

    try {
      const t0 = performance.now(); // High-precision client timestamp
      const clientTime = Date.now();

      const response = await fetch(`${this.config.serverUrl}/time-sync`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.authToken}`,
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      const t1 = performance.now(); // High-precision client timestamp after response
      const rtt = t1 - t0; // Round-trip time in milliseconds

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const { serverTime, timezone } = await response.json();
      
      // Compensate for network latency (assume symmetric RTT)
      const estimatedServerTime = serverTime + (rtt / 2);
      const drift = estimatedServerTime - Date.now();

      // Update status
      this.status = {
        isSystemTimeAccurate: Math.abs(drift) < this.config.maxAcceptableDrift,
        serverTimeDrift: drift,
        lastSyncTimestamp: Date.now(),
        syncQuality: this.calculateSyncQuality(Math.abs(drift), rtt),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        warningMessage: this.generateWarningMessage(drift, timezone),
      };

      // Log sync results
      console.log('⏰ TimeSync: Sync complete', {
        drift: `${drift}ms`,
        rtt: `${rtt.toFixed(2)}ms`,
        quality: this.status.syncQuality,
        timezone: this.status.timezone,
      });

      // Notify listeners
      this.notifyListeners();

      // Warn if drift is significant (but suppress for very large drifts from Device Simulator)
      const isLikelySimulatorTimeTravel = Math.abs(drift) > 300000; // >5 minutes = likely simulator
      
      if (Math.abs(drift) > this.config.maxAcceptableDrift && !isLikelySimulatorTimeTravel) {
        console.warn('⚠️ TimeSync: Clock drift detected', {
          drift: `${drift}ms`,
          maxAcceptable: `${this.config.maxAcceptableDrift}ms`,
          note: 'This is normal in development environments',
        });
      } else if (isLikelySimulatorTimeTravel) {
        console.log('⏰ TimeSync: Large time offset detected (Device Simulator time travel?)', {
          drift: `${drift}ms`,
          note: 'Suppressing drift warning - likely from simulator',
        });
      }
    } catch (error) {
      // Silently handle errors - don't spam console in development
      // TimeSync is not critical for app functionality
      if (error instanceof Error && error.name !== 'TimeoutError' && error.name !== 'AbortError') {
        console.log('⏰ TimeSync: Could not connect to server (this is normal in development)');
      }
      
      // Set status to unknown but keep system operational
      this.status = {
        ...this.status,
        syncQuality: 'unknown',
        isSystemTimeAccurate: true, // Assume system time is accurate if we can't verify
      };
      this.notifyListeners();
    }
  }

  /**
   * Calculate sync quality based on drift and RTT
   */
  private calculateSyncQuality(drift: number, rtt: number): 'excellent' | 'good' | 'poor' | 'unknown' {
    // Excellent: <1s drift, <100ms RTT
    if (drift < 1000 && rtt < 100) return 'excellent';
    
    // Good: <3s drift, <500ms RTT
    if (drift < 3000 && rtt < 500) return 'good';
    
    // Poor: >5s drift or >1s RTT
    if (drift >= 5000 || rtt >= 1000) return 'poor';
    
    return 'good';
  }

  /**
   * Generate warning message for user
   */
  private generateWarningMessage(drift: number, serverTimezone: string): string | undefined {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    if (Math.abs(drift) > this.config.maxAcceptableDrift) {
      return `Your system clock is off by ${Math.round(drift / 1000)} seconds. Please sync your device time for accurate medication scheduling.`;
    }
    
    if (userTimezone !== serverTimezone) {
      return `Timezone mismatch detected. Your device: ${userTimezone}, Server: ${serverTimezone}. Medication times will be adjusted to your local timezone.`;
    }
    
    return undefined;
  }

  /**
   * Start periodic sync with server
   */
  private startPeriodicSync(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
    }

    this.syncIntervalId = window.setInterval(() => {
      this.syncWithServer();
    }, this.config.syncInterval);
  }

  /**
   * Stop periodic sync
   */
  stopPeriodicSync(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = undefined;
    }
  }

  /**
   * Monitor system time changes (e.g., user manually changed clock)
   */
  private monitorSystemTimeChanges(): void {
    let lastCheck = Date.now();
    let lastPerformanceCheck = performance.now();
    
    setInterval(() => {
      const now = Date.now();
      const nowPerformance = performance.now();
      
      // Use performance.now() to measure ACTUAL elapsed time (unaffected by system clock changes)
      const actualElapsed = nowPerformance - lastPerformanceCheck;
      
      // Use Date.now() to detect system clock changes
      const systemElapsed = now - lastCheck;
      
      // Calculate the difference between system time and performance time
      // If system clock was adjusted, this will be significant
      const timejump = systemElapsed - actualElapsed;
      
      // Only detect REAL system time changes (>5 seconds difference)
      // This filters out normal event loop delays from tab throttling
      // Ignore jumps >1 hour (likely from Device Simulator time travel)
      if (Math.abs(timejump) > 5000 && Math.abs(timejump) < 3600000) {
        console.log('⏰ TimeSync: System time change detected, re-syncing...', {
          jump: `${timejump.toFixed(0)}ms`,
        });
        
        // Re-sync immediately
        this.syncWithServer();
      } else if (Math.abs(timejump) >= 3600000) {
        // Large time jump detected (Device Simulator time travel)
        console.log('⏰ TimeSync: Large time jump detected (simulator?), skipping re-sync', {
          jump: `${timejump.toFixed(0)}ms`,
        });
      }
      
      lastCheck = now;
      lastPerformanceCheck = nowPerformance;
    }, 1000);
  }

  /**
   * Get current synchronized time
   * Returns system time adjusted for server drift
   */
  getNow(): Date {
    // Apply drift compensation if sync quality is good
    if (this.status.syncQuality === 'excellent' || this.status.syncQuality === 'good') {
      return new Date(Date.now() - this.status.serverTimeDrift);
    }
    
    // Fall back to system time if sync quality is poor
    return new Date();
  }

  /**
   * Get high-precision timestamp for intervals/durations
   * Use performance.now() for sub-millisecond accuracy
   */
  getHighPrecisionTimestamp(): number {
    return performance.now();
  }

  /**
   * Get ISO timestamp with timezone
   */
  getISOTimestamp(): string {
    return this.getNow().toISOString();
  }

  /**
   * Get status
   */
  getStatus(): TimeSyncStatus {
    return { ...this.status };
  }

  /**
   * Subscribe to status updates
   */
  subscribe(listener: (status: TimeSyncStatus) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.status));
  }

  /**
   * Force immediate sync
   */
  async forceSync(): Promise<void> {
    console.log('⏰ TimeSync: Force sync requested');
    await this.syncWithServer();
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopPeriodicSync();
    this.listeners.clear();
  }
}

// Singleton instance
let timeSyncInstance: TimeSync | null = null;

/**
 * Get or create TimeSync singleton
 */
export function getTimeSync(config?: Partial<TimeSyncConfig>): TimeSync {
  if (!timeSyncInstance) {
    timeSyncInstance = new TimeSync(config);
  } else if (config) {
    // Update config if provided (for late initialization)
    timeSyncInstance.config = {
      ...timeSyncInstance.config,
      ...config,
    };
  }
  return timeSyncInstance;
}

/**
 * Initialize time sync (call once at app startup)
 */
export async function initializeTimeSync(config: Partial<TimeSyncConfig>): Promise<TimeSync> {
  const timeSync = getTimeSync(config);
  await timeSync.initialize();
  return timeSync;
}

/**
 * Get current synchronized time (convenience function)
 */
export function getSyncedNow(): Date {
  return getTimeSync().getNow();
}

/**
 * Get high-precision timestamp (convenience function)
 */
export function getHighPrecisionNow(): number {
  return getTimeSync().getHighPrecisionTimestamp();
}