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

### Frame C — PR celebration

- [ ] Not audited this loop. The mobile screen uses corner ticks +
  "YOU HIT A NEW PR" eyebrow + "Stronger." headline + estimated-1RM
  hero row + prev/delta compare row. The illustration mirrors this
  structure but exact spacing/proportions weren't compared side by
  side.

### Frame D — Session complete

- [ ] Not audited this loop. The masthead, "In the book." headline,
  date stamp, and receipt rows are present; exact field lineup
  vs. the actual receipt (top set, e1RM, volume, BBB, elapsed)
  needs a side-by-side check.

## Other illustrations

- `PlateBar.astro` — should match `src/design/primitives/PlateBar/`.
  Not audited this loop.
- `SessionTape.astro` — meant to abstract the session flow. Less
  literal; check that the labels still match user-visible feature
  names.
- `AmrapMath.astro` — the Epley formula illustration. Verify the
  numbers shown match what the app would compute.
- `WeekLedger.astro` — four-week cycle illustration. Verify the
  per-week percentages + the "deload" framing match the actual
  schemes table.
- `MastheadStrip.astro` — branding strip; should match the actual
  Masthead's typography.

## Process for the next audit pass

1. Boot the mobile app, screenshot the matching screen for each
   illustration.
2. Open the illustration's `.astro` file side by side.
3. Tick the unchecked items above; add new entries as drift is
   spotted.

When all items here are ticked, delete this file — the drift would
need to keep reappearing for it to be worth the running log.
