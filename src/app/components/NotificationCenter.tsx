import { useState, useEffect } from 'react';
import { Bell, X, Check, AlertTriangle, Activity, Wifi, BatteryLow, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markNotificationRead, deleteNotification as deleteNotificationDB, type Notification as DBNotification } from '../../utils/supabase/helpers';

export type NotificationType = 
  | 'medication_missed'
  | 'escalation_active'
  | 'device_offline'
  | 'battery_low'
  | 'environmental_alert'
  | 'emergency_button'
  | 'system_info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  urgent: boolean;
  patientName?: string;
  actionUrl?: string;
}

const NOTIFICATION_ICONS: Record<string, React.ElementType> = {
  medication_missed: Clock,
  medication: Clock,
  escalation_active: AlertTriangle,
  escalation: AlertTriangle,
  device_offline: Wifi,
  device: Wifi,
  battery_low: BatteryLow,
  environmental_alert: Activity,
  environmental: Activity,
  routine: Activity,
  emergency_button: AlertTriangle,
  safety: AlertTriangle,
  system_info: Bell,
  system: Bell
};

const NOTIFICATION_COLORS: Record<string, string> = {
  medication_missed: 'text-amber-600 bg-amber-50',
  medication: 'text-amber-600 bg-amber-50',
  escalation_active: 'text-red-600 bg-red-50',
  escalation: 'text-red-600 bg-red-50',
  device_offline: 'text-slate-600 bg-slate-50',
  device: 'text-slate-600 bg-slate-50',
  battery_low: 'text-orange-600 bg-orange-50',
  environmental_alert: 'text-blue-600 bg-blue-50',
  environmental: 'text-blue-600 bg-blue-50',
  routine: 'text-blue-600 bg-blue-50',
  emergency_button: 'text-red-600 bg-red-50',
  safety: 'text-red-600 bg-red-50',
  system_info: 'text-indigo-600 bg-indigo-50',
  system: 'text-indigo-600 bg-indigo-50'
};

export default function NotificationCenter() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<DBNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from Supabase
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const data = await getNotifications(user.id);
        setNotifications(data);
      } catch (error) {
        // Silent fallback - expected on timeout or network errors
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    
    // Poll for new notifications every 30 seconds (in production, use Supabase Realtime)
    if (user?.id) {
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => !n.read && n.urgent).length;

  const markAsRead = async (id: string) => {
    if (!user) return;
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    await markNotificationRead(user.id, id);
  };

  const markAllAsRead = async () => {
    if (!user) return;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    for (const n of notifications) {
      await markNotificationRead(user.id, n.id);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!user) return;
    setNotifications(prev => prev.filter(n => n.id !== id));
    await deleteNotificationDB(user.id, id);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Bell Icon Button - COMPACT to match role badges */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative px-1.5 sm:px-3 py-1 sm:py-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md sm:rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 transition-colors shadow-md"
      >
        <Bell className={clsx(
          "w-3 h-3 sm:w-4 sm:h-4",
          urgentCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'
        )} />
        {unreadCount > 0 && (
          <span className={clsx(
            "absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full text-[8px] sm:text-[9px] font-bold flex items-center justify-center text-white",
            urgentCount > 0 ? "bg-red-600 animate-pulse" : "bg-indigo-600"
          )}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />

          {/* Notification Panel */}
          <div className="absolute right-0 top-12 w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-slate-600 dark:text-slate-400">{unreadCount} unread</p>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <Bell size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="font-semibold">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <Bell size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="font-semibold">No notifications</p>
                  <p className="text-sm">You're all caught up!</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = NOTIFICATION_ICONS[notification.type];
                  const colorClass = NOTIFICATION_COLORS[notification.type];

                  return (
                    <div
                      key={notification.id}
                      className={clsx(
                        "p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer",
                        !notification.read && "bg-indigo-50/30 dark:bg-indigo-900/20"
                      )}
                      onClick={() => {
                        markAsRead(notification.id);
                        if (notification.actionUrl) {
                          navigate(notification.actionUrl);
                        }
                      }}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className={clsx("p-2 rounded-lg shrink-0 h-fit", colorClass)}>
                          <Icon size={20} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className={clsx(
                              "font-semibold text-sm",
                              !notification.read ? "text-slate-900 dark:text-slate-100" : "text-slate-700 dark:text-slate-300"
                            )}>
                              {notification.title}
                              {notification.urgent && (
                                <span className="ml-2 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full">
                                  Urgent
                                </span>
                              )}
                            </h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notification.id);
                              }}
                              className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 shrink-0"
                            >
                              <X size={16} />
                            </button>
                          </div>

                          {notification.patientName && (
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">
                              {notification.patientName}
                            </p>
                          )}

                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                              >
                                <Check size={14} />
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center">
                <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold">
                  View All Notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}