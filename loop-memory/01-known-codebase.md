---
name: known-codebase
description: Pre-computed facts about the 531 codebase so future loops don't re-discover them.
---

# Codebase facts (updated 2026-05-28, expedition 22)

## Architecture

- `src/design/` — only place hex/px literals live. Primitives in `primitives/`. Tokens in `tokens.ts`.
- `src/domain/` — pure 5/3/1 math, no React/async/Drizzle. Fully unit-tested.
- `src/data/` — Drizzle + expo-sqlite. Accessors + TanStack Query hooks (`useSession`, `usePrs`, etc.).
- `src/features/` — composition. Each feature has `components/`, `hooks/`, sometimes `sections/`. Tests colocated.
- `src/app/` — expo-router routes, thin shells. Do NOT put non-route .ts files here — the router warns "missing default export" for anything without a default component export.
- `src/lib/` — pure helpers: haptics, time, plate logic, and now `routes.ts` (navigation helpers). Relocated from `src/app/routes.ts` in expedition 22.

## Log sheet hooks (expedition 11)

- `useLogSheetState` (`features/session/hooks/useLogSheetState.ts`) — shared
  state for bottom-sheet rep loggers. Takes `open`, `initialReps`, `onSave`,
  `onCancel`. Resets reps + pending on each `open=true`, guards handleCancel
  against gorhom auto-dismiss after save.
- `useAmrapLogState` — thin wrapper; seeds at `prescribedReps`.
- `useTmTestLogState` — thin wrapper; seeds at 0.
- `LogSheetFooter` (`features/session/components/LogSheetFooter.tsx`) — shared
  Cancel + Save button pair. Takes `cancelTestID`, `saveTestID`, and a11y
  labels as props. Both AMRAP and TM Test sheets use this directly.

## Key primitives (don't re-invent these)

- `StatGrid` — 3-up "label / value / sub" grid. See `LiftStats.tsx` for usage.
- `LedgerRow`, `LedgerSection` — accountant-style line items.
- `Card`, `Sheet`, `SheetLayout` — surfaces.
- `Heading`, `Text`, `CapsLabel`, `TitleBlock` — typography.
- `CtaBar`, `CtaBarReserve` — sticky bottom action area.
- `PlateBar` — bar + per-side plate visualization.
- `SegRail`, `LabeledSegRail` — segmented controls.
- `PrimaryPillButton` — the only pressable primitive used by features.
- `Row`, `Divider`, `SectionBand`, `Skeleton`, `ErrorBoundary` — layout.
- `Masthead`, `TopSetBlock`, `MonoBadge`, `PillChip`, `NumberStepper` — composites.
- `SecondaryLink` (added 2026-05-24) — centered, mono-uppercase, low-emphasis
  text-link button used under CTAs. Variants `surface: 'paper' | 'inverse'`
  for use over dark surfaces (PR celebration).
- `TopBarPill` (added 2026-05-24, feature-local to `session/components/`) —
  shared visual primitive for UndoPill / ResetPill / CancelPill /
  CompletePill, which are now 5-line wrappers.

## Removed primitives (do not re-add unless there's a real consumer)

- `Box` — generic spacing wrapper. Removed 2026-05-24. Use `Row`/`Card`/inline `View`.
- `Button` — generic shadcn-style variants. Removed 2026-05-24. Use `PrimaryPillButton`.
- `SectionHeader` — Removed 2026-05-24. Use `TitleBlock` for hero/display titles.

## Domain exports (updated 2026-05-28, expedition 28)

- `domain/increments.ts` exports `LOWER_BODY: ReadonlySet<Lift>` — the set of lifts
  that use larger cycle TM increments (10 lb / 5 kg). Import this; don't re-define locally.
- `domain/types.ts` does NOT export `LIFTS` (removed as dead code — no importers).
  Use `LIFTS` from `domain/labels` for the display-order array `['squat', 'bench', 'deadlift', 'press']`.
- `domain/labels.ts` exports:
  - `LIFTS: readonly Lift[]` in display order (squat, bench, deadlift, press)
  - `isLift(v)` type guard for route param validation
  - `liftDisplayName(lift)` — title-case short name ("Squat", "Bench")
  - `liftLongName(lift)` — colloquial coach-voice name ("back squat", "bench press"); moved from `features/progress/labels.ts` in expedition 26
  - `liftProperName(lift)` — title-case proper noun ("Back squat", "Bench press"); added expedition 28. Use this for settings rows and table headers; use `liftLongName` for prose.
- `features/progress/labels.ts` — DELETED in expedition 26. `liftLongName` now lives in `domain/labels`.

## Web pages

- `/privacy` — simple privacy policy (no data collection, local SQLite only). Required for store listings.
- `/support` — support page with GitHub Issues link + email. Required for App Store listings.

## Pure helpers (domain/)

- `time.ts` (added 2026-05-24) — `formatMmSs` (`1:30`) for short cadence
  labels, `formatClock` (`MM:SS` / `H:MM:SS`) for elapsed clocks.
  Replaces four inline copies that had subtly different signed-zero
  behavior.
- `plates.defaultPlateSet(unit)` — extracts the inline `unit === 'kg' ?
  'kg-standard' : 'standard'` ternary used at every plate-render site.
- `units.formatWeight(n)` (added 2026-05-24) — thousands-separator
  formatting for weights ≥ 1000. Always route 4-digit+ weights through
  this; raw `n.toString()` was the prior convention.
- `plates.barWeight(unit)` (added 2026-05-26) — single source of truth
  for the bar's empty weight (45 lb / 20 kg). Use this anywhere a
  user-entered weight needs a floor (NumberStepper `min`, TM editor,
  1RM entry). Don't sprinkle the 45/20 ternary in feature files.

## Dev workflow

- `pnpm verify` (added 2026-05-24) — runs the full CI gauntlet *plus*
  `pnpm bundle-check`. Use before any commit that touches the import
  graph (CLAUDE.md harness gap notes).
- `bash scripts/install-hooks.sh` (added 2026-05-24) — drops a husky-free
  pre-commit hook that auto-runs `pnpm verify` (skips on docs-only
  commits). Contributors run once after cloning.
- `.github/workflows/ci.yml` now has a dedicated `bundle` job (added
  2026-05-24) running `pnpm bundle-check` on every PR/push.

## Test discipline

- TDD for `src/domain/`, property-tested with fast-check.
- Component tests assert behavior not pixels.
- Jest config in `apps/mobile/package.json`.
- Hook tests live next to the hook (`hooks/__tests__/useFoo.test.tsx`).
  Mock queries at module-load — see `useHistoryScreenData.test.tsx`.
- **`@gorhom/bottom-sheet` mock is required** in any test file whose
  component tree reaches `Sheet.tsx` or `SheetLayout.tsx`. The real lib
  needs Reanimated worklets which don't run in Jest. Standard stub:
  ```ts
  jest.mock('@gorhom/bottom-sheet', () => {
    const React = jest.requireActual('react');
    return {
      __esModule: true,
      default: ({ children }: any) => React.createElement(React.Fragment, null, children),
      BottomSheetBackdrop: () => null,
      BottomSheetView: ({ children }: any) => React.createElement(React.Fragment, null, children),
    };
  });
  ```
  Missing this mock shows up as `createAnimatedComponent is not a function`.

## Known harness gaps

- `pnpm run ci` does NOT exercise Metro. Runtime npm dep that's missing from the install graph will pass CI green but break `expo start`.
- Fix: `pnpm bundle-check` (added 2026-05-24) runs `expo export --platform ios` to spot-check imports.
- `pnpm find-unused` (added 2026-05-24) flags primitives barrel exports
  that no feature imports — run when culling design-system surface area.

## OTA fingerprint sensitivity (loop-043)

- `app.json` sets `runtimeVersion: { policy: "fingerprint" }`. The
  fingerprint hashes the autolinked native modules (and a few config
  files). Removing or adding a native module (e.g. `expo-blur`,
  `expo-av`, anything with a native binding) changes the fingerprint,
  which means the published OTA carries a new runtime version that no
  existing APK matches — installed clients stay on the prior OTA until
  a fresh native build ships.
- Pure-JS dep changes (e.g. `zustand`) do NOT change the fingerprint
  and the OTA reaches existing installs normally.
- When in doubt, check the OTA output's `Runtime version` line against
  the prior loop's. If it changed, the OTA is effectively a no-op for
  existing users — code is still on `main`, just gated on a rebuild.

## Sticky-header elevation (`useScrolledPast` + `Masthead elevated`)

- Pair `useScrolledPast()` (in `src/design/hooks/`) with `<Masthead elevated>`
  on any screen whose body scrolls underneath a fixed Masthead. The hook
  returns `{ scrolled, onScroll, scrollEventThrottle }` — spread onto the
  ScrollView/FlatList and pass `scrolled` to the masthead. Wired in
  Settings + History as of loop-027.
- Progress elevation IS wired (as of loop-027 or earlier): `ProgressLiftPage`
  accepts `onScrolledChange` and reports its `scrolled` boolean back; `ProgressScreen`
  holds a `scrolledByLift` map and reads the selected lift's value to drive
  `mastheadElevated`. No module-level subject was needed — the carousel's
  per-item render callback carries the lift identity.

## Shared cross-feature components (added 2026-05-26)

- `LiftTabs` and `LiftTab` live at `features/shared/LiftTabs.tsx` and
  `features/shared/LiftTab.tsx`. Both HomeScreen and ProgressScreen import
  from there. Previously in `home/components/` — moved to fix the
  cross-feature boundary violation.

## Color palette (e-ink paper)

- `bg0` / `paper`: `#E7E3D6` — main canvas
- `bg2` / `paperDim`: `#D2CEC0`
- `ink0`: `#1A1812` — primary text (≈ black)
- `ink3` — muted text
- `line`, `lineStrong` — hairlines
- Splash and adaptive icon backgrounds should be `#E7E3D6` (light) / `#1A1812` (dark).

## Session top-bar pill contract (updated 2026-05-24)

- **Set phase** → Cancel + Restart only (no Undo).
- **Rest phase** → Undo only (no Cancel/Restart).
- The duplicate in-body Undo button in `RestPhase` was removed — undo
  lives on the top bar; rendering it twice was visual noise per user
  feedback.

## Sheet styling contract

- All sheets paint their body in `colors.bg0` (paper). `SheetLayout`
  previously used `bg2` (paper-dim) which made the TM editor /
  reset / unit-migration sheets look visibly different from the AMRAP
  logger. Don't reintroduce `bg2` as a sheet body bg — it reads as a
  "secondary" surface to users and breaks the one-canvas illusion.

## PR celebration / full-bleed surfaces — global status-bar tint (loop-018)

- `PrCelebrationScreen` uses `StatusBarShim` to push ink-0 into the
  global tint subject (`src/design/statusBarTint.ts`). `SafeTopFrame`
  in `_layout.tsx` reads the subject and paints an absolute strip over
  its own paper bg in the safe-area area when non-null.
- **Do NOT use per-screen `marginTop: -insets.top` to escape the
  SafeTopFrame paper bg.** The native-stack card's `overflow: hidden`
  clips the negative-margin escape — that's why the iOS path looked
  fine on the simulator and broke on device. See
  `loop-memory/07-status-bar-fill.md` for the full history.

## Back navigation contract

- **`goTo` import: `@/lib/routes`** (moved from `@/app/routes` in expedition 22; `@/app/routes` is deleted).
- **Live → Today, Today → Home.** Deterministic via `goTo.today` / `goTo.home`,
  not `router.back()`. Stack-default `back` lands on the originating tab
  (often History) which broke the user's mental model.
- **Progress is a tab** as of loop-024 — so there's no "back from Progress"
  case. Tab-to-tab navigation has no back stack; the user just taps another
  tab. If you ever add another stack-pushed screen, route the visible back
  chip via `goTo.*` and override Android hardware back with
  `useHardwareBack({ enabled, onBack })` to match.
- **Tab `backBehavior="initialRoute"`** (loop-027). Android hardware back
  from any non-Today tab routes to Today; from Today it exits the app.
  Stack-pushed sub-screens still pop normally. See Discord 1508687777179369575
  for the user's framing — the default `history` behaviour landed wherever
  the user had visited most recently, not on the obvious root.
- Hardware Android back is overridden by `useHardwareBack({ enabled, onBack })`
  in `features/session/hooks/`. Use it whenever a visible back chip exists
  on a screen with a non-default destination.

## Session runtime snapshot

- `features/session/sessionRuntime.ts` holds a module-level rest snapshot
  (`{ sessionId, endsAtMs, lastLogged }`) so navigating away from the live
  screen during rest no longer kills the countdown. Cleared on
  advance-from-rest / undo / cancel / complete. Tests must call
  `_resetSessionRuntimeForTests()` in `beforeEach`.

## Routes

- `/(tabs)` — Today / Progress / History / Settings (custom tab bar in `features/tabs/`).
  Progress was promoted from a stack-push route (`/progress/[lift]`) to a tab in
  loop-024; `goTo.progress(router, lift)` navigates to `/(tabs)/progress?lift=X`.
  The tab accepts an optional `?lift=` param and falls back to `enabledLifts[0]`.
- `/session/today` — pre-session preview
- `/session/live` — in-session (rest timer, AMRAP sheet, cancel-confirm sheet)
- `/session/complete` — receipt + CTA
- `/onboarding` — first-launch

## React Compiler experiment (expedition 19)

- **`reactCompiler: true` in `app.json` experiments is REMOVED and must not be re-enabled without a full audit.**
  The Babel transform rewrites component closures in ways that break Reanimated 4 worklets in production Hermes builds.
  The app crashes on open — no error message, just a failed launch. The compiler is a candidate to re-enable
  only after every component that uses `useAnimatedStyle`, `useSharedValue`, or `useAnimatedProps` is audited
  for compatibility.

## EAS channel contract (expedition 19)

- Preview profile (`eas.json`) uses `channel: "main"` (changed from `channel: "preview"` in expedition 19).
  All OTA updates are published to `"main"`. Preview and production APKs both subscribe to `"main"`.
  **Do not reintroduce a separate `"preview"` channel** without also adding a CI step that publishes to it;
  a channel mismatch silently prevents all fixes from reaching the device.

## Reanimated animation rules (added 2026-05-27)

- **Never use `entering={FadeIn/FadeInDown/ZoomIn/...}` on any component
  that can remount across sessions.** The Reanimated layout-animation
  registry is stateful; a second mount before the first cleanup throws
  "Should not already be working." and produces a black screen.
- **Use explicit hooks instead:**
  ```ts
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 200 });
    return () => cancelAnimation(opacity);
  }, [opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  ```
  This pattern is safe on every remount because `cancelAnimation` in the
  cleanup is surgical (cancels only this value, not the whole registry).
- `LinearTransition` (layout reflow animation, not an entering animation)
  is NOT the same. `layout={LinearTransition}` is a layout prop, not an
  entry prop, and is safe to keep.
- `PrCelebrationSkeleton` has a muted final opacity (0.45): animate to the
  target value directly (`withTiming(0.45)`) and put `fadeStyle` LAST in
  the style array so the animated value is not shadowed by an inline
  `opacity` property that comes after it.

## Cross-stack navigation (session → tabs) — expedition-010 fix

- Rule: from inside the `session` group, dismiss first, THEN navigate.
  `router.navigate('/(tabs)/progress')` from inside a nested group does
  NOT reliably switch the active tab in the parent navigator. The correct
  pattern:
  ```ts
  if (router.canDismiss()) router.dismissAll();
  goTo.progress(router, lift);   // router.navigate()
  ```
- The reversed order (navigate first, dismiss after) was tried in
  loop-017 to avoid a brief flash, but it caused a regression where
  Progress was never reached (Discord 1509284142). Reverted in
  expedition-010.

## Native module rebuild after Node upgrade

- `better-sqlite3` (used by Jest for DB accessor tests) must be rebuilt
  when the Node.js major version changes. After a Node upgrade, all DB
  accessor tests fail with "NODE_MODULE_VERSION mismatch". Fix:
  ```bash
  cd node_modules/.pnpm/better-sqlite3@<ver>/node_modules/better-sqlite3
  npm rebuild
  ```
  This is a one-time step per Node major version bump; tests return to
  green immediately after.

## TM suggestion UI contract (expedition 13)

- `TmAdjustmentNote` (`features/session/components/TmAdjustmentNote.tsx`) — visual
  variants based on `suggestion.kind`: increment = inverted (ink0 bg), reset = amber
  bg, hold = default. `onPress` prop opens the apply sheet. Caption changed from
  "Your call — open settings to apply" to "Tap to apply".
- `TmApplySheet` (`features/session/components/TmApplySheet.tsx`) — inline apply sheet.
  Takes `open`, `lift`, `suggestion`, `tmDisplay` (display units), `unit` (display unit),
  `storageUnit` (for DB write), `onClose`. Calls `setTrainingMax` on confirm; no-op close
  for `hold`. Invalidates `TM_KEY` after successful save.
- `SessionCompleteScreen` — holds `[tmApplyOpen, setTmApplyOpen]` state; passes
  `onPress={() => setTmApplyOpen(true)}` to `TmAdjustmentNote`.

## TM test week (Week 4 / 7th Week Protocol) — expedition 13

- Week 4 deload replaced with a single TM-verification top set at 100% TM,
  3–5 rep target. `kind: 'tm-test'` in the set-kind discriminated union.
- Domain: `isTmTestSet(set)` guard in `schemes.ts`. `computeTmSuggestion(reps)` in
  `progression.ts` returns `{ kind: 'increment' | 'hold' | 'reset', delta: number }`.
- After logging a TM test, `useLiveScreenState` transitions to `'awaiting-bbb'`
  (prompt screen with two CTAs) and eventually to `'complete'`.
- Receipt shows `TmTestReceiptBand` and `TmAdjustmentNote` with the suggestion.
- User applies TM change via `TmApplySheet` — never automatic.

## Background rest notifications (expedition 14)

- `expo-notifications` added for rest-timer background alerts.
- When rest starts, a local notification is scheduled for `endsAtMs`. Cancelled
  immediately if the user returns to the live screen. Permission prompt fires on
  first use via `requestPermissionsAsync()`.
- `useNotifications` accessor in `data/queries/` manages scheduling +
  cancellation. The native module addition changes the EAS fingerprint — OTA
  updates after this addition won't reach existing installs without a rebuild.

## Progress · Goal panel (expedition 14)

- `GoalPanel` (`features/progress/components/GoalPanel.tsx`) — TM/1RM toggle
  + stepper + projection strip. Saves to `lift_goals` table via `useLiftGoal()`.
- `GoalRuleRow` (`features/progress/components/GoalRuleRow.tsx`) — 2px+1px ink
  rules spanning the cycle grid to mark when the projected TM crosses the goal.
- `lift_goals` schema: `target_value` + `kind ∈ ('tm','1rm')`.

## PR celebration · tap-to-skip (expedition 15)

- Tapping anywhere on `PrCelebrationScreen` calls `skipToEnd()` on the
  `usePrCelebrationSequence` hook, which advances all animation values to their
  final state immediately. Implemented via a `Pressable` wrapper over the scroll
  view content area.

## JustCompletedAnimator (expedition 16)

- `features/progress/components/JustCompletedAnimator.tsx` — wraps the cycle
  grid and briefly animates the just-completed session cell filling in after
  "Close the day" routes to the Progress tab. Driven by a one-shot ref that
  clears after the animation resolves.

## Data accessors (one-stop reference)

- `session.ts` — create/cancel/complete + `useSession`, `useSessions`, `useActiveSession`, `useLastCompletedSessionForLift`.
  - `cancelSession(db, sessionId)` (added 2026-05-26) — marks an in-progress
    row as `'cancelled'`. Idempotent. Called from `useToggleLift` when the
    user disables a lift that still has an in-progress session for it; the
    History tab's filters already skip cancelled rows. Don't call directly
    from features — go through `useToggleLift` so the right queries get
    invalidated.
- `setLog.ts` — `appendSetLog` (single write), `getSetLogsForSession`, `getSessionIdsWithPrs`, `getLifetimeVolume`, `getPreviousBestE1RM`.
- `prs.ts` — `getPR` / `_upsertPR` (internal, never called from features directly).
- `settings.ts` — settings row CRUD.
- `tm.ts` — training-max history.
- `liftGoal.ts` — `getLiftGoal`, `setLiftGoal`. Used by `useLiftGoal()` TanStack Query hook.
