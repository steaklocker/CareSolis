import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { BookOpen, Shield, FileText, AlertTriangle, DollarSign, UserCog, CheckCircle2, ChevronRight } from 'lucide-react';

/**
 * Provider/Clinician Manual
 *
 * Comprehensive documentation for healthcare providers using CareSolis RTM
 *
 * Audience: Healthcare providers (MD, DO, NP, PA), clinical administrators, billing staff
 * Content: RTM billing, electronic signatures, patient consent, FDA compliance
 *
 * Note: This is separate from the CareGiver Manual (/manual) which is for family members
 */

export default function ProviderManual() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    {
      id: 'overview',
      title: 'Overview & Getting Started',
      icon: BookOpen,
    },
    {
      id: 'rtm-billing',
      title: 'RTM Billing & Medicare CPT Codes (2026)',
      icon: DollarSign,
    },
    {
      id: 'signatures',
      title: 'Electronic Signature Guide',
      icon: Shield,
    },
    {
      id: 'consent',
      title: 'Patient Consent Workflow',
      icon: FileText,
    },
    {
      id: 'malfunction',
      title: 'Device Malfunction Reporting',
      icon: AlertTriangle,
    },
    {
      id: 'fda-compliance',
      title: 'FDA Compliance Checklist',
      icon: CheckCircle2,
    },
    {
      id: 'caregiver-activity-log',
      title: 'Caregiver Activity Log',
      icon: Shield,
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-100">CareSolis Provider Manual</h1>
            <p className="text-lg text-emerald-400">For Healthcare Providers & Clinical Staff</p>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-slate-200 mb-3">Who This Manual Is For</h2>
              <p className="text-slate-300 mb-4">This manual is designed for:</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Healthcare Providers (MD, DO, NP, PA)</li>
                <li>Clinical Administrators</li>
                <li>Billing Staff with NPI</li>
                <li>Compliance Officers</li>
              </ul>
              <p className="text-rose-400 mt-4">❌ Not for family caregivers - See "Caregiver Manual" instead</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-slate-200 mb-3">What Is CareSolis?</h2>
              <p className="text-slate-300 mb-4">
                CareSolis is an FDA-compliant Remote Therapeutic Monitoring (RTM) system that:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Monitors medication adherence via automated dispenser</li>
                <li>Tracks daily patient interactions for therapeutic compliance</li>
                <li>Provides Care Circle escalation alerts</li>
                <li>Enables Medicare RTM billing (CPT 98975, 98977, 98985, 98979, 98980, 98981)</li>
              </ul>
            </div>

            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-emerald-300 mb-3">Quick Start (5 Minutes)</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-emerald-200 mb-2">Step 1: Enroll Patient</h3>
                  <ol className="list-decimal list-inside text-slate-300 space-y-1">
                    <li>Go to Clinical Operations → Clinical Dashboard → RTM Billing tab</li>
                    <li>Click "Enroll Patient"</li>
                    <li>Fill in patient demographics</li>
                    <li>Obtain patient consent</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-emerald-200 mb-2">Step 2: Log Provider Activities</h3>
                  <ol className="list-decimal list-inside text-slate-300 space-y-1">
                    <li>Go to Clinical Dashboard → RTM Billing tab</li>
                    <li>Select patient and click "Log Activity"</li>
                    <li>Choose activity type (interactive communication required for treatment mgmt)</li>
                    <li>Enter duration and clinical notes</li>
                    <li>Click "Log Activity" to save</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-emerald-200 mb-2">Step 3: Review Billing Compliance</h3>
                  <ol className="list-decimal list-inside text-slate-300 space-y-1">
                    <li>Check monthly RTM Dashboard metrics</li>
                    <li>Verify ≥2 days of data (partial tier) or ≥16 days (full tier)</li>
                    <li>Verify ≥10 minutes provider time (partial) or ≥20 min (full)</li>
                    <li>Submit billing to Medicare</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        );

      case 'rtm-billing':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-100">RTM Billing & Medicare CPT Codes</h1>
            <p className="text-lg text-purple-400">Remote Therapeutic Monitoring • 2026 CMS Final Rule</p>

            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-purple-300 mb-3">🆕 What Changed in 2026?</h2>
              <p className="text-slate-300 mb-4">CMS significantly expanded RTM access with dual-tier engagement:</p>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
                  <h3 className="font-semibold text-emerald-300 mb-2">Full Engagement (16-30 days)</h3>
                  <p className="text-sm text-slate-300">CPT 98977 • $40.08/month</p>
                  <p className="text-xs text-slate-400 mt-1">Same as before — for patients with consistent data</p>
                </div>

                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-300 mb-2">Partial Engagement (2-15 days) NEW</h3>
                  <p className="text-sm text-slate-300">CPT 98985 • $40.08/month</p>
                  <p className="text-xs text-purple-300 mt-1 font-semibold">🆕 Lower threshold — previously unbillable patients now qualify!</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
                  <h3 className="font-semibold text-emerald-300 mb-2">Treatment Mgmt - 20+ Min</h3>
                  <p className="text-sm text-slate-300">CPT 98980 • $52.00/month</p>
                  <p className="text-xs text-slate-400 mt-1">Requires interactive communication (phone/video)</p>
                </div>

                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-300 mb-2">Treatment Mgmt - 10-19 Min NEW</h3>
                  <p className="text-sm text-slate-300">CPT 98979 • $33.40/month</p>
                  <p className="text-xs text-purple-300 mt-1 font-semibold">🆕 Partial tier for lower-intensity patients!</p>
                </div>
              </div>

              <p className="text-emerald-400 font-semibold mt-4">Clinical Impact: More patients qualify, lower documentation burden, same quality of care</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-slate-200 mb-4">Complete RTM CPT Code Reference</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-slate-300">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-4 py-2 text-left">Code</th>
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2 text-left">Amount</th>
                      <th className="px-4 py-2 text-left">Requirements</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    <tr>
                      <td className="px-4 py-3 font-semibold text-emerald-400">98975</td>
                      <td className="px-4 py-3">Initial Setup & Education</td>
                      <td className="px-4 py-3">$22.00</td>
                      <td className="px-4 py-3">Once per episode</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-emerald-400">98977</td>
                      <td className="px-4 py-3">Device Supply — Full (16-30 days)</td>
                      <td className="px-4 py-3">$40.08</td>
                      <td className="px-4 py-3">Per 30-day period</td>
                    </tr>
                    <tr className="bg-purple-900/10">
                      <td className="px-4 py-3 font-semibold text-purple-400">98985 🆕</td>
                      <td className="px-4 py-3">Device Supply — Partial (2-15 days)</td>
                      <td className="px-4 py-3">$40.08</td>
                      <td className="px-4 py-3">Per 30-day period</td>
                    </tr>
                    <tr className="bg-purple-900/10">
                      <td className="px-4 py-3 font-semibold text-purple-400">98979 🆕</td>
                      <td className="px-4 py-3">Treatment Mgmt — 10-19 Minutes</td>
                      <td className="px-4 py-3">$33.40</td>
                      <td className="px-4 py-3">Interactive comm required</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-emerald-400">98980</td>
                      <td className="px-4 py-3">Treatment Mgmt — 20+ Minutes</td>
                      <td className="px-4 py-3">$52.00</td>
                      <td className="px-4 py-3">Interactive comm required</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-emerald-400">98981</td>
                      <td className="px-4 py-3">Additional 20-Minute Blocks</td>
                      <td className="px-4 py-3">$41.00</td>
                      <td className="px-4 py-3">Add-on code</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-emerald-400 font-semibold mt-4">Monthly Revenue Potential: $22-$165+ per patient (varies by engagement level)</p>
            </div>

            <div className="bg-rose-900/20 border border-rose-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-rose-300 mb-3">⚠️ Critical Compliance Requirement</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-rose-200 mb-2">Interactive Communication Mandate (98979/98980/98981)</h3>
                  <p className="text-slate-300 mb-3">Treatment management codes <span className="font-bold text-rose-300">REQUIRE at least one real-time synchronous two-way interaction</span> per billing period.</p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-emerald-300 mb-2">✓ What Qualifies</p>
                      <ul className="list-disc list-inside text-slate-300 space-y-1 text-sm">
                        <li>Phone calls (two-way audio)</li>
                        <li>Video consultations</li>
                        <li>Real-time telemedicine sessions</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-rose-300 mb-2">✗ What Does NOT Qualify</p>
                      <ul className="list-disc list-inside text-slate-300 space-y-1 text-sm">
                        <li>Email exchanges</li>
                        <li>Text messages</li>
                        <li>Patient portal messages</li>
                        <li>Asynchronous communication</li>
                      </ul>
                    </div>
                  </div>

                  <p className="text-amber-300 font-semibold mt-3 text-sm">CareSolis Dashboard tracks this automatically — patients without interactive comm show "Blocked" status</p>
                </div>

                <div>
                  <h3 className="font-semibold text-rose-200 mb-2">RTM vs RPM Restriction</h3>
                  <p className="text-slate-300 text-sm">You <span className="font-bold">CANNOT bill both RTM and RPM</span> for the same patient in the same calendar month. Choose one billing pathway per patient per month.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-rose-200 mb-2">Single Clinician Rule</h3>
                  <p className="text-slate-300 text-sm">Only <span className="font-bold">ONE clinician</span> may submit RTM claims per 30-day period per patient. Care coordination is allowed, but primary managing provider bills.</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-300 mb-3">Clinical Use Cases for RTM</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-blue-200 mb-2">Use Case 1: High-Adherence Patient (Margaret Chen)</h3>
                  <div className="bg-slate-700/30 rounded p-3 mb-2">
                    <p className="text-slate-300 text-sm mb-2"><span className="font-semibold">Scenario:</span> 72-year-old with heart failure on 6 daily medications. Uses CareSolis consistently.</p>
                    <p className="text-slate-300 text-sm"><span className="font-semibold">Data:</span> 22 days with interaction data, 35 minutes provider time, monthly phone call completed</p>
                  </div>
                  <p className="text-emerald-300 font-semibold text-sm">Billable CPTs:</p>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 text-sm ml-4">
                    <li>CPT 98977 (full engagement, 16-30 days) — $40.08</li>
                    <li>CPT 98980 (treatment mgmt, 20+ min) — $52.00</li>
                    <li><span className="font-bold text-emerald-400">Total: $92.08/month</span></li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-blue-200 mb-2">Use Case 2: Partial-Engagement Patient (Robert Williams) 🆕</h3>
                  <div className="bg-slate-700/30 rounded p-3 mb-2">
                    <p className="text-slate-300 text-sm mb-2"><span className="font-semibold">Scenario:</span> 68-year-old with COPD, travels frequently. Inconsistent CareSolis use but still benefits from monitoring.</p>
                    <p className="text-slate-300 text-sm"><span className="font-semibold">Data:</span> 12 days with data (previously unbillable!), 15 minutes provider time, video consult completed</p>
                  </div>
                  <p className="text-purple-300 font-semibold text-sm">Billable CPTs (NEW 2026):</p>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 text-sm ml-4">
                    <li>CPT 98985 (partial engagement, 2-15 days) — $40.08 🆕</li>
                    <li>CPT 98979 (treatment mgmt, 10-19 min) — $33.40 🆕</li>
                    <li><span className="font-bold text-purple-400">Total: $73.48/month (previously $0)</span></li>
                  </ul>
                  <p className="text-purple-300 text-xs mt-2">⭐ This patient would NOT have been billable under 2025 rules!</p>
                </div>

                <div>
                  <h3 className="font-semibold text-blue-200 mb-2">Use Case 3: Non-Billable Patient (Patricia Martinez)</h3>
                  <div className="bg-slate-700/30 rounded p-3 mb-2">
                    <p className="text-slate-300 text-sm mb-2"><span className="font-semibold">Scenario:</span> 55-year-old post-stroke on anticoagulation. Poor adherence, minimal device interaction.</p>
                    <p className="text-slate-300 text-sm"><span className="font-semibold">Data:</span> 8 days with data (qualifies for 98985), 8 minutes provider time (data review only), NO interactive communication</p>
                  </div>
                  <p className="text-rose-300 font-semibold text-sm">Blocked from Billing:</p>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 text-sm ml-4">
                    <li>CPT 98985 eligible (8 days ≥ 2) — $40.08</li>
                    <li>CPT 98979 BLOCKED (no phone/video call) — $0.00</li>
                    <li><span className="font-bold text-rose-400">Total: $40.08 potential, but need phone call to bill treatment mgmt</span></li>
                  </ul>
                  <p className="text-amber-300 text-xs mt-2">Action: Schedule phone call to unblock CPT 98979 and reach 10-minute threshold</p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-emerald-300 mb-4">Monthly RTM Workflow for Providers</h2>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold text-sm">1</div>
                  <div>
                    <h3 className="font-semibold text-emerald-200 mb-1">Day 1-10: Provide Care & Log Activities</h3>
                    <ul className="list-disc list-inside text-slate-300 space-y-1 text-sm">
                      <li>Monitor CareSolis dashboard for adherence patterns</li>
                      <li>Respond to escalation alerts (log as "Data Review" — 2-5 min each)</li>
                      <li>Document care plan adjustments</li>
                      <li>CareSolis automatically tracks "days with data"</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold text-sm">2</div>
                  <div>
                    <h3 className="font-semibold text-emerald-200 mb-1">Day 10-15: Mid-Month Check & Interactive Communication</h3>
                    <ul className="list-disc list-inside text-slate-300 space-y-1 text-sm">
                      <li>Review RTM Dashboard → Check "Action Required" count</li>
                      <li><span className="font-bold text-purple-300">Schedule phone/video calls</span> for patients needing interactive comm</li>
                      <li>Log calls as "Patient Call" or "Video Consultation" (✓ Interactive badge)</li>
                      <li>Verify provider time ≥10 minutes (partial tier) or ≥20 minutes (full tier)</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold text-sm">3</div>
                  <div>
                    <h3 className="font-semibold text-emerald-200 mb-1">Day 20-25: Final Compliance Review</h3>
                    <ul className="list-disc list-inside text-slate-300 space-y-1 text-sm">
                      <li>Check each patient card: Green = billable, Amber = partial, Rose/Blocked = action needed</li>
                      <li>Verify "Interactive Comm" shows green checkmark for all treatment mgmt patients</li>
                      <li>Schedule catch-up calls for patients showing "Blocked" status</li>
                      <li>Review "Days with Data" — ensure patients have ≥2 days (partial) or ≥16 days (full)</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold text-sm">4</div>
                  <div>
                    <h3 className="font-semibold text-emerald-200 mb-1">Day 25-31: Export & Submit Billing</h3>
                    <ul className="list-disc list-inside text-slate-300 space-y-1 text-sm">
                      <li>Navigate to: Clinical Dashboard → RTM Billing → Export Billing tab</li>
                      <li>Click "Export This Period" → Download billing documentation</li>
                      <li>Review export for accuracy (patient names, CPT codes, amounts)</li>
                      <li>Submit to EHR/practice management system or billing department</li>
                      <li>Retain export file for audit trail (HIPAA requirement)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-amber-300 mb-3">Therapy Provider Modifiers (PT, OT, SLP)</h2>
              <div className="space-y-3">
                <p className="text-slate-300">If you are a Physical Therapist, Occupational Therapist, or Speech-Language Pathologist, you <span className="font-bold">must append modifiers</span> to RTM claims:</p>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-slate-700/30 rounded p-3">
                    <p className="font-semibold text-amber-200 mb-1">GP Modifier</p>
                    <p className="text-slate-300 text-sm">Physical therapy services</p>
                    <p className="text-xs text-slate-400 mt-1">Example: CPT 98980-GP</p>
                  </div>
                  <div className="bg-slate-700/30 rounded p-3">
                    <p className="font-semibold text-amber-200 mb-1">GO Modifier</p>
                    <p className="text-slate-300 text-sm">Occupational therapy services</p>
                    <p className="text-xs text-slate-400 mt-1">Example: CPT 98979-GO</p>
                  </div>
                  <div className="bg-slate-700/30 rounded p-3">
                    <p className="font-semibold text-amber-200 mb-1">GN Modifier</p>
                    <p className="text-slate-300 text-sm">Speech-language pathology</p>
                    <p className="text-xs text-slate-400 mt-1">Example: CPT 98977-GN</p>
                  </div>
                </div>

                <p className="text-amber-300 text-sm">⚠️ CareSolis enrollment modal will remind you of this requirement when you select PT/OT/SLP provider type</p>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-slate-200 mb-3">Common Billing Errors & How to Avoid Them</h2>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-rose-300">❌ Error 1: Logging provider time without interactive communication</p>
                  <p className="text-slate-300 text-sm">Example: 15 minutes of "Data Review" logged, no phone call</p>
                  <p className="text-slate-400 text-sm">Impact: Patient shows "Blocked" for CPT 98979 — cannot bill treatment management</p>
                  <p className="text-emerald-400 text-sm font-semibold">Fix: Schedule phone/video call, log as "Patient Call" activity</p>
                </div>

                <div>
                  <p className="font-semibold text-rose-300">❌ Error 2: Billing both RTM and RPM for same patient</p>
                  <p className="text-slate-300 text-sm">Example: Patient has blood pressure monitor (RPM) AND CareSolis (RTM)</p>
                  <p className="text-slate-400 text-sm">Impact: Medicare will reject one or both claims</p>
                  <p className="text-emerald-400 text-sm font-semibold">Fix: Choose one billing pathway per month — cannot mix</p>
                </div>

                <div>
                  <p className="font-semibold text-rose-300">❌ Error 3: Multiple clinicians billing same patient</p>
                  <p className="text-slate-300 text-sm">Example: PCP and cardiologist both submit RTM claims for same patient</p>
                  <p className="text-slate-400 text-sm">Impact: Compliance violation, potential audit</p>
                  <p className="text-emerald-400 text-sm font-semibold">Fix: Designate one primary managing provider per patient</p>
                </div>

                <div>
                  <p className="font-semibold text-rose-300">❌ Error 4: Email/text counted as interactive communication</p>
                  <p className="text-slate-300 text-sm">Example: Sent 3 emails to patient, logged 12 minutes, tried to bill CPT 98979</p>
                  <p className="text-slate-400 text-sm">Impact: Claim denied — email does not satisfy synchronous requirement</p>
                  <p className="text-emerald-400 text-sm font-semibold">Fix: Must conduct actual phone or video call</p>
                </div>

                <div>
                  <p className="font-semibold text-rose-300">❌ Error 5: Missing NPI or invalid 10-digit format</p>
                  <p className="text-slate-300 text-sm">Example: Entered 9-digit NPI or used facility NPI instead of individual NPI</p>
                  <p className="text-slate-400 text-sm">Impact: CareSolis enrollment blocked, cannot assign patient to provider</p>
                  <p className="text-emerald-400 text-sm font-semibold">Fix: Verify your individual NPI at nppes.cms.hhs.gov (must be exactly 10 digits)</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-300 mb-3">Provider Activity Logging Best Practices</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-blue-200 mb-1">1. Log Activities Immediately</h3>
                  <p className="text-slate-300 text-sm">After each patient interaction, log the activity right away. Don't wait until end of month — details fade and time estimates become inaccurate.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-blue-200 mb-1">2. Be Specific in Clinical Notes</h3>
                  <p className="text-slate-300 text-sm mb-2">Instead of: "Reviewed patient data"</p>
                  <p className="text-emerald-300 text-sm">Write: "Reviewed 7-day adherence trend for evening Metformin doses, discussed missed doses on 5/2 and 5/4 during phone call, adjusted reminder time to 7pm"</p>
                </div>

                <div>
                  <h3 className="font-semibold text-blue-200 mb-1">3. Choose Correct Activity Type</h3>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 text-sm">
                    <li><span className="font-semibold">Data Review:</span> Looking at CareSolis dashboard, analyzing patterns</li>
                    <li><span className="font-semibold text-sky-400">Patient Call (Interactive):</span> Phone conversation with patient/caregiver</li>
                    <li><span className="font-semibold">Care Plan Update:</span> Documenting treatment changes</li>
                    <li><span className="font-semibold">Provider Coordination:</span> Communicating with other clinicians</li>
                    <li><span className="font-semibold text-sky-400">Video Consultation (Interactive):</span> Video call with patient/caregiver</li>
                    <li><span className="font-semibold">Clinical Documentation:</span> Writing notes, preparing reports</li>
                  </ul>
                  <p className="text-sky-300 text-sm mt-2">💡 Activities with blue "✓ Interactive" badge satisfy interactive communication requirement</p>
                </div>

                <div>
                  <h3 className="font-semibold text-blue-200 mb-1">4. Track Time Accurately</h3>
                  <p className="text-slate-300 text-sm">Use a timer during patient interactions. Medicare audits can request documentation proving time spent. Round to nearest minute, don't inflate.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-blue-200 mb-1">5. Monitor Session Summary Bar</h3>
                  <p className="text-slate-300 text-sm">After logging each activity, check the session summary bar at bottom of Provider Activity Logger:</p>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 text-sm ml-4">
                    <li>"This period: XX min logged" — tracks toward CPT thresholds</li>
                    <li>"✓ Interactive communication recorded" or "✗ No interactive communication"</li>
                    <li>"→ CPT 98979 eligible" or "→ 5 min to CPT 98979" — shows next milestone</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-slate-200 mb-3">Legal & Liability Considerations</h2>
              <div className="space-y-3">
                <div className="bg-rose-900/20 border border-rose-500/30 rounded-lg p-4">
                  <h3 className="font-semibold text-rose-300 mb-2">⚠️ False Claims Act Warning</h3>
                  <p className="text-slate-300 text-sm">Billing for RTM services not actually provided constitutes Medicare fraud under the False Claims Act. Penalties include:</p>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 text-sm ml-4 mt-2">
                    <li>$11,000-$22,000 per false claim</li>
                    <li>Treble damages (3x amount claimed)</li>
                    <li>Exclusion from Medicare/Medicaid programs</li>
                    <li>License suspension or revocation</li>
                    <li>Criminal prosecution for knowing fraud</li>
                  </ul>
                  <p className="text-rose-300 font-semibold text-sm mt-3">⚠️ ONLY bill for services you actually provided. CareSolis audit trail documents all activities with timestamps.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-200 mb-2">Documentation Standards</h3>
                  <p className="text-slate-300 text-sm">All RTM activities must be documented to the same standard as in-person clinical encounters. This includes:</p>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 text-sm ml-4">
                    <li>Date and time of service</li>
                    <li>Duration of service</li>
                    <li>Type of service (data review, patient call, etc.)</li>
                    <li>Clinical findings and interventions</li>
                    <li>Provider signature with NPI</li>
                  </ul>
                  <p className="text-emerald-300 text-sm mt-2">✓ CareSolis automatically captures all required elements via Provider Activity Logger</p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-200 mb-2">Audit Preparedness</h3>
                  <p className="text-slate-300 text-sm mb-2">Medicare can audit RTM claims up to 7 years retroactively. Keep all documentation including:</p>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 text-sm ml-4">
                    <li>Monthly billing exports from CareSolis</li>
                    <li>Patient enrollment consent forms</li>
                    <li>Provider activity logs with timestamps</li>
                    <li>Interactive communication records (call logs, video session notes)</li>
                    <li>Device data transmission logs (days with data verification)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'signatures':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-100">Electronic Signature Guide</h1>
            <p className="text-lg text-blue-400">FDA 21 CFR Part 11 Compliance</p>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-slate-200 mb-3">Why Electronic Signatures?</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-slate-300 mb-1">Legal Requirements</h3>
                  <ul className="list-disc list-inside text-slate-400 space-y-1">
                    <li>FDA 21 CFR Part 11 - Electronic signatures must be verifiable and non-repudiable</li>
                    <li>Medicare Compliance - Billing activities require provider attestation</li>
                    <li>Audit Trail - All clinical activities must be logged</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-300 mb-1">What CareSolis Does</h3>
                  <p className="text-slate-400">CareSolis uses cryptographic SHA-256 hashing to create legally binding electronic signatures that meet FDA and Medicare requirements.</p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-emerald-300 mb-4">The Signing Process</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold">1</div>
                  <div>
                    <h3 className="font-semibold text-slate-200">Trigger Signature</h3>
                    <p className="text-slate-400 text-sm">Click "Sign & Save Activity" → Signature modal opens</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold">2</div>
                  <div>
                    <h3 className="font-semibold text-slate-200">Verify Identity</h3>
                    <p className="text-slate-400 text-sm">Enter your name, NPI (10 digits), credentials (MD, RN, NP, PA)</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold">3</div>
                  <div>
                    <h3 className="font-semibold text-slate-200">Authenticate</h3>
                    <p className="text-slate-400 text-sm">Enter password (8+ characters) - System does NOT store your password</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold">4</div>
                  <div>
                    <h3 className="font-semibold text-slate-200">Document Intent</h3>
                    <p className="text-slate-400 text-sm">Write signature meaning: "I certify I reviewed this patient's RPM data..."</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold">5</div>
                  <div>
                    <h3 className="font-semibold text-slate-200">Generate Signature</h3>
                    <p className="text-slate-400 text-sm">System creates unique SHA-256 hash (64-character cryptographic proof)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-300 mb-3">NPI Validation</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-blue-200 mb-1">What Is NPI?</h3>
                  <p className="text-slate-400">National Provider Identifier (NPI) - Unique 10-digit number issued by CMS to healthcare providers</p>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-200 mb-1">Requirements</h3>
                  <ul className="list-disc list-inside text-slate-400 space-y-1">
                    <li>Exactly 10 digits (no letters)</li>
                    <li>No spaces or dashes</li>
                    <li>Must be YOUR NPI (not facility NPI)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-200 mb-1">How to Find Your NPI</h3>
                  <ol className="list-decimal list-inside text-slate-400 space-y-1">
                    <li>Go to https://nppesnpi.cms.hhs.gov</li>
                    <li>Search by name</li>
                    <li>Copy your 10-digit NPI</li>
                    <li>Save in password manager for easy access</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-amber-300 mb-3">Security Features</h2>
              <ul className="space-y-2 text-slate-300">
                <li>✅ Cryptographic SHA-256 hashing (one-way function)</li>
                <li>✅ Collision-resistant (virtually impossible to create duplicate hash)</li>
                <li>✅ Timestamp precision (millisecond accuracy)</li>
                <li>✅ Password salting (different passwords = different hashes)</li>
                <li>✅ IP tracking (location audit trail)</li>
                <li>✅ Immutable storage (cannot edit after signing)</li>
              </ul>
            </div>
          </div>
        );

      case 'consent':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-100">Patient Consent Workflow</h1>
            
            <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">Medicare requires informed consent before enrolling patients in Remote Therapeutic Monitoring (RTM).</p>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-slate-200 mb-4">Consent Form Contents</h2>
              <p className="text-slate-300 mb-3">CareSolis consent form includes 12 sections:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="text-slate-400 text-sm">1. Purpose of RTM Program</div>
                <div className="text-slate-400 text-sm">2. How the System Works</div>
                <div className="text-slate-400 text-sm">3. What Data Is Collected</div>
                <div className="text-slate-400 text-sm">4. Data Privacy & Security</div>
                <div className="text-slate-400 text-sm">5. Medicare Billing</div>
                <div className="text-slate-400 text-sm">6. Provider Responsibilities</div>
                <div className="text-slate-400 text-sm">7. Patient Responsibilities</div>
                <div className="text-slate-400 text-sm">8. Limitations of the System</div>
                <div className="text-slate-400 text-sm">9. Risks & Benefits</div>
                <div className="text-slate-400 text-sm">10. Right to Refuse or Withdraw</div>
                <div className="text-slate-400 text-sm">11. Questions & Concerns</div>
                <div className="text-slate-400 text-sm">12. Consent Confirmation</div>
              </div>
            </div>

            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-emerald-300 mb-4">Consent Workflow Steps</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-emerald-200 mb-2">Step 1: Prepare Patient</h3>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    <li>Explain RPM program verbally</li>
                    <li>Answer patient questions</li>
                    <li>Assess patient capacity to consent</li>
                    <li>Identify caregiver if needed</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-emerald-200 mb-2">Step 2: Present Consent Form</h3>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    <li>Go to Clinical Dashboard → RTM Billing tab → Click "Enroll Patient"</li>
                    <li>Enter patient name and provider information</li>
                    <li>Review consent language with patient</li>
                    <li>Check "Patient Consent Obtained" checkbox</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-emerald-200 mb-2">Step 3: Patient Reviews & Signs</h3>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    <li>Patient scrolls through entire consent form (enforced)</li>
                    <li>Clicks "I Consent - Sign Now" (disabled until scroll complete)</li>
                    <li>Completes electronic signature</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-emerald-200 mb-2">Step 4: Provider Witnesses</h3>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    <li>Provider completes electronic signature with NPI</li>
                    <li>System stores consent permanently</li>
                    <li>Audit trail created</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-300 mb-3">Scroll-to-Read Enforcement</h2>
              <div className="space-y-3">
                <p className="text-slate-300">Why it's required:</p>
                <ul className="list-disc list-inside text-slate-400 space-y-1">
                  <li>Legal validity - Patient must read full document</li>
                  <li>Medicare compliance - Informed consent requirement</li>
                  <li>Liability protection - Proof patient was informed</li>
                </ul>
                <div className="mt-3 bg-slate-800/50 border border-slate-700 rounded p-3">
                  <p className="text-sm text-slate-400">How it works: Consent form shows amber warning "Please scroll to end" → Patient scrolls through all 12 sections → Green checkmark appears → "I Consent" button becomes enabled. Cannot bypass.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'malfunction':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-100">Device Malfunction Reporting</h1>
            <p className="text-lg text-rose-400">FDA 21 CFR Part 803 Requirements</p>
            
            <div className="bg-rose-900/20 border border-rose-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-rose-300 mb-3">FDA Requirements</h2>
              <p className="text-slate-300 mb-4">The FDA Medical Device Reporting (MDR) regulation requires reporting:</p>
              <ul className="space-y-2 text-slate-300">
                <li>🔴 <span className="font-semibold">Death</span> - Device caused or contributed to death (5 working days)</li>
                <li>🟠 <span className="font-semibold">Serious Injury</span> - Device caused serious injury (30 calendar days)</li>
                <li>🟡 <span className="font-semibold">Malfunction</span> - Device malfunctioned and could cause harm if recurring (30 calendar days)</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-slate-200 mb-4">Malfunction Types</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-rose-900/20 rounded">
                  <span className="text-rose-400 font-semibold">🔴 High Risk</span>
                  <span className="text-slate-300">Missed Dose, Dispense Failure</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-amber-900/20 rounded">
                  <span className="text-amber-400 font-semibold">🟡 Medium Risk</span>
                  <span className="text-slate-300">Connectivity Failure, Power Failure, Software Crash</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-blue-900/20 rounded">
                  <span className="text-blue-400 font-semibold">🔵 Low Risk</span>
                  <span className="text-slate-300">False Positive, Sensor Error</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-emerald-300 mb-4">How to File a Malfunction Report</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-emerald-200 mb-2">Step 1: Identify Malfunction</h3>
                  <p className="text-slate-400 text-sm">Gather information: When? What happened to device? What happened to patient? What medication was missed?</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-emerald-200 mb-2">Step 2: Open Report Form</h3>
                  <p className="text-slate-400 text-sm">Go to Clinical Operations → Click "Report Malfunction"</p>
                </div>

                <div>
                  <h3 className="font-semibold text-emerald-200 mb-2">Step 3: Classify Malfunction</h3>
                  <p className="text-slate-400 text-sm">Select type and severity. FDA reportable warning appears for Serious/Death.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-emerald-200 mb-2">Step 4: Document Details</h3>
                  <p className="text-slate-400 text-sm">Required: Patient impact, detailed description, root cause analysis, corrective action, preventive measures</p>
                </div>

                <div>
                  <h3 className="font-semibold text-emerald-200 mb-2">Step 5: Electronic Signature</h3>
                  <p className="text-slate-400 text-sm">Sign report with NPI and credentials. Meaning: "I certify this malfunction report is accurate"</p>
                </div>

                <div>
                  <h3 className="font-semibold text-emerald-200 mb-2">Step 6: Submit</h3>
                  <p className="text-slate-400 text-sm">Report stored, audit trail created. If FDA reportable → flagged for MedWatch submission.</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-amber-300 mb-3">FDA MedWatch Submission</h2>
              <p className="text-slate-300 mb-3">For Serious Injury or Death malfunctions:</p>
              <div className="bg-slate-800/50 border border-slate-700 rounded p-4">
                <p className="text-sm text-slate-400 mb-2">CareSolis automates detection but NOT submission.</p>
                <p className="text-sm text-emerald-400">You must manually submit to FDA MedWatch at: https://www.accessdata.fda.gov/scripts/medwatch/</p>
                <p className="text-sm text-rose-400 mt-2">Deadlines: Death = 5 working days | Serious Injury = 30 calendar days</p>
              </div>
            </div>
          </div>
        );

      case 'fda-compliance':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-100">FDA Compliance Checklist</h1>
            
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-emerald-300 mb-4">21 CFR Part 11 - Electronic Records & Signatures</h2>
              <p className="text-emerald-400 font-semibold mb-3">Status: ✅ COMPLIANT (Phase 1 complete)</p>
              <ul className="space-y-2 text-slate-300">
                <li>✅ §11.10 - Validation of systems</li>
                <li>✅ §11.50 - Signature manifestations</li>
                <li>✅ §11.70 - Signature/record linking</li>
                <li>✅ §11.100 - General requirements</li>
                <li>✅ §11.200 - Electronic signature components</li>
                <li>✅ §11.300 - Controls for identification codes/passwords</li>
              </ul>
              <p className="text-slate-400 mt-3 text-sm">Your electronic signatures in CareSolis are legally binding and FDA-compliant.</p>
            </div>

            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-emerald-300 mb-4">21 CFR Part 803 - Medical Device Reporting</h2>
              <p className="text-emerald-400 font-semibold mb-3">Status: ✅ COMPLIANT (Phase 1 complete)</p>
              <ul className="space-y-2 text-slate-300">
                <li>✅ §803.3 - Definitions</li>
                <li>✅ §803.50 - Reporting requirements</li>
                <li>✅ §803.52 - Death reporting (5 days)</li>
                <li>✅ §803.53 - Serious injury reporting (30 days)</li>
                <li>✅ §803.56 - Malfunction reporting (30 days)</li>
              </ul>
              <p className="text-slate-400 mt-3 text-sm">You can file compliant device malfunction reports through CareSolis.</p>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-300 mb-4">Daily Compliance Checklist</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-blue-200 mb-2">Every Day</h3>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    <li>Review patient dashboard for missed medications</li>
                    <li>Respond to escalation alerts within 2 hours</li>
                    <li>Document all patient interactions in CareSolis</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-blue-200 mb-2">Every Week</h3>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    <li>Review provider activity log</li>
                    <li>Verify all activities signed with electronic signatures</li>
                    <li>Check for malfunction reports requiring follow-up</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-blue-200 mb-2">Every Month</h3>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    <li>Review monthly billing compliance</li>
                    <li>Verify ≥16 days of data collection per patient</li>
                    <li>Verify ≥20 minutes provider time per patient</li>
                    <li>Submit Medicare billing (CPT codes)</li>
                    <li>Review FDA reportable malfunction queue</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-rose-900/20 border border-rose-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-rose-300 mb-3">Red Flags to Avoid</h2>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-rose-200 mb-1">Medicare Red Flags:</p>
                  <ul className="list-disc list-inside text-slate-400 text-sm space-y-1">
                    <li>Activities without proper documentation</li>
                    <li>Generic descriptions ("Reviewed data")</li>
                    <li>Wrong NPI (using facility NPI instead of provider NPI)</li>
                    <li>&lt;2 days data (cannot bill any RTM device supply code)</li>
                    <li>&lt;10 minutes time without interactive communication (cannot bill treatment mgmt)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-rose-200 mb-1">FDA Red Flags:</p>
                  <ul className="list-disc list-inside text-slate-400 text-sm space-y-1">
                    <li>Serious malfunction not reported (30-day deadline missed)</li>
                    <li>Death malfunction not reported (5-day deadline missed)</li>
                    <li>Incomplete root cause ("Unknown" not acceptable)</li>
                    <li>No corrective action documented</li>
                    <li>Unsigned malfunction reports</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'caregiver-activity-log':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-100">Caregiver Activity Log</h1>
            <p className="text-lg text-emerald-400">FDA Class II Compliant Verification System</p>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-300 mb-3">What Is the Caregiver Activity Log?</h2>
              <p className="text-slate-300 mb-4">
                The Caregiver Activity Log is an FDA-compliant verification tool that provides a factual record of caregiver
                actions and escalation responses for audit and documentation purposes.
              </p>
              <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3 mt-4">
                <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-300 mb-1">⚠️ FDA CLASS II MEDICAL DEVICE NOTICE</p>
                  <p className="text-slate-300 text-sm">
                    This feature records caregiver actions for <strong>verification purposes only</strong>. It does <strong>NOT</strong> evaluate
                    caregiver performance, make clinical recommendations, or replace healthcare provider oversight.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-slate-200 mb-4">Clinical Use Cases</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-emerald-300 mb-2">✅ Authorized Uses for Providers</h3>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li><strong>Compliance Audits</strong> - Document caregiver response times for regulatory review</li>
                    <li><strong>Medicare Documentation</strong> - Provide evidence of care coordination for CPT billing</li>
                    <li><strong>Care Plan Verification</strong> - Confirm caregivers are responding to patient needs</li>
                    <li><strong>State Inspections</strong> - Export activity logs for regulatory compliance</li>
                    <li><strong>HIPAA Audit Trail</strong> - Maintain complete record of who accessed patient data</li>
                    <li><strong>Shift Handoff Documentation</strong> - Verify care continuity between caregivers</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-rose-300 mb-2">❌ Prohibited Uses</h3>
                  <ul className="space-y-1 text-slate-300 text-sm">
                    <li>❌ Performance evaluations or caregiver reviews</li>
                    <li>❌ Hiring/firing decisions based on response time</li>
                    <li>❌ Selecting "preferred" caregivers for escalations</li>
                    <li>❌ Bonus/penalty calculations</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-emerald-300 mb-4">Accessing the Log</h2>
              <p className="text-slate-300 mb-3">Navigation: Main Menu → Escalation Log → "Caregiver Activity Log" Tab</p>

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-emerald-200 mb-1">Four Key Metrics (Factual Only)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <div className="bg-slate-800/50 rounded p-2">
                      <span className="text-slate-400 text-sm">Total Logged Events</span>
                      <p className="text-xs text-slate-500 mt-1">Count of all recorded caregiver actions</p>
                    </div>
                    <div className="bg-slate-800/50 rounded p-2">
                      <span className="text-slate-400 text-sm">Escalations Received</span>
                      <p className="text-xs text-slate-500 mt-1">Number of alerts sent to caregiver</p>
                    </div>
                    <div className="bg-slate-800/50 rounded p-2">
                      <span className="text-slate-400 text-sm">Actions Logged</span>
                      <p className="text-xs text-slate-500 mt-1">Interventions or acknowledgments recorded</p>
                    </div>
                    <div className="bg-slate-800/50 rounded p-2">
                      <span className="text-slate-400 text-sm">Average Duration</span>
                      <p className="text-xs text-slate-500 mt-1">Mean response time (with sample size)</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-emerald-200 mb-1">Caregiver Filter</h3>
                  <p className="text-slate-400 text-sm">Dropdown to view activity for specific caregivers or all caregivers combined</p>
                </div>

                <div>
                  <h3 className="font-semibold text-emerald-200 mb-1">CSV Export</h3>
                  <p className="text-slate-400 text-sm">Export filtered activity logs with embedded FDA compliance disclaimer</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-slate-200 mb-4">Medicare RTM Integration</h2>
              <p className="text-slate-300 mb-3">How Caregiver Activity Log supports RTM CPT code documentation:</p>

              <div className="space-y-3">
                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-emerald-400 font-semibold">CPT 98979/98980</span>
                    <span className="text-slate-400 text-sm">- Treatment management (10-19 min / 20+ min)</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Caregiver Activity Log documents care coordination efforts. Export logs as supporting evidence for
                    coordinating with patient's support network when reviewing therapeutic adherence.
                  </p>
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-400 font-semibold">CPT 98981</span>
                    <span className="text-slate-400 text-sm">- Additional 20-minute blocks</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    When spending additional time coordinating with caregivers about patient escalations, export activity logs
                    to document time spent reviewing caregiver responses and interventions.
                  </p>
                </div>

                <div className="bg-slate-700/50 rounded p-3 mt-3">
                  <p className="text-xs text-slate-400">
                    <strong className="text-slate-300">Best Practice:</strong> Export monthly caregiver activity reports and attach
                    to RTM billing documentation. Shows Medicare you're actively coordinating care with patient's support network.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-300 mb-4">Understanding Response Time Metrics</h2>

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-blue-200 mb-1">What It Measures</h3>
                  <p className="text-slate-400 text-sm">
                    Time from escalation notification sent to acknowledgment logged. This is a <strong>factual calculation</strong>,
                    not a quality assessment.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-blue-200 mb-1">Clinical Interpretation</h3>
                  <ul className="list-disc list-inside text-slate-400 text-sm space-y-1">
                    <li>Short response time (&lt;10 min) - Caregiver was nearby, immediately available</li>
                    <li>Medium response time (10-30 min) - Normal response, within acceptable range</li>
                    <li>Long response time (&gt;30 min) - May indicate caregiver unavailable, investigate context</li>
                    <li>"—" (no data) - Insufficient paired events to calculate average</li>
                  </ul>
                </div>

                <div className="bg-amber-900/20 border border-amber-500/30 rounded p-3">
                  <p className="text-sm text-amber-300">
                    <strong>⚠️ Important:</strong> Response time alone does NOT indicate quality of care. Always review full context
                    including time of day, patient location, caregiver role, and outcome.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-slate-200 mb-4">Regulatory Compliance</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-emerald-300 mb-2">FDA 21 CFR Part 820 - Quality System Regulation</h3>
                  <ul className="space-y-1 text-slate-300 text-sm">
                    <li>✅ §820.180 - Records maintained with complete audit trail</li>
                    <li>✅ Triple redundancy (device flash, server, cloud export)</li>
                    <li>✅ Immutable timestamps (ISO 8601 format)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-emerald-300 mb-2">HIPAA Compliance</h3>
                  <ul className="space-y-1 text-slate-300 text-sm">
                    <li>✅ Access controls - User role based permissions</li>
                    <li>✅ Audit trails - All caregiver actions logged with timestamps</li>
                    <li>✅ Data encryption - In transit and at rest</li>
                    <li>⚠️ CSV exports contain PHI - Store securely per HIPAA policies</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-emerald-300 mb-2">State Inspection Readiness</h3>
                  <p className="text-slate-400 text-sm mb-2">Before inspections, prepare:</p>
                  <ul className="list-disc list-inside text-slate-400 text-sm space-y-1">
                    <li>Export last 90 days of caregiver activity logs</li>
                    <li>Document all escalation responses and outcomes</li>
                    <li>Verify all caregivers have logged at least one activity</li>
                    <li>Review for gaps (days with zero caregiver activity may require explanation)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-rose-900/20 border border-rose-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-rose-300 mb-3">Legal & Liability Considerations</h2>

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-rose-200 mb-1">⚠️ Critical Warnings</h3>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li>
                      <strong>Do NOT use for employment decisions</strong> - Using this tool for performance reviews,
                      hiring, firing, or disciplinary actions may violate labor laws and FDA device classification.
                    </li>
                    <li>
                      <strong>Do NOT make clinical decisions based on metrics alone</strong> - Response time does not
                      equal quality of care. Always review full clinical context.
                    </li>
                    <li>
                      <strong>Do NOT share exports without PHI protection</strong> - CSV files contain patient and caregiver
                      identifiable information. Treat as protected health information.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-rose-200 mb-1">Liability Protection</h3>
                  <p className="text-slate-400 text-sm">
                    Proper use of Caregiver Activity Log <strong>reduces</strong> liability by documenting:
                  </p>
                  <ul className="list-disc list-inside text-slate-400 text-sm space-y-1 mt-2">
                    <li>When caregivers were notified of patient needs</li>
                    <li>How quickly caregivers responded</li>
                    <li>What actions caregivers took</li>
                    <li>Complete audit trail for malpractice defense</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-emerald-300 mb-4">Provider Best Practices</h2>

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-emerald-200 mb-2">Monthly Review Checklist</h3>
                  <ul className="space-y-1 text-slate-300 text-sm">
                    <li>✅ Export caregiver activity logs for each patient</li>
                    <li>✅ Review for gaps in coverage (days with no caregiver response)</li>
                    <li>✅ Document any escalations requiring provider follow-up</li>
                    <li>✅ Verify care coordination for RTM billing documentation</li>
                    <li>✅ Store exports in secure, HIPAA-compliant location</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-emerald-200 mb-2">When to Investigate Further</h3>
                  <ul className="list-disc list-inside text-slate-400 text-sm space-y-1">
                    <li>Escalation received but no caregiver action logged (&gt;24 hours)</li>
                    <li>Multiple missed escalations in one week</li>
                    <li>Response time &gt;2 hours for urgent medication escalations</li>
                    <li>Pattern of caregiver non-response (clinical concern, not performance issue)</li>
                  </ul>
                  <p className="text-amber-400 text-sm mt-2">
                    <strong>Action:</strong> Contact caregiver to discuss patient needs and care coordination,
                    not to critique response time.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-emerald-200 mb-2">Documentation for Legal Requests</h3>
                  <p className="text-slate-400 text-sm">
                    If subpoenaed or requested by legal team:
                  </p>
                  <ol className="list-decimal list-inside text-slate-400 text-sm space-y-1 mt-2">
                    <li>Export complete activity log for requested date range</li>
                    <li>Include embedded FDA compliance disclaimer (automatically in CSV)</li>
                    <li>Do NOT editorialize or add performance interpretations</li>
                    <li>Provide factual data only - let attorneys interpret</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-slate-200 mb-3">Support & Questions</h2>

              <div className="space-y-2">
                <div>
                  <p className="text-slate-300 font-semibold mb-1">Technical Support</p>
                  <p className="text-slate-400 text-sm">Email: support@caresolis.com | Phone: (555) 123-4567</p>
                </div>
                <div>
                  <p className="text-slate-300 font-semibold mb-1">Compliance Questions</p>
                  <p className="text-slate-400 text-sm">Compliance Officer: compliance@caresolis.com</p>
                </div>
                <div>
                  <p className="text-slate-300 font-semibold mb-1">FDA Regulatory Inquiries</p>
                  <p className="text-slate-400 text-sm">Regulatory Affairs: regulatory@caresolis.com</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mt-6">
              <p className="text-blue-200 text-sm">
                <strong>💡 Quick Tip:</strong> Add monthly caregiver activity review to your RPM workflow checklist.
                Takes 5 minutes, provides valuable compliance documentation, and helps ensure quality care coordination.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <PageHeader 
        title="Provider Manual"
        subtitle="Healthcare Provider & Clinical Staff Documentation"
      />

      {/* Warning Banner */}
      <div className="mb-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
        <UserCog className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-blue-300 font-semibold mb-1">👨‍⚕️ For Healthcare Providers Only</div>
          <div className="text-blue-200/80 text-sm">
            This manual is for providers, clinical staff, and billing personnel. Family caregivers should see the{' '}
            <a href="/manual" className="text-blue-400 hover:text-blue-300 underline">Caregiver Manual</a> instead.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 sticky top-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">SECTIONS</h3>
            <div className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-2 group ${
                      activeSection === section.id
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm flex-1">{section.title}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${
                      activeSection === section.id ? 'translate-x-1' : ''
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 md:p-8">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Quick Links Footer */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="/rtm-billing"
          className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4 hover:bg-emerald-900/30 transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-emerald-300">RTM Billing</span>
          </div>
          <p className="text-sm text-emerald-200/70">
            Access the RTM billing module to log activities and track compliance
          </p>
        </a>

        <a 
          href="/clinical-operations"
          className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 hover:bg-blue-900/30 transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-blue-300">Clinical Operations</span>
          </div>
          <p className="text-sm text-blue-200/70">
            View patient enrollment, consent management, and compliance metrics
          </p>
        </a>

        <a 
          href="/help-center"
          className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 hover:bg-purple-900/30 transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <span className="font-semibold text-purple-300">Help Center</span>
          </div>
          <p className="text-sm text-purple-200/70">
            Get context-sensitive help and answers to common questions
          </p>
        </a>
      </div>
    </div>
  );
}
