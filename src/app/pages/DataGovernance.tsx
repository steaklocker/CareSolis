import React, { useState } from 'react';
import {
  Shield,
  Database,
  Lock,
  Clock,
  Trash2,
  FileText,
  CheckCircle2,
  Download,
  Key,
  Globe,
  Server,
  AlertCircle,
  Eye,
  UserCheck,
  Building2,
  ScrollText,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';

// ==================== TYPES ====================

interface DataCategory {
  name: string;
  description: string;
  examples: string[];
  owner: string;
  retentionYears: number;
  encryptionStandard: string;
}

interface ComplianceFramework {
  name: string;
  icon: React.ComponentType<any>;
  coverage: string;
  certifications: string[];
}

// ==================== DATA ====================

const DATA_CATEGORIES: DataCategory[] = [
  {
    name: 'Protected Health Information (PHI)',
    description: 'Patient health data protected under HIPAA regulations',
    examples: [
      'Medication schedules and adherence records',
      'Check-in interaction timestamps',
      'Escalation event logs',
      'AI adherence scoring results',
      'Vital signs from connected devices (Apple Health, etc.)'
    ],
    owner: 'Patient (Data Subject)',
    retentionYears: 7,
    encryptionStandard: 'AES-256-GCM at rest, TLS 1.3 in transit'
  },
  {
    name: 'Personally Identifiable Information (PII)',
    description: 'Personal data subject to GDPR and CCPA protections',
    examples: [
      'Patient name, address, date of birth',
      'Caregiver contact information (Care Circle)',
      'Email addresses and phone numbers',
      'User account credentials (hashed)',
      'IP addresses and session data'
    ],
    owner: 'Patient (Data Subject)',
    retentionYears: 7,
    encryptionStandard: 'AES-256-GCM at rest, TLS 1.3 in transit'
  },
  {
    name: 'Clinical Audit Trails',
    description: 'FDA-compliant logs for medical device accountability',
    examples: [
      'Medication dispense events (21 CFR Part 11)',
      'Escalation override logs with biometric verification',
      'System access logs and authentication events',
      'Integration approval/revocation records',
      'Data export and deletion request logs'
    ],
    owner: 'Caresolis (Data Processor) - Retained for Regulatory Compliance',
    retentionYears: 10,
    encryptionStandard: 'AES-256-GCM at rest, write-once storage, SHA-256 integrity hashes'
  },
  {
    name: 'Operational Telemetry',
    description: 'Device health and environmental monitoring data',
    examples: [
      'Device uptime and connectivity metrics',
      'Environmental sensor readings (temperature, humidity)',
      'Battery health and power usage',
      'Network latency and API response times',
      'Error logs and diagnostic events'
    ],
    owner: 'Caresolis (Data Controller) - Shared with Patient',
    retentionYears: 3,
    encryptionStandard: 'AES-256-GCM at rest, TLS 1.3 in transit'
  },
  {
    name: 'Third-Party Integration Data',
    description: 'Data exchanged with external systems under explicit consent',
    examples: [
      'Voice assistant interaction logs (Siri, Alexa, Google)',
      'Apple Health vitals sync records',
      'Epic MyChart clinical data exchange (FHIR)',
      'CVS Pharmacy refill status',
      'Smart home sensor data (Philips Hue, Ring, Nest)'
    ],
    owner: 'Patient (Data Subject) - Shared with Third Parties per Approved Scopes',
    retentionYears: 3,
    encryptionStandard: 'AES-256-GCM, OAuth 2.0 token-based access, scope-limited permissions'
  },
  {
    name: 'Aggregate Analytics',
    description: 'De-identified data for population health insights',
    examples: [
      'Anonymized adherence trends across cohorts',
      'Device reliability statistics',
      'Escalation pattern analysis',
      'Routine stability benchmarks',
      'Time-zone adjusted interaction patterns'
    ],
    owner: 'Caresolis (Data Controller) - De-identified per HIPAA Safe Harbor',
    retentionYears: 10,
    encryptionStandard: 'AES-256-GCM, anonymization pipeline removes all 18 HIPAA identifiers'
  }
];

const COMPLIANCE_FRAMEWORKS: ComplianceFramework[] = [
  {
    name: 'HIPAA',
    icon: Shield,
    coverage: 'Health Insurance Portability and Accountability Act',
    certifications: [
      'Business Associate Agreement (BAA) with Supabase',
      'Administrative, Physical, and Technical Safeguards',
      'Breach Notification Procedures (45 CFR §164.400)',
      'Minimum Necessary Standard for PHI access'
    ]
  },
  {
    name: 'GDPR',
    icon: Globe,
    coverage: 'General Data Protection Regulation (EU)',
    certifications: [
      'Article 30 Records of Processing Activities',
      'Article 32 Security of Processing (encryption, pseudonymization)',
      'Article 17 Right to Erasure ("Right to be Forgotten")',
      'Article 20 Right to Data Portability',
      'Article 33 Breach Notification within 72 hours'
    ]
  },
  {
    name: 'CCPA',
    icon: Building2,
    coverage: 'California Consumer Privacy Act',
    certifications: [
      'Right to Know what data is collected',
      'Right to Delete personal information',
      'Right to Opt-Out of data sales (N/A - Caresolis does not sell data)',
      'Right to Non-Discrimination for exercising privacy rights'
    ]
  },
  {
    name: '21 CFR Part 11',
    icon: FileText,
    coverage: 'FDA Electronic Records and Signatures',
    certifications: [
      'Electronic signatures with biometric verification',
      'Audit trails for all system access and modifications',
      'Record retention with write-once-read-many (WORM) storage',
      'Validation of computer systems and software'
    ]
  },
  {
    name: 'SOC 2 Type II',
    icon: Lock,
    coverage: 'Service Organization Control (Security, Availability, Confidentiality)',
    certifications: [
      'Independent third-party audit (Supabase certified)',
      'Security controls and monitoring',
      'Availability and uptime guarantees',
      'Confidentiality of sensitive data'
    ]
  }
];

const ENCRYPTION_DETAILS = [
  {
    layer: 'Data at Rest',
    standard: 'AES-256-GCM',
    implementation: 'PostgreSQL Transparent Data Encryption (TDE) via Supabase',
    keyManagement: 'AWS Key Management Service (KMS) with automatic key rotation',
    verification: 'FIPS 140-2 validated cryptographic modules'
  },
  {
    layer: 'Data in Transit',
    standard: 'TLS 1.3',
    implementation: 'All API endpoints enforce HTTPS with minimum TLS 1.3',
    keyManagement: 'Certificate pinning with Let\'s Encrypt certificates',
    verification: 'Perfect Forward Secrecy (PFS) with ECDHE key exchange'
  },
  {
    layer: 'Application Layer',
    standard: 'bcrypt (cost factor 12)',
    implementation: 'Password hashing with per-user salts',
    keyManagement: 'Supabase Auth with JWT token expiration (1 hour)',
    verification: 'OWASP-compliant authentication and session management'
  },
  {
    layer: 'Backup Encryption',
    standard: 'AES-256-CBC',
    implementation: 'Encrypted automated backups with 30-day retention',
    keyManagement: 'Separate encryption keys for backups, stored in AWS KMS',
    verification: 'Point-in-time recovery with encrypted snapshots'
  }
];

const STORAGE_INFRASTRUCTURE = {
  primary: {
    provider: 'Supabase (PostgreSQL)',
    region: 'US East (Ohio) - us-east-2',
    redundancy: 'Multi-AZ deployment with automated failover',
    backups: 'Daily automated backups, 30-day retention, encrypted',
    compliance: 'HIPAA-compliant infrastructure, SOC 2 Type II certified'
  },
  cdn: {
    provider: 'Supabase Storage + CloudFlare CDN',
    region: 'Global edge locations with geo-redundancy',
    redundancy: 'Multi-region replication for static assets',
    backups: 'Versioned object storage with 90-day retention',
    compliance: 'TLS 1.3 encryption, DDoS protection'
  },
  logs: {
    provider: 'Supabase + CloudWatch Logs',
    region: 'US East (Ohio) - us-east-2',
    redundancy: 'Write-once-read-many (WORM) storage for audit trails',
    backups: 'Immutable logs with 10-year retention for FDA compliance',
    compliance: '21 CFR Part 11 compliant audit trails'
  }
};

// ==================== COMPONENTS ====================

function DataCategoryCard({ category }: { category: DataCategory }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-1">{category.name}</h3>
            <p className="text-sm text-slate-600">{category.description}</p>
          </div>
          <ChevronRight
            className={clsx(
              "text-slate-400 transition-transform flex-shrink-0 ml-3",
              expanded && "rotate-90"
            )}
            size={20}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <div className="text-slate-500 font-semibold mb-1">Data Owner</div>
            <div className="text-slate-900">{category.owner}</div>
          </div>
          <div>
            <div className="text-slate-500 font-semibold mb-1">Retention Period</div>
            <div className="text-slate-900">{category.retentionYears} years</div>
          </div>
          <div>
            <div className="text-slate-500 font-semibold mb-1">Encryption</div>
            <div className="text-slate-900 truncate" title={category.encryptionStandard}>
              {category.encryptionStandard.split(',')[0]}
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-slate-200 bg-slate-50 p-6"
        >
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Data Examples:</h4>
            <ul className="space-y-1.5">
              {category.examples.map((example, idx) => (
                <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                  <CheckCircle2 className="text-emerald-600 flex-shrink-0 mt-0.5" size={14} />
                  <span>{example}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900">
                <strong>Encryption Standard:</strong> {category.encryptionStandard}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function ComplianceCard({ framework }: { framework: ComplianceFramework }) {
  const Icon = framework.icon;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-blue-100 rounded-xl">
          <Icon className="text-blue-600" size={24} />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">{framework.name}</h3>
          <p className="text-xs text-slate-600">{framework.coverage}</p>
        </div>
      </div>

      <ul className="space-y-2">
        {framework.certifications.map((cert, idx) => (
          <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
            <CheckCircle2 className="text-emerald-600 flex-shrink-0 mt-0.5" size={14} />
            <span>{cert}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DeletionRequestProtocol() {
  const steps = [
    {
      step: 1,
      title: 'Submit Request',
      description: 'Patient or authorized representative submits deletion request via email (privacy@caresolis.com) or in-app Data Rights Portal',
      timeline: 'Day 0',
      icon: FileText
    },
    {
      step: 2,
      title: 'Identity Verification',
      description: 'Caresolis verifies identity through government-issued ID or multi-factor authentication',
      timeline: 'Within 2 business days',
      icon: UserCheck
    },
    {
      step: 3,
      title: 'Legal Review',
      description: 'Legal team reviews for exceptions (active medical device prescriptions, ongoing clinical trials, legal holds)',
      timeline: 'Within 5 business days',
      icon: ScrollText
    },
    {
      step: 4,
      title: 'Data Deletion',
      description: 'All PII/PHI deleted from production databases. Audit trails retained per regulatory requirements (10 years)',
      timeline: 'Within 30 days',
      icon: Trash2
    },
    {
      step: 5,
      title: 'Third-Party Notification',
      description: 'Deletion requests forwarded to integrated third parties (Epic, Apple Health, CVS, etc.)',
      timeline: 'Within 30 days',
      icon: Globe
    },
    {
      step: 6,
      title: 'Confirmation',
      description: 'Patient receives written confirmation of deletion with certificate of destruction',
      timeline: 'Within 45 days',
      icon: CheckCircle2
    }
  ];

  return (
    <div className="space-y-4">
      {steps.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Icon className="text-blue-600" size={20} />
              </div>
              {idx < steps.length - 1 && (
                <div className="w-0.5 flex-1 bg-slate-200 my-2" />
              )}
            </div>
            <div className="flex-1 pb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Step {item.step}
                </span>
                <span className="text-xs text-slate-500">{item.timeline}</span>
              </div>
              <h4 className="font-semibold text-slate-900 mb-1">{item.title}</h4>
              <p className="text-sm text-slate-600">{item.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function DataGovernance() {
  const [activeTab, setActiveTab] = useState<'ownership' | 'storage' | 'retention' | 'deletion' | 'encryption' | 'compliance'>('ownership');

  return (
    <div className="max-w-7xl mx-auto pb-20 p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-emerald-100 rounded-xl">
          <Shield className="text-emerald-600" size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Data Governance & Privacy</h1>
          <p className="text-slate-600">Enterprise-grade data protection and regulatory compliance</p>
        </div>
      </div>

      {/* Compliance Status Banner */}
      <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-100 rounded-xl flex-shrink-0">
            <CheckCircle2 className="text-emerald-600" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-emerald-900 mb-2">
              ✓ ACQUISITION-READY COMPLIANCE POSTURE
            </h2>
            <p className="text-sm text-emerald-800 leading-relaxed mb-3">
              Caresolis maintains enterprise-grade data governance practices that exceed HIPAA, GDPR, 
              CCPA, and FDA requirements. Our infrastructure is designed for seamless integration into 
              Fortune 500 health systems with minimal legal friction.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white/70 rounded-lg">
                <div className="font-bold text-emerald-900 mb-1">Zero Data Sales</div>
                <div className="text-emerald-700">Patient data is never sold or shared for advertising</div>
              </div>
              <div className="p-3 bg-white/70 rounded-lg">
                <div className="font-bold text-emerald-900 mb-1">Right to Deletion</div>
                <div className="text-emerald-700">45-day patient data deletion with audit trail</div>
              </div>
              <div className="p-3 bg-white/70 rounded-lg">
                <div className="font-bold text-emerald-900 mb-1">Transparent Processing</div>
                <div className="text-emerald-700">Complete visibility into data usage and retention</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8 border-b border-slate-200">
        <div className="flex gap-1 overflow-x-auto">
          {[
            { id: 'ownership', label: 'Data Ownership', icon: UserCheck },
            { id: 'storage', label: 'Storage Infrastructure', icon: Server },
            { id: 'retention', label: 'Retention Policies', icon: Clock },
            { id: 'deletion', label: 'Deletion Protocol', icon: Trash2 },
            { id: 'encryption', label: 'Encryption Standards', icon: Lock },
            { id: 'compliance', label: 'Compliance Frameworks', icon: Shield }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  "px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                )}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'ownership' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Data Ownership & Control</h2>
              <p className="text-slate-600">
                Caresolis operates as a <strong>Data Processor</strong> on behalf of patients (Data Subjects). 
                Patients retain full ownership and control rights over their personal and health data.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {DATA_CATEGORIES.map((category, idx) => (
                <DataCategoryCard key={idx} category={category} />
              ))}
            </div>

            <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Info className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-amber-900">
                  <strong>Legal Basis for Processing:</strong> Caresolis processes personal data under 
                  GDPR Article 6(1)(a) (Consent) and Article 9(2)(h) (Healthcare provision). Patients may 
                  withdraw consent at any time via the Data Rights Portal or by contacting privacy@caresolis.com.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'storage' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Storage Infrastructure</h2>
              <p className="text-slate-600">
                All data is stored in HIPAA-compliant, SOC 2 Type II certified infrastructure with 
                multi-region redundancy and automated failover.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {Object.entries(STORAGE_INFRASTRUCTURE).map(([key, details]) => (
                <div key={key} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 capitalize">
                    {key === 'primary' ? 'Primary Database' : key === 'cdn' ? 'Content Delivery Network' : 'Audit Logs'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-slate-500 font-semibold mb-1">Provider</div>
                      <div className="text-slate-900">{details.provider}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-semibold mb-1">Region</div>
                      <div className="text-slate-900">{details.region}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-semibold mb-1">Redundancy</div>
                      <div className="text-slate-900">{details.redundancy}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-semibold mb-1">Backups</div>
                      <div className="text-slate-900">{details.backups}</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-slate-500 font-semibold mb-1">Compliance</div>
                      <div className="text-slate-900">{details.compliance}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Database className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-blue-900">
                  <strong>Data Residency:</strong> All patient data is stored exclusively in US-based 
                  data centers (AWS us-east-2 region) to comply with HIPAA data residency requirements. 
                  European patients are served through GDPR-compliant data processing agreements.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'retention' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Data Retention Policies</h2>
              <p className="text-slate-600">
                Retention periods are determined by regulatory requirements, clinical necessity, and 
                legitimate business interests. All data is automatically purged after retention expires.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Data Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Retention Period</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Legal Basis</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Auto-Deletion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-slate-900">PHI (Clinical Records)</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">7 years</td>
                    <td className="px-6 py-4 text-sm text-slate-600">HIPAA §164.530(j)</td>
                    <td className="px-6 py-4 text-sm text-emerald-600 font-medium">✓ Yes</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-slate-900">PII (Personal Data)</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">7 years</td>
                    <td className="px-6 py-4 text-sm text-slate-600">GDPR Art. 5(1)(e) + State Law</td>
                    <td className="px-6 py-4 text-sm text-emerald-600 font-medium">✓ Yes</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-slate-900">Audit Trails (FDA)</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">10 years</td>
                    <td className="px-6 py-4 text-sm text-slate-600">21 CFR Part 11</td>
                    <td className="px-6 py-4 text-sm text-emerald-600 font-medium">✓ Yes (WORM)</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-slate-900">Telemetry (Device Logs)</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">3 years</td>
                    <td className="px-6 py-4 text-sm text-slate-600">Product Liability + Warranty</td>
                    <td className="px-6 py-4 text-sm text-emerald-600 font-medium">✓ Yes</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-slate-900">Third-Party Integration Logs</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">3 years</td>
                    <td className="px-6 py-4 text-sm text-slate-600">GDPR Art. 30 (Records of Processing)</td>
                    <td className="px-6 py-4 text-sm text-emerald-600 font-medium">✓ Yes</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-slate-900">De-identified Analytics</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">10 years</td>
                    <td className="px-6 py-4 text-sm text-slate-600">Research & Product Development</td>
                    <td className="px-6 py-4 text-sm text-slate-600">Optional (Anonymized)</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-slate-900">Backups</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">30-90 days</td>
                    <td className="px-6 py-4 text-sm text-slate-600">Disaster Recovery</td>
                    <td className="px-6 py-4 text-sm text-emerald-600 font-medium">✓ Yes (Rolling)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-6 bg-slate-50 border border-slate-200 rounded-xl">
              <h3 className="font-semibold text-slate-900 mb-3">Retention Exceptions</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
                  <span><strong>Legal Hold:</strong> Data subject to litigation, investigation, or regulatory inquiry is preserved indefinitely until hold is released.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
                  <span><strong>Active Prescriptions:</strong> Data for patients with active medical device prescriptions is retained until 7 years after prescription termination.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
                  <span><strong>Consent Withdrawal:</strong> Patients may request immediate deletion (see Deletion Protocol tab), overriding standard retention.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'deletion' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Data Deletion Request Protocol</h2>
              <p className="text-slate-600">
                Patients have the right to request deletion of their personal data under GDPR Article 17 
                (Right to Erasure) and CCPA §1798.105. Caresolis completes verified deletion requests 
                within 45 days.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
              <DeletionRequestProtocol />
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl">
                <h3 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 size={20} />
                  What Gets Deleted
                </h3>
                <ul className="space-y-2 text-sm text-emerald-800">
                  <li>• All PII (name, address, contact info)</li>
                  <li>• All PHI (medication records, adherence data)</li>
                  <li>• Device interaction logs and telemetry</li>
                  <li>• Third-party integration data</li>
                  <li>• Account credentials and session data</li>
                  <li>• Family Care Circle contact information</li>
                </ul>
              </div>

              <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl">
                <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <Shield size={20} />
                  What Gets Retained (Legal Basis)
                </h3>
                <ul className="space-y-2 text-sm text-amber-800">
                  <li>• De-identified audit trails (21 CFR Part 11) - 10 years</li>
                  <li>• Transaction records for billing/tax compliance - 7 years</li>
                  <li>• Aggregated analytics (fully anonymized) - Indefinite</li>
                  <li>• Legal dispute records (if applicable) - Until resolution</li>
                  <li>• Regulatory investigation materials - Until closure</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <FileText className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-blue-900">
                  <strong>Deletion Request Portal:</strong> Patients can submit deletion requests 
                  directly through the app via Settings → Privacy → "Request Data Deletion" or by 
                  emailing <a href="mailto:privacy@caresolis.com" className="underline font-semibold">privacy@caresolis.com</a> with 
                  subject line "GDPR/CCPA Deletion Request".
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'encryption' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Encryption Standards</h2>
              <p className="text-slate-600">
                Caresolis employs military-grade encryption at every layer of the data lifecycle, 
                from device transmission to long-term archival storage.
              </p>
            </div>

            <div className="space-y-4">
              {ENCRYPTION_DETAILS.map((detail, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <Lock className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{detail.layer}</h3>
                      <p className="text-sm text-slate-600">{detail.standard}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-slate-500 font-semibold mb-1">Implementation</div>
                      <div className="text-slate-900">{detail.implementation}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-semibold mb-1">Key Management</div>
                      <div className="text-slate-900">{detail.keyManagement}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-semibold mb-1">Verification</div>
                      <div className="text-slate-900">{detail.verification}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl">
              <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                <Key size={20} />
                Key Rotation & Management Policy
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
                <div>
                  <strong>Automatic Rotation:</strong> Encryption keys are automatically rotated every 90 days using AWS KMS
                </div>
                <div>
                  <strong>Emergency Rotation:</strong> Keys can be rotated within 1 hour in case of suspected compromise
                </div>
                <div>
                  <strong>Access Control:</strong> Key access limited to 2 senior engineers with hardware MFA required
                </div>
                <div>
                  <strong>Audit Logging:</strong> All key access attempts logged with alerting for unauthorized access
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Compliance Frameworks</h2>
              <p className="text-slate-600">
                Caresolis maintains certification and compliance with industry-leading regulatory 
                frameworks to ensure legal and operational readiness for enterprise adoption.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {COMPLIANCE_FRAMEWORKS.map((framework, idx) => (
                <ComplianceCard key={idx} framework={framework} />
              ))}
            </div>

            <div className="mt-8 space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">External Audit & Certification Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="text-emerald-600" size={20} />
                      <span className="font-semibold text-slate-900">HIPAA Business Associate Agreement</span>
                    </div>
                    <span className="text-sm text-emerald-700">Active (Supabase)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="text-emerald-600" size={20} />
                      <span className="font-semibold text-slate-900">SOC 2 Type II Certification</span>
                    </div>
                    <span className="text-sm text-emerald-700">Active (Infrastructure)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Eye className="text-blue-600" size={20} />
                      <span className="font-semibold text-slate-900">Penetration Testing</span>
                    </div>
                    <span className="text-sm text-blue-700">Annual (Last: Jan 2026)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Eye className="text-blue-600" size={20} />
                      <span className="font-semibold text-slate-900">Vulnerability Scanning</span>
                    </div>
                    <span className="text-sm text-blue-700">Continuous (Weekly)</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <Download size={20} />
                  Documentation for Due Diligence
                </h3>
                <p className="text-sm text-blue-800 mb-4">
                  Acquiring companies can request the following compliance documentation during M&A due diligence:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button className="p-3 bg-white hover:bg-blue-50 rounded-lg text-left transition-colors border border-blue-200">
                    <div className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                      <FileText size={16} />
                      SOC 2 Type II Report
                    </div>
                    <div className="text-xs text-slate-600">Independent auditor's report on security controls</div>
                  </button>
                  <button className="p-3 bg-white hover:bg-blue-50 rounded-lg text-left transition-colors border border-blue-200">
                    <div className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                      <FileText size={16} />
                      HIPAA Risk Assessment
                    </div>
                    <div className="text-xs text-slate-600">Comprehensive security risk analysis per §164.308</div>
                  </button>
                  <button className="p-3 bg-white hover:bg-blue-50 rounded-lg text-left transition-colors border border-blue-200">
                    <div className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                      <FileText size={16} />
                      Data Processing Agreement
                    </div>
                    <div className="text-xs text-slate-600">GDPR Article 28 compliant DPA template</div>
                  </button>
                  <button className="p-3 bg-white hover:bg-blue-50 rounded-lg text-left transition-colors border border-blue-200">
                    <div className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                      <FileText size={16} />
                      Incident Response Plan
                    </div>
                    <div className="text-xs text-slate-600">Breach notification procedures with 72-hour SLA</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Contact */}
      <div className="mt-12 p-6 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-start gap-4">
          <Info className="text-slate-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-slate-900 mb-2">Questions or Data Rights Requests?</h3>
            <p className="text-sm text-slate-700 mb-3">
              Our Data Protection Officer (DPO) is available to answer questions about data governance, 
              assist with data subject access requests (DSARs), or coordinate deletion requests.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <a
                href="mailto:privacy@caresolis.com"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
              >
                <FileText size={16} />
                privacy@caresolis.com
              </a>
              <a
                href="mailto:dpo@caresolis.com"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
              >
                <UserCheck size={16} />
                dpo@caresolis.com
              </a>
              <a
                href="tel:+1-855-CARESOLIS"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
              >
                1-855-CARESOLIS
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
