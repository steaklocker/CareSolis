import React from 'react';
import { RefillsMonitor } from '../components/RefillsMonitor';

export default function RefillsMonitorPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <RefillsMonitor />
      </div>
    </div>
  );
}
