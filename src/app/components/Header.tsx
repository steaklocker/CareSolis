import React, { useState, useRef, startTransition } from 'react';
import { UserCircle, Menu, LogOut, ShieldCheck, ChevronDown, Users2, Smartphone, Info, X } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router';
// ThemeToggle removed - CareSolis uses dark mode only (medical monitoring best practice)
import { TimeSyncIndicator } from './TimeSyncIndicator';
import { CaresolisLogo } from './CaresolisLogo';
import { useAuth } from '../context/AuthContext';
import { useUserRole } from '../context/UserRoleContext';
import { usePatient } from '../context/PatientContext';
import NotificationCenter from './NotificationCenter';
import { usePWA } from '../hooks/usePWA';
import { clsx } from 'clsx';
import { VERSION } from '../../version';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, setRole, isBaseAdmin } = useUserRole();
  const { logout } = useAuth();
  const { currentPatient, allPatients, switchPatient } = usePatient();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showPatientMenu, setShowPatientMenu] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const roleButtonRef = useRef<HTMLButtonElement>(null);
  const patientButtonRef = useRef<HTMLButtonElement>(null);
  const [roleMenuPosition, setRoleMenuPosition] = useState({ top: 0, right: 0 });
  const [patientMenuPosition, setPatientMenuPosition] = useState({ top: 0, right: 0 });

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowRoleMenu(false);
      setShowPatientMenu(false);
    };

    if (showRoleMenu || showPatientMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showRoleMenu, showPatientMenu]);

  // Calculate position when showing role menu
  React.useEffect(() => {
    if (showRoleMenu && roleButtonRef.current) {
      const rect = roleButtonRef.current.getBoundingClientRect();
      setRoleMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
  }, [showRoleMenu]);

  // Calculate position when showing patient menu
  React.useEffect(() => {
    if (showPatientMenu && patientButtonRef.current) {
      const rect = patientButtonRef.current.getBoundingClientRect();
      setPatientMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
  }, [showPatientMenu]);

  const handleHamburgerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onMenuClick) {
      onMenuClick();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleRole = () => {
    // Only allow role switching if user is a base admin
    if (!isBaseAdmin) return;
    
    const newRole = role === 'admin' ? 'caregiver' : 'admin';
    setRole(newRole);
    setShowRoleMenu(false);
    console.log('🔐 Role switched to:', newRole);
  };

  return (
    <>
      <header className="bg-white dark:bg-black border-b border-slate-100 dark:border-slate-900 sticky top-0 z-[90] transition-colors duration-300">
        {/* FDA Badge - Top row centered with version */}
        {/* COMMENTED OUT: Awaiting FDA approval before displaying Class II designation */}
        {/* <div className="w-full bg-emerald-600 py-0.5 flex items-center justify-center">
          <div className="inline-flex items-center gap-1.5 px-2 text-white text-[9px] font-bold">
            <ShieldCheck className="w-3 h-3" />
            <span>FDA CLASS II MEDICAL DEVICE</span>
            <span className="opacity-70">•</span>
            <span className="opacity-90">{VERSION.compact}</span>
          </div>
        </div> */}

        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Mobile menu button - iOS OPTIMIZED */}
            <button
              onClick={handleHamburgerClick}
              className="md:hidden p-2 -ml-1 text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600 rounded-lg transition-colors touch-manipulation relative z-50"
              aria-label="Open menu"
              type="button"
              style={{
                WebkitTapHighlightColor: 'transparent',
                userSelect: 'none',
                WebkitUserSelect: 'none'
              }}
            >
              <Menu className="w-6 h-6 stroke-[2.5] pointer-events-none" />
            </button>

            <Link to="/" className="flex items-center gap-1.5 sm:gap-3 hover:opacity-80 transition-opacity group h-full py-3">
              <CaresolisLogo className="h-full w-auto max-w-[100px] sm:max-w-none" />
            </Link>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-2 flex-shrink-0">
            {/* Role Switcher (Demo Only - ADMIN ACCESS ONLY) - MOBILE OPTIMIZED */}
            {isBaseAdmin && (
              <div className="relative flex-shrink-0">
                <button
                  ref={roleButtonRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRoleMenu(!showRoleMenu);
                  }}
                  className={`px-1.5 sm:px-3 py-1 sm:py-2 text-[10px] sm:text-sm font-bold rounded-md sm:rounded-lg transition-colors flex items-center gap-0.5 sm:gap-2 shadow-md ${
                    role === 'admin'
                      ? 'bg-blue-600 text-white hover:bg-blue-700 ring-1 sm:ring-2 ring-blue-400'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 ring-1 sm:ring-2 ring-emerald-400'
                  }`}
                  title="Switch role (demo mode - admin only)"
                >
                  <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">
                    {role === 'admin' ? 'ADMIN' : 'CAREGIVER'}
                  </span>
                  <span className="sm:hidden text-[10px]">
                    {role === 'admin' ? 'A' : 'C'}
                  </span>
                  <ChevronDown className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                </button>
                
                {showRoleMenu && (
                  <div 
                    className="fixed bg-slate-800 text-slate-100 rounded-lg shadow-xl border border-slate-700 overflow-hidden z-[100] min-w-[200px]"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      top: `${roleMenuPosition.top}px`,
                      right: `${roleMenuPosition.right}px`
                    }}
                  >
                    <div className="p-2 bg-slate-700 border-b border-slate-600">
                      <p className="text-xs text-slate-300 font-semibold">Switch Role (Demo)</p>
                    </div>
                    
                    {role === 'admin' ? (
                      <button
                        className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors flex items-center gap-3"
                        onClick={toggleRole}
                      >
                        <ShieldCheck size={16} className="text-emerald-400" />
                        <div>
                          <div className="text-sm font-medium">Caregiver View</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            View-only access (Level 1 & 2)
                          </div>
                        </div>
                      </button>
                    ) : (
                      <button
                        className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors flex items-center gap-3"
                        onClick={toggleRole}
                      >
                        <ShieldCheck size={16} className="text-blue-400" />
                        <div>
                          <div className="text-sm font-medium">Admin View</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Full configuration access
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
            
            {/* Patient Switcher (Demo Only - ADMIN ACCESS ONLY) - MOBILE OPTIMIZED */}
            {isBaseAdmin && (
              <>
                <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
                <div className="relative">
                  <button
                    ref={patientButtonRef}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPatientMenu(!showPatientMenu);
                    }}
                    className={`px-1.5 sm:px-3 py-1 sm:py-2 text-[10px] sm:text-sm font-bold rounded-md sm:rounded-lg transition-colors flex items-center gap-0.5 sm:gap-2 shadow-md ${
                      currentPatient ? 'bg-blue-900 text-blue-100 hover:bg-blue-800 ring-1 sm:ring-2 ring-blue-700' : 'bg-gray-900 text-gray-100 hover:bg-gray-800 ring-1 sm:ring-2 ring-gray-700'
                    }`}
                    title="Switch patient (demo mode - admin only)"
                  >
                    <Users2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden md:inline text-xs sm:text-sm">
                      {currentPatient ? currentPatient.name : 'No Patient'}
                    </span>
                    <span className="md:hidden text-[10px]">
                      {currentPatient ? currentPatient.name.split(' ')[0].substring(0, 3) : 'Pt'}
                    </span>
                  </button>
                  
                  {showPatientMenu && (
                    <div 
                      className="fixed bg-slate-800 text-slate-100 rounded-lg shadow-xl border border-slate-700 overflow-hidden z-[100] min-w-[200px]"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        top: `${patientMenuPosition.top}px`,
                        right: `${patientMenuPosition.right}px`
                      }}
                    >
                      <div className="p-2 bg-slate-700 border-b border-slate-600">
                        <p className="text-xs text-slate-300 font-semibold">Switch Patient (Demo)</p>
                      </div>
                      
                      {allPatients.map(patient => (
                        <button
                          key={patient.id}
                          className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors flex items-center gap-3"
                          onClick={() => {
                            switchPatient(patient.id);
                            setShowPatientMenu(false); // Close menu after selection
                          }}
                        >
                          <Users2 size={16} className="text-blue-400" />
                          <div>
                            <div className="text-sm font-medium">{patient.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {patient.id}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            
            {/* Hide less critical elements on mobile */}
            <div className="hidden lg:block w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
            
            {/* Notification Center - Desktop only */}
            <div className="hidden sm:block">
              <NotificationCenter />
            </div>
            
            {/* Divider - Desktop only */}
            <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
            
            {/* Time Sync - Mobile: icon only, Desktop: full */}
            <div className="block">
              <TimeSyncIndicator />
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-0.5 sm:mx-1" />

            {/* Account Icon - COMPACT to match nav elements */}
            <button className="flex-shrink-0 px-1.5 sm:px-3 py-1 sm:py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-md sm:rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors shadow-md" title="Account">
              <UserCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>

            {/* Logout - COMPACT to match nav elements */}
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-0.5 sm:mx-1" />
            <button
              className="flex-shrink-0 px-1.5 sm:px-3 py-1 sm:py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-md sm:rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors shadow-md"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </header>
      
      {/* About CareSolis Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={() => setShowInfoModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 rounded-t-2xl border-b border-emerald-500">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                    <Info className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">What is CareSolis?</h2>
                    <p className="text-emerald-100 text-sm mt-1">Connected Medication Adherence Platform</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Main Description */}
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong className="text-emerald-600 dark:text-emerald-400">CareSolis is a connected medication adherence platform designed to reduce medication-related harm in home healthcare.</strong>
                </p>
                
                <p className="text-slate-600 dark:text-slate-400 mt-4">
                  Unlike traditional pill boxes or reminder apps, CareSolis verifies medication interaction, supervises adherence behavior, and escalates alerts to caregivers when dosing risks appear.
                </p>
              </div>

              {/* How It Works */}
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-5 border border-emerald-200 dark:border-emerald-800">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">How CareSolis Works</h3>
                <p className="text-slate-700 dark:text-slate-300">
                  By combining controlled dispensing, sensor-verified interaction, and a connected monitoring platform, CareSolis helps ensure patients take the right medication at the right time while enabling caregivers and healthcare providers to intervene early.
                </p>
              </div>

              {/* Key Differentiators */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Key Differentiators</h3>
                <div className="grid gap-3">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="text-emerald-600 dark:text-emerald-400 mt-0.5">✅</div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Verified Medication Interaction</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Not just reminders, but confirmed adherence</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="text-emerald-600 dark:text-emerald-400 mt-0.5">✅</div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Supervised Adherence Behavior</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Real-time monitoring with intelligent escalation</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="text-emerald-600 dark:text-emerald-400 mt-0.5">✅</div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Connected Monitoring Platform</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Full visibility for caregivers and providers</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="text-emerald-600 dark:text-emerald-400 mt-0.5">✅</div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Early Intervention System</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Detect and address issues before they escalate</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Model */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Business Model</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-600 dark:text-blue-400">🔹</div>
                    <div className="text-slate-700 dark:text-slate-300">
                      <strong>Device Leasing</strong> — Hardware provided on subscription basis
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="text-blue-600 dark:text-blue-400">🔹</div>
                    <div className="text-slate-700 dark:text-slate-300">
                      <strong>Subscription Monitoring</strong> — Ongoing service and support
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="text-blue-600 dark:text-blue-400">🔹</div>
                    <div className="text-slate-700 dark:text-slate-300">
                      <strong>Remote Patient Monitoring (RPM) Integration</strong> — Enables Medicare reimbursement of $100-200/patient/month
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Value */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <span className="text-2xl">💊</span>
                  Clinical Value
                </h3>
                <p className="text-slate-700 dark:text-slate-300">
                  CareSolis reduces medication-related harm by ensuring the right medication is taken at the right time, with full documentation and caregiver oversight.
                </p>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <Link 
                  to="/help-center"
                  onClick={() => setShowInfoModal(false)}
                  className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium flex items-center gap-2 justify-center"
                >
                  Read Full Documentation →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}