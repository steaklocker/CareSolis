import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Key, ShieldCheck, FileText, Phone, Wrench, 
  Wifi, Zap, Droplets, AlertTriangle, Eye, EyeOff, Copy
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../components/ui/utils';
import { toast } from 'sonner';

// Secure Input Component
const SecureField = ({ label, value, icon: Icon }: { label: string, value: string, icon: any }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl group hover:border-slate-300 transition-all">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <div className="font-mono text-sm text-slate-900 dark:text-slate-100 mt-0.5">
            {isVisible ? value : '••••••••••••'}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setIsVisible(!isVisible)}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
        <button 
          onClick={handleCopy}
          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
        >
          <Copy size={16} />
        </button>
      </div>
    </div>
  );
};

export default function HouseholdVault() {
  const [activeTab, setActiveTab] = useState<'access' | 'utility' | 'docs'>('access');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-4xl mx-auto space-y-8 pb-12"
    >
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">Household Infrastructure & Access</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-2xl text-sm leading-relaxed">
              Secure repository for critical non-clinical logistics. Use this vault to store access codes, utility shut-off locations, and administrative documents for trusted responders.
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg w-fit border border-amber-100">
              <AlertTriangle size={12} />
              <span>Administrative Use Only. Do not store sensitive medical records here.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-200 dark:border-slate-800 gap-6">
        <button 
          onClick={() => setActiveTab('access')}
          className={cn(
            "pb-3 text-sm font-medium transition-all relative",
            activeTab === 'access' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Access & Security
        </button>
        <button 
          onClick={() => setActiveTab('utility')}
          className={cn(
            "pb-3 text-sm font-medium transition-all relative",
            activeTab === 'utility' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Utilities & Infrastructure
        </button>
        <button 
          onClick={() => setActiveTab('docs')}
          className={cn(
            "pb-3 text-sm font-medium transition-all relative",
            activeTab === 'docs' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Admin Documents
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="wait">
          {activeTab === 'access' && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <SecureField label="Front Door Code" value="4821" icon={Lock} />
              <SecureField label="Garage Keypad" value="9090" icon={Key} />
              <SecureField label="Gate Access" value="#1234" icon={Lock} />
              <SecureField label="Alarm Disarm" value="2580" icon={ShieldCheck} />
              <SecureField label="WiFi Password" value="SunsetValid99!" icon={Wifi} />
              <SecureField label="Spare Key Location" value="Under the terracotta planter (back porch)" icon={Key} />
            </motion.div>
          )}

          {activeTab === 'utility' && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
               <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Droplets size={18} /></div>
                    <h3 className="font-medium text-slate-900">Main Water Shut-off</h3>
                  </div>
                  <p className="text-sm text-slate-500">Located in the garage, front left corner near the water heater. Turn clockwise (red valve).</p>
               </div>
               
               <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Zap size={18} /></div>
                    <h3 className="font-medium text-slate-900">Circuit Breaker</h3>
                  </div>
                  <p className="text-sm text-slate-500">Hallway closet panel. Main breaker is at the top. Labeled "Whole House".</p>
               </div>

               <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><Wrench size={18} /></div>
                    <h3 className="font-medium text-slate-900">Preferred Plumber</h3>
                  </div>
                  <p className="text-sm font-medium text-slate-900">Mike's Plumbing: (555) 012-3456</p>
                  <p className="text-xs text-slate-500 mt-1">Account #8821. Knows the house layout.</p>
               </div>

               <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><Phone size={18} /></div>
                    <h3 className="font-medium text-slate-900">HVAC Service</h3>
                  </div>
                  <p className="text-sm font-medium text-slate-900">CoolAir Pros: (555) 019-2834</p>
                  <p className="text-xs text-slate-500 mt-1">Maintenance contract active until Dec 2026.</p>
               </div>
            </motion.div>
          )}

          {activeTab === 'docs' && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
               {[
                 { name: 'Insurance Card (Front/Back)', date: 'Updated Jan 2026', type: 'Image' },
                 { name: 'Advance Directive', date: 'Signed 2024', type: 'PDF' },
                 { name: 'Power of Attorney', date: 'Signed 2024', type: 'PDF' },
                 { name: 'Hospital Preference', date: 'St. Mary\'s Medical', type: 'Note' },
               ].map((doc, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                          <FileText size={18} />
                       </div>
                       <div>
                          <h4 className="text-sm font-medium text-slate-900">{doc.name}</h4>
                          <p className="text-xs text-slate-500">{doc.date}</p>
                       </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-slate-400 hover:text-indigo-600">View</Button>
                 </div>
               ))}
               
               <div className="col-span-2 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center py-8 hover:bg-slate-100 transition-colors cursor-pointer">
                  <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                    <FileText size={20} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">Upload Document</p>
                  <p className="text-xs text-slate-500 mt-1">PDF, JPG, or PNG (Max 5MB)</p>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
