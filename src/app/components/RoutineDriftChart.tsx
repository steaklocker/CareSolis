import React, { useMemo } from 'react';
import { 
    ResponsiveContainer, 
    ComposedChart, 
    Bar, 
    Line,
    XAxis, 
    YAxis, 
    Tooltip, 
    ReferenceLine, 
    ReferenceArea,
    Cell 
} from 'recharts';
import { motion } from 'motion/react';
import { Activity, Info } from 'lucide-react';
import { clsx } from 'clsx';

interface Log {
    id: string;
    timestamp: string;
    message: string;
    type: string;
}

interface RoutineDriftChartProps {
    logs: Log[];
    threshold?: number;
}

export function RoutineDriftChart({ logs, threshold = 15 }: RoutineDriftChartProps) {
    const data = useMemo(() => {
        if (!logs || logs.length === 0) return [];

        const verifiedLogs = logs.filter(l => 
            l.type === 'success' && 
            (l.message.includes('Verified') || l.message.includes('User Interaction'))
        );

        // Group by day to find the "average drift" or list all points
        // Let's create a flat list of data points for the last 14 days (expanded for better visual)
        const points = [];
        const now = new Date();
        const lookbackDate = new Date();
        lookbackDate.setDate(now.getDate() - 14);

        verifiedLogs.forEach(log => {
            const logDate = new Date(log.timestamp);
            if (logDate < lookbackDate) return;

            // Extract Scheduled Time from Message
            const match = log.message.match(/at\s+(\d{1,2}:\d{2})/);
            if (match && match[1]) {
                const scheduledTimeStr = match[1];
                const [sH, sM] = scheduledTimeStr.split(':').map(Number);
                
                // Construct scheduled date object (using log date)
                const scheduledDate = new Date(logDate);
                scheduledDate.setHours(sH, sM, 0, 0);

                // Calculate Drift in Minutes
                const driftMs = logDate.getTime() - scheduledDate.getTime();
                const driftMins = Math.round(driftMs / 60000);

                // Cap drift for visualization
                const maxDrift = Math.max(60, threshold * 1.5);
                const cappedDrift = Math.min(Math.max(driftMins, -15), maxDrift);

                points.push({
                    date: logDate.toLocaleDateString(undefined, { weekday: 'short' }),
                    fullDate: logDate.toLocaleDateString(),
                    scheduled: scheduledTimeStr,
                    actual: logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    drift: cappedDrift,
                    status: driftMins <= 5 ? 'ontime' : driftMins <= threshold ? 'acceptable' : 'late'
                });
            }
        });

        // Sort by date ascending
        points.reverse();

        // Calculate Simple Moving Average for Trend
        let runningSum = 0;
        const trendWindow = 3;
        points.forEach((p, i) => {
            const windowSlice = points.slice(Math.max(0, i - trendWindow + 1), i + 1);
            const sum = windowSlice.reduce((acc, curr) => acc + curr.drift, 0);
            p.trend = Math.round(sum / windowSlice.length);
        });

        return points;
    }, [logs, threshold]);

    // Calculate Consistency Score
    const consistencyScore = useMemo(() => {
        if (data.length === 0) return 0;
        let totalScore = 0;
        data.forEach(d => {
             if (d.status === 'ontime') totalScore += 100;
             else if (d.status === 'acceptable') totalScore += 85;
             else totalScore += Math.max(0, 100 - (d.drift * 2)); 
        });
        return Math.round(totalScore / data.length);
    }, [data]);

    if (data.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <Activity className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2" />
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Not enough data for drift analysis</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Check back after a few verifications.</p>
            </div>
        );
    }

    const maxY = Math.max(60, threshold * 1.5);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 relative overflow-hidden"
        >
            <div className="flex items-start justify-between mb-6 relative z-10">
                <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 tracking-tight text-sm uppercase">
                        Routine Drift Analytics
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        Hybrid control chart visualizing adherence trends (Last 14 Days)
                    </p>
                </div>
                <div className="text-right">
                     <div className="text-2xl font-light text-slate-800 dark:text-slate-100 font-feature-settings-tnum">
                        {consistencyScore}%
                     </div>
                     <div className={clsx(
                         "text-[10px] font-bold uppercase tracking-widest",
                         consistencyScore >= 90 ? "text-emerald-500" : 
                         consistencyScore >= 75 ? "text-amber-500" : "text-rose-500"
                     )}>
                         Consistency Score
                     </div>
                </div>
            </div>

            <div className="h-64 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%" minHeight={256}>
                    <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="safeZone" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.05}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02}/>
                            </linearGradient>
                        </defs>

                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#94a3b8' }} 
                            dy={10}
                            interval={0}
                        />
                        <YAxis 
                            hide 
                            domain={[-15, maxY]} 
                        />
                        <Tooltip 
                            cursor={{ stroke: '#e2e8f0', strokeDasharray: '5 5' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const d = payload[0].payload;
                                    return (
                                        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 text-xs">
                                            <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{d.fullDate}</div>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600 dark:text-slate-300">
                                                <span>Scheduled:</span>
                                                <span className="text-right font-medium text-slate-700 dark:text-slate-300">{d.scheduled}</span>
                                                <span>Actual:</span>
                                                <span className="text-right font-medium text-slate-700 dark:text-slate-300">{d.actual}</span>
                                                <span>Drift:</span>
                                                <span className={clsx(
                                                    "text-right font-bold",
                                                    d.drift <= 5 ? "text-emerald-500" : 
                                                    d.drift <= threshold ? "text-amber-500" : "text-rose-500"
                                                )}>
                                                    +{d.drift} min
                                                </span>
                                                <span>Trend (3-day):</span>
                                                <span className="text-right font-mono text-slate-500 dark:text-slate-400">~{d.trend}m</span>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />

                        {/* Visual Guides */}
                        <ReferenceArea y1={0} y2={threshold} fill="#f0fdf4" fillOpacity={0.5} stroke="none" ifOverflow="extendDomain" />
                        <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={1} />
                        <ReferenceLine 
                            y={threshold} 
                            stroke="#fbbf24" 
                            strokeDasharray="3 3" 
                            strokeOpacity={0.4} 
                            label={{ value: `${threshold}m Alert Threshold`, position: 'insideTopRight', fontSize: 10, fill: '#d97706', opacity: 0.7 }} 
                        />
                        
                        {/* The Lollipop Sticks */}
                        <Bar 
                            dataKey="drift" 
                            barSize={2} 
                            fill="#cbd5e1" 
                            radius={[2, 2, 0, 0]}
                            isAnimationActive={false}
                        />

                        {/* Trend Line (Moving Average) */}
                        <Line 
                            type="monotone" 
                            dataKey="trend" 
                            stroke="#64748b" 
                            strokeWidth={2} 
                            dot={false} 
                            strokeDasharray="4 4" 
                            opacity={0.3} 
                            isAnimationActive={false}
                        />

                        {/* The Data Points (Lollipop Heads) */}
                        <Line 
                            type="step" 
                            dataKey="drift" 
                            stroke="none" 
                            isAnimationActive={true}
                            dot={(props: any) => {
                                const { cx, cy, payload } = props;
                                const color = payload.drift <= 5 ? '#10b981' : payload.drift <= threshold ? '#f59e0b' : '#f43f5e';
                                return (
                                    <circle key={props.key} cx={cx} cy={cy} r={5} fill={color} stroke="white" strokeWidth={2} />
                                );
                            }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-6 text-[10px] text-slate-500 dark:text-slate-400 relative z-10">
                 <div className="flex items-center gap-1.5">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 shadow-sm" />
                     <span>Stable Zone (0-5m)</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                     <div className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900 shadow-sm" />
                     <span>Minor Drift (5-{threshold}m)</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                     <div className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 shadow-sm" />
                     <span>Significant Drift ({'>'}{threshold}m)</span>
                 </div>
                 <div className="flex items-center gap-1.5 ml-4 border-l pl-4 border-slate-200 dark:border-slate-800">
                     <div className="w-8 h-0.5 border-t-2 border-slate-400 border-dashed opacity-50" />
                     <span>3-Day Trend</span>
                 </div>
            </div>
        </motion.div>
    );
}