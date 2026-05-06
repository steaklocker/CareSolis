import { useState, useEffect } from 'react';
import { 
  Scan, 
  Camera, 
  CalendarClock, 
  CheckSquare, 
  XSquare,
  AlertTriangle,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { clsx } from 'clsx';

/**
 * FDA COMPLIANCE PANEL - FOUR QUICK WINS
 * 
 * 1. Barcode/NDC Verification
 * 2. Expiration Tracking & Alerts
 * 3. Photo Documentation
 * 4. Completion Checklist
 */

interface FDACompliancePanelProps {
  medicationId: string;
  medicationName: string;
  dosage: string;
  onCompletionChange?: (completed: boolean) => void;
}

interface BarcodeVerification {
  verified: boolean;
  ndc: string;
  timestamp: string;
}

export function FDACompliancePanel({
  medicationId,
  medicationName,
  dosage,
  onCompletionChange
}: FDACompliancePanelProps) {
  const [barcodeData, setBarcodeData] = useState<BarcodeVerification | null>(null);
  const [expirationDate, setExpirationDate] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);

  // Load stored data on mount
  useEffect(() => {
    const loadedData = loadMedicationData(medicationId);
    if (loadedData.barcode) setBarcodeData(loadedData.barcode);
    if (loadedData.expiration) setExpirationDate(loadedData.expiration);
    if (loadedData.photo) setPhotoUrl(loadedData.photo);
    if (loadedData.complete) setIsComplete(loadedData.complete);
  }, [medicationId]);

  // Save data whenever it changes
  useEffect(() => {
    saveMedicationData(medicationId, {
      barcode: barcodeData,
      expiration: expirationDate,
      photo: photoUrl,
      complete: isComplete
    });
    onCompletionChange?.(isComplete);
  }, [barcodeData, expirationDate, photoUrl, isComplete]);

  // Barcode verification handler
  const handleBarcodeVerify = () => {
    const ndc = prompt(`Scan or enter NDC barcode for ${medicationName} ${dosage}:`);
    if (ndc) {
      setBarcodeData({
        verified: true,
        ndc,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Expiration date handler
  const handleExpirationDate = () => {
    const expDate = prompt('Enter expiration date (MM/YYYY):');
    if (expDate) {
      setExpirationDate(expDate);
    }
  };

  // Photo upload handler
  const handlePhotoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setPhotoUrl(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Completion toggle
  const handleToggleComplete = () => {
    setIsComplete(!isComplete);
  };

  // Check expiration status
  const getExpirationStatus = () => {
    if (!expirationDate) return 'none';
    
    const [month, year] = expirationDate.split('/').map(Number);
    const expDate = new Date(year, month - 1);
    const today = new Date();
    const daysUntil = Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return 'expired';
    if (daysUntil < 30) return 'expiring-soon';
    return 'ok';
  };

  const expirationStatus = getExpirationStatus();

  return (
    <div className="space-y-3">
      {/* Action Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {/* Barcode Verification */}
        <button
          onClick={handleBarcodeVerify}
          className={clsx(
            "px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 justify-center",
            barcodeData?.verified
              ? "bg-emerald-600/20 text-emerald-300 border border-emerald-600/50"
              : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-blue-500/50"
          )}
        >
          <Scan className="w-4 h-4" />
          {barcodeData?.verified ? "✓ Verified" : "Scan NDC"}
        </button>

        {/* Expiration Date */}
        <button
          onClick={handleExpirationDate}
          className={clsx(
            "px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 justify-center",
            expirationStatus === 'expired'
              ? "bg-rose-600/20 text-rose-300 border border-rose-600/50"
              : expirationStatus === 'expiring-soon'
              ? "bg-amber-600/20 text-amber-300 border border-amber-600/50"
              : expirationDate
              ? "bg-emerald-600/20 text-emerald-300 border border-emerald-600/50"
              : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-amber-500/50"
          )}
        >
          <CalendarClock className="w-4 h-4" />
          {expirationDate || "Add Exp"}
        </button>

        {/* Photo Upload */}
        <button
          onClick={handlePhotoUpload}
          className={clsx(
            "px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 justify-center",
            photoUrl
              ? "bg-emerald-600/20 text-emerald-300 border border-emerald-600/50"
              : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-purple-500/50"
          )}
        >
          <Camera className="w-4 h-4" />
          {photoUrl ? "✓ Photo" : "Add Photo"}
        </button>

        {/* Complete Checkbox */}
        <button
          onClick={handleToggleComplete}
          className={clsx(
            "px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 justify-center",
            isComplete
              ? "bg-emerald-600 text-white border border-emerald-600"
              : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-emerald-500/50"
          )}
        >
          {isComplete ? <CheckSquare className="w-4 h-4" /> : <XSquare className="w-4 h-4" />}
          {isComplete ? "Done" : "Mark"}
        </button>
      </div>

      {/* Verification Details */}
      {barcodeData?.verified && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded px-3 py-2 text-xs text-blue-300">
          <strong>NDC:</strong> {barcodeData.ndc} • <strong>Verified:</strong> {new Date(barcodeData.timestamp).toLocaleString()}
        </div>
      )}

      {/* Expiration Warnings */}
      {expirationStatus === 'expired' && (
        <div className="bg-rose-900/20 border border-rose-500/30 rounded px-3 py-2 text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <div>
            <strong>EXPIRED</strong> - Do not use. Contact pharmacy for replacement immediately.
          </div>
        </div>
      )}

      {expirationStatus === 'expiring-soon' && (
        <div className="bg-amber-900/20 border border-amber-500/30 rounded px-3 py-2 text-xs text-amber-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <div>
            <strong>Expiring Soon</strong> ({expirationDate}) - Order refill now to avoid gaps in medication.
          </div>
        </div>
      )}

      {/* Photo Thumbnail */}
      {photoUrl && (
        <div className="border border-slate-700 rounded-lg overflow-hidden">
          <img 
            src={photoUrl} 
            alt={`${medicationName} verification photo`}
            className="w-full h-32 object-cover"
            onClick={() => window.open(photoUrl, '_blank')}
            style={{ cursor: 'pointer' }}
          />
          <div className="bg-slate-800/50 px-3 py-2 text-xs text-slate-400">
            Click to view full size
          </div>
        </div>
      )}
    </div>
  );
}

// Dashboard component showing overall completion
interface FDADashboardProps {
  medications: Array<{ id: string }>;
}

export function FDAComplianceDashboard({ medications }: FDADashboardProps) {
  const [stats, setStats] = useState({
    barcodeVerified: 0,
    expirationTracked: 0,
    photosCaptured: 0,
    fillCompleted: 0
  });

  useEffect(() => {
    const newStats = {
      barcodeVerified: 0,
      expirationTracked: 0,
      photosCaptured: 0,
      fillCompleted: 0
    };

    medications.forEach(med => {
      const data = loadMedicationData(med.id);
      if (data.barcode?.verified) newStats.barcodeVerified++;
      if (data.expiration) newStats.expirationTracked++;
      if (data.photo) newStats.photosCaptured++;
      if (data.complete) newStats.fillCompleted++;
    });

    setStats(newStats);
  }, [medications]);

  const totalMeds = medications.length || 1; // Prevent division by zero
  const completionPercentage = Math.round((stats.fillCompleted / totalMeds) * 100);

  return (
    <div className="bg-gradient-to-r from-emerald-900/20 to-blue-900/20 border-2 border-emerald-500/30 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            FDA Compliance Tracking
          </h3>
          <p className="text-xs text-slate-400 mt-1">Real-time verification • Photo documentation • Audit trail</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-emerald-400">{completionPercentage}%</div>
          <div className="text-xs text-slate-400">Complete</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <Scan className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-slate-300">Barcode Verified</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {stats.barcodeVerified}/{totalMeds}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <CalendarClock className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-slate-300">Expiration Tracked</span>
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {stats.expirationTracked}/{totalMeds}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <Camera className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-slate-300">Photos Captured</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {stats.photosCaptured}/{totalMeds}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-300">Fill Completed</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {stats.fillCompleted}/{totalMeds}
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility functions for localStorage
function loadMedicationData(medId: string) {
  const stored = localStorage.getItem(`caresolis_fda_${medId}`);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    barcode: null,
    expiration: '',
    photo: '',
    complete: false
  };
}

function saveMedicationData(medId: string, data: any) {
  localStorage.setItem(`caresolis_fda_${medId}`, JSON.stringify(data));
}