import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Phone, Edit3, AlertTriangle, Activity, Pill, Home, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import { useCaresolis } from '../context/CaresolisContext';
import { usePatient } from '../context/PatientContext';
import { toast } from 'sonner';

interface ActiveEscalationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  escalationData?: any; // The active escalation event
}

export function ActiveEscalationPanel({ isOpen, onClose, escalationData }: ActiveEscalationPanelProps) {
  const { currentPatient } = usePatient();
  const { contacts, logs, settings, getNow } = useCaresolis();
  const [activeTab, setActiveTab] = useState<'context' | 'history' | 'device' | 'meds'>('context');
  const [timeRemaining, setTimeRemaining] = useState('--:--');

  // Close panel on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Calculate time remaining until next escalation level
  useEffect(() => {
    if (!escalationData || !isOpen) return;

    const updateTimer = () => {
      const now = getNow();
      const scheduledTime = escalationData.scheduledTime || escalationData.time;
      
      if (!scheduledTime) {
        setTimeRemaining('--:--');
        return;
      }

      // Parse scheduled time
      const [hours, minutes] = scheduledTime.split(':').map(Number);
      const scheduled = new Date(now);
      scheduled.setHours(hours, minutes, 0, 0);

      // Calculate window end based on escalation level
      const gracePeriod = settings?.gracePeriod ?? 0;
      const level1Offset = settings?.level1Offset ?? 15;
      const level2Offset = settings?.level2Offset ?? 30;
      const level3Offset = settings?.level3Offset ?? 60;

      let windowEnd = new Date(scheduled);
      
      if (escalationData.status === 'ReminderActive') {
        windowEnd.setMinutes(windowEnd.getMinutes() + gracePeriod + level1Offset);
      } else if (escalationData.status === 'EscalationLevel1') {
        windowEnd.setMinutes(windowEnd.getMinutes() + gracePeriod + level2Offset);
      } else if (escalationData.status === 'EscalationLevel2') {
        windowEnd.setMinutes(windowEnd.getMinutes() + gracePeriod + level3Offset);
      } else if (escalationData.status === 'EscalationLevel3') {
        setTimeRemaining('Final Level');
        return;
      }

      const diff = windowEnd.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining('Escalating...');
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${mins}:${secs.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [escalationData, isOpen, settings, getNow]);

  // Get escalation level info
  const getEscalationLevel = () => {
    if (!escalationData) return { level: 0, label: 'None', color: 'slate' };
    
    const status = escalationData.status;
    if (status === 'ReminderActive') return { level: 0, label: 'Reminder Active', color: 'amber' };
    if (status === 'EscalationLevel1') return { level: 1, label: 'Level 1 Escalation', color: 'orange' };
    if (status === 'EscalationLevel2') return { level: 2, label: 'Level 2 Escalation', color: 'rose' };
    if (status === 'EscalationLevel3') return { level: 3, label: 'Level 3 → CareSolis', color: 'red' };
    if (status === 'Acknowledged') return { level: 1, label: 'Acknowledged (Paused)', color: 'blue' };
    
    return { level: 0, label: 'Active', color: 'slate' };
  };

  const escalationLevel = getEscalationLevel();

  // Get Care Circle contacts for this escalation level
  const getCareCircleStatus = () => {
    if (!contacts || contacts.length === 0) return [];
    
    const sorted = [...contacts].sort((a, b) => (a.priority || 999) - (b.priority || 999));
    
    return sorted.slice(0, 3).map((contact, idx) => ({
      ...contact,
      isActive: idx === escalationLevel.level - 1,
      isNext: idx === escalationLevel.level,
      isPast: idx < escalationLevel.level - 1
    }));
  };

  const careCircle = getCareCircleStatus();

  // Get recent pattern from logs
  const getRecentPattern = () => {
    if (!logs || logs.length === 0) return null;
    
    const verifiedLogs = logs.filter(l => 
      l.type === 'success' && 
      l.message?.toLowerCase().includes('verified')
    ).slice(0, 7);

    if (verifiedLogs.length < 3) return null;

    const times = verifiedLogs.map(l => {
      const date = new Date(l.isoTimestamp || l.timestamp);
      return date.getHours() * 60 + date.getMinutes();
    });

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const avgHours = Math.floor(avg / 60);
    const avgMins = Math.round(avg % 60);
    
    const variance = times.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / times.length;
    const stdDev = Math.sqrt(variance);

    return {
      avgTime: `${avgHours % 12 || 12}:${avgMins.toString().padStart(2, '0')} ${avgHours >= 12 ? 'PM' : 'AM'}`,
      deviation: Math.round(stdDev)
    };
  };

  const pattern = getRecentPattern();

  // Quick actions - FDA Compliant: Device-Driven Only
  // Caregivers cannot manually acknowledge/clear escalations
  // Only device IR sensors can create valid adherence records
  const handleCall = () => {
    const contact = careCircle.find(c => c.isActive);
    if (contact?.phone) {
      toast.info(`Call ${contact.name}: ${contact.phone}`);
      // In a real app, this would initiate a call
    } else {
      toast.info('No active contact phone number available');
    }
  };

  const handleAddNote = () => {
    toast.info('Note functionality - navigate to Care Circle Journal');
    // In a real app, this would open a note modal or navigate to journal
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - z-[70] to be above header (z-60) but allow closing */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-[70] backdrop-blur-sm"
          />

          {/* Panel - z-[80] to be above backdrop and header */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:max-w-lg bg-white dark:bg-slate-900 shadow-2xl z-[80] overflow-y-auto"
          >
            {/* Header */}
            <div className={cn(
              "sticky top-0 z-10 p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800",
              escalationLevel.color === 'amber' && "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800",
              escalationLevel.color === 'orange' && "bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800",
              escalationLevel.color === 'rose' && "bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800",
              escalationLevel.color === 'red' && "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800",
              escalationLevel.color === 'blue' && "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800",
              escalationLevel.color === 'slate' && "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
            )}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0 pr-2">
                  <h2 className="text-xl sm:text-2xl font-light text-slate-900 dark:text-slate-100 truncate">
                    {currentPatient?.name || 'Patient'}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <AlertTriangle className={cn(
                      "w-4 h-4 flex-shrink-0",
                      escalationLevel.color === 'amber' && "text-amber-600",
                      escalationLevel.color === 'orange' && "text-orange-600",
                      escalationLevel.color === 'rose' && "text-rose-600",
                      escalationLevel.color === 'red' && "text-red-600",
                      escalationLevel.color === 'blue' && "text-blue-600",
                      escalationLevel.color === 'slate' && "text-slate-600"
                    )} />
                    <span className={cn(
                      "text-xs sm:text-sm font-medium uppercase tracking-wide",
                      escalationLevel.color === 'amber' && "text-amber-700 dark:text-amber-400",
                      escalationLevel.color === 'orange' && "text-orange-700 dark:text-orange-400",
                      escalationLevel.color === 'rose' && "text-rose-700 dark:text-rose-400",
                      escalationLevel.color === 'red' && "text-red-700 dark:text-red-400",
                      escalationLevel.color === 'blue' && "text-blue-700 dark:text-blue-400",
                      escalationLevel.color === 'slate' && "text-slate-700 dark:text-slate-400"
                    )}>
                      {escalationLevel.label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              {/* Time Remaining */}
              {escalationLevel.level < 3 && (
                <div className="flex items-center gap-2 text-xs sm:text-sm flex-wrap">
                  <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400">
                    Next escalation in: <span className="font-medium text-slate-900 dark:text-slate-100">{timeRemaining}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 scrollbar-hide">
              {[
                { id: 'context', label: 'Context', icon: Activity },
                { id: 'history', label: 'History', icon: Clock },
                { id: 'meds', label: 'Medication', icon: Pill },
                { id: 'device', label: 'Device', icon: Home }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap min-w-fit",
                    activeTab === tab.id
                      ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  <tab.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Context Tab */}
              {activeTab === 'context' && (
                <>
                  {/* FDA Compliance Notice */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                    <h3 className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      📋 Device-Driven System (FDA Compliant)
                    </h3>
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                      This escalation can only be resolved by <strong>physical device interaction</strong> (IR sensor detection).
                      Care Circle members cannot manually clear or acknowledge escalations to maintain audit trail integrity and prevent false adherence records.
                    </p>
                  </div>

                  {/* Quick Context */}
                  <div className="space-y-3">
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      Quick Context
                    </h3>

                    <div className="space-y-2">
                      {escalationData?.scheduledTime && (
                        <div className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm">
                          <Pill className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="text-slate-900 dark:text-slate-100 font-medium">
                              Medication pending
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 break-words">
                              {' '}(window: {escalationData.scheduledTime})
                            </span>
                          </div>
                        </div>
                      )}

                      {pattern && (
                        <div className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm">
                          <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="text-slate-900 dark:text-slate-100 font-medium">
                              Usual check-in: {pattern.avgTime}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 break-words">
                              {' '}(±{pattern.deviation} min variance)
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm">
                        <Home className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <span className="text-slate-500 dark:text-slate-400">
                            Device status: <span className="text-slate-900 dark:text-slate-100 font-medium">Online, last sync 2m ago</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      Quick Actions
                    </h3>

                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <Button
                        onClick={handleCall}
                        variant="outline"
                        className="border-slate-300 dark:border-slate-600 text-xs sm:text-sm"
                      >
                        <Phone className="w-4 h-4 mr-1 sm:mr-2" />
                        Call
                      </Button>

                      <Button
                        onClick={handleAddNote}
                        variant="outline"
                        className="border-slate-300 dark:border-slate-600 text-xs sm:text-sm"
                      >
                        <Edit3 className="w-4 h-4 mr-1 sm:mr-2" />
                        Add Note
                      </Button>
                    </div>
                  </div>

                  {/* Care Circle Status */}
                  <div className="space-y-3">
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      Care Circle Status
                    </h3>

                    <div className="space-y-2">
                      {careCircle.length > 0 ? careCircle.map((contact, idx) => (
                        <div
                          key={contact.id}
                          className={cn(
                            "flex items-center justify-between p-2.5 sm:p-3 rounded-lg border gap-2",
                            contact.isActive && "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
                            contact.isNext && "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
                            contact.isPast && "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700",
                            !contact.isActive && !contact.isNext && !contact.isPast && "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                          )}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className={cn(
                              "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0",
                              contact.isActive && "bg-emerald-600 text-white",
                              contact.isNext && "bg-amber-500 text-white",
                              contact.isPast && "bg-slate-400 text-white",
                              !contact.isActive && !contact.isNext && !contact.isPast && "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                            )}>
                              L{idx + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                {contact.name}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {contact.role}
                              </div>
                            </div>
                          </div>

                          <div className="text-xs flex-shrink-0">
                            {contact.isActive && (
                              <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full font-medium whitespace-nowrap">
                                Active
                              </span>
                            )}
                            {contact.isNext && (
                              <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full font-medium whitespace-nowrap">
                                Standing By
                              </span>
                            )}
                            {contact.isPast && (
                              <span className="text-slate-400 dark:text-slate-500 whitespace-nowrap">
                                Notified
                              </span>
                            )}
                          </div>
                        </div>
                      )) : (
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                          No Care Circle contacts configured
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="space-y-3">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Recent Activity
                  </h3>
                  <div className="space-y-2">
                    {logs.slice(0, 10).map((log, idx) => (
                      <div key={idx} className="text-xs sm:text-sm p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="font-medium text-slate-900 dark:text-slate-100 break-words">
                          {log.message}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {log.timestamp}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medication Tab */}
              {activeTab === 'meds' && (
                <div className="space-y-3">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Current Medication Schedule
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 break-words">
                    Scheduled times: {Array.isArray(settings?.schedule) ? settings.schedule.join(', ') : settings?.scheduledTime || 'Not configured'}
                  </p>
                  <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-400">
                      <strong>FDA Compliance:</strong> This device never allows external autonomous dispense commands. All medication events require physical interaction at the device.
                    </p>
                  </div>
                </div>
              )}

              {/* Device Tab */}
              {activeTab === 'device' && (
                <div className="space-y-3">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Device Diagnostics
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800 rounded-lg gap-2">
                      <span className="text-slate-600 dark:text-slate-400">Status</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">Online</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800 rounded-lg gap-2">
                      <span className="text-slate-600 dark:text-slate-400">Last Sync</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">2 minutes ago</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800 rounded-lg gap-2">
                      <span className="text-slate-600 dark:text-slate-400">Signal Strength</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">Excellent</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800 rounded-lg gap-2">
                      <span className="text-slate-600 dark:text-slate-400">Battery</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">AC Powered</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}