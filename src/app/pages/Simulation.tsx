import React, { useState, useEffect } from 'react';
import { useCaresolis } from '../hooks/useCaresolis';
import { usePatient } from '../context/PatientContext';
import { motion } from 'motion/react';
import { Clock, Play, RotateCcw, FastForward, SkipForward, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../components/ui/utils';

/**
 * SIMULATION / TIME TRAVEL UTILITY
 * 
 * ⚠️ DEV/TESTING TOOL ONLY
 * Allows jumping forward in time to test escalation protocols without waiting.
 * Should be protected/hidden in production environments.
 */

export default function Simulation() {
  const { getNow, simulateTime, timeOffset, statusData, refresh } = useCaresolis();
  const { currentPatient } = usePatient();
  const [now, setNow] = useState(getNow());

  useEffect(() => {
    const timer = setInterval(() => setNow(getNow()), 1000);
    return () => clearInterval(timer);
  }, [getNow]);

  const handleJump = (minutes: number) => {
    simulateTime(timeOffset + minutes * 60000);
    setTimeout(refresh, 500); // Trigger a refresh after time jump
  };

  const handleReset = () => {
    simulateTime(0);
    setTimeout(refresh, 500);
  };
  
  const handleUndoVerification = async () => {
      const now = getNow();
      const localDate = now.toLocaleDateString('en-CA');
      const localTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
      
      try {
          // Import from info
          const { projectId, publicAnonKey } = await import('/utils/supabase/info');
          const patientId = currentPatient?.id || '1';
          
          await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9aeac050/reset-slot`, {
              method: 'POST',
              headers: { 
                  'Authorization': `Bearer ${publicAnonKey}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ patientId, localDate, localTime })
          });
          refresh();
      } catch (e) {
          console.error("Undo failed", e);
      }
  };

  const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-light text-slate-900 dark:text-slate-100 tracking-tight">System Simulation</h1>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded border border-indigo-100">
                Developer Mode
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-light">
            Verify escalation logic by simulating future states.
          </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 flex flex-col items-center justify-center text-center">
          <div className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">Current System Time</div>
          <div className="text-6xl font-mono font-light text-slate-900 dark:text-slate-100 mb-6 tabular-nums">
              {formatTime(now)}
          </div>
          
          {timeOffset !== 0 && (
              <div className="mb-6 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-100 flex items-center gap-2">
                  <AlertTriangle size={12} />
                  Simulated Offset: +{Math.round(timeOffset / 60000)} mins
              </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-lg">
              <Button onClick={() => handleJump(1)} variant="outline" className="flex flex-col h-20 gap-2 hover:border-indigo-200 hover:bg-indigo-50">
                  <Play size={20} className="text-indigo-500" />
                  <span>+1 Min</span>
              </Button>
              <Button onClick={() => handleJump(15)} variant="outline" className="flex flex-col h-20 gap-2 hover:border-amber-200 hover:bg-amber-50">
                  <FastForward size={20} className="text-amber-500" />
                  <span>+15 Mins</span>
              </Button>
              <Button onClick={() => handleJump(60)} variant="outline" className="flex flex-col h-20 gap-2 hover:border-rose-200 hover:bg-rose-50">
                  <SkipForward size={20} className="text-rose-500" />
                  <span>+1 Hour</span>
              </Button>
              <Button onClick={handleReset} variant="outline" className="flex flex-col h-20 gap-2 hover:border-slate-300 hover:bg-slate-50">
                  <RotateCcw size={20} className="text-slate-500" />
                  <span>Reset Time</span>
              </Button>
          </div>
          
          <div className="w-full max-w-lg mt-4 flex items-center justify-center">
              <Button 
                onClick={handleUndoVerification} 
                variant="outline" 
                className="w-full h-12 flex items-center justify-center gap-2 hover:border-red-200 hover:bg-red-50 text-red-600 border-red-100"
              >
                  <RotateCcw size={16} />
                  Undo Last Verification
              </Button>
          </div>
      </div>

      {/* Live Status Inspector */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <ActivityIndicator />
              Live Status Inspector
          </h3>
          <div className="space-y-3">
              <div className="flex justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                  <span className="text-sm text-slate-500">Current Phase</span>
                  <span className={cn("text-sm font-mono font-medium", 
                      statusData?.status === 'nominal' ? "text-emerald-600" :
                      statusData?.status === 'pending' || statusData?.status === 'ReminderActive' ? "text-amber-600" :
                      "text-rose-600"
                  )}>
                      {statusData?.status || 'Unknown'}
                  </span>
              </div>
              <div className="flex justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                  <span className="text-sm text-slate-500">Next Scheduled</span>
                  <span className="text-sm font-mono text-slate-900 dark:text-slate-100">
                      {statusData?.nextScheduled || '--:--'}
                  </span>
              </div>
              <div className="flex justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                  <span className="text-sm text-slate-500">Escalation Level</span>
                  <span className="text-sm font-mono text-slate-900 dark:text-slate-100">
                       Level {statusData?.slots?.find((s:any) => s.status.startsWith('Escalation'))?.escalationLevel || 0}
                  </span>
              </div>
          </div>
      </div>
    </motion.div>
  );
}

const ActivityIndicator = () => (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
    </span>
);