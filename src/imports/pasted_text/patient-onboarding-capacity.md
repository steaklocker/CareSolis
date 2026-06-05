**Vitamins: don't exclude them — your instinct is backwards here.** Strip-pouch programs include scheduled supplements as standard practice; that's the whole point of the format ("everything you take at 8am is in the 8am pouch"). Pulling vitamins out defeats adherence, confuses the patient, and you'd lose the fight anyway — the prescriber may order them and the pharmacy has margin reasons to pouch them. CareSolis doesn't decide what goes in the pouch; the pharmacist does. Your job is to *accommodate and flag*, not to police contents.

The real problem isn't vitamins as a category — it's that supplements are disproportionately the **bulky** items that wreck your day-count. Fish oil softgels are among the largest things anyone swallows; big calcium and vitamin D softgels aren't far behind. So the catch is: your size-class table can't be Rx-only. It has to cover the common bulky OTCs too, because those are exactly what push a regimen under your 14-day floor. And the only legitimate "leave it out of the timed pouch" decision — when a once-daily fish oil is single-handedly killing capacity — is a *pharmacist's* call to bottle it separately, surfaced by your warning, never a CareSolis policy.

**Caliper:** a precision tool that measures thickness and diameter down to hundredths of a millimeter — a digital one runs ~$20–40. It's literally how Julian measures the true folded-pouch thickness and how you'd measure the bulky pills to seed the size-class table with real numbers instead of estimates.

Now the prompt.

## Figma Make Prompt — Patient Onboarding: Capacity Engine + Drug Lookup

> Build a **"Medications & Pouch Capacity"** step inside the patient onboarding flow of the Admin Dashboard. One shared component used by all admin roles (medical assistant / CareSolis admin / facility admin — role is a label only). Stack: React 18, Tailwind v4, Supabase. Match the existing app's dark theme and hummingbird branding. No localStorage; no AI in any calculation.
>
> **Medication entry (type-ahead + lookup):**
> - As the admin types a drug name, query NLM's public **RxNav / RxNorm REST API** (rxnav.nlm.nih.gov) using the approximate-term / spelling-suggestion endpoints for autocomplete, and resolve the selection to its **RxCUI, normalized name, strength, and dose form (tablet vs capsule)**.
> - Allow a **manual add** path for items RxNorm doesn't return (compounded meds, store-brand supplements). Supplements/OTC vitamins are first-class regimen items — they go in the pouch like anything else.
> - On resolve, look up the RxCUI in a Supabase table `med_size_class (rxcui, name, form, size_class, source, verified)`. Auto-fill **size class: Small / Standard / Large / XL**. Default to **Standard** if absent, show an "unverified" flag, and write the unmatched RxCUI to a `needs_classification` queue. Size class is editable by the admin.
>
> **Per regimen item, capture:** dose times (multi-select: Morning / Noon / Evening / Bedtime / custom HH:MM) and pills-per-dose (integer). Group items sharing a dose time into one **dose event = one pouch/day**.
>
> **Capacity logic (deterministic, conservative, round days down):**
> ```
> MAGAZINE_NAMEPLATE_POUCHES = 52     // configurable — confirm against real hardware
> SAFETY_FACTOR = 0.9
> BULK_DERATE by worst pill class across all pouches:
>     Small/Standard -> 1.0 | Large -> 0.85 | XL -> 0.70
>
> usablePouches      = floor(MAGAZINE_NAMEPLATE_POUCHES × SAFETY_FACTOR × BULK_DERATE)
> pouchesPerDay      = count of distinct dose times that contain ≥1 item
> maxDays            = floor(usablePouches / pouchesPerDay)
> recommendedFillDays = min(maxDays, 28)
> pouchesToOrder     = pouchesPerDay × recommendedFillDays
> ```
> Do **not** sum thickness per pill, and do **not** apply any separate depth cap — bulk is handled solely by the derate until caliper-measured constants exist.
>
> **Output panel (updates live as items are entered):**
> - "This patient fits up to **{maxDays} days** per fill."
> - "Recommended fill cycle: **{recommendedFillDays} days**." / "Pouches to order: **{pouchesToOrder}**."
> - Dose-schedule preview: pouches/day and which meds fall in each pouch.
> - **Warning state if maxDays < 14**, naming the culprit — e.g. "A bulky item (fish oil) is cutting capacity to {N} days. The pharmacist may consider dispensing it separately." Do not auto-remove anything; this is a flag for the pharmacist.
> - Small persistent note: capacity is conservative and estimated, pending device calibration.
>
> **Persistence:** write the full regimen + computed capacity to the Supabase patient record.

Two flags on this. The BULK_DERATE worst-class model is deliberately blunt — once Julian gives you caliper numbers for real folded pouches, swap it for a summed-per-pouch-thickness model and it gets precise; until then, conservative is correct. And seed `med_size_class` with the top-50 doc — that table *is* the database we talked about, so building the doc and wiring this prompt are the same job. Want me to build that seed table next?