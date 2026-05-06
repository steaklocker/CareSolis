import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Activity, 
  Globe, 
  Database, 
  Shield, 
  CheckCircle2, 
  Info, 
  Clock,
  AlertTriangle,
  Lock,
  Unlock,
  Eye,
  Bell,
  XCircle,
  Mic,
  Bot,
  Home,
  Smartphone,
  Calendar,
  FileText,
  Zap,
  User,
  Heart,
  Lightbulb,
  Video,
  Thermometer,
  Pill
} from 'lucide-react';
import { useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { clsx } from 'clsx';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;

// ==================== TYPES ====================

type PermissionScope = 'view_only' | 'alert_only' | 'view_and_alert';
type IntegrationStatus = 'pending_approval' | 'active' | 'expired' | 'revoked' | 'disabled';
type IntegrationType = 'voice_assistant' | 'robotic_caregiver' | 'smart_home' | 'mobile_app' | 'clinical_system';

interface ThirdPartyIntegration {
  id: string;
  name: string;
  type: IntegrationType;
  vendor: string;
  status: IntegrationStatus;
  permissionScope: PermissionScope | null;
  requestedAt: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  revokedBy: string | null;
  lastAccessAt: string | null;
  description: string;
  icon: React.ComponentType<any>;
}

interface ApprovalLog {
  id: string;
  integrationId: string;
  integrationName: string;
  action: 'approved' | 'revoked' | 'expired' | 'access_denied';
  performedBy: string;
  performedAt: string;
  permissionScope: PermissionScope | null;
  expirationDuration: number | null;
  reason: string | null;
}

// ==================== INITIAL DATA ====================

const INTEGRATION_ICONS: Record<IntegrationType, React.ComponentType<any>> = {
  voice_assistant: Mic,
  robotic_caregiver: Bot,
  smart_home: Home,
  mobile_app: Smartphone,
  clinical_system: FileText
};

const INITIAL_INTEGRATIONS: ThirdPartyIntegration[] = [
  {
    id: 'int-001',
    name: 'Amazon Alexa',
    type: 'voice_assistant',
    vendor: 'Amazon',
    status: 'pending_approval',
    permissionScope: null,
    requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    approvedAt: null,
    approvedBy: null,
    expiresAt: null,
    revokedAt: null,
    revokedBy: null,
    lastAccessAt: null,
    description: 'Voice-activated status checks and alerts',
    icon: Mic
  },
  {
    id: 'int-006',
    name: 'Siri',
    type: 'voice_assistant',
    vendor: 'Apple',
    status: 'active',
    permissionScope: 'alert_only',
    requestedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'Dr. Sarah Chen',
    expiresAt: new Date(Date.now() + 49 * 24 * 60 * 60 * 1000).toISOString(),
    revokedAt: null,
    revokedBy: null,
    lastAccessAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    description: 'iOS/Mac voice notifications for critical alerts',
    icon: Mic
  },
  {
    id: 'int-007',
    name: 'Apple Health',
    type: 'clinical_system',
    vendor: 'Apple',
    status: 'active',
    permissionScope: 'view_and_alert',
    requestedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'Dr. Sarah Chen',
    expiresAt: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000).toISOString(),
    revokedAt: null,
    revokedBy: null,
    lastAccessAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    description: 'Sync vitals from iPhone/Apple Watch (heart rate, steps, sleep)',
    icon: Heart
  },
  {
    id: 'int-008',
    name: 'Epic MyChart',
    type: 'clinical_system',
    vendor: 'Epic Systems',
    status: 'pending_approval',
    permissionScope: null,
    requestedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    approvedAt: null,
    approvedBy: null,
    expiresAt: null,
    revokedAt: null,
    revokedBy: null,
    lastAccessAt: null,
    description: 'EHR integration for clinical data exchange (FHIR compatible)',
    icon: FileText
  },
  {
    id: 'int-009',
    name: 'CVS Pharmacy API',
    type: 'clinical_system',
    vendor: 'CVS Health',
    status: 'active',
    permissionScope: 'view_only',
    requestedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'Dr. Sarah Chen',
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    revokedAt: null,
    revokedBy: null,
    lastAccessAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    description: 'Medication refill status and pickup notifications',
    icon: Pill
  },
  {
    id: 'int-010',
    name: 'Philips Hue',
    type: 'smart_home',
    vendor: 'Signify (Philips)',
    status: 'active',
    permissionScope: 'view_and_alert',
    requestedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'Dr. Sarah Chen',
    expiresAt: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
    revokedAt: null,
    revokedBy: null,
    lastAccessAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    description: 'Smart lighting patterns for circadian rhythm monitoring',
    icon: Lightbulb
  },
  {
    id: 'int-011',
    name: 'Ring Video Doorbell',
    type: 'smart_home',
    vendor: 'Amazon (Ring)',
    status: 'active',
    permissionScope: 'alert_only',
    requestedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'Dr. Sarah Chen',
    expiresAt: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
    revokedAt: null,
    revokedBy: null,
    lastAccessAt: new Date(Date.now() - 45 * 60 * 60 * 1000).toISOString(),
    description: 'Entry/exit pattern detection for activity monitoring',
    icon: Video
  },
  {
    id: 'int-012',
    name: 'Nest Thermostat',
    type: 'smart_home',
    vendor: 'Google Nest',
    status: 'disabled',
    permissionScope: null,
    requestedAt: null,
    approvedAt: null,
    approvedBy: null,
    expiresAt: null,
    revokedAt: null,
    revokedBy: null,
    lastAccessAt: null,
    description: 'Temperature monitoring for environmental wellness',
    icon: Thermometer
  },
  {
    id: 'int-002',
    name: 'CareBot Pro',
    type: 'robotic_caregiver',
    vendor: 'RoboticCare Inc.',
    status: 'active',
    permissionScope: 'view_and_alert',
    requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'Dr. Sarah Chen',
    expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    revokedAt: null,
    revokedBy: null,
    lastAccessAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    description: 'Autonomous monitoring robot with visual alerts',
    icon: Bot
  },
  {
    id: 'int-003',
    name: 'Google Home',
    type: 'voice_assistant',
    vendor: 'Google',
    status: 'expired',
    permissionScope: 'alert_only',
    requestedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 44 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'Dr. Sarah Chen',
    expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    revokedAt: null,
    revokedBy: null,
    lastAccessAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Voice notifications for missed interactions',
    icon: Mic
  },
  {
    id: 'int-004',
    name: 'SmartThings Hub',
    type: 'smart_home',
    vendor: 'Samsung',
    status: 'disabled',
    permissionScope: null,
    requestedAt: null,
    approvedAt: null,
    approvedBy: null,
    expiresAt: null,
    revokedAt: null,
    revokedBy: null,
    lastAccessAt: null,
    description: 'Environmental sensor integration',
    icon: Home
  },
  {
    id: 'int-005',
    name: 'Family Companion App',
    type: 'mobile_app',
    vendor: 'Caresolis',
    status: 'active',
    permissionScope: 'view_only',
    requestedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'System Auto-Approval',
    expiresAt: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000).toISOString(),
    revokedAt: null,
    revokedBy: null,
    lastAccessAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    description: 'Read-only access for family members',
    icon: Smartphone
  }
];

// ==================== PERMISSION DETAILS ====================

const PERMISSION_DETAILS: Record<PermissionScope, { label: string; description: string; capabilities: string[]; restrictions: string[] }> = {
  view_only: {
    label: 'View Only',
    description: 'Read-only access to system status',
    capabilities: [
      'View current interaction status',
      'View scheduled check-in times',
      'View device health metrics',
      'View routine stability scores'
    ],
    restrictions: [
      'Cannot send alerts or notifications',
      'Cannot modify schedules or settings',
      'Cannot acknowledge interactions',
      '⛔ NEVER allowed to dispense medication'
    ]
  },
  alert_only: {
    label: 'Alert Only',
    description: 'Receive notifications without data access',
    capabilities: [
      'Receive escalation alerts',
      'Receive missed interaction notifications',
      'Receive device health warnings',
      'Receive system status updates'
    ],
    restrictions: [
      'Cannot view detailed interaction history',
      'Cannot view medication schedules',
      'Cannot acknowledge on behalf of patient',
      '⛔ NEVER allowed to dispense medication'
    ]
  },
  view_and_alert: {
    label: 'View & Alert',
    description: 'Full monitoring with notifications',
    capabilities: [
      'All "View Only" capabilities',
      'All "Alert Only" capabilities',
      'Correlate alerts with system state',
      'Enhanced contextual notifications'
    ],
    restrictions: [
      'Cannot modify any system settings',
      'Cannot trigger manual interactions',
      'Cannot override escalation policies',
      '⛔ NEVER allowed to dispense medication'
    ]
  }
};

// ==================== COMPONENTS ====================

function IntegrationCard({ 
  integration, 
  onApprove, 
  onRevoke, 
  onReapprove 
}: { 
  integration: ThirdPartyIntegration; 
  onApprove: (id: string) => void;
  onRevoke: (id: string) => void;
  onReapprove: (id: string) => void;
}) {
  const Icon = integration.icon;
  
  const getStatusBadge = () => {
    switch (integration.status) {
      case 'active':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full flex items-center gap-1">
          <CheckCircle2 size={12} /> Active
        </span>;
      case 'pending_approval':
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full flex items-center gap-1">
          <Clock size={12} /> Pending Approval
        </span>;
      case 'expired':
        return <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full flex items-center gap-1">
          <XCircle size={12} /> Expired
        </span>;
      case 'revoked':
        return <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-semibold rounded-full flex items-center gap-1">
          <Lock size={12} /> Revoked
        </span>;
      case 'disabled':
        return <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-semibold rounded-full">
          Disabled
        </span>;
    }
  };

  const getExpirationDisplay = () => {
    if (!integration.expiresAt) return null;
    const now = new Date();
    const expires = new Date(integration.expiresAt);
    const diff = expires.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (diff < 0) return <span className="text-rose-600 font-medium">Expired</span>;
    if (days === 0) return <span className="text-amber-600 font-medium">Expires today</span>;
    if (days < 7) return <span className="text-amber-600 font-medium">Expires in {days} days</span>;
    return <span className="text-slate-600">Expires in {days} days</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={clsx(
            "p-3 rounded-xl",
            integration.status === 'active' ? "bg-emerald-100" : "bg-slate-100"
          )}>
            <Icon className={clsx(
              integration.status === 'active' ? "text-emerald-600" : "text-slate-600"
            )} size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{integration.name}</h3>
            <p className="text-sm text-slate-500">{integration.vendor}</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 mb-4">{integration.description}</p>

      {/* Permission Scope */}
      {integration.permissionScope && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={14} className="text-slate-600" />
            <span className="text-xs font-semibold text-slate-700">Permission Scope:</span>
          </div>
          <span className="text-sm font-medium text-slate-900">
            {PERMISSION_DETAILS[integration.permissionScope].label}
          </span>
        </div>
      )}

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
        {integration.approvedAt && (
          <div>
            <div className="text-slate-500 mb-1">Approved</div>
            <div className="font-medium text-slate-700">
              {new Date(integration.approvedAt).toLocaleDateString()}
            </div>
            {integration.approvedBy && (
              <div className="text-slate-500">{integration.approvedBy}</div>
            )}
          </div>
        )}
        
        {integration.expiresAt && (
          <div>
            <div className="text-slate-500 mb-1">Expiration</div>
            <div className="font-medium">{getExpirationDisplay()}</div>
          </div>
        )}

        {integration.lastAccessAt && (
          <div>
            <div className="text-slate-500 mb-1">Last Access</div>
            <div className="font-medium text-slate-700">
              {(() => {
                const diff = Date.now() - new Date(integration.lastAccessAt).getTime();
                const mins = Math.floor(diff / (1000 * 60));
                if (mins < 60) return `${mins}m ago`;
                const hours = Math.floor(mins / 60);
                if (hours < 24) return `${hours}h ago`;
                const days = Math.floor(hours / 24);
                return `${days}d ago`;
              })()}
            </div>
          </div>
        )}

        {integration.requestedAt && integration.status === 'pending_approval' && (
          <div>
            <div className="text-slate-500 mb-1">Requested</div>
            <div className="font-medium text-slate-700">
              {new Date(integration.requestedAt).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {integration.status === 'pending_approval' && (
          <button
            onClick={() => onApprove(integration.id)}
            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Unlock size={16} />
            Review & Approve
          </button>
        )}

        {integration.status === 'active' && (
          <button
            onClick={() => onRevoke(integration.id)}
            className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Lock size={16} />
            Revoke Access
          </button>
        )}

        {(integration.status === 'expired' || integration.status === 'revoked') && (
          <button
            onClick={() => onReapprove(integration.id)}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Unlock size={16} />
            Re-approve Access
          </button>
        )}
      </div>
    </motion.div>
  );
}

function ApprovalModal({ 
  integration, 
  onClose, 
  onConfirm 
}: { 
  integration: ThirdPartyIntegration; 
  onClose: () => void;
  onConfirm: (scope: PermissionScope, durationDays: number) => void;
}) {
  const [selectedScope, setSelectedScope] = useState<PermissionScope>('view_only');
  const [durationDays, setDurationDays] = useState<number>(30);
  const [confirmChecks, setConfirmChecks] = useState({
    understood: false,
    noDispense: false,
    expires: false
  });

  const allChecked = confirmChecks.understood && confirmChecks.noDispense && confirmChecks.expires;
  const Icon = integration.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Icon className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Approve Integration Access</h2>
              <p className="text-sm text-slate-600">{integration.name} by {integration.vendor}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Critical Warning */}
          <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-rose-600 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-bold text-rose-900 mb-1">⛔ CRITICAL SAFETY NOTICE</h3>
                <p className="text-sm text-rose-800 leading-relaxed">
                  External integrations are <strong>NEVER</strong> permitted to dispense medication, 
                  modify dosage schedules, or execute autonomous medication commands. All medication 
                  operations require direct caregiver authorization through the primary Caresolis interface.
                </p>
              </div>
            </div>
          </div>

          {/* Permission Scope Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Select Permission Scope
            </label>
            <div className="space-y-3">
              {(Object.keys(PERMISSION_DETAILS) as PermissionScope[]).map((scope) => {
                const details = PERMISSION_DETAILS[scope];
                return (
                  <div
                    key={scope}
                    onClick={() => setSelectedScope(scope)}
                    className={clsx(
                      "p-4 border-2 rounded-xl cursor-pointer transition-all",
                      selectedScope === scope
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-slate-900">{details.label}</h4>
                      {selectedScope === scope && (
                        <CheckCircle2 className="text-blue-600" size={20} />
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{details.description}</p>
                    
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div>
                        <div className="font-semibold text-emerald-700 mb-1">✓ Capabilities:</div>
                        <ul className="space-y-1 ml-4">
                          {details.capabilities.map((cap, idx) => (
                            <li key={idx} className="text-slate-700">• {cap}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="font-semibold text-rose-700 mb-1">✗ Restrictions:</div>
                        <ul className="space-y-1 ml-4">
                          {details.restrictions.map((res, idx) => (
                            <li key={idx} className="text-slate-700">{res}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expiration Duration */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Access Expiration (Required)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[7, 14, 30, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => setDurationDays(days)}
                  className={clsx(
                    "px-4 py-3 rounded-lg font-medium text-sm transition-all",
                    durationDays === days
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  )}
                >
                  {days} days
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Access will automatically expire after {durationDays} days and require re-approval.
            </p>
          </div>

          {/* Confirmation Checkboxes */}
          <div className="p-4 bg-slate-50 rounded-xl space-y-3">
            <h4 className="font-semibold text-slate-900 mb-2">Required Acknowledgments</h4>
            
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmChecks.understood}
                onChange={(e) => setConfirmChecks({ ...confirmChecks, understood: e.target.checked })}
                className="mt-1 w-4 h-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">
                I understand that this integration will have <strong>{PERMISSION_DETAILS[selectedScope].label}</strong> access 
                to the Caresolis system for the specified household.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmChecks.noDispense}
                onChange={(e) => setConfirmChecks({ ...confirmChecks, noDispense: e.target.checked })}
                className="mt-1 w-4 h-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">
                I acknowledge that <strong>medication dispense control is permanently prohibited</strong> for 
                all external integrations and cannot be overridden.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmChecks.expires}
                onChange={(e) => setConfirmChecks({ ...confirmChecks, expires: e.target.checked })}
                className="mt-1 w-4 h-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">
                I understand that access will automatically expire in <strong>{durationDays} days</strong> and 
                all access will be logged for FDA compliance.
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedScope, durationDays)}
            disabled={!allChecked}
            className={clsx(
              "flex-1 px-6 py-3 font-medium rounded-xl transition-colors flex items-center justify-center gap-2",
              allChecked
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            )}
          >
            <CheckCircle2 size={20} />
            Approve Integration
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function RevokeModal({ 
  integration, 
  onClose, 
  onConfirm 
}: { 
  integration: ThirdPartyIntegration; 
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');
  const Icon = integration.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-rose-100 rounded-xl">
              <Lock className="text-rose-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Revoke Integration Access</h2>
              <p className="text-sm text-slate-600">{integration.name}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-slate-700">
            This will immediately terminate all access for <strong>{integration.name}</strong>. 
            The integration will no longer be able to view data or receive alerts.
          </p>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Reason for Revocation (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Security concern, service no longer needed, etc."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
              rows={3}
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                This action will be logged for FDA compliance and audit trails.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            className="flex-1 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Lock size={20} />
            Revoke Access
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function SystemIntegrationOverview() {
  const location = useLocation();
  const [integrations, setIntegrations] = useState<ThirdPartyIntegration[]>(INITIAL_INTEGRATIONS);
  const [approvalLogs, setApprovalLogs] = useState<ApprovalLog[]>([]);
  const [activeModal, setActiveModal] = useState<{ type: 'approve' | 'revoke'; integration: ThirdPartyIntegration } | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('🔧 SystemIntegrationOverview mounted');
  }, []);

  // Load logs from backend
  useEffect(() => {
    loadApprovalLogs();
  }, []);

  const loadApprovalLogs = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/integration-logs`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      if (response.ok) {
        const data = await response.json();
        setApprovalLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to load approval logs:', error);
    }
  };

  const handleApprove = (id: string) => {
    const integration = integrations.find(i => i.id === id);
    if (integration) {
      setActiveModal({ type: 'approve', integration });
    }
  };

  const handleRevoke = (id: string) => {
    const integration = integrations.find(i => i.id === id);
    if (integration) {
      setActiveModal({ type: 'revoke', integration });
    }
  };

  const handleReapprove = (id: string) => {
    const integration = integrations.find(i => i.id === id);
    if (integration) {
      setActiveModal({ type: 'approve', integration });
    }
  };

  const confirmApproval = async (scope: PermissionScope, durationDays: number) => {
    if (!activeModal) return;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // Update integration
    setIntegrations(integrations.map(i => 
      i.id === activeModal.integration.id
        ? {
            ...i,
            status: 'active' as IntegrationStatus,
            permissionScope: scope,
            approvedAt: now.toISOString(),
            approvedBy: 'Dr. Sarah Chen', // TODO: Get from auth context
            expiresAt: expiresAt.toISOString(),
            revokedAt: null,
            revokedBy: null
          }
        : i
    ));

    // Log approval
    const log: ApprovalLog = {
      id: `log-${Date.now()}`,
      integrationId: activeModal.integration.id,
      integrationName: activeModal.integration.name,
      action: 'approved',
      performedBy: 'Dr. Sarah Chen', // TODO: Get from auth context
      performedAt: now.toISOString(),
      permissionScope: scope,
      expirationDuration: durationDays,
      reason: null
    };

    setApprovalLogs([log, ...approvalLogs]);

    // Send to backend
    try {
      await fetch(`${SERVER_URL}/integration-approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          integrationId: activeModal.integration.id,
          integrationName: activeModal.integration.name,
          scope,
          durationDays,
          performedBy: 'Dr. Sarah Chen',
          performedAt: now.toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to log approval:', error);
    }

    setActiveModal(null);
  };

  const confirmRevoke = async (reason: string) => {
    if (!activeModal) return;

    const now = new Date();

    // Update integration
    setIntegrations(integrations.map(i => 
      i.id === activeModal.integration.id
        ? {
            ...i,
            status: 'revoked' as IntegrationStatus,
            revokedAt: now.toISOString(),
            revokedBy: 'Dr. Sarah Chen' // TODO: Get from auth context
          }
        : i
    ));

    // Log revocation
    const log: ApprovalLog = {
      id: `log-${Date.now()}`,
      integrationId: activeModal.integration.id,
      integrationName: activeModal.integration.name,
      action: 'revoked',
      performedBy: 'Dr. Sarah Chen', // TODO: Get from auth context
      performedAt: now.toISOString(),
      permissionScope: activeModal.integration.permissionScope,
      expirationDuration: null,
      reason: reason || null
    };

    setApprovalLogs([log, ...approvalLogs]);

    // Send to backend
    try {
      await fetch(`${SERVER_URL}/integration-revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          integrationId: activeModal.integration.id,
          integrationName: activeModal.integration.name,
          reason,
          performedBy: 'Dr. Sarah Chen',
          performedAt: now.toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to log revocation:', error);
    }

    setActiveModal(null);
  };

  const activeIntegrations = integrations.filter(i => i.status === 'active');
  const pendingIntegrations = integrations.filter(i => i.status === 'pending_approval');

  return (
    <div className="max-w-7xl mx-auto pb-20 p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-blue-100 rounded-xl">
          <Server className="text-blue-600" size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Third-Party Integration Control</h1>
          <p className="text-slate-600">Manage external system access with scoped permissions</p>
        </div>
      </div>

      {/* Critical Safety Banner */}
      <div className="mb-8 p-6 bg-gradient-to-r from-rose-50 to-orange-50 border-2 border-rose-200 rounded-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-rose-100 rounded-xl flex-shrink-0">
            <Shield className="text-rose-600" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-rose-900 mb-2">
              ⛔ MEDICATION DISPENSE PROTECTION ACTIVE
            </h2>
            <p className="text-sm text-rose-800 leading-relaxed mb-3">
              All external integrations (voice assistants, robotic caregivers, smart home devices) 
              are <strong>permanently prohibited</strong> from executing medication dispense commands. 
              This restriction is hardcoded at the system level and cannot be overridden through any permission scope.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white/70 rounded-lg">
                <div className="font-bold text-rose-900 mb-1">✓ Explicit Approval Required</div>
                <div className="text-rose-700">Every integration requires caregiver authorization</div>
              </div>
              <div className="p-3 bg-white/70 rounded-lg">
                <div className="font-bold text-rose-900 mb-1">✓ Scoped Permissions</div>
                <div className="text-rose-700">Limited to view-only, alert-only, or combined access</div>
              </div>
              <div className="p-3 bg-white/70 rounded-lg">
                <div className="font-bold text-rose-900 mb-1">✓ Auto-Expiration</div>
                <div className="text-rose-700">All access automatically expires after set duration</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="text-emerald-600" size={20} />
            <span className="text-sm font-medium text-slate-600">Active</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{activeIntegrations.length}</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-amber-600" size={20} />
            <span className="text-sm font-medium text-slate-600">Pending</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{pendingIntegrations.length}</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-blue-600" size={20} />
            <span className="text-sm font-medium text-slate-600">Total Managed</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{integrations.length}</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="text-purple-600" size={20} />
            <span className="text-sm font-medium text-slate-600">Audit Logs</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{approvalLogs.length}</div>
        </div>
      </div>

      {/* Pending Approvals Section */}
      {pendingIntegrations.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-amber-600" size={20} />
            <h2 className="text-xl font-bold text-slate-900">Pending Approval</h2>
            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
              {pendingIntegrations.length}
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingIntegrations.map(integration => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onApprove={handleApprove}
                onRevoke={handleRevoke}
                onReapprove={handleReapprove}
              />
            ))}
          </div>
        </div>
      )}

      {/* Active Integrations Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="text-emerald-600" size={20} />
          <h2 className="text-xl font-bold text-slate-900">Active Integrations</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {integrations
            .filter(i => i.status === 'active')
            .map(integration => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onApprove={handleApprove}
                onRevoke={handleRevoke}
                onReapprove={handleReapprove}
              />
            ))}
        </div>
      </div>

      {/* All Other Integrations */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">All Integrations</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {integrations
            .filter(i => i.status !== 'pending_approval' && i.status !== 'active')
            .map(integration => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onApprove={handleApprove}
                onRevoke={handleRevoke}
                onReapprove={handleReapprove}
              />
            ))}
        </div>
      </div>

      {/* Recent Activity Log */}
      {approvalLogs.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-purple-600" size={20} />
            <h2 className="text-xl font-bold text-slate-900">Recent Approval Activity</h2>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-200">
              {approvalLogs.slice(0, 10).map(log => (
                <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {log.action === 'approved' && <CheckCircle2 className="text-emerald-600" size={16} />}
                        {log.action === 'revoked' && <Lock className="text-rose-600" size={16} />}
                        {log.action === 'expired' && <Clock className="text-slate-600" size={16} />}
                        <span className="font-medium text-slate-900">{log.integrationName}</span>
                        <span className={clsx(
                          "px-2 py-0.5 text-xs font-semibold rounded-full",
                          log.action === 'approved' && "bg-emerald-100 text-emerald-700",
                          log.action === 'revoked' && "bg-rose-100 text-rose-700",
                          log.action === 'expired' && "bg-slate-100 text-slate-700"
                        )}>
                          {log.action}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600">
                        by {log.performedBy} • {new Date(log.performedAt).toLocaleString()}
                      </div>
                      {log.permissionScope && (
                        <div className="text-sm text-slate-500 mt-1">
                          Scope: {PERMISSION_DETAILS[log.permissionScope].label}
                          {log.expirationDuration && ` • ${log.expirationDuration} days`}
                        </div>
                      )}
                      {log.reason && (
                        <div className="text-sm text-slate-500 mt-1 italic">
                          Reason: {log.reason}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {activeModal?.type === 'approve' && (
          <ApprovalModal
            integration={activeModal.integration}
            onClose={() => setActiveModal(null)}
            onConfirm={confirmApproval}
          />
        )}
        {activeModal?.type === 'revoke' && (
          <RevokeModal
            integration={activeModal.integration}
            onClose={() => setActiveModal(null)}
            onConfirm={confirmRevoke}
          />
        )}
      </AnimatePresence>
    </div>
  );
}