/**
 * Auto-Sync Service for Caregiver App
 * Automatically pushes data to Patient Device backend when changes occur
 * 
 * This service provides automatic synchronization without manual intervention.
 * All sync operations happen in the background when data changes.
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';

// Patient Device backend URL (lazy initialization to avoid module loading issues)
function getBaseUrl(): string {
  return `https://${projectId}.supabase.co/functions/v1/make-server-2a443375`;
}

const PATIENT_ID = 'patient-001';
const SYNC_TIMEOUT = 10000; // 10 seconds

/**
 * Sync status type
 */
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

/**
 * Auto-Sync Service Class
 */
class AutoSyncService {
  private currentStatus: SyncStatus = 'idle';
  private statusCallbacks: ((status: SyncStatus) => void)[] = [];

  /**
   * Subscribe to sync status changes
   */
  onStatusChange(callback: (status: SyncStatus) => void) {
    this.statusCallbacks.push(callback);
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Update sync status and notify listeners
   */
  private setStatus(status: SyncStatus) {
    this.currentStatus = status;
    this.statusCallbacks.forEach(callback => callback(status));
  }

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return this.currentStatus;
  }

  /**
   * Fetch with timeout wrapper
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout = SYNC_TIMEOUT
  ): Promise<Response> {
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
   * Sync medication schedule
   * Auto-pushes dose data to Patient Device backend
   */
  async syncSchedule(doses: any[], timezone: string = 'America/New_York'): Promise<void> {
    console.log('🔄 [AutoSync] Syncing medication schedule...', doses.length, 'doses');
    this.setStatus('syncing');

    try {
      const response = await this.fetchWithTimeout(
        `${getBaseUrl()}/patient/${PATIENT_ID}/schedule`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ 
            doses, 
            timezone,
            updatedAt: Date.now()
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Schedule sync failed: ${errorText}`);
      }

      console.log('✅ [AutoSync] Schedule synced successfully');
      this.setStatus('success');

      // Reset to idle after 2 seconds
      setTimeout(() => this.setStatus('idle'), 2000);
    } catch (error) {
      // Silently log network errors, don't throw
      if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('aborted'))) {
        console.log('⚠️ [AutoSync] Schedule sync aborted (backend may not be ready)');
        this.setStatus('idle');
        return;
      }
      
      console.error('❌ [AutoSync] Schedule sync error:', error);
      this.setStatus('error');
      
      // Reset to idle after 3 seconds
      setTimeout(() => this.setStatus('idle'), 3000);
      throw error;
    }
  }

  /**
   * Sync caregiver information
   * Auto-pushes caregiver contact data to Patient Device backend
   */
  async syncCaregivers(caregiverData: any): Promise<void> {
    console.log('🔄 [AutoSync] Syncing caregiver info...');
    this.setStatus('syncing');

    try {
      const response = await this.fetchWithTimeout(
        `${getBaseUrl()}/patient/${PATIENT_ID}/caregivers`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            ...caregiverData,
            updatedAt: Date.now()
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Caregiver sync failed: ${errorText}`);
      }

      console.log('✅ [AutoSync] Caregivers synced successfully');
      this.setStatus('success');

      // Reset to idle after 2 seconds
      setTimeout(() => this.setStatus('idle'), 2000);
    } catch (error) {
      // Silently log network errors, don't throw
      if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('aborted'))) {
        console.log('⚠️ [AutoSync] Caregiver sync aborted (backend may not be ready)');
        this.setStatus('idle');
        return;
      }
      
      console.error('❌ [AutoSync] Caregiver sync error:', error);
      this.setStatus('error');
      
      // Reset to idle after 3 seconds
      setTimeout(() => this.setStatus('idle'), 3000);
      throw error;
    }
  }

  /**
   * Sync medication inventory
   * Auto-pushes inventory data to Patient Device backend
   */
  async syncInventory(inventoryData: any): Promise<void> {
    console.log('🔄 [AutoSync] Syncing inventory...', inventoryData.compartments?.length || 0, 'compartments');
    this.setStatus('syncing');

    try {
      const response = await this.fetchWithTimeout(
        `${getBaseUrl()}/patient/${PATIENT_ID}/inventory`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            ...inventoryData,
            updatedAt: Date.now()
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Inventory sync failed: ${errorText}`);
      }

      console.log('✅ [AutoSync] Inventory synced successfully');
      this.setStatus('success');

      // Reset to idle after 2 seconds
      setTimeout(() => this.setStatus('idle'), 2000);
    } catch (error) {
      // Silently log network errors, don't throw
      if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('aborted'))) {
        console.log('⚠️ [AutoSync] Inventory sync aborted (backend may not be ready)');
        this.setStatus('idle');
        return;
      }
      
      console.error('❌ [AutoSync] Inventory sync error:', error);
      this.setStatus('error');
      
      // Reset to idle after 3 seconds
      setTimeout(() => this.setStatus('idle'), 3000);
      throw error;
    }
  }

  /**
   * Batch sync all data at once
   * Useful for initial data population
   */
  async syncAll(data: {
    schedule?: { doses: any[]; timezone: string };
    caregivers?: any;
    inventory?: any;
  }): Promise<void> {
    console.log('🔄 [AutoSync] Batch syncing all data...');
    
    const promises: Promise<void>[] = [];

    if (data.schedule) {
      promises.push(this.syncSchedule(data.schedule.doses, data.schedule.timezone));
    }

    if (data.caregivers) {
      promises.push(this.syncCaregivers(data.caregivers));
    }

    if (data.inventory) {
      promises.push(this.syncInventory(data.inventory));
    }

    await Promise.all(promises);
    console.log('✅ [AutoSync] All data synced successfully');
  }
}

// Export singleton instance
export const autoSyncService = new AutoSyncService();