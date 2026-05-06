import React, { useState } from 'react';
import { AlertTriangle, FileWarning, Send, Shield, X } from 'lucide-react';
import { Button } from './ui/button';
import { ElectronicSignature, type SignatureData } from './ElectronicSignature';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { projectId, publicAnonKey } from '/utils/supabase/info';

/**
 * Device Malfunction Reporting Form
 * 
 * FDA 21 CFR 803 - Medical Device Reporting (MDR) Requirement
 * 
 * Class II devices must report malfunctions that could cause/contribute to death or serious injury.
 * 
 * Severity Definitions:
 * - MINOR: No patient impact, device continues functioning
 * - MODERATE: Delayed medication, no harm occurred
 * - SERIOUS: Missed critical medication, potential for harm
 * - DEATH: Malfunction contributed to patient death
 * 
 * FDA Reporting Requirements:
 * - Death: Report to FDA within 10 days (via MedWatch)
 * - Serious Injury: Report to FDA within 10 days
 * - Malfunction: Report to manufacturer within 10 days (manufacturer decides FDA reporting)
 */

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;

interface DeviceMalfunctionReportProps {
  deviceId: string;
  onClose: () => void;
  onReportSubmitted?: () => void;
}

export interface MalfunctionReport {
  id: string;
  reportDate: string;
  deviceId: string;
  malfunctionType: MalfunctionType;
  severity: Severity;
  patientImpact: string;
  description: string;
  rootCause: string;
  correctiveAction: string;
  reportedBy: string;
  signature: SignatureData;
  fdaReportingRequired: boolean;
  fdaReportNumber?: string;
  reportStatus: 'submitted' | 'under_review' | 'fda_reported' | 'closed';
}

type MalfunctionType =
  | 'missed_dose'
  | 'false_positive'
  | 'connectivity_failure'
  | 'dispense_failure'
  | 'power_failure'
  | 'sensor_error'
  | 'software_crash'
  | 'mechanical_jam'
  | 'other';

type Severity = 'minor' | 'moderate' | 'serious' | 'death';

const MALFUNCTION_TYPES: { value: MalfunctionType; label: string; description: string }[] = [
  {
    value: 'missed_dose',
    label: 'Missed Dose',
    description: 'Compartment failed to open at scheduled time'
  },
  {
    value: 'false_positive',
    label: 'False Positive',
    description: 'Sensor incorrectly reported medication removed'
  },
  {
    value: 'connectivity_failure',
    label: 'Connectivity Failure',
    description: 'Device lost network connection, alerts not sent'
  },
  {
    value: 'dispense_failure',
    label: 'Dispense Failure',
    description: 'Compartment opened but pills stuck/inaccessible'
  },
  {
    value: 'power_failure',
    label: 'Power Failure',
    description: 'Device lost power, schedules not executed'
  },
  {
    value: 'sensor_error',
    label: 'Sensor Error',
    description: 'Optical sensor malfunction, cannot detect removal'
  },
  {
    value: 'software_crash',
    label: 'Software Crash',
    description: 'Device firmware crashed or became unresponsive'
  },
  {
    value: 'mechanical_jam',
    label: 'Mechanical Jam',
    description: 'Physical mechanism stuck or blocked'
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Other malfunction not listed above'
  }
];

const SEVERITY_LEVELS: { value: Severity; label: string; description: string; fdaRequired: boolean }[] = [
  {
    value: 'minor',
    label: 'Minor',
    description: 'No patient impact, device continues functioning',
    fdaRequired: false
  },
  {
    value: 'moderate',
    label: 'Moderate',
    description: 'Delayed medication, no harm occurred',
    fdaRequired: false
  },
  {
    value: 'serious',
    label: 'Serious',
    description: 'Missed critical medication, potential for harm',
    fdaRequired: true
  },
  {
    value: 'death',
    label: 'Death',
    description: 'Malfunction contributed to patient death',
    fdaRequired: true
  }
];

export function DeviceMalfunctionReport({ deviceId, onClose, onReportSubmitted }: DeviceMalfunctionReportProps) {
  const [step, setStep] = useState<'form' | 'sign'>('form');
  const [formData, setFormData] = useState({
    malfunctionType: '' as MalfunctionType | '',
    severity: '' as Severity | '',
    patientImpact: '',
    description: '',
    rootCause: '',
    correctiveAction: '',
    reportedBy: ''
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.malfunctionType) {
      toast.error('Please select malfunction type');
      return false;
    }
    if (!formData.severity) {
      toast.error('Please select severity level');
      return false;
    }
    if (formData.patientImpact.length < 20) {
      toast.error('Please provide detailed patient impact (min 20 characters)');
      return false;
    }
    if (formData.description.length < 50) {
      toast.error('Please provide detailed description (min 50 characters)');
      return false;
    }
    if (formData.rootCause.length < 20) {
      toast.error('Please provide root cause analysis (min 20 characters)');
      return false;
    }
    if (formData.correctiveAction.length < 20) {
      toast.error('Please provide corrective action taken (min 20 characters)');
      return false;
    }
    if (!formData.reportedBy) {
      toast.error('Please enter reporter name');
      return false;
    }
    return true;
  };

  const handleSubmitForSignature = () => {
    if (validateForm()) {
      setStep('sign');
    }
  };

  const handleSignatureComplete = async (signature: SignatureData) => {
    try {
      const severityInfo = SEVERITY_LEVELS.find(s => s.value === formData.severity);
      
      const report: MalfunctionReport = {
        id: crypto.randomUUID(),
        reportDate: new Date().toISOString(),
        deviceId,
        malfunctionType: formData.malfunctionType as MalfunctionType,
        severity: formData.severity as Severity,
        patientImpact: formData.patientImpact,
        description: formData.description,
        rootCause: formData.rootCause,
        correctiveAction: formData.correctiveAction,
        reportedBy: formData.reportedBy,
        signature,
        fdaReportingRequired: severityInfo?.fdaRequired || false,
        reportStatus: 'submitted'
      };

      // Submit to server
      const res = await fetch(`${SERVER_URL}/device-malfunction-report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report)
      });

      if (res.ok) {
        toast.success(
          report.fdaReportingRequired
            ? '⚠️ SERIOUS MALFUNCTION: Report submitted. FDA notification will be filed within 10 days.'
            : '✅ Malfunction report submitted successfully'
        );

        // Log to console for FDA audit trail
        console.log('🚨 Device Malfunction Report', {
          reportId: report.id,
          severity: report.severity,
          fdaRequired: report.fdaReportingRequired,
          deviceId,
          timestamp: report.reportDate
        });

        onReportSubmitted?.();
        onClose();
      } else {
        toast.error('Failed to submit report');
      }
    } catch (e) {
      console.error('Malfunction report error:', e);
      toast.error('Network error while submitting report');
    }
  };

  const selectedSeverity = SEVERITY_LEVELS.find(s => s.value === formData.severity);
  const requiresFDAReport = selectedSeverity?.fdaRequired || false;

  if (step === 'sign') {
    return (
      <ElectronicSignature
        onSign={handleSignatureComplete}
        onCancel={() => setStep('form')}
        actionDescription={`Report device malfunction: ${formData.malfunctionType} (${formData.severity} severity)`}
        requireNPI={true}
        providerName={formData.reportedBy}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-3xl w-full border-2 border-red-500 dark:border-red-600 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-xl flex-shrink-0">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Device Malfunction Report</h2>
                <p className="text-red-100 text-sm mt-1">FDA 21 CFR 803 - Medical Device Reporting</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* FDA Warning */}
        {requiresFDAReport && (
          <div className="bg-red-950/30 border-b border-red-800 p-4 flex items-start gap-3">
            <FileWarning className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div className="text-red-300">
              <strong className="block text-red-200 mb-1">⚠️ FDA REPORTING REQUIRED</strong>
              <p className="text-sm">
                This severity level ({selectedSeverity?.label}) requires FDA MedWatch notification within 10 days.
                Report will be automatically escalated to compliance team.
              </p>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Device Info */}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
            <div className="text-sm text-slate-600 dark:text-slate-400">Device ID</div>
            <div className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100">{deviceId}</div>
          </div>

          {/* Malfunction Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Malfunction Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.malfunctionType}
              onChange={(e) => handleChange('malfunctionType', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="">Select malfunction type...</option>
              {MALFUNCTION_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Level */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Severity Level <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {SEVERITY_LEVELS.map(level => (
                <button
                  key={level.value}
                  onClick={() => handleChange('severity', level.value)}
                  className={clsx(
                    "p-4 rounded-lg border-2 text-left transition-all",
                    formData.severity === level.value
                      ? level.fdaRequired
                        ? "border-red-500 bg-red-50 dark:bg-red-950/30"
                        : "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                      : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
                  )}
                >
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{level.label}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{level.description}</div>
                  {level.fdaRequired && (
                    <div className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
                      ⚠️ FDA REPORT REQUIRED
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Patient Impact */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Patient Impact <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.patientImpact}
              onChange={(e) => handleChange('patientImpact', e.target.value)}
              placeholder="Did the patient miss a critical medication? Was there any harm? Was the patient hospitalized? (Min 20 characters)"
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
            <div className="text-xs text-slate-500 mt-1">{formData.patientImpact.length}/20 characters minimum</div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="What exactly happened? When did it occur? What were the circumstances? (Min 50 characters)"
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
            <div className="text-xs text-slate-500 mt-1">{formData.description.length}/50 characters minimum</div>
          </div>

          {/* Root Cause */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Root Cause Analysis <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.rootCause}
              onChange={(e) => handleChange('rootCause', e.target.value)}
              placeholder="What was the root cause? Software bug? Hardware failure? User error? Network issue? (Min 20 characters)"
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
            <div className="text-xs text-slate-500 mt-1">{formData.rootCause.length}/20 characters minimum</div>
          </div>

          {/* Corrective Action */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Corrective Action Taken <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.correctiveAction}
              onChange={(e) => handleChange('correctiveAction', e.target.value)}
              placeholder="What steps were taken to resolve the issue? Was device replaced? Software updated? (Min 20 characters)"
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
            <div className="text-xs text-slate-500 mt-1">{formData.correctiveAction.length}/20 characters minimum</div>
          </div>

          {/* Reporter Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Reported By <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.reportedBy}
              onChange={(e) => handleChange('reportedBy', e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-b-xl flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
          <Button
            onClick={onClose}
            variant="outline"
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitForSignature}
            className={clsx(
              "px-8 gap-2",
              requiresFDAReport
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            )}
          >
            <Shield className="w-4 h-4" />
            {requiresFDAReport ? 'Submit FDA Report' : 'Sign & Submit Report'}
          </Button>
        </div>
      </div>
    </div>
  );
}
