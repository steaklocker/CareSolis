import { useState } from 'react';
import { Send, MessageSquare, User, Clock, Lock } from 'lucide-react';
import { clsx } from 'clsx';
import { useUserRole } from '../context/UserRoleContext';

interface Message {
  id: string;
  sender: string;
  senderRole: 'admin' | 'caregiver' | 'nurse' | 'physician';
  message: string;
  timestamp: string;
  isCurrentUser: boolean;
  // FDA Class II Audit Fields
  createdAt?: string;
  createdBy?: string;
  sessionId?: string;
}

interface ShiftNote {
  id: string;
  caregiver: string;
  date: string;
  shift: 'morning' | 'afternoon' | 'evening' | 'night';
  notes: string;
  vitals?: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
  };
}

export default function CareMessaging() {
  const [activeTab, setActiveTab] = useState<'messages' | 'shiftnotes'>('messages');
  const [newMessage, setNewMessage] = useState('');
  const { role } = useUserRole(); // Get current role from context

  const mockMessages: Message[] = [
    {
      id: '1',
      sender: 'Dr. Sarah Chen',
      senderRole: 'physician',
      message: 'Please monitor Eleanor\'s blood pressure closely today. Adjusted her Lisinopril dose.',
      timestamp: '2026-03-01T08:30:00',
      isCurrentUser: false
    },
    {
      id: '2',
      sender: 'You',
      senderRole: 'admin',
      message: 'Noted. Will track morning and evening readings. Should I escalate if above 140/90?',
      timestamp: '2026-03-01T08:45:00',
      isCurrentUser: true
    },
    {
      id: '3',
      sender: 'Nurse Maria',
      senderRole: 'nurse',
      message: 'Yes, please call me directly if systolic exceeds 140. Also, she mentioned feeling dizzy yesterday.',
      timestamp: '2026-03-01T09:00:00',
      isCurrentUser: false
    },
    {
      id: '4',
      sender: 'Sarah (Daughter)',
      senderRole: 'caregiver',
      message: 'I can visit Thursday 3-5pm for medication review. Does that work for everyone?',
      timestamp: '2026-03-01T10:15:00',
      isCurrentUser: false
    }
  ];

  const [messages, setMessages] = useState<Message[]>(mockMessages);

  const mockShiftNotes: ShiftNote[] = [
    {
      id: '1',
      caregiver: 'John Martinez',
      date: '2026-03-01',
      shift: 'morning',
      notes: 'Patient alert and oriented. Ate full breakfast. Medications taken on time. Mood positive. Complained of slight knee pain - gave Acetaminophen as ordered.',
      vitals: {
        bloodPressure: '132/84',
        heartRate: '72 bpm',
        temperature: '98.4°F'
      }
    },
    {
      id: '2',
      caregiver: 'Lisa Wong',
      date: '2026-02-28',
      shift: 'evening',
      notes: 'Patient rested well. Light dinner consumed. Evening meds completed. No concerns. Family visited 4-6pm.',
      vitals: {
        bloodPressure: '128/80',
        heartRate: '68 bpm'
      }
    }
  ];

  const [shiftNotes] = useState<ShiftNote[]>(mockShiftNotes);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const now = new Date().toISOString();
    const sessionId = `session-${Date.now()}`;
    
    // Map role from UserRoleContext to message role format
    const senderRole = role === 'admin' ? 'admin' : 'caregiver';

    const message: Message = {
      id: Date.now().toString(),
      sender: 'You',
      senderRole: senderRole as 'admin' | 'caregiver', // Use actual role from context
      message: newMessage,
      timestamp: now,
      isCurrentUser: true,
      // FDA Class II Audit Fields
      createdAt: now,
      createdBy: `user-${role}`, // In production, this would be the actual user ID
      sessionId: sessionId
    };

    // FDA Class II Audit Logging for message creation
    console.log('[FDA AUDIT LOG - MESSAGE CREATED]', {
      messageId: message.id,
      timestamp: now,
      action: 'MESSAGE_SEND',
      actor: `user-${role}`,
      actorRole: senderRole,
      messageContent: newMessage.substring(0, 50) + (newMessage.length > 50 ? '...' : ''), // Truncated for logging
      sessionId: sessionId,
      complianceCategory: 'care_coordination_communication',
      severity: 'info',
      userAgent: navigator.userAgent
    });

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const roleColors = {
    admin: 'bg-blue-100 text-blue-700 border-blue-300',
    caregiver: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    nurse: 'bg-purple-100 text-purple-700 border-purple-300',
    physician: 'bg-rose-100 text-rose-700 border-rose-300'
  };

  const roleLabels = {
    admin: 'Admin',
    caregiver: 'Caregiver',
    nurse: 'Nurse',
    physician: 'Physician'
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Care Team Messaging</h1>
          <p className="text-slate-600 mt-1 flex items-center gap-2">
            <Lock size={16} />
            HIPAA-compliant encrypted communication
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('messages')}
              className={clsx(
                "flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2",
                activeTab === 'messages'
                  ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <MessageSquare size={20} />
              Team Messages
            </button>
            <button
              onClick={() => setActiveTab('shiftnotes')}
              className={clsx(
                "flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2",
                activeTab === 'shiftnotes'
                  ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <Clock size={20} />
              Shift Notes
            </button>
          </div>

          {activeTab === 'messages' && (
            <div className="p-6">
              <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={clsx(
                      "flex gap-4",
                      msg.isCurrentUser && "flex-row-reverse"
                    )}
                  >
                    <div className="shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {msg.sender.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                    <div className={clsx(
                      "flex-1 max-w-md",
                      msg.isCurrentUser && "text-right"
                    )}>
                      <div className="flex items-center gap-2 mb-1">
                        {msg.isCurrentUser && (
                          <>
                            <span className={clsx(
                              "text-xs px-2 py-0.5 rounded border font-semibold",
                              roleColors[msg.senderRole]
                            )}>
                              {roleLabels[msg.senderRole]}
                            </span>
                            <span className="font-semibold text-slate-900">{msg.sender}</span>
                          </>
                        )}
                        {!msg.isCurrentUser && (
                          <>
                            <span className="font-semibold text-slate-900">{msg.sender}</span>
                            <span className={clsx(
                              "text-xs px-2 py-0.5 rounded border font-semibold",
                              roleColors[msg.senderRole]
                            )}>
                              {roleLabels[msg.senderRole]}
                            </span>
                          </>
                        )}
                      </div>
                      <div className={clsx(
                        "p-4 rounded-lg",
                        msg.isCurrentUser
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-900"
                      )}>
                        <p>{msg.message}</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(msg.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  <Send size={18} />
                  Send
                </button>
              </div>
            </div>
          )}

          {activeTab === 'shiftnotes' && (
            <div className="p-6">
              <div className="space-y-4">
                {shiftNotes.map((note) => (
                  <div key={note.id} className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-slate-900">{note.caregiver}</h3>
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold capitalize">
                            {note.shift} Shift
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">
                          {new Date(note.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <User size={24} className="text-slate-400" />
                    </div>

                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-slate-600 uppercase mb-2">Shift Notes</h4>
                      <p className="text-slate-900">{note.notes}</p>
                    </div>

                    {note.vitals && (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-600 uppercase mb-2">Vitals</h4>
                        <div className="grid grid-cols-3 gap-4">
                          {note.vitals.bloodPressure && (
                            <div className="bg-white rounded-lg p-3 border border-slate-200">
                              <p className="text-xs text-slate-600 mb-1">Blood Pressure</p>
                              <p className="font-bold text-slate-900">{note.vitals.bloodPressure}</p>
                            </div>
                          )}
                          {note.vitals.heartRate && (
                            <div className="bg-white rounded-lg p-3 border border-slate-200">
                              <p className="text-xs text-slate-600 mb-1">Heart Rate</p>
                              <p className="font-bold text-slate-900">{note.vitals.heartRate}</p>
                            </div>
                          )}
                          {note.vitals.temperature && (
                            <div className="bg-white rounded-lg p-3 border border-slate-200">
                              <p className="text-xs text-slate-600 mb-1">Temperature</p>
                              <p className="font-bold text-slate-900">{note.vitals.temperature}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}