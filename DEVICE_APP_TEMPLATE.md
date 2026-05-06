# CareSolis Device App Template

## Overview
The **Device App** is the patient-facing interface that runs on the physical CareSolis device. It features:
- Large, touch-friendly UI for elderly users
- Simple check-in workflow
- Visual/audio escalation reminders
- Medication dispense confirmation
- Minimal navigation (elderly-friendly)

---

## App Structure

```
/src/app/
├── App.tsx              ← Main entry (simple routing or single page)
├── pages/
│   ├── CheckIn.tsx      ← Primary screen with large button
│   ├── StatusDisplay.tsx ← Shows current status
│   └── Settings.tsx     ← Basic device settings (hidden)
├── components/
│   ├── CheckInButton.tsx      ← Large, touch-friendly button
│   ├── StatusIndicator.tsx    ← Visual status (green/yellow/red)
│   ├── ReminderAlert.tsx      ← Audio/visual reminder
│   ├── MedicationPrompt.tsx   ← Medication dispense UI
│   └── ... (shared components from Caregiver App)
├── context/
│   └── ... (copied from Caregiver App)
└── styles/
    └── ... (copied from Caregiver App)
```

---

## Key Design Principles

### 1. Simplicity First
- One primary action per screen
- Minimal text, maximum visual feedback
- No complex navigation

### 2. Accessibility
- Large fonts (2-3x normal size)
- High contrast colors
- Touch targets ≥ 60px
- Audio feedback for all interactions

### 3. Clear Status
- Color-coded states:
  - **Green** (Emerald): On time, no action needed
  - **Yellow** (Amber): Reminder active
  - **Red** (Rose): Escalation, action required

---

## Main Screen: Check-In

```tsx
// /src/app/pages/CheckIn.tsx

import { useState } from 'react';
import { useCaresolis } from '../context/CaresolisContext';
import { Button } from '../components/ui/button';
import { CaresolisLogo } from '../components/CaresolisLogo';
import { TimeSyncIndicator } from '../components/TimeSyncIndicator';

export default function CheckIn() {
  const { statusData, interact } = useCaresolis();
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckIn = async () => {
    setIsChecking(true);
    
    // Play success sound
    const audio = new Audio('/sounds/success.mp3');
    audio.play();
    
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
        <StatusIndicator status={statusData.status} />
        
        {/* Next Scheduled */}
        <div className="text-center">
          <p className="text-3xl text-muted-foreground">Next check-in:</p>
          <p className="text-6xl font-bold">{statusData.nextScheduled}</p>
        </div>

        {/* Check-In Button */}
        <Button
          onClick={handleCheckIn}
          disabled={isChecking}
          className="w-96 h-96 rounded-full text-8xl font-bold shadow-2xl
                     bg-accent hover:bg-accent/90 text-accent-foreground
                     transition-all duration-300 hover:scale-105
                     active:scale-95"
        >
          {isChecking ? '✓' : 'CHECK IN'}
        </Button>

        {/* Help Text */}
        <p className="text-4xl text-muted-foreground text-center max-w-2xl">
          {statusData.status === 'pending'
            ? 'Press the button when you\'re ready to check in'
            : statusData.status === 'nominal'
            ? 'You\'re all set! See you next time.'
            : 'Please check in now'}
        </p>
      </div>
    </div>
  );
}
```

---

## Status Indicator Component

```tsx
// /src/app/components/StatusIndicator.tsx

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
  );
}
```

---

## Reminder Alert Component

```tsx
// /src/app/components/ReminderAlert.tsx

import { useEffect, useState } from 'react';
import { useCaresolis } from '../context/CaresolisContext';

export function ReminderAlert() {
  const { statusData } = useCaresolis();
  const [isVisible, setIsVisible] = useState(false);
  const [audioLoop, setAudioLoop] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (statusData.status === 'pending' || statusData.status === 'escalated') {
      setIsVisible(true);
      
      // Play reminder sound (looping)
      const audio = new Audio('/sounds/reminder.mp3');
      audio.loop = true;
      audio.volume = 0.5;
      audio.play();
      setAudioLoop(audio);
      
      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    } else {
      setIsVisible(false);
      audioLoop?.pause();
    }
  }, [statusData.status]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card p-16 rounded-3xl shadow-2xl text-center">
        <div className="text-9xl mb-8 animate-pulse">
          {statusData.status === 'escalated' ? '🔔' : '⏰'}
        </div>
        
        <h1 className="text-7xl font-bold mb-8">
          Time to Check In!
        </h1>
        
        <p className="text-5xl text-muted-foreground">
          Please press the CHECK IN button
        </p>
      </div>
    </div>
  );
}
```

---

## Medication Dispense UI

```tsx
// /src/app/components/MedicationPrompt.tsx

import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface MedicationPromptProps {
  medication: string;
  dosage: string;
  onConfirm: () => void;
  onSkip: () => void;
}

export function MedicationPrompt({
  medication,
  dosage,
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
          Row 1, Slot 3
        </div>
      </div>
      
      {/* IR Gate Status */}
      <div className="mb-12 flex justify-center space-x-6">
        <GateIndicator gate={1} clear={true} />
        <GateIndicator gate={2} clear={true} />
        <GateIndicator gate={3} clear={false} />
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

## App.tsx (Simple Single-Page App)

```tsx
// /src/app/App.tsx

import { CaresolisProvider } from './context/CaresolisContext';
import { PatientProvider } from './context/PatientContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './components/ThemeProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import CheckIn from './pages/CheckIn';
import { ReminderAlert } from './components/ReminderAlert';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <PatientProvider>
            <CaresolisProvider>
              {/* Main UI */}
              <CheckIn />
              
              {/* Overlays */}
              <ReminderAlert />
              <OfflineIndicator />
            </CaresolisProvider>
          </PatientProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
```

---

## Custom Styles for Device App

```css
/* /src/styles/device-overrides.css */

/* Larger touch targets for elderly users */
button {
  min-height: 60px;
  min-width: 60px;
}

/* Increased font sizes globally */
html {
  font-size: 24px; /* Base font size 1.5x normal */
}

/* High contrast mode (optional) */
.high-contrast {
  --background: hsl(0 0% 100%);
  --foreground: hsl(0 0% 0%);
  --border: hsl(0 0% 0%);
}

/* No hover states on touch devices */
@media (hover: none) {
  button:hover {
    transform: none;
  }
}

/* Prevent text selection (device should be touch-only) */
* {
  -webkit-user-select: none;
  user-select: none;
}

/* Large focus indicators for accessibility */
*:focus-visible {
  outline: 4px solid hsl(var(--accent));
  outline-offset: 4px;
}
```

---

## Audio Feedback

Create audio files for interactions:

```
/public/sounds/
├── success.mp3     ← Check-in success
├── reminder.mp3    ← Reminder notification
├── escalation.mp3  ← Escalation alert
└── error.mp3       ← System error
```

---

## Device-Specific Configuration

```tsx
// /src/app/config/device.ts

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
};
```

---

## Testing Checklist for Device App

- [ ] Check-in button is easily tappable (≥ 60px)
- [ ] Status colors are clearly distinguishable
- [ ] Audio plays correctly on all events
- [ ] Font sizes are readable from 3+ feet away
- [ ] No accidental touches (adequate spacing)
- [ ] Works offline (queues actions)
- [ ] Time sync indicator visible but non-intrusive
- [ ] Reminder alerts are noticeable but not annoying
- [ ] IR gate readings display correctly
- [ ] Medication prompts are clear and simple

---

## Deployment Notes

### Hardware Requirements
- 10" touchscreen minimum (1920x1080)
- Speaker for audio feedback
- Internet connection (WiFi or cellular)
- Triple IR gate sensors
- Blister pack dispense mechanism

### Browser Configuration
- Run in fullscreen kiosk mode
- Disable browser chrome
- Disable context menus
- Enable autoplay for audio

### Security
- Device-specific patient binding
- No exposed admin settings
- Automatic logout after 5 minutes of inactivity
- Physical device location locked

---

## Next Steps

1. Create new Figma Make project: "CareSolis Device"
2. Copy all shared files from Caregiver App
3. Create device-specific components (above)
4. Test on target hardware (tablet/touchscreen)
5. Fine-tune font sizes and touch targets
6. Add audio files
7. Test with elderly users for usability

---

**Last Updated**: March 17, 2026
