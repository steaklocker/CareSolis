import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle, MapPin, Clock, Smartphone, PenLine, X } from 'lucide-react';

interface VisitEvent {
  id: string;
  timestamp: Date;
  description: string;
  automatic: boolean;
}

export default function VisitComplete() {
  const navigate = useNavigate();
  const [showEditNotes, setShowEditNotes] = useState(false);
  const [postVisitNote, setPostVisitNote] = useState('');

  // Sample visit data
  const visitData = {
    patientName: 'Eleanor Whitmore',
    date: 'May 30, 2026',
    clockInTime: new Date(2026, 4, 30, 11, 0, 0),
    clockOutTime: new Date(2026, 4, 30, 11, 48, 0),
    clockInGpsVerified: true,
    clockOutGpsVerified: true,
    location: '2847 Elm Street, San Francisco, CA 94102',
    locationVerified: true,
  };

  const events: VisitEvent[] = [
    {
      id: '1',
      timestamp: new Date(2026, 4, 30, 11, 0, 0),
      description: 'Clocked In',
      automatic: true,
    },
    {
      id: '2',
      timestamp: new Date(2026, 4, 30, 11, 15, 0),
      description: 'Dose dispensed — confirmed via device',
      automatic: true,
    },
    {
      id: '3',
      timestamp: new Date(2026, 4, 30, 11, 18, 0),
      description: 'Dose re-presented — patient retrieved',
      automatic: true,
    },
    {
      id: '4',
      timestamp: new Date(2026, 4, 30, 11, 25, 0),
      description: 'Patient reports feeling well, appetite good',
      automatic: false,
    },
    {
      id: '5',
      timestamp: new Date(2026, 4, 30, 11, 48, 0),
      description: 'Clocked Out',
      automatic: true,
    },
  ];

  const calculateDuration = (): string => {
    const diffMs = visitData.clockOutTime.getTime() - visitData.clockInTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return `${diffMins} minutes`;
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatEventTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isEvvCompliant = visitData.clockInGpsVerified && visitData.clockOutGpsVerified;

  const handleSaveNote = () => {
    // In production, save the note to backend
    console.log('Saving post-visit note:', postVisitNote);
    setShowEditNotes(false);
    setPostVisitNote('');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-6">
      {/* Header */}
      <header className="px-4 py-6 text-white shadow-md" style={{ backgroundColor: '#0d1b2a' }}>
        <div className="max-w-md mx-auto text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="w-8 h-8 text-emerald-400" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-bold">Visit Summary</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-md px-4 py-6 mx-auto">
        {/* Summary Card */}
        <div className="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm mb-4">
          <div className="p-5">
            {/* Patient & Date */}
            <div className="pb-4 mb-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">{visitData.patientName}</h2>
              <p className="text-sm text-slate-500">{visitData.date}</p>
            </div>

            {/* Visit Times */}
            <div className="space-y-3 mb-4">
              {/* Clock In */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">Clock In</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">
                    {formatTime(visitData.clockInTime)}
                  </span>
                  {visitData.clockInGpsVerified && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                      <CheckCircle className="w-3 h-3" />
                      GPS verified
                    </span>
                  )}
                </div>
              </div>

              {/* Clock Out */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">Clock Out</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">
                    {formatTime(visitData.clockOutTime)}
                  </span>
                  {visitData.clockOutGpsVerified && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                      <CheckCircle className="w-3 h-3" />
                      GPS verified
                    </span>
                  )}
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-sm font-medium text-slate-700">Duration</span>
                <span className="text-sm font-bold" style={{ color: '#00b4d8' }}>
                  {calculateDuration()}
                </span>
              </div>
            </div>

            {/* Location */}
            <div className="pt-3 mb-4 border-t border-slate-200">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {visitData.location}
                  </p>
                  {visitData.locationVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Visit Events */}
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Visit Events</h3>
              <div className="space-y-2.5">
                {events.map((event) => (
                  <div key={event.id} className="flex items-start gap-2.5">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {event.automatic ? (
                        <div className="p-1 bg-slate-100 rounded">
                          <Smartphone className="w-3 h-3 text-slate-600" />
                        </div>
                      ) : (
                        <div className="p-1 bg-amber-50 rounded">
                          <PenLine className="w-3 h-3 text-amber-600" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 leading-snug">
                        {event.description}
                      </p>
                      <span className="text-xs text-slate-500">
                        {formatEventTime(event.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* EVV Compliance Badge */}
            <div className="pt-4 mt-4 border-t border-slate-200">
              {isEvvCompliant ? (
                <div className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-bold text-emerald-700 tracking-wide">
                    EVV COMPLIANT
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="text-sm font-bold text-amber-700 tracking-wide">
                    REVIEW NEEDED
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Export Note */}
        <p className="text-xs text-center text-slate-500 mb-4 px-4">
          This record will be included in the next EVV data export
        </p>

        {/* Edit Notes Modal */}
        {showEditNotes && (
          <div className="mb-4 p-4 bg-white border-2 rounded-xl shadow-lg" style={{ borderColor: '#00b4d8' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Post-Visit Note</h3>
              <button
                onClick={() => setShowEditNotes(false)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={postVisitNote}
              onChange={(e) => setPostVisitNote(e.target.value)}
              placeholder="Add any additional observations or follow-up notes..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:border-transparent"
              rows={4}
              autoFocus
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleSaveNote}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-lg active:scale-95 transition-transform"
                style={{ backgroundColor: '#00b4d8' }}
              >
                Save Note
              </button>
              <button
                onClick={() => {
                  setShowEditNotes(false);
                  setPostVisitNote('');
                }}
                className="px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors bg-slate-200 rounded-lg hover:bg-slate-300 active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/visits')}
            className="w-full py-3.5 text-base font-bold text-white rounded-xl active:scale-[0.98] transition-transform shadow-md"
            style={{ backgroundColor: '#00b4d8' }}
          >
            Done
          </button>
          <button
            onClick={() => setShowEditNotes(true)}
            className="w-full py-3.5 text-base font-semibold border-2 rounded-xl active:scale-[0.98] transition-all"
            style={{ borderColor: '#00b4d8', color: '#00b4d8' }}
          >
            Edit Notes
          </button>
        </div>
      </div>
    </div>
  );
}
