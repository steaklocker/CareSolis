import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'Mon', time: 9.1 },
  { day: 'Tue', time: 9.2 },
  { day: 'Wed', time: 8.9 },
  { day: 'Thu', time: 9.0 },
  { day: 'Fri', time: 9.3 },
  { day: 'Sat', time: 9.1 },
  { day: 'Sun', time: 9.0 },
];

export function StabilityChart() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 tracking-tight text-sm uppercase">Routine Stability</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">Check-in consistency over 7 days</p>
        </div>
        <div className="text-right">
          <span className="block text-2xl font-light text-slate-900 font-mono">98%</span>
          <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Stable Pattern</span>
        </div>
      </div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%" minHeight={192}>
          <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8' }} 
              dy={10}
            />
            <YAxis 
              hide 
              domain={[8, 10]} 
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '8px', 
                border: 'none', 
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                fontSize: '12px',
                color: '#475569',
                backgroundColor: '#ffffff'
              }}
              cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area 
              type="monotone" 
              dataKey="time" 
              stroke="#10b981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorTime)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}