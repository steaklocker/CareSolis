import React from 'react';
import { RefreshCw } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export function PWAUpdatePrompt() {
  const { isUpdateAvailable, updateApp } = usePWA();

  if (!isUpdateAvailable) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 rounded-xl shadow-2xl border border-blue-400/20">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <RefreshCw className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Update Available</h3>
            <p className="text-sm text-blue-50 mb-3">
              A new version of Caresolis is ready. Update now for the latest features and fixes.
            </p>
            <button
              onClick={updateApp}
              className="w-full bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Update Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
