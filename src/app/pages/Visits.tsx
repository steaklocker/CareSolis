import React from 'react';
import { Link, useNavigate } from 'react-router';
import { Clock, MapPin, Check } from 'lucide-react';

interface Visit {
  id: string;
  patientName: string;
  address: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: 'upcoming' | 'in-progress' | 'completed';
  duration?: string;
  evvVerified?: boolean;
}

export default function Visits() {
  const navigate = useNavigate();

  // Sample data - would come from backend in production
  const visits: Visit[] = [
    {
      id: '1',
      patientName: 'Eleanor Whitmore',
      address: '2847 Elm Street, San Francisco, CA 94102',
      scheduledStart: '9:00 AM',
      scheduledEnd: '10:00 AM',
      status: 'completed',
      duration: '58 min',
      evvVerified: true,
    },
    {
      id: '2',
      patientName: 'Robert Chen',
      address: '1523 Oak Avenue, San Francisco, CA 94115',
      scheduledStart: '11:00 AM',
      scheduledEnd: '12:00 PM',
      status: 'in-progress',
    },
    {
      id: '3',
      patientName: 'Margaret Foster',
      address: '892 Pine Street, Apt 4B, San Francisco, CA 94108',
      scheduledStart: '2:00 PM',
      scheduledEnd: '3:00 PM',
      status: 'upcoming',
    },
    {
      id: '4',
      patientName: 'James Thompson',
      address: '3456 Birch Lane, San Francisco, CA 94121',
      scheduledStart: '4:00 PM',
      scheduledEnd: '5:00 PM',
      status: 'upcoming',
    },
  ];

  const getStatusBadge = (visit: Visit) => {
    switch (visit.status) {
      case 'upcoming':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-full">
            Upcoming
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white rounded-full animate-pulse"
            style={{ backgroundColor: '#00b4d8' }}>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            In Progress
          </span>
        );
      case 'completed':
        return (
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
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header - Navy background as specified */}
      <header className="sticky top-0 z-10 px-4 py-4 text-white shadow-md"
        style={{ backgroundColor: '#0d1b2a' }}>
        <div className="flex items-center justify-between max-w-md mx-auto">
          <h1 className="text-xl font-bold">Today's Visits</h1>
          <Link
            to="/visits/past"
            className="text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: '#00b4d8' }}>
            Past Visits
          </Link>
        </div>
      </header>

      {/* Visit List */}
      <div className="max-w-md px-4 py-4 mx-auto space-y-3">
        {visits.map((visit) => (
          <div
            key={visit.id}
            onClick={() => visit.status === 'in-progress' && navigate('/visits/active')}
            className={`overflow-hidden transition-shadow bg-white border border-slate-200 rounded-xl hover:shadow-md ${
              visit.status === 'in-progress' ? 'cursor-pointer active:scale-[0.98]' : ''
            }`}
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
                  {visit.duration && visit.status === 'completed' && (
                    <span className="text-xs text-slate-500">({visit.duration})</span>
                  )}
                </div>
                {getStatusBadge(visit)}
              </div>
            </div>
          </div>
        ))}

        {visits.length === 0 && (
          <div className="py-12 text-center">
            <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">No visits scheduled for today</p>
          </div>
        )}
      </div>
    </div>
  );
}
