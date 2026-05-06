# CareSolis Command Centre App Template

## Overview
The **Command Centre** is the administrative/clinical dashboard for monitoring multiple patients, system health, billing, and advanced analytics. It's designed for clinicians, administrators, and care coordinators.

**Key Features**:
- Multi-patient overview
- Advanced analytics and reporting
- RPM billing management
- System health monitoring
- Bulk operations
- Audit log analysis
- Configuration management

---

## App Structure

```
/src/app/
├── App.tsx
├── Root.tsx
├── routes.tsx           ← Advanced routing
├── pages/
│   ├── Dashboard.tsx             ← Multi-patient overview
│   ├── PatientList.tsx           ← All patients, sortable
│   ├── PatientDetail.tsx         ← Single patient deep dive
│   ├── Analytics.tsx             ← Advanced charts
│   ├── BillingDashboard.tsx      ← RPM billing
│   ├── SystemHealth.tsx          ← Infrastructure monitoring
│   ├── AuditLogs.tsx             ← FDA compliance logs
│   ├── UserManagement.tsx        ← Admin settings
│   └── Settings.tsx              ← System configuration
├── components/
│   ├── PatientCard.tsx           ← Patient summary card
│   ├── BulkActions.tsx           ← Multi-select operations
│   ├── AdvancedFilters.tsx       ← Complex filtering
│   ├── ReportGenerator.tsx       ← Export reports
│   └── ... (shared components)
├── context/
│   ├── MultiPatientContext.tsx   ← Manage multiple patients
│   └── ... (shared contexts)
└── styles/
    └── ... (copied from Caregiver App)
```

---

## Dashboard: Multi-Patient Overview

```tsx
// /src/app/pages/Dashboard.tsx

import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { PatientCard } from '../components/PatientCard';
import { SystemIntegrityPanel } from '../components/SystemIntegrityPanel';
import { useMultiPatient } from '../context/MultiPatientContext';

export default function Dashboard() {
  const { patients, loading, refresh } = useMultiPatient();
  
  const stats = {
    total: patients.length,
    active: patients.filter(p => p.status === 'active').length,
    escalated: patients.filter(p => p.deviceState?.status === 'escalated').length,
    nominal: patients.filter(p => p.deviceState?.status === 'nominal').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Command Centre</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and management
          </p>
        </div>
        
        <Button onClick={refresh} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6">
        <KPICard
          title="Total Patients"
          value={stats.total}
          color="text-primary"
        />
        <KPICard
          title="Active"
          value={stats.active}
          color="text-accent"
        />
        <KPICard
          title="Escalated"
          value={stats.escalated}
          color="text-destructive"
          alert={stats.escalated > 0}
        />
        <KPICard
          title="All Good"
          value={stats.nominal}
          color="text-accent"
        />
      </div>

      {/* System Health */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">System Health</h2>
        <SystemIntegrityPanel />
      </Card>

      {/* Active Alerts */}
      {stats.escalated > 0 && (
        <Card className="p-6 border-destructive">
          <h2 className="text-2xl font-bold mb-4 text-destructive">
            Active Escalations ({stats.escalated})
          </h2>
          <div className="space-y-4">
            {patients
              .filter(p => p.deviceState?.status === 'escalated')
              .map(patient => (
                <AlertCard key={patient.id} patient={patient} />
              ))}
          </div>
        </Card>
      )}

      {/* Patient Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4">All Patients</h2>
        <div className="grid grid-cols-3 gap-6">
          {patients.map(patient => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, color, alert }: any) {
  return (
    <Card className={`p-6 ${alert ? 'border-destructive animate-pulse' : ''}`}>
      <p className="text-sm text-muted-foreground mb-2">{title}</p>
      <p className={`text-4xl font-bold ${color}`}>{value}</p>
    </Card>
  );
}
```

---

## Patient List with Advanced Filtering

```tsx
// /src/app/pages/PatientList.tsx

import { useState } from 'react';
import { Link } from 'react-router';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useMultiPatient } from '../context/MultiPatientContext';

export default function PatientList() {
  const { patients } = useMultiPatient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'lastInteraction'>('name');
  const [selectedPatients, setSelectedPatients] = useState<Set<string>>(new Set());

  // Filtering
  const filtered = patients
    .filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter === 'all' || p.status === statusFilter)
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return 0;
    });

  const handleSelectAll = () => {
    if (selectedPatients.size === filtered.length) {
      setSelectedPatients(new Set());
    } else {
      setSelectedPatients(new Set(filtered.map(p => p.id)));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on ${selectedPatients.size} patients`);
    // Implement bulk operations
  };

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-6">Patient Management</h1>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-4 gap-4">
          <Input
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="inactive">Inactive</option>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <option value="name">Sort by Name</option>
            <option value="status">Sort by Status</option>
            <option value="lastInteraction">Sort by Last Check-In</option>
          </Select>
          
          <Button variant="outline" onClick={handleSelectAll}>
            {selectedPatients.size === filtered.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedPatients.size > 0 && (
        <Card className="p-4 mb-6 bg-accent/10 border-accent">
          <div className="flex items-center justify-between">
            <p className="font-medium">
              {selectedPatients.size} patient(s) selected
            </p>
            <div className="space-x-2">
              <Button onClick={() => handleBulkAction('export')} variant="outline">
                Export Data
              </Button>
              <Button onClick={() => handleBulkAction('report')} variant="outline">
                Generate Report
              </Button>
              <Button onClick={() => handleBulkAction('update')} variant="outline">
                Bulk Update
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Patient Table */}
      <Card>
        <table className="w-full">
          <thead className="border-b">
            <tr className="text-left">
              <th className="p-4 w-12">
                <input
                  type="checkbox"
                  checked={selectedPatients.size === filtered.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="p-4">Name</th>
              <th className="p-4">Status</th>
              <th className="p-4">Device Status</th>
              <th className="p-4">Last Check-In</th>
              <th className="p-4">Next Scheduled</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(patient => (
              <PatientRow
                key={patient.id}
                patient={patient}
                selected={selectedPatients.has(patient.id)}
                onSelect={(id) => {
                  const newSet = new Set(selectedPatients);
                  if (newSet.has(id)) {
                    newSet.delete(id);
                  } else {
                    newSet.add(id);
                  }
                  setSelectedPatients(newSet);
                }}
              />
            ))}
          </tbody>
        </table>
      </Card>

      {/* Pagination */}
      <div className="mt-6 flex justify-center">
        <Pagination currentPage={1} totalPages={Math.ceil(filtered.length / 50)} />
      </div>
    </div>
  );
}

function PatientRow({ patient, selected, onSelect }: any) {
  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="p-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(patient.id)}
        />
      </td>
      <td className="p-4">
        <Link to={`/patients/${patient.id}`} className="font-medium hover:underline">
          {patient.name}
        </Link>
      </td>
      <td className="p-4">
        <Badge variant={patient.status === 'active' ? 'success' : 'secondary'}>
          {patient.status}
        </Badge>
      </td>
      <td className="p-4">
        <DeviceStatusBadge status={patient.deviceState?.status} />
      </td>
      <td className="p-4 text-sm text-muted-foreground">
        {patient.deviceState?.lastInteraction || 'Never'}
      </td>
      <td className="p-4 text-sm text-muted-foreground">
        {patient.deviceState?.nextScheduled || 'N/A'}
      </td>
      <td className="p-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/patients/${patient.id}`}>View</Link>
        </Button>
      </td>
    </tr>
  );
}
```

---

## Advanced Analytics Dashboard

```tsx
// /src/app/pages/Analytics.tsx

import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Select } from '../components/ui/select';
import { LineChart, BarChart, PieChart } from 'recharts';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Analytics & Insights</h1>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard title="Total Check-Ins" value="1,247" change="+12%" />
        <StatCard title="On-Time Rate" value="94.3%" change="+2.1%" />
        <StatCard title="Escalations" value="43" change="-8%" positive />
        <StatCard title="Avg Response Time" value="4.2min" change="-15%" positive />
        <StatCard title="Medication Adherence" value="96.8%" change="+3%" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Check-In Trends</h3>
          {/* LineChart component */}
          <CheckInTrendChart timeRange={timeRange} />
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Status Distribution</h3>
          {/* PieChart component */}
          <StatusDistributionChart />
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Escalation Patterns</h3>
          {/* BarChart component */}
          <EscalationPatternChart timeRange={timeRange} />
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Medication Compliance</h3>
          <MedicationComplianceChart timeRange={timeRange} />
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Patient Performance</h3>
        <PerformanceTable />
      </Card>
    </div>
  );
}

function StatCard({ title, value, change, positive }: any) {
  const isPositive = positive !== undefined ? positive : change.startsWith('+');
  
  return (
    <Card className="p-4">
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <div className="flex items-baseline justify-between">
        <p className="text-3xl font-bold">{value}</p>
        <p className={`text-sm ${isPositive ? 'text-accent' : 'text-destructive'}`}>
          {change}
        </p>
      </div>
    </Card>
  );
}
```

---

## RPM Billing Dashboard

```tsx
// /src/app/pages/BillingDashboard.tsx

import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

export default function BillingDashboard() {
  const [period, setPeriod] = useState('current');
  
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-4xl font-bold">RPM Billing Dashboard</h1>

      {/* Revenue Overview */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Current Month Revenue</p>
          <p className="text-4xl font-bold text-accent">$8,940</p>
          <p className="text-sm text-muted-foreground mt-2">47 patients eligible</p>
        </Card>
        
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Avg per Patient</p>
          <p className="text-4xl font-bold">$190</p>
          <p className="text-sm text-muted-foreground mt-2">Range: $100-$200</p>
        </Card>
        
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Claims Ready</p>
          <p className="text-4xl font-bold text-primary">23</p>
          <Button className="mt-2 w-full" size="sm">Submit Claims</Button>
        </Card>
        
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Pending Review</p>
          <p className="text-4xl font-bold text-yellow-600">5</p>
          <Button className="mt-2 w-full" size="sm" variant="outline">Review</Button>
        </Card>
      </div>

      {/* CPT Code Breakdown */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">CPT Code Eligibility</h2>
        <div className="space-y-3">
          <CPTCodeRow
            code="99453"
            description="Initial device setup"
            eligible={47}
            reimbursement="$19.19"
            status="ready"
          />
          <CPTCodeRow
            code="99454"
            description="Device supply & 30 days data"
            eligible={45}
            reimbursement="$63.50"
            status="ready"
          />
          <CPTCodeRow
            code="99457"
            description="20 minutes care management"
            eligible={38}
            reimbursement="$50.18"
            status="ready"
          />
          <CPTCodeRow
            code="99458"
            description="Additional 20 minutes"
            eligible={12}
            reimbursement="$40.75"
            status="partial"
          />
        </div>
      </Card>

      {/* Patient Billing Detail */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Patient Billing Details</h2>
        <table className="w-full">
          <thead className="border-b">
            <tr className="text-left">
              <th className="p-3">Patient</th>
              <th className="p-3">99453</th>
              <th className="p-3">99454</th>
              <th className="p-3">99457</th>
              <th className="p-3">99458</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            <BillingRow
              patient="Margaret Chen"
              codes={{ '99453': true, '99454': true, '99457': true, '99458': false }}
              total="$132.87"
              status="ready"
            />
            {/* More rows... */}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function CPTCodeRow({ code, description, eligible, reimbursement, status }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
      <div>
        <p className="font-bold text-lg">{code}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="text-right">
        <p className="font-bold">{eligible} patients</p>
        <p className="text-sm text-accent">{reimbursement} each</p>
      </div>
      <Badge variant={status === 'ready' ? 'success' : 'secondary'}>
        {status}
      </Badge>
    </div>
  );
}
```

---

## Multi-Patient Context

```tsx
// /src/app/context/MultiPatientContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;

interface MultiPatientContextType {
  patients: any[];
  loading: boolean;
  refresh: () => Promise<void>;
  getPatient: (id: string) => any;
}

const MultiPatientContext = createContext<MultiPatientContextType | undefined>(undefined);

export function MultiPatientProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      
      // Fetch all patients
      const response = await fetch(`${SERVER_URL}/admin/patients`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch patients');
      
      const data = await response.json();
      setPatients(data.patients || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchPatients, 10000);
    return () => clearInterval(interval);
  }, []);

  const getPatient = (id: string) => {
    return patients.find(p => p.id === id);
  };

  return (
    <MultiPatientContext.Provider value={{ patients, loading, refresh: fetchPatients, getPatient }}>
      {children}
    </MultiPatientContext.Provider>
  );
}

export function useMultiPatient() {
  const context = useContext(MultiPatientContext);
  if (!context) throw new Error('useMultiPatient must be used within MultiPatientProvider');
  return context;
}
```

---

## Routing Configuration

```tsx
// /src/app/routes.tsx

import { createBrowserRouter } from 'react-router';
import Root from './Root';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import PatientDetail from './pages/PatientDetail';
import Analytics from './pages/Analytics';
import BillingDashboard from './pages/BillingDashboard';
import SystemHealth from './pages/SystemHealth';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: 'patients', Component: PatientList },
      { path: 'patients/:id', Component: PatientDetail },
      { path: 'analytics', Component: Analytics },
      { path: 'billing', Component: BillingDashboard },
      { path: 'system', Component: SystemHealth },
      { path: 'audit', Component: AuditLogs },
      { path: 'settings', Component: Settings },
      { path: '*', Component: NotFound },
    ],
  },
]);
```

---

## Sidebar Navigation

```tsx
// /src/app/components/Sidebar.tsx (Command Centre Version)

import { Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  DollarSign, 
  Activity, 
  FileText, 
  Settings 
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Patients', href: '/patients', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Billing', href: '/billing', icon: DollarSign },
  { name: 'System Health', href: '/system', icon: Activity },
  { name: 'Audit Logs', href: '/audit', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  
  return (
    <div className="w-64 bg-card border-r min-h-screen p-4">
      <nav className="space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg
                transition-colors
                ${isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
```

---

## Testing Checklist

- [ ] Multi-patient view loads all patients
- [ ] Filtering and sorting work correctly
- [ ] Bulk actions execute properly
- [ ] Analytics charts render with real data
- [ ] RPM billing calculations are accurate
- [ ] Audit logs display complete history
- [ ] System health shows real-time status
- [ ] Export functions generate correct reports
- [ ] Role-based access control works
- [ ] Real-time updates reflect across dashboard

---

## Next Steps

1. Create new Figma Make project: "CareSolis Command Centre"
2. Copy all shared files from Caregiver App
3. Implement multi-patient backend endpoints
4. Create admin-specific components
5. Test with multiple patient datasets
6. Set up role-based access control
7. Configure report exports
8. Deploy for clinical team access

---

**Last Updated**: March 17, 2026
