/**
 * Timezone Utilities for CareSolis
 * 
 * MEDICAL SAFETY CRITICAL:
 * All medication schedules are stored in PATIENT-LOCAL TIME.
 * This utility ensures accurate time conversions for:
 * - Medication timing calculations
 * - Escalation trigger logic
 * - FDA audit trail timestamps
 * - Medicare billing compliance (RPM timing windows)
 */

/**
 * Convert a time string in patient's timezone to UTC
 * @param timeStr - Time in HH:MM format (24-hour)
 * @param dateStr - Date in YYYY-MM-DD format
 * @param patientTimezone - IANA timezone (e.g., "Pacific/Honolulu")
 * @returns ISO timestamp in UTC
 */
export function patientTimeToUTC(
  timeStr: string,
  dateStr: string,
  patientTimezone: string
): Date {
  // Parse time string
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Create date string in patient's timezone
  const dateTimeStr = `${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  
  // Use Intl to convert from patient timezone to UTC
  // This handles DST automatically
  try {
    const date = new Date(dateTimeStr);
    
    // Get the offset for the patient's timezone at this date
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: patientTimezone }));
    const offset = utcDate.getTime() - tzDate.getTime();
    
    return new Date(date.getTime() + offset);
  } catch (error) {
    console.error('❌ timezoneUtils: Failed to convert patient time to UTC', { timeStr, dateStr, patientTimezone, error });
    // Fallback: assume no timezone conversion
    return new Date(dateTimeStr);
  }
}

/**
 * Convert UTC time to patient's local time
 * @param utcDate - Date object in UTC
 * @param patientTimezone - IANA timezone (e.g., "Pacific/Honolulu")
 * @returns Object with time components in patient's timezone
 */
export function utcToPatientTime(
  utcDate: Date,
  patientTimezone: string
): {
  hours: number;
  minutes: number;
  timeStr: string; // HH:MM format
  dateStr: string; // YYYY-MM-DD format
  fullISO: string; // Full ISO string for audit logs
} {
  try {
    // Convert to patient's timezone
    const patientDateStr = utcDate.toLocaleString('en-US', {
      timeZone: patientTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    // Parse the formatted string
    const parts = patientDateStr.match(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2})/);
    if (!parts) {
      throw new Error('Failed to parse date string');
    }
    
    const [, month, day, year, hours, minutes] = parts;
    
    return {
      hours: parseInt(hours, 10),
      minutes: parseInt(minutes, 10),
      timeStr: `${hours}:${minutes}`,
      dateStr: `${year}-${month}-${day}`,
      fullISO: utcDate.toISOString()
    };
  } catch (error) {
    console.error('❌ timezoneUtils: Failed to convert UTC to patient time', { utcDate, patientTimezone, error });
    // Fallback: use UTC
    return {
      hours: utcDate.getUTCHours(),
      minutes: utcDate.getUTCMinutes(),
      timeStr: `${String(utcDate.getUTCHours()).padStart(2, '0')}:${String(utcDate.getUTCMinutes()).padStart(2, '0')}`,
      dateStr: utcDate.toISOString().split('T')[0],
      fullISO: utcDate.toISOString()
    };
  }
}

/**
 * Get current time in patient's timezone
 * @param patientTimezone - IANA timezone (e.g., "Pacific/Honolulu")
 * @returns Current time components in patient's timezone
 */
export function getCurrentPatientTime(patientTimezone: string): {
  hours: number;
  minutes: number;
  timeStr: string; // HH:MM format
  dateStr: string; // YYYY-MM-DD format
  now: Date; // UTC Date object
} {
  const now = new Date();
  const patientTime = utcToPatientTime(now, patientTimezone);
  
  return {
    ...patientTime,
    now
  };
}

/**
 * Calculate time difference in minutes between two times in patient's timezone
 * CRITICAL: Used for escalation logic and compliance windows
 * 
 * @param currentTimeStr - Current time in HH:MM format
 * @param scheduledTimeStr - Scheduled time in HH:MM format
 * @returns Difference in minutes (positive = current is after scheduled)
 */
export function getTimeDifferenceMinutes(
  currentTimeStr: string,
  scheduledTimeStr: string
): number {
  const [currentHours, currentMinutes] = currentTimeStr.split(':').map(Number);
  const [scheduledHours, scheduledMinutes] = scheduledTimeStr.split(':').map(Number);
  
  const currentTotalMinutes = currentHours * 60 + currentMinutes;
  const scheduledTotalMinutes = scheduledHours * 60 + scheduledMinutes;
  
  return currentTotalMinutes - scheduledTotalMinutes;
}

/**
 * Format time for display with timezone abbreviation
 * @param timeStr - Time in HH:MM format
 * @param patientTimezone - IANA timezone
 * @param showTimezone - Whether to show timezone abbreviation
 * @returns Formatted time string (e.g., "9:00 AM HST")
 */
export function formatTimeWithTimezone(
  timeStr: string,
  patientTimezone: string,
  showTimezone: boolean = true
): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Convert to 12-hour format
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  
  const timeFormatted = `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
  
  if (!showTimezone) {
    return timeFormatted;
  }
  
  // Get timezone abbreviation
  const tzAbbr = getTimezoneAbbreviation(patientTimezone);
  
  return `${timeFormatted} ${tzAbbr}`;
}

/**
 * Get timezone abbreviation from IANA timezone
 * @param timezone - IANA timezone (e.g., "Pacific/Honolulu")
 * @returns Abbreviation (e.g., "HST")
 */
export function getTimezoneAbbreviation(timezone: string): string {
  try {
    const date = new Date();
    const formatted = date.toLocaleString('en-US', {
      timeZone: timezone,
      timeZoneName: 'short'
    });
    
    // Extract timezone abbreviation from formatted string
    const match = formatted.match(/\b([A-Z]{2,5})\b$/);
    return match ? match[1] : timezone.split('/')[1] || timezone;
  } catch (error) {
    // Fallback: use last part of IANA name
    return timezone.split('/')[1] || timezone;
  }
}

/**
 * Get timezone offset in hours (for display purposes)
 * @param timezone - IANA timezone
 * @returns Offset string (e.g., "UTC-10")
 */
export function getTimezoneOffset(timezone: string): string {
  try {
    const date = new Date();
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    
    const offsetMs = tzDate.getTime() - utcDate.getTime();
    const offsetHours = offsetMs / (1000 * 60 * 60);
    
    const sign = offsetHours >= 0 ? '+' : '';
    return `UTC${sign}${offsetHours}`;
  } catch (error) {
    return 'UTC';
  }
}

/**
 * Compare if caregiver and patient are in different timezones
 * @param caregiverTimezone - Caregiver's IANA timezone
 * @param patientTimezone - Patient's IANA timezone
 * @returns True if different timezones
 */
export function isDifferentTimezone(
  caregiverTimezone: string,
  patientTimezone: string
): boolean {
  // Simple comparison - could be enhanced to check if offset is different
  return caregiverTimezone !== patientTimezone;
}

/**
 * Get caregiver's current timezone
 * @returns IANA timezone from browser
 */
export function getCaregiverTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Convert caregiver's current time to patient's time for display
 * Useful for showing "Their time is X when yours is Y"
 */
export function getCaregiverPatientTimeDifference(
  patientTimezone: string
): {
  caregiverTime: string;
  patientTime: string;
  hoursDifference: number;
  caregiverTz: string;
  patientTz: string;
} {
  const caregiverTz = getCaregiverTimezone();
  const now = new Date();
  
  const caregiverTime = now.toLocaleString('en-US', {
    timeZone: caregiverTz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  const patientTime = now.toLocaleString('en-US', {
    timeZone: patientTimezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  // Calculate hour difference
  const caregiverDate = new Date(now.toLocaleString('en-US', { timeZone: caregiverTz }));
  const patientDate = new Date(now.toLocaleString('en-US', { timeZone: patientTimezone }));
  const hoursDifference = Math.round((patientDate.getTime() - caregiverDate.getTime()) / (1000 * 60 * 60));
  
  return {
    caregiverTime,
    patientTime,
    hoursDifference,
    caregiverTz: getTimezoneAbbreviation(caregiverTz),
    patientTz: getTimezoneAbbreviation(patientTimezone)
  };
}

/**
 * Create FDA-compliant audit log timestamp
 * Includes both UTC and patient-local time for maximum clarity
 */
export function createAuditTimestamp(
  patientTimezone: string
): {
  utc: string; // ISO 8601 in UTC
  patientLocal: string; // Human-readable in patient's timezone
  timezone: string; // IANA timezone for reference
  offsetHours: string; // UTC offset for additional clarity
} {
  const now = new Date();
  const patientTime = utcToPatientTime(now, patientTimezone);
  
  return {
    utc: now.toISOString(),
    patientLocal: `${patientTime.dateStr} ${formatTimeWithTimezone(patientTime.timeStr, patientTimezone, true)}`,
    timezone: patientTimezone,
    offsetHours: getTimezoneOffset(patientTimezone)
  };
}