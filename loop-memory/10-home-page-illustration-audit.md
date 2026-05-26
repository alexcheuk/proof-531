---
name: home-page-illustration-audit
description: Running checklist of UI-accuracy drifts between the home-page illustrations (apps/web/src/components/illustrations/*) and what the mobile app actually shows. Discord 1508769707 — "Alot of showcase on home page is not UI accurate". Tick items off as they're fixed.
---

# Home-page illustration audit — running drift list

Source of truth: `apps/mobile/src/features/session/components/*` and
`apps/mobile/src/design/primitives/*`. The home page's illustrations
must visually match what the app actually shows for the same screen.

## HeroPhone — `apps/web/src/components/illustrations/HeroPhone.astro`

### Frame A — SET phase (mid-set, AMRAP coming up)

- [x] (loop-033) **Eyebrow drift**: showed `TOP SET` + `95% · TM 365`
  (Home variant). Live's SetPhase uses a single eyebrow `On the bar ·
  95% TM`. Fixed: single-line eyebrow, no right-meta cell.

### Frame B — REST phase (PR variant)

- [x] (loop-033) **Wrong right-meta on NEXT SET block**: showed `e1RM
  412 · +27`. The actual rest-preview block uses `<pct>% · TM <n> lb`
  (RestPhase passes `pctLabel` + `tmLabel`). Fixed → `85% · TM 365 LB`
  and weight/reps adjusted to 310 × 3.
- [x] (loop-033) **PR + NEXT SET narrative inconsistency**: a PR can
  only happen on AMRAP (week-3 final working set), and after AMRAP
  there is no next working set — BBB is next. The illustration
  showed a PR-styled rest with a NEXT SET preview, which is
  impossible in the actual state machine. Fixed: Frame B is now a
  non-PR rest between working sets (eyebrow `SET COMPLETED`,
  headline `Rest.`, no amber on the eyebrow). The PR celebration
  moves to Frame C only.
- [ ] **Rest controls**: actual app shows -30s / +30s / Skip. Confirm
  current text is correct; loop-033 did not retouch.
- [x] (loop-034) **Plate decomposition didn't match the prescribed
  weight after the loop-033 caption fix.** Set the next-set caption
  to `75% · TM 365 LB` + 275 × 5 and the plates to `[45, 45, 25]`
  (per side 115, total 275). Frame B is now consistently a rest
  before week-3 set 1.

### Frame C — PR celebration

- [x] (loop-034) **e1RM number consistency**. Loop-033 left Frame C
  showing `412` e1RM + `+27` delta vs prev `385`. But 412 isn't a
  valid Epley output for any integer rep count at weight 345 (would
  need ~5.83 reps). Fixed by picking clean numbers: 345 × 6 reps →
  e1RM 414 (factor 1.200 exact), delta +29 vs prev 385. The same
  numbers now match Frame D's receipt and the AmrapMath formula
  card.
- [ ] Spacing/proportions vs the real PrCelebrationScreen weren't
  compared side by side this loop. Done in spirit (the screen's
  fields are present), but a pixel-pass against a live screenshot
  is still owed.

### Frame D — Session complete

- [x] (loop-034) **Receipt math agrees with the scenario**. Updated
  top set to `345 × 6+`, e1RM to `414`, volume to `4,375` lb
  (= 275×5 + 310×3 + 345×6 — the actual working-set volume for a
  week-3 deadlift session with TM 365). BBB row `185 × 5×10` is
  already correct (50% × 365 = 182.5 → 185).
- [ ] DateStamp + masthead pixel pass vs the real
  SessionCompleteScreen still owed.

## AmrapMath — `apps/web/src/components/illustrations/AmrapMath.astro`

- [x] (loop-034) **Headline equation didn't compute.** Showed
  `345 × (1 + 4 / 30) = 412`. But `345 × 34/30 = 391`, not 412. The
  formula cell, the output cell, and the prior-best delta all
  lied. Fixed: 345 × (1 + 6/30) = 414, factor 1.200, delta +29 vs
  prior best 385. The first tape row updated to match (`345×6`,
  e1rm 414, +29). Other tape rows already computed correctly.

## Other illustrations

- `PlateBar.astro` — primitive itself is faithful to the mobile
  PlateBar (matching size ramp, plate ordering, PER SIDE caption
  format, ON THE BAR readout).
  - [x] (loop-036) Home-page usage had `label="WORKING · SET 03 ·
    AMRAP"`, which doesn't appear anywhere in the mobile app and
    also violated the "no leading-zero numbers" rule from Discord
    1508668998. Replaced with `ON THE BAR · 95% TM` (the actual
    SetPhase eyebrow during a 95% AMRAP working set).
- `SessionTape.astro` — meant to abstract the session flow. Less
  literal; check that the labels still match user-visible feature
  names. Not audited this loop.
- `AmrapMath.astro` — covered in loop-034 (formula correctness).
- `WeekLedger.astro` — four-week cycle illustration. Per-week
  schemes (5/5/5+ → 3/3/3+ → 5/3/1+ → deload 5/5/5) verified
  against `domain/schemes.ts` in loop-036 — all correct.
  - [x] (loop-036) Lift row label `OHP` was the only drift; the
    mobile app surfaces `Press` everywhere (the type itself is
    `'press'` and `liftDisplayName('press')` returns `'Press'`).
    Fixed.
- `MastheadStrip.astro` — branding strip; should match the actual
  Masthead's typography. Not audited this loop.

## Process for the next audit pass

1. Boot the mobile app, screenshot the matching screen for each
   illustration.
2. Open the illustration's `.astro` file side by side.
3. Tick the unchecked items above; add new entries as drift is
   spotted.

When all items here are ticked, delete this file — the drift would
need to keep reappearing for it to be worth the running log.
