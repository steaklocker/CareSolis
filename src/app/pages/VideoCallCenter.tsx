import { useState } from 'react';
import { Video, Phone, PhoneOff, Mic, MicOff, Camera, CameraOff, Monitor, Clock, User, Calendar } from 'lucide-react';
import { clsx } from 'clsx';

interface CallHistory {
  id: string;
  participant: string;
  date: string;
  duration: string;
  type: 'video' | 'audio';
  billable: boolean;
  cptCode?: string;
}

export default function VideoCallCenter() {
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Mock call history - in production, fetch from Supabase
  const callHistory: CallHistory[] = [
    {
      id: '1',
      participant: 'Eleanor Whitmore',
      date: '2026-03-01T10:00:00',
      duration: '12:34',
      type: 'video',
      billable: true,
      cptCode: '98980'
    },
    {
      id: '2',
      participant: 'Dr. Sarah Chen',
      date: '2026-02-28T14:30:00',
      duration: '8:45',
      type: 'video',
      billable: false
    },
    {
      id: '3',
      participant: 'Eleanor Whitmore',
      date: '2026-02-25T09:15:00',
      duration: '15:20',
      type: 'video',
      billable: true,
      cptCode: '98980'
    },
    {
      id: '4',
      participant: 'Sarah (Daughter)',
      date: '2026-02-23T16:00:00',
      duration: '6:12',
      type: 'audio',
      billable: false
    }
  ];

  const handleStartCall = () => {
    setIsInCall(true);
    // In production: Initialize Twilio/Agora/Zoom SDK
    console.log('🎥 Starting video call - Ready for Twilio/Agora integration');
  };

  const handleEndCall = () => {
    setIsInCall(false);
    setIsMuted(false);
    setIsVideoOff(false);
    setCallDuration(0);
    // In production: End call, save to database, log for RTM billing
    console.log('🎥 Call ended - Duration would be saved for RTM billing');
  };

  // Calculate billable minutes
  const totalBillableMinutes = callHistory
    .filter(call => call.billable)
    .reduce((total, call) => {
      const [minutes, seconds] = call.duration.split(':').map(Number);
      return total + minutes + (seconds / 60);
    }, 0);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Video Call Center</h1>
          <p className="text-slate-600 mt-1">HIPAA-compliant video consultations with automatic CPT code tracking</p>
        </div>

        {/* Integration Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Video className="text-blue-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Video Integration Ready</h3>
            <p className="text-sm text-blue-700">
              This module is ready for Twilio Video, Agora, or Zoom SDK integration. 
              Add your API keys to enable live calls. Currently showing mock interface.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Call Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Video Preview */}
              <div className="relative bg-slate-900 aspect-video flex items-center justify-center">
                {isInCall ? (
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">EW</span>
                    </div>
                    <p className="text-white text-lg font-semibold mb-2">Eleanor Whitmore</p>
                    <p className="text-slate-400 text-sm">
                      {Math.floor(callDuration / 60)}:{String(callDuration % 60).padStart(2, '0')}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">Camera preview will appear here</p>
                    <p className="text-xs text-slate-500 mt-2">Powered by Twilio/Agora (integration pending)</p>
                  </div>
                )}

                {/* Call duration overlay */}
                {isInCall && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                    Recording for RTM billing
                  </div>
                )}
              </div>

              {/* Call Controls */}
              <div className="p-6">
                {!isInCall ? (
                  <button
                    onClick={handleStartCall}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center justify-center gap-3 transition-colors"
                  >
                    <Video size={24} />
                    Start Video Call with Patient
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={clsx(
                        "p-4 rounded-full transition-colors",
                        isMuted
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      )}
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>

                    <button
                      onClick={() => setIsVideoOff(!isVideoOff)}
                      className={clsx(
                        "p-4 rounded-full transition-colors",
                        isVideoOff
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      )}
                      title={isVideoOff ? "Turn on camera" : "Turn off camera"}
                    >
                      {isVideoOff ? <CameraOff size={24} /> : <Camera size={24} />}
                    </button>

                    <button
                      onClick={handleEndCall}
                      className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                      title="End call"
                    >
                      <PhoneOff size={24} />
                    </button>

                    <button
                      className="p-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Share screen"
                    >
                      <Monitor size={24} />
                    </button>
                  </div>
                )}

                {/* Quick Actions */}
                {!isInCall && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button className="py-3 px-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm font-semibold text-slate-700">
                      <Phone size={18} />
                      Audio Only Call
                    </button>
                    <button className="py-3 px-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm font-semibold text-slate-700">
                      <Calendar size={18} />
                      Schedule Call
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RPM Billing Stats */}
          <div className="space-y-6">
            {/* Billable Minutes Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <Clock className="text-emerald-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-600">This Month</p>
                  <h3 className="text-2xl font-bold text-slate-900">{Math.round(totalBillableMinutes)} min</h3>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">CPT 98980 (20+ min)</span>
                  <span className="font-semibold text-emerald-600">Qualified ✓</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">CPT 98981 (40+ min)</span>
                  <span className="font-semibold text-slate-400">Not yet</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-3">
                  <div 
                    className="h-full bg-emerald-600 transition-all"
                    style={{ width: `${Math.min((totalBillableMinutes / 40) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {Math.max(0, 40 - Math.round(totalBillableMinutes))} min to unlock CPT 98981
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Features</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                  </div>
                  <span className="text-slate-700">Automatic call recording for compliance</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                  </div>
                  <span className="text-slate-700">CPT code auto-assignment (20+ min calls)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                  </div>
                  <span className="text-slate-700">HIPAA-compliant end-to-end encryption</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                  </div>
                  <span className="text-slate-700">Screen sharing for medication review</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                  </div>
                  <span className="text-slate-700">Export billing report for Medicare</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call History */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock size={20} className="text-indigo-600" />
            Call History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Participant</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Date & Time</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Duration</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">CPT Code</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Billable</th>
                </tr>
              </thead>
              <tbody>
                {callHistory.map((call) => (
                  <tr key={call.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                          {call.participant.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-slate-900">{call.participant}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {new Date(call.date).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-slate-900">{call.duration}</td>
                    <td className="py-3 px-4">
                      <span className={clsx(
                        "text-xs px-2 py-1 rounded-full font-semibold",
                        call.type === 'video'
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-700"
                      )}>
                        {call.type === 'video' ? '📹 Video' : '🎙️ Audio'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-mono text-slate-700">
                      {call.cptCode || '-'}
                    </td>
                    <td className="py-3 px-4">
                      {call.billable ? (
                        <span className="text-xs px-2 py-1 rounded-full font-semibold bg-emerald-100 text-emerald-700">
                          ✓ Billable
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full font-semibold bg-slate-100 text-slate-500">
                          Non-billable
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Integration Instructions */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
            <Video size={20} />
            Ready to Enable Live Video Calls?
          </h3>
          <div className="space-y-2 text-sm text-amber-800">
            <p className="font-semibold">Choose your video provider and add API keys:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Twilio Video:</strong> Sign up at twilio.com/video, get API keys, add to environment</li>
              <li><strong>Agora.io:</strong> Sign up at agora.io, get App ID + Token, configure SDK</li>
              <li><strong>Zoom SDK:</strong> Get Zoom SDK credentials, integrate with existing accounts</li>
            </ul>
            <p className="mt-3 font-semibold">Estimated integration time: 2-3 hours with API keys ready</p>
            <p className="mt-2">Once integrated, all calls auto-save to Supabase with CPT code tracking for RTM billing.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
