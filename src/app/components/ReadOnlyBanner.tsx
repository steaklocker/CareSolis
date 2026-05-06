/**
 * READ-ONLY BANNER
 * 
 * Displays a prominent banner when caregivers view pages in read-only mode
 * Shows on pages that admins can edit but caregivers can only view
 */

import React from 'react';
import { Eye, ShieldAlert, Info } from 'lucide-react';
import { useUserRole } from '../context/UserRoleContext';

interface ReadOnlyBannerProps {
  message?: string;
  showOnlyForCaregiver?: boolean;
}

export function ReadOnlyBanner({ 
  message = "You are viewing this page in read-only mode. Contact an administrator to make changes.",
  showOnlyForCaregiver = true
}: ReadOnlyBannerProps) {
  const { isCaregiver, isAdmin } = useUserRole();

  // Only show for caregivers if specified
  if (showOnlyForCaregiver && !isCaregiver) {
    return null;
  }

  return (
    <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Eye className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              Read-Only Access
            </h3>
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * INLINE READ-ONLY BADGE
 * 
 * Small badge to show next to page titles
 */
export function ReadOnlyBadge() {
  const { isCaregiver } = useUserRole();

  if (!isCaregiver) return null;

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
      <Eye className="w-3 h-3" />
      View Only
    </span>
  );
}

/**
 * EDIT DISABLED WRAPPER
 * 
 * Wraps form inputs/buttons to disable them for caregivers
 */
interface EditProtectedProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function EditProtected({ children, fallback }: EditProtectedProps) {
  const { isAdmin } = useUserRole();

  if (!isAdmin && fallback) {
    return <>{fallback}</>;
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
