import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Beaker, 
  Laptop, 
  CheckSquare, 
  Activity, 
  Shield, 
  Database,
  Zap,
  ArrowRight,
  ChevronRight,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Eye,
  Play,
  Download,
  Printer,
  Info,
  Target,
  ListChecks,
  TrendingUp
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../components/ui/utils';
import { PageHeader } from '../components/PageHeader';

/**
 * TESTING TOOLS PAGE - INDUSTRY-STANDARD TESTING PROTOCOL
 * 
 * Implements best-in-class medical device testing protocols per:
 * - FDA 21 CFR Part 11 (Electronic Records)
 * - ISO 13485 (Medical Device Quality Management)
 * - IEC 62304 (Medical Device Software Lifecycle)
 * 
 * Key Principles:
 * 1. Test Objective: What are we testing and why?
 * 2. Pre-Conditions: System state before test
 * 3. Step-by-Step Instructions: Clear, numbered procedures
 * 4. Expected Results: What should happen at each step
 * 5. Actual Results: What actually happened (logged)
 * 6. Pass/Fail Criteria: Objective success metrics
 * 7. Observer Verification: Allow independent verification
 * 8. Audit Trail: Full FDA-compliant documentation
 */

interface TestProtocol {
  id: string;
  title: string;
  category: 'medication' | 'escalation' | 'security' | 'data-integrity' | 'clinical' | 'environmental';
  objective: string;
  regulatoryJustification: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  estimatedDuration: string;
  preConditions: string[];
  testSteps: TestStep[];
  passCriteria: string[];
  fdaReference?: string;
  route: string;
}

interface TestStep {
  stepNumber: number;
  action: string;
  expectedResult: string;
  verificationMethod: 'visual' | 'log' | 'database' | 'notification';
  screenshots?: boolean;
}

const TEST_PROTOCOLS: TestProtocol[] = [
  {
    id: 'escalation-flow',
    title: 'Finite Escalation Flow Test',
    category: 'escalation',
    objective: 'Verify that the system correctly implements finite escalation (L1 → L2 → L3 → STOP) without infinite alert loops, ensuring caregiver alert fatigue prevention.',
    regulatoryJustification: 'FDA requires demonstration that the system prevents alert fatigue while ensuring critical medication events are properly escalated to responsible caregivers.',
    riskLevel: 'critical',
    estimatedDuration: '5-7 minutes',
    preConditions: [
      'Device Simulator must be accessible at /device-simulator',
      'Backend server must be online and responding',
      'Care Circle contacts must be configured (L1, L2, L3)',
      'At least one scheduled check-in time must be active',
      'Observer should have access to Escalation Log page'
    ],
    testSteps: [
      {
        stepNumber: 1,
        action: 'Navigate to Device Simulator page',
        expectedResult: 'Simulator loads with current device state showing "IDLE" or "GRACE_PERIOD"',
        verificationMethod: 'visual'
      },
      {
        stepNumber: 2,
        action: 'Locate the "Trigger Escalation" button in the Escalation Testing section',
        expectedResult: 'Button is visible and enabled',
        verificationMethod: 'visual'
      },
      {
        stepNumber: 3,
        action: 'Click "Trigger Escalation" to simulate a missed check-in',
        expectedResult: 'System immediately transitions to "ESCALATION_L1" state. Console logs show: "[ESCALATION_L1] TRIGGERED"',
        verificationMethod: 'log',
        screenshots: true
      },
      {
        stepNumber: 4,
        action: 'Open Escalation Log page in new tab (/escalation-log) to observe notifications',
        expectedResult: 'New escalation event appears with Status: "EscalationLevel1", Recipient: [Primary Contact Name], Timestamp logged',
        verificationMethod: 'database',
        screenshots: true
      },
      {
        stepNumber: 5,
        action: 'Wait 15 minutes (or use time acceleration if available) without resolving',
        expectedResult: 'System auto-advances to "ESCALATION_L2". Console shows: "[ESCALATION_L2] TRIGGERED". Secondary contact is notified.',
        verificationMethod: 'log',
        screenshots: true
      },
      {
        stepNumber: 6,
        action: 'Verify notification log shows Level 2 notification sent',
        expectedResult: 'Notification Log shows: "Level 2 Escalation for [check-in time]" with recipient = Secondary Contact',
        verificationMethod: 'database'
      },
      {
        stepNumber: 7,
        action: 'Wait another 15 minutes without resolving',
        expectedResult: 'System advances to "ESCALATION_L3". Console shows: "[ESCALATION_L3] TRIGGERED". All Care Circle members notified.',
        verificationMethod: 'log',
        screenshots: true
      },
      {
        stepNumber: 8,
        action: 'Wait 5 more minutes after Level 3 broadcast',
        expectedResult: 'System transitions to "Check-In Not Logged" and STOPS escalating. Console shows: "[CHECK_IN_NOT_LOGGED] FINALIZED". NO additional notifications sent.',
        verificationMethod: 'log',
        screenshots: true
      },
      {
        stepNumber: 9,
        action: 'Verify Escalation Log shows event is CLOSED',
        expectedResult: 'Event status = "Check-In Not Logged", escalationLevel = 3, no further logs added after closure',
        verificationMethod: 'database'
      },
      {
        stepNumber: 10,
        action: 'Check browser console for any error messages',
        expectedResult: 'No errors. All state transitions logged successfully.',
        verificationMethod: 'log'
      }
    ],
    passCriteria: [
      '✅ Escalation progresses through exactly 3 levels (L1 → L2 → L3)',
      '✅ System STOPS escalating after Level 3 (finite escalation verified)',
      '✅ Each level sends notification to correct recipient',
      '✅ Timing intervals match configuration (15 min for L1→L2, 15 min for L2→L3)',
      '✅ Event is properly closed and marked "Check-In Not Logged"',
      '✅ No infinite loops or repeated notifications after closure',
      '✅ All state transitions are logged in audit trail'
    ],
    fdaReference: '21 CFR Part 820.30 (Design Controls)',
    route: '/device-simulator'
  },
  {
    id: 'blister-detection',
    title: 'IR Sensor Blister Detection Test',
    category: 'medication',
    objective: 'Verify that the IR sensor system correctly detects when a patient pushes through a blister pack compartment, confirming medication interaction without claiming consumption.',
    regulatoryJustification: 'FDA requires verifiable proof that the system measures what it claims. We verify "blister pushed through" (measurable), NOT "medication consumed" (unmeasurable).',
    riskLevel: 'critical',
    estimatedDuration: '3-4 minutes',
    preConditions: [
      'Device Simulator must be loaded',
      'Both Pack A and Pack B must show at least 10 intact blisters',
      'IR sensor status indicators must be visible',
      'Medication Administration Record (MAR) page accessible for verification'
    ],
    testSteps: [
      {
        stepNumber: 1,
        action: 'Navigate to Device Simulator → Blister Pack section',
        expectedResult: 'Visual grid shows 2x25 blister positions. Green = intact, Gray = pushed through',
        verificationMethod: 'visual',
        screenshots: true
      },
      {
        stepNumber: 2,
        action: 'Click on Position 1 in Pack A to simulate blister push-through',
        expectedResult: 'Position 1 changes from Green to Gray. Console logs: "[BLISTER_PUSHED] Pack A, Position 1, IR Gate 1 triggered"',
        verificationMethod: 'log',
        screenshots: true
      },
      {
        stepNumber: 3,
        action: 'Verify IR Gate indicator shows "BREAK DETECTED"',
        expectedResult: 'IR Gate 1 status changes to "BEAM BROKEN" with timestamp',
        verificationMethod: 'visual'
      },
      {
        stepNumber: 4,
        action: 'Check Event Log in simulator for blister event',
        expectedResult: 'Event logged with type: "blister_pushed", pack: "A", position: 1, irGate: 1, logged: {deviceFlash: true, cloudDatabase: true, auditTrail: true}',
        verificationMethod: 'database',
        screenshots: true
      },
      {
        stepNumber: 5,
        action: 'Navigate to Medication Administration Record (MAR) page',
        expectedResult: 'MAR shows new entry: "Blister interaction detected - Pack A Position 1" with timestamp. Entry shows "REMOVED FROM DEVICE" not "CONSUMED".',
        verificationMethod: 'database',
        screenshots: true
      },
      {
        stepNumber: 6,
        action: 'Push through 3 more blisters in rapid succession (Positions 2, 3, 4)',
        expectedResult: 'All 3 blisters change to gray. Console shows 3 separate log entries. No errors.',
        verificationMethod: 'log'
      },
      {
        stepNumber: 7,
        action: 'Verify triple-redundant logging for all 4 blister events',
        expectedResult: 'Each event shows logged.deviceFlash = true, logged.cloudDatabase = true, logged.auditTrail = true',
        verificationMethod: 'database'
      }
    ],
    passCriteria: [
      '✅ Blister state changes immediately upon click (IR sensor simulation)',
      '✅ Each blister push-through generates exactly ONE event (no duplicates)',
      '✅ Console logs show correct Pack (A/B) and Position (1-25)',
      '✅ Triple-redundant logging confirmed for all events',
      '✅ MAR entries use accurate language: "removed from device" NOT "consumed"',
      '✅ No system errors or crashes when triggering multiple blisters rapidly',
      '✅ Timestamps are accurate and sequential'
    ],
    fdaReference: '21 CFR Part 820.30 (Design Controls), 21 CFR Part 11 (Electronic Records)',
    route: '/device-simulator'
  },
  {
    id: 'triple-logging',
    title: 'Triple-Redundant Logging Verification',
    category: 'data-integrity',
    objective: 'Verify that ALL medication and escalation events are logged across three independent systems: device flash memory (simulated), cloud database, and audit trail.',
    regulatoryJustification: 'FDA 21 CFR Part 11 requires electronic records to be accurate, complete, and protected against loss. Triple-redundancy ensures data integrity even if one system fails.',
    riskLevel: 'critical',
    estimatedDuration: '4-5 minutes',
    preConditions: [
      'Backend server must be online',
      'Access Logs page must be accessible',
      'Device Simulator must be functional',
      'Browser console must be open for log monitoring'
    ],
    testSteps: [
      {
        stepNumber: 1,
        action: 'Open browser Developer Console (F12) and navigate to Console tab',
        expectedResult: 'Console is visible and showing CareSolis system logs',
        verificationMethod: 'visual'
      },
      {
        stepNumber: 2,
        action: 'In Device Simulator, trigger ANY event (blister push, escalation, or sensor reading)',
        expectedResult: 'Console immediately shows log entry with event details',
        verificationMethod: 'log',
        screenshots: true
      },
      {
        stepNumber: 3,
        action: 'Examine the logged object in console. Expand "logged" property',
        expectedResult: 'Object shows: logged: { deviceFlash: true, cloudDatabase: true, auditTrail: true }',
        verificationMethod: 'log',
        screenshots: true
      },
      {
        stepNumber: 4,
        action: 'Navigate to Access Logs page (/access-logs)',
        expectedResult: 'Page loads showing audit trail entries',
        verificationMethod: 'visual'
      },
      {
        stepNumber: 5,
        action: 'Search for the event you just triggered using timestamp',
        expectedResult: 'Event appears in audit log with action type, actor (system_simulator), and full details',
        verificationMethod: 'database',
        screenshots: true
      },
      {
        stepNumber: 6,
        action: 'Trigger 5 different event types: blister push, escalation, sensor reading, tamper alert, connectivity change',
        expectedResult: 'All 5 events show logged.deviceFlash = true, cloudDatabase = true, auditTrail = true',
        verificationMethod: 'log'
      },
      {
        stepNumber: 7,
        action: 'Verify Access Logs page shows all 5 events in chronological order',
        expectedResult: 'All 5 events present with accurate timestamps and details',
        verificationMethod: 'database'
      },
      {
        stepNumber: 8,
        action: 'Check for "SIMULATION" flag on all test events',
        expectedResult: 'Each event in audit log includes metadata indicating it was generated by Device Simulator (isolates test data from production)',
        verificationMethod: 'database',
        screenshots: true
      }
    ],
    passCriteria: [
      '✅ Every simulated event logs to all 3 systems (device, cloud, audit)',
      '✅ No events show partial logging (e.g., cloud: true but audit: false)',
      '✅ Timestamps match across all 3 logging systems (within 1 second tolerance)',
      '✅ Audit trail entries include full event context (actor, action, details)',
      '✅ SIMULATION flag is present on all test data (data isolation verified)',
      '✅ No logging errors appear in console',
      '✅ Events are retrievable and searchable in Access Logs page'
    ],
    fdaReference: '21 CFR Part 11 (Electronic Records), 21 CFR Part 820.180 (Records)',
    route: '/device-simulator'
  },
  {
    id: 'system-health',
    title: 'System Health & Connectivity Test',
    category: 'environmental',
    objective: 'Verify that the diagnostic system correctly identifies backend connectivity issues, database response times, and API endpoint failures.',
    regulatoryJustification: 'Medical device software must include self-diagnostic capabilities to detect and report system failures that could impact patient safety.',
    riskLevel: 'high',
    estimatedDuration: '2-3 minutes',
    preConditions: [
      'Backend server must be running',
      'Diagnostic Test page must be accessible at /diagnostic-test',
      'Network connection must be stable'
    ],
    testSteps: [
      {
        stepNumber: 1,
        action: 'Navigate to Diagnostic Test page (/diagnostic-test)',
        expectedResult: 'Page loads with system health dashboard',
        verificationMethod: 'visual'
      },
      {
        stepNumber: 2,
        action: 'Click "Run Full Diagnostic" button',
        expectedResult: 'System begins testing all endpoints. Progress indicators show real-time status.',
        verificationMethod: 'visual',
        screenshots: true
      },
      {
        stepNumber: 3,
        action: 'Observe Backend Connectivity test',
        expectedResult: 'Status changes to "PASS" with green checkmark. Response time < 500ms displayed.',
        verificationMethod: 'visual',
        screenshots: true
      },
      {
        stepNumber: 4,
        action: 'Observe Database Query test',
        expectedResult: 'Status shows "PASS". Query response time displayed (typically 100-300ms).',
        verificationMethod: 'visual'
      },
      {
        stepNumber: 5,
        action: 'Check Escalation Engine test',
        expectedResult: 'Status shows "OPERATIONAL". Test verifies escalation logic is loaded and functional.',
        verificationMethod: 'visual'
      },
      {
        stepNumber: 6,
        action: 'Review Logging System test',
        expectedResult: 'All 3 logging systems report "HEALTHY" (device sim, cloud, audit)',
        verificationMethod: 'visual',
        screenshots: true
      },
      {
        stepNumber: 7,
        action: 'Check for any warnings or errors in diagnostic summary',
        expectedResult: 'Summary shows: "All systems operational. 0 errors, 0 warnings."',
        verificationMethod: 'visual'
      }
    ],
    passCriteria: [
      '✅ Backend connectivity test completes successfully',
      '✅ Database response time < 1000ms (acceptable performance)',
      '✅ All API endpoints respond with 200 OK status',
      '✅ Escalation engine reports operational status',
      '✅ All 3 logging systems report healthy',
      '✅ No critical errors or warnings in diagnostic report',
      '✅ Diagnostic results can be exported as PDF/JSON for audit'
    ],
    fdaReference: '21 CFR Part 820.30 (Design Controls)',
    route: '/diagnostic-test'
  }
];

const TESTING_CATEGORIES = [
  {
    id: 'device-simulator',
    title: 'Device Simulator',
    description: 'Test hardware interactions without physical device',
    icon: Laptop,
    color: 'emerald',
    route: '/device-simulator',
    protocolCount: TEST_PROTOCOLS.filter(p => p.route === '/device-simulator').length
  },
  {
    id: 'testing-checklist',
    title: 'Testing Checklist',
    description: 'Comprehensive feature verification suite',
    icon: CheckSquare,
    color: 'blue',
    route: '/testing-checklist',
    protocolCount: TEST_PROTOCOLS.filter(p => p.route === '/testing-checklist').length
  },
  {
    id: 'diagnostic-test',
    title: 'System Diagnostics',
    description: 'Real-time system health monitoring',
    icon: Activity,
    color: 'rose',
    route: '/diagnostic-test',
    protocolCount: TEST_PROTOCOLS.filter(p => p.route === '/diagnostic-test').length
  }
];

export default function TestingTools() {
  const [selectedProtocol, setSelectedProtocol] = useState<TestProtocol | null>(null);
  const [expandedProtocol, setExpandedProtocol] = useState<string | null>(null);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'rose';
      case 'high': return 'orange';
      case 'medium': return 'amber';
      case 'low': return 'emerald';
      default: return 'slate';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <PageHeader
        title="Testing Tools"
        subtitle="Industry-Standard Testing Protocols for Medical Device Software"
        icon={Beaker}
      />

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Testing Protocol Standards Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-2 border-blue-300 dark:border-blue-800/30 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <ClipboardList className="text-blue-600 dark:text-blue-400" size={28} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                Best-in-Class Testing Protocol
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full border border-blue-300 dark:border-blue-700">
                  ISO 13485 | FDA 21 CFR Part 11
                </span>
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                Each test protocol includes: <strong>Test Objective</strong>, <strong>Pre-Conditions</strong>, 
                <strong> Step-by-Step Instructions</strong>, <strong>Expected Results</strong>, and <strong>Pass/Fail Criteria</strong>. 
                Designed for independent observer verification and FDA audit compliance.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Target className="text-blue-500" size={16} />
                  <span>Clear Objectives</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <ListChecks className="text-blue-500" size={16} />
                  <span>Step-by-Step</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Eye className="text-blue-500" size={16} />
                  <span>Observer Verified</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Shield className="text-blue-500" size={16} />
                  <span>FDA Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Protocols List */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <FileText className="text-slate-600 dark:text-slate-400" size={20} />
            Available Test Protocols
          </h3>
          
          <div className="space-y-4">
            {TEST_PROTOCOLS.map((protocol) => {
              const isExpanded = expandedProtocol === protocol.id;
              const riskColor = getRiskColor(protocol.riskLevel);
              
              return (
                <motion.div
                  key={protocol.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
                >
                  {/* Protocol Header */}
                  <div 
                    className="p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    onClick={() => setExpandedProtocol(isExpanded ? null : protocol.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            {protocol.title}
                          </h4>
                          <span className={cn(
                            "text-xs font-semibold px-2 py-1 rounded-full border uppercase",
                            `text-${riskColor}-700 dark:text-${riskColor}-300 bg-${riskColor}-50 dark:bg-${riskColor}-900/20 border-${riskColor}-200 dark:border-${riskColor}-800`
                          )}>
                            {protocol.riskLevel} RISK
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            ⏱️ {protocol.estimatedDuration}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          <strong>Objective:</strong> {protocol.objective}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 italic">
                          📋 {protocol.regulatoryJustification}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedProtocol(isExpanded ? null : protocol.id);
                        }}
                      >
                        {isExpanded ? 'Collapse' : 'View Protocol'}
                        <ChevronRight className={cn(
                          "ml-2 transition-transform",
                          isExpanded && "rotate-90"
                        )} size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Protocol Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-slate-200 dark:border-slate-800"
                      >
                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50">
                          {/* Pre-Conditions */}
                          <div className="mb-6">
                            <h5 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                              <Info className="text-blue-500" size={18} />
                              Pre-Conditions (Setup Required)
                            </h5>
                            <ul className="space-y-2">
                              {protocol.preConditions.map((condition, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                  <div className="mt-1 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{idx + 1}</span>
                                  </div>
                                  {condition}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Test Steps */}
                          <div className="mb-6">
                            <h5 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                              <ListChecks className="text-emerald-500" size={18} />
                              Test Steps & Expected Results
                            </h5>
                            <div className="space-y-4">
                              {protocol.testSteps.map((step) => (
                                <div 
                                  key={step.stepNumber}
                                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                        {step.stepNumber}
                                      </span>
                                    </div>
                                    <div className="flex-1">
                                      <div className="mb-2">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Action:</span>
                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">
                                          {step.action}
                                        </p>
                                      </div>
                                      <div className="mb-2 pl-4 border-l-2 border-emerald-300 dark:border-emerald-700">
                                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Expected Result:</span>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                                          {step.expectedResult}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                          Verification: <strong className="text-slate-700 dark:text-slate-300">{step.verificationMethod}</strong>
                                        </span>
                                        {step.screenshots && (
                                          <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                                            📸 Screenshot Recommended
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Pass Criteria */}
                          <div className="mb-6">
                            <h5 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                              <CheckCircle2 className="text-emerald-500" size={18} />
                              Pass/Fail Criteria
                            </h5>
                            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                              <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 font-medium">
                                Test PASSES if ALL of the following are verified:
                              </p>
                              <ul className="space-y-2">
                                {protocol.passCriteria.map((criteria, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                    <CheckCircle2 className="text-emerald-500 mt-0.5 flex-shrink-0" size={16} />
                                    {criteria}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* FDA Reference */}
                          {protocol.fdaReference && (
                            <div className="mb-4">
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                <strong>Regulatory Reference:</strong> {protocol.fdaReference}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <Link to={protocol.route} className="flex-1">
                              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Play className="mr-2" size={16} />
                                Start Test
                              </Button>
                            </Link>
                            <Button variant="outline" className="flex-1">
                              <Download className="mr-2" size={16} />
                              Export Protocol PDF
                            </Button>
                            <Button variant="outline">
                              <Printer size={16} />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Testing Tools Quick Access */}
        <div className="grid md:grid-cols-3 gap-6">
          {TESTING_CATEGORIES.map((category) => {
            const Icon = category.icon;
            
            return (
              <Link 
                key={category.id}
                to={category.route}
                className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-6 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-${category.color}-100 dark:bg-${category.color}-900/30`}>
                    <Icon className={`text-${category.color}-600 dark:text-${category.color}-400`} size={28} />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                    {category.protocolCount} protocols
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {category.title}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {category.description}
                </p>
                <div className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Open Testing Tool
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
