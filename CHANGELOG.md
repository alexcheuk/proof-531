# Changelog

All notable changes to **531 Strength** are tracked here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
versioning is anchored against the EAS build channel (Expo Updates / preview)
since the app has not yet shipped a tagged App Store release. Each "Unreleased
build N" section covers what landed on `main` between two preview builds.

## [Unreleased]

### Added
- **BBB on the receipt** — the session-complete receipt now shows a "BBB"
  row (e.g. `150 lb · 5×10`) when the user marked the back-off work
  complete on the prompt screen. Conditional — the
  "Skip · close the day" path leaves the receipt clean, since there's
  nothing to show.
- **BBB sets are logged** — tapping "Mark BBB complete" on the post-AMRAP
  prompt screen writes 5 `kind: 'bbb'` set_logs (10 reps each at 50% TM).
  The History tab's lifetime-volume stat now counts every BBB set the
  user has actually moved, not just the 5/3/1 working sets + AMRAP.
  "Skip · close the day" still bypasses the writes — the honest "I did
  the AMRAP but skipped the back-off work today" path.
- **Separate BBB rest target** — Settings → Rest target now has two rails:
  "Working sets" (default 3:00) and "BBB sets" (default 1:30). BBB is
  5×10 at 50% TM and was over-resting on the same 3-min default as the
  working sets. `bbbRestTargetSeconds` is an additive `settings` column;
  existing installs receive it via `ALTER TABLE ADD COLUMN` on next boot.
  BbbPromptScreen and TodayBody's BBB band both read the new field.

### Fixed
- **Lifetime volume refresh** — `useLiveScreenEffects`'s session-surface
  invalidator now hits `LIFETIME_VOLUME_KEY` on every session close, so
  the History tab's volume stat updates the moment the day finishes.
  Previously the stat read from a stale cache until something else
  invalidated it.
- **App icon + splash · real 531 wordmark** — copied the canonical PWA mark
  (`~/Development/531-pwa/public/icons/icon-512.png` + the maskable variant)
  into `apps/mobile/assets/images/`. Replaces the placeholder Expo "A" icon.
- **`scripts/sync-pwa-assets.sh`** — one-command sync of the PWA brand
  assets into the mobile app's images dir. Safe to re-run.
- **PR Celebration · loading skeleton** — pre-data state now shows a paper-
  tint placeholder for the eyebrow + hero number instead of a half-empty
  screen with only the "Stronger." headline.

### Fixed
- **Sheet vertical-stack CTA gap closed** — `SheetLayout` previously rendered
  primary + cancel as separate flex children of the body, so the body's
  `gap` opened a hairline between an outlined cancel and its primary CTA
  (whose `borderTopWidth: 0` was designed to sit flush against the
  primary). Wrapped the action pair in a no-gap container.

### Changed
- **PR Certificate animation snappier** — 220ms with damping(14) +
  stiffness(220) on the panel; 240ms staged reveals on the celebration
  screen. Old 420ms damping(18) felt like it was drifting in.
- **PRCertificate panel · `PaperCapsText` primitive** extracted — every
  certificate sub-component (`HeroNumberRow`, `ComparisonRow`,
  `SignOffRow`, the panel eyebrow) was duplicating the same mono-uppercase
  paper-tint styles. They now share one primitive with `eyebrow / label /
  unit / caption` variants and `paper / paper-65 / paper-55 / paper-45`
  tones.

### Fixed
- **Sheet backgrounds unified** — `SheetLayout` bodies were painting in
  `colors.bg2` (paper-dim) while `AmrapLogSheet` used `bg0` directly,
  giving the TM editor / reset / unit-migration sheets a different
  visual surface from the AMRAP logger. All sheet bodies now share the
  same `bg0` paper canvas.

### Changed
- **Live top-bar pill placement is now phase-scoped:**
  - Set phase → Cancel + Restart only (no Undo while you're mid-effort).
  - Rest phase → Undo only (no Cancel/Restart while you're staring at
    a rest timer).
  - Removed the duplicate in-body Undo button from `RestPhase` — the
    top-bar Undo is the single source.
- **PR Celebration screen redesigned** to share the PR certificate's
  visual language:
  - True full-screen ink-0 surface, escapes the root SafeTopFrame so
    the canvas runs edge-to-edge under the status bar.
  - Corner-tick frame mirroring the certificate panel.
  - Hero number row + previous-best comparison row + delta, with the
    same paper-tint hairlines as the certificate.
  - Staged FadeInDown reveal (eyebrow → "Stronger." → hero number →
    comparison).

### Changed
- **Weights ≥ 1000 now render with comma separators** (`1,200 lb`, `12,500 lb`)
  via a shared `formatWeight` helper. Wired through the PR certificate
  hero, comparison row, and receipt rows so lifetime numbers stop reading
  like an unbroken digit string.
- **AchievementStrip split** into `AchievementHero` + `AchievementCaptions`
  + `trainingSince.ts` so the strip body is now composition, not a 164-line
  prop-soup component.
- **PR certificate + Adjust-TM CTA** magic-number margins (24 / 16 / 22 / 18)
  replaced with `spacing` tokens.

### Added
- **`scripts/install-hooks.sh`** — drops a husky-free pre-commit hook into
  `.git/hooks/` that runs `pnpm verify` before each non-docs commit.
- **CI · Metro bundle job** — `.github/workflows/ci.yml` now has a dedicated
  `bundle` job that runs `pnpm bundle-check`, closing the documented harness
  gap where typecheck/lint/test never load the Metro bundler.
- **A11y · top-bar pill hints** — Undo / Restart / Cancel / Complete now
  declare `accessibilityHint` describing the consequence of the tap, on top
  of the existing role + label.
- **`CONTRIBUTING.md` primitives catalog** — explicit table of the design
  primitives + the `pnpm verify` gate.

### Added
- **Time helpers consolidated** — three near-identical `formatRestHint`/
  `formatRestClock`/`formatLabel` copies inside `RestTimer`,
  `RestTargetSection`, `BbbBand`, `BbbPromptScreen` collapsed into one
  `formatMmSs`/`formatClock` pair in `src/domain/time.ts` with proper
  signed-zero + negative-input handling.
- **Plate-set defaulting helper** — extracted `defaultPlateSet(unit)` from
  the inline ternaries in `LiveScreen` + `BbbPromptScreen`.
- **`pnpm verify`** — runs the full CI gauntlet plus a Metro bundle check
  in one command, so contributors catch the import-graph drift our CI
  matrix doesn't exercise.
- **Design primitives · `SecondaryLink`** — promoted the centered,
  mono-uppercase, low-emphasis text link (BBB "SKIP · CLOSE THE DAY",
  PR celebration "SKIP TO RECEIPT") to a first-class primitive with
  paper + inverse-surface variants.
- **PR Celebration · Skip CTA** added under `Continue →` so the user
  isn't forced through BBB on every PR. Magic-number padding replaced
  with spacing tokens.

### Added
- **Live · Boring But Big prompt** — after AMRAP the user lands on a
  new `/session/bbb` screen showing the 5×10 @ 50% TM plan with full
  plate decomposition, configured rest interval, and two CTAs: primary
  `Mark BBB complete →` and secondary `SKIP · CLOSE THE DAY`. Both
  route to the receipt; Android hardware back is intercepted to land
  there too.
- **Live · AMRAP coaching banner** rendered under the top set:
  "As many reps as possible — push for a PR, but stop when form breaks."
- **Live · Rest timer persistence** — module-level snapshot keeps the
  countdown alive across screen remounts (tab swap mid-rest no longer
  resets it).
- **Boot · 531 wordmark** screen in IBM Plex Display Condensed while
  SQLite migrations run, so the cold-start handoff is branded even
  before a splash PNG carries the mark.
- **Settings · About row** now pulls the app version from
  `Constants.expoConfig.version` so the rendered string can't drift
  from `app.json`.
- **History · Best streak** badge with a `MATCHING NOW` tag when the
  user is sitting on their longest-ever consecutive-day run.
- **History · Training since** caption surfacing the user's first session
  month + total elapsed days, once they've trained for ≥ 30 days.
- **History · Achievement strip** — sessions filed, PR count, 14-day
  activity sparkline, and a heaviest-PR "★ Best · Bench 215 lb" chip.
- **Home · Resume CTA** now surfaces the exact partial-progress set:
  `Resume · set 2 of 3`.
- **Home · Last-trained hint** on each LiftPage (e.g. `LAST TRAINED 3 DAYS AGO`).
- **Home · Streak badge** above the lift tabs once the user has a real
  current streak going.
- **Live · Plate-change hint** — caption between sets telling the user
  exactly which plates to add or strip per side.
- **Live · Overtime pulse** — gentle motion when the rest timer crosses 0.
- **Live · Final-set CTA** copy differentiates the AMRAP top set ("Big
  set") from the working sets.
- **Settings · TM-edit sheet** with a percentage-delta hint
  (`+5% from current`) so the user knows what they're committing to.
- **Settings · Cycle progress** grid with per-lift completion bars.
- **Marketing · One-pager** at `docs/MARKETING.md` describing the
  positioning, audience, and TestFlight pitch.
- **CI · EAS preview workflow** that auto-builds an OTA update on every
  JS-only push to `main` and triggers a native build only when native
  config changes.
- **Splash · Paper-themed** splash + adaptive icon backgrounds matching
  the e-ink aesthetic.

### Changed
- **Back nav** on Live + Today is deterministic: Live → Today (with
  current lift), Today → Home. Visible back chip + Android hardware
  back match. Replaces stack-default `router.back()` which landed on
  whichever tab originated the push (often History).
- **History · AchievementStrip** split: the inline `Stat` component
  became `AchievementStat.tsx`, and the four `★ Best · …` caps lines
  collapsed into a shared `AchievementCaption`.
- **Design primitives · LedgerRow** moved from a single file with three
  components to a directory (`LedgerRow.tsx`, `LedgerRowLabel.tsx`,
  `LedgerRowValue.tsx`) with a barrel — mirrors `PlateBar/`.
- **Domain · BBB convention** centralized in `domain/bbb.ts`
  (`BBB_SETS`, `BBB_REPS`, `bbbWeightFromTm`); the Today screen's
  `BbbBand` and the new prompt screen both read from it.
- LiveScreen broken up into focused phase components
  (`SetPhase`, `RestPhase`, `AmrapLogSheet`, `CancelConfirmSheet`) and
  hook drivers (`useLiveScreenState`, `useRestTimer`,
  `useLogWorkingSets`, `useLiveScreenEffects`).
- HomeScreen split into `LiftPage`, `LiftTabs`, `CycleStrip`,
  `StreakBadge`, `DateBadge`, and a sticky-CTA composition.
- SessionComplete redesigned as a paper "receipt" with PR certificate
  animation and a contextual back-to-history CTA when the session was
  opened from history.
- Settings split into `TmTable`, `TmEditSheet`, `UnitsSection`,
  `RestTargetSection`, `LiftToggleSection` with extracted hooks for
  dialogs and screen data.
- Onboarding hit-targets enlarged and step machinery extracted to
  `useOnboardingFlow` + `useOnboardingState`.

### Fixed
- **Settings · About row** showed `0.1.0 · alpha` while `app.json` was
  on `1.0.0` — now reads the real version from `expo-constants`.
- **Marketing copy** previously claimed a T-0 chime; the chime was
  removed when `expo-av` was cut on SDK 55.
- **`scripts/find-unused-primitives.sh`** errored on the clean branch
  under `set -u` due to an uninitialized array.
- **Home · "Resume · set 4 of 3"** false copy when the third set landed
  in the brief window before the session-complete transition.
- **Rest timer · warning haptic** re-arms after `+30s` so the user gets
  the warning again on their second pass through T-3s.
- **AMRAP · sheet** debounce + re-enable on parent error so a network
  hiccup never strands the user.
- **TM edit · settings accessor** persistence bug.
- **Onboarding · hit-slop** on the back/forward steps.
- **Live · cancel-confirm** auto-disarms after 8s to prevent footgun
  destruction long after the initial tap.
- **expo-av** removed — incompatible with SDK 55 autolinking under
  the Expo Go workflow.

### Removed
- Unused `apps/mobile/assets/images/logo-glow.png` (~320 KB, zero refs).
- Skia, Sentry, PostHog, Storybook, Maestro, Reassure — all deferred
  until a dev-client build is justified.
- `SectionHeader` primitive (unused).

### Developer experience
- `pnpm check-boundaries` enforces the three boundary rules from
  `CLAUDE.md` automatically — hex outside `src/design/`, React/async
  in `src/domain/`, `drizzle-orm` outside `src/data/`. Wired into
  `pnpm run ci`.
- `pnpm bundle-check` exercises the Metro bundler to catch transitive
  npm dep gaps that `typecheck/lint/test` miss.
- `pnpm find-unused` flags unused exports (helps keep the design system
  honest as primitives evolve).
- `_workspace/` audit trail produced by every `rn-expo-pipeline` run
  (designer → frontend → QA agent team).

---

[Unreleased]: https://github.com/alexcheuk/proof-531/compare/main...HEAD
