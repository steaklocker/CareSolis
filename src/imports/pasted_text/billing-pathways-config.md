CARESOLIS STACKED BILLING MODULE — COMPLETE FIGMA DESIGN PROMPT
================================================================

CONTEXT
-------
This prompt EXTENDS the existing RTM Billing Dashboard already being built in Figma. CareSolis has identified that providers can bill MULTIPLE reimbursement codes for the same patient in the same month — RTM, CCM, BHI, and APCM can be stacked. Hero Health already shows this in their ROI calculator.

The CareSolis billing module needs to support all of these pathways, track eligibility for each, and show providers their total revenue opportunity per patient. This is the key differentiator — no competitor offers a unified billing dashboard that manages stacked codes from a single platform.

The existing RTM module (from prior Figma prompts) remains unchanged. This prompt ADDS new sections and modifies the dashboard to accommodate multiple billing pathways.

DESIGN SYSTEM: Same as existing — slate/emerald/rose calm palette, 14px border-radius cards, 8px spacing grid.


OVERVIEW OF BILLING PATHWAYS
-----------------------------
The module header "Clinical Operations — RTM Billing" should be renamed to:

  "Clinical Operations — Reimbursement Center"
  Subtitle: "RTM • CCM • BHI • APCM | Stacked Billing | CY 2026 CMS"

The tab navigation expands from 3 tabs to 5:

  📊 Billing Dashboard (renamed from "RTM Dashboard")
  📋 Code Reference (renamed, now covers all code families)
  📤 Export Billing (now exports all applicable codes)
  💰 Revenue Calculator (NEW — similar to Hero's ROI tool)
  ⚙️ Billing Settings (NEW — configure which pathways are active)


NEW SCREEN: BILLING SETTINGS TAB
----------------------------------
This screen lets the provider configure which billing pathways are active for their practice. Not every practice will bill every code.

Title: "⚙️ Billing Pathways — Configure Your Practice"
Subtitle: "Enable the reimbursement pathways your practice qualifies for. Each pathway has specific provider type and documentation requirements."

Four pathway cards in a 2x2 grid. Each card is toggleable (on/off switch in top-right corner).

CARD 1 — RTM (Remote Therapeutic Monitoring)
- Icon: 🩺
- Status toggle: ON/OFF (default ON)
- Codes: 98975, 98976, 98977, 98978, 98985, 98979, 98980, 98981
- Revenue potential: "$92-135/patient/month"
- Description: "Monitor medication adherence for MSK, respiratory, and cognitive behavioral conditions. Requires device data transmission and interactive communication."
- Eligible providers: "MD, DO, NP, PA, PT, OT, SLP"
- When ON: emerald border, emerald-50 background
- When OFF: slate-200 border, white background, greyed out text

CARD 2 — CCM (Chronic Care Management)
- Icon: 🫀
- Status toggle: ON/OFF (default OFF — requires provider to enable)
- Codes: 99490, 99439
- Revenue potential: "$74-128/patient/month"
- Description: "Care coordination for patients with 2+ chronic conditions. 20+ minutes of management per month. Can be billed ALONGSIDE RTM for the same patient."
- Eligible providers: "MD, DO, NP, PA (physician supervision required)"
- Requirement callout: "Patient must have 2+ chronic conditions. Requires separate patient consent for CCM."
- When ON: emerald border
- When OFF: slate-200 border

CARD 3 — BHI (Behavioral Health Integration)
- Icon: 🧠
- Status toggle: ON/OFF (default OFF)
- Codes: 99484
- Revenue potential: "$58.50/patient/month"
- Description: "Behavioral health integration for patients with psychiatric conditions managed alongside medical care. 20+ minutes of BHI services per month."
- Eligible providers: "MD, DO, NP, PA (must have behavioral health competency)"
- Requirement callout: "Patient must have qualifying behavioral health condition. Cannot bill with psychiatric collaborative care codes (99492-99494)."
- When OFF by default

CARD 4 — APCM (Advanced Primary Care Management)
- Icon: 🏥
- Status toggle: ON/OFF (default OFF)
- Codes: G0556, G0557, G0558
- Revenue potential: "$15-117/patient/month"
- Description: "Primary care management for chronic conditions. Tiered by patient complexity. Designed for primary care practices with ongoing patient relationships."
- Eligible providers: "Primary care physicians, NPs, PAs"
- Requirement callout: "Practice must meet APCM qualifying criteria. Cannot bill with CCM for same patient in same month."
- Note at bottom of card: "⚠ APCM and CCM are mutually exclusive for the same patient. Enable one or the other per patient."

Below the 4 cards, add a summary bar:
"Active pathways: [RTM] [CCM] — Estimated revenue potential: $166-263/patient/month"
(This updates dynamically based on which toggles are ON)


UPDATED SCREEN: BILLING DASHBOARD (Main View)
-----------------------------------------------
The patient compliance cards need to expand to show stacked billing status.

UPDATED SUMMARY METRICS ROW (now 5 cards instead of 4):

Card 1: "Est. Monthly Reimbursement (All Codes)" — total across all active pathways
Card 2: "RTM Revenue" — RTM codes only
Card 3: "CCM Revenue" — CCM codes only (shows $0 if CCM not enabled)
Card 4: "Billable Patients" — X/Y enrolled with eligible codes
Card 5: "Action Required" — patients needing attention (missing interactive comm, missing CCM consent, etc.)

UPDATED PATIENT COMPLIANCE CARDS:

Each patient card now shows a "Billing Stack" section below the existing RTM progress rings.

The Billing Stack is a horizontal row of mini-cards, one for each active pathway:

[RTM]          [CCM]           [BHI]          [APCM]
$92.08         $74.20          --             --
✓ Eligible     ✓ Eligible      Not enabled    Not enabled

Mini-card states:
- Eligible + billable: emerald-50 background, emerald border, dollar amount shown
- Eligible but blocked: amber-50 background, amber border, shows what's missing
- Not eligible: slate-50 background, slate-200 border, shows why
- Not enabled: white background, dashed slate-200 border, "Not enabled" text

Below the billing stack, show:
"TOTAL ESTIMATED: $166.28/month" (sum of all eligible codes)

For a patient with RTM + CCM enabled and eligible, the card might look like:

  Margaret Chen (MRN: CS-10042) [🦴 MSK]          Est: $166.28
  
  [Days: 22/16 ✓] [Minutes: 35/20 ✓] [📞 Interactive ✓]
  
  Billing Stack:
  [RTM $92.08 ✓] [CCM $74.20 ✓] [BHI -- off] [APCM -- off]

For a patient missing CCM consent:

  Robert Williams (MRN: CS-10087) [🫁 RESP]       Est: $73.48
  
  [Days: 12/16 ◐] [Minutes: 15/20 ◐] [📞 Interactive ✓]
  
  Billing Stack:
  [RTM $73.48 ◐ partial] [CCM ⚠ needs consent] [BHI -- off] [APCM -- off]


UPDATED SCREEN: PATIENT ENROLLMENT MODAL
------------------------------------------
Add a new section after the consent checkbox:

Section title: "Billing Pathways for This Patient"
Helper text: "Select which reimbursement pathways apply to this patient. Only enabled pathways (from Billing Settings) are shown."

Checkboxes (not radio — multiple can be selected):

☑ RTM — Remote Therapeutic Monitoring
  → Shows the condition category selector (MSK/Respiratory/CBT) from previous prompt
  → Required: RTM monitoring consent (already captured above)

☐ CCM — Chronic Care Management
  → When checked, reveals sub-fields:
    - "Does this patient have 2+ chronic conditions?" [Yes/No toggle]
    - "CCM consent obtained?" [Checkbox]
      Description: "Separate consent required for CCM. Patient must be informed that only one provider can bill CCM per month."
    - "Chronic Conditions (list):" [Text field]
      Placeholder: "e.g., Type 2 Diabetes, Hypertension, COPD"

☐ BHI — Behavioral Health Integration
  → When checked, reveals sub-fields:
    - "Qualifying behavioral health condition:" [Text field]
    - "BHI provider credentials confirmed?" [Checkbox]

☐ APCM — Advanced Primary Care Management
  → When checked, reveals:
    - APCM Level selector:
      ○ Level 1 (G0556) — 0-1 chronic conditions — $15/mo
      ○ Level 2 (G0557) — 2+ chronic conditions — $49/mo
      ○ Level 3 (G0558) — QMB with 2+ conditions — $117/mo
    - ⚠ Warning if CCM is also checked: "APCM and CCM cannot be billed for the same patient in the same month. Please select one."

Validation: If both CCM and APCM are checked, show a red warning and disable the Enroll button until one is deselected.


UPDATED SCREEN: PROVIDER ACTIVITY LOGGER
------------------------------------------
The activity logger needs to track which billing pathway each activity supports.

After the provider selects an activity type and enters duration, add:

"This activity supports:" [auto-checked based on activity type]
☑ RTM (treatment management time)
☑ CCM (care coordination time)
☐ BHI (behavioral health time)

The system should auto-check based on the activity:
- "Data Review" → RTM + CCM
- "Patient Call" → RTM + CCM + BHI (if applicable)
- "Care Plan Update" → RTM + CCM
- "Provider Coordination" → RTM + CCM
- "Video Consultation" → RTM + CCM + BHI
- "Clinical Documentation" → RTM + CCM

The provider can manually adjust these checkboxes if needed.

The session summary bar updates to show time allocation across pathways:
"This period: RTM 35 min (✓ 98980) | CCM 25 min (✓ 99490) | BHI 0 min"

Important: Some time can count toward BOTH RTM and CCM simultaneously — the same 20-minute patient call can satisfy both the RTM interactive communication requirement and contribute to CCM management time. The system should track this correctly without double-counting where prohibited.

⚠ FLAG FOR JELENE: Confirm whether overlapping time allocation between RTM and CCM is permitted by CMS, or whether time must be separately attributed. Design the UI to support both interpretations — show the allocation but allow Jelene to advise on the correct approach.


NEW SCREEN: REVENUE CALCULATOR TAB
-------------------------------------
This is CareSolis's answer to Hero's ROI calculator. It should be interactive and visually compelling.

Title: "💰 Revenue Calculator — See Your Reimbursement Potential"
Subtitle: "Estimate monthly and annual revenue based on your patient panel and enabled billing pathways."

INPUT SECTION (left side or top):

Slider or number input: "Total RTM Patients" (default: 50, range: 1-500)
Slider or number input: "% also eligible for CCM" (default: 60%, range: 0-100%)
Slider or number input: "% also eligible for BHI" (default: 15%, range: 0-100%)
Toggle: "APCM enabled?" (if yes, show level distribution)

Below inputs, show billing rate assumptions (editable):
- RTM billing success rate: 97% (default, based on Hero data)
- CCM billing success rate: 76% (default, based on Hero data)
- BHI billing success rate: 65% (default, estimate)
- APCM billing success rate: 80% (default, estimate)

OUTPUT SECTION (right side or below):

Large headline number: "Estimated Monthly Revenue: $X,XXX"
Below: "Estimated Annual Revenue: $XX,XXX"
Below: "Revenue Per Patient Per Month: $XXX"

Breakdown table:

  Code     | Description              | Patients | Rate    | Billing % | Monthly
  ---------|--------------------------|----------|---------|-----------|--------
  98975    | RTM Setup (1x)           | 50       | $22     | 100%      | $1,100*
  98976/77 | RTM Device Supply        | 50       | $40-53  | 100%      | $2,650
  98980    | RTM Treatment Mgmt       | 50       | $59.80  | 97%       | $2,900
  98981    | RTM Additional 20 min    | 50       | $43     | 45%       | $968
  99490    | CCM First 20 min         | 30       | $74.20  | 76%       | $1,692
  99439    | CCM Additional 20 min    | 30       | $54     | 43%       | $696
  99484    | BHI 20+ min              | 8        | $58.50  | 65%       | $304
  ---------|--------------------------|----------|---------|-----------|--------
  TOTAL    |                          |          |         |           | $10,310

  * Setup is one-time, amortized over 12 months for monthly display

Below the table, show a visual bar chart comparing:
"RTM Only" vs "RTM + CCM" vs "RTM + CCM + BHI" 
showing the revenue uplift from stacking codes.

At the bottom, a comparison callout:
"Your CareSolis platform cost: $149/mo device + $30/patient × 50 patients = $1,649/mo"
"Your estimated reimbursement: $10,310/mo"
"NET RETURN: $8,661/mo (5.3x ROI)"

DISCLAIMER (small text at bottom, matching Hero's approach):
"Revenue estimates are for informational purposes only. Actual reimbursement depends on proper coding, documentation, medical necessity, and payer policies. CareSolis does not guarantee coverage or reimbursement. Consult with payers regarding their specific policies. Rates shown are national averages and vary by locality."


UPDATED SCREEN: CPT CODE REFERENCE TAB
-----------------------------------------
Expand from RTM-only to all supported code families. Organize with section headers and visual grouping.

Title: "📋 Reimbursement Code Reference — All Supported Pathways"

SECTION: RTM — Remote Therapeutic Monitoring (98975-98981)
(Keep existing RTM code table from prior prompt, organized by condition category)

SECTION: CCM — Chronic Care Management
- 99490 | Non-complex CCM, first 20 min | ~$74.20/mo | Per calendar month
  "Care coordination for patients with 2+ chronic conditions. Requires patient consent. 20+ minutes of management time. Can be billed alongside RTM."
- 99439 | Additional CCM, each 20 min | ~$54/mo | Per calendar month (add-on)
  "Each additional 20-minute block beyond initial 20 minutes. Requires 99490 first."

SECTION: BHI — Behavioral Health Integration
- 99484 | BHI services, 20+ min | ~$58.50/mo | Per calendar month
  "Behavioral health integration for patients with psychiatric conditions managed alongside medical care. Cannot be billed with psychiatric collaborative care (99492-99494)."

SECTION: APCM — Advanced Primary Care Management
- G0556 | APCM Level 1 | ~$15/mo | Per calendar month
  "Patient with 0-1 chronic conditions. Primary care practices only."
- G0557 | APCM Level 2 | ~$49/mo | Per calendar month
  "Patient with 2+ chronic conditions. Primary care practices only."
- G0558 | APCM Level 3 | ~$117/mo | Per calendar month
  "QMB patient with 2+ chronic conditions. Primary care practices only."

SECTION: Other Compatible Codes (Future)
- G0438 | Annual Wellness Visit | ~$178/year | Annual
  "Comprehensive wellness visit. Not managed through CareSolis but compatible with all other pathways."

STACKING RULES BOX (amber-50 background, prominent):

"BILLING COMPATIBILITY RULES:
 ✓ RTM + CCM: CAN be billed together for the same patient, same month
 ✓ RTM + BHI: CAN be billed together for the same patient, same month
 ✓ RTM + APCM: CAN be billed together for the same patient, same month
 ✓ CCM + BHI: CAN be billed together for the same patient, same month
 ✗ CCM + APCM: CANNOT be billed together — choose one per patient
 ✗ RTM + RPM: CANNOT be billed together for the same patient, same month
 ✗ BHI + Psychiatric Collaborative Care (99492-99494): CANNOT be billed together
 ⚠ One clinician per code family per patient per month
 ⚠ All rates are CY 2026 national averages — verify with your MAC and billing specialist"

⚠ FLAG: "Stacking rules and code compatibility require verification by a qualified reimbursement specialist before implementation. Schedule confirmed with Jelene Roxas."


UPDATED SCREEN: EXPORT BILLING TAB
------------------------------------
The export now includes all applicable codes grouped by patient.

Export preview (terminal style) now shows:

  // CareSolis Reimbursement Export — [Date]
  // RTM + CCM + BHI | CY 2026 CMS | All Active Pathways
  
  PATIENT: Margaret Chen (MRN: CS-10042) [MSK] [CCM enrolled]
    RTM:
      CPT 98977 — $40.08 — MSK device supply, 22 days — full
      CPT 98980 — $52.00 — Treatment mgmt, 35 min — full
    CCM:
      CPT 99490 — $74.20 — CCM first 20 min (25 min logged)
    PATIENT TOTAL: $166.28
  
  PATIENT: Robert Williams (MRN: CS-10087) [RESP]
    RTM:
      CPT 98984 — $47.00 — Resp device supply, 12 days — partial (2026)
      CPT 98979 — $33.40 — Treatment mgmt, 15 min — partial (2026)
    CCM:
      ** NOT ENROLLED — patient has not consented to CCM
    PATIENT TOTAL: $80.40
  
  PERIOD TOTAL: $246.68
  
  RTM SUBTOTAL:  $172.48
  CCM SUBTOTAL:  $74.20
  BHI SUBTOTAL:  $0.00
  APCM SUBTOTAL: $0.00

Add export format options:
[Export as CSV] [Export as PDF] [Copy to Clipboard]

Add note: "Export formatted for EHR/practice management system import. Verify all codes and documentation before claim submission."


CONSENT MANAGEMENT ADDITION
-----------------------------
Add a small section to the patient detail view (or as a tab within the patient card):

"Patient Consents"
Shows status of each required consent:

  ✓ RTM Monitoring Consent — Signed 2026-03-01
  ✗ CCM Consent — Not obtained
    [Obtain CCM Consent] button
  -- BHI Consent — Not required (pathway not enabled)
  -- APCM Consent — Not required (pathway not enabled)

Each consent follows the existing FDA-compliant electronic signature workflow (NPI, timestamp, immutable audit trail, 21 CFR Part 11).

CCM consent must include:
- Only one provider can bill CCM per patient per month
- Patient can revoke at any time
- Description of CCM services provided


DESIGN NOTES
------------
- This is an EXTENSION of the existing RTM module, not a replacement
- All existing RTM functionality (condition categories, dual-tier tracking, interactive comm flagging) remains unchanged
- The stacked billing concept should feel simple to providers, not overwhelming — progressive disclosure is key
- Default state shows only RTM (the primary pathway). CCM, BHI, APCM appear only when enabled in Billing Settings
- The Revenue Calculator is a sales tool as much as a billing tool — it should be the screen you demo to prospective providers
- Mobile responsiveness is secondary — this is a desktop clinical tool
- All reimbursement rates should be displayed as editable fields or clearly marked as "national average — verify locally"
- Multiple items are flagged for Jelene verification — these should be visually marked in the design with a small amber indicator

⚠ RATES REQUIRING VERIFICATION WITH JELENE ROXAS:
- CCM 99490 rate ($74.20) — confirm current national average
- CCM 99439 rate ($54) — confirm current national average  
- BHI 99484 rate ($58.50) — confirm current national average
- APCM G-code rates ($15, $49, $117) — confirm and verify eligibility criteria
- RTM 98976 rate — Hero shows $53, our model uses $47 — which is correct for 2026?
- RTM 98980 rate — Hero shows $59.80, our model uses $52 — which is correct for 2026?
- Whether RTM and CCM time can overlap or must be separately attributed
- Whether CCM requires a separate patient consent from RTM consent
- Whether APCM is realistic for CareSolis's target provider types
- Billing success rates (97% RTM, 76% CCM, etc.) — are Hero's assumptions realistic?