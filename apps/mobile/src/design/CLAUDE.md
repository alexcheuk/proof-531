# Design-system rules

`src/design/` is the single source of truth for all visual constants and reusable UI primitives.

## Rules (enforced by reviewer)

1. **Hex and pixel literals live here, and only here.** All other layers import from `tokens.ts` via `useTheme()`. If you find `#1A1812` or `16` (as a hardcoded layout dimension) outside this directory, it's a violation.
2. **Primitives are composable atoms.** They receive style props but never reach out to `data/` or `features/`. No hooks that touch TanStack Query, Drizzle, or global app state.
3. **No barrel files** outside `primitives/`. The `primitives/` directory itself has an `index.ts` barrel so features can import from `@/design/primitives`.

## What lives here

- `tokens.ts`  -  the color palette, typography scale, spacing, and radius values.
- `theme.ts`  -  `useTheme()` hook that reads the system dark/light mode and maps tokens to a typed `ThemeColors` object.
- `primitives/`  -  reusable atoms: `Text`, `Heading`, `Row`, `Card`, `Sheet`, `PrimaryPillButton`, `NumberStepper`, etc.
- `hooks/`  -  design-system-scoped hooks (`useScrolledPast`, etc.).
- `statusBarTint.ts`  -  module-level subject for driving the global status-bar color (used by `PrCelebrationScreen`).

## Adding a primitive

Check the existing catalog in `primitives/` before adding. If something close already exists, add a variant prop rather than copying the file. Three near-identical components is a sign a primitive is needed.

## Color palette (e-ink paper)

| Token | Hex | Use |
|---|---|---|
| `bg0` / `paper` | `#E7E3D6` | Main canvas |
| `bg2` / `paperDim` | `#D2CEC0` | Recessed surfaces |
| `ink0` | `#1A1812` | Primary text (≈ black) |
| `ink3` |  -  | Muted text |
| `accent` | `#8E5345` | Amber accent dot |

No color emojis in UI text  -  monochrome unicode only. The e-ink aesthetic is intentional.
