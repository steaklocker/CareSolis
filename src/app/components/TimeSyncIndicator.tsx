import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2, Wifi, WifiOff } from 'lucide-react';
import { getTimeSync, type TimeSyncStatus } from '../utils/timeSync';
import { clsx } from 'clsx';

export function TimeSyncIndicator() {
  const [status, setStatus] = useState<TimeSyncStatus | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    try {
      const timeSync = getTimeSync();
      
      // Only subscribe if TimeSync has been properly initialized
      if (timeSync.getStatus().syncQuality !== 'unknown' || timeSync.getStatus().lastSyncTimestamp > 0) {
        const unsubscribe = timeSync.subscribe(setStatus);
        setStatus(timeSync.getStatus());
        return () => unsubscribe();
      } else {
        // Wait for initialization
        const checkInterval = setInterval(() => {
          const currentStatus = timeSync.getStatus();
          if (currentStatus.lastSyncTimestamp > 0) {
            clearInterval(checkInterval);
            const unsubscribe = timeSync.subscribe(setStatus);
            setStatus(currentStatus);
          }
        }, 500);
        
        return () => clearInterval(checkInterval);
      }
    } catch (error) {
      console.log('⏰ TimeSyncIndicator: Waiting for TimeSync initialization...');
    }
  }, []);

  if (!status || status.syncQuality === 'unknown') return null;

  const getIndicatorColor = () => {
    if (!status.isSystemTimeAccurate) return 'text-rose-600 dark:text-rose-400';
    if (status.syncQuality === 'excellent') return 'text-emerald-600 dark:text-emerald-400';
    if (status.syncQuality === 'good') return 'text-emerald-500 dark:text-emerald-500';
    return 'text-amber-600 dark:text-amber-400';
  };

  const getIcon = () => {
    if (!status.isSystemTimeAccurate) return <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />;
    if (status.syncQuality === 'excellent' || status.syncQuality === 'good') {
      return <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />;
    }
    return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
  };

  const getDriftDisplay = () => {
    const driftMs = Math.abs(status.serverTimeDrift);
    if (driftMs < 1000) return `${driftMs}ms`;
    const driftSec = Math.round(driftMs / 1000);
    return `${driftSec}s`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={clsx(
          "flex items-center gap-1 px-1.5 sm:px-3 py-1 sm:py-2 rounded-md sm:rounded-lg border transition-all shadow-md",
          "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
          "hover:bg-slate-200 dark:hover:bg-slate-700",
          getIndicatorColor()
        )}
        title="Time Synchronization Status"
      >
        {getIcon()}
        {/* Desktop only: Show status text */}
        <span className="text-[10px] sm:text-xs font-bold hidden lg:inline">
          {status.syncQuality === 'excellent' && 'Synced'}
          {status.syncQuality === 'good' && 'Synced'}
          {status.syncQuality === 'poor' && 'Poor'}
          {status.syncQuality === 'unknown' && 'Sync...'}
          {!status.isSystemTimeAccurate && 'Drift'}
        </span>
      </button>

      {/* Details Panel */}
      {showDetails && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDetails(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Time Synchronization</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              {/* Sync Quality */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Quality</span>
                <span className={clsx(
                  "font-semibold capitalize",
                  getIndicatorColor()
                )}>
                  {status.syncQuality}
                </span>
              </div>

              {/* Time Drift */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Drift</span>
                <span className={clsx(
                  "font-mono font-semibold",
                  !status.isSystemTimeAccurate ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'
                )}>
                  ±{getDriftDisplay()}
                </span>
              </div>

              {/* Timezone */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Timezone</span>
                <span className="font-mono text-xs text-slate-900 dark:text-slate-100">
                  {status.timezone}
                </span>
              </div>

              {/* Last Sync */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Last Sync</span>
                <span className="text-xs text-slate-900 dark:text-slate-100">
                  {new Date(status.lastSyncTimestamp).toLocaleTimeString()}
                </span>
              </div>

              {/* Warning Message */}
              {status.warningMessage && (
                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-900 dark:text-amber-200">
                      {status.warningMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  FDA-compliant time synchronization ensures accurate medication timing and audit trails.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}