import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, User, Pill, AlertCircle, X, Package } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../components/ui/button';
import { useCaresolis } from '../context/CaresolisContext';

interface CalendarEvent {
  id: string;
  date: string;
  time: string;
  type: 'appointment' | 'visit' | 'activity' | 'note' | 'refill' | 'medication';
  title: string;
  description?: string;
  status?: 'completed' | 'pending' | 'cancelled';
  // FDA Class II Audit Fields
  createdAt: string;
  createdBy: string;
  modifiedAt?: string;
  modifiedBy?: string;
  version: number;
  isReadOnly?: boolean; // Flag to indicate if the event is read-only
  realTimeStatus?: string; // Store the actual real-time status for medication events
}

interface AuditLog {
  id: string;
  timestamp: string; // ISO 8601 with timezone
  eventId: string;
  eventType: 'calendar_event';
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';
  actor: string; // User ID or role
  actorRole: 'patient' | 'caregiver' | 'provider' | 'admin' | 'system';
  beforeState?: Partial<CalendarEvent>;
  afterState?: Partial<CalendarEvent>;
  changeFields?: string[];
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  notes?: string;
  severity: 'info' | 'warning' | 'critical';
  complianceCategory: 'care_coordination' | 'medication_management' | 'clinical_documentation';
}

interface MedicationTime {
  time: string;
  label: string;
}

// FDA Class II Logging Service (Three-Tier System)
class AuditLogger {
  private logs: AuditLog[] = [];

  // Tier 1: Application Event Log (User-facing audit trail)
  logEvent(params: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(), // ISO 8601 UTC
      ...params
    };
    
    this.logs.push(log);
    
    // Tier 2: Console logging for System Integrity Log
    console.log('[FDA AUDIT LOG]', {
      id: log.id,
      timestamp: log.timestamp,
      action: log.action,
      actor: log.actor,
      eventId: log.eventId,
      severity: log.severity,
      complianceCategory: log.complianceCategory,
      changeFields: log.changeFields
    });

    // Tier 3: TODO - Send to backend for persistent storage in Supabase
    // This would go to Care Circle Journal and permanent database storage
    // await fetch('/api/audit-log', { method: 'POST', body: JSON.stringify(log) });

    return log;
  }

  getLogs(): AuditLog[] {
    return [...this.logs]; // Return copy to maintain immutability
  }

  getLogsByEventId(eventId: string): AuditLog[] {
    return this.logs.filter(log => log.eventId === eventId);
  }
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [showAddModal, setShowAddModal] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>(generateInitialEvents());
  const [auditLogger] = useState(() => new AuditLogger());
  
  // Get medication settings and real-time status from Caresolis context
  const { settings, statusData } = useCaresolis();
  
  // Simulated current user context (in production, get from auth)
  const currentUser = {
    id: 'user-12345',
    role: 'caregiver' as const,
    name: 'Sarah Johnson'
  };
  
  // Extract medication times from actual settings
  const medicationTimes: MedicationTime[] = useMemo(() => {
    if (!settings?.schedule?.slots) {
      // Fallback to default times if no settings loaded
      return [
        { time: '09:00', label: 'Morning' },
        { time: '12:00', label: 'Midday' },
        { time: '18:00', label: 'Evening' },
        { time: '21:00', label: 'Bedtime' }
      ];
    }

    // Map actual schedule slots to medication times (only enabled slots)
    return settings.schedule.slots
      .filter((slot: any) => slot.enabled)
      .map((slot: any) => {
        const hour = parseInt(slot.time.split(':')[0]);
        let label = 'Medication';
        
        // Auto-detect label based on time of day
        if (hour >= 5 && hour < 11) label = 'Morning';
        else if (hour >= 11 && hour < 14) label = 'Midday';
        else if (hour >= 14 && hour < 17) label = 'Afternoon';
        else if (hour >= 17 && hour < 20) label = 'Evening';
        else if (hour >= 20 && hour < 23) label = 'Bedtime';
        else label = 'Night';
        
        return {
          time: slot.time,
          label: label
        };
      });
  }, [settings]);

  // Generate real-time medication check-in events from statusData
  const medicationEvents = useMemo(() => {
    if (!statusData?.slots || !Array.isArray(statusData.slots)) {
      return [];
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    return statusData.slots.map((slot: any, index: number) => {
      // Determine status-based styling and display
      let status: CalendarEvent['status'] = 'pending';
      let statusDisplay = 'Scheduled';
      
      if (slot.status === 'Check-In On Time' || slot.status === 'Check-In Delayed') {
        status = 'completed';
        statusDisplay = slot.status;
      } else if (slot.status === 'Check-In Not Logged' || slot.status.startsWith('Escalation')) {
        status = 'cancelled'; // Using cancelled to show as missed/late
        statusDisplay = slot.status;
      } else if (slot.status === 'Acknowledged') {
        status = 'pending';
        statusDisplay = 'Acknowledged';
      } else {
        statusDisplay = slot.status;
      }

      // Get label from medication times
      const medTime = medicationTimes.find(mt => mt.time === slot.time);
      const label = medTime?.label || 'Medication';

      return {
        id: `med-event-${index}-${slot.time}`,
        date: todayStr, // Medication events are always for today
        time: slot.time,
        type: 'medication' as const, // Special type for medication events
        title: `${label} Check-In`,
        description: `Status: ${statusDisplay}`,
        status: status,
        createdAt: today.toISOString(),
        createdBy: 'system',
        version: 1,
        isReadOnly: true, // Flag to indicate this is a system-generated read-only event
        realTimeStatus: slot.status // Store the actual real-time status
      };
    });
  }, [statusData, medicationTimes]);

  // Combine care coordination events with medication events for display
  const allEvents = useMemo(() => {
    const combined = [...events, ...medicationEvents];
    return combined;
  }, [events, medicationEvents]);

  // Generate dynamic events for current month and next month
  function generateInitialEvents(): CalendarEvent[] {
    const today = new Date();
    const events: CalendarEvent[] = [];

    // Past appointment (3 days ago)
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 3);
    events.push({
      id: '1',
      date: pastDate.toISOString().split('T')[0],
      time: '10:00',
      type: 'appointment',
      title: 'Dr. Chen - Cardiology',
      description: 'Annual check-up',
      status: 'completed',
      createdAt: pastDate.toISOString(),
      createdBy: 'provider',
      version: 1
    });

    // Today's caregiver visit
    events.push({
      id: '2',
      date: today.toISOString().split('T')[0],
      time: '14:00',
      type: 'visit',
      title: 'Caregiver Visit - Sarah',
      description: 'Weekly check-in and medication review',
      status: 'pending',
      createdAt: today.toISOString(),
      createdBy: 'caregiver',
      version: 1
    });

    // Tomorrow's appointment
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    events.push({
      id: '3',
      date: tomorrow.toISOString().split('T')[0],
      time: '09:30',
      type: 'appointment',
      title: 'Physical Therapy',
      description: 'Hip mobility exercises',
      status: 'pending',
      createdAt: tomorrow.toISOString(),
      createdBy: 'provider',
      version: 1
    });

    // Next week lab work
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    events.push({
      id: '4',
      date: nextWeek.toISOString().split('T')[0],
      time: '08:00',
      type: 'appointment',
      title: 'Lab Work - Fasting Blood Draw',
      description: 'A1C, lipid panel, kidney function',
      status: 'pending',
      createdAt: nextWeek.toISOString(),
      createdBy: 'provider',
      version: 1
    });

    // Upcoming family visit
    const nextWeekend = new Date(today);
    nextWeekend.setDate(today.getDate() + 5);
    events.push({
      id: '5',
      date: nextWeekend.toISOString().split('T')[0],
      time: '15:00',
      type: 'visit',
      title: 'Family Visit - John & Lisa',
      description: 'Weekend family time',
      status: 'pending',
      createdAt: nextWeekend.toISOString(),
      createdBy: 'patient',
      version: 1
    });

    return events;
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getMedicationTimesForDate = (day: number): MedicationTime[] => {
    // Return medication times for all days (read-only reference)
    return medicationTimes;
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Start on Sunday
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Helper function to get consistent date string (YYYY-MM-DD) in local timezone
  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const nextPeriod = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (view === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 1);
      setCurrentDate(newDate);
    }
  };

  const prevPeriod = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (view === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 1);
      setCurrentDate(newDate);
    }
  };

  const getPeriodTitle = () => {
    if (view === 'month') {
      return `${monthNames[month]} ${year}`;
    } else if (view === 'week') {
      const weekDays = getWeekDays();
      const start = weekDays[0];
      const end = weekDays[6];
      return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${year}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return allEvents.filter(e => e.date === dateStr);
  };

  const handleAddEvent = (newEvent: Omit<CalendarEvent, 'id' | 'createdAt' | 'createdBy' | 'version'>) => {
    const now = new Date().toISOString();
    const event: CalendarEvent = {
      ...newEvent,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      createdBy: currentUser.id,
      version: 1
    };
    
    // FDA Class II Audit Logging - CREATE action
    auditLogger.logEvent({
      eventId: event.id,
      eventType: 'calendar_event',
      action: 'CREATE',
      actor: currentUser.id,
      actorRole: currentUser.role,
      beforeState: undefined,
      afterState: event,
      changeFields: Object.keys(event),
      notes: `Calendar event created: ${event.type} - ${event.title}`,
      severity: 'info',
      complianceCategory: event.type === 'refill' ? 'medication_management' : 'care_coordination',
      sessionId: `session-${Date.now()}`,
      userAgent: navigator.userAgent
    });
    
    setEvents([...events, event]);
    setShowAddModal(false);
  };

  const handleUpdateEvent = (updatedEvent: CalendarEvent) => {
    const originalEvent = events.find(e => e.id === updatedEvent.id);
    if (!originalEvent) return;

    const now = new Date().toISOString();
    const newVersion: CalendarEvent = {
      ...updatedEvent,
      modifiedAt: now,
      modifiedBy: currentUser.id,
      version: originalEvent.version + 1
    };

    // Determine which fields changed
    const changedFields = Object.keys(updatedEvent).filter(
      key => JSON.stringify(originalEvent[key as keyof CalendarEvent]) !== 
             JSON.stringify(updatedEvent[key as keyof CalendarEvent])
    );

    // FDA Class II Audit Logging - UPDATE action
    auditLogger.logEvent({
      eventId: updatedEvent.id,
      eventType: 'calendar_event',
      action: 'UPDATE',
      actor: currentUser.id,
      actorRole: currentUser.role,
      beforeState: originalEvent,
      afterState: newVersion,
      changeFields: changedFields,
      notes: `Calendar event updated: ${changedFields.join(', ')}`,
      severity: 'info',
      complianceCategory: updatedEvent.type === 'refill' ? 'medication_management' : 'care_coordination',
      sessionId: `session-${Date.now()}`,
      userAgent: navigator.userAgent
    });

    setEvents(events.map(e => e.id === updatedEvent.id ? newVersion : e));
  };

  const handleStatusChange = (eventId: string, newStatus: CalendarEvent['status']) => {
    const originalEvent = events.find(e => e.id === eventId);
    if (!originalEvent || !newStatus) return;

    const now = new Date().toISOString();
    const updatedEvent: CalendarEvent = {
      ...originalEvent,
      status: newStatus,
      modifiedAt: now,
      modifiedBy: currentUser.id,
      version: originalEvent.version + 1
    };

    // FDA Class II Audit Logging - STATUS_CHANGE action
    auditLogger.logEvent({
      eventId: eventId,
      eventType: 'calendar_event',
      action: 'STATUS_CHANGE',
      actor: currentUser.id,
      actorRole: currentUser.role,
      beforeState: { status: originalEvent.status },
      afterState: { status: newStatus },
      changeFields: ['status'],
      notes: `Status changed from ${originalEvent.status} to ${newStatus}`,
      severity: newStatus === 'cancelled' ? 'warning' : 'info',
      complianceCategory: originalEvent.type === 'refill' ? 'medication_management' : 'care_coordination',
      sessionId: `session-${Date.now()}`,
      userAgent: navigator.userAgent
    });

    setEvents(events.map(e => e.id === eventId ? updatedEvent : e));
  };

  const handleDeleteEvent = (eventId: string) => {
    const originalEvent = events.find(e => e.id === eventId);
    if (!originalEvent) return;

    // FDA Class II Audit Logging - DELETE action (CRITICAL severity)
    auditLogger.logEvent({
      eventId: eventId,
      eventType: 'calendar_event',
      action: 'DELETE',
      actor: currentUser.id,
      actorRole: currentUser.role,
      beforeState: originalEvent,
      afterState: undefined,
      changeFields: Object.keys(originalEvent),
      notes: `Calendar event deleted: ${originalEvent.type} - ${originalEvent.title}`,
      severity: 'critical',
      complianceCategory: originalEvent.type === 'refill' ? 'medication_management' : 'care_coordination',
      sessionId: `session-${Date.now()}`,
      userAgent: navigator.userAgent
    });

    setEvents(events.filter(e => e.id !== eventId));
  };

  const eventTypeColors = {
    appointment: 'bg-purple-100 text-purple-700 border-purple-300',
    visit: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    activity: 'bg-blue-100 text-blue-700 border-blue-300',
    note: 'bg-slate-100 text-slate-700 border-slate-300',
    refill: 'bg-amber-100 text-amber-700 border-amber-300',
    medication: 'bg-pink-100 text-pink-700 border-pink-300' // Add color for medication events
  };

  const eventTypeIcons = {
    appointment: CalendarIcon,
    visit: User,
    activity: Pill,
    note: AlertCircle,
    refill: Package,
    medication: Pill // Add icon for medication events
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
            <p className="text-slate-600 mt-1">Care coordination events • Read-only medication times</p>
          </div>

          <div className="flex gap-3">
            {/* View Selector */}
            <div className="flex bg-white rounded-lg border border-slate-200 p-1">
              {(['month', 'week', 'day'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={clsx(
                    "px-4 py-2 rounded-md text-sm font-semibold capitalize transition-colors",
                    view === v
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Plus size={18} />
              Add Event
            </button>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="p-4 flex items-center justify-between border-b border-slate-200">
            <button
              onClick={prevPeriod}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-900">
              {getPeriodTitle()}
            </h2>
            <button
              onClick={nextPeriod}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {view === 'month' && (
              <>
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-xs font-semibold text-slate-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}

                  {/* Days of the month */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayEvents = getEventsForDate(day);
                    const medTimes = getMedicationTimesForDate(day);
                    const isToday = 
                      day === new Date().getDate() &&
                      month === new Date().getMonth() &&
                      year === new Date().getFullYear();

                    return (
                      <div
                        key={day}
                        className={clsx(
                          "aspect-square border rounded-lg p-2 transition-all hover:shadow-md cursor-pointer overflow-hidden",
                          isToday
                            ? "bg-indigo-50 border-indigo-400 border-2"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <div className={clsx(
                          "text-sm font-semibold mb-1",
                          isToday ? "text-indigo-700" : "text-slate-900"
                        )}>
                          {day}
                        </div>
                        
                        {/* Medication times (read-only) */}
                        {medTimes.length > 0 && (
                          <div className="flex gap-0.5 mb-1">
                            {medTimes.slice(0, 2).map((med, idx) => (
                              <div
                                key={idx}
                                className="text-[10px] text-slate-400"
                                title={`${med.label} medication - ${med.time}`}
                              >
                                💊
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Event dots */}
                        <div className="space-y-1">
                          {dayEvents.slice(0, 4).map((event) => (
                            <div
                              key={event.id}
                              className={clsx(
                                "text-[10px] px-1 py-0.5 rounded border truncate",
                                eventTypeColors[event.type]
                              )}
                              title={`${event.time} - ${event.title}`}
                            >
                              {formatTime(event.time).split(' ')[0]}
                            </div>
                          ))}
                          {dayEvents.length > 4 && (
                            <div className="text-[10px] text-slate-500 px-1">
                              +{dayEvents.length - 4}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {view === 'week' && (
              <div>
                {/* Week View */}
                <div className="grid grid-cols-8 gap-2">
                  {/* Time column header */}
                  <div className="text-xs font-semibold text-slate-600 py-2"></div>
                  
                  {/* Day headers */}
                  {getWeekDays().map((day, i) => {
                    const isToday = 
                      day.getDate() === new Date().getDate() &&
                      day.getMonth() === new Date().getMonth() &&
                      day.getFullYear() === new Date().getFullYear();
                    
                    return (
                      <div key={i} className={clsx(
                        "text-center py-2 rounded-lg",
                        isToday ? "bg-indigo-50" : ""
                      )}>
                        <div className="text-xs font-semibold text-slate-600">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}
                        </div>
                        <div className={clsx(
                          "text-lg font-bold",
                          isToday ? "text-indigo-600" : "text-slate-900"
                        )}>
                          {day.getDate()}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Hour rows */}
                <div className="mt-4 space-y-2">
                  {Array.from({ length: 14 }, (_, i) => i + 6).map((hour) => (
                    <div key={hour} className="grid grid-cols-8 gap-2">
                      {/* Time label */}
                      <div className="text-xs text-slate-500 py-1">
                        {formatTime(`${String(hour).padStart(2, '0')}:00`)}
                      </div>
                    
                      {/* Day cells */}
                      {getWeekDays().map((day, dayIdx) => {
                        const dateStr = getLocalDateString(day);
                        const hourEvents = allEvents.filter(e => {
                          const matchesDate = e.date === dateStr;
                          const eventHour = parseInt(e.time.split(':')[0]);
                          return matchesDate && eventHour === hour;
                        });
                      
                        return (
                          <div
                            key={dayIdx}
                            className="min-h-[60px] border border-slate-200 rounded p-1 bg-white hover:bg-slate-50 transition-colors"
                          >
                            {hourEvents.map((event) => (
                              <div
                                key={event.id}
                                className={clsx(
                                  "text-[10px] px-1 py-0.5 rounded border mb-1",
                                  eventTypeColors[event.type],
                                  event.isReadOnly && "opacity-75"
                                )}
                                title={`${event.title}${event.isReadOnly ? ' (Read-Only)' : ''}`}
                              >
                                {event.title.substring(0, 15)}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {view === 'day' && (
              <div className="space-y-2">
                {/* Day View - Hour by hour */}
                {Array.from({ length: 18 }, (_, i) => i + 5).map((hour) => {
                  const dateStr = getLocalDateString(currentDate);
                  const hourEvents = allEvents.filter(e => {
                    const matchesDate = e.date === dateStr;
                    const eventHour = parseInt(e.time.split(':')[0]);
                    return matchesDate && eventHour === hour;
                  });

                  return (
                    <div key={hour} className="flex gap-4">
                      {/* Time label */}
                      <div className="w-24 text-sm text-slate-600 font-medium py-2">
                        {formatTime(`${String(hour).padStart(2, '0')}:00`)}
                      </div>
                      
                      {/* Events for this hour */}
                      <div className="flex-1 min-h-[80px] border border-slate-200 rounded-lg p-3 bg-white">
                        <div className="space-y-2">
                          {hourEvents.map((event) => {
                            const Icon = eventTypeIcons[event.type];
                            return (
                              <div
                                key={event.id}
                                className={clsx(
                                  "flex items-start gap-3 p-3 rounded-lg border",
                                  eventTypeColors[event.type],
                                  event.isReadOnly && "opacity-90"
                                )}
                              >
                                <Icon size={16} />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <div className="font-semibold text-sm">{event.title}</div>
                                    {event.isReadOnly && (
                                      <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">R/O</span>
                                    )}
                                  </div>
                                  {event.description && (
                                    <div className="text-xs mt-1 opacity-75">{event.description}</div>
                                  )}
                                  <div className="text-xs mt-1 opacity-60">{formatTime(event.time)}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock size={20} className="text-indigo-600" />
            Upcoming Events
          </h3>
          <div className="space-y-3">
            {allEvents
              .filter(e => {
                const eventDateTime = new Date(`${e.date}T${e.time}:00`);
                const now = new Date();
                return eventDateTime >= now;
              })
              .sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time}:00`);
                const dateB = new Date(`${b.date}T${b.time}:00`);
                return dateA.getTime() - dateB.getTime();
              })
              .slice(0, 5)
              .map((event) => {
                const Icon = eventTypeIcons[event.type];
                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div className={clsx(
                      "p-3 rounded-lg",
                      eventTypeColors[event.type]
                    )}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-slate-900">{event.title}</h4>
                        <span className={clsx(
                          "text-xs px-2 py-1 rounded-full font-semibold",
                          event.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                          event.status === 'cancelled' ? "bg-red-100 text-red-700" :
                          "bg-blue-100 text-blue-700"
                        )}>
                          {event.status === 'completed' ? 'Completed' :
                           event.status === 'cancelled' ? 'Missed' : 'Pending'}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-slate-600 mb-2">{event.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <CalendarIcon size={14} />
                          {new Date(event.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatTime(event.time)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          {Object.entries(eventTypeColors).map(([type, colorClass]) => {
            const Icon = eventTypeIcons[type as keyof typeof eventTypeIcons];
            return (
              <div key={type} className="flex items-center gap-2">
                <div className={clsx("p-1.5 rounded border", colorClass)}>
                  <Icon size={14} />
                </div>
                <span className="text-sm text-slate-600 capitalize">{type}</span>
              </div>
            );
          })}
        </div>

        {/* Add Event Modal */}
        {showAddModal && <AddEventModal onClose={() => setShowAddModal(false)} onAdd={handleAddEvent} />}
      </div>
    </div>
  );
}

// Add Event Modal Component
function AddEventModal({ onClose, onAdd }: { 
  onClose: () => void; 
  onAdd: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'createdBy' | 'version'>) => void;
}) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'appointment' as CalendarEvent['type'],
    title: '',
    description: '',
    status: 'pending' as CalendarEvent['status']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Add Care Event</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Event Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Event Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as CalendarEvent['type'] })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="appointment">Doctor Appointment</option>
              <option value="visit">Caregiver Visit</option>
              <option value="activity">Activity/Therapy</option>
              <option value="note">Note/Reminder</option>
              <option value="refill">Medication Refill</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Dr. Smith - Annual Check-up"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Time *
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional notes or details..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Info Note */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-xs text-slate-600">
              <strong>Note:</strong> This calendar is for care coordination events only. Medication schedules are managed in the Medication Manager and displayed here as read-only reference times.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              Add Event
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}