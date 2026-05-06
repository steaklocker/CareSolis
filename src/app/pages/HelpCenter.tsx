import React, { Suspense, useState, startTransition } from 'react';
import { HelpCircle, BookOpen, Cog, Tablet, Wand2, Zap, ShieldAlert } from 'lucide-react';
import { clsx } from 'clsx';
import { useUserRole } from '../context/UserRoleContext';
import { ErrorBoundary } from '../components/ErrorBoundary';

// Lazy load page components to avoid import conflicts
const CareGiverManual = React.lazy(() => import('./CareGiverManual'));
const SystemsInfrastructure = React.lazy(() => import('./SystemsInfrastructure'));
const DeviceSetupGuideWithDownload = React.lazy(() => import('./DeviceSetupGuideWithDownload'));
const SetupWizard = React.lazy(() => import('./SetupWizard'));
const TestingTools = React.lazy(() => import('./TestingTools'));
const AdminTools = React.lazy(() => import('./AdminTools'));

type TabType = 'user-manual' | 'systems-infrastructure' | 'device-setup' | 'setup-wizard' | 'testing-tools' | 'admin-tools';

export default function HelpCenter() {
  const { isAdmin } = useUserRole();
  const [activeTab, setActiveTab] = useState<TabType>('user-manual');

  const tabs = [
    {
      id: 'user-manual' as TabType,
      label: 'User Manual',
      icon: BookOpen,
      component: CareGiverManual
    },
    {
      id: 'systems-infrastructure' as TabType,
      label: 'Systems Infrastructure',
      icon: Cog,
      component: SystemsInfrastructure
    },
    // Only show Setup Wizard tab for admins
    ...(isAdmin ? [{
      id: 'setup-wizard' as TabType,
      label: 'Setup Wizard',
      icon: Wand2,
      component: SetupWizard
    }] : []),
    {
      id: 'device-setup' as TabType,
      label: 'Miscellaneous Reports',
      icon: Tablet,
      component: DeviceSetupGuideWithDownload
    },
    {
      id: 'testing-tools' as TabType,
      label: 'Testing Tools',
      icon: Zap,
      component: TestingTools
    },
    // Only show Admin Tools tab for admins
    ...(isAdmin ? [{
      id: 'admin-tools' as TabType,
      label: 'Admin Tools',
      icon: ShieldAlert,
      component: AdminTools
    }] : [])
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || CareGiverManual;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-indigo-500/10 rounded-xl">
              <HelpCircle className="text-indigo-400" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-100">Help Center</h1>
              <p className="text-slate-400">Documentation, guides, and system information</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => startTransition(() => setActiveTab(tab.id))}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all whitespace-nowrap",
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  )}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content with Suspense and ErrorBoundary */}
      <ErrorBoundary>
        <Suspense 
          key={activeTab}
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p className="text-slate-400">Loading...</p>
              </div>
            </div>
          }
        >
          <ActiveComponent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}