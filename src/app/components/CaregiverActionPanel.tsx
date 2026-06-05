/**
 * CAREGIVER ACTION PANEL
 * 
 * FDA-Compliant interface for caregivers to authorize actions on timed-out doses
 * 
 * FEATURES:
 * - View pending dose actions (timeouts, faults)
 * - Authorize re-presentation (extends chute again for 15 min)
 * - Mark as missed (diverts to reservoir with logged reason)
 * - Real-time chute state monitoring
 * - Reservoir capacity warnings
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Trash2,
  Shield,
  Pill,
  AlertOctagon
} from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';
import { clsx } from 'clsx';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;

interface PendingAction {
  doseId: string;
  timestamp: string;
  type: 'timeout' | 'fault';
  pack: 'A' | 'B';
  position: number;
  actions: ('represent' | 'mark_missed' | 'investigate')[];
}

interface ChuteState {
  isOpen: boolean;
  currentDose: any | null;
  faultDetected: boolean;
  faultReason: string | null;
  reservoirFull: boolean;
  reservoirCount: number;
  reservoirCapacity: number;
  lastMaintenanceDate: string | null;
  blockAllDoses: boolean;
}

interface CaregiverActionPanelProps {
  patientId: string;
  caregiverUserId: string;
  onActionComplete?: () => void;
}

export function CaregiverActionPanel({ 
  patientId, 
  caregiverUserId,
  onActionComplete 
}: CaregiverActionPanelProps) {
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [chuteState, setChuteState] = useState<ChuteState | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<PendingAction | null>(null);
  const [missedReason, setMissedReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);

  // Fetch pending actions and chute state
  const fetchData = async () => {
    try {
      const [actionsRes, stateRes] = await Promise.all([
        fetch(`${SERVER_URL}/chute/pending-actions/${patientId}`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }),
        fetch(`${SERVER_URL}/chute/state/${patientId}`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }),
      ]);

      if (actionsRes.ok) {
        const data = await actionsRes.json();
        setPendingActions(data.actions || []);
      }

      if (stateRes.ok) {
        const data = await stateRes.json();
        setChuteState(data);
      }
    } catch (e) {
      console.error('Error fetching chute data:', e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [patientId]);

  // Handle re-presentation
  const handleRepresent = async (action: PendingAction) => {
    if (chuteState?.reservoirFull) {
      toast.error('Cannot re-present: Reservoir full - maintenance required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/chute/caregiver/represent`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doseId: action.doseId,
          caregiverUserId,
        }),
      });

      const result = await res.json();
      
      if (result.success) {
        toast.success('Dose re-presented to patient', {
          description: result.message,
        });
        await fetchData();
        onActionComplete?.();
      } else {
        toast.error('Failed to re-present dose', {
          description: result.message,
        });
      }
    } catch (e) {
      console.error('Error representing dose:', e);
      toast.error('Network error - please try again');
    } finally {
      setLoading(false);
    }
  };

  // Handle mark as missed
  const handleMarkMissed = async (action: PendingAction, reason: string) => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for marking as missed');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/chute/caregiver/mark-missed`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doseId: action.doseId,
          caregiverUserId,
          reason,
        }),
      });

      const result = await res.json();
      
      if (result.success) {
        toast.success('Dose marked as missed', {
          description: result.message,
        });
        await fetchData();
        setShowReasonInput(false);
        setSelectedAction(null);
        setMissedReason('');
        onActionComplete?.();
      } else {
        toast.error('Failed to mark as missed', {
          description: result.message,
        });
      }
    } catch (e) {
      console.error('Error marking missed:', e);
      toast.error('Network error - please try again');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  const getElapsedTime = (isoString: string) => {
    const elapsed = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(elapsed / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const reservoirPercent = chuteState 
    ? Math.round((chuteState.reservoirCount / chuteState.reservoirCapacity) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Chute State Overview */}
      {chuteState && (
        <div className={clsx(
          "p-4 rounded-lg border-2",
          chuteState.blockAllDoses 
            ? "bg-rose-50 border-rose-300 dark:bg-rose-950/30 dark:border-rose-800"
            : chuteState.isOpen
            ? "bg-amber-50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-800"
            : "bg-emerald-50 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800"
        )}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className={clsx(
                  "w-5 h-5",
                  chuteState.blockAllDoses ? "text-rose-600" :
                  chuteState.isOpen ? "text-amber-600" :
                  "text-emerald-600"
                )} />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Chute System Status
                </h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {chuteState.blockAllDoses 
                  ? `⚠️ System Blocked: ${chuteState.faultReason}`
                  : chuteState.isOpen
                  ? '🟡 Chute Open - Dose presented to patient'
                  : '✅ Chute Closed - System operational'
                }
              </p>
            </div>
            
            {/* Reservoir Indicator */}
            <div className="text-right">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Diversion Reservoir
              </div>
              <div className="flex items-center gap-2">
                <Trash2 className={clsx(
                  "w-4 h-4",
                  reservoirPercent >= 80 ? "text-rose-600" :
                  reservoirPercent >= 50 ? "text-amber-600" :
                  "text-slate-400"
                )} />
                <span className={clsx(
                  "text-sm font-semibold",
                  reservoirPercent >= 80 ? "text-rose-600" :
                  reservoirPercent >= 50 ? "text-amber-600" :
                  "text-slate-600 dark:text-slate-400"
                )}>
                  {chuteState.reservoirCount}/{chuteState.reservoirCapacity}
                </span>
                <span className="text-xs text-slate-500">({reservoirPercent}%)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Actions */}
      {pendingActions.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-600" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Pending Caregiver Actions ({pendingActions.length})
            </h3>
          </div>

          <AnimatePresence>
            {pendingActions.map((action) => (
              <motion.div
                key={action.doseId}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-slate-800 border-2 border-rose-300 dark:border-rose-800 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Pill className="w-4 h-4 text-rose-600" />
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        Pack {action.pack} - Position {action.position}
                      </span>
                      <span className={clsx(
                        "px-2 py-0.5 rounded-full text-xs font-semibold",
                        action.type === 'timeout' 
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                      )}>
                        {action.type === 'timeout' ? '15-min Timeout' : 'System Fault'}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {formatTime(action.timestamp)} ({getElapsedTime(action.timestamp)})
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedAction?.doseId === action.doseId && showReasonInput ? (
                  <div className="space-y-2">
                    <textarea
                      value={missedReason}
                      onChange={(e) => setMissedReason(e.target.value)}
                      placeholder="Why was this dose missed? (e.g., 'Patient asleep', 'Patient refused medication', 'Pills spilled')"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-rose-500"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMarkMissed(action, missedReason)}
                        disabled={loading || !missedReason.trim()}
                        className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Confirm Mark as Missed
                      </button>
                      <button
                        onClick={() => {
                          setShowReasonInput(false);
                          setSelectedAction(null);
                          setMissedReason('');
                        }}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRepresent(action)}
                      disabled={loading || chuteState?.reservoirFull}
                      className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Re-Present Dose
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAction(action);
                        setShowReasonInput(true);
                      }}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Mark as Missed
                    </button>
                  </div>
                )}

                {/* FDA Compliance Notice */}
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded text-xs text-blue-800 dark:text-blue-300">
                  <Shield className="w-3 h-3 inline mr-1" />
                  <strong>FDA Note:</strong> All actions are logged with triple redundancy (device flash, cloud DB, audit trail)
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            No pending caregiver actions
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
            All doses are on schedule
          </p>
        </div>
      )}
    </div>
  );
}
