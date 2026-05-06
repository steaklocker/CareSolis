import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi, CloudOff } from 'lucide-react';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnecting, setShowReconnecting] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Network: ONLINE');
      setShowReconnecting(true);
      setTimeout(() => {
        setIsOffline(false);
        setShowReconnecting(false);
      }, 1000);
    };

    const handleOffline = () => {
      console.log('📴 Network: OFFLINE - Using cached data');
      setIsOffline(true);
      setShowReconnecting(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline && !showReconnecting) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isOffline
          ? 'bg-rose-600 text-white'
          : 'bg-emerald-600 text-white'
      }`}
    >
      <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2">
        {isOffline ? (
          <>
            <WifiOff className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">
              You're offline - Some features may be unavailable
            </span>
            <CloudOff className="h-4 w-4 ml-2" />
          </>
        ) : (
          <>
            <Wifi className="h-4 w-4" />
            <span className="text-sm font-medium">Back online - Syncing data...</span>
          </>
        )}
      </div>
    </div>
  );
}
