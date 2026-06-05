CARESOLIS RTM BILLING DASHBOARD — FIGMA DESIGN PROMPT
=====================================================

PROJECT CONTEXT
---------------
CareSolis is an FDA-compliant medication adherence monitoring system. The app currently has an RPM (Remote Patient Monitoring) billing module that needs to be redesigned and relabeled as RTM (Remote Therapeutic Monitoring) to align with the correct CMS billing pathway for medication adherence devices.

This is a module within an existing React app. The design must match the existing CareSolis design language: calm, clinical, trustworthy. The app uses a slate/emerald/rose color palette with a clean medical-grade aesthetic.

DESIGN SYSTEM TOKENS
--------------------
Colors:
- Primary: Emerald (#10b981 main, #059669 dark, #ecfdf5 light)
- Neutral: Slate (#0f172a through #f8fafc full scale)
- Alert/Error: Rose (#f43f5e main, #fff1f2 light)
- Warning: Amber (#f59e0b main, #fffbeb light)  
- Info: Sky (#0ea5e9 main, #f0f9ff light)
- Accent for "NEW 2026" badges: Purple gradient (#7c3aed → #6d28d9)

Typography:
- Headings: Bold/Extra-bold, tight letter-spacing (-0.02em)
- Body: Regular weight, 13-14px
- Labels: Semi-bold, 11px, uppercase with wide letter-spacing (0.05em)
- Monospace: For CPT codes, NPI numbers, export data

Border Radius: 
- Cards: 14px
- Buttons: 8-10px
- Badges: 12px full-round
- Input fields: 8px

Spacing: 8px base grid

SCREENS TO DESIGN
=================

SCREEN 1: RTM BILLING DASHBOARD (Main View)
--------------------------------------------

HEADER BAR:
- Left: CareSolis icon (emerald gradient rounded square) + "Clinical Operations — RTM Billing" title + subtitle "Remote Therapeutic Monitoring • CPT 98975-98981 • CY 2026 CMS Final Rule"
- Right: "+ Enroll Patient" button (emerald background, white text)

TAB NAVIGATION (below header):
Three tabs with icons:
- 📊 RTM Dashboard (active by default)
- 📋 CPT Code Reference
- 📤 Export Billing
Active tab has emerald bottom border and emerald text. Inactive tabs are slate-400.

SUMMARY METRICS ROW (4 cards in a row):
Card 1: "Est. Monthly Reimbursement" — large dollar amount in emerald, emerald-50 background
Card 2: "Billable Patients" — fraction like "3/4", sky-50 background
Card 3: "Avg per Patient" — dollar amount, slate-50 background
Card 4: "Action Required" — count of patients needing interactive communication, rose-50 background if >0, emerald-50 if 0

PATIENT RTM STATUS SECTION:
Section title: "Patient RTM Status — Current Billing Period"

Each patient is a card containing:

LEFT SIDE — Patient info:
- Name (15px bold)
- MRN + Episode start date (12px slate-400)

RIGHT SIDE — Estimated reimbursement:
- Dollar amount (20px extra-bold emerald)
- "Est. This Period" label below

MIDDLE ROW — Three circular progress indicators side by side:

1) DAYS WITH DATA ring:
   - Circular progress ring (value out of 30 days)
   - Below: "Days with Data" label
   - Status text: 
     "✓ Full tier (98977)" if 16+ days (emerald)
     "◐ Partial tier (98985)" if 2-15 days (amber)
     "○ Below minimum" if <2 days (rose)

2) PROVIDER MINUTES ring:
   - Circular progress ring (value out of 40 minutes)
   - Below: "Provider Minutes" label
   - Status text:
     "✓ Full tier (98980)" if 20+ min (emerald)
     "◐ Partial tier (98979)" if 10-19 min (amber)
     "○ Below minimum" if <10 min (rose)

3) INTERACTIVE COMMUNICATION indicator:
   - Circle with phone icon (📞) if completed, warning icon (⚠️) if not
   - Green border if completed, rose border if not
   - Below: "Interactive Comm" label
   - Status: "✓ Phone/video logged" (emerald) or "✗ Required for billing" (rose)

BOTTOM ROW — CPT code badges:
- Row of small pill-shaped badges showing each applicable CPT code
- Each badge contains: code number (monospace bold) + status badge (Billable/Eligible/Blocked)
- Codes with "NEW 2026" get a purple gradient mini-badge
- If patient has no billable codes: italic text "No billable codes yet — complete setup to begin"

Design 4 patient cards showing different states:
- Patient 1: Fully billable (22 days, 35 min, interactive comm done) — all green
- Patient 2: Partial tier (12 days, 15 min, interactive comm done) — amber progress, 2026 codes shown
- Patient 3: Blocked (8 days, 8 min, NO interactive comm) — has blocked codes with warning
- Patient 4: Pending enrollment (0 everything, setup not complete) — greyed out

Selected patient card has emerald border with emerald-100 outer glow.

SCREEN 2: PROVIDER ACTIVITY LOGGER
------------------------------------
Appears below patient cards when a patient is selected.

HEADER: "⏱ Log Provider Activity — [Patient Name]"
SUBTEXT: "Track care coordination time for RTM billing. Interactive communications (📞 phone/video) satisfy the real-time requirement."

ACTIVITY TYPE GRID (3 columns, 2 rows = 6 activity types):
Each is a selectable card containing:
- Icon (large emoji)
- Activity label (bold)
- If interactive type: "✓ Interactive" badge in sky blue

Activity types:
1. 📊 Data Review — "Review medication adherence data & trends"
2. 📞 Patient Call (Interactive) — "Real-time phone/video with patient or caregiver" [INTERACTIVE badge]
3. 📋 Care Plan Update — "Update treatment plan based on RTM data"
4. 🤝 Provider Coordination — "Coordinate with other Care Circle providers"
5. 🎥 Video Consultation — "Video call with patient or caregiver" [INTERACTIVE badge]
6. 📝 Clinical Documentation — "Document interventions and outcomes"

Selected card has emerald border/background. Interactive cards when selected have sky blue border/background.

INPUT ROW (below grid):
- Duration (minutes): number input field
- Clinical Notes: text input with placeholder "E.g., Reviewed 7-day adherence trend, discussed missed evening doses..."
- "Log Activity" button (emerald, disabled/grey when no activity selected)

SESSION SUMMARY BAR (below input):
- Slate-50 background bar showing:
  Left: "This period: XX min logged • ✓ Interactive communication recorded" (or "✗ No interactive communication — phone/video call required before billing 98979/98980/98981")
  Right: "→ CPT 98980 eligible" (or "→ X min to CPT 98979")


SCREEN 3: CPT CODE REFERENCE TAB
----------------------------------
Title: "📋 RTM CPT Code Reference — 2026 CMS Final Rule"

Table/list of 6 RTM codes, each row containing:
- Code number (monospace, extra-bold, 14px) + "NEW 2026" badge where applicable
- Label and description
- Reimbursement amount (emerald, bold, right-aligned)
- Frequency (slate-400, right-aligned)

CPT Codes to display:

98975 | Initial Setup & Education | $22.00 | Once per episode
"One-time per episode of care. Device setup and patient education on RTM data collection."

98977 | Device Supply — Full Engagement (16-30 days) | $40.08 | Per 30-day period
"Device data transmission for 16-30 days in a 30-day period. Musculoskeletal system monitoring."

98985 [NEW 2026] | Device Supply — Partial Engagement (2-15 days) | $40.08 | Per 30-day period
"NEW 2026: Device data transmission for 2-15 days in a 30-day period. Lower threshold billing."

98979 [NEW 2026] | Treatment Management — 10-19 Minutes | $33.40 | Per calendar month
"NEW 2026: Provider management time of 10-19 minutes. Requires interactive communication."

98980 | Treatment Management — 20+ Minutes | $52.00 | Per calendar month
"First 20+ minutes of treatment management. Requires interactive communication."

98981 | Additional 20-Minute Blocks | $41.00 | Per calendar month (add-on)
"Each additional 20 minutes beyond initial management session."

COMPLIANCE WARNING BOX (below table):
- Amber-50 background, amber border
- Warning icon
- Text: "RPM and RTM cannot be billed for the same patient in the same calendar month. Only one clinician may submit RTM claims per 30-day period per patient. PTs and OTs must append GP, GO, or GN modifiers. Treatment management codes (98979/98980/98981) require at least one real-time synchronous two-way audio interaction (phone or video call). Email and text do not qualify."


SCREEN 4: EXPORT BILLING TAB
------------------------------
Title: "📤 Export RTM Billing Codes"
Subtitle: "Generate billing documentation for your EHR/practice management system"
Right side: "Export This Period" button (slate-800 background, changes to emerald with checkmark on click)

EXPORT PREVIEW:
- Dark terminal-style panel (slate-900 background)
- Monospace font
- Green text on dark background
- Shows structured billing output:

  // CareSolis RTM Billing Export — [Date]
  // Remote Therapeutic Monitoring (RTM) — CY 2026 CMS Final Rule
  
  PATIENT: Margaret Chen (MRN: CS-10042)
    CPT 98977 — $40.08 — 22/16 days — full engagement
    CPT 98980 — $52.00 — 35 min — full management
    SUBTOTAL: $92.08
  
  PATIENT: Robert Williams (MRN: CS-10087)
    CPT 98985 — $40.08 — 12 days — partial engagement (2026)
    CPT 98979 — $33.40 — 15 min — partial management (2026)
    SUBTOTAL: $73.48
  
  TOTAL ESTIMATED REIMBURSEMENT: $165.56


SCREEN 5: ENROLL PATIENT MODAL
--------------------------------
Modal overlay (semi-transparent dark backdrop)
White card, 520px wide, rounded corners (18px)

Title: "Enroll Patient in RTM"
Subtitle: "Remote Therapeutic Monitoring — CPT 98975-98981"

FORM FIELDS:

Row 1 (two columns):
- Patient Name * (text input)
- Date of Birth * (date picker)

Row 2:
- Medical Record Number (text input, placeholder "CS-XXXXX")

Divider line

Section label: "Ordering Provider"

Row 3 (two columns):
- Provider Name * (text input)
- Provider Type * (dropdown with options):
  - Physician (MD/DO)
  - Nurse Practitioner (NP)
  - Physician Assistant (PA)
  - Physical Therapist (PT)
  - Occupational Therapist (OT)
  - Speech-Language Pathologist (SLP)

Row 4:
- NPI Number * (text input, monospace font, placeholder "10-digit National Provider Identifier")
- Validation message if <10 digits: "NPI must be exactly 10 digits (X/10)" in rose
- If PT/OT/SLP selected: amber warning "⚠ Therapy providers must append GP, GO, or GN modifier to RTM claims"

CONSENT BOX (amber-50 background):
- Checkbox + label: "Patient Consent Obtained *"
- Description text: "I confirm that informed consent for Remote Therapeutic Monitoring has been obtained from this patient, including explanation of monitoring purpose, data collection, and billing implications. This consent will be recorded with FDA-compliant electronic signature, timestamp, and audit trail per 21 CFR Part 11."

BUTTON ROW:
- "Cancel" (outlined, slate) 
- "Enroll in RTM (CPT 98975)" (emerald, disabled/grey until all required fields complete)


COMPONENT LIBRARY (for reuse across screens)
---------------------------------------------

Status Badges:
- Billable: emerald-50 bg, emerald-400 border, emerald-700 text
- Eligible: sky-50 bg, sky-400 border, sky-600 text
- Blocked: rose-50 bg, rose-400 border, rose-600 text
- Pending: amber-50 bg, amber-400 border, amber-600 text

NEW 2026 Badge:
- Purple gradient background (#7c3aed → #6d28d9)
- White text, 9px, uppercase, extra-bold

Progress Ring:
- 48px diameter
- 5px stroke width
- Track: slate-200
- Fill: emerald (good), amber (partial), rose (below minimum)
- Center: value number (13px bold)

Metric Card:
- 14px border-radius
- Colored background (varies)
- 1px slate-200 border
- Label (10px uppercase), Value (26px extra-bold), Subtitle (11px slate-400)


DESIGN NOTES
------------
- This replaces the existing "RPM Billing" section under Clinical Operations
- Every instance of "RPM" in the old design becomes "RTM"
- CPT codes change from 99453/99454/99457/99458 to 98975/98977/98985/98979/98980/98981
- The design must feel clinical and trustworthy — this is a medical billing tool used by healthcare providers
- Emphasize the dual-tier system (partial vs full engagement) as this is the key 2026 CMS update
- The interactive communication requirement should be visually prominent — it's the #1 reason claims get blocked
- Mobile responsive is secondary — this will primarily be used on desktop/tablet by clinical staff
- All data displayed is for demonstration purposes — real data comes from Supabase backend