import React, { useState } from 'react';
import { Shield, Users, Lock } from 'lucide-react';
import { clsx } from 'clsx';
import { useUserRole } from '../context/UserRoleContext';
import { AccessDenied } from '../components/AccessDenied';
import { EmergencyAdminReset } from '../components/EmergencyAdminReset';

// Import existing page components
import UserManagement from './UserManagement';
import AccessLogs from './AccessLogs';

type TabType = 'user-management' | 'access-logs';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ElementType;
  component: React.ComponentType;
}

const TABS: Tab[] = [
  {
    id: 'user-management',
    label: 'User Management',
    icon: Users,
    component: UserManagement
  },
  {
    id: 'access-logs',
    label: 'Access Logs',
    icon: Lock,
    component: AccessLogs
  }
];

export default function AccessAndPermissions() {
  const { isAdmin, role, setRole } = useUserRole();
  const [activeTab, setActiveTab] = useState<TabType>('user-management');

  // DEBUG: Log the role status with FULL details
  console.log('🔐 AccessAndPermissions PAGE - isAdmin:', isAdmin, '| role:', role);
  console.log('🔐 Type check - role type:', typeof role, '| value:', JSON.stringify(role));
  console.log('🔐 Comparison - role === "admin":', role === 'admin');
  console.log('🔐 localStorage direct check:', localStorage.getItem('caresolisUserRole'));

  // RBAC: Only admins can manage user access and permissions
  if (!isAdmin) {
    console.error('❌ ACCESS DENIED - isAdmin is FALSE');
    console.error('   Current role:', role);
    console.error('   Expected role: admin');
    console.error('   localStorage:', localStorage.getItem('caresolisUserRole'));
    
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <AccessDenied message="Only administrators can manage user access and permissions. This protects system security and prevents unauthorized access. Contact your household admin for assistance." />
          
          {/* Emergency Admin Access Reset */}
          <EmergencyAdminReset />
        </div>
      </div>
    );
  }
  
  console.log('✅ ACCESS GRANTED - Rendering Access & Permissions page');
  
  const ActiveComponent = TABS.find(tab => tab.id === activeTab)?.component || UserManagement;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Shield className="text-blue-600" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Access & Permissions</h1>
              <p className="text-slate-600">User management and access control</p>
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