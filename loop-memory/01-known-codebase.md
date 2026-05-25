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

## Removed primitives (do not re-add unless there's a real consumer)

- `Box` — generic spacing wrapper. Removed 2026-05-24. Use `Row`/`Card`/inline `View`.
- `Button` — generic shadcn-style variants. Removed 2026-05-24. Use `PrimaryPillButton`.
- `SectionHeader` — Removed 2026-05-24. Use `TitleBlock` for hero/display titles.

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

## Color palette (e-ink paper)

- `bg0` / `paper`: `#E7E3D6` — main canvas
- `bg2` / `paperDim`: `#D2CEC0`
- `ink0`: `#1A1812` — primary text (≈ black)
- `ink3` — muted text
- `line`, `lineStrong` — hairlines
- Splash and adaptive icon backgrounds should be `#E7E3D6` (light) / `#1A1812` (dark).

## Back navigation contract

- **Live → Today, Today → Home.** Deterministic via `goTo.today` / `goTo.home`,
  not `router.back()`. Stack-default `back` lands on the originating tab
  (often History) which broke the user's mental model.
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

- `/(tabs)` — Today / History / Settings (custom tab bar in `features/tabs/`)
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
