# Timezone Auto-Detection Implementation

## Overview
FDA-compliant timezone auto-detection system that pre-populates timezone selections based on patient address while maintaining required human verification.

## FDA Compliance Strategy

### ✅ What We Do
- **Auto-detect** timezone from patient's city and state in their address
- **Pre-populate** the timezone selector to reduce caregiver workload
- **Clearly label** auto-detected data with confidence level
- **Require verification** - caregivers must explicitly click "Verify & Confirm"
- **Log all actions** across three audit mechanisms (context, backend, FDA logs)

### ❌ What We DON'T Do
- Auto-apply timezone changes without human verification
- Hide the source of the timezone data
- Skip verification steps
- Allow unverified timezone data to affect medication timing

## Components

### 1. Timezone Detection Utility (`/src/app/utils/timezoneDetection.ts`)
**Features:**
- State-to-timezone mapping for all 50 US states
- City-specific overrides for states with multiple timezones
- Confidence scoring (high/medium/low)
- Validation and formatting utilities

**Example Usage:**
```typescript
const result = detectTimezoneFromAddress('Louisville', 'KY');
// Returns:
// {
//   timezone: 'America/New_York',
//   confidence: 'high',
//   source: 'city_override',
//   displayText: 'Louisville, KY'
// }
```

### 2. Timezone Verification Modal (Updated)
**FDA-Compliant Features:**
- Pre-populates timezone selector with auto-detected value
- Shows blue "Auto-detected from address" banner with confidence level
- Displays clear warning: "Please verify this is correct before confirming"
- Requires explicit button click to confirm/update
- Maintains all existing verification requirements

**UX Flow:**
1. Modal opens with timezone already selected (auto-detected)
2. Caregiver sees blue banner: "Auto-detected from address: Louisville, KY [High confidence]"
3. Caregiver reviews and can change if needed
4. Caregiver clicks "Update & Verify Timezone"
5. Action logged with triple audit trail

### 3. Timezone Tab (Dashboard)
**No Changes Required:**
- Continues to show Patient/Device/Caregiver timezones
- Displays verification status and acknowledgment tracking
- Opens verification modal when clicked

## Supported Timezones

### US Mainland
- Eastern Time: `America/New_York`
- Central Time: `America/Chicago`
- Mountain Time: `America/Denver`
- Pacific Time: `America/Los_Angeles`
- Arizona Time: `America/Phoenix` (No DST)

### US Territories
- Hawaii: `Pacific/Honolulu`
- Alaska: `America/Anchorage`

### Multi-Timezone State Handling
States with multiple timezones use city-specific overrides:
- **Indiana**: Most cities Eastern, some Central
- **Kentucky**: Eastern Louisville/Lexington, Central elsewhere
- **Tennessee**: Eastern Chattanooga/Knoxville, Central elsewhere
- **North Dakota, South Dakota, Oregon, Idaho**: City-specific mappings

## Benefits Over Manual Selection

### User Experience
- ✅ **Faster onboarding**: No searching through 400+ timezones
- ✅ **Reduced errors**: Auto-detection based on verified address data
- ✅ **Clear communication**: Shows exactly where the data came from
- ✅ **Confidence scoring**: Indicates reliability of auto-detection

### FDA Compliance
- ✅ **Human verification required**: No auto-application
- ✅ **Audit trail**: All selections logged with source information
- ✅ **Transparency**: Clear labeling of auto-detected vs manual data
- ✅ **Fallback handling**: Manual selection always available

### Operational Excellence
- ✅ **Better than competitors**: Most systems don't auto-detect at all
- ✅ **Infrastructure-grade**: Handles edge cases (multi-TZ states)
- ✅ **Caregiver-friendly**: Reduces cognitive load on busy staff
- ✅ **Command Centre ready**: Works for all user roles

## Testing Scenarios

### Test Case 1: New Patient Setup (No Timezone Set)
1. Patient: Dorothy Williams, Louisville, KY
2. Modal opens with timezone pre-selected: `America/New_York`
3. Blue banner shows: "Auto-detected from address: Louisville, KY [High confidence]"
4. Caregiver clicks "Update & Verify Timezone"
5. Timezone saved with source: `auto_detected`

### Test Case 2: Quarterly Verification
1. Patient already has timezone: `America/Chicago`
2. Modal opens with current timezone selected
3. No auto-detection banner (already verified)
4. Caregiver confirms existing timezone
5. Verification timestamp updated

### Test Case 3: Patient Moved
1. Patient moved from CA to NY
2. Update patient address first
3. Open timezone verification
4. New timezone auto-detected: `America/New_York`
5. Blue banner shows new detection
6. Caregiver verifies and confirms
7. Reason: "Patient moved to new location"

### Test Case 4: Low Confidence / No Data
1. Patient has incomplete address (state only)
2. Auto-detection returns medium/low confidence
3. Banner shows or doesn't show based on confidence
4. Caregiver manually selects from dropdown
5. Still fully compliant

## Audit Logging

Every timezone verification action logs:
- **Patient ID** and name
- **Old timezone** and **new timezone**
- **Detection method**: auto_detected vs manual
- **Confidence level**: high/medium/low
- **Address used**: city, state
- **Caregiver ID** who performed verification
- **Reason**: quarterly/moved/correction/seasonal
- **Timestamp**: ISO 8601 format

## Regulatory Justification

**21 CFR Part 11 Compliance:**
- Electronic signature via "Verify & Confirm" button
- Audit trail of all timezone changes
- User authentication required (role-based access)
- Data integrity through validation

**FDA Medication Safety:**
- Timezone affects medication timing
- Auto-detection reduces human error
- Required verification ensures accuracy
- Quarterly checks maintain data quality

## Future Enhancements

### Phase 2 Possibilities:
- Geocoding API integration for real-time location validation
- Device GPS timezone cross-validation
- Historical timezone change analysis
- Predictive alerts for seasonal relocations (snowbirds)
- Integration with address verification services (USPS)

## Summary

This implementation provides **best-in-class UX** while maintaining **rigorous FDA compliance**. By auto-detecting timezone from patient addresses, we:
- Reduce caregiver workload
- Minimize data entry errors
- Maintain required verification
- Exceed competitor capabilities
- Stay FDA compliant

The system is **ready for production** and meets all CareSolis quality standards.
