import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  Shield, 
  Lock,
  Database,
  Zap,
  Activity,
  Users,
  Bell,
  FileText,
  Settings,
  Pill,
  DollarSign,
  Eye,
  ChevronRight,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { cn } from '../components/ui/utils';

/**
 * COMPREHENSIVE TESTING CHECKLIST
 * 
 * Purpose: Ensure all CareSolis features are tested before hardware integration
 * 
 * Categories:
 * 1. Core Medication Features
 * 2. Escalation & Notification System
 * 3. Security & Compliance
 * 4. Data Integrity & Logging
 * 5. Care Circle Management
 * 6. RTM Billing & Clinical Ops
 * 7. Environmental Wellness
 * 8. Edge Cases & Failure Modes
 */

interface TestItem {
  id: string;
  category: string;
  feature: string;
  description: string;
  testPage?: string;
  testSteps: string[];
  fdaCompliant?: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  tested?: boolean;
  notes?: string;
}

const TEST_CATEGORIES = [
  {
    id: 'medication',
    name: 'Core Medication Features',
    icon: Pill,
    color: 'rose'
  },
  {
    id: 'escalation',
    name: 'Escalation & Notifications',
    icon: Bell,
    color: 'amber'
  },
  {
    id: 'security',
    name: 'Security & Compliance',
    icon: Shield,
    color: 'emerald'
  },
  {
    id: 'data',
    name: 'Data Integrity & Logging',
    icon: Database,
    color: 'blue'
  },
  {
    id: 'care-circle',
    name: 'Care Circle Management',
    icon: Users,
    color: 'purple'
  },
  {
    id: 'billing',
    name: 'RTM Billing & Clinical',
    icon: DollarSign,
    color: 'indigo'
  },
  {
    id: 'environmental',
    name: 'Environmental Wellness',
    icon: Activity,
    color: 'cyan'
  },
  {
    id: 'edge-cases',
    name: 'Edge Cases & Failures',
    icon: AlertTriangle,
    color: 'orange'
  }
];

const TEST_ITEMS: TestItem[] = [
  // MEDICATION FEATURES
  {
    id: 'med-001',
    category: 'medication',
    feature: '2x25 Blister Pack System',
    description: 'Verify both pharmacy-delivered packs can be loaded, tracked, and monitored',
    testPage: '/medication-hub',
    testSteps: [
      'Navigate to Medication Hub → Service Module',
      'Verify Pack A (25 positions) and Pack B (25 positions) visualization',
      'Check pharmacy pack serial number detection',
      'Monitor pack expiration dates',
      'Confirm visual feedback for intact/used blister states',
      'Verify photo documentation of pharmacy packs'
    ],
    fdaCompliant: true,
    priority: 'critical'
  },
  {
    id: 'med-002',
    category: 'medication',
    feature: 'Device IR Sensor Detection (Blister Push-Through)',
    description: 'Test IR sensor detection when patient pushes blister through foil (device-driven only)',
    testPage: '/device-simulator',
    testSteps: [
      'Navigate to Device Simulator',
      'Click "Dose Removed" to simulate IR sensor detection',
      'Verify blister push-through event appears in Dashboard daily ring',
      'Check triple-logging (Flash, Cloud, Audit)',
      'Confirm no manual override buttons exist for blister actuation'
    ],
    fdaCompliant: true,
    priority: 'critical'
  },
  {
    id: 'med-003',
    category: 'medication',
    feature: 'Medication Scheduling',
    description: 'Configure and verify medication schedules',
    testPage: '/medication-hub',
    testSteps: [
      'Go to Medication Hub → Scheduling & Times',
      'Add multiple daily doses (e.g., 8AM, 2PM, 8PM)',
      'Verify schedule appears in calendar view',
      'Test schedule modifications',
      'Confirm audit trail of schedule changes'
    ],
    fdaCompliant: true,
    priority: 'critical'
  },

  // ESCALATION & NOTIFICATIONS
  {
    id: 'esc-001',
    category: 'escalation',
    feature: 'Missed Dose Escalation Flow',
    description: 'Test complete escalation from Level 0 → Level 3',
    testPage: '/device-simulator',
    testSteps: [
      'Use Device Simulator to trigger "Missed Dose"',
      'Verify grace period countdown starts',
      'Watch escalation progress through levels',
      'Check Care Circle notifications at each level',
      'Verify final escalation to CareSolis team'
    ],
    fdaCompliant: true,
    priority: 'critical'
  },
  {
    id: 'esc-002',
    category: 'escalation',
    feature: 'Device-Driven Resolution Only',
    description: 'Verify caregivers CANNOT manually clear escalations',
    testPage: '/device-simulator',
    testSteps: [
      'Trigger missed dose escalation',
      'Open Active Escalation Panel',
      'Verify NO "All Clear" or "Snooze" buttons exist',
      'Confirm only device IR sensor can resolve',
      'Check FDA compliance banner is displayed'
    ],
    fdaCompliant: true,
    priority: 'critical'
  },
  {
    id: 'esc-003',
    category: 'escalation',
    feature: 'Finite Escalation Protocol',
    description: 'Verify escalation follows documented timing protocol',
    testPage: '/escalation',
    testSteps: [
      'Review escalation settings page',
      'Confirm grace period and level offsets configured',
      'Test escalation timing matches settings',
      'Verify transparent escalation in journal',
      'Check all Care Circle contacts receive notifications'
    ],
    fdaCompliant: true,
    priority: 'high'
  },

  // SECURITY & COMPLIANCE
  {
    id: 'sec-001',
    category: 'security',
    feature: 'Triple-Redundant Logging',
    description: 'Verify all events logged to 3 systems',
    testPage: '/device-simulator',
    testSteps: [
      'Trigger multiple device events',
      'Check Device Flash log indicator',
      'Verify Cloud Database receives events',
      'Confirm Audit Trail captures all events',
      'Test offline mode - Flash only storage'
    ],
    fdaCompliant: true,
    priority: 'critical'
  },
  {
    id: 'sec-002',
    category: 'security',
    feature: 'Tamper Detection',
    description: 'Test security breach detection and alerts',
    testPage: '/device-simulator',
    testSteps: [
      'Navigate to Device Simulator',
      'Enable Security Panel',
      'Click "Tamper Alert" button',
      'Verify alert appears in dashboard',
      'Check Care Circle receives security notification'
    ],
    fdaCompliant: true,
    priority: 'high'
  },
  {
    id: 'sec-003',
    category: 'security',
    feature: 'No External Dispense Commands',
    description: 'Verify device never accepts cloud dispense commands',
    testPage: '/regulatory-compliance',
    testSteps: [
      'Review Regulatory Compliance page',
      'Verify "No external autonomous dispense" compliance item',
      'Check Device Simulator has NO dispense trigger',
      'Confirm architecture documentation',
      'Validate FDA positioning'
    ],
    fdaCompliant: true,
    priority: 'critical'
  },

  // DATA INTEGRITY & LOGGING
  {
    id: 'data-001',
    category: 'data',
    feature: 'Dose Event Verification',
    description: 'Verify comprehensive dose event tracking',
    testPage: '/dose-event-verification',
    testSteps: [
      'Navigate to Dose Event Verification',
      'Review microsecond timestamp precision',
      'Check optical confirmation vs ingestion clarification',
      'Verify compartment-level tracking',
      'Confirm exportable audit logs'
    ],
    fdaCompliant: true,
    priority: 'critical'
  },
  {
    id: 'data-002',
    category: 'data',
    feature: 'Care Circle Journal',
    description: 'Test transparent event logging system',
    testPage: '/care-circle',
    testSteps: [
      'Go to Care Circle Journal',
      'Verify all dose events appear',
      'Check escalation events logged',
      'Test filtering and search',
      'Confirm export functionality'
    ],
    fdaCompliant: true,
    priority: 'high'
  },
  {
    id: 'data-003',
    category: 'data',
    feature: 'Data Recovery & Backup',
    description: 'Test backup and restore functionality',
    testPage: '/data-recovery',
    testSteps: [
      'Navigate to Data Recovery page',
      'Create manual backup',
      'Export backup file',
      'Test restore from backup',
      'Verify data integrity after restore'
    ],
    fdaCompliant: false,
    priority: 'medium'
  },

  // CARE CIRCLE MANAGEMENT
  {
    id: 'care-001',
    category: 'care-circle',
    feature: 'Contact Priority Management',
    description: 'Configure and test escalation contact order',
    testPage: '/care-circle',
    testSteps: [
      'Add multiple Care Circle contacts',
      'Set priority levels (1, 2, 3)',
      'Configure contact methods (SMS, phone, email)',
      'Test escalation reaches correct contact at each level',
      'Verify contact can view patient data'
    ],
    fdaCompliant: true,
    priority: 'high'
  },
  {
    id: 'care-002',
    category: 'care-circle',
    feature: 'Care Messaging System',
    description: 'Test secure messaging between Care Circle members',
    testPage: '/care-messaging',
    testSteps: [
      'Navigate to Care Messaging',
      'Send message to Care Circle member',
      'Verify message encryption (HIPAA)',
      'Test file attachments',
      'Check message audit trail'
    ],
    fdaCompliant: false,
    priority: 'medium'
  },

  // RPM BILLING & CLINICAL
  {
    id: 'bill-001',
    category: 'billing',
    feature: 'RTM Billing Module',
    description: 'Verify Medicare reimbursement tracking',
    testPage: '/rtm-billing',
    testSteps: [
      'Navigate to RTM Billing',
      'Verify 16+ days tracking',
      'Check interactive data transmission logs',
      'Confirm CPT code generation (99457, 99458)',
      'Validate $100-200/patient/month calculations'
    ],
    fdaCompliant: false,
    priority: 'high'
  },
  {
    id: 'bill-002',
    category: 'billing',
    feature: 'Clinical Operations Dashboard',
    description: 'Test clinical oversight tools',
    testPage: '/clinical-operations',
    testSteps: [
      'Navigate to Clinical Operations (Admin only)',
      'Review patient adherence metrics',
      'Check intervention tracking',
      'Verify clinical documentation',
      'Test report generation'
    ],
    fdaCompliant: true,
    priority: 'medium'
  },

  // ENVIRONMENTAL WELLNESS
  {
    id: 'env-001',
    category: 'environmental',
    feature: 'Environmental Telemetry',
    description: 'Monitor temperature, humidity, and air quality',
    testPage: '/device-simulator',
    testSteps: [
      'Use Device Simulator sensor readings',
      'Verify temperature monitoring (18-28°C range)',
      'Check humidity tracking (30-70% range)',
      'Test alerts for out-of-range values',
      'Confirm sensor data logged'
    ],
    fdaCompliant: false,
    priority: 'low'
  },
  {
    id: 'env-002',
    category: 'environmental',
    feature: 'Routine Stability Analytics',
    description: 'Analyze patient routine patterns',
    testPage: '/routine',
    testSteps: [
      'Navigate to Routine Stability',
      'Review adherence pattern visualization',
      'Check variance calculations',
      'Test anomaly detection',
      'Verify predictive insights'
    ],
    fdaCompliant: false,
    priority: 'medium'
  },

  // EDGE CASES & FAILURES
  {
    id: 'edge-001',
    category: 'edge-cases',
    feature: 'Network Failover (WiFi → LTE)',
    description: 'Test connectivity failsafe mechanisms',
    testPage: '/device-simulator',
    testSteps: [
      'Use Device Simulator connectivity controls',
      'Switch from WiFi to LTE',
      'Verify dose event still logged',
      'Switch to Offline mode',
      'Confirm events stored in device flash',
      'Restore connection and verify sync'
    ],
    fdaCompliant: true,
    priority: 'critical'
  },
  {
    id: 'edge-002',
    category: 'edge-cases',
    feature: 'Offline Event Buffering',
    description: 'Test event storage during network outage',
    testPage: '/device-simulator',
    testSteps: [
      'Set device to Offline mode',
      'Trigger multiple dose events',
      'Verify events stored in device flash only',
      'Restore connectivity',
      'Confirm all events sync to cloud'
    ],
    fdaCompliant: true,
    priority: 'critical'
  },
  {
    id: 'edge-003',
    category: 'edge-cases',
    feature: 'System Recovery from Crash',
    description: 'Test data persistence and recovery',
    testPage: '/data-recovery',
    testSteps: [
      'Create comprehensive backup',
      'Simulate data loss (clear browser data)',
      'Restore from backup',
      'Verify all medication schedules intact',
      'Check all Care Circle contacts restored'
    ],
    fdaCompliant: false,
    priority: 'high'
  }
];

export default function TestingChecklist() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [testedItems, setTestedItems] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Record<string, string>>({});

  const toggleTested = (itemId: string) => {
    setTestedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const filteredItems = selectedCategory
    ? TEST_ITEMS.filter(item => item.category === selectedCategory)
    : TEST_ITEMS;

  const getCompletionStats = () => {
    const total = TEST_ITEMS.length;
    const completed = testedItems.size;
    const percentage = Math.round((completed / total) * 100);
    
    const criticalTotal = TEST_ITEMS.filter(i => i.priority === 'critical').length;
    const criticalCompleted = TEST_ITEMS.filter(i => i.priority === 'critical' && testedItems.has(i.id)).length;
    
    return { total, completed, percentage, criticalTotal, criticalCompleted };
  };

  const stats = getCompletionStats();

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Return to Testing Tools Button */}
        <Link to="/help-center" className="inline-block">
          <Button
            variant="outline"
            className="border-blue-500/40 text-blue-300 hover:bg-blue-900/40 hover:border-blue-500/60 hover:text-blue-200"
          >
            <ArrowLeft size={16} className="mr-2" />
            Return to Testing Tools
          </Button>
        </Link>

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <CheckCircle2 className="text-emerald-400" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-100">
                Testing Checklist
              </h1>
              <p className="text-slate-400">
                Comprehensive CG app validation before hardware integration
              </p>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-slate-400 mb-2">Overall Progress</div>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-slate-100">{stats.percentage}%</div>
                <div className="text-sm text-slate-400">
                  ({stats.completed}/{stats.total} tests)
                </div>
              </div>
              <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${stats.percentage}%` }}
                />
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-400 mb-2">Critical Tests</div>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-rose-400">
                  {stats.criticalCompleted}/{stats.criticalTotal}
                </div>
                <div className="text-sm text-slate-400">completed</div>
              </div>
              <div className="mt-3">
                {stats.criticalCompleted === stats.criticalTotal ? (
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 size={16} />
                    <span className="text-sm font-semibold">All critical tests passed</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-400">
                    <AlertTriangle size={16} />
                    <span className="text-sm font-semibold">
                      {stats.criticalTotal - stats.criticalCompleted} critical tests remaining
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-400 mb-2">FDA Compliance</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="text-emerald-400" size={16} />
                  <span className="text-slate-300">Triple-redundant logging</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Lock className="text-emerald-400" size={16} />
                  <span className="text-slate-300">Device-driven architecture</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="text-emerald-400" size={16} />
                  <span className="text-slate-300">21 CFR Part 11 compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to="/device-simulator">
              <Button variant="outline" className="w-full border-slate-700 justify-start">
                <Zap size={16} className="mr-2 text-purple-400" />
                Device Simulator
                <ExternalLink size={12} className="ml-auto" />
              </Button>
            </Link>
            <Link to="/medication-hub">
              <Button variant="outline" className="w-full border-slate-700 justify-start">
                <Pill size={16} className="mr-2 text-rose-400" />
                Medication Hub
                <ExternalLink size={12} className="ml-auto" />
              </Button>
            </Link>
            <Link to="/dose-event-verification">
              <Button variant="outline" className="w-full border-slate-700 justify-start">
                <Eye size={16} className="mr-2 text-blue-400" />
                Event Verification
                <ExternalLink size={12} className="ml-auto" />
              </Button>
            </Link>
            <Link to="/regulatory-compliance">
              <Button variant="outline" className="w-full border-slate-700 justify-start">
                <Shield size={16} className="mr-2 text-emerald-400" />
                FDA Compliance
                <ExternalLink size={12} className="ml-auto" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Test Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={() => setSelectedCategory(null)}
              variant="outline"
              className={cn(
                "border-slate-700 justify-start",
                !selectedCategory && "bg-emerald-500/20 border-emerald-500"
              )}
            >
              All Tests ({TEST_ITEMS.length})
            </Button>
            {TEST_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const count = TEST_ITEMS.filter(i => i.category === cat.id).length;
              const completed = TEST_ITEMS.filter(i => i.category === cat.id && testedItems.has(i.id)).length;
              
              return (
                <Button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  variant="outline"
                  className={cn(
                    "border-slate-700 justify-start",
                    selectedCategory === cat.id && "bg-emerald-500/20 border-emerald-500"
                  )}
                >
                  <Icon size={16} className="mr-2" />
                  <span className="flex-1 text-left truncate">{cat.name}</span>
                  <span className="text-xs text-slate-400">
                    {completed}/{count}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Test Items */}
        <div className="space-y-3">
          {filteredItems.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "bg-slate-900 border rounded-xl p-5",
                testedItems.has(item.id) 
                  ? "border-emerald-500/30 bg-emerald-500/5" 
                  : "border-slate-700"
              )}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleTested(item.id)}
                  className="mt-1"
                >
                  {testedItems.has(item.id) ? (
                    <CheckCircle2 className="text-emerald-400" size={24} />
                  ) : (
                    <Circle className="text-slate-600 hover:text-slate-400" size={24} />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-100 mb-1">
                        {item.feature}
                      </h3>
                      <p className="text-sm text-slate-400">{item.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {item.fdaCompliant && (
                        <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded">
                          FDA
                        </span>
                      )}
                      <span className={cn(
                        "px-2 py-1 text-xs font-semibold rounded",
                        item.priority === 'critical' && "bg-rose-500/10 border border-rose-500/20 text-rose-400",
                        item.priority === 'high' && "bg-amber-500/10 border border-amber-500/20 text-amber-400",
                        item.priority === 'medium' && "bg-blue-500/10 border border-blue-500/20 text-blue-400",
                        item.priority === 'low' && "bg-slate-500/10 border border-slate-500/20 text-slate-400"
                      )}>
                        {item.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4 mt-3">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">
                      Test Steps:
                    </h4>
                    <ol className="space-y-1 text-sm text-slate-300">
                      {item.testSteps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-slate-500 font-medium">{idx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {item.testPage && (
                    <div className="mt-3">
                      <Link to={item.testPage}>
                        <Button variant="outline" size="sm" className="border-slate-700">
                          <ExternalLink size={14} className="mr-2" />
                          Open Test Page
                        </Button>
                      </Link>
                    </div>
                  )}

                  {testedItems.has(item.id) && (
                    <div className="mt-3">
                      <textarea
                        placeholder="Add testing notes..."
                        value={notes[item.id] || ''}
                        onChange={(e) => setNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 placeholder-slate-500 resize-none"
                        rows={2}
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}