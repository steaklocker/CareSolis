import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ChevronLeft, Home } from 'lucide-react';
import { clsx } from 'clsx';

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showHome?: boolean;
  customBackPath?: string;
  rightAction?: React.ReactNode;
  className?: string;
}

/**
 * PageHeader - Consistent navigation header for all pages
 * Provides back button and optional home button
 * Follows iOS/mobile app conventions
 */
export function PageHeader({
  title,
  subtitle,
  showBack = true,
  showHome = false,
  customBackPath,
  rightAction,
  className
}: PageHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (customBackPath) {
      navigate(customBackPath);
    } else {
      // Use browser back if available, otherwise go to dashboard
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  // Don't show header on dashboard (home page)
  if (location.pathname === '/') {
    return null;
  }

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50',
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        {/* Left: Back Button */}
        <div className="flex items-center gap-2 min-w-[80px]">
          {showBack && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
              aria-label="Go back"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}
        </div>

        {/* Center: Title */}
        <div className="flex-1 text-center px-4">
          {title && (
            <h1 className="text-base font-semibold text-slate-800 dark:text-slate-200 truncate">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right: Home Button or Custom Action */}
        <div className="flex items-center gap-2 min-w-[80px] justify-end">
          {rightAction ? (
            rightAction
          ) : showHome ? (
            <button
              onClick={handleHome}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 active:scale-95 transition-all"
              aria-label="Go to dashboard"
            >
              <Home className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-[80px]" /> // Spacer for alignment
          )}
        </div>
      </div>
    </header>
  );
}
