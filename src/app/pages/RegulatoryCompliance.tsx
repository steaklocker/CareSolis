import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle2, FileText, Lock, Activity, Info, XCircle } from 'lucide-react';

/**
 * REGULATORY COMPLIANCE DASHBOARD
 * 
 * Addresses Red Team Concerns:
 * - I.1: Clinical Decision Support vs Support System
 * - I.2: Optical Confirmation vs Ingestion Verification
 * - I.3: Escalation Timing Liability
 * - VII: Acquisition Due Diligence Requirements
 * 
 * FDA 21 CFR Part 11 Compliance
 * ISO 14971 Risk Management
 * HIPAA Technical Safeguards
 */

interface ComplianceItem {
  category: string;
  requirement: string;
  status: 'compliant' | 'partial' | 'non-compliant';
  evidence: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
}

const COMPLIANCE_ITEMS: ComplianceItem[] = [
  // REGULATORY POSITIONING
  {
    category: 'FDA Regulatory Classification',
    requirement: 'Device positioned as adherence support, NOT clinical decision support',
    status: 'compliant',
    evidence: 'All notifications labeled as "advisory" with explicit disclaimers. No automated dosage recommendations.',
    risk: 'critical',
    mitigation: 'Physician notifications are informational only. Caregivers maintain full decision authority.'
  },
  {
    category: 'FDA Regulatory Classification',
    requirement: 'Optical confirmation explicitly labeled as "removal confirmation" NOT "ingestion verification"',
    status: 'compliant',
    evidence: 'UI displays: "REMOVAL CONFIRMED. INGESTION NOT VERIFIED." on all dose events.',
    risk: 'critical',
    mitigation: 'Marketing materials, app UI, and documentation clearly state limitation of optical sensing.'
  },
  {
    category: 'FDA Regulatory Classification',
    requirement: 'No external autonomous dispense commands permitted',
    status: 'compliant',
    evidence: 'Compartment release requires on-device schedule verification. Cloud cannot trigger dispensing.',
    risk: 'critical',
    mitigation: 'Device firmware validates all dispense events against local schedule. Cloud-only advisory.'
  },
  
  // ESCALATION TIMING LIABILITY
  {
    category: 'Escalation Reliability',
    requirement: 'Documented fail-safe behavior during network outage',
    status: 'compliant',
    evidence: '30-second heartbeat monitoring with LTE failover. Offline alerts fire to caregiver.',
    risk: 'high',
    mitigation: 'Dual-path communication (WiFi + LTE). Offline duration logged. Caregiver notified of connectivity loss.'
  },
  {
    category: 'Escalation Reliability',
    requirement: 'ISO 14971 Risk Analysis for escalation failures',
    status: 'compliant',
    evidence: 'Risk matrix documenting device malfunction, network failure, and power loss scenarios.',
    risk: 'high',
    mitigation: 'System does not create medical reliance. Caregivers informed of support-only nature.'
  },
  {
    category: 'Escalation Reliability',
    requirement: 'Clear caregiver responsibility disclaimer',
    status: 'compliant',
    evidence: 'Legal disclaimer presented during setup: "Caresolis is a support tool. Medical decisions remain caregiver responsibility."',
    risk: 'high',
    mitigation: 'Signed acknowledgment stored in audit log. Prevents reliance claims.'
  },
  
  // CYBERSECURITY
  {
    category: 'Cybersecurity (Device)',
    requirement: 'Secure boot prevents firmware tampering',
    status: 'compliant',
    evidence: 'MCU validates firmware signature on boot. Unsigned firmware rejected.',
    risk: 'critical',
    mitigation: 'OTA updates signed with RSA-2048. Rollback protection enforced.'
  },
  {
    category: 'Cybersecurity (Device)',
    requirement: 'Encrypted sensor-to-MCU communication',
    status: 'compliant',
    evidence: 'Optical sensor data encrypted with AES-128. Prevents spoofing attacks.',
    risk: 'critical',
    mitigation: 'Tamper detection triggers device lockdown and cloud notification.'
  },
  {
    category: 'Cybersecurity (Cloud)',
    requirement: 'End-to-end encryption for PHI',
    status: 'compliant',
    evidence: 'TLS 1.3 in transit. AES-256 at rest. RLS enforces multi-tenant isolation.',
    risk: 'critical',
    mitigation: 'Supabase RLS policies prevent cross-household data access. Zero-knowledge architecture for contacts.'
  },
  {
    category: 'Cybersecurity (Cloud)',
    requirement: 'Immutable audit logs',
    status: 'compliant',
    evidence: 'Three separate logging mechanisms: Device flash, cloud append-only, escalation event store.',
    risk: 'high',
    mitigation: 'Logs cryptographically signed with timestamp. Deletion prohibited by database constraints.'
  },
  {
    category: 'Cybersecurity (Cloud)',
    requirement: 'Role-based access control (RBAC)',
    status: 'compliant',
    evidence: 'Four roles: Household Owner, Care Circle Member, Clinician (read-only), Admin.',
    risk: 'medium',
    mitigation: 'Permissions enforced at database level. Access logs track all PHI queries.'
  },
  
  // TECHNICAL RELIABILITY
  {
    category: 'Optical Sensing Reliability',
    requirement: 'Redundant sensing to prevent false positives',
    status: 'compliant',
    evidence: 'Dual IR gate with time-split validation. Requires 200ms sustained signal change.',
    risk: 'high',
    mitigation: 'Ambient light compensation. Mechanical gate tolerance ±0.5mm tested across 1000 cycles.'
  },
  {
    category: 'Power Failure Resilience',
    requirement: 'Deterministic behavior during power loss',
    status: 'compliant',
    evidence: 'Compartment spring-loaded to close on power loss. Battery backup logs power event.',
    risk: 'medium',
    mitigation: 'Device logs power failure. Escalation logic waits for connectivity restoration before firing.'
  },
  
  // ACQUISITION DUE DILIGENCE
  {
    category: 'IP & Documentation',
    requirement: 'Clean IP ownership with no contractor claims',
    status: 'compliant',
    evidence: 'All firmware, software, and mechanical designs owned by Caresolis Inc. Contractor agreements signed.',
    risk: 'critical',
    mitigation: 'IP assignment agreements on file. No open-source GPL contamination.'
  },
  {
    category: 'IP & Documentation',
    requirement: 'Complete QMS documentation (ISO 13485)',
    status: 'partial',
    evidence: 'Design History File (DHF) 80% complete. Risk management file active.',
    risk: 'high',
    mitigation: 'QMS consultant engaged. Target 100% DHF completion by Q2 2026.'
  },
  {
    category: 'IP & Documentation',
    requirement: 'No undocumented design changes',
    status: 'compliant',
    evidence: 'Git-based version control. All firmware changes linked to DHF revision.',
    risk: 'medium',
    mitigation: 'Engineering Change Order (ECO) process enforced. Traceability matrix maintained.'
  },
  {
    category: 'Security Posture',
    requirement: 'No security incidents in production',
    status: 'compliant',
    evidence: 'Zero reported breaches. Penetration test scheduled Q1 2026.',
    risk: 'critical',
    mitigation: 'Bug bounty program planned. SOC 2 Type I audit in progress.'
  }
];

export default function RegulatoryCompliance() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'compliant' | 'partial' | 'non-compliant'>('all');
  const [filterRisk, setFilterRisk] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');

  const filteredItems = COMPLIANCE_ITEMS.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterRisk !== 'all' && item.risk !== filterRisk) return false;
    return true;
  });

  const statusCounts = {
    compliant: COMPLIANCE_ITEMS.filter(i => i.status === 'compliant').length,
    partial: COMPLIANCE_ITEMS.filter(i => i.status === 'partial').length,
    nonCompliant: COMPLIANCE_ITEMS.filter(i => i.status === 'non-compliant').length
  };

  const compliancePercentage = Math.round((statusCounts.compliant / COMPLIANCE_ITEMS.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
              <Shield size={48} />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Regulatory Compliance Dashboard</h1>
              <p className="text-blue-100 text-lg">FDA 21 CFR Part 11 • ISO 14971 • ISO 13485 • HIPAA • SOC 2</p>
            </div>
          </div>

          {/* Compliance Score */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-6xl font-bold mb-2">{compliancePercentage}%</div>
                <div className="text-blue-100 text-lg">Overall Compliance Score</div>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-300">{statusCounts.compliant}</div>
                  <div className="text-blue-100 text-sm">Compliant</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300">{statusCounts.partial}</div>
                  <div className="text-blue-100 text-sm">Partial</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-rose-300">{statusCounts.nonCompliant}</div>
                  <div className="text-blue-100 text-sm">Non-Compliant</div>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-400 transition-all duration-500"
                style={{ width: `${compliancePercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex gap-6 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">Status:</span>
              <div className="flex gap-2">
                {(['all', 'compliant', 'partial', 'non-compliant'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      filterStatus === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">Risk:</span>
              <div className="flex gap-2">
                {(['all', 'critical', 'high', 'medium', 'low'] as const).map(risk => (
                  <button
                    key={risk}
                    onClick={() => setFilterRisk(risk)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      filterRisk === risk
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {risk.charAt(0).toUpperCase() + risk.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Items */}
      <div className="max-w-7xl mx-auto px-8 pb-12">
        <div className="space-y-4">
          {filteredItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all"
            >
              <div className="p-6">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                        {item.category}
                      </span>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        item.risk === 'critical' ? 'bg-rose-100 text-rose-700' :
                        item.risk === 'high' ? 'bg-orange-100 text-orange-700' :
                        item.risk === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.risk.toUpperCase()} RISK
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{item.requirement}</h3>
                  </div>

                  {/* Status Icon */}
                  <div className="flex-shrink-0 ml-4">
                    {item.status === 'compliant' ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg">
                        <CheckCircle2 size={20} />
                        <span className="font-semibold text-sm">COMPLIANT</span>
                      </div>
                    ) : item.status === 'partial' ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg">
                        <AlertTriangle size={20} />
                        <span className="font-semibold text-sm">PARTIAL</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg">
                        <XCircle size={20} />
                        <span className="font-semibold text-sm">NON-COMPLIANT</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Evidence */}
                <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg">
                  <div className="flex items-start gap-2">
                    <FileText size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-blue-900 mb-1">EVIDENCE</div>
                      <div className="text-sm text-blue-800">{item.evidence}</div>
                    </div>
                  </div>
                </div>

                {/* Mitigation */}
                <div className="p-4 bg-emerald-50 border-l-4 border-emerald-600 rounded-r-lg">
                  <div className="flex items-start gap-2">
                    <Lock size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-emerald-900 mb-1">MITIGATION STRATEGY</div>
                      <div className="text-sm text-emerald-800">{item.mitigation}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Info size={48} className="text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No compliance items match the selected filters.</p>
          </div>
        )}
      </div>

      {/* Red Team Disclaimer */}
      <div className="max-w-7xl mx-auto px-8 pb-12">
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <AlertTriangle size={32} className="flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-3">Red Team Readiness Statement</h2>
              <p className="text-rose-100 mb-4">
                This compliance dashboard addresses all critical attack vectors identified in the Red Team Review. 
                Caresolis maintains a <strong>support system</strong> classification, not a clinical decision support system. 
                All optical confirmations are explicitly labeled as "removal confirmation" with no ingestion claims.
              </p>
              <ul className="space-y-2 text-rose-100">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />
                  <span><strong>Regulatory:</strong> No automated dosage modifications. All physician notifications advisory only.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />
                  <span><strong>Cybersecurity:</strong> Secure boot, signed OTA, encrypted sensor communication, tamper detection implemented.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />
                  <span><strong>Reliability:</strong> Dual IR gate sensing, deterministic power failure behavior, heartbeat monitoring.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />
                  <span><strong>Acquisition Ready:</strong> Clean IP, QMS in progress, immutable audit logs, zero security incidents.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
