import React from 'react';
import { Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  Activity, 
  AlertTriangle, 
  Bell, 
  LineChart, 
  HeartPulse, 
  Settings, 
  ShieldCheck,
  Users,
  FileText,
  BookOpen,
  X,
  Pill,
  Calendar,
  Database,
  Package,
  DollarSign,
  Shield,
  Lock,
  UserCog,
  CheckSquare,
  Target,
  Brain,
  Server,
  MessageSquare,
  User,
  BarChart3,
  UserCircle,
  Video,
  Clock,
  Smartphone
} from 'lucide-react';
import { clsx } from 'clsx';
import { useCaresolis } from '../hooks/useCaresolis';
import { useUserRole } from '../context/UserRoleContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { stabilityScore, stabilityStatus } = useCaresolis();
  const { role, isAdmin, isCaregiver } = useUserRole();
  const location = useLocation();

  const handleLinkClick = () => {
    // Close mobile menu when a link is clicked
    if (onClose) {
      onClose();
    }
  };

  const isActive = (path: string, end?: boolean) => {
    if (end) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Define navigation items with role-based access
  const navItems: Array<
    | { to: string; label: string; icon: any; end?: boolean; allowedRoles?: string[] }
    | { header: string; allowedRoles?: string[] }
  > = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    
    // CAREGIVER: Streamlined Primary Actions (4 core items)
    { header: 'Primary Actions', allowedRoles: ['caregiver'] },
    { to: '/medications', label: 'Medication Manager', icon: Pill, allowedRoles: ['caregiver'] },
    { to: '/care-circle', label: 'Care Hub', icon: Users, allowedRoles: ['caregiver'] },
    { to: '/routine', label: 'Monitoring', icon: LineChart, allowedRoles: ['caregiver'] },
    
    // CAREGIVER: Patient Information (2 items)
    { header: 'Patient Information', allowedRoles: ['caregiver'] },
    { to: '/patient-profile', label: 'Patient Info', icon: UserCircle, allowedRoles: ['caregiver'] },
    { to: '/calendar', label: 'Calendar', icon: Calendar, allowedRoles: ['caregiver'] },
    
    // CAREGIVER: System (2 items)
    { header: 'System', allowedRoles: ['caregiver'] },
    { to: '/notifications', label: 'Notifications', icon: Bell, allowedRoles: ['caregiver'] },
    { to: '/help-center', label: 'Help & Resources', icon: BookOpen, allowedRoles: ['caregiver'] },
    
    // ADMIN: Full detailed menu structure
    { header: 'Patient & Care', allowedRoles: ['admin'] },
    { to: '/patient-profile', label: 'Patient Profile', icon: UserCircle, allowedRoles: ['admin'] },
    { to: '/care-circle', label: 'Care Circle', icon: Users, allowedRoles: ['admin'] },
    { to: '/household-vault', label: 'Household Vault', icon: FileText, allowedRoles: ['admin'] },
    { to: '/calendar', label: 'Calendar & Schedule', icon: Calendar, allowedRoles: ['admin'] },
    { to: '/care-messaging', label: 'Care Messaging', icon: MessageSquare, allowedRoles: ['admin'] },
    { to: '/video-calls', label: 'Video Calls', icon: Video, allowedRoles: ['admin'] },
    
    { header: 'Monitoring', allowedRoles: ['admin'] },
    { to: '/routine', label: 'Routine Stability', icon: LineChart, allowedRoles: ['admin'] },
    { to: '/device', label: 'Device Health', icon: Activity, allowedRoles: ['admin'] },
    { to: '/log', label: 'Escalation Log', icon: AlertTriangle, allowedRoles: ['admin'] },
    { to: '/notifications', label: 'Notification History', icon: Bell, allowedRoles: ['admin'] },
    { to: '/notification-settings', label: 'Notification Settings', icon: Settings, allowedRoles: ['caregiver', 'admin'] },

    { header: 'Medication', allowedRoles: ['admin'] },
    { to: '/medications', label: 'Medication Schedule', icon: Pill, allowedRoles: ['admin'] },
    { to: '/dose-event-verification', label: 'Dose Verification', icon: CheckSquare, allowedRoles: ['admin'] },
    { to: '/patient-device-dashboard', label: 'Device Dashboard', icon: Smartphone, allowedRoles: ['admin'] },
    
    // ADMIN ONLY: Medication Management
    { header: 'Medication Management', allowedRoles: ['admin'] },
    { to: '/medication-hub', label: 'Medication Hub', icon: Pill, allowedRoles: ['admin'] },
    { to: '/medication-maintenance', label: 'Medication Maintenance', icon: Settings, allowedRoles: ['admin'] },
    
    // ADMIN ONLY: Clinical Operations
    { header: 'Clinical Operations', allowedRoles: ['admin'] },
    { to: '/clinical-operations', label: 'Clinical Dashboard', icon: Target, allowedRoles: ['admin'] },

    // ADMIN ONLY: Systems Intel
    { header: 'Systems Intel', allowedRoles: ['admin'] },
    { to: '/analytics', label: 'Analytics', icon: BarChart3, allowedRoles: ['admin'] },
    { to: '/system-monitoring', label: 'System Monitoring', icon: Activity, allowedRoles: ['admin'] },
    { to: '/systems', label: 'Infrastructure', icon: Server, allowedRoles: ['admin'] },
    { to: '/escalation', label: 'Escalation Settings', icon: AlertTriangle, allowedRoles: ['admin'] },
    
    // ADMIN ONLY: Configuration
    { header: 'Configuration', allowedRoles: ['admin'] },
    { to: '/system-settings', label: 'System Settings', icon: Settings, allowedRoles: ['admin'] },
    { to: '/integrations', label: 'Integrations', icon: Package, allowedRoles: ['admin'] },
    { to: '/setup-wizard', label: 'Setup Wizard', icon: Target, allowedRoles: ['admin'] },
    
    // ADMIN ONLY: Security & Compliance
    { header: 'Security & Compliance', allowedRoles: ['admin'] },
    { to: '/access-and-permissions', label: 'Access & Permissions', icon: UserCog, allowedRoles: ['admin'] },
    { to: '/security-center', label: 'Security Center', icon: Shield, allowedRoles: ['admin'] },
    { to: '/two-factor-auth', label: 'Two-Factor Auth', icon: Lock, allowedRoles: ['admin'] },
    { to: '/data-governance', label: 'Data Governance', icon: Database, allowedRoles: ['admin'] },
    { to: '/regulatory-compliance', label: 'Regulatory Compliance', icon: ShieldCheck, allowedRoles: ['admin'] },
    { to: '/legal-disclaimers', label: 'Legal Disclaimers', icon: FileText, allowedRoles: ['admin'] },
    
    // ADMIN ONLY: Testing & Development
    { header: 'Testing & Development', allowedRoles: ['admin'] },
    { to: '/solis', label: 'Solis AI Assistant', icon: Brain, allowedRoles: ['admin'] },
    { to: '/simulation', label: 'Simulation', icon: Activity, allowedRoles: ['admin'] },
    { to: '/device-simulator', label: 'Device Simulator', icon: Smartphone, allowedRoles: ['admin'] },
    { to: '/testing-tools', label: 'Testing Tools', icon: Settings, allowedRoles: ['admin'] },
    { to: '/diagnostic-test', label: 'Diagnostic Test', icon: Activity, allowedRoles: ['admin'] },
    { to: '/testing-checklist', label: 'Testing Checklist', icon: CheckSquare, allowedRoles: ['admin'] },
    { to: '/data-recovery', label: 'Data Recovery', icon: Database, allowedRoles: ['admin'] },
    
    { header: 'Help & Resources', allowedRoles: ['admin'] },
    { to: '/help-center', label: 'Help Center', icon: BookOpen, allowedRoles: ['admin'] },
    { to: '/manual', label: 'Caregiver Manual', icon: BookOpen, allowedRoles: ['admin'] },
    { to: '/provider-manual', label: 'Provider Manual', icon: BookOpen, allowedRoles: ['admin'] },
    { to: '/device-setup-guide', label: 'Device Setup Guide', icon: Smartphone, allowedRoles: ['admin'] },
  ];

  // Determine visible navigation items based on role
  const visibleNavItems = navItems.filter((item) => {
    // If no role restrictions, show to everyone
    if (!item.allowedRoles) return true;
    // Otherwise, check if current role is in the allowed list
    return item.allowedRoles.includes(role);
  });

  // Log sidebar filtering for debugging
  React.useEffect(() => {
    const totalItems = navItems.filter(item => 'to' in item).length;
    const visibleItems = visibleNavItems.filter(item => 'to' in item).length;
    console.log(`📋 Sidebar filtered for ${role}:`, {
      total: totalItems,
      visible: visibleItems,
      hidden: totalItems - visibleItems
    });
  }, [role, visibleNavItems.length]); // Only depend on role and length, not the entire array

  return (
    <>
      {/* Mobile overlay - z-[82] to be above escalation panel but below sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/70 dark:bg-black/70 backdrop-blur-sm z-[82] md:hidden"
          onClick={onClose}
          style={{
            WebkitTapHighlightColor: 'transparent'
          }}
        />
      )}

      {/* Sidebar - AGGRESSIVE iOS SCROLL FIX - z-[85] to be above escalation panel */}
      <aside
        className={`
          fixed top-16 left-0 bottom-0
          w-72
          bg-white dark:bg-black
          border-r border-slate-100 dark:border-slate-900
          transition-all duration-300 ease-in-out
          z-[85]
          md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          
          /* iOS SCROLL FIX - Force scrolling */
          overflow-y-scroll
          -webkit-overflow-scrolling: touch
          overscroll-behavior-y: contain
        `}
        style={{
          /* Inline styles for iOS webkit */
          WebkitOverflowScrolling: 'touch',
          height: 'calc(100vh - 4rem)',
          maxHeight: 'calc(100vh - 4rem)'
        }}
      >
        {/* SCROLLABLE CONTAINER - Double wrapped for iOS */}
        <div 
          className="h-full overflow-y-scroll -webkit-overflow-scrolling-touch"
          style={{
            WebkitOverflowScrolling: 'touch',
            overflowY: 'scroll',
            height: '100%'
          }}
        >
          {/* Role Badge */}
          <div className="px-4 pt-4 pb-2">
            <div className={clsx(
              "px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2",
              isAdmin 
                ? "bg-blue-900 text-blue-100 border border-blue-700" 
                : "bg-emerald-900 text-emerald-100 border border-emerald-700"
            )}>
              <UserCog size={14} />
              <span>{isAdmin ? 'Administrator' : 'Caregiver'} Access</span>
            </div>
          </div>

          <nav className="py-6 px-4 space-y-1">
            {visibleNavItems.map((link, i) => {
              if ('header' in link) {
                return (
                  <div key={i} className="pt-4 pb-2 px-3">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {link.header}
                    </p>
                  </div>
                );
              }
              
              const Icon = link.icon;
              const active = isActive(link.to, link.end);

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={handleLinkClick}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                >
                  <Icon className={clsx("w-4 h-4", active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400")} />
                  {link.label}

                  {link.to === '/stability' && (
                      <div className="ml-auto flex items-center gap-2">
                          <span className={clsx(
                              "text-[10px] font-medium font-feature-settings-tnum",
                              stabilityStatus === 'stable' ? "text-emerald-500 dark:text-emerald-400" :
                              stabilityStatus === 'minor_drift' ? "text-amber-500 dark:text-amber-400" : "text-rose-500 dark:text-rose-400"
                          )}>
                              {stabilityScore}%
                          </span>
                          {stabilityStatus !== 'stable' && (
                              <span className={clsx(
                                  "w-1.5 h-1.5 rounded-full animate-pulse",
                                  stabilityStatus === 'minor_drift' ? "bg-amber-500" : "bg-rose-500"
                              )} />
                          )}
                      </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}