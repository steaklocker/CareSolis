import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Heart, Sun, Moon, Calendar } from 'lucide-react';
import { CaresolisLogo } from '../components/CaresolisLogo';

/**
 * CARE RECIPIENT (PATIENT) HOME SCREEN
 * 
 * This is a simplified, accessibility-focused interface for the person being cared for.
 * Features:
 * - Large, easy-to-read text
 * - Large touch targets
 * - Simple, minimal interface
 * - Clear visual feedback
 * - High contrast colors
 * - Voice/audio feedback ready
 */

export default function RecipientHome() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastCheckIn, setLastCheckIn] = useState<Date | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = () => {
    setIsCheckingIn(true);

    // Simulate check-in
    setTimeout(() => {
      setLastCheckIn(new Date());
      setIsCheckingIn(false);
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getTimeIcon = () => {
    const hour = currentTime.getHours();
    if (hour >= 6 && hour < 18) return Sun;
    return Moon;
  };

  const TimeIcon = getTimeIcon();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 p-4 md:p-8 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <CaresolisLogo className="h-8 dark:invert opacity-60" />
        <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {formatDate(currentTime)}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full space-y-8">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50">
            <TimeIcon className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-6xl font-light text-slate-900 dark:text-slate-100 mb-2">
              {getGreeting()}
            </h1>
            <p className="text-6xl md:text-8xl font-light text-slate-900 dark:text-slate-100 tabular-nums">
              {formatTime(currentTime)}
            </p>
          </div>
        </motion.div>

        {/* Check-In Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full"
        >
          <button
            onClick={handleCheckIn}
            disabled={isCheckingIn}
            className="w-full bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-3xl p-12 shadow-2xl shadow-emerald-200 dark:shadow-emerald-900/50 border-4 border-emerald-400/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex flex-col items-center gap-6">
              {isCheckingIn ? (
                <>
                  <div className="w-20 h-20 border-8 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="text-3xl md:text-4xl font-medium">Checking In...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-20 h-20 md:w-24 md:h-24 group-hover:scale-110 transition-transform" />
                  <span className="text-3xl md:text-5xl font-medium">I'm Okay</span>
                  <span className="text-lg md:text-xl text-emerald-100">Tap to check in</span>
                </>
              )}
            </div>
          </button>
        </motion.div>

        {/* Last Check-In Status */}
        {lastCheckIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800 shadow-lg w-full"
          >
            <div className="flex items-center justify-center gap-3 text-emerald-600 dark:text-emerald-400">
              <Heart className="w-6 h-6" />
              <div className="text-center">
                <p className="text-lg font-medium">Last check-in</p>
                <p className="text-2xl tabular-nums">{formatTime(lastCheckIn)}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Next Scheduled Check-In */}
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 w-full">
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Next scheduled check-in</p>
            <p className="text-3xl font-light text-slate-900 dark:text-slate-100">12:00 PM</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8">
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Need help? Press and hold the check-in button for 3 seconds
        </p>
      </div>
    </div>
  );
}
