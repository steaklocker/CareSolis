import React, { useState } from 'react';
import { X, HelpCircle, Shield, Key, ShieldCheck, FileCheck2, Lock, HardDrive, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Help modal that explains System Integrity Panel metrics
 * in caregiver-friendly language (non-technical)
 */
export function SystemIntegrityHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        title="What do these metrics mean?"
      >
        <HelpCircle size={14} />
        <span>What does this mean?</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                    <Shield size={20} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Understanding System Integrity
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      What these security checks mean for you
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Introduction */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    The System Integrity Panel continuously monitors critical security systems to ensure your loved one's 
                    health data is protected and the device is operating safely. Here's what each check means in simple terms:
                  </p>
                </div>

                {/* Metrics Explained */}
                <div className="space-y-4">
                  <MetricExplanation
                    icon={Key}
                    title="Device Authentication"
                    subtitle="Is this device legitimate?"
                    explanation="Like a secure lock on your front door, this verifies the device is genuine and hasn't been tampered with. 
                    The device uses a unique cryptographic 'fingerprint' that can't be copied."
                    whenGreen="Device identity verified - it's safe to use"
                    whenYellow="Verification in progress"
                    whenRed="Device authentication failed - contact support immediately"
                  />

                  <MetricExplanation
                    icon={ShieldCheck}
                    title="Secure Boot Chain"
                    subtitle="Did the device start up safely?"
                    explanation="When the device turns on, it checks that all software loaded correctly and hasn't been modified. 
                    This is like checking all locks when you enter your home."
                    whenGreen="Device started safely with verified software"
                    whenYellow="Boot verification in progress"
                    whenRed="Unsafe software detected - device may be compromised"
                  />

                  <MetricExplanation
                    icon={FileCheck2}
                    title="Firmware Integrity"
                    subtitle="Is the device software up-to-date and safe?"
                    explanation="Firmware is the core software running the device. We verify it's the official version, 
                    hasn't been tampered with, and is properly signed by the manufacturer."
                    whenGreen="Software is authentic and up-to-date"
                    whenYellow="Update available or verification pending"
                    whenRed="Software signature invalid - potential security risk"
                  />

                  <MetricExplanation
                    icon={Shield}
                    title="Security Audit"
                    subtitle="When was the last security checkup?"
                    explanation="Regular security audits ensure the system remains secure over time. Think of it like a 
                    routine medical checkup, but for the device's security systems."
                    whenGreen="Recent audit passed - system secure"
                    whenYellow="Audit overdue or scheduled soon"
                    whenRed="Audit failed or severely overdue"
                  />

                  <MetricExplanation
                    icon={HardDrive}
                    title="Data at Rest Encryption"
                    subtitle="Is stored health data protected?"
                    explanation="All health information stored on the device is encrypted using military-grade security. 
                    Even if someone physically accessed the device, they couldn't read the data."
                    whenGreen="Data is encrypted and secure"
                    whenYellow="Key rotation needed or pending"
                    whenRed="Encryption disabled or compromised"
                  />

                  <MetricExplanation
                    icon={Lock}
                    title="Data in Transit Encryption"
                    subtitle="Is data secure when transmitted?"
                    explanation="When the device sends information to our servers, it's encrypted during transmission. 
                    Like a sealed envelope, nobody can read it in transit."
                    whenGreen="Secure connection active (TLS 1.3)"
                    whenYellow="Certificate expiring soon"
                    whenRed="Insecure connection or expired certificate"
                  />

                  <MetricExplanation
                    icon={Radio}
                    title="LTE Failover Readiness"
                    subtitle="Is backup internet connection working?"
                    explanation="If WiFi fails, the device automatically switches to cellular (LTE) backup. This ensures 
                    uninterrupted monitoring even during internet outages."
                    whenGreen="Backup connection ready and tested"
                    whenYellow="Weak signal or test overdue"
                    whenRed="Backup connection unavailable"
                  />
                </div>

                {/* What to do */}
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                  <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
                    What should I do?
                  </h3>
                  <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-200">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">✓</span>
                      <span><strong>All Green:</strong> Everything is working perfectly. No action needed.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 mt-0.5">⚠</span>
                      <span><strong>Any Yellow:</strong> Minor issue detected. Monitor it, but not urgent.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 dark:text-rose-400 mt-0.5">✕</span>
                      <span><strong>Any Red:</strong> Security issue detected. Contact support immediately.</span>
                    </li>
                  </ul>
                </div>

                {/* Footer */}
                <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    The system automatically checks these every 30 seconds. You don't need to do anything manually.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

interface MetricExplanationProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  explanation: string;
  whenGreen: string;
  whenYellow: string;
  whenRed: string;
}

function MetricExplanation({ 
  icon: Icon, 
  title, 
  subtitle, 
  explanation, 
  whenGreen, 
  whenYellow, 
  whenRed 
}: MetricExplanationProps) {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <Icon size={18} className="text-slate-600 dark:text-slate-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-0.5">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            {subtitle}
          </p>
        </div>
      </div>
      
      <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">
        {explanation}
      </p>
      
      <div className="space-y-1.5 text-xs">
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1"></div>
          <span className="text-slate-600 dark:text-slate-400">{whenGreen}</span>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 mt-1"></div>
          <span className="text-slate-600 dark:text-slate-400">{whenYellow}</span>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 mt-1"></div>
          <span className="text-slate-600 dark:text-slate-400">{whenRed}</span>
        </div>
      </div>
    </div>
  );
}
