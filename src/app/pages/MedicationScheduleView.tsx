import React from 'react';
import { Pill, Calendar, Clock, AlertCircle, Info } from 'lucide-react';
import { clsx } from 'clsx';

/**
 * MEDICATION SCHEDULE (VIEW-ONLY FOR CAREGIVERS)
 * 
 * Caregivers can view medication schedules but cannot edit them.
 * This prevents accidental misconfiguration while keeping them informed.
 */

interface MedicationScheduleItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  compartment?: string;
  instructions?: string;
}

// Mock data - in production, this would come from database
const MOCK_SCHEDULE: MedicationScheduleItem[] = [
  {
    id: '1',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    times: ['9:00 AM'],
    compartment: 'A1',
    instructions: 'Take with water'
  },
  {
    id: '2',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    times: ['9:00 AM', '6:00 PM'],
    compartment: 'B2',
    instructions: 'Take with meals'
  },
  {
    id: '3',
    name: 'Atorvastatin',
    dosage: '20mg',
    frequency: 'Once daily',
    times: ['9:00 PM'],
    compartment: 'C3',
    instructions: 'Take at bedtime'
  }
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function MedicationScheduleView() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="text-blue-600" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Medication Schedule</h1>
                <p className="text-slate-600">View current medication schedule (read-only)</p>
              </div>
            </div>
            
            {/* View-Only Badge */}
            <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-semibold flex items-center gap-2">
              <Info size={18} />
              <span>View Only</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
        
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex gap-4">
            <AlertCircle className="text-blue-600 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">About This View</h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                You're viewing the current medication schedule in <strong>read-only mode</strong>. 
                To request changes to medication schedules or dosages, please contact your household administrator. 
                Only administrators can modify medication settings to prevent accidental misconfiguration.
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Schedule Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock size={24} className="text-blue-600" />
              Weekly Schedule
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Day
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Morning (9:00 AM)
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Evening (6:00 PM)
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Night (9:00 PM)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {DAYS.map((day, index) => (
                  <tr key={day} className={clsx(
                    "hover:bg-slate-50 transition-colors",
                    index === new Date().getDay() - 1 && "bg-blue-50"
                  )}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {day}
                        {index === new Date().getDay() - 1 && (
                          <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">
                            Today
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-slate-700">Lisinopril 10mg</div>
                        <div className="text-sm font-medium text-slate-700">Metformin 500mg</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-700">Metformin 500mg</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-700">Atorvastatin 20mg</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Medication Details */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Pill size={24} className="text-blue-600" />
              Medication Details
            </h2>
          </div>

          <div className="divide-y divide-slate-200">
            {MOCK_SCHEDULE.map((med) => (
              <div key={med.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{med.name}</h3>
                    <p className="text-sm text-slate-600">{med.dosage} • {med.frequency}</p>
                  </div>
                  {med.compartment && (
                    <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm">
                      Compartment {med.compartment}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Scheduled Times:</p>
                    <div className="flex flex-wrap gap-2">
                      {med.times.map((time) => (
                        <span
                          key={time}
                          className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium"
                        >
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>

                  {med.instructions && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-2">Instructions:</p>
                      <p className="text-sm text-slate-600">{med.instructions}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Need Changes Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex gap-4">
            <AlertCircle className="text-amber-600 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">Need to Update Medications?</h3>
              <p className="text-amber-800 text-sm leading-relaxed mb-3">
                Only administrators can add, edit, or remove medications. If you notice any discrepancies 
                or need to request medication changes, please contact your household administrator.
              </p>
              <a
                href="/contact-admin"
                className="inline-block px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
              >
                Contact Administrator
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
