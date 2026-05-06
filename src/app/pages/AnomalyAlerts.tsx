import React, { useState, useEffect } from 'react';
import { useUserRole } from '../context/UserRoleContext';
import { LoginAnomalyAlert } from '../types/auth';
import { AlertTriangle, Shield, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function AnomalyAlerts() {
  const { isAdmin } = useUserRole();
  
  const [alerts, setAlerts] = useState<LoginAnomalyAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<LoginAnomalyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<LoginAnomalyAlert | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolving, setResolving] = useState(false);
  
  // Filters
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [resolvedFilter, setResolvedFilter] = useState<string>('unresolved');

  // Check permission - use UserRoleContext instead of AuthV2
  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
          <p className="text-rose-700">You don't have permission to view anomaly alerts. Only administrators can access security alerts.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [alerts, severityFilter, resolvedFilter]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to fetch anomaly alerts
      // For now, use mock data
      const mockAlerts: LoginAnomalyAlert[] = [
        {
          id: '1',
          userId: '3',
          userName: 'Unknown User',
          userRole: undefined,
          anomalyType: 'suspicious_location',
          severity: 'high',
          description: 'Login attempt from unusual location (203.0.113.45)',
          detectedAt: '2026-03-01T23:45:00.000Z',
          resolved: false,
          deviceId: 'device-unknown',
          deviceName: 'Unknown Device',
          ipAddress: '203.0.113.45',
          location: 'Unknown, XX',
          confidence: 0.95
        },
        {
          id: '2',
          userId: '1',
          userName: 'Sarah Johnson',
          userRole: 'primary_caregiver',
          anomalyType: 'unusual_time',
          severity: 'medium',
          description: 'Login at unusual time (3:22 AM)',
          detectedAt: '2026-03-02T03:22:00.000Z',
          resolved: true,
          resolvedAt: '2026-03-02T09:15:00.000Z',
          resolvedBy: '1',
          resolution: 'Verified with user - was traveling for work',
          deviceId: 'device-001',
          deviceName: 'Sarah\'s iPhone',
          ipAddress: '192.168.1.45',
          location: 'San Francisco, CA',
          confidence: 0.72
        },
        {
          id: '3',
          userId: '2',
          userName: 'Dr. Emily Kim',
          userRole: 'clinical_supervisor',
          anomalyType: 'multiple_failed_attempts',
          severity: 'low',
          description: '3 failed login attempts in 5 minutes',
          detectedAt: '2026-02-28T14:10:00.000Z',
          resolved: true,
          resolvedAt: '2026-02-28T14:30:00.000Z',
          resolvedBy: '2',
          resolution: 'User forgot password - reset successful',
          deviceId: 'device-002',
          deviceName: 'MacBook Pro',
          ipAddress: '10.0.5.22',
          location: 'Los Angeles, CA',
          confidence: 0.68
        },
        {
          id: '4',
          userId: '1',
          userName: 'Sarah Johnson',
          userRole: 'primary_caregiver',
          anomalyType: 'new_device',
          severity: 'medium',
          description: 'Login from new device',
          detectedAt: '2026-03-03T10:15:00.000Z',
          resolved: false,
          deviceId: 'device-003',
          deviceName: 'iPad',
          ipAddress: '192.168.1.47',
          location: 'San Francisco, CA',
          confidence: 0.85
        }
      ];
      
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Failed to load anomaly alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...alerts];

    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(alert => alert.severity === severityFilter);
    }

    // Resolved filter
    if (resolvedFilter === 'resolved') {
      filtered = filtered.filter(alert => alert.resolved);
    } else if (resolvedFilter === 'unresolved') {
      filtered = filtered.filter(alert => !alert.resolved);
    }

    // Sort: unresolved first, then by timestamp desc
    filtered.sort((a, b) => {
      if (a.resolved !== b.resolved) return a.resolved ? 1 : -1;
      return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
    });

    setFilteredAlerts(filtered);
  };

  const handleResolve = async () => {
    if (!selectedAlert || !isAdmin) return;
    
    setResolving(true);
    try {
      // TODO: Implement API call to resolve anomaly
      // For now, update local state
      setAlerts(alerts.map(a => 
        a.id === selectedAlert.id 
          ? { ...a, resolved: true, resolvedBy: isAdmin, resolvedAt: new Date().toISOString(), resolution: resolutionNotes }
          : a
      ));
      
      setSelectedAlert(null);
      setResolutionNotes('');
    } catch (error) {
      console.error('Failed to resolve anomaly:', error);
      alert('Failed to resolve anomaly. Please try again.');
    } finally {
      setResolving(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-rose-100 text-rose-700 border-rose-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'low': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <XCircle className="w-5 h-5" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getAnomalyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      new_device: 'New Device',
      unusual_location: 'Unusual Location',
      unusual_time: 'Unusual Time',
      rapid_location_change: 'Rapid Location Change',
      multiple_failed_attempts: 'Multiple Failed Attempts',
      impossible_travel: 'Impossible Travel'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-slate-600">Loading anomaly alerts...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-emerald-600" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Anomaly Alerts</h1>
            <p className="text-slate-600">AI-powered login anomaly detection and monitoring</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Severity Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Severity</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Resolved Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              value={resolvedFilter}
              onChange={(e) => setResolvedFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Alerts</option>
              <option value="unresolved">Unresolved Only</option>
              <option value="resolved">Resolved Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Total Alerts</p>
          <p className="text-2xl font-bold text-slate-900">{filteredAlerts.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-rose-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Critical/High</p>
          <p className="text-2xl font-bold text-rose-600">
            {filteredAlerts.filter(a => ['critical', 'high'].includes(a.severity)).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-amber-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Unresolved</p>
          <p className="text-2xl font-bold text-amber-600">
            {filteredAlerts.filter(a => !a.resolved).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-emerald-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Resolved</p>
          <p className="text-2xl font-bold text-emerald-600">
            {filteredAlerts.filter(a => a.resolved).length}
          </p>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <p className="text-slate-600">No anomaly alerts found</p>
            <p className="text-sm text-slate-500 mt-1">All systems nominal</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-xl shadow-sm border-2 p-6 transition-all hover:shadow-md ${
                alert.resolved ? 'border-slate-200 opacity-75' : getSeverityColor(alert.severity).replace('bg-', 'border-')
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-slate-900">
                        {getAnomalyTypeLabel(alert.anomalyType)}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      {alert.resolved && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">{alert.userName}</span>
                      {' '}({alert.userRole?.replace(/_/g, ' ')})
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm text-slate-500">
                  {format(new Date(alert.detectedAt), 'MMM dd, yyyy HH:mm')}
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-slate-600 mb-1">Device ID</p>
                  <p className="font-mono text-xs text-slate-900 break-all">{alert.deviceId}</p>
                </div>
                <div>
                  <p className="text-slate-600 mb-1">IP Address</p>
                  <p className="font-mono text-slate-900">{alert.ipAddress || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-slate-600 mb-1">Location</p>
                  <p className="text-slate-900">{alert.location || 'Unknown'}</p>
                </div>
              </div>

              {/* Alert Details */}
              <div className="p-3 bg-slate-50 rounded-lg mb-4">
                <p className="text-sm text-slate-700">{alert.description}</p>
              </div>

              {/* Resolution */}
              {alert.resolved ? (
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <p className="text-sm font-medium text-emerald-700">Resolved</p>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">
                    Resolved on {alert.resolvedAt ? format(new Date(alert.resolvedAt), 'MMM dd, yyyy HH:mm') : 'Unknown'}
                  </p>
                  {alert.resolution && (
                    <p className="text-sm text-slate-700 italic">&quot;{alert.resolution}&quot;</p>
                  )}
                </div>
              ) : (
                <div className="border-t border-slate-200 pt-4">
                  <button
                    onClick={() => setSelectedAlert(alert)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors text-sm"
                  >
                    Resolve Alert
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Resolution Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Resolve Anomaly Alert</h2>
            
            <div className="mb-4 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Alert Type</p>
              <p className="font-medium text-slate-900">{getAnomalyTypeLabel(selectedAlert.anomalyType)}</p>
              
              <p className="text-sm text-slate-600 mb-1 mt-2">User</p>
              <p className="font-medium text-slate-900">{selectedAlert.userName}</p>
              
              <p className="text-sm text-slate-600 mb-1 mt-2">Details</p>
              <p className="text-sm text-slate-700">{selectedAlert.description}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Resolution Notes <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-h-[120px]"
                placeholder="Describe how this anomaly was investigated and resolved..."
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                Example: &quot;Contacted user - confirmed new device purchase&quot; or &quot;Legitimate access from office location&quot;
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleResolve}
                disabled={resolving || !resolutionNotes.trim()}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {resolving ? 'Resolving...' : 'Mark as Resolved'}
              </button>
              <button
                onClick={() => {
                  setSelectedAlert(null);
                  setResolutionNotes('');
                }}
                disabled={resolving}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 <strong>Anomaly Detection:</strong> Caresolis uses AI-powered algorithms to detect unusual login patterns including new devices, unusual locations, unusual times, rapid location changes, and multiple failed attempts. Review and resolve alerts to maintain system security.
        </p>
      </div>
    </div>
  );
}