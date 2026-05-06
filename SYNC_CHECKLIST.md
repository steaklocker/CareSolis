# CareSolis App Sync Checklist

## Quick Reference: When to Sync What

Use this checklist to ensure all three apps (Caregiver, Device, Command Centre) stay synchronized.

---

## 🎨 Design System Changes

### When you change colors, fonts, or spacing:

**Files to Update:**
- [ ] `/src/styles/theme.css` - Copy to all apps
- [ ] `/src/styles/globals.css` - Copy to all apps
- [ ] `/src/styles/fonts.css` - Copy to all apps (if font changes)

**Verification:**
- [ ] Light mode looks identical in all apps
- [ ] Dark mode looks identical in all apps
- [ ] Chart colors match across apps
- [ ] Border radius is consistent

**Testing:**
- [ ] Open all three apps side-by-side
- [ ] Toggle dark mode in each
- [ ] Compare visual appearance
- [ ] Check responsive behavior

---

## 🧩 Component Changes

### When you create or update a shared component:

**Decision Tree:**
1. **Is it core branding/identity?** → Copy to all apps
   - CaresolisLogo.tsx
   - Header.tsx (with app-specific customization)
   - ThemeProvider.tsx
   - ThemeToggle.tsx

2. **Is it a UI primitive?** → Copy to all apps
   - button.tsx, card.tsx, badge.tsx, etc.
   - Entire `/src/app/components/ui/` folder

3. **Is it system monitoring?** → Copy to all apps
   - TimeSyncIndicator.tsx
   - LocationTimezoneIndicator.tsx
   - OfflineIndicator.tsx
   - SystemIntegrityPanel.tsx

4. **Is it app-specific?** → Keep separate
   - Caregiver: ActivityLog, StabilityChart, CareCircle components
   - Device: CheckInButton, MedicationPrompt, ReminderAlert
   - Command Centre: PatientCard, BulkActions, AdvancedFilters

**Checklist:**
- [ ] Copy component file to other apps
- [ ] Update imports if file paths differ
- [ ] Test component in each app
- [ ] Add version comment at top of file
- [ ] Document in `SHARED_COMPONENTS_GUIDE.md`

---

## 📡 Backend/API Changes

### When you add or modify an endpoint:

**Server Changes (`/supabase/functions/server/index.tsx`):**
- [ ] Add new route with `/make-server-9aeac050` prefix
- [ ] Use patient-scoped keys: `KEYS.PREFIX(patientId)`
- [ ] Add FDA audit logging: `writeAuditLog(...)`
- [ ] Test endpoint with curl/Postman
- [ ] Document in `SYNC_ARCHITECTURE.md`

**Frontend Integration:**
- [ ] Update `CaresolisContext.tsx` if data structure changes
- [ ] Copy updated context to all apps
- [ ] Update TypeScript types in `/src/app/types/shared.ts`
- [ ] Copy updated types to all apps
- [ ] Test in all three apps

**Verification:**
- [ ] All apps can call the new endpoint
- [ ] Data formats are consistent
- [ ] Error handling works correctly
- [ ] Audit logs are being written

---

## 🔄 Data Structure Changes

### When you add or modify data types:

**Files to Update:**
- [ ] `/src/app/types/shared.ts` - Add/modify type
- [ ] Copy to all apps
- [ ] Update backend validation if needed
- [ ] Update any context providers that use the type

**Migration Checklist:**
- [ ] Add new fields to existing types (don't remove old ones)
- [ ] Make new fields optional (`field?: type`)
- [ ] Test backward compatibility
- [ ] Update documentation

**Example:**
```typescript
// BAD - Breaking change
interface Patient {
  id: UUID;
  fullName: string; // Changed from 'name'
}

// GOOD - Backward compatible
interface Patient {
  id: UUID;
  name: string;
  fullName?: string; // New optional field
}
```

---

## 🗄️ Context Provider Changes

### When you update shared state management:

**Files to Sync:**
- [ ] `/src/app/context/CaresolisContext.tsx`
- [ ] `/src/app/context/PatientContext.tsx`
- [ ] `/src/app/context/AuthContext.tsx`
- [ ] `/src/app/context/AppLoadingContext.tsx`

**Checklist:**
- [ ] Copy updated context to all apps
- [ ] Test that data flows correctly
- [ ] Verify polling/sync works
- [ ] Check error handling
- [ ] Test offline behavior

---

## 🛠️ Utility Function Changes

### When you update shared utilities:

**Files to Sync:**
- [ ] `/src/app/utils/dataSync.ts`
- [ ] `/src/app/utils/timeSync.ts`
- [ ] `/src/app/utils/locationSync.ts`
- [ ] Any other shared utils

**Verification:**
- [ ] Functions work identically in all apps
- [ ] No environment-specific code
- [ ] Error handling is consistent

---

## 🔐 Authentication Changes

### When you modify auth flow:

**Backend Changes:**
- [ ] Update `/supabase/functions/server/auth_routes.tsx`
- [ ] Test sign up, login, logout
- [ ] Verify session management

**Frontend Changes:**
- [ ] Update `AuthContext.tsx`
- [ ] Copy to all apps
- [ ] Test in each app
- [ ] Verify protected routes work

**Security Check:**
- [ ] No credentials leaked to frontend
- [ ] Service role key only on backend
- [ ] Public anon key safe for frontend use
- [ ] Role-based access works correctly

---

## 📊 New Feature Rollout

### When adding a complete new feature:

**Step 1: Plan**
- [ ] Determine which apps need the feature
- [ ] Identify shared vs. app-specific components
- [ ] Plan backend endpoints
- [ ] Design data structures

**Step 2: Implement in Caregiver App**
- [ ] Build backend endpoints
- [ ] Create frontend components
- [ ] Add to context if needed
- [ ] Test thoroughly

**Step 3: Sync to Other Apps**
- [ ] Copy shared components to Device App
- [ ] Copy shared components to Command Centre
- [ ] Implement app-specific variations
- [ ] Test in all apps

**Step 4: Verify**
- [ ] All apps can access backend
- [ ] Data syncs correctly
- [ ] UI is consistent
- [ ] No breaking changes

---

## 🧪 Testing Protocol

### Before Deploying Changes:

**Unit Testing:**
- [ ] Component renders correctly
- [ ] Functions return expected values
- [ ] Error cases are handled

**Integration Testing:**
- [ ] Backend endpoints work
- [ ] Data flows from backend to frontend
- [ ] Real-time sync works (if applicable)

**Cross-App Testing:**
- [ ] Make change in Caregiver App, verify in Device/Command Centre
- [ ] Make change in Device App, verify in Caregiver/Command Centre
- [ ] Check audit logs show all changes

**User Testing:**
- [ ] Caregiver can monitor patient
- [ ] Patient can check in on device
- [ ] Admin can view all data in Command Centre

---

## 🚨 Troubleshooting

### Data Out of Sync

**Diagnostic Steps:**
1. [ ] Check patient ID is correct in all apps
2. [ ] Verify backend URL is identical
3. [ ] Compare API endpoints
4. [ ] Check auth tokens
5. [ ] Review audit logs for errors

**Fix:**
- [ ] Refresh all apps (clear cache)
- [ ] Verify polling intervals
- [ ] Check for JavaScript errors in console
- [ ] Test backend endpoints directly

---

### UI Inconsistencies

**Diagnostic Steps:**
1. [ ] Compare `theme.css` files
2. [ ] Check Tailwind configuration
3. [ ] Verify component versions
4. [ ] Review dark mode settings

**Fix:**
- [ ] Copy latest `theme.css` from Caregiver App
- [ ] Update components to match versions
- [ ] Clear browser cache
- [ ] Hard refresh (Cmd/Ctrl + Shift + R)

---

### Backend Errors

**Diagnostic Steps:**
1. [ ] Check server logs in Supabase dashboard
2. [ ] Verify API key is correct
3. [ ] Test endpoint with curl
4. [ ] Review audit logs

**Fix:**
- [ ] Add detailed error logging
- [ ] Verify CORS headers
- [ ] Check patient ID scoping
- [ ] Test in isolation

---

## 📝 Version Control (Manual)

### File Versioning Convention

Add this comment block to every shared file:

```typescript
/**
 * [Component/File Name]
 * 
 * Version: 1.2.0
 * Last Updated: 2026-03-17
 * Updated By: [Your Name]
 * 
 * Shared Across:
 * - Caregiver App ✓
 * - Device App ✓
 * - Command Centre ✓
 * 
 * Last Changes:
 * - Added dark mode support
 * - Fixed responsive layout
 * 
 * Dependencies:
 * - theme.css
 * - button.tsx
 */
```

### Semantic Versioning

- **Major (1.0.0 → 2.0.0)**: Breaking changes, requires update in all apps
- **Minor (1.0.0 → 1.1.0)**: New features, backward compatible
- **Patch (1.0.0 → 1.0.1)**: Bug fixes, no API changes

---

## 📦 Complete Sync Process

### Monthly Full Sync (Recommended)

**Week 1: Audit**
- [ ] Review all three apps
- [ ] Compare component versions
- [ ] Check for drift in styles
- [ ] List discrepancies

**Week 2: Update**
- [ ] Copy latest `theme.css` to all apps
- [ ] Update all shared components
- [ ] Sync all contexts
- [ ] Update utility functions

**Week 3: Test**
- [ ] Test all critical flows in each app
- [ ] Verify data sync works
- [ ] Check UI consistency
- [ ] Test on different devices

**Week 4: Document**
- [ ] Update version numbers
- [ ] Document changes in guides
- [ ] Note any known issues
- [ ] Plan next month's sync

---

## 🎯 Quick Sync Templates

### Template 1: Minor UI Fix

```
✓ Fixed bug in Button component
✓ Updated button.tsx in Caregiver App
✓ Copied to Device App
✓ Copied to Command Centre App
✓ Tested in all three apps
✓ Bumped version to 1.0.1
```

### Template 2: New Backend Endpoint

```
✓ Added /medication-dispense endpoint
✓ Updated CaresolisContext.tsx
✓ Added MedicationDispense type to shared.ts
✓ Copied context to all apps
✓ Copied types to all apps
✓ Tested in Caregiver App
✓ Tested in Device App
✓ Tested in Command Centre App
✓ Documented in SYNC_ARCHITECTURE.md
```

### Template 3: Design System Update

```
✓ Updated --accent color in theme.css
✓ Verified light mode appearance
✓ Verified dark mode appearance
✓ Copied theme.css to Device App
✓ Copied theme.css to Command Centre App
✓ Tested all apps side-by-side
✓ Updated documentation
```

---

## 📞 Emergency Sync Protocol

### If Apps Are Severely Out of Sync:

**Step 1: Identify Source of Truth**
- Caregiver App is the primary source of truth
- Use it as the baseline

**Step 2: Nuclear Option - Full Resync**
1. [ ] Copy entire `/src/styles/` from Caregiver → Device
2. [ ] Copy entire `/src/styles/` from Caregiver → Command Centre
3. [ ] Copy entire `/src/app/context/` from Caregiver → both apps
4. [ ] Copy entire `/src/app/components/ui/` from Caregiver → both apps
5. [ ] Copy `/src/app/types/shared.ts` from Caregiver → both apps
6. [ ] Copy all shared utilities

**Step 3: Verify**
- [ ] Test basic functionality in all apps
- [ ] Check that data syncs
- [ ] Verify UI is consistent
- [ ] Test on different browsers

**Step 4: Document**
- [ ] Note what was synced
- [ ] Update version numbers
- [ ] Document in this checklist

---

## 🏁 Pre-Deployment Checklist

### Before Deploying to Production:

**All Apps:**
- [ ] All shared files are synced
- [ ] Version numbers match
- [ ] Tests pass in all apps
- [ ] No console errors
- [ ] Audit logging works
- [ ] Time sync is functional
- [ ] Offline mode works

**Caregiver App:**
- [ ] Dashboard loads correctly
- [ ] Care Circle management works
- [ ] RPM billing calculations accurate
- [ ] Service module functional

**Device App:**
- [ ] Check-in button works
- [ ] Medication prompts display
- [ ] IR gate readings accurate
- [ ] Audio feedback plays

**Command Centre:**
- [ ] Multi-patient view loads
- [ ] Analytics render correctly
- [ ] Bulk operations work
- [ ] Reports export properly

---

## 📚 Reference Links

- **Main Documentation**: `/SYNC_ARCHITECTURE.md`
- **Component Guide**: `/SHARED_COMPONENTS_GUIDE.md`
- **Device App Template**: `/DEVICE_APP_TEMPLATE.md`
- **Command Centre Template**: `/COMMAND_CENTRE_TEMPLATE.md`
- **Shared Types**: `/src/app/types/shared.ts`

---

**Last Updated**: March 17, 2026  
**Next Scheduled Sync**: April 15, 2026
