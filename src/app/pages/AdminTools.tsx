import React, { useState } from 'react';
import { useCaresolis } from '../context/CaresolisContext';
import { RefreshCw, Database, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { clsx } from 'clsx';

export default function AdminTools() {
  const { forceClearCache } = useCaresolis();
  const [isClearing, setIsClearing] = useState(false);
  const [lastClearedAt, setLastClearedAt] = useState<Date | null>(null);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await forceClearCache();
      setLastClearedAt(new Date());
    } catch (error) {
      console.error('Error clearing cache:', error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-900/20 to-orange-900/20 border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Admin Tools</h2>
              <p className="text-sm text-slate-400">Development and debugging utilities</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Info Banner */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-200">
                <p className="font-semibold mb-1">Admin-Only Access</p>
                <p className="text-blue-300/80">
                  These tools are designed for system administrators and developers. Use with caution in production environments.
                </p>
              </div>
            </div>
          </div>

          {/* Force Clear Cache Tool */}
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-500/10 rounded-lg flex-shrink-0">
                <Database className="w-6 h-6 text-rose-400" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-100 mb-2">Force Clear Server Cache</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Clears the server-side cache and forces recalculation of all status data, including next check-in times and slot statuses. 
                  Use this if you notice stale data being displayed on the dashboard.
                </p>

                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-4">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">When to Use:</h4>
                  <ul className="space-y-1 text-sm text-slate-400">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">•</span>
                      <span>Dashboard shows incorrect next check-in times</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">•</span>
                      <span>Schedule changes aren't reflected immediately</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">•</span>
                      <span>Server deployment completed but changes aren't visible</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">•</span>
                      <span>Debugging cache-related issues</span>
                    </li>
                  </ul>
                </div>

                {lastClearedAt && (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-emerald-300">
                        Last cleared: {lastClearedAt.toLocaleTimeString()} on {lastClearedAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleClearCache}
                  disabled={isClearing}
                  className={clsx(
                    "flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all",
                    isClearing
                      ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                      : "bg-rose-500 hover:bg-rose-600 text-white shadow-lg hover:shadow-xl"
                  )}
                >
                  <RefreshCw className={clsx("w-4 h-4", isClearing && "animate-spin")} />
                  {isClearing ? "Clearing Cache..." : "Clear Server Cache"}
                </button>
              </div>
            </div>
          </div>

          {/* Future Tools Placeholder */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6 border-dashed">
            <p className="text-sm text-slate-500 text-center">
              Additional admin tools will be added here as needed
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
