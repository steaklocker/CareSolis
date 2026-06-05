import React, { useState, useEffect, useCallback } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import {
  RefreshCw, AlertTriangle, CheckCircle, Clock, Package,
  ChevronRight, X, Loader, AlertCircle, Phone, Building2,
  CalendarClock, Pill, ShieldAlert, Info
} from 'lucide-react';
import { clsx } from 'clsx';

const SERVER = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;
const REFILL_LEAD_DAYS = 7;

// ─── Types ────────────────────────────────────────────────────────────────────

interface PatientRefillRow {
  // med_fill fields
  id: string;
  patient_id: string;
  fill_date: string;
  pouches_loaded: number;
  pouches_per_day: number;
  recommended_fill_days: number;
  rx_refills_remaining: number;
  rx_expiry: string;
  pharmacy_name: string;
  pharmacy_contact: string;
  status: string;
  updated_at: string;
  // computed by server
  patientName: string;
  daysSupplied: number;
  daysElapsed: number;
  daysRemaining: number;
  runOutDate: string;
  renewalNeeded: boolean;
  renewalReason: string;
  pouchesToOrder: number;
}

type ModalState =
  | { kind: 'none' }
  | { kind: 'review'; row: PatientRefillRow }
  | { kind: 'sending' }
  | { kind: 'success'; row: PatientRefillRow }
  | { kind: 'filled'; row: PatientRefillRow; pouchesInput: string }
  | { kind: 'filledSuccess' };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusColor(status: string, daysRemaining: number) {
  if (status === 'Requested') return { ring: 'border-blue-500/50',  bg: 'bg-blue-900/20',  text: 'text-blue-300',  dot: 'bg-blue-400',  badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
  if (status === 'Urgent' || daysRemaining <= 3)               return { ring: 'border-rose-500/60',  bg: 'bg-rose-900/20',  text: 'text-rose-300',  dot: 'bg-rose-400',  badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
  if (status === 'Refill due' || daysRemaining <= REFILL_LEAD_DAYS) return { ring: 'border-amber-500/60', bg: 'bg-amber-900/20', text: 'text-amber-300', dot: 'bg-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
  return { ring: 'border-emerald-500/30', bg: 'bg-emerald-900/10', text: 'text-emerald-300', dot: 'bg-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
}

function fmtDate(iso: string) {
  return new Date(iso + 'T12:00:00Z').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function DaysBar({ daysRemaining, daysSupplied }: { daysRemaining: number; daysSupplied: number }) {
  const pct = Math.max(0, Math.min(100, (daysRemaining / daysSupplied) * 100));
  const color = daysRemaining <= 3 ? 'bg-rose-500' : daysRemaining <= REFILL_LEAD_DAYS ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mt-1">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Patient card ─────────────────────────────────────────────────────────────

function PatientCard({ row, onRequestRefill, onMarkFilled }: {
  row: PatientRefillRow;
  onRequestRefill: (row: PatientRefillRow) => void;
  onMarkFilled: (row: PatientRefillRow) => void;
}) {
  const colors = statusColor(row.status, row.daysRemaining);
  const isActionable = ['Urgent', 'Refill due'].includes(row.status);
  const isRequested = row.status === 'Requested';
  const isOK = !isActionable && !isRequested;

  return (
    <div className={clsx('rounded-xl border p-5 flex flex-col gap-3 transition-all', colors.ring, colors.bg)}>

      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold text-slate-100 text-sm">{row.patientName}</div>
          <div className="text-xs text-slate-500 mt-0.5">Patient #{row.patient_id}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={clsx('px-2 py-0.5 rounded-full text-xs font-bold border', colors.badge)}>
            {row.status}
          </span>
          {row.renewalNeeded && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
              <ShieldAlert size={10} />
              Renewal needed
            </span>
          )}
        </div>
      </div>

      {/* Days remaining */}
      <div>
        <div className="flex items-baseline gap-1.5">
          <span className={clsx('text-3xl font-black tabular-nums leading-none', colors.text)}>
            {row.daysRemaining}
          </span>
          <span className="text-slate-400 text-sm">days remaining</span>
        </div>
        <DaysBar daysRemaining={row.daysRemaining} daysSupplied={row.daysSupplied} />
        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
          <CalendarClock size={11} />
          Run-out {fmtDate(row.runOutDate)}
          <span className="ml-2 text-slate-600">·</span>
          <span className="text-slate-600">{row.daysElapsed}d elapsed of {row.daysSupplied}d supplied</span>
        </div>
      </div>

      {/* Pharmacy */}
      <div className="text-xs text-slate-500 flex items-center gap-1.5">
        <Building2 size={11} className="flex-shrink-0" />
        <span className="truncate">{row.pharmacy_name || '—'}</span>
        {row.pharmacy_contact && <span className="text-slate-600">· {row.pharmacy_contact}</span>}
      </div>

      {/* Rx info */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Pill size={11} />
          {row.rx_refills_remaining} refill{row.rx_refills_remaining !== 1 ? 's' : ''} left
        </span>
        <span>Rx expires {fmtDate(row.rx_expiry)}</span>
      </div>

      {/* Renewal banner — informational only, no prescriber action */}
      {row.renewalNeeded && (
        <div className="flex items-start gap-2 p-2.5 bg-purple-900/20 border border-purple-500/30 rounded-lg text-xs text-purple-300">
          <Info size={12} className="flex-shrink-0 mt-0.5" />
          <span>
            <strong>Pharmacy to contact prescriber.</strong> {row.renewalReason}.
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {isActionable && (
          <button
            onClick={() => onRequestRefill(row)}
            className={clsx(
              'flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors',
              row.status === 'Urgent'
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            )}
          >
            <Package size={14} />
            Request Refill
          </button>
        )}
        {isRequested && (
          <button
            onClick={() => onMarkFilled(row)}
            className="flex-1 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <CheckCircle size={14} />
            Mark Filled
          </button>
        )}
        {isOK && (
          <div className="flex-1 py-2 text-center text-xs text-slate-600 italic">
            No action needed
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Refill review modal ──────────────────────────────────────────────────────

function RefillModal({ modal, onBack, onConfirm, onClose, onFilledSubmit, onFilledInput }: {
  modal: ModalState;
  onBack: () => void;
  onConfirm: () => void;
  onClose: () => void;
  onFilledSubmit: () => void;
  onFilledInput: (v: string) => void;
}) {
  if (modal.kind === 'none') return null;

  const overlay = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm';

  if (modal.kind === 'sending') {
    return (
      <div className={overlay}>
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 text-emerald-400 animate-spin" />
          <div className="text-slate-300 text-sm">Sending refill request…</div>
        </div>
      </div>
    );
  }

  if (modal.kind === 'success') {
    return (
      <div className={overlay}>
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-8 flex flex-col items-center gap-4 max-w-sm w-full">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
          <div className="text-xl font-bold text-emerald-300">Refill Requested</div>
          <div className="text-sm text-slate-400 text-center">
            Request sent to <strong className="text-slate-200">{modal.row.pharmacy_name}</strong> for {modal.row.pouchesToOrder} pouches.
          </div>
          <button onClick={onClose} className="mt-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-sm transition-colors">
            Done
          </button>
        </div>
      </div>
    );
  }

  if (modal.kind === 'filledSuccess') {
    return (
      <div className={overlay}>
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-8 flex flex-col items-center gap-4 max-w-sm w-full">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
          <div className="text-xl font-bold text-emerald-300">Fill Recorded</div>
          <div className="text-sm text-slate-400 text-center">Countdown has been reset.</div>
          <button onClick={onClose} className="mt-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-sm transition-colors">
            Done
          </button>
        </div>
      </div>
    );
  }

  if (modal.kind === 'filled') {
    return (
      <div className={overlay}>
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-bold text-slate-100">Mark as Filled</div>
            <button onClick={onBack} className="text-slate-500 hover:text-slate-300"><X size={18} /></button>
          </div>
          <div className="text-sm text-slate-400">
            Enter the number of pouches loaded for <strong className="text-slate-200">{modal.row.patientName}</strong>.
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Pouches loaded</label>
            <input
              type="number"
              min={1}
              value={modal.pouchesInput}
              onChange={e => onFilledInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 text-sm focus:border-emerald-500 outline-none"
              autoFocus
            />
            {modal.row.pouches_per_day > 0 && modal.pouchesInput && (
              <div className="text-xs text-slate-500 mt-1">
                = {Math.floor(parseInt(modal.pouchesInput || '0') / modal.row.pouches_per_day)} days of supply
              </div>
            )}
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onBack} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold transition-colors">
              Back
            </button>
            <button
              onClick={onFilledSubmit}
              disabled={!modal.pouchesInput || parseInt(modal.pouchesInput) < 1}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Confirm Fill
            </button>
          </div>
        </div>
      </div>
    );
  }

  // modal.kind === 'review'
  const row = modal.row;
  const colors = statusColor(row.status, row.daysRemaining);

  return (
    <div className={overlay}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-bold text-slate-100">Review Refill Order</div>
            <div className="text-xs text-slate-500 mt-0.5">Step 2 of 2 — confirm before sending</div>
          </div>
          <button onClick={onBack} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Patient + status */}
        <div className={clsx('flex items-center justify-between p-3 rounded-xl border', colors.ring, colors.bg)}>
          <div>
            <div className="font-semibold text-slate-100">{row.patientName}</div>
            <div className={clsx('text-xs mt-0.5', colors.text)}>{row.status} · {row.daysRemaining} days remaining</div>
          </div>
          <span className={clsx('px-2 py-0.5 rounded-full text-xs font-bold border', colors.badge)}>{row.status}</span>
        </div>

        {/* Order details */}
        <div className="bg-slate-800/60 rounded-xl p-4 space-y-2 text-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Order Details</div>
          {[
            ['Pouches to order', `${row.pouchesToOrder} pouches`],
            ['Pouches / day', `${row.pouches_per_day}`],
            ['Recommended fill', `${row.recommended_fill_days} days`],
            ['Pharmacy', row.pharmacy_name || '—'],
            ['Contact', row.pharmacy_contact || '—'],
            ['Rx refills remaining', `${row.rx_refills_remaining} (will decrement to ${Math.max(0, row.rx_refills_remaining - 1)})`],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-baseline gap-4">
              <span className="text-slate-500">{label}</span>
              <span className="text-slate-200 font-medium text-right">{value}</span>
            </div>
          ))}
        </div>

        {/* Renewal notice */}
        {row.renewalNeeded && (
          <div className="flex items-start gap-2 p-3 bg-purple-900/20 border border-purple-500/30 rounded-xl text-xs text-purple-300">
            <ShieldAlert size={13} className="flex-shrink-0 mt-0.5" />
            <span><strong>Pharmacy to contact prescriber.</strong> {row.renewalReason}. This refill request does not contact the prescriber.</span>
          </div>
        )}

        {/* Pharmacy stub notice */}
        <div className="flex items-start gap-2 p-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-slate-500">
          <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
          Pharmacy channel is stubbed — real integration pending. Request will be logged in Supabase.
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button onClick={onBack} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-sm transition-colors">
            Back
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <ChevronRight size={16} />
            Confirm &amp; Send
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function RefillsMonitor() {
  const [patients, setPatients] = useState<PatientRefillRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ kind: 'none' });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${SERVER}/refills`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      if (!res.ok) throw new Error(`Server error ${res.status}: ${await res.text()}`);
      const { patients: rows } = await res.json();
      setPatients(rows);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[RefillsMonitor] load error:', msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Step 1: open review modal
  const handleRequestRefill = (row: PatientRefillRow) => {
    setModal({ kind: 'review', row });
  };

  // Step 2: confirm & send
  const handleConfirmSend = async () => {
    if (modal.kind !== 'review') return;
    const row = modal.row;
    setModal({ kind: 'sending' });
    try {
      const res = await fetch(`${SERVER}/refills/request`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: row.patient_id }),
      });
      if (!res.ok) throw new Error(await res.text());
      setModal({ kind: 'success', row });
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[RefillsMonitor] request error:', msg);
      setModal({ kind: 'review', row });
      setError(`Request failed: ${msg}`);
    }
  };

  const handleMarkFilled = (row: PatientRefillRow) => {
    setModal({ kind: 'filled', row, pouchesInput: String(row.pouchesToOrder) });
  };

  const handleFilledSubmit = async () => {
    if (modal.kind !== 'filled') return;
    const { row, pouchesInput } = modal;
    const pouches = parseInt(pouchesInput);
    if (!pouches || pouches < 1) return;
    setModal({ kind: 'sending' });
    try {
      const res = await fetch(`${SERVER}/refills/filled`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: row.patient_id, pouches_loaded: pouches }),
      });
      if (!res.ok) throw new Error(await res.text());
      setModal({ kind: 'filledSuccess' });
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setModal({ kind: 'filled', row, pouchesInput });
      setError(`Fill error: ${msg}`);
    }
  };

  const closeModal = () => { setModal({ kind: 'none' }); load(); };

  // Summary counts
  const urgentCount = patients.filter(p => p.daysRemaining <= 3 && p.status !== 'Requested').length;
  const dueCount = patients.filter(p => p.daysRemaining > 3 && p.daysRemaining <= REFILL_LEAD_DAYS && p.status !== 'Requested').length;
  const renewalCount = patients.filter(p => p.renewalNeeded).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            Refills Monitor
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Calendar-based tracking · {patients.length} patient{patients.length !== 1 ? 's' : ''} · sorted by days remaining
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
        >
          <RefreshCw className={clsx('w-3.5 h-3.5', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Summary strip */}
      {patients.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Urgent',        value: urgentCount,  color: 'text-rose-400',    bg: 'bg-rose-900/20 border-rose-500/30' },
            { label: 'Refill due',    value: dueCount,     color: 'text-amber-400',   bg: 'bg-amber-900/20 border-amber-500/30' },
            { label: 'Renewal needed', value: renewalCount, color: 'text-purple-400', bg: 'bg-purple-900/20 border-purple-500/30' },
          ].map(s => (
            <div key={s.label} className={clsx('rounded-xl border p-4 text-center', s.bg)}>
              <div className={clsx('text-2xl font-black', s.color)}>{s.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-rose-900/20 border border-rose-500/30 rounded-xl text-sm text-rose-300">
          <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-rose-500 hover:text-rose-300"><X size={14} /></button>
        </div>
      )}

      {/* Loading */}
      {loading && patients.length === 0 && (
        <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
          <Loader className="w-5 h-5 animate-spin" />
          Loading refill data…
        </div>
      )}

      {/* Patient cards */}
      {!loading && patients.length === 0 && !error && (
        <div className="text-center py-16 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
          <Package size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No patient fill data yet.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map(row => (
          <PatientCard
            key={row.patient_id}
            row={row}
            onRequestRefill={handleRequestRefill}
            onMarkFilled={handleMarkFilled}
          />
        ))}
      </div>

      {/* Note: caregiver read-only view is out of scope for V1 */}
      <p className="text-xs text-slate-600 italic">
        Tracking is calendar-based. No device telemetry in V1.
        Capacity estimates are conservative, pending device calibration.
      </p>

      {/* Modal */}
      <RefillModal
        modal={modal}
        onBack={() => setModal(modal.kind === 'review' ? { kind: 'none' } : modal.kind === 'filled' ? { kind: 'none' } : { kind: 'none' })}
        onConfirm={handleConfirmSend}
        onClose={closeModal}
        onFilledSubmit={handleFilledSubmit}
        onFilledInput={v => modal.kind === 'filled' && setModal({ ...modal, pouchesInput: v })}
      />
    </div>
  );
}
