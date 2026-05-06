import { useState, useMemo, useEffect } from 'react';
import { DollarSign, Clock, CheckCircle, AlertCircle, Phone, Video, FileText, Users, Calendar, Download, Plus, Shield, Activity, BookOpen, Upload, X, Calculator, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useCaresolisContext } from '../context/CaresolisContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';
import clsx from 'clsx';

/**
 * RTM Billing Dashboard - Remote Therapeutic Monitoring
 *
 * CMS 2026 Final Rule Implementation
 * CPT Codes: 98975, 98977, 98985, 98979, 98980, 98981
 *
 * Dual-Tier Engagement System:
 * - Full Engagement: 16-30 days (CPT 98977)
 * - Partial Engagement: 2-15 days (CPT 98985) [NEW 2026]
 *
 * Treatment Management Tiers:
 * - 20+ minutes: CPT 98980
 * - 10-19 minutes: CPT 98979 [NEW 2026]
 * - Additional 20-min blocks: CPT 98981
 *
 * COMPLIANCE REQUIREMENTS:
 * - Interactive communication (phone/video) required for 98979/98980/98981
 * - Only one clinician may bill RTM per 30-day period per patient
 * - Cannot bill RPM and RTM for same patient in same month
 */

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;

// RTM Condition Categories
type RTMCondition = 'musculoskeletal' | 'respiratory' | 'cognitive_behavioral';

// CPT Code Definitions - Condition-Specific
const CPT_CODES = {
  // Setup (All Conditions)
  '98975': { label: 'Initial Setup & Education', amount: 22.00, frequency: 'Once per episode', new2026: false, category: 'setup' },

  // Musculoskeletal Device Supply
  '98977': { label: 'MSK Device Supply, 16-30 days', amount: 40.08, frequency: 'Per 30-day period', new2026: false, category: 'msk', condition: 'musculoskeletal' as RTMCondition },
  '98985': { label: 'MSK Device Supply, 2-15 days', amount: 40.08, frequency: 'Per 30-day period', new2026: true, category: 'msk', condition: 'musculoskeletal' as RTMCondition },

  // Respiratory Device Supply
  '98976': { label: 'Respiratory Device Supply, 16-30 days', amount: 47.00, frequency: 'Per 30-day period', new2026: false, category: 'respiratory', condition: 'respiratory' as RTMCondition },
  '98984': { label: 'Respiratory Device Supply, 2-15 days', amount: 47.00, frequency: 'Per 30-day period', new2026: true, category: 'respiratory', condition: 'respiratory' as RTMCondition },

  // Cognitive Behavioral Device Supply
  '98978': { label: 'CBT Device Supply, 16-30 days', amount: 45.00, frequency: 'Per 30-day period', new2026: false, category: 'cbt', condition: 'cognitive_behavioral' as RTMCondition },
  '98986': { label: 'CBT Device Supply, 2-15 days', amount: 45.00, frequency: 'Per 30-day period', new2026: true, category: 'cbt', condition: 'cognitive_behavioral' as RTMCondition },

  // Treatment Management (All Conditions)
  '98979': { label: 'Treatment Management — 10-19 Minutes', amount: 33.40, frequency: 'Per calendar month', new2026: true, category: 'management' },
  '98980': { label: 'Treatment Management — 20+ Minutes', amount: 52.00, frequency: 'Per calendar month', new2026: false, category: 'management' },
  '98981': { label: 'Additional 20-Minute Blocks', amount: 41.00, frequency: 'Per calendar month (add-on)', new2026: false, category: 'management' }
};

// Helper function to get device supply code based on condition and engagement level
function getDeviceSupplyCode(condition: RTMCondition, daysWithData: number): string | null {
  if (daysWithData >= 16) {
    if (condition === 'musculoskeletal') return '98977';
    if (condition === 'respiratory') return '98976';
    if (condition === 'cognitive_behavioral') return '98978';
  } else if (daysWithData >= 2) {
    if (condition === 'musculoskeletal') return '98985';
    if (condition === 'respiratory') return '98984';
    if (condition === 'cognitive_behavioral') return '98986';
  }
  return null;
}

// Condition metadata
const CONDITION_METADATA = {
  musculoskeletal: {
    emoji: '🦴',
    label: 'MSK',
    fullLabel: 'Musculoskeletal',
    description: 'Arthritis, osteoporosis, chronic pain, post-surgical rehab, fibromyalgia, gout, joint/bone/muscle conditions',
    medications: 'Common meds: NSAIDs, DMARDs, muscle relaxants, bisphosphonates, corticosteroids',
    fullCode: '98977',
    partialCode: '98985'
  },
  respiratory: {
    emoji: '🫁',
    label: 'RESP',
    fullLabel: 'Respiratory',
    description: 'Asthma, COPD, chronic bronchitis, pulmonary fibrosis, breathing conditions',
    medications: 'Common meds: Bronchodilators, inhaled corticosteroids, leukotriene modifiers',
    fullCode: '98976',
    partialCode: '98984'
  },
  cognitive_behavioral: {
    emoji: '🧠',
    label: 'CBT',
    fullLabel: 'Cognitive Behavioral',
    description: 'Depression, anxiety, substance abuse, PTSD, behavioral health conditions',
    medications: 'Common meds: SSRIs, SNRIs, antipsychotics, mood stabilizers, buprenorphine',
    fullCode: '98978',
    partialCode: '98986'
  }
};

type ActivityType = 'data_review' | 'patient_call' | 'care_plan' | 'coordination' | 'video_consult' | 'documentation';

interface RTMPatient {
  id: string;
  name: string;
  mrn: string;
  episodeStartDate: string;
  daysWithData: number;
  providerMinutes: number;
  hasInteractiveCommunication: boolean;
  setupComplete: boolean;
  condition?: RTMCondition; // MSK, Respiratory, or Cognitive Behavioral
  activities: ProviderActivity[];
}

interface ProviderActivity {
  id: string;
  timestamp: string;
  provider: string;
  providerNPI: string;
  providerType: string;
  duration: number; // minutes
  activityType: ActivityType;
  description: string;
  isInteractive: boolean; // Phone or video
}

interface EnrollmentForm {
  patientName: string;
  dateOfBirth: string;
  mrn: string;
  condition: RTMCondition | '';
  providerName: string;
  providerType: string;
  npi: string;
  consentObtained: boolean;
  enrolledPathways?: {
    rtm: boolean;
    ccm: boolean;
    bhi: boolean;
    apcm: boolean;
  };
}

type TabType = 'dashboard' | 'cpt-reference' | 'export' | 'revenue-calculator' | 'settings';

// Mock patient data for demonstration
const MOCK_PATIENTS: RTMPatient[] = [
  {
    id: '1',
    name: 'Margaret Chen',
    mrn: 'CS-10042',
    episodeStartDate: '2026-04-01',
    daysWithData: 22,
    providerMinutes: 35,
    hasInteractiveCommunication: true,
    setupComplete: true,
    condition: 'musculoskeletal', // Arthritis medications
    activities: [
      { id: 'a1', timestamp: '2026-05-01T10:00:00Z', provider: 'Dr. Sarah Wilson', providerNPI: '1234567890', providerType: 'MD', duration: 15, activityType: 'patient_call', description: 'Phone call discussing adherence trends', isInteractive: true },
      { id: 'a2', timestamp: '2026-05-02T14:30:00Z', provider: 'Dr. Sarah Wilson', providerNPI: '1234567890', providerType: 'MD', duration: 20, activityType: 'data_review', description: 'Reviewed 7-day medication adherence data', isInteractive: false }
    ]
  },
  {
    id: '2',
    name: 'Robert Williams',
    mrn: 'CS-10087',
    episodeStartDate: '2026-04-15',
    daysWithData: 12,
    providerMinutes: 15,
    hasInteractiveCommunication: true,
    setupComplete: true,
    condition: 'respiratory', // COPD medications
    activities: [
      { id: 'a3', timestamp: '2026-05-03T09:15:00Z', provider: 'NP Jennifer Lee', providerNPI: '0987654321', providerType: 'NP', duration: 15, activityType: 'video_consult', description: 'Video consultation regarding missed doses', isInteractive: true }
    ]
  },
  {
    id: '3',
    name: 'Dorothy Nakamura',
    mrn: 'CS-10103',
    episodeStartDate: '2026-04-20',
    daysWithData: 8,
    providerMinutes: 8,
    hasInteractiveCommunication: false,
    setupComplete: true,
    condition: 'cognitive_behavioral', // Dementia/behavioral medications
    activities: [
      { id: 'a4', timestamp: '2026-05-04T11:00:00Z', provider: 'Dr. Michael Chang', providerNPI: '1122334455', providerType: 'MD', duration: 8, activityType: 'data_review', description: 'Reviewed adherence patterns', isInteractive: false }
    ]
  },
  {
    id: '4',
    name: 'James Patterson',
    mrn: 'CS-10115',
    episodeStartDate: '2026-05-01',
    daysWithData: 0,
    providerMinutes: 0,
    hasInteractiveCommunication: false,
    setupComplete: false,
    condition: 'musculoskeletal', // Parkinson's-related pain medications
    activities: []
  }
];

// Circular Progress Ring Component
function ProgressRing({ value, max, color = 'emerald', size = 48 }: { value: number; max: number; color?: 'emerald' | 'amber' | 'rose'; size?: number }) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const colorMap = {
    emerald: 'text-emerald-500',
    amber: 'text-amber-500',
    rose: 'text-rose-500'
  };

  const strokeColorMap = {
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e'
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth="5"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColorMap[color]}
          strokeWidth="5"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className={clsx("absolute text-sm font-bold", colorMap[color])}>
        {value}
      </div>
    </div>
  );
}

// Patient Status Card Component
function PatientCard({ patient, isSelected, onSelect }: { patient: RTMPatient; isSelected: boolean; onSelect: () => void }) {
  // Calculate billable status using condition-specific codes
  const deviceSupplyCode = patient.condition
    ? getDeviceSupplyCode(patient.condition, patient.daysWithData)
    : null;

  const managementCode = patient.hasInteractiveCommunication
    ? (patient.providerMinutes >= 20 ? '98980' : patient.providerMinutes >= 10 ? '98979' : null)
    : null;

  const daysColor = patient.daysWithData >= 16 ? 'emerald' : patient.daysWithData >= 2 ? 'amber' : 'rose';
  const minutesColor = patient.providerMinutes >= 20 ? 'emerald' : patient.providerMinutes >= 10 ? 'amber' : 'rose';

  const estimatedReimbursement = useMemo(() => {
    let total = 0;
    if (deviceSupplyCode) total += CPT_CODES[deviceSupplyCode as keyof typeof CPT_CODES].amount;
    if (managementCode) total += CPT_CODES[managementCode as keyof typeof CPT_CODES].amount;
    return total;
  }, [deviceSupplyCode, managementCode]);

  // Condition metadata
  const conditionMeta = patient.condition ? CONDITION_METADATA[patient.condition] : null;

  // Dynamic status text based on condition
  const daysStatus = patient.daysWithData >= 16
    ? `✓ Full tier (${conditionMeta?.fullCode || '—'})`
    : patient.daysWithData >= 2
      ? `◐ Partial tier (${conditionMeta?.partialCode || '—'})`
      : '○ Below minimum';

  const minutesStatus = patient.providerMinutes >= 20
    ? '✓ Full tier (98980)'
    : patient.providerMinutes >= 10
      ? '◐ Partial tier (98979)'
      : '○ Below minimum';

  const interactiveStatus = patient.hasInteractiveCommunication
    ? '✓ Phone/video logged'
    : '✗ Required for billing';

  if (!patient.setupComplete) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-6 opacity-60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">{patient.name}</h3>
            <p className="text-xs sm:text-sm text-slate-400">{patient.mrn}</p>
          </div>
        </div>
        <p className="text-sm italic text-slate-500">No billable codes yet — complete setup to begin</p>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={clsx(
        "bg-white border-2 rounded-xl p-4 sm:p-6 transition-all cursor-pointer",
        isSelected
          ? "border-emerald-500 shadow-lg shadow-emerald-100"
          : "border-slate-200 hover:border-emerald-300"
      )}
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">{patient.name}</h3>
            {conditionMeta && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                <span>{conditionMeta.emoji}</span>
                <span>{conditionMeta.label}</span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400">{patient.mrn} • Started {new Date(patient.episodeStartDate).toLocaleDateString()}</p>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-600">${estimatedReimbursement.toFixed(2)}</div>
          <p className="text-xs text-slate-500">Est. This Period</p>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-4 sm:mb-6">
        {/* Days with Data */}
        <div className="flex flex-col items-center">
          <ProgressRing value={patient.daysWithData} max={30} color={daysColor} size={40} />
          <p className="text-[10px] sm:text-xs font-semibold text-slate-600 mt-2 mb-1 text-center">Days with Data</p>
          <p className={clsx("text-[9px] sm:text-xs font-medium text-center", {
            'text-emerald-600': daysColor === 'emerald',
            'text-amber-600': daysColor === 'amber',
            'text-rose-600': daysColor === 'rose'
          })}>
            <span className="hidden sm:inline">{daysStatus}</span>
            <span className="sm:hidden">{patient.daysWithData >= 16 ? '✓ Full' : patient.daysWithData >= 2 ? '◐ Partial' : '○ Low'}</span>
          </p>
        </div>

        {/* Provider Minutes */}
        <div className="flex flex-col items-center">
          <ProgressRing value={patient.providerMinutes} max={40} color={minutesColor} size={40} />
          <p className="text-[10px] sm:text-xs font-semibold text-slate-600 mt-2 mb-1 text-center">Provider Minutes</p>
          <p className={clsx("text-[9px] sm:text-xs font-medium text-center", {
            'text-emerald-600': minutesColor === 'emerald',
            'text-amber-600': minutesColor === 'amber',
            'text-rose-600': minutesColor === 'rose'
          })}>
            <span className="hidden sm:inline">{minutesStatus}</span>
            <span className="sm:hidden">{patient.providerMinutes >= 20 ? '✓ Full' : patient.providerMinutes >= 10 ? '◐ Partial' : '○ Low'}</span>
          </p>
        </div>

        {/* Interactive Communication */}
        <div className="flex flex-col items-center">
          <div className={clsx(
            "w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 sm:border-4 flex items-center justify-center",
            patient.hasInteractiveCommunication
              ? "border-emerald-500 bg-emerald-50"
              : "border-rose-500 bg-rose-50"
          )}>
            {patient.hasInteractiveCommunication ? (
              <Phone className="text-emerald-600" size={20} />
            ) : (
              <AlertCircle className="text-rose-600" size={20} />
            )}
          </div>
          <p className="text-[10px] sm:text-xs font-semibold text-slate-600 mt-2 mb-1 text-center">Interactive Comm</p>
          <p className={clsx("text-[9px] sm:text-xs font-medium text-center", {
            'text-emerald-600': patient.hasInteractiveCommunication,
            'text-rose-600': !patient.hasInteractiveCommunication
          })}>
            <span className="hidden sm:inline">{interactiveStatus}</span>
            <span className="sm:hidden">{patient.hasInteractiveCommunication ? '✓ Yes' : '✗ No'}</span>
          </p>
        </div>
      </div>

      {/* Billing Stack - Multi-Pathway Revenue Summary */}
      <div className="border-t border-slate-200 pt-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-600 uppercase" style={{ letterSpacing: '0.05em' }}>Billing Stack</h4>
          <div className="text-sm font-bold text-emerald-600">${estimatedReimbursement.toFixed(2)} <span className="text-xs text-slate-500 font-normal">total</span></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* RTM Mini-Card - ACTIVE */}
          <div className="bg-emerald-50 border-2 border-emerald-400 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm">🩺</span>
              <span className="text-xs font-bold text-emerald-900">RTM</span>
            </div>
            <div className="text-lg font-extrabold text-emerald-700">${estimatedReimbursement.toFixed(2)}</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-emerald-600 text-xs">✓</span>
              <span className="text-xs text-emerald-700 font-semibold">Eligible</span>
            </div>
          </div>

          {/* CCM Mini-Card - NOT ENROLLED */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm opacity-60">🫀</span>
              <span className="text-xs font-bold text-amber-900">CCM</span>
            </div>
            <div className="text-lg font-extrabold text-amber-600">$0.00</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-amber-600 text-xs">⚠</span>
              <span className="text-xs text-amber-700 font-semibold">No consent</span>
            </div>
          </div>

          {/* BHI Mini-Card - NOT ENABLED */}
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg p-2 opacity-60">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm opacity-40">🧠</span>
              <span className="text-xs font-bold text-slate-500">BHI</span>
            </div>
            <div className="text-lg font-extrabold text-slate-400">--</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-slate-400 text-xs">--</span>
              <span className="text-xs text-slate-500 font-semibold">Not enabled</span>
            </div>
          </div>

          {/* APCM Mini-Card - NOT ENABLED */}
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg p-2 opacity-60">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm opacity-40">🏥</span>
              <span className="text-xs font-bold text-slate-500">APCM</span>
            </div>
            <div className="text-lg font-extrabold text-slate-400">--</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-slate-400 text-xs">--</span>
              <span className="text-xs text-slate-500 font-semibold">Not enabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* CPT Code Badges */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {deviceSupplyCode && (
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-emerald-50 border border-emerald-400 rounded-full">
            <span className="font-mono font-bold text-xs sm:text-sm text-emerald-700">{deviceSupplyCode}</span>
            <span className="px-1.5 sm:px-2 py-0.5 bg-emerald-500 text-white text-[10px] sm:text-xs font-bold rounded">Billable</span>
            {CPT_CODES[deviceSupplyCode as keyof typeof CPT_CODES].new2026 && (
              <span className="hidden sm:inline px-2 py-0.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-extrabold rounded uppercase">NEW 2026</span>
            )}
          </div>
        )}
        {managementCode && (
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-emerald-50 border border-emerald-400 rounded-full">
            <span className="font-mono font-bold text-xs sm:text-sm text-emerald-700">{managementCode}</span>
            <span className="px-1.5 sm:px-2 py-0.5 bg-emerald-500 text-white text-[10px] sm:text-xs font-bold rounded">Billable</span>
            {CPT_CODES[managementCode as keyof typeof CPT_CODES].new2026 && (
              <span className="hidden sm:inline px-2 py-0.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-extrabold rounded uppercase">NEW 2026</span>
            )}
          </div>
        )}
        {!patient.hasInteractiveCommunication && patient.providerMinutes > 0 && (
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-rose-50 border border-rose-400 rounded-full">
            <span className="font-mono font-bold text-xs sm:text-sm text-rose-700">98979/80</span>
            <span className="px-1.5 sm:px-2 py-0.5 bg-rose-500 text-white text-[10px] sm:text-xs font-bold rounded">Blocked</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Provider Activity Logger Component
function ProviderActivityLogger({ patient, onActivityLogged }: { patient: RTMPatient; onActivityLogged: () => void }) {
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [duration, setDuration] = useState<number>(10);
  const [notes, setNotes] = useState<string>('');

  const activityTypes: { type: ActivityType; icon: React.ReactNode; label: string; description: string; interactive: boolean }[] = [
    { type: 'data_review', icon: <Activity size={32} />, label: 'Data Review', description: 'Review medication adherence data & trends', interactive: false },
    { type: 'patient_call', icon: <Phone size={32} />, label: 'Patient Call', description: 'Real-time phone/video with patient or caregiver', interactive: true },
    { type: 'care_plan', icon: <FileText size={32} />, label: 'Care Plan Update', description: 'Update treatment plan based on RTM data', interactive: false },
    { type: 'coordination', icon: <Users size={32} />, label: 'Provider Coordination', description: 'Coordinate with other Care Circle providers', interactive: false },
    { type: 'video_consult', icon: <Video size={32} />, label: 'Video Consultation', description: 'Video call with patient or caregiver', interactive: true },
    { type: 'documentation', icon: <BookOpen size={32} />, label: 'Clinical Documentation', description: 'Document interventions and outcomes', interactive: false }
  ];

  const handleLogActivity = () => {
    if (!selectedActivity) return;

    toast.success('Provider activity logged', {
      description: `${duration} minutes of ${activityTypes.find(a => a.type === selectedActivity)?.label.toLowerCase()} recorded`
    });

    setSelectedActivity(null);
    setDuration(10);
    setNotes('');
    onActivityLogged();
  };

  const totalMinutes = patient.providerMinutes;
  const hasInteractive = patient.hasInteractiveCommunication;
  const nextCPT = hasInteractive
    ? (totalMinutes >= 20 ? '98980' : totalMinutes >= 10 ? '98979' : `${20 - totalMinutes} min to CPT 98979`)
    : 'Interactive communication required';

  return (
    <div className="bg-white border-2 border-sky-200 rounded-xl p-4 sm:p-6 mt-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-base sm:text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
          <Clock className="text-sky-600" size={20} />
          <span className="hidden sm:inline">Log Provider Activity — {patient.name}</span>
          <span className="sm:hidden">Log Activity — {patient.name}</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-600">
          Track care coordination time for RTM billing. Interactive communications (📞 phone/video) satisfy the real-time requirement.
        </p>
      </div>

      {/* Activity Type Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        {activityTypes.map((activity) => (
          <div
            key={activity.type}
            onClick={() => setSelectedActivity(activity.type)}
            className={clsx(
              "border-2 rounded-lg p-2 sm:p-4 cursor-pointer transition-all",
              selectedActivity === activity.type
                ? activity.interactive
                  ? "border-sky-500 bg-sky-50"
                  : "border-emerald-500 bg-emerald-50"
                : "border-slate-200 hover:border-slate-300"
            )}
          >
            <div className="flex flex-col items-center text-center gap-1 sm:gap-2">
              <div className="text-slate-600 scale-75 sm:scale-100">{activity.icon}</div>
              <div className="font-bold text-xs sm:text-sm text-slate-900">{activity.label}</div>
              <div className="hidden sm:block text-xs text-slate-500">{activity.description}</div>
              {activity.interactive && (
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-sky-500 text-white text-[10px] sm:text-xs font-bold rounded">✓ Interactive</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Row */}
      <div className="flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-4 mb-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Duration (minutes)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            min="1"
            max="120"
          />
        </div>
        <div className="sm:col-span-8">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Clinical Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="E.g., Reviewed 7-day adherence trend, discussed missed evening doses..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="sm:col-span-2 flex items-end">
          <Button
            onClick={handleLogActivity}
            disabled={!selectedActivity}
            className={clsx(
              "w-full",
              selectedActivity ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-300"
            )}
          >
            Log Activity
          </Button>
        </div>
      </div>

      {/* Session Summary Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm">
          <span className="font-semibold text-slate-700">This period: {totalMinutes} min logged</span>
          <span className="hidden sm:inline text-slate-400">•</span>
          {hasInteractive ? (
            <span className="text-emerald-600 font-medium">✓ Interactive communication recorded</span>
          ) : (
            <span className="text-rose-600 font-medium">
              <span className="hidden sm:inline">✗ No interactive communication — phone/video call required before billing 98979/98980/98981</span>
              <span className="sm:hidden">✗ No interactive comm — phone/video required</span>
            </span>
          )}
        </div>
        <div className="text-xs sm:text-sm font-bold text-emerald-600">
          → {nextCPT}
        </div>
      </div>
    </div>
  );
}

// Enroll Patient Modal Component
function EnrollPatientModal({
  isOpen,
  onClose,
  onEnroll,
  pathwaysEnabled
}: {
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (data: EnrollmentForm) => void;
  pathwaysEnabled: { rtm: boolean; ccm: boolean; bhi: boolean; apcm: boolean };
}) {
  const [formData, setFormData] = useState<EnrollmentForm>({
    patientName: '',
    dateOfBirth: '',
    mrn: '',
    condition: '',
    providerName: '',
    providerType: '',
    npi: '',
    consentObtained: false
  });

  // Track which pathways the patient is being enrolled in
  const [selectedPathways, setSelectedPathways] = useState({
    rtm: true, // Always enabled
    ccm: false,
    bhi: false,
    apcm: false
  });
  const [npiStatus, setNpiStatus] = useState<'idle' | 'verifying' | 'valid' | 'invalid'>('idle');
  const [npiError, setNpiError] = useState<string>('');
  const [verifiedProviderData, setVerifiedProviderData] = useState<any>(null);

  const isNPIValid = formData.npi.length === 10 && /^\d+$/.test(formData.npi);
  const hasMutuallyExclusivePathways = selectedPathways.ccm && selectedPathways.apcm;
  const isFormValid = formData.patientName && formData.dateOfBirth && formData.mrn && formData.condition && formData.providerName && formData.providerType && isNPIValid && formData.consentObtained && npiStatus === 'valid' && !hasMutuallyExclusivePathways;
  const isTherapist = ['PT', 'OT', 'SLP'].includes(formData.providerType);

  // Real-time NPI verification
  const verifyNPI = async (npi: string) => {
    if (npi.length !== 10 || !/^\d+$/.test(npi)) {
      setNpiStatus('idle');
      setNpiError('');
      setVerifiedProviderData(null);
      return;
    }

    setNpiStatus('verifying');
    setNpiError('');

    try {
      const response = await fetch(`${SERVER_URL}/verify-npi/${npi}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      const data = await response.json();

      if (data.valid) {
        setNpiStatus('valid');
        setVerifiedProviderData(data);

        // Auto-populate provider name if not already set
        if (!formData.providerName && data.name) {
          setFormData(prev => ({ ...prev, providerName: data.name }));
        }

        // Auto-suggest provider type based on taxonomy
        if (!formData.providerType && data.taxonomyCode) {
          const taxonomyCode = data.taxonomyCode;
          let suggestedType = '';

          if (taxonomyCode.startsWith('208') || taxonomyCode.startsWith('207')) suggestedType = 'MD';
          else if (taxonomyCode.startsWith('363L') || taxonomyCode.startsWith('367')) suggestedType = 'NP';
          else if (taxonomyCode.startsWith('363A')) suggestedType = 'PA';
          else if (taxonomyCode.startsWith('225100000X')) suggestedType = 'PT';
          else if (taxonomyCode.startsWith('225X')) suggestedType = 'OT';
          else if (taxonomyCode.startsWith('235Z')) suggestedType = 'SLP';

          if (suggestedType) {
            setFormData(prev => ({ ...prev, providerType: suggestedType }));
          }
        }

        toast.success(`✓ NPI verified: ${data.name}`, {
          description: data.taxonomy
        });
      } else {
        setNpiStatus('invalid');
        setNpiError(data.error || 'NPI not found in NPPES registry');
        setVerifiedProviderData(null);
        toast.error('NPI verification failed', {
          description: data.error || 'Not found in CMS registry'
        });
      }
    } catch (error) {
      setNpiStatus('invalid');
      setNpiError('Unable to verify NPI');
      setVerifiedProviderData(null);
      toast.error('NPI verification error', {
        description: 'Check network connection'
      });
    }
  };

  // Debounced NPI verification (wait 500ms after user stops typing)
  const [npiDebounceTimer, setNpiDebounceTimer] = useState<number | null>(null);

  const handleNPIChange = (npi: string) => {
    const cleanedNPI = npi.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, npi: cleanedNPI });

    // Clear existing timer
    if (npiDebounceTimer) {
      clearTimeout(npiDebounceTimer);
    }

    // Set new timer for verification
    const timer = setTimeout(() => {
      verifyNPI(cleanedNPI);
    }, 500);

    setNpiDebounceTimer(timer as unknown as number);
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (npiDebounceTimer) {
        clearTimeout(npiDebounceTimer);
      }
    };
  }, [npiDebounceTimer]);

  const handleSubmit = () => {
    if (isFormValid) {
      const enrollmentData = {
        ...formData,
        enrolledPathways: selectedPathways
      };

      onEnroll(enrollmentData);
      onClose();

      // Build pathway list for confirmation message
      const pathways = ['RTM'];
      if (selectedPathways.ccm) pathways.push('CCM');
      if (selectedPathways.bhi) pathways.push('BHI');
      if (selectedPathways.apcm) pathways.push('APCM');

      toast.success(`Patient enrolled in ${pathways.join(' + ')}`, {
        description: `${formData.patientName} successfully enrolled. CPT 98975 initial setup billable.`
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl p-4 sm:p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900">Enroll Patient — Reimbursement Pathways</h2>
            <p className="text-xs sm:text-sm text-slate-500">RTM • CCM • BHI • APCM | Select applicable billing pathways</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          {/* Row 1 */}
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Name *</label>
              <input
                type="text"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter patient name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth *</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Medical Record Number *</label>
            <input
              type="text"
              value={formData.mrn}
              onChange={(e) => setFormData({ ...formData, mrn: e.target.value })}
              placeholder="CS-XXXXX"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* RTM Condition Category Section */}
          <div className="border-t border-slate-200 pt-3 sm:pt-4">
            <div className="mb-3">
              <p className="text-xs font-semibold uppercase text-slate-600 mb-1">RTM Monitoring Condition *</p>
              <p className="text-xs text-slate-500">
                Select the patient's primary condition being monitored. This determines which CPT device supply code will be assigned for billing.
              </p>
            </div>

            {/* Condition Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              {/* Musculoskeletal Card */}
              <div
                onClick={() => setFormData({ ...formData, condition: 'musculoskeletal' })}
                className={clsx(
                  "border-2 rounded-lg p-3 cursor-pointer transition-all",
                  formData.condition === 'musculoskeletal'
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🦴</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-900">Musculoskeletal</p>
                    <span className="inline-block px-1.5 py-0.5 bg-slate-200 text-slate-700 text-xs font-mono font-bold rounded">98977</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mb-1">
                  Arthritis, osteoporosis, chronic pain, post-surgical rehab, fibromyalgia, gout
                </p>
                <p className="text-[10px] text-slate-500">
                  NSAIDs, DMARDs, muscle relaxants, bisphosphonates
                </p>
              </div>

              {/* Respiratory Card */}
              <div
                onClick={() => setFormData({ ...formData, condition: 'respiratory' })}
                className={clsx(
                  "border-2 rounded-lg p-3 cursor-pointer transition-all",
                  formData.condition === 'respiratory'
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🫁</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-900">Respiratory</p>
                    <span className="inline-block px-1.5 py-0.5 bg-slate-200 text-slate-700 text-xs font-mono font-bold rounded">98976</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mb-1">
                  Asthma, COPD, chronic bronchitis, pulmonary fibrosis
                </p>
                <p className="text-[10px] text-slate-500">
                  Bronchodilators, inhaled corticosteroids
                </p>
              </div>

              {/* Cognitive Behavioral Card */}
              <div
                onClick={() => setFormData({ ...formData, condition: 'cognitive_behavioral' })}
                className={clsx(
                  "border-2 rounded-lg p-3 cursor-pointer transition-all",
                  formData.condition === 'cognitive_behavioral'
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🧠</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-900">Cognitive Behavioral</p>
                    <span className="inline-block px-1.5 py-0.5 bg-slate-200 text-slate-700 text-xs font-mono font-bold rounded">98978</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mb-1">
                  Depression, anxiety, substance abuse, PTSD
                </p>
                <p className="text-[10px] text-slate-500">
                  SSRIs, SNRIs, antipsychotics, mood stabilizers
                </p>
              </div>
            </div>
          </div>

          {/* Billing Pathways Section */}
          <div className="border-t border-slate-200 pt-3 sm:pt-4">
            <div className="mb-3">
              <p className="text-xs font-semibold uppercase text-slate-600 mb-1">Select Billing Pathways *</p>
              <p className="text-xs text-slate-500">
                Choose which reimbursement pathways to enroll this patient in. Pathways can be stacked for increased revenue.
              </p>
            </div>

            {/* RTM - Always Required (Display Only) */}
            <div className="mb-3 p-3 bg-emerald-50 border-2 border-emerald-400 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🩺</span>
                <p className="text-sm font-bold text-emerald-900">RTM — Remote Therapeutic Monitoring</p>
                <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs font-bold rounded">REQUIRED</span>
              </div>
              <p className="text-xs text-emerald-700">
                Always enrolled. Revenue potential: $92-135/patient/month
              </p>
            </div>

            {/* Additional Pathway Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* CCM Card */}
              <div
                onClick={() => pathwaysEnabled.ccm && setSelectedPathways(prev => ({ ...prev, ccm: !prev.ccm }))}
                className={clsx(
                  "border-2 rounded-lg p-3 transition-all",
                  !pathwaysEnabled.ccm && "opacity-50 cursor-not-allowed",
                  pathwaysEnabled.ccm && "cursor-pointer",
                  pathwaysEnabled.ccm && selectedPathways.ccm
                    ? "border-blue-500 bg-blue-50"
                    : pathwaysEnabled.ccm
                    ? "border-slate-200 bg-white hover:border-slate-300"
                    : "border-slate-200 bg-slate-50"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🫀</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-900">CCM</p>
                    <p className="text-xs text-slate-600">Chronic Care</p>
                  </div>
                  {pathwaysEnabled.ccm && selectedPathways.ccm && (
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-xs font-mono font-bold rounded">99490</span>
                  <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-xs font-mono font-bold rounded">99439</span>
                </div>
                <p className="text-xs text-slate-600 mb-1">
                  2+ chronic conditions. 20+ min/month care coordination.
                </p>
                <p className="text-xs font-semibold text-blue-600 mb-2">
                  $74-128/patient/month
                </p>
                {!pathwaysEnabled.ccm && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <p className="text-[10px] text-amber-700 font-semibold">⚠ Enable in Settings</p>
                  </div>
                )}
              </div>

              {/* BHI Card */}
              <div
                onClick={() => pathwaysEnabled.bhi && setSelectedPathways(prev => ({ ...prev, bhi: !prev.bhi }))}
                className={clsx(
                  "border-2 rounded-lg p-3 transition-all",
                  !pathwaysEnabled.bhi && "opacity-50 cursor-not-allowed",
                  pathwaysEnabled.bhi && "cursor-pointer",
                  pathwaysEnabled.bhi && selectedPathways.bhi
                    ? "border-purple-500 bg-purple-50"
                    : pathwaysEnabled.bhi
                    ? "border-slate-200 bg-white hover:border-slate-300"
                    : "border-slate-200 bg-slate-50"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🧠</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-900">BHI</p>
                    <p className="text-xs text-slate-600">Behavioral Health</p>
                  </div>
                  {pathwaysEnabled.bhi && selectedPathways.bhi && (
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-xs font-mono font-bold rounded">99484</span>
                </div>
                <p className="text-xs text-slate-600 mb-1">
                  Psychiatric conditions. 20+ min BHI services/month.
                </p>
                <p className="text-xs font-semibold text-purple-600 mb-2">
                  $58.50/patient/month
                </p>
                {!pathwaysEnabled.bhi && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <p className="text-[10px] text-amber-700 font-semibold">⚠ Enable in Settings</p>
                  </div>
                )}
              </div>

              {/* APCM Card */}
              <div
                onClick={() => pathwaysEnabled.apcm && setSelectedPathways(prev => ({ ...prev, apcm: !prev.apcm }))}
                className={clsx(
                  "border-2 rounded-lg p-3 transition-all",
                  !pathwaysEnabled.apcm && "opacity-50 cursor-not-allowed",
                  pathwaysEnabled.apcm && "cursor-pointer",
                  pathwaysEnabled.apcm && selectedPathways.apcm
                    ? "border-indigo-500 bg-indigo-50"
                    : pathwaysEnabled.apcm
                    ? "border-slate-200 bg-white hover:border-slate-300"
                    : "border-slate-200 bg-slate-50"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🏥</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-900">APCM</p>
                    <p className="text-xs text-slate-600">Primary Care</p>
                  </div>
                  {pathwaysEnabled.apcm && selectedPathways.apcm && (
                    <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-xs font-mono font-bold rounded">G0556</span>
                  <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-xs font-mono font-bold rounded">G0557</span>
                  <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-xs font-mono font-bold rounded">G0558</span>
                </div>
                <p className="text-xs text-slate-600 mb-1">
                  Chronic condition mgmt. Tiered by complexity.
                </p>
                <p className="text-xs font-semibold text-indigo-600 mb-2">
                  $15-117/patient/month
                </p>
                {!pathwaysEnabled.apcm && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <p className="text-[10px] text-amber-700 font-semibold">⚠ Enable in Settings</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mutual Exclusivity Warning */}
            {selectedPathways.ccm && selectedPathways.apcm && (
              <div className="mt-3 p-2 bg-rose-50 border border-rose-300 rounded-lg">
                <p className="text-xs text-rose-800 font-semibold">⚠ CCM and APCM are mutually exclusive for the same patient. Please select only one.</p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 pt-3 sm:pt-4">
            <p className="text-xs font-semibold uppercase text-slate-600 mb-2 sm:mb-3">Ordering Provider</p>

            {/* Row 3 */}
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Provider Name *</label>
                <input
                  type="text"
                  value={formData.providerName}
                  onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter provider name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Provider Type *</label>
                <select
                  value={formData.providerType}
                  onChange={(e) => setFormData({ ...formData, providerType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="" className="text-slate-400">Select...</option>
                  <option value="MD" className="text-slate-900">Physician (MD/DO)</option>
                  <option value="NP" className="text-slate-900">Nurse Practitioner (NP)</option>
                  <option value="PA" className="text-slate-900">Physician Assistant (PA)</option>
                  <option value="PT" className="text-slate-900">Physical Therapist (PT)</option>
                  <option value="OT" className="text-slate-900">Occupational Therapist (OT)</option>
                  <option value="SLP" className="text-slate-900">Speech-Language Pathologist (SLP)</option>
                </select>
              </div>
            </div>

            {/* Row 4 - NPI with Real-Time Verification */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">NPI Number *</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.npi}
                  onChange={(e) => handleNPIChange(e.target.value)}
                  placeholder="10-digit National Provider Identifier"
                  className={clsx(
                    "w-full px-3 py-2 pr-10 border rounded-lg text-sm font-mono text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2",
                    npiStatus === 'valid' ? "border-emerald-500 focus:ring-emerald-500" :
                    npiStatus === 'invalid' ? "border-rose-500 focus:ring-rose-500" :
                    "border-slate-300 focus:ring-emerald-500"
                  )}
                  maxLength={10}
                />
                {/* Verification Status Indicator */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {npiStatus === 'verifying' && (
                    <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {npiStatus === 'valid' && (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  )}
                  {npiStatus === 'invalid' && (
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                  )}
                </div>
              </div>

              {/* Verification Feedback */}
              {formData.npi && !isNPIValid && npiStatus === 'idle' && (
                <p className="text-xs text-slate-500 mt-1">NPI must be exactly 10 digits ({formData.npi.length}/10)</p>
              )}
              {npiStatus === 'valid' && verifiedProviderData && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-lg px-3 py-2 mt-2">
                  <p className="text-xs font-semibold text-emerald-900">✓ NPI Verified via CMS NPPES Registry</p>
                  <p className="text-xs text-emerald-700 mt-1">
                    {verifiedProviderData.name}
                    {verifiedProviderData.taxonomy && ` • ${verifiedProviderData.taxonomy}`}
                    {verifiedProviderData.state && ` • ${verifiedProviderData.state}`}
                  </p>
                </div>
              )}
              {npiStatus === 'invalid' && npiError && (
                <p className="text-xs text-rose-600 mt-1">✗ {npiError}</p>
              )}
              {isTherapist && (
                <div className="bg-amber-50 border border-amber-400 rounded-lg px-3 py-2 mt-2">
                  <p className="text-xs text-amber-800">⚠ Therapy providers must append GP, GO, or GN modifier to RTM claims</p>
                </div>
              )}
            </div>
          </div>

          {/* Consent Box */}
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.consentObtained}
                onChange={(e) => setFormData({ ...formData, consentObtained: e.target.checked })}
                className="mt-1 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-1">Patient Consent Obtained *</p>
                <p className="text-xs text-slate-600">
                  I confirm that informed consent for Remote Therapeutic Monitoring has been obtained from this patient,
                  including explanation of monitoring purpose, data collection, and billing implications. This consent will
                  be recorded with FDA-compliant electronic signature, timestamp, and audit trail per 21 CFR Part 11.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Button Row */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-slate-300 text-slate-700 bg-white hover:bg-slate-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={clsx(
              "flex-1",
              isFormValid ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-slate-300 text-slate-500"
            )}
          >
            Enroll Patient (RTM CPT 98975)
          </Button>
        </div>
      </div>
    </div>
  );
}

// Revenue Calculator Component
function RevenueCalculator({ pathwaysEnabled }: { pathwaysEnabled: { rtm: boolean; ccm: boolean; bhi: boolean; apcm: boolean } }) {
  const [panelSize, setPanelSize] = useState(50);
  const [rtmPercent, setRtmPercent] = useState(60);
  const [ccmPercent, setCcmPercent] = useState(0);
  const [bhiPercent, setBhiPercent] = useState(0);
  const [apcmPercent, setApcmPercent] = useState(0);
  const [avgProviderMinutes, setAvgProviderMinutes] = useState(25);
  const [avgDaysData, setAvgDaysData] = useState(20);

  // Calculate patient counts
  const rtmPatients = Math.round((panelSize * rtmPercent) / 100);
  const ccmPatients = Math.round((rtmPatients * ccmPercent) / 100);
  const bhiPatients = Math.round((panelSize * bhiPercent) / 100);
  const apcmPatients = Math.round((panelSize * apcmPercent) / 100);

  // Calculate revenue per pathway
  const rtmRevPerPatient = useMemo(() => {
    let revenue = 0;
    // Device supply (average across conditions: $44)
    if (avgDaysData >= 16) revenue += 44;
    else if (avgDaysData >= 2) revenue += 44;
    // Treatment management
    if (avgProviderMinutes >= 20) revenue += 52;
    else if (avgProviderMinutes >= 10) revenue += 33.40;
    return revenue;
  }, [avgDaysData, avgProviderMinutes]);

  const ccmRevPerPatient = avgProviderMinutes >= 20 ? 74.20 : 0;
  const bhiRevPerPatient = avgProviderMinutes >= 20 ? 58.50 : 0;
  const apcmRevPerPatient = 60; // Average of G0556-G0558

  const rtmMonthly = rtmPatients * rtmRevPerPatient;
  const ccmMonthly = ccmPatients * ccmRevPerPatient;
  const bhiMonthly = bhiPatients * bhiRevPerPatient;
  const apcmMonthly = apcmPatients * apcmRevPerPatient;

  const totalMonthly = rtmMonthly + ccmMonthly + bhiMonthly + apcmMonthly;
  const totalAnnual = totalMonthly * 12;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2 mb-2">
          <Calculator className="text-emerald-600" size={28} />
          Revenue Calculator — Estimate Your Reimbursement Potential
        </h2>
        <p className="text-sm text-slate-600">
          Interactive ROI calculator for RTM, CCM, BHI, and APCM billing pathways. Adjust inputs to see revenue projections.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Input Controls */}
        <div className="lg:col-span-2 space-y-4">
          {/* Panel Size */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-bold text-slate-900 mb-4">Patient Panel Configuration</h3>

            <div className="space-y-6">
              {/* Total Panel Size */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">Total Patient Panel</label>
                  <span className="text-2xl font-bold text-slate-900">{panelSize}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={panelSize}
                  onChange={(e) => setPanelSize(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>10</span>
                  <span>500</span>
                </div>
              </div>

              {/* RTM Percent */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-emerald-700 flex items-center gap-1">
                    <span>🩺</span>
                    <span>RTM Eligibility</span>
                  </label>
                  <span className="text-lg font-bold text-emerald-600">{rtmPercent}% ({rtmPatients} pts)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={rtmPercent}
                  onChange={(e) => setRtmPercent(Number(e.target.value))}
                  className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              {/* CCM Percent */}
              <div className={clsx(!pathwaysEnabled.ccm && "opacity-50")}>
                <div className="flex items-center justify-between mb-2">
                  <label className={clsx(
                    "text-sm font-semibold flex items-center gap-1",
                    pathwaysEnabled.ccm ? "text-blue-700" : "text-slate-500"
                  )}>
                    <span>🫀</span>
                    <span>CCM Enrollment (of RTM patients)</span>
                    <span className={clsx(
                      "px-2 py-0.5 text-white text-xs font-bold rounded ml-2",
                      pathwaysEnabled.ccm ? "bg-blue-600" : "bg-slate-400"
                    )}>
                      {pathwaysEnabled.ccm ? "ENABLED" : "DISABLED"}
                    </span>
                  </label>
                  <span className={clsx(
                    "text-lg font-bold",
                    pathwaysEnabled.ccm ? "text-blue-600" : "text-slate-400"
                  )}>
                    {ccmPercent}% ({pathwaysEnabled.ccm ? ccmPatients : 0} pts)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={ccmPercent}
                  disabled={!pathwaysEnabled.ccm}
                  onChange={(e) => setCcmPercent(Number(e.target.value))}
                  className={clsx(
                    "w-full h-2 rounded-lg appearance-none",
                    pathwaysEnabled.ccm
                      ? "bg-blue-100 cursor-pointer accent-blue-600"
                      : "bg-slate-200 cursor-not-allowed"
                  )}
                />
                {!pathwaysEnabled.ccm && (
                  <p className="text-xs text-slate-500 mt-1">Enable CCM in Billing Settings to activate</p>
                )}
              </div>

              {/* BHI Percent */}
              <div className={clsx(!pathwaysEnabled.bhi && "opacity-50")}>
                <div className="flex items-center justify-between mb-2">
                  <label className={clsx(
                    "text-sm font-semibold flex items-center gap-1",
                    pathwaysEnabled.bhi ? "text-purple-700" : "text-slate-500"
                  )}>
                    <span>🧠</span>
                    <span>BHI Eligibility</span>
                    <span className={clsx(
                      "px-2 py-0.5 text-white text-xs font-bold rounded ml-2",
                      pathwaysEnabled.bhi ? "bg-purple-600" : "bg-slate-400"
                    )}>
                      {pathwaysEnabled.bhi ? "ENABLED" : "DISABLED"}
                    </span>
                  </label>
                  <span className={clsx(
                    "text-lg font-bold",
                    pathwaysEnabled.bhi ? "text-purple-600" : "text-slate-400"
                  )}>
                    {bhiPercent}% ({pathwaysEnabled.bhi ? bhiPatients : 0} pts)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={bhiPercent}
                  disabled={!pathwaysEnabled.bhi}
                  onChange={(e) => setBhiPercent(Number(e.target.value))}
                  className={clsx(
                    "w-full h-2 rounded-lg appearance-none",
                    pathwaysEnabled.bhi
                      ? "bg-purple-100 cursor-pointer accent-purple-600"
                      : "bg-slate-200 cursor-not-allowed"
                  )}
                />
                {!pathwaysEnabled.bhi && (
                  <p className="text-xs text-slate-500 mt-1">Enable BHI in Billing Settings to activate</p>
                )}
              </div>

              {/* APCM Percent */}
              <div className={clsx(!pathwaysEnabled.apcm && "opacity-50")}>
                <div className="flex items-center justify-between mb-2">
                  <label className={clsx(
                    "text-sm font-semibold flex items-center gap-1",
                    pathwaysEnabled.apcm ? "text-indigo-700" : "text-slate-500"
                  )}>
                    <span>🏥</span>
                    <span>APCM Eligibility</span>
                    <span className={clsx(
                      "px-2 py-0.5 text-white text-xs font-bold rounded ml-2",
                      pathwaysEnabled.apcm ? "bg-indigo-600" : "bg-slate-400"
                    )}>
                      {pathwaysEnabled.apcm ? "ENABLED" : "DISABLED"}
                    </span>
                  </label>
                  <span className={clsx(
                    "text-lg font-bold",
                    pathwaysEnabled.apcm ? "text-indigo-600" : "text-slate-400"
                  )}>
                    {apcmPercent}% ({pathwaysEnabled.apcm ? apcmPatients : 0} pts)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={apcmPercent}
                  disabled={!pathwaysEnabled.apcm}
                  onChange={(e) => setApcmPercent(Number(e.target.value))}
                  className={clsx(
                    "w-full h-2 rounded-lg appearance-none",
                    pathwaysEnabled.apcm
                      ? "bg-indigo-100 cursor-pointer accent-indigo-600"
                      : "bg-slate-200 cursor-not-allowed"
                  )}
                />
                {!pathwaysEnabled.apcm && (
                  <p className="text-xs text-slate-500 mt-1">Enable APCM in Billing Settings to activate</p>
                )}
              </div>
            </div>
          </div>

          {/* Provider Activity Inputs */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-bold text-slate-900 mb-4">Average Provider Activity per Patient</h3>

            <div className="space-y-6">
              {/* Provider Minutes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">Provider Minutes per Month</label>
                  <span className="text-2xl font-bold text-indigo-600">{avgProviderMinutes} min</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={avgProviderMinutes}
                  onChange={(e) => setAvgProviderMinutes(Number(e.target.value))}
                  className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>0 (no mgmt code)</span>
                  <span className="text-amber-600">10 (98979)</span>
                  <span className="text-emerald-600">20+ (98980)</span>
                </div>
              </div>

              {/* Days with Data */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">Days with Data per Month</label>
                  <span className="text-2xl font-bold text-sky-600">{avgDaysData} days</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={avgDaysData}
                  onChange={(e) => setAvgDaysData(Number(e.target.value))}
                  className="w-full h-2 bg-sky-100 rounded-lg appearance-none cursor-pointer accent-sky-600"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>0 (no device code)</span>
                  <span className="text-amber-600">2 (partial)</span>
                  <span className="text-emerald-600">16+ (full tier)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Revenue Summary */}
        <div className="space-y-4">
          {/* Total Revenue Card */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg">
            <p className="text-sm font-semibold mb-1 text-emerald-100">Total Monthly Revenue</p>
            <p className="text-4xl font-extrabold mb-3">${totalMonthly.toLocaleString()}</p>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mb-3">
              <p className="text-xs font-semibold mb-1">Annual Projection</p>
              <p className="text-2xl font-bold">${totalAnnual.toLocaleString()}/year</p>
            </div>
            <p className="text-xs text-emerald-100">Based on {rtmPatients + ccmPatients + bhiPatients + apcmPatients} billable patients</p>
          </div>

          {/* Pathway Breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase" style={{ letterSpacing: '0.05em' }}>Revenue by Pathway</h4>

            <div className="space-y-3">
              {/* RTM */}
              <div className="border-l-4 border-emerald-500 pl-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-600">RTM</span>
                  <span className="text-lg font-bold text-emerald-600">${rtmMonthly.toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-500">{rtmPatients} pts × ${rtmRevPerPatient.toFixed(2)}/mo</p>
              </div>

              {/* CCM */}
              <div className={clsx(
                "border-l-4 pl-3",
                pathwaysEnabled.ccm
                  ? "border-blue-500"
                  : "border-slate-300 opacity-50"
              )}>
                <div className="flex items-center justify-between mb-1">
                  <span className={clsx(
                    "text-xs font-semibold",
                    pathwaysEnabled.ccm ? "text-blue-600" : "text-slate-500"
                  )}>CCM</span>
                  <span className={clsx(
                    "text-lg font-bold",
                    pathwaysEnabled.ccm ? "text-blue-600" : "text-slate-400"
                  )}>
                    ${pathwaysEnabled.ccm ? ccmMonthly.toLocaleString() : '0'}
                  </span>
                </div>
                <p className={clsx(
                  "text-xs",
                  pathwaysEnabled.ccm ? "text-slate-500" : "text-slate-400"
                )}>
                  {pathwaysEnabled.ccm
                    ? `${ccmPatients} pts × $${ccmRevPerPatient.toFixed(2)}/mo`
                    : 'Pathway disabled'}
                </p>
              </div>

              {/* BHI */}
              <div className={clsx(
                "border-l-4 pl-3",
                pathwaysEnabled.bhi
                  ? "border-purple-500"
                  : "border-slate-300 opacity-50"
              )}>
                <div className="flex items-center justify-between mb-1">
                  <span className={clsx(
                    "text-xs font-semibold",
                    pathwaysEnabled.bhi ? "text-purple-600" : "text-slate-500"
                  )}>BHI</span>
                  <span className={clsx(
                    "text-lg font-bold",
                    pathwaysEnabled.bhi ? "text-purple-600" : "text-slate-400"
                  )}>
                    ${pathwaysEnabled.bhi ? bhiMonthly.toLocaleString() : '0'}
                  </span>
                </div>
                <p className={clsx(
                  "text-xs",
                  pathwaysEnabled.bhi ? "text-slate-500" : "text-slate-400"
                )}>
                  {pathwaysEnabled.bhi
                    ? `${bhiPatients} pts × $${bhiRevPerPatient.toFixed(2)}/mo`
                    : 'Pathway disabled'}
                </p>
              </div>

              {/* APCM */}
              <div className={clsx(
                "border-l-4 pl-3",
                pathwaysEnabled.apcm
                  ? "border-indigo-500"
                  : "border-slate-300 opacity-50"
              )}>
                <div className="flex items-center justify-between mb-1">
                  <span className={clsx(
                    "text-xs font-semibold",
                    pathwaysEnabled.apcm ? "text-indigo-600" : "text-slate-500"
                  )}>APCM</span>
                  <span className={clsx(
                    "text-lg font-bold",
                    pathwaysEnabled.apcm ? "text-indigo-600" : "text-slate-400"
                  )}>
                    ${pathwaysEnabled.apcm ? apcmMonthly.toLocaleString() : '0'}
                  </span>
                </div>
                <p className={clsx(
                  "text-xs",
                  pathwaysEnabled.apcm ? "text-slate-500" : "text-slate-400"
                )}>
                  {pathwaysEnabled.apcm
                    ? `${apcmPatients} pts × $${apcmRevPerPatient.toFixed(2)}/mo`
                    : 'Pathway disabled'}
                </p>
              </div>
            </div>
          </div>

          {/* Per-Patient Average */}
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-sky-900 mb-2">Average Revenue per Patient</p>
            <p className="text-3xl font-extrabold text-sky-700">
              ${rtmPatients > 0 ? (totalMonthly / rtmPatients).toFixed(2) : '0.00'}
            </p>
            <p className="text-xs text-sky-700 mt-1">per month (RTM patients only)</p>
          </div>
        </div>
      </div>

      {/* Bottom Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
        <h4 className="font-bold text-blue-900 mb-2">💡 Revenue Maximization Tips</h4>
        <ul className="text-sm text-blue-900 space-y-1">
          <li>• <strong>RTM:</strong> Ensure {'>'}20 min provider time and {'>'}16 days device data for maximum reimbursement ($96/patient/month)</li>
          <li>• <strong>Stack pathways:</strong> RTM + CCM can be billed together for up to $170+/patient/month</li>
          <li>• <strong>Interactive communication:</strong> Required for RTM treatment management codes (98979/98980)</li>
          <li>• <strong>Enable CCM:</strong> Navigate to Billing Settings to activate CCM, BHI, and APCM pathways</li>
        </ul>
      </div>
    </div>
  );
}

// Main RTM Billing Component
export default function RTMBilling() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patients, setPatients] = useState<RTMPatient[]>(MOCK_PATIENTS);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [conditionFilter, setConditionFilter] = useState<RTMCondition | 'all'>('all');

  // Pathway enablement state
  const [pathwaysEnabled, setPathwaysEnabled] = useState({
    rtm: true,  // Always enabled
    ccm: false,
    bhi: false,
    apcm: false
  });

  // Load saved pathway settings on mount
  useEffect(() => {
    const loadPathwaySettings = async () => {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9aeac050/billing-pathways`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.pathways) {
            setPathwaysEnabled({
              rtm: true, // Always enabled
              ccm: data.pathways.ccm || false,
              bhi: data.pathways.bhi || false,
              apcm: data.pathways.apcm || false
            });
          }
        }
      } catch (error) {
        console.error('Failed to load pathway settings:', error);
      }
    };

    loadPathwaySettings();
  }, []);

  const togglePathway = async (pathway: 'ccm' | 'bhi' | 'apcm') => {
    const newValue = !pathwaysEnabled[pathway];

    // Optimistically update UI
    setPathwaysEnabled(prev => ({
      ...prev,
      [pathway]: newValue
    }));

    // Save to backend
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9aeac050/billing-pathways`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pathways: {
            ...pathwaysEnabled,
            [pathway]: newValue
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save pathway settings');
      }
    } catch (error) {
      console.error('Failed to save pathway settings:', error);
      // Revert on error
      setPathwaysEnabled(prev => ({
        ...prev,
        [pathway]: !newValue
      }));
      toast.error('Failed to save pathway settings');
      return;
    }

    const pathwayLabels = {
      ccm: 'CCM (Chronic Care Management)',
      bhi: 'BHI (Behavioral Health Integration)',
      apcm: 'APCM (Advanced Primary Care Management)'
    };

    toast.success(
      newValue ? `${pathwayLabels[pathway]} enabled` : `${pathwayLabels[pathway]} disabled`,
      { description: newValue ? 'You can now enroll patients in this pathway' : 'Patients will no longer be enrolled in this pathway' }
    );
  };

  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  // Filtered patients based on condition filter
  const filteredPatients = conditionFilter === 'all'
    ? patients
    : patients.filter(p => p.condition === conditionFilter);

  // Calculate summary metrics (use filteredPatients for display)
  const billablePatients = filteredPatients.filter(p => p.setupComplete && (p.daysWithData >= 2 || p.providerMinutes >= 10)).length;
  const totalPatients = filteredPatients.filter(p => p.setupComplete).length;
  const actionRequired = filteredPatients.filter(p => p.setupComplete && p.providerMinutes >= 10 && !p.hasInteractiveCommunication).length;
  const estimatedMonthlyReimbursement = useMemo(() => {
    return filteredPatients.reduce((total, p) => {
      let patientTotal = 0;
      const deviceCode = p.condition ? getDeviceSupplyCode(p.condition, p.daysWithData) : null;
      const managementCode = p.hasInteractiveCommunication
        ? (p.providerMinutes >= 20 ? '98980' : p.providerMinutes >= 10 ? '98979' : null)
        : null;

      if (deviceCode) patientTotal += CPT_CODES[deviceCode as keyof typeof CPT_CODES].amount;
      if (managementCode) patientTotal += CPT_CODES[managementCode as keyof typeof CPT_CODES].amount;

      return total + patientTotal;
    }, 0);
  }, [filteredPatients]);

  const avgPerPatient = totalPatients > 0 ? estimatedMonthlyReimbursement / totalPatients : 0;

  const handleEnrollPatient = (data: EnrollmentForm) => {
    // In a real implementation, this would call the backend API
    console.log('Enrolling patient:', data);
  };

  const handleActivityLogged = () => {
    // In a real implementation, this would refresh patient data from backend
    toast.info('Patient data refreshed');
  };

  const handleExportCSV = () => {
    const exportData = patients
      .filter(p => p.setupComplete)
      .map(p => {
        const deviceCode = p.condition ? getDeviceSupplyCode(p.condition, p.daysWithData) : null;
        const managementCode = p.hasInteractiveCommunication
          ? (p.providerMinutes >= 20 ? '98980' : p.providerMinutes >= 10 ? '98979' : null)
          : null;

        let patientTotal = 0;
        if (deviceCode) patientTotal += CPT_CODES[deviceCode as keyof typeof CPT_CODES].amount;
        if (managementCode) patientTotal += CPT_CODES[managementCode as keyof typeof CPT_CODES].amount;

        return { patient: p, deviceCode, managementCode, total: patientTotal };
      });

    const csvContent = [
      '// CareSolis RTM Billing Export — ' + new Date().toLocaleDateString(),
      '// Remote Therapeutic Monitoring (RTM) — CY 2026 CMS Final Rule',
      '',
      ...exportData.map(({ patient, deviceCode, managementCode, total }) => {
        const conditionLabel = patient.condition ? CONDITION_METADATA[patient.condition].label : 'Unknown';
        let lines = [`PATIENT: ${patient.name} (MRN: ${patient.mrn}) [${conditionLabel}]`];

        if (deviceCode) {
          const cpt = CPT_CODES[deviceCode as keyof typeof CPT_CODES];
          const isFullEngagement = patient.daysWithData >= 16;
          const threshold = isFullEngagement ? '16' : '2';
          lines.push(`  CPT ${deviceCode} — $${cpt.amount.toFixed(2)} — ${cpt.label}, ${patient.daysWithData}/${threshold} days — ${isFullEngagement ? 'full' : 'partial'}`);
        }

        if (managementCode) {
          const cpt = CPT_CODES[managementCode as keyof typeof CPT_CODES];
          lines.push(`  CPT ${managementCode} — $${cpt.amount.toFixed(2)} — ${patient.providerMinutes} min — ${managementCode === '98980' ? 'full' : 'partial'} management`);
        }

        if (!patient.hasInteractiveCommunication && patient.providerMinutes > 0) {
          lines.push(`  ** BLOCKED: No interactive communication logged **`);
        }

        lines.push(`  SUBTOTAL: $${total.toFixed(2)}`);
        lines.push('');
        return lines.join('\n');
      }),
      `TOTAL ESTIMATED REIMBURSEMENT: $${estimatedMonthlyReimbursement.toFixed(2)}`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `caresolis_rtm_export_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('RTM billing export downloaded');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Bar */}
      <div className="bg-white border-b-2 border-slate-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <Shield className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-slate-900" style={{ letterSpacing: '-0.02em' }}>
                  Clinical Operations — Reimbursement Center
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 hidden sm:block">RTM • CCM • BHI • APCM | Stacked Billing | CY 2026 CMS</p>
                <p className="text-xs text-slate-600 sm:hidden">Reimbursement Center</p>
              </div>
            </div>
            <Button
              onClick={() => setShowEnrollModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Enroll Patient</span>
              <span className="sm:hidden">Enroll</span>
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mt-4 sm:mt-6 border-b border-slate-200 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={clsx(
                "flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 font-semibold text-xs sm:text-sm transition-all border-b-2 whitespace-nowrap",
                activeTab === 'dashboard'
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              )}
            >
              <Activity size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">RTM Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('cpt-reference')}
              className={clsx(
                "flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 font-semibold text-xs sm:text-sm transition-all border-b-2 whitespace-nowrap",
                activeTab === 'cpt-reference'
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              )}
            >
              <BookOpen size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">CPT Code Reference</span>
              <span className="sm:hidden">CPT Codes</span>
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={clsx(
                "flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 font-semibold text-xs sm:text-sm transition-all border-b-2 whitespace-nowrap",
                activeTab === 'export'
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              )}
            >
              <Upload size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Export Billing</span>
              <span className="sm:hidden">Export</span>
            </button>
            <button
              onClick={() => setActiveTab('revenue-calculator')}
              className={clsx(
                "flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 font-semibold text-xs sm:text-sm transition-all border-b-2 whitespace-nowrap",
                activeTab === 'revenue-calculator'
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              )}
            >
              <Calculator size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Revenue Calculator</span>
              <span className="sm:hidden">Calculator</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={clsx(
                "flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 font-semibold text-xs sm:text-sm transition-all border-b-2 whitespace-nowrap",
                activeTab === 'settings'
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              )}
            >
              <Settings size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Billing Settings</span>
              <span className="sm:hidden">Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {activeTab === 'dashboard' && (
          <>
            {/* Summary Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-xl p-4 sm:p-6">
                <p className="text-xs uppercase font-semibold text-emerald-800 mb-2" style={{ letterSpacing: '0.05em' }}>Total Monthly (All Codes)</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700">${estimatedMonthlyReimbursement.toFixed(2)}</p>
                <p className="text-xs text-emerald-600 mt-1">Current billing period</p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 sm:p-6">
                <p className="text-xs uppercase font-semibold text-emerald-700 mb-2 flex items-center gap-1" style={{ letterSpacing: '0.05em' }}>
                  <span>RTM Revenue</span>
                  <span className="text-[10px] bg-emerald-600 text-white px-1 py-0.5 rounded">ACTIVE</span>
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">${estimatedMonthlyReimbursement.toFixed(2)}</p>
                <p className="text-xs text-slate-500 mt-1">RTM codes only</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-6 opacity-60">
                <p className="text-xs uppercase font-semibold text-slate-500 mb-2" style={{ letterSpacing: '0.05em' }}>CCM Revenue</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-400">$0.00</p>
                <p className="text-xs text-slate-400 mt-1">Pathway disabled</p>
              </div>

              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 sm:p-6">
                <p className="text-xs uppercase font-semibold text-sky-700 mb-2" style={{ letterSpacing: '0.05em' }}>Billable Patients</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-sky-600">{billablePatients}/{totalPatients}</p>
                <p className="text-xs text-slate-500 mt-1">Meeting criteria</p>
              </div>

              <div className={clsx(
                "border rounded-xl p-4 sm:p-6",
                actionRequired > 0 ? "bg-rose-50 border-rose-200" : "bg-emerald-50 border-emerald-200"
              )}>
                <p className={clsx(
                  "text-xs uppercase font-semibold mb-2",
                  actionRequired > 0 ? "text-rose-700" : "text-emerald-700"
                )} style={{ letterSpacing: '0.05em' }}>Action Required</p>
                <p className={clsx(
                  "text-2xl sm:text-3xl font-extrabold",
                  actionRequired > 0 ? "text-rose-600" : "text-emerald-600"
                )}>{actionRequired}</p>
                <p className="text-xs text-slate-500 mt-1">Needs attention</p>
              </div>
            </div>

            {/* Patient RTM Status Section */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-3">
                <h2 className="text-base sm:text-xl font-bold text-slate-900">
                  <span className="hidden sm:inline">Patient RTM Status — Current Billing Period</span>
                  <span className="sm:hidden">Patient Status — Current Period</span>
                </h2>

                {/* Condition Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 hidden sm:inline">Filter by condition:</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setConditionFilter('all')}
                      className={clsx(
                        "px-3 py-1.5 text-xs font-semibold rounded-full transition-all",
                        conditionFilter === 'all'
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setConditionFilter('musculoskeletal')}
                      className={clsx(
                        "px-3 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-1",
                        conditionFilter === 'musculoskeletal'
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      <span>🦴</span>
                      <span>MSK</span>
                    </button>
                    <button
                      onClick={() => setConditionFilter('respiratory')}
                      className={clsx(
                        "px-3 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-1",
                        conditionFilter === 'respiratory'
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      <span>🫁</span>
                      <span>RESP</span>
                    </button>
                    <button
                      onClick={() => setConditionFilter('cognitive_behavioral')}
                      className={clsx(
                        "px-3 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-1",
                        conditionFilter === 'cognitive_behavioral'
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      <span>🧠</span>
                      <span>CBT</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {filteredPatients.map((patient) => (
                  <PatientCard
                    key={patient.id}
                    patient={patient}
                    isSelected={selectedPatient === patient.id}
                    onSelect={() => setSelectedPatient(selectedPatient === patient.id ? null : patient.id)}
                  />
                ))}
              </div>
            </div>

            {/* Provider Activity Logger */}
            {selectedPatientData && selectedPatientData.setupComplete && (
              <ProviderActivityLogger
                patient={selectedPatientData}
                onActivityLogged={handleActivityLogged}
              />
            )}
          </>
        )}

        {activeTab === 'cpt-reference' && (
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2">
              <BookOpen className="text-emerald-600" size={24} />
              <span className="hidden sm:inline">Reimbursement Code Reference — All Supported Pathways</span>
              <span className="sm:hidden">Code Reference</span>
            </h2>

            <p className="text-sm text-slate-600 mb-6">Complete reference for RTM, CCM, BHI, and APCM billing codes supported by CareSolis.</p>

            {/* CPT Codes by Category */}
            <div className="space-y-6 mb-6">
              {/* Setup */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-700">Setup (All Conditions)</h3>
                </div>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-sm">98975</td>
                      <td className="px-4 py-3 text-sm">Initial Setup & Education</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">$22.00</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600 hidden sm:table-cell">Once per episode</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Musculoskeletal */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
                  <span>🦴</span>
                  <h3 className="text-sm font-bold text-slate-700">Device Supply — Musculoskeletal</h3>
                </div>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-sm">98977</td>
                      <td className="px-4 py-3 text-sm">MSK Device Supply, 16-30 days</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">$40.08</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600 hidden sm:table-cell">Per 30-day period</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm">98985</span>
                          <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-extrabold rounded uppercase">NEW 2026</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">MSK Device Supply, 2-15 days</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">$40.08</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600 hidden sm:table-cell">Per 30-day period</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Respiratory */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
                  <span>🫁</span>
                  <h3 className="text-sm font-bold text-slate-700">Device Supply — Respiratory</h3>
                </div>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-sm">98976</td>
                      <td className="px-4 py-3 text-sm">Respiratory Device Supply, 16-30 days</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">$47.00</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600 hidden sm:table-cell">Per 30-day period</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm">98984</span>
                          <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-extrabold rounded uppercase">NEW 2026</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">Respiratory Device Supply, 2-15 days</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">$47.00</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600 hidden sm:table-cell">Per 30-day period</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Cognitive Behavioral */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
                  <span>🧠</span>
                  <h3 className="text-sm font-bold text-slate-700">Device Supply — Cognitive Behavioral</h3>
                </div>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-sm">98978</td>
                      <td className="px-4 py-3 text-sm">CBT Device Supply, 16-30 days</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">$45.00</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600 hidden sm:table-cell">Per 30-day period</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm">98986</span>
                          <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-extrabold rounded uppercase">NEW 2026</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">CBT Device Supply, 2-15 days</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">$45.00</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600 hidden sm:table-cell">Per 30-day period</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Treatment Management */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-700">Treatment Management (All Conditions)</h3>
                </div>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm">98979</span>
                          <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-extrabold rounded uppercase">NEW 2026</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">Treatment Management — 10-19 Minutes</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">$33.40</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600 hidden sm:table-cell">Per calendar month</td>
                    </tr>
                    <tr className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-sm">98980</td>
                      <td className="px-4 py-3 text-sm">Treatment Management — 20+ Minutes</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">$52.00</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600 hidden sm:table-cell">Per calendar month</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-sm">98981</td>
                      <td className="px-4 py-3 text-sm">Additional 20-Minute Blocks</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">$41.00</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600 hidden sm:table-cell">Per calendar month (add-on)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section Divider */}
              <div className="border-t-4 border-slate-300 my-8"></div>

              {/* CCM - Chronic Care Management */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-blue-50 px-4 py-2 border-b border-blue-200 flex items-center gap-2">
                  <span>🫀</span>
                  <h3 className="text-sm font-bold text-blue-900">CCM — Chronic Care Management</h3>
                </div>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-sm">99490</td>
                      <td className="px-4 py-3 text-sm">Non-complex CCM, first 20 min</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">~$74.20</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600 hidden sm:table-cell">Per calendar month</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-sm">99439</td>
                      <td className="px-4 py-3 text-sm">Additional CCM, each 20 min</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">~$54.00</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600 hidden sm:table-cell">Per calendar month (add-on)</td>
                    </tr>
                  </tbody>
                </table>
                <div className="bg-blue-50 px-4 py-3 border-t border-blue-200">
                  <p className="text-xs text-blue-900">
                    <strong>Requirements:</strong> Care coordination for patients with 2+ chronic conditions. Requires patient consent. 20+ minutes of management time. Can be billed alongside RTM.
                  </p>
                </div>
              </div>

              {/* BHI - Behavioral Health Integration */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-purple-50 px-4 py-2 border-b border-purple-200 flex items-center gap-2">
                  <span>🧠</span>
                  <h3 className="text-sm font-bold text-purple-900">BHI — Behavioral Health Integration</h3>
                </div>
                <table className="w-full">
                  <tbody>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-sm">99484</td>
                      <td className="px-4 py-3 text-sm">BHI services, 20+ min</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">~$58.50</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600 hidden sm:table-cell">Per calendar month</td>
                    </tr>
                  </tbody>
                </table>
                <div className="bg-purple-50 px-4 py-3 border-t border-purple-200">
                  <p className="text-xs text-purple-900">
                    <strong>Requirements:</strong> Behavioral health integration for patients with psychiatric conditions managed alongside medical care. Cannot be billed with psychiatric collaborative care (99492-99494).
                  </p>
                </div>
              </div>

              {/* APCM - Advanced Primary Care Management */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-indigo-50 px-4 py-2 border-b border-indigo-200 flex items-center gap-2">
                  <span>🏥</span>
                  <h3 className="text-sm font-bold text-indigo-900">APCM — Advanced Primary Care Management</h3>
                </div>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-sm">G0556</td>
                      <td className="px-4 py-3 text-sm">APCM Level 1 (0-1 chronic conditions)</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">~$15.00</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600 hidden sm:table-cell">Per calendar month</td>
                    </tr>
                    <tr className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-sm">G0557</td>
                      <td className="px-4 py-3 text-sm">APCM Level 2 (2+ chronic conditions)</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">~$49.00</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600 hidden sm:table-cell">Per calendar month</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-sm">G0558</td>
                      <td className="px-4 py-3 text-sm">APCM Level 3 (QMB with 2+ conditions)</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">~$117.00</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600 hidden sm:table-cell">Per calendar month</td>
                    </tr>
                  </tbody>
                </table>
                <div className="bg-indigo-50 px-4 py-3 border-t border-indigo-200">
                  <p className="text-xs text-indigo-900">
                    <strong>Requirements:</strong> Primary care practices only. Tiered by patient complexity. Practice must meet APCM qualifying criteria.
                  </p>
                </div>
              </div>

              {/* Rate Disclaimer */}
              <div className="bg-sky-50 border border-sky-200 rounded-lg px-4 py-3">
                <p className="text-xs text-sky-800">
                  ⚠ <strong>Rates shown are national averages from the CY 2026 Medicare Physician Fee Schedule.</strong> Actual payment varies by geographic locality (GPCI) and Medicare Administrative Contractor (MAC). CCM, BHI, and APCM rates require verification with your billing specialist. Consult your billing specialist for location-specific rates.
                </p>
              </div>
            </div>

            {/* Stacking Compatibility Rules */}
            <div className="bg-emerald-50 border-2 border-emerald-400 rounded-xl p-4 sm:p-6 mb-6">
              <div className="flex gap-3 sm:gap-4">
                <CheckCircle className="text-emerald-600 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-base text-emerald-900 mb-3">BILLING COMPATIBILITY RULES — Stacked Codes</h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-emerald-800">
                    <li>• <strong>✓ RTM + CCM:</strong> CAN be billed together for the same patient, same month</li>
                    <li>• <strong>✓ RTM + BHI:</strong> CAN be billed together for the same patient, same month</li>
                    <li>• <strong>✓ RTM + APCM:</strong> CAN be billed together for the same patient, same month</li>
                    <li>• <strong>✓ CCM + BHI:</strong> CAN be billed together for the same patient, same month</li>
                    <li>• <strong>✗ CCM + APCM:</strong> CANNOT be billed together — choose one per patient</li>
                    <li>• <strong>✗ RTM + RPM:</strong> CANNOT be billed together for the same patient, same month</li>
                    <li>• <strong>✗ BHI + Psychiatric Collaborative Care (99492-99494):</strong> CANNOT be billed together</li>
                    <li>• <strong>⚠ One clinician</strong> per code family per patient per month</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* RTM-Specific Billing Rules */}
            <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-4 sm:p-6">
              <div className="flex gap-3 sm:gap-4">
                <AlertCircle className="text-amber-600 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-base text-amber-900 mb-3">RTM-SPECIFIC RULES — Claims will be denied if violated:</h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-amber-800">
                    <li>• <strong>98977 and 98985 CANNOT</strong> be billed in the same 30-day period (MSK full vs partial — pick one)</li>
                    <li>• <strong>98976 and 98984 CANNOT</strong> be billed in the same 30-day period (Respiratory full vs partial — pick one)</li>
                    <li>• <strong>98978 and 98986 CANNOT</strong> be billed in the same 30-day period (CBT full vs partial — pick one)</li>
                    <li>• <strong>98979 and 98980 CANNOT</strong> be billed in the same calendar month (10-19 min vs 20+ min — pick one)</li>
                    <li>• <strong>Treatment management codes</strong> (98979, 98980, 98981) require at least one real-time synchronous phone or video call with patient or caregiver. Text and email do NOT qualify.</li>
                    <li>• <strong>Only ONE clinician</strong> may submit RTM claims per patient per 30-day period</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <Upload className="text-emerald-600" size={24} />
                  <span className="hidden sm:inline">Export Reimbursement Codes — All Pathways</span>
                  <span className="sm:hidden">Export Billing</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  <span className="hidden sm:inline">Generate billing documentation for RTM, CCM, BHI, and APCM codes for your EHR/practice management system</span>
                  <span className="sm:hidden">Generate billing docs for your EHR</span>
                </p>
              </div>
              <Button
                onClick={handleExportCSV}
                className="bg-slate-800 hover:bg-emerald-600 text-white flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Export This Period</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </div>

            {/* Export Preview */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 sm:p-6 font-mono text-xs sm:text-sm text-emerald-400 overflow-x-auto">
              <pre className="whitespace-pre">
{`// CareSolis Reimbursement Export — ${new Date().toLocaleDateString()}
// RTM + CCM + BHI + APCM | CY 2026 CMS | All Active Pathways

${patients.filter(p => p.setupComplete).map(p => {
  const deviceCode = p.condition ? getDeviceSupplyCode(p.condition, p.daysWithData) : null;
  const managementCode = p.hasInteractiveCommunication
    ? (p.providerMinutes >= 20 ? '98980' : p.providerMinutes >= 10 ? '98979' : null)
    : null;

  let rtmTotal = 0;
  if (deviceCode) rtmTotal += CPT_CODES[deviceCode as keyof typeof CPT_CODES].amount;
  if (managementCode) rtmTotal += CPT_CODES[managementCode as keyof typeof CPT_CODES].amount;

  const conditionLabel = p.condition ? CONDITION_METADATA[p.condition].label : 'Unknown';
  const isFullEngagement = p.daysWithData >= 16;

  let output = `PATIENT: ${p.name} (MRN: ${p.mrn}) [${conditionLabel}]\n`;
  output += `  RTM:\n`;
  if (deviceCode) {
    const cpt = CPT_CODES[deviceCode as keyof typeof CPT_CODES];
    const threshold = isFullEngagement ? '16' : '2';
    output += `    CPT ${deviceCode} — $${cpt.amount.toFixed(2)} — ${cpt.label}, ${p.daysWithData}/${threshold} days — ${isFullEngagement ? 'full' : 'partial'}\n`;
  }
  if (managementCode) {
    const cpt = CPT_CODES[managementCode as keyof typeof CPT_CODES];
    output += `    CPT ${managementCode} — $${cpt.amount.toFixed(2)} — ${p.providerMinutes} min — ${managementCode === '98980' ? 'full' : 'partial'} management\n`;
  }
  if (!p.hasInteractiveCommunication && p.providerMinutes > 0) {
    output += `    ** BLOCKED: No interactive communication logged **\n`;
  }
  output += `  CCM:\n`;
  output += `    ** NOT ENROLLED — patient has not consented to CCM\n`;
  output += `  BHI:\n`;
  output += `    ** PATHWAY NOT ENABLED\n`;
  output += `  APCM:\n`;
  output += `    ** PATHWAY NOT ENABLED\n`;
  output += `  PATIENT TOTAL: $${rtmTotal.toFixed(2)}\n`;
  return output;
}).join('\n')}

PERIOD TOTAL: $${estimatedMonthlyReimbursement.toFixed(2)}

RTM SUBTOTAL:  $${estimatedMonthlyReimbursement.toFixed(2)}
CCM SUBTOTAL:  $0.00
BHI SUBTOTAL:  $0.00
APCM SUBTOTAL: $0.00`}
              </pre>
            </div>

            {/* Export Options */}
            <div className="mt-4 flex flex-wrap gap-3">
              <Button className="bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-2">
                <Download size={18} />
                Export as CSV
              </Button>
              <Button className="bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-2">
                <FileText size={18} />
                Export as PDF
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <FileText size={18} />
                Copy to Clipboard
              </Button>
            </div>

            <div className="mt-4 bg-sky-50 border border-sky-200 rounded-lg p-3">
              <p className="text-xs text-sky-800">
                <strong>Note:</strong> Export formatted for EHR/practice management system import. Verify all codes and documentation before claim submission.
              </p>
            </div>
          </div>
        )}

        {/* Revenue Calculator Tab */}
        {activeTab === 'revenue-calculator' && (
          <RevenueCalculator pathwaysEnabled={pathwaysEnabled} />
        )}

        {/* Billing Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                <Settings className="text-emerald-600" size={28} />
                Billing Pathways — Configure Your Practice
              </h2>
              <p className="text-sm text-slate-600">
                Enable the reimbursement pathways your practice qualifies for. Each pathway has specific provider type and documentation requirements.
              </p>
            </div>

            {/* Pathway Toggle Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* RTM Card */}
              <div className="border-2 border-emerald-500 bg-emerald-50 rounded-xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🩺</span>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">RTM — Remote Therapeutic Monitoring</h3>
                      <p className="text-xs text-emerald-700 font-semibold">ENABLED</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600">ON</span>
                    <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-not-allowed">
                      <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-700 mb-3">
                  Monitor medication adherence for MSK, respiratory, and cognitive behavioral conditions. Requires device data transmission and interactive communication.
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 bg-white rounded text-xs font-mono text-slate-700">98975</span>
                  <span className="px-2 py-1 bg-white rounded text-xs font-mono text-slate-700">98976</span>
                  <span className="px-2 py-1 bg-white rounded text-xs font-mono text-slate-700">98977</span>
                  <span className="px-2 py-1 bg-white rounded text-xs font-mono text-slate-700">98978</span>
                  <span className="px-2 py-1 bg-white rounded text-xs font-mono text-slate-700">98979</span>
                  <span className="px-2 py-1 bg-white rounded text-xs font-mono text-slate-700">98980</span>
                  <span className="px-2 py-1 bg-white rounded text-xs font-mono text-slate-700">98981</span>
                  <span className="px-2 py-1 bg-white rounded text-xs font-mono text-slate-700">98984-98986</span>
                </div>
                <p className="text-sm font-semibold text-emerald-700 mb-2">Revenue potential: $92-135/patient/month</p>
                <p className="text-xs text-slate-600">Eligible providers: MD, DO, NP, PA, PT, OT, SLP</p>
              </div>

              {/* CCM Card */}
              <div className={clsx(
                "border-2 rounded-xl p-6 transition-all",
                pathwaysEnabled.ccm
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 bg-white"
              )}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={clsx("text-3xl", !pathwaysEnabled.ccm && "opacity-50")}>🫀</span>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">CCM — Chronic Care Management</h3>
                      <p className={clsx(
                        "text-xs font-semibold",
                        pathwaysEnabled.ccm ? "text-blue-700" : "text-slate-500"
                      )}>
                        {pathwaysEnabled.ccm ? "ENABLED" : "DISABLED"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={clsx("text-xs", pathwaysEnabled.ccm ? "text-blue-600" : "text-slate-400")}>
                      {pathwaysEnabled.ccm ? "ON" : "OFF"}
                    </span>
                    <button
                      onClick={() => togglePathway('ccm')}
                      className={clsx(
                        "w-12 h-6 rounded-full relative cursor-pointer transition-all",
                        pathwaysEnabled.ccm ? "bg-blue-500" : "bg-slate-300"
                      )}
                    >
                      <div className={clsx(
                        "absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all",
                        pathwaysEnabled.ccm ? "right-0.5" : "left-0.5"
                      )}></div>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  Care coordination for patients with 2+ chronic conditions. 20+ minutes of management per month. Can be billed ALONGSIDE RTM for the same patient.
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-500">99490</span>
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-500">99439</span>
                </div>
                <p className="text-sm font-semibold text-slate-600 mb-2">Revenue potential: $74-128/patient/month</p>
                <p className="text-xs text-slate-500">Eligible providers: MD, DO, NP, PA (physician supervision required)</p>
                <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                  ⚠ Requires separate patient consent for CCM. Patient must have 2+ chronic conditions.
                </div>
              </div>

              {/* BHI Card */}
              <div className={clsx(
                "border-2 rounded-xl p-6 transition-all",
                pathwaysEnabled.bhi
                  ? "border-purple-500 bg-purple-50"
                  : "border-slate-200 bg-white"
              )}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={clsx("text-3xl", !pathwaysEnabled.bhi && "opacity-50")}>🧠</span>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">BHI — Behavioral Health Integration</h3>
                      <p className={clsx(
                        "text-xs font-semibold",
                        pathwaysEnabled.bhi ? "text-purple-700" : "text-slate-500"
                      )}>
                        {pathwaysEnabled.bhi ? "ENABLED" : "DISABLED"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={clsx("text-xs", pathwaysEnabled.bhi ? "text-purple-600" : "text-slate-400")}>
                      {pathwaysEnabled.bhi ? "ON" : "OFF"}
                    </span>
                    <button
                      onClick={() => togglePathway('bhi')}
                      className={clsx(
                        "w-12 h-6 rounded-full relative cursor-pointer transition-all",
                        pathwaysEnabled.bhi ? "bg-purple-500" : "bg-slate-300"
                      )}
                    >
                      <div className={clsx(
                        "absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all",
                        pathwaysEnabled.bhi ? "right-0.5" : "left-0.5"
                      )}></div>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  Behavioral health integration for patients with psychiatric conditions managed alongside medical care. 20+ minutes of BHI services per month.
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-500">99484</span>
                </div>
                <p className="text-sm font-semibold text-slate-600 mb-2">Revenue potential: $58.50/patient/month</p>
                <p className="text-xs text-slate-500">Eligible providers: MD, DO, NP, PA (must have behavioral health competency)</p>
                <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                  ⚠ Cannot bill with psychiatric collaborative care codes (99492-99494).
                </div>
              </div>

              {/* APCM Card */}
              <div className={clsx(
                "border-2 rounded-xl p-6 transition-all",
                pathwaysEnabled.apcm
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 bg-white"
              )}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={clsx("text-3xl", !pathwaysEnabled.apcm && "opacity-50")}>🏥</span>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">APCM — Advanced Primary Care Management</h3>
                      <p className={clsx(
                        "text-xs font-semibold",
                        pathwaysEnabled.apcm ? "text-indigo-700" : "text-slate-500"
                      )}>
                        {pathwaysEnabled.apcm ? "ENABLED" : "DISABLED"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={clsx("text-xs", pathwaysEnabled.apcm ? "text-indigo-600" : "text-slate-400")}>
                      {pathwaysEnabled.apcm ? "ON" : "OFF"}
                    </span>
                    <button
                      onClick={() => togglePathway('apcm')}
                      className={clsx(
                        "w-12 h-6 rounded-full relative cursor-pointer transition-all",
                        pathwaysEnabled.apcm ? "bg-indigo-500" : "bg-slate-300"
                      )}
                    >
                      <div className={clsx(
                        "absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all",
                        pathwaysEnabled.apcm ? "right-0.5" : "left-0.5"
                      )}></div>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  Primary care management for chronic conditions. Tiered by patient complexity. Designed for primary care practices with ongoing patient relationships.
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-500">G0556</span>
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-500">G0557</span>
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-500">G0558</span>
                </div>
                <p className="text-sm font-semibold text-slate-600 mb-2">Revenue potential: $15-117/patient/month</p>
                <p className="text-xs text-slate-500">Eligible providers: Primary care physicians, NPs, PAs</p>
                <div className="mt-3 p-2 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800">
                  ⚠ APCM and CCM are mutually exclusive for the same patient. Enable one or the other per patient.
                </div>
              </div>
            </div>

            {/* Summary Bar */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Active pathways:</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded">RTM</span>
                    {pathwaysEnabled.ccm && (
                      <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded">CCM</span>
                    )}
                    {pathwaysEnabled.bhi && (
                      <span className="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded">BHI</span>
                    )}
                    {pathwaysEnabled.apcm && (
                      <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded">APCM</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-700">Estimated revenue potential:</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    ${92 + (pathwaysEnabled.ccm ? 74 : 0) + (pathwaysEnabled.bhi ? 58 : 0) + (pathwaysEnabled.apcm ? 60 : 0)}-${135 + (pathwaysEnabled.ccm ? 128 : 0) + (pathwaysEnabled.bhi ? 58 : 0) + (pathwaysEnabled.apcm ? 117 : 0)}/patient/month
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enroll Patient Modal */}
      <EnrollPatientModal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        onEnroll={handleEnrollPatient}
        pathwaysEnabled={pathwaysEnabled}
      />
    </div>
  );
}
