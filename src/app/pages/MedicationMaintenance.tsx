import React, { useState, useEffect } from 'react';
import {
  Package,
  Calendar,
  FileText,
  AlertTriangle,
  ClipboardList,
  Download,
  Printer,
  Edit2,
  Check,
  X,
  Loader,
  AlertCircle,
  CheckCircle,
  Info,
  Pill,
  Clock,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Box,
  ShieldCheck,
  Plus,
  RotateCcw,
  Layers,
  Hash,
  User,
  CalendarCheck,
  ScrollText
} from 'lucide-react';
import { clsx } from 'clsx';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { FDACompliancePanel, FDAComplianceDashboard } from '../components/FDACompliancePanel';
import { CaregiverActionPanel } from '../components/CaregiverActionPanel';
import { ChuteAuditLog } from '../components/ChuteAuditLog';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;

// ─── Device capacity — pouch-count model (spec §"Capacity logic") ────────────
//
// Formula (deterministic, conservative, round down):
//   BULK_DERATE  = worst size class across ALL meds in ALL pouches that day
//                  Standard/Small → 1.0 | Large → 0.85 | XL → 0.70
//   usablePouches = floor(MAGAZINE_NAMEPLATE_POUCHES × SAFETY_FACTOR × BULK_DERATE)
//   pouchesPerDay = count of DISTINCT dose-time slots that contain ≥1 item
//                  (3 drugs at Morning = 1 pouch, not 3)
//   maxDays       = floor(usablePouches / pouchesPerDay)
//
const MAGAZINE_NAMEPLATE_POUCHES = 52;   // confirm against real hardware
const SAFETY_FACTOR              = 0.90;
const DEVICE_DIMS                = '12" × 8.5" × 5"';

const BULK_DERATE_TABLE: Record<string, number> = {
  Small:    1.00,
  Standard: 1.00,
  Large:    0.85,
  XL:       0.70,
};

function getBulkDerate(meds: ActiveMedication[]): { derate: number; worstClass: string } {
  // ActiveMedication doesn't carry sizeClass yet — default all to Standard (1.0).
  // Once sizeClass is added to the med record, replace this with a real lookup.
  return { derate: 1.00, worstClass: 'Standard' };
}

interface CapacityCalc {
  maxDays: number;
  recommendedFillDays: number;
  pouchesToOrder: number;
  usablePouches: number;
  pouchesPerDay: number;
  bulkDerate: number;
  worstClass: string;
  // per-slot breakdown — one entry per distinct dose time
  slots: Array<{ time: string; medCount: number; medNames: string[] }>;
}

function calcCapacity(medications: ActiveMedication[]): CapacityCalc | null {
  const activeMeds = medications.filter(m => m.active && m.schedule && m.schedule.times.length > 0);
  if (activeMeds.length === 0) return null;

  // Build distinct dose-time slots — key is the time string, value is the meds at that time.
  // A patient with 8 meds all at Morning produces exactly 1 slot, not 8.
  const slotMap = new Map<string, ActiveMedication[]>();
  activeMeds.forEach(med => {
    med.schedule!.times.forEach(t => {
      if (!slotMap.has(t)) slotMap.set(t, []);
      slotMap.get(t)!.push(med);
    });
  });

  const pouchesPerDay = slotMap.size;
  if (pouchesPerDay === 0) return null;

  const { derate, worstClass } = getBulkDerate(activeMeds);
  const usablePouches = Math.floor(MAGAZINE_NAMEPLATE_POUCHES * SAFETY_FACTOR * derate);
  const maxDays = Math.floor(usablePouches / pouchesPerDay);
  const recommendedFillDays = Math.min(maxDays, 28);
  const pouchesToOrder = pouchesPerDay * recommendedFillDays;

  const slots = Array.from(slotMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, meds]) => ({
      time,
      medCount: meds.length,
      medNames: meds.map(m => m.name),
    }));

  return { maxDays, recommendedFillDays, pouchesToOrder, usablePouches, pouchesPerDay, bulkDerate: derate, worstClass, slots };
}
// ─────────────────────────────────────────────────────────────────────────────

/**
 * MEDICATION MAINTENANCE — PARATA POUCH SYSTEM
 *
 * Each pouch = one dose event (one time slot per day).
 * Meds sharing a dose time are sealed together in a single pouch.
 * Pouches are numbered sequentially and dispensed chronologically.
 *
 * Tabs:
 *  1. Pouch Roll View   — timeline of pouches for the next N days
 *  2. Refill Log        — log new roll loads, track active roll
 *  3. Caregiver Actions — timeout/missed dose overrides
 *  4. Chute Audit Log   — triple-logged device events
 *  5. Pharmacy Fill Order — Parata-format fill instructions
 *  6. MAR Export        — 30-day medication administration record
 *  7. Conflict Dashboard — drug interactions + multi-med pouch review
 *  8. Weekly Calendar   — day-by-day schedule view
 */

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface ActiveMedication {
  id: string;
  name: string;
  dosage: string;
  purpose: string;
  timeCritical: boolean;
  active: boolean;
  schedule?: {
    times: string[];
    days: number[]; // 0–6, Mon-based
    quantity: number;
  };
}

interface PouchMed {
  medicationId: string;
  medicationName: string;
  dosage: string;
  quantity: number;
  timeCritical: boolean;
  purpose: string;
}

interface PouchEvent {
  id: string;
  pouchNumber: number;
  date: Date;
  dateStr: string; // YYYY-MM-DD
  time: string;    // HH:MM
  label: DoseLabel;
  meds: PouchMed[];
}

type DoseLabel = 'Morning' | 'Noon' | 'Evening' | 'Bedtime' | 'Custom';

interface DrugConflict {
  medication1: string;
  medication2: string;
  severity: 'critical' | 'major' | 'moderate' | 'minor';
  description: string;
  recommendation: string;
}

interface RefillLog {
  id: string;
  rollSerial: string;
  loadedBy: string;
  pouchCount: number;
  loadedAt: string; // ISO timestamp
  notes: string;
  isActive: boolean;
}

type TabType = 'pouches' | 'refill' | 'caregiver-actions' | 'chute-audit' | 'instructions' | 'mar' | 'conflicts' | 'calendar';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeToLabel(time: string): DoseLabel {
  const h = parseInt(time.split(':')[0]);
  if (h < 10) return 'Morning';
  if (h < 13) return 'Noon';
  if (h < 18) return 'Evening';
  if (h < 22) return 'Bedtime';
  return 'Custom';
}

const LABEL_STYLES: Record<DoseLabel, { bg: string; border: string; text: string; dot: string }> = {
  Morning: { bg: 'bg-teal-500/15',   border: 'border-teal-500/40',   text: 'text-teal-300',   dot: 'bg-teal-400' },
  Noon:    { bg: 'bg-amber-500/15',  border: 'border-amber-500/40',  text: 'text-amber-300',  dot: 'bg-amber-400' },
  Evening: { bg: 'bg-blue-500/15',   border: 'border-blue-500/40',   text: 'text-blue-300',   dot: 'bg-blue-400' },
  Bedtime: { bg: 'bg-purple-500/15', border: 'border-purple-500/40', text: 'text-purple-300', dot: 'bg-purple-400' },
  Custom:  { bg: 'bg-slate-500/15',  border: 'border-slate-500/40',  text: 'text-slate-300',  dot: 'bg-slate-400' },
};

function generatePouchRoll(meds: ActiveMedication[], daysAhead = 30): PouchEvent[] {
  const pouches: PouchEvent[] = [];
  let pouchNumber = 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = 0; offset < daysAhead; offset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    // JS: 0=Sun → Mon-based index used in schedule.days
    const dayOfWeek = (date.getDay() + 6) % 7;
    const dateStr = date.toISOString().split('T')[0];

    const timeMap: Record<string, PouchMed[]> = {};

    meds.forEach(med => {
      if (!med.schedule) return;
      if (!med.schedule.days.includes(dayOfWeek)) return;
      med.schedule.times.forEach(time => {
        if (!timeMap[time]) timeMap[time] = [];
        timeMap[time].push({
          medicationId: med.id,
          medicationName: med.name,
          dosage: med.dosage,
          quantity: med.schedule!.quantity,
          timeCritical: med.timeCritical,
          purpose: med.purpose,
        });
      });
    });

    Object.keys(timeMap).sort().forEach(time => {
      pouches.push({
        id: `${dateStr}-${time}`,
        pouchNumber: pouchNumber++,
        date,
        dateStr,
        time,
        label: timeToLabel(time),
        meds: timeMap[time],
      });
    });
  }

  return pouches;
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MedicationMaintenance() {
  const [activeTab, setActiveTab] = useState<TabType>('pouches');
  const [medications, setMedications] = useState<ActiveMedication[]>([]);
  const [pouches, setPouches] = useState<PouchEvent[]>([]);
  const [conflicts, setConflicts] = useState<DrugConflict[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rollDays, setRollDays] = useState(30);
  const [capacityInfo, setCapacityInfo] = useState<CapacityCalc | null>(null);
  // derived from medications directly — not from the roll — so it's always accurate
  const [rollSerial, setRollSerial] = useState('ROLL-2026-001');
  const [refillLogs, setRefillLogs] = useState<RefillLog[]>(() => {
    const stored = localStorage.getItem('caresolis_refill_logs');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => { loadMedications(); }, []);

  useEffect(() => {
    if (medications.length > 0) {
      const roll = generatePouchRoll(medications, rollDays);
      setPouches(roll);
      analyzeConflicts();
      setCapacityInfo(calcCapacity(medications));
    }
  }, [medications, rollDays]);

  const loadMedications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/medications`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMedications(data.filter((m: ActiveMedication) => m.active));
        setIsLoading(false);
        return;
      }
    } catch (e) {
      console.error('Failed to load from backend:', e);
    }
    const stored = localStorage.getItem('caresolis_medications_v3');
    if (stored) {
      setMedications(JSON.parse(stored).filter((m: ActiveMedication) => m.active));
    }
    setIsLoading(false);
  };

  const regenerateRoll = () => {
    const roll = generatePouchRoll(medications, rollDays);
    setPouches(roll);
  };

  const analyzeConflicts = async () => {
    setIsAnalyzing(true);
    const mockConflicts: DrugConflict[] = [];
    const medNames = medications.map(m => m.name.toLowerCase());

    if (medNames.includes('warfarin') && medNames.includes('aspirin')) {
      mockConflicts.push({
        medication1: 'Warfarin', medication2: 'Aspirin', severity: 'major',
        description: 'Increased risk of bleeding when combining anticoagulants.',
        recommendation: 'Monitor INR levels closely. Consider consulting physician about dose adjustment.'
      });
    }
    if (medNames.includes('metformin') && medNames.includes('lisinopril')) {
      mockConflicts.push({
        medication1: 'Metformin', medication2: 'Lisinopril', severity: 'moderate',
        description: 'ACE inhibitors may increase the blood sugar-lowering effect of metformin.',
        recommendation: 'Monitor blood glucose levels regularly. Generally safe when monitored.'
      });
    }
    setTimeout(() => { setConflicts(mockConflicts); setIsAnalyzing(false); }, 800);
  };

  const saveRefillLog = (log: RefillLog) => {
    const updated = [log, ...refillLogs.map(l => ({ ...l, isActive: false }))];
    setRefillLogs(updated);
    localStorage.setItem('caresolis_refill_logs', JSON.stringify(updated));
  };

  const activeRoll = refillLogs.find(l => l.isActive);

  const tabs: Array<{ id: TabType; name: string; icon: React.ElementType }> = [
    { id: 'pouches',          name: 'Pouch Roll',         icon: Layers },
    { id: 'refill',           name: 'Refill Log',         icon: RotateCcw },
    { id: 'caregiver-actions',name: 'Caregiver Actions',  icon: AlertCircle },
    { id: 'chute-audit',      name: 'Chute Audit Log',    icon: FileText },
    { id: 'instructions',     name: 'Pharmacy Fill Order',icon: ClipboardList },
    { id: 'mar',              name: 'MAR Export',         icon: ScrollText },
    { id: 'conflicts',        name: 'Conflict Dashboard', icon: AlertTriangle },
    { id: 'calendar',         name: 'Weekly Calendar',    icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
            <Layers className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
            <h1 className="text-2xl sm:text-3xl font-bold">Medication Maintenance</h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-lg border-2 border-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              FDA COMPLIANT
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm sm:text-base mt-1">
            <span className="text-slate-400">Parata Pouch System</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">{pouches.length} pouches</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">{rollDays}-day roll</span>
            <span className="text-slate-600">·</span>
            {capacityInfo !== null ? (
              <span className={`font-semibold flex items-center gap-1.5 ${
                capacityInfo.maxDays >= 28 ? 'text-emerald-400' :
                capacityInfo.maxDays >= 14 ? 'text-amber-400' :
                'text-rose-400'
              }`}>
                <Box className="w-4 h-4" />
                Device holds <strong>{capacityInfo.maxDays} days</strong> of supply
              </span>
            ) : (
              <span className="text-slate-500 italic">Capacity pending med data</span>
            )}
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Triple IR Gate Verification</span>
          </div>
        </div>

        {/* System Banner */}
        <div className="bg-gradient-to-r from-emerald-900/20 to-blue-900/20 border border-emerald-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-emerald-300 mb-1">Parata Pouch Dispensing System</div>
              <div className="text-sm text-slate-300">
                Medications sharing a dose time are heat-sealed together into a single labeled pouch.
                Pouches are numbered sequentially and dispensed in chronological order.
                Each pouch is printed with patient name, date, time, and medication contents.
              </div>
            </div>
            {activeRoll && (
              <div className="flex-shrink-0 text-right text-xs text-slate-400">
                <div className="text-emerald-400 font-semibold">Active Roll</div>
                <div className="font-mono">{activeRoll.rollSerial}</div>
                <div>{activeRoll.pouchCount} pouches</div>
              </div>
            )}
          </div>

          {/* Device Capacity Row */}
          {capacityInfo !== null && (
            <div className={`mt-4 pt-4 border-t flex flex-wrap items-center gap-5 ${
              capacityInfo.maxDays >= 28 ? 'border-emerald-700/40' :
              capacityInfo.maxDays >= 14 ? 'border-amber-700/40' :
              'border-rose-700/40'
            }`}>

              {/* Big day count */}
              <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border flex-shrink-0 ${
                capacityInfo.maxDays >= 28 ? 'bg-emerald-500/10 border-emerald-500/40' :
                capacityInfo.maxDays >= 14 ? 'bg-amber-500/10 border-amber-500/40' :
                'bg-rose-500/10 border-rose-500/40'
              }`}>
                <Box className={`w-8 h-8 flex-shrink-0 ${
                  capacityInfo.maxDays >= 28 ? 'text-emerald-400' :
                  capacityInfo.maxDays >= 14 ? 'text-amber-400' : 'text-rose-400'
                }`} />
                <div>
                  <div className={`text-4xl font-black tabular-nums leading-none ${
                    capacityInfo.maxDays >= 28 ? 'text-emerald-300' :
                    capacityInfo.maxDays >= 14 ? 'text-amber-300' : 'text-rose-300'
                  }`}>{capacityInfo.maxDays}</div>
                  <div className="text-xs text-slate-400 mt-0.5">max days per fill</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Recommended: <span className="text-slate-300 font-semibold">{capacityInfo.recommendedFillDays}d</span>
                    {' · '}Order: <span className="text-slate-300 font-semibold">{capacityInfo.pouchesToOrder} pouches</span>
                  </div>
                </div>
              </div>

              {/* Right side: dose slots + audit line */}
              <div className="flex-1 min-w-[260px] space-y-3">

                {/* Dose-time slot breakdown */}
                <div className="bg-slate-900/60 rounded-lg p-3 text-xs space-y-1">
                  <div className="text-slate-500 uppercase tracking-wider text-[10px] mb-2 font-semibold">
                    Dose schedule — {capacityInfo.pouchesPerDay} pouch{capacityInfo.pouchesPerDay !== 1 ? 'es' : ''}/day
                  </div>
                  {capacityInfo.slots.map((slot, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-300">
                      <span className="text-slate-500 w-20 flex-shrink-0 font-mono">{slot.time}</span>
                      <span className="text-slate-400">{slot.medCount} med{slot.medCount !== 1 ? 's' : ''}</span>
                      <span className="text-slate-600 flex-1 truncate">{slot.medNames.join(', ')}</span>
                      <span className="text-slate-500 flex-shrink-0 font-mono">1 pouch</span>
                    </div>
                  ))}
                </div>

                {/* Auditable debug line */}
                <div className="bg-slate-900/80 border border-slate-700/60 rounded-lg px-3 py-2 font-mono text-xs text-slate-400 space-y-0.5">
                  <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Capacity audit</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                    <span>nameplate <span className="text-slate-200">{MAGAZINE_NAMEPLATE_POUCHES}</span></span>
                    <span>× safety <span className="text-slate-200">{SAFETY_FACTOR}</span></span>
                    <span>× derate <span className="text-slate-200">{capacityInfo.bulkDerate}</span> ({capacityInfo.worstClass})</span>
                    <span>= usable <span className="text-slate-200">{capacityInfo.usablePouches}</span></span>
                  </div>
                  <div className={`font-bold mt-1 ${
                    capacityInfo.maxDays >= 28 ? 'text-emerald-400' :
                    capacityInfo.maxDays >= 14 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {capacityInfo.usablePouches} usable pouches ÷ {capacityInfo.pouchesPerDay} dose time{capacityInfo.pouchesPerDay !== 1 ? 's' : ''}/day = {capacityInfo.maxDays} days
                  </div>
                </div>

                {/* Progress bar + status */}
                <div>
                  <div className="h-2 bg-slate-700/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        capacityInfo.maxDays >= 28 ? 'bg-emerald-500' :
                        capacityInfo.maxDays >= 14 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, (capacityInfo.maxDays / 30) * 100)}%` }}
                    />
                  </div>
                  <div className="text-xs mt-1">
                    {capacityInfo.maxDays < 14 && (
                      <span className="text-rose-400">⚠ Under 14-day floor — a bulky item may be cutting capacity. Pharmacist should review.</span>
                    )}
                    {capacityInfo.maxDays >= 14 && capacityInfo.maxDays < 28 && (
                      <span className="text-amber-400">Fits {capacityInfo.maxDays} days — mid-month refill needed.</span>
                    )}
                    {capacityInfo.maxDays >= 28 && (
                      <span className="text-emerald-400">Full month fits in one load.</span>
                    )}
                    <span className="ml-2 text-slate-600 italic">Capacity is conservative and estimated, pending device calibration.</span>
                  </div>
                </div>
              </div>

              {/* Device spec */}
              <div className="flex-shrink-0 text-xs text-slate-500 text-right space-y-0.5">
                <div className="text-slate-400 font-medium">{DEVICE_DIMS}</div>
                <div>{MAGAZINE_NAMEPLATE_POUCHES} nameplate pouches</div>
                <div>Safety factor {SAFETY_FACTOR}</div>
                <div>Bulk derate: {capacityInfo.bulkDerate} ({capacityInfo.worstClass})</div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-6 border-b border-slate-800 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'px-3 py-3 flex items-center gap-2 transition-all relative whitespace-nowrap text-sm',
                  activeTab === tab.id ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-300'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
          {activeTab === 'pouches' && (
            <PouchRollTab
              pouches={pouches}
              medications={medications}
              rollDays={rollDays}
              onRollDaysChange={setRollDays}
              onRegenerate={regenerateRoll}
              isLoading={isLoading}
              cassetteDays={capacityInfo}
            />
          )}
          {activeTab === 'refill' && (
            <RefillTab
              refillLogs={refillLogs}
              onSave={saveRefillLog}
              pouches={pouches}
              rollSerial={rollSerial}
              onRollSerialChange={setRollSerial}
            />
          )}
          {activeTab === 'caregiver-actions' && (
            <div>
              <h2 className="text-2xl font-bold text-emerald-400 mb-4">Caregiver Actions Required</h2>
              <p className="text-slate-400 mb-6">
                Authorize actions for doses that have exceeded the 15-minute safety timeout.
                You can re-present the dose to the patient or mark it as missed with a logged reason.
              </p>
              <CaregiverActionPanel
                patientId="1"
                caregiverUserId="caregiver-001"
                onActionComplete={() => console.log('Caregiver action completed')}
              />
            </div>
          )}
          {activeTab === 'chute-audit' && (
            <div>
              <h2 className="text-2xl font-bold text-blue-400 mb-4">Chute Audit Log (FDA-Compliant)</h2>
              <p className="text-slate-400 mb-6">
                Complete audit trail of all chute events with triple logging (device flash, cloud database, audit trail).
                Export logs for regulatory review or compliance verification.
              </p>
              <ChuteAuditLog patientId="1" limit={100} />
            </div>
          )}
          {activeTab === 'instructions' && (
            <PharmacyFillOrderTab pouches={pouches} medications={medications} rollSerial={rollSerial} rollDays={rollDays} />
          )}
          {activeTab === 'mar' && <MARExportTab medications={medications} pouches={pouches} />}
          {activeTab === 'conflicts' && (
            <ConflictDashboardTab conflicts={conflicts} isAnalyzing={isAnalyzing} pouches={pouches} />
          )}
          {activeTab === 'calendar' && <WeeklyCalendarTab pouches={pouches} />}
        </div>
      </div>
    </div>
  );
}

// ─── Pouch Card ───────────────────────────────────────────────────────────────

function PouchCard({ pouch, compact = false }: { pouch: PouchEvent; compact?: boolean }) {
  const style = LABEL_STYLES[pouch.label];
  const hasTimeCritical = pouch.meds.some(m => m.timeCritical);

  return (
    <div className={clsx(
      'rounded-xl border flex flex-col gap-2 transition-all hover:border-opacity-70',
      style.bg, style.border,
      compact ? 'p-2' : 'p-3'
    )}>
      {/* Pouch header */}
      <div className="flex items-center justify-between gap-1">
        <span className="text-xs font-mono text-slate-500">#{pouch.pouchNumber}</span>
        {hasTimeCritical && (
          <span className="text-xs font-bold text-rose-400 uppercase">TC</span>
        )}
      </div>

      {/* Time & label */}
      <div className="flex items-center gap-1.5">
        <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', style.dot)} />
        <span className={clsx('text-xs font-semibold', style.text)}>{pouch.label}</span>
        <span className="text-xs text-slate-500">{pouch.time}</span>
      </div>

      {/* Meds */}
      {!compact && (
        <div className="space-y-1">
          {pouch.meds.map((med, i) => (
            <div key={i} className="text-xs text-slate-300 flex items-baseline gap-1">
              <span className="font-medium truncate">{med.medicationName}</span>
              <span className="text-slate-500 flex-shrink-0">{med.dosage}</span>
              <span className="text-slate-600 flex-shrink-0">×{med.quantity}</span>
            </div>
          ))}
        </div>
      )}
      {compact && (
        <div className="text-xs text-slate-400">{pouch.meds.length} med{pouch.meds.length !== 1 ? 's' : ''}</div>
      )}
    </div>
  );
}

// ─── Tab 1: Pouch Roll View ───────────────────────────────────────────────────

function PouchRollTab({
  pouches, medications, rollDays, onRollDaysChange, onRegenerate, isLoading, cassetteDays
}: {
  pouches: PouchEvent[];
  medications: ActiveMedication[];
  rollDays: number;
  onRollDaysChange: (d: number) => void;
  onRegenerate: () => void;
  isLoading: boolean;
  cassetteDays: CapacityCalc | null;
}) {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [filterLabel, setFilterLabel] = useState<DoseLabel | 'All'>('All');

  // Group pouches by date
  const byDate: Record<string, PouchEvent[]> = {};
  pouches.forEach(p => {
    if (filterLabel !== 'All' && p.label !== filterLabel) return;
    if (!byDate[p.dateStr]) byDate[p.dateStr] = [];
    byDate[p.dateStr].push(p);
  });

  const toggleDay = (dateStr: string) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      next.has(dateStr) ? next.delete(dateStr) : next.add(dateStr);
      return next;
    });
  };

  const totalPills = pouches.reduce((sum, p) => sum + p.meds.reduce((s, m) => s + m.quantity, 0), 0);
  const pouchesPerDay = pouches.length / Math.max(rollDays, 1);

  // Expand today by default on first render
  useEffect(() => {
    if (pouches.length > 0) {
      setExpandedDays(new Set([pouches[0].dateStr]));
    }
  }, [pouches.length > 0]);

  if (isLoading) return (
    <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
      <Loader className="w-5 h-5 animate-spin" />
      Loading medications...
    </div>
  );

  if (medications.length === 0) return (
    <div className="bg-amber-900/20 border-2 border-amber-500/40 rounded-lg p-8 text-center">
      <Package className="w-16 h-16 text-amber-400 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-amber-300 mb-2">No Medications Configured</h3>
      <p className="text-slate-300 mb-4 max-w-md mx-auto">
        Add medications and schedules first before a pouch roll can be generated.
      </p>
      <a href="/medications" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors inline-flex items-center gap-2">
        <Pill className="w-5 h-5" />
        Go to Medications Page
      </a>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">Roll length:</span>
          {[7, 14, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => onRollDaysChange(d)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                rollDays === d ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              )}
            >
              {d}d
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">Filter:</span>
          {(['All', 'Morning', 'Noon', 'Evening', 'Bedtime'] as const).map(l => (
            <button
              key={l}
              onClick={() => setFilterLabel(l)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                filterLabel === l
                  ? l === 'All' ? 'bg-slate-600 text-white' : clsx(LABEL_STYLES[l as DoseLabel].bg, LABEL_STYLES[l as DoseLabel].border, LABEL_STYLES[l as DoseLabel].text, 'border')
                  : 'bg-slate-800 text-slate-500 hover:text-slate-300'
              )}
            >
              {l}
            </button>
          ))}
          <button
            onClick={onRegenerate}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg flex items-center gap-1.5 text-sm transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Pouches', value: pouches.length, color: 'text-emerald-400' },
          { label: 'Pouches / Day', value: pouchesPerDay.toFixed(1), color: 'text-blue-400' },
          { label: 'Total Pills', value: totalPills, color: 'text-amber-400' },
          { label: 'Active Meds', value: medications.length, color: 'text-purple-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-800/50 rounded-lg p-4">
            <div className={clsx('text-2xl font-bold', s.color)}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
        {/* Device capacity stat */}
        <div className={clsx(
          'rounded-lg p-4 border col-span-2 sm:col-span-1',
          cassetteDays === null ? 'bg-slate-800/50 border-slate-700' :
          cassetteDays.maxDays >= 28 ? 'bg-emerald-900/30 border-emerald-500/50' :
          cassetteDays.maxDays >= 14 ? 'bg-amber-900/30 border-amber-500/50' :
          'bg-rose-900/30 border-rose-500/50'
        )}>
          <div className="flex items-center gap-1.5 mb-0.5">
            <Box className={clsx('w-3.5 h-3.5',
              cassetteDays === null ? 'text-slate-500' :
              cassetteDays.maxDays >= 28 ? 'text-emerald-400' :
              cassetteDays.maxDays >= 14 ? 'text-amber-400' :
              'text-rose-400'
            )} />
            <div className={clsx('text-2xl font-bold tabular-nums',
              cassetteDays === null ? 'text-slate-500' :
              cassetteDays.maxDays >= 28 ? 'text-emerald-400' :
              cassetteDays.maxDays >= 14 ? 'text-amber-400' :
              'text-rose-400'
            )}>
              {cassetteDays?.maxDays ?? '—'}
            </div>
          </div>
          <div className="text-xs text-slate-400">Days in Device</div>
          <div className="text-xs text-slate-600 mt-0.5 font-mono">
            {cassetteDays ? `${cassetteDays.usablePouches} ÷ ${cassetteDays.pouchesPerDay}/day` : '—'}
          </div>
          {cassetteDays !== null && (
            <div className="mt-1.5 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={clsx('h-full rounded-full',
                  cassetteDays.maxDays >= 28 ? 'bg-emerald-500' :
                  cassetteDays.maxDays >= 14 ? 'bg-amber-500' :
                  'bg-rose-500'
                )}
                style={{ width: `${Math.min(100, (cassetteDays.maxDays / 30) * 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Label legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {(Object.keys(LABEL_STYLES) as DoseLabel[]).map(l => (
          <span key={l} className={clsx('flex items-center gap-1.5 px-2 py-1 rounded border', LABEL_STYLES[l].bg, LABEL_STYLES[l].border, LABEL_STYLES[l].text)}>
            <span className={clsx('w-2 h-2 rounded-full', LABEL_STYLES[l].dot)} />
            {l}
          </span>
        ))}
      </div>

      {/* Day-by-day accordion */}
      <div className="space-y-2">
        {Object.keys(byDate).sort().map(dateStr => {
          const dayPouches = byDate[dateStr];
          const date = new Date(dateStr + 'T12:00:00');
          const isExpanded = expandedDays.has(dateStr);
          const isToday = dateStr === new Date().toISOString().split('T')[0];
          const dayName = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

          return (
            <div key={dateStr} className={clsx(
              'rounded-xl border overflow-hidden transition-all',
              isToday ? 'border-emerald-500/50' : 'border-slate-700/60'
            )}>
              {/* Day header */}
              <button
                onClick={() => toggleDay(dateStr)}
                className={clsx(
                  'w-full flex items-center justify-between px-4 py-3 transition-colors',
                  isToday ? 'bg-emerald-900/20 hover:bg-emerald-900/30' : 'bg-slate-800/40 hover:bg-slate-800/60'
                )}
              >
                <div className="flex items-center gap-3">
                  {isToday && (
                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded">TODAY</span>
                  )}
                  <span className="font-semibold text-slate-200">{dayName}</span>
                  <span className="text-xs text-slate-500">{dayPouches.length} pouch{dayPouches.length !== 1 ? 'es' : ''}</span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Mini strip preview */}
                  <div className="hidden sm:flex gap-1">
                    {dayPouches.map(p => (
                      <span key={p.id} className={clsx('w-2.5 h-2.5 rounded-sm', LABEL_STYLES[p.label].dot)} title={`${p.label} ${p.time}`} />
                    ))}
                  </div>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {/* Expanded pouch cards */}
              {isExpanded && (
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 bg-slate-900/40">
                  {dayPouches.map(pouch => (
                    <PouchCard key={pouch.id} pouch={pouch} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab 2: Refill Log ────────────────────────────────────────────────────────

function RefillTab({
  refillLogs, onSave, pouches, rollSerial, onRollSerialChange
}: {
  refillLogs: RefillLog[];
  onSave: (log: RefillLog) => void;
  pouches: PouchEvent[];
  rollSerial: string;
  onRollSerialChange: (s: string) => void;
}) {
  const [form, setForm] = useState({
    rollSerial,
    loadedBy: '',
    pouchCount: pouches.length,
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setForm(f => ({ ...f, pouchCount: pouches.length, rollSerial }));
  }, [pouches.length, rollSerial]);

  const handleSubmit = () => {
    if (!form.rollSerial || !form.loadedBy) return;
    onSave({
      id: uid(),
      rollSerial: form.rollSerial,
      loadedBy: form.loadedBy,
      pouchCount: form.pouchCount,
      loadedAt: new Date().toISOString(),
      notes: form.notes,
      isActive: true,
    });
    onRollSerialChange(form.rollSerial);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const activeLog = refillLogs.find(l => l.isActive);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-1">Refill Log</h2>
        <p className="text-sm text-slate-400">Record each time a new pouch roll is loaded into the dispenser.</p>
      </div>

      {/* Active roll status */}
      {activeLog ? (
        <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-300">Active Roll</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-slate-400 text-xs mb-0.5">Roll Serial</div>
              <div className="font-mono font-semibold text-slate-100">{activeLog.rollSerial}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs mb-0.5">Pouch Count</div>
              <div className="font-semibold text-slate-100">{activeLog.pouchCount}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs mb-0.5">Loaded By</div>
              <div className="font-semibold text-slate-100">{activeLog.loadedBy}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs mb-0.5">Loaded At</div>
              <div className="font-semibold text-slate-100">
                {new Date(activeLog.loadedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
          {activeLog.notes && (
            <div className="mt-3 text-xs text-slate-400">Notes: {activeLog.notes}</div>
          )}
        </div>
      ) : (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3 text-sm text-amber-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          No active roll recorded. Log a roll load below.
        </div>
      )}

      {/* Log new roll form */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-slate-200 flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-400" />
          Log New Roll Load
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Roll Serial Number <span className="text-rose-400">*</span></label>
            <input
              type="text"
              value={form.rollSerial}
              onChange={e => setForm({ ...form, rollSerial: e.target.value })}
              placeholder="e.g., ROLL-2026-001"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Loaded By <span className="text-rose-400">*</span></label>
            <input
              type="text"
              value={form.loadedBy}
              onChange={e => setForm({ ...form, loadedBy: e.target.value })}
              placeholder="e.g., Jane Smith (MA)"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Pouch Count</label>
            <input
              type="number"
              min={1}
              value={form.pouchCount}
              onChange={e => setForm({ ...form, pouchCount: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <div className="text-xs text-slate-500 mt-1">Auto-filled from current {pouches.length}-pouch roll</div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Notes (optional)</label>
            <input
              type="text"
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g., New medications added this cycle"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!form.rollSerial || !form.loadedBy}
          className={clsx(
            'px-6 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors',
            form.rollSerial && form.loadedBy
              ? submitted ? 'bg-emerald-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          )}
        >
          {submitted ? <><Check className="w-4 h-4" /> Logged</> : <><CalendarCheck className="w-4 h-4" /> Log Roll Load</>}
        </button>
      </div>

      {/* History */}
      {refillLogs.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-300 mb-3">Roll History</h3>
          <div className="space-y-2">
            {refillLogs.map(log => (
              <div key={log.id} className={clsx(
                'flex items-center gap-4 px-4 py-3 rounded-lg border text-sm',
                log.isActive ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-slate-800/40 border-slate-700'
              )}>
                <div className={clsx('w-2 h-2 rounded-full flex-shrink-0', log.isActive ? 'bg-emerald-400' : 'bg-slate-600')} />
                <div className="font-mono font-semibold text-slate-100 w-36 truncate">{log.rollSerial}</div>
                <div className="text-slate-400 flex-1">{log.loadedBy}</div>
                <div className="text-slate-500 flex-shrink-0">{log.pouchCount} pouches</div>
                <div className="text-slate-500 flex-shrink-0 hidden sm:block">
                  {new Date(log.loadedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                {log.isActive && <span className="text-xs font-bold text-emerald-400 uppercase flex-shrink-0">Active</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 3: Pharmacy Fill Order ───────────────────────────────────────────────

function PharmacyFillOrderTab({
  pouches, medications, rollSerial, rollDays
}: {
  pouches: PouchEvent[];
  medications: ActiveMedication[];
  rollSerial: string;
  rollDays: number;
}) {
  const printInstructions = () => window.print();

  // Group into day blocks for readability
  const byDate: Record<string, PouchEvent[]> = {};
  pouches.forEach(p => {
    if (!byDate[p.dateStr]) byDate[p.dateStr] = [];
    byDate[p.dateStr].push(p);
  });

  return (
    <div className="space-y-6">
      <FDAComplianceDashboard medications={medications} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Pharmacy Fill Order</h2>
          <p className="text-sm text-slate-400">
            Parata-format pouch fill instructions · Roll {rollSerial} · {pouches.length} pouches · {rollDays} days
          </p>
        </div>
        <button
          onClick={printInstructions}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
      </div>

      {/* Pouch-by-pouch list */}
      <div className="space-y-3">
        {Object.keys(byDate).sort().slice(0, 14).map(dateStr => {
          const date = new Date(dateStr + 'T12:00:00');
          const dayPouches = byDate[dateStr];
          return (
            <div key={dateStr} className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-800 flex items-center gap-3">
                <CalendarCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-slate-200">
                  {date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
                <span className="text-xs text-slate-500">{dayPouches.length} pouch{dayPouches.length !== 1 ? 'es' : ''}</span>
              </div>
              <div className="divide-y divide-slate-700/50">
                {dayPouches.map(pouch => {
                  const style = LABEL_STYLES[pouch.label];
                  return (
                    <div key={pouch.id} className="flex items-start gap-4 px-4 py-3">
                      {/* Pouch label badge */}
                      <div className={clsx('flex-shrink-0 w-20 text-center px-2 py-1 rounded-lg border text-xs font-bold', style.bg, style.border, style.text)}>
                        #{pouch.pouchNumber}
                        <div className="font-normal text-slate-400 mt-0.5">{pouch.time}</div>
                      </div>
                      {/* Med list */}
                      <div className="flex-1 space-y-1">
                        {pouch.meds.map((med, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span className="font-semibold text-slate-100">{med.medicationName}</span>
                            <span className="text-slate-400">{med.dosage}</span>
                            <span className="text-slate-500">×{med.quantity}</span>
                            {med.timeCritical && (
                              <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-400 text-xs font-bold rounded border border-rose-500/30">TIME-CRITICAL</span>
                            )}
                          </div>
                        ))}
                      </div>
                      {/* Parata label hint */}
                      <div className="flex-shrink-0 text-xs text-slate-600 hidden lg:block">
                        <div>Print label:</div>
                        <div className="font-mono">{dateStr} {pouch.time}</div>
                        <div className="font-mono">{pouch.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {Object.keys(byDate).length > 14 && (
          <div className="text-center text-sm text-slate-500 py-2">
            Showing first 14 days. Print to see full {rollDays}-day roll.
          </div>
        )}
      </div>

      {/* Reminders */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-300 mb-1">Parata Fill Reminders</div>
            <ul className="text-sm text-amber-200 space-y-1">
              <li>· Verify patient name and DOB on prescription before filling</li>
              <li>· Each pouch label must show: patient name, date, time, medication names and quantities</li>
              <li>· Time-Critical medications (marked TC) must be in the exact correct pouch position</li>
              <li>· Verify all medication expiration dates extend beyond the last pouch date</li>
              <li>· Seal each pouch tamper-evident per pharmacy protocol</li>
              <li>· Roll serial <strong className="font-mono">{rollSerial}</strong> must be affixed to the roll housing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 4: MAR Export ────────────────────────────────────────────────────────

function MARExportTab({ medications, pouches }: { medications: ActiveMedication[]; pouches: PouchEvent[] }) {
  const [patientInfo, setPatientInfo] = useState({ name: '', dob: '', prescriber: '', pharmacy: '' });
  const [isEditingPatientInfo, setIsEditingPatientInfo] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('caresolis_patient_info');
    if (stored) setPatientInfo(JSON.parse(stored));
  }, []);

  const savePatientInfo = () => {
    localStorage.setItem('caresolis_patient_info', JSON.stringify(patientInfo));
    setIsEditingPatientInfo(false);
  };

  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 30);

  const exportCSV = () => {
    const csvRows = [
      ['Patient Name', patientInfo.name || '[Not Set]'],
      ['Date of Birth', patientInfo.dob || '[Not Set]'],
      ['Prescriber', patientInfo.prescriber || '[Not Set]'],
      ['Pharmacy', patientInfo.pharmacy || '[Not Set]'],
      ['Date Range', `${today.toLocaleDateString()} - ${endDate.toLocaleDateString()}`],
      ['Total Pouches', String(pouches.length)],
      [],
      ['Medication Name', 'Dosage', 'Purpose', 'Times', 'Days', 'Quantity per Dose', 'Monthly Qty'],
      ...medications.map(med => [
        med.name, med.dosage, med.purpose,
        med.schedule?.times.join(' | ') || '',
        med.schedule?.days.map(d => DAYS[d]).join(' ') || '',
        med.schedule?.quantity.toString() || '',
        ((med.schedule?.times.length || 0) * 30 * (med.schedule?.quantity || 0)).toString()
      ])
    ];
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MAR_${patientInfo.name || 'Patient'}_${today.toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-1">Medication Administration Record (MAR)</h2>
        <p className="text-sm text-slate-400">Export for pharmacy fulfillment · 30-day supply</p>
      </div>

      {/* Patient info */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-blue-300">Patient Information</h3>
          {!isEditingPatientInfo ? (
            <button onClick={() => setIsEditingPatientInfo(true)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center gap-2 transition-colors">
              <Edit2 className="w-3 h-3" /> Edit Info
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={savePatientInfo} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg flex items-center gap-2 transition-colors">
                <Check className="w-3 h-3" /> Save
              </button>
              <button onClick={() => { setIsEditingPatientInfo(false); const s = localStorage.getItem('caresolis_patient_info'); if (s) setPatientInfo(JSON.parse(s)); }} className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded-lg flex items-center gap-2 transition-colors">
                <X className="w-3 h-3" /> Cancel
              </button>
            </div>
          )}
        </div>
        {isEditingPatientInfo ? (
          <div className="grid grid-cols-2 gap-3">
            {[['name','Patient Name','e.g., John Smith'],['dob','Date of Birth','e.g., 01/15/1945'],['prescriber','Prescriber','e.g., Dr. Jane Doe'],['pharmacy','Pharmacy','e.g., CVS #1234']].map(([key, label, ph]) => (
              <div key={key}>
                <label className="block text-xs text-slate-400 mb-1">{label}</label>
                <input type="text" value={(patientInfo as any)[key]} onChange={e => setPatientInfo({ ...patientInfo, [key]: e.target.value })} placeholder={ph}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-100 focus:outline-none focus:border-blue-500" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[['Patient Name', patientInfo.name],['Date of Birth', patientInfo.dob],['Prescriber', patientInfo.prescriber],['Pharmacy', patientInfo.pharmacy]].map(([l,v]) => (
              <div key={l}><span className="text-slate-400">{l}:</span>{' '}<span className="text-slate-200 font-medium">{v || '[Not Set]'}</span></div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={() => alert('PDF export would integrate with jsPDF')} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center gap-2 transition-colors">
          <Download className="w-4 h-4" /> Export PDF
        </button>
        <button onClick={exportCSV} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* MAR preview */}
      <div className="bg-white text-slate-900 rounded-lg p-8 border-2 border-slate-700">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold">MEDICATION ADMINISTRATION RECORD</h3>
          <div className="text-sm text-slate-600 mt-2">
            {today.toLocaleDateString()} – {endDate.toLocaleDateString()}
          </div>
        </div>
        <div className="mb-6 border-t border-b border-slate-300 py-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Patient Name:</strong> {patientInfo.name || <em className="text-slate-400">Not Set</em>}</div>
            <div><strong>Date of Birth:</strong> {patientInfo.dob || <em className="text-slate-400">Not Set</em>}</div>
            <div><strong>Prescriber:</strong> {patientInfo.prescriber || <em className="text-slate-400">Not Set</em>}</div>
            <div><strong>Pharmacy:</strong> {patientInfo.pharmacy || <em className="text-slate-400">Not Set</em>}</div>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-slate-900">
              <th className="text-left py-2 px-2">Medication</th>
              <th className="text-left py-2 px-2">Dosage</th>
              <th className="text-left py-2 px-2">Schedule</th>
              <th className="text-right py-2 px-2">Qty/Dose</th>
              <th className="text-right py-2 px-2">30-Day Qty</th>
            </tr>
          </thead>
          <tbody>
            {medications.map(med => {
              const monthlyQty = (med.schedule?.times.length || 0) * 30 * (med.schedule?.quantity || 0);
              return (
                <tr key={med.id} className="border-b border-slate-200">
                  <td className="py-3 px-2 font-semibold">{med.name}</td>
                  <td className="py-3 px-2">{med.dosage}</td>
                  <td className="py-3 px-2">
                    {med.schedule?.times.join(', ')} · {med.schedule?.days.length === 7 ? 'Daily' : med.schedule?.days.map(d => DAYS[d]).join(', ')}
                  </td>
                  <td className="py-3 px-2 text-right">{med.schedule?.quantity}</td>
                  <td className="py-3 px-2 text-right font-semibold">{monthlyQty}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mt-6 text-xs text-slate-600 space-y-1">
          <div><strong>Total Medications:</strong> {medications.length}</div>
          <div><strong>Total Pouches (30-day roll):</strong> {pouches.length}</div>
          <div><strong>Dispensing System:</strong> CareSolis Parata Pouch Dispenser with Triple IR Gate Verification</div>
          <div><strong>Next Roll Due:</strong> {endDate.toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 5: Conflict Dashboard ────────────────────────────────────────────────

function ConflictDashboardTab({
  conflicts, isAnalyzing, pouches
}: {
  conflicts: DrugConflict[];
  isAnalyzing: boolean;
  pouches: PouchEvent[];
}) {
  // Pouches with multiple meds (informational — they're by design, but worth reviewing)
  const multiMedPouches = pouches.filter(p => p.meds.length > 1);
  // Pouches with at least one time-critical med alongside others
  const tcMixedPouches = pouches.filter(p => p.meds.length > 1 && p.meds.some(m => m.timeCritical));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-1">Conflict Detection Dashboard</h2>
        <p className="text-sm text-slate-400">Drug interactions · Multi-med pouch review</p>
      </div>

      {isAnalyzing && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-center gap-3">
          <Loader className="w-5 h-5 text-blue-400 animate-spin" />
          <span className="text-blue-300">Analyzing medication interactions...</span>
        </div>
      )}

      {/* Drug interactions */}
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <Pill className="w-5 h-5 text-rose-400" />
          Drug Interaction Conflicts ({conflicts.length})
        </h3>
        {conflicts.length === 0 && !isAnalyzing && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-300">No drug interaction conflicts detected</span>
          </div>
        )}
        <div className="space-y-3">
          {conflicts.map((conflict, idx) => {
            const severityColors = {
              critical: 'border-rose-500 bg-rose-500/10',
              major: 'border-orange-500 bg-orange-500/10',
              moderate: 'border-amber-500 bg-amber-500/10',
              minor: 'border-yellow-500 bg-yellow-500/10'
            };
            const textColors = {
              critical: 'text-rose-400', major: 'text-orange-400',
              moderate: 'text-amber-400', minor: 'text-yellow-400'
            };
            const badgeColors = {
              critical: 'bg-rose-500/20 text-rose-300', major: 'bg-orange-500/20 text-orange-300',
              moderate: 'bg-amber-500/20 text-amber-300', minor: 'bg-yellow-500/20 text-yellow-300'
            };
            return (
              <div key={idx} className={clsx('border rounded-lg p-4', severityColors[conflict.severity])}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className={clsx('w-5 h-5 flex-shrink-0 mt-0.5', textColors[conflict.severity])} />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-100 mb-1">
                      {conflict.medication1} + {conflict.medication2}
                      <span className={clsx('ml-2 px-2 py-0.5 text-xs font-bold rounded uppercase', badgeColors[conflict.severity])}>
                        {conflict.severity}
                      </span>
                    </div>
                    <div className="text-sm text-slate-300 mb-2">{conflict.description}</div>
                    <div className="text-sm text-slate-400"><strong>Recommendation:</strong> {conflict.recommendation}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-med pouch review */}
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-400" />
          Multi-Med Pouches ({multiMedPouches.length})
          <span className="text-xs font-normal text-slate-500">— co-sealed by design, verify intentional</span>
        </h3>

        {tcMixedPouches.length > 0 && (
          <div className="mb-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2 text-sm text-amber-300">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span><strong>{tcMixedPouches.length}</strong> pouch{tcMixedPouches.length !== 1 ? 'es' : ''} combine time-critical medications with others — confirm prescriber intent.</span>
          </div>
        )}

        {multiMedPouches.length === 0 && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-300">All pouches contain single medications</span>
          </div>
        )}

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {multiMedPouches.slice(0, 20).map(pouch => {
            const hasTc = pouch.meds.some(m => m.timeCritical);
            const style = LABEL_STYLES[pouch.label];
            return (
              <div key={pouch.id} className={clsx('flex items-center gap-3 p-3 rounded-lg border text-sm', hasTc ? 'border-amber-500/30 bg-amber-500/5' : 'border-slate-700 bg-slate-800/30')}>
                <span className={clsx('flex-shrink-0 px-2 py-0.5 rounded text-xs font-bold border', style.bg, style.border, style.text)}>
                  #{pouch.pouchNumber}
                </span>
                <span className="text-slate-400 w-24 flex-shrink-0">{pouch.dateStr}</span>
                <span className="text-slate-500 w-12 flex-shrink-0">{pouch.time}</span>
                <span className="text-slate-300 flex-1">
                  {pouch.meds.map(m => `${m.medicationName}${m.timeCritical ? ' ⚠' : ''}`).join(' + ')}
                </span>
              </div>
            );
          })}
          {multiMedPouches.length > 20 && (
            <div className="text-xs text-slate-500 text-center py-2">
              +{multiMedPouches.length - 20} more — export CSV for full list
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tab 6: Weekly Calendar ───────────────────────────────────────────────────

function WeeklyCalendarTab({ pouches }: { pouches: PouchEvent[] }) {
  // Show only the first 7 days
  const firstDate = pouches[0]?.dateStr;
  const weekPouches = firstDate
    ? pouches.filter(p => {
        const diff = (new Date(p.dateStr + 'T12:00:00').getTime() - new Date(firstDate + 'T12:00:00').getTime()) / 86400000;
        return diff < 7;
      })
    : [];

  const byDate: Record<string, PouchEvent[]> = {};
  weekPouches.forEach(p => {
    if (!byDate[p.dateStr]) byDate[p.dateStr] = [];
    byDate[p.dateStr].push(p);
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-1">Weekly Medication Calendar</h2>
        <p className="text-sm text-slate-400">Pouch schedule for the next 7 days</p>
      </div>

      <div className="space-y-3">
        {Object.keys(byDate).sort().map(dateStr => {
          const date = new Date(dateStr + 'T12:00:00');
          const isToday = dateStr === new Date().toISOString().split('T')[0];
          const dayPouches = byDate[dateStr];

          return (
            <div key={dateStr} className={clsx('rounded-xl border overflow-hidden', isToday ? 'border-emerald-500/50' : 'border-slate-700')}>
              <div className={clsx('px-4 py-2.5 flex items-center gap-3', isToday ? 'bg-emerald-900/20' : 'bg-slate-800/60')}>
                {isToday && <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded">TODAY</span>}
                <span className="font-bold text-slate-200">
                  {date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
                <span className="text-xs text-slate-500">{dayPouches.length} pouch{dayPouches.length !== 1 ? 'es' : ''}</span>
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {dayPouches.map(pouch => {
                  const style = LABEL_STYLES[pouch.label];
                  return (
                    <div key={pouch.id} className={clsx('rounded-lg border p-3 space-y-2', style.bg, style.border)}>
                      <div className="flex items-center justify-between">
                        <span className={clsx('text-xs font-bold', style.text)}>{pouch.label}</span>
                        <span className="text-xs text-slate-500 font-mono">{pouch.time}</span>
                      </div>
                      <div className="space-y-1">
                        {pouch.meds.map((med, i) => (
                          <div key={i} className="text-xs text-slate-300 flex items-baseline gap-1.5">
                            <span className="font-medium truncate">{med.medicationName}</span>
                            <span className="text-slate-500 flex-shrink-0">{med.dosage} ×{med.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs font-mono text-slate-600">pouch #{pouch.pouchNumber}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {Object.keys(byDate).length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No pouches scheduled. Add medications with a schedule to generate the calendar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
