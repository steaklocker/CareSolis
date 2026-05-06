# CareSolis Sync Architecture - Visual Guide

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CARESOLIS ECOSYSTEM                          │
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐        │
│  │  Caregiver   │    │    Device    │    │   Command    │        │
│  │     App      │    │     App      │    │   Centre     │        │
│  │              │    │              │    │              │        │
│  │ Family View  │    │ Patient View │    │  Admin View  │        │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘        │
│         │                   │                   │                 │
│         └───────────────────┴───────────────────┘                 │
│                             │                                     │
│                             ▼                                     │
│                  ┌────────────────────┐                          │
│                  │  Supabase Backend  │                          │
│                  │                    │                          │
│                  │  - Edge Functions  │                          │
│                  │  - KV Store (DB)   │                          │
│                  │  - Auth            │                          │
│                  │  - Real-time Sync  │                          │
│                  └────────────────────┘                          │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA SYNCHRONIZATION                        │
└─────────────────────────────────────────────────────────────────────┘

1. PATIENT CHECK-IN (Device App)
   ┌────────────┐
   │ Device App │──── POST /interact ────┐
   └────────────┘                        │
                                         ▼
                              ┌────────────────────┐
                              │  Backend Updates:  │
                              │  - Device State    │
                              │  - Event Log       │
                              │  - Audit Log       │
                              └─────────┬──────────┘
                                        │
                                        ▼
                     ┌──────────────────┴──────────────────┐
                     │                                     │
                     ▼                                     ▼
          ┌──────────────────┐                ┌─────────────────┐
          │  Caregiver App   │                │ Command Centre  │
          │  (polls/updates) │                │ (polls/updates) │
          └──────────────────┘                └─────────────────┘

2. CAREGIVER ACKNOWLEDGES (Caregiver App)
   ┌──────────────┐
   │Caregiver App │──── POST /acknowledge ────┐
   └──────────────┘                           │
                                              ▼
                                   ┌────────────────────┐
                                   │  Backend Updates:  │
                                   │  - Escalation      │
                                   │  - Notification    │
                                   │  - Audit Log       │
                                   └─────────┬──────────┘
                                             │
                                             ▼
                          ┌──────────────────┴──────────────────┐
                          │                                     │
                          ▼                                     ▼
               ┌──────────────┐                    ┌─────────────────┐
               │  Device App  │                    │ Command Centre  │
               │ (polls/shows │                    │ (polls/updates  │
               │  all clear)  │                    │   dashboard)    │
               └──────────────┘                    └─────────────────┘

3. ADMIN CONFIGURATION (Command Centre)
   ┌─────────────┐
   │  Command    │──── POST /settings ────┐
   │  Centre     │                        │
   └─────────────┘                        ▼
                              ┌────────────────────┐
                              │  Backend Updates:  │
                              │  - System Config   │
                              │  - Schedule        │
                              │  - Audit Log       │
                              └─────────┬──────────┘
                                        │
                                        ▼
                     ┌──────────────────┴──────────────────┐
                     │                                     │
                     ▼                                     ▼
          ┌──────────────────┐                ┌──────────────┐
          │  Caregiver App   │                │  Device App  │
          │  (sees new sched)│                │ (new times)  │
          └──────────────────┘                └──────────────┘
```

---

## Component Sharing Model

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SHARED COMPONENTS LIBRARY                        │
└─────────────────────────────────────────────────────────────────────┘

                        SOURCE OF TRUTH
                       ┌──────────────┐
                       │ Caregiver App│
                       └───────┬──────┘
                               │
                 ┌─────────────┼─────────────┐
                 │                           │
                 ▼                           ▼
         ┌──────────────┐            ┌─────────────┐
         │  Device App  │            │   Command   │
         │              │            │   Centre    │
         └──────────────┘            └─────────────┘

SHARED FILES (Copy from Caregiver → Others):

├── /src/styles/
│   ├── theme.css          ✓ Copy to all
│   ├── globals.css        ✓ Copy to all
│   └── fonts.css          ✓ Copy to all
│
├── /src/app/types/
│   └── shared.ts          ✓ Copy to all
│
├── /src/app/context/
│   ├── CaresolisContext.tsx   ✓ Copy to all
│   ├── PatientContext.tsx     ✓ Copy to all
│   └── AuthContext.tsx        ✓ Copy to all
│
├── /src/app/components/
│   ├── CaresolisLogo.tsx      ✓ Copy to all
│   ├── ThemeToggle.tsx        ✓ Copy to all
│   ├── TimeSyncIndicator.tsx  ✓ Copy to all
│   └── ui/                    ✓ Copy entire folder
│
└── /src/app/utils/
    ├── dataSync.ts        ✓ Copy to all
    ├── timeSync.ts        ✓ Copy to all
    └── locationSync.ts    ✓ Copy to all

APP-SPECIFIC FILES (Customize per app):

Caregiver App:
├── Header.tsx (patient selector, navigation)
├── Sidebar.tsx (full menu)
├── Dashboard.tsx (activity ring, stability)
└── CareCircle.tsx (contact management)

Device App:
├── Header.tsx (minimal, just logo)
├── CheckInButton.tsx (large touch UI)
├── StatusDisplay.tsx (simple visual)
└── MedicationPrompt.tsx (dispense UI)

Command Centre:
├── Header.tsx (multi-patient, admin tools)
├── Sidebar.tsx (extended admin menu)
├── PatientList.tsx (bulk management)
└── Analytics.tsx (advanced reports)
```

---

## Design System Inheritance

```
┌─────────────────────────────────────────────────────────────────────┐
│                      DESIGN TOKEN FLOW                              │
└─────────────────────────────────────────────────────────────────────┘

                    /src/styles/theme.css
                            │
                            │ Defines base tokens:
                            │ - Colors (HSL values)
                            │ - Spacing
                            │ - Typography
                            │ - Border radius
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
   Caregiver App      Device App      Command Centre
         │                  │                  │
         │                  │                  │
         ▼                  ▼                  ▼
   All components use same tokens via Tailwind classes:

   bg-primary           →  hsl(215 25% 27%)    [Slate]
   bg-accent            →  hsl(158 64% 52%)    [Emerald]
   bg-destructive       →  hsl(0 84.2% 60.2%)  [Rose]
   text-foreground      →  hsl(222.2 84% 4.9%) [Dark text]
   border-border        →  hsl(214.3 31.8% 91.4%) [Borders]

   Result: Identical visual appearance across all apps
```

---

## Real-Time Sync Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CURRENT: POLLING STRATEGY                        │
└─────────────────────────────────────────────────────────────────────┘

Every 5 seconds:

Caregiver App  ─┐
                │
Device App     ─┤──── GET /status?patientId=xxx ────► Backend
                │                                          │
Command Centre ─┘                                          │
                                                           │
                ◄──────────── Device State ────────────────┘
                
Benefits:
✓ Simple to implement
✓ Works offline (queues requests)
✓ Predictable load

Drawbacks:
✗ 5-second delay for updates
✗ More server requests


┌─────────────────────────────────────────────────────────────────────┐
│               FUTURE: SUPABASE REALTIME (RECOMMENDED)               │
└─────────────────────────────────────────────────────────────────────┘

                      Supabase Realtime
                    (WebSocket Connection)
                            │
                            │ Broadcasts events:
                            │ - state-update
                            │ - escalation
                            │ - medication-dispensed
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
   Caregiver App      Device App      Command Centre
         │                  │                  │
         │ Any app makes   │                  │
         │ a change         │                  │
         │                  │                  │
         └─► Broadcasts ────┴──────────────────┘
                            │
                            ▼
            All apps receive update < 100ms

Benefits:
✓ Instant updates (< 100ms)
✓ Lower server load
✓ Better UX

Implementation:
const channel = supabase
  .channel(`patient:${patientId}`)
  .on('broadcast', { event: 'state-update' }, (payload) => {
    setStatusData(payload.state);
  })
  .subscribe();
```

---

## FDA Compliance Logging

```
┌─────────────────────────────────────────────────────────────────────┐
│                  TRIPLE LOGGING ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────────────┘

Every action generates 3 logs:

┌──────────────────────────────────────────────────────────────────┐
│ User Action (e.g., Patient Check-In)                            │
└──────────────────┬───────────────────────────────────────────────┘
                   │
     ┌─────────────┼─────────────┐
     │             │             │
     ▼             ▼             ▼
┌─────────┐  ┌──────────┐  ┌──────────┐
│ AUDIT   │  │  EVENT   │  │NOTIFICA- │
│  LOG    │  │   LOG    │  │ TION LOG │
└─────────┘  └──────────┘  └──────────┘
     │             │             │
     │             │             │
     ▼             ▼             ▼

1. AUDIT LOG (FDA Primary Record)
   Key: mds:patient:{id}:audit:{timestamp}_{uuid}
   {
     timestamp: ISO8601 (client or server),
     actor: "patient" | "caregiver" | "system",
     action: "interact" | "acknowledge" | "config_update",
     details: "Patient checked in at scheduled time",
     patientId: "uuid"
   }

2. EVENT LOG (Interaction Timeline)
   Key: mds:patient:{id}:events:{date}_{scheduledTime}
   {
     status: "Check-In On Time",
     interactionTime: ISO8601,
     escalationLevel: 0,
     logs: [
       { timestamp, level: 0, action: "Reminder sent" },
       { timestamp, level: 0, action: "Patient checked in" }
     ]
   }

3. NOTIFICATION LOG (Care Circle Communications)
   Key: mds:patient:{id}:notifications:{timestamp}_{uuid}
   {
     to: "+1234567890",
     subject: "Check-In Reminder",
     body: "Margaret is due for check-in",
     sent: true,
     contactId: "uuid"
   }

All three logs are:
✓ Immutable (append-only)
✓ Patient-scoped (no cross-contamination)
✓ Timestamped (client + server)
✓ Auditable (who, what, when, why)
```

---

## Multi-Patient Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                   PATIENT DATA ISOLATION                            │
└─────────────────────────────────────────────────────────────────────┘

Backend Key Structure (Patient-Scoped):

mds:patient:{patientId}:device:state:v1
mds:patient:{patientId}:device:config:v2
mds:patient:{patientId}:audit:*
mds:patient:{patientId}:directory:*
mds:patient:{patientId}:notifications:*
mds:patient:{patientId}:events:*

Example for two patients:

Patient A (Margaret Chen, id=abc123):
  mds:patient:abc123:device:state:v1
  mds:patient:abc123:audit:2026-03-17T14:30:00Z_uuid1
  mds:patient:abc123:events:2026-03-17_09:00

Patient B (Robert Kim, id=def456):
  mds:patient:def456:device:state:v1
  mds:patient:def456:audit:2026-03-17T14:30:00Z_uuid2
  mds:patient:def456:events:2026-03-17_09:00

┌────────────────────────────────────────────────────────────┐
│ Complete Isolation: No data leakage between patients      │
│ FDA Requirement: Patient data must be segregated          │
└────────────────────────────────────────────────────────────┘

App Behavior:

┌──────────────┐  Select Patient  ┌──────────────┐
│Caregiver App │─────────────────►│ Patient ABC  │
└──────────────┘                  └──────┬───────┘
                                         │
                  All API calls include: │
                  ?patientId=abc123      │
                                         ▼
                              ┌────────────────────┐
                              │ Backend filters to │
                              │ mds:patient:abc123:*│
                              └────────────────────┘
```

---

## Offline Sync Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│                      OFFLINE QUEUE SYSTEM                           │
└─────────────────────────────────────────────────────────────────────┘

User is ONLINE:
  Action → Backend → Success → Update UI
           (instant)

User goes OFFLINE:
  Action → Queue → LocalStorage
           ↓
           Display "Queued" indicator
           
User comes ONLINE:
  Queue → Process actions → Backend → Success → Clear queue
          (in order)

┌────────────────────────────────────────────────────────────┐
│ Offline Queue (localStorage)                              │
├────────────────────────────────────────────────────────────┤
│ [                                                          │
│   {                                                        │
│     id: "uuid1",                                          │
│     endpoint: "/interact",                                │
│     method: "POST",                                       │
│     body: { patientId: "abc", timestamp: "..." },        │
│     timestamp: "2026-03-17T14:30:00Z",                   │
│     retries: 0                                            │
│   },                                                       │
│   {                                                        │
│     id: "uuid2",                                          │
│     endpoint: "/settings",                                │
│     method: "POST",                                       │
│     body: { ... },                                        │
│     timestamp: "2026-03-17T14:31:00Z",                   │
│     retries: 1                                            │
│   }                                                        │
│ ]                                                          │
└────────────────────────────────────────────────────────────┘

dataSync.ts manages this automatically:
✓ Detects offline/online transitions
✓ Queues actions when offline
✓ Processes queue when back online
✓ Retries up to 3 times
✓ Shows status in UI
```

---

## Security & Access Control

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ROLE-BASED ACCESS CONTROL                        │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Patient    │  │  Caregiver   │  │    Admin     │
│   (Device)   │  │ (Family App) │  │  (Command)   │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       │ Can:            │ Can:            │ Can:
       │ - Check in      │ - View status   │ - View all
       │ - Confirm meds  │ - Acknowledge   │ - Configure
       │                 │ - View logs     │ - Bulk ops
       │                 │ - Manage        │ - Reports
       │ Cannot:         │   contacts      │ - User mgmt
       │ - Change config │                 │
       │ - View others   │ Cannot:         │
       │                 │ - Change sched  │
       │                 │ - View billing  │
       │                 │                 │
       ▼                 ▼                 ▼
    ┌────────────────────────────────────────┐
    │         Supabase Auth + RLS            │
    │                                        │
    │  User role determines:                 │
    │  - Which endpoints accessible          │
    │  - Which patients visible              │
    │  - What operations allowed             │
    └────────────────────────────────────────┘

Security Layers:
1. Supabase Auth (user identification)
2. Role middleware (backend validation)
3. Patient-scoped keys (data isolation)
4. Frontend route guards (UX protection)
```

---

## Time Synchronization

```
┌─────────────────────────────────────────────────────────────────────┐
│                     FDA TIME SYNC REQUIREMENT                       │
└─────────────────────────────────────────────────────────────────────┘

Problem: Device clocks may drift, causing inaccurate timestamps

Solution: Continuous time synchronization

┌──────────┐                              ┌──────────┐
│ Device   │──── "What time is it?" ────► │ Backend  │
│ App      │                               │ (NTP)    │
└────┬─────┘                               └────┬─────┘
     │                                          │
     │ Client: 2026-03-17T14:30:05             │
     │ Server: 2026-03-17T14:30:00             │
     │ Drift:  +5 seconds                      │
     │                                          │
     │◄──── Server time + drift calculation ───┘
     │
     ▼
┌─────────────────────────────────────────┐
│ TimeSyncIndicator shows:                │
│                                         │
│ ✓ Synced (< 1s drift)                  │
│ ⚠ Minor drift (1-5s drift)             │
│ ✗ Out of sync (> 5s drift)             │
└─────────────────────────────────────────┘

All three apps sync independently:
- Caregiver App: Syncs every 60 seconds
- Device App: Syncs every 60 seconds
- Command Centre: Syncs every 60 seconds

FDA Requirement: < 5 second drift tolerance
CareSolis: Warns at > 1 second drift
```

---

## Deployment Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    RECOMMENDED SYNC WORKFLOW                        │
└─────────────────────────────────────────────────────────────────────┘

STEP 1: DEVELOP IN CAREGIVER APP
   ┌──────────────┐
   │ Caregiver    │
   │ App (Source) │
   └──────┬───────┘
          │
          │ 1. Add feature
          │ 2. Test thoroughly
          │ 3. Document changes
          │
          ▼

STEP 2: COPY SHARED FILES
   ┌──────────────┐         ┌──────────────┐
   │ Caregiver    │────────►│ Device App   │
   │ App          │         └──────────────┘
   └──────┬───────┘
          │
          └────────────────►┌──────────────┐
                            │ Command      │
                            │ Centre       │
                            └──────────────┘

   Files copied:
   ✓ theme.css
   ✓ shared.ts
   ✓ CaresolisContext.tsx
   ✓ Updated components

STEP 3: TEST IN ALL APPS
   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │ Caregiver    │  │ Device App   │  │ Command      │
   │ App          │  │              │  │ Centre       │
   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │  All apps    │
                    │  behave      │
                    │  identically │
                    └──────────────┘

STEP 4: DEPLOY TO PRODUCTION
   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │ Production   │  │ Production   │  │ Production   │
   │ Caregiver    │  │ Device       │  │ Command      │
   └──────────────┘  └──────────────┘  └──────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                            ▼
                  Same Supabase Backend
```

---

## Visual Consistency Check

```
┌─────────────────────────────────────────────────────────────────────┐
│            HOW TO VERIFY APPS ARE IN SYNC                           │
└─────────────────────────────────────────────────────────────────────┘

Open all three apps side-by-side:

┌──────────┐  ┌──────────┐  ┌──────────┐
│Caregiver │  │  Device  │  │ Command  │
└──────────┘  └──────────┘  └──────────┘

Visual Checks:
✓ Same primary color (slate)
✓ Same accent color (emerald)
✓ Same destructive color (rose)
✓ Same font family
✓ Same border radius
✓ Same spacing/padding
✓ Same button styles
✓ Same card styles

Functional Checks:
✓ All apps show same patient data
✓ Changes in one app appear in others (within 5-10 sec)
✓ Dark mode looks identical
✓ Time sync indicator shows same status
✓ Offline indicator behavior matches

Data Checks:
✓ Same patient name
✓ Same last check-in time
✓ Same next scheduled time
✓ Same escalation status
✓ Same Care Circle contacts
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SYNC QUICK REFERENCE                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Changed Colors?          → Copy theme.css to all apps              │
│ Added Component?         → Copy to all apps if shared              │
│ Modified Context?        → Copy to all apps                        │
│ New Backend Endpoint?    → Update all apps' API calls              │
│ Changed Data Type?       → Update shared.ts in all apps            │
│ Fixed Bug?               → Apply fix to all affected apps          │
│                                                                     │
│ Testing Sync:                                                       │
│ 1. Open all three apps                                             │
│ 2. Make change in one app                                          │
│ 3. Verify change appears in others                                 │
│ 4. Check console for errors                                        │
│                                                                     │
│ Source of Truth:  Caregiver App                                    │
│ Sync Frequency:   Weekly (minor), Monthly (full)                   │
│ Documentation:    Update guides after every sync                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

**Use this visual guide alongside the detailed documentation for a complete understanding of the CareSolis sync architecture.**
