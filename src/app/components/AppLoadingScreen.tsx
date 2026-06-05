import React from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { CaresolisLogo } from './CaresolisLogo';
import { useAppLoading } from '../context/AppLoadingContext';

/**
 * APP LOADING SCREEN
 * 
 * Displays during app initialization to provide visual feedback
 * and prevent "Load failed" confusion.
 */

export function AppLoadingScreen() {
  const { stage, progress, errors, retry } = useAppLoading();

  const stageMessages: Record<string, string> = {
    'starting': 'Initializing Caresolis...',
    'auth': 'Verifying credentials...',
    'contexts': 'Loading contexts...',
    'data': 'Fetching data...',
    'ready': 'Ready!',
    'error': 'Initialization failed'
  };

  const hasErrors = errors.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8 animate-pulse">
          <CaresolisLogo className="h-16 dark:invert" />
        </div>

        {/* Loading Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-8">
            {/* Status Icon */}
            <div className="flex justify-center mb-6">
              {hasErrors ? (
                <div className="p-4 bg-rose-100 dark:bg-rose-900/30 rounded-full">
                  <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
                </div>
              ) : (
                <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                  <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
                </div>
              )}
            </div>

            {/* Status Message */}
            <h2 className="text-xl font-semibold text-center text-slate-900 dark:text-slate-100 mb-2">
              {hasErrors ? 'Startup Issue Detected' : stageMessages[stage] || 'Loading...'}
            </h2>
            
            <p className="text-sm text-center text-slate-600 dark:text-slate-400 mb-6">
              {hasErrors 
                ? 'Don\'t worry - we can retry or continue anyway'
                : 'Please wait while we prepare everything'}
            </p>

            {/* Progress Bar */}
            {!hasErrors && (
              <div className="mb-6">
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">
                  {progress}% complete
                </p>
              </div>
            )}

            {/* Errors */}
            {hasErrors && (
              <div className="mb-6 space-y-2">
                {errors.map((error, index) => (
                  <div 
                    key={index}
                    className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-3"
                  >
                    <p className="text-sm text-rose-700 dark:text-rose-300 font-mono">
                      {error}
                    </p>
                  </div>
                ))}
                
                {/* Retry Button */}
                <Button
                  onClick={retry}
                  className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Initialization
                </Button>
                
                {/* Continue Anyway */}
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="w-full mt-2"
                >
                  Continue Anyway
                </Button>
              </div>
            )}

            {/* Loading Stage Indicator */}
            {!hasErrors && (
              <div className="grid grid-cols-5 gap-2">
                {['starting', 'auth', 'contexts', 'data', 'ready'].map((stageName, index) => (
                  <div 
                    key={stageName}
                    className={`h-1 rounded-full transition-colors duration-300 ${
                      ['starting', 'auth', 'contexts', 'data', 'ready'].indexOf(stage) >= index
                        ? 'bg-emerald-500'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Build Info */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-400 dark:text-slate-600">
            Caresolis v6.45.3 • Infrastructure-Grade Monitoring
          </p>
        </div>
      </div>
    </div>
  );
}