import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Search, Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;

interface EventLog {
  timestamp: string;
  level: number;
  action: string;
  recipient?: string;
}

interface InteractionEvent {
  id: string;
  scheduledTime: string;
  status: string;
  escalationLevel: number;
  interactionTime: string | null;
  acknowledgedTime: string | null;
  logs: EventLog[];
}

export default function EventInspector() {
  const [events, setEvents] = useState<InteractionEvent[]>([]);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [searchTime, setSearchTime] = useState('08:30');
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const localDate = new Date().toLocaleDateString('en-CA');
      const res = await fetch(`${SERVER_URL}/events?localDate=${localDate}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchEvents, 10000);
    return () => clearInterval(interval);
  }, []);

  // Filter by search time
  const filteredEvents = searchTime
    ? events.filter(e => e.scheduledTime.includes(searchTime))
    : events;

  const getStatusColor = (status: string) => {
    if (status === 'Check-In On Time' || status === 'Check-In Delayed') return 'text-emerald-600';
    if (status === 'Scheduled') return 'text-slate-500';
    if (status === 'ReminderActive') return 'text-amber-600';
    if (status.startsWith('Escalation') || status === 'Check-In Not Logged') return 'text-rose-600';
    if (status === 'Acknowledged') return 'text-blue-600';
    return 'text-slate-600';
  };

  const getStatusBg = (status: string) => {
    if (status === 'Check-In On Time' || status === 'Check-In Delayed') return 'bg-emerald-50 border-emerald-200';
    if (status === 'Scheduled') return 'bg-slate-50 border-slate-200';
    if (status === 'ReminderActive') return 'bg-amber-50 border-amber-200';
    if (status.startsWith('Escalation') || status === 'Check-In Not Logged') return 'bg-rose-50 border-rose-200';
    if (status === 'Acknowledged') return 'bg-blue-50 border-blue-200';
    return 'bg-slate-50 border-slate-200';
  };

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-600" />
            Event Inspector
          </h1>
          <p className="text-slate-500 mt-1">
            View detailed escalation logs for each scheduled interaction time
          </p>
        </div>
        <button
          onClick={fetchEvents}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by time (e.g., 08:30, 12:00)"
            value={searchTime}
            onChange={(e) => setSearchTime(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-500">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No events found for "{searchTime}"</p>
            <button
              onClick={() => setSearchTime('')}
              className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear filter
            </button>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const isExpanded = expandedEvent === event.id;
            
            return (
              <div
                key={event.id}
                className={clsx(
                  "bg-white rounded-xl border shadow-sm overflow-hidden transition-all",
                  getStatusBg(event.status)
                )}
              >
                {/* Event Header */}
                <button
                  onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-black/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className={clsx("w-5 h-5", getStatusColor(event.status))} />
                      <span className="text-2xl font-bold text-slate-900">
                        {event.scheduledTime}
                      </span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className={clsx("text-sm font-semibold", getStatusColor(event.status))}>
                        {event.status}
                      </span>
                      <span className="text-xs text-slate-500">
                        Level {event.escalationLevel} • {event.logs.length} log entries
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {event.interactionTime && (
                      <div className="flex items-center gap-1 text-xs text-emerald-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Verified</span>
                      </div>
                    )}
                    {event.escalationLevel > 0 && (
                      <div className="flex items-center gap-1 text-xs text-rose-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Escalated</span>
                      </div>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Logs */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-white">
                    {/* Event Metadata */}
                    <div className="p-4 bg-slate-50/50 border-b border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="font-medium text-slate-600">Event ID:</span>
                        <p className="font-mono text-slate-900 mt-1">{event.id}</p>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Escalation Level:</span>
                        <p className="text-slate-900 mt-1">Level {event.escalationLevel}</p>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Interaction Time:</span>
                        <p className="text-slate-900 mt-1">
                          {event.interactionTime ? formatTimestamp(event.interactionTime) : 'Not verified'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Acknowledged Time:</span>
                        <p className="text-slate-900 mt-1">
                          {event.acknowledgedTime ? formatTimestamp(event.acknowledgedTime) : 'Not acknowledged'}
                        </p>
                      </div>
                    </div>

                    {/* Logs Timeline */}
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Escalation Log Timeline
                      </h3>
                      <div className="space-y-2">
                        {event.logs.length === 0 ? (
                          <p className="text-sm text-slate-500 italic">No logs recorded yet</p>
                        ) : (
                          event.logs.map((log, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100"
                            >
                              {/* Timeline marker */}
                              <div className="flex flex-col items-center">
                                <div className={clsx(
                                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                  log.level === 0 ? "bg-slate-200 text-slate-700" :
                                  log.level === 1 ? "bg-amber-200 text-amber-700" :
                                  log.level === 2 ? "bg-orange-200 text-orange-700" :
                                  "bg-rose-200 text-rose-700"
                                )}>
                                  {log.level}
                                </div>
                                {index < event.logs.length - 1 && (
                                  <div className="w-0.5 h-8 bg-slate-200 mt-1"></div>
                                )}
                              </div>

                              {/* Log details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="font-medium text-slate-900 text-sm">
                                    {log.action}
                                  </span>
                                  <span className="text-xs text-slate-500 font-mono whitespace-nowrap">
                                    {formatTimestamp(log.timestamp)}
                                  </span>
                                </div>
                                {log.recipient && (
                                  <div className="text-xs text-indigo-600 mt-1">
                                    → {log.recipient}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Tip:</strong> Enter "08:30" in the search box to see all logs for the 8:30 AM interaction event.
          Each event shows its complete escalation timeline from scheduled through all escalation levels.
        </p>
      </div>
    </motion.div>
  );
}