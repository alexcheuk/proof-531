---
name: known-codebase
description: Pre-computed facts about the 531 codebase so future loops don't re-discover them.
---

# Codebase facts (updated 2026-05-24)

## Architecture

- `src/design/` — only place hex/px literals live. Primitives in `primitives/`. Tokens in `tokens.ts`.
- `src/domain/` — pure 5/3/1 math, no React/async/Drizzle. Fully unit-tested.
- `src/data/` — Drizzle + expo-sqlite. Accessors + TanStack Query hooks (`useSession`, `usePrs`, etc.).
- `src/features/` — composition. Each feature has `components/`, `hooks/`, sometimes `sections/`. Tests colocated.
- `src/app/` — expo-router routes, thin shells.

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

## Known harness gaps

- `pnpm run ci` does NOT exercise Metro. Runtime npm dep that's missing from the install graph will pass CI green but break `expo start`.
- Fix: `pnpm bundle-check` (added 2026-05-24) runs `expo export --platform ios` to spot-check imports.
- `pnpm find-unused` (added 2026-05-24) flags primitives barrel exports
  that no feature imports — run when culling design-system surface area.

## Sticky-header elevation (`useScrolledPast` + `Masthead elevated`)

- Pair `useScrolledPast()` (in `src/design/hooks/`) with `<Masthead elevated>`
  on any screen whose body scrolls underneath a fixed Masthead. The hook
  returns `{ scrolled, onScroll, scrollEventThrottle }` — spread onto the
  ScrollView/FlatList and pass `scrolled` to the masthead. Wired in
  Settings + History as of loop-027.
- Deferred: Progress (the FlatList carousel renders one ScrollView per
  lift; cross-page elevation requires lifting per-page scroll state up
  to the screen-level Masthead, which the simple hook doesn't yet do).
  Add a module-level subject (mirror `statusBarTint`) if/when the user
  asks for Progress elevation.

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

## Data accessors (one-stop reference)

- `session.ts` — create/cancel/complete + `useSession`, `useSessions`, `useActiveSession`, `useLastCompletedSessionForLift`.
- `setLog.ts` — `appendSetLog` (single write), `getSetLogsForSession`, `getSessionIdsWithPrs`, `getLifetimeVolume`, `getPreviousBestE1RM`.
- `prs.ts` — `getPR` / `_upsertPR` (internal, never called from features directly).
- `settings.ts` — settings row CRUD.
- `tm.ts` — training-max history.
