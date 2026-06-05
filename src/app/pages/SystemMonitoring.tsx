import React, { useState } from 'react';
import { Activity, LineChart, HeartPulse, Server, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

// Import existing page components
import RoutineStability from './RoutineStability';
import DeviceHealthPage from './DeviceHealthPage';
import InfrastructureReliability from './InfrastructureReliability';
import EscalationLog from './EscalationLog';

type TabType = 'stability' | 'device-health' | 'infrastructure' | 'escalation-log';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ElementType;
  component: React.ComponentType;
}

const TABS: Tab[] = [
  {
    id: 'stability',
    label: 'Routine Stability',
    icon: LineChart,
    component: RoutineStability
  },
  {
    id: 'device-health',
    label: 'Device Health',
    icon: HeartPulse,
    component: DeviceHealthPage
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    icon: Server,
    component: InfrastructureReliability
  },
  {
    id: 'escalation-log',
    label: 'Escalation Log',
    icon: AlertTriangle,
    component: EscalationLog
  }
];

export default function SystemMonitoring() {
  const [activeTab, setActiveTab] = useState<TabType>('stability');

  const ActiveComponent = TABS.find(tab => tab.id === activeTab)?.component || RoutineStability;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Activity className="text-blue-600" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">System Monitoring</h1>
              <p className="text-slate-600">Unified observability and health tracking</p>
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
                      ? "bg-blue-600 text-white shadow-lg"
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