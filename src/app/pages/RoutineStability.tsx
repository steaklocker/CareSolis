import React, { useEffect, useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ScatterChart, Scatter, ZAxis } from 'recharts';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { useCaresolis } from '../context/CaresolisContext';
import { usePatient } from '../context/PatientContext';
import { motion } from 'motion/react';
import { 
  Activity, Clock, TrendingUp, AlertTriangle, Calendar, Download, Share2, Info, Grid, List, Sparkles 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../components/ui/utils';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;

const SmartScheduleSuggestion = ({ logs, settings, onUpdate }: { logs: any[], settings: any, onUpdate: (s: any) => void }) => {
    const suggestion = useMemo(() => {
        if (!logs || !settings?.schedule) return null;
        
        // Find consistent late patterns
        const verifiedLogs = logs.filter(l => l.type === 'success' && l.message.includes('Verified'));
        const schedule = Array.isArray(settings.schedule) ? settings.schedule : settings.schedule.slots?.map((s: any) => s.time) || [];
        
        for (const slot of schedule) {
            const slotLogs = verifiedLogs.filter(l => l.message.includes(`at ${slot}`));
            if (slotLogs.length < 3) continue; // Need data
            
            let totalDrift = 0;
            slotLogs.forEach(l => {
                const logDate = new Date(l.timestamp);
                const [h, m] = slot.split(':').map(Number);
                const scheduledDate = new Date(logDate);
                scheduledDate.setHours(h, m, 0, 0);
                const drift = (logDate.getTime() - scheduledDate.getTime()) / 60000;
                totalDrift += drift;
            });
            
            const avgDrift = totalDrift / slotLogs.length;
            
            // If consistently late by > 15 mins (but less than 60)
            if (avgDrift > 15 && avgDrift < 60) {
                const newMinutes = Math.round(avgDrift / 15) * 15; // Round to nearest 15
                const [h, m] = slot.split(':').map(Number);
                const date = new Date();
                date.setHours(h, m + newMinutes);
                const newTime = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                
                return {
                    original: slot,
                    suggested: newTime,
                    drift: Math.round(avgDrift)
                };
            }
        }
        return null;
    }, [logs, settings]);

    if (!suggestion) return null;

    const applySuggestion = () => {
        const newSchedule = Array.isArray(settings.schedule) 
            ? settings.schedule.map((s: string) => s === suggestion.original ? suggestion.suggested : s)
            : { ...settings.schedule, slots: settings.schedule.slots.map((s: any) => s.time === suggestion.original ? { ...s, time: suggestion.suggested } : s) };
            
        onUpdate({ ...settings, schedule: newSchedule });
        toast.success(`Schedule optimized: ${suggestion.original} -> ${suggestion.suggested}`);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4 flex items-center justify-between gap-4 mb-6"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <Sparkles size={18} />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">Smart Schedule Optimization</h4>
                    <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-0.5">
                        The <strong>{suggestion.original}</strong> check-in is consistently completed <strong>{suggestion.drift} mins late</strong>.
                    </p>
                </div>
            </div>
            <Button size="sm" onClick={applySuggestion} className="bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-sm whitespace-nowrap">
                Shift to {suggestion.suggested}
            </Button>
        </motion.div>
    );
};

export default function RoutineStability() {
  const { logs, settings, updateSettings, getNow } = useCaresolis();
  const { currentPatient } = usePatient();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [viewMode, setViewMode] = useState<'trend' | 'heatmap'>('trend');
  
  // Use static ID for SVG gradient (component is only rendered once)
  const gradientId = 'routine-stability-gradient';

  // Parse logs into heatmap data points
  // X: Date, Y: Time of Day (0-24)
  const heatmapData = useMemo(() => {
    if (!logs) return [];
    
    // Filter for verify events
    const verifyEvents = logs.filter(l => 
        l.type === 'success' || 
        (l.message && l.message.toLowerCase().includes('verified'))
    );

    return verifyEvents.map((event, index) => {
        try {
            const dateObj = new Date(event.isoTimestamp || event.timestamp);
            const hours = dateObj.getHours() + (dateObj.getMinutes() / 60);
            return {
                id: `event-${index}-${dateObj.getTime()}`, // Unique key
                date: dateObj.toLocaleDateString(),
                time: hours,
                timestamp: dateObj.getTime(),
                status: event.message.includes('Late') ? 'late' : 'ontime',
                details: event.message
            };
        } catch { return null; }
    }).filter(Boolean);
  }, [logs]);

  // Calculate Last Alert
  const daysSinceLastAlert = useMemo(() => {
    if (!logs || logs.length === 0) return 42; // Default
    const lastAlert = logs.find(l => l.type === 'alert' || l.type === 'escalated');
    if (!lastAlert) return 'None';
    
    const diff = new Date().getTime() - new Date(lastAlert.timestamp).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days === 0 ? 'Today' : `${days} days ago`;
  }, [logs]);

  // Dynamic Statistics Calculation
  const stats = useMemo(() => {
    if (!logs || logs.length === 0) return {
        avgTimeStr: "--:--",
        deviationStr: "No data",
        escalationDisplay: "0.0",
        shiftDisplay: "None",
        shiftSubtext: "Insufficient data",
        analysisText: "Insufficient data to perform system analysis."
    };

    const rangeDays = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 30;
    const now = new Date();
    const cutoff = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);

    const relevantLogs = logs.filter(l => {
        const d = new Date(l.isoTimestamp || l.timestamp);
        return d >= cutoff;
    });

    const verifiedLogs = relevantLogs.filter(l => 
        l.type === 'success' && 
        (l.message && l.message.toLowerCase().includes('verified'))
    );
    
    const escalationLogs = relevantLogs.filter(l => l.type === 'alert' || l.type === 'escalated');

    // 1. Avg Time & Deviation
    let avgTimeStr = "--:--";
    let deviationStr = "No data";
    
    if (verifiedLogs.length > 0) {
        const minutesArray = verifiedLogs.map(l => {
            const d = new Date(l.isoTimestamp || l.timestamp);
            return d.getHours() * 60 + d.getMinutes();
        });

        const totalMinutes = minutesArray.reduce((sum, m) => sum + m, 0);
        const avgMinutes = totalMinutes / minutesArray.length;
        
        // Format Avg Time
        const h = Math.floor(avgMinutes / 60);
        const m = Math.round(avgMinutes % 60);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        avgTimeStr = `${displayH}:${m.toString().padStart(2, '0')} ${ampm}`;

        // Std Dev
        const variance = minutesArray.reduce((sum, m) => sum + Math.pow(m - avgMinutes, 2), 0) / minutesArray.length;
        const stdDev = Math.sqrt(variance);
        deviationStr = `± ${Math.round(stdDev)} mins deviation`;
    }

    // 2. Escalations
    const projectedMonthly = (escalationLogs.length / rangeDays) * 30;
    const escalationDisplay = projectedMonthly.toFixed(1);

    // 3. Pattern Shift
    let shiftDisplay = "None";
    let shiftSubtext = "Routine is consistent";
    let shiftAnalysisPart = "Check-In patterns indicate high stability.";

    if (verifiedLogs.length >= 4) {
        // Sort oldest to newest
        const sorted = [...verifiedLogs].sort((a, b) => 
            new Date(a.isoTimestamp || a.timestamp).getTime() - new Date(b.isoTimestamp || b.timestamp).getTime()
        );
        
        const mid = Math.floor(sorted.length / 2);
        const firstHalf = sorted.slice(0, mid);
        const secondHalf = sorted.slice(mid);

        const getAvgMins = (arr: any[]) => {
             const mins = arr.map(l => {
                const d = new Date(l.isoTimestamp || l.timestamp);
                return d.getHours() * 60 + d.getMinutes();
             });
             return mins.reduce((a,b) => a+b, 0) / arr.length;
        };

        const avg1 = getAvgMins(firstHalf);
        const avg2 = getAvgMins(secondHalf);
        const diff = avg2 - avg1;

        if (Math.abs(diff) > 20) {
            shiftDisplay = diff > 0 ? "Drifting Late" : "Drifting Early";
            shiftSubtext = `${Math.round(Math.abs(diff))} mins shift detected`;
            shiftAnalysisPart = `Patterns indicate a ${diff > 0 ? "later" : "earlier"} shift in routine (${Math.round(Math.abs(diff))} mins) over the period.`;
        } else if (Math.abs(diff) > 5) {
             shiftDisplay = "Minor Drift";
             shiftSubtext = `${Math.round(Math.abs(diff))} mins shift`;
             shiftAnalysisPart = `The primary check-in time has shifted slightly ${diff > 0 ? "later" : "earlier"} (${Math.round(Math.abs(diff))} mins), but is within normal variance.`;
        }
    }

    // 4. Full Analysis Text
    let analysisText = shiftAnalysisPart;
    if (projectedMonthly > 1) {
        analysisText += ` However, frequent escalations (${escalationDisplay}/mo projected) suggest potential friction in the routine or device accessibility issues.`;
    } else {
        analysisText += " No intervention is recommended at this time.";
    }

    return {
        avgTimeStr,
        deviationStr,
        escalationDisplay,
        shiftDisplay,
        shiftSubtext,
        analysisText
    };
  }, [logs, timeRange]);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const patientId = currentPatient?.id || '1';
        const now = getNow();
        const localDateStr = now.toISOString().split('T')[0];
        
        // CRITICAL FIX: Force cache-busting with timestamp + random to ensure published app gets fresh data
        const cacheBuster = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        
        console.log('📊 RoutineStability page: Fetching data for patient', patientId, 'range:', timeRange);
        const res = await fetch(`${SERVER_URL}/analytics/stability?range=${timeRange}&patientId=${patientId}&localDateStr=${localDateStr}&cb=${cacheBuster}`, {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` },
            cache: 'no-store'
        });
        if (res.ok) {
            const json = await res.json();
            console.log('📊 Routine Stability data loaded for patient', patientId, ':', json.length, 'days');
            // Server now provides unique IDs - ensure each item has a unique key
            const dataWithKeys = json.map((item: any, index: number) => ({
                ...item,
                key: item.id || item.timestamp || `data-${index}-${Date.now()}`,
                uniqueKey: item.id || item.timestamp || `data-${index}`,
            }));
            setData(dataWithKeys);
        } else {
             // Fallback mock data if server endpoint not ready
            const mockData = Array.from({ length: 30 }, (_, i) => {
                const timestamp = Date.now() - (29 - i) * 86400000;
                const dateObj = new Date(timestamp);
                return {
                    uniqueKey: `mock-day-${timestamp}`, // Use timestamp for true uniqueness
                    id: `mock-day-${i}`,
                    date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    score: 85 + Math.random() * 15 - (i % 5 === 0 ? 10 : 0), // Occasional dip
                    timestamp: timestamp
                };
            });
            setData(mockData);
        }
      } catch (e) {
        console.error('Error fetching stability data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeRange, currentPatient?.id]);

  const handleExport = () => {
    try {
      if (!data || data.length === 0) {
        toast.error("No data available to export.");
        return;
      }

      // Generate CSV content
      const headers = ['Date', 'Consistency Score'];
      const rows = data.map(row => [row.date, row.score]);
      const csvContent = "data:text/csv;charset=utf-8," + [
        headers.join(','), 
        ...rows.map(r => r.join(','))
      ].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `caresolis_stability_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Stability report downloaded successfully.");
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export report.");
    }
  };

  // Custom Tick Formatter for Y-Axis (Hours)
  const formatHour = (decimalHour: number) => {
    const h = Math.floor(decimalHour);
    const m = Math.round((decimalHour - h) * 60);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  if (loading) return (
      <div className="flex h-96 items-center justify-center">
          <div className="text-slate-400 dark:text-slate-500 animate-pulse">Loading analytics...</div>
      </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <PageHeader
        title="Routine Stability"
        subtitle="Long-term interaction consistency analysis"
        rightAction={
          <div className="flex items-center gap-3">
            {/* Time Range Selector */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setTimeRange('7d')}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                  timeRange === '7d' 
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                  timeRange === '30d' 
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                30 Days
              </button>
              <button
                onClick={() => setTimeRange('90d')}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                  timeRange === '90d' 
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                90 Days
              </button>
            </div>
            
            <Button 
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
          </div>
        }
      />

      {/* Smart Suggestions */}
      <SmartScheduleSuggestion logs={logs} settings={settings} onUpdate={updateSettings} />

      {/* Main Chart Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 min-h-[400px] transition-colors"
      >
        <div className="flex items-center justify-between mb-8">
            <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    {viewMode === 'trend' ? 'Consistency Score' : 'Interaction Time Heatmap'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {viewMode === 'trend' 
                        ? 'Daily adherence to scheduled check-in windows' 
                        : 'Visualizing exact check-in times over the last period'
                    }
                </p>
            </div>
            {viewMode === 'trend' && (
                <div className="text-right">
                    <div className="text-3xl font-light text-emerald-600 dark:text-emerald-400">
                        {data.length > 0 ? `${data[data.length - 1].score}%` : 'Loading...'}
                    </div>
                    {data.length > 1 && (
                        <div className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1",
                            data[data.length - 1].score >= data[0].score 
                                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20" 
                                : "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20"
                        )}>
                            {data[data.length - 1].score >= data[0].score ? '+' : ''}
                            {(data[data.length - 1].score - data[0].score).toFixed(1)}% vs start
                        </div>
                    )}
                </div>
            )}
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%" minHeight={300}>
            {viewMode === 'trend' ? (
                <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop key="gradient-stop-top" offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop key="gradient-stop-bottom" offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#94a3b8' }} 
                    dy={10}
                    minTickGap={30}
                />
                <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#94a3b8' }} 
                    domain={[0, 100]} 
                />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'var(--tooltip-bg, #fff)', 
                        borderRadius: '12px', 
                        border: '1px solid var(--tooltip-border, #e2e8f0)', 
                        boxShadow: '0 4px 20px -2px rgb(0 0 0 / 0.1)',
                        padding: '12px'
                    }}
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <ReferenceLine y={80} stroke="#cbd5e1" strokeDasharray="3 3" className="dark:stroke-slate-700" />
                <Area 
                    key="stability-score-area"
                    type="monotone" 
                    dataKey="score" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill={`url(#${gradientId})`} 
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#059669' }}
                    isAnimationActive={false}
                />
                </AreaChart>
            ) : (
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                     <XAxis 
                        dataKey="timestamp" 
                        domain={['auto', 'auto']}
                        name="Date"
                        tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        type="number"
                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                     />
                     <YAxis 
                        dataKey="time" 
                        name="Time" 
                        domain={[6, 22]} // Focus on 6am to 10pm usually
                        tickFormatter={formatHour}
                        type="number"
                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                     />
                     <ZAxis type="number" range={[60, 400]} />
                     <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 shadow-lg rounded-lg text-sm">
                                        <p className="font-semibold text-slate-900 dark:text-slate-100">{data.date}</p>
                                        <p className="text-slate-600 dark:text-slate-400">Time: {formatHour(data.time)}</p>
                                        <p className={cn("text-xs font-medium mt-1", data.status === 'late' ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")}>
                                            {data.status === 'late' ? 'Late Verification' : 'On-Time Verification'}
                                        </p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                     />
                     <Scatter key="interactions-scatter" name="Interactions" data={heatmapData} fill="#10b981" shape="circle" />
                </ScatterChart>
            )}
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-40 transition-colors"
         >
            <div className="flex items-start justify-between">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 h-fit">
                    <Clock size={20} />
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">{timeRange} Avg</span>
            </div>
            <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Check-In Time</h3>
                <p className="text-3xl font-light text-slate-900 dark:text-slate-100 mt-1">{stats.avgTimeStr}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{stats.deviationStr}</p>
            </div>
         </motion.div>

         <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-40 transition-colors"
         >
            <div className="flex items-start justify-between">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg">
                    <AlertTriangle size={20} />
                </div>
                <span className={cn(
                    "text-xs font-medium px-2 py-1 rounded-full",
                    Number(stats.escalationDisplay) > 1 ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50"
                )}>
                    {Number(stats.escalationDisplay) > 1 ? 'Attention' : 'Stable'}
                </span>
            </div>
            <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Escalations</h3>
                <p className="text-3xl font-light text-slate-900 dark:text-slate-100 mt-1">{stats.escalationDisplay}<span className="text-lg text-slate-400 dark:text-slate-500 font-normal">/mo</span></p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Last alert: {daysSinceLastAlert}</p>
            </div>
         </motion.div>

         <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-40 transition-colors"
         >
            <div className="flex items-start justify-between">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
                    <Activity size={20} />
                </div>
            </div>
            <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Pattern Shift</h3>
                <p className="text-3xl font-light text-slate-900 dark:text-slate-100 mt-1">{stats.shiftDisplay}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{stats.shiftSubtext}</p>
            </div>
         </motion.div>
      </div>

      {/* Analysis Section */}
      <motion.div 
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.4 }}
         className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex items-start gap-4 transition-colors"
      >
        <div className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm text-slate-600 dark:text-slate-400 shrink-0">
            <Info size={20} />
        </div>
        <div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100">System Analysis</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                {stats.analysisText}
            </p>
        </div>
      </motion.div>
    </div>
  );
}