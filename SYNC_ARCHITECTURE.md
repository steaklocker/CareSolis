# CareSolis Multi-App Sync Architecture

## Overview
This document outlines the synchronization strategy for the three CareSolis applications:
1. **Caregiver App** - Family/caregiver interface for monitoring
2. **Device App** - Patient-facing device interface
3. **Command Centre App** - Administrative/clinical dashboard

## Architecture Goals
- **Real-time data sync** across all three apps via Supabase
- **Shared design system** for consistent UI/UX
- **Single source of truth** for patient data, events, and configurations
- **FDA-compliant logging** across all applications
- **Infrastructure-grade reliability** with offline support

---

## 1. Shared Design System

### Color Palette (Calm, Non-Clinical)
All three apps use the same color system defined in `/src/styles/theme.css`:

**Light Mode:**
- **Slate (Infrastructure)**: `hsl(215 25% 27%)` - Primary actions, headers
- **Emerald (Wellness)**: `hsl(158 64% 52%)` - Success states, positive indicators
- **Rose (Alerts)**: `hsl(0 84.2% 60.2%)` - Critical alerts, escalations
- **Background**: `hsl(0 0% 100%)` - Clean white
- **Muted**: `hsl(210 40% 96.1%)` - Subtle backgrounds

**Dark Mode:**
- **Background**: `hsl(222 47% 11%)` - Deep slate
- **Card**: `hsl(217 33% 17%)` - Elevated surfaces
- **Primary**: `hsl(158 64% 52%)` - Emerald for emphasis
- **Borders**: `hsl(217 33% 25%)` - Subtle separation

### Typography
- **H1**: 2.25rem, 700 weight - Page titles
- **H2**: 1.875rem, 600 weight - Section headers
- **H3**: 1.5rem, 600 weight - Subsection headers
- **Body**: Default with "rlig" and "calt" font features

### Shared Components to Copy
Copy these files to each app's `/src/app/components` directory:

#### Core UI Components (`/src/app/components/ui/`)
- `button.tsx` - Primary interactive elements
- `card.tsx` - Container component
- `badge.tsx` - Status indicators
- `input.tsx` - Form inputs
- `select.tsx` - Dropdown selections
- `dialog.tsx` - Modal dialogs
- `toast.tsx` - Notifications (via Sonner)

#### CareSolis-Specific Components
- `CaresolisLogo.tsx` - Consistent branding
- `Header.tsx` - App header with logo and navigation
- `ThemeToggle.tsx` - Dark/light mode switcher
- `TimeSyncIndicator.tsx` - FDA-compliant time sync status
- `LocationTimezoneIndicator.tsx` - Location awareness
- `OfflineIndicator.tsx` - Offline status banner
- `RoleBadge.tsx` - User role indicators
- `SystemIntegrityPanel.tsx` - Device health monitoring

### Shared Styles
Copy these files to each app's `/src/styles` directory:
- `theme.css` - Complete design system tokens
- `globals.css` - Base styles
- `tailwind.css` - Tailwind v4 configuration
- `fonts.css` - Font imports

---

## 2. Real-Time Data Synchronization

### Supabase Backend Architecture
All three apps connect to the **same Supabase backend** at:
```
https://${projectId}.supabase.co/functions/v1/make-server-9aeac050
```

### Shared Data Structures

#### Key-Value Store Schema (Multi-Patient)
```typescript
// Patient-scoped keys
mds:patient:{patientId}:device:state:v1        // Device status
mds:patient:{patientId}:device:config:v2       // Configuration
mds:patient:{patientId}:audit:*                // Audit logs
mds:patient:{patientId}:directory:*            // Care Circle contacts
mds:patient:{patientId}:notifications:*        // Notification logs
mds:patient:{patientId}:events:*               // Interaction events
mds:patient:{patientId}:settings:v1            // User settings
mds:patient:{patientId}:docs:library           // Document library

// Global keys
mds:global:audit:*                             // System-wide audit logs
```

#### Core Data Types (Copy to all apps)
```typescript
// /src/app/types/shared.ts

type ISO8601String = string;
type UUID = string;

interface InteractionEvent {
  id: UUID;
  date: string;
  createdAt?: ISO8601String;
  scheduledTime: string;
  status: 'Scheduled' | 'ReminderActive' | 'EscalationLevel1' | 
          'EscalationLevel2' | 'EscalationLevel3' | 'Acknowledged' | 
          'Check-In On Time' | 'Check-In Delayed' | 'Check-In Not Logged' | 'Closed';
  interactionTime: ISO8601String | null;
  acknowledgedTime: ISO8601String | null;
  escalationLevel: 0 | 1 | 2 | 3;
  logs: EscalationLog[];
}

interface DeviceState {
  status: 'nominal' | 'pending' | 'escalated' | 'system_fault';
  lastInteraction: ISO8601String | null;
  nextScheduled: ISO8601String;
  integrityHash: string;
  updatedAt: ISO8601String;
}

interface ContactRecord {
  id: UUID;
  name: string;
  role: string;
  phone: string;
  email: string;
  priority: number;
  active: boolean;
}

interface SystemConfig {
  schedule: string[] | ComplexSchedule;
  reminderOffset: number;
  level1Offset: number;
  level2Offset: number;
  level3Offset: number;
  gracePeriod: number;
  driftThreshold: number;
  vacationMode?: {
    enabled: boolean;
    startDate?: string;
    endDate?: string;
    enabledBy?: string;
    enabledAt?: string;
    reason?: string;
    ipAddress?: string;
  };
}
```

### Real-Time Sync Implementation

#### Step 1: Copy Shared Context to All Apps
Copy `/src/app/context/CaresolisContext.tsx` to all three apps. This provides:
- Device state management
- Patient data access
- Real-time updates
- Time synchronization
- Location management

#### Step 2: Implement Polling Strategy
Each app polls the backend every 5-10 seconds for updates:

```typescript
// In CaresolisContext.tsx
useEffect(() => {
  const interval = setInterval(() => {
    refresh(); // Fetch latest data
  }, 5000); // 5 second polling
  
  return () => clearInterval(interval);
}, [currentPatient]);
```

#### Step 3: Optimistic UI Updates
When making changes, update local state immediately, then sync to backend:

```typescript
const interact = async () => {
  // Optimistic update
  setStatusData(prev => ({ ...prev, status: 'nominal' }));
  
  // Backend sync
  const response = await fetch(`${SERVER_URL}/interact`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ patientId: currentPatient.id })
  });
  
  // Confirm with server response
  if (response.ok) {
    const data = await response.json();
    setStatusData(data.state);
  }
};
```

#### Step 4: Event Broadcasting (Optional Enhancement)
For true real-time sync, implement Supabase Realtime subscriptions:

```typescript
// In CaresolisContext.tsx
useEffect(() => {
  const supabase = createClient(projectId, publicAnonKey);
  
  const channel = supabase
    .channel(`patient:${currentPatient.id}`)
    .on('broadcast', { event: 'state-update' }, (payload) => {
      setStatusData(payload.state);
    })
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}, [currentPatient]);
```

---

## 3. App-Specific Features

### Caregiver App (Current Project)
**Purpose**: Family monitoring and care coordination

**Key Features**:
- Dashboard with Daily Interaction Ring
- Care Circle Journal (activity log)
- Environmental Wellness Telemetry
- RPM Billing Module
- Service Module (medication management)
- Care Circle management

**Data Access**: Read-only + acknowledge interactions

---

### Device App
**Purpose**: Patient-facing interface on the physical device

**Key Features**:
- Large, touch-friendly check-in button
- Visual reminder system
- Simple medication dispense confirmation
- Minimal UI (elderly-friendly)
- Audio/visual escalation alerts

**Data Access**: 
- Write interactions (`/interact` endpoint)
- Read current status and next scheduled time
- Device health monitoring

**Design Differences**:
- Larger fonts (2-3x normal)
- High contrast colors
- Simplified navigation
- Full-screen check-in button

---

### Command Centre App
**Purpose**: Clinical/administrative oversight

**Key Features**:
- Multi-patient dashboard
- Bulk operations
- Advanced analytics
- Configuration management
- Audit log analysis
- Billing reports
- System health monitoring

**Data Access**: Full read/write admin access

**Additional Components**:
- Patient list view
- Bulk escalation management
- Advanced reporting
- System diagnostics

---

## 4. Synchronization Checklist

### When Adding a New Feature:

#### ☐ Design System
- [ ] Add new colors to `/src/styles/theme.css` in all apps
- [ ] Create shared component in `/src/app/components`
- [ ] Export component for use in other apps
- [ ] Update this documentation

#### ☐ Backend API
- [ ] Add endpoint to `/supabase/functions/server/index.tsx`
- [ ] Use patient-scoped keys: `KEYS.CUSTOM_PREFIX(patientId)`
- [ ] Add FDA audit logging: `writeAuditLog(...)`
- [ ] Document endpoint in this file

#### ☐ Frontend Integration
- [ ] Update `CaresolisContext.tsx` with new data/methods
- [ ] Copy updated context to all three apps
- [ ] Test data flow in all apps
- [ ] Verify real-time updates work

#### ☐ Testing
- [ ] Test in Caregiver App
- [ ] Test in Device App
- [ ] Test in Command Centre App
- [ ] Verify cross-app sync (change in one, reflects in others)
- [ ] Test offline/online transitions

---

## 5. Critical Backend Endpoints

### Shared Across All Apps

#### `GET /status?patientId={id}`
Returns current device state and next scheduled interaction.

#### `POST /interact`
```json
{
  "patientId": "uuid",
  "clientTimestamp": "ISO8601"
}
```
Logs a patient check-in interaction.

#### `POST /acknowledge`
```json
{
  "patientId": "uuid",
  "acknowledgedBy": "caregiver-name",
  "clientTimestamp": "ISO8601"
}
```
Caregiver acknowledges an escalation.

#### `GET /logs?patientId={id}`
Returns audit logs (FDA compliance).

#### `GET /contacts?patientId={id}`
Returns Care Circle contacts.

#### `POST /contacts`
Adds a new contact to Care Circle.

#### `PUT /contacts/:id`
Updates an existing contact.

#### `DELETE /contacts/:id`
Removes a contact.

#### `GET /events?patientId={id}&date={YYYY-MM-DD}`
Returns interaction events for a specific date.

#### `POST /settings`
Updates system configuration (schedules, escalation timings).

---

## 6. Deployment Strategy

### Step 1: Update Caregiver App (This Project)
✅ Already complete - this is the source of truth.

### Step 2: Create Device App
1. Create new Figma Make project: "CareSolis Device"
2. Copy shared files:
   - `/src/styles/*` (all CSS files)
   - `/src/app/context/CaresolisContext.tsx`
   - `/src/app/context/PatientContext.tsx`
   - `/src/app/context/AuthContext.tsx`
   - `/src/app/components/CaresolisLogo.tsx`
   - `/src/app/components/ThemeToggle.tsx`
   - `/src/app/components/TimeSyncIndicator.tsx`
   - `/src/app/types/*` (all type definitions)
3. Create device-specific UI:
   - Large check-in button (full screen)
   - Simplified status display
   - Audio/visual alerts
4. Connect to same Supabase backend
5. Test interaction flow

### Step 3: Create Command Centre App
1. Create new Figma Make project: "CareSolis Command Centre"
2. Copy all shared files from Caregiver App
3. Add admin-specific features:
   - Multi-patient list view
   - Bulk operations
   - Advanced analytics
4. Connect to same Supabase backend
5. Test admin workflows

### Step 4: Ongoing Maintenance
- When updating design system, update all three apps
- When adding backend endpoints, document here
- When fixing bugs, apply fix to all affected apps
- Run weekly sync check: verify all apps show same data

---

## 7. File Copy Reference

### Files to Copy to All Apps

#### Styles (Copy `/src/styles/` → all apps)
```
/src/styles/theme.css
/src/styles/globals.css
/src/styles/tailwind.css
/src/styles/fonts.css
/src/styles/index.css
```

#### Context (Copy `/src/app/context/` → all apps)
```
/src/app/context/CaresolisContext.tsx
/src/app/context/PatientContext.tsx
/src/app/context/AuthContext.tsx
/src/app/context/AppLoadingContext.tsx
```

#### Shared Types (Copy `/src/app/types/` → all apps)
```
/src/app/types/shared.ts (create from backend types)
```

#### Core Components (Copy `/src/app/components/` → all apps)
```
/src/app/components/CaresolisLogo.tsx
/src/app/components/ThemeToggle.tsx
/src/app/components/ThemeProvider.tsx
/src/app/components/Header.tsx
/src/app/components/TimeSyncIndicator.tsx
/src/app/components/LocationTimezoneIndicator.tsx
/src/app/components/OfflineIndicator.tsx
/src/app/components/RoleBadge.tsx
/src/app/components/SystemIntegrityPanel.tsx
/src/app/components/ErrorBoundary.tsx
```

#### UI Components (Copy `/src/app/components/ui/` → all apps)
Copy entire `/src/app/components/ui/` folder

#### Utils (Copy `/src/app/utils/` → all apps)
```
/src/app/utils/timeSync.ts
/src/app/utils/locationSync.ts
```

#### Supabase Config (Copy `/utils/supabase/` → all apps)
```
/utils/supabase/info.tsx (contains projectId, publicAnonKey)
```

---

## 8. Real-Time Sync Enhancement (Future)

### Supabase Realtime Channels
For instant updates without polling:

```typescript
// Broadcast state changes
const broadcastStateUpdate = async (patientId: string, state: DeviceState) => {
  const supabase = createClient(projectId, publicAnonKey);
  await supabase.channel(`patient:${patientId}`)
    .send({
      type: 'broadcast',
      event: 'state-update',
      payload: { state }
    });
};

// Listen for updates in all apps
const subscribeToStateUpdates = (patientId: string, callback: (state: DeviceState) => void) => {
  const supabase = createClient(projectId, publicAnonKey);
  const channel = supabase
    .channel(`patient:${patientId}`)
    .on('broadcast', { event: 'state-update' }, (payload) => {
      callback(payload.state);
    })
    .subscribe();
  
  return () => supabase.removeChannel(channel);
};
```

### Benefits
- **Instant updates** (< 100ms latency)
- **Reduced server load** (no polling)
- **Better UX** (real-time feedback)
- **FDA compliant** (still logged to KV store)

---

## 9. Troubleshooting

### Data Out of Sync
1. Check patient ID is correct in all apps
2. Verify backend URL is identical
3. Clear cache and refresh
4. Check audit logs for conflicts

### UI Inconsistencies
1. Compare `theme.css` files
2. Verify Tailwind v4 is configured
3. Check component versions match
4. Review dark mode settings

### Backend Errors
1. Check server logs: `/supabase/functions/server/index.tsx`
2. Verify API keys are correct
3. Test endpoints with curl/Postman
4. Review audit logs for errors

---

## 10. FDA Compliance Notes

All three apps must maintain:
- **Triple logging**: Audit logs, notification logs, event logs
- **Time synchronization**: < 5 second drift tolerance
- **Immutable audit trail**: Never delete logs, only append
- **Patient-scoped isolation**: No cross-patient data leakage
- **Integrity monitoring**: Hash verification on all state changes

Each app logs to the same backend, ensuring complete audit trail across the ecosystem.

---

## Questions?
This is a living document. Update it as the system evolves.
