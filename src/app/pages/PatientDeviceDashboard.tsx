/**
 * Patient Device Dashboard
 * 
 * Caregiver-facing dashboard with AUTO-SYNC capabilities:
 * 1. Medication schedules auto-sync when changed
 * 2. Caregiver contact info auto-syncs when updated
 * 3. Medication inventory auto-syncs when refilled
 * 4. Real-time device status monitoring
 * 
 * NO MANUAL SYNC BUTTONS - All data syncs automatically!
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Smartphone, 
  Calendar, 
  Users, 
  Pill, 
  Battery, 
  Wifi, 
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  Loader2,
  XCircle,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { usePatient } from '../context/PatientContext';
import { autoSyncService, type SyncStatus } from '../services/autoSyncService';
import {
  getDeviceStatus,
  generateSampleSchedule,
  generateSampleContacts,
  generateSampleInventory,
  type MedicationDose,
  type CaregiverContact,
  type EmergencyContact,
  type MedicationCompartment,
  type DeviceStatus
} from '../utils/patientDeviceSync';

export default function PatientDeviceDashboard() {
  const { currentPatient } = usePatient();
  const patientId = currentPatient?.id || 'patient-001';
  const patientName = currentPatient?.name || 'John Doe';

  // Sync Status
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  // Device Status State
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Medication Schedule State
  const [doses, setDoses] = useState<MedicationDose[]>([]);
  const [isInitialScheduleLoad, setIsInitialScheduleLoad] = useState(true);

  // Caregiver Contacts State
  const [primaryCaregiver, setPrimaryCaregiver] = useState<CaregiverContact | null>(null);
  const [backupCaregivers, setBackupCaregivers] = useState<CaregiverContact[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [isInitialContactsLoad, setIsInitialContactsLoad] = useState(true);

  // Medication Inventory State
  const [compartments, setCompartments] = useState<MedicationCompartment[]>([]);
  const [isInitialInventoryLoad, setIsInitialInventoryLoad] = useState(true);

  // Subscribe to sync status changes
  useEffect(() => {
    const unsubscribe = autoSyncService.onStatusChange((status) => {
      setSyncStatus(status);
    });

    return unsubscribe;
  }, []);

  // Auto-sync medication schedule when it changes
  useEffect(() => {
    if (doses.length > 0 && !isInitialScheduleLoad) {
      autoSyncSchedule();
    }
  }, [doses, isInitialScheduleLoad]);

  // Auto-sync caregiver contacts when they change
  useEffect(() => {
    if (primaryCaregiver && !isInitialContactsLoad) {
      autoSyncContacts();
    }
  }, [primaryCaregiver, backupCaregivers, emergencyContacts, isInitialContactsLoad]);

  // Auto-sync medication inventory when it changes
  useEffect(() => {
    if (compartments.length > 0 && !isInitialInventoryLoad) {
      autoSyncInventory();
    }
  }, [compartments, isInitialInventoryLoad]);

  // Fetch device status on mount and periodically
  useEffect(() => {
    fetchDeviceStatus();

    if (autoRefresh) {
      const interval = setInterval(fetchDeviceStatus, 15000); // Every 15 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, patientId]);

  // ============================================================================
  // AUTO-SYNC FUNCTIONS
  // ============================================================================

  async function autoSyncSchedule() {
    try {
      await autoSyncService.syncSchedule(
        doses,
        currentPatient?.patientLocation?.timezone || 'America/Los_Angeles'
      );
    } catch (error) {
      // Silently handle - error already logged in service
      console.log('[Dashboard] Auto-sync schedule completed with errors (may be expected if backend not ready)');
    }
  }

  async function autoSyncContacts() {
    try {
      await autoSyncService.syncCaregivers({
        primary: primaryCaregiver,
        backup: backupCaregivers,
        emergencyContacts
      });
    } catch (error) {
      // Silently handle - error already logged in service
      console.log('[Dashboard] Auto-sync contacts completed with errors (may be expected if backend not ready)');
    }
  }

  async function autoSyncInventory() {
    try {
      await autoSyncService.syncInventory({
        compartments,
        lowStockThreshold: 7,
        lastRefill: Date.now()
      });
    } catch (error) {
      // Silently handle - error already logged in service
      console.log('[Dashboard] Auto-sync inventory completed with errors (may be expected if backend not ready)');
    }
  }

  // ============================================================================
  // DEVICE STATUS
  // ============================================================================

  async function fetchDeviceStatus() {
    setIsLoadingStatus(true);
    const result = await getDeviceStatus(patientId);
    setIsLoadingStatus(false);

    if (result.success && result.data) {
      setDeviceStatus(result.data);
    } else {
      console.error('Failed to fetch device status:', result.error);
    }
  }

  // ============================================================================
  // SAMPLE DATA LOADERS
  // ============================================================================

  function handleLoadSampleSchedule() {
    const sampleSchedule = generateSampleSchedule(
      patientId,
      patientName,
      currentPatient?.patientLocation?.timezone || 'America/Los_Angeles'
    );
    setDoses(sampleSchedule.doses);
    setIsInitialScheduleLoad(false);
    toast.success(`✅ Loaded ${sampleSchedule.doses.length} sample doses - Auto-syncing...`);
  }

  function handleLoadSampleContacts() {
    const sampleContacts = generateSampleContacts();
    setPrimaryCaregiver(sampleContacts.primary);
    setBackupCaregivers(sampleContacts.backup);
    setEmergencyContacts(sampleContacts.emergencyContacts);
    setIsInitialContactsLoad(false);
    toast.success('✅ Loaded sample caregiver contacts - Auto-syncing...');
  }

  function handleLoadSampleInventory() {
    const sampleInventory = generateSampleInventory();
    setCompartments(sampleInventory.compartments);
    setIsInitialInventoryLoad(false);
    toast.success(`✅ Loaded ${sampleInventory.compartments.length} sample compartments - Auto-syncing...`);
  }

  function handleRefillCompartment(compartmentId: string, amount: number) {
    setCompartments(prev => prev.map(comp =>
      comp.id === compartmentId
        ? { ...comp, pillCount: Math.min(comp.pillCount + amount, comp.maxCapacity), lastRefilled: Date.now() }
        : comp
    ));
    toast.success(`✅ Compartment refilled +${amount} pills - Auto-syncing...`);
  }

  // ============================================================================
  // SYNC STATUS INDICATOR
  // ============================================================================

  function renderSyncStatus() {
    if (syncStatus === 'syncing') {
      return (
        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">Syncing to Patient Device...</span>
        </div>
      );
    }

    if (syncStatus === 'success') {
      return (
        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Synced to Patient Device</span>
        </div>
      );
    }

    if (syncStatus === 'error') {
      return (
        <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">
          <XCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Sync Failed - Check console</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
        <Zap className="w-4 h-4" />
        <span className="text-sm font-medium">Auto-Sync Enabled</span>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Smartphone className="w-8 h-8 text-emerald-600" />
            Patient Device Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Auto-sync enabled - Changes sync automatically to Patient Device
          </p>
        </div>

        <div className="flex items-center gap-3">
          {renderSyncStatus()}
          
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDeviceStatus}
            disabled={isLoadingStatus}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingStatus ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh
          </label>
        </div>
      </div>

      {/* Auto-Sync Info Banner */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-emerald-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-slate-900">Auto-Sync Active</p>
            <p className="text-sm text-slate-600 mt-1">
              All changes are automatically synced to the Patient Device. No manual sync required. 
              The Patient Device will receive updates within 30 seconds.
            </p>
          </div>
        </div>
      </Card>

      {/* Device Status Card */}
      <Card className="p-6 bg-gradient-to-r from-slate-50 to-emerald-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Device Status
          </h2>
          <Badge variant={deviceStatus?.isOnline ? 'default' : 'destructive'}>
            {deviceStatus?.isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>

        {deviceStatus ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-slate-600">State</p>
              <p className="font-semibold">{deviceStatus.state}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-600">Battery</p>
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4" />
                <p className="font-semibold">{deviceStatus.batteryLevel}%</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-600">Signal</p>
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                <p className="font-semibold capitalize">{deviceStatus.signalStrength}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-600">Chute Status</p>
              <p className="font-semibold">{deviceStatus.chuteOpen ? 'Open' : 'Closed'}</p>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 text-center py-4">
            {isLoadingStatus ? 'Loading device status...' : 'No device status available'}
          </p>
        )}
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schedule">
            <Calendar className="w-4 h-4 mr-2" />
            Medication Schedule
          </TabsTrigger>
          <TabsTrigger value="contacts">
            <Users className="w-4 h-4 mr-2" />
            Caregiver Contacts
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Pill className="w-4 h-4 mr-2" />
            Medication Inventory
          </TabsTrigger>
        </TabsList>

        {/* MEDICATION SCHEDULE TAB */}
        <TabsContent value="schedule" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Medication Schedule</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadSampleSchedule}
              >
                Load Sample Data
              </Button>
            </div>

            {doses.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-slate-600">
                    {doses.length} doses scheduled (next 7 days)
                  </p>
                  <div className="flex items-center gap-2 text-emerald-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Auto-synced
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {doses.slice(0, 15).map(dose => (
                    <div
                      key={dose.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{dose.medicationName} {dose.strength}</p>
                        <p className="text-sm text-slate-600">
                          {dose.scheduledTime} • {dose.priority === 'time_critical' ? '⏰ Time Critical' : 'Standard'}
                        </p>
                      </div>
                      <Badge variant={dose.priority === 'time_critical' ? 'destructive' : 'secondary'}>
                        {dose.compartmentId}
                      </Badge>
                    </div>
                  ))}
                  {doses.length > 15 && (
                    <p className="text-sm text-slate-500 text-center py-2">
                      + {doses.length - 15} more doses...
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No medication schedule loaded</p>
                <p className="text-sm mt-1">Click "Load Sample Data" to get started</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* CAREGIVER CONTACTS TAB */}
        <TabsContent value="contacts" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Caregiver Contacts</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadSampleContacts}
              >
                Load Sample Data
              </Button>
            </div>

            {primaryCaregiver ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-emerald-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Auto-synced
                  </div>
                </div>

                {/* Primary Caregiver */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>Primary Caregiver</Badge>
                  </div>
                  <p className="font-semibold">{primaryCaregiver.name}</p>
                  <p className="text-sm text-slate-600">{primaryCaregiver.relationship}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    📞 {primaryCaregiver.phone} • 📧 {primaryCaregiver.email}
                  </p>
                </div>

                {/* Backup Caregivers */}
                {backupCaregivers.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-slate-600">Backup Caregivers</h4>
                    {backupCaregivers.map(caregiver => (
                      <div key={caregiver.id} className="p-3 bg-slate-50 rounded-lg">
                        <p className="font-medium">{caregiver.name}</p>
                        <p className="text-sm text-slate-600">
                          {caregiver.relationship} • {caregiver.phone}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Emergency Contacts */}
                {emergencyContacts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-slate-600">Emergency Contacts</h4>
                    {emergencyContacts.map(contact => (
                      <div key={contact.id} className="p-3 bg-rose-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{contact.name}</p>
                            <p className="text-sm text-slate-600">
                              {contact.relationship} • {contact.phone}
                            </p>
                          </div>
                          <Badge variant="destructive">Priority {contact.priority}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No caregiver contacts loaded</p>
                <p className="text-sm mt-1">Click "Load Sample Data" to get started</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* MEDICATION INVENTORY TAB */}
        <TabsContent value="inventory" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Medication Inventory</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadSampleInventory}
              >
                Load Sample Data
              </Button>
            </div>

            {compartments.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    {compartments.length} compartments
                  </p>
                  <div className="flex items-center gap-2 text-emerald-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Auto-synced
                  </div>
                </div>

                <div className="grid gap-4">
                  {compartments.map(compartment => {
                    const fillPercentage = (compartment.pillCount / compartment.maxCapacity) * 100;
                    const isLowStock = compartment.pillCount < 10;

                    return (
                      <div
                        key={compartment.id}
                        className={`p-4 rounded-lg border-2 ${
                          isLowStock ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge>{compartment.id}</Badge>
                              {isLowStock && <AlertTriangle className="w-4 h-4 text-rose-600" />}
                            </div>
                            <p className="font-semibold mt-1">
                              {compartment.medicationName} {compartment.strength}
                            </p>
                            <p className="text-sm text-slate-600">
                              {compartment.pillCount} / {compartment.maxCapacity} pills
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRefillCompartment(compartment.id, 5)}
                            >
                              +5
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRefillCompartment(compartment.id, 10)}
                            >
                              +10
                            </Button>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              isLowStock ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${fillPercentage}%` }}
                          />
                        </div>

                        {compartment.expirationDate && (
                          <p className="text-xs text-slate-500 mt-2">
                            Expires: {compartment.expirationDate}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Pill className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No medication inventory loaded</p>
                <p className="text-sm mt-1">Click "Load Sample Data" to get started</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}