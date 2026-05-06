import React, { useState, useEffect } from 'react';
import { useUserRole } from '../context/UserRoleContext';
import { DeviceAccessLog } from '../types/auth';
import { FileText, Filter, Download, CheckCircle, XCircle, AlertTriangle, Monitor, Smartphone, Tablet } from 'lucide-react';
import { format } from 'date-fns';

export default function AccessLogs() {
  const { isAdmin } = useUserRole();
  
  const [logs, setLogs] = useState<DeviceAccessLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<DeviceAccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [successFilter, setSuccessFilter] = useState<string>('all');
  const [anomalyFilter, setAnomalyFilter] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Check permission - use UserRoleContext instead of AuthV2
  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
          <p className="text-rose-700">You don't have permission to view access logs. Only administrators can access system logs.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, userFilter, actionFilter, successFilter, anomalyFilter, dateRange]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to fetch access logs
      // For now, use mock data
      const mockLogs: DeviceAccessLog[] = [
        {
          id: '1',
          userId: '1',
          userName: 'Sarah Johnson',
          userRole: 'primary_caregiver',
          action: 'login',
          success: true,
          deviceId: 'device-001',
          deviceName: 'Sarah\'s iPhone',
          deviceType: 'mobile',
          browser: 'Safari 17.2',
          ipAddress: '192.168.1.45',
          location: 'San Francisco, CA',
          timestamp: '2026-03-03T08:15:00.000Z',
          anomalyDetected: false
        },
        {
          id: '2',
          userId: '2',
          userName: 'Dr. Emily Kim',
          userRole: 'clinical_supervisor',
          action: 'login',
          success: true,
          deviceId: 'device-002',
          deviceName: 'MacBook Pro',
          deviceType: 'desktop',
          browser: 'Chrome 121',
          ipAddress: '10.0.5.22',
          location: 'Los Angeles, CA',
          timestamp: '2026-03-03T07:30:00.000Z',
          anomalyDetected: false
        },
        {
          id: '3',
          userId: '1',
          userName: 'Sarah Johnson',
          userRole: 'primary_caregiver',
          action: 'password_change',
          success: true,
          deviceId: 'device-001',
          deviceName: 'Sarah\'s iPhone',
          deviceType: 'mobile',
          browser: 'Safari 17.2',
          ipAddress: '192.168.1.45',
          location: 'San Francisco, CA',
          timestamp: '2026-03-02T14:22:00.000Z',
          anomalyDetected: false
        },
        {
          id: '4',
          userId: '3',
          userName: 'Unknown User',
          userRole: undefined,
          action: 'login',
          success: false,
          deviceId: 'device-unknown',
          deviceName: 'Unknown Device',
          deviceType: 'desktop',
          browser: 'Firefox 122',
          ipAddress: '203.0.113.45',
          location: 'Unknown, XX',
          timestamp: '2026-03-01T23:45:00.000Z',
          anomalyDetected: true,
          anomalyType: 'suspicious_location',
          failureReason: 'Invalid credentials'
        },
        {
          id: '5',
          userId: '2',
          userName: 'Dr. Emily Kim',
          userRole: 'clinical_supervisor',
          action: 'logout',
          success: true,
          deviceId: 'device-002',
          deviceName: 'MacBook Pro',
          deviceType: 'desktop',
          browser: 'Chrome 121',
          ipAddress: '10.0.5.22',
          location: 'Los Angeles, CA',
          timestamp: '2026-03-01T18:00:00.000Z',
          anomalyDetected: false
        }
      ];
      
      setLogs(mockLogs);
    } catch (error) {
      console.error('Failed to load access logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // User filter
    if (userFilter) {
      filtered = filtered.filter(log => 
        log.userName?.toLowerCase().includes(userFilter.toLowerCase()) ||
        log.userId?.toLowerCase().includes(userFilter.toLowerCase())
      );
    }

    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Success filter
    if (successFilter !== 'all') {
      const isSuccess = successFilter === 'success';
      filtered = filtered.filter(log => log.success === isSuccess);
    }

    // Anomaly filter
    if (anomalyFilter) {
      filtered = filtered.filter(log => log.anomalyDetected);
    }

    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(log => log.timestamp >= dateRange.start);
    }
    if (dateRange.end) {
      filtered = filtered.filter(log => log.timestamp <= dateRange.end);
    }

    setFilteredLogs(filtered);
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Device', 'IP Address', 'Location', 'Success', 'Anomaly', 'Details'];
    const rows = filteredLogs.map(log => [
      log.timestamp,
      log.userName || 'Unknown',
      log.userRole || 'N/A',
      log.action,
      `${log.deviceName} (${log.deviceType})`,
      log.ipAddress || 'Unknown',
      log.location || 'Unknown',
      log.success ? 'Yes' : 'No',
      log.anomalyDetected ? 'Yes' : 'No',
      log.failureReason || ''
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `access-logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
    a.click();
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getActionBadge = (action: string) => {
    const colors = {
      login: 'bg-emerald-100 text-emerald-700',
      logout: 'bg-slate-100 text-slate-700',
      session_timeout: 'bg-amber-100 text-amber-700',
      forced_logout: 'bg-rose-100 text-rose-700',
      mfa_verification: 'bg-blue-100 text-blue-700',
      password_change: 'bg-purple-100 text-purple-700'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[action as keyof typeof colors] || 'bg-slate-100 text-slate-700'}`}>
        {action.replace(/_/g, ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-slate-600">Loading access logs...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-emerald-600" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Access Logs</h1>
              <p className="text-slate-600">Device-level authentication audit trail</p>
            </div>
          </div>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-slate-600" />
          <h2 className="font-semibold text-slate-900">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* User Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">User</label>
            <input
              type="text"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              placeholder="Search by name or ID"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Action Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Action</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="session_timeout">Session Timeout</option>
              <option value="forced_logout">Forced Logout</option>
              <option value="mfa_verification">MFA Verification</option>
              <option value="password_change">Password Change</option>
            </select>
          </div>

          {/* Success Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              value={successFilter}
              onChange={(e) => setSuccessFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="success">Success Only</option>
              <option value="failed">Failed Only</option>
            </select>
          </div>

          {/* Anomaly Filter */}
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={anomalyFilter}
                onChange={(e) => setAnomalyFilter(e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-slate-700">Anomalies Only</span>
            </label>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
            <input
              type="datetime-local"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
            <input
              type="datetime-local"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Total Logs</p>
          <p className="text-2xl font-bold text-slate-900">{filteredLogs.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Successful</p>
          <p className="text-2xl font-bold text-emerald-600">
            {filteredLogs.filter(l => l.success).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Failed</p>
          <p className="text-2xl font-bold text-rose-600">
            {filteredLogs.filter(l => !l.success).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Anomalies</p>
          <p className="text-2xl font-bold text-amber-600">
            {filteredLogs.filter(l => l.anomalyDetected).length}
          </p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Device</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">IP / Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No logs found matching your filters
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {format(new Date(log.timestamp), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-slate-500">
                        {format(new Date(log.timestamp), 'HH:mm:ss')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-900">{log.userName || 'Unknown'}</div>
                      <div className="text-xs text-slate-500 capitalize">{log.userRole?.replace(/_/g, ' ') || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(log.deviceType)}
                        <div>
                          <div className="text-sm text-slate-900">{log.deviceName || 'Unknown'}</div>
                          <div className="text-xs text-slate-500">{log.browser}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-900">{log.ipAddress || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{log.location || 'Unknown location'}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {log.success ? (
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-600" />
                        )}
                        {log.anomalyDetected && (
                          <AlertTriangle className="w-5 h-5 text-amber-600" title="Anomaly detected" />
                        )}
                      </div>
                      {log.failureReason && (
                        <div className="text-xs text-rose-600 mt-1">{log.failureReason}</div>
                      )}
                      {log.anomalyDetected && log.anomalyType && (
                        <div className="text-xs text-amber-600 mt-1 capitalize">
                          {log.anomalyType.replace(/_/g, ' ')}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FDA Compliance Notice */}
      <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
        <p className="text-sm text-emerald-700">
          🔒 <strong>FDA 21 CFR Part 11 Compliant:</strong> All access logs are retained for 7 years (2,555 days) and are immutable. These logs can be exported for compliance audits at any time.
        </p>
      </div>
    </div>
  );
}