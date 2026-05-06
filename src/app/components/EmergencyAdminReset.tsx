import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useUserRole } from '../context/UserRoleContext';

/**
 * EMERGENCY ADMIN RESET COMPONENT
 * 
 * Demo mode failsafe for resetting to admin access.
 * Shows current role and provides one-click reset to admin.
 */

export function EmergencyAdminReset() {
  const { role, setRole } = useUserRole();

  return (
    <div className="mt-6 bg-yellow-50 border-2 border-yellow-600 rounded-xl p-6">
      <div className="flex items-start gap-3">
        <ShieldAlert className="text-yellow-600 flex-shrink-0" size={24} />
        <div>
          <h3 className="text-lg font-bold text-yellow-900 mb-2">🔧 Demo Mode: Force Admin Access</h3>
          <p className="text-sm text-yellow-800 mb-4">
            Current role: <strong className="font-mono bg-yellow-100 px-2 py-1 rounded">{role}</strong>
            <br />
            Click below to reset to admin access and reload the page.
          </p>
          <button
            onClick={() => {
              setRole('admin');
              localStorage.setItem('caresolisUserRole', 'admin');
              console.log('🔐 EMERGENCY: Force reset to admin');
              window.location.reload();
            }}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold transition-colors"
          >
            ⚡ Reset to Admin Access
          </button>
        </div>
      </div>
    </div>
  );
}
