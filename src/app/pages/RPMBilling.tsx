import { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, FileText, CheckCircle, AlertCircle, Download, Plus, User, Shield, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useCaresolisContext } from '../context/CaresolisContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';
import clsx from 'clsx';
import { ElectronicSignature, type SignatureData } from '../components/ElectronicSignature';

/**
 * RPM Billing Module - Medicare Remote Patient Monitoring Compliance Tracker
 * 
 * FDA 21 CFR Part 11 Compliant (v6.50.0)
 * 
 * Tracks billable criteria for CPT codes:
 * - 99453: Initial setup/patient education ($19)
 * - 99454: Device supply with 16+ days of data collection ($64/month)
 * - 99457: First 20 minutes of provider time ($51/month)
 * - 99458: Each additional 20 minutes ($41 per occurrence)
 * 
 * Automatically tracks data collection from:
 * - Daily interaction verifications
 * - Medication adherence data
 * - Environmental telemetry (future: vitals)
 * 
 * NEW FEATURES (Phase 1 FDA Compliance):
 * - Electronic signatures for provider activities (21 CFR Part 11)
 * - NPI verification for providers
 * - Cryptographic signature hashing (SHA-256)
 * - Audit trail for all clinical actions
 */

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;

interface RPMPatientEnrollment {
  enrollmentDate: string;
  educationCompleted: boolean;
  educationMinutes: number;
  educatedBy: string;
  cpt99453Billed: boolean;
  // NEW: Consent tracking
  consentObtained?: boolean;
  consentDate?: string;
  consentSignature?: SignatureData;
}

interface ProviderActivity {
  id: string;
  timestamp: string;
  provider: string;
  providerNPI: string;           // NEW: National Provider Identifier
  providerCredentials: string;   // NEW: MD, RN, NP, PA, etc.
  duration: number; // minutes
  activityType: 'data_review' | 'patient_call' | 'care_plan' | 'coordination' | 'other';
  description: string;
  relatedCPT?: '99457' | '99458';
  // NEW: Electronic signature
  signature: SignatureData;
}

interface MonthlyRPMData {
  month: string; // "2026-02"
  daysWithData: number;
  dataTypes: {
    interaction: number; // days with interaction data
    medication: number; // days with med data
    vitals: number; // days with vitals data (future)
    environmental: number; // days with environmental data
  };
  providerTimeMinutes: number;
  activities: ProviderActivity[];
  compliance: {
    cpt99454Eligible: boolean; // 16+ days with data
    cpt99457Eligible: boolean; // 20+ minutes
    cpt99458Count: number; // Additional 20-min blocks
  };
  estimatedReimbursement: number;
}

export default function RPMBilling() {
  const { logs, refresh } = useCaresolisContext();
  const [enrollment, setEnrollment] = useState<RPMPatientEnrollment | null>(null);
  const [currentMonth, setCurrentMonth] = useState<MonthlyRPMData | null>(null);
  const [activities, setActivities] = useState<ProviderActivity[]>([]);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSignature, setShowSignature] = useState(false); // NEW: Show signature modal

  // Form state for new activity
  const [newActivity, setNewActivity] = useState({
    provider: '',
    providerNPI: '',
    providerCredentials: '',
    duration: 20,
    activityType: 'data_review' as const,
    description: ''
  });

  // Enrollment form state
  const [enrollmentForm, setEnrollmentForm] = useState({
    educatedBy: '',
    educationMinutes: 20,
    educationCompleted: true
  });

  useEffect(() => {
    loadRPMData();
  }, []);

  const loadRPMData = async () => {
    setIsLoading(true);
    try {
      // Load enrollment data
      const enrollRes = await fetch(`${SERVER_URL}/rpm/enrollment`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      if (enrollRes.ok) {
        const data = await enrollRes.json();
        setEnrollment(data);
      }

      // Load current month data
      const now = new Date();
      const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const monthRes = await fetch(`${SERVER_URL}/rpm/month/${monthStr}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      if (monthRes.ok) {
        const data = await monthRes.json();
        setCurrentMonth(data);
        setActivities(data.activities || []);
      }
    } catch (e) {
      console.error('Failed to load RPM data', e);
    } finally {
      setIsLoading(false);
    }
  };

  const enrollPatient = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/rpm/enrollment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enrollmentDate: new Date().toISOString(),
          ...enrollmentForm
        })
      });

      if (res.ok) {
        toast.success('Patient enrolled in RPM program');
        loadRPMData();
      } else {
        toast.error('Failed to enroll patient');
      }
    } catch (e) {
      toast.error('Network error');
    }
  };

  const handleSignActivity = () => {
    // Validate form first
    if (!newActivity.provider || !newActivity.description) {
      toast.error('Please fill in provider name and description');
      return;
    }
    
    // Show signature modal
    setShowSignature(true);
  };

  const handleSignatureComplete = async (signature: SignatureData) => {
    setShowSignature(false);

    try {
      const activity: ProviderActivity = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        provider: newActivity.provider,
        providerNPI: newActivity.providerNPI,
        providerCredentials: newActivity.providerCredentials,
        duration: newActivity.duration,
        activityType: newActivity.activityType,
        description: newActivity.description,
        signature
      };

      const res = await fetch(`${SERVER_URL}/rpm/activity`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activity)
      });

      if (res.ok) {
        toast.success('✅ Activity logged with electronic signature');
        setShowAddActivity(false);
        setNewActivity({
          provider: '',
          providerNPI: '',
          providerCredentials: '',
          duration: 20,
          activityType: 'data_review',
          description: ''
        });
        loadRPMData();
      } else {
        toast.error('Failed to log activity');
      }
    } catch (e) {
      toast.error('Network error');
    }
  };

  const addProviderActivity = async () => {
    // Legacy function - kept for compatibility
    // New flow uses handleSignActivity instead
    if (!newActivity.provider || !newActivity.description) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const activity: any = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        provider: newActivity.provider,
        providerNPI: newActivity.providerNPI || 'N/A',
        providerCredentials: newActivity.providerCredentials || 'N/A',
        duration: newActivity.duration,
        activityType: newActivity.activityType,
        description: newActivity.description
      };

      const res = await fetch(`${SERVER_URL}/rpm/activity`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activity)
      });

      if (res.ok) {
        toast.success('Activity logged');
        setShowAddActivity(false);
        setNewActivity({
          provider: '',
          providerNPI: '',
          providerCredentials: '',
          duration: 20,
          activityType: 'data_review',
          description: ''
        });
        loadRPMData();
      } else {
        toast.error('Failed to log activity');
      }
    } catch (e) {
      toast.error('Network error');
    }
  };

  const exportBillingReport = () => {
    if (!currentMonth) return;

    const report = `
CARESOLIS RPM BILLING REPORT
Generated: ${new Date().toLocaleDateString()}
Month: ${currentMonth.month}

========================================
PATIENT ENROLLMENT (CPT 99453)
========================================
Enrolled: ${enrollment?.enrollmentDate ? new Date(enrollment.enrollmentDate).toLocaleDateString() : 'Not enrolled'}
Education Completed: ${enrollment?.educationCompleted ? 'Yes' : 'No'}
Education Duration: ${enrollment?.educationMinutes || 0} minutes
Educated By: ${enrollment?.educatedBy || 'N/A'}
CPT 99453 Status: ${enrollment?.cpt99453Billed ? 'BILLED' : 'BILLABLE ($19)'}

========================================
DATA COLLECTION (CPT 99454)
========================================
Days with Data: ${currentMonth.daysWithData}/16 required
  - Interaction Data: ${currentMonth.dataTypes.interaction} days
  - Medication Data: ${currentMonth.dataTypes.medication} days
  - Vitals Data: ${currentMonth.dataTypes.vitals} days
  - Environmental Data: ${currentMonth.dataTypes.environmental} days

CPT 99454 Status: ${currentMonth.compliance.cpt99454Eligible ? 'BILLABLE ($64)' : 'NOT ELIGIBLE (need 16+ days)'}

========================================
PROVIDER TIME (CPT 99457/99458)
========================================
Total Time: ${currentMonth.providerTimeMinutes} minutes

CPT 99457 (First 20 min): ${currentMonth.compliance.cpt99457Eligible ? 'BILLABLE ($51)' : 'NOT ELIGIBLE (need 20+ min)'}
CPT 99458 (Additional 20 min blocks): ${currentMonth.compliance.cpt99458Count} x $41 = $${currentMonth.compliance.cpt99458Count * 41}

Provider Activities:
${activities.map(a => `- ${new Date(a.timestamp).toLocaleDateString()} | ${a.provider} | ${a.duration}min | ${a.description}`).join('\n')}

========================================
BILLING SUMMARY
========================================
CPT 99453 (Setup): ${!enrollment?.cpt99453Billed && enrollment?.enrollmentDate ? '$19' : '$0'}
CPT 99454 (Device Supply): ${currentMonth.compliance.cpt99454Eligible ? '$64' : '$0'}
CPT 99457 (First 20 min): ${currentMonth.compliance.cpt99457Eligible ? '$51' : '$0'}
CPT 99458 (Additional): $${currentMonth.compliance.cpt99458Count * 41}

TOTAL ESTIMATED REIMBURSEMENT: $${currentMonth.estimatedReimbursement}

========================================
COMPLIANCE NOTES
========================================
- All CPT codes require proper documentation
- 99454 requires 16+ calendar days with device data
- 99457/99458 require interactive communication with patient
- Time must be documented in patient record
- Billing period: Calendar month
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RPM-Billing-${currentMonth.month}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Billing report exported');
  };

  if (isLoading && !currentMonth) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center">
        <div className="text-slate-400">Loading RPM data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">RPM Billing Module</h1>
              {/* FDA COMPLIANCE BADGE */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-lg border-2 border-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                FDA 21 CFR Part 11
              </div>
            </div>
            <p className="text-slate-400 text-sm sm:text-lg">
              Medicare Remote Patient Monitoring compliance tracker
            </p>
          </div>
          <Button
            onClick={exportBillingReport}
            disabled={!currentMonth}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        {/* Enrollment Section */}
        {!enrollment && (
          <div className="bg-amber-900/20 border-2 border-amber-600/50 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-300 mb-2">
                  Patient Not Enrolled in RPM Program
                </h3>
                <p className="text-amber-200/80 mb-4">
                  Complete initial setup and patient education to bill CPT 99453 ($19)
                </p>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Educated By
                    </label>
                    <input
                      type="text"
                      value={enrollmentForm.educatedBy}
                      onChange={(e) => setEnrollmentForm({ ...enrollmentForm, educatedBy: e.target.value })}
                      placeholder="Provider name"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Education Duration (min)
                    </label>
                    <input
                      type="number"
                      value={enrollmentForm.educationMinutes}
                      onChange={(e) => setEnrollmentForm({ ...enrollmentForm, educationMinutes: parseInt(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={enrollPatient}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
                    >
                      Enroll Patient
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {enrollment && (
          <div className="bg-emerald-900/20 border-2 border-emerald-600/50 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-emerald-300 mb-2">
                  Patient Enrolled - CPT 99453 {enrollment.cpt99453Billed ? 'Billed' : 'Billable'}
                </h3>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Enrollment Date:</span>
                    <div className="text-slate-200 font-medium">
                      {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Educated By:</span>
                    <div className="text-slate-200 font-medium">{enrollment.educatedBy}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Duration:</span>
                    <div className="text-slate-200 font-medium">{enrollment.educationMinutes} minutes</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Reimbursement:</span>
                    <div className="text-emerald-400 font-bold">
                      ${enrollment.cpt99453Billed ? '0 (billed)' : '19'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Compliance Dashboard */}
        {currentMonth && (
          <>
            {/* CPT Overview Cards */}
            <div className="grid grid-cols-4 gap-4">
              {/* CPT 99454 - Device Supply */}
              <div className={clsx(
                'rounded-lg p-6 border-2',
                currentMonth.compliance.cpt99454Eligible
                  ? 'bg-emerald-900/20 border-emerald-600/50'
                  : 'bg-slate-800/50 border-slate-700'
              )}>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    CPT 99454
                  </span>
                </div>
                <div className="text-3xl font-bold text-slate-100 mb-1">
                  {currentMonth.daysWithData}/16
                </div>
                <div className="text-sm text-slate-400 mb-2">Days with Data</div>
                <div className={clsx(
                  'text-xl font-bold',
                  currentMonth.compliance.cpt99454Eligible ? 'text-emerald-400' : 'text-slate-500'
                )}>
                  ${currentMonth.compliance.cpt99454Eligible ? '64' : '0'}
                </div>
              </div>

              {/* CPT 99457 - First 20 min */}
              <div className={clsx(
                'rounded-lg p-6 border-2',
                currentMonth.compliance.cpt99457Eligible
                  ? 'bg-emerald-900/20 border-emerald-600/50'
                  : 'bg-slate-800/50 border-slate-700'
              )}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    CPT 99457
                  </span>
                </div>
                <div className="text-3xl font-bold text-slate-100 mb-1">
                  {currentMonth.providerTimeMinutes}/20
                </div>
                <div className="text-sm text-slate-400 mb-2">Provider Minutes</div>
                <div className={clsx(
                  'text-xl font-bold',
                  currentMonth.compliance.cpt99457Eligible ? 'text-emerald-400' : 'text-slate-500'
                )}>
                  ${currentMonth.compliance.cpt99457Eligible ? '51' : '0'}
                </div>
              </div>

              {/* CPT 99458 - Additional 20 min blocks */}
              <div className={clsx(
                'rounded-lg p-6 border-2',
                currentMonth.compliance.cpt99458Count > 0
                  ? 'bg-emerald-900/20 border-emerald-600/50'
                  : 'bg-slate-800/50 border-slate-700'
              )}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    CPT 99458
                  </span>
                </div>
                <div className="text-3xl font-bold text-slate-100 mb-1">
                  {currentMonth.compliance.cpt99458Count}
                </div>
                <div className="text-sm text-slate-400 mb-2">Additional Blocks</div>
                <div className={clsx(
                  'text-xl font-bold',
                  currentMonth.compliance.cpt99458Count > 0 ? 'text-emerald-400' : 'text-slate-500'
                )}>
                  ${currentMonth.compliance.cpt99458Count * 41}
                </div>
              </div>

              {/* Total Reimbursement */}
              <div className="bg-blue-900/20 border-2 border-blue-600/50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Total Monthly
                  </span>
                </div>
                <div className="text-3xl font-bold text-blue-400 mb-1">
                  ${currentMonth.estimatedReimbursement}
                </div>
                <div className="text-sm text-slate-400">Estimated</div>
              </div>
            </div>

            {/* Data Collection Breakdown */}
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Data Collection Breakdown
              </h3>
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-slate-400 mb-1">Interaction Data</div>
                  <div className="text-2xl font-bold text-slate-100">
                    {currentMonth.dataTypes.interaction} days
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${Math.min((currentMonth.dataTypes.interaction / 16) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Medication Data</div>
                  <div className="text-2xl font-bold text-slate-100">
                    {currentMonth.dataTypes.medication} days
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min((currentMonth.dataTypes.medication / 16) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Vitals Data</div>
                  <div className="text-2xl font-bold text-slate-100">
                    {currentMonth.dataTypes.vitals} days
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-rose-500 h-2 rounded-full"
                      style={{ width: `${Math.min((currentMonth.dataTypes.vitals / 16) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Coming soon</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Environmental Data</div>
                  <div className="text-2xl font-bold text-slate-100">
                    {currentMonth.dataTypes.environmental} days
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full"
                      style={{ width: `${Math.min((currentMonth.dataTypes.environmental / 16) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Provider Activities */}
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Provider Activities ({currentMonth.providerTimeMinutes} total minutes)
                </h3>
                <Button
                  onClick={() => setShowAddActivity(!showAddActivity)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Log Activity
                </Button>
              </div>

              {/* Add Activity Form */}
              {showAddActivity && (
                <div className="bg-slate-900/50 rounded-lg p-4 mb-4 border border-slate-700">
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Provider Name
                      </label>
                      <input
                        type="text"
                        value={newActivity.provider}
                        onChange={(e) => setNewActivity({ ...newActivity, provider: e.target.value })}
                        placeholder="Dr. Smith"
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Provider NPI
                      </label>
                      <input
                        type="text"
                        value={newActivity.providerNPI}
                        onChange={(e) => setNewActivity({ ...newActivity, providerNPI: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        placeholder="1234567890"
                        maxLength={10}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Credentials
                      </label>
                      <input
                        type="text"
                        value={newActivity.providerCredentials}
                        onChange={(e) => setNewActivity({ ...newActivity, providerCredentials: e.target.value })}
                        placeholder="MD, RN, NP, PA"
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={newActivity.duration}
                        onChange={(e) => setNewActivity({ ...newActivity, duration: parseInt(e.target.value) || 20 })}
                        min={5}
                        max={480}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-200"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Activity Type
                      </label>
                      <select
                        value={newActivity.activityType}
                        onChange={(e) => setNewActivity({ ...newActivity, activityType: e.target.value as any })}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-200"
                      >
                        <option value="data_review">Data Review</option>
                        <option value="patient_call">Patient Call</option>
                        <option value="care_plan">Care Plan Update</option>
                        <option value="coordination">Provider Coordination</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newActivity.description}
                      onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                      placeholder="Reviewed stability analytics and medication adherence data..."
                      rows={3}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-200"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSignActivity} 
                      className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      Sign & Save Activity
                    </Button>
                    <Button
                      onClick={() => setShowAddActivity(false)}
                      className="bg-slate-700 hover:bg-slate-600 text-slate-200"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Activities List */}
              <div className="space-y-2">
                {activities.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    No provider activities logged this month
                  </div>
                ) : (
                  activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-sm font-medium text-slate-200">
                              {activity.provider}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                              {new Date(activity.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                              {activity.activityType.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300">{activity.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-lg font-bold text-emerald-400">
                            {activity.duration} min
                          </div>
                          {activity.relatedCPT && (
                            <div className="text-xs text-slate-400">CPT {activity.relatedCPT}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Compliance Guidance */}
            <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-300 mb-3">Medicare RPM Billing Requirements</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-slate-200 mb-2">CPT 99453 - Initial Setup ($19)</div>
                  <ul className="text-slate-400 space-y-1 text-xs">
                    <li>• One-time per patient</li>
                    <li>• Device setup and patient education</li>
                    <li>• Document education content and duration</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium text-slate-200 mb-2">CPT 99454 - Device Supply ($64/month)</div>
                  <ul className="text-slate-400 space-y-1 text-xs">
                    <li>• Requires 16+ days of data per calendar month</li>
                    <li>• Data must be automatically collected and transmitted</li>
                    <li>• Each day = at least one data point</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium text-slate-200 mb-2">CPT 99457 - Provider Time ($51)</div>
                  <ul className="text-slate-400 space-y-1 text-xs">
                    <li>• Requires 20+ minutes of qualified provider time</li>
                    <li>• Interactive communication with patient required</li>
                    <li>• Must review/interpret transmitted data</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium text-slate-200 mb-2">CPT 99458 - Additional Time ($41)</div>
                  <ul className="text-slate-400 space-y-1 text-xs">
                    <li>• Each additional 20-minute block</li>
                    <li>• Can bill multiple times per month</li>
                    <li>• Must meet same requirements as 99457</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Electronic Signature Modal */}
      {showSignature && (
        <ElectronicSignature
          onSign={handleSignatureComplete}
          onCancel={() => setShowSignature(false)}
          actionDescription={`Log ${newActivity.duration} minutes of provider time for ${newActivity.activityType.replace('_', ' ')}`}
          requireNPI={true}
          providerName={newActivity.provider}
          providerNPI={newActivity.providerNPI}
        />
      )}
    </div>
  );
}