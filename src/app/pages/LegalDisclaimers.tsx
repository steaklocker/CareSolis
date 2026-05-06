import React from 'react';
import { AlertTriangle, Shield, FileText, Info, CheckCircle2 } from 'lucide-react';

/**
 * LEGAL DISCLAIMERS & RISK MITIGATION
 * 
 * Addresses Red Team Concerns:
 * - I.2: Optical confirmation ≠ ingestion verification
 * - I.3: No medical reliance claims
 * - V.1: Clear caregiver responsibility
 * 
 * Critical for acquisition due diligence and liability protection
 */

export default function LegalDisclaimers() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-8 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
              <FileText size={40} />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Legal Disclaimers & Risk Mitigation</h1>
              <p className="text-slate-300">Liability protection and regulatory positioning</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-12 space-y-8">
        {/* PRIMARY DISCLAIMER */}
        <div className="bg-rose-50 border-2 border-rose-600 rounded-2xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <AlertTriangle size={32} className="text-rose-600 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-rose-900 mb-2">PRIMARY SYSTEM DISCLAIMER</h2>
              <p className="text-rose-800 font-semibold">Required acknowledgment during setup and presented in all user interfaces</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-rose-300">
            <div className="prose prose-slate max-w-none">
              <p className="text-lg font-semibold text-slate-900 mb-4">
                <strong>CARESOLIS IS A CLASS II MEDICAL DEVICE - MEDICATION ADHERENCE MONITORING SYSTEM.</strong>
              </p>
              
              <p className="text-slate-800 mb-3">
                CareSolis is an <strong>FDA Class II medication adherence monitoring device</strong> (open-loop, non-automated) 
                that provides <strong>IR sensor-based dose removal detection</strong> and <strong>finite escalation to caregivers</strong>. 
                It does <strong>NOT</strong> automatically dispense medication, adjust dosages, or replace medical judgment.
              </p>

              <p className="text-slate-800 mb-3">
                <strong className="text-rose-700">Medical decisions remain the sole responsibility of caregivers and healthcare providers.</strong> 
                CareSolis notifications are <strong>observational alerts only</strong> and should not be interpreted as medical recommendations.
              </p>

              <p className="text-slate-800 mb-3">
                <strong>Device-Driven Architecture:</strong> All medication adherence records are created exclusively by 
                <strong> physical IR sensor detection</strong> at the device. Care Circle members cannot manually clear, 
                acknowledge, or snooze escalations to maintain audit trail integrity and FDA compliance.
              </p>

              <p className="text-slate-800">
                By using CareSolis, you acknowledge that the system is an <strong>open-loop monitoring device</strong> 
                that requires caregiver supervision. All clinical decisions must be made by qualified healthcare professionals.
              </p>
            </div>
          </div>
        </div>

        {/* OPTICAL CONFIRMATION DISCLAIMER */}
        <div className="bg-yellow-50 border-2 border-yellow-600 rounded-2xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <Info size={32} className="text-yellow-600 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-yellow-900 mb-2">OPTICAL CONFIRMATION LIMITATION</h2>
              <p className="text-yellow-800 font-semibold">Critical for FDA regulatory positioning and liability protection</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-yellow-300">
            <div className="prose prose-slate max-w-none">
              <p className="text-lg font-semibold text-slate-900 mb-4">
                <strong className="text-yellow-700">REMOVAL CONFIRMED. INGESTION NOT VERIFIED.</strong>
              </p>
              
              <p className="text-slate-800 mb-3">
                The Solis medication module uses <strong>optical sensing</strong> to confirm that medication has been 
                <strong> removed from its compartment</strong>. This technology detects <strong>compartment emptying</strong>, 
                not actual ingestion by the patient.
              </p>

              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-600 mb-4">
                <p className="text-sm font-bold text-yellow-900 mb-2">TECHNICAL LIMITATION</p>
                <p className="text-sm text-yellow-800">
                  Optical sensors cannot determine whether medication was:
                </p>
                <ul className="text-sm text-yellow-800 ml-4 mt-2 space-y-1">
                  <li>• Actually swallowed by the patient</li>
                  <li>• Discarded or hidden</li>
                  <li>• Taken by someone else</li>
                  <li>• Consumed in the correct manner (e.g., with food, water)</li>
                </ul>
              </div>

              <p className="text-slate-800">
                <strong>Caregivers must independently verify medication adherence</strong> through direct observation, 
                patient communication, or other clinical methods. Optical confirmation is a <strong>support indicator only</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* ESCALATION RELIABILITY DISCLAIMER */}
        <div className="bg-blue-50 border-2 border-blue-600 rounded-2xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <Shield size={32} className="text-blue-600 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-2">ESCALATION & CONNECTIVITY LIMITATIONS</h2>
              <p className="text-blue-800 font-semibold">ISO 14971 Risk Analysis requirement</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-blue-300">
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-800 mb-3">
                Caresolis uses <strong>network-based escalation</strong> to notify caregivers of missed doses or system events. 
                However, network connectivity <strong>cannot be guaranteed 100% of the time</strong>.
              </p>

              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600 mb-4">
                <p className="text-sm font-bold text-blue-900 mb-2">POSSIBLE FAILURE SCENARIOS</p>
                <ul className="text-sm text-blue-800 ml-4 space-y-1">
                  <li>• WiFi or LTE network outage</li>
                  <li>• Device malfunction or power failure</li>
                  <li>• Cloud service interruption</li>
                  <li>• Caregiver phone connectivity issues</li>
                  <li>• SMS/push notification delivery delays</li>
                </ul>
              </div>

              <p className="text-slate-800 mb-3">
                <strong className="text-blue-700">Caregivers must maintain independent monitoring protocols</strong> and cannot 
                rely solely on Caresolis notifications for time-critical medication adherence.
              </p>

              <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-600">
                <p className="text-sm font-bold text-emerald-900 mb-2">IMPLEMENTED SAFEGUARDS</p>
                <ul className="text-sm text-emerald-800 ml-4 space-y-1">
                  <li>• 30-second heartbeat monitoring</li>
                  <li>• Dual-path communication (WiFi + LTE failover)</li>
                  <li>• Offline duration logging</li>
                  <li>• Connectivity loss alerts to caregivers</li>
                  <li>• Battery backup for critical event logging</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* NO CLINICAL DECISION SUPPORT */}
        <div className="bg-purple-50 border-2 border-purple-600 rounded-2xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <AlertTriangle size={32} className="text-purple-600 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-purple-900 mb-2">NOT A CLINICAL DECISION SUPPORT SYSTEM</h2>
              <p className="text-purple-800 font-semibold">FDA regulatory classification boundary</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-purple-300">
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-800 mb-3">
                Caresolis does <strong>NOT</strong> provide clinical decision support, treatment recommendations, or diagnostic capabilities.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-rose-50 p-4 rounded-lg border-l-4 border-rose-600">
                  <p className="text-sm font-bold text-rose-900 mb-2">❌ CARESOLIS DOES NOT</p>
                  <ul className="text-sm text-rose-800 ml-4 space-y-1">
                    <li>• Recommend medication dosages</li>
                    <li>• Suggest treatment changes</li>
                    <li>• Diagnose medical conditions</li>
                    <li>• Automatically adjust medication schedules</li>
                    <li>• Provide medical advice</li>
                    <li>• Replace physician oversight</li>
                  </ul>
                </div>

                <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-600">
                  <p className="text-sm font-bold text-emerald-900 mb-2">✅ CARESOLIS PROVIDES</p>
                  <ul className="text-sm text-emerald-800 ml-4 space-y-1">
                    <li>• Adherence tracking support</li>
                    <li>• Activity visibility reporting</li>
                    <li>• Scheduled dose reminders</li>
                    <li>• Caregiver notification tools</li>
                    <li>• Event logging for review</li>
                    <li>• Infrastructure health monitoring</li>
                  </ul>
                </div>
              </div>

              <p className="text-slate-800">
                All notifications to physicians are <strong>informational only</strong>. For example, a notification stating 
                "Patient adherence below 80%" does <strong>NOT</strong> recommend any specific action. Clinical decisions remain 
                with the healthcare provider.
              </p>
            </div>
          </div>
        </div>

        {/* SETUP ACKNOWLEDGMENT */}
        <div className="bg-slate-50 border-2 border-slate-600 rounded-2xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <CheckCircle2 size={32} className="text-slate-600 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">REQUIRED SETUP ACKNOWLEDGMENT</h2>
              <p className="text-slate-600 font-semibold">Signed during initial system configuration</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-slate-300">
            <div className="prose prose-slate max-w-none">
              <p className="text-sm font-bold text-slate-900 mb-3">BY COMPLETING CARESOLIS SETUP, I ACKNOWLEDGE:</p>
              
              <div className="space-y-3 text-sm text-slate-800">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p>
                    I understand that CareSolis is an <strong>FDA Class II medication adherence monitoring device</strong> (open-loop) that requires caregiver supervision and independent monitoring protocols.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p>
                    I understand that optical confirmation indicates <strong>medication removal</strong>, not ingestion verification.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p>
                    I acknowledge that <strong>network-based escalations may fail</strong> due to connectivity issues or system malfunctions.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p>
                    I agree to maintain <strong>independent monitoring protocols</strong> and will not rely solely on Caresolis notifications 
                    for time-critical medication adherence.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p>
                    I understand that <strong>all medical decisions remain my responsibility</strong> or the responsibility of qualified 
                    healthcare providers.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p>
                    I acknowledge that Caresolis notifications are <strong>advisory only</strong> and do not constitute medical advice.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-slate-100 rounded-lg">
                <p className="text-xs text-slate-600">
                  <strong>Legal Notice:</strong> This acknowledgment is stored in an immutable audit log with cryptographic timestamp. 
                  Your signature confirms understanding of system limitations and prevents reliance claims under product liability law.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ACQUISITION DUE DILIGENCE FOOTER */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Shield size={32} className="flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-3">Regulatory Compliance & Acquisition Readiness</h2>
              <p className="text-blue-100 mb-4">
                Caresolis is designed as infrastructure-grade wellness technology with clear regulatory positioning 
                and comprehensive liability safeguards for acquisition due diligence.
              </p>
              <ul className="space-y-2 text-blue-100 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                  <span><strong>FDA Class II Medical Device:</strong> Caresolis operates under Class II regulatory framework with comprehensive risk management protocols (ISO 14971) and maintains clear boundaries as a support system, not clinical decision support.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                  <span><strong>Liability Protection:</strong> Triple-redundant logging (audit, system, event), cryptographic timestamping, and mandatory setup acknowledgments prevent reliance claims and support product liability defense.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                  <span><strong>No Autonomous Dispense:</strong> Device architecture prohibits external autonomous dispense commands, maintaining patient agency and reducing regulatory risk surface.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                  <span><strong>Acquisition Readiness:</strong> Complete legal framework, documented risk analysis, and regulatory positioning prevent valuation haircut during acquisition due diligence.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}