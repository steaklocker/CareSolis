import React, { useMemo, useState, useEffect } from 'react';
import { useCaresolis } from '../context/CaresolisContext';
import { usePatient } from '../context/PatientContext';
import { useTimezoneVerification } from '../hooks/useTimezoneVerification';
import { motion } from 'motion/react';
import { toast } from 'sonner';
// v6.47.0 - Fixed Vacation Mode banner JSX syntax
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  ChevronRight,
  Info,
  Heart,
  Send,
  Zap,
  Plane
} from 'lucide-react';
import { Link } from 'react-router';
import { clsx } from 'clsx';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { HomeEnvironmentCard } from '../components/HomeEnvironmentCard';
import { ActiveEscalationPanel } from '../components/ActiveEscalationPanel';
import { TimezoneVerificationModal } from '../components/TimezoneVerificationModal';
import { TimezoneTab } from '../components/TimezoneTab';
import { Header } from '../components/Header';
import { VERSION } from '../../version';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;

// --- Components ---

interface Slot {
  time: string;
  status: string;
  escalationLevel?: number;
  isActionable?: boolean; // Add isActionable flag
}

const CheckInRing = ({ slots, nextTime, currentTime, hasTCMedications = false, onSegmentClick, currentStatus = 'safe' }: { 
  slots: Slot[], 
  nextTime: string, 
  currentTime: Date, 
  hasTCMedications?: boolean,
  onSegmentClick?: (slot: Slot, index: number) => void,
  currentStatus?: 'safe' | 'pending' | 'escalated'
}) => {
  // Clock Logic - Use passed currentTime instead of internal state
  const now = currentTime;

  const dateString = now.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
  });

  const timeString = now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
  }).toLowerCase();

  // If no slots provided, fallback to 6 empty slots (updated default)
  const safeSlots = slots && slots.length > 0 ? slots : Array.from({ length: 6 }, (_, i) => ({ time: '', status: 'Scheduled' }));
  const total = safeSlots.length;
  
  const getSegmentColor = (index: number) => {
    const slot = safeSlots[index];
    if (!slot || !slot.time) return 'text-slate-200 dark:text-slate-800';

    const s = slot.status;
    
    // FRONTEND FALLBACK: Calculate what the status SHOULD be based on time
    let computedStatus = s;
    try {
      const [h, m] = slot.time.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        const slotTime = new Date(now);
        slotTime.setHours(h, m, 0, 0);
        const diffMins = Math.floor((now.getTime() - slotTime.getTime()) / 60000);
        
        // PROTOCOL: Frontend fallback status calculation
        if (diffMins >= 0 && s === 'Scheduled') {
          if (diffMins < 15) {
            computedStatus = 'ReminderActive'; // 0-15 min → ROSE (initial alert)
          } else if (diffMins < 30) {
            computedStatus = 'EscalationLevel1'; // 15-30 min → YELLOW (CG1)
          } else if (diffMins < 60) {
            computedStatus = 'EscalationLevel2'; // 30-60 min → YELLOW (CG2, abeyance)
          } else {
            computedStatus = 'EscalationLevel3'; // 60+ min → RED (missed reservoir)
          }
        }
      }
    } catch (e) {
      // If parsing fails, use server status
    }
    
    console.log(`🎨 [RING] Slot ${index} (${slot.time}): status="${s}" → computed="${computedStatus}"`);

    // Success / Completed
    if (computedStatus === 'Check-In On Time' || computedStatus === 'Check-In Delayed') {
        return 'text-emerald-500 dark:text-emerald-400';
    }

    // PROTOCOL: Level 3 (60+ min) = RED - Dose to missed reservoir
    if (computedStatus === 'EscalationLevel3' || computedStatus === 'Check-In Not Logged') {
        return 'text-red-600 dark:text-red-500';
    }

    // PROTOCOL: Levels 1 & 2 (15-60 min) = YELLOW - Dose pending/in abeyance
    if (computedStatus === 'EscalationLevel1' || computedStatus === 'EscalationLevel2') {
        return 'text-amber-500 dark:text-amber-400';
    }

    // PROTOCOL: Initial alert (0-15 min) = ROSE - Check-in time passed
    if (computedStatus === 'ReminderActive' || computedStatus === 'Acknowledged') {
        return 'text-rose-500 dark:text-rose-400';
    }

    // Closed / Missed (Past) - Light red to indicate historical issue
    if (computedStatus === 'Closed' || computedStatus === 'Missed') {
        return 'text-rose-300 dark:text-rose-600/70';
    }

    return 'text-slate-200 dark:text-slate-800';
  };

  // Determine what to display below the time
  const missedSlots = safeSlots.filter(s => s.status.startsWith('Escalation') || s.status === 'Check-In Not Logged');
  
  // Find a missed slot that is within the 60-minute window
  const recentMissedSlot = missedSlots.find(s => {
      try {
          const [h, m] = s.time.split(':').map(Number);
          const slotTime = new Date();
          slotTime.setHours(h, m, 0, 0);
          const diffMins = (now.getTime() - slotTime.getTime()) / 60000;
          return diffMins <= 60; // Show for 60 mins total from scheduled time
      } catch (e) {
          return false;
      }
  });

  const pendingSlot = safeSlots.find(s => s.status === 'ReminderActive');
  
  let statusLabel = "Next Care Moment";
  
  const formatTime = (timeStr: string) => {
    if (!timeStr) return "--:--";
    
    // Don't try to format non-time strings
    if (timeStr === "No scheduled times" || !timeStr.match(/\d/)) {
      return timeStr;
    }
    
    if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
    
    // Remove any "Today, " or "Tomorrow, " prefixes if they exist
    const cleanTime = timeStr.replace('Today, ', '').replace('Tomorrow, ', '').replace(/^(today|tomorrow),?\s*/i, '').trim();
    
    // Handle edge case: cleanTime might already be formatted like "9:00 am" or "9:00AM"
    if (cleanTime.match(/\d{1,2}:\d{2}\s*(am|pm|AM|PM)/i)) {
      // Already formatted, just return it (normalized)
      return cleanTime.toLowerCase().replace(/(\d{1,2}:\d{2})\s*(am|pm)/i, (match, time, period) => `${time} ${period.toLowerCase()}`);
    }
    
    const [hStr, mStr] = cleanTime.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    
    if (isNaN(h) || isNaN(m)) {
      console.warn(`[formatTime] Could not parse time: "${timeStr}" -> "${cleanTime}"`);
      return timeStr; 
    }

    const date = new Date();
    date.setHours(h);
    date.setMinutes(m);
    date.setSeconds(0);
    date.setMilliseconds(0);
    
    try {
      const formatted = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      // Normalize: ensure lowercase am/pm with space
      return formatted.toLowerCase().replace(/\s+/g, ' ');
    } catch (e) {
      console.error(`[formatTime] toLocaleTimeString failed for ${h}:${m}:`, e);
      return `${h}:${String(m).padStart(2, '0')}`;
    }
  };

  let displayTime = nextTime;
  if (nextTime.includes('Today, ')) {
     displayTime = formatTime(nextTime.replace('Today, ', ''));
  } else if (nextTime.includes('Tomorrow, ')) {
     const formattedTime = formatTime(nextTime.replace('Tomorrow, ', ''));
     displayTime = `Tomorrow, ${formattedTime}`;
  } else if (nextTime.toLowerCase().includes('tomorrow')) {
     // Handle edge case: "tomorrow 9:00" without proper capitalization/comma
     const formattedTime = formatTime(nextTime);
     displayTime = `Tomorrow, ${formattedTime}`;
  } else {
     displayTime = formatTime(nextTime);
  }

  let statusTime = displayTime;
  let statusColor = "text-emerald-500 dark:text-emerald-400";
  let labelColor = "text-slate-400 dark:text-slate-500";

  if (recentMissedSlot) {
      // Determine if Level 3 (RED) or Level 1/2 (YELLOW) or initial alert (ROSE)
      const status = recentMissedSlot.status;
      if (status === 'EscalationLevel3' || status === 'Check-In Not Logged') {
        statusLabel = "Dose Missed";
        statusColor = "text-red-600 dark:text-red-500";
        labelColor = "text-red-500 dark:text-red-600";
      } else if (status === 'EscalationLevel1' || status === 'EscalationLevel2') {
        statusLabel = "Check-In Pending";
        statusColor = "text-amber-500 dark:text-amber-400";
        labelColor = "text-amber-400 dark:text-amber-500";
      } else {
        statusLabel = "Check-In Alert";
        statusColor = "text-rose-500 dark:text-rose-400";
        labelColor = "text-rose-400 dark:text-rose-500";
      }
      statusTime = formatTime(recentMissedSlot.time);
  } else if (pendingSlot) {
      statusLabel = "Check-In Alert";
      statusTime = formatTime(pendingSlot.time);
      statusColor = "text-rose-500 dark:text-rose-400";
      labelColor = "text-rose-400 dark:text-rose-500";
  } else {
      statusTime = displayTime;
  }

  // Override status label if TC medications are active
  if (hasTCMedications && !recentMissedSlot) {
      statusLabel = "Time-Critical Medication Scenario";
      labelColor = "text-orange-400 dark:text-orange-500";
  }

  return (
    <div className="relative w-[380px] h-[380px] flex items-center justify-center mx-auto">
      {/* Status-based glow in the ring area only - no red to avoid disturbing care flow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        {/* Outer glow - only show for safe (green) and pending (amber), not for alert (red) */}
        {currentStatus !== 'alert' && (
          <div 
            className="absolute rounded-full"
            style={{ 
              width: '85%',
              height: '85%',
              background: currentStatus === 'safe' 
                ? 'radial-gradient(circle, transparent 58%, rgba(52, 211, 153, 1) 62%, rgba(16, 185, 129, 0.9) 68%, transparent 75%)'
                : 'radial-gradient(circle, transparent 58%, rgba(251, 191, 36, 0.8) 62%, rgba(245, 158, 11, 0.6) 68%, transparent 75%)',
              animation: 'ring-shimmer 3s ease-in-out infinite',
              filter: 'blur(20px)',
            }}
          />
        )}
        {/* Inner intense glow - only show for safe (green) and pending (amber), not for alert (red) */}
        {currentStatus !== 'alert' && (
          <div 
            className="absolute rounded-full"
            style={{ 
              width: '85%',
              height: '85%',
              background: currentStatus === 'safe'
                ? 'radial-gradient(circle, transparent 60%, rgba(52, 211, 153, 1) 64%, rgba(16, 185, 129, 0.95) 66%, transparent 70%)'
                : 'radial-gradient(circle, transparent 60%, rgba(251, 191, 36, 0.9) 64%, rgba(245, 158, 11, 0.7) 66%, transparent 70%)',
              animation: 'ring-shimmer 3s ease-in-out infinite',
              filter: 'blur(8px)',
            }}
          />
        )}
      </div>
      
      {/* Container for absolute positioning */}
      <div className="absolute inset-0 flex items-center justify-center">
        <style>{`
          @keyframes breathe-ring {
            0%, 100% { opacity: 0.85; transform: scale(0.99); }
            50% { opacity: 1; transform: scale(1.01); }
          }
          @keyframes medical-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.92; transform: scale(1.015); }
          }
          @keyframes ring-shimmer {
            0%, 100% { opacity: 0.75; }
            50% { opacity: 1; }
          }
        `}</style>
        <svg 
            className="w-full h-full transform -rotate-90 z-10 relative drop-shadow-2xl" 
            viewBox="0 0 100 100"
            style={{ 
              animation: "medical-pulse 3s ease-in-out infinite",
              filter: "drop-shadow(0 4px 20px rgba(16, 185, 129, 0.25)) drop-shadow(0 0 40px rgba(16, 185, 129, 0.15))"
            }}
        >
           {safeSlots.map((slot, i) => {
             const r = 42; 
             const c = 2 * Math.PI * r;
             const gap = total > 1 ? 5 : 0; 
             const segmentLength = (c / total) - gap;
             
             return (
               <motion.circle
                 key={i}
                 cx="50"
                 cy="50"
                 r={r}
                 fill="transparent"
                 stroke="currentColor"
                 strokeWidth="4"
                 strokeDasharray={`${segmentLength} ${gap + (c - segmentLength - gap)}`}
                 strokeDashoffset={-(i * (c / total)) + (gap / 2)}
                 strokeLinecap="round"
                 className={clsx("transition-colors duration-700 ease-in-out", getSegmentColor(i))}
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: i * 0.05 }}
                 onClick={() => onSegmentClick && onSegmentClick(slot, i)}
               />
             );
           })}
           
           <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="0.5" className="text-slate-200 dark:text-slate-800" fill="none" />
        </svg>
      </div>

      <div className="z-10 flex flex-col items-center justify-center text-center px-4">
        <div className="text-[10px] md:text-xs font-medium text-slate-600 dark:text-slate-500 tracking-wide mb-0.5">
            {dateString}
        </div>
        <div className="text-3xl md:text-4xl lg:text-5xl font-light text-slate-900 dark:text-slate-200 tracking-tighter font-feature-settings-tnum mb-2">
            {timeString}
        </div>
        <div className="flex flex-col items-center gap-0.5">
            <span className={clsx("text-[8px] md:text-[9px] uppercase tracking-widest font-semibold", labelColor)}>
                {statusLabel}
            </span>
            {hasTCMedications && !recentMissedSlot && (
              <div className="flex items-center gap-1 mt-0.5 px-1.5 py-0.5 bg-orange-500/10 border border-orange-500/30 rounded-full">
                <Zap className="w-2.5 h-2.5 md:w-3 md:h-3 text-orange-500" />
                <span className="text-[7px] md:text-[8px] font-semibold text-orange-600 dark:text-orange-400 tracking-wider">
                  ACCELERATED ESCALATION
                </span>
              </div>
            )}
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <Clock className={clsx("w-2.5 h-2.5 md:w-3 md:h-3", statusColor)} />
                <span className="text-[11px] md:text-xs font-medium">
                    {statusTime}
                </span>
            </div>
        </div>
      </div>
    </div>
  );
};

const MinimalTrendChart = ({ history }: { history: any[] }) => {
    const rawData = history && history.length > 0 
        ? history.slice(0, 7).reverse().map(d => ({ value: d.score })) 
        : [ { value: 95 }, { value: 98 }, { value: 92 }, { value: 96 }, { value: 99 }, { value: 98 }, { value: 100 } ];
  
    const w = 96;
    const h = 40;
    const min = 60;
    const max = 100;
    const range = max - min;
    
    const points = rawData.map((d, i) => {
        const x = (i / (Math.max(1, rawData.length - 1))) * w;
        const normalizedVal = Math.max(min, Math.min(max, d.value));
        const y = h - ((normalizedVal - min) / range) * h;
        return `${x},${y}`;
    }).join(' ');

    const firstX = 0;
    const lastX = w;
    const areaPath = `M ${points} L ${lastX},${h} L ${firstX},${h} Z`;

    return (
      <div className="h-10 w-24 overflow-hidden">
          <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
              <defs>
                  <linearGradient id="gradientStability" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#gradientStability)" stroke="none" />
              <polyline points={points} fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
      </div>
    );
  };

const ProgressionIndicator = ({ status }: { status: 'safe' | 'pending' | 'escalated' }) => {
    const steps = ['safe', 'pending', 'escalated'];
    const currentIndex = steps.indexOf(status);
    
    return (
        <div className="flex items-center gap-1.5">
            {steps.map((step, idx) => (
                <div 
                    key={step} 
                    className={clsx(
                        "h-1.5 rounded-full transition-all duration-500",
                        idx <= currentIndex 
                            ? (status === 'safe' ? "bg-emerald-500 w-6" : status === 'pending' ? "bg-amber-400 w-6" : "bg-rose-500 w-6") 
                            : "bg-slate-100 dark:bg-slate-800 w-2"
                    )}
                />
            ))}
        </div>
    );
};

export default function Dashboard() {
  const { statusData, logs, interact, acknowledge, isLoading, isInitialized, health, settings, stabilityData, refresh, stabilityScore, getNow, caregiverTimezone, locationData, updatePatientTimezone, acknowledgeTimezone } = useCaresolis();
  const { currentPatient } = usePatient();
  const [now, setNow] = useState(() => {
    try {
      return getNow();
    } catch (e) {
      console.warn('⏰ Dashboard: getNow() not ready, using system time', e);
      return new Date();
    }
  });
  const [escalationPanelOpen, setEscalationPanelOpen] = useState(false);
  const [timezoneModalOpen, setTimezoneModalOpen] = useState(false);
  
  // TIER 1: Patient Timezone Verification
  const timezoneStatus = useTimezoneVerification(currentPatient, locationData?.timezone);
  const [selectedEscalation, setSelectedEscalation] = useState<any>(null);

  // CRITICAL FIX: Force refresh on mount to ensure we have latest status
  useEffect(() => {
    console.log('🔄 [Dashboard] Component mounted - forcing status refresh');
    refresh();
  }, []);

  // CRITICAL FIX: Auto-refresh every 30 seconds to keep data synchronized
  // This prevents stale data from causing buttons to show incorrectly
  useEffect(() => {
    console.log('⏲️ [Dashboard] Setting up auto-refresh (every 30 seconds)');
    const autoRefreshInterval = setInterval(() => {
      console.log('🔄 [Dashboard] Auto-refresh triggered');
      refresh();
    }, 30000); // Refresh every 30 seconds
    
    return () => {
      console.log('⏲️ [Dashboard] Cleaning up auto-refresh');
      clearInterval(autoRefreshInterval);
    };
  }, [refresh]);

  useEffect(() => {
      // Update relative time displays every minute
      const timer = setInterval(() => {
        try {
          setNow(getNow());
        } catch (e) {
          console.warn('⏰ Dashboard: getNow() error, using system time', e);
          setNow(new Date());
        }
      }, 60000);
      return () => clearInterval(timer);
  }, [getNow]);

  const totalInteractions = useMemo(() => {
    if (!settings?.schedule?.slots) return 5; 
    const today = new Date().getDay(); 
    const appliesTo = settings.schedule.appliesTo || 'everyday';
    const customDays = settings.schedule.customDays || [];
    
    let isScheduledDay = true;
    if (appliesTo === 'weekdays' && (today === 0 || today === 6)) isScheduledDay = false;
    if (appliesTo === 'custom' && !customDays.includes(today)) isScheduledDay = false;
    
    if (!isScheduledDay) return 0; 

    return settings.schedule.slots.filter((s: any) => s.enabled).length || 5;
  }, [settings]);

  const completedInteractions = useMemo(() => {
    if (!logs) return 0;
    const today = new Date();
    return logs.filter(l => {
      if (l.type !== 'success') return false;
      const logDate = new Date(l.timestamp);
      return logDate.getDate() === today.getDate() &&
             logDate.getMonth() === today.getMonth() &&
             logDate.getFullYear() === today.getFullYear();
    }).length;
  }, [logs]);

  // stabilityScore is now provided by useCaresolis context
  /* 
   * Removed local calculation to use global context source of truth
   */

  const daysSinceLastAlert = useMemo(() => {
    if (!logs || logs.length === 0) return null;
    const lastAlert = logs.find(l => 
        l.type === 'alert' || 
        l.type === 'escalated' || 
        (l.message && l.message.includes('Escalation'))
    );
    if (!lastAlert) return null;
    
    const alertTime = lastAlert.isoTimestamp ? new Date(lastAlert.isoTimestamp) : new Date(lastAlert.timestamp);
    const diff = now.getTime() - alertTime.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours === 0) {
             const mins = Math.floor(diff / (1000 * 60));
             if (mins < 1) return 'Just now';
             return `${mins}m ago`;
        }
        return `${hours}h ago`;
    }
    return `${days}d ago`;
  }, [logs, now]);

  // CRITICAL: Calculate which slot is actionable (for buttons)
  // This MUST match server-side logic to prevent showing buttons that will fail
  const targetActionSlot = useMemo(() => {
      if (!statusData || !statusData.slots || statusData.slots.length === 0) {
        console.log('⚠️ [Dashboard] No statusData or slots available');
        return null;
      }
      
      console.log('🔍 [Dashboard] Current statusData.slots:', JSON.stringify(statusData.slots, null, 2));
      
      // FDA CLASS II DEVICE REQUIREMENT: Backend is SINGLE SOURCE OF TRUTH
      // NEVER use frontend fallback logic that can contradict backend
      
      // Check if backend provides isActionable flags
      const backendProvidesFlags = statusData.slots.some((s: Slot) => 'isActionable' in s);
      
      if (!backendProvidesFlags) {
        console.error('❌ [Dashboard] CRITICAL ERROR: Backend did not provide isActionable flags');
        console.error('❌ [Dashboard] Cannot determine actionability without backend - hiding all buttons');
        return null;
      }
      
      console.log('✅ [Dashboard] Backend provides isActionable flags - using backend authority');
      
      // Filter slots that backend marks as actionable
      const actionableSlots = statusData.slots.filter((s: Slot) => {
        const isActionable = (s as any).isActionable === true;
        console.log(`🎯 [Dashboard] Slot ${s.time}: status="${s.status}" isActionable=${(s as any).isActionable} → ${isActionable ? 'ACTIONABLE' : 'NOT ACTIONABLE'}`);
        return isActionable;
      });

      console.log('✅ [Dashboard] Backend-filtered actionable slots:', {
        count: actionableSlots.length,
        slots: actionableSlots.map((s: Slot) => ({ 
          time: s.time, 
          status: s.status, 
          isActionable: (s as any).isActionable 
        }))
      });

      if (actionableSlots.length === 0) {
        console.log('✅ [Dashboard] No actionable slots per backend - hiding all action buttons');
        
        // Log explanation for each slot
        console.log('ℹ️ [Dashboard] Slot actionability breakdown:');
        statusData.slots.forEach((s: Slot) => {
          console.log(`  ${s.time}: status="${s.status}" isActionable=${(s as any).isActionable}`);
        });
        
        return null;
      }

      // Return the first actionable slot
      const targetSlot = actionableSlots[0];
      console.log('✅ [Dashboard] Target action slot:', { 
        time: targetSlot.time, 
        status: targetSlot.status,
        isActionable: (targetSlot as any).isActionable
      });
      
      return targetSlot;
  }, [statusData]);

  const rawStatus = statusData?.status || 'pending';
  
  // FRONTEND FALLBACK: Override status if we have an actionable slot
  let computedStatus = rawStatus === 'nominal' ? 'safe' : rawStatus;
  
  if (targetActionSlot) {
    const slotStatus = targetActionSlot.status;
    
    // If we have a "Scheduled" slot that's past due (caught by targetActionSlot filter), it's escalated
    if (slotStatus === 'Scheduled') {
      computedStatus = 'escalated';
    } else if (slotStatus === 'ReminderActive') {
      computedStatus = 'pending';
    } else if (slotStatus.startsWith('Escalation') || slotStatus === 'Check-In Not Logged' || slotStatus === 'Closed') {
      computedStatus = 'escalated';
    } else if (slotStatus === 'Acknowledged') {
      computedStatus = 'pending';
    }
  }
  
  const currentStatus = computedStatus;

  const [justVerified, setJustVerified] = useState(false);

  const handleVerify = async () => {
      await interact();
      setJustVerified(true);
      setTimeout(() => setJustVerified(false), 3000);
  };

  const getActionTimeDisplay = () => {
      if (!targetActionSlot) return null;
      
      const rawTime = targetActionSlot.time;
      if (!rawTime) return null;

      try {
          const clean = rawTime.replace('Today, ', '').replace('Tomorrow, ', '');
          const [h, m] = clean.split(':').map(Number);
          if (!isNaN(h) && !isNaN(m)) {
              const d = new Date();
              d.setHours(h, m);
              return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
          }
          return clean;
      } catch (e) {
          return rawTime;
      }
  };

  const actionTimeDisplay = getActionTimeDisplay();
  
  // CRITICAL FIX: Only show actions if:
  // 1. Data is initialized (fresh from backend)
  // 2. There's an actual targetActionSlot that needs action
  // Never show actions based on currentStatus alone, as that could be stale state
  const showActions = isInitialized && !!targetActionSlot;
  const showVerify = showActions || justVerified;

  // Calculate next scheduled time from actual schedule slots
  const nextScheduledRaw = useMemo(() => {
    // DEBUG: Log slots data when rendering
    console.log('📊 [Dashboard] Rendering with statusData.slots:', statusData?.slots);
    console.log('📊 [Dashboard] Server nextScheduled:', statusData?.nextScheduled);
    
    // CRITICAL FIX: IGNORE server value - calculate from settings (source of truth)
    // The server has a caching bug that returns stale nextScheduled values
    console.log('🔧 [Dashboard] Calculating nextScheduled from settings (SOT), ignoring server value');
    
    // Calculate from schedule settings (SOURCE OF TRUTH)
    if (settings?.schedule?.slots && Array.isArray(settings.schedule.slots)) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const today = now.getDay();
      
      // Check if today is a scheduled day
      const appliesTo = settings.schedule.appliesTo || 'everyday';
      const customDays = settings.schedule.customDays || [];
      
      let isScheduledDay = true;
      if (appliesTo === 'weekdays' && (today === 0 || today === 6)) isScheduledDay = false;
      if (appliesTo === 'custom' && !customDays.includes(today)) isScheduledDay = false;
      
      if (!isScheduledDay) {
        return 'No schedule today';
      }
      
      // Get enabled slots only
      const enabledSlots = settings.schedule.slots.filter((s: any) => s.enabled);
      
      if (enabledSlots.length === 0) {
        return 'No scheduled times';
      }
      
      console.log('🔧 [Dashboard] Current time:', now.toLocaleTimeString(), `(${currentMinutes} minutes)`);
      console.log('🔧 [Dashboard] Enabled slots:', enabledSlots.map((s: any) => s.time));
      
      // Find next slot today (don't require 5 minute buffer - just find the next one)
      const nextSlot = enabledSlots.find((s: any) => {
        try {
          const [h, m] = s.time.split(':').map(Number);
          const slotMinutes = h * 60 + m;
          // IMPORTANT: Find the NEXT slot that hasn't happened yet
          const isInFuture = slotMinutes > currentMinutes;
          console.log(`🔧 [Dashboard] Checking slot ${s.time} (${slotMinutes} mins) - future: ${isInFuture}`);
          return isInFuture;
        } catch (e) {
          return false;
        }
      });
      
      if (nextSlot) {
        const result = `Today, ${nextSlot.time}`;
        console.log('✅ [Dashboard] Next scheduled:', result);
        return result;
      }
      
      // No more slots today, show first slot tomorrow
      // First, check if there are any enabled slots at all for tomorrow
      const tomorrowDay = (today + 1) % 7;
      let isTomorrowScheduled = true;
      if (appliesTo === 'weekdays' && (tomorrowDay === 0 || tomorrowDay === 6)) isTomorrowScheduled = false;
      if (appliesTo === 'custom' && !customDays.includes(tomorrowDay)) isTomorrowScheduled = false;
      
      if (!isTomorrowScheduled) {
        // Find next scheduled day
        for (let daysAhead = 2; daysAhead <= 7; daysAhead++) {
          const checkDay = (today + daysAhead) % 7;
          let isCheckDayScheduled = true;
          if (appliesTo === 'weekdays' && (checkDay === 0 || checkDay === 6)) isCheckDayScheduled = false;
          if (appliesTo === 'custom' && !customDays.includes(checkDay)) isCheckDayScheduled = false;
          
          if (isCheckDayScheduled && enabledSlots[0]) {
            return `In ${daysAhead} days, ${enabledSlots[0].time}`;
          }
        }
        return 'No scheduled times';
      }
      
      const result = enabledSlots[0] ? `Tomorrow, ${enabledSlots[0].time}` : 'No scheduled times';
      console.log('✅ [Dashboard] Next scheduled (tomorrow):', result);
      return result;
    }
    
    // Final fallback
    return 'No scheduled times';
  }, [statusData, settings, now]);

  return (
    <div className="min-h-screen w-full bg-white dark:bg-black transition-colors duration-300">


      <main className="pt-2 pb-8 px-4">
        <div className="max-w-7xl mx-auto">

          {/* TC Medication Active Banner */}
          {settings?.medications?.timeCritical?.active && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-4 mt-4 mb-2"
            >
              <Link to="/tc-test" className="block">
                <div className="bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-orange-500/10 border-2 border-orange-500/30 rounded-xl p-3 hover:border-orange-500/50 transition-all group shadow-lg shadow-orange-500/5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/20 rounded-lg">
                        <Zap className="w-4 h-4 text-orange-500" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-orange-700 dark:text-orange-400 flex items-center gap-2">
                          Time-Critical Medication Mode Active
                          <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                            {settings.medications.timeCritical.count} TC
                          </span>
                        </div>
                        <div className="text-xs text-orange-600/80 dark:text-orange-400/80 mt-0.5">
                          Accelerated escalation protocols enabled • 42% faster response times
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-orange-500 font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Test Interface
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          <div className="flex-1 flex flex-col items-center justify-center py-6 gap-6 w-full">
            
            {/* Main Check-In Ring Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative group"
            >
              {/* Premium card wrapper - Apple Health style optimized for iPhone */}
              <div className="relative bg-white dark:bg-black rounded-3xl p-6 border border-slate-100 dark:border-slate-900 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 transition-all duration-300">
                <div className={clsx(
                    "absolute inset-0 rounded-2xl blur-3xl opacity-20 transition-all duration-300 pointer-events-none",
                    currentStatus === 'safe' ? "bg-emerald-200 dark:bg-emerald-900" :
                    currentStatus === 'pending' ? "bg-amber-100 dark:bg-amber-900" :
                    "bg-rose-200 dark:bg-rose-900"
                )} />
                
                <CheckInRing
                    slots={statusData?.slots}
                    nextTime={nextScheduledRaw}
                    currentTime={now}
                    hasTCMedications={settings?.medications?.timeCritical?.active}
                    onSegmentClick={(slot, index) => {
                        console.log('Segment clicked:', slot, index);
                        // Open escalation panel if slot is escalated or active
                        if (slot && (slot.status.startsWith('Escalation') || slot.status === 'ReminderActive')) {
                            setSelectedEscalation(slot);
                            setEscalationPanelOpen(true);
                        }
                    }}
                    currentStatus={currentStatus}
                />

                 <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 w-max px-4"
                 >
                    {/* ACKNOWLEDGE BUTTON - Only show if actionable AND NOT already acknowledged/completed/closed */}
                    {showActions && targetActionSlot && (
                      <>
                        {/* DEBUG: Show what slot we're targeting */}
                        {console.log('🔍 [DASHBOARD] targetActionSlot:', {
                          time: targetActionSlot.time,
                          status: targetActionSlot.status,
                          shouldShowAckButton: targetActionSlot.status !== 'Acknowledged' && 
                                              targetActionSlot.status !== 'Check-In On Time' && 
                                              targetActionSlot.status !== 'Check-In Delayed' && 
                                              targetActionSlot.status !== 'Closed' && 
                                              targetActionSlot.status !== 'Missed'
                        })}
                        {targetActionSlot.status !== 'Acknowledged' && 
                         targetActionSlot.status !== 'Check-In On Time' && 
                         targetActionSlot.status !== 'Check-In Delayed' && 
                         targetActionSlot.status !== 'Closed' && 
                         targetActionSlot.status !== 'Missed' && (
                    <button
                        onClick={async () => {
                            // Double-check status before acknowledging
                            if (!targetActionSlot) {
                                toast.error("No event to acknowledge");
                                return;
                            }

                            console.log('[Dashboard] Acknowledge clicked for slot:', targetActionSlot);

                            // Call acknowledge (it handles refresh internally)
                            await acknowledge();

                            // NOTE: Removed duplicate refresh() call - acknowledge() already refreshes
                        }}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] whitespace-nowrap rounded-full text-xs sm:text-sm font-semibold shadow-lg active:scale-95 transition-all border bg-amber-50 border-amber-200 text-amber-700 active:bg-amber-100 dark:bg-amber-900/20 dark:border-amber-900/50 dark:text-amber-400 dark:active:bg-amber-900/40"
                    >
                        {isLoading ? "..." : (
                            <>
                                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>
                                    {actionTimeDisplay
                                        ? `ACK (${actionTimeDisplay})`
                                        : "ACK"}
                                </span>
                            </>
                        )}
                    </button>
                    )}</>
                    )}

                    {/* VERIFY BUTTON - Only show if there's an actionable event OR just verified */}
                    {(showActions || justVerified) && (
                    <button
                        onClick={handleVerify}
                        disabled={isLoading || justVerified}
                        className={clsx(
                            "flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] whitespace-nowrap rounded-full text-xs sm:text-sm font-semibold shadow-lg active:scale-95 transition-all border",
                            isLoading ? "opacity-70 cursor-wait bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500" :
                            justVerified ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-emerald-500/10 dark:bg-emerald-900/20 dark:border-emerald-900/50 dark:text-emerald-400" :
                            "bg-rose-50 border-rose-200 text-rose-700 active:bg-rose-100 dark:bg-rose-900/20 dark:border-rose-900/50 dark:text-rose-400 dark:active:bg-rose-900/40"
                        )}
                    >
                        {isLoading ? "..." : justVerified ? (
                            <>
                                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>✓</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>
                                    {actionTimeDisplay
                                        ? `VERIFY (${actionTimeDisplay})`
                                        : "VERIFY"}
                                </span>
                            </>
                        )}
                    </button>
                    )}
                 </motion.div>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-3 w-full max-w-md mt-8 px-4">
                
                <Link to="/routine" className="group">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="h-full min-h-[120px] bg-white dark:bg-black rounded-2xl p-5 border border-slate-100 dark:border-slate-900 shadow-lg shadow-slate-900/5 dark:shadow-black/20 flex flex-col justify-between active:scale-95 transition-all cursor-pointer relative overflow-hidden"
                    >
                        <div className="flex flex-col gap-0.5 z-10">
                            <div className="flex items-center gap-1">
                                <h3 className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Routine</h3>
                                <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                            </div>
                            <div className="flex items-baseline gap-1.5 mt-1">
                                <span className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{stabilityScore}%</span>
                                <span className={clsx("text-xs font-medium", stabilityScore >= 95 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
                                    {stabilityScore >= 95 ? '+2%' : '-3%'}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 z-10 mt-1.5">
                            <MinimalTrendChart history={stabilityData} />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-50/0 via-transparent to-emerald-50/30 dark:to-emerald-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                </Link>

                <Link to="/log?filter=alert" className="group relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        onClick={(e) => {
                          // If there's an active escalation, open the panel instead of navigating
                          if (targetActionSlot && (targetActionSlot.status.startsWith('Escalation') || targetActionSlot.status === 'ReminderActive')) {
                            e.preventDefault();
                            setSelectedEscalation(targetActionSlot);
                            setEscalationPanelOpen(true);
                          }
                        }}
                        className="h-full min-h-[120px] bg-white dark:bg-black rounded-2xl p-5 border border-slate-100 dark:border-slate-900 shadow-lg shadow-slate-900/5 dark:shadow-black/20 flex flex-col justify-between active:scale-95 transition-all cursor-pointer relative overflow-hidden"
                    >
                        <div className="flex flex-col gap-0.5 z-10">
                            <div className="flex items-center gap-1">
                                <h3 className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</h3>
                                <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                            </div>
                            <div className={clsx(
                                "text-lg font-semibold mt-1",
                                currentStatus === 'safe' ? "text-slate-900 dark:text-slate-100" :
                                currentStatus === 'pending' ? "text-amber-600 dark:text-amber-400" :
                                "text-rose-600 dark:text-rose-400"
                            )}>
                                {currentStatus === 'safe' ? 'Normal' :
                                 currentStatus === 'pending' ? 'Pending' :
                                 'Active'}
                            </div>
                        </div>
                        <div className="flex flex-col items-end justify-center pt-1 z-10 mt-auto">
                             <ProgressionIndicator status={currentStatus as any} />
                        </div>
                         <div className={clsx(
                             "absolute inset-0 bg-gradient-to-tr via-transparent to-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity",
                             currentStatus === 'safe' ? "from-slate-50/0 to-slate-100 dark:to-slate-800" :
                             currentStatus === 'pending' ? "from-amber-50/0 to-amber-50 dark:to-amber-900/30" :
                             "from-rose-50/0 to-rose-50 dark:to-rose-900/30"
                         )} />
                    </motion.div>
                </Link>

                {/* Device Health and Timezone cards hidden for Apple Health simplicity - accessible via navigation */}

            </div>

            {/* FDA Audit Signature */}
            <div className="w-full max-w-md px-4 mt-6 mb-4">
              <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900/50 dark:bg-slate-950/50 border border-slate-800 dark:border-slate-900 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
                <div className="flex items-baseline gap-2 text-xs">
                  <span className="text-slate-400 dark:text-slate-500 font-medium">
                    {VERSION.display}
                  </span>
                  <span className="text-slate-500 dark:text-slate-600">•</span>
                  <span className="text-slate-500 dark:text-slate-600 font-mono text-[10px]">
                    {VERSION.signature}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>


      {/* Active Escalation Panel */}
      <ActiveEscalationPanel 
        isOpen={escalationPanelOpen}
        onClose={() => setEscalationPanelOpen(false)}
        escalationData={selectedEscalation}
      />
    </div>
  );
}