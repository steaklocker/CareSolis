/**
 * ========================================================================
 * CARESOLIS DEVICE APP - COMPLETE SYNC INSTRUCTIONS
 * ========================================================================
 * 
 * PASTE EVERYTHING BELOW THIS LINE INTO YOUR DEVICE APP'S CHAT
 * 
 * ========================================================================
 */

export const DEVICE_APP_SYNC_INSTRUCTIONS = `

Read all the documentation files in this project: DEVICE_APP_TEMPLATE.md, SYNC_ARCHITECTURE.md, SYNC_VISUAL_GUIDE.md, and SHARED_COMPONENTS_GUIDE.md

Then implement a complete CareSolis Device App with these requirements:

## DESIGN SYSTEM - COPY EXACTLY FROM CAREGIVER APP

### 1. Copy Entire Styles Folder
Copy /src/styles/ with ALL files:
- theme.css (complete design system with exact HSL color values)
- globals.css
- tailwind.css
- fonts.css
- index.css

### 2. Color Palette (must match exactly):
Light Mode:
- Primary (Slate): hsl(215 25% 27%)
- Accent (Emerald): hsl(158 64% 52%)
- Destructive (Rose): hsl(0 84.2% 60.2%)
- Background: hsl(0 0% 100%)
- Muted: hsl(210 40% 96.1%)

Dark Mode:
- Background: hsl(222 47% 11%)
- Card: hsl(217 33% 17%)
- Primary: hsl(158 64% 52%)
- Border: hsl(217 33% 25%)

## SHARED COMPONENTS - COPY FROM CAREGIVER APP

### 3. Copy These Exact Components:
- /src/app/components/CaresolisLogo.tsx
- /src/app/components/ThemeProvider.tsx
- /src/app/components/TimeSyncIndicator.tsx
- /src/app/components/OfflineIndicator.tsx
- /src/app/components/ErrorBoundary.tsx
- /src/app/components/ui/ (ENTIRE FOLDER - all UI primitives like button, card, badge, etc.)

### 4. Copy Context Providers:
- /src/app/context/CaresolisContext.tsx (CRITICAL - handles all backend sync)
- /src/app/context/PatientContext.tsx
- /src/app/context/AuthContext.tsx
- /src/app/context/AppLoadingContext.tsx

### 5. Copy Utilities:
- /src/app/utils/dataSync.ts
- /src/app/utils/timeSync.ts

### 6. Copy Supabase Config:
- /utils/supabase/info.tsx (projectId and publicAnonKey)

## DEVICE-SPECIFIC COMPONENTS - CREATE NEW

### 7. Create CheckInButton Component (/src/app/components/CheckInButton.tsx):
Large touch-friendly button:
- Size: w-96 h-96 (384px × 384px)
- Shape: rounded-full
- Font: text-8xl font-bold
- Colors: bg-accent hover:bg-accent/90 text-accent-foreground
- Animation: hover:scale-105 active:scale-95
- Shows "CHECK IN" normally, "✓" when checking in
- Disabled state while processing

### 8. Create StatusIndicator Component (/src/app/components/StatusIndicator.tsx):
Visual status display:
- Circular: w-48 h-48 rounded-full
- Icons: ✓ (nominal/green), ⏰ (pending/yellow), ! (escalated/red), ? (system_fault/gray)
- Pulse animation when escalated
- Large text below showing status name

### 9. Create ReminderAlert Component (/src/app/components/ReminderAlert.tsx):
Full-screen overlay:
- Background: fixed inset-0 bg-black/50 z-50
- Card: bg-card p-16 rounded-3xl shadow-2xl
- Icon: text-9xl animate-pulse (🔔 for escalated, ⏰ for pending)
- Heading: text-7xl font-bold "Time to Check In!"
- Body: text-5xl "Please press the CHECK IN button"
- Audio: Loop reminder sound at 50% volume (80% for escalated)

### 10. Create MedicationPrompt Component (/src/app/components/MedicationPrompt.tsx):
Medication dispense UI:
- Icon: text-9xl 💊
- Medication name: text-6xl font-bold
- Dosage: text-5xl text-muted-foreground
- Blister pack location: text-8xl "Row X, Slot Y"
- Three IR gate indicators (circular w-32 h-32, green ✓ or red ✕)
- Two large buttons: Skip (outline) and ✓ Taken (accent)
- Button size: text-5xl px-16 py-8

## MAIN PAGE

### 11. Create CheckIn Page (/src/app/pages/CheckIn.tsx):
Full-screen centered layout:
- CaresolisLogo in top-left (absolute top-8 left-8)
- TimeSyncIndicator in top-right (absolute top-8 right-8)
- Center content (flex flex-col items-center space-y-12):
  * StatusIndicator component
  * Next scheduled time display (text-6xl font-bold)
  * CheckInButton component
  * Help text (text-4xl text-muted-foreground)
- Handles check-in with audio success sound
- Uses useCaresolis hook for data and interact function

## APP STRUCTURE

### 12. Set Up App.tsx:
Wrap everything in providers (order matters):
ErrorBoundary > ThemeProvider > AuthProvider > PatientProvider > CaresolisProvider > CheckIn + ReminderAlert + OfflineIndicator

Use CaresolisContext to get status and pass to ReminderAlert

## DEVICE-SPECIFIC STYLING

### 13. Create /src/styles/device-overrides.css:
Add these rules:
- html { font-size: 24px; } /* 1.5x normal for elderly users */
- button { min-height: 60px; min-width: 60px; } /* Touch targets */
- * { user-select: none; } /* No text selection */
- *:focus-visible { outline: 4px solid hsl(var(--accent)); outline-offset: 4px; } /* Large focus */
- @media (hover: none) { button:hover { transform: none; } } /* No hover on touch */

Import this in /src/styles/index.css

## BACKEND INTEGRATION

### 14. Use Same Supabase Backend:
- Server URL: https://\${projectId}.supabase.co/functions/v1/make-server-9aeac050
- Authorization: Bearer \${publicAnonKey}
- Poll /status every 5 seconds (in CaresolisContext)
- POST /interact for check-ins
- Patient-scoped data (all keys include patientId)

## CONFIGURATION

### 15. Create /src/app/config/device.ts:
Export DEVICE_CONFIG with:
- fontSize: { base: '24px', button: '80px', status: '64px' }
- minTouchSize: '60px'
- reminderVolume: 0.5
- escalationVolume: 0.8
- successAnimationDuration: 2000
- screenTimeout: 120000
- blisterPackLayout: { rows: 2, columns: 25 }
- statusPollInterval: 5000

## AUDIO SYSTEM

### 16. Audio Feedback:
Create placeholders or use browser audio:
- Success: new Audio('/sounds/success.mp3').play()
- Reminder: loop at 50% volume
- Escalation: loop at 80% volume
- Handle errors: .catch(err => console.log('Audio failed:', err))

## CRITICAL REQUIREMENTS

17. Use Tailwind v4 (CSS-based, NO tailwind.config.js)
18. Use 'react-router' NOT 'react-router-dom'
19. Device app is single-page (CheckIn is main/only screen)
20. All actions logged to backend with FDA audit trail
21. Time sync always visible
22. Works offline with queued actions (dataSync utility)
23. Patient-specific binding (no patient switching)
24. Never modify /src/app/components/figma/ImageWithFallback.tsx

## TESTING CHECKLIST

After implementation verify:
- Colors match Caregiver app exactly (compare side-by-side)
- Typography matches (same fonts, sizes, weights)
- Dark mode identical to Caregiver app
- Check-in button is 384px × 384px and easily tappable
- Status colors clearly visible from distance
- Font sizes readable from 3+ feet away
- Time sync indicator shows in top-right
- Data syncs with Caregiver app (check in device, see in caregiver within 5 seconds)
- Works offline (disconnect network, queue actions, reconnect, verify sync)
- Audio plays on all events

## IMPLEMENTATION ORDER

1. Copy /src/styles/* (entire folder)
2. Copy shared components (Logo, Theme, ErrorBoundary, UI folder)
3. Copy contexts (Caresolis, Patient, Auth)
4. Copy utilities (dataSync, timeSync)
5. Create device components (CheckInButton, StatusIndicator, ReminderAlert, MedicationPrompt)
6. Create CheckIn page
7. Set up App.tsx with all providers
8. Add device-specific CSS overrides
9. Create device config
10. Test sync with Caregiver app

## FINAL RESULT

The Device app should:
- Look identical to Caregiver app in colors, fonts, spacing
- Feel much simpler (one main action: CHECK IN)
- Have larger everything (2-3x size for elderly users)
- Sync data in real-time with Caregiver app
- Work offline with queued actions
- Provide calm, clear, non-clinical interface

The app is patient-facing, designed for a 10" tablet touchscreen in an elderly person's home, connected to a medication dispenser with blister packs and IR sensors.

END OF INSTRUCTIONS - Implement everything above following the DEVICE_APP_TEMPLATE.md guide.

`;
