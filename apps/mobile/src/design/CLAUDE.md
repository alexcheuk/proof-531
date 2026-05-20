# Working in src/design/

## Rules

- **`tokens.ts` is the only file with hex/px literals.** Every other file imports tokens.
- **Every primitive has a Storybook story** covering every variant.
- **Accessibility roles are mandatory.** `Pressable` → `accessibilityRole="button"`; `NumberStepper` → `accessibilityRole="adjustable"`. Tested.
- **No inline styles** referencing colors or sizes. Compose with token-derived `StyleSheet.create` or with `useTheme()`.
- **Primitives don't fetch data.** Pass data in as props. Composition happens in `features/`.

## File organization

```
design/
  tokens.ts         # All hex, all px, all motion timings. Single source.
  theme.ts          # ThemeProvider + useTheme + useAccentOverride
  primitives/       # Box, Text, Caps, Eyebrow, WeightNum, Card, PressButton, SegRail, NumberStepper
  plates/           # Barbell, Chips, Numerical (Skia)
  icons/            # Icon component + name registry
  motion/           # Shared eases, durations, layout-animation presets
```

## Naming

- Component names: `PressButton`, `WeightNum`, `Caps`, not `Button`, `Number`, `Label`.
- Props: explicit, no `style` passthrough unless documented (we want consistent typography).
- Variants: `variant: 'ember' | 'inverse' | 'ghost'`. Sizes: `size: 'sm' | 'md' | 'lg'`.

## Tokens consumption

```ts
// good
import { colors, type, shape } from '@/design/tokens';

// bad — never, even for "just one color"
const c = '#FF5530';
```

The reviewer runs `rg -n '#[0-9a-fA-F]{3,8}'` on every diff inside `src/design/` (excluding `tokens.ts`). Any hit is rejected.
