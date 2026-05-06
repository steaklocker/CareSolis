import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Plus, Trash2, Save, AlertCircle, Info, Bell, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;

/**
 * MEDICATION SCHEDULING & TIMES
 * 
 * Centralized scheduling interface for all medications in the 2x25 blister pack system.
 * Maps blister pack positions to dose times and manages daily medication schedule.
 * Integrated into Medication Hub for seamless workflow.
 */

interface ScheduleSlot {
  id: string;
  time: string; // HH:MM format
  label: string; // "Morning", "Noon", "Evening", "Bedtime", etc.
  compartments: string[]; // Array of compartment IDs (e.g., ["A1", "B2"])
  enabled: boolean;
}

interface DailySchedule {
  slots: ScheduleSlot[];
  reminderEnabled: boolean;
  reminderLeadTime: number; // minutes before dose time
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Default schedule templates
const DEFAULT_SLOTS: ScheduleSlot[] = [
  { id: 'morning', time: '08:00', label: 'Morning', compartments: [], enabled: true },
  { id: 'noon', time: '12:00', label: 'Noon', compartments: [], enabled: false },
  { id: 'afternoon', time: '15:00', label: 'Afternoon', compartments: [], enabled: false },
  { id: 'evening', time: '18:00', label: 'Evening', compartments: [], enabled: false },
  { id: 'bedtime', time: '21:00', label: 'Bedtime', compartments: [], enabled: false }
];

export default function MedicationScheduling() {
  const [schedule, setSchedule] = useState<DailySchedule>({
    slots: DEFAULT_SLOTS,
    reminderEnabled: true,
    reminderLeadTime: 15
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Available blister pack positions (2x25 system)
  // Pack A: 25 positions, Pack B: 25 positions
  const rows = ['A', 'B'];
  const cols = Array.from({ length: 25 }, (_, i) => i + 1);
  const allCompartments = rows.flatMap(row => cols.map(col => `${row}${col}`));

  // Load schedule from backend
  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    setIsLoading(true);
    try {
      console.log('[FRONTEND] Loading medication schedule from server...');
      const res = await fetch(`${SERVER_URL}/medications/schedule`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('[FRONTEND] Received schedule data:', {
          hasSchedule: !!data.schedule,
          slotCount: data.schedule?.slots?.length || 0,
          slots: data.schedule?.slots?.map((s: any) => ({ time: s.time, label: s.label, enabled: s.enabled }))
        });
        if (data.schedule) {
          setSchedule(data.schedule);
          console.log('[FRONTEND] Schedule state updated with', data.schedule.slots.length, 'slots');
        }
      } else {
        console.error('[FRONTEND] Server returned error status:', res.status);
      }
    } catch (error) {
      console.error('[FRONTEND] Failed to load schedule:', error);
      toast.error('Failed to load medication schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSchedule = async () => {
    setIsSaving(true);
    try {
      console.log('[FRONTEND] Saving medication schedule to server...');
      console.log('[FRONTEND] Schedule being saved:', {
        slotCount: schedule.slots.length,
        slots: schedule.slots.map((s: any) => ({ 
          id: s.id,
          time: s.time, 
          label: s.label, 
          enabled: s.enabled,
          compartmentCount: s.compartments.length 
        }))
      });
      
      const res = await fetch(`${SERVER_URL}/medications/schedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ schedule })
      });

      if (res.ok) {
        const responseData = await res.json();
        console.log('[FRONTEND] Save successful! Server response:', responseData);
        toast.success('Medication schedule saved successfully');
        setHasChanges(false);
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[FRONTEND] Save failed with status:', res.status, errorData);
        throw new Error(errorData.error || 'Failed to save schedule');
      }
    } catch (error) {
      console.error('[FRONTEND] Failed to save schedule:', error);
      toast.error('Failed to save medication schedule');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSlot = (slotId: string, updates: Partial<ScheduleSlot>) => {
    setSchedule(prev => ({
      ...prev,
      slots: prev.slots.map(slot => 
        slot.id === slotId ? { ...slot, ...updates } : slot
      )
    }));
    setHasChanges(true);
  };

  const toggleCompartment = (slotId: string, compartment: string) => {
    setSchedule(prev => ({
      ...prev,
      slots: prev.slots.map(slot => {
        if (slot.id === slotId) {
          const hasCompartment = slot.compartments.includes(compartment);
          return {
            ...slot,
            compartments: hasCompartment
              ? slot.compartments.filter(c => c !== compartment)
              : [...slot.compartments, compartment]
          };
        }
        return slot;
      })
    }));
    setHasChanges(true);
  };

  const addCustomSlot = () => {
    const newSlot: ScheduleSlot = {
      id: `custom-${Date.now()}`,
      time: '12:00',
      label: 'Custom Time',
      compartments: [],
      enabled: true
    };
    setSchedule(prev => ({
      ...prev,
      slots: [...prev.slots, newSlot]
    }));
    setHasChanges(true);
  };

  const removeSlot = (slotId: string) => {
    setSchedule(prev => ({
      ...prev,
      slots: prev.slots.filter(slot => slot.id !== slotId)
    }));
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-500 animate-pulse">Loading medication schedule...</div>
      </div>
    );
  }

  const enabledSlots = schedule.slots.filter(s => s.enabled);
  const totalCompartmentsScheduled = new Set(
    schedule.slots.flatMap(slot => slot.compartments)
  ).size;

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Medication Scheduling & Times</h2>
          <p className="text-slate-600 mt-1">
            Configure daily medication schedule and map compartments to dose times
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadSchedule}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={saveSchedule}
            disabled={!hasChanges || isSaving}
            className={clsx(
              "px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all",
              hasChanges
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            )}
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex gap-4">
        <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-blue-900">
          <p className="font-semibold mb-1">How This Works</p>
          <p>
            Configure your daily medication schedule by enabling dose times and assigning positions from your 2x25 blister pack system. 
            Each blister position can be assigned to one or more dose times. The system will remind you when it's time to take medications.
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-sm text-slate-600 mb-1">Active Dose Times</div>
          <div className="text-3xl font-bold text-slate-900">{enabledSlots.length}</div>
          <div className="text-xs text-slate-500 mt-1">per day</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-sm text-slate-600 mb-1">Compartments Scheduled</div>
          <div className="text-3xl font-bold text-emerald-600">{totalCompartmentsScheduled}</div>
          <div className="text-xs text-slate-500 mt-1">of 49 total</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-sm text-slate-600 mb-1">Reminders</div>
          <div className="text-3xl font-bold text-blue-600">
            {schedule.reminderEnabled ? 'ON' : 'OFF'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {schedule.reminderEnabled ? `${schedule.reminderLeadTime} min before` : 'Disabled'}
          </div>
        </div>
      </div>

      {/* Schedule Slots */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock size={20} className="text-blue-600" />
            Daily Dose Times
          </h3>
          <button
            onClick={addCustomSlot}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={16} />
            Add Custom Time
          </button>
        </div>

        <div className="divide-y divide-slate-200">
          {schedule.slots.map((slot) => (
            <div
              key={slot.id}
              className={clsx(
                "p-5 transition-colors",
                slot.enabled ? "bg-white" : "bg-slate-50"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={slot.enabled}
                    onChange={(e) => updateSlot(slot.id, { enabled: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <input
                      type="text"
                      value={slot.label}
                      onChange={(e) => updateSlot(slot.id, { label: e.target.value })}
                      className="text-lg font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 -ml-2"
                      disabled={!slot.enabled}
                    />
                    <input
                      type="time"
                      value={slot.time}
                      onChange={(e) => updateSlot(slot.id, { time: e.target.value })}
                      className="text-sm text-slate-600 bg-transparent border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                      disabled={!slot.enabled}
                    />
                  </div>
                </div>
                {!DEFAULT_SLOTS.find(s => s.id === slot.id) && (
                  <button
                    onClick={() => removeSlot(slot.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              {slot.enabled && (
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-3">
                    Assigned Compartments ({slot.compartments.length})
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {allCompartments.map((compartment) => {
                      const isAssigned = slot.compartments.includes(compartment);
                      // Check if compartment is assigned to another slot
                      const assignedElsewhere = schedule.slots.some(
                        s => s.id !== slot.id && s.enabled && s.compartments.includes(compartment)
                      );

                      return (
                        <button
                          key={compartment}
                          onClick={() => toggleCompartment(slot.id, compartment)}
                          className={clsx(
                            "aspect-square rounded-lg font-semibold text-sm transition-all border-2",
                            isAssigned
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                              : assignedElsewhere
                              ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                              : "bg-white text-slate-700 border-slate-300 hover:border-emerald-400 hover:bg-emerald-50"
                          )}
                          disabled={assignedElsewhere && !isAssigned}
                          title={
                            assignedElsewhere && !isAssigned
                              ? `Already assigned to ${schedule.slots.find(s => s.compartments.includes(compartment))?.label}`
                              : ''
                          }
                        >
                          {compartment}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reminder Settings */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Bell size={20} className="text-purple-600" />
          Reminder Settings
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={schedule.reminderEnabled}
              onChange={(e) => {
                setSchedule(prev => ({ ...prev, reminderEnabled: e.target.checked }));
                setHasChanges(true);
              }}
              className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
            />
            <label className="text-sm font-medium text-slate-700">
              Enable medication reminders
            </label>
          </div>

          {schedule.reminderEnabled && (
            <div className="ml-8">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Remind me before dose time:
              </label>
              <select
                value={schedule.reminderLeadTime}
                onChange={(e) => {
                  setSchedule(prev => ({ ...prev, reminderLeadTime: Number(e.target.value) }));
                  setHasChanges(true);
                }}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Visual Timeline */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-orange-600" />
          Daily Timeline Preview
        </h3>
        
        {enabledSlots.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <AlertCircle className="mx-auto mb-2" size={24} />
            <p>No dose times enabled. Enable at least one time slot above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {enabledSlots
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((slot) => (
                <div key={slot.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                  <div className="text-lg font-bold text-slate-900 w-20">{slot.time}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-700">{slot.label}</div>
                    <div className="text-sm text-slate-600">
                      {slot.compartments.length > 0 ? (
                        <span>{slot.compartments.length} compartments: {slot.compartments.join(', ')}</span>
                      ) : (
                        <span className="text-amber-600">⚠️ No compartments assigned</span>
                      )}
                    </div>
                  </div>
                  {schedule.reminderEnabled && (
                    <div className="text-xs text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                      Reminder at {(() => {
                        const slotDate = new Date(`2000-01-01T${slot.time}:00`);
                        slotDate.setMinutes(slotDate.getMinutes() - schedule.reminderLeadTime);
                        return slotDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                      })()}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 bg-amber-50 border-2 border-amber-500 rounded-xl p-4 shadow-2xl max-w-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <div className="font-bold text-amber-900 mb-1">Unsaved Changes</div>
              <div className="text-sm text-amber-800 mb-3">
                You have unsaved changes to your medication schedule.
              </div>
              <button
                onClick={saveSchedule}
                disabled={isSaving}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-sm transition-colors w-full"
              >
                {isSaving ? 'Saving...' : 'Save Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}