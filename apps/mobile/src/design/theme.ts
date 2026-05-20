import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  type AccentSwatchKey,
  type Colors,
  type Motion,
  type Shape,
  type TypeTokens,
  accentSwatches,
  colors,
  motion,
  shape,
  type,
} from './tokens';

export type { AccentSwatchKey } from './tokens';

export type Theme = {
  colors: Colors;
  type: TypeTokens;
  shape: Shape;
  motion: Motion;
};

type ThemeContextValue = {
  theme: Theme;
  accentOverride: AccentSwatchKey | null;
  setAccentOverride: (key: AccentSwatchKey | null) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const baseTheme: Theme = { colors, type, shape, motion };

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [accentOverride, setAccentOverride] = useState<AccentSwatchKey | null>(null);

  const theme = useMemo<Theme>(() => {
    if (accentOverride === null) return baseTheme;
    const overrideColors: Colors = {
      ...colors,
      hot: accentSwatches[accentOverride] as Colors['hot'],
    };
    return { ...baseTheme, colors: overrideColors };
  }, [accentOverride]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, accentOverride, setAccentOverride }),
    [theme, accentOverride],
  );

  return React.createElement(ThemeContext.Provider, { value }, children);
}

function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === null) {
    throw new Error('useTheme/useAccentOverride must be used inside <ThemeProvider>');
  }
  return ctx;
}

export function useTheme(): Theme {
  return useThemeContext().theme;
}

export function useAccentOverride(): (key: AccentSwatchKey | null) => void {
  const { setAccentOverride } = useThemeContext();
  return useCallback((key: AccentSwatchKey | null) => setAccentOverride(key), [setAccentOverride]);
}
