# Plan for PB-02-theme: ThemeProvider + useTheme hook

**Spec ref:** docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#3--stack

## Approach

Build a minimal React context that exposes the five token groups from `tokens.ts` as a single frozen `Theme` value, plus a `useTheme` hook that throws when used outside the provider. TDD cadence: write failing tests in `theme.test.tsx` first, watch them fail, implement `theme.ts`, watch them pass. No new dependencies, no barrel file. Because the `done_when` strictly requires the filename `theme.ts`, the provider uses `createElement` (TypeScript only allows JSX in `.tsx`).

## Files

- Create: `apps/mobile/src/design/theme.ts` — ThemeProvider, useTheme, Theme type. JSX-free implementation via `createElement`.
- Test: `apps/mobile/src/design/theme.test.tsx` — three tests: inside-provider returns tokens, identity check on references, outside-provider throws.

## Steps

### 1. Write the failing test

Create `apps/mobile/src/design/theme.test.tsx` with:

```tsx
import { render, renderHook } from '@testing-library/react-native';
import { Text } from 'react-native';
import { colors, motion, radii, spacing, type } from './tokens';
import { ThemeProvider, useTheme } from './theme';

describe('ThemeProvider + useTheme', () => {
  it('returns the full token set when used inside ThemeProvider', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current).toEqual({
      colors,
      type,
      radii,
      spacing,
      motion,
    });
  });

  it('exposes the same token object references (no copies)', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current.colors).toBe(colors);
    expect(result.current.type).toBe(type);
    expect(result.current.radii).toBe(radii);
    expect(result.current.spacing).toBe(spacing);
    expect(result.current.motion).toBe(motion);
  });

  it('throws when useTheme is called outside ThemeProvider', () => {
    const Consumer = () => {
      const theme = useTheme();
      return <Text>{theme.colors.bg0}</Text>;
    };

    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<Consumer />)).toThrow(
        'useTheme must be used within ThemeProvider',
      );
    } finally {
      spy.mockRestore();
    }
  });
});
```

### 2. Run the test — expect FAIL

```bash
pnpm --filter @proof-531/mobile test theme
```

Expected: module resolution error for `./theme`.

### 3. Implement `theme.ts` (JSX-free — file must be `.ts`)

Create `apps/mobile/src/design/theme.ts`:

```ts
import { type ReactNode, createContext, createElement, useContext } from 'react';
import { colors, motion, radii, spacing, type } from './tokens';

export type Theme = {
  colors: typeof colors;
  type: typeof type;
  radii: typeof radii;
  spacing: typeof spacing;
  motion: typeof motion;
};

const themeValue: Theme = Object.freeze({
  colors,
  type,
  radii,
  spacing,
  motion,
});

const ThemeContext = createContext<Theme | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) =>
  createElement(ThemeContext.Provider, { value: themeValue }, children);

export const useTheme = (): Theme => {
  const ctx = useContext(ThemeContext);
  if (ctx === null) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
};
```

### 4. Run the test — expect PASS

```bash
pnpm --filter @proof-531/mobile test theme
```

### 5. Full sweep

```bash
pnpm --filter @proof-531/mobile typecheck
pnpm --filter @proof-531/mobile lint
pnpm --filter @proof-531/mobile test
```

All exit 0.

### 6. Commit

```bash
git add apps/mobile/src/design/theme.ts apps/mobile/src/design/theme.test.tsx
git commit -m "feat(PB-02-theme): add ThemeProvider and useTheme hook exposing design tokens"
```
