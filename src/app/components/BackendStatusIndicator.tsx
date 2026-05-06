import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, XCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface BackendStatus {
  healthy: boolean;
  message: string;
  details?: string;
  endpoint?: string;
}

export function BackendStatusIndicator() {
  const [status, setStatus] = useState<BackendStatus>({ 
    healthy: false, 
    message: 'Checking backend...' 
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkBackendHealth = async () => {
    setIsChecking(true);
    const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${SERVER_URL}/health`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setStatus({
          healthy: true,
          message: `Backend online (${data.status})`,
          endpoint: SERVER_URL
        });
        // Hide indicator after 3 seconds if healthy
        setTimeout(() => setIsVisible(false), 3000);
      } else {
        setStatus({
          healthy: false,
          message: `Backend returned error (${response.status})`,
          details: 'Edge function may need redeployment',
          endpoint: SERVER_URL
        });
        setIsVisible(true);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('aborted')) {
        setStatus({
          healthy: false,
          message: 'Backend timeout (not responding)',
          details: 'Supabase edge functions may not be running. Start with: supabase start',
          endpoint: SERVER_URL
        });
      } else {
        setStatus({
          healthy: false,
          message: 'Backend unavailable',
          details: errorMessage,
          endpoint: SERVER_URL
        });
      }
      setIsVisible(true);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
    // Recheck every 30 seconds
    const interval = setInterval(checkBackendHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Don't show if healthy and hidden
  if (!isVisible && status.healthy) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-20 left-4 z-[90] max-w-md rounded-lg shadow-2xl border-2 transition-all duration-300 ${
        status.healthy 
          ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-600' 
          : 'bg-rose-50 dark:bg-rose-950 border-rose-600'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {status.healthy ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            ) : isChecking ? (
              <RefreshCw className="w-6 h-6 text-amber-600 dark:text-amber-400 animate-spin" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-bold mb-1 ${
              status.healthy 
                ? 'text-emerald-900 dark:text-emerald-100' 
                : 'text-rose-900 dark:text-rose-100'
            }`}>
              Backend Status
            </h3>
            
            <p className={`text-xs font-medium mb-1 ${
              status.healthy 
                ? 'text-emerald-800 dark:text-emerald-200' 
                : 'text-rose-800 dark:text-rose-200'
            }`}>
              {status.message}
            </p>
            
            {status.details && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                {status.details}
              </p>
            )}
            
            {status.endpoint && (
              <code className="block text-[10px] font-mono bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 mb-2 break-all">
                {status.endpoint}
              </code>
            )}
            
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={checkBackendHealth}
                disabled={isChecking}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                Recheck
              </button>
              
              {!status.healthy && (
                <a
                  href="https://supabase.com/docs/guides/functions/quickstart"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  Setup Guide
                </a>
              )}
              
              <button
                onClick={() => setIsVisible(false)}
                className="ml-auto text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
