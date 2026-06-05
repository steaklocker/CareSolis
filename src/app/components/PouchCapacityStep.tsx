import React, { useState, useCallback } from 'react';
import { Plus, Trash2, Package, AlertTriangle, CheckCircle2, Clock, ChevronDown, Layers } from 'lucide-react';

// ─── PLACEHOLDER constants — replace with bench-measured values before clinical use ──
const DEVICE_W_IN   = 12;    // device outer width  (inches)
const DEVICE_D_IN   = 8.5;   // device outer depth  (inches)
const DEVICE_H_IN   = 5;     // device outer height (inches)
const CASSETTE_H_IN = 4.5;   // usable cassette stacking height (inches)
const POUCHES_PER_FOLD = 2;  // pouches per accordion fold layer (2-over-2)
const BASE_POUCH_MM = 1.5;   // base pouch seal thickness (mm)
const PER_PILL_MM: Record<SizeClass, number> = {
  Small:    0.8,
  Standard: 1.4,
  Large:    2.2,
  XL:       3.2,
};
const SAFETY_FACTOR = 0.9;   // headroom multiplier for cassette height
// ─────────────────────────────────────────────────────────────────────────────────────

const MM_PER_IN = 25.4;
const CASSETTE_H_MM = CASSETTE_H_IN * MM_PER_IN;            // 114.3 mm
const CASSETTE_USABLE_MM = CASSETTE_H_MM * SAFETY_FACTOR;   // 102.87 mm

export type SizeClass = 'Small' | 'Standard' | 'Large' | 'XL';
export type PresetDoseTime = 'Morning' | 'Noon' | 'Evening' | 'Bedtime';
const PRESET_TIMES: PresetDoseTime[] = ['Morning', 'Noon', 'Evening', 'Bedtime'];

export interface MedicationEntry {
  id: string;
  name: string;
  strength: string;
  pillsPerDose: number;
  doseTimes: string[];
  sizeClass: SizeClass;
}

interface DoseEvent {
  time: string;
  meds: Array<{ name: string; pills: number; sizeClass: SizeClass }>;
  pouchThicknessMm: number;
}

/** One fold layer = POUCHES_PER_FOLD consecutive pouches folded over each other */
interface FoldLayer {
  layerIndex: number;
  pouches: DoseEvent[];        // always length <= POUCHES_PER_FOLD
  layerThicknessMm: number;   // sum of constituent pouch thicknesses
  layerHeightIn: number;      // layerThicknessMm / MM_PER_IN
  cumulativeHeightIn: number; // stack height after this layer
}

interface CapacityResult {
  doseEvents: DoseEvent[];
  pouchesPerDay: number;
  stackMmPerDay: number;
  stackInPerDay: number;
  foldLayersPerDay: number;
  daysByCassetteHeight: number;
  cassetteUsableMm: number;
  cassetteFillPct: number;    // for one day's worth
  cassetteDays: number;       // floor(usable / daily_stack)
  withinCapacity: boolean;
  /** Fold visualisation for one day's pouches */
  foldLayers: FoldLayer[];
}

function calcCapacity(meds: MedicationEntry[]): CapacityResult | null {
  if (meds.length === 0) return null;

  const timeSet = new Set<string>();
  meds.forEach(m => m.doseTimes.forEach(t => timeSet.add(t)));
  const times = Array.from(timeSet).sort();
  if (times.length === 0) return null;

  const doseEvents: DoseEvent[] = times.map(time => {
    const medsAtTime = meds
      .filter(m => m.doseTimes.includes(time))
      .map(m => ({ name: m.name, pills: m.pillsPerDose, sizeClass: m.sizeClass }));
    const pillMm = medsAtTime.reduce((s, m) => s + m.pills * PER_PILL_MM[m.sizeClass], 0);
    return { time, meds: medsAtTime, pouchThicknessMm: BASE_POUCH_MM + pillMm };
  });

  const pouchesPerDay  = doseEvents.length;
  const stackMmPerDay  = doseEvents.reduce((s, e) => s + e.pouchThicknessMm, 0);
  const stackInPerDay  = stackMmPerDay / MM_PER_IN;

  // Build fold layers for one day's pouches
  const foldLayers: FoldLayer[] = [];
  let cumIn = 0;
  for (let i = 0; i < doseEvents.length; i += POUCHES_PER_FOLD) {
    const slice = doseEvents.slice(i, i + POUCHES_PER_FOLD);
    const layerMm = slice.reduce((s, e) => s + e.pouchThicknessMm, 0);
    const layerIn = layerMm / MM_PER_IN;
    cumIn += layerIn;
    foldLayers.push({
      layerIndex: foldLayers.length,
      pouches: slice,
      layerThicknessMm: layerMm,
      layerHeightIn: layerIn,
      cumulativeHeightIn: cumIn,
    });
  }

  const foldLayersPerDay      = foldLayers.length;
  const cassetteDays          = Math.floor(CASSETTE_USABLE_MM / stackMmPerDay);
  const cassetteFillPct       = Math.min(100, (stackMmPerDay / CASSETTE_USABLE_MM) * 100);
  const daysByCassetteHeight  = cassetteDays;

  return {
    doseEvents,
    pouchesPerDay,
    stackMmPerDay,
    stackInPerDay,
    foldLayersPerDay,
    daysByCassetteHeight,
    cassetteUsableMm: CASSETTE_USABLE_MM,
    cassetteFillPct,
    cassetteDays,
    withinCapacity: cassetteDays >= 1,
    foldLayers,
  };
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ─── Custom time picker ───────────────────────────────────────────────────────

function CustomTimeInput({ onAdd }: { onAdd: (t: string) => void }) {
  const [h, setH] = useState('08');
  const [m, setM] = useState('00');
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const mins  = ['00', '15', '30', '45'];
  return (
    <div className="flex items-center gap-2 mt-2">
      <select value={h} onChange={e => setH(e.target.value)}
        className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-slate-100 text-sm">
        {hours.map(hr => <option key={hr} value={hr}>{hr}</option>)}
      </select>
      <span className="text-slate-400 font-bold">:</span>
      <select value={m} onChange={e => setM(e.target.value)}
        className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-slate-100 text-sm">
        {mins.map(mn => <option key={mn} value={mn}>{mn}</option>)}
      </select>
      <button type="button" onClick={() => onAdd(`${h}:${m}`)}
        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded font-medium transition-colors">
        Add
      </button>
    </div>
  );
}

// ─── Medication card ──────────────────────────────────────────────────────────

interface MedCardProps {
  med: MedicationEntry;
  onChange: (u: MedicationEntry) => void;
  onRemove: () => void;
  index: number;
}

function MedCard({ med, onChange, onRemove, index }: MedCardProps) {
  const [showCustomTime, setShowCustomTime] = useState(false);
  const customTimes = med.doseTimes.filter(t => !(PRESET_TIMES as string[]).includes(t));

  const toggleTime = (t: string) => {
    const has = med.doseTimes.includes(t);
    onChange({ ...med, doseTimes: has ? med.doseTimes.filter(x => x !== t) : [...med.doseTimes, t] });
  };
  const addCustom = (t: string) => {
    if (!med.doseTimes.includes(t)) onChange({ ...med, doseTimes: [...med.doseTimes, t] });
    setShowCustomTime(false);
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Medication {index + 1}</span>
        <button type="button" onClick={onRemove}
          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Name <span className="text-rose-400">*</span></label>
          <input type="text" value={med.name} onChange={e => onChange({ ...med, name: e.target.value })}
            placeholder="e.g., Metformin"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:border-emerald-500 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Strength</label>
          <input type="text" value={med.strength} onChange={e => onChange({ ...med, strength: e.target.value })}
            placeholder="e.g., 500 mg"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:border-emerald-500 outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Pills per dose <span className="text-rose-400">*</span></label>
          <input type="number" min={1} max={20} value={med.pillsPerDose}
            onChange={e => onChange({ ...med, pillsPerDose: Math.max(1, parseInt(e.target.value) || 1) })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 text-sm focus:border-emerald-500 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Pill size class</label>
          <div className="relative">
            <select value={med.sizeClass} onChange={e => onChange({ ...med, sizeClass: e.target.value as SizeClass })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 text-sm focus:border-emerald-500 outline-none appearance-none pr-7">
              {(Object.keys(PER_PILL_MM) as SizeClass[]).map(s => (
                <option key={s} value={s}>{s} ({PER_PILL_MM[s]} mm/pill)</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-2">Dose times <span className="text-rose-400">*</span></label>
        <div className="flex flex-wrap gap-2">
          {PRESET_TIMES.map(t => (
            <button key={t} type="button" onClick={() => toggleTime(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                med.doseTimes.includes(t)
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-700 border-slate-600 text-slate-400 hover:border-blue-500'
              }`}>
              {t}
            </button>
          ))}
        </div>
        {customTimes.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {customTimes.map(t => (
              <span key={t} className="flex items-center gap-1 px-3 py-1 bg-purple-600/20 border border-purple-500/40 text-purple-300 rounded-lg text-xs font-semibold">
                <Clock size={11} />{t}
                <button type="button" onClick={() => onChange({ ...med, doseTimes: med.doseTimes.filter(x => x !== t) })}
                  className="ml-1 hover:text-rose-400 transition-colors">×</button>
              </span>
            ))}
          </div>
        )}
        <button type="button" onClick={() => setShowCustomTime(v => !v)}
          className="mt-2 text-xs text-slate-400 hover:text-emerald-400 transition-colors underline underline-offset-2">
          {showCustomTime ? 'Cancel' : '+ Custom time (HH:MM)'}
        </button>
        {showCustomTime && <CustomTimeInput onAdd={addCustom} />}
      </div>
    </div>
  );
}

// ─── Fold cross-section visualiser ───────────────────────────────────────────

const FOLD_COLORS = [
  'bg-teal-500/50 border-teal-400/60',
  'bg-blue-500/50 border-blue-400/60',
  'bg-purple-500/50 border-purple-400/60',
  'bg-amber-500/50 border-amber-400/60',
  'bg-emerald-500/50 border-emerald-400/60',
  'bg-rose-500/50 border-rose-400/60',
];

function FoldVisualiser({ result }: { result: CapacityResult }) {
  const cassettePx = 200;   // pixel height of cassette graphic
  const stackUsedPx = (result.stackMmPerDay / CASSETTE_USABLE_MM) * cassettePx;

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 space-y-4">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <Layers size={13} />
        Cassette Cross-section — 1 day's pouches
      </div>

      <div className="flex gap-6 items-end">
        {/* Cassette outline */}
        <div className="flex-shrink-0 relative" style={{ width: 64, height: cassettePx }}>
          {/* Cassette shell */}
          <div className="absolute inset-0 border-2 border-slate-500 rounded-lg bg-slate-900/50 overflow-hidden">
            {/* Safety headroom band at top */}
            <div
              className="absolute top-0 left-0 right-0 bg-amber-500/10 border-b border-amber-500/30"
              style={{ height: cassettePx - stackUsedPx }}
            />
            {/* Fold layers stacked from bottom */}
            <div className="absolute bottom-0 left-0 right-0 flex flex-col-reverse">
              {result.foldLayers.map((layer, i) => {
                const layerPx = Math.max(2, (layer.layerThicknessMm / CASSETTE_USABLE_MM) * cassettePx);
                return (
                  <div
                    key={i}
                    className={`w-full border-t ${FOLD_COLORS[i % FOLD_COLORS.length]} flex items-center justify-center`}
                    style={{ height: layerPx }}
                    title={`Layer ${i + 1}: ${layer.pouches.map(p => p.time).join(' + ')} (${layer.layerThicknessMm.toFixed(1)} mm)`}
                  />
                );
              })}
            </div>
          </div>
          {/* Height dimension arrows */}
          <div className="absolute -right-6 top-0 bottom-0 flex flex-col items-center justify-center">
            <div className="w-px flex-1 bg-slate-600" />
            <span className="text-xs text-slate-500 rotate-90 my-1 whitespace-nowrap">{CASSETTE_H_IN}"</span>
            <div className="w-px flex-1 bg-slate-600" />
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-1.5 min-w-0">
          {result.foldLayers.map((layer, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className={`w-3 h-3 rounded-sm flex-shrink-0 border ${FOLD_COLORS[i % FOLD_COLORS.length]}`} />
              <span className="text-slate-400 flex-shrink-0">Fold {i + 1}</span>
              <span className="text-slate-500">
                {layer.pouches.map(p => p.time).join(' + ')}
              </span>
              <span className="text-slate-600 flex-shrink-0 ml-auto font-mono">
                {layer.layerThicknessMm.toFixed(1)} mm
              </span>
            </div>
          ))}

          {/* Headroom row */}
          <div className="flex items-center gap-2 text-xs pt-1 border-t border-slate-700">
            <span className="w-3 h-3 rounded-sm flex-shrink-0 border bg-amber-500/10 border-amber-500/30" />
            <span className="text-amber-400/70">Headroom ({Math.round(100 - result.cassetteFillPct)}%)</span>
            <span className="ml-auto font-mono text-slate-600">
              {(CASSETTE_USABLE_MM - result.stackMmPerDay).toFixed(1)} mm
            </span>
          </div>
        </div>
      </div>

      {/* Dimensions reference */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
        {[
          ['Device', `${DEVICE_W_IN}" × ${DEVICE_D_IN}" × ${DEVICE_H_IN}"`],
          ['Cassette height', `${CASSETTE_H_IN}" (${CASSETTE_H_MM.toFixed(0)} mm)`],
          [`Usable (x${SAFETY_FACTOR})`, `${CASSETTE_USABLE_MM.toFixed(1)} mm`],
        ].map(([l, v]) => (
          <div key={l} className="bg-slate-700/40 rounded-lg px-2 py-1.5">
            <div className="text-slate-500">{l}</div>
            <div className="text-slate-300 font-medium mt-0.5">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Capacity results panel ───────────────────────────────────────────────────

function CapacityPanel({ result }: { result: CapacityResult }) {
  const dayColor =
    result.cassetteDays >= 28 ? 'text-emerald-400' :
    result.cassetteDays >= 14 ? 'text-amber-400' :
    'text-rose-400';

  const barColor =
    result.cassetteDays >= 28 ? 'bg-emerald-500' :
    result.cassetteDays >= 14 ? 'bg-amber-500' :
    'bg-rose-500';

  const barPct = Math.min(100, (result.cassetteDays / 30) * 100);

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${result.withinCapacity ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
            {result.withinCapacity
              ? <CheckCircle2 size={20} className="text-emerald-400" />
              : <AlertTriangle size={20} className="text-rose-400" />}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-300">Cassette Capacity Estimate</div>
            <div className="text-xs text-slate-500">
              PLACEHOLDER constants — bench-measure before production
            </div>
          </div>
        </div>

        {/* Big number */}
        <div className="text-center py-1">
          <div className={`text-6xl font-black tabular-nums ${dayColor}`}>{result.cassetteDays}</div>
          <div className="text-slate-400 text-sm mt-1">days of supply per cassette load</div>
        </div>

        {/* Bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1"><span>0</span><span>30 days</span></div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${barPct}%` }} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 text-center">
          {[
            { label: 'Pouches/day',   value: result.pouchesPerDay },
            { label: 'Fold layers/day', value: result.foldLayersPerDay },
            { label: 'Stack/day',     value: `${result.stackMmPerDay.toFixed(1)} mm` },
            { label: 'Stack/day',     value: `${result.stackInPerDay.toFixed(3)}"` },
          ].map(s => (
            <div key={s.label + s.value} className="bg-slate-700/60 rounded-lg p-3">
              <div className="text-lg font-bold text-slate-100">{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Cassette fill for one day */}
        <div className="text-xs text-slate-500 text-center">
          One day fills <strong className="text-slate-300">{result.cassetteFillPct.toFixed(1)}%</strong> of usable cassette height
          ({CASSETTE_USABLE_MM.toFixed(0)} mm available)
        </div>

        {/* Dose events */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Dose events ({result.doseEvents.length}/day)
          </div>
          <div className="space-y-1">
            {result.doseEvents.map((ev, i) => (
              <div key={i} className="flex items-center gap-3 text-sm bg-slate-700/40 rounded-lg px-3 py-2">
                <Clock size={13} className="text-slate-400 shrink-0" />
                <span className="font-medium text-slate-200 w-20 shrink-0">{ev.time}</span>
                <span className="text-slate-400 flex-1 truncate">
                  {ev.meds.map(m => `${m.pills}× ${m.name || '(unnamed)'}`).join(', ')}
                </span>
                <span className="text-xs font-mono text-slate-400 shrink-0">
                  {ev.pouchThicknessMm.toFixed(1)} mm
                </span>
              </div>
            ))}
          </div>
        </div>

        {!result.withinCapacity && (
          <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>
              Daily stack exceeds usable cassette height. Reduce pills per dose, consolidate dose times,
              or select a smaller size class where clinically appropriate.
            </span>
          </div>
        )}
      </div>

      {/* Fold visualiser */}
      <FoldVisualiser result={result} />
    </div>
  );
}

// ─── Main exported step ───────────────────────────────────────────────────────

interface PouchCapacityStepProps {
  medications: MedicationEntry[];
  onChange: (meds: MedicationEntry[]) => void;
  roleLabel?: string;
}

export function PouchCapacityStep({ medications, onChange, roleLabel }: PouchCapacityStepProps) {
  const result = calcCapacity(medications);

  const addMed = useCallback(() => {
    onChange([...medications, { id: uid(), name: '', strength: '', pillsPerDose: 1, doseTimes: [], sizeClass: 'Standard' }]);
  }, [medications, onChange]);

  const updateMed = useCallback((id: string, updated: MedicationEntry) => {
    onChange(medications.map(m => m.id === id ? updated : m));
  }, [medications, onChange]);

  const removeMed = useCallback((id: string) => {
    onChange(medications.filter(m => m.id !== id));
  }, [medications, onChange]);

  return (
    <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-700 flex items-center gap-4">
        <div className="p-3 bg-purple-500/20 rounded-xl">
          <Package size={28} className="text-purple-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Pouch Capacity Estimator</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {POUCHES_PER_FOLD}-over-{POUCHES_PER_FOLD} accordion fold · {CASSETTE_H_IN}" cassette ·{' '}
            device {DEVICE_W_IN}" × {DEVICE_D_IN}" × {DEVICE_H_IN}"
            {roleLabel && (
              <span className="ml-2 px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs font-medium">{roleLabel}</span>
            )}
          </p>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Disclaimer */}
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-300">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>
            All thickness values are <strong>PLACEHOLDER</strong>. Replace{' '}
            <code className="text-xs bg-amber-500/10 px-1 rounded">BASE_POUCH_MM</code>,{' '}
            <code className="text-xs bg-amber-500/10 px-1 rounded">PER_PILL_MM</code>, and{' '}
            <code className="text-xs bg-amber-500/10 px-1 rounded">CASSETTE_H_IN</code>{' '}
            with bench-measured values before clinical use.
          </span>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Medication list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Medications ({medications.length})
              </h3>
              <button type="button" onClick={addMed}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors">
                <Plus size={14} /> Add Medication
              </button>
            </div>

            {medications.length === 0 && (
              <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                <Package size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No medications added yet.</p>
              </div>
            )}

            {medications.map((med, idx) => (
              <MedCard key={med.id} med={med} index={idx}
                onChange={u => updateMed(med.id, u)}
                onRemove={() => removeMed(med.id)} />
            ))}
          </div>

          {/* Results */}
          <div className="lg:sticky lg:top-4">
            {result ? (
              <CapacityPanel result={result} />
            ) : (
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center text-slate-500">
                <Package size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Add at least one medication with a dose time to see the estimate.</p>
              </div>
            )}
          </div>
        </div>

        {/* Constants reference */}
        <details className="group">
          <summary className="text-xs text-slate-500 cursor-pointer select-none hover:text-slate-400 list-none flex items-center gap-1">
            <ChevronDown size={13} className="group-open:rotate-180 transition-transform" />
            Active calculation constants (PLACEHOLDER)
          </summary>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
            {[
              ['DEVICE',              `${DEVICE_W_IN}" × ${DEVICE_D_IN}" × ${DEVICE_H_IN}"`],
              ['CASSETTE_H_IN',       `${CASSETTE_H_IN}" = ${CASSETTE_H_MM.toFixed(1)} mm`],
              ['CASSETTE_USABLE_MM',  `${CASSETTE_USABLE_MM.toFixed(1)} mm (x${SAFETY_FACTOR})`],
              ['POUCHES_PER_FOLD',    String(POUCHES_PER_FOLD)],
              ['BASE_POUCH_MM',       String(BASE_POUCH_MM)],
              ['SAFETY_FACTOR',       String(SAFETY_FACTOR)],
              ...Object.entries(PER_PILL_MM).map(([k, v]) => [`PER_PILL_MM.${k}`, `${v} mm`]),
            ].map(([k, v]) => (
              <div key={k} className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5">
                <div className="text-slate-500">{k}</div>
                <div className="text-amber-400 font-bold">{v}</div>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
