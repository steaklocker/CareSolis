import React, { useState } from 'react';
import { Shield, Settings, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

// Import existing page components
import SecuritySettings from './SecuritySettings';
import AnomalyAlerts from './AnomalyAlerts';

type TabType = 'security-settings' | 'anomaly-alerts';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ElementType;
  component: React.ComponentType;
}

const TABS: Tab[] = [
  {
    id: 'security-settings',
    label: 'Security Settings',
    icon: Settings,
    component: SecuritySettings
  },
  {
    id: 'anomaly-alerts',
    label: 'Anomaly Alerts',
    icon: AlertTriangle,
    component: AnomalyAlerts
  }
];

export default function SecurityCenter() {
  const [activeTab, setActiveTab] = useState<TabType>('security-settings');

  const ActiveComponent = TABS.find(tab => tab.id === activeTab)?.component || SecuritySettings;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-rose-100 rounded-xl">
              <Shield className="text-rose-600" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Security Center</h1>
              <p className="text-slate-600">Security configuration and threat monitoring</p>
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
                      ? "bg-rose-600 text-white shadow-lg"
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