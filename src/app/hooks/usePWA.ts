import { useEffect, useState } from 'react';

interface PWAState {
  isInstalled: boolean;
  isStandalone: boolean;
  canInstall: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
}

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstalled: false,
    isStandalone: false,
    canInstall: false,
    isOnline: navigator.onLine,
    isUpdateAvailable: false,
  });

  useEffect(() => {
    // Check if running as installed PWA
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    setState(prev => ({
      ...prev,
      isStandalone,
      isInstalled: isStandalone,
    }));

    // Register service worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Monitor online/offline status
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const registerServiceWorker = async () => {
    // Check if Service Worker is supported
    if (!('serviceWorker' in navigator)) {
      return;
    }

    // Check if we're in a compatible environment
    const isFigmaPreview = window.location.hostname.includes('figma');
    const isLocalhost = window.location.hostname === 'localhost';
    const isHTTPS = window.location.protocol === 'https:';

    // Only register SW in production HTTPS environments
    if (!isHTTPS && !isLocalhost) {
      return;
    }

    // Skip SW registration in Figma preview (expected limitation)
    if (isFigmaPreview) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setState(prev => ({ ...prev, isUpdateAvailable: true }));
          }
        });
      });

      // Check for updates periodically (every hour)
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);

    } catch (error) {
      // Silent fail - expected in some environments
    }
  };

  const updateApp = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        reg?.waiting?.postMessage({ action: 'skipWaiting' });
      });
      window.location.reload();
    }
  };

  const clearCache = async () => {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      reg?.active?.postMessage({ action: 'clearCache' });
      
      // Also clear caches manually
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
      
      console.log('🗑️ Cache cleared');
      window.location.reload();
    }
  };

  return {
    ...state,
    updateApp,
    clearCache,
  };
}