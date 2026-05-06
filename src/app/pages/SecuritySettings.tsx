import React, { useState, useEffect } from 'react';
import { useUserRole } from '../context/UserRoleContext';
import { Shield, Lock, Clock, Fingerprint, Bell, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function SecuritySettings() {
  const { isAdmin } = useUserRole();
  
  // Mock security settings since we're not using AuthV2 backend
  const [settings, setSettings] = useState({
    requireMFA: true,
    defaultSessionTimeoutMinutes: 60,
    maxFailedLoginAttempts: 5,
    passwordExpiryDays: 90,
    requirePasswordChange: true,
    deviceApprovalRequired: false,
    anomalyDetectionEnabled: true,
    notifyOnNewDevice: true,
    notifyOnSuspiciousLogin: true,
    notifyOnPasswordChange: true
  });
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Check permission - use UserRoleContext instead of AuthV2
  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
          <p className="text-rose-700">You don't have permission to manage security settings. Only administrators can modify security configuration.</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // TODO: Implement API call to save settings
      console.log('Saving security settings:', settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Security settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-slate-900">Security Settings</h1>
        </div>
        <p className="text-slate-600">Configure FDA-compliant authentication and security policies</p>
      </div>

      {/* Status Messages */}
      {success && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <p className="text-emerald-700">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          <p className="text-rose-700">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* MFA Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Multi-Factor Authentication</h2>
          </div>

          <div className="space-y-4">
            {/* Global MFA Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">Require MFA for All Users</p>
                <p className="text-sm text-slate-600">All users must enable MFA to access the system</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requireMFA}
                  onChange={(e) => setSettings({ ...settings, requireMFA: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Session Timeout Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Session Timeout</h2>
          </div>

          <div className="space-y-4">
            {/* Default Timeout */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <label className="block font-medium text-slate-900 mb-2">Default Session Timeout (Minutes)</label>
              <input
                type="number"
                value={settings.defaultSessionTimeoutMinutes}
                onChange={(e) => setSettings({ ...settings, defaultSessionTimeoutMinutes: parseInt(e.target.value) || 30 })}
                className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                min="5"
                max="480"
              />
              <p className="text-xs text-slate-600 mt-1">Default inactivity timeout for all users</p>
            </div>

            {/* Absolute Max Session */}
            <div className="p-4 border border-slate-200 rounded-lg">
              <label className="block font-medium text-slate-900 mb-2">Absolute Maximum Session (Hours)</label>
              <input
                type="number"
                value={settings.absoluteSessionMaxHours}
                onChange={(e) => setSettings({ ...settings, absoluteSessionMaxHours: parseInt(e.target.value) || 8 })}
                className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                min="1"
                max="24"
              />
              <p className="text-xs text-slate-600 mt-1">Max session length regardless of activity</p>
            </div>

            {/* Allow Multiple Sessions */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">Allow Multiple Sessions</p>
                <p className="text-sm text-slate-600">Users can be logged in on multiple devices</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowMultipleSessions}
                  onChange={(e) => setSettings({ ...settings, allowMultipleSessions: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Anomaly Detection */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Anomaly Detection</h2>
          </div>

          <div className="space-y-4">
            {/* Enable Anomaly Detection */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">Enable Anomaly Detection</p>
                <p className="text-sm text-slate-600">AI-powered login anomaly detection</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.anomalyDetectionEnabled}
                  onChange={(e) => setSettings({ ...settings, anomalyDetectionEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Anomaly Types */}
            <div className="p-4 border border-slate-200 rounded-lg">
              <p className="font-medium text-slate-900 mb-3">Alert On</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnNewDevice}
                    onChange={(e) => setSettings({ ...settings, notifyOnNewDevice: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700">New Device</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnSuspiciousLogin}
                    onChange={(e) => setSettings({ ...settings, notifyOnSuspiciousLogin: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700">Suspicious Login</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnPasswordChange}
                    onChange={(e) => setSettings({ ...settings, notifyOnPasswordChange: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700">Password Change</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Account Lockout */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Fingerprint className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Account Lockout</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Max Failed Attempts</label>
              <input
                type="number"
                value={settings.maxFailedLoginAttempts}
                onChange={(e) => setSettings({ ...settings, maxFailedLoginAttempts: parseInt(e.target.value) || 5 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                min="1"
                max="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Lockout Duration (Minutes)</label>
              <input
                type="number"
                value={settings.lockoutDurationMinutes}
                onChange={(e) => setSettings({ ...settings, lockoutDurationMinutes: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                min="5"
                max="120"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Permanent Lockout After</label>
              <input
                type="number"
                value={settings.lockoutPermanentAfterAttempts}
                onChange={(e) => setSettings({ ...settings, lockoutPermanentAfterAttempts: parseInt(e.target.value) || 10 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                min="5"
                max="50"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}