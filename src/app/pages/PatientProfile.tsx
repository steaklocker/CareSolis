import { useState } from 'react';
import { User, Calendar, Heart, Phone, FileText, AlertCircle, Shield, Edit2, Save, X } from 'lucide-react';
import { clsx } from 'clsx';
import { PageHeader } from '../components/PageHeader';
import { toast } from 'sonner';

interface PatientInfo {
  name: string;
  photo?: string;
  dateOfBirth: string;
  medicalRecordNumber: string;
  primaryPhysician: string;
  physicianPhone: string;
  insuranceProvider: string;
  policyNumber: string;
  emergencyContact: string;
  emergencyPhone: string;
  allergies: string[];
  conditions: string[];
  medications: string[];
}

interface MedicalEvent {
  id: string;
  date: string;
  type: 'hospitalization' | 'medication_change' | 'diagnosis' | 'procedure';
  title: string;
  description: string;
  documents?: string[];
}

export default function PatientProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPatient, setEditedPatient] = useState<PatientInfo>({
    name: 'Eleanor Whitmore',
    dateOfBirth: '1940-03-15',
    medicalRecordNumber: 'MRN-584729',
    primaryPhysician: 'Dr. Sarah Chen, MD',
    physicianPhone: '(555) 234-5678',
    insuranceProvider: 'Medicare Advantage',
    policyNumber: 'MA-9847562',
    emergencyContact: 'Michael Whitmore (Son)',
    emergencyPhone: '(555) 123-4567',
    allergies: ['Penicillin', 'Sulfa drugs', 'Shellfish'],
    conditions: ['Hypertension', 'Type 2 Diabetes', 'Osteoarthritis', 'Mild Cognitive Impairment'],
    medications: ['Metformin 500mg', 'Lisinopril 10mg', 'Atorvastatin 20mg', 'Acetaminophen 500mg']
  });
  const [patient, setPatient] = useState<PatientInfo>(editedPatient);

  const handleSave = () => {
    setPatient(editedPatient);
    setIsEditing(false);
    toast.success('Patient profile updated successfully');
  };

  const handleCancel = () => {
    setEditedPatient(patient);
    setIsEditing(false);
  };

  const updateField = (field: keyof PatientInfo, value: any) => {
    setEditedPatient(prev => ({ ...prev, [field]: value }));
  };

  const [medicalHistory, setMedicalHistory] = useState<MedicalEvent[]>([
    {
      id: '1',
      date: '2025-12-15',
      type: 'medication_change',
      title: 'Medication Adjustment',
      description: 'Increased Lisinopril from 5mg to 10mg for better BP control',
      documents: ['prescription-12-15-2025.pdf']
    },
    {
      id: '2',
      date: '2025-11-03',
      type: 'hospitalization',
      title: 'Hospital Admission',
      description: 'Admitted for dehydration and electrolyte imbalance. Discharged after 2 days.',
      documents: ['discharge-summary-11-05-2025.pdf']
    },
    {
      id: '3',
      date: '2025-09-20',
      type: 'diagnosis',
      title: 'New Diagnosis',
      description: 'Mild Cognitive Impairment diagnosed during routine cognitive screening',
      documents: ['cognitive-assessment-09-20-2025.pdf']
    }
  ]);

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const eventTypeColors = {
    hospitalization: 'bg-red-100 text-red-700 border-red-200',
    medication_change: 'bg-blue-100 text-blue-700 border-blue-200',
    diagnosis: 'bg-purple-100 text-purple-700 border-purple-200',
    procedure: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  };

  const eventTypeLabels = {
    hospitalization: 'Hospitalization',
    medication_change: 'Medication Change',
    diagnosis: 'Diagnosis',
    procedure: 'Procedure'
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Patient Profile"
          subtitle="Complete medical information and history"
          rightAction={
            isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  <X size={18} />
                  <span className="hidden sm:inline">Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Save size={18} />
                  <span className="hidden sm:inline">Save</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <Edit2 size={18} />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Patient Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mb-3">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h2 className="text-xl font-bold text-slate-900">{patient.name}</h2>
                <p className="text-slate-600">{calculateAge(patient.dateOfBirth)} years old</p>
                <p className="text-sm text-slate-500">DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <FileText size={16} className="text-slate-400" />
                  <span className="font-medium">MRN:</span>
                  <span>{patient.medicalRecordNumber}</span>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-50 rounded-xl border-2 border-red-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={20} className="text-red-600" />
                <h3 className="font-bold text-red-900">Emergency Contact</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-red-900">{patient.emergencyContact}</p>
                <p className="text-red-700 flex items-center gap-2">
                  <Phone size={14} />
                  {patient.emergencyPhone}
                </p>
              </div>
            </div>

            {/* Critical Allergies */}
            <div className="bg-amber-50 rounded-xl border-2 border-amber-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={20} className="text-amber-600" />
                <h3 className="font-bold text-amber-900">Allergies</h3>
              </div>
              <div className="space-y-2">
                {patient.allergies.map((allergy, idx) => (
                  <div key={idx} className="bg-amber-100 border border-amber-300 rounded-lg px-3 py-2 text-sm font-semibold text-amber-900">
                    {allergy}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Medical Provider Info */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <User size={20} className="text-indigo-600" />
                Healthcare Provider
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase block mb-2">Primary Physician</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedPatient.primaryPhysician}
                      onChange={(e) => updateField('primaryPhysician', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-slate-100 font-medium">{patient.primaryPhysician}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase block mb-2">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedPatient.physicianPhone}
                      onChange={(e) => updateField('physicianPhone', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-slate-100 font-medium">{patient.physicianPhone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Insurance Info */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Shield size={20} className="text-emerald-600" />
                Insurance Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase block mb-2">Provider</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedPatient.insuranceProvider}
                      onChange={(e) => updateField('insuranceProvider', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-slate-100 font-medium">{patient.insuranceProvider}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase block mb-2">Policy Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedPatient.policyNumber}
                      onChange={(e) => updateField('policyNumber', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-slate-100 font-medium">{patient.policyNumber}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Current Conditions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Heart size={20} className="text-rose-600" />
                Current Conditions
              </h3>
              <div className="flex flex-wrap gap-2">
                {patient.conditions.map((condition, idx) => (
                  <span key={idx} className="bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-rose-200">
                    {condition}
                  </span>
                ))}
              </div>
            </div>

            {/* Current Medications */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-blue-600" />
                Current Medications
              </h3>
              <div className="space-y-2">
                {patient.medications.map((medication, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-slate-900 font-medium">{medication}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Medical History Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-purple-600" />
                Medical History Timeline
              </h3>
              <div className="space-y-4">
                {medicalHistory.map((event) => (
                  <div key={event.id} className="flex gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="text-center shrink-0">
                      <div className="w-16 text-xs font-bold text-slate-600">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(event.date).getFullYear()}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className={clsx(
                            "inline-block px-2 py-1 text-xs font-semibold rounded border mb-2",
                            eventTypeColors[event.type]
                          )}>
                            {eventTypeLabels[event.type]}
                          </span>
                          <h4 className="font-semibold text-slate-900">{event.title}</h4>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{event.description}</p>
                      {event.documents && event.documents.length > 0 && (
                        <div className="flex gap-2">
                          {event.documents.map((doc, idx) => (
                            <button
                              key={idx}
                              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                            >
                              <FileText size={14} />
                              {doc}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}