import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Clock, MapPin, Check, Activity, X, MessageSquare } from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'clock-in' | 'dose-dispensed' | 'dose-retrieved' | 'manual-note';
  timestamp: Date;
  description: string;
  automatic?: boolean;
}

export default function ActiveVisit() {
  const navigate = useNavigate();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');

  // Sample visit data
  const visitData = {
    patientName: 'Eleanor Whitmore',
    clockInTime: new Date(Date.now() - 42 * 60 * 1000), // 42 minutes ago
    clockInLocation: '2847 Elm Street, San Francisco, CA',
    gpsConfirmed: true,
  };

  // Sample timeline events
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([
    {
      id: '1',
      type: 'clock-in',
      timestamp: visitData.clockInTime,
      description: 'Clocked In',
      automatic: true,
    },
    {
      id: '2',
      type: 'dose-dispensed',
      timestamp: new Date(visitData.clockInTime.getTime() + 15 * 60 * 1000),
      description: 'Dose dispensed — confirmed via device',
      automatic: true,
    },
    {
      id: '3',
      type: 'dose-retrieved',
      timestamp: new Date(visitData.clockInTime.getTime() + 18 * 60 * 1000),
      description: 'Dose re-presented — patient retrieved',
      automatic: true,
    },
  ]);

  // Live timer
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - visitData.clockInTime.getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [visitData.clockInTime]);

  const formatElapsedTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleAddNote = () => {
    if (noteText.trim()) {
      const newEvent: TimelineEvent = {
        id: Date.now().toString(),
        type: 'manual-note',
        timestamp: new Date(),
        description: noteText.trim(),
        automatic: false,
      };
      setTimelineEvents([...timelineEvents, newEvent]);
      setNoteText('');
      setShowNoteInput(false);
    }
  };

  const getEventDotColor = (type: string): string => {
    switch (type) {
      case 'clock-in':
        return 'bg-emerald-500';
      case 'dose-dispensed':
      case 'dose-retrieved':
        return 'bg-[#00b4d8]';
      case 'manual-note':
        return 'bg-amber-500';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-6">
      {/* Header with Timer */}
      <header className="px-4 py-6 text-white shadow-md" style={{ backgroundColor: '#0d1b2a' }}>
        <div className="max-w-md mx-auto">
          <h1 className="text-lg font-semibold text-center text-slate-300 mb-2">
            Visit in Progress
          </h1>

          {/* Live Timer - Large & Prominent */}
          <div className="text-center mb-4">
            <div className="text-5xl font-bold tracking-wider" style={{ color: '#00b4d8' }}>
              {formatElapsedTime(elapsedTime)}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#00b4d8] animate-pulse" />
              Active
            </div>
          </div>

          {/* Patient Info */}
          <div className="text-center">
            <h2 className="text-xl font-bold mb-1">{visitData.patientName}</h2>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              <span>Clocked in at {formatTimestamp(visitData.clockInTime)}</span>
            </div>
            {visitData.gpsConfirmed && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 mt-1">
                <MapPin className="w-3 h-3" />
                <span>GPS confirmed</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-md px-4 py-6 mx-auto">
        {/* Visit Timeline Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Visit Timeline</h3>
            {!showNoteInput && (
              <button
                onClick={() => setShowNoteInput(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-all border-2 rounded-lg text-slate-700 border-slate-300 hover:border-slate-400 active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                Log Note
              </button>
            )}
          </div>

          {/* Note Input */}
          {showNoteInput && (
            <div className="mb-4 p-3 bg-white border-2 border-[#00b4d8] rounded-xl shadow-sm">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Enter your observation or note..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:border-transparent"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleAddNote}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white rounded-lg active:scale-95 transition-transform"
                  style={{ backgroundColor: '#00b4d8' }}
                >
                  Add Note
                </button>
                <button
                  onClick={() => {
                    setShowNoteInput(false);
                    setNoteText('');
                  }}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 transition-colors bg-slate-200 rounded-lg hover:bg-slate-300 active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Timeline Events */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-200" />

            {/* Events */}
            <div className="space-y-4">
              {timelineEvents.map((event, index) => (
                <div key={event.id} className="relative flex gap-3">
                  {/* Dot */}
                  <div className="relative z-10 flex-shrink-0 mt-1">
                    <div className={`w-4 h-4 rounded-full border-2 border-white ${getEventDotColor(event.type)}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${event.type === 'manual-note' ? 'font-normal text-slate-700' : 'font-medium text-slate-900'}`}>
                        {event.description}
                      </p>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {formatTimestamp(event.timestamp)}
                      </span>
                    </div>
                    {event.automatic && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 text-[10px] font-medium text-slate-600 bg-slate-100 rounded-full">
                        <Activity className="w-3 h-3" />
                        Auto-logged
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Clock Out Button - Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => navigate('/visits/complete')}
            className="w-full py-4 text-lg font-bold text-white rounded-xl active:scale-[0.98] transition-transform shadow-md"
            style={{ backgroundColor: '#ef476f' }}
          >
            Clock Out
          </button>
          <p className="mt-2 text-xs text-center text-slate-500">
            Clocking out records your end time and GPS for EVV
          </p>
        </div>
      </div>
    </div>
  );
}
