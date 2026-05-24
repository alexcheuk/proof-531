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
- `Heading`, `Text`, `CapsLabel` — typography.
- `CtaBar`, `CtaBarReserve` — sticky bottom action area.
- `PlateBar` — bar + per-side plate visualization.
- `SegRail`, `LabeledSegRail` — segmented controls.
- `Button`, `PrimaryPillButton` — pressables.
- `Row`, `Box`, `Divider`, `SectionBand`, `SectionHeader`, `Skeleton`, `ErrorBoundary` — layout.

## Test discipline

- TDD for `src/domain/`, property-tested with fast-check.
- Component tests assert behavior not pixels.
- Jest config in `apps/mobile/package.json`.

## Known harness gaps

- `pnpm run ci` does NOT exercise Metro. Runtime npm dep that's missing from the install graph will pass CI green but break `expo start`.
- Fix: `pnpm bundle-check` (added 2026-05-24) runs `expo export --platform ios` to spot-check imports.

## Color palette (e-ink paper)

- `bg0` / `paper`: `#E7E3D6` — main canvas
- `bg2` / `paperDim`: `#D2CEC0`
- `ink0`: `#1A1812` — primary text (≈ black)
- `ink3` — muted text
- `line`, `lineStrong` — hairlines
- Splash and adaptive icon backgrounds should be `#E7E3D6` (light) / `#1A1812` (dark).

## Routes

- `/(tabs)` — Today / History / Settings (custom tab bar in `features/tabs/`)
- `/session/today` — pre-session preview
- `/session/live` — in-session (rest timer, AMRAP sheet, cancel-confirm sheet)
- `/session/complete` — receipt + CTA
- `/onboarding` — first-launch
