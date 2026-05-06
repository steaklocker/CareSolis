# CareSolis Shared Components Guide

## Quick Start: Syncing Components Across Apps

### Step 1: Copy Design System Files

Copy these files from **Caregiver App** to **Device App** and **Command Centre App**:

#### Core Styles
```bash
# Copy entire styles directory
/src/styles/theme.css
/src/styles/globals.css
/src/styles/tailwind.css
/src/styles/fonts.css
/src/styles/index.css
```

#### Shared Types
```bash
/src/app/types/shared.ts
```

#### Sync Utilities
```bash
/src/app/utils/dataSync.ts
/src/app/utils/timeSync.ts
/src/app/utils/locationSync.ts
```

#### Supabase Configuration
```bash
/utils/supabase/info.tsx
```

---

## Component Categories

### Category 1: Must Copy to All Apps (Core Identity)

These components define the CareSolis brand and core functionality:

#### 🎨 Branding & Theme
```
/src/app/components/CaresolisLogo.tsx
/src/app/components/ThemeProvider.tsx
/src/app/components/ThemeToggle.tsx
/src/app/components/Header.tsx (modify per app)
```

#### 🔒 Auth & Security
```
/src/app/context/AuthContext.tsx
/src/app/components/ProtectedRoute.tsx
/src/app/components/RoleBadge.tsx
```

#### 📊 System Monitoring
```
/src/app/components/TimeSyncIndicator.tsx
/src/app/components/LocationTimezoneIndicator.tsx
/src/app/components/OfflineIndicator.tsx
/src/app/components/SystemIntegrityPanel.tsx
```

#### 🛡️ Error Handling
```
/src/app/components/ErrorBoundary.tsx
/src/app/components/AppLoadingScreen.tsx
```

---

### Category 2: Copy UI Components Library

Copy the entire UI components folder:

```
/src/app/components/ui/
├── button.tsx
├── card.tsx
├── badge.tsx
├── input.tsx
├── select.tsx
├── dialog.tsx
├── dropdown-menu.tsx
├── label.tsx
├── checkbox.tsx
├── radio-group.tsx
├── switch.tsx
├── textarea.tsx
├── tabs.tsx
└── ... (all UI primitives)
```

**Why**: These are the building blocks for all three apps. Consistent UI components ensure a cohesive experience.

---

### Category 3: Context Providers (Data Layer)

Copy these to share data management logic:

```
/src/app/context/CaresolisContext.tsx  ← Most important!
/src/app/context/PatientContext.tsx
/src/app/context/AuthContext.tsx
/src/app/context/AppLoadingContext.tsx
/src/app/context/UserRoleContext.tsx (if using role-based access)
```

**Important**: These contexts connect all apps to the same backend and provide shared state management.

---

### Category 4: App-Specific Customization

These components should be **customized per app** but use the same base:

#### Caregiver App
```
Header.tsx         - Shows patient selector, Care Circle nav
Sidebar.tsx        - Full navigation with all modules
Dashboard widgets  - Activity rings, stability charts
```

#### Device App (Simplified)
```
Header.tsx         - Just logo and time, no navigation
No Sidebar         - Full-screen single-purpose UI
CheckInButton.tsx  - Large, touch-friendly primary CTA
StatusDisplay.tsx  - Simple visual feedback
```

#### Command Centre App (Advanced)
```
Header.tsx         - Multi-patient selector, admin tools
Sidebar.tsx        - Extended navigation with analytics
PatientListView    - Bulk operations, sorting, filtering
AdvancedReports    - Billing, compliance, system health
```

---

## Color Palette Reference

### Light Mode
```css
--primary: hsl(215 25% 27%)        /* Slate - Infrastructure */
--accent: hsl(158 64% 52%)         /* Emerald - Wellness */
--destructive: hsl(0 84.2% 60.2%)  /* Rose - Alerts */
--background: hsl(0 0% 100%)       /* Clean white */
--muted: hsl(210 40% 96.1%)        /* Subtle gray */
```

### Dark Mode
```css
--background: hsl(222 47% 11%)     /* Deep slate */
--card: hsl(217 33% 17%)           /* Elevated surface */
--primary: hsl(158 64% 52%)        /* Emerald accent */
--border: hsl(217 33% 25%)         /* Subtle borders */
```

### Chart Colors
```css
--chart-1: hsl(158 64% 52%)        /* Emerald */
--chart-2: hsl(215 25% 27%)        /* Slate */
--chart-3: hsl(346 77% 50%)        /* Rose */
--chart-4: hsl(199 89% 48%)        /* Sky */
--chart-5: hsl(262 52% 47%)        /* Purple */
```

---

## Typography System

```css
/* Headers */
h1: 2.25rem, 700 weight  /* Page titles */
h2: 1.875rem, 600 weight /* Section headers */
h3: 1.5rem, 600 weight   /* Subsections */

/* Body */
body: Default with "rlig" and "calt" features
```

---

## Component Usage Examples

### Using Shared Components in Each App

#### Caregiver App (Current)
```tsx
import { CaresolisLogo } from './components/CaresolisLogo';
import { ThemeToggle } from './components/ThemeToggle';
import { TimeSyncIndicator } from './components/TimeSyncIndicator';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';

function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Card>
            <h1>Care Dashboard</h1>
            <TimeSyncIndicator />
          </Card>
        </main>
      </div>
    </div>
  );
}
```

#### Device App (Simplified)
```tsx
import { CaresolisLogo } from './components/CaresolisLogo';
import { TimeSyncIndicator } from './components/TimeSyncIndicator';
import { Button } from './components/ui/button';

function DeviceScreen() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <CaresolisLogo className="mb-8" />
      
      {/* Large, touch-friendly button */}
      <Button 
        onClick={handleCheckIn}
        className="w-96 h-96 text-6xl font-bold rounded-full"
      >
        Check In
      </Button>
      
      <TimeSyncIndicator className="mt-8" />
    </div>
  );
}
```

#### Command Centre App (Advanced)
```tsx
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Card } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { SystemIntegrityPanel } from './components/SystemIntegrityPanel';

function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="grid grid-cols-3 gap-6">
            <Card>
              <h2>Active Patients</h2>
              <p className="text-4xl font-bold">47</p>
            </Card>
            <Card>
              <h2>System Status</h2>
              <Badge variant="success">All Systems Nominal</Badge>
            </Card>
            <Card>
              <SystemIntegrityPanel />
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
```

---

## Syncing Workflow

### When You Update a Shared Component

1. **Update in Caregiver App** (source of truth)
2. **Test thoroughly** to ensure it works
3. **Copy to Device App**
4. **Copy to Command Centre App**
5. **Test in all three apps**
6. **Document the change** in this guide

### Version Control (Manual)

Since Figma Make doesn't have Git, use this naming convention:

```
ComponentName.tsx
// Version: 1.2.0
// Last updated: 2026-03-17
// Updated by: [Your name]
// Changes: Added dark mode support
```

Add version comments at the top of each shared file:

```tsx
/**
 * CareSolis Logo Component
 * Version: 1.0.0
 * Last sync: 2026-03-17
 * Shared across: Caregiver, Device, Command Centre
 */
export function CaresolisLogo({ className }: { className?: string }) {
  // ...
}
```

---

## Tailwind CSS Configuration

All apps use **Tailwind v4** with the same configuration:

```css
/* /src/styles/theme.css */
@import "tailwindcss/theme" layer(theme);
@import "tailwindcss/preflight" layer(base);
@import "tailwindcss/utilities" layer(utilities);
```

**Do not create `tailwind.config.js`** - We use CSS-based configuration with Tailwind v4.

---

## Custom Hooks (Shared Utilities)

Copy these hooks to all apps for consistent behavior:

```
/src/app/hooks/
├── usePatient.ts      - Access current patient
├── useAuth.ts         - Authentication state
├── useTheme.ts        - Dark/light mode
└── useDataSync.ts     - Real-time sync (new!)
```

---

## Testing Checklist

When syncing components across apps, verify:

- [ ] Colors match across all three apps
- [ ] Typography is consistent
- [ ] Dark mode works in all apps
- [ ] Components import correctly
- [ ] No broken dependencies
- [ ] Backend endpoints are identical
- [ ] Time sync indicator shows same status
- [ ] Data updates reflect in all apps

---

## Common Issues & Solutions

### Issue: Component imports fail
**Solution**: Check relative paths. If component is in different folder depth, adjust:
```tsx
// Caregiver App
import { Button } from './components/ui/button';

// Device App (if in different structure)
import { Button } from '../components/ui/button';
```

### Issue: Colors don't match
**Solution**: Ensure `theme.css` is exactly the same. Copy the entire file, don't edit manually.

### Issue: Data not syncing
**Solution**: Verify all apps use the same:
- Backend URL (`SERVER_URL`)
- Patient ID format
- API endpoints
- Auth tokens

### Issue: Fonts look different
**Solution**: Copy `fonts.css` and ensure font imports are at the top of the file.

---

## Advanced: Real-Time Sync with Supabase Realtime

To enable instant updates without polling (future enhancement):

```tsx
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const supabase = createClient(projectId, publicAnonKey);

// Subscribe to patient state changes
const channel = supabase
  .channel(`patient:${patientId}`)
  .on('broadcast', { event: 'state-update' }, (payload) => {
    setStatusData(payload.state);
  })
  .subscribe();

// Cleanup
return () => supabase.removeChannel(channel);
```

Add this to `CaresolisContext.tsx` in all apps for real-time synchronization.

---

## Questions?

This is a living document. Update it as you discover new patterns or encounter issues.

**Last Updated**: March 17, 2026
**Maintained By**: CareSolis Team
