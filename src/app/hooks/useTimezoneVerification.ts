import { useMemo } from 'react';
import { Patient } from '../types/shared';

export interface TimezoneVerificationStatus {
  needsVerification: boolean;
  daysSinceVerification: number;
  level: 'info' | 'warning' | 'critical';
  message: string;
}

export function useTimezoneVerification(
  patient: Patient | undefined,
  environmentalTimezone?: string
): TimezoneVerificationStatus {
  return useMemo(() => {
    if (!patient) {
      return {
        needsVerification: false,
        daysSinceVerification: 0,
        level: 'info',
        message: ''
      };
    }

    // Calculate days since last verification
    const daysSinceVerification = patient.timezoneVerifiedAt
      ? Math.floor((Date.now() - new Date(patient.timezoneVerifiedAt).getTime()) / (1000 * 60 * 60 * 24))
      : Infinity;

    // Check for timezone mismatch with environmental sensors
    const timezoneMismatch = environmentalTimezone && environmentalTimezone !== patient.timezone;

    // LEVEL 3 - CRITICAL (Blocks Action)
    if (!patient.timezoneVerifiedAt) {
      return {
        needsVerification: true,
        daysSinceVerification,
        level: 'critical',
        message: 'Patient timezone has never been verified. Verification required for medication accuracy.'
      };
    }

    if (daysSinceVerification > 90) {
      return {
        needsVerification: true,
        daysSinceVerification,
        level: 'critical',
        message: `Patient timezone verification is ${daysSinceVerification} days overdue. FDA requires quarterly verification (every 90 days).`
      };
    }

    // LEVEL 2 - WARNING (Requires Acknowledgment)
    if (daysSinceVerification > 60) {
      return {
        needsVerification: true,
        daysSinceVerification,
        level: 'warning',
        message: `Patient timezone will need verification in ${90 - daysSinceVerification} days. Please verify soon.`
      };
    }

    if (timezoneMismatch) {
      return {
        needsVerification: true,
        daysSinceVerification,
        level: 'warning',
        message: `Environmental sensors report ${environmentalTimezone}, but patient profile shows ${patient.timezone}. Please verify.`
      };
    }

    // LEVEL 1 - INFO (Amber Banner)
    if (daysSinceVerification > 30) {
      return {
        needsVerification: false,
        daysSinceVerification,
        level: 'info',
        message: `Patient timezone was last verified ${daysSinceVerification} days ago. Next verification due in ${90 - daysSinceVerification} days.`
      };
    }

    // All good
    return {
      needsVerification: false,
      daysSinceVerification,
      level: 'info',
      message: `Patient timezone verified ${daysSinceVerification} days ago. System operating normally.`
    };
  }, [patient, environmentalTimezone]);
}
