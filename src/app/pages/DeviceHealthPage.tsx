import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Activity, Wifi, Server, Cpu, ShieldCheck, RefreshCw, 
  CheckCircle2, AlertTriangle, Zap, Clock, Download, Database, Lock, Radio, Moon
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../components/ui/utils';
import { toast } from 'sonner';
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { useCaresolis } from '../hooks/useCaresolis';
import { HomeEnvironmentCard } from '../components/HomeEnvironmentCard';
import { SystemIntegrityPanel } from '../components/SystemIntegrityPanel';

// Mock data generator for telemetry charts
const generateTelemetry = (points: number, base: number, variance: number) => 
  Array.from({ length: points }, (_, i) => ({
    time: i,
    value: base + (Math.random() * variance * 2 - variance)
  }));

export default function DeviceHealthPage() {
  const { health } = useCaresolis();
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [lastCheck, setLastCheck] = useState(new Date());
  
  // Real-time chart data states
  const [networkData, setNetworkData] = useState(generateTelemetry(20, -62, 3));
  const [lteData, setLteData] = useState(generateTelemetry(20, 3, 0.5)); // LTE signal bars or SNR
  const [memoryData, setMemoryData] = useState(generateTelemetry(20, 42, 5));
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isCharging, setIsCharging] = useState(true);

  // Mock Service State (49 slots: 7 days x 7 slots)
  // 0=Empty, 1=Loaded, 2=Completed, 3=Next
  const [dispenserGrid] = useState(() => {
     const grid = Array(49).fill(1); // Default all loaded
     // Simulate some history
     for(let i=0; i<12; i++) grid[i] = 0; // First 12 empty (past)
     grid[12] = 2; // Just completed
     grid[13] = 3; // Next up
     return grid;
  });

  // Simulate live telemetry updates
  useEffect(() => {
    const interval = setInterval(() => {
        setNetworkData(prev => [...prev.slice(1), { time: Date.now(), value: -62 + (Math.random() * 6 - 3) }]);
        setLteData(prev => [...prev.slice(1), { time: Date.now(), value: 3 + (Math.random() * 1 - 0.5) }]);
        setMemoryData(prev => [...prev.slice(1), { time: Date.now(), value: 42 + (Math.random() * 10 - 5) }]);
        
        // Simulate minor battery fluctuation if charging
        setBatteryLevel(prev => isCharging ? Math.min(100, prev + 0.1) : Math.max(0, prev - 0.05));
    }, 2000);
    return () => clearInterval(interval);
  }, [isCharging]);

  const handleRunDiagnostics = () => {
    setIsRunningDiagnostics(true);
    toast.info("Starting system diagnostic sequence...", { duration: 2000 });
    
    // Simulate a diagnostic run
    setTimeout(() => {
      setIsRunningDiagnostics(false);
      setLastCheck(new Date());
      toast.success("Diagnostics complete. System integrity verified.");
    }, 3000);
  };

  const statusColor = health.status === 'nominal' ? 'text-emerald-500' : 'text-amber-500';
  const statusBg = health.status === 'nominal' ? 'bg-emerald-500' : 'bg-amber-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-6xl mx-auto space-y-8 pb-12"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <h1 className="text-3xl font-light text-slate-900 dark:text-slate-100 tracking-tight">Device Integrity</h1>
             <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider border", 
                health.status === 'nominal' 
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50" 
                    : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/50"
             )}>
                {health.status}
             </span>
           </div>
           <p className="text-slate-500 dark:text-slate-400 text-lg font-light">Real-time infrastructure resilience & environmental telemetry</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
                <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Last Heartbeat</div>
                <div className="text-sm text-slate-700 dark:text-slate-300 font-mono">
                    {lastCheck.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
            </div>
            <Button 
                onClick={handleRunDiagnostics} 
                disabled={isRunningDiagnostics}
                className={cn(
                    "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 shadow-sm gap-2 transition-all min-w-[160px]",
                    isRunningDiagnostics && "opacity-80"
                )}
            >
                <RefreshCw size={16} className={cn(isRunningDiagnostics && "animate-spin")} />
                {isRunningDiagnostics ? "Verifying..." : "Run Diagnostics"}
            </Button>
        </div>
      </div>

      {/* System Integrity Panel - FDA Compliant Cryptographic Verification */}
      <SystemIntegrityPanel />

      {/* Main Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* System Core Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all col-span-1 md:col-span-2">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ShieldCheck size={120} className={statusColor} />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                        <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]", statusBg)}></div>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Core System</span>
                    </div>
                    
                    <div className="flex items-baseline gap-1 mb-1">
                        <h3 className="text-4xl font-light text-slate-900 dark:text-slate-100">99.9%</h3>
                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Uptime</span>
                    </div>
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-mono mb-6">HASH: {health.integrity || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-50 dark:border-slate-800">
                      <div className="space-y-1">
                          <span className="text-xs text-slate-500 flex items-center gap-2"><Cpu size={14} /> CPU Load</span>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-slate-800 h-full rounded-full" style={{ width: '12%' }}></div>
                          </div>
                      </div>
                      <div className="space-y-1">
                          <span className="text-xs text-slate-500 flex items-center gap-2"><Database size={14} /> Storage</span>
                           <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full" style={{ width: '15%' }}></div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Power / UPS Status */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden hover:shadow-md transition-all">
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                      <Zap size={18} className={isCharging ? "text-emerald-500" : "text-amber-500"} />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Power</span>
                  </div>
                  <span className={cn("text-xs font-mono px-2 py-1 rounded-md border", isCharging ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-amber-600 bg-amber-50 border-amber-100")}>
                      {isCharging ? "AC Power" : "On Battery"}
                  </span>
               </div>
               
               <div className="flex flex-col items-center justify-center py-4">
                   <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 * (1 - batteryLevel/100)} className={batteryLevel > 20 ? "text-emerald-500" : "text-rose-500"} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-xl font-bold text-slate-900">{Math.round(batteryLevel)}%</span>
                        </div>
                   </div>
               </div>
               <div className="text-center mt-2">
                   <p className="text-xs text-slate-400">UPS Battery Backup</p>
                   <p className="text-xs font-medium text-slate-600">{isCharging ? "Fully Charged" : "4h 12m Remaining"}</p>
               </div>
          </div>

          {/* Connectivity Stack */}
          <div className="flex flex-col gap-4 h-full">
              {/* WiFi */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                          <Wifi size={16} className="text-blue-500" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase">WiFi (Primary)</span>
                      </div>
                      <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">-62 dBm</span>
                  </div>
                  <div className="h-12 w-full mt-2">
                     <ResponsiveContainer width="100%" height="100%" minHeight={48}>
                         <AreaChart data={networkData}>
                             <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#eff6ff" strokeWidth={1.5} />
                             <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                         </AreaChart>
                     </ResponsiveContainer>
                  </div>
              </div>

              {/* LTE Failover */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                          <Radio size={16} className="text-purple-500" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase">LTE (Backup)</span>
                      </div>
                      <span className="text-[10px] font-mono text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">4G Ready</span>
                  </div>
                  <div className="h-12 w-full mt-2">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={lteData}>
                            <Area type="monotone" dataKey="value" stroke="#a855f7" fill="#f3e8ff" strokeWidth={1.5} />
                            <YAxis hide domain={[0, 5]} />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
              </div>
          </div>
      </div>
      
      {/* Environmental & Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Environmental Telemetry */}
          <div className="md:col-span-1 min-h-[16rem]">
               <HomeEnvironmentCard />
          </div>

          {/* Remote Configuration */}
          <div className="md:col-span-2 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between mb-4">
                  <div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">Remote Device Configuration</h3>
                      <p className="text-xs text-slate-500">Infrastructure resilience controls</p>
                  </div>
                  <span className="text-xs text-slate-500">Last synced: Just now</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button className="p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors flex flex-col gap-2 items-start">
                      <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md"><Zap size={16} /></div>
                      <span>Restart Device</span>
                  </button>
                  <button className="p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors flex flex-col gap-2 items-start">
                      <div className="p-1.5 bg-slate-100 text-slate-600 rounded-md"><Moon size={16} /></div>
                      <span>Night Mode Settings</span>
                  </button>
                  <button className="p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors flex flex-col gap-2 items-start">
                      <div className="p-1.5 bg-slate-100 text-slate-600 rounded-md"><AlertTriangle size={16} /></div>
                      <span>Test Alarm Audio</span>
                  </button>
                  <button className="p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors flex flex-col gap-2 items-start">
                      <div className="p-1.5 bg-slate-100 text-slate-600 rounded-md"><Download size={16} /></div>
                      <span>Push OS Update</span>
                  </button>
              </div>
          </div>
      </div>

      {/* Mechanical Dispenser Status */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row">
           <div className="p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
               <div className="flex items-center gap-3 mb-4">
                   <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                       <Activity size={20} />
                   </div>
                   <div>
                       <h3 className="font-medium text-slate-900 dark:text-slate-100">Service Module</h3>
                       <p className="text-xs text-slate-500">Mechanical status & payload</p>
                   </div>
               </div>
               
               <div className="space-y-4">
                   <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-500">Capacity</span>
                       <span className="font-mono font-medium">49 Slots (7 Days)</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-500">Remaining</span>
                       <span className="font-mono font-medium text-emerald-600">36 Slots</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-500">Next Scheduled</span>
                       <span className="font-mono font-medium">12:00 PM (Slot 14)</span>
                   </div>
                   
                   <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                       <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                           <div className="w-2 h-2 rounded-full bg-slate-200"></div> Empty
                           <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Loaded
                           <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div> Active
                       </div>
                   </div>

                   <button className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors shadow-sm">
                       Unlock & Refill Module
                   </button>
               </div>
           </div>

           <div className="p-8 md:w-2/3 flex items-center justify-center bg-slate-50 dark:bg-black/20">
               <div className="grid grid-cols-7 gap-3">
                   {/* Headers */}
                   {['M','T','W','T','F','S','S'].map((d, i) => (
                       <div key={i} className="text-center text-xs font-bold text-slate-400 mb-2">{d}</div>
                   ))}
                   
                   {/* Slots */}
                   {dispenserGrid.map((status, i) => (
                       <div key={i} className="relative group">
                           <div className={cn(
                               "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-mono transition-all border",
                               status === 0 ? "bg-slate-100 border-slate-200 text-slate-300" : // Empty
                               status === 1 ? "bg-emerald-50 border-emerald-200 text-emerald-600" : // Loaded
                               status === 2 ? "bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-200" : // Completed
                               "bg-amber-100 border-amber-300 text-amber-700 animate-pulse ring-2 ring-amber-200" // Next
                           )}>
                               {status === 0 ? "" : i + 1}
                           </div>
                           
                           {/* Tooltip */}
                           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                               Slot {i+1}: {status === 0 ? "Empty" : status === 1 ? "Loaded" : status === 2 ? "Completed" : "Scheduled"}
                           </div>
                       </div>
                   ))}
               </div>
           </div>
      </div>

      {/* Component Status List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <Radio size={16} className="text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">Peripherals & Sensors</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Hardware interface status check</p>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500">v2.4.1-stable</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { name: 'Motion Sensor Array (PIR)', status: 'Optimal', detail: 'Calibrated', icon: Activity, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                { name: 'Ambient Light Sensor', status: 'Optimal', detail: '340 Lux', icon: Zap, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                { name: 'Secure Enclave', status: 'Locked', detail: 'Keys Verified', icon: Lock, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' },
                { name: 'Local Backup Storage', status: 'Healthy', detail: 'Daily Snapshot OK', icon: Database, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              ].map((item, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <div className="flex items-center gap-4">
                          <div className={cn("p-2.5 rounded-lg border border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 transition-colors", item.bg, item.color)}>
                              <item.icon size={18} />
                          </div>
                          <div>
                              <span className="text-sm font-medium text-slate-900 dark:text-slate-100 block">{item.name}</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">{item.detail}</span>
                          </div>
                      </div>
                      <div className="flex items-center gap-3">
                          <span className={cn("text-xs font-medium uppercase tracking-wide", 
                            item.status === 'Optimal' || item.status === 'Healthy' 
                                ? "text-emerald-600 dark:text-emerald-400" 
                                : "text-slate-500 dark:text-slate-400"
                          )}>{item.status}</span>
                          <div className={cn("w-2 h-2 rounded-full", 
                            item.status === 'Optimal' || item.status === 'Healthy' 
                                ? "bg-emerald-500" 
                                : "bg-slate-300 dark:bg-slate-600"
                          )}></div>
                      </div>
                  </div>
              ))}
          </div>
      </div>

    </motion.div>
  );
}