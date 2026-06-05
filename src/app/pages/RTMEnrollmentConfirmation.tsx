import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { CheckCircle, AlertCircle, Edit } from 'lucide-react';

interface ConfirmationData {
  patientName: string;
  primaryDiagnosis: string;
  billingCondition: string;
  cptCode: string;
  cptCategory: string; // e.g., "MSK", "CV", "RESP"
  monthlyEstimate: {
    min: number;
    max: number;
  };
}

export default function RTMEnrollmentConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get data from navigation state or use demo data
  const confirmationData: ConfirmationData = location.state?.confirmationData || {
    patientName: 'Eleanor Whitmore',
    primaryDiagnosis: 'Mild Cognitive Impairment (MCI)',
    billingCondition: 'Osteoporosis',
    cptCode: '98977',
    cptCategory: 'MSK',
    monthlyEstimate: {
      min: 92,
      max: 133
    }
  };

  const handleEditProfile = () => {
    navigate('/patient-profile');
  };

  const handleActivateMonitoring = () => {
    // Navigate to main dashboard or monitoring setup
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-black dark:to-slate-950">
      {/* Mobile-optimized container */}
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-12">

        {/* Header with Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            RTM Billing Path Confirmed
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Ready to activate remote therapeutic monitoring
          </p>
        </div>

        {/* Main Confirmation Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">

          {/* Patient Information Section */}
          <div className="p-6 md:p-8">

            {/* Patient Name */}
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50 mb-3">
                {confirmationData.patientName}
              </h2>

              {/* Primary Diagnosis */}
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="text-base text-slate-500 dark:text-slate-400 italic mb-1">
                    {confirmationData.primaryDiagnosis}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Clinical reason for device — not the billing code
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200 dark:border-slate-800 my-6"></div>

            {/* Billing Condition Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
                Billing Condition
              </h3>

              {/* CPT Badge */}
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 border border-teal-300 dark:border-teal-700 rounded-xl px-4 py-3 mb-4">
                <div className="flex-1">
                  <p className="text-lg font-bold text-teal-900 dark:text-teal-100">
                    {confirmationData.billingCondition}
                  </p>
                </div>
                <div className="bg-teal-600 dark:bg-teal-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap">
                  {confirmationData.cptCode} {confirmationData.cptCategory}
                </div>
              </div>

              {/* Billing Estimate */}
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-semibold">Monthly billing estimate:</span>{' '}
                <span className="text-slate-900 dark:text-slate-50 font-bold">
                  ${confirmationData.monthlyEstimate.min}–${confirmationData.monthlyEstimate.max}
                </span>
                <span className="text-slate-500 dark:text-slate-500">/patient</span>
              </p>
            </div>

            {/* Info Box - Auto-Assignment Explanation */}
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
                    The platform auto-assigns the optimal RTM code based on the patient's qualifying co-morbid condition.
                    The <strong>primary diagnosis</strong> drives clinical need; the <strong>co-morbidity</strong> drives the billing path.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 px-6 md:px-8 py-6">
            <div className="flex flex-col sm:flex-row gap-3">

              {/* Edit Profile - Secondary */}
              <button
                onClick={handleEditProfile}
                className="flex-1 sm:flex-none sm:w-auto px-6 py-3 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-50 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>

              {/* Activate Monitoring - Primary */}
              <button
                onClick={handleActivateMonitoring}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 dark:from-teal-500 dark:to-teal-600 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-teal-800 dark:hover:from-teal-600 dark:hover:to-teal-700 shadow-lg shadow-teal-500/30 dark:shadow-teal-500/20 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Activate Monitoring
              </button>
            </div>

            {/* Helper Text */}
            <p className="text-xs text-center text-slate-500 dark:text-slate-500 mt-4">
              Activation initiates the 16-day setup period for RTM billing compliance
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-600">
            CPT codes and billing estimates are subject to payer policies and regional variations
          </p>
        </div>
      </div>
    </div>
  );
}
