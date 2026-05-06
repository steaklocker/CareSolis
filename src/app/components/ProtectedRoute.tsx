import React from 'react';
import { Navigate } from 'react-router';
import { useUserRole } from '../context/UserRoleContext';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export function ProtectedRoute({ children, allowedRoles, redirectTo = '/' }: ProtectedRouteProps) {
  const { role } = useUserRole();

  // Defensive check for undefined role
  if (!role) {
    console.error('🔒 ProtectedRoute: role is undefined!');
    // Return a loading state instead of null to avoid suspension issues
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading permissions...</p>
        </div>
      </div>
    );
  }

  // Check if current role is allowed
  const isAllowed = allowedRoles.includes(role);

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-rose-600 dark:text-rose-400" />
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Access Denied
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                This page requires <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {allowedRoles.join(' or ')}
                </span> permissions.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                Your current role: <span className="font-semibold">{role}</span>
              </p>
            </div>

            <button
              onClick={() => window.history.back()}
              className="mt-4 px-6 py-2.5 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Return children directly - Suspense is handled by LazyWrapper in routes
  return <>{children}</>;
}