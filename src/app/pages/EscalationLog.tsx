import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useCaresolis } from '../hooks/useCaresolis';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  Clock,
  Calendar,
  User,
  Search,
  Download,
  Activity,
  CheckCircle2,
  Info,
  Server,
  Terminal,
  ShieldAlert,
  UserCheck,
  Mail,
  Shield,
  Timer
} from 'lucide-react';
import { clsx } from 'clsx';
import { Pagination } from '../components/Pagination';

export default function EscalationLog() {
  const { logs, health, notifications } = useCaresolis();
  const [searchParams] = useSearchParams();
  const initialFilter = (searchParams.get('filter') as 'all' | 'alert' | 'info' | 'success') || 'all';
  const [filterType, setFilterType] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDemoLogs, setShowDemoLogs] = useState(false);
  const [activeTab, setActiveTab] = useState<'system' | 'caregiver'>('system');
  const [selectedCaregiver, setSelectedCaregiver] = useState<string>('all');
  const itemsPerPage = 10;

  // DEMO DATA: Simulate an active escalation sequence for visualization
  const demoLogs = useMemo(() => {
      const now = new Date();
      // Create timestamps relative to now
      const getTime = (minutesAgo: number) => new Date(now.getTime() - minutesAgo * 60000).toISOString();
      
      return [
          {
              id: 'demo-ack',
              type: 'success',
              timestamp: getTime(5),
              isoTimestamp: getTime(5),
              message: 'Escalation Acknowledged',
              actor: 'user_manual',
              recipient: undefined
          },
          {
              id: 'demo-lvl2-note',
              type: 'alert',
              subtype: 'notification',
              timestamp: getTime(20),
              isoTimestamp: getTime(20),
              message: 'Alert Notification: Visibility Update: Level 2',
              details: 'Check-in overdue by 30 mins',
              actor: 'System',
              recipient: 'John Doe (Escalation Contact 2)'
          },
          {
              id: 'demo-lvl2-sys',
              type: 'alert',
              timestamp: getTime(20),
              isoTimestamp: getTime(20),
              message: 'Escalation Level 2 Triggered',
              actor: 'System',
              recipient: 'John Doe (Escalation Contact 2)'
          },
          {
              id: 'demo-lvl1-note',
              type: 'alert',
              subtype: 'notification',
              timestamp: getTime(35),
              isoTimestamp: getTime(35),
              message: 'Alert Notification: Visibility Update: Level 1',
              details: 'Check-in overdue by 15 mins',
              actor: 'System',
              recipient: 'Martha Kane (Escalation Contact 1)'
          },
          {
              id: 'demo-lvl1-sys',
              type: 'alert',
              timestamp: getTime(35),
              isoTimestamp: getTime(35),
              message: 'Escalation Level 1 Triggered',
              actor: 'System',
              recipient: 'Martha Kane (Escalation Contact 1)'
          }
      ];
  }, []);

  // Filter logs
  const filteredLogs = useMemo(() => {
    // 1. Normalize Notifications to Log format
    const notificationLogs = (notifications || []).map((n: any) => ({
        id: `note-${n.id}`,
        type: 'alert', // Treat as alert for filtering visibility
        subtype: 'notification',
        timestamp: n.timestamp, // ISO string
        isoTimestamp: n.timestamp,
        message: `Alert Notification: ${n.subject}`,
        details: n.body,
        actor: 'System',
        recipient: n.to
    }));

    // 2. Combine with System Logs
    let allItems = [...logs, ...notificationLogs];
    if (showDemoLogs) {
        allItems = [...allItems, ...demoLogs];
    }
    
    // Sort by timestamp desc
    allItems.sort((a, b) => {
        const tA = new Date(a.isoTimestamp || a.timestamp).getTime();
        const tB = new Date(b.isoTimestamp || b.timestamp).getTime();
        return tB - tA;
    });

    let filtered = allItems;
    
    // Apply Type Filter
    if (filterType !== 'all') {
        filtered = filtered.filter(l => {
            if (filterType === 'alert') return l.type === 'alert' || l.type === 'error';
            if (filterType === 'success') return l.type === 'success';
            if (filterType === 'info') return l.type === 'info' || l.type === 'message';
            return true;
        });
    }

    // Apply Search Filter
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(l => 
            l.message.toLowerCase().includes(query) || 
            (l.isoTimestamp && l.isoTimestamp.toLowerCase().includes(query)) ||
            (l.actor && l.actor.toLowerCase().includes(query)) ||
            (l.recipient && l.recipient.toLowerCase().includes(query)) ||
            (l.type && l.type.toLowerCase().includes(query))
        );
    }

    return filtered;
  }, [logs, notifications, demoLogs, filterType, searchQuery, showDemoLogs]);

  // Extract unique caregiver names from logs
  const caregivers = useMemo(() => {
    const names = new Set<string>();

    [...logs, ...notifications.map((n: any) => ({
      actor: 'System',
      recipient: n.to,
      message: n.subject
    }))].forEach(log => {
      // Extract caregiver from "Guest Verification: [Name]"
      if (log.message && log.message.includes('Guest Verification:')) {
        const match = log.message.match(/Guest Verification:\s*(.+)/);
        if (match) names.add(match[1].trim());
      }

      // Extract from manual user actions
      if (log.actor === 'user_manual' || log.actor === 'guest_access') {
        names.add('Resident/Guest');
      }

      // Extract from notification recipients
      if (log.recipient && log.recipient !== 'System') {
        const cleanName = log.recipient.replace(/\s*\(.*?\)\s*/g, '').trim();
        if (cleanName && !cleanName.toLowerCase().includes('system')) {
          names.add(cleanName);
        }
      }
    });

    return Array.from(names).sort();
  }, [logs, notifications]);

  // Filter caregiver-specific logs
  const caregiverLogs = useMemo(() => {
    if (activeTab !== 'caregiver') return [];

    let filtered = [...logs, ...notifications.map((n: any) => ({
      id: `note-${n.id}`,
      type: 'alert',
      subtype: 'notification',
      timestamp: n.timestamp,
      isoTimestamp: n.timestamp,
      message: `Alert Notification: ${n.subject}`,
      details: n.body,
      actor: 'System',
      recipient: n.to
    }))];

    // Filter by selected caregiver
    if (selectedCaregiver !== 'all') {
      filtered = filtered.filter(log => {
        // Match guest verification
        if (log.message?.includes(`Guest Verification: ${selectedCaregiver}`)) return true;

        // Match resident/guest actor
        if (selectedCaregiver === 'Resident/Guest' &&
            (log.actor === 'user_manual' || log.actor === 'guest_access')) return true;

        // Match notification recipient
        if (log.recipient?.includes(selectedCaregiver)) return true;

        return false;
      });
    } else {
      // Show only caregiver-related logs when "all" is selected
      filtered = filtered.filter(log =>
        log.actor === 'user_manual' ||
        log.actor === 'guest_access' ||
        log.message?.includes('Guest Verification:') ||
        log.message?.includes('Escalation') ||
        (log.recipient && !log.recipient.toLowerCase().includes('system'))
      );
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(l =>
        l.message?.toLowerCase().includes(query) ||
        (l.actor && l.actor.toLowerCase().includes(query)) ||
        (l.recipient && l.recipient.toLowerCase().includes(query))
      );
    }

    // Sort by timestamp desc
    filtered.sort((a, b) => {
      const tA = new Date(a.isoTimestamp || a.timestamp).getTime();
      const tB = new Date(b.isoTimestamp || b.timestamp).getTime();
      return tB - tA;
    });

    return filtered;
  }, [logs, notifications, selectedCaregiver, searchQuery, activeTab]);

  // Calculate caregiver activity metrics (FDA-compliant: factual only)
  const caregiverMetrics = useMemo(() => {
    if (activeTab !== 'caregiver') return null;

    const relevantLogs = caregiverLogs;

    // Count escalations received
    const escalationsReceived = relevantLogs.filter(log =>
      log.message?.includes('Escalation') && log.recipient
    ).length;

    // Count acknowledgments/actions
    const actionsLogged = relevantLogs.filter(log =>
      log.actor === 'user_manual' ||
      log.actor === 'guest_access' ||
      log.message?.includes('Guest Verification:') ||
      log.message?.includes('Acknowledged')
    ).length;

    // Calculate response times (where applicable)
    const responseTimes: number[] = [];

    // Group by date to find escalation -> acknowledgment pairs
    const logsByDate: { [key: string]: any[] } = {};
    relevantLogs.forEach(log => {
      const date = new Date(log.isoTimestamp || log.timestamp).toDateString();
      if (!logsByDate[date]) logsByDate[date] = [];
      logsByDate[date].push(log);
    });

    // Find response time pairs
    Object.values(logsByDate).forEach(dayLogs => {
      dayLogs.forEach((log, idx) => {
        if (log.message?.includes('Escalation Level')) {
          // Find next acknowledgment
          const ackLog = dayLogs.slice(idx).find(l =>
            l.message?.includes('Acknowledged') ||
            l.message?.includes('Guest Verification:') ||
            l.actor === 'user_manual'
          );

          if (ackLog) {
            const escalationTime = new Date(log.isoTimestamp || log.timestamp).getTime();
            const ackTime = new Date(ackLog.isoTimestamp || ackLog.timestamp).getTime();
            const diffMinutes = Math.abs((ackTime - escalationTime) / 1000 / 60);

            if (diffMinutes < 120) { // Only count if within 2 hours (reasonable)
              responseTimes.push(diffMinutes);
            }
          }
        }
      });
    });

    const avgResponseTime = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : null;

    const medianResponseTime = responseTimes.length > 0
      ? Math.round(responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length / 2)])
      : null;

    return {
      totalLogs: relevantLogs.length,
      escalationsReceived,
      actionsLogged,
      avgResponseMinutes: avgResponseTime,
      medianResponseMinutes: medianResponseTime,
      responseSampleSize: responseTimes.length
    };
  }, [caregiverLogs, activeTab]);

  // Pagination logic
  const displayLogs = activeTab === 'caregiver' ? caregiverLogs : filteredLogs;
  const totalPages = Math.ceil(displayLogs.length / itemsPerPage);
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return displayLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [displayLogs, currentPage]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = logs.length;
    const alerts = logs.filter(l => l.type === 'alert' || l.type === 'error').length;
    const success = logs.filter(l => l.type === 'success').length;
    
    // Calculate "System Health Score" based on recent errors vs total
    const score = total > 0 ? Math.round(((total - alerts) / total) * 100) : 100;

    return { total, alerts, success, score };
  }, [logs]);

  const downloadCSV = () => {
    const logsToExport = activeTab === 'caregiver' ? caregiverLogs : filteredLogs;
    const fileName = activeTab === 'caregiver'
      ? `caresolis_caregiver_activity_${selectedCaregiver !== 'all' ? selectedCaregiver.replace(/\s+/g, '_') + '_' : ''}${new Date().toISOString().split('T')[0]}.csv`
      : `caresolis_system_log_${new Date().toISOString().split('T')[0]}.csv`;

    let headers = ['ID', 'Timestamp', 'Type', 'Message', 'Recipient', 'Actor', 'Date', 'Time'];
    let disclaimer = '';

    if (activeTab === 'caregiver') {
      disclaimer = [
        '# CARESOLIS CAREGIVER ACTIVITY LOG - FDA CLASS II MEDICAL DEVICE',
        `# Export Date: ${new Date().toLocaleString()}`,
        `# Caregiver Filter: ${selectedCaregiver}`,
        `# Total Records: ${logsToExport.length}`,
        '# NOTICE: This log records caregiver actions for verification purposes only.',
        '# It does not evaluate caregiver performance or make clinical recommendations.',
        '# All clinical decisions remain with licensed healthcare providers.',
        ''
      ].join('\n');
    }

    const rows = logsToExport.map(log => {
      const dateObj = new Date(log.isoTimestamp || log.timestamp);
      const date = dateObj.toLocaleDateString();
      const time = dateObj.toLocaleTimeString();
      return [
        log.id,
        log.isoTimestamp || log.timestamp,
        log.type,
        `"${log.message.replace(/"/g, '""')}"`, // Escape quotes
        log.recipient || '',
        log.actor || 'system',
        date,
        time
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + disclaimer + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getIcon = (log: any) => {
    if (log.subtype === 'notification') return Mail;
    
    switch (log.type) {
        case 'success': return CheckCircle2;
        case 'alert':
        case 'error': return AlertTriangle;
        case 'info': return Info;
        case 'message': return Terminal;
        default: return Activity;
    }
  };

  const getVerifierName = (log: any) => {
    if (log.message.includes('Guest Verification:')) {
        const parts = log.message.split('Guest Verification:');
        return parts.length > 1 ? parts[1].trim() : 'Guest';
    }
    if (log.actor === 'user_manual') return 'Resident';
    return log.actor || 'System';
  };

  const getColors = (log: any) => {
    if (log.subtype === 'notification') {
         return {
            bg: "bg-indigo-50 dark:bg-indigo-900/20",
            border: "border-indigo-100 dark:border-indigo-900/50",
            text: "text-indigo-600 dark:text-indigo-400"
        };
    }

    switch (log.type) {
        case 'success': 
            return {
                bg: "bg-emerald-50 dark:bg-emerald-900/20",
                border: "border-emerald-100 dark:border-emerald-900/50",
                text: "text-emerald-600 dark:text-emerald-400"
            };
        case 'alert':
        case 'error':
            return {
                bg: "bg-rose-50 dark:bg-rose-900/20",
                border: "border-rose-100 dark:border-rose-900/50",
                text: "text-rose-600 dark:text-rose-400"
            };
        case 'info':
            return {
                bg: "bg-blue-50 dark:bg-blue-900/20",
                border: "border-blue-100 dark:border-blue-900/50",
                text: "text-blue-600 dark:text-blue-400"
            };
        default:
            return {
                bg: "bg-slate-50 dark:bg-slate-800",
                border: "border-slate-100 dark:border-slate-700",
                text: "text-slate-500 dark:text-slate-400"
            };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
                <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                {activeTab === 'system' ? 'System Activity Log' : 'Caregiver Activity Log'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
                {activeTab === 'system'
                  ? 'Comprehensive record of all system events, status changes, and automated processes.'
                  : 'Logged caregiver actions and escalation responses for verification purposes.'}
            </p>
        </div>
        <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 transition-colors shadow-sm"
        >
            <Download className="w-4 h-4" />
            Export CSV
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('system')}
            className={clsx(
              "flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2",
              activeTab === 'system'
                ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-b-2 border-indigo-600"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <Server className="w-4 h-4" />
            System Activity
          </button>
          <button
            onClick={() => setActiveTab('caregiver')}
            className={clsx(
              "flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2",
              activeTab === 'caregiver'
                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-b-2 border-emerald-600"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <UserCheck className="w-4 h-4" />
            Caregiver Activity Log
          </button>
        </div>
      </div>

      {/* FDA Compliance Disclaimer - Caregiver Tab Only */}
      {activeTab === 'caregiver' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-900 dark:text-blue-200 text-base mb-2">
                FDA Class II Medical Device - Verification Log
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                This summary displays logged caregiver actions for audit and verification purposes only.
                It does <strong>not</strong> evaluate caregiver performance, make clinical recommendations,
                or replace licensed healthcare provider oversight. All clinical decisions remain with
                authorized medical personnel. Metrics shown are factual calculations only.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Caregiver Filter & Metrics */}
      {activeTab === 'caregiver' && (
        <div className="space-y-4">
          {/* Caregiver Selector */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Filter by Caregiver:
            </label>
            <select
              value={selectedCaregiver}
              onChange={(e) => {
                setSelectedCaregiver(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="all">All Caregivers</option>
              {caregivers.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Activity Summary Metrics */}
          {caregiverMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-slate-500" />
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Total Logged
                  </p>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {caregiverMetrics.totalLogs}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Events Recorded
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Escalations
                  </p>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {caregiverMetrics.escalationsReceived}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Received
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-500" />
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions Logged
                  </p>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {caregiverMetrics.actionsLogged}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Interventions
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="w-4 h-4 text-slate-500" />
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Avg Duration
                  </p>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {caregiverMetrics.avgResponseMinutes !== null
                    ? `${caregiverMetrics.avgResponseMinutes}m`
                    : '—'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {caregiverMetrics.responseSampleSize > 0
                    ? `${caregiverMetrics.responseSampleSize} samples`
                    : 'No data'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* System Stats Cards (System Tab Only) */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <Server className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">Total Logs</span>
            </div>
            <div className="mt-2">
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Recorded System Events</p>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                    <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">Alerts</span>
            </div>
            <div className="mt-2">
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.alerts}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Escalations & Errors</p>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className={clsx("text-xs font-medium px-2 py-1 rounded-full",
                    health.status === 'nominal' ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                )}>
                    {health.status === 'nominal' ? 'Healthy' : 'Degraded'}
                </span>
            </div>
            <div className="mt-2">
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.score}%</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">System Stability Score</p>
            </div>
        </div>
        </div>
      )}

      {/* Main List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
             {/* Search */}
             <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input 
                    type="text" 
                    placeholder="Search logs by message, recipient, or type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                />
             </div>

             {/* Filters - System Tab Only */}
             {activeTab === 'system' && (
               <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1 hidden sm:block">Filter:</span>
                  <button
                      onClick={() => setFilterType('all')}
                      className={clsx(
                          "px-3 py-1.5 text-xs font-medium rounded-full transition-colors border whitespace-nowrap",
                          filterType === 'all'
                              ? "bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-800 dark:border-slate-100"
                              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                      )}
                  >
                      All
                  </button>
                  <button
                      onClick={() => setFilterType('success')}
                      className={clsx(
                          "px-3 py-1.5 text-xs font-medium rounded-full transition-colors border whitespace-nowrap",
                          filterType === 'success'
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                      )}
                  >
                      Success
                  </button>
                  <button
                      onClick={() => setFilterType('alert')}
                      className={clsx(
                          "px-3 py-1.5 text-xs font-medium rounded-full transition-colors border whitespace-nowrap",
                          filterType === 'alert'
                              ? "bg-rose-600 text-white border-rose-600"
                              : "bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-400 border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                      )}
                  >
                      Alerts
                  </button>
                  <button
                      onClick={() => setFilterType('info')}
                      className={clsx(
                          "px-3 py-1.5 text-xs font-medium rounded-full transition-colors border whitespace-nowrap",
                          filterType === 'info'
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      )}
                  >
                      Info
                  </button>
               </div>
             )}
        </div>

        {displayLogs.length === 0 ? (
          <div className="p-12 text-center">
             <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-300 dark:text-slate-600" />
             </div>
             <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
               {activeTab === 'caregiver' ? 'No Caregiver Activity Found' : 'No Logs Found'}
             </h3>
             <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
                {activeTab === 'caregiver'
                  ? 'No caregiver activity logs match your current filters. Try selecting a different caregiver or adjusting your search.'
                  : 'No system logs match your current filters. Try adjusting your search or filter settings.'}
             </p>
             {(filterType !== 'all' || searchQuery || selectedCaregiver !== 'all') && (
                 <button
                    onClick={() => {
                      setFilterType('all');
                      setSearchQuery('');
                      setSelectedCaregiver('all');
                    }}
                    className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                 >
                    Clear All Filters
                 </button>
             )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
             {paginatedLogs.map((log) => {
                const dateObj = new Date(log.isoTimestamp || log.timestamp);
                const colors = getColors(log);
                const Icon = getIcon(log);
                
                return (
                    <div key={log.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            {/* Icon & Time */}
                            <div className="flex items-start gap-4 min-w-[200px]">
                                <div className={clsx(
                                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-colors",
                                    colors.bg, colors.border, colors.text
                                )}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-medium text-slate-900 dark:text-slate-100">
                                        {dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{log.message}</p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                    {log.type !== 'success' && (
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                            <User className="w-3 h-3" />
                                            <span>Actor: {log.actor === 'user_manual' ? 'Resident' : log.actor || 'System'}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                        <Server className="w-3 h-3" />
                                        <span className="capitalize">Type: {log.type === 'alert' && log.subtype === 'notification' ? 'Notification' : log.type}</span>
                                    </div>
                                    {log.recipient && (
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <Mail className="w-3 h-3 text-indigo-500" />
                                            <span className="font-medium text-indigo-600 dark:text-indigo-400">Sent to: {log.recipient}</span>
                                        </div>
                                    )}
                                    {log.type === 'success' && (
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <UserCheck className="w-3 h-3 text-emerald-500" />
                                            <span className="font-medium text-emerald-600 dark:text-emerald-400">Verified by: {getVerifierName(log)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="shrink-0">
                                <span className={clsx(
                                    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors capitalize",
                                    colors.bg, colors.border, colors.text
                                )}>
                                    {log.type === 'error' ? 'Error' : 
                                     log.subtype === 'notification' ? 'Notification' :
                                     log.type === 'alert' ? 'Alert' : 
                                     log.type === 'success' ? 'Success' : 'Info'}
                                </span>
                            </div>
                        </div>
                        
                        {/* Technical Metadata */}
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 hidden group-hover:block md:hidden">
                            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500">ID: {log.id} • ISO: {log.isoTimestamp}</p>
                        </div>
                         <div className="mt-0 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[10px] font-mono text-slate-300 dark:text-slate-600 text-right mt-1">ID: {log.id}</p>
                        </div>
                    </div>
                );
             })}
          </div>
        )}
        <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={displayLogs.length}
            itemsPerPage={itemsPerPage}
        />
      </div>

      {/* FDA Footer Notice - Caregiver Tab Only */}
      {activeTab === 'caregiver' && displayLogs.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong>Verification Log Notice:</strong> Response times and action counts are calculated
                from logged timestamps for documentation purposes. These metrics do not constitute
                performance evaluations or quality assessments. Device-verified adherence data remains
                the authoritative source for patient medication compliance.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}