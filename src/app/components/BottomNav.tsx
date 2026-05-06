import React from 'react';
import { Link, useLocation } from 'react-router';
import { Home, Pill, MessageCircle, Activity, MoreHorizontal, LayoutDashboard, User } from 'lucide-react';
import { clsx } from 'clsx';
import { useUserRole } from '../context/UserRoleContext';

export function BottomNav() {
  const { isAdmin } = useUserRole();
  const location = useLocation();

  // Industry-standard caregiver bottom nav pattern
  // Based on best-in-class RPM apps (CareZone, Medisafe, MyChart)
  // 1. Home - Patient status dashboard (medication adherence, alerts)
  // 2. Meds - Today's medications (action-oriented)
  // 3. Messages - Alerts + care team communication hub
  // 4. Activity - Recent history and trends
  // 5. More - Settings, manuals, secondary features
  const caregiverTabs = [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/medications', label: 'Meds', icon: Pill, end: false },
    { to: '/care-messaging', label: 'Messages', icon: MessageCircle, end: false },
    { to: '/log', label: 'Activity', icon: Activity, end: false },
    { to: '/help-center', label: 'More', icon: MoreHorizontal, end: false },
  ];

  const adminTabs = [
    { to: '/', label: 'Summary', icon: LayoutDashboard, end: true },
    { to: '/medication-hub', label: 'Meds', icon: Pill, end: false },
    { to: '/care-messaging', label: 'Messages', icon: MessageCircle, end: false },
    { to: '/analytics', label: 'Analytics', icon: Activity, end: false },
    { to: '/system-settings', label: 'Settings', icon: User, end: false },
  ];

  const tabs = isAdmin ? adminTabs : caregiverTabs;

  const isActive = (path: string, end?: boolean) => {
    if (end) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.3)]">
      {/* iPhone 16 Pro Max optimized bottom tab bar - Industry standard iOS design */}
      <div className="bg-white/95 dark:bg-black/95 backdrop-blur-xl">
        {/* Tab bar content - 64px minimum touch target height per Apple HIG */}
        <div className="grid h-16" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.to, tab.end);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={clsx(
                  'flex flex-col items-center justify-center gap-1 h-full transition-all duration-200 active:scale-95',
                  active
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400'
                )}
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  userSelect: 'none',
                  WebkitUserSelect: 'none'
                }}
              >
                <Icon
                  className={clsx(
                    'w-6 h-6 transition-all',
                    active && 'drop-shadow-[0_2px_4px_rgba(16,185,129,0.3)]'
                  )}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className={clsx(
                  'text-[10px] leading-tight transition-all',
                  active ? 'font-semibold' : 'font-medium'
                )}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Safe area for home indicator - iPhone 16 Pro Max */}
        <div className="h-[env(safe-area-inset-bottom,20px)] bg-white dark:bg-black" />
      </div>
    </nav>
  );
}
