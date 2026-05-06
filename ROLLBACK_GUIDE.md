# 🔄 CareSolis Rollback Guide

## Quick Rollback to Baseline v1.0.0

**When to use this guide:**
- Future changes break the medication workflow
- Daily interaction ring shows incorrect statuses
- Action buttons appear for wrong time slots
- Date boundary issues after midnight
- Timezone-related bugs appear

---

## 🚨 Emergency Rollback (5 Minutes)

### Step 1: Identify What Broke
Check console logs for these error patterns:
```
❌ Yesterday's slots showing as "Closed" on new day
❌ Future slots showing action buttons
❌ Missing: [fetchStatus] 📅 Using patient timezone
❌ Backend errors on /status endpoint
```

### Step 2: Restore Protected Code Sections

#### Option A: Frontend Issue (CaresolisContext.tsx)

**Search for this in the file:**
```typescript
// 🚨 FDA CLASS II DEVICE COMPLIANCE - CRITICAL DATE/TIME HANDLING 🚨
```

**Verify this code is intact:**
```typescript
const location = getLocationSync();
const patientTimezone = location?.timezone || currentPatient?.patientLocation?.timezone || 'America/Los_Angeles';
const now = new Date();

const patientLocalDate = new Intl.DateTimeFormat('en-CA', { 
    timeZone: patientTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
}).format(now);

const patientLocalTime = new Intl.DateTimeFormat('en-US', {
    timeZone: patientTimezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
}).format(now);

const cacheBuster = `&t=${Date.now()}`;
const url = `${SERVER_URL}/status?patientId=${patientId}&date=${patientLocalDate}&localTime=${patientLocalTime}${cacheBuster}`;
```

**If missing or modified:**
- Restore the entire `fetchStatus()` function from version control
- Tag: `v1.0.0-baseline`
- File: `/src/app/context/CaresolisContext.tsx`
- Lines: ~183-260

#### Option B: Backend Issue (index.tsx)

**Search for this in the file:**
```typescript
// FDA CLASS II DEVICE REQUIREMENT: Check date boundary FIRST
```

**Verify this code is intact:**
```typescript
let isFromDifferentDay = false;
if (event && event.date && event.date !== currentDateStr) {
    isFromDifferentDay = true;
}

let isFuture = false;
if (!isFromDifferentDay) {
    const [h, m] = slot.time.split(':').map(Number);
    const slotMinutes = h * 60 + m;
    const diffMins = currentMinutes - slotMinutes;
    if (diffMins < 0) {
        isFuture = true;
    }
}

const hasActionableStatus = ['Scheduled', 'ReminderActive', 'EscalationLevel1', 'EscalationLevel2', 'EscalationLevel3', 'Check-In Not Logged', 'Acknowledged'].includes(slot.status);
const isActionable = !isCompleted && !isClosed && !isFuture && !isFromDifferentDay && hasActionableStatus;
```

**If missing or modified:**
- Restore the entire `/status` route handler from version control
- Tag: `v1.0.0-baseline`
- File: `/supabase/functions/server/index.tsx`
- Lines: ~1616-1800

### Step 3: Verify Baseline Restoration

**Check console logs for:**
```
✅ [fetchStatus] 📅 Using patient timezone: America/Los_Angeles, date: 2026-03-22, time: HH:MM
✅ [fetchStatus] 🌐 Calling: ...status?patientId=1&date=2026-03-22&localTime=HH:MM...
✅ [STATUS] 📅 Slot XX:XX is from YYYY-MM-DD, current date is YYYY-MM-DD → isActionable=FALSE
✅ [Dashboard] No actionable slots per backend - hiding all action buttons
```

**Test these scenarios:**
1. Load dashboard at start of new day (after midnight)
2. Verify no "Closed" status on fresh day
3. Verify future slots have no action buttons
4. Test AM check-in sequence

---

## 📋 Detailed Rollback Process (30 Minutes)

### Phase 1: Document the Issue (5 min)

1. **Capture Evidence**
   ```bash
   # Save console logs
   # Right-click in browser console → Save as → logs_[timestamp].txt
   
   # Screenshot the broken behavior
   # Include the daily interaction ring showing incorrect states
   ```

2. **Document What Changed**
   ```
   - What was the last change made?
   - Which files were modified?
   - When did the issue start appearing?
   - What test cases are failing?
   ```

3. **Create Incident Report**
   - File: `/incidents/incident_[timestamp].md`
   - Include: Screenshots, logs, timeline, affected features

### Phase 2: Identify Breaking Change (10 min)

1. **Check Git History**
   ```bash
   # If using version control
   git log --oneline --since="1 day ago"
   git diff v1.0.0-baseline HEAD -- src/app/context/CaresolisContext.tsx
   git diff v1.0.0-baseline HEAD -- supabase/functions/server/index.tsx
   ```

2. **Compare to Baseline**
   - Open `/VERSION_BASELINE_v1.0.0_FDA_COMPLIANT.md`
   - Review "Protected Files in This Baseline" section
   - Compare current code to baseline description

3. **Identify Root Cause**
   - Was a protected code section modified?
   - Was the FDA compliance check removed?
   - Was timezone handling changed?
   - Were date/time parameters removed?

### Phase 3: Restore Baseline Code (10 min)

1. **Backup Current State**
   ```bash
   # Create a backup branch (if using Git)
   git checkout -b broken-state-backup-[timestamp]
   git commit -am "Backup broken state before rollback"
   ```

2. **Restore from Version Control**
   ```bash
   # Checkout baseline version
   git checkout v1.0.0-baseline -- src/app/context/CaresolisContext.tsx
   git checkout v1.0.0-baseline -- supabase/functions/server/index.tsx
   ```

3. **Or Manually Restore Protected Sections**
   - Use `/PROTECTED_CODE_QUICK_REFERENCE.md` as guide
   - Copy the exact code blocks listed
   - Ensure ALL FDA compliance comments are restored
   - Verify no modifications to logic

### Phase 4: Test Restoration (5 min)

1. **Reload Application**
   - Force refresh (Ctrl+Shift+R)
   - Clear browser cache
   - Check for console errors

2. **Run Baseline Tests**
   - [ ] Load dashboard at start of day
   - [ ] Verify all slots show "Scheduled" (not "Closed")
   - [ ] Verify future slots have no action buttons
   - [ ] Test AM check-in sequence
   - [ ] Check console logs for FDA compliance messages

3. **Verify FDA Compliance Logging**
   ```
   Expected logs:
   ✅ [fetchStatus] 📅 Using patient timezone: ...
   ✅ [STATUS] 📅 Slot XX:XX is from ...
   ✅ [STATUS] ⏰ Slot XX:XX is in the FUTURE ...
   ```

### Phase 5: Document and Report (5 min)

1. **Update Incident Report**
   - Document what was rolled back
   - Document restoration steps taken
   - Document test results after rollback

2. **Notify Stakeholders**
   - FDA Compliance Officer
   - QA Team
   - Product Manager
   - Development Team

3. **Update Change Log**
   ```markdown
   ## Rollback - [Timestamp]
   - Rolled back to v1.0.0 baseline
   - Reason: [Breaking change description]
   - Files restored: [List files]
   - Tests passing: [List test results]
   ```

---

## 🔍 Verification Checklist

After rollback, verify ALL items:

### Frontend Verification
- [ ] `fetchStatus()` function contains FDA compliance section
- [ ] Patient timezone is retrieved from `getLocationSync()`
- [ ] `patientLocalDate` calculated using `Intl.DateTimeFormat`
- [ ] `patientLocalTime` calculated using `Intl.DateTimeFormat`
- [ ] URL includes `date` and `localTime` parameters
- [ ] Console logs show: `[fetchStatus] 📅 Using patient timezone:`

### Backend Verification
- [ ] `/status` endpoint accepts `date` query parameter
- [ ] `/status` endpoint accepts `localTime` query parameter
- [ ] Date boundary check: `event.date !== currentDateStr`
- [ ] Future check: `diffMins < 0`
- [ ] Final actionability includes ALL safety checks
- [ ] Console logs show: `[STATUS] 📅 Slot XX:XX is from...`

### Functional Verification
- [ ] Dashboard loads without errors
- [ ] Daily interaction ring displays correctly
- [ ] Yesterday's slots do NOT show as "Closed" on new day
- [ ] Future slots do NOT show action buttons
- [ ] Current/past actionable slots DO show action buttons
- [ ] AM check-in sequence works correctly
- [ ] Patient timezone displays correctly

### Compliance Verification
- [ ] FDA compliance comments are intact
- [ ] Comprehensive logging is present
- [ ] Error handling with try-catch blocks
- [ ] No hardcoded dates or times
- [ ] All date/time in ISO 8601 format

---

## 🆘 Emergency Contacts

**If rollback fails or issues persist:**

**FDA Compliance Emergency:**
- Phone: (555) 999-9999 (24/7)
- Email: compliance-emergency@caresolis.com

**Engineering Emergency:**
- Phone: (555) 888-8888 (24/7)
- Email: engineering-emergency@caresolis.com
- Slack: #emergency-engineering

**QA Team:**
- Email: qa@caresolis.com
- Slack: #qa-team

---

## 📝 Common Issues and Solutions

### Issue: "Closed" status appearing on new day

**Solution:**
1. Check if frontend passes `date` parameter to backend
2. Verify console logs show: `[fetchStatus] 📅 Using patient timezone:`
3. If missing, restore `fetchStatus()` function from baseline

### Issue: Future slots showing action buttons

**Solution:**
1. Check backend actionability logic
2. Verify `isFuture` check is present
3. Verify `!isFuture` is in final `isActionable` calculation
4. If missing, restore `/status` endpoint from baseline

### Issue: Wrong timezone being used

**Solution:**
1. Check `getLocationSync()` is being called
2. Verify patient timezone in database
3. Check console logs for timezone being used
4. Verify `Intl.DateTimeFormat` uses `timeZone` parameter

### Issue: Events from yesterday are actionable

**Solution:**
1. Check date boundary logic in backend
2. Verify `isFromDifferentDay` check is present
3. Verify `event.date !== currentDateStr` comparison
4. If missing, restore actionability logic from baseline

---

## 📚 Reference Documents

After rollback, review these documents:

1. **`/VERSION_BASELINE_v1.0.0_FDA_COMPLIANT.md`**
   - Baseline version details
   - Test results
   - Protected files list

2. **`/FDA_COMPLIANCE_CRITICAL_CODE.md`**
   - Full FDA compliance documentation
   - Protected code sections
   - Change control process

3. **`/PROTECTED_CODE_QUICK_REFERENCE.md`**
   - Quick lookup for protected code
   - DO NOT / MUST rules
   - Test commands

4. **`/CODE_REVIEW_CHECKLIST_FDA.md`**
   - Code review requirements
   - Testing checklist
   - Approval process

---

## ⚖️ Regulatory Compliance

### Medical Device Reporting (MDR)

**If the issue affected patients or production:**

1. **Determine if MDR Required**
   - Did the bug affect patient medication timing?
   - Could the bug have led to medication errors?
   - Was the system deployed to production?

2. **File MDR Within Required Timeframe**
   - Death/Serious Injury: 5 working days
   - Malfunction: 30 days
   - Contact FDA Compliance Officer immediately

3. **Document Corrective Actions**
   - What caused the issue?
   - What was the impact?
   - How was it fixed?
   - How will it be prevented?

---

**Last Updated:** 2026-03-22  
**Baseline Version:** v1.0.0  
**Status:** ✅ READY FOR USE

*Keep this guide accessible. You may need it urgently.*
