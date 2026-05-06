import React, { useState } from 'react';
import { 
  Home, Shield, Users, CheckCircle2, ArrowRight, ArrowLeft, 
  AlertTriangle, Pill, Settings, FileCheck, Smartphone, Eye, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useUserRole } from '../context/UserRoleContext';
import { AccessDenied } from '../components/AccessDenied';
import { projectId, publicAnonKey } from '/utils/supabase/info';

/**
 * CARESOLIS PATIENT ONBOARDING PROTOCOL
 * 
 * FDA-Compliant Patient Activation System (SOURCE OF TRUTH)
 * - Creates patient profile in backend KV store (patient:{id}:profile)
 * - Initializes Care Circle with escalation hierarchy
 * - Records cryptographically signed legal acknowledgments (immutable audit log)
 * - Provisions device configuration
 * - Enrolls patient in RPM billing program
 * - Sets timezone during onboarding (TIER 1 timezone SOT)
 * 
 * Addresses Red Team Concerns:
 * - V.1: Configuration complexity → Guided process prevents misconfiguration
 * - Legal Liability: Captures cryptographically signed disclaimer acknowledgment
 * - Acquisition Readiness: Demonstrates mature UX and risk mitigation
 * 
 * FDA Compliance Features:
 * - Required legal disclaimer acknowledgment (prevents reliance claims)
 * - Time-critical medication defaults (medically conservative)
 * - Care Circle escalation hierarchy validation
 * - Audit log of setup completion with signature
 * 
 * RBAC: ADMIN-ONLY ACCESS
 * - Only administrators can run Patient Onboarding Protocol
 * - Caregivers cannot modify system configuration
 */

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;

type SetupStep = 
  | 'welcome'
  | 'legal-disclaimers'
  | 'household-info'
  | 'care-circle'
  | 'device-installation'
  | 'medication-defaults'
  | 'review'
  | 'complete';

interface HouseholdInfo {
  name: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  timezone: string;
}

interface CareCircleMember {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  escalationLevel: 1 | 2 | 3;
  role: 'admin' | 'caregiver'; // Permission level (independent of escalation)
}

interface LegalAcknowledgment {
  supportToolAcknowledged: boolean;
  opticalLimitationAcknowledged: boolean;
  escalationLimitationAcknowledged: boolean;
  clinicalDecisionAcknowledged: boolean;
  independentMonitoringAcknowledged: boolean;
  advisoryOnlyAcknowledged: boolean;
  signatureName: string;
  signatureDate: string;
}

export default function SetupWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<SetupStep>('welcome');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPatientId, setNewPatientId] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState('');
  
  const [householdInfo, setHouseholdInfo] = useState<HouseholdInfo>({
    name: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    timezone: 'America/Los_Angeles'
  });
  const [careCircle, setCareCircle] = useState<CareCircleMember[]>([
    { name: '', relationship: '', phone: '', email: '', escalationLevel: 1, role: 'caregiver' }
  ]);
  const [legalAck, setLegalAck] = useState<LegalAcknowledgment>({
    supportToolAcknowledged: false,
    opticalLimitationAcknowledged: false,
    escalationLimitationAcknowledged: false,
    clinicalDecisionAcknowledged: false,
    independentMonitoringAcknowledged: false,
    advisoryOnlyAcknowledged: false,
    signatureName: '',
    signatureDate: new Date().toISOString().split('T')[0] // Default to today
  });

  const steps: Array<{ id: SetupStep; title: string; icon: React.ElementType }> = [
    { id: 'welcome', title: 'Welcome', icon: Home },
    { id: 'legal-disclaimers', title: 'Legal Disclaimers', icon: Shield },
    { id: 'household-info', title: 'Household Info', icon: Home },
    { id: 'care-circle', title: 'Care Circle', icon: Users },
    { id: 'device-installation', title: 'Device Setup', icon: Smartphone },
    { id: 'medication-defaults', title: 'Medication Defaults', icon: Pill },
    { id: 'review', title: 'Review', icon: FileCheck },
    { id: 'complete', title: 'Complete', icon: CheckCircle2 }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 'legal-disclaimers':
        return Object.values(legalAck).every(v => v === true || (typeof v === 'string' && v.length > 0));
      case 'household-info':
        return householdInfo.name && householdInfo.dateOfBirth && householdInfo.address && householdInfo.city && householdInfo.state && householdInfo.zip;
      case 'care-circle':
        return careCircle.some(m => m.name && m.phone);
      default:
        return true;
    }
  };

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const addCareCircleMember = () => {
    setCareCircle([...careCircle, { 
      name: '', 
      relationship: '', 
      phone: '', 
      email: '', 
      escalationLevel: (careCircle.length + 1) as 1 | 2 | 3,
      role: 'caregiver'
    }]);
  };

  /**
   * CRITICAL: Complete Onboarding and Create Patient in Backend
   * This is the SOURCE OF TRUTH for patient data
   */
  const completeSetup = async () => {
    setIsSubmitting(true);
    
    try {
      console.log('[ONBOARDING] 🚀 Starting patient onboarding protocol...');
      
      const onboardingPayload = {
        household: householdInfo,
        careCircle: careCircle.filter(m => m.name && m.phone), // Only include filled members
        legalAcknowledgments: legalAck,
        deviceId: deviceId || undefined,
        medicationDefaults: {
          schedule: ['09:00', '21:00'], // Conservative 2x daily default
        }
      };

      console.log('[ONBOARDING] 📦 Payload:', {
        patientName: householdInfo.name,
        careCircleSize: onboardingPayload.careCircle.length,
        hasDeviceId: !!deviceId,
        timezone: householdInfo.timezone,
        address: `${householdInfo.city}, ${householdInfo.state}`
      });

      const response = await fetch(`${SERVER_URL}/api/onboarding/create-patient`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(onboardingPayload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      
      console.log('[ONBOARDING] ✅ Patient created successfully:', {
        patientId: result.patientId,
        name: result.profile?.name
      });

      setNewPatientId(result.patientId);
      toast.success(`Patient ${householdInfo.name} onboarded successfully!`);
      setCurrentStep('complete');

    } catch (error) {
      console.error('[ONBOARDING] ❌ Error during onboarding:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to onboard patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  // RBAC: Only admins can access Setup Wizard
  const { isAdmin } = useUserRole();

  if (!isAdmin) {
    return <AccessDenied message="Only administrators can run the Patient Onboarding Protocol. This tool creates new patient records and configures the entire system. Contact your system administrator for assistance." />;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Progress Bar */}
      <div className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Shield size={24} className="text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100">Patient Onboarding Protocol</h1>
                <p className="text-sm text-slate-400">Step {currentStepIndex + 1} of {steps.length}: {steps[currentStepIndex].title}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-400">{Math.round(progress)}%</div>
              <div className="text-xs text-slate-400">Complete</div>
            </div>
          </div>
          
          {/* Progress Track */}
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between mt-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === currentStepIndex;
              const isComplete = idx < currentStepIndex;
              
              return (
                <div key={step.id} className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isComplete ? 'bg-emerald-500 text-white' :
                    isActive ? 'bg-blue-600 text-white ring-4 ring-blue-500/20' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {isComplete ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                  </div>
                  <div className={`text-xs font-medium ${
                    isActive ? 'text-blue-400' : isComplete ? 'text-emerald-400' : 'text-slate-500'
                  }`}>
                    {step.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* STEP 1: WELCOME */}
            {currentStep === 'welcome' && (
              <div className="bg-slate-900 rounded-2xl shadow-lg p-12 text-center border border-slate-700">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Home size={40} className="text-white" />
                </div>
                <h2 className="text-4xl font-bold text-slate-100 mb-4">Welcome to Caresolis</h2>
                <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
                  A calm, infrastructure-grade interaction visibility system for aging households. 
                  We'll guide you through setup in just a few minutes.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="p-6 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <Shield size={32} className="text-blue-400 mx-auto mb-3" />
                    <h3 className="font-bold text-slate-100 mb-2">Privacy First</h3>
                    <p className="text-sm text-slate-400">No cameras, no audio recording, local processing</p>
                  </div>
                  <div className="p-6 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <Users size={32} className="text-emerald-400 mx-auto mb-3" />
                    <h3 className="font-bold text-slate-100 mb-2">Care Circle</h3>
                    <p className="text-sm text-slate-400">Trusted contacts with tiered escalation</p>
                  </div>
                  <div className="p-6 bg-rose-500/10 rounded-xl border border-rose-500/20">
                    <Pill size={32} className="text-rose-400 mx-auto mb-3" />
                    <h3 className="font-bold text-slate-100 mb-2">Medication Support</h3>
                    <p className="text-sm text-slate-400">2×25 pharmacy blister pack system with triple IR gate detection</p>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl p-6 mb-8">
                  <div className="flex items-start gap-3">
                    <Eye size={24} className="text-yellow-400 flex-shrink-0 mt-1" />
                    <div className="text-left">
                      <h3 className="font-bold text-yellow-300 mb-2">Setup Time: ~10 minutes</h3>
                      <p className="text-sm text-yellow-400/90">
                        You'll need: Household information, Care Circle contacts (2-3 people), 
                        and your device serial number.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: LEGAL DISCLAIMERS (CRITICAL FOR LIABILITY) */}
            {currentStep === 'legal-disclaimers' && (
              <div className="bg-slate-900 rounded-2xl shadow-lg p-8 border border-slate-700">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-rose-100 rounded-xl">
                    <Shield size={32} className="text-rose-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">Required Legal Acknowledgments</h2>
                    <p className="text-slate-600">Please read and acknowledge each disclaimer</p>
                  </div>
                </div>

                <div className="bg-rose-50 border-2 border-rose-600 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle size={24} className="text-rose-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-rose-900 text-lg mb-2">CRITICAL LEGAL NOTICE</h3>
                      <p className="text-sm text-rose-800">
                        These acknowledgments are <strong>required by law</strong> and protect both you and Caresolis. 
                        Your signature will be stored in an immutable audit log with cryptographic timestamp.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {/* Acknowledgment 1 */}
                  <div className="border-2 border-slate-200 rounded-xl p-6 hover:border-blue-400 transition-all">
                    <label className="flex items-start gap-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={legalAck.supportToolAcknowledged}
                        onChange={(e) => setLegalAck({...legalAck, supportToolAcknowledged: e.target.checked})}
                        className="mt-1 w-5 h-5 text-blue-600 rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 mb-2">1. CareSolis is an FDA Class II Medical Device (Open-Loop Monitoring)</h4>
                        <p className="text-sm text-slate-700">
                          I understand that CareSolis is an <strong>FDA Class II medication adherence monitoring device</strong> (open-loop, non-automated). 
                          It does NOT automatically dispense medication, adjust dosages, or replace medical judgment. 
                          <strong className="text-rose-700"> All adherence records are created by physical device IR sensor detection only. 
                          Care Circle members cannot manually clear or acknowledge escalations.</strong>
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Acknowledgment 2 */}
                  <div className="border-2 border-slate-200 rounded-xl p-6 hover:border-blue-400 transition-all">
                    <label className="flex items-start gap-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={legalAck.opticalLimitationAcknowledged}
                        onChange={(e) => setLegalAck({...legalAck, opticalLimitationAcknowledged: e.target.checked})}
                        className="mt-1 w-5 h-5 text-blue-600 rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 mb-2">2. Optical Confirmation ≠ Ingestion Verification</h4>
                        <p className="text-sm text-slate-700">
                          I understand that optical sensors confirm <strong>medication removal from compartments</strong>, 
                          NOT actual ingestion. The system <strong className="text-rose-700">cannot verify if medication was swallowed</strong>, 
                          discarded, or taken by someone else. I will independently verify adherence.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Acknowledgment 3 */}
                  <div className="border-2 border-slate-200 rounded-xl p-6 hover:border-blue-400 transition-all">
                    <label className="flex items-start gap-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={legalAck.escalationLimitationAcknowledged}
                        onChange={(e) => setLegalAck({...legalAck, escalationLimitationAcknowledged: e.target.checked})}
                        className="mt-1 w-5 h-5 text-blue-600 rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 mb-2">3. Network-Based Escalations May Fail</h4>
                        <p className="text-sm text-slate-700">
                          I acknowledge that notifications depend on network connectivity (WiFi/LTE), which 
                          <strong className="text-rose-700"> cannot be guaranteed 100% of the time</strong>. 
                          Device malfunctions, power failures, or network outages may prevent notifications. 
                          I will maintain independent monitoring protocols.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Acknowledgment 4 */}
                  <div className="border-2 border-slate-200 rounded-xl p-6 hover:border-blue-400 transition-all">
                    <label className="flex items-start gap-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={legalAck.clinicalDecisionAcknowledged}
                        onChange={(e) => setLegalAck({...legalAck, clinicalDecisionAcknowledged: e.target.checked})}
                        className="mt-1 w-5 h-5 text-blue-600 rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 mb-2">4. NOT a Clinical Decision Support System</h4>
                        <p className="text-sm text-slate-700">
                          I understand that Caresolis <strong>does NOT provide clinical decision support</strong>, 
                          treatment recommendations, or diagnostic capabilities. All physician notifications are 
                          <strong className="text-blue-700"> informational only</strong>.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Acknowledgment 5 */}
                  <div className="border-2 border-slate-200 rounded-xl p-6 hover:border-blue-400 transition-all">
                    <label className="flex items-start gap-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={legalAck.independentMonitoringAcknowledged}
                        onChange={(e) => setLegalAck({...legalAck, independentMonitoringAcknowledged: e.target.checked})}
                        className="mt-1 w-5 h-5 text-blue-600 rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 mb-2">5. Independent Monitoring Required</h4>
                        <p className="text-sm text-slate-700">
                          I agree to <strong className="text-rose-700">maintain independent monitoring protocols</strong> and 
                          will not rely solely on Caresolis notifications for time-critical medication adherence.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Acknowledgment 6 */}
                  <div className="border-2 border-slate-200 rounded-xl p-6 hover:border-blue-400 transition-all">
                    <label className="flex items-start gap-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={legalAck.advisoryOnlyAcknowledged}
                        onChange={(e) => setLegalAck({...legalAck, advisoryOnlyAcknowledged: e.target.checked})}
                        className="mt-1 w-5 h-5 text-blue-600 rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 mb-2">6. Notifications Are Advisory Only</h4>
                        <p className="text-sm text-slate-700">
                          I acknowledge that all Caresolis notifications are <strong className="text-blue-700">advisory only</strong> and 
                          do not constitute medical advice. All medical decisions remain the responsibility of qualified healthcare providers.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Signature Field */}
                <div className="bg-slate-50 border-2 border-slate-300 rounded-xl p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Digital Signature</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Full Legal Name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={legalAck.signatureName}
                        onChange={(e) => setLegalAck({...legalAck, signatureName: e.target.value})}
                        placeholder="Enter your full legal name"
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Date <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="date"
                        value={legalAck.signatureDate}
                        onChange={(e) => setLegalAck({...legalAck, signatureDate: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <strong>Legal Notice:</strong> By signing, you confirm understanding of system limitations. 
                      This acknowledgment will be stored in an immutable audit log with SHA-256 cryptographic timestamp 
                      to prevent reliance claims under product liability law.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: HOUSEHOLD INFO */}
            {currentStep === 'household-info' && (
              <div className="bg-slate-900 rounded-2xl shadow-lg p-8 border border-slate-700">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Home size={32} className="text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-50">Patient Information</h2>
                    <p className="text-slate-400">Basic demographics and location</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Full Legal Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={householdInfo.name}
                      onChange={(e) => setHouseholdInfo({...householdInfo, name: e.target.value})}
                      placeholder="e.g., Margaret Louise Thompson"
                      className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Date of Birth <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={householdInfo.dateOfBirth}
                      onChange={(e) => setHouseholdInfo({...householdInfo, dateOfBirth: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Street Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={householdInfo.address}
                      onChange={(e) => setHouseholdInfo({...householdInfo, address: e.target.value})}
                      placeholder="e.g., 123 Oak Street"
                      className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        City <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={householdInfo.city}
                        onChange={(e) => setHouseholdInfo({...householdInfo, city: e.target.value})}
                        placeholder="e.g., San Francisco"
                        className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        State <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={householdInfo.state}
                        onChange={(e) => setHouseholdInfo({...householdInfo, state: e.target.value})}
                        placeholder="e.g., CA"
                        maxLength={2}
                        className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      ZIP Code <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={householdInfo.zip}
                      onChange={(e) => setHouseholdInfo({...householdInfo, zip: e.target.value})}
                      placeholder="e.g., 94102"
                      maxLength={10}
                      className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Timezone <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={householdInfo.timezone}
                      onChange={(e) => setHouseholdInfo({...householdInfo, timezone: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    >
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Phoenix">Arizona (MST - no DST)</option>
                      <option value="America/Anchorage">Alaska Time (AKT)</option>
                      <option value="Pacific/Honolulu">Hawaii Time (HST)</option>
                    </select>
                    <p className="mt-2 text-xs text-slate-400">
                      🌍 Timezone is critical for medication scheduling and will be verified during setup
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-emerald-500/10 rounded-lg border-l-4 border-emerald-500">
                  <p className="text-sm text-emerald-300">
                    <strong>Privacy & Security:</strong> All patient data is encrypted at rest and in transit. 
                    Only authorized Care Circle members can access this information.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 4: CARE CIRCLE */}
            {currentStep === 'care-circle' && (
              <div className="bg-slate-900 rounded-2xl shadow-lg p-8 border border-slate-700">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <Users size={32} className="text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">Care Circle Setup</h2>
                    <p className="text-slate-600">Add trusted contacts with escalation hierarchy</p>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800 mb-3">
                    <strong>Escalation Levels:</strong> Level 1 contacts are notified FIRST (fastest response). 
                    If they don't respond within 15 minutes, Level 2 is notified, then Level 3. 
                    Level 3 is often the ultimate authority (e.g., healthcare POA, doctor).
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>Admin Role:</strong> Only admins can change medication schedules and system settings. 
                    Caregiver role can view data and add journal entries but cannot modify configurations. 
                    We recommend 2-3 contacts minimum with at least 1 admin.
                  </p>
                </div>

                <div className="space-y-6">
                  {careCircle.map((member, idx) => (
                    <div key={idx} className="p-6 border-2 border-slate-200 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900">Contact {idx + 1}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          member.escalationLevel === 1 ? 'bg-emerald-100 text-emerald-700' :
                          member.escalationLevel === 2 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          Level {member.escalationLevel} Escalation
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => {
                              const updated = [...careCircle];
                              updated[idx].name = e.target.value;
                              setCareCircle(updated);
                            }}
                            placeholder="e.g., Sarah Thompson"
                            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Relationship</label>
                          <input
                            type="text"
                            value={member.relationship}
                            onChange={(e) => {
                              const updated = [...careCircle];
                              updated[idx].relationship = e.target.value;
                              setCareCircle(updated);
                            }}
                            placeholder="e.g., Daughter"
                            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                          <input
                            type="tel"
                            value={member.phone}
                            onChange={(e) => {
                              const updated = [...careCircle];
                              updated[idx].phone = e.target.value;
                              setCareCircle(updated);
                            }}
                            placeholder="(555) 123-4567"
                            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                          <input
                            type="email"
                            value={member.email}
                            onChange={(e) => {
                              const updated = [...careCircle];
                              updated[idx].email = e.target.value;
                              setCareCircle(updated);
                            }}
                            placeholder="sarah@example.com"
                            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 outline-none"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Permission Level
                          </label>
                          <select
                            value={member.role}
                            onChange={(e) => {
                              const updated = [...careCircle];
                              updated[idx].role = e.target.value as 'admin' | 'caregiver';
                              setCareCircle(updated);
                            }}
                            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 outline-none"
                          >
                            <option value="caregiver">Caregiver (View-only, add journal entries)</option>
                            <option value="admin">Admin (Full configuration access)</option>
                          </select>
                          <p className="text-xs text-slate-600 mt-2">
                            {member.role === 'admin' 
                              ? '✓ Can configure medications, manage Care Circle, access billing'
                              : '✓ Can view data, receive notifications, add journal entries (no configuration access)'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {careCircle.length < 5 && (
                    <button
                      onClick={addCareCircleMember}
                      className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all font-semibold"
                    >
                      + Add Another Contact
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5: DEVICE INSTALLATION */}
            {currentStep === 'device-installation' && (
              <div className="bg-slate-900 rounded-2xl shadow-lg p-8 border border-slate-700">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Smartphone size={32} className="text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">Device Installation Guide</h2>
                    <p className="text-slate-600">Follow these steps to install your Solis device</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4 p-6 bg-slate-50 rounded-xl border-l-4 border-blue-600">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2">Unbox and Position Device</h3>
                      <p className="text-sm text-slate-700">
                        Place the Solis on a stable surface (kitchen counter, bedroom nightstand) within WiFi range. 
                        Ensure the front panel is easily visible and accessible.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-6 bg-slate-50 rounded-xl border-l-4 border-blue-600">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2">Connect Power</h3>
                      <p className="text-sm text-slate-700">
                        Plug the power adapter into the device and a wall outlet. The LED indicator will turn blue, 
                        indicating power-on. Battery backup will charge automatically (4-6 hours for full charge).
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-6 bg-slate-50 rounded-xl border-l-4 border-blue-600">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2">Connect to WiFi</h3>
                      <p className="text-sm text-slate-700 mb-3">
                        Press and hold the "Setup" button on the back panel for 3 seconds. The device will enter pairing mode (blinking blue LED).
                      </p>
                      <div className="p-4 bg-white border-2 border-slate-200 rounded-lg">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">WiFi Network Name</label>
                        <input
                          type="text"
                          placeholder="Enter your WiFi network name"
                          className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg mb-3"
                        />
                        <label className="block text-sm font-semibold text-slate-700 mb-2">WiFi Password</label>
                        <input
                          type="password"
                          placeholder="Enter WiFi password"
                          className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 p-6 bg-slate-50 rounded-xl border-l-4 border-blue-600">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 mb-2">Verify Connection & Record Device ID</h3>
                      <p className="text-sm text-slate-700 mb-3">
                        Once connected, the LED will turn solid green. The device will display its unique Device ID on the screen.
                      </p>
                      <div className="p-4 bg-white border-2 border-slate-200 rounded-lg">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Device ID (Optional)
                        </label>
                        <input
                          type="text"
                          value={deviceId}
                          onChange={(e) => setDeviceId(e.target.value)}
                          placeholder="e.g., SOL-2024-A1B2C3"
                          className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 outline-none"
                        />
                        <p className="text-xs text-slate-600 mt-2">
                          📱 Enter the Device ID shown on the Solis screen for device provisioning
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-600">
                  <p className="text-sm text-emerald-800">
                    <strong>Dual Connectivity:</strong> The Solis includes LTE backup. If WiFi fails, the device automatically 
                    switches to cellular connectivity to ensure uninterrupted operation.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 6: MEDICATION DEFAULTS */}
            {currentStep === 'medication-defaults' && (
              <div className="bg-slate-900 rounded-2xl shadow-lg p-8 border border-slate-700">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-rose-100 rounded-xl">
                    <Pill size={32} className="text-rose-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">Medication Safety Defaults</h2>
                    <p className="text-slate-600">Conservative settings for time-critical medications</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-600 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={24} className="text-yellow-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-yellow-900 mb-2">Medically Conservative Defaults</h3>
                      <p className="text-sm text-yellow-800">
                        To prevent dangerous misconfigurations, Caresolis applies conservative defaults for time-critical medications. 
                        These settings prioritize patient safety and can be adjusted later by authorized users.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-6 bg-slate-50 rounded-xl border-l-4 border-rose-600">
                    <h3 className="font-bold text-slate-900 mb-3">Time-Critical Medication Categories</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                        <div>
                          <div className="font-semibold text-slate-900">Warfarin (Anticoagulant)</div>
                          <div className="text-sm text-slate-600">Blood thinner - timing critical</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-rose-600">±15 min window</div>
                          <div className="text-xs text-slate-600">Locked preset</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                        <div>
                          <div className="font-semibold text-slate-900">Insulin (Diabetes)</div>
                          <div className="text-sm text-slate-600">Blood sugar control - timing critical</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-rose-600">±15 min window</div>
                          <div className="text-xs text-slate-600">Locked preset</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                        <div>
                          <div className="font-semibold text-slate-900">Cardiac Medications</div>
                          <div className="text-sm text-slate-600">Heart rhythm control</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-rose-600">±30 min window</div>
                          <div className="text-xs text-slate-600">Locked preset</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                        <div>
                          <div className="font-semibold text-slate-900">General Medications</div>
                          <div className="text-sm text-slate-600">Standard adherence support</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-blue-600">±2 hour window</div>
                          <div className="text-xs text-slate-600">Adjustable</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-blue-50 rounded-xl border-l-4 border-blue-600">
                    <h3 className="font-bold text-blue-900 mb-2">Escalation Timing</h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li>• <strong>Level 1:</strong> Primary contact notified if dose missed by 5 minutes</li>
                      <li>• <strong>Level 2:</strong> Secondary contact notified after 15 minutes (no Level 1 response)</li>
                      <li>• <strong>Level 3:</strong> Tertiary contact notified after 30 minutes (no Level 2 response)</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-600">
                  <p className="text-sm text-emerald-800">
                    <strong>Customization Later:</strong> You can adjust these settings for specific medications in the 
                    Medication Hub after setup is complete. Time-critical medication windows are locked to prevent accidental 
                    changes that could compromise patient safety.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 7: REVIEW */}
            {currentStep === 'review' && (
              <div className="bg-slate-900 rounded-2xl shadow-lg p-8 border border-slate-700">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <FileCheck size={32} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">Review Your Setup</h2>
                    <p className="text-slate-600">Please verify all information before activating</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Household Info Summary */}
                  <div className="p-6 bg-slate-800 rounded-xl border-2 border-slate-700">
                    <h3 className="font-bold text-slate-50 mb-4 flex items-center gap-2">
                      <Home size={20} className="text-emerald-400" />
                      Patient Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-slate-400">Full Name</div>
                        <div className="font-semibold text-slate-100">{householdInfo.name || 'Not provided'}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Date of Birth</div>
                        <div className="font-semibold text-slate-100">{householdInfo.dateOfBirth || 'Not provided'}</div>
                      </div>
                      <div className="md:col-span-2">
                        <div className="text-slate-400">Address</div>
                        <div className="font-semibold text-slate-100">
                          {householdInfo.address || 'Not provided'}
                          {householdInfo.city && householdInfo.state && (
                            <div className="mt-1">
                              {householdInfo.city}, {householdInfo.state} {householdInfo.zip}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400">Timezone</div>
                        <div className="font-semibold text-emerald-400">{householdInfo.timezone}</div>
                      </div>
                      {deviceId && (
                        <div>
                          <div className="text-slate-400">Device ID</div>
                          <div className="font-semibold text-slate-100 font-mono">{deviceId}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Care Circle Summary */}
                  <div className="p-6 bg-slate-800 rounded-xl border-2 border-slate-700">
                    <h3 className="font-bold text-slate-50 mb-4 flex items-center gap-2">
                      <Users size={20} className="text-emerald-400" />
                      Care Circle ({careCircle.filter(m => m.name).length} contacts)
                    </h3>
                    <div className="space-y-3">
                      {careCircle.filter(m => m.name).map((member, idx) => (
                        <div key={idx} className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-slate-100">{member.name}</div>
                            <div className="flex gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                member.escalationLevel === 1 ? 'bg-emerald-500/20 text-emerald-400' :
                                member.escalationLevel === 2 ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-rose-500/20 text-rose-400'
                              }`}>
                                Level {member.escalationLevel}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                member.role === 'admin' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'
                              }`}>
                                {member.role === 'admin' ? 'Admin' : 'Caregiver'}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-slate-400 space-y-1">
                            <div>{member.relationship}</div>
                            <div>{member.phone}</div>
                            <div>{member.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Legal Acknowledgment Summary */}
                  <div className="p-6 bg-emerald-500/10 rounded-xl border-2 border-emerald-500/50">
                    <h3 className="font-bold text-emerald-300 mb-4 flex items-center gap-2">
                      <Shield size={20} />
                      Legal Acknowledgment Signed
                    </h3>
                    <div className="text-sm text-emerald-200">
                      <div className="mb-2"><strong>Signed by:</strong> {legalAck.signatureName}</div>
                      <div className="mb-4"><strong>Date:</strong> {legalAck.signatureDate}</div>
                      <div className="space-y-1 text-xs">
                        <div>✓ Acknowledged: FDA Class II device (open-loop monitoring)</div>
                        <div>✓ Acknowledged: Device-driven architecture (IR sensor only)</div>
                        <div>✓ Acknowledged: Optical confirmation ≠ ingestion verification</div>
                        <div>✓ Acknowledged: Network-based escalations may fail</div>
                        <div>✓ Acknowledged: Not a clinical decision support system</div>
                        <div>✓ Acknowledged: Independent monitoring required</div>
                        <div>✓ Acknowledged: Notifications are advisory only</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-emerald-500/10 border-2 border-emerald-500 rounded-xl">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={24} className="text-emerald-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-bold text-emerald-300 mb-2">Ready to Activate Patient</h3>
                      <p className="text-sm text-emerald-200 mb-4">
                        By clicking "Activate Patient," you confirm that all information is accurate and you've reviewed the legal acknowledgments.
                        This will create the patient record in the secure database (single source of truth).
                      </p>
                      <button
                        onClick={completeSetup}
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={20} className="animate-spin" />
                            Creating Patient Record...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={20} />
                            Activate Patient & Save to Database
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 8: COMPLETE */}
            {currentStep === 'complete' && (
              <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-2xl shadow-2xl p-12 text-center border-2 border-emerald-500">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <CheckCircle2 size={56} className="text-emerald-600" />
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">Patient Activated Successfully!</h2>
                <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
                  {householdInfo.name} has been onboarded and activated in the CareSolis system.
                  All patient data, Care Circle contacts, and legal acknowledgments have been saved to the secure database.
                </p>
                
                {newPatientId && (
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-8 inline-block">
                    <div className="text-xs text-emerald-200 uppercase tracking-wider mb-2">Patient ID</div>
                    <div className="text-2xl font-mono font-bold text-white mb-1">{newPatientId}</div>
                    <div className="text-xs text-emerald-300">Saved to database as single source of truth</div>
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <CheckCircle2 size={32} className="text-emerald-300 mx-auto mb-3" />
                    <h3 className="font-bold text-white mb-2">Legal Acknowledgment</h3>
                    <p className="text-sm text-emerald-200">Cryptographically signed</p>
                  </div>
                  <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <Users size={32} className="text-emerald-300 mx-auto mb-3" />
                    <h3 className="font-bold text-white mb-2">Care Circle</h3>
                    <p className="text-sm text-emerald-200">{careCircle.filter(m => m.name).length} contacts configured</p>
                  </div>
                  <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <Pill size={32} className="text-emerald-300 mx-auto mb-3" />
                    <h3 className="font-bold text-white mb-2">RPM Enrolled</h3>
                    <p className="text-sm text-emerald-200">Ready for billing</p>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => navigate('/patient-profile')}
                    className="px-6 py-3 bg-white text-emerald-600 font-bold rounded-lg hover:bg-emerald-50 transition-all shadow-lg"
                  >
                    View Patient Profile
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-lg"
                  >
                    Go to Dashboard
                  </button>
                </div>
                
                <div className="mt-6 text-sm text-emerald-200">
                  <strong>Next Steps:</strong> Configure medications in Medication Hub, test device connectivity
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {currentStep !== 'welcome' && currentStep !== 'complete' && (
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={prevStep}
              className="flex items-center gap-2 px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-all"
            >
              <ArrowLeft size={20} />
              Back
            </button>

            {currentStep !== 'review' ? (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all ${
                  canProceed()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                Continue
                <ArrowRight size={20} />
              </button>
            ) : null}
          </div>
        )}

        {/* Get Started Button (Welcome Step Only) */}
        {currentStep === 'welcome' && (
          <div className="text-center mt-8">
            <button
              onClick={nextStep}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Get Started
              <ArrowRight size={24} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}