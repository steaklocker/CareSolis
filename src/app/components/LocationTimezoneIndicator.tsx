import React from 'react';
import { MapPin, Clock } from 'lucide-react';
import { useCaresolis } from '../hooks/useCaresolis';
import { clsx } from 'clsx';

export function LocationTimezoneIndicator() {
  const { locationData } = useCaresolis();

  if (!locationData || locationData.city === 'Unknown') {
    return null;
  }

  return (
    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
        {locationData.city}, {locationData.state}
      </span>
      <div className="w-px h-4 bg-slate-300 dark:bg-slate-600" />
      <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
      <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
        {locationData.timezone.split('/')[1]?.replace('_', ' ') || locationData.timezone}
      </span>
    </div>
  );
}
