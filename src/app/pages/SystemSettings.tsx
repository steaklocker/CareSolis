import React from 'react';
import { Settings, ShieldCheck, Wand2 } from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from 'react-router';
import { useUserRole } from '../context/UserRoleContext';
import { AccessDenied } from '../components/AccessDenied';

// Import existing page components
import EscalationSettings from './EscalationSettings';
import { LocationSettings } from '../components/LocationSettings';

export default function SystemSettings() {
  const { isAdmin } = useUserRole();

  // RBAC: Only admins can access System Settings
  if (!isAdmin) {
    return <AccessDenied message="Only administrators can modify system settings. Contact your household admin to request configuration changes." />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-slate-100 rounded-xl">
              <Settings className="text-slate-600" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
              <p className="text-slate-600">Care delivery and escalation configuration</p>
            </div>
          </div>
          
          {/* Setup Wizard Link - FDA Compliance Reconfiguration */}
          <div className="mt-6 p-4 bg-emerald-50 border-2 border-emerald-600 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wand2 size={24} className="text-emerald-600" />
                <div>
                  <h3 className="font-bold text-slate-900">Setup Wizard</h3>
                  <p className="text-sm text-slate-600">
                    Reconfigure household settings with FDA-compliant legal acknowledgments
                  </p>
                </div>
              </div>
              <Link
                to="/setup-wizard"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all"
              >
                Run Wizard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Location & Environmental Settings */}
      <LocationSettings />
      
      {/* Escalation Settings Content */}
      <EscalationSettings />
    </div>
  );
}