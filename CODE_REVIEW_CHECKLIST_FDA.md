# FDA Compliance Code Review Checklist

## Purpose
This checklist MUST be completed for ANY code changes touching medication management, time calculations, or patient data handling.

---

## Pre-Review Requirements

- [ ] Reviewer has read `/FDA_COMPLIANCE_CRITICAL_CODE.md`
- [ ] Reviewer has read `/PROTECTED_CODE_QUICK_REFERENCE.md`
- [ ] Developer has documented the change reason
- [ ] Change has regulatory approval (if touching protected code)

---

## General Code Quality

- [ ] Code follows existing patterns and conventions
- [ ] No hardcoded dates or times
- [ ] All timestamps use ISO 8601 format
- [ ] Timezone handling is explicit (never assumes timezone)
- [ ] Error handling is comprehensive with try-catch blocks
- [ ] Logging is detailed enough for debugging production issues

---

## Protected Code Sections - CRITICAL REVIEW

### Frontend: CaresolisContext.tsx - fetchStatus()

**If this file was modified, answer these questions:**

- [ ] Does the code still calculate `patientLocalDate` using patient timezone?
- [ ] Does the code still calculate `patientLocalTime` using patient timezone?
- [ ] Are BOTH date and localTime passed to the backend?
- [ ] Is the date format still YYYY-MM-DD?
- [ ] Is the time format still HH:MM (24-hour)?
- [ ] Is `Intl.DateTimeFormat` still being used (not manual calculation)?
- [ ] Is patient timezone sourced from `getLocationSync()` or `currentPatient?.patientLocation?.timezone`?
- [ ] Are date and time calculated from the SAME instant?

**If ANY answer is NO, REJECT the PR and escalate to FDA Compliance Officer**

### Backend: index.tsx - /status endpoint

**If this file was modified, answer these questions:**

- [ ] Does the endpoint still accept `date` query parameter?
- [ ] Does the endpoint still accept `localTime` query parameter?
- [ ] Is `currentDateStr` still derived from the date parameter (or current date if missing)?
- [ ] Is `currentMinutes` still derived from localTime parameter (or current time if missing)?
- [ ] Does the actionability logic check `event.date !== currentDateStr`?
- [ ] Does the actionability logic check if slot is in the future?
- [ ] Are BOTH checks included in final `isActionable` calculation?
- [ ] Is the order of checks preserved (date boundary BEFORE future check)?
- [ ] Are all safety checks combined with AND logic (not OR)?
- [ ] Is comprehensive logging still present?

**If ANY answer is NO, REJECT the PR and escalate to FDA Compliance Officer**

---

## Timezone Handling - SAFETY CRITICAL

- [ ] Patient timezone is ALWAYS used for patient-local calculations
- [ ] Caregiver timezone is ONLY used for caregiver UI display
- [ ] Server timezone is NEVER used for medication timing
- [ ] All date/time conversions use `Intl.DateTimeFormat` with explicit timezone
- [ ] No use of `new Date().toLocaleString()` without timezone parameter
- [ ] No use of `Date.getHours()` or `Date.getDate()` without timezone consideration

---

## Date Boundary Safety

- [ ] Events from different days are NEVER marked as actionable
- [ ] Future events are NEVER marked as actionable before their time
- [ ] Past events from today CAN be actionable (depending on status)
- [ ] Midnight transitions are handled correctly
- [ ] Date comparisons use string comparison of YYYY-MM-DD format

---

## Medication Event States

Review the status flow for each medication event:

- [ ] "Scheduled" → Can only transition when time arrives
- [ ] "ReminderActive" → Shows action buttons
- [ ] "EscalationLevel1/2/3" → Shows action buttons
- [ ] "Acknowledged" → Shows verify button only
- [ ] "Check-In On Time" → Final state, no action buttons
- [ ] "Check-In Delayed" → Final state, no action buttons
- [ ] "Check-In Not Logged" → Final state, no action buttons
- [ ] "Closed" → Final state, no action buttons from different days

---

## Testing Requirements

**Developer MUST provide evidence of testing:**

- [ ] Test case: Event from yesterday with status "Scheduled" → isActionable = false
- [ ] Test case: Event from today at 09:00 when current time is 08:00 → isActionable = false
- [ ] Test case: Event from today at 09:00 when current time is 09:15 with status "ReminderActive" → isActionable = true
- [ ] Test case: Event from today with status "Check-In On Time" → isActionable = false
- [ ] Test case: Midnight transition (23:59 → 00:01) creates new events for new day
- [ ] Test case: Timezone change doesn't affect existing events
- [ ] Test case: All 6 time zones tested (Hawaii, Alaska, Pacific, Mountain, Central, Eastern)
- [ ] Test case: Daylight saving time transition

**If ANY test is missing, REQUEST additional testing before approval**

---

## Logging and Debugging

- [ ] Console logs include patient timezone being used
- [ ] Console logs include date and time being passed to backend
- [ ] Server logs include date boundary check results
- [ ] Server logs include future time check results
- [ ] Server logs include final actionability decision
- [ ] Error messages include enough context to debug in production
- [ ] No sensitive patient data in logs (PHI protection)

---

## Database and State Management

- [ ] Event dates are stored as YYYY-MM-DD strings
- [ ] Event times are stored as HH:MM strings (24-hour format)
- [ ] Patient timezone is stored separately from event data
- [ ] No client-side caching of time-sensitive data without expiration
- [ ] Events are keyed by date (e.g., `mds:patient:1:events:2026-03-22`)

---

## Documentation

- [ ] Code changes are documented in `/FDA_COMPLIANCE_CRITICAL_CODE.md` (if protected code changed)
- [ ] Comments explain WHY, not just WHAT
- [ ] FDA compliance rationale is documented
- [ ] Breaking changes are clearly marked
- [ ] Migration guide provided if data structure changed

---

## Regression Risk Assessment

**Rate the risk of this change causing regression:**

- [ ] Low Risk: Bug fix with no logic changes
- [ ] Medium Risk: Refactoring with same behavior
- [ ] High Risk: New feature or logic change
- [ ] Critical Risk: Changes to protected FDA compliance code

**If High or Critical Risk:**
- [ ] Full regression test suite executed
- [ ] QA team manually tested all medication workflows
- [ ] Staging environment tested for 24+ hours
- [ ] Rollback plan documented

---

## Final Checklist

- [ ] All automated tests pass
- [ ] No console errors in browser
- [ ] No server errors in logs
- [ ] Code has been peer reviewed by at least one other developer
- [ ] FDA compliance documentation updated (if applicable)
- [ ] Change log updated
- [ ] Version number incremented

---

## Approval Signatures

**Code Reviewer:**
- Name: ___________________________
- Date: ___________________________
- Signature: ___________________________

**FDA Compliance Officer (if protected code changed):**
- Name: ___________________________
- Date: ___________________________
- Signature: ___________________________

**QA Manager (if high/critical risk):**
- Name: ___________________________
- Date: ___________________________
- Signature: ___________________________

---

## Rejection Reasons (if applicable)

If this PR is rejected, document the reason:

```
[Write rejection reason here]
```

---

## Notes

```
[Additional notes from code review]
```

---

**This checklist must be completed and attached to every Pull Request that touches medication-related code.**

**Incomplete checklists will result in automatic PR rejection.**
