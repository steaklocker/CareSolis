import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useCaresolis } from '../hooks/useCaresolis';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useDrag, useDrop } from 'react-dnd';
import { Plus, GripVertical, Clock, Trash2, Calendar, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '../components/ui/utils';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useAuth } from '../context/AuthContext';
import { usePatient } from '../context/PatientContext';
import { PageHeader } from '../components/PageHeader';
import { TimezoneAwarenessBanner } from '../components/TimezoneAwarenessBanner';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;

// Types
interface ScheduleSlot {
  id: string;
  time: string; // HH:mm
  enabled: boolean;
}

interface ScheduleConfig {
  appliesTo: 'everyday' | 'weekdays' | 'custom';
  customDays: number[]; // 0-6
  slots: ScheduleSlot[];
}

const ItemType = 'SCHEDULE_SLOT';
const MAX_SLOTS = 7;
const MIN_SLOTS = 3;

// Helper to sort times
const sortSlots = (slots: ScheduleSlot[]) => {
  return [...slots].sort((a, b) => a.time.localeCompare(b.time));
};

// Draggable Slot Component
const DraggableSlot = ({ 
  slot, 
  index, 
  moveSlot, 
  onDelete, 
  onToggle, 
  onEdit, 
  isDeleteDisabled 
}: {
  slot: ScheduleSlot;
  index: number;
  moveSlot: (dragIndex: number, hoverIndex: number) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onEdit: (slot: ScheduleSlot) => void;
  isDeleteDisabled: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ handlerId }, drop] = useDrop({
    accept: ItemType,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as any).y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveSlot(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { id: slot.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      data-handler-id={handlerId}
      className={cn(
        "flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border rounded-xl transition-all group",
        isDragging ? "opacity-50 border-emerald-200 dark:border-emerald-800 shadow-md scale-[1.02]" : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 shadow-sm"
      )}
    >
      <div className="cursor-grab text-slate-300 hover:text-slate-500 active:cursor-grabbing p-1" aria-label="Drag to reorder">
        <GripVertical size={20} />
      </div>

      <div className="flex-1" onClick={() => onEdit(slot)}>
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="text-xl font-medium text-slate-900 dark:text-slate-100 tabular-nums tracking-tight">
            {new Date(`2000-01-01T${slot.time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase()}
          </div>
          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800">
            Check-In {index + 1}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Switch 
          checked={slot.enabled} 
          onCheckedChange={() => onToggle(slot.id)}
          className="data-[state=checked]:bg-emerald-600"
        />
        
        <div className="w-px h-8 bg-slate-100 mx-1" />
        
        <button
          onClick={() => {
            if (isDeleteDisabled) {
              toast.error(`Minimum ${MIN_SLOTS} times required`);
            } else {
              onDelete(slot.id);
            }
          }}
          disabled={isDeleteDisabled}
          className={cn(
            "p-2 rounded-full transition-colors",
            isDeleteDisabled 
              ? "text-slate-200 cursor-not-allowed" 
              : "text-slate-400 hover:text-rose-500 hover:bg-rose-50"
          )}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default function ScheduleSettings() {
  const { settings, updateSettings, refresh } = useCaresolis();
  const [loading, setLoading] = useState(false);

  // State
  const [appliesTo, setAppliesTo] = useState<'everyday' | 'weekdays' | 'custom'>('everyday');
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [slots, setSlots] = useState<ScheduleSlot[]>([
    { id: '1', time: '09:00', enabled: true },
    { id: '2', time: '11:00', enabled: true },
    { id: '3', time: '13:00', enabled: true },
    { id: '4', time: '15:00', enabled: true },
    { id: '5', time: '17:00', enabled: true },
  ]);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
  const [editTime, setEditTime] = useState("");

  const [vacationMode, setVacationMode] = useState(false);
  const [vacationStartDate, setVacationStartDate] = useState("");
  const [vacationEndDate, setVacationEndDate] = useState("");
  const [vacationReason, setVacationReason] = useState("");
  const [showBillingWarning, setShowBillingWarning] = useState(false);
  const { user } = useAuth();
  const { currentPatient } = usePatient();

  // Load initial settings
  useEffect(() => {
    console.log('[SCHEDULE_SETTINGS] Settings changed, reloading UI:', {
      hasSchedule: !!settings?.schedule,
      slotCount: settings?.schedule?.slots?.length || 0,
      slots: settings?.schedule?.slots?.map((s: ScheduleSlot) => ({ id: s.id, time: s.time, enabled: s.enabled })) || []
    });
    
    if (settings?.schedule) {
      setAppliesTo(settings.schedule.appliesTo || 'everyday');
      setCustomDays(settings.schedule.customDays || []);
      // Always update slots when settings change - the backend is the source of truth
      if (settings.schedule.slots && Array.isArray(settings.schedule.slots)) {
        console.log('[SCHEDULE_SETTINGS] Loading', settings.schedule.slots.length, 'slots from backend');
        setSlots(settings.schedule.slots);
      }
    }
    if (settings?.vacationMode) {
        setVacationMode(settings.vacationMode.enabled);
        if (settings.vacationMode.startDate) {
          setVacationStartDate(settings.vacationMode.startDate);
        }
        if (settings.vacationMode.endDate) {
          setVacationEndDate(settings.vacationMode.endDate);
        }
        if (settings.vacationMode.reason) {
          setVacationReason(settings.vacationMode.reason);
        }
    }
  }, [settings]);

  // Drag and Drop Handler
  const moveSlot = useCallback((dragIndex: number, hoverIndex: number) => {
    setSlots((prevSlots) => {
      const newSlots = [...prevSlots];
      const [draggedSlot] = newSlots.splice(dragIndex, 1);
      newSlots.splice(hoverIndex, 0, draggedSlot);
      return newSlots;
    });
  }, []);

  // Handlers
  const handleDelete = (id: string) => {
    if (slots.length <= MIN_SLOTS) {
      toast.error(`Minimum ${MIN_SLOTS} check-in times required`);
      return;
    }
    const newSlots = slots.filter(s => s.id !== id);
    setSlots(newSlots);
    
    // Auto-save when deleting
    autoSaveSchedule(newSlots, appliesTo, customDays);
  };

  const handleToggle = (id: string) => {
    const newSlots = slots.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
    setSlots(newSlots);
    
    // Auto-save when toggling
    autoSaveSchedule(newSlots, appliesTo, customDays);
  };
  
  const handleVacationToggle = (enabled: boolean) => {
      setVacationMode(enabled);
      
      // Auto-set dates if turning on and dates are empty
      if (enabled && !vacationStartDate) {
        const today = new Date().toISOString().split('T')[0];
        setVacationStartDate(today);
      }
      
      // Enhanced vacation mode config with FDA compliance fields
      updateSettings({
          ...settings,
          vacationMode: { 
            enabled,
            startDate: vacationStartDate || new Date().toISOString().split('T')[0],
            endDate: vacationEndDate,
            reason: vacationReason,
            enabledBy: user?.id || 'UNKNOWN',
            enabledAt: new Date().toISOString()
          }
      });
      
      // Show success message with Care Circle notification info
      if (enabled) {
        toast.success("Vacation Mode Enabled - Care Circle will be notified");
      } else {
        toast.success("Vacation Mode Disabled - Normal monitoring resumed");
      }
  };

  const handleVacationDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setVacationStartDate(value);
    } else {
      setVacationEndDate(value);
    }
    
    updateSettings({
      ...settings,
      vacationMode: {
        enabled: vacationMode,
        startDate: type === 'start' ? value : vacationStartDate,
        endDate: type === 'end' ? value : vacationEndDate,
        reason: vacationReason,
        enabledBy: user?.id || settings?.vacationMode?.enabledBy || 'UNKNOWN',
        enabledAt: settings?.vacationMode?.enabledAt || new Date().toISOString()
      }
    });
  };

  const handleVacationReasonChange = (value: string) => {
    setVacationReason(value);
    
    updateSettings({
      ...settings,
      vacationMode: {
        enabled: vacationMode,
        startDate: vacationStartDate,
        endDate: vacationEndDate,
        reason: value,
        enabledBy: user?.id || settings?.vacationMode?.enabledBy || 'UNKNOWN',
        enabledAt: settings?.vacationMode?.enabledAt || new Date().toISOString()
      }
    });
  };

  const handleAddSlot = () => {
    if (slots.length >= MAX_SLOTS) return;
    
    // Find a gap or add after last
    // Simple logic: add 1 hour after last slot, wrap around if needed, or just default to 12:00
    const lastTime = slots[slots.length - 1]?.time || "09:00";
    const [h, m] = lastTime.split(':').map(Number);
    let newH = h + 2;
    if (newH > 23) newH = 8;
    const newTime = `${newH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    
    const newSlots = [...slots, {
      id: Math.random().toString(36).substr(2, 9),
      time: newTime,
      enabled: true
    }];
    
    setSlots(newSlots);
    
    // Auto-save when adding a slot
    autoSaveSchedule(newSlots, appliesTo, customDays);
  };

  const handleEditOpen = (slot: ScheduleSlot) => {
    setEditingSlot(slot);
    setEditTime(slot.time);
    setIsEditOpen(true);
  };

  const handleEditSave = () => {
    if (!editingSlot) return;
    const newSlots = slots.map(s => s.id === editingSlot.id ? { ...s, time: editTime } : s);
    setSlots(newSlots);
    setIsEditOpen(false);
    setEditingSlot(null);
    
    // Auto-save when time is edited
    autoSaveSchedule(newSlots, appliesTo, customDays);
  };

  const handleSave = async () => {
    console.log('[SCHEDULE_SETTINGS] 🚀 Save button clicked!');
    
    try {
      // Validation
      const enabledCount = slots.filter(s => s.enabled).length;
      console.log('[SCHEDULE_SETTINGS] Enabled slot count:', enabledCount, 'Required:', MIN_SLOTS);
      
      if (enabledCount < MIN_SLOTS) {
        console.log('[SCHEDULE_SETTINGS] ❌ Validation failed - not enough enabled slots');
        toast.error(`At least ${MIN_SLOTS} check-in times must be enabled.`);
        return;
      }

      console.log('[SCHEDULE_SETTINGS] ✅ Validation passed, proceeding with save...');
      setLoading(true);
      
      console.log('[SCHEDULE_SETTINGS] Preparing to save schedule...');
      console.log('[SCHEDULE_SETTINGS] Current slots:', {
        slotCount: slots.length,
        slots: slots.map(s => ({ id: s.id, time: s.time, enabled: s.enabled }))
      });
      
      const newSettings = {
        ...settings,
        schedule: {
          appliesTo,
          customDays,
          slots
        }
      };

      console.log('[SCHEDULE_SETTINGS] Full settings being saved:', {
        hasSchedule: !!newSettings.schedule,
        slotCount: newSettings.schedule.slots.length,
        appliesTo: newSettings.schedule.appliesTo,
        patientId: currentPatient?.id || '1'
      });

      console.log('[SCHEDULE_SETTINGS] Calling updateSettings...');
      await updateSettings(newSettings);
      
      console.log('[SCHEDULE_SETTINGS] Settings saved successfully');
      
      // Wait briefly for backend to complete, then fetch to verify
      setTimeout(() => {
        console.log('[SCHEDULE_SETTINGS] Requesting settings reload to verify save...');
        refresh(); // This will reload settings from backend
      }, 500);
      
      setLoading(false);
      toast.success("Schedule updated successfully");
    } catch (error) {
      console.error('[SCHEDULE_SETTINGS] ❌ ERROR during save:', error);
      toast.error("Failed to save schedule: " + error.message);
      setLoading(false);
    }
  };

  const toggleCustomDay = (dayIndex: number) => {
    const newCustomDays = customDays.includes(dayIndex)
      ? customDays.filter(d => d !== dayIndex)
      : [...customDays, dayIndex];
    
    setCustomDays(newCustomDays);
    
    // Auto-save when custom days change
    autoSaveSchedule(slots, appliesTo, newCustomDays);
  };
  
  const handleAppliesToChange = (newAppliesTo: 'everyday' | 'weekdays' | 'custom') => {
    setAppliesTo(newAppliesTo);
    
    // Auto-save when "Applies To" changes
    autoSaveSchedule(slots, newAppliesTo, customDays);
  };

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // FDA-Compliant Audit Logging Function
  const logScheduleChange = async (action: string, details: string, changeData: any) => {
    try {
      const patientId = currentPatient?.id || '1';
      const userId = user?.id || user?.email || 'UNKNOWN_USER';
      
      // Console logging for development/debugging
      console.log('[FDA_AUDIT_LOG] Schedule Change:', {
        timestamp: new Date().toISOString(),
        action,
        actor: userId,
        details,
        patientId,
        changeData
      });
      
      // Send audit log to backend
      await fetch(`${SERVER_URL}/audit-log`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          actor: userId,
          details,
          patientId,
          metadata: {
            ...changeData,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        })
      });
      
      // Update dynamic manual with change notification
      await updateManualForScheduleChange(action, details);
    } catch (error) {
      console.error('[FDA_AUDIT_LOG] Failed to log change:', error);
      // Don't block the user if logging fails, but log the error
    }
  };

  // Dynamic Manual Update Function
  const updateManualForScheduleChange = async (action: string, details: string) => {
    try {
      // This will trigger a manual update notification in the system
      await fetch(`${SERVER_URL}/manual-update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          section: 'schedule-settings',
          changeType: action,
          description: details,
          timestamp: new Date().toISOString(),
          updatedBy: user?.id || user?.email || 'UNKNOWN_USER'
        })
      }).catch(err => {
        console.warn('[MANUAL_UPDATE] Failed to update manual, but continuing:', err);
      });
    } catch (error) {
      console.warn('[MANUAL_UPDATE] Manual update failed (non-blocking):', error);
    }
  };
  
  // Auto-save function
  const autoSaveSchedule = async (newSlots: ScheduleSlot[], newAppliesTo: 'everyday' | 'weekdays' | 'custom', newCustomDays: number[]) => {
    try {
      const newSettings = {
        ...settings,
        schedule: {
          appliesTo: newAppliesTo,
          customDays: newCustomDays,
          slots: newSlots
        }
      };

      console.log('[SCHEDULE_SETTINGS] Auto-saving schedule:', {
        hasSchedule: !!newSettings.schedule,
        slotCount: newSettings.schedule.slots.length,
        appliesTo: newSettings.schedule.appliesTo,
        patientId: currentPatient?.id || '1'
      });

      console.log('[SCHEDULE_SETTINGS] Calling updateSettings...');
      await updateSettings(newSettings);
      
      console.log('[SCHEDULE_SETTINGS] ✅ Settings permanently saved to database');
      
      // CRITICAL: Force refresh after save to ensure Dashboard gets updated data
      console.log('[SCHEDULE_SETTINGS] 🔄 Forcing refresh to update Dashboard...');
      setTimeout(() => {
        refresh(); // Force refresh all data including settings
      }, 300);
      
      // FDA-compliant audit logging (non-blocking - don't wait for it)
      logScheduleChange(
        'SCHEDULE_AUTO_SAVE',
        `Schedule auto-saved: ${newSlots.length} slots, applies to: ${newAppliesTo}`,
        {
          slotCount: newSlots.length,
          slots: newSlots.map(s => ({ id: s.id, time: s.time, enabled: s.enabled })),
          appliesTo: newAppliesTo,
          customDays: newCustomDays,
          savedAt: new Date().toISOString(),
          persistenceVerified: true
        }
      ).catch(err => console.warn('[AUDIT_LOG] Non-blocking audit log failed:', err));
      
      toast.success("✅ Schedule saved");
    } catch (error) {
      console.error('[SCHEDULE_SETTINGS] ❌ ERROR during auto-save:', error);
      toast.error("Failed to save schedule: " + error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <PageHeader
        title="Schedule"
        subtitle="Set 3–7 daily check-in times"
      />

      {/* Timezone Awareness Banner */}
      <div className="mb-6">
        <TimezoneAwarenessBanner />
      </div>

      <div className="space-y-8">
        
        {/* ===== VACATION MODE TOGGLE - THIS IS WHERE ADMIN ACTIVATES VACATION MODE ===== */}
        {/* This card should be the FIRST thing visible on the page */}
        <div className={cn(
          "rounded-2xl p-6 border shadow-sm space-y-4 transition-all",
          vacationMode 
            ? "bg-amber-900 dark:bg-amber-950 border-amber-800 dark:border-amber-900" 
            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
        )}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className={cn(
                  "text-lg font-medium",
                  vacationMode 
                    ? "text-white dark:text-white" 
                    : "text-slate-900 dark:text-slate-200"
                )}>
                  Vacation Mode
                </h3>
                {vacationMode && (
                  <span className="text-xs font-semibold text-white bg-amber-800 dark:bg-amber-800 px-2 py-0.5 rounded-full border border-amber-700 dark:border-amber-700 flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300"></span>
                    </span>
                    ACTIVE
                  </span>
                )}
              </div>
              <p className={cn(
                "text-sm mt-1",
                vacationMode 
                  ? "text-amber-100 dark:text-amber-100" 
                  : "text-slate-500 dark:text-slate-400"
              )}>
                {vacationMode 
                  ? "All escalations are currently paused" 
                  : "Pause all escalations while the resident is away"}
              </p>
            </div>
            
            {/* VACATION MODE ACTIVATION BUTTON - CLICK HERE TO TOGGLE */}
            <button
              onClick={() => handleVacationToggle(!vacationMode)}
              className={cn(
                "px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-md",
                vacationMode
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-slate-900 hover:bg-slate-800 text-white"
              )}
            >
              {vacationMode ? "DISABLE" : "ENABLE"}
            </button>
          </div>

          <AnimatePresence>
            {vacationMode && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-amber-200 dark:border-amber-800/50">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-amber-900 dark:text-amber-100 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar size={14} />
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={vacationStartDate}
                      onChange={(e) => handleVacationDateChange('start', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-amber-900 dark:text-amber-100 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar size={14} />
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={vacationEndDate}
                      onChange={(e) => handleVacationDateChange('end', e.target.value)}
                      min={vacationStartDate}
                      className="w-full px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <label className="text-xs font-semibold text-amber-900 dark:text-amber-100 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle size={14} />
                    Reason
                  </label>
                  <input
                    type="text"
                    value={vacationReason}
                    onChange={(e) => handleVacationReasonChange(e.target.value)}
                    placeholder="e.g., Family vacation to Florida"
                    className="w-full px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                
                {vacationStartDate && vacationEndDate && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-800/50"
                  >
                    <p className="text-xs font-medium text-amber-900 dark:text-amber-100">
                      Escalations paused from{' '}
                      <span className="font-semibold">
                        {new Date(vacationStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {' '}to{' '}
                      <span className="font-semibold">
                        {new Date(vacationEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </p>
                  </motion.div>
                )}

                {vacationStartDate && !vacationEndDate && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-800/50"
                  >
                    <p className="text-xs font-medium text-amber-900 dark:text-amber-100">
                      Escalations paused starting{' '}
                      <span className="font-semibold">
                        {new Date(vacationStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {' '}(indefinitely until disabled)
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Applies To Section */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
          <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Applies To</label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'everyday', label: 'Every Day' },
              { id: 'weekdays', label: 'Weekdays' },
              { id: 'custom', label: 'Custom' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => handleAppliesToChange(option.id as any)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                  appliesTo === option.id
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md border-slate-900 dark:border-slate-100"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {appliesTo === 'custom' && (
            <div className="pt-2 flex gap-2">
              {weekDays.map((day, i) => (
                <button
                  key={i}
                  onClick={() => toggleCustomDay(i)}
                  className={cn(
                    "w-10 h-10 rounded-full text-xs font-medium transition-all",
                    customDays.includes(i)
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                  )}
                >
                  {day}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Time Slots List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Check-In Times</label>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
              {slots.length} / {MAX_SLOTS} Slots
            </span>
          </div>

          <div className="space-y-3">
             <AnimatePresence>
              {slots.map((slot, index) => (
                <DraggableSlot
                  key={slot.id}
                  index={index}
                  slot={slot}
                  moveSlot={moveSlot}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                  onEdit={handleEditOpen}
                  isDeleteDisabled={slots.length <= MIN_SLOTS}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddSlot}
            disabled={slots.length >= MAX_SLOTS}
            className={cn(
              "w-full py-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 font-medium transition-all",
              slots.length >= MAX_SLOTS
                ? "border-slate-100 text-slate-300 cursor-not-allowed"
                : "border-slate-200 text-slate-500 hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50/50"
            )}
          >
            <Plus size={20} />
            <span>Add Check-In Time</span>
          </button>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end pt-8 border-t border-slate-200">
           <Button 
            onClick={handleSave} 
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 rounded-xl text-lg shadow-emerald-200 shadow-lg"
          >
            {loading ? 'Saving...' : 'Save Schedule'}
          </Button>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Check-In Time</DialogTitle>
            <DialogDescription>
              Choose a new time for this check-in.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 flex justify-center">
            <div className="relative">
              <input
                type="time"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="text-4xl font-light p-4 bg-slate-50 rounded-xl border border-slate-200 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full"
              />
              <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={24} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSave} className="bg-emerald-600 hover:bg-emerald-700 text-white">Save Time</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}