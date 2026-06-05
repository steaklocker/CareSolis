import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { DemoDataInitializer } from './components/DemoDataInitializer';
import { MultiPatientInitializer } from './components/MultiPatientInitializer';
import { ScrollToTop } from './components/ScrollToTop';
import { CopyPasteProtection } from './components/CopyPasteProtection';
import { useAuth } from './context/AuthContext';

export default function Root() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  const handleMenuOpen = () => {
    setIsMobileMenuOpen(true);
  };

  const handleMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  // DEV MODE: Skip loading state and auth checks
  // Authentication is disabled in dev mode

  // Show loading state while checking auth (disabled in dev mode)
  if (false && isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // DEV MODE: Disable auth redirects
  // Public pages that don't require authentication
  const publicPages = ['/login', '/signup', '/initial-setup'];
  const isPublicPage = publicPages.includes(location.pathname);

  // DEV MODE: Don't redirect to login
  // Redirect to login if not authenticated (except for public pages)
  // if (!isAuthenticated && !isPublicPage) {
  //   return <Navigate to="/login" replace />;
  // }

  // DEV MODE: Allow access to public pages even when "authenticated"
  // If authenticated and on a public page, redirect to dashboard
  // if (isAuthenticated && isPublicPage) {
  //   return <Navigate to="/" replace />;
  // }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans selection:bg-emerald-100 dark:selection:bg-emerald-900/30 transition-colors duration-300">
      <CopyPasteProtection />
      <ScrollToTop />
      <Header onMenuClick={handleMenuOpen} />

      <div className="flex relative">
        <Sidebar
          isOpen={isMobileMenuOpen}
          onClose={handleMenuClose}
        />

        {/* OPTIMIZED FOR iPHONE 16 PRO MAX - 430px viewport */}
        <main className="flex-1 md:ml-64 px-3 py-4 md:p-4 overflow-y-auto h-[calc(100vh-4.5rem)] pb-safe scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {/* Mobile: full width with minimal padding. Desktop: max-width container */}
          <div className="w-full md:max-w-5xl md:mx-auto pb-24 md:pb-12">
            <MultiPatientInitializer />
            <DemoDataInitializer />
            <Outlet />
          </div>
        </main>

        {/* iOS-style bottom navigation for mobile */}
        <BottomNav />
      </div>
    </div>
  );
}