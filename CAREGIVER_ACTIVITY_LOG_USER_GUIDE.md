# Caregiver Activity Log - User Guide

**Feature:** FDA-Compliant Caregiver Activity Verification Log  
**Version:** 1.0  
**Last Updated:** May 2, 2026

---

## Quick Start

### Accessing the Caregiver Activity Log

1. Navigate to **Escalation Log** from the main menu
2. Click the **"Caregiver Activity Log"** tab
3. Select a caregiver from the dropdown (or view "All Caregivers")
4. Review logged activity and metrics

---

## Feature Overview

The **Caregiver Activity Log** provides a factual record of caregiver actions and escalation responses for verification and audit purposes.

### What This Feature Does:

✅ **Records** caregiver actions with timestamps  
✅ **Displays** escalations received and acknowledged  
✅ **Calculates** average response durations  
✅ **Exports** activity logs to CSV for documentation  
✅ **Filters** by specific caregiver or date range  

### What This Feature Does NOT Do:

❌ Evaluate caregiver performance or quality  
❌ Make clinical recommendations  
❌ Rank or compare caregivers  
❌ Make autonomous decisions  

---

## User Interface Guide

### Tab Navigation

```
┌─────────────────────────────────────────────┐
│ [System Activity] [Caregiver Activity Log]  │
└─────────────────────────────────────────────┘
```

**System Activity Tab:**
- Shows all system events (escalations, notifications, verifications)
- Default view

**Caregiver Activity Log Tab:**
- Shows only caregiver-related actions
- Includes activity summary metrics
- Provides caregiver filter dropdown

---

## Caregiver Filter

**Location:** Top of Caregiver Activity Log tab

**Options:**
- **All Caregivers** - Shows all logged caregiver activity
- **[Individual Names]** - Filters to specific caregiver (e.g., "Martha Kane")
- **Resident/Guest** - Shows manual verifications and guest check-ins

**How to Use:**
1. Click the dropdown menu
2. Select desired caregiver
3. View updates automatically
4. Export filtered results if needed

---

## Activity Summary Metrics

Four metric cards display factual statistics:

### 1. Total Logged Events
**What it shows:** Count of all logged events for selected caregiver  
**Example:** "24 Events Recorded"  
**Note:** Includes escalations, acknowledgments, and interventions

### 2. Escalations Received
**What it shows:** Number of escalation notifications sent to caregiver  
**Example:** "12 Received"  
**Note:** Count of alerts sent, not a measure of quality

### 3. Actions Logged
**What it shows:** Number of interventions or acknowledgments recorded  
**Example:** "12 Interventions"  
**Note:** Factual count of logged actions

### 4. Average Duration
**What it shows:** Mean time from escalation to acknowledgment  
**Example:** "8m (10 samples)"  
**Note:** Mathematical average with sample size shown

**Important:** If no response pairs are found, displays "—" to avoid misleading zeros.

---

## Event Timeline

Below the metrics, you'll see a chronological list of logged events:

**Event Types:**
- 🔔 **Escalation Notifications** - Alerts sent to caregiver
- ✅ **Acknowledgments** - Caregiver confirmed escalation
- 👤 **Guest Verifications** - Manual check-in by caregiver/guest
- 🔄 **Interventions** - Actions taken (re-present dose, mark missed)

**Each Event Shows:**
- Date & Time (timestamp)
- Action Type
- Recipient/Actor
- Event Details

---

## Search Functionality

**Location:** Search box at top of log

**How to Use:**
1. Type search term (name, action type, etc.)
2. Results filter automatically
3. Search applies to current tab only

**Search Tips:**
- Search by caregiver name (e.g., "Martha")
- Search by action type (e.g., "Acknowledged")
- Search by date (e.g., "May 2")
- Clear search to reset view

---

## Export to CSV

### Basic Export

**Steps:**
1. Select desired tab (System or Caregiver)
2. Apply filters (caregiver, date, search)
3. Click **"Export CSV"** button
4. File downloads automatically

### Export File Names

**System Tab:**
```
caresolis_system_log_2026-05-02.csv
```

**Caregiver Tab:**
```
caresolis_caregiver_activity_Martha_Kane_2026-05-02.csv
```

### CSV Contents

**Headers:**
```
ID, Timestamp, Type, Message, Recipient, Actor, Date, Time
```

**FDA Compliance Disclaimer (in CSV file):**
```
# CARESOLIS CAREGIVER ACTIVITY LOG - FDA CLASS II MEDICAL DEVICE
# Export Date: [timestamp]
# Caregiver Filter: [name]
# Total Records: [count]
# NOTICE: This log records caregiver actions for verification purposes only.
# It does not evaluate caregiver performance or make clinical recommendations.
```

**Note:** The disclaimer is embedded as CSV comments and will be visible when opening the file in a text editor or Excel.

---

## Authorized Use Cases

### ✅ You MAY Use This Feature For:

**Audit Trail Verification**
- Confirming caregiver received escalation
- Verifying timestamp of response
- Documenting action taken
- HIPAA compliance audits

**Staffing Documentation**
- Recording which caregiver was on duty
- Logging shift handoff details
- Maintaining care continuity records

**Regulatory Compliance**
- State inspection documentation
- Insurance claim verification
- Quality assurance reviews

**Workflow Research**
- Aggregated workflow analysis
- System optimization studies
- Protocol refinement (anonymized data)

### ❌ You MUST NOT Use This Feature For:

**Performance Evaluations**
- Individual caregiver reviews
- Hiring/firing decisions
- Promotion considerations
- Disciplinary actions

**Clinical Decision-Making**
- Selecting which caregiver to contact during emergency
- Routing escalations based on response time
- Care plan modifications

**Automated Management**
- Auto-scheduling based on "best responders"
- Removing caregivers from rotation
- Bonus/penalty calculations

---

## Understanding the Metrics

### Response Time Calculation

**What it measures:** Time from escalation sent to acknowledgment logged

**How it's calculated:**
1. Find escalation notification in logs
2. Find next acknowledgment action
3. Calculate time difference in minutes
4. Average all valid pairs

**Safeguards:**
- Only pairs within 2-hour window (filters outliers)
- Sample size shown for transparency
- Shows "—" if insufficient data

**What it DOES NOT measure:**
- Quality of caregiver
- Effectiveness of intervention
- Patient outcome

### Sample Size Importance

**Why we show it:** Transparency in statistical calculations

**Example Interpretations:**
- "8m (10 samples)" - Reliable average from 10 data points
- "5m (2 samples)" - Limited data, may not be representative
- "—" - No data available

**Note:** Small sample sizes (<5) should be interpreted cautiously.

---

## FDA Compliance Notices

### Primary Notice (Top of Tab)

Displayed prominently at top of Caregiver Activity Log tab:

```
⚠️ FDA Class II Medical Device - Verification Log

This summary displays logged caregiver actions for audit and 
verification purposes only. It does NOT evaluate caregiver 
performance, make clinical recommendations, or replace licensed 
healthcare provider oversight. All clinical decisions remain with 
authorized medical personnel. Metrics shown are factual 
calculations only.
```

### Footer Notice (Bottom of Page)

Displayed when caregiver activity data is present:

```
ℹ️ Verification Log Notice: Response times and action counts 
are calculated from logged timestamps for documentation purposes. 
These metrics do not constitute performance evaluations or quality 
assessments. Device-verified adherence data remains the 
authoritative source for patient medication compliance.
```

**Important:** These notices are **required** for FDA compliance. Do not minimize or dismiss them.

---

## Troubleshooting

### "No Caregiver Activity Found"

**Possible Causes:**
- No caregiver actions logged in selected time period
- Caregiver name filter too restrictive
- Search query excluding all results

**Solutions:**
1. Click "Clear All Filters" button
2. Select "All Caregivers" from dropdown
3. Check date range
4. Verify caregiver name spelling

### "—" Displayed for Average Duration

**Meaning:** Insufficient data to calculate meaningful average

**Possible Causes:**
- No escalation/acknowledgment pairs found
- All response times outside 2-hour window (outliers filtered)
- Selected caregiver has no response data

**Not an Error:** This is intentional to avoid misleading zeros.

### CSV Export Shows "#" Characters

**Meaning:** Compliance disclaimer embedded as CSV comments

**Normal Behavior:** Lines starting with "#" are comment headers containing:
- Export metadata
- FDA compliance notices
- Filter information

**Can Be Ignored:** If importing to spreadsheet, these lines can be skipped or deleted.

---

## Best Practices

### For Caregivers

1. **Review Your Own Activity**
   - Filter to your name
   - Verify logged actions are accurate
   - Report any discrepancies to admin

2. **Understand the Metrics**
   - Metrics are factual only, not evaluative
   - Use for self-awareness, not stress
   - Contact supervisor if questions arise

3. **Export for Your Records**
   - Download monthly activity logs
   - Keep for personal documentation
   - Use for shift handoff notes

### For Administrators

1. **Routine Audits**
   - Monthly export for compliance records
   - Verify all caregivers have logged activity
   - Check for system gaps (not caregiver quality)

2. **Workflow Optimization**
   - Look for aggregate patterns (not individuals)
   - Identify system bottlenecks
   - Adjust protocols based on data

3. **Regulatory Documentation**
   - Export before state inspections
   - Include in HIPAA audit packages
   - Maintain in secure compliance folder

4. **Staff Training**
   - Review authorized vs prohibited uses
   - Emphasize verification-only purpose
   - Train on FDA compliance requirements

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Focus Search | `/` |
| Next Page | `→` or `n` |
| Previous Page | `←` or `p` |
| Export CSV | `e` |
| Clear Search | `Esc` |

**Note:** Keyboard shortcuts coming in future update.

---

## Frequently Asked Questions

### Q: Can I use this data for performance reviews?

**A: No.** This feature is **FDA-compliant verification log only**. Using it for performance evaluations would violate Class II medical device regulations and could jeopardize device certification. Performance reviews must use separate, non-device systems.

### Q: Why does average response time differ from what I calculated?

**A: Response time calculation includes safeguards:**
- Only pairs within 2-hour window (filters outliers)
- Excludes mismatched escalation/ack pairs
- Mathematical mean (not median or mode)

If you believe calculation is incorrect, export CSV and verify timestamps manually.

### Q: Can I add more metrics (e.g., "Fastest Responder")?

**A: No.** Adding comparative or evaluative metrics would violate FDA compliance. Only factual, neutral metrics are permitted. Contact development team before requesting any changes.

### Q: Is this data HIPAA-compliant?

**A: Yes.** All caregiver activity logs are:
- Encrypted in transit and at rest
- Access-controlled by user role
- Audit-trailed with timestamps
- Exportable for compliance purposes

However, ensure CSV exports are stored securely and not shared improperly.

### Q: What if I see suspicious activity in the log?

**A:** Report to your supervisor immediately. Examples:
- Escalation sent but no acknowledgment logged
- Acknowledgment without corresponding escalation
- Timestamps that don't make sense (future dates)
- Duplicate entries with same ID

Do not attempt to delete or modify logs.

---

## Support & Feedback

### Technical Issues

**If you encounter:**
- Page not loading
- Export not working
- Data appearing incorrect
- Filter not responding

**Contact:**
- Email: support@caresolis.com
- Phone: (555) 123-4567
- Submit ticket: help.caresolis.com

### Compliance Questions

**If you have questions about:**
- Authorized vs prohibited uses
- FDA compliance requirements
- Data retention policies
- Export procedures

**Contact:**
- Compliance Officer: compliance@caresolis.com
- Phone: (555) 123-4568

### Feature Requests

**Before submitting:**
- Review FDA compliance documentation
- Ensure request maintains factual, neutral metrics
- Avoid evaluative or comparative features

**Submit to:**
- Product Feedback: feedback@caresolis.com
- Subject Line: "Caregiver Activity Log - Feature Request"

---

## Version History

### v1.0 - May 2, 2026
- ✅ Initial release
- ✅ Caregiver filter dropdown
- ✅ Activity summary metrics (4 cards)
- ✅ Enhanced CSV export with disclaimers
- ✅ FDA compliance notices
- ✅ Search functionality
- ✅ Tab navigation (System | Caregiver)

### Planned Updates

**v1.1 (Q3 2026):**
- Date range picker
- Median response time metric
- Timezone-aware timestamps
- PDF export option

**v1.2 (Q4 2026):**
- Shift breakdown (day/night)
- Escalation level grouping (L1, L2, L3)
- Export templates for inspections

---

## Quick Reference Card

### Accessing Feature
`Main Menu → Escalation Log → Caregiver Activity Log Tab`

### Key Metrics
- **Total Logged** - Event count
- **Escalations** - Alerts sent
- **Actions** - Interventions recorded
- **Avg Duration** - Mean response time

### Export CSV
`Click "Export CSV" → File downloads with FDA disclaimer`

### Filter Caregiver
`Dropdown → Select Name → View Updates`

### Clear Filters
`Click "Clear All Filters" → Reset to default view`

### Compliance Reminder
✅ Verification log only  
❌ Not for performance reviews  

---

**END OF USER GUIDE**
