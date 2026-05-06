import React, { useState } from 'react';
import { Outlet } from 'react-router';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { DemoDataInitializer } from './components/DemoDataInitializer';
import { MultiPatientInitializer } from './components/MultiPatientInitializer';
import { ScrollToTop } from './components/ScrollToTop';

export default function Root() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuOpen = () => {
    setIsMobileMenuOpen(true);
  };

  const handleMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans selection:bg-emerald-100 dark:selection:bg-emerald-900/30 transition-colors duration-300">
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