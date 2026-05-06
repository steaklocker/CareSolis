/**
 * ROLE BADGE & SWITCHER
 * 
 * Visual indicator of current user role with ability to switch (demo mode)
 * In production, role would be determined by authentication system
 */

import React, { useState } from 'react';
import { Shield, ShieldCheck, User, ChevronDown } from 'lucide-react';
import { useUserRole } from '../context/UserRoleContext';
import { clsx } from 'clsx';

export function RoleBadge() {
  const { currentUser, isAdmin, switchRole } = useUserRole();
  const [showSwitcher, setShowSwitcher] = useState(false);

  if (!currentUser) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowSwitcher(!showSwitcher)}
        className={clsx(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-sm transition-all border-2',
          isAdmin
            ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30'
            : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30'
        )}
      >
        {isAdmin ? (
          <ShieldCheck className="w-4 h-4" />
        ) : (
          <User className="w-4 h-4" />
        )}
        <span className="uppercase tracking-wide">
          {currentUser.role}
        </span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {/* Role Switcher Dropdown (Demo Mode) */}
      {showSwitcher && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowSwitcher(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-72 bg-slate-800 border-2 border-slate-700 rounded-lg shadow-xl z-50 p-4">
            <div className="mb-3 pb-3 border-b border-slate-700">
              <div className="text-xs text-slate-400 mb-1">Signed in as:</div>
              <div className="font-semibold text-slate-200">{currentUser.name}</div>
              <div className="text-xs text-slate-500">{currentUser.email}</div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-slate-400 mb-2">Switch Role (Demo Mode):</div>
              
              <button
                onClick={() => {
                  switchRole('admin');
                  setShowSwitcher(false);
                }}
                className={clsx(
                  'w-full px-3 py-2 rounded-lg text-left transition-all flex items-center gap-2',
                  isAdmin
                    ? 'bg-rose-500/30 border-2 border-rose-500/50 text-rose-200'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                )}
              >
                <ShieldCheck className="w-4 h-4" />
                <div className="flex-1">
                  <div className="font-semibold text-sm">ADMIN</div>
                  <div className="text-xs opacity-80">Full control - can edit all data</div>
                </div>
              </button>

              <button
                onClick={() => {
                  switchRole('caregiver');
                  setShowSwitcher(false);
                }}
                className={clsx(
                  'w-full px-3 py-2 rounded-lg text-left transition-all flex items-center gap-2',
                  !isAdmin
                    ? 'bg-emerald-500/30 border-2 border-emerald-500/50 text-emerald-200'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                )}
              >
                <User className="w-4 h-4" />
                <div className="flex-1">
                  <div className="font-semibold text-sm">CAREGIVER</div>
                  <div className="text-xs opacity-80">View + Respond only - no editing</div>
                </div>
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-500">
              💡 In production, role is determined by authentication system
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Inline role indicator (for page headers)
 */
export function InlineRoleBadge() {
  const { currentUser, isAdmin } = useUserRole();

  if (!currentUser) return null;

  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide',
      isAdmin
        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
    )}>
      {isAdmin ? (
        <ShieldCheck className="w-3 h-3" />
      ) : (
        <User className="w-3 h-3" />
      )}
      {currentUser.role}
    </span>
  );
}
