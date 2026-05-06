================================================================================
CAREGIVER APP SYNC INTEGRATION PROMPT
================================================================================

Hi! The Patient Device app needs to sync data from the Caregiver app. Please implement the following data synchronization features in the Caregiver app:

================================================================================
1. MEDICATION SCHEDULE SYNC
================================================================================

When caregivers create/update medication schedules, save them to the backend using:

ENDPOINT: PUT https://${projectId}.supabase.co/functions/v1/make-server-2a443375/patient/{patientId}/schedule

HEADERS:
  Content-Type: application/json
  Authorization: Bearer ${publicAnonKey}

BODY STRUCTURE:
{
  "doses": [
    {
      "id": "dose-001",
      "patientId": "patient-001",
      "patientName": "John Doe",
      "medicationName": "Lisinopril",
      "strength": "10mg",
      "scheduledAt": 1711123200000,  // Unix timestamp
      "scheduledTime": "2:30 PM",     // Display format
      "priority": "time_critical",    // or "non_time_critical"
      "compartmentId": "compartment-1",
      "instructions": "Take with food"
    }
    // ... more doses
  ],
  "timezone": "America/New_York",
  "updatedAt": Date.now()
}

NOTES:
- Include all upcoming doses for the next 7-30 days
- scheduledAt should be a Unix timestamp (milliseconds)
- priority can be "time_critical" or "non_time_critical"
- Update this whenever schedules change


================================================================================
2. CAREGIVER CONTACT INFO SYNC
================================================================================

When caregivers update their contact information, save it using:

ENDPOINT: PUT https://${projectId}.supabase.co/functions/v1/make-server-2a443375/patient/{patientId}/caregivers

HEADERS:
  Content-Type: application/json
  Authorization: Bearer ${publicAnonKey}

BODY STRUCTURE:
{
  "primary": {
    "id": "cg-001",
    "name": "Sarah Johnson",
    "relationship": "Daughter",
    "phone": "+1-555-123-4567",
    "email": "sarah@example.com",
    "photoUrl": "https://...",
    "preferredContactMethod": "phone",  // "phone", "sms", or "email"
    "availableHours": {
      "start": "09:00",
      "end": "17:00"
    },
    "timezone": "America/New_York"
  },
  "backup": [
    {
      "id": "cg-002",
      "name": "Michael Johnson",
      "relationship": "Son",
      "phone": "+1-555-987-6543",
      "email": "michael@example.com",
      "photoUrl": "https://...",
      "preferredContactMethod": "sms",
      "availableHours": {
        "start": "18:00",
        "end": "22:00"
      },
      "timezone": "America/Los_Angeles"
    }
  ],
  "emergencyContacts": [
    {
      "id": "em-001",
      "name": "Dr. Smith",
      "relationship": "Primary Care Physician",
      "phone": "+1-555-111-2222",
      "priority": 1
    },
    {
      "id": "em-002",
      "name": "Lisa Johnson",
      "relationship": "Neighbor",
      "phone": "+1-555-333-4444",
      "priority": 2
    }
  ],
  "updatedAt": Date.now()
}

NOTES:
- Primary caregiver is required
- Backup caregivers are optional (can be empty array)
- Emergency contacts should be sorted by priority (1 = highest)
- Update whenever contact info changes


================================================================================
3. MEDICATION INVENTORY SYNC
================================================================================

When caregivers refill medications in the device, update inventory using:

ENDPOINT: PUT https://${projectId}.supabase.co/functions/v1/make-server-2a443375/patient/{patientId}/inventory

HEADERS:
  Content-Type: application/json
  Authorization: Bearer ${publicAnonKey}

BODY STRUCTURE:
{
  "compartments": [
    {
      "id": "compartment-1",
      "medicationName": "Lisinopril",
      "strength": "10mg",
      "pillCount": 28,
      "maxCapacity": 30,
      "lastRefilled": 1711123200000,  // Unix timestamp
      "lastDispensed": 1711209600000, // Unix timestamp (optional)
      "expirationDate": "2025-12-31"  // ISO date string (optional)
    },
    {
      "id": "compartment-2",
      "medicationName": "Metformin",
      "strength": "500mg",
      "pillCount": 56,
      "maxCapacity": 60,
      "lastRefilled": 1711123200000,
      "expirationDate": "2026-06-30"
    }
  ],
  "lowStockThreshold": 7,  // Days of medication remaining to trigger alert
  "lastRefill": 1711123200000,
  "updatedAt": Date.now()
}

NOTES:
- Include all compartments in the device
- pillCount should be updated after each dispense
- totalPills will be calculated automatically by backend
- Update when refilling or when pills are dispensed


================================================================================
4. DEVICE STATUS MONITORING (READ-ONLY)
================================================================================

The caregiver app can monitor device status by reading:

ENDPOINT: GET https://${projectId}.supabase.co/functions/v1/make-server-2a443375/patient/{patientId}/device-status

HEADERS:
  Authorization: Bearer ${publicAnonKey}

RESPONSE:
{
  "success": true,
  "data": {
    "state": "IDLE",  // "IDLE", "DOSE_READY", "ACTIVE", "WARNING", "ESCALATION"
    "chuteOpen": false,
    "reservoirCount": 0,
    "elapsedSeconds": 0,
    "lastHeartbeat": 1711123200000,
    "isOnline": true,
    "batteryLevel": 95,
    "isCharging": false,
    "signalStrength": "strong",
    "updatedAt": 1711123200000
  }
}

NOTES:
- This is updated by the Patient Device app
- Poll this endpoint to show real-time device status to caregivers
- isOnline is true if lastHeartbeat was within last 60 seconds


================================================================================
IMPLEMENTATION CHECKLIST
================================================================================

For the Caregiver App, implement:

☐ 1. Medication Schedule Management Screen
   - Allow creating/editing medication schedules
   - Call PUT /schedule endpoint when saving
   - Show upcoming doses for the patient

☐ 2. Caregiver Contact Management Screen
   - Allow editing primary caregiver info
   - Allow adding/editing backup caregivers
   - Allow adding/editing emergency contacts
   - Call PUT /caregivers endpoint when saving

☐ 3. Medication Inventory Management Screen
   - Show all device compartments
   - Allow refilling compartments
   - Call PUT /inventory endpoint after refills
   - Show pill counts and low stock warnings

☐ 4. Device Status Dashboard (Optional)
   - Poll GET /device-status endpoint every 10-30 seconds
   - Show device state, battery, connectivity
   - Alert caregivers if device goes offline

☐ 5. Initial Data Population
   - Create sample medication schedule with at least 3-5 upcoming doses
   - Set up primary caregiver contact info
   - Add at least 1 backup caregiver and 2 emergency contacts
   - Fill inventory with 2-3 medications in compartments


================================================================================
TESTING VERIFICATION
================================================================================

After implementing, verify by:

1. Creating medication schedules in Caregiver app
2. Opening Patient Device app at /sync-status
3. Confirming "Medication Schedule" shows the doses you created
4. Confirming "Caregiver Information" shows contacts you added
5. Confirming "Medication Inventory" shows compartments you filled

All sync status indicators should show green ✓ SYNCED status.


================================================================================
IMPORTANT NOTES
================================================================================

- Both apps share the same patientId (default: "patient-001")
- All endpoints use the same Supabase project
- Authorization uses publicAnonKey (already available in both apps)
- Timestamps should be Unix timestamps in milliseconds (Date.now())
- The Patient Device app READS this data, Caregiver app WRITES it
- Data syncs automatically - no manual sync buttons needed on CG app


================================================================================
END OF PROMPT
================================================================================