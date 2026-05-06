import React from 'react';
import { Smartphone, Wifi, WifiOff } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export function PWAStatus() {
  const { isStandalone, isOnline } = usePWA();

  // Only show when installed as PWA (for presentations/demos)
  if (!isStandalone) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg p-2 shadow-xl flex items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/20 rounded">
            <Smartphone className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="text-xs font-medium text-slate-200">PWA Installed</span>
        </div>
        
        <div className="w-px h-4 bg-slate-700" />
        
        <div className="flex items-center gap-1.5">
          {isOnline ? (
            <>
              <Wifi className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs text-slate-400">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 text-rose-400" />
              <span className="text-xs text-slate-400">Offline</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
