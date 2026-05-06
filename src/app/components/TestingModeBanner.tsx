import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, CheckCircle2, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from './ui/button';

/**
 * TESTING MODE BANNER
 * 
 * Displays at top of Dashboard to guide users to testing tools
 * Can be dismissed (stored in localStorage)
 */

export function TestingModeBanner() {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('testing-banner-dismissed') === 'true';
  });

  const handleDismiss = () => {
    localStorage.setItem('testing-banner-dismissed', 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative bg-gradient-to-r from-sky-100 via-blue-50 to-cyan-100 dark:from-sky-900/20 dark:via-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-400 dark:border-blue-500/40 rounded-2xl p-6 mb-6 overflow-hidden shadow-lg"
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-200/30 via-cyan-200/30 to-blue-200/30 dark:from-blue-500/5 dark:via-cyan-500/5 dark:to-blue-500/5 animate-pulse" />
        
        <div className="relative flex items-start gap-4">
          <div className="p-3 bg-blue-500 dark:bg-blue-600 rounded-xl shadow-md">
            <Zap className="text-white" size={28} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                🧪 Testing Mode Active
              </h3>
              <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold uppercase tracking-wider rounded shadow-sm">
                Pre-Hardware Integration
              </span>
            </div>
            
            <p className="text-slate-800 dark:text-slate-200 mb-4 max-w-3xl leading-relaxed">
              Test all CG app features with the <strong className="text-slate-900 dark:text-slate-100">Device Simulator</strong> before connecting to physical hardware. 
              Follow the <strong className="text-slate-900 dark:text-slate-100">Testing Checklist</strong> to ensure comprehensive validation of medication management, 
              escalation flows, security, and FDA compliance.
            </p>
            
            <div className="flex items-center gap-3 flex-wrap">
              <Link to="/device-simulator">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-md">
                  <Zap size={16} className="mr-2" />
                  Open Device Simulator
                  <ExternalLink size={14} className="ml-2" />
                </Button>
              </Link>
              
              <Link to="/testing-checklist">
                <Button variant="outline" className="border-2 border-blue-600 text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/40 font-semibold">
                  <CheckCircle2 size={16} className="mr-2" />
                  View Testing Checklist
                  <ExternalLink size={14} className="ml-2" />
                </Button>
              </Link>
              
              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm" />
                  <span>Triple-redundant logging active</span>
                </div>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-sm" />
                  <span>FDA compliance verified</span>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
            title="Dismiss (can be re-enabled in settings)"
          >
            <X className="text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200" size={20} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}