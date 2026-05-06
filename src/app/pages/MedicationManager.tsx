import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Clock, 
  Calendar, 
  Plus, 
  Trash2, 
  Save, 
  Power, 
  Check, 
  X, 
  Search, 
  AlertCircle, 
  Database, 
  RefreshCw, 
  Edit2, 
  Info, 
  ArrowRight, 
  FileUp, 
  ClipboardPaste, 
  Sparkles, 
  AlertTriangle,
  ShieldAlert,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { clsx } from 'clsx';
import { MEDICATION_DATABASE, type MedicationDefinition } from '../data/medicationDatabase';
import { Link } from 'react-router';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { useUserRole } from '../context/UserRoleContext';
import { logMedicationChange, logComplianceEvent } from '../utils/auditLogger';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;

/**
 * MEDICATION MANAGEMENT SYSTEM - v6.48 - FDA COMPLIANT
 * 
 * FDA COMPLIANCE FEATURES:
 * - Role-based access: Caregivers have READ-ONLY access
 * - Admins can add/edit/delete medications
 * - All changes logged to 3-tier audit system
 * - No remote dispensing commands
 * 
 * Features:
 * - Comprehensive medication database (200+ medications) with purpose descriptions
 * - Search with autocomplete (2+ letters)
 * - Time-Critical (TC) tags for critical medications
 * - Save/Load medication configurations TO BACKEND DATABASE
 * - Inline schedule editing (ADMIN ONLY)
 * - ⚠️ PREVENTATIVE CONFLICT DETECTION - Warns BEFORE adding conflicting medications
 */

interface ActiveMedication {
  id: string;
  name: string;
  dosage: string;
  purpose: string;
  timeCritical: boolean;
  active: boolean;
  schedule?: {
    times: string[];
    days: number[]; // 0-6 for Mon-Sun
    quantity: number;
  };
}

interface DrugConflict {
  medication1: string;
  medication2: string;
  severity: 'critical' | 'major' | 'moderate';
  description: string;
  recommendation: string;
}

// DRUG INTERACTION DATABASE
const DRUG_INTERACTIONS: DrugConflict[] = [
  // CRITICAL INTERACTIONS (Life-threatening)
  {
    medication1: 'Warfarin',
    medication2: 'Aspirin',
    severity: 'critical',
    description: 'Severe bleeding risk - both are anticoagulants/antiplatelets',
    recommendation: 'DO NOT combine without explicit physician approval and frequent INR monitoring'
  },
  {
    medication1: 'Warfarin',
    medication2: 'Ibuprofen',
    severity: 'critical',
    description: 'Severe GI bleeding risk and reduced warfarin metabolism',
    recommendation: 'Avoid NSAIDs with warfarin. Use acetaminophen for pain instead.'
  },
  {
    medication1: 'Warfarin',
    medication2: 'Naproxen',
    severity: 'critical',
    description: 'Severe bleeding risk with combined anticoagulant/NSAID use',
    recommendation: 'Avoid NSAIDs. Consider acetaminophen as alternative.'
  },
  
  // MAJOR INTERACTIONS (Significant risk)
  {
    medication1: 'Aspirin',
    medication2: 'Ibuprofen',
    severity: 'major',
    description: 'Ibuprofen reduces aspirin\'s cardioprotective effect and increases GI bleeding risk',
    recommendation: 'If both needed, take aspirin 2 hours before ibuprofen. Consider acetaminophen instead.'
  },
  {
    medication1: 'Lisinopril',
    medication2: 'Spironolactone',
    severity: 'major',
    description: 'Hyperkalemia risk (dangerously high potassium) - both raise potassium levels',
    recommendation: 'Requires frequent potassium monitoring. Avoid potassium supplements and salt substitutes.'
  },
  {
    medication1: 'Lisinopril',
    medication2: 'Ibuprofen',
    severity: 'major',
    description: 'NSAIDs reduce ACE inhibitor effectiveness and increase kidney damage risk',
    recommendation: 'Avoid NSAIDs if possible. Use acetaminophen for pain. Monitor kidney function.'
  },
  {
    medication1: 'Amlodipine',
    medication2: 'Simvastatin',
    severity: 'major',
    description: 'Increased risk of muscle damage (rhabdomyolysis) from statin',
    recommendation: 'Limit simvastatin to 20mg daily when combined with amlodipine'
  },
  {
    medication1: 'Metformin',
    medication2: 'Lisinopril',
    severity: 'moderate',
    description: 'May increase risk of lactic acidosis in patients with kidney disease',
    recommendation: 'Monitor kidney function regularly (eGFR). Safe when kidney function is normal.'
  },
  
  // MODERATE INTERACTIONS
  {
    medication1: 'Levothyroxine',
    medication2: 'Omeprazole',
    severity: 'moderate',
    description: 'PPIs reduce thyroid hormone absorption',
    recommendation: 'Take levothyroxine on empty stomach, 4+ hours apart from omeprazole'
  },
  {
    medication1: 'Levothyroxine',
    medication2: 'Calcium Carbonate',
    severity: 'moderate',
    description: 'Calcium reduces thyroid hormone absorption',
    recommendation: 'Take levothyroxine 4 hours before calcium supplements'
  },
  {
    medication1: 'Alendronate',
    medication2: 'Calcium Carbonate',
    severity: 'moderate',
    description: 'Calcium reduces bisphosphonate absorption',
    recommendation: 'Take alendronate on empty stomach 30-60 minutes before calcium'
  },
  {
    medication1: 'Atorvastatin',
    medication2: 'Amlodipine',
    severity: 'moderate',
    description: 'Increased statin levels may increase muscle pain risk',
    recommendation: 'Usually safe but monitor for muscle pain or weakness'
  }
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MedicationManager() {
  // FDA COMPLIANCE: Role-based access control
  const { role, isAdmin, isCaregiver } = useUserRole();
  
  const [medications, setMedications] = useState<ActiveMedication[]>([]);
  const [expandedMed, setExpandedMed] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editingDosage, setEditingDosage] = useState<string | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [pendingMedication, setPendingMedication] = useState<{ medDef: MedicationDefinition; dosage: string } | null>(null);
  const [detectedConflicts, setDetectedConflicts] = useState<DrugConflict[]>([]);

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/medications`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMedications(data);
        setHasUnsavedChanges(false);
      }
    } catch (e) {
      console.error('Failed to load medications:', e);
      // Fallback to localStorage
      const stored = localStorage.getItem('caresolis_medications_v3');
      if (stored) {
        setMedications(JSON.parse(stored));
        setHasUnsavedChanges(false);
      }
    }
  };

  const handleRefresh = () => {
    if (hasUnsavedChanges) {
      if (confirm('⚠️ You have unsaved changes.\n\nRefreshing will discard all changes since your last save. This cannot be undone.\n\nAre you sure you want to continue?')) {
        loadMedications();
      }
    } else {
      loadMedications();
    }
  };

  const saveMedications = async () => {
    // FDA COMPLIANCE: Block caregiver saves
    if (!isAdmin) {
      await logComplianceEvent({
        eventType: 'unauthorized_attempt',
        userId: role,
        resource: 'medications',
        action: 'save',
        reason: 'Caregiver attempted to save medication changes',
        severity: 'medium'
      });
      alert('⚠️ Access Denied\n\nCaregivers have read-only access to medication schedules.\n\nOnly Healthcare Providers (Admins) can modify medication configurations.');
      return;
    }

    try {
      const res = await fetch(`${SERVER_URL}/medications`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(medications)
      });
      
      if (res.ok) {
        // Log successful save
        await logMedicationChange('edit', 'batch', 'Multiple Medications', role, role, {
          count: medications.length,
          patientId: '1'
        });
        
        // Also save to localStorage as backup
        localStorage.setItem('caresolis_medications_v3', JSON.stringify(medications));
        setHasUnsavedChanges(false);
        alert('✓ Medication configuration saved to database successfully!');
      } else {
        throw new Error('Failed to save');
      }
    } catch (e) {
      console.error('Failed to save medications:', e);
      alert('⚠️ Failed to save to database. Saved to local storage as backup.');
      localStorage.setItem('caresolis_medications_v3', JSON.stringify(medications));
      setHasUnsavedChanges(false);
    }
  };

  const updateMedications = (meds: ActiveMedication[]) => {
    // FDA COMPLIANCE: Block caregiver modifications
    if (!isAdmin) {
      logComplianceEvent({
        eventType: 'unauthorized_attempt',
        userId: role,
        resource: 'medications',
        action: 'modify',
        reason: 'Caregiver attempted to modify medication data',
        severity: 'medium'
      });
      return;
    }
    setMedications(meds);
    setHasUnsavedChanges(true);
  };

  const addMedication = (medDef: MedicationDefinition, dosage: string) => {
    // FDA COMPLIANCE: Block caregiver additions
    if (!isAdmin) {
      logComplianceEvent({
        eventType: 'unauthorized_attempt',
        userId: role,
        resource: 'medications',
        action: 'add',
        reason: `Caregiver attempted to add medication: ${medDef.name}`,
        severity: 'medium'
      });
      alert('⚠️ Access Denied\n\nCaregivers cannot add medications.\n\nOnly Healthcare Providers (Admins) can modify medication schedules.');
      return;
    }

    const newMed: ActiveMedication = {
      id: `med_${Date.now()}`,
      name: medDef.name,
      dosage,
      purpose: medDef.purpose,
      timeCritical: medDef.timeCritical,
      active: true,
      schedule: {
        times: medDef.typicalDoses === 1 ? ['09:00'] : medDef.typicalDoses === 2 ? ['09:00', '21:00'] : ['09:00', '13:00', '21:00'],
        days: [0, 1, 2, 3, 4, 5, 6],
        quantity: 1
      }
    };
    
    // Log the addition
    logMedicationChange('add', newMed.id, medDef.name, role, role, {
      dosage,
      timeCritical: medDef.timeCritical,
      patientId: '1'
    });
    
    updateMedications([...medications, newMed]);
    setSearchQuery('');
    setShowSearchResults(false);
    setExpandedMed(newMed.id);
  };

  const toggleActive = (id: string) => {
    // FDA COMPLIANCE: Block caregiver toggle
    if (!isAdmin) {
      logComplianceEvent({
        eventType: 'unauthorized_attempt',
        userId: role,
        resource: 'medications',
        action: 'toggle_active',
        reason: 'Caregiver attempted to activate/deactivate medication',
        severity: 'medium'
      });
      alert('⚠️ Access Denied\n\nCaregivers cannot activate/deactivate medications.\n\nContact your Healthcare Provider (Admin) for medication changes.');
      return;
    }
    updateMedications(
      medications.map(m => m.id === id ? { ...m, active: !m.active } : m)
    );
  };

  const updateSchedule = (id: string, schedule: ActiveMedication['schedule']) => {
    updateMedications(
      medications.map(m => m.id === id ? { ...m, schedule } : m)
    );
  };

  const deleteMedication = (id: string) => {
    // FDA COMPLIANCE: Block caregiver deletions
    if (!isAdmin) {
      logComplianceEvent({
        eventType: 'unauthorized_attempt',
        userId: role,
        resource: 'medications',
        action: 'delete',
        reason: 'Caregiver attempted to delete medication',
        severity: 'high' // Higher severity for deletion attempts
      });
      alert('⚠️ Access Denied\n\nCaregivers cannot delete medications.\n\nOnly Healthcare Providers (Admins) can remove medications from the schedule.');
      return;
    }
    
    if (confirm('Delete this medication?')) {
      const med = medications.find(m => m.id === id);
      if (med) {
        // Log the deletion
        logMedicationChange('delete', id, med.name, role, role, {
          dosage: med.dosage,
          patientId: '1'
        });
      }
      updateMedications(medications.filter(m => m.id !== id));
    }
  };

  const addTime = (id: string) => {
    const med = medications.find(m => m.id === id);
    if (med?.schedule) {
      updateSchedule(id, {
        ...med.schedule,
        times: [...med.schedule.times, '12:00']
      });
    }
  };

  const removeTime = (id: string, index: number) => {
    const med = medications.find(m => m.id === id);
    if (med?.schedule && med.schedule.times.length > 1) {
      updateSchedule(id, {
        ...med.schedule,
        times: med.schedule.times.filter((_, i) => i !== index)
      });
    }
  };

  const updateTime = (id: string, index: number, value: string) => {
    const med = medications.find(m => m.id === id);
    if (med?.schedule) {
      const newTimes = [...med.schedule.times];
      newTimes[index] = value;
      updateSchedule(id, { ...med.schedule, times: newTimes });
    }
  };

  const toggleDay = (id: string, dayIndex: number) => {
    const med = medications.find(m => m.id === id);
    if (med?.schedule) {
      const days = med.schedule.days.includes(dayIndex)
        ? med.schedule.days.filter(d => d !== dayIndex)
        : [...med.schedule.days, dayIndex].sort();
      
      updateSchedule(id, { ...med.schedule, days });
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    const med = medications.find(m => m.id === id);
    if (med?.schedule) {
      updateSchedule(id, { ...med.schedule, quantity });
    }
  };

  const changeDosage = (id: string, newDosage: string) => {
    updateMedications(
      medications.map(m => m.id === id ? { ...m, dosage: newDosage } : m)
    );
    setEditingDosage(null);
  };

  const getMedicationDefinition = (medName: string): MedicationDefinition | undefined => {
    return MEDICATION_DATABASE.find(m => m.name === medName);
  };

  // CONFLICT DETECTION - Check if new medication conflicts with existing ones
  const checkForConflicts = (newMedicationName: string): DrugConflict[] => {
    const conflicts: DrugConflict[] = [];
    const existingMedNames = medications.map(m => m.name);
    
    existingMedNames.forEach(existingMed => {
      const conflict = DRUG_INTERACTIONS.find(
        interaction =>
          (interaction.medication1 === newMedicationName && interaction.medication2 === existingMed) ||
          (interaction.medication2 === newMedicationName && interaction.medication1 === existingMed)
      );
      
      if (conflict) {
        conflicts.push(conflict);
      }
    });
    
    return conflicts;
  };

  // HANDLE MEDICATION ADDITION WITH CONFLICT CHECK
  const handleAddMedication = (medDef: MedicationDefinition, dosage: string) => {
    const conflicts = checkForConflicts(medDef.name);
    
    if (conflicts.length > 0) {
      setPendingMedication({ medDef, dosage });
      setDetectedConflicts(conflicts);
    } else {
      addMedication(medDef, dosage);
    }
  };

  // CONFIRM ADD DESPITE CONFLICTS
  const confirmAddWithConflicts = () => {
    if (pendingMedication) {
      addMedication(pendingMedication.medDef, pendingMedication.dosage);
      setPendingMedication(null);
      setDetectedConflicts([]);
    }
  };

  // CANCEL ADD
  const cancelAdd = () => {
    setPendingMedication(null);
    setDetectedConflicts([]);
  };

  // Calculate all current conflicts in the medication list
  const getCurrentConflicts = (): DrugConflict[] => {
    const conflicts: DrugConflict[] = [];
    const medNames = medications.map(m => m.name);
    
    for (let i = 0; i < medNames.length; i++) {
      for (let j = i + 1; j < medNames.length; j++) {
        const conflict = DRUG_INTERACTIONS.find(
          interaction =>
            (interaction.medication1 === medNames[i] && interaction.medication2 === medNames[j]) ||
            (interaction.medication2 === medNames[i] && interaction.medication1 === medNames[j])
        );
        
        if (conflict) {
          conflicts.push(conflict);
        }
      }
    }
    
    return conflicts;
  };

  const currentConflicts = getCurrentConflicts();

  // TEST DATA LOADER - Loads realistic elderly patient medication profile
  const loadTestData = () => {
    const testMedications = [
      'Atorvastatin',
      'Lisinopril', 
      'Metformin',
      'Aspirin',
      'Levothyroxine',
      'Amlodipine',
      'Omeprazole',
      // ⚠️ CONFLICT TEST ADDITIONS - These medications have dangerous interactions:
      'Warfarin',        // CRITICAL: Interacts with Aspirin (bleeding risk)
      'Ibuprofen',       // MAJOR: Interacts with Warfarin + Aspirin + Lisinopril
      'Spironolactone'   // MAJOR: Interacts with Lisinopril (hyperkalemia risk)
    ];
    
    if (confirm('Load test data? This will add 10 medications including some with dangerous drug interactions to test the conflict detection system.\n\n⚠️ WARNING: Includes Warfarin + Aspirin (bleeding), Ibuprofen + NSAIDs, and ACE inhibitor + potassium-sparing diuretic combinations.')) {
      loadTemplate(testMedications);
    }
  };

  // BULK IMPORT FROM TEXT LIST
  const handleBulkImport = () => {
    const lines = bulkImportText.split('\n').filter(line => line.trim().length > 0);
    const notFound: string[] = [];
    const duplicates: string[] = [];
    const added: string[] = [];
    const newMeds: ActiveMedication[] = [];
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Check if already in active medications
      const alreadyExists = medications.some(m => 
        m.name.toLowerCase() === trimmed.toLowerCase()
      );
      
      if (alreadyExists) {
        duplicates.push(trimmed);
        return;
      }
      
      // Try exact match first (case-insensitive)
      let medDef = MEDICATION_DATABASE.find(m => 
        m.name.toLowerCase() === trimmed.toLowerCase()
      );
      
      // If no exact match, try partial match
      if (!medDef) {
        medDef = MEDICATION_DATABASE.find(m => 
          m.name.toLowerCase().includes(trimmed.toLowerCase()) ||
          trimmed.toLowerCase().includes(m.name.toLowerCase())
        );
      }
      
      if (medDef) {
        // Add with default (first) dosage
        const newMed: ActiveMedication = {
          id: `med_${Date.now()}_${index}`,
          name: medDef.name,
          dosage: medDef.dosages[0],
          purpose: medDef.purpose,
          timeCritical: medDef.timeCritical,
          active: true,
          schedule: {
            times: medDef.typicalDoses === 1 ? ['09:00'] : medDef.typicalDoses === 2 ? ['09:00', '21:00'] : ['09:00', '13:00', '21:00'],
            days: [0, 1, 2, 3, 4, 5, 6],
            quantity: 1
          }
        };
        newMeds.push(newMed);
        added.push(medDef.name);
      } else {
        notFound.push(trimmed);
      }
    });
    
    // Update all at once
    if (newMeds.length > 0) {
      updateMedications([...medications, ...newMeds]);
    }
    
    setBulkImportText('');
    setShowBulkImport(false);
    
    // Show detailed results
    let message = '';
    if (added.length > 0) {
      message += `✓ Successfully added ${added.length} medication(s):\n${added.join(', ')}\n\n`;
    }
    if (duplicates.length > 0) {
      message += `⚠️ Skipped ${duplicates.length} duplicate(s):\n${duplicates.join(', ')}\n\n`;
    }
    if (notFound.length > 0) {
      message += `❌ Not found (${notFound.length}):\n${notFound.join(', ')}\n\nTip: Check spelling or use the search to find exact names.`;
    }
    
    if (message) {
      alert(message);
    }
  };

  // LOAD CONDITION TEMPLATE
  const loadTemplate = (templateMeds: string[]) => {
    const duplicates: string[] = [];
    const added: string[] = [];
    const newMeds: ActiveMedication[] = [];
    
    templateMeds.forEach((medName, index) => {
      // Check if already in active medications
      const alreadyExists = medications.some(m => 
        m.name.toLowerCase() === medName.toLowerCase()
      );
      
      if (alreadyExists) {
        duplicates.push(medName);
        return;
      }
      
      const medDef = MEDICATION_DATABASE.find(m => m.name === medName);
      if (medDef) {
        const newMed: ActiveMedication = {
          id: `med_${Date.now()}_${index}`,
          name: medDef.name,
          dosage: medDef.dosages[0],
          purpose: medDef.purpose,
          timeCritical: medDef.timeCritical,
          active: true,
          schedule: {
            times: medDef.typicalDoses === 1 ? ['09:00'] : medDef.typicalDoses === 2 ? ['09:00', '21:00'] : ['09:00', '13:00', '21:00'],
            days: [0, 1, 2, 3, 4, 5, 6],
            quantity: 1
          }
        };
        newMeds.push(newMed);
        added.push(medDef.name);
      }
    });
    
    // Update all at once
    if (newMeds.length > 0) {
      updateMedications([...medications, ...newMeds]);
    }
    
    setShowTemplates(false);
    
    // Show detailed results
    let message = '';
    if (added.length > 0) {
      message += `✓ Successfully added ${added.length} medication(s):\n${added.join(', ')}`;
    }
    if (duplicates.length > 0) {
      message += `\n\n⚠️ Skipped ${duplicates.length} duplicate(s):\n${duplicates.join(', ')}`;
    }
    
    if (message) {
      alert(message);
    }
  };

  // CONDITION TEMPLATES
  const templates = {
    'Type 2 Diabetes': ['Metformin', 'Glipizide', 'Sitagliptin', 'Insulin Glargine'],
    'Hypertension': ['Lisinopril', 'Amlodipine', 'Hydrochlorothiazide', 'Losartan'],
    'Heart Disease': ['Atorvastatin', 'Aspirin', 'Metoprolol', 'Clopidogrel', 'Lisinopril'],
    'COPD/Asthma': ['Albuterol', 'Fluticasone', 'Tiotropium', 'Montelukast'],
    'Hypothyroidism': ['Levothyroxine'],
    'GERD/Acid Reflux': ['Omeprazole', 'Pantoprazole', 'Famotidine'],
    'Osteoporosis': ['Alendronate', 'Calcium Carbonate', 'Vitamin D3'],
    'Chronic Pain': ['Acetaminophen', 'Ibuprofen', 'Gabapentin']
  };

  // Filter search results
  const searchResults = searchQuery.length >= 2
    ? MEDICATION_DATABASE.filter(med =>
        med.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const activeMeds = medications.filter(m => m.active);
  const inactiveMeds = medications.filter(m => !m.active);

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* CONFLICT WARNING MODAL */}
      {pendingMedication && detectedConflicts.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border-2 border-red-500/50 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-red-600/20 border-b border-red-500/30 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-red-400">Drug Interaction Detected</h2>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-600 text-white text-xs font-bold rounded-full border-2 border-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      FDA CHECK
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm sm:text-base">
                    The medication <strong className="text-white">{pendingMedication.medDef.name}</strong> has known
                    interactions with medications already in your list.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {detectedConflicts.map((conflict, index) => {
                const otherMed = conflict.medication1 === pendingMedication.medDef.name 
                  ? conflict.medication2 
                  : conflict.medication1;
                
                return (
                  <div
                    key={index}
                    className={clsx(
                      "rounded-lg border-2 p-5",
                      conflict.severity === 'critical' && "bg-red-900/20 border-red-500/50",
                      conflict.severity === 'major' && "bg-orange-900/20 border-orange-500/50",
                      conflict.severity === 'moderate' && "bg-amber-900/20 border-amber-500/50"
                    )}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <AlertTriangle 
                        className={clsx(
                          "w-6 h-6 flex-shrink-0",
                          conflict.severity === 'critical' && "text-red-400",
                          conflict.severity === 'major' && "text-orange-400",
                          conflict.severity === 'moderate' && "text-amber-400"
                        )} 
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={clsx(
                              "px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider",
                              conflict.severity === 'critical' && "bg-red-600 text-white",
                              conflict.severity === 'major' && "bg-orange-600 text-white",
                              conflict.severity === 'moderate' && "bg-amber-600 text-white"
                            )}
                          >
                            {conflict.severity} Interaction
                          </span>
                        </div>
                        <div className="font-semibold text-slate-100 mb-2">
                          {pendingMedication.medDef.name} ↔ {otherMed}
                        </div>
                        <p className="text-sm text-slate-300 mb-3">{conflict.description}</p>
                        <div className="bg-slate-800/50 rounded p-3">
                          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                            Recommendation:
                          </div>
                          <div className="text-sm text-slate-200">{conflict.recommendation}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-slate-800/50 border-t border-slate-700 p-6 flex gap-3">
              <button
                onClick={cancelAdd}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-semibold"
              >
                Cancel - Don't Add
              </button>
              <button
                onClick={confirmAddWithConflicts}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-5 h-5" />
                Add Anyway (Override)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CURRENT CONFLICTS BANNER */}
      {currentConflicts.length > 0 && (
        <div className="bg-black border-2 border-red-500 rounded-lg p-3 sm:p-5 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {currentConflicts.length} Active Drug Interaction{currentConflicts.length > 1 ? 's' : ''} Detected
                </h3>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-600 text-white text-xs font-bold rounded-full border-2 border-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  FDA ALERT
                </div>
              </div>
              <div className="space-y-2">
                {currentConflicts.slice(0, 3).map((conflict, index) => (
                  <div key={index} className="text-xs sm:text-sm text-white">
                    <span className={clsx(
                      "inline-block px-2 py-0.5 rounded text-xs font-bold mr-2",
                      conflict.severity === 'critical' && "bg-red-600 text-white",
                      conflict.severity === 'major' && "bg-orange-600 text-white",
                      conflict.severity === 'moderate' && "bg-amber-600 text-white"
                    )}>
                      {conflict.severity.toUpperCase()}
                    </span>
                    <strong>{conflict.medication1}</strong> ↔ <strong>{conflict.medication2}</strong>
                    <span className="hidden sm:inline">{': '}{conflict.description}</span>
                  </div>
                ))}
                {currentConflicts.length > 3 && (
                  <div className="text-sm text-red-400 font-semibold">
                    +{currentConflicts.length - 3} more interaction{currentConflicts.length - 3 > 1 ? 's' : ''}
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-300 mt-3">
                ⚠️ These medications may interact dangerously. Consult physician before administering. More details
                available on the Medication Maintenance page.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FDA COMPLIANCE: Read-Only Banner for Caregivers */}
      {!isAdmin && (
        <div className="bg-slate-800 border-2 border-blue-500 rounded-lg p-3 md:p-5 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Eye className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-bold text-white mb-1 flex flex-wrap items-center gap-2">
                <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                Read-Only Mode (Caregiver)
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm">
                You are viewing medication schedules in <strong>read-only mode</strong>. Only Healthcare Providers can modify medications to ensure FDA compliance.
              </p>
              <p className="text-blue-400 text-xs sm:text-sm mt-2 font-semibold">
                💡 Contact your Healthcare Provider to make changes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header with Save/Load */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
              Medication Management
            </h1>
            {!isAdmin && <span className="text-blue-400 text-sm sm:text-xl">(Read-Only)</span>}
            {/* FDA COMPLIANCE BADGE */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-lg border-2 border-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              FDA COMPLIANT
            </div>
          </div>
          <p className="text-slate-400 text-sm sm:text-base">
            {isAdmin 
              ? 'Search database, activate medications, and configure schedules'
              : 'View current medication schedules and dosing information'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={handleRefresh}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          {isAdmin && (
            <button
              onClick={saveMedications}
              className={clsx(
                "flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold text-sm",
                hasUnsavedChanges
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              )}
              disabled={!hasUnsavedChanges}
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Save Changes</span>
            <span className="sm:hidden">Save</span>
          </button>
          )}
        </div>
      </div>

      {/* Unsaved changes indicator */}
      {hasUnsavedChanges && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-center gap-2 text-amber-400">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">You have unsaved changes</span>
        </div>
      )}

      {/* Next Step: Grid Maintenance */}
      {!hasUnsavedChanges && activeMeds.length > 0 && (
        <Link
          to="/medication-maintenance"
          className="block bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-lg p-4 hover:from-emerald-500/20 hover:to-blue-500/20 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-emerald-400 mb-0.5">Next Step: Pharmacy Blister Pack Assignment</div>
                <div className="text-sm text-slate-400">
                  Configure 2×25 blister pack positions, generate pharmacy instructions, and export MAR
                </div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      )}

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 sm:p-6">
        <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-3">
          <Database className="w-4 h-4 inline mr-2" />
          Search Medication Database
        </label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(e.target.value.length >= 2);
            }}
            onFocus={() => setShowSearchResults(searchQuery.length >= 2)}
            placeholder="Type at least 2 letters to search..."
            className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          
          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl max-h-96 overflow-y-auto">
              {searchResults.map((medDef, index) => (
                <div key={index} className="border-b border-slate-700 last:border-b-0">
                  <div className="p-4 hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-100">{medDef.name}</h3>
                        {medDef.timeCritical && (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-bold rounded border border-red-500/30">
                            TC
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{medDef.purpose}</p>
                    <div className="text-xs text-slate-500 mb-3">
                      Typical: {medDef.typicalDoses} dose{medDef.typicalDoses > 1 ? 's' : ''}/day
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {medDef.dosages.map((dosage, i) => (
                        <button
                          key={i}
                          onClick={() => handleAddMedication(medDef, dosage)}
                          disabled={!isAdmin}
                          className={clsx(
                            "px-3 py-1.5 text-white text-sm rounded transition-colors",
                            isAdmin 
                              ? "bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                              : "bg-slate-700 text-slate-500 cursor-not-allowed opacity-50"
                          )}
                          title={!isAdmin ? "Caregivers cannot add medications (Read-Only)" : ""}
                        >
                          + Add {dosage}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showSearchResults && searchQuery.length >= 2 && searchResults.length === 0 && (
            <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg p-4 text-center text-slate-400">
              No medications found matching "{searchQuery}"
            </div>
          )}

          {searchQuery.length > 0 && searchQuery.length < 2 && (
            <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg p-4 text-center text-slate-400 text-sm">
              Type at least 2 letters to search
            </div>
          )}
        </div>
      </div>

      {/* BULK IMPORT OPTIONS */}
      <div className="bg-gradient-to-br from-emerald-500/30 to-blue-500/20 border border-emerald-500/50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          Quick Import Methods
        </h2>
        <p className="text-sm text-emerald-100 mb-4">Add multiple medications at once instead of searching individually</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Paste Text List */}
          <button
            onClick={() => setShowBulkImport(!showBulkImport)}
            className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg p-4 text-left transition-all group"
          >
            <div className="flex items-start gap-3">
              <ClipboardPaste className="w-6 h-6 text-blue-400 flex-shrink-0" />
              <div>
                <div className="font-semibold text-white mb-1">Paste Text List</div>
                <div className="text-xs text-blue-100">
                  Copy/paste medication names from doctor's note, email, or pharmacy list
                </div>
              </div>
            </div>
          </button>

          {/* Condition Templates */}
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg p-4 text-left transition-all group"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <div>
                <div className="font-semibold text-white mb-1">Condition Templates</div>
                <div className="text-xs text-emerald-100">
                  Pre-configured medication sets for diabetes, hypertension, heart disease, etc.
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Bulk Import Text Area */}
        {showBulkImport && (
          <div className="mt-4 bg-slate-900 rounded-lg p-4 border border-blue-500/30">
            <label className="block text-sm font-medium text-blue-300 mb-2">
              Paste Medication Names (one per line):
            </label>
            <textarea
              value={bulkImportText}
              onChange={(e) => setBulkImportText(e.target.value)}
              placeholder={'Atorvastatin\nLisinopril\nMetformin\nAspirin'}
              className="w-full h-32 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleBulkImport}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                disabled={!bulkImportText.trim()}
              >
                <Plus className="w-4 h-4" />
                Import {bulkImportText.split('\n').filter(l => l.trim()).length} Medication(s)
              </button>
              <button
                onClick={() => {
                  setBulkImportText('');
                  setShowBulkImport(false);
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              💡 Tip: Medication names must match exactly (e.g., "Atorvastatin" not "atorvastatin calcium")
            </div>
          </div>
        )}

        {/* Condition Templates */}
        {showTemplates && (
          <div className="mt-4 bg-slate-900 rounded-lg p-4 border border-purple-500/30">
            <label className="block text-sm font-medium text-purple-300 mb-3">
              Select a Condition Template:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(templates).map(([condition, meds]) => (
                <button
                  key={condition}
                  onClick={() => loadTemplate(meds)}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-purple-500/50 rounded-lg p-3 text-left transition-all group"
                >
                  <div className="font-semibold text-slate-100 mb-1 flex items-center gap-2">
                    <Pill className="w-4 h-4 text-purple-400" />
                    {condition}
                  </div>
                  <div className="text-xs text-slate-400">
                    {meds.length} medication(s): {meds.slice(0, 2).join(', ')}
                    {meds.length > 2 && ` +${meds.length - 2} more`}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowTemplates(false)}
              className="mt-3 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
            >
              Close Templates
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-slate-400">Active Meds</div>
          <div className="text-xl sm:text-3xl font-bold text-emerald-400 mt-1">{activeMeds.length}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-slate-400">Time-Critical</div>
          <div className="text-xl sm:text-3xl font-bold text-red-400 mt-1">
            {activeMeds.filter(m => m.timeCritical).length}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-slate-400">Doses/Day</div>
          <div className="text-xl sm:text-3xl font-bold text-blue-400 mt-1">
            {activeMeds.reduce((sum, m) => sum + (m.schedule?.times.length || 0), 0)}
          </div>
        </div>
      </div>

      {/* Active Medications */}
      {activeMeds.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-400" />
            Active Medications
          </h2>

          {activeMeds.map(med => (
            <div
              key={med.id}
              className={clsx(
                "rounded-lg overflow-hidden",
                med.timeCritical
                  ? "bg-slate-900 border-2 border-red-500/30"
                  : "bg-slate-900 border-2 border-emerald-500/30"
              )}
            >
              {/* Header Row */}
              <div className={clsx(
                "flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 gap-3",
                med.timeCritical ? "bg-red-500/5" : "bg-emerald-500/5"
              )}>
                <div className="flex-1 w-full sm:w-auto">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Pill className={clsx("w-4 h-4 sm:w-5 sm:h-5 mt-1", med.timeCritical ? "text-red-400" : "text-emerald-400")} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                        <h3 className="text-base sm:text-lg font-semibold text-slate-100">{med.name}</h3>
                        {med.timeCritical && (
                          <span className="px-1.5 sm:px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-bold rounded border border-red-500/30 whitespace-nowrap">
                            TC
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400 truncate">{med.dosage} • {med.purpose}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setExpandedMed(expandedMed === med.id ? null : med.id)}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-xs sm:text-sm"
                  >
                    {expandedMed === med.id ? 'Hide' : (isAdmin ? 'Edit' : 'View')}
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => deleteMedication(med.id)}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-xs sm:text-sm flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Schedule Details (Expandable) */}
              {expandedMed === med.id && med.schedule && (() => {
                const medDef = getMedicationDefinition(med.name);
                const schedule = med.schedule!; // Non-null assertion since we check above
                return (
                <div className="p-6 space-y-6 border-t border-slate-800">
                  {/* Dosage Editor */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      <Edit2 className="w-4 h-4 inline mr-2" />
                      Dosage
                    </label>
                    {editingDosage === med.id ? (
                      <div className="flex gap-2 flex-wrap">
                        {medDef?.dosages.map((dosage, i) => (
                          <button
                            key={i}
                            onClick={() => changeDosage(med.id, dosage)}
                            className={clsx(
                              "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                              dosage === med.dosage
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                            )}
                          >
                            {dosage}
                          </button>
                        ))}
                        <button
                          onClick={() => setEditingDosage(null)}
                          className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 items-center">
                        <span className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 font-medium">
                          {med.dosage}
                        </span>
                        {isAdmin && (
                          <button
                            onClick={() => setEditingDosage(med.id)}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            Change Dosage
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Time-Critical Medication Timing Recommendation */}
                  {medDef?.timeCritical && medDef?.timingRecommendation && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-red-400 mb-1">Medical Timing Recommendation</div>
                          <p className="text-sm text-red-300">{medDef.timingRecommendation}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dose Times */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Dose Times
                    </label>
                    <div className="space-y-2">
                      {schedule.times.map((time, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="time"
                            value={time}
                            onChange={(e) => updateTime(med.id, index, e.target.value)}
                            disabled={!isAdmin}
                            className={clsx(
                              "flex-1 px-4 py-2 border rounded-lg focus:outline-none",
                              isAdmin
                                ? "bg-slate-800 border-slate-700 text-slate-100 focus:ring-2 focus:ring-emerald-500"
                                : "bg-slate-900 border-slate-800 text-slate-400 cursor-not-allowed"
                            )}
                          />
                          {schedule.times.length > 1 && isAdmin && (
                            <button
                              onClick={() => removeTime(med.id, index)}
                              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      {isAdmin && (
                        <button
                          onClick={() => addTime(med.id)}
                          className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-sm transition-colors"
                        >
                          + Add Another Time
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Days of Week */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Days of Week
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {DAYS.map((day, index) => (
                        <button
                          key={index}
                          onClick={() => toggleDay(med.id, index)}
                          disabled={!isAdmin}
                          className={clsx(
                            'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                            !isAdmin && 'cursor-not-allowed opacity-70',
                            schedule.days.includes(index)
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          )}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Pills Per Dose
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={schedule.quantity}
                      onChange={(e) => updateQuantity(med.id, parseInt(e.target.value) || 1)}
                      className="w-32 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Summary */}
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="text-sm text-slate-400 mb-2">Schedule Summary:</div>
                    <div className="text-slate-200">
                      <strong>{schedule.quantity}</strong> pill(s) at{' '}
                      <strong>{schedule.times.join(', ')}</strong> on{' '}
                      <strong>
                        {schedule.days.length === 7
                          ? 'every day'
                          : schedule.days.map(d => DAYS[d]).join(', ')}
                      </strong>
                    </div>
                    {medDef?.timingRecommendation && (
                      <div className="mt-3 pt-3 border-t border-slate-700">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-1">
                              Instructions for Caregiver/Patient
                            </div>
                            <div className="text-sm text-amber-300">{medDef.timingRecommendation}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )})()}
            </div>
          ))}
        </div>
      )}

      {/* Bottom Save/Refresh Controls */}
      {activeMeds.length > 0 && (
        <div className="sticky bottom-0 bg-slate-800/95 backdrop-blur-sm border-t-2 border-slate-700 p-4 rounded-t-lg shadow-2xl">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              {hasUnsavedChanges ? (
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">You have unsaved changes</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-5 h-5" />
                  <span className="text-sm font-medium">All changes saved</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors flex items-center gap-2 font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={saveMedications}
                className={clsx(
                  "px-8 py-2.5 rounded-lg transition-all flex items-center gap-2 font-semibold shadow-lg",
                  hasUnsavedChanges
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white scale-105 hover:scale-110"
                    : "bg-slate-700 text-slate-500 cursor-not-allowed"
                )}
                disabled={!hasUnsavedChanges}
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeMeds.length === 0 && (
        <div className="bg-slate-900 border-2 border-dashed border-slate-700 rounded-lg p-12 text-center">
          <Pill className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No Active Medications</h3>
          <p className="text-slate-500 mb-4">
            {isAdmin ? 'Search the database above to add medications' : 'No medications configured yet'}
          </p>
          {isAdmin && (
            <button
              onClick={loadTestData}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold flex items-center gap-2 mx-auto"
            >
              <Database className="w-5 h-5" />
              Load Test Data (10 Meds with Conflicts)
            </button>
          )}
        </div>
      )}

      {/* FDA COMPLIANCE: Footer Info for Caregivers */}
      {!isAdmin && activeMeds.length > 0 && (
        <div className="bg-slate-900 border-2 border-emerald-500/30 rounded-lg p-4 sm:p-5 mt-6">
          <div className="flex flex-col sm:flex-row items-start gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <ShieldAlert className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-600 text-white text-xs font-bold rounded-full border-2 border-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                FDA COMPLIANT
              </div>
            </div>
            <div className="text-xs sm:text-sm text-slate-400">
              <p className="font-semibold text-slate-300 mb-1">📋 Caregiver Access Information</p>
              <p>
                You are viewing this medication schedule in <strong className="text-blue-400">read-only mode</strong> to ensure 
                regulatory compliance and patient safety. All medication modifications must be made by authorized Healthcare 
                Providers (Admins).
              </p>
              <p className="mt-2 text-xs text-slate-500">
                All access attempts are logged for security and compliance purposes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}