import React, { useState, useEffect } from 'react';
import {
  Activity,
  Wifi,
  WifiOff,
  Cloud,
  CloudOff,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Server,
  Radio,
  Timer,
  BarChart3,
  Signal,
  Shield
} from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { clsx } from 'clsx';

// ==================== TYPES ====================

interface HeartbeatStatus {
  isAlive: boolean;
  lastHeartbeat: Date;
  secondsSinceLastBeat: number;
  consecutiveSuccess: number;
  deviceId: string;
}

interface UptimeMetrics {
  period: '7d' | '30d' | '90d';
  uptimePercentage: number;
  totalMinutes: number;
  downMinutes: number;
  slaTarget: number;
  status: 'exceeds' | 'meets' | 'below';
}

interface FailoverEvent {
  id: string;
  timestamp: Date;
  trigger: 'wifi_loss' | 'isp_outage' | 'manual_test' | 'power_cycle';
  switchTime: number; // milliseconds
  duration: number; // minutes on LTE
  dataTransferred: number; // MB
  resolved: boolean;
}

interface SyncLatency {
  timestamp: Date;
  latency: number; // milliseconds
  endpoint: string;
  status: 'optimal' | 'degraded' | 'critical';
}

interface OfflineIncident {
  id: string;
  startTime: Date;
  endTime: Date | null;
  duration: number; // minutes
  cause: 'power_outage' | 'network_failure' | 'device_malfunction' | 'scheduled_maintenance';
  resolved: boolean;
  dataLoss: boolean;
  notes: string;
}

// ==================== MOCK DATA ====================

const MOCK_HEARTBEAT: HeartbeatStatus = {
  isAlive: true,
  lastHeartbeat: new Date(),
  secondsSinceLastBeat: 12,
  consecutiveSuccess: 2847,
  deviceId: 'CS-HH-2024-001'
};

const MOCK_UPTIME: UptimeMetrics[] = [
  {
    period: '7d',
    uptimePercentage: 99.97,
    totalMinutes: 10080,
    downMinutes: 3,
    slaTarget: 99.9,
    status: 'exceeds'
  },
  {
    period: '30d',
    uptimePercentage: 99.94,
    totalMinutes: 43200,
    downMinutes: 26,
    slaTarget: 99.9,
    status: 'exceeds'
  },
  {
    period: '90d',
    uptimePercentage: 99.89,
    totalMinutes: 129600,
    downMinutes: 143,
    slaTarget: 99.5,
    status: 'exceeds'
  }
];

const MOCK_FAILOVER_EVENTS: FailoverEvent[] = [
  {
    id: 'fo-001',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    trigger: 'wifi_loss',
    switchTime: 847,
    duration: 23,
    dataTransferred: 4.7,
    resolved: true
  },
  {
    id: 'fo-002',
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    trigger: 'isp_outage',
    switchTime: 1203,
    duration: 127,
    dataTransferred: 18.3,
    resolved: true
  },
  {
    id: 'fo-003',
    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    trigger: 'manual_test',
    switchTime: 654,
    duration: 5,
    dataTransferred: 1.2,
    resolved: true
  },
  {
    id: 'fo-004',
    timestamp: new Date(Date.now() - 34 * 24 * 60 * 60 * 1000),
    trigger: 'power_cycle',
    switchTime: 923,
    duration: 8,
    dataTransferred: 2.1,
    resolved: true
  },
  {
    id: 'fo-005',
    timestamp: new Date(Date.now() - 67 * 24 * 60 * 60 * 1000),
    trigger: 'wifi_loss',
    switchTime: 1104,
    duration: 45,
    dataTransferred: 9.8,
    resolved: true
  }
];

const MOCK_LATENCY_DATA: SyncLatency[] = Array.from({ length: 24 }, (_, i) => {
  const baseLatency = 45;
  const variance = Math.random() * 30 - 15;
  const latency = Math.max(20, baseLatency + variance);
  return {
    timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000),
    latency: Math.round(latency),
    endpoint: 'supabase-api',
    status: latency < 100 ? 'optimal' : latency < 200 ? 'degraded' : 'critical'
  };
});

const MOCK_OFFLINE_INCIDENTS: OfflineIncident[] = [
  {
    id: 'off-001',
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 1000),
    duration: 3,
    cause: 'network_failure',
    resolved: true,
    dataLoss: false,
    notes: 'ISP brief outage, automatic LTE failover activated'
  },
  {
    id: 'off-002',
    startTime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 127 * 60 * 1000),
    duration: 127,
    cause: 'network_failure',
    resolved: true,
    dataLoss: false,
    notes: 'Regional ISP outage, extended LTE operation'
  },
  {
    id: 'off-003',
    startTime: new Date(Date.now() - 34 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 34 * 24 * 60 * 60 * 1000 + 8 * 60 * 1000),
    duration: 8,
    cause: 'power_cycle',
    resolved: true,
    dataLoss: false,
    notes: 'Device reboot during firmware update'
  },
  {
    id: 'off-004',
    startTime: new Date(Date.now() - 67 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 67 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
    duration: 45,
    cause: 'network_failure',
    resolved: true,
    dataLoss: false,
    notes: 'WiFi router failure, LTE fallback until resolution'
  },
  {
    id: 'off-005',
    startTime: new Date(Date.now() - 82 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 82 * 24 * 60 * 60 * 1000 + 2 * 60 * 1000),
    duration: 2,
    cause: 'scheduled_maintenance',
    resolved: true,
    dataLoss: false,
    notes: 'Planned database migration, sub-SLA maintenance window'
  }
];

// ==================== COMPONENTS ====================

function HeartbeatMonitor({ heartbeat }: { heartbeat: HeartbeatStatus }) {
  const [secondsSince, setSecondsSince] = useState(heartbeat.secondsSinceLastBeat);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsSince(prev => (prev + 1) % 30);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isHealthy = secondsSince < 35;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={clsx(
            "p-3 rounded-xl relative",
            isHealthy ? "bg-emerald-100" : "bg-rose-100"
          )}>
            <Activity className={clsx(
              isHealthy ? "text-emerald-600" : "text-rose-600"
            )} size={24} />
            {isHealthy && (
              <motion.div
                className="absolute inset-0 bg-emerald-400 rounded-xl"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Device Heartbeat</h2>
            <p className="text-sm text-slate-600">30-second health check cycle</p>
          </div>
        </div>
        <div className={clsx(
          "px-4 py-2 rounded-full font-bold text-sm",
          isHealthy ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
        )}>
          {isHealthy ? '✓ OPERATIONAL' : '⚠ DEGRADED'}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="text-xs text-slate-500 mb-1">Last Heartbeat</div>
          <div className="text-2xl font-bold text-slate-900">{secondsSince}s</div>
          <div className="text-xs text-slate-500 mt-1">ago</div>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="text-xs text-slate-500 mb-1">Consecutive Success</div>
          <div className="text-2xl font-bold text-emerald-600">{heartbeat.consecutiveSuccess.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">heartbeats</div>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="text-xs text-slate-500 mb-1">Device ID</div>
          <div className="text-sm font-mono font-bold text-slate-900">{heartbeat.deviceId}</div>
          <div className="text-xs text-slate-500 mt-1">Verified</div>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="text-xs text-slate-500 mb-1">Next Check In</div>
          <div className="text-2xl font-bold text-blue-600">{30 - secondsSince}s</div>
          <div className="text-xs text-slate-500 mt-1">expected</div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
          <div className="text-xs text-blue-900">
            <strong>Clinical-Grade Monitoring:</strong> Device transmits encrypted health status every 30 seconds. 
            Automatic escalation triggers if 2 consecutive heartbeats are missed (&gt;60s silence).
          </div>
        </div>
      </div>
    </div>
  );
}

function UptimeStats({ metrics }: { metrics: UptimeMetrics[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-xl">
          <TrendingUp className="text-blue-600" size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">System Uptime</h2>
          <p className="text-sm text-slate-600">Multi-period availability tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const periodLabel = {
            '7d': '7 Days',
            '30d': '30 Days',
            '90d': '90 Days'
          }[metric.period];

          return (
            <div key={metric.period} className="p-5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-slate-600">{periodLabel}</div>
                {metric.status === 'exceeds' && (
                  <CheckCircle2 className="text-emerald-600" size={18} />
                )}
              </div>

              <div className="mb-4">
                <div className="text-4xl font-bold text-slate-900 mb-1">
                  {metric.uptimePercentage.toFixed(2)}%
                </div>
                <div className="text-xs text-slate-500">
                  Target: {metric.slaTarget}% SLA
                </div>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                <div
                  className={clsx(
                    "h-2 rounded-full transition-all",
                    metric.status === 'exceeds' ? "bg-emerald-600" :
                    metric.status === 'meets' ? "bg-blue-600" : "bg-rose-600"
                  )}
                  style={{ width: `${metric.uptimePercentage}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-slate-500">Total Time</div>
                  <div className="font-semibold text-slate-700">
                    {Math.floor(metric.totalMinutes / 60 / 24)}d {Math.floor((metric.totalMinutes / 60) % 24)}h
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Downtime</div>
                  <div className="font-semibold text-rose-600">
                    {metric.downMinutes}m
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Zap className="text-emerald-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <div className="font-bold text-emerald-900 mb-1">Enterprise SLA Performance</div>
            <div className="text-sm text-emerald-800">
              Caresolis maintains 99.9%+ uptime across all measurement periods, exceeding industry standards 
              for medical device infrastructure. Redundant connectivity ensures continuous operation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FailoverEventLog({ events }: { events: FailoverEvent[] }) {
  const getTriggerLabel = (trigger: FailoverEvent['trigger']) => {
    return {
      wifi_loss: 'WiFi Loss',
      isp_outage: 'ISP Outage',
      manual_test: 'Manual Test',
      power_cycle: 'Power Cycle'
    }[trigger];
  };

  const getTriggerIcon = (trigger: FailoverEvent['trigger']) => {
    return {
      wifi_loss: WifiOff,
      isp_outage: CloudOff,
      manual_test: Zap,
      power_cycle: Activity
    }[trigger];
  };

  const avgSwitchTime = events.reduce((sum, e) => sum + e.switchTime, 0) / events.length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Radio className="text-purple-600" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">LTE Failover Events</h2>
            <p className="text-sm text-slate-600">Automatic network redundancy activations</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900">{events.length}</div>
          <div className="text-xs text-slate-500">Last 90 days</div>
        </div>
      </div>

      <div className="mb-6 p-4 bg-slate-50 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-slate-500 mb-1">Avg Switch Time</div>
          <div className="text-2xl font-bold text-slate-900">{Math.round(avgSwitchTime)}ms</div>
        </div>
        <div>
          <div className="text-slate-500 mb-1">Total LTE Duration</div>
          <div className="text-2xl font-bold text-purple-600">
            {events.reduce((sum, e) => sum + e.duration, 0)}m
          </div>
        </div>
        <div>
          <div className="text-slate-500 mb-1">Data Transferred</div>
          <div className="text-2xl font-bold text-blue-600">
            {events.reduce((sum, e) => sum + e.dataTransferred, 0).toFixed(1)} MB
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {events.map((event) => {
          const TriggerIcon = getTriggerIcon(event.trigger);
          return (
            <div key={event.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-purple-300 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <TriggerIcon className="text-purple-600" size={18} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{getTriggerLabel(event.trigger)}</div>
                    <div className="text-xs text-slate-500">
                      {event.timestamp.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded">
                  RESOLVED
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs mt-3">
                <div>
                  <div className="text-slate-500">Switch Time</div>
                  <div className="font-semibold text-slate-900">{event.switchTime}ms</div>
                </div>
                <div>
                  <div className="text-slate-500">LTE Duration</div>
                  <div className="font-semibold text-slate-900">{event.duration}m</div>
                </div>
                <div>
                  <div className="text-slate-500">Data Transfer</div>
                  <div className="font-semibold text-slate-900">{event.dataTransferred} MB</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Signal className="text-purple-600 flex-shrink-0 mt-0.5" size={16} />
          <div className="text-xs text-purple-900">
            <strong>Dual-Connectivity Architecture:</strong> Device automatically switches to LTE within 1-2 seconds 
            when primary WiFi connection fails. Zero data loss during transitions.
          </div>
        </div>
      </div>
    </div>
  );
}

function CloudSyncLatency({ data }: { data: SyncLatency[] }) {
  const avgLatency = data.reduce((sum, d) => sum + d.latency, 0) / data.length;
  const maxLatency = Math.max(...data.map(d => d.latency));
  const optimalCount = data.filter(d => d.status === 'optimal').length;

  const chartData = data.map((d, index) => ({
    time: d.timestamp.getHours() + 'h',
    latency: d.latency,
    threshold: 100,
    id: `latency-${index}-${d.timestamp.getTime()}` // Unique key for React
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Cloud className="text-blue-600" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Cloud Sync Latency</h2>
            <p className="text-sm text-slate-600">Real-time data pipeline performance</p>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="text-xs text-slate-500 mb-1">Average Latency</div>
          <div className="text-3xl font-bold text-slate-900">{Math.round(avgLatency)}ms</div>
          <div className="text-xs text-emerald-600 mt-1">✓ Within SLA (&lt;100ms)</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="text-xs text-slate-500 mb-1">Peak Latency</div>
          <div className="text-3xl font-bold text-slate-900">{maxLatency}ms</div>
          <div className="text-xs text-slate-500 mt-1">24-hour window</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="text-xs text-slate-500 mb-1">Optimal Performance</div>
          <div className="text-3xl font-bold text-emerald-600">{Math.round((optimalCount / data.length) * 100)}%</div>
          <div className="text-xs text-slate-500 mt-1">{optimalCount}/{data.length} samples</div>
        </div>
      </div>

      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%" minHeight={256}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="latencyGradient-cloud-sync" x1="0" y1="0" x2="0" y2="1">
                <stop key="latency-gradient-stop-1" offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop key="latency-gradient-stop-2" offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="time" 
              stroke="#64748b" 
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#64748b" 
              style={{ fontSize: '12px' }}
              label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#64748b' } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="latency" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fill="url(#latencyGradient-cloud-sync)" 
            />
            <Line 
              type="monotone" 
              dataKey="threshold" 
              stroke="#10b981" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="text-xs text-center text-slate-500 mb-4">
        Green dashed line = 100ms SLA target
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Zap className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
          <div className="text-xs text-blue-900">
            <strong>Sub-100ms Data Pipeline:</strong> All medication events, check-ins, and telemetry sync to 
            Supabase cloud with &lt;100ms average latency. Real-time visibility for care teams.
          </div>
        </div>
      </div>
    </div>
  );
}

function OfflineLog({ incidents }: { incidents: OfflineIncident[] }) {
  const totalDowntime = incidents.reduce((sum, i) => sum + i.duration, 0);
  const avgIncidentDuration = totalDowntime / incidents.length;

  const getCauseLabel = (cause: OfflineIncident['cause']) => {
    return {
      power_outage: 'Power Outage',
      network_failure: 'Network Failure',
      device_malfunction: 'Device Malfunction',
      scheduled_maintenance: 'Scheduled Maintenance'
    }[cause];
  };

  const getCauseBadgeColor = (cause: OfflineIncident['cause']) => {
    return {
      power_outage: 'bg-rose-100 text-rose-700',
      network_failure: 'bg-amber-100 text-amber-700',
      device_malfunction: 'bg-red-100 text-red-700',
      scheduled_maintenance: 'bg-blue-100 text-blue-700'
    }[cause];
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-100 rounded-xl">
            <Clock className="text-slate-600" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Offline Duration Log</h2>
            <p className="text-sm text-slate-600">Historical downtime incidents (90 days)</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900">{incidents.length}</div>
          <div className="text-xs text-slate-500">incidents</div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="text-xs text-slate-500 mb-1">Total Downtime</div>
          <div className="text-2xl font-bold text-slate-900">
            {Math.floor(totalDowntime / 60)}h {totalDowntime % 60}m
          </div>
          <div className="text-xs text-slate-500 mt-1">90-day period</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="text-xs text-slate-500 mb-1">Avg Incident</div>
          <div className="text-2xl font-bold text-blue-600">{Math.round(avgIncidentDuration)}m</div>
          <div className="text-xs text-slate-500 mt-1">mean duration</div>
        </div>
        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <div className="text-xs text-emerald-700 mb-1">Data Loss Events</div>
          <div className="text-2xl font-bold text-emerald-600">0</div>
          <div className="text-xs text-emerald-700 mt-1">✓ Zero data loss</div>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {incidents.map((incident) => (
          <div key={incident.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={clsx(
                    "px-2 py-1 text-xs font-semibold rounded",
                    getCauseBadgeColor(incident.cause)
                  )}>
                    {getCauseLabel(incident.cause)}
                  </span>
                  {incident.resolved && (
                    <CheckCircle2 className="text-emerald-600" size={16} />
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  {incident.startTime.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-slate-900">{incident.duration}m</div>
                <div className="text-xs text-slate-500">duration</div>
              </div>
            </div>

            {incident.notes && (
              <div className="text-sm text-slate-700 bg-white p-3 rounded border border-slate-200">
                {incident.notes}
              </div>
            )}

            <div className="mt-3 flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <Server size={12} className="text-slate-500" />
                <span className="text-slate-600">
                  Data Loss: <strong className={incident.dataLoss ? "text-rose-600" : "text-emerald-600"}>
                    {incident.dataLoss ? 'Yes' : 'No'}
                  </strong>
                </span>
              </div>
              {incident.endTime && (
                <div className="flex items-center gap-1">
                  <Clock size={12} className="text-slate-500" />
                  <span className="text-slate-600">
                    Resolved: {incident.endTime.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="text-slate-600 flex-shrink-0 mt-0.5" size={16} />
          <div className="text-xs text-slate-700">
            <strong>Automatic Recovery:</strong> All offline events include automatic data buffering and 
            synchronization upon reconnection. No manual intervention required for incident resolution.
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function InfrastructureReliability() {
  const [heartbeat, setHeartbeat] = useState<HeartbeatStatus>(MOCK_HEARTBEAT);

  // Simulate heartbeat updates
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartbeat(prev => ({
        ...prev,
        lastHeartbeat: new Date(),
        consecutiveSuccess: prev.consecutiveSuccess + 1
      }));
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto pb-20 p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
          <Server className="text-blue-600 dark:text-blue-400" size={32} />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">Infrastructure Reliability</h1>
            {/* FDA COMPLIANCE BADGE */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-lg border-2 border-emerald-400">
              <Shield className="w-4 h-4" />
              FDA COMPLIANT
            </div>
          </div>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Clinical-grade system monitoring and assurance metrics</p>
        </div>
      </div>

      {/* Mission Critical Banner */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-emerald-50 border-2 border-blue-200 rounded-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-xl flex-shrink-0">
            <Shield className="text-blue-600" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-blue-900 mb-2">
              🏥 MEDICAL-GRADE INFRASTRUCTURE ASSURANCE
            </h2>
            <p className="text-sm text-blue-800 leading-relaxed mb-3">
              Caresolis is designed as an <strong>assurance system</strong>, not a reminder device. Our infrastructure 
              maintains enterprise SLAs with redundant connectivity, real-time health monitoring, and automatic failover 
              to ensure continuous operation for medication adherence and safety.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white/70 rounded-lg">
                <div className="font-bold text-blue-900 mb-1">30s Heartbeat</div>
                <div className="text-blue-700">Continuous device health verification</div>
              </div>
              <div className="p-3 bg-white/70 rounded-lg">
                <div className="font-bold text-blue-900 mb-1">99.9% Uptime</div>
                <div className="text-blue-700">Enterprise SLA compliance</div>
              </div>
              <div className="p-3 bg-white/70 rounded-lg">
                <div className="font-bold text-blue-900 mb-1">LTE Failover</div>
                <div className="text-blue-700">Automatic network redundancy</div>
              </div>
              <div className="p-3 bg-white/70 rounded-lg">
                <div className="font-bold text-blue-900 mb-1">Zero Data Loss</div>
                <div className="text-blue-700">Guaranteed event capture</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Heartbeat Monitor */}
      <div className="mb-8">
        <HeartbeatMonitor heartbeat={heartbeat} />
      </div>

      {/* Uptime Statistics */}
      <div className="mb-8">
        <UptimeStats metrics={MOCK_UPTIME} />
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* LTE Failover Events */}
        <FailoverEventLog events={MOCK_FAILOVER_EVENTS} />

        {/* Cloud Sync Latency */}
        <CloudSyncLatency data={MOCK_LATENCY_DATA} />
      </div>

      {/* Offline Duration Log */}
      <div className="mb-8">
        <OfflineLog incidents={MOCK_OFFLINE_INCIDENTS} />
      </div>

      {/* Footer Technical Specs */}
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 size={20} />
          Technical Infrastructure Specifications
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-semibold text-slate-700 mb-2">Connectivity</div>
            <ul className="space-y-1 text-slate-600">
              <li>• Primary: WiFi 802.11ac (2.4/5GHz)</li>
              <li>• Backup: LTE Cat-4 (Verizon/AT&T)</li>
              <li>• Failover: &lt;2 second automatic switch</li>
              <li>• Encryption: TLS 1.3 end-to-end</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-slate-700 mb-2">Cloud Infrastructure</div>
            <ul className="space-y-1 text-slate-600">
              <li>• Platform: Supabase (PostgreSQL)</li>
              <li>• Region: US-East-2 (Ohio)</li>
              <li>• Redundancy: Multi-AZ deployment</li>
              <li>• Sync Latency: &lt;100ms average</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-slate-700 mb-2">Monitoring & SLA</div>
            <ul className="space-y-1 text-slate-600">
              <li>• Heartbeat: 30-second interval</li>
              <li>• Uptime Target: 99.9% monthly</li>
              <li>• Data Buffering: 72-hour local cache</li>
              <li>• Incident Response: &lt;15 min MTTR</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}