import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;

export default function EscalationDiagnostic() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerResult, setTriggerResult] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const triggerEscalationCheck = async () => {
    setIsTriggering(true);
    setTriggerResult(null);
    try {
      const now = new Date();
      const localTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      const localDate = now.toLocaleDateString('en-CA');
      
      console.log('🔄 Manual escalation check triggered:', { localTime, localDate });
      
      const response = await fetch(`${SERVER_URL}/events/check`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ localTime, localDate })
      });
      
      const result = await response.json();
      console.log('✅ Escalation check result:', result);
      setTriggerResult('Escalation check completed. Check console logs for details.');
      
      // Refresh data after trigger
      setTimeout(fetchData, 1000);
    } catch (error) {
      console.error('❌ Failed to trigger escalation check:', error);
      setTriggerResult('Error triggering escalation check. See console for details.');
    } finally {
      setIsTriggering(false);
    }
  };

  const fetchData = async () => {
    try {
      const [configRes, eventsRes, logsRes, notificationsRes] = await Promise.all([
        fetch(`${SERVER_URL}/settings`, { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }),
        fetch(`${SERVER_URL}/events?localDate=${new Date().toLocaleDateString('en-CA')}`, { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }),
        fetch(`${SERVER_URL}/logs`, { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }),
        fetch(`${SERVER_URL}/notifications`, { headers: { 'Authorization': `Bearer ${publicAnonKey}` } })
      ]);

      if (configRes.ok) setConfig(await configRes.json());
      if (eventsRes.ok) setEvents(await eventsRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
      if (notificationsRes.ok) setNotifications(await notificationsRes.json());
    } catch (error) {
      console.error('Failed to fetch diagnostic data:', error);
    }
  };

  const calculateEscalation = (scheduledTime: string) => {
    const [h, m] = scheduledTime.split(':').map(Number);
    const scheduledMinutes = h * 60 + m;
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const diff = currentMinutes - scheduledMinutes;

    // USE CONFIGURED OFFSET VALUES (matching backend logic)
    const reminderOffset = config?.reminderOffset || 0;
    const level1 = config?.level1Offset || 15;
    const level2 = config?.level2Offset || 30;
    const level3 = config?.level3Offset || 45;

    if (diff < 0) return { status: 'Future', minutes: diff, color: 'text-slate-400' };
    if (diff < reminderOffset) return { status: 'Scheduled', minutes: diff, color: 'text-emerald-400' };
    if (diff < level1) return { status: 'Reminder Active', minutes: diff, color: 'text-yellow-400' };
    if (diff < level2) return { status: 'Level 1 Escalation', minutes: diff, color: 'text-orange-400' };
    if (diff < level3) return { status: 'Level 2 Escalation', minutes: diff, color: 'text-rose-400' };
    return { status: 'Level 3+ Escalation', minutes: diff, color: 'text-red-600' };
  };

  const getScheduleTimes = () => {
    if (!config) return [];
    if (Array.isArray(config.schedule)) return config.schedule;
    if (config.schedule?.slots) {
      return config.schedule.slots.filter((s: any) => s.enabled).map((s: any) => s.time).sort();
    }
    return ["09:00", "11:00", "13:00", "15:00", "17:00"];
  };

  const todayLogs = logs.filter(l => {
    const logDate = new Date(l.isoTimestamp || l.timestamp);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  });

  const todayNotifications = notifications.filter(n => {
    const notificationDate = new Date(n.timestamp);
    const today = new Date();
    return notificationDate.toDateString() === today.toDateString();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-100">Escalation Diagnostic</h1>
              <p className="text-slate-400 mt-1">Real-time escalation state analysis</p>
            </div>
          </div>
          <button
            onClick={triggerEscalationCheck}
            disabled={isTriggering}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            {isTriggering ? 'Checking...' : 'Trigger Escalation Check'}
          </button>
        </div>
        
        {triggerResult && (
          <div className="bg-emerald-900/20 border border-emerald-700 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <p className="text-emerald-200">{triggerResult}</p>
          </div>
        )}

        {/* Current Time */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-emerald-400" />
            <div>
              <div className="text-sm text-slate-400">System Time</div>
              <div className="text-2xl font-mono font-bold text-slate-100">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              </div>
              <div className="text-sm text-slate-500">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" />
            Current Configuration
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <div className="text-xs text-slate-500">Reminder Offset</div>
              <div className="text-lg font-mono text-yellow-400">+{config?.reminderOffset || 0} min</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Level 1 Offset</div>
              <div className="text-lg font-mono text-orange-400">+{config?.level1Offset || 15} min</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Level 2 Offset</div>
              <div className="text-lg font-mono text-rose-400">+{config?.level2Offset || 30} min</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Level 3 Offset</div>
              <div className="text-lg font-mono text-red-600">+{config?.level3Offset || 45} min</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Level 3 Threshold</div>
              <div className="text-lg font-mono text-red-400">+{(config?.gracePeriod || 15) + 30} min</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-slate-500 mb-2">Scheduled Check-In Times</div>
            <div className="flex flex-wrap gap-2">
              {getScheduleTimes().map(time => (
                <div key={time} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg font-mono text-sm">
                  {time}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Expected Escalations (Theoretical) */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Expected Escalation State (If Not Logged)
          </h2>
          <div className="space-y-3">
            {getScheduleTimes().map(time => {
              const calc = calculateEscalation(time);
              return (
                <div key={time} className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="font-mono text-lg font-semibold text-slate-100">{time}</div>
                    <div className={`${calc.color} font-medium`}>{calc.status}</div>
                  </div>
                  <div className="text-slate-400 text-sm">
                    {calc.minutes >= 0 ? `+${calc.minutes} min` : `in ${Math.abs(calc.minutes)} min`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actual Events */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Actual Event State (From Database)
          </h2>
          {events.length === 0 ? (
            <div className="text-slate-400 text-center py-8">No events found for today</div>
          ) : (
            <div className="space-y-3">
              {events.map(event => (
                <div key={event.id} className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-mono text-lg font-semibold text-slate-100">{event.scheduledTime}</div>
                    <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      event.status === 'Scheduled' ? 'bg-slate-700 text-slate-300' :
                      event.status === 'ReminderActive' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      event.status.includes('Check-In On Time') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      event.status.includes('Check-In Delayed') ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      event.status === 'EscalationLevel1' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      event.status === 'EscalationLevel2' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      event.status === 'EscalationLevel3' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {event.status}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">Escalation Level: {event.escalationLevel}</div>
                  {event.logs && event.logs.length > 0 && (
                    <div className="mt-3 space-y-1 text-xs">
                      {event.logs.map((log: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-slate-400">
                          <span className="text-slate-600">•</span>
                          <span className="font-mono">{new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false })}</span>
                          <span>{log.action}</span>
                          {log.recipient && <span className="text-emerald-400">→ {log.recipient}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Logs */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-slate-100 mb-4">Today's Audit Logs</h2>
          {todayLogs.length === 0 ? (
            <div className="text-slate-400 text-center py-8">No audit logs for today</div>
          ) : (
            <div className="space-y-2">
              {todayLogs.slice(0, 10).map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-sm">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      log.type === 'success' ? 'bg-emerald-400' :
                      log.type === 'alert' ? 'bg-rose-400' :
                      'bg-slate-400'
                    }`} />
                    <span className="font-mono text-slate-400">{log.timestamp}</span>
                    <span className="text-slate-300">{log.message}</span>
                  </div>
                  <span className="text-slate-500 text-xs">{log.actor}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Notifications */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-slate-100 mb-4">Today's Notifications</h2>
          {todayNotifications.length === 0 ? (
            <div className="text-slate-400 text-center py-8">No notifications sent today</div>
          ) : (
            <div className="space-y-2">
              {todayNotifications.map(notification => (
                <div key={notification.id} className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm text-slate-400">
                      {new Date(notification.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                    </span>
                    <span className="text-emerald-400 text-sm">{notification.to}</span>
                  </div>
                  <div className="text-slate-300 font-medium text-sm">{notification.subject}</div>
                  <div className="text-slate-500 text-xs mt-1 whitespace-pre-wrap">{notification.body}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
