import React, { useEffect } from 'react';
import '../styles/index.css';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from 'sonner';
import './utils/cache-bust';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { CaresolisProvider } from './context/CaresolisContext';
import { UserRoleProvider } from './context/UserRoleContext';
import { AuthProvider } from './context/AuthContext';
import { PatientProvider } from './context/PatientContext';
import { usePWA } from './hooks/usePWA';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { PWAUpdatePrompt } from './components/PWAUpdatePrompt';
import { OfflineIndicator } from './components/OfflineIndicator';
import { BackendStatusIndicator } from './components/BackendStatusIndicator';
import { ErrorBoundary } from './components/ErrorBoundary';

// v6.46.9 - Removed console suppression to allow React error recovery
export default function App() {

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="caresolis-ui-theme">
        <AuthProvider>
          <PatientProvider>
            <CaresolisProvider>
              <UserRoleProvider>
                <DndProvider backend={HTML5Backend}>
                  <PWAWrapper>
                    <Toaster position="top-right" richColors theme="dark" />
                    <RouterProvider router={router} />
                  </PWAWrapper>
                </DndProvider>
              </UserRoleProvider>
            </CaresolisProvider>
          </PatientProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function PWAWrapper({ children }: { children: React.ReactNode }) {
  const pwa = usePWA();

  console.log('📱 PWA Status:', {
    isInstalled: pwa.isInstalled,
    isInstallable: pwa.isInstallable,
    isUpdateAvailable: pwa.isUpdateAvailable,
    isOnline: pwa.isOnline
  });

  return (
    <>
      {/* PWA Install Prompt - Shows when app can be installed */}
      {pwa.isInstallable && !pwa.isInstalled && <PWAInstallPrompt />}
      
      {/* PWA Update Prompt - Shows when new version available */}
      {pwa.isUpdateAvailable && <PWAUpdatePrompt onUpdate={pwa.updateApp} />}
      
      {/* Offline Indicator - Shows when network is unavailable */}
      {!pwa.isOnline && <OfflineIndicator />}
      
      {/* Backend Status Indicator - Disabled for cleaner UI */}
      {/* <BackendStatusIndicator /> */}
      
      {children}
    </>
  );
}