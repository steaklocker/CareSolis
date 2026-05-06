import React, { useState, useEffect } from 'react';
import { X, MapPin, AlertTriangle, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { Patient } from '../types/shared';
import { detectTimezoneFromAddress, formatTimezoneDisplay } from '../utils/timezoneDetection';

interface TimezoneVerificationModalProps {
  patient: Patient;
  environmentalTimezone?: string;
  caregiverTimezone: string;
  onConfirm: (verified: boolean, newTimezone: string, reason: string) => void;
  onClose: () => void;
}

export function TimezoneVerificationModal({
  patient,
  environmentalTimezone,
  caregiverTimezone,
  onConfirm,
  onClose
}: TimezoneVerificationModalProps) {
  // Auto-detect timezone from patient address
  const detectedTimezone = detectTimezoneFromAddress(
    patient.location?.city,
    patient.location?.state
  );

  console.log('🌍 [TIMEZONE AUTO-DETECT]', {
    patient: patient.name,
    city: patient.location?.city,
    state: patient.location?.state,
    detected: detectedTimezone.timezone,
    confidence: detectedTimezone.confidence,
    source: detectedTimezone.source,
    displayText: detectedTimezone.displayText,
    currentTimezone: patient.timezone
  });

  const [selectedTimezone, setSelectedTimezone] = useState(
    patient.timezone || detectedTimezone.timezone
  );
  const [reason, setReason] = useState<'quarterly_verification' | 'patient_moved' | 'correction' | 'seasonal_travel'>('quarterly_verification');
  const [isAutoDetected, setIsAutoDetected] = useState(false);

  // Pre-populate with auto-detected timezone if patient has no timezone set
  useEffect(() => {
    if (!patient.timezone && detectedTimezone.timezone) {
      setSelectedTimezone(detectedTimezone.timezone);
      setIsAutoDetected(true);
      console.log('✨ [TIMEZONE AUTO-DETECT] Pre-populated with:', detectedTimezone.timezone);
    }
  }, [patient.timezone, detectedTimezone.timezone]);

  const needsVerification = () => {
    if (!patient.timezoneVerifiedAt) return true;
    const lastVerified = new Date(patient.timezoneVerifiedAt);
    const daysSince = (Date.now() - lastVerified.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 90;
  };

  const timezoneMismatch = environmentalTimezone && environmentalTimezone !== patient.timezone;

  const handleConfirm = () => {
    const reasonMap = {
      quarterly_verification: 'Quarterly verification',
      patient_moved: 'Patient moved',
      correction: 'Timezone correction',
      seasonal_travel: 'Seasonal travel'
    };
    onConfirm(selectedTimezone === patient.timezone, selectedTimezone, reasonMap[reason]);
  };

  const getLastVerifiedDisplay = () => {
    if (!patient.timezoneVerifiedAt) return 'Never verified';
    const lastVerified = new Date(patient.timezoneVerifiedAt);
    const daysSince = Math.floor((Date.now() - lastVerified.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince === 0) return 'Verified today';
    if (daysSince === 1) return 'Verified yesterday';
    if (daysSince < 30) return `Verified ${daysSince} days ago`;
    if (daysSince < 60) return 'Verified 1 month ago';
    if (daysSince < 90) return `Verified ${Math.floor(daysSince / 30)} months ago`;
    return `⚠️ Verified ${daysSince} days ago (overdue)`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Timezone Verification Required</h2>
                <p className="text-emerald-100 text-sm mt-1">
                  FDA Compliance: Verify patient timezone for medication accuracy
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Patient Info */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-700 font-bold text-lg">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{patient.name}</h3>
                <p className="text-sm text-slate-600">
                  {patient.location?.city}, {patient.location?.state}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{getLastVerifiedDisplay()}</span>
            </div>
          </div>

          {/* Warning if verification overdue */}
          {needsVerification() && (
            <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-900">Verification Overdue</h4>
                  <p className="text-sm text-amber-800 mt-1">
                    Patient timezone hasn't been verified in over 90 days. FDA compliance requires quarterly verification to ensure medication timing accuracy.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timezone mismatch warning */}
          {timezoneMismatch && (
            <div className="bg-rose-50 border-l-4 border-rose-500 rounded-r-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-rose-900">Timezone Mismatch Detected</h4>
                  <p className="text-sm text-rose-800 mt-1">
                    Environmental sensors report a different timezone ({environmentalTimezone}) than the patient profile ({patient.timezone}). Please verify the correct timezone.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Current Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="text-xs font-medium text-slate-500 mb-1">Patient Profile</div>
              <div className="font-semibold text-slate-900 text-sm">{formatTimezoneDisplay(patient.timezone || 'Not Set')}</div>
              <div className="text-xs text-slate-500 mt-1">Source: {patient.timezoneSource || 'unknown'}</div>
            </div>
            
            {environmentalTimezone && (
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="text-xs font-medium text-slate-500 mb-1">Environmental Sensors</div>
                <div className="font-semibold text-slate-900 text-sm">{formatTimezoneDisplay(environmentalTimezone)}</div>
                <div className="text-xs text-slate-500 mt-1">Real-time detection</div>
              </div>
            )}
            
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="text-xs font-medium text-slate-500 mb-1">Your Location</div>
              <div className="font-semibold text-slate-900 text-sm">{formatTimezoneDisplay(caregiverTimezone)}</div>
              <div className="text-xs text-slate-500 mt-1">Display only</div>
            </div>
          </div>

          {/* Timezone Selection */}
          <div className="space-y-3">
            {/* Auto-detection indicator */}
            {isAutoDetected && detectedTimezone.confidence !== 'low' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <span className="font-semibold text-blue-900">Auto-detected from address: </span>
                    <span className="text-blue-700">{detectedTimezone.displayText}</span>
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {detectedTimezone.confidence === 'high' ? 'High confidence' : 'Medium confidence'}
                    </span>
                    <p className="text-blue-600 text-xs mt-1">
                      Please verify this is correct before confirming.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <label className="block">
              <span className="text-sm font-semibold text-slate-700 mb-2 block">
                Confirm or Update Patient Timezone
              </span>
              <select
                value={selectedTimezone}
                onChange={(e) => setSelectedTimezone(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-slate-900"
              >
                <optgroup label="US Mainland">
                  <option value="America/New_York">Eastern Time (EST/EDT)</option>
                  <option value="America/Chicago">Central Time (CST/CDT)</option>
                  <option value="America/Denver">Mountain Time (MST/MDT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PST/PDT)</option>
                  <option value="America/Phoenix">Arizona (MST - No DST)</option>
                </optgroup>
                <optgroup label="US Territories">
                  <option value="Pacific/Honolulu">Hawaii (HST)</option>
                  <option value="America/Anchorage">Alaska (AKST/AKDT)</option>
                </optgroup>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700 mb-2 block">
                Reason for Verification
              </span>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-slate-900"
              >
                <option value="quarterly_verification">Quarterly Verification (Routine)</option>
                <option value="patient_moved">Patient Moved to New Location</option>
                <option value="correction">Timezone Correction</option>
                <option value="seasonal_travel">Seasonal Travel/Temporary Relocation</option>
              </select>
            </label>
          </div>

          {/* FDA Compliance Notice */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-700">
                <p className="font-semibold mb-1">FDA Compliance Requirements</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>Timezone changes create audit log entries</li>
                  <li>All medication times calculated using patient timezone</li>
                  <li>Quarterly verification required (every 90 days)</li>
                  <li>Authorized personnel only can modify timezone</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-6 rounded-b-2xl flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/30"
          >
            {selectedTimezone === patient.timezone ? 'Confirm Timezone' : 'Update & Verify Timezone'}
          </button>
        </div>
      </div>
    </div>
  );
}