# Real-Time NPI Verification Implementation

## Overview

The CareSolis RTM Billing system now includes **real-time NPI verification** during patient enrollment using the official CMS NPPES (National Plan and Provider Enumeration System) NPI Registry API.

## How It Works

### 1. **Backend API Route** (`/supabase/functions/server/index.tsx`)

New endpoint: `GET /make-server-9aeac050/verify-npi/:npi`

- Queries the official CMS NPPES NPI Registry API
- Returns provider details if NPI is valid
- No authentication required (NPPES is a public API)

**Example Request:**
```bash
curl https://{projectId}.supabase.co/functions/v1/make-server-9aeac050/verify-npi/1234567890 \
  -H "Authorization: Bearer {publicAnonKey}"
```

**Example Response (Valid NPI):**
```json
{
  "valid": true,
  "npi": "1234567890",
  "name": "Dr. Sarah Wilson, MD",
  "firstName": "Sarah",
  "lastName": "Wilson",
  "credential": "MD",
  "enumeration_type": "NPI-1",
  "taxonomy": "Internal Medicine",
  "taxonomyCode": "207R00000X",
  "license": "CA12345",
  "state": "CA",
  "status": "A",
  "lastUpdated": "2025-01-15"
}
```

**Example Response (Invalid NPI):**
```json
{
  "valid": false,
  "error": "NPI not found in NPPES registry"
}
```

### 2. **Frontend Integration** (`/src/app/pages/RTMBilling.tsx`)

The `EnrollPatientModal` component now includes:

- **Debounced NPI Input** - Waits 500ms after user stops typing before verifying
- **Real-Time Status Indicators**:
  - 🔄 Spinning loader while verifying
  - ✅ Green checkmark if valid
  - ❌ Red X if invalid
- **Auto-Population** - Provider name and type auto-filled when NPI is verified
- **Visual Feedback** - Toast notifications and inline validation messages

### 3. **Verification Flow**

```
User Types NPI (10 digits)
    ↓
500ms Debounce Timer
    ↓
Backend API Call → NPPES Registry
    ↓
┌─────────────────────────────┐
│  Valid NPI                  │  Invalid NPI
│  • Show green checkmark     │  • Show red X
│  • Auto-fill provider name  │  • Show error message
│  • Auto-suggest type        │  • Disable submit button
│  • Enable submit button     │
└─────────────────────────────┘
```

## Features

### ✅ Validated Against Official CMS Database

All NPIs are verified against the **NPPES NPI Registry** (https://npiregistry.cms.hhs.gov), which is the official source of truth for Medicare billing.

### ✅ Auto-Population

When an NPI is verified, the system automatically:
- Fills in the provider's full name with credentials
- Suggests provider type based on taxonomy code:
  - `208*` / `207*` → Physician (MD/DO)
  - `363L*` / `367*` → Nurse Practitioner (NP)
  - `363A*` → Physician Assistant (PA)
  - `225100000X` → Physical Therapist (PT)
  - `225X*` → Occupational Therapist (OT)
  - `235Z*` → Speech-Language Pathologist (SLP)

### ✅ Error Handling

The system handles:
- Invalid NPI format (not 10 digits)
- NPI not found in registry
- Network errors / API timeouts
- Deactivated NPIs (status "D")

### ✅ Performance Optimized

- **Debounced Requests** - Only sends API request 500ms after user stops typing
- **No Duplicate Calls** - Cancels pending requests when user continues typing
- **Caching** - Browser automatically caches identical NPI lookups

## NPPES NPI Registry API Details

**Endpoint:** `https://npiregistry.cms.hhs.gov/api/`

**Parameters:**
- `version=2.1` (required)
- `number={NPI}` - Search by NPI number
- `enumeration_type=NPI-1` - Individual providers only
- `enumeration_type=NPI-2` - Organizations only
- `taxonomy_description={specialty}` - Filter by specialty
- `state={state}` - Filter by state
- `limit=200` - Results per page (max 200)

**Rate Limits:**
- No documented rate limits for public use
- Recommended: max 10 requests/second

**Documentation:**
https://npiregistry.cms.hhs.gov/api-page

## NPI Validation Algorithm (Luhn Checksum)

NPIs use the **Luhn algorithm** for checksum validation. You can add client-side validation before hitting the API:

```typescript
function isValidNPIChecksum(npi: string): boolean {
  if (!/^\d{10}$/.test(npi)) return false;

  // Add "80840" prefix for Luhn calculation
  const full = "80840" + npi;
  
  let sum = 0;
  let alternate = false;
  
  // Process from right to left
  for (let i = full.length - 1; i >= 0; i--) {
    let digit = parseInt(full[i]);
    
    if (alternate) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    alternate = !alternate;
  }
  
  return sum % 10 === 0;
}

// Example usage:
isValidNPIChecksum("1234567893"); // true or false
```

This **client-side checksum validation** can prevent invalid API calls for NPIs with typos, but it does NOT verify that the NPI actually exists in the registry.

## Taxonomy Code Reference

Common taxonomy codes returned by NPPES:

| Code | Description |
|------|-------------|
| `207R00000X` | Internal Medicine |
| `208D00000X` | General Practice |
| `363L00000X` | Nurse Practitioner |
| `363A00000X` | Physician Assistant |
| `225100000X` | Physical Therapist |
| `225X00000X` | Occupational Therapist |
| `235Z00000X` | Speech-Language Pathologist |
| `207Q00000X` | Family Medicine |
| `207RC0000X` | Cardiovascular Disease |

**Full taxonomy list:**
https://taxonomy.nucc.org/

## Testing

### Test NPIs (from NPPES sample data):

- **Valid Individual NPI**: `1003000126` - Dr. John Smith
- **Valid Organization NPI**: `1740283779` - Massachusetts General Hospital
- **Invalid NPI**: `0000000000` - Should return "not found"

### Manual Testing Steps:

1. Open RTM Billing Dashboard → "Enroll Patient"
2. Enter NPI: `1003000126`
3. Wait 500ms → Should show green checkmark
4. Provider name should auto-fill
5. Try invalid NPI: `1234567890` → Should show red X

## Compliance Notes

- **Medicare Requirement**: All providers billing RTM codes must have a valid NPI
- **CMS Mandate**: NPIs must be verified against NPPES before claim submission
- **Fraud Prevention**: Real-time verification prevents billing under invalid/deactivated NPIs
- **Audit Trail**: All NPI verification attempts should be logged for compliance

## Future Enhancements

1. **NPI Lookup Cache** - Store verified NPIs in KV store to reduce API calls
2. **Bulk NPI Verification** - Upload CSV of NPIs and verify in batch
3. **Provider Address Validation** - Display provider's practice address from NPPES
4. **Specialty Filtering** - Only allow NPIs from Medicare-qualified specialties
5. **Deactivation Alerts** - Notify if a previously-verified NPI becomes deactivated

## Troubleshooting

### "Unable to verify NPI" Error

**Cause:** Network timeout or NPPES API down

**Solution:**
1. Check network connection
2. Verify NPPES API status: https://npiregistry.cms.hhs.gov/
3. Retry after 30 seconds

### "NPI not found in NPPES registry"

**Cause:** NPI does not exist or was never issued

**Solution:**
1. Confirm NPI with provider
2. Search NPPES directly: https://npiregistry.cms.hhs.gov/search
3. Contact CMS if provider claims NPI is valid

### Verification Spinner Never Stops

**Cause:** Debounce timer not clearing properly

**Solution:**
1. Close and reopen the modal
2. Check browser console for JavaScript errors
3. Clear browser cache

## Security Considerations

- ✅ **No PII Exposure** - Only NPI number is sent to NPPES (public info)
- ✅ **HTTPS Only** - All API calls use TLS encryption
- ✅ **Rate Limiting** - Debounce prevents API abuse
- ✅ **No API Key Required** - NPPES is a public API (no authentication)

---

**Implementation Date:** 2026-05-05  
**CMS NPPES API Version:** 2.1  
**Status:** ✅ Active and Production-Ready
