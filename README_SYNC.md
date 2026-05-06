# CareSolis Multi-App Sync - Complete Guide

## 📚 Documentation Index

Welcome to the CareSolis multi-app synchronization guide! This documentation will help you keep all three CareSolis applications (Caregiver App, Device App, and Command Centre) synchronized with shared designs, components, and real-time data.

---

## 🎯 Quick Start

**If you're in a hurry**, here's what you need to know:

1. **Caregiver App** (this project) is the **source of truth**
2. All **shared files** should be copied from Caregiver → Device → Command Centre
3. **Data syncs automatically** via the Supabase backend (all apps poll every 5 seconds)
4. **Monthly full sync** recommended to prevent drift

---

## 📖 Documentation Files

### 🏗️ Architecture & Planning

**[SYNC_ARCHITECTURE.md](./SYNC_ARCHITECTURE.md)** - **START HERE**
- Complete system architecture
- Data synchronization strategy
- Shared data structures
- Backend endpoint documentation
- FDA compliance requirements
- Real-time sync implementation
- **Read this first to understand the big picture**

**[SYNC_VISUAL_GUIDE.md](./SYNC_VISUAL_GUIDE.md)** - Visual diagrams
- System overview diagrams
- Data flow visualization
- Component sharing model
- Offline sync architecture
- Security layers
- **Great for visual learners**

---

### 🧩 Component Management

**[SHARED_COMPONENTS_GUIDE.md](./SHARED_COMPONENTS_GUIDE.md)** - Component reference
- Which components to copy to all apps
- Component categories (core, UI, app-specific)
- Color palette reference
- Typography system
- Usage examples for each app
- **Use this when adding or updating components**

**[/src/app/types/shared.ts](./src/app/types/shared.ts)** - Type definitions
- All shared TypeScript types
- Patient, device, event, and config types
- API response types
- **Copy this to all apps whenever it changes**

---

### 📱 App Templates

**[DEVICE_APP_TEMPLATE.md](./DEVICE_APP_TEMPLATE.md)** - Device app guide
- Complete template for patient-facing device
- Large touch UI components
- Medication dispense interface
- Audio feedback implementation
- Simplified navigation
- **Use this to build the Device app**

**[COMMAND_CENTRE_TEMPLATE.md](./COMMAND_CENTRE_TEMPLATE.md)** - Admin dashboard guide
- Multi-patient overview
- Advanced analytics
- RPM billing dashboard
- Bulk operations
- System health monitoring
- **Use this to build the Command Centre app**

---

### ✅ Maintenance & Checklists

**[SYNC_CHECKLIST.md](./SYNC_CHECKLIST.md)** - Operational checklist
- When to sync what
- Step-by-step sync procedures
- Testing protocols
- Troubleshooting guide
- Version control guidelines
- **Use this for ongoing maintenance**

---

## 🚀 Getting Started Guide

### Step 1: Understand the Architecture (30 minutes)
1. Read [SYNC_ARCHITECTURE.md](./SYNC_ARCHITECTURE.md) sections 1-3
2. Review [SYNC_VISUAL_GUIDE.md](./SYNC_VISUAL_GUIDE.md) diagrams
3. Understand the three apps' purposes:
   - **Caregiver App**: Family monitoring
   - **Device App**: Patient check-in interface
   - **Command Centre**: Admin/clinical dashboard

### Step 2: Create Device App (2-3 hours)
1. Create new Figma Make project: "CareSolis Device"
2. Follow [DEVICE_APP_TEMPLATE.md](./DEVICE_APP_TEMPLATE.md)
3. Copy shared files from Caregiver App (see [SHARED_COMPONENTS_GUIDE.md](./SHARED_COMPONENTS_GUIDE.md))
4. Build device-specific UI (large buttons, simple flow)
5. Test check-in workflow

### Step 3: Create Command Centre App (3-4 hours)
1. Create new Figma Make project: "CareSolis Command Centre"
2. Follow [COMMAND_CENTRE_TEMPLATE.md](./COMMAND_CENTRE_TEMPLATE.md)
3. Copy all shared files from Caregiver App
4. Build multi-patient view
5. Implement analytics and billing

### Step 4: Test Sync (1 hour)
1. Open all three apps
2. Make a change in one app (e.g., patient check-in)
3. Verify change appears in other apps within 5-10 seconds
4. Test offline mode in each app
5. Verify data consistency

### Step 5: Establish Sync Routine (Ongoing)
1. Use [SYNC_CHECKLIST.md](./SYNC_CHECKLIST.md) for weekly checks
2. Perform monthly full sync
3. Document all changes
4. Update version numbers

---

## 📋 Essential Sync Rules

### Rule 1: Caregiver App is Source of Truth
Always develop new features in the Caregiver App first, then copy to others.

### Rule 2: Always Copy These Files
When any of these change, copy to all apps:
- `/src/styles/theme.css`
- `/src/app/types/shared.ts`
- `/src/app/context/CaresolisContext.tsx`
- All `/src/app/components/ui/*` components

### Rule 3: Test in All Apps
Before considering a feature "done," test it in all three apps.

### Rule 4: Document Everything
Update the relevant guide whenever you make a change.

### Rule 5: Version Control
Add version comments to all shared files (see [SYNC_CHECKLIST.md](./SYNC_CHECKLIST.md) for format).

---

## 🎨 Design System Overview

### Color Palette (Same in All Apps)
```css
Slate (Infrastructure): hsl(215 25% 27%)
Emerald (Wellness):     hsl(158 64% 52%)
Rose (Alerts):          hsl(0 84.2% 60.2%)
```

### Typography (Same in All Apps)
```css
H1: 2.25rem, 700 weight
H2: 1.875rem, 600 weight
H3: 1.5rem, 600 weight
```

### Components (Same in All Apps)
All apps use the same UI components from `/src/app/components/ui/`

---

## 🔄 Data Sync Overview

### How It Works
1. All apps poll the same Supabase backend every 5 seconds
2. Backend uses patient-scoped keys to isolate data
3. Changes made in any app are reflected in all apps within 5-10 seconds
4. Offline mode queues actions and syncs when connection returns

### Backend Endpoints (Shared)
```
GET  /status?patientId={id}    - Current device state
POST /interact                  - Patient check-in
POST /acknowledge               - Caregiver acknowledgment
GET  /logs?patientId={id}       - Audit logs
GET  /contacts?patientId={id}   - Care Circle contacts
POST /settings                  - Configuration updates
```

### Data Structures (Shared)
All defined in `/src/app/types/shared.ts` - copy this file to all apps.

---

## 🛠️ Common Tasks

### Task: Add a New Color
1. Update `/src/styles/theme.css` in Caregiver App
2. Copy to Device App
3. Copy to Command Centre App
4. Test in all apps (light + dark mode)

### Task: Create a New Shared Component
1. Create in `/src/app/components/` in Caregiver App
2. Test thoroughly
3. Copy to Device App's `/src/app/components/`
4. Copy to Command Centre's `/src/app/components/`
5. Test in all apps
6. Add version comment
7. Document in [SHARED_COMPONENTS_GUIDE.md](./SHARED_COMPONENTS_GUIDE.md)

### Task: Add a Backend Endpoint
1. Add route to `/supabase/functions/server/index.tsx`
2. Use patient-scoped key: `KEYS.PREFIX(patientId)`
3. Add audit logging
4. Test with curl/Postman
5. Update contexts in all apps if needed
6. Document in [SYNC_ARCHITECTURE.md](./SYNC_ARCHITECTURE.md)

### Task: Update a Context Provider
1. Update in Caregiver App
2. Test thoroughly
3. Copy to Device App
4. Copy to Command Centre App
5. Test data flow in all apps

---

## ✅ Monthly Sync Checklist

### Week 1: Audit
- [ ] Compare `theme.css` across all apps
- [ ] Check component versions match
- [ ] Review context providers
- [ ] List any discrepancies

### Week 2: Update
- [ ] Copy latest styles to all apps
- [ ] Sync all shared components
- [ ] Update all contexts
- [ ] Sync utility functions

### Week 3: Test
- [ ] Test critical flows in each app
- [ ] Verify data sync works
- [ ] Check UI consistency
- [ ] Test offline mode

### Week 4: Document
- [ ] Update version numbers
- [ ] Document changes in guides
- [ ] Note known issues
- [ ] Plan next month

---

## 🚨 Troubleshooting

### Data Not Syncing
1. Check patient ID is correct in all apps
2. Verify backend URL is identical
3. Compare API endpoints
4. Check browser console for errors
5. Review audit logs

### UI Looks Different
1. Compare `theme.css` files
2. Verify Tailwind v4 is configured
3. Check component versions
4. Review dark mode settings
5. Clear browser cache

### Backend Errors
1. Check Supabase dashboard logs
2. Verify API keys
3. Test endpoints with curl
4. Review audit logs for errors

See [SYNC_CHECKLIST.md](./SYNC_CHECKLIST.md) for detailed troubleshooting.

---

## 📊 File Reference

### Shared Files (Copy to All Apps)

#### Styles
```
/src/styles/theme.css
/src/styles/globals.css
/src/styles/tailwind.css
/src/styles/fonts.css
/src/styles/index.css
```

#### Types
```
/src/app/types/shared.ts
```

#### Contexts
```
/src/app/context/CaresolisContext.tsx
/src/app/context/PatientContext.tsx
/src/app/context/AuthContext.tsx
/src/app/context/AppLoadingContext.tsx
```

#### Core Components
```
/src/app/components/CaresolisLogo.tsx
/src/app/components/ThemeToggle.tsx
/src/app/components/ThemeProvider.tsx
/src/app/components/TimeSyncIndicator.tsx
/src/app/components/LocationTimezoneIndicator.tsx
/src/app/components/OfflineIndicator.tsx
/src/app/components/SystemIntegrityPanel.tsx
/src/app/components/ErrorBoundary.tsx
```

#### UI Components
```
/src/app/components/ui/ (entire folder)
```

#### Utilities
```
/src/app/utils/dataSync.ts
/src/app/utils/timeSync.ts
/src/app/utils/locationSync.ts
```

### App-Specific Files (Customize Per App)

#### Caregiver App
- Dashboard with activity ring
- Care Circle management
- Stability charts
- RPM billing module

#### Device App
- Large check-in button
- Medication prompts
- Simple status display
- Audio feedback

#### Command Centre
- Multi-patient list
- Advanced analytics
- Bulk operations
- System health dashboard

---

## 🎓 Learning Path

### For New Developers
1. Start with [SYNC_ARCHITECTURE.md](./SYNC_ARCHITECTURE.md) (1 hour)
2. Review [SYNC_VISUAL_GUIDE.md](./SYNC_VISUAL_GUIDE.md) (30 min)
3. Read [SHARED_COMPONENTS_GUIDE.md](./SHARED_COMPONENTS_GUIDE.md) (30 min)
4. Practice: Copy a component between apps (30 min)
5. Review [SYNC_CHECKLIST.md](./SYNC_CHECKLIST.md) (30 min)

**Total time: ~3 hours to become proficient**

### For Designers
1. Review [SHARED_COMPONENTS_GUIDE.md](./SHARED_COMPONENTS_GUIDE.md) color palette
2. Check [SYNC_VISUAL_GUIDE.md](./SYNC_VISUAL_GUIDE.md) for visual consistency
3. Review `/src/styles/theme.css` for design tokens
4. Understand design system inheritance

### For Backend Developers
1. Read [SYNC_ARCHITECTURE.md](./SYNC_ARCHITECTURE.md) backend section
2. Review `/supabase/functions/server/index.tsx`
3. Understand patient-scoped keys
4. Review FDA compliance logging requirements

---

## 📞 Support & Questions

### Documentation Updates
This documentation is a living resource. When you:
- Discover a better approach
- Encounter an edge case
- Find a bug in the docs

**Please update the relevant guide** and add a note at the bottom.

### Version History
- **v1.0.0** (2026-03-17): Initial sync architecture
  - Created all 6 documentation files
  - Established sync workflow
  - Defined shared component library

---

## 🎯 Success Metrics

You'll know the sync is working when:
✅ All three apps have identical visual appearance
✅ Changes in one app appear in others within 10 seconds
✅ No console errors in any app
✅ Audit logs show complete cross-app history
✅ Monthly sync takes < 2 hours

---

## 📦 Quick Links

- **Architecture**: [SYNC_ARCHITECTURE.md](./SYNC_ARCHITECTURE.md)
- **Visual Guide**: [SYNC_VISUAL_GUIDE.md](./SYNC_VISUAL_GUIDE.md)
- **Components**: [SHARED_COMPONENTS_GUIDE.md](./SHARED_COMPONENTS_GUIDE.md)
- **Checklist**: [SYNC_CHECKLIST.md](./SYNC_CHECKLIST.md)
- **Device Template**: [DEVICE_APP_TEMPLATE.md](./DEVICE_APP_TEMPLATE.md)
- **Command Centre Template**: [COMMAND_CENTRE_TEMPLATE.md](./COMMAND_CENTRE_TEMPLATE.md)
- **Shared Types**: [/src/app/types/shared.ts](./src/app/types/shared.ts)
- **Sync Utility**: [/src/app/utils/dataSync.ts](./src/app/utils/dataSync.ts)

---

**Happy syncing! 🚀**

*Last updated: March 17, 2026*
