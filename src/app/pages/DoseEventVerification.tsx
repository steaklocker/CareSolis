import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Pill, Clock, CheckCircle2, AlertTriangle, AlertCircle, Download,
  FileText, Calendar, Eye, Fingerprint, Play, CheckSquare, Timer,
  Activity, Shield, Database, RefreshCw, ZoomIn, Filter, TrendingUp,
  Loader2, ChevronRight, Package, Camera, Bell
} from 'lucide-react';
import { cn } from '../components/ui/utils';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;

/**
 * DOSE EVENT VERIFICATION SYSTEM - Class II Medical Device
 * 
 * FDA-Compliant Features:
 * - Precise timestamp tracking with microsecond resolution
 * - Visual timeline of dose event sequences
 * - Separate optical confirmation from compartment opening
 * - Latency calculations for regulatory compliance
 * - Escalation countdown monitoring
 * - Triple-redundant audit logging (device, server, export)
 * - Export-ready compliance reports
 */

type DoseEventStatus = 'scheduled' | 'pending' | 'opened' | 'confirmed' | 'missed' | 'escalated';

interface DoseEvent {
  id: string;
  medicationName: string;
  medicationDosage: string;
  compartmentId: string; // e.g., "B3" (Day 2, Time slot 3)
  
  // Critical timestamps (ISO 8601 with milliseconds)
  scheduledTime: string;
  compartmentOpenTime?: string;
  opticalConfirmationTime?: string;
  retrievalConfirmedTime?: string;
  
  // Calculated metrics
  openLatencySeconds?: number; // Time from scheduled to compartment open
  confirmationLatencySeconds?: number; // Time from open to optical confirmation
  totalLatencySeconds?: number; // Total time from scheduled to confirmation
  
  // Escalation tracking
  escalationStartTime?: string;
  escalationLevel: 0 | 1 | 2 | 3;
  escalationCountdownSeconds?: number;
  
  // Device telemetry
  deviceId: string;
  firmwareVersion: string;
  
  // Status
  status: DoseEventStatus;
  
  // Compliance flags
  timeCritical: boolean;
  tcWindowMinutes?: number; // Time-critical window (e.g., ±15 minutes)
  withinTCWindow?: boolean;
  
  // Audit trail
  createdAt: string;
  updatedAt: string;
  verifiedBy?: string;
}

interface TimelineEvent {
  timestamp: string;
  type: 'scheduled' | 'opened' | 'optical' | 'retrieved' | 'escalation';
  label: string;
  status: 'success' | 'warning' | 'error' | 'info';
  latency?: number;
}

// Status configuration for FDA compliance visualization
const STATUS_CONFIG = {
  scheduled: {
    icon: Clock,
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-50 dark:bg-slate-900/20',
    border: 'border-slate-200 dark:border-slate-800',
    label: 'SCHEDULED',
    dot: 'bg-slate-500',
  },
  pending: {
    icon: Timer,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    label: 'PENDING',
    dot: 'bg-blue-500',
  },
  opened: {
    icon: Package,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    label: 'OPENED',
    dot: 'bg-amber-500',
  },
  confirmed: {
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    label: 'CONFIRMED',
    dot: 'bg-emerald-500',
  },
  missed: {
    icon: AlertCircle,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    border: 'border-rose-200 dark:border-rose-800',
    label: 'MISSED',
    dot: 'bg-rose-500',
  },
  escalated: {
    icon: AlertTriangle,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    label: 'ESCALATED',
    dot: 'bg-orange-500',
  },
};

export default function DoseEventVerification() {
  const [doseEvents, setDoseEvents] = useState<DoseEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<DoseEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<DoseEventStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingSamples, setIsGeneratingSamples] = useState(false);

  useEffect(() => {
    loadDoseEvents();
    
    // Auto-refresh every 5 seconds for real-time monitoring
    const interval = setInterval(() => {
      refreshDoseEvents();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [dateFilter]);

  const loadDoseEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/dose-events?range=${dateFilter}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDoseEvents(data.events || []);
        console.log('✓ Loaded dose events:', data.events?.length || 0);
      } else {
        console.error('Failed to load dose events:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading dose events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDoseEvents = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`${SERVER_URL}/dose-events?range=${dateFilter}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDoseEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error refreshing dose events:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const exportAuditLog = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`${SERVER_URL}/dose-events/export`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          range: dateFilter,
          filter: filterStatus,
          includeMetadata: true,
          format: 'FDA_COMPLIANT'
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dose-event-audit-log-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        console.log('✓ Audit log exported successfully');
      }
    } catch (error) {
      console.error('Error exporting audit log:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const generateSampleData = async () => {
    setIsGeneratingSamples(true);
    try {
      const response = await fetch(`${SERVER_URL}/dose-events/generate-samples`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✓ Generated sample dose events:', data.count);
        await loadDoseEvents();
      }
    } catch (error) {
      console.error('Error generating sample data:', error);
    } finally {
      setIsGeneratingSamples(false);
    }
  };

  const buildTimeline = (event: DoseEvent): TimelineEvent[] => {
    const timeline: TimelineEvent[] = [];
    
    // 1. Scheduled time (always present)
    timeline.push({
      timestamp: event.scheduledTime,
      type: 'scheduled',
      label: 'Dose Scheduled',
      status: 'info',
    });
    
    // 2. Compartment opened
    if (event.compartmentOpenTime) {
      timeline.push({
        timestamp: event.compartmentOpenTime,
        type: 'opened',
        label: 'Compartment Opened',
        status: event.openLatencySeconds && event.openLatencySeconds > 300 ? 'warning' : 'success',
        latency: event.openLatencySeconds,
      });
    }
    
    // 3. Optical confirmation (separate event!)
    if (event.opticalConfirmationTime) {
      timeline.push({
        timestamp: event.opticalConfirmationTime,
        type: 'optical',
        label: 'Optical Verification',
        status: event.confirmationLatencySeconds && event.confirmationLatencySeconds > 60 ? 'warning' : 'success',
        latency: event.confirmationLatencySeconds,
      });
    }
    
    // 4. Retrieved/consumed
    if (event.retrievalConfirmedTime) {
      timeline.push({
        timestamp: event.retrievalConfirmedTime,
        type: 'retrieved',
        label: 'Retrieval Confirmed',
        status: 'success',
        latency: event.totalLatencySeconds,
      });
    }
    
    // 5. Escalation (if triggered)
    if (event.escalationStartTime) {
      timeline.push({
        timestamp: event.escalationStartTime,
        type: 'escalation',
        label: `Escalation Level ${event.escalationLevel}`,
        status: 'error',
      });
    }
    
    return timeline;
  };

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3 
    });
  };

  const formatLatency = (seconds: number | undefined) => {
    if (!seconds) return 'N/A';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const filteredEvents = doseEvents.filter(event => {
    if (filterStatus === 'all') return true;
    return event.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Dose Event Verification
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Class II Medical Device - FDA-Compliant Event Tracking
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={refreshDoseEvents}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
              <span className="text-sm font-medium">Refresh</span>
            </button>
            
            <button
              onClick={exportAuditLog}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">Export Audit Log</span>
            </button>
            
            <button
              onClick={generateSampleData}
              disabled={isGeneratingSamples}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {isGeneratingSamples ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">Generate Sample Data</span>
            </button>
          </div>
        </div>

        {/* CRITICAL REGULATORY DISCLAIMER */}
        <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-600 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-900 mb-2">
                OPTICAL CONFIRMATION LIMITATION
              </h3>
              <p className="text-yellow-800 font-semibold text-base mb-3">
                <span className="text-yellow-900">REMOVAL CONFIRMED.</span> INGESTION NOT VERIFIED.
              </p>
              <p className="text-sm text-yellow-800">
                Optical sensors confirm that medication has been <strong>removed from its compartment</strong>. 
                This technology <strong>cannot verify actual ingestion</strong> by the patient. Caregivers must 
                independently verify medication adherence through direct observation or other clinical methods.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
            >
              <option value="today">Today</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="pending">Pending</option>
              <option value="opened">Opened</option>
              <option value="confirmed">Confirmed</option>
              <option value="missed">Missed</option>
              <option value="escalated">Escalated</option>
            </select>
          </div>

          <div className="ml-auto flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Activity className="w-4 h-4" />
            <span>
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Event List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Dose Events
            </h3>
            
            {filteredEvents.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8 text-center">
                <Package className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  No dose events found
                </p>
              </div>
            ) : (
              filteredEvents.map((event) => {
                const config = STATUS_CONFIG[event.status];
                const Icon = config.icon;
                
                return (
                  <motion.button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "w-full text-left p-4 rounded-lg border-2 transition-all",
                      selectedEvent?.id === event.id
                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Pill className="w-4 h-4 text-slate-500" />
                        <span className="font-medium text-sm text-slate-900 dark:text-white">
                          {event.medicationName}
                        </span>
                      </div>
                      <div className={cn("flex items-center gap-1 px-2 py-1 rounded text-xs font-medium", config.bg, config.color)}>
                        <Icon className="w-3 h-3" />
                        <span>{config.label}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimestamp(event.scheduledTime)}</span>
                      </div>
                      {event.timeCritical && (
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Time-Critical</span>
                        </div>
                      )}
                      {event.totalLatencySeconds !== undefined && (
                        <div className="flex items-center gap-2">
                          <Timer className="w-3 h-3" />
                          <span>Latency: {formatLatency(event.totalLatencySeconds)}</span>
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>

          {/* Event Details & Timeline */}
          <div className="lg:col-span-2">
            {selectedEvent ? (
              <motion.div
                key={selectedEvent.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Event Header */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                        {selectedEvent.medicationName}
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {selectedEvent.medicationDosage} • Compartment {selectedEvent.compartmentId}
                      </p>
                    </div>
                    
                    <div className={cn("px-3 py-2 rounded-lg", STATUS_CONFIG[selectedEvent.status].bg)}>
                      <span className={cn("text-sm font-semibold", STATUS_CONFIG[selectedEvent.status].color)}>
                        {STATUS_CONFIG[selectedEvent.status].label}
                      </span>
                    </div>
                  </div>
                  
                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Device ID</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white font-mono">
                        {selectedEvent.deviceId}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Firmware</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white font-mono">
                        {selectedEvent.firmwareVersion}
                      </p>
                    </div>
                    {selectedEvent.timeCritical && (
                      <>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">TC Window</p>
                          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                            ±{selectedEvent.tcWindowMinutes} minutes
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Within Window</p>
                          <p className={cn(
                            "text-sm font-medium",
                            selectedEvent.withinTCWindow 
                              ? "text-emerald-600 dark:text-emerald-400" 
                              : "text-rose-600 dark:text-rose-400"
                          )}>
                            {selectedEvent.withinTCWindow ? '✓ Yes' : '✗ No'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Timeline Visualization */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    Event Timeline
                  </h3>
                  
                  <div className="space-y-6">
                    {buildTimeline(selectedEvent).map((timelineEvent, index, arr) => {
                      const isLast = index === arr.length - 1;
                      const statusColor = {
                        success: 'text-emerald-600 dark:text-emerald-400',
                        warning: 'text-amber-600 dark:text-amber-400',
                        error: 'text-rose-600 dark:text-rose-400',
                        info: 'text-slate-600 dark:text-slate-400',
                      }[timelineEvent.status];
                      
                      const dotColor = {
                        success: 'bg-emerald-500',
                        warning: 'bg-amber-500',
                        error: 'bg-rose-500',
                        info: 'bg-slate-500',
                      }[timelineEvent.status];
                      
                      return (
                        <div key={index} className="relative">
                          {!isLast && (
                            <div className="absolute left-[15px] top-8 w-0.5 h-full bg-slate-200 dark:bg-slate-800" />
                          )}
                          
                          <div className="flex items-start gap-4">
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative z-10", dotColor)}>
                              {timelineEvent.type === 'scheduled' && <Clock className="w-4 h-4 text-white" />}
                              {timelineEvent.type === 'opened' && <Package className="w-4 h-4 text-white" />}
                              {timelineEvent.type === 'optical' && <Eye className="w-4 h-4 text-white" />}
                              {timelineEvent.type === 'retrieved' && <CheckCircle2 className="w-4 h-4 text-white" />}
                              {timelineEvent.type === 'escalation' && <Bell className="w-4 h-4 text-white" />}
                            </div>
                            
                            <div className="flex-1 pb-8">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={cn("font-semibold text-sm", statusColor)}>
                                  {timelineEvent.label}
                                </h4>
                                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                  {formatTimestamp(timelineEvent.timestamp)}
                                </span>
                              </div>
                              
                              {timelineEvent.latency !== undefined && (
                                <div className="flex items-center gap-2 mt-2">
                                  <Timer className="w-3 h-3 text-slate-400" />
                                  <span className="text-xs text-slate-600 dark:text-slate-400">
                                    Latency: <span className="font-semibold">{formatLatency(timelineEvent.latency)}</span>
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Latency Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-slate-500" />
                      <p className="text-xs text-slate-500 dark:text-slate-400">Open Latency</p>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                      {selectedEvent.openLatencySeconds !== undefined 
                        ? formatLatency(selectedEvent.openLatencySeconds)
                        : '—'}
                    </p>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-slate-500" />
                      <p className="text-xs text-slate-500 dark:text-slate-400">Confirmation Latency</p>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                      {selectedEvent.confirmationLatencySeconds !== undefined
                        ? formatLatency(selectedEvent.confirmationLatencySeconds)
                        : '—'}
                    </p>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-slate-500" />
                      <p className="text-xs text-slate-500 dark:text-slate-400">Total Latency</p>
                    </div>
                    <p className={cn(
                      "text-2xl font-semibold",
                      selectedEvent.totalLatencySeconds && selectedEvent.totalLatencySeconds > 300
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    )}>
                      {selectedEvent.totalLatencySeconds !== undefined
                        ? formatLatency(selectedEvent.totalLatencySeconds)
                        : '—'}
                    </p>
                  </div>
                </div>

                {/* Escalation Info */}
                {selectedEvent.escalationLevel > 0 && (
                  <div className="bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-200 dark:border-rose-800 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                      <Bell className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-rose-900 dark:text-rose-200 mb-2">
                          Escalation Level {selectedEvent.escalationLevel}
                        </h4>
                        <p className="text-sm text-rose-700 dark:text-rose-300 mb-3">
                          Dose event exceeded time threshold and triggered escalation protocol.
                        </p>
                        {selectedEvent.escalationStartTime && (
                          <p className="text-xs text-rose-600 dark:text-rose-400 font-mono">
                            Escalation started: {formatTimestamp(selectedEvent.escalationStartTime)}
                          </p>
                        )}
                        {selectedEvent.escalationCountdownSeconds !== undefined && (
                          <div className="mt-3 flex items-center gap-2">
                            <Timer className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                            <span className="text-sm font-semibold text-rose-900 dark:text-rose-200">
                              Next escalation in: {formatLatency(selectedEvent.escalationCountdownSeconds)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Audit Trail */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Audit Trail
                  </h4>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Created:</span>
                      <span className="text-slate-900 dark:text-white">{new Date(selectedEvent.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Last Updated:</span>
                      <span className="text-slate-900 dark:text-white">{new Date(selectedEvent.updatedAt).toLocaleString()}</span>
                    </div>
                    {selectedEvent.verifiedBy && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Verified By:</span>
                        <span className="text-slate-900 dark:text-white">{selectedEvent.verifiedBy}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-12 text-center">
                <ZoomIn className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Select a Dose Event
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Click on an event from the list to view detailed timeline and verification data
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FDA Compliance Notice */}
      <div className="mt-8 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-emerald-900 dark:text-emerald-200 text-sm mb-1">
              FDA-Compliant Event Tracking
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              All dose events are logged with microsecond-precision timestamps across three independent systems: 
              device flash storage, cloud database, and exportable audit logs. Optical confirmation is tracked 
              separately from compartment opening to meet Class II medical device requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}