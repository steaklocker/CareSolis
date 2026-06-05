import React from 'react';
import { clsx } from 'clsx';
import { CheckCircle2, AlertTriangle, MessageSquare, Clock } from 'lucide-react';

export interface LogEntry {
  id: string;
  type: 'success' | 'alert' | 'info' | 'message';
  timestamp: string;
  message: string;
}

interface ActivityLogProps {
  logs?: LogEntry[];
}

export function ActivityLog({ logs = [] }: ActivityLogProps) {
  const variants = {
    success: { 
        icon: CheckCircle2, 
        color: 'text-emerald-600 dark:text-emerald-400', 
        bg: 'bg-emerald-50 dark:bg-emerald-900/20' 
    },
    alert: { 
        icon: AlertTriangle, 
        color: 'text-amber-600 dark:text-amber-400', 
        bg: 'bg-amber-50 dark:bg-amber-900/20' 
    }, 
    error: { 
        icon: AlertTriangle, 
        color: 'text-rose-600 dark:text-rose-400', 
        bg: 'bg-rose-50 dark:bg-rose-900/20' 
    },
    info: { 
        icon: Clock, 
        color: 'text-slate-600 dark:text-slate-300', 
        bg: 'bg-slate-50 dark:bg-slate-800' 
    },
    message: { 
        icon: MessageSquare, 
        color: 'text-blue-600 dark:text-blue-400', 
        bg: 'bg-blue-50 dark:bg-blue-900/20' 
    },
  };

  const formatTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString(undefined, {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6 transition-colors">
      <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-4 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 tracking-tight text-sm uppercase">Audit Log</h3>
        <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">Download CSV</button>
      </div>
      <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        {logs.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No activity recorded yet.</p>
        ) : (
          logs.map((log, index) => {
            let variantKey = log.type;
            
            // UI Logic: Distinguish between "Escalation" (Amber) and "Not Logged" (Rose)
            // even if backend sends 'alert' for both.
            if (log.type === 'alert') {
                if (log.message.includes('Not Logged') || log.message.includes('Missed')) {
                    variantKey = 'error';
                } else {
                    variantKey = 'alert';
                }
            }

            const variant = variants[variantKey as keyof typeof variants] || variants.info;
            // Prefer isoTimestamp for accurate local formatting, fallback to timestamp string
            const displayTime = (log as any).isoTimestamp ? formatTime((log as any).isoTimestamp) : log.timestamp;
            
            return (
              <div key={log.id} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 transition-colors", variant.bg)}>
                    <variant.icon className={clsx("w-4 h-4", variant.color)} />
                  </div>
                  {index !== logs.length - 1 && (
                    <div className="w-px h-full bg-slate-100 dark:bg-slate-800 my-1 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors"></div>
                  )}
                </div>
                <div className="pb-4 pt-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{log.message}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-mono">{displayTime}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}