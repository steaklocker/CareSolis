import React, { useState } from 'react';
import { MessageSquare, User, Phone, Mail, Send, Shield, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';

/**
 * CONTACT ADMIN PAGE
 * 
 * Allows caregivers to contact household administrators.
 * Shows list of admins from Care Circle and provides messaging interface.
 */

interface Admin {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  escalationLevel: number;
}

// Mock data - in production, this would come from Care Circle database
const MOCK_ADMINS: Admin[] = [
  {
    id: '1',
    name: 'Michael Thompson',
    relationship: 'Son (Healthcare POA)',
    phone: '(555) 123-4567',
    email: 'michael@example.com',
    escalationLevel: 3
  },
  {
    id: '2',
    name: 'Dr. Sarah Chen',
    relationship: 'Primary Care Physician',
    phone: '(555) 987-6543',
    email: 'dr.chen@clinic.com',
    escalationLevel: 3
  }
];

type MessageType = 'medication-change' | 'schedule-question' | 'technical-issue' | 'general';

const MESSAGE_TYPES: { value: MessageType; label: string; description: string }[] = [
  {
    value: 'medication-change',
    label: 'Medication Change Request',
    description: 'Request to add, remove, or modify medications'
  },
  {
    value: 'schedule-question',
    label: 'Schedule Question',
    description: 'Questions about medication or check-in schedules'
  },
  {
    value: 'technical-issue',
    label: 'Technical Issue',
    description: 'Device problems or system errors'
  },
  {
    value: 'general',
    label: 'General Inquiry',
    description: 'Other questions or concerns'
  }
];

export default function ContactAdmin() {
  const [selectedAdmin, setSelectedAdmin] = useState<string>('');
  const [messageType, setMessageType] = useState<MessageType>('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In production, this would send the message via backend
    console.log('Sending message:', {
      adminId: selectedAdmin,
      messageType,
      subject,
      message,
      timestamp: new Date().toISOString()
    });

    setSent(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSent(false);
      setSubject('');
      setMessage('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <MessageSquare className="text-blue-600" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Contact Administrator</h1>
              <p className="text-slate-600">Reach out to household admins for assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Administrators List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <Shield size={18} className="text-blue-600" />
                  Administrators
                </h2>
              </div>

              <div className="divide-y divide-slate-200">
                {MOCK_ADMINS.map((admin) => (
                  <div key={admin.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User size={20} className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">{admin.name}</h3>
                        <p className="text-xs text-slate-600 mb-2">{admin.relationship}</p>
                        
                        <div className="space-y-1">
                          <a
                            href={`tel:${admin.phone}`}
                            className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700"
                          >
                            <Phone size={12} />
                            {admin.phone}
                          </a>
                          <a
                            href={`mailto:${admin.email}`}
                            className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 truncate"
                          >
                            <Mail size={12} />
                            <span className="truncate">{admin.email}</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-blue-50 border-t border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>Admin Access:</strong> These users can modify medications, schedules, 
                  and system settings.
                </p>
              </div>
            </div>
          </div>

          {/* Message Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200 bg-slate-50">
                <h2 className="text-xl font-bold text-slate-900">Send Message</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Your message will be sent to all administrators
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                
                {/* Message Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    What is this about?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {MESSAGE_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setMessageType(type.value)}
                        className={clsx(
                          "p-4 rounded-lg border-2 text-left transition-all",
                          messageType === type.value
                            ? "border-blue-600 bg-blue-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        )}
                      >
                        <div className="font-semibold text-sm text-slate-900 mb-1">
                          {type.label}
                        </div>
                        <div className="text-xs text-slate-600">
                          {type.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of your request"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details about your request or question..."
                    rows={6}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Be as specific as possible to help administrators respond quickly.
                  </p>
                </div>

                {/* Submit Button */}
                <div>
                  {sent ? (
                    <div className="flex items-center gap-3 px-6 py-4 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                      <CheckCircle size={24} />
                      <div>
                        <div className="font-semibold">Message Sent!</div>
                        <div className="text-sm">An administrator will respond shortly.</div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={!subject || !message}
                      className={clsx(
                        "w-full px-6 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-3",
                        subject && message
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      <Send size={20} />
                      Send Message to Administrators
                    </button>
                  )}
                </div>

                {/* Help Text */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Response Time:</strong> Administrators typically respond within 2-4 hours. 
                    For urgent medical concerns, please call 911 or contact the primary care physician directly.
                  </p>
                </div>

              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
