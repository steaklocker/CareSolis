import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from './ui/button';

/**
 * DEV ONLY: Test controls to simulate different system integrity states
 * This component allows testing of the System Integrity Panel UI states
 * Remove in production or hide behind feature flag
 */
export function SystemIntegrityTestControls() {
  const [isVisible, setIsVisible] = React.useState(false);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg hover:bg-slate-700 transition-colors z-50"
      >
        🧪 Dev: Test Integrity States
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-4 z-50 min-w-[300px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          🧪 Integrity State Tester
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-slate-400 hover:text-slate-600 text-xs"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <p className="text-slate-500 dark:text-slate-400 mb-3">
          Simulate different system states for testing UI
        </p>
        
        <div className="space-y-2">
          <button className="w-full px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors flex items-center gap-2 text-left">
            <CheckCircle2 size={14} />
            <span>All Systems Verified</span>
          </button>
          
          <button className="w-full px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors flex items-center gap-2 text-left">
            <AlertTriangle size={14} />
            <span>Certificate Expiring Soon</span>
          </button>
          
          <button className="w-full px-3 py-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors flex items-center gap-2 text-left">
            <XCircle size={14} />
            <span>Firmware Signature Invalid</span>
          </button>
          
          <button className="w-full px-3 py-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors flex items-center gap-2 text-left">
            <XCircle size={14} />
            <span>LTE Failover Down</span>
          </button>
          
          <button className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex items-center gap-2 text-left">
            <CheckCircle2 size={14} />
            <span>Reset to Default</span>
          </button>
        </div>
        
        <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            This panel is for development testing only.
            Remove before production deployment.
          </p>
        </div>
      </div>
    </div>
  );
}
