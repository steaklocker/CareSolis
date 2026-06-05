import React, { useState } from 'react';
import { Briefcase, DollarSign, Brain, Server } from 'lucide-react';
import { clsx } from 'clsx';
import { useUserRole } from '../context/UserRoleContext';
import { AccessDenied } from '../components/AccessDenied';

// Import existing page components
import RTMBilling from './RTMBilling';
import AIAdherenceScoring from './AIAdherenceScoring';
import SystemIntegrationOverview from './SystemIntegrationOverview';

type TabType = 'rtm-billing' | 'ai-scoring' | 'integrations';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ElementType;
  component: React.ComponentType;
}

const TABS: Tab[] = [
  {
    id: 'rtm-billing',
    label: 'RTM Billing',
    icon: DollarSign,
    component: RTMBilling
  },
  {
    id: 'ai-scoring',
    label: 'AI Adherence Scoring',
    icon: Brain,
    component: AIAdherenceScoring
  },
  {
    id: 'integrations',
    label: 'System Integration',
    icon: Server,
    component: SystemIntegrationOverview
  }
];

export default function ClinicalOperations() {
  const { isAdmin } = useUserRole();
  const [activeTab, setActiveTab] = useState<TabType>('rtm-billing');

  // RBAC: Only admins can access Clinical Operations (billing data)
  if (!isAdmin) {
    return <AccessDenied message="Only administrators can access billing and clinical operations data. Contact your household admin if you need this information." />;
  }

  const ActiveComponent = TABS.find(tab => tab.id === activeTab)?.component || RTMBilling;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Briefcase className="text-purple-600" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Clinical Operations</h1>
              <p className="text-slate-600">Revenue, analytics, and integration management</p>
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
                      ? "bg-purple-600 text-white shadow-lg"
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