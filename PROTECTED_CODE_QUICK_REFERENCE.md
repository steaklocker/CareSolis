# 🔒 PROTECTED CODE - QUICK REFERENCE

## ⚠️ DO NOT MODIFY WITHOUT FDA COMPLIANCE REVIEW ⚠️

---

## Frontend Protected Section

**File:** `/src/app/context/CaresolisContext.tsx`  
**Function:** `fetchStatus()`

### Search For:
```
FDA CLASS II DEVICE COMPLIANCE - CRITICAL DATE/TIME HANDLING
```

### What It Does:
Calculates patient's local date/time and passes to backend

### Key Code:
```typescript
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

const url = `${SERVER_URL}/status?patientId=${patientId}&date=${patientLocalDate}&localTime=${patientLocalTime}${cacheBuster}`;
```

### ❌ DO NOT:
- Remove date or localTime parameters
- Use caregiver timezone instead of patient timezone
- Use server time instead of Intl.DateTimeFormat
- Change date format from YYYY-MM-DD
- Change time format from HH:MM 24-hour

### ✅ MUST:
- Use patient's timezone from location sync
- Calculate date and time from same instant
- Pass both date and localTime to backend
- Use ISO 8601 date format (YYYY-MM-DD)
- Use 24-hour time format (HH:MM)

---

## Backend Protected Section

**File:** `/supabase/functions/server/index.tsx`  
**Route:** `GET /make-server-9aeac050/status`

### Search For:
```
FDA CLASS II DEVICE REQUIREMENT: Check date boundary
```

### What It Does:
Determines if medication slots should show action buttons

### Key Code:
```typescript
// Check date boundary FIRST
let isFromDifferentDay = false;
if (event && event.date && event.date !== currentDateStr) {
    isFromDifferentDay = true;
}

// Check if future
let isFuture = false;
if (!isFromDifferentDay) {
    const [h, m] = slot.time.split(':').map(Number);
    const slotMinutes = h * 60 + m;
    const diffMins = currentMinutes - slotMinutes;
    if (diffMins < 0) {
        isFuture = true;
    }
}

// Final actionability
const isActionable = !isCompleted && !isClosed && !isFuture && !isFromDifferentDay && hasActionableStatus;
```

### ❌ DO NOT:
- Remove date boundary check (isFromDifferentDay)
- Remove future time check (isFuture)
- Change the order of checks
- Allow events from different days to be actionable
- Allow future events to be actionable

### ✅ MUST:
- Check event.date !== currentDateStr FIRST
- Check if slot time is in future
- Include ALL safety checks in final isActionable calculation
- Maintain comprehensive logging
- Keep try-catch error handling

---

## Critical Business Rules

### Events from YESTERDAY:
- NEVER actionable after midnight
- Status should transition to "Closed" or remain historical
- Action buttons NEVER appear

### Events from TODAY (future):
- NEVER actionable before their scheduled time
- Status should be "Scheduled"
- Action buttons NEVER appear

### Events from TODAY (past/present):
- MAY be actionable if status allows it
- Status determines if action buttons appear
- Example: "ReminderActive" → show buttons
- Example: "Check-In On Time" → hide buttons

---

## Quick Test Commands

### Verify Frontend Passes Date/Time:
Look for in console logs:
```
[fetchStatus] 📅 Using patient timezone: America/Los_Angeles, date: 2026-03-22, time: 07:57
[fetchStatus] 🌐 Calling: ...status?patientId=1&date=2026-03-22&localTime=07:57...
```

### Verify Backend Date Boundary Check:
Look for in server logs:
```
[STATUS] 📅 Slot 09:00 is from 2026-03-21, current date is 2026-03-22 → isActionable=FALSE (different day)
[STATUS] ⏰ Slot 15:00 is in the FUTURE (120 mins from now) → isActionable=FALSE
```

### Verify Final Actionability:
All future slots should show:
```
{
  "time": "09:00",
  "status": "Scheduled",
  "isActionable": false,
  "isClosed": false
}
```

---

## Emergency Contacts

**FDA Compliance Issues:**
📧 compliance@caresolis.com  
📱 (555) 999-9999 (24/7 Emergency)

**If You See This Bug:**
- Yesterday's slots showing as "Closed" (red) on new day
- Action buttons appearing for future time slots
- Dates not matching patient timezone

**Immediate Action:**
1. DO NOT modify protected code
2. Contact FDA Compliance Officer
3. Document the issue with screenshots and logs
4. Follow emergency change control process

---

## Changelog

### 2026-03-22 - Initial Protection
- Added FDA compliance documentation to frontend fetchStatus()
- Added FDA compliance documentation to backend actionability logic
- Fixed critical bug: date boundary not being checked
- Fixed critical bug: frontend not passing date/time to backend

---

**For full documentation, see:** `/FDA_COMPLIANCE_CRITICAL_CODE.md`
