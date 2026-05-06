import React from 'react';
import { MapPin, Clock, AlertTriangle } from 'lucide-react';
import { Patient } from '../types/shared';

interface TimezoneMismatchBannerProps {
  patient: Patient;
  caregiverTimezone: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  onAction?: () => void;
  actionLabel?: string;
}

export function TimezoneMismatchBanner({
  patient,
  caregiverTimezone,
  level,
  message,
  onAction,
  actionLabel = 'Verify Now'
}: TimezoneMismatchBannerProps) {
  const formatTime = (timezone: string) => {
    try {
      return new Date().toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    } catch {
      return timezone;
    }
  };

  const styles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      icon: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      text: 'text-amber-900',
      icon: 'text-amber-600',
      button: 'bg-amber-600 hover:bg-amber-700 text-white'
    },
    critical: {
      bg: 'bg-rose-50',
      border: 'border-rose-300',
      text: 'text-rose-900',
      icon: 'text-rose-600',
      button: 'bg-rose-600 hover:bg-rose-700 text-white'
    }
  };

  const style = styles[level];

  return (
    <div className={`${style.bg} border ${style.border} rounded-xl p-4 mb-4`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`${style.icon} mt-0.5 flex-shrink-0`}>
          {level === 'critical' ? (
            <AlertTriangle className="w-6 h-6" />
          ) : (
            <MapPin className="w-6 h-6" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${style.text} mb-2`}>
            {level === 'info' && 'Timezone Awareness'}
            {level === 'warning' && 'Timezone Verification Recommended'}
            {level === 'critical' && 'Timezone Verification Required'}
          </h3>
          <p className={`text-sm ${style.text} mb-3`}>{message}</p>

          {/* Time Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white/60 rounded-lg p-3 border border-slate-200/50">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-600">Patient Time</span>
              </div>
              <div className={`font-semibold ${style.text}`}>
                {patient.timezone ? formatTime(patient.timezone) : 'Not set'}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {patient.location?.city}, {patient.location?.state}
              </div>
            </div>

            <div className="bg-white/60 rounded-lg p-3 border border-slate-200/50">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-600">Your Time</span>
              </div>
              <div className={`font-semibold ${style.text}`}>
                {formatTime(caregiverTimezone)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Caregiver location (display only)
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {onAction && (
          <button
            onClick={onAction}
            className={`${style.button} px-4 py-2 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap flex-shrink-0`}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
