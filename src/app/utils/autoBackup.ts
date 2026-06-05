/**
 * Automatic Backup System for Caresolis Medication Data
 * 
 * Automatically creates timestamped backups after every data modification.
 * Maintains a rolling history of the last 10 backups for recovery.
 */

export interface BackupSnapshot {
  timestamp: string;
  date: Date;
  medications: string | null;
  schedules: string | null;
  compartments: string | null;
  action: 'add' | 'edit' | 'delete' | 'manual';
  description: string;
}

const BACKUP_KEY = 'caresolis_auto_backups';
const MAX_BACKUPS = 10;

/**
 * Create an automatic backup snapshot
 */
export function createAutoBackup(action: BackupSnapshot['action'], description: string): void {
  try {
    const snapshot: BackupSnapshot = {
      timestamp: new Date().toISOString(),
      date: new Date(),
      medications: localStorage.getItem('caresolis_medications'),
      schedules: localStorage.getItem('caresolis_schedules'),
      compartments: localStorage.getItem('caresolis_compartments'),
      action,
      description
    };

    // Get existing backups
    const backupsJson = localStorage.getItem(BACKUP_KEY);
    const backups: BackupSnapshot[] = backupsJson ? JSON.parse(backupsJson) : [];

    // Add new backup at the beginning
    backups.unshift(snapshot);

    // Keep only last MAX_BACKUPS
    const trimmedBackups = backups.slice(0, MAX_BACKUPS);

    // Save back to localStorage
    localStorage.setItem(BACKUP_KEY, JSON.stringify(trimmedBackups));

    console.log(`✅ AUTO-BACKUP: ${description} (${action}) - ${trimmedBackups.length} backups stored`);
  } catch (error) {
    console.error('❌ AUTO-BACKUP FAILED:', error);
  }
}

/**
 * Get all backup snapshots
 */
export function getBackupHistory(): BackupSnapshot[] {
  try {
    const backupsJson = localStorage.getItem(BACKUP_KEY);
    if (!backupsJson) return [];
    
    const backups = JSON.parse(backupsJson);
    // Convert timestamp strings back to Date objects
    return backups.map((b: any) => ({
      ...b,
      date: new Date(b.timestamp)
    }));
  } catch (error) {
    console.error('Failed to load backup history:', error);
    return [];
  }
}

/**
 * Restore data from a specific backup snapshot
 */
export function restoreFromBackup(backup: BackupSnapshot): void {
  try {
    if (backup.medications) {
      localStorage.setItem('caresolis_medications', backup.medications);
    }
    if (backup.schedules) {
      localStorage.setItem('caresolis_schedules', backup.schedules);
    }
    if (backup.compartments) {
      localStorage.setItem('caresolis_compartments', backup.compartments);
    }

    console.log(`✅ RESTORED: ${backup.description} from ${backup.timestamp}`);
  } catch (error) {
    console.error('Failed to restore backup:', error);
    throw error;
  }
}

/**
 * Get the most recent backup
 */
export function getLatestBackup(): BackupSnapshot | null {
  const backups = getBackupHistory();
  return backups.length > 0 ? backups[0] : null;
}

/**
 * Delete a specific backup
 */
export function deleteBackup(timestamp: string): void {
  try {
    const backups = getBackupHistory();
    const filtered = backups.filter(b => b.timestamp !== timestamp);
    localStorage.setItem(BACKUP_KEY, JSON.stringify(filtered));
    console.log(`🗑️ DELETED BACKUP: ${timestamp}`);
  } catch (error) {
    console.error('Failed to delete backup:', error);
  }
}

/**
 * Clear all backups (use with caution!)
 */
export function clearAllBackups(): void {
  localStorage.removeItem(BACKUP_KEY);
  console.log('🗑️ ALL BACKUPS CLEARED');
}

/**
 * Format a relative time string
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}
