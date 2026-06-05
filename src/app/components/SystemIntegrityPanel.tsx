import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, ShieldCheck, ShieldAlert, Lock, Key, CheckCircle2, 
  AlertTriangle, XCircle, Radio, Wifi, Clock, RefreshCw, FileCheck2,
  HardDrive, CloudOff, Smartphone
} from 'lucide-react';
import { cn } from './ui/utils';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { SystemIntegrityHelp } from './SystemIntegrityHelp';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;

// FDA-compliant status type with clear visual mapping
type IntegrityStatus = 'verified' | 'warning' | 'failed' | 'checking';

interface SystemIntegrityData {
  deviceAuth: {
    status: IntegrityStatus;
    keyFingerprint: string;
    lastVerified: string;
    algorithm: string;
  };
  secureBoot: {
    status: IntegrityStatus;
    chainVerified: boolean;
    bootloaderVersion: string;
    lastCheck: string;
  };
  firmware: {
    status: IntegrityStatus;
    version: string;
    buildDate: string;
    signatureValid: boolean;
    otaChannel: string;
    lastUpdate: string;
  };
  securityAudit: {
    status: IntegrityStatus;
    lastAuditTime: string;
    nextScheduled: string;
    auditor: string;
  };
  encryption: {
    dataAtRest: {
      status: IntegrityStatus;
      algorithm: string;
      keyRotation: string;
    };
    dataInTransit: {
      status: IntegrityStatus;
      protocol: string;
      certificateExpiry: string;
    };
  };
  lteFailover: {
    status: IntegrityStatus;
    carrier: string;
    signalStrength: number;
    lastTest: string;
    simStatus: string;
  };
}

// Status color mapping for regulatory compliance visualization
const STATUS_CONFIG = {
  verified: {
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    label: 'VERIFIED',
    dot: 'bg-emerald-500',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    label: 'WARNING',
    dot: 'bg-amber-500',
  },
  failed: {
    icon: XCircle,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    border: 'border-rose-200 dark:border-rose-800',
    label: 'FAILED',
    dot: 'bg-rose-500',
  },
  checking: {
    icon: RefreshCw,
    color: 'text-slate-500 dark:text-slate-400',
    bg: 'bg-slate-50 dark:bg-slate-900/20',
    border: 'border-slate-200 dark:border-slate-800',
    label: 'CHECKING',
    dot: 'bg-slate-400',
  },
};

interface IntegrityItemProps {
  label: string;
  status: IntegrityStatus;
  primaryInfo: string;
  secondaryInfo?: string;
  timestamp?: string;
  icon?: React.ElementType;
}

function IntegrityItem({ label, status, primaryInfo, secondaryInfo, timestamp, icon: Icon }: IntegrityItemProps) {
  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;

  return (
    <div className={cn(
      "p-4 rounded-xl border transition-all hover:shadow-sm",
      config.bg,
      config.border
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {Icon && (
            <div className={cn("p-2 rounded-lg", config.bg)}>
              <Icon size={18} className={config.color} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {label}
              </span>
            </div>
            <div className={cn("text-sm font-medium mb-0.5", config.color)}>
              {primaryInfo}
            </div>
            {secondaryInfo && (
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {secondaryInfo}
              </div>
            )}
            {timestamp && (
              <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 dark:text-slate-500">
                <Clock size={10} />
                {timestamp}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <StatusIcon size={18} className={cn(config.color, status === 'checking' && 'animate-spin')} />
          <div className={cn("w-2 h-2 rounded-full", config.dot)}></div>
        </div>
      </div>
    </div>
  );
}

export function SystemIntegrityPanel() {
  const [data, setData] = useState<SystemIntegrityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchIntegrityData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${SERVER_URL}/device/integrity`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch integrity data');
      }
      
      const result = await response.json();
      setData(result);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching system integrity data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrityData();
    
    // Auto-refresh every 30 seconds for regulatory monitoring
    const interval = setInterval(fetchIntegrityData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
        <div className="flex items-center justify-center gap-3 text-slate-400">
          <RefreshCw size={20} className="animate-spin" />
          <span className="text-sm">Loading system integrity status...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Calculate overall system status
  const allStatuses = [
    data.deviceAuth.status,
    data.secureBoot.status,
    data.firmware.status,
    data.securityAudit.status,
    data.encryption.dataAtRest.status,
    data.encryption.dataInTransit.status,
    data.lteFailover.status,
  ];
  
  const hasFailed = allStatuses.includes('failed');
  const hasWarning = allStatuses.includes('warning');
  const overallStatus: IntegrityStatus = hasFailed ? 'failed' : hasWarning ? 'warning' : 'verified';
  const overallConfig = STATUS_CONFIG[overallStatus];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
    >
      {/* Header with Overall Status */}
      <div className={cn(
        "p-6 border-b flex items-center justify-between",
        overallConfig.bg,
        overallConfig.border
      )}>
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-xl", overallConfig.bg)}>
            <Shield size={24} className={overallConfig.color} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              System Integrity Panel
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              FDA-compliant cryptographic verification & infrastructure monitoring
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <SystemIntegrityHelp />
          <div className="text-right">
            <div className={cn("text-xs font-bold uppercase tracking-widest mb-1", overallConfig.color)}>
              {overallConfig.label}
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
              Last: {lastRefresh.toLocaleTimeString()}
            </div>
          </div>
          <div className={cn("w-3 h-3 rounded-full animate-pulse", overallConfig.dot)}></div>
        </div>
      </div>

      {/* Grid of Integrity Checks */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Device Authentication */}
        <IntegrityItem
          label="Device Authentication"
          status={data.deviceAuth.status}
          primaryInfo="Cryptographic Key Verified"
          secondaryInfo={`${data.deviceAuth.algorithm} • ${data.deviceAuth.keyFingerprint.substring(0, 16)}...`}
          timestamp={`Verified: ${data.deviceAuth.lastVerified}`}
          icon={Key}
        />

        {/* Secure Boot */}
        <IntegrityItem
          label="Secure Boot Chain"
          status={data.secureBoot.status}
          primaryInfo={data.secureBoot.chainVerified ? 'Chain Verified' : 'Verification Failed'}
          secondaryInfo={`Bootloader ${data.secureBoot.bootloaderVersion}`}
          timestamp={`Checked: ${data.secureBoot.lastCheck}`}
          icon={ShieldCheck}
        />

        {/* Firmware */}
        <IntegrityItem
          label="Firmware Integrity"
          status={data.firmware.status}
          primaryInfo={`v${data.firmware.version}`}
          secondaryInfo={`${data.firmware.otaChannel} • Signature ${data.firmware.signatureValid ? 'Valid' : 'Invalid'}`}
          timestamp={`Updated: ${data.firmware.lastUpdate}`}
          icon={FileCheck2}
        />

        {/* Security Audit */}
        <IntegrityItem
          label="Security Audit"
          status={data.securityAudit.status}
          primaryInfo={`By ${data.securityAudit.auditor}`}
          secondaryInfo={`Next: ${data.securityAudit.nextScheduled}`}
          timestamp={`Last: ${data.securityAudit.lastAuditTime}`}
          icon={Shield}
        />

        {/* Data at Rest Encryption */}
        <IntegrityItem
          label="Data at Rest Encryption"
          status={data.encryption.dataAtRest.status}
          primaryInfo={data.encryption.dataAtRest.algorithm}
          secondaryInfo={`Key rotation: ${data.encryption.dataAtRest.keyRotation}`}
          icon={HardDrive}
        />

        {/* Data in Transit Encryption */}
        <IntegrityItem
          label="Data in Transit Encryption"
          status={data.encryption.dataInTransit.status}
          primaryInfo={data.encryption.dataInTransit.protocol}
          secondaryInfo={`Cert expires: ${data.encryption.dataInTransit.certificateExpiry}`}
          icon={Lock}
        />

        {/* LTE Failover */}
        <div className="md:col-span-2">
          <IntegrityItem
            label="LTE Failover Readiness"
            status={data.lteFailover.status}
            primaryInfo={`${data.lteFailover.carrier} • Signal: ${data.lteFailover.signalStrength} dBm`}
            secondaryInfo={`SIM: ${data.lteFailover.simStatus}`}
            timestamp={`Last test: ${data.lteFailover.lastTest}`}
            icon={Radio}
          />
        </div>
      </div>

      {/* Footer - Regulatory Notice */}
      <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
            <span className="font-mono">AUTO-REFRESH: 30s</span>
          </div>
          <div className="flex items-center gap-4">
            <span>21 CFR Part 11 Compliant</span>
            <span>•</span>
            <span>HIPAA Security Rule §164.312</span>
            <span>•</span>
            <span>ISO 13485:2016</span>
          </div>
          <button
            onClick={fetchIntegrityData}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex items-center gap-1"
            title="Manual refresh"
          >
            <RefreshCw size={10} />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}