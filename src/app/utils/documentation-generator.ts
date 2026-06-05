// Generate comprehensive CareSolis documentation for download

export function generateComprehensiveDocumentation(): string {
  const date = new Date().toUTCString();

  return `CARESOLIS COMPREHENSIVE DOCUMENTATION PACKAGE
Generated: ${date}
Version: 1.3.3 STABLE
========================================

TABLE OF CONTENTS
-----------------
1. CAREGIVER USER MANUAL
2. PROVIDER/CLINICIAN MANUAL
3. DEVICE SETUP GUIDE
4. SYSTEMS INFRASTRUCTURE MANUAL

========================================
========================================

SECTION 1: CAREGIVER USER MANUAL
========================================

[Content will be loaded from caresolis-user-manual.md]

This manual covers:
- System overview and philosophy
- Dashboard navigation
- Escalation protocols
- Medication management
- Care coordination
- Routine stability monitoring
- Emergency procedures
- Troubleshooting

For the complete Caregiver Manual, see the file:
/src/imports/pasted_text/caresolis-user-manual.md

========================================
========================================

SECTION 2: PROVIDER/CLINICIAN MANUAL
========================================

FOR HEALTHCARE PROVIDERS & CLINICAL STAFF

Who This Manual Is For:
- Healthcare Providers (MD, DO, NP, PA)
- Clinical Administrators
- Billing Staff with NPI
- Compliance Officers

OVERVIEW

CareSolis is an FDA-compliant Remote Patient Monitoring (RPM) system that:
- Monitors medication adherence via automated dispenser
- Tracks daily patient interactions
- Provides Care Circle escalation alerts
- Enables Medicare RPM billing (CPT 99453, 99454, 99457, 99458)

QUICK START (5 Minutes)

Step 1: Enroll Patient
1. Go to Clinical Operations → RPM Billing
2. Click "Enroll Patient"
3. Fill in patient demographics
4. Obtain patient consent

Step 2: Log Provider Activities
1. Navigate to RPM Billing dashboard
2. Click "Log Activity"
3. Record time spent on care coordination
4. System auto-generates billing documentation

Step 3: Submit Claims
1. Review monthly billing summary
2. Export billing codes (99453, 99454, 99457, 99458)
3. Submit to Medicare via your EHR/billing system

RPM BILLING & MEDICARE CPT CODES

CareSolis qualifies for Remote Patient Monitoring (RPM) reimbursement under Medicare Part B.

Billable CPT Codes:

CPT 99453 - Initial Setup & Patient Education
Reimbursement: ~$19
Requirements:
- One-time per patient
- Initial device setup
- Patient education (how to use device, how to check-in)
- Documentation of patient consent

CPT 99454 - Device Supply & Data Transmission (Monthly)
Reimbursement: ~$64
Requirements:
- Billed monthly
- Device must transmit data for 16 days minimum
- Automated data collection (medication adherence, check-ins)

CPT 99457 - Interactive Communication (20 Minutes)
Reimbursement: ~$51
Requirements:
- First 20 minutes of care coordination per month
- Provider reviews data, discusses adherence
- Documents intervention (e.g., medication adjustments)

CPT 99458 - Additional Interactive Communication (20 Minutes)
Reimbursement: ~$41
Requirements:
- Each additional 20 minutes beyond first session
- Billed in addition to 99457

Total Potential Reimbursement Per Patient:
- Month 1: $19 + $64 + $51 = $134 (with setup)
- Ongoing Monthly: $64 + $51 = $115 minimum
- With Additional Time: Up to $200+/month

ELECTRONIC SIGNATURE GUIDE

CareSolis uses FDA-compliant electronic signatures for:
- Patient consent forms
- Device malfunction reports
- Clinical documentation

How to Create a Valid Electronic Signature:
1. Navigate to the document requiring signature
2. Click "Sign Document"
3. Enter your name, credentials, and NPI
4. Review document carefully
5. Check "I attest..." box
6. Click "Submit Signature"

FDA Requirements Met:
✅ Unique identifier (NPI)
✅ Timestamp (ISO 8601 UTC)
✅ Immutable audit trail
✅ Intent to sign checkbox
✅ Non-repudiation (cryptographically signed)

PATIENT CONSENT WORKFLOW

Before enrolling a patient in CareSolis RPM:

Required Consents:
1. RPM Monitoring Consent (Required for billing)
2. Care Circle Contact Authorization (Who can receive alerts)
3. Device Installation Consent (If device installed in home)

Consent Process:
1. Provider explains RPM monitoring to patient
2. Patient reviews consent form
3. Patient signs electronically or via paper form
4. System stores consent with timestamp
5. Provider can begin RPM billing

Withdrawal of Consent:
- Patient can withdraw at any time
- RPM billing stops immediately
- Device can remain installed for non-billable use
- Contact admin to process withdrawal

DEVICE MALFUNCTION REPORTING

FDA regulations require reporting device malfunctions.

When to Report:
- Device fails to record check-ins
- Medication dispensing errors
- Light gate sensor malfunction
- Software crashes or errors
- Safety-related incidents

How to Report:
1. Go to Help Center → Device Malfunction Report
2. Fill out incident details:
   - Patient name
   - Date/time of incident
   - Description of malfunction
   - Impact on patient care
3. Electronically sign report
4. Submit to FDA compliance team

Response Times:
- Critical (patient harm): Immediate review
- High (medication error): 24-hour review
- Medium (sensor failure): 48-hour review
- Low (UI bug): Next maintenance window

FDA COMPLIANCE CHECKLIST

Use this checklist to ensure CareSolis deployment meets FDA regulations.

✅ Pre-Deployment:
□ Provider NPI registered in system
□ Patient consent forms signed
□ Device serial number recorded
□ Care Circle contacts configured
□ Medication schedule verified

✅ Ongoing Operations:
□ Review audit logs monthly
□ Verify data transmission (16+ days/month for RPM billing)
□ Log all provider interactions
□ Document medication changes
□ Monitor escalation alerts

✅ Quality Assurance:
□ Test device check-in functionality monthly
□ Review medication adherence reports
□ Verify caregiver escalation paths
□ Check system integrity dashboard
□ Update patient medications as needed

✅ Documentation:
□ Electronic signatures properly executed
□ Audit trail preserved (immutable)
□ Billing documentation complete
□ Patient consent current
□ Device malfunction reports filed

For Questions or Support:
Contact CareSolis Clinical Operations Team
Email: clinical@caresolis.com
Phone: 1-800-CARE-SOLIS

========================================
========================================

SECTION 3: DEVICE SETUP GUIDE
========================================

CARESOLIS DEVICE INSTALLATION & CONFIGURATION

HARDWARE OVERVIEW

The CareSolis Solis device is a medication adherence monitoring system with:
- Triple IR gate sensors for verified interaction
- Ambient LED light ring (Calm Communication)
- Wi-Fi connectivity (2.4GHz and 5GHz)
- Medication compartments (configurable)
- Local processing with cloud sync

INSTALLATION CHECKLIST

Before Installation:
□ Device charged (LED ring glows when powered)
□ Wi-Fi network name and password available
□ Patient's daily schedule known
□ Medication list prepared
□ Care Circle contacts identified

Physical Installation:
1. Choose location:
   - Kitchen counter or dining table (most common)
   - Within Wi-Fi range
   - Away from direct sunlight
   - At patient's eye level
   - Near daily routine path

2. Power connection:
   - Plug device into wall outlet
   - LED ring should glow amber (setup mode)
   - Allow 30 seconds for boot-up

3. Verify sensor function:
   - Wave hand 3-5 feet from device
   - LED should briefly flash
   - This confirms IR sensors are working

WI-FI CONFIGURATION

Option 1: Mobile App Configuration (Recommended)
1. Download CareSolis Device Setup app
2. Enable Bluetooth on your phone
3. Open app and tap "Add New Device"
4. Follow on-screen pairing instructions
5. Enter Wi-Fi credentials when prompted
6. Wait for green confirmation light

Option 2: Web Dashboard Configuration
1. Connect device to power
2. Device creates temporary Wi-Fi network "Solis-XXXXX"
3. Connect your computer to this network
4. Browser opens setup page automatically
5. Select your home Wi-Fi network
6. Enter Wi-Fi password
7. Device reboots and connects to your network

Troubleshooting Wi-Fi Issues:
- LED flashes red: Wi-Fi password incorrect
- LED stays amber: Cannot find network
- LED flashes blue: Connecting to cloud
- LED turns green: Successfully connected

MEDICATION COMPARTMENT SETUP

CareSolis supports multiple medication schedules:
- Morning medications (e.g., 9:00 AM)
- Noon medications (e.g., 12:00 PM)
- Evening medications (e.g., 6:00 PM)
- Bedtime medications (e.g., 9:00 PM)

Physical Compartment Layout:
- Each time slot has dedicated compartment
- Label compartments with time (9:00 AM, 12:00 PM, etc.)
- Use included labels for patient clarity

Loading Medications:
1. Open compartment door
2. Place daily medications inside
3. Close compartment door (locks automatically)
4. Repeat for each time slot
5. Verify compartment assignments in dashboard

DASHBOARD CONFIGURATION

After hardware setup, configure software settings:

1. Patient Profile:
   - Navigate to Settings → Patient Profile
   - Enter patient name, date of birth
   - Set preferred timezone
   - Add medical record number (optional)

2. Medication Schedule:
   - Go to Medication Hub → Schedule Settings
   - Add each medication time (e.g., 9:00 AM)
   - Set grace period (default: 15 minutes)
   - Configure escalation levels
   - Save schedule

3. Care Circle Contacts:
   - Navigate to Care Coordination
   - Add primary caregiver (required)
   - Add Level 1, Level 2, Level 3 contacts
   - Enter phone numbers for SMS alerts
   - Set contact preferences

4. Notification Settings:
   - Go to Notification Settings
   - Configure SMS, email, push notifications
   - Set quiet hours if needed
   - Test notifications

TESTING & VERIFICATION

Final Testing Checklist:
□ Simulate check-in (wave hand near device)
□ LED transitions from amber to green
□ Dashboard shows "Interaction Detected"
□ Test medication compartment access
□ Verify caregiver receives test notification
□ Check audit log for recorded events

PATIENT EDUCATION

Teach the patient:
1. What the LED colors mean:
   - Amber = Reminder (check-in time)
   - Green = Confirmed (interaction detected)
   - Red = Alert (needs attention)

2. How to check in:
   - Simply be present near device during medication time
   - No buttons to press
   - Device automatically detects interaction

3. What caregivers see:
   - Caregivers can see check-in status
   - Missed check-ins trigger escalation alerts
   - Privacy: No cameras, no audio recording

4. Who to contact for help:
   - Primary caregiver: [Contact info]
   - Technical support: 1-800-CARE-SOLIS
   - Emergency: 911 (CareSolis is NOT emergency response)

ONGOING MAINTENANCE

Weekly Tasks:
- Refill medication compartments
- Wipe device surface with dry cloth
- Check Wi-Fi connectivity (LED status)

Monthly Tasks:
- Review medication schedule for changes
- Update Care Circle contacts if needed
- Test notification delivery
- Check device firmware version

As Needed:
- Add/remove medications
- Adjust check-in times
- Update caregiver contact information
- Report device malfunctions

TROUBLESHOOTING GUIDE

Device Won't Power On:
- Check power outlet with another device
- Try different power cable
- Contact support if LED stays dark

Missed Check-Ins Reported Incorrectly:
- Verify patient was actually home
- Check IR sensor alignment
- Ensure device not obstructed
- Review scheduled time vs actual time

Caregiver Not Receiving Alerts:
- Verify phone number in Care Circle
- Check notification settings
- Test notification delivery
- Confirm SMS provider not blocking

Device Shows Offline:
- Check Wi-Fi router status
- Verify Wi-Fi password unchanged
- Restart device (unplug 30 seconds)
- Contact support if persists

========================================
========================================

SECTION 4: SYSTEMS INFRASTRUCTURE MANUAL
========================================

TECHNICAL ARCHITECTURE & INFRASTRUCTURE

SYSTEM OVERVIEW

Caresolis is an infrastructure-grade interaction visibility system built on a three-tier architecture:

1. Device Layer (Solis): Hardware interaction detection, local processing
2. Processing Layer (Cloud): Event evaluation, escalation routing
3. Interface Layer (Dashboard): Real-time visibility, caregiver controls

TECHNOLOGY STACK

Frontend (Client):
- Framework: React 18 (Vite) with TypeScript
- Styling: Tailwind CSS v4
- State Management: Context API with CaresolisContext
- Routing: React Router v7 (Data Mode)
- Offline Support: Service Worker with intelligent caching
- UI/UX: Calm color palette (slate, emerald, rose)

Backend (Server):
- Platform: Supabase Edge Functions
- Runtime: Deno (secure TypeScript runtime)
- Web Framework: Hono (lightweight HTTP routing)
- Database: Key-Value Store (single-table design)
- Authentication: Supabase Auth with JWT tokens
- SMS Integration: Twilio API

Infrastructure:
- Hosting: Supabase Cloud (US-East-2 region)
- CDN: Cloudflare (global edge network)
- Monitoring: Built-in system integrity dashboard
- Logging: Triple-logging for FDA compliance

DATA MODEL

Key-Value Store Schema:

Event Data:
- \`mds:events:YYYY-MM-DD\` → Daily schedule and slot status
- \`mds:device:state:v1\` → High-level system summary
- \`mds:config:v1\` → Escalation timing configuration

Medication Data:
- \`med:schedule:v1\` → Medication schedule
- \`med:compartment:XX\` → Compartment assignments
- \`med:database\` → Medication reference database

Patient Data:
- \`mds:patient:N:profile\` → Patient demographics
- \`mds:patient:N:contacts\` → Care Circle contacts
- \`mds:patient:N:consent\` → Consent records

Audit Data:
- \`mds:audit:log:YYYY-MM\` → Monthly audit logs
- \`mds:audit:action:*\` → Action audit trail
- \`mds:audit:signature:*\` → Electronic signatures

Billing Data:
- \`rpm:billing:YYYY-MM\` → Monthly billing records
- \`rpm:activity:*\` → Provider activity log

ESCALATION PROTOCOL

Time-Critical Medications (tc_flag = true):
- T+0: Reminder active (amber light)
- T+15: Level 1 escalation (SMS to primary caregiver)
- T+30: Level 2 escalation (SMS to secondary contacts)
- T+60: Level 3 escalation (SMS to all Care Circle)

Standard Medications (tc_flag = false):
- T+0: Grace period begins (amber light)
- T+15: Reminder active (amber light continues)
- T+30: Level 1 escalation (SMS to primary caregiver)
- T+45: Level 2 escalation (SMS to secondary contacts)
- T+60: Level 3 escalation (SMS to all Care Circle)

Flash Escalation Protection:
- Slots cannot close until 60+ minutes elapsed
- Prevents premature closure from rapid escalation
- Validated with canCloseSlot() function

SECURITY & COMPLIANCE

Authentication:
- Supabase Auth with JWT tokens
- Role-based access control (RBAC)
- Roles: admin, caregiver, provider, recipient
- Protected routes require authentication

Data Privacy:
- No cameras, no audio recording
- Local IR sensor processing
- Encrypted data transmission (HTTPS/TLS)
- Patient data isolation (multi-tenant)

FDA Compliance:
- Triple-logging for audit trail
- Immutable audit logs
- Electronic signatures (21 CFR Part 11)
- Device malfunction reporting
- Version control with signatures

SYSTEM MONITORING

Health Checks:
- Backend connectivity indicator
- Time sync quality monitoring
- Wi-Fi connection status
- Sensor malfunction detection

Performance Metrics:
- Check-in detection rate
- Escalation response times
- Medication adherence percentage
- Routine stability score

System Integrity:
- Audit log verification
- Data synchronization status
- Version signature validation
- Configuration drift detection

DEPLOYMENT ARCHITECTURE

Production Environment:
- Frontend: Static site hosted on Cloudflare CDN
- Backend: Supabase Edge Functions (Deno runtime)
- Database: Supabase PostgreSQL + KV Store
- SMS: Twilio (US phone numbers)

Disaster Recovery:
- Automated daily backups
- Point-in-time recovery (30 days)
- Multi-region data replication
- Manual export capability

Scalability:
- Serverless architecture (auto-scaling)
- Edge caching for static assets
- Efficient KV store queries
- Optimized API endpoints

API ENDPOINTS

Core Endpoints:
- GET /status - Current system status
- POST /acknowledge - Record check-in interaction
- POST /verify - Verify medication taken
- GET /schedule - Get medication schedule
- POST /escalate - Trigger manual escalation

Notification Endpoints:
- GET /notification-preferences - Get SMS settings
- POST /notification-preferences - Update SMS settings
- POST /test-notification - Send test SMS

Admin Endpoints:
- GET /audit-logs - Retrieve audit trail
- POST /signature - Submit electronic signature
- GET /system-integrity - System health check
- POST /config - Update system configuration

RPM Billing Endpoints:
- GET /rpm-billing - Monthly billing summary
- POST /rpm-activity - Log provider activity
- GET /rpm-export - Export billing codes

TROUBLESHOOTING

Backend Connection Issues:
1. Check backend status indicator (top-right)
2. Verify Supabase project is running
3. Check network connectivity
4. Review browser console for errors

Data Sync Issues:
1. Check time sync indicator
2. Verify timezone settings
3. Test clock drift calculation
4. Review auto-sync service logs

Escalation Not Triggering:
1. Verify escalation config (grace period, offsets)
2. Check Care Circle contacts configured
3. Test notification preferences
4. Review escalation logs

Device Offline:
1. Check Wi-Fi router status
2. Verify device power connection
3. Test network connectivity
4. Contact support if persists

For detailed technical support:
Email: technical@caresolis.com
Documentation: https://docs.caresolis.com
GitHub: https://github.com/steaklocker/CareSolis

========================================
END OF DOCUMENTATION PACKAGE
========================================

CareSolis v1.3.3 STABLE
FDA Class II Medical Device (Pending Approval)
Copyright © 2026 CareSolis Health Technologies
All Rights Reserved
`;
}
