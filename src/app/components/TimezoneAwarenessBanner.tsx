/**
 * Timezone Awareness Banner for CareSolis
 * 
 * MEDICAL SAFETY CRITICAL:
 * Displays a clear, persistent indicator when caregiver and patient
 * are in different timezones to prevent medication timing confusion.
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, MapPin } from 'lucide-react';
import { useCaresolis } from '../hooks/useCaresolis';
import { getCaregiverPatientTimeDifference, getCaregiverTimezone } from '../utils/timezoneUtils';

export function TimezoneAwarenessBanner() {
  const { locationData, settings } = useCaresolis();
  const [timeDiff, setTimeDiff] = useState<ReturnType<typeof getCaregiverPatientTimeDifference> | null>(null);
  const [isDifferent, setIsDifferent] = useState(false);

  useEffect(() => {
    // Safe check: ensure locationData exists before accessing timezone
    if (!locationData) {
      setIsDifferent(false);
      return;
    }

    const patientTimezone = settings?.patientTimezone || locationData?.timezone;
    
    if (!patientTimezone) {
      setIsDifferent(false);
      return;
    }

    const caregiverTz = getCaregiverTimezone();
    const different = caregiverTz !== patientTimezone;
    setIsDifferent(different);

    if (different) {
      const diff = getCaregiverPatientTimeDifference(patientTimezone);
      setTimeDiff(diff);
      
      // Update every minute to keep times fresh
      const interval = setInterval(() => {
        const newDiff = getCaregiverPatientTimeDifference(patientTimezone);
        setTimeDiff(newDiff);
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [locationData?.timezone, settings?.patientTimezone]);

  if (!isDifferent || !timeDiff) {
    return null;
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
            Timezone Difference Detected
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-300 mb-3">
            You and the patient are in different timezones. All medication times shown are in the <strong>patient's local time</strong>.
          </p>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 p-2 rounded">
              <MapPin className="w-4 h-4 text-slate-500" />
              <div>
                <div className="font-medium text-slate-700 dark:text-slate-300">Your Time</div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-mono">{timeDiff.caregiverTime}</span>
                  <span className="text-xs opacity-70">{timeDiff.caregiverTz}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded border border-emerald-200 dark:border-emerald-800">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
              <div>
                <div className="font-medium text-emerald-900 dark:text-emerald-300">Patient's Time</div>
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-mono font-semibold">{timeDiff.patientTime}</span>
                  <span className="text-xs opacity-70">{timeDiff.patientTz}</span>
                </div>
              </div>
            </div>
          </div>
          {timeDiff.hoursDifference !== 0 && (
            <div className="mt-2 text-xs text-amber-700 dark:text-amber-400 font-medium">
              {Math.abs(timeDiff.hoursDifference)} hour{Math.abs(timeDiff.hoursDifference) > 1 ? 's' : ''} {timeDiff.hoursDifference > 0 ? 'ahead' : 'behind'} your time
            </div>
          )}
        </div>
      </div>
    </div>
  );
}