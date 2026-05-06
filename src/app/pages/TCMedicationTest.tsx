import React, { useState, useEffect } from 'react';
import { useCaresolis } from '../hooks/useCaresolis';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { 
  Zap, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Plus,
  Minus,
  RefreshCw,
  Play,
  Info,
  Shield,
  Activity
} from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from 'react-router';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;

/**
 * TIME-CRITICAL MEDICATION TESTING INTERFACE
 * 
 * ⚠️ DEV/TESTING TOOL ONLY
 * Infrastructure-grade testing tool for validating TC medication detection,
 * escalation protocol activation, and dashboard indicator behavior.
 * Should be protected/hidden in production environments.
 */

interface TCStatus {
  hasTCMedications: boolean;
  count: number;
  medications: Array<{
    id: string;
    name: string;
    genericName: string;
    reason: string;
  }>;
}

const SAMPLE_TC_MEDICATIONS = [
  { name: 'Warfarin', dosage: '5mg', reason: 'Anticoagulant - Critical therapeutic window' },
  { name: 'Insulin Lispro', dosage: '100 units/mL', reason: 'Rapid-acting insulin - Hypoglycemia risk' },
  { name: 'Digoxin', dosage: '0.125mg', reason: 'Cardiac glycoside - Narrow therapeutic index' },
  { name: 'Carvedilol', dosage: '12.5mg', reason: 'Beta blocker for heart failure - Rebound risk' },
  { name: 'Levothyroxine', dosage: '100mcg', reason: 'Thyroid hormone - Must be consistent timing' },
];

export default function TCMedicationTest() {
  const { settings, refresh } = useCaresolis();
  const [tcStatus, setTcStatus] = useState<TCStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [medications, setMedications] = useState<any[]>([]);
  const [testInProgress, setTestInProgress] = useState(false);

  // Fetch current TC status
  const fetchTCStatus = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/medications/tc-status`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const data = await response.json();
      setTcStatus(data);
    } catch (error) {
      console.error('Failed to fetch TC status:', error);
    }
  };

  // Fetch current medications
  const fetchMedications = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/medications`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const data = await response.json();
      setMedications(data || []);
    } catch (error) {
      console.error('Failed to fetch medications:', error);
    }
  };

  useEffect(() => {
    fetchTCStatus();
    fetchMedications();
  }, []);

  // Add a TC medication to test
  const addTCMedication = async (med: typeof SAMPLE_TC_MEDICATIONS[0]) => {
    setLoading(true);
    try {
      const newMed = {
        id: `test-${Date.now()}`,
        name: med.name,
        dosage: med.dosage,
        purpose: med.reason,
        timeCritical: true,
        tcFlag: true,
        tcReason: med.reason,
        active: true,
        schedule: {
          times: ['09:00', '21:00'],
          days: [0, 1, 2, 3, 4, 5, 6],
          quantity: 1
        }
      };

      const updatedMeds = [...medications, newMed];
      
      const response = await fetch(`${SERVER_URL}/medications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(updatedMeds)
      });

      if (response.ok) {
        await fetchMedications();
        await fetchTCStatus();
        await refresh();
      }
    } catch (error) {
      console.error('Failed to add TC medication:', error);
    } finally {
      setLoading(false);
    }
  };

  // Remove all TC medications
  const removeAllTCMedications = async () => {
    setLoading(true);
    try {
      const nonTCMeds = medications.filter(m => !m.timeCritical && !m.tcFlag);
      
      const response = await fetch(`${SERVER_URL}/medications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(nonTCMeds)
      });

      if (response.ok) {
        await fetchMedications();
        await fetchTCStatus();
        await refresh();
      }
    } catch (error) {
      console.error('Failed to remove TC medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const tcActive = settings?.medications?.timeCritical?.active || false;
  const tcCount = settings?.medications?.timeCritical?.count || 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                <Zap className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h1 className="text-3xl font-light text-slate-800 dark:text-slate-100">
                  Time-Critical Medication Test
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Infrastructure-grade validation of TC detection & escalation protocols
                </p>
              </div>
            </div>
          </div>
          <Link 
            to="/"
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Current System Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* TC Active Status */}
          <div className={clsx(
            "p-6 rounded-xl border-2 transition-all",
            tcActive 
              ? "bg-orange-500/5 border-orange-500/30 shadow-lg shadow-orange-500/10" 
              : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          )}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {tcActive ? (
                  <Zap className="w-5 h-5 text-orange-500" />
                ) : (
                  <Shield className="w-5 h-5 text-slate-400" />
                )}
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">TC System</h3>
              </div>
              {tcActive && (
                <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                  ACTIVE
                </span>
              )}
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-light text-slate-800 dark:text-slate-100">
                {tcActive ? 'Enabled' : 'Disabled'}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tcActive 
                  ? 'Accelerated escalation protocols active'
                  : 'Standard escalation protocols in effect'}
              </p>
            </div>
          </div>

          {/* TC Medication Count */}
          <div className="p-6 rounded-xl border-2 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">TC Medications</h3>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-light text-slate-800 dark:text-slate-100">
                {tcCount}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Time-critical medications registered
              </p>
            </div>
          </div>

          {/* Dashboard Indicator */}
          <div className="p-6 rounded-xl border-2 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">Dashboard</h3>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                {tcActive ? (
                  <div className="flex items-center gap-2 px-2 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                      ACCELERATED ESCALATION
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400">No TC indicator shown</span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tcActive ? 'Lightning bolt visible on Check-In Ring' : 'Standard display mode'}
              </p>
            </div>
          </div>
        </div>

        {/* Escalation Protocol Comparison */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Escalation Protocol Comparison
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Standard Protocol */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">STANDARD</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-20 text-sm font-medium text-slate-500 pt-1">T+0</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Scheduled Time</div>
                    <div className="text-xs text-slate-500 mt-0.5">15-minute grace period begins</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-20 text-sm font-medium text-amber-500 pt-1">T+15</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-amber-600 dark:text-amber-400">Reminder Active</div>
                    <div className="text-xs text-slate-500 mt-0.5">Yellow ring, notification sent</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-20 text-sm font-medium text-rose-500 pt-1">T+30</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-rose-600 dark:text-rose-400">Level 1 Escalation</div>
                    <div className="text-xs text-slate-500 mt-0.5">Contact Priority 1</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-20 text-sm font-medium text-rose-600 pt-1">T+45</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-rose-700 dark:text-rose-500">Level 2 Escalation</div>
                    <div className="text-xs text-slate-500 mt-0.5">Contact Priority 2</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-20 text-sm font-medium text-rose-700 pt-1">T+60</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-rose-800 dark:text-rose-600">Level 3 Escalation</div>
                    <div className="text-xs text-slate-500 mt-0.5">Contact Priority 3 / Emergency</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Total Time</div>
                <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">60 minutes</div>
              </div>
            </div>

            {/* TC Protocol */}
            <div className={clsx(
              "space-y-4 p-4 rounded-lg border-2",
              tcActive 
                ? "bg-orange-500/5 border-orange-500/20" 
                : "bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700"
            )}>
              <div className="flex items-center gap-2 mb-4">
                <div className="px-3 py-1 bg-orange-500 rounded-full">
                  <span className="text-xs font-bold text-white">TIME-CRITICAL</span>
                </div>
                {tcActive && <Zap className="w-4 h-4 text-orange-500" />}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-20 text-sm font-medium text-rose-500 pt-1">T+0</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-rose-600 dark:text-rose-400">Scheduled Time</div>
                    <div className="text-xs text-orange-600 dark:text-orange-400 font-semibold mt-0.5">
                      ⚡ NO GRACE PERIOD
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-20 text-sm font-medium text-rose-600 pt-1">T+15</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-rose-700 dark:text-rose-500">Level 1 Escalation</div>
                    <div className="text-xs text-orange-600 dark:text-orange-400 font-semibold mt-0.5">
                      ⚡ 50% FASTER (15 min vs 30 min)
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-20 text-sm font-medium text-rose-700 pt-1">T+25</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-rose-800 dark:text-rose-600">Level 2 Escalation</div>
                    <div className="text-xs text-orange-600 dark:text-orange-400 font-semibold mt-0.5">
                      ⚡ 44% FASTER (25 min vs 45 min)
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-20 text-sm font-medium text-rose-800 pt-1">T+35</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-rose-900 dark:text-rose-700">Level 3 Escalation</div>
                    <div className="text-xs text-orange-600 dark:text-orange-400 font-semibold mt-0.5">
                      ⚡ 42% FASTER (35 min vs 60 min)
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-orange-500/10 rounded-lg border border-orange-500/30">
                <div className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-1">Total Time</div>
                <div className="text-lg font-semibold text-orange-600 dark:text-orange-300 flex items-center gap-2">
                  35 minutes
                  <span className="text-xs font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">
                    42% FASTER
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current TC Medications */}
        {tcStatus && tcStatus.hasTCMedications && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-orange-500/30 p-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              Active TC Medications ({tcStatus.count})
            </h2>
            
            <div className="space-y-2">
              {tcStatus.medications.map((med, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-slate-800 dark:text-slate-100">{med.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{med.reason}</div>
                  </div>
                  <Zap className="w-4 h-4 text-orange-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
            <Play className="w-5 h-5 text-emerald-500" />
            Test Actions
          </h2>

          <div className="space-y-4">
            
            {/* Add TC Medication */}
            <div>
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
                Add Time-Critical Medication
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {SAMPLE_TC_MEDICATIONS.map((med, idx) => (
                  <button
                    key={idx}
                    onClick={() => addTCMedication(med)}
                    disabled={loading}
                    className="flex items-center gap-3 p-3 bg-orange-500/5 hover:bg-orange-500/10 border border-orange-500/20 hover:border-orange-500/40 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
                  >
                    <Plus className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                        {med.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{med.dosage}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Remove All TC Medications */}
            {tcStatus && tcStatus.hasTCMedications && (
              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
                  Reset TC System
                </h3>
                <button
                  onClick={removeAllTCMedications}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 text-rose-600 dark:text-rose-400 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                  <span className="text-sm font-medium">Remove All TC Medications</span>
                </button>
              </div>
            )}

            {/* Refresh Status */}
            <div>
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
                Refresh System State
              </h3>
              <button
                onClick={async () => {
                  setLoading(true);
                  await fetchTCStatus();
                  await fetchMedications();
                  await refresh();
                  setLoading(false);
                }}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 text-blue-600 dark:text-blue-400 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />
                <span className="text-sm font-medium">Refresh All Status</span>
              </button>
            </div>
          </div>
        </div>

        {/* Testing Instructions */}
        <div className="bg-blue-500/5 border-2 border-blue-500/20 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-3">
              <h3 className="font-semibold text-blue-700 dark:text-blue-400">Testing Instructions</h3>
              <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600">1.</span>
                  <span>Click one of the "Add Time-Critical Medication" buttons above to add a TC medication to the system</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600">2.</span>
                  <span>Watch the "TC System" status change from "Disabled" to "Enabled" with the orange ACTIVE badge</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600">3.</span>
                  <span>Navigate to the Dashboard and observe the lightning bolt ⚡ "ACCELERATED ESCALATION" indicator below the time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600">4.</span>
                  <span>Go to Medication Registry to see the TC summary card showing clinical reasoning for each TC medication</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600">5.</span>
                  <span>Review the CareGiver Manual (Section 17) for complete TC protocol documentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600">6.</span>
                  <span>Use "Remove All TC Medications" to reset the system and verify the indicator disappears</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/"
            className="flex items-center justify-between p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-all group"
          >
            <div>
              <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Dashboard</div>
              <div className="text-xs text-slate-500 mt-0.5">View TC indicator</div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link 
            to="/medications"
            className="flex items-center justify-between p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition-all group"
          >
            <div>
              <div className="text-sm font-semibold text-blue-700 dark:text-blue-400">Medication Manager</div>
              <div className="text-xs text-slate-500 mt-0.5">TC flag management</div>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link 
            to="/caregiver-manual"
            className="flex items-center justify-between p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg transition-all group"
          >
            <div>
              <div className="text-sm font-semibold text-purple-700 dark:text-purple-400">CareGiver Manual</div>
              <div className="text-xs text-slate-500 mt-0.5">Section 17: TC Protocols</div>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-500 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </div>
  );
}