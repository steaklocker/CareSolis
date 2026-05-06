import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';
import {
  Bell,
  BellOff,
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Save,
  Info,
  Phone,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUserRole } from '../context/UserRoleContext';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;

interface NotificationPreferences {
  enabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  escalationLevels: {
    level1: boolean; // T+15 min
    level2: boolean; // T+30 min
    level3: boolean; // T+60 min
  };
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "07:00"
  };
  testMode: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  smsEnabled: true,
  pushEnabled: false,
  emailEnabled: false,
  escalationLevels: {
    level1: true,  // Always notify at L1 (critical)
    level2: true,  // Always notify at L2 (critical)
    level3: true,  // Always notify at L3 (critical)
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '07:00',
  },
  testMode: false,
};

export default function NotificationSettings() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [twilioConfigured, setTwilioConfigured] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
    checkTwilioStatus();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${SERVER_URL}/notification-preferences`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences || DEFAULT_PREFERENCES);
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
      toast.error('Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const checkTwilioStatus = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/twilio-status`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTwilioConfigured(data.configured);
      }
    } catch (error) {
      console.error('Failed to check Twilio status:', error);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${SERVER_URL}/notification-preferences`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      });

      if (response.ok) {
        toast.success('Notification preferences saved');
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      setSendingTest(true);
      const response = await fetch(`${SERVER_URL}/test-notification`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'sms',
          escalationLevel: 1
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Test SMS sent successfully! Check your phone.');
        } else {
          toast.warning(`Test SMS not sent: ${data.message}`);
        }
      } else {
        throw new Error('Failed to send test notification');
      }
    } catch (error) {
      console.error('Failed to send test notification:', error);
      toast.error('Failed to send test notification');
    } finally {
      setSendingTest(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-black flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading notification settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Notification Settings
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Configure alerts for medication escalations
              </p>
            </div>
          </div>
        </div>

        {/* Twilio Status Warning */}
        {!twilioConfigured && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                  SMS Notifications Not Configured
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Twilio SMS service is not configured. SMS notifications will be logged but not sent.
                  Contact your administrator to set up Twilio credentials.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Settings Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
          {/* Master Toggle */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 mb-6">
            <div className="flex items-center gap-3">
              {preferences.enabled ? (
                <Bell className="w-6 h-6 text-blue-600" />
              ) : (
                <BellOff className="w-6 h-6 text-slate-400" />
              )}
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Notifications {preferences.enabled ? 'Enabled' : 'Disabled'}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {preferences.enabled
                    ? 'You will receive alerts when escalations occur'
                    : 'All notifications are disabled'}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setPreferences(prev => ({ ...prev, enabled: !prev.enabled }))}
              variant={preferences.enabled ? 'default' : 'outline'}
              className={preferences.enabled ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              {preferences.enabled ? 'Disable All' : 'Enable All'}
            </Button>
          </div>

          {/* Notification Channels */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Notification Channels
            </h3>

            {/* SMS */}
            <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">SMS Text Messages</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Receive immediate text alerts on your phone
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.smsEnabled}
                onChange={(e) => setPreferences(prev => ({ ...prev, smsEnabled: e.target.checked }))}
                disabled={!preferences.enabled}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>

            {/* Push Notifications (Future) */}
            <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="font-semibold text-slate-600 dark:text-slate-400">Push Notifications</div>
                  <div className="text-sm text-slate-500 dark:text-slate-500">
                    Coming soon - Browser and mobile app push alerts
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.pushEnabled}
                disabled
                className="w-5 h-5 text-slate-400 rounded"
              />
            </label>
          </div>

          {/* Escalation Level Settings */}
          <div className="space-y-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Escalation Levels
              </h3>
              <div className="text-xs text-slate-500 dark:text-slate-400">All enabled by default (critical)</div>
            </div>

            {/* Level 1 */}
            <label className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold">
                  L1
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Level 1 - Early Alert</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    15 minutes after scheduled time - First caregiver notified
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.escalationLevels.level1}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  escalationLevels: { ...prev.escalationLevels, level1: e.target.checked }
                }))}
                disabled={!preferences.enabled}
                className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
              />
            </label>

            {/* Level 2 */}
            <label className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">
                  L2
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Level 2 - Urgent Alert</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    30 minutes after - Second caregiver notified, dose moved to abeyance
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.escalationLevels.level2}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  escalationLevels: { ...prev.escalationLevels, level2: e.target.checked }
                }))}
                disabled={!preferences.enabled}
                className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
              />
            </label>

            {/* Level 3 */}
            <label className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800 cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-600 rounded-lg flex items-center justify-center text-white font-bold">
                  L3
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Level 3 - Critical Alert</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    60 minutes after - All caregivers notified, dose moved to missed reservoir
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.escalationLevels.level3}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  escalationLevels: { ...prev.escalationLevels, level3: e.target.checked }
                }))}
                disabled={!preferences.enabled}
                className="w-5 h-5 text-rose-600 rounded focus:ring-2 focus:ring-rose-500"
              />
            </label>
          </div>

          {/* Quiet Hours */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Quiet Hours
              </h3>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={preferences.quietHours.enabled}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    quietHours: { ...prev.quietHours, enabled: e.target.checked }
                  }))}
                  disabled={!preferences.enabled}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">Enable quiet hours</span>
              </label>
            </div>

            {preferences.quietHours.enabled && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={preferences.quietHours.start}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, start: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={preferences.quietHours.end}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, end: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  ⚠️ Critical Level 3 alerts will bypass quiet hours for safety
                </p>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-200">
                <p className="font-semibold mb-1">How Escalation Notifications Work</p>
                <ul className="space-y-1 text-blue-800 dark:text-blue-300">
                  <li>• <strong>T+15 min (L1):</strong> First caregiver receives SMS alert</li>
                  <li>• <strong>T+30 min (L2):</strong> Second caregiver receives SMS alert</li>
                  <li>• <strong>T+60 min (L3):</strong> All caregivers receive critical SMS alert</li>
                  <li>• SMS includes patient name, time, and escalation level</li>
                  <li>• Notifications are filtered by Care Circle priority settings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Button
            onClick={savePreferences}
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Preferences
              </>
            )}
          </Button>

          <Button
            onClick={sendTestNotification}
            disabled={sendingTest || !preferences.enabled || !preferences.smsEnabled || !twilioConfigured}
            variant="outline"
            className="py-6"
          >
            {sendingTest ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Smartphone className="w-5 h-5 mr-2" />
                Send Test SMS
              </>
            )}
          </Button>
        </div>

        {/* Success Status */}
        {twilioConfigured && preferences.enabled && (
          <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div className="text-sm text-emerald-900 dark:text-emerald-200">
                <strong>SMS notifications are active</strong> - You'll receive alerts when escalations occur
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
