# CareSolis Device App - Complete Sync Instructions

## INSTRUCTION FOR AI: Implement This Entire Specification

I'm syncing the CareSolis Device App with the Caregiver App to ensure consistent design and functionality across our multi-app ecosystem.

---

## Background

CareSolis is a calm, infrastructure-grade interaction visibility system for aging households with:
- Calm color palette (slate, emerald, rose) with premium, non-clinical home technology aesthetic
- Shared Supabase backend for real-time data sync across all three apps (Caregiver, Device, Command Centre)
- FDA-compliant triple logging (audit, event, notification logs)
- 2x25 pharmacy-delivered patient-specific blister pack system with triple IR gate architecture
- Device must NEVER allow external autonomous dispense commands

---

## Design System to Implement

### Color Palette (Copy Exactly)

**Light Mode:**
- Primary (Slate/Infrastructure): `hsl(215 25% 27%)`
- Accent (Emerald/Wellness): `hsl(158 64% 52%)`
- Destructive (Rose/Alerts): `hsl(0 84.2% 60.2%)`
- Background: `hsl(0 0% 100%)`
- Muted: `hsl(210 40% 96.1%)`
- Card: `hsl(0 0% 100%)`
- Border: `hsl(214.3 31.8% 91.4%)`
- Input: `hsl(214.3 31.8% 91.4%)`
- Ring: `hsl(215 25% 27%)`

**Dark Mode:**
- Background: `hsl(222 47% 11%)`
- Card: `hsl(217 33% 17%)`
- Primary: `hsl(158 64% 52%)`
- Border: `hsl(217 33% 25%)`
- Muted: `hsl(217 33% 17%)`
- Accent: `hsl(158 64% 52%)`
- Destructive: `hsl(0 84.2% 60.2%)`

### Typography

- H1: 2.25rem, 700 weight
- H2: 1.875rem, 600 weight  
- H3: 1.5rem, 600 weight
- Body: Default with "rlig" and "calt" font features

---

## Device App Specific Requirements

### Design Principles

1. **Simplicity First** - One primary action per screen, minimal text, maximum visual feedback
2. **Accessibility** - Large fonts (2-3x normal), high contrast, touch targets ≥ 60px, audio feedback
3. **Clear Status** - Color-coded: Green (Emerald) = nominal, Yellow (Amber) = reminder, Red (Rose) = escalation

### Main Screen: Check-In Interface

- Full-screen centered layout
- Large circular check-in button (384px × 384px, text-8xl font)
- Status indicator showing current state (nominal/pending/escalated/system_fault)
- Next scheduled time display (text-6xl)
- CaresolisLogo in top left corner
- TimeSyncIndicator in top right corner
- Minimal navigation (elderly-friendly)

---

## Core Components to Create

### 1. CheckInButton Component

Large touch-friendly circular button with:
- Size: `w-96 h-96 rounded-full`
- Font: `text-8xl font-bold`
- Colors: `bg-accent hover:bg-accent/90 text-accent-foreground`
- Animation: `hover:scale-105 active:scale-95`
- Success state showing checkmark (✓)
- Disabled state while processing

**Location:** `/src/app/components/CheckInButton.tsx`

```tsx
import { Button } from './ui/button';

interface CheckInButtonProps {
  onClick: () => void;
  isChecking: boolean;
}

export function CheckInButton({ onClick, isChecking }: CheckInButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isChecking}
      className="w-96 h-96 rounded-full text-8xl font-bold shadow-2xl
                 bg-accent hover:bg-accent/90 text-accent-foreground
                 transition-all duration-300 hover:scale-105
                 active:scale-95"
    >
      {isChecking ? '✓' : 'CHECK IN'}
    </Button>
  );
}
```

### 2. StatusIndicator Component

Visual status display with:
- Large circular indicator (w-48 h-48)
- Icon-based status (✓ for nominal, ⏰ for pending, ! for escalated)
- Pulse animation for escalated state
- Color matches status (emerald/yellow/rose)

**Location:** `/src/app/components/StatusIndicator.tsx`

```tsx
interface StatusIndicatorProps {
  status: 'nominal' | 'pending' | 'escalated' | 'system_fault';
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const config = {
    nominal: {
      color: 'bg-accent',
      icon: '✓',
      text: 'All Good',
    },
    pending: {
      color: 'bg-yellow-500',
      icon: '⏰',
      text: 'Reminder',
    },
    escalated: {
      color: 'bg-destructive',
      icon: '!',
      text: 'Action Needed',
      pulse: true,
    },
    system_fault: {
      color: 'bg-gray-500',
      icon: '?',
      text: 'System Check',
    },
  };

  const { color, icon, text, pulse } = config[status];

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className={`
        ${color} 
        w-48 h-48 rounded-full 
        flex items-center justify-center
        text-white text-9xl font-bold
        ${pulse ? 'animate-pulse' : ''}
        shadow-2xl
      `}>
        {icon}
      </div>
      <p className="text-4xl font-semibold text-foreground">{text}</p>
    </div>
  );
}
```

### 3. ReminderAlert Component

Full-screen overlay for reminders with:
- Semi-transparent black background (bg-black/50)
- Large card with rounded corners (rounded-3xl)
- Animated icon (text-9xl with animate-pulse)
- Clear call-to-action text (text-7xl heading, text-5xl body)
- Audio feedback integration

**Location:** `/src/app/components/ReminderAlert.tsx`

```tsx
import { useEffect, useState } from 'react';
import { Card } from './ui/card';

interface ReminderAlertProps {
  status: 'nominal' | 'pending' | 'escalated' | 'system_fault';
}

export function ReminderAlert({ status }: ReminderAlertProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [audioLoop, setAudioLoop] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (status === 'pending' || status === 'escalated') {
      setIsVisible(true);
      
      // Play reminder sound (looping)
      const audio = new Audio('/sounds/reminder.mp3');
      audio.loop = true;
      audio.volume = status === 'escalated' ? 0.8 : 0.5;
      audio.play().catch(err => console.log('Audio play failed:', err));
      setAudioLoop(audio);
      
      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    } else {
      setIsVisible(false);
      if (audioLoop) {
        audioLoop.pause();
      }
    }
  }, [status]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="bg-card p-16 rounded-3xl shadow-2xl text-center max-w-4xl">
        <div className="text-9xl mb-8 animate-pulse">
          {status === 'escalated' ? '🔔' : '⏰'}
        </div>
        
        <h1 className="text-7xl font-bold mb-8">
          Time to Check In!
        </h1>
        
        <p className="text-5xl text-muted-foreground">
          Please press the CHECK IN button
        </p>
      </Card>
    </div>
  );
}
```

### 4. MedicationPrompt Component

Medication dispense interface showing:
- Large medication icon (text-9xl 💊)
- Medication name (text-6xl font-bold)
- Dosage information (text-5xl)
- Blister pack location (text-8xl: "Row 1, Slot 3")
- Triple IR gate status indicators
- Large action buttons (text-5xl with px-16 py-8)

**Location:** `/src/app/components/MedicationPrompt.tsx`

```tsx
import { Button } from './ui/button';
import { Card } from './ui/card';

interface MedicationPromptProps {
  medication: string;
  dosage: string;
  row: number;
  slot: number;
  gates: [boolean, boolean, boolean]; // true = clear, false = blocked
  onConfirm: () => void;
  onSkip: () => void;
}

export function MedicationPrompt({
  medication,
  dosage,
  row,
  slot,
  gates,
  onConfirm,
  onSkip,
}: MedicationPromptProps) {
  return (
    <Card className="p-12 text-center max-w-4xl mx-auto">
      {/* Medication Icon */}
      <div className="text-9xl mb-8">💊</div>
      
      {/* Medication Info */}
      <h2 className="text-6xl font-bold mb-4">{medication}</h2>
      <p className="text-5xl text-muted-foreground mb-12">{dosage}</p>
      
      {/* Blister Pack Indicator */}
      <div className="mb-12">
        <p className="text-4xl text-muted-foreground mb-4">
          Dispensing from blister pack:
        </p>
        <div className="text-8xl font-bold text-primary">
          Row {row}, Slot {slot}
        </div>
      </div>
      
      {/* IR Gate Status */}
      <div className="mb-12 flex justify-center space-x-6">
        <GateIndicator gate={1} clear={gates[0]} />
        <GateIndicator gate={2} clear={gates[1]} />
        <GateIndicator gate={3} clear={gates[2]} />
      </div>
      
      {/* Actions */}
      <div className="flex space-x-8 justify-center">
        <Button
          onClick={onSkip}
          variant="outline"
          className="text-5xl px-16 py-8 h-auto"
        >
          Skip
        </Button>
        
        <Button
          onClick={onConfirm}
          className="text-5xl px-16 py-8 h-auto bg-accent hover:bg-accent/90"
        >
          ✓ Taken
        </Button>
      </div>
    </Card>
  );
}

function GateIndicator({ gate, clear }: { gate: number; clear: boolean }) {
  return (
    <div className="text-center">
      <div className={`
        w-32 h-32 rounded-full flex items-center justify-center text-6xl
        ${clear ? 'bg-accent text-accent-foreground' : 'bg-destructive text-destructive-foreground'}
      `}>
        {clear ? '✓' : '✕'}
      </div>
      <p className="text-3xl mt-4 text-muted-foreground">Gate {gate}</p>
    </div>
  );
}
```

---

## Shared Components from Caregiver App

### Must Copy These Exactly

**Core Branding:**
- `/src/app/components/CaresolisLogo.tsx`
- `/src/app/components/ThemeProvider.tsx`
- `/src/app/components/ThemeToggle.tsx` (optional for device)

**System Monitoring:**
- `/src/app/components/TimeSyncIndicator.tsx`
- `/src/app/components/OfflineIndicator.tsx`
- `/src/app/components/ErrorBoundary.tsx`

**UI Primitives (entire folder):**
- `/src/app/components/ui/*` (all files)

**Context Providers:**
- `/src/app/context/CaresolisContext.tsx` (CRITICAL)
- `/src/app/context/PatientContext.tsx`
- `/src/app/context/AuthContext.tsx`

**Utilities:**
- `/src/app/utils/dataSync.ts`
- `/src/app/utils/timeSync.ts`

**Styles (copy entire folder):**
- `/src/styles/theme.css`
- `/src/styles/globals.css`
- `/src/styles/tailwind.css`
- `/src/styles/fonts.css`
- `/src/styles/index.css`

**Supabase Config:**
- `/utils/supabase/info.tsx`

---

## Main Pages

### CheckIn Page (Primary Screen)

**Location:** `/src/app/pages/CheckIn.tsx`

```tsx
import { useState } from 'react';
import { useCaresolis } from '../context/CaresolisContext';
import { CaresolisLogo } from '../components/CaresolisLogo';
import { TimeSyncIndicator } from '../components/TimeSyncIndicator';
import { StatusIndicator } from '../components/StatusIndicator';
import { CheckInButton } from '../components/CheckInButton';

export default function CheckIn() {
  const { statusData, interact } = useCaresolis();
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckIn = async () => {
    setIsChecking(true);
    
    // Play success sound
    const audio = new Audio('/sounds/success.mp3');
    audio.play().catch(err => console.log('Audio play failed:', err));
    
    await interact();
    
    // Show success animation
    setTimeout(() => setIsChecking(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-12">
      {/* Header */}
      <div className="absolute top-8 left-8">
        <CaresolisLogo className="h-16" />
      </div>
      
      <div className="absolute top-8 right-8">
        <TimeSyncIndicator />
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center space-y-12">
        {/* Status */}
        <StatusIndicator status={statusData?.status || 'nominal'} />
        
        {/* Next Scheduled */}
        <div className="text-center">
          <p className="text-3xl text-muted-foreground">Next check-in:</p>
          <p className="text-6xl font-bold">
            {statusData?.nextScheduled 
              ? new Date(statusData.nextScheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '--:--'
            }
          </p>
        </div>

        {/* Check-In Button */}
        <CheckInButton onClick={handleCheckIn} isChecking={isChecking} />

        {/* Help Text */}
        <p className="text-4xl text-muted-foreground text-center max-w-2xl">
          {statusData?.status === 'pending'
            ? 'Press the button when you\'re ready to check in'
            : statusData?.status === 'nominal'
            ? 'You\'re all set! See you next time.'
            : 'Please check in now'}
        </p>
      </div>
    </div>
  );
}
```

---

## App Structure

### Main Entry Point

**Location:** `/src/app/App.tsx`

```tsx
import { CaresolisProvider } from './context/CaresolisContext';
import { PatientProvider } from './context/PatientContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './components/ThemeProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import CheckIn from './pages/CheckIn';
import { ReminderAlert } from './components/ReminderAlert';
import { OfflineIndicator } from './components/OfflineIndicator';
import { useCaresolis } from './context/CaresolisContext';

function DeviceApp() {
  const { statusData } = useCaresolis();
  
  return (
    <>
      <CheckIn />
      <ReminderAlert status={statusData?.status || 'nominal'} />
      <OfflineIndicator />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <PatientProvider>
            <CaresolisProvider>
              <DeviceApp />
            </CaresolisProvider>
          </PatientProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
```

---

## Device-Specific Styling

### Additional CSS Overrides

**Location:** `/src/styles/device-overrides.css`

```css
/* Device App Specific Overrides for Elderly Users */

/* Larger base font for elderly users */
html {
  font-size: 24px; /* 1.5x normal */
}

/* All buttons minimum touch target */
button {
  min-height: 60px;
  min-width: 60px;
}

/* Prevent text selection on touch device */
* {
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}

/* Large focus indicators for accessibility */
*:focus-visible {
  outline: 4px solid hsl(var(--accent));
  outline-offset: 4px;
}

/* No hover effects on touch devices */
@media (hover: none) {
  button:hover {
    transform: none;
  }
}

/* High contrast mode (optional) */
.high-contrast {
  --background: hsl(0 0% 100%);
  --foreground: hsl(0 0% 0%);
  --border: hsl(0 0% 0%);
}
```

Import this in `/src/styles/index.css`:
```css
@import './device-overrides.css';
```

---

## Backend Integration

### Supabase Connection

**Same backend as Caregiver app:**
- Server URL: `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`
- Authorization: `Bearer ${publicAnonKey}`
- Patient-scoped keys for all data access

### Key Endpoints for Device App

1. **GET /status?patientId={id}** - Get current device state
2. **POST /interact** - Log patient check-in
   ```json
   {
     "patientId": "uuid",
     "clientTimestamp": "ISO8601"
   }
   ```
3. **GET /time-sync** - Sync device clock

### Polling Strategy

Poll backend every 5 seconds for status updates:
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    refresh(); // Fetch latest data
  }, 5000);
  
  return () => clearInterval(interval);
}, []);
```

---

## Configuration

### Device Configuration File

**Location:** `/src/app/config/device.ts`

```typescript
export const DEVICE_CONFIG = {
  // UI
  fontSize: {
    base: '24px',      // 1.5x normal
    button: '80px',    // Very large
    status: '64px',
  },
  
  // Touch targets
  minTouchSize: '60px',
  
  // Audio
  reminderVolume: 0.5,
  escalationVolume: 0.8,
  
  // Timing
  successAnimationDuration: 2000, // ms
  errorTimeout: 5000,
  
  // Screen timeout
  screenTimeout: 120000, // 2 minutes of inactivity
  
  // Blister pack
  blisterPackLayout: {
    rows: 2,
    columns: 25,
  },
  
  // Polling
  statusPollInterval: 5000, // 5 seconds
};
```

---

## Audio Feedback System

### Audio Files Needed

Create placeholder audio files in `/public/sounds/`:
- `success.mp3` - Check-in success
- `reminder.mp3` - Reminder notification
- `escalation.mp3` - Escalation alert
- `error.mp3` - System error

### Audio Implementation

```typescript
// Success sound (play once)
const playSuccess = () => {
  const audio = new Audio('/sounds/success.mp3');
  audio.volume = 1.0;
  audio.play().catch(err => console.log('Audio failed:', err));
};

// Reminder sound (looping)
const playReminder = () => {
  const audio = new Audio('/sounds/reminder.mp3');
  audio.loop = true;
  audio.volume = 0.5;
  audio.play().catch(err => console.log('Audio failed:', err));
  return audio;
};

// Escalation sound (looping, louder)
const playEscalation = () => {
  const audio = new Audio('/sounds/escalation.mp3');
  audio.loop = true;
  audio.volume = 0.8;
  audio.play().catch(err => console.log('Audio failed:', err));
  return audio;
};
```

---

## Testing Checklist

After implementation verify:

### Functionality
- [ ] Check-in button works and logs to backend
- [ ] Status indicator shows correct state
- [ ] Reminder alerts appear at correct times
- [ ] Audio plays correctly on all events
- [ ] Time sync indicator is visible
- [ ] Works offline (queues actions)
- [ ] Data syncs with Caregiver app

### Accessibility
- [ ] Check-in button is easily tappable (≥ 60px)
- [ ] Status colors are clearly distinguishable
- [ ] Font sizes readable from 3+ feet away
- [ ] No accidental touches (adequate spacing)
- [ ] Focus indicators are large and visible
- [ ] All interactive elements meet minimum size

### Visual Consistency
- [ ] Colors match Caregiver app exactly
- [ ] Typography matches Caregiver app
- [ ] Dark mode looks identical to Caregiver app
- [ ] Spacing and padding are consistent
- [ ] Border radius matches design system

---

## CRITICAL Implementation Notes

1. **Use Tailwind v4** - Don't create `tailwind.config.js`, use CSS-based config in `theme.css`
2. **No react-router-dom** - Use 'react-router' package instead (react-router-dom doesn't work in this environment)
3. **Simple routing** - Device app can be single-page or minimal routing (CheckIn as main screen)
4. **FDA compliance** - All timestamps, all actions logged, time sync always visible
5. **Never modify protected files** - Don't create/modify `/src/app/components/figma/ImageWithFallback.tsx`
6. **Image handling** - Use ImageWithFallback component for any new images, not `<img>` tag
7. **Patient binding** - Device bound to single patient, no patient switching UI

---

## Patient-Specific Device Binding

Device should be bound to a single patient:
- Patient ID stored in device config or context
- All API calls include this patient ID
- No patient switching UI (locked to one household)
- Device location locked (no portability)

---

## Final Appearance Goal

When complete, the Device app should:
- Look visually cohesive with Caregiver app (same colors, fonts, spacing)
- Feel simpler and more accessible (larger everything, less navigation)
- Sync data in real-time with Caregiver app
- Provide clear, calm, non-clinical interface for elderly users
- Work reliably offline with queued actions

---

## Implementation Order

1. **Copy design system files** (`/src/styles/*`)
2. **Copy shared components** (Logo, ThemeProvider, ErrorBoundary, UI components)
3. **Copy context providers** (CaresolisContext, PatientContext, AuthContext)
4. **Copy utilities** (dataSync, timeSync)
5. **Create device-specific components** (CheckInButton, StatusIndicator, ReminderAlert, MedicationPrompt)
6. **Create CheckIn page** (main screen)
7. **Set up App.tsx** (with all providers)
8. **Add device-specific CSS overrides**
9. **Test and verify** (sync with Caregiver app)

---

**Last Updated:** March 17, 2026  
**Source of Truth:** Caregiver App (CareSolis main project)  
**Backend:** Shared Supabase instance across all three apps
