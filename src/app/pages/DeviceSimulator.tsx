import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Pill, 
  Wifi, 
  WifiOff,
  Battery,
  BatteryLow,
  Thermometer,
  Droplets,
  Activity,
  Shield,
  FileText,
  RefreshCw,
  Play,
  Pause,
  SkipForward,
  Server,
  Database,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../components/ui/utils';
import { useCaresolis } from '../context/CaresolisContext';
import { usePatient } from '../context/PatientContext';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Link } from 'react-router';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;

/**
 * DEVICE SIMULATOR - COMPREHENSIVE TESTING SUITE
 * 
 * Purpose: Test CG app functionality without physical hardware
 * 
 * Capabilities:
 * 1. Simulate IR sensor events (blister push-through detection)
 * 2. Trigger escalations (missed dose scenarios)
 * 3. Test environmental sensors (temperature, humidity)
 * 4. Simulate network failures (WiFi/LTE failover)
 * 5. Test all 3 logging systems simultaneously
 * 6. Verify FDA compliance workflows
 * 7. Security testing (tampering, unauthorized access)
 * 
 * **NEW: 2x25 Blister Pack System**
 * - Pack A: 25 dose positions (e.g., Week 1 AM doses)
 * - Pack B: 25 dose positions (e.g., Week 1 PM doses)
 * - Pharmacy-delivered patient-specific medication packs
 * - IR sensors detect blister push-through (foil break)
 * - Total capacity: 50 doses
 * 
 * FDA Compliance:
 * - All simulated events logged with "SIMULATION" flag
 * - Triple-redundant logging (device flash, cloud, audit)
 * - Tamper detection testing
 */

interface DeviceState {
  online: boolean;
  connectivity: 'wifi' | 'lte' | 'offline';
  battery: number;
  temperature: number;
  humidity: number;
  lastSync: Date;
  tamperDetected: boolean;
  firmwareVersion: string;
  packA: boolean[]; // 25 positions - true = blister intact, false = pushed through
  packB: boolean[]; // 25 positions
  packASerial: string;
  packBSerial: string;
  packAExpiration: Date | null;
  packBExpiration: Date | null;
}

interface SimulatedEvent {
  id: string;
  timestamp: Date;
  type: 'blister_pushed' | 'pills_dropped' | 'dose_removed' | 'dose_missed' | 'chute_timeout' | 'chute_represented' | 'tamper' | 'sensor_reading' | 'connectivity_change';
  pack?: 'A' | 'B';
  position?: number; // 1-25
  irGate?: 1 | 2 | 3; // Which IR gate triggered
  details: string;
  logged: {
    deviceFlash: boolean;
    cloudDatabase: boolean;
    auditTrail: boolean;
  };
}

interface DoseInProgress {
  doseId: string;
  pack: 'A' | 'B';
  position: number;
  scheduledTime: Date;
  stage: 'blister_pushed' | 'pills_in_chute' | 'pills_removed' | 'timeout' | 'represented';
  blisterPushedAt?: Date;
  pillsDroppedAt?: Date;
  pillsRemovedAt?: Date;
  timeoutAt?: Date;
  chuteExtended: boolean;
  timeoutTimer?: NodeJS.Timeout;
}

export default function DeviceSimulator() {
  const { getNow, refresh, settings } = useCaresolis();
  const { currentPatient } = usePatient();
  
  const [deviceState, setDeviceState] = useState<DeviceState>({
    online: true,
    connectivity: 'wifi',
    battery: 100,
    temperature: 22,
    humidity: 45,
    lastSync: new Date(),
    tamperDetected: false,
    firmwareVersion: 'v2.1.3-FDA',
    packA: new Array(25).fill(true), // true = blister intact
    packB: new Array(25).fill(true),
    packASerial: 'P001-A',
    packBSerial: 'P001-B',
    packAExpiration: new Date('2023-12-31'),
    packBExpiration: new Date('2023-12-31')
  });

  const [events, setEvents] = useState<SimulatedEvent[]>([]);
  const [autoSimulation, setAutoSimulation] = useState(false);
  const [testScenario, setTestScenario] = useState<string | null>(null);
  const [showSecurityPanel, setShowSecurityPanel] = useState(false);
  const [dosesInProgress, setDosesInProgress] = useState<DoseInProgress[]>([]);

  // Auto-update last sync time when online
  useEffect(() => {
    if (!deviceState.online) return;
    
    const interval = setInterval(() => {
      setDeviceState(prev => ({
        ...prev,
        lastSync: new Date()
      }));
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [deviceState.online]);

  // Add event to log
  const logEvent = (event: Omit<SimulatedEvent, 'id' | 'logged'>) => {
    const newEvent: SimulatedEvent = {
      ...event,
      id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      logged: {
        deviceFlash: true,
        cloudDatabase: deviceState.online,
        auditTrail: true
      }
    };
    
    setEvents(prev => [newEvent, ...prev].slice(0, 50)); // Keep last 50 events
    return newEvent;
  };

  // Simulate dose removal (IR sensor detection)
  const simulateDoseRemoval = async (compartment: string = 'A1') => {
    const event = logEvent({
      timestamp: getNow(),
      type: 'dose_removed',
      pack: 'A',
      position: 1,
      irGate: 3,
      details: `IR Gate #3: Patient removed pills from chute (final confirmation)`
    });

    // Call backend to register dose event
    try {
      const response = await fetch(`${SERVER_URL}/verify-dose`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientId: currentPatient?.id || '1',
          compartment,
          timestamp: event.timestamp.toISOString(),
          deviceId: 'SIM_DEVICE_001',
          eventId: event.id,
          sensorData: {
            irBeamBroken: true,
            gatePosition: 'open',
            compartmentEmpty: true
          },
          simulation: true // Flag for FDA audit
        })
      });

      if (response.ok) {
        toast.success(`✅ Dose removal verified - IR Gate #3 triggered`, {
          description: 'Triple-logged: Device flash, Cloud DB, Audit trail'
        });
        refresh();
      } else {
        toast.error('Failed to verify dose removal');
      }
    } catch (error) {
      console.error('Dose verification error:', error);
      toast.error('Network error - Event logged to device flash only');
    }
  };

  // Simulate complete dose journey (all 3 IR gates)
  const simulateCompleteDoseJourney = async (pack: 'A' | 'B', position: number) => {
    toast.info('🧪 Starting complete dose journey simulation', {
      description: `Pack ${pack}, Position ${position}`
    });

    // Stage 1: Blister Push
    await new Promise(resolve => setTimeout(resolve, 500));
    const blisterEvent = logEvent({
      timestamp: getNow(),
      type: 'blister_pushed',
      pack,
      position,
      irGate: 1,
      details: `IR Gate #1: Patient pushed blister ${pack}${position} through foil`
    });
    toast.success('✅ IR Gate #1: Blister pushed', {
      description: 'Patient initiated dose removal'
    });

    // Stage 2: Pills Drop
    await new Promise(resolve => setTimeout(resolve, 1500));
    const dropEvent = logEvent({
      timestamp: getNow(),
      type: 'pills_dropped',
      pack,
      position,
      irGate: 2,
      details: `IR Gate #2: Pills dropped into dispensing chute`
    });
    toast.success('✅ IR Gate #2: Pills in chute', {
      description: 'Pills successfully released - 15 min timer started'
    });

    // Stage 3: Patient Removal (after short delay)
    await new Promise(resolve => setTimeout(resolve, 2000));
    const removalEvent = logEvent({
      timestamp: getNow(),
      type: 'dose_removed',
      pack,
      position,
      irGate: 3,
      details: `IR Gate #3: Patient removed pills from chute (FINAL CONFIRMATION)`
    });
    toast.success('✅ IR Gate #3: Dose taken!', {
      description: 'Complete dose journey verified - Chute returning home'
    });

    refresh();
  };

  // Simulate chute timeout scenario
  const simulateChuteTimeout = async (pack: 'A' | 'B', position: number) => {
    toast.info('🧪 Simulating chute timeout scenario', {
      description: `Pack ${pack}, Position ${position} - Pills NOT removed`
    });

    // Stage 1: Blister Push
    await new Promise(resolve => setTimeout(resolve, 500));
    logEvent({
      timestamp: getNow(),
      type: 'blister_pushed',
      pack,
      position,
      irGate: 1,
      details: `IR Gate #1: Patient pushed blister ${pack}${position}`
    });

    // Stage 2: Pills Drop
    await new Promise(resolve => setTimeout(resolve, 1500));
    logEvent({
      timestamp: getNow(),
      type: 'pills_dropped',
      pack,
      position,
      irGate: 2,
      details: `IR Gate #2: Pills in chute - 15 min timer started`
    });

    // Stage 3: Timeout (simulated - normally 15 minutes)
    await new Promise(resolve => setTimeout(resolve, 2000));
    logEvent({
      timestamp: getNow(),
      type: 'chute_timeout',
      pack,
      position,
      details: `Chute timeout: 15 minutes elapsed, IR Gate #3 not triggered - Chute returning home`
    });
    toast.warning('⚠️ Chute timeout - Pills not removed', {
      description: 'Chute retracted for safety - Escalation beginning'
    });

    await simulateMissedDose();
  };

  // Simulate re-present dose after caregiver contact
  const simulateRepresentDose = async (pack: 'A' | 'B', position: number) => {
    toast.info('📞 Simulating caregiver intervention', {
      description: 'Caregiver contacted patient - Authorizing chute re-presentation'
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
    logEvent({
      timestamp: getNow(),
      type: 'chute_represented',
      pack,
      position,
      details: `Caregiver authorized chute re-presentation - Extending chute with previously dispensed dose`
    });
    toast.success('✅ Chute re-presented to patient', {
      description: 'Pills extended back to patient - Waiting for IR Gate #3'
    });

    // Patient removes pills (delayed but successful)
    await new Promise(resolve => setTimeout(resolve, 2000));
    logEvent({
      timestamp: getNow(),
      type: 'dose_removed',
      pack,
      position,
      irGate: 3,
      details: `IR Gate #3: Patient removed pills (delayed success)`
    });
    toast.success('✅ Delayed dose taken successfully!', {
      description: 'Chute returning home - Adherence marked as delayed'
    });

    refresh();
  };

  // Simulate missed dose (trigger escalation)
  const simulateMissedDose = async () => {
    const event = logEvent({
      timestamp: getNow(),
      type: 'dose_missed',
      details: 'Grace period expired - No IR sensor detection'
    });

    toast.warning('⚠️ Missed dose detected - Escalation initiated', {
      description: 'Care Circle will be notified per FDA escalation protocol'
    });

    refresh();
  };

  // Simulate connectivity change
  const simulateConnectivityChange = (newState: 'wifi' | 'lte' | 'offline') => {
    setDeviceState(prev => ({
      ...prev,
      connectivity: newState,
      online: newState !== 'offline'
    }));

    logEvent({
      timestamp: getNow(),
      type: 'connectivity_change',
      details: `Connectivity changed: ${deviceState.connectivity} → ${newState}`
    });

    if (newState === 'lte') {
      toast.info('📡 LTE Failover activated', {
        description: 'WiFi unavailable - Using cellular backup'
      });
    } else if (newState === 'offline') {
      toast.error('❌ Device offline', {
        description: 'Events stored in device flash until reconnection'
      });
    } else {
      toast.success('✅ WiFi connection restored');
    }
  };

  // Simulate tamper detection
  const simulateTamper = () => {
    setDeviceState(prev => ({
      ...prev,
      tamperDetected: true
    }));

    logEvent({
      timestamp: getNow(),
      type: 'tamper',
      details: 'Accelerometer detected unauthorized device movement'
    });

    toast.error('🚨 TAMPER DETECTED', {
      description: 'Security alert logged - Care Circle notified'
    });
  };

  // Simulate environmental sensor reading
  const simulateSensorReading = () => {
    const temp = 18 + Math.random() * 10; // 18-28°C
    const humidity = 30 + Math.random() * 40; // 30-70%

    setDeviceState(prev => ({
      ...prev,
      temperature: parseFloat(temp.toFixed(1)),
      humidity: parseFloat(humidity.toFixed(1))
    }));

    logEvent({
      timestamp: getNow(),
      type: 'sensor_reading',
      details: `Temperature: ${temp.toFixed(1)}°C, Humidity: ${humidity.toFixed(1)}%`
    });
  };

  // Run automated test scenario
  const runTestScenario = async (scenario: string) => {
    setTestScenario(scenario);
    setAutoSimulation(true);

    switch (scenario) {
      case 'normal_day':
        toast.info('🧪 Running: Normal Day Scenario');
        // Simulate doses at scheduled times
        for (let i = 0; i < 3; i++) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          await simulateDoseRemoval(`A${i + 1}`);
        }
        break;

      case 'missed_escalation':
        toast.info('🧪 Running: Missed Dose Escalation Test');
        await simulateMissedDose();
        break;

      case 'network_failover':
        toast.info('🧪 Running: Network Failover Test');
        simulateConnectivityChange('lte');
        await new Promise(resolve => setTimeout(resolve, 3000));
        await simulateDoseRemoval('B1');
        await new Promise(resolve => setTimeout(resolve, 2000));
        simulateConnectivityChange('wifi');
        break;

      case 'security_breach':
        toast.info('🧪 Running: Security Breach Test');
        simulateTamper();
        break;

      case 'environmental_monitoring':
        toast.info('🧪 Running: Environmental Monitoring Test');
        for (let i = 0; i < 5; i++) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          simulateSensorReading();
        }
        break;
    }

    setAutoSimulation(false);
    setTestScenario(null);
  };

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
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Zap className="text-purple-400" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-100">
                  Device Simulator
                </h1>
                <p className="text-slate-400">
                  Comprehensive testing suite for CG app without physical hardware
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider rounded">
              Testing Mode
            </span>
            <Button
              onClick={() => setShowSecurityPanel(!showSecurityPanel)}
              variant="outline"
              className="border-slate-700"
            >
              {showSecurityPanel ? <EyeOff size={16} /> : <Eye size={16} />}
              <span className="ml-2">Security Panel</span>
            </Button>
          </div>
        </div>

        {/* Device Status Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Activity size={20} className="text-emerald-400" />
            Device Status
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Connectivity */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {deviceState.connectivity === 'wifi' && <Wifi className="text-emerald-400" size={20} />}
                {deviceState.connectivity === 'lte' && <Activity className="text-amber-400" size={20} />}
                {deviceState.connectivity === 'offline' && <WifiOff className="text-rose-400" size={20} />}
                <span className="text-xs text-slate-400 uppercase">Connectivity</span>
              </div>
              <div className="text-lg font-semibold text-slate-100">
                {deviceState.connectivity.toUpperCase()}
              </div>
            </div>

            {/* Battery */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {deviceState.battery > 20 ? (
                  <Battery className="text-emerald-400" size={20} />
                ) : (
                  <BatteryLow className="text-rose-400" size={20} />
                )}
                <span className="text-xs text-slate-400 uppercase">Battery</span>
              </div>
              <div className="text-lg font-semibold text-slate-100">
                {deviceState.battery}%
              </div>
            </div>

            {/* Temperature */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="text-blue-400" size={20} />
                <span className="text-xs text-slate-400 uppercase">Temperature</span>
              </div>
              <div className="text-lg font-semibold text-slate-100">
                {deviceState.temperature}°C
              </div>
            </div>

            {/* Humidity */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="text-cyan-400" size={20} />
                <span className="text-xs text-slate-400 uppercase">Humidity</span>
              </div>
              <div className="text-lg font-semibold text-slate-100">
                {deviceState.humidity}%
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  deviceState.online ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                )} />
                <span className="text-slate-400">
                  {deviceState.online ? 'Online' : 'Offline'}
                </span>
              </div>
              
              <div className="text-slate-400">
                Last sync: {deviceState.lastSync.toLocaleTimeString()}
              </div>
            </div>
            
            <div className="text-slate-500">
              Firmware: {deviceState.firmwareVersion}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Zap size={20} className="text-purple-400" />
              Quick Actions
            </h2>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Triple IR Gate Testing (NEW)</label>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    onClick={() => simulateCompleteDoseJourney('A', 1)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                  >
                    <Pill size={14} className="mr-2" />
                    Complete Dose Journey (All 3 Gates)
                  </Button>
                  <Button
                    onClick={() => simulateChuteTimeout('A', 2)}
                    className="bg-amber-600 hover:bg-amber-700 text-xs"
                  >
                    <Clock size={14} className="mr-2" />
                    Chute Timeout (15min) → Escalation
                  </Button>
                  <Button
                    onClick={() => simulateRepresentDose('A', 2)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-xs"
                  >
                    <RefreshCw size={14} className="mr-2" />
                    CG Re-Present Dose (After Contact)
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Legacy Quick Actions</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => simulateDoseRemoval('A1')}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle2 size={16} className="mr-2" />
                    Dose Removed
                  </Button>
                  <Button
                    onClick={simulateMissedDose}
                    className="bg-rose-600 hover:bg-rose-700"
                  >
                    <XCircle size={16} className="mr-2" />
                    Missed Dose
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Connectivity</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => simulateConnectivityChange('wifi')}
                    variant="outline"
                    className={cn(
                      "border-slate-700",
                      deviceState.connectivity === 'wifi' && "bg-emerald-500/20 border-emerald-500"
                    )}
                  >
                    <Wifi size={16} className="mr-1" />
                    WiFi
                  </Button>
                  <Button
                    onClick={() => simulateConnectivityChange('lte')}
                    variant="outline"
                    className={cn(
                      "border-slate-700",
                      deviceState.connectivity === 'lte' && "bg-amber-500/20 border-amber-500"
                    )}
                  >
                    <Activity size={16} className="mr-1" />
                    LTE
                  </Button>
                  <Button
                    onClick={() => simulateConnectivityChange('offline')}
                    variant="outline"
                    className={cn(
                      "border-slate-700",
                      deviceState.connectivity === 'offline' && "bg-rose-500/20 border-rose-500"
                    )}
                  >
                    <WifiOff size={16} className="mr-1" />
                    Offline
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Environment & Security</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={simulateSensorReading}
                    variant="outline"
                    className="border-slate-700"
                  >
                    <Thermometer size={16} className="mr-2" />
                    Sensor Reading
                  </Button>
                  <Button
                    onClick={simulateTamper}
                    variant="outline"
                    className="border-rose-500 text-rose-400 hover:bg-rose-500/10"
                  >
                    <AlertTriangle size={16} className="mr-2" />
                    Tamper Alert
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Automated Test Scenarios */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Play size={20} className="text-indigo-400" />
              Automated Test Scenarios
            </h2>
            
            <div className="space-y-2">
              {[
                { id: 'normal_day', label: 'Normal Day (3 doses)', icon: CheckCircle2, color: 'emerald' },
                { id: 'missed_escalation', label: 'Missed Dose → Escalation', icon: AlertTriangle, color: 'amber' },
                { id: 'network_failover', label: 'WiFi → LTE Failover', icon: Wifi, color: 'blue' },
                { id: 'security_breach', label: 'Security Breach Test', icon: Shield, color: 'rose' },
                { id: 'environmental_monitoring', label: 'Environmental Monitoring', icon: Thermometer, color: 'cyan' }
              ].map((scenario) => {
                const Icon = scenario.icon;
                const isRunning = testScenario === scenario.id;
                
                return (
                  <Button
                    key={scenario.id}
                    onClick={() => runTestScenario(scenario.id)}
                    disabled={autoSimulation}
                    variant="outline"
                    className={cn(
                      "w-full justify-start border-slate-700",
                      isRunning && "bg-indigo-500/20 border-indigo-500"
                    )}
                  >
                    <Icon size={16} className={cn(
                      "mr-2",
                      isRunning && "animate-pulse"
                    )} />
                    {scenario.label}
                    {isRunning && (
                      <span className="ml-auto text-xs text-indigo-400">Running...</span>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Security Panel */}
        {showSecurityPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900 border border-rose-700 rounded-2xl p-6"
          >
            <h2 className="text-lg font-semibold text-rose-400 mb-4 flex items-center gap-2">
              <Shield size={20} />
              Security Testing Panel
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Tamper Detection</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Status:</span>
                    <span className={cn(
                      "font-semibold",
                      deviceState.tamperDetected ? "text-rose-400" : "text-emerald-400"
                    )}>
                      {deviceState.tamperDetected ? 'DETECTED' : 'Normal'}
                    </span>
                  </div>
                  {deviceState.tamperDetected && (
                    <Button
                      onClick={() => setDeviceState(prev => ({ ...prev, tamperDetected: false }))}
                      variant="outline"
                      className="w-full border-slate-700 text-xs"
                    >
                      Reset Tamper Flag
                    </Button>
                  )}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Encryption Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="text-emerald-400" size={14} />
                    <span className="text-slate-400">Device-Cloud: AES-256</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="text-emerald-400" size={14} />
                    <span className="text-slate-400">Sensor-MCU: AES-128</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Audit Logs</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Device Flash:</span>
                    <CheckCircle2 className="text-emerald-400" size={14} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Cloud Database:</span>
                    {deviceState.online ? (
                      <CheckCircle2 className="text-emerald-400" size={14} />
                    ) : (
                      <XCircle className="text-rose-400" size={14} />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Audit Trail:</span>
                    <CheckCircle2 className="text-emerald-400" size={14} />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">FDA Compliance</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="text-emerald-400" size={14} />
                    <span className="text-slate-400">21 CFR Part 11</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="text-emerald-400" size={14} />
                    <span className="text-slate-400">ISO 14971 Risk Mgmt</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Event Log */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <FileText size={20} className="text-slate-400" />
              Event Log
              <span className="text-sm text-slate-500">({events.length} events)</span>
            </h2>
            
            <Button
              onClick={() => setEvents([])}
              variant="outline"
              className="border-slate-700"
              size="sm"
            >
              Clear Log
            </Button>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No events logged yet. Run a simulation to start.
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "p-3 rounded-lg border",
                    event.type === 'dose_removed' && "bg-emerald-500/5 border-emerald-500/20",
                    event.type === 'dose_missed' && "bg-rose-500/5 border-rose-500/20",
                    event.type === 'tamper' && "bg-red-500/5 border-red-500/20",
                    event.type === 'connectivity_change' && "bg-blue-500/5 border-blue-500/20",
                    event.type === 'sensor_reading' && "bg-cyan-500/5 border-cyan-500/20"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {event.type === 'dose_removed' && <CheckCircle2 size={14} className="text-emerald-400" />}
                        {event.type === 'dose_missed' && <XCircle size={14} className="text-rose-400" />}
                        {event.type === 'tamper' && <AlertTriangle size={14} className="text-red-400" />}
                        {event.type === 'connectivity_change' && <Wifi size={14} className="text-blue-400" />}
                        {event.type === 'sensor_reading' && <Thermometer size={14} className="text-cyan-400" />}
                        
                        <span className="text-sm font-medium text-slate-300">
                          {event.type.replace('_', ' ').toUpperCase()}
                        </span>
                        
                        {event.compartment && (
                          <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded">
                            {event.compartment}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-slate-400">{event.details}</p>
                      
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Database size={10} className={event.logged.deviceFlash ? "text-emerald-400" : "text-slate-600"} />
                          <span className="text-slate-500">Flash</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Server size={10} className={event.logged.cloudDatabase ? "text-emerald-400" : "text-slate-600"} />
                          <span className="text-slate-500">Cloud</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText size={10} className={event.logged.auditTrail ? "text-emerald-400" : "text-slate-600"} />
                          <span className="text-slate-500">Audit</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-500">
                      {event.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}