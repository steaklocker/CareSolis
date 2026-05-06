CARESOLIS RTM CONDITION CATEGORY FIX — FIGMA DESIGN PROMPT
============================================================

CONTEXT
-------
This is an UPDATE to the RTM Billing Dashboard currently being built in Figma. The existing enrollment modal captures patient demographics, provider info, NPI, and consent — but it is MISSING a critical field: the patient's RTM monitoring condition category. Without this field, the system cannot assign the correct CPT device supply code, and claims will be denied.

This prompt adds the condition category selector to the enrollment workflow and updates the patient compliance cards and export to reflect the selected condition.


CHANGE 1: ADD CONDITION CATEGORY TO ENROLLMENT MODAL
-----------------------------------------------------

Location: Inside the "Enroll Patient in RTM" modal, between the "Medical Record Number" field and the "Ordering Provider" section.

Add a new section with a divider line above it:

Section label: "RTM Monitoring Condition"
Helper text below label: "Select the patient's primary condition being monitored. This determines which CPT device supply code (98976, 98977, or 98978) will be assigned for billing."

Three selectable cards in a row (radio-style — only one can be selected):

CARD 1 — Musculoskeletal (MSK)
- Icon: 🦴
- Title: "Musculoskeletal"
- CPT badge: "98977" in monospace
- Description: "Arthritis, osteoporosis, chronic pain, post-surgical rehab, fibromyalgia, gout, joint/bone/muscle conditions"
- Below description, smaller text: "Common meds: NSAIDs, DMARDs, muscle relaxants, bisphosphonates, corticosteroids"
- Selected state: emerald border, emerald-50 background

CARD 2 — Respiratory
- Icon: 🫁
- Title: "Respiratory"
- CPT badge: "98976" in monospace
- Description: "Asthma, COPD, chronic bronchitis, pulmonary fibrosis, breathing conditions"
- Below description, smaller text: "Common meds: Bronchodilators, inhaled corticosteroids, leukotriene modifiers"
- Selected state: emerald border, emerald-50 background

CARD 3 — Cognitive Behavioral
- Icon: 🧠
- Title: "Cognitive Behavioral"
- CPT badge: "98978" in monospace
- Description: "Depression, anxiety, substance abuse, PTSD, behavioral health conditions"
- Below description, smaller text: "Common meds: SSRIs, SNRIs, antipsychotics, mood stabilizers, buprenorphine"
- Selected state: emerald border, emerald-50 background

Unselected card state: slate-200 border, white background
This field is REQUIRED — the "Enroll in RTM" button remains disabled until a condition category is selected.

Validation logic note (for developers):
- If MSK selected → auto-assign CPT 98977 for device supply billing
- If Respiratory selected → auto-assign CPT 98976 for device supply billing  
- If Cognitive Behavioral selected → auto-assign CPT 98978 for device supply billing
- The 2026 partial-engagement codes follow the same condition mapping:
  - MSK partial → 98985 (2-15 days)
  - Respiratory partial → 98984 (2-15 days)
  - Cognitive Behavioral partial → 98986 (2-15 days)


CHANGE 2: ADD CONDITION INDICATOR TO PATIENT COMPLIANCE CARDS
--------------------------------------------------------------

Location: On each patient card in the RTM Dashboard view, next to the patient name.

Add a small pill-shaped badge showing the patient's condition category:

- MSK patients: badge with "🦴 MSK" text, slate-100 background, slate-600 text
- Respiratory patients: badge with "🫁 RESP" text, slate-100 background, slate-600 text  
- Cognitive Behavioral patients: badge with "🧠 CBT" text, slate-100 background, slate-600 text

This badge appears on the same line as the patient name, right-aligned from the name or immediately after it.

Additionally, in the CPT code badges row at the bottom of each patient card, the device supply code shown should now reflect the condition:
- MSK patient showing 98977 (full) or 98985 (partial)
- Respiratory patient showing 98976 (full) or 98984 (partial)
- Cognitive Behavioral patient showing 98978 (full) or 98986 (partial)

Update the mock patient data to show variety:
- Margaret Chen: 🦴 MSK (arthritis medications)
- Robert Williams: 🫁 RESP (COPD medications)
- Dorothy Nakamura: 🧠 CBT (dementia/behavioral medications)
- James Patterson: 🦴 MSK (Parkinson's-related pain medications)


CHANGE 3: UPDATE THE COMPLIANCE DASHBOARD DAYS TRACKER
-------------------------------------------------------

Location: Inside each patient card, the "Days with Data" progress ring area.

The status text below the progress ring currently reads:
  "✓ Full tier (98977)" or "◐ Partial tier (98985)"

This needs to be DYNAMIC based on the patient's condition category:

For MSK patients:
  "✓ Full tier (98977)" if 16+ days
  "◐ Partial tier (98985)" if 2-15 days

For Respiratory patients:
  "✓ Full tier (98976)" if 16+ days
  "◐ Partial tier (98984)" if 2-15 days

For Cognitive Behavioral patients:
  "✓ Full tier (98978)" if 16+ days
  "◐ Partial tier (98986)" if 2-15 days


CHANGE 4: UPDATE THE EXPORT BILLING PANEL
-------------------------------------------

Location: In the Export Billing tab, the terminal-style export preview.

The export output should now include the condition category and the correct condition-specific device supply code:

  // CareSolis RTM Billing Export — [Date]
  // Remote Therapeutic Monitoring (RTM) — CY 2026 CMS Final Rule
  
  PATIENT: Margaret Chen (MRN: CS-10042) [MSK]
    CPT 98975 — $22.00 — Initial setup & education
    CPT 98977 — $40.08 — MSK device supply, 22/16 days — full
    CPT 98980 — $52.00 — Treatment mgmt, 35 min — full
    SUBTOTAL: $114.08
  
  PATIENT: Robert Williams (MRN: CS-10087) [RESP]
    CPT 98984 — $47.00 — Respiratory device supply, 12 days — partial (2026)
    CPT 98979 — $33.40 — Treatment mgmt, 15 min — partial (2026)
    SUBTOTAL: $80.40

  PATIENT: Dorothy Nakamura (MRN: CS-10103) [CBT]
    CPT 98986 — [rate TBD] — CBT device supply, 8 days — partial (2026)
    ** BLOCKED: No interactive communication logged **
    SUBTOTAL: $0.00


CHANGE 5: UPDATE THE CPT CODE REFERENCE TAB
---------------------------------------------

Location: The CPT Code Reference tab currently lists 6 codes. It needs to be expanded to show the full RTM code set organized by category.

Reorganize the reference table with section headers:

SECTION: Setup (All Conditions)
- 98975 | Initial Setup & Education | $22.00 | Once per episode

SECTION: Device Supply — Musculoskeletal
- 98977 | MSK Device Supply, 16-30 days | $40.08 | Per 30-day period
- 98985 [NEW 2026] | MSK Device Supply, 2-15 days | $40.08 | Per 30-day period

SECTION: Device Supply — Respiratory  
- 98976 | Respiratory Device Supply, 16-30 days | $47.00 | Per 30-day period
- 98984 [NEW 2026] | Respiratory Device Supply, 2-15 days | $47.00 | Per 30-day period

SECTION: Device Supply — Cognitive Behavioral
- 98978 | CBT Device Supply, 16-30 days | [rate — verify with Jelene] | Per 30-day period
- 98986 [NEW 2026] | CBT Device Supply, 2-15 days | [rate — verify with Jelene] | Per 30-day period

SECTION: Treatment Management (All Conditions)
- 98979 [NEW 2026] | Treatment Mgmt 10-19 min | $33.40 | Per month
- 98980 | Treatment Mgmt 20+ min | $52.00 | Per month
- 98981 | Additional 20-min blocks | $41.00 | Per month (add-on)

Add a note below the table:
"⚠ Rates shown are national averages from the CY 2026 Medicare Physician Fee Schedule. Actual payment varies by geographic locality (GPCI) and Medicare Administrative Contractor (MAC). Rates for CBT device supply codes (98978, 98986) require verification. Consult your billing specialist for location-specific rates."

SECTION: Mutual Exclusion Rules
Add a clearly visible rules box (amber-50 background, amber border):

"BILLING RULES — Claims will be denied if violated:
• 98977 and 98985 CANNOT be billed in the same 30-day period (MSK full vs partial — pick one)
• 98976 and 98984 CANNOT be billed in the same 30-day period (Respiratory full vs partial — pick one)
• 98978 and 98986 CANNOT be billed in the same 30-day period (CBT full vs partial — pick one)
• 98979 and 98980 CANNOT be billed in the same calendar month (10-19 min vs 20+ min — pick one)
• RPM and RTM CANNOT be billed for the same patient in the same calendar month
• Only ONE clinician may submit RTM claims per patient per 30-day period
• Treatment management codes (98979, 98980, 98981) require at least one real-time synchronous phone or video call with patient or caregiver. Text and email do NOT qualify."


CHANGE 6: ADD CONDITION-BASED FILTERING TO DASHBOARD
------------------------------------------------------

Location: Above the patient cards list on the RTM Dashboard tab.

Add a filter row with small toggle buttons:

"Filter by condition:" [All] [🦴 MSK] [🫁 RESP] [🧠 CBT]

- "All" is selected by default (shows all patients)
- Selecting a condition filters the patient list
- The summary metrics row at the top should update to reflect the filtered view
- Active filter button has emerald background, white text
- Inactive filter buttons have slate-100 background, slate-600 text


DESIGN NOTES
------------
- All colors, fonts, and spacing follow the existing CareSolis design system (slate/emerald/rose palette)
- The condition category selector cards in the enrollment modal should be roughly the same height and follow the same interactive pattern as the activity type cards in the provider activity logger
- The condition badges on patient cards should be visually subtle — they're reference information, not the primary focus
- Rates marked as "verify with Jelene" or "[rate TBD]" are intentional — these need expert confirmation before being hardcoded
- This update does NOT change the overall layout or navigation — it adds a required data point and propagates it through the existing screens