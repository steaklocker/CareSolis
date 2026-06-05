import React, { useState } from 'react';
import { Pill, Package, Target, Database, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { useUserRole } from '../context/UserRoleContext';
import { AccessDenied } from '../components/AccessDenied';

// Import existing page components
import MedicationManager from './MedicationManager';
import MedicationMaintenance from './MedicationMaintenance';
import ScheduleSettings from './ScheduleSettings';
import MedicationEscalationConfig from './MedicationEscalationConfig';
import DataRecovery from './DataRecovery';

type TabType = 'medications' | 'scheduling' | 'grid-maintenance' | 'escalation-config' | 'data-recovery';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ElementType;
  component: React.ComponentType;
}

const TABS: Tab[] = [
  {
    id: 'medications',
    label: 'Medications',
    icon: Pill,
    component: MedicationManager
  },
  {
    id: 'scheduling',
    label: 'Scheduling & Times',
    icon: Clock,
    component: ScheduleSettings
  },
  {
    id: 'grid-maintenance',
    label: 'Grid Maintenance',
    icon: Package,
    component: MedicationMaintenance
  },
  {
    id: 'escalation-config',
    label: 'Escalation Config',
    icon: Target,
    component: MedicationEscalationConfig
  },
  {
    id: 'data-recovery',
    label: 'Data Recovery',
    icon: Database,
    component: DataRecovery
  }
];

export default function MedicationHub() {
  const { isAdmin } = useUserRole();
  const [activeTab, setActiveTab] = useState<TabType>('scheduling');

  // RBAC: Only admins can configure medications
  if (!isAdmin) {
    return <AccessDenied message="Only administrators can configure medications. This prevents accidental changes to time-critical medication schedules. Contact your household admin if medication updates are needed." />;
  }

  const ActiveComponent = TABS.find(tab => tab.id === activeTab)?.component || MedicationManager;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Pill className="text-emerald-600" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Medication Hub</h1>
              <p className="text-slate-600">Comprehensive medication management and maintenance</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all whitespace-nowrap",
                    isActive
                      ? "bg-emerald-600 text-white shadow-lg"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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

      {/* Tab Content - Remove wrapper to let child component control layout */}
      <ActiveComponent />
    </div>
  );
}