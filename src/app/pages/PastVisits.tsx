import React from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Clock, MapPin, Check } from 'lucide-react';

interface Visit {
  id: string;
  patientName: string;
  address: string;
  scheduledStart: string;
  scheduledEnd: string;
  date: string;
  duration: string;
  evvVerified: boolean;
}

export default function PastVisits() {
  // Sample historical data
  const pastVisits: Visit[] = [
    {
      id: '1',
      patientName: 'Eleanor Whitmore',
      address: '2847 Elm Street, San Francisco, CA 94102',
      scheduledStart: '9:00 AM',
      scheduledEnd: '10:00 AM',
      date: 'May 29, 2026',
      duration: '58 min',
      evvVerified: true,
    },
    {
      id: '2',
      patientName: 'Robert Chen',
      address: '1523 Oak Avenue, San Francisco, CA 94115',
      scheduledStart: '2:00 PM',
      scheduledEnd: '3:00 PM',
      date: 'May 29, 2026',
      duration: '62 min',
      evvVerified: true,
    },
    {
      id: '3',
      patientName: 'Margaret Foster',
      address: '892 Pine Street, Apt 4B, San Francisco, CA 94108',
      scheduledStart: '11:00 AM',
      scheduledEnd: '12:00 PM',
      date: 'May 28, 2026',
      duration: '55 min',
      evvVerified: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 px-4 py-4 text-white shadow-md"
        style={{ backgroundColor: '#0d1b2a' }}>
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <Link to="/visits" className="p-1 -ml-1 transition-opacity hover:opacity-80">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">Past Visits</h1>
        </div>
      </header>

      {/* Visit History */}
      <div className="max-w-md px-4 py-4 mx-auto space-y-4">
        {/* Group by date */}
        {pastVisits.reduce((acc, visit) => {
          const existing = acc.find(group => group.date === visit.date);
          if (existing) {
            existing.visits.push(visit);
          } else {
            acc.push({ date: visit.date, visits: [visit] });
          }
          return acc;
        }, [] as { date: string; visits: Visit[] }[]).map((group) => (
          <div key={group.date}>
            <h2 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              {group.date}
            </h2>
            <div className="space-y-3">
              {group.visits.map((visit) => (
                <div
                  key={visit.id}
                  className="overflow-hidden bg-white border border-slate-200 rounded-xl"
                >
                  <div className="p-4">
                    {/* Patient Name */}
                    <h3 className="mb-1.5 text-base font-bold text-slate-900">
                      {visit.patientName}
                    </h3>

                    {/* Address */}
                    <div className="flex items-start gap-2 mb-3">
                      <MapPin className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
                      <p className="text-sm leading-relaxed text-slate-500">
                        {visit.address}
                      </p>
                    </div>

                    {/* Time & Status */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Clock className="w-4 h-4" style={{ color: '#00b4d8' }} />
                        <span>{visit.scheduledStart} — {visit.scheduledEnd}</span>
                        <span className="text-xs text-slate-500">({visit.duration})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-emerald-500 rounded-full">
                          <Check className="w-3 h-3" />
                          Completed
                        </span>
                        {visit.evvVerified && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
                            EVV ✓
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {pastVisits.length === 0 && (
          <div className="py-12 text-center">
            <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">No past visits</p>
          </div>
        )}
      </div>
    </div>
  );
}
