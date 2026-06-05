import React, { useState } from 'react';
import { Clock, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { Patient } from '../types/shared';
import { TimezoneVerificationModal } from './TimezoneVerificationModal';

interface TimezoneTabProps {
  patient: Patient;
  caregiverTimezone: string;
  onVerify: (timezone: string, reason: string) => Promise<void>;
  onAcknowledge: () => Promise<void>;
}

export function TimezoneTab({ patient, caregiverTimezone, onVerify, onAcknowledge }: TimezoneTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Safety checks
  if (!patient) {
    return null;
  }

  // Calculate timezone status
  const patientTz = patient.timezone || 'UTC';
  const deviceTz = patient.deviceTimezone || patientTz; // Default to patient TZ if device hasn't reported
  const hasMismatch = patientTz !== deviceTz;

  // Check last acknowledgment
  const lastAck = patient.timezoneAcknowledgments?.[patient.timezoneAcknowledgments.length - 1];
  const lastAckTime = lastAck ? new Date(lastAck.timestamp).getTime() : 0;
  const hoursSinceAck = (Date.now() - lastAckTime) / (1000 * 60 * 60);
  const needsAcknowledgment = hasMismatch && hoursSinceAck > 8; // 8-hour shift window

  // Calculate verification status
  const lastVerified = patient.timezoneVerifiedAt ? new Date(patient.timezoneVerifiedAt).getTime() : 0;
  const daysSinceVerification = (Date.now() - lastVerified) / (1000 * 60 * 60 * 24);

  // Determine status level
  const getStatus = () => {
    if (!patient.timezoneVerifiedAt || daysSinceVerification > 90) {
      return 'critical';
    }
    if (hasMismatch && needsAcknowledgment) {
      return 'warning';
    }
    if (daysSinceVerification > 60) {
      return 'info';
    }
    return 'synced';
  };

  const status = getStatus();

  // Format timezone abbreviations
  const formatTz = (tz: string) => {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        timeZoneName: 'short'
      });
      const parts = formatter.formatToParts(new Date());
      const tzAbbr = parts.find(part => part.type === 'timeZoneName')?.value || tz;
      return tzAbbr;
    } catch {
      return tz.split('/').pop()?.replace(/_/g, ' ') || tz;
    }
  };

  const handleClick = async () => {
    if (needsAcknowledgment) {
      // If acknowledgment needed, do that first
      await onAcknowledge();
    }
    // Then open verification modal
    setIsModalOpen(true);
  };

  return (
    <>
      <div 
        onClick={handleClick}
        className="h-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 border border-slate-200/60 dark:border-slate-800/60 shadow-lg shadow-slate-200/20 dark:shadow-slate-900/40 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden group"
      >
        {/* Header */}
        <div className="flex items-center justify-between z-10 mb-2">
          <div className="flex items-center gap-1.5">
            <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 text-slate-400 dark:text-slate-500" />
            <h3 className="text-[8px] md:text-[9px] lg:text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Timezone Sync
            </h3>
          </div>
          {status === 'synced' && (
            <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5 text-emerald-500 dark:text-emerald-400" />
          )}
          {status === 'info' && (
            <AlertCircle className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-500 dark:text-blue-400" />
          )}
          {status === 'warning' && (
            <AlertTriangle className="w-3 h-3 md:w-3.5 md:h-3.5 text-amber-500 dark:text-amber-400" />
          )}
          {status === 'critical' && (
            <AlertCircle className="w-3 h-3 md:w-3.5 md:h-3.5 text-rose-500 dark:text-rose-400" />
          )}
        </div>

        {/* Timezone Grid */}
        <div className="grid grid-cols-3 gap-1.5 z-10">
          {/* Patient Timezone */}
          <div 
            className="group/tz relative"
            title="Patient's verified timezone (official record)"
          >
            <div className="text-[8px] md:text-[9px] text-slate-400 dark:text-slate-500 font-medium mb-0.5">
              Patient
            </div>
            <div className={clsx(
              "text-[10px] md:text-xs font-semibold leading-tight",
              status === 'critical' ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-200"
            )}>
              {formatTz(patientTz)}
            </div>
            {!hasMismatch && (
              <CheckCircle2 className="w-2 h-2 md:w-2.5 md:h-2.5 text-emerald-500 dark:text-emerald-400 mt-0.5" />
            )}
          </div>

          {/* Device Timezone */}
          <div 
            className="group/tz relative"
            title="Device-reported timezone (validation)"
          >
            <div className="text-[8px] md:text-[9px] text-slate-400 dark:text-slate-500 font-medium mb-0.5">
              Device
            </div>
            <div className={clsx(
              "text-[10px] md:text-xs font-semibold leading-tight",
              hasMismatch ? "text-amber-600 dark:text-amber-400" : "text-slate-700 dark:text-slate-200"
            )}>
              {formatTz(deviceTz)}
            </div>
            {!hasMismatch && (
              <CheckCircle2 className="w-2 h-2 md:w-2.5 md:h-2.5 text-emerald-500 dark:text-emerald-400 mt-0.5" />
            )}
            {hasMismatch && (
              <AlertTriangle className="w-2 h-2 md:w-2.5 md:h-2.5 text-amber-500 dark:text-amber-400 mt-0.5" />
            )}
          </div>

          {/* Caregiver Timezone */}
          <div 
            className="group/tz relative"
            title="Your current timezone (display only)"
          >
            <div className="text-[8px] md:text-[9px] text-slate-400 dark:text-slate-500 font-medium mb-0.5">
              You
            </div>
            <div className="text-[10px] md:text-xs font-semibold text-slate-700 dark:text-slate-200 leading-tight">
              {formatTz(caregiverTimezone)}
            </div>
            <div className="text-[8px] md:text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">👁️</div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 z-10">
          <div className="text-[8px] md:text-[9px] text-slate-400 dark:text-slate-500 font-medium">
            {patient.timezoneVerifiedAt ? (
              daysSinceVerification < 1 ? (
                "Verified today"
              ) : daysSinceVerification < 2 ? (
                "Verified yesterday"
              ) : (
                `Verified ${Math.floor(daysSinceVerification)}d ago`
              )
            ) : (
              "Never verified"
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className={clsx(
              "text-[8px] md:text-[9px] font-medium px-1.5 py-0.5 md:px-2 md:py-1 rounded transition-colors",
              status === 'critical' 
                ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/50"
                : status === 'warning'
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
          >
            {needsAcknowledgment ? "Acknowledge" : "Verify"}
          </button>
        </div>

        {/* Hover overlay */}
        <div className={clsx(
          "absolute inset-0 bg-gradient-to-tr via-transparent opacity-0 group-hover:opacity-100 transition-opacity",
          status === 'critical' ? "from-rose-50/0 to-rose-50 dark:to-rose-900/20" :
          status === 'warning' ? "from-amber-50/0 to-amber-50 dark:to-amber-900/20" :
          "from-slate-50/0 to-slate-100 dark:to-slate-800"
        )} />
      </div>

      {/* Verification Modal */}
      {isModalOpen && (
        <TimezoneVerificationModal
          patient={patient}
          caregiverTimezone={caregiverTimezone}
          environmentalTimezone={deviceTz} // Device TZ is the environmental reality
          onConfirm={async (verified, timezone, reason) => {
            if (verified) {
              await onVerify(timezone, reason);
            }
            setIsModalOpen(false);
          }}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}