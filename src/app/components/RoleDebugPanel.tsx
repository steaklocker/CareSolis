import React from 'react';
import { useUserRole } from '../context/UserRoleContext';
import { ShieldAlert } from 'lucide-react';

/**
 * ROLE DEBUG PANEL
 * Shows exactly what role the user is in and all related state
 */

export function RoleDebugPanel() {
  const { role, isAdmin, isCaregiver, isRecipient, isBaseAdmin } = useUserRole();
  const localStorageRole = localStorage.getItem('caresolisUserRole');

  return (
    <div className="fixed bottom-4 left-4 bg-yellow-900 text-yellow-50 p-4 rounded-lg shadow-2xl border-2 border-yellow-400 z-[9999] max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert size={24} className="text-yellow-300" />
        <h3 className="font-bold text-lg">🔐 Role Debug Panel</h3>
      </div>
      
      <div className="space-y-2 text-sm font-mono">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-yellow-300">Current Role:</div>
          <div className="font-bold text-white bg-yellow-800 px-2 py-1 rounded">{role}</div>
          
          <div className="text-yellow-300">isAdmin:</div>
          <div className={`font-bold px-2 py-1 rounded ${isAdmin ? 'bg-green-600' : 'bg-red-600'}`}>
            {isAdmin ? '✅ TRUE' : '❌ FALSE'}
          </div>
          
          <div className="text-yellow-300">isCaregiver:</div>
          <div className={`font-bold px-2 py-1 rounded ${isCaregiver ? 'bg-green-600' : 'bg-red-600'}`}>
            {isCaregiver ? '✅ TRUE' : '❌ FALSE'}
          </div>
          
          <div className="text-yellow-300">isBaseAdmin:</div>
          <div className={`font-bold px-2 py-1 rounded ${isBaseAdmin ? 'bg-green-600' : 'bg-red-600'}`}>
            {isBaseAdmin ? '✅ TRUE' : '❌ FALSE'}
          </div>
          
          <div className="text-yellow-300">localStorage:</div>
          <div className="font-bold text-white bg-yellow-800 px-2 py-1 rounded">
            {localStorageRole || 'NULL'}
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-yellow-600">
          <div className="text-yellow-300 mb-1">Expected for Access & Permissions:</div>
          <div className="text-xs text-yellow-100">
            ✅ role = "admin"<br/>
            ✅ isAdmin = true
          </div>
        </div>
        
        {!isAdmin && (
          <div className="mt-3 pt-3 border-t border-yellow-600">
            <div className="text-red-300 mb-2 font-bold">⚠️ ACCESS BLOCKED</div>
            <button
              onClick={() => {
                localStorage.setItem('caresolisUserRole', 'admin');
                window.location.reload();
              }}
              className="w-full px-3 py-2 bg-yellow-500 text-yellow-900 rounded font-bold hover:bg-yellow-400"
            >
              🔧 Force Admin & Reload
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
