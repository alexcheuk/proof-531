# Changelog

All notable changes to **531 Strength** are tracked here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
versioning is anchored against the EAS build channel (Expo Updates / preview)
since the app has not yet shipped a tagged App Store release. Each "Unreleased
build N" section covers what landed on `main` between two preview builds.

## [Unreleased]

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
