import React from 'react';
import { User, ShieldAlert, Phone, Mail } from 'lucide-react';
import { clsx } from 'clsx';

export interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  priority: number;
}

interface ContactsProps {
  contacts?: Contact[];
}

export function Contacts({ contacts = [] }: ContactsProps) {
  // Fallback if no contacts passed, but ideally should be passed from parent
  const displayContacts = contacts.length > 0 ? contacts : [
    { id: '1', name: 'Martha Kane', role: 'Escalation Contact 1', phone: '+1 (555) 012-3456', email: 'm.kane@example.com', priority: 1 },
    { id: '2', name: 'David Smith', role: 'Escalation Contact 2', phone: '+1 (555) 012-7890', email: 'david.s@example.com', priority: 2 },
    { id: '3', name: 'Community Center', role: 'Escalation Contact 3', phone: '+1 (555) 012-1111', email: 'alerts@comm-center.org', priority: 3 },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 tracking-tight text-sm uppercase">Escalation Protocol</h3>
        <button className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          Manage
        </button>
      </div>
      <div className="space-y-3">
        {displayContacts.map((contact) => (
          <div key={contact.id} className="group flex items-center gap-4 p-4 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm transition-all">
            <div className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs shrink-0">
              {contact.priority}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{contact.name}</p>
                <span className={clsx("text-[10px] px-1.5 py-0.5 rounded-full border uppercase tracking-wider font-medium", 
                  contact.priority === 1 ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                )}>
                  {contact.role}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {contact.phone}
                </span>
                <span className="flex items-center gap-1 truncate">
                  <Mail className="w-3 h-3" /> {contact.email}
                </span>
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
               <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                 <ShieldAlert className="w-4 h-4" />
               </button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
        Escalation halts after confirmation. No infinite loops.
      </p>
    </div>
  );
}