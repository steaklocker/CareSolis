import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Thermometer, Droplets, Wind, Leaf, AlertTriangle, MapPin } from 'lucide-react';
import { clsx } from 'clsx';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { useCaresolis } from '../hooks/useCaresolis';

// Simulated telemetry generator
const generateHistory = (base: number, variance: number) => 
  Array.from({ length: 20 }, (_, i) => ({
    time: i,
    value: base + (Math.random() * variance * 2 - variance)
  }));

export function HomeEnvironmentCard() {
  const { settings, locationData } = useCaresolis();
  const [tempData, setTempData] = useState(generateHistory(72, 1.5));
  const [humidityData, setHumidityData] = useState(generateHistory(45, 2));
  const [co2Data, setCo2Data] = useState(generateHistory(420, 30));
  
  // Current values
  const [temp, setTemp] = useState(72.4);
  const [humidity, setHumidity] = useState(45);
  const [co2, setCo2] = useState(420);
  
  // Use location from LocationSync (includes timezone sync)
  const location = locationData 
    ? `${locationData.city}, ${locationData.state}` 
    : (settings?.location || 'Location syncing...');

  // Settings
  const tempMin = settings?.tempMin || 65;
  const tempMax = settings?.tempMax || 80;

  useEffect(() => {
    const interval = setInterval(() => {
      // Gentle drift simulation
      setTemp(t => {
        const next = t + (Math.random() * 0.4 - 0.2);
        return Number(next.toFixed(1));
      });
      setHumidity(h => {
        const next = h + (Math.random() * 2 - 1);
        return Math.round(Math.max(30, Math.min(60, next)));
      });
      setCo2(c => {
        const next = c + (Math.random() * 10 - 5);
        return Math.round(Math.max(400, Math.min(800, next)));
      });

      // Update charts occasionally
      setTempData(prev => [...prev.slice(1), { time: Date.now(), value: temp }]);
      setHumidityData(prev => [...prev.slice(1), { time: Date.now(), value: humidity }]);
      setCo2Data(prev => [...prev.slice(1), { time: Date.now(), value: co2 }]);
    }, 3000);

    return () => clearInterval(interval);
  }, [temp, humidity, co2]);

  const isTempAlert = temp < tempMin || temp > tempMax;
  const isHumidityAlert = humidity > 70 || humidity < 20; // Hardcoded safety defaults
  const isCo2Alert = co2 > 1000;

  const isAnyAlert = isTempAlert || isHumidityAlert || isCo2Alert;

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className={clsx(
            "h-full rounded-lg md:rounded-xl p-3 md:p-4 border shadow-lg shadow-slate-200/20 dark:shadow-slate-900/40 flex flex-col justify-between group hover:shadow-xl transition-all relative overflow-hidden",
            isAnyAlert 
                ? "bg-rose-50/70 dark:bg-rose-900/20 backdrop-blur-sm border-rose-200/60 dark:border-rose-900/50 hover:border-rose-300 dark:hover:border-rose-700"
                : "bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700"
        )}
    >
        {/* Header */}
        <div className="flex items-center gap-1.5 mb-2 z-10">
            <h3 className={clsx(
                "text-[8px] md:text-[9px] lg:text-[10px] font-semibold uppercase tracking-wider transition-colors",
                isAnyAlert ? "text-rose-600 dark:text-rose-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400"
            )}>
                Environment
            </h3>
            <div className={clsx("h-px flex-1", isAnyAlert ? "bg-rose-200 dark:bg-rose-800" : "bg-slate-100 dark:bg-slate-800/50")} />
            {isAnyAlert ? (
                <AlertTriangle className="w-2.5 h-2.5 md:w-3 md:h-3 text-rose-500 animate-pulse" />
            ) : (
                <Leaf className="w-2.5 h-2.5 md:w-3 md:h-3 text-emerald-500/50" />
            )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-1.5 z-10">
            {/* Temperature */}
            <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mb-0.5">
                    <Thermometer className={clsx("w-2.5 h-2.5 md:w-3 md:h-3", isTempAlert && "text-rose-500")} />
                    <span className={clsx("text-[8px] md:text-[9px] font-medium uppercase tracking-wide", isTempAlert && "text-rose-600 font-bold")}>Temp</span>
                </div>
                <div className={clsx("text-sm md:text-base lg:text-lg font-light leading-none", isTempAlert ? "text-rose-700 dark:text-rose-300" : "text-slate-700 dark:text-slate-200")}>
                    {temp}°<span className={clsx("text-[10px] md:text-xs font-normal", isTempAlert ? "text-rose-500" : "text-slate-500")}>F</span>
                </div>
                <div className="h-4 w-full opacity-50 mt-0.5">
                    <ResponsiveContainer width="100%" height="100%" minHeight={16}>
                        <AreaChart data={tempData}>
                            <defs>
                                <linearGradient id="gradTemp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={isTempAlert ? "#f43f5e" : "#f59e0b"} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={isTempAlert ? "#f43f5e" : "#f59e0b"} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="value" stroke={isTempAlert ? "#f43f5e" : "#f59e0b"} fill="url(#gradTemp)" strokeWidth={1} />
                            <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Humidity */}
            <div className={clsx("flex flex-col gap-0.5 border-l pl-1.5", isAnyAlert ? "border-rose-200/50 dark:border-rose-800/30" : "border-slate-100 dark:border-slate-800")}>
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mb-0.5">
                    <Droplets className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    <span className="text-[8px] md:text-[9px] font-medium uppercase tracking-wide">Humid</span>
                </div>
                <div className="text-sm md:text-base lg:text-lg font-light text-slate-700 dark:text-slate-200 leading-none">
                    {humidity}<span className="text-[10px] md:text-xs text-slate-500 font-normal">%</span>
                </div>
                <div className="h-4 w-full opacity-50 mt-0.5">
                    <ResponsiveContainer width="100%" height="100%" minHeight={16}>
                        <AreaChart data={humidityData}>
                            <defs>
                                <linearGradient id="gradHum" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#gradHum)" strokeWidth={1} />
                            <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Air Quality */}
            <div className={clsx("flex flex-col gap-0.5 border-l pl-1.5", isAnyAlert ? "border-rose-200/50 dark:border-rose-800/30" : "border-slate-100 dark:border-slate-800")}>
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mb-0.5">
                    <Wind className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    <span className="text-[8px] md:text-[9px] font-medium uppercase tracking-wide">AQI</span>
                </div>
                <div className="text-sm md:text-base lg:text-lg font-light text-slate-700 dark:text-slate-200 leading-none">
                    Good
                </div>
                 <div className="h-4 w-full opacity-50 mt-0.5">
                    <ResponsiveContainer width="100%" height="100%" minHeight={16}>
                        <AreaChart data={co2Data}>
                            <defs>
                                <linearGradient id="gradAir" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#gradAir)" strokeWidth={1} />
                            <YAxis hide domain={['dataMin - 50', 'dataMax + 50']} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
        
        {/* Location Footer - Auto-detected - Made Compact */}
        {location && (
          <div className={clsx(
            "mt-2 pt-2 border-t z-10",
            isAnyAlert ? "border-rose-200/50 dark:border-rose-800/30" : "border-slate-100 dark:border-slate-800"
          )}>
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 text-slate-400 dark:text-slate-500" />
              <span className="text-[10px] md:text-xs font-medium tracking-wide truncate">{location}</span>
            </div>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-50/0 via-transparent to-slate-50/50 dark:to-slate-800/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
}