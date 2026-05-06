import React, { useState } from 'react';
import { AlertTriangle, Shield, XCircle, Clock, FileWarning, Send } from 'lucide-react';
import { Button } from './ui/button';
import { ElectronicSignature, type SignatureData } from './ElectronicSignature';
import { toast } from 'sonner';
import { clsx } from 'clsx';

/**
 * Device Malfunction Reporting Form
 * 
 * FDA Requirements:
 * - 21 CFR Part 803: Medical Device Reporting (MDR)
 * - Must report device malfunctions that caused/contributed to death or serious injury
 * - Must report malfunctions likely to cause/contribute to death or serious injury
 * - Timeline: Death (5 days), Serious Injury (30 days), Malfunction (30 days)
 * 
 * Features:
 * - Structured malfunction classification
 * - Severity assessment (per FDA MDR)
 * - Root cause analysis
 * - Corrective action documentation
 * - Electronic signature for report submission
 * - FDA MedWatch integration placeholder
 */

export interface MalfunctionReport {
  id: string;
  reportDate: string;
  deviceSerialNumber: string;
  malfunctionType: 'missed_dose' | 'false_positive' | 'connectivity' | 'dispense_failure' | 'power_failure' | 'software_crash' | 'sensor_error' | 'other';
  severity: 'minor' | 'moderate' | 'serious' | 'death';
  patientImpact: string;
  description: string;
  rootCause: string;
  correctiveAction: string;
  preventiveMeasures: string;
  reportedBy: string;
  signature: SignatureData;
  fdaReportable: boolean; // Death or serious injury
  fdaMedWatchID?: string; // If reported to FDA
}

interface MalfunctionReportFormProps {
  deviceSerial: string;
  onSubmit: (report: MalfunctionReport) => void;
  onCancel: () => void;
}

const MALFUNCTION_TYPES = [
  { value: 'missed_dose', label: 'Missed Dose (compartment didn\'t open)', risk: 'high' },
  { value: 'false_positive', label: 'False Positive (sensor error)', risk: 'low' },
  { value: 'connectivity', label: 'Connectivity Failure (network down)', risk: 'medium' },
  { value: 'dispense_failure', label: 'Dispense Failure (mechanical jam)', risk: 'high' },
  { value: 'power_failure', label: 'Power Failure (battery/electrical)', risk: 'medium' },
  { value: 'software_crash', label: 'Software Crash (system reboot)', risk: 'medium' },
  { value: 'sensor_error', label: 'Sensor Error (optical/environmental)', risk: 'low' },
  { value: 'other', label: 'Other (specify in description)', risk: 'unknown' }
] as const;

const SEVERITY_LEVELS = [
  { 
    value: 'minor', 
    label: 'Minor',
    description: 'No patient impact, device recovered automatically',
    color: 'blue',
    fdaReportable: false
  },
  { 
    value: 'moderate', 
    label: 'Moderate',
    description: 'Delayed medication, patient notified, no harm occurred',
    color: 'yellow',
    fdaReportable: false
  },
  { 
    value: 'serious', 
    label: 'Serious',
    description: 'Missed critical medication, potential harm, medical intervention required',
    color: 'orange',
    fdaReportable: true
  },
  { 
    value: 'death', 
    label: 'Death',
    description: 'Device malfunction caused or contributed to patient death',
    color: 'red',
    fdaReportable: true
  }
] as const;

export function MalfunctionReportForm({ deviceSerial, onSubmit, onCancel }: MalfunctionReportFormProps) {
  const [step, setStep] = useState<'form' | 'signature'>('form');
  const [malfunctionType, setMalfunctionType] = useState<string>('');
  const [severity, setSeverity] = useState<string>('');
  const [patientImpact, setPatientImpact] = useState('');
  const [description, setDescription] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [preventiveMeasures, setPreventiveMeasures] = useState('');
  const [reportedBy, setReportedBy] = useState('');

  const selectedSeverity = SEVERITY_LEVELS.find(s => s.value === severity);
  const isFDAReportable = selectedSeverity?.fdaReportable || false;

  const handleFormSubmit = () => {
    // Validation
    if (!malfunctionType) {
      toast.error('Please select a malfunction type');
      return;
    }
    if (!severity) {
      toast.error('Please select a severity level');
      return;
    }
    if (!description) {
      toast.error('Please provide a detailed description');
      return;
    }
    if (!rootCause) {
      toast.error('Please document root cause analysis');
      return;
    }
    if (!correctiveAction) {
      toast.error('Please document corrective actions taken');
      return;
    }
    if (!reportedBy) {
      toast.error('Please enter your name');
      return;
    }

    // Show signature modal
    setStep('signature');
  };

  const handleSignatureComplete = (signature: SignatureData) => {
    const report: MalfunctionReport = {
      id: crypto.randomUUID(),
      reportDate: new Date().toISOString(),
      deviceSerialNumber: deviceSerial,
      malfunctionType: malfunctionType as any,
      severity: severity as any,
      patientImpact,
      description,
      rootCause,
      correctiveAction,
      preventiveMeasures,
      reportedBy,
      signature,
      fdaReportable: isFDAReportable
    };

    console.log('📋 Malfunction Report Submitted', {
      reportId: report.id,
      type: report.malfunctionType,
      severity: report.severity,
      fdaReportable: report.fdaReportable,
      signedBy: signature.providerName
    });

    onSubmit(report);
  };

  if (step === 'signature') {
    return (
      <ElectronicSignature
        onSign={handleSignatureComplete}
        onCancel={() => setStep('form')}
        actionDescription={`Certify device malfunction report: ${malfunctionType.replace('_', ' ')} - ${severity} severity`}
        requireNPI={true}
        providerName={reportedBy}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-4xl w-full border-2 border-rose-500 dark:border-rose-600 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 p-6 rounded-t-xl">
          <div className="flex items-center gap-3 text-white">
            <AlertTriangle className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Device Malfunction Report</h2>
              <p className="text-rose-100 text-sm mt-1">
                FDA 21 CFR Part 803 Compliant • Device Serial: {deviceSerial}
              </p>
            </div>
          </div>
        </div>

        {/* FDA Reportable Warning */}
        {isFDAReportable && (
          <div className="bg-red-900/20 border-b-2 border-red-600/50 p-4">
            <div className="flex items-start gap-3">
              <FileWarning className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-300 font-bold text-lg mb-1">
                  ⚠️ FDA REPORTABLE EVENT
                </h3>
                <p className="text-red-200 text-sm">
                  This malfunction severity requires FDA MedWatch reporting within{' '}
                  {severity === 'death' ? '5 working days' : '30 calendar days'}. 
                  After completing this form, submit to FDA via MedWatch (Form 3500A).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Malfunction Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Malfunction Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {MALFUNCTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setMalfunctionType(type.value)}
                  className={clsx(
                    "text-left p-3 rounded-lg border-2 transition-all",
                    malfunctionType === type.value
                      ? "border-rose-500 bg-rose-50 dark:bg-rose-950/30"
                      : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
                  )}
                >
                  <div className="font-medium text-sm text-slate-900 dark:text-slate-100">
                    {type.label}
                  </div>
                  <div className={clsx(
                    "text-xs mt-1",
                    type.risk === 'high' && "text-red-600 dark:text-red-400",
                    type.risk === 'medium' && "text-yellow-600 dark:text-yellow-400",
                    type.risk === 'low' && "text-blue-600 dark:text-blue-400"
                  )}>
                    Risk: {type.risk}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Severity Level */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Severity Level (FDA Classification) <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {SEVERITY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setSeverity(level.value)}
                  className={clsx(
                    "text-left p-4 rounded-lg border-2 transition-all",
                    severity === level.value
                      ? `border-${level.color}-500 bg-${level.color}-50 dark:bg-${level.color}-950/30`
                      : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {level.label}
                    </span>
                    {level.fdaReportable && (
                      <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">
                        FDA Reportable
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {level.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Patient Impact */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Patient Impact Summary <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={patientImpact}
              onChange={(e) => setPatientImpact(e.target.value)}
              placeholder="e.g., Patient missed morning blood pressure medication"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened, when it occurred, and any observed symptoms or error messages..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          {/* Root Cause Analysis */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Root Cause Analysis <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              placeholder="Identify the underlying cause(s) of the malfunction. Examples: mechanical failure, software bug, user error, environmental factors, design flaw..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          {/* Corrective Action */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Corrective Action Taken <span className="text-red-500">*</span>
            </label>
            <textarea
              value={correctiveAction}
              onChange={(e) => setCorrectiveAction(e.target.value)}
              placeholder="Document immediate actions taken to resolve the issue. Examples: device reset, compartment cleared, patient contacted, manual dose administered..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          {/* Preventive Measures */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Preventive Measures (Optional)
            </label>
            <textarea
              value={preventiveMeasures}
              onChange={(e) => setPreventiveMeasures(e.target.value)}
              placeholder="Long-term measures to prevent recurrence. Examples: firmware update, component replacement, design modification, additional training..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          {/* Reported By */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Reported By <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={reportedBy}
              onChange={(e) => setReportedBy(e.target.value)}
              placeholder="Your full name"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-b-xl flex justify-between items-center gap-3 border-t border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <Clock className="w-4 h-4 inline mr-1" />
            Report Date: {new Date().toLocaleDateString()}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onCancel}
              variant="outline"
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleFormSubmit}
              className="bg-rose-600 hover:bg-rose-700 text-white px-8 gap-2"
            >
              <Send className="w-4 h-4" />
              Sign & Submit Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
