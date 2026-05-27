import { type ReactNode, createContext, createElement, useContext } from 'react';
import { colors as baseColors, layout, motion, radii, spacing, type } from './tokens';

export type Theme = {
  // Widened from `typeof baseColors` so the inverted theme variant
  // (different literal strings, same structural shape) can satisfy the
  // same Theme type without each consumer locking to the paper-mode
  // literal values.
  colors: { [K in keyof typeof baseColors]: string };
  type: typeof type;
  radii: typeof radii;
  spacing: typeof spacing;
  layout: typeof layout;
  motion: typeof motion;
};

/**
 * Color palette flipped for the "inverted" surface treatment (PR
 * celebration, opt-in inverted Live screen). The point is paper-on-ink
 * instead of ink-on-paper while keeping the family (amber accents,
 * relative line weights) intact. Anything not listed here passes through
 * the base palette so primitives that depend on accent or line colors
 * keep working.
 *
 * Strategy: swap each tonal pair. `bg0 ↔ ink0` (canvas/text), and the
 * step-down tones (`bg1 ↔ ink1`, etc.) swap to keep relative contrast.
 * Lines re-derive from paper instead of ink so divider hairlines stay
 * subtle on the dark surface.
 */
// Widened — the inverted variant intentionally substitutes different
// literal strings for each key, so the strict `typeof baseColors` type
// (literal-typed at the token site) would reject every assignment.
// Same structural shape, broader leaf types.
type ColorTable = { [K in keyof typeof baseColors]: string };

const invertedColors: ColorTable = {
  ...baseColors,
  bg0: baseColors.ink0,
  bg1: baseColors.ink1,
  bg2: baseColors.ink2,
  bg3: baseColors.ink3,
  ink0: baseColors.bg0,
  ink1: baseColors.bg1,
  ink2: baseColors.bg2,
  ink3: baseColors.bg3,
  // ink4 (very muted) flips with bg3 → bg4 has no token so use bg3.
  ink4: baseColors.bg3,
  // Lines on an ink surface read better as paper hairlines.
  line: 'rgba(231, 227, 214, 0.16)',
  lineStrong: 'rgba(231, 227, 214, 0.42)',
  lineFaint: 'rgba(231, 227, 214, 0.08)',
  // hot/hotSoft are aliases for ink-on-paper accents; flip them too so
  // anything that paints `hot` against the surface still contrasts.
  hot: baseColors.bg0,
  hotSoft: 'rgba(231, 227, 214, 0.10)',
  paper: baseColors.ink0,
  paperDim: baseColors.ink2,
  paperMuted: 'rgba(26, 24, 18, 0.6)',
  // amber stays — it's the project's single accent and reads on both
  // ink and paper surfaces.
};

const baseTheme: Theme = Object.freeze({
  colors: baseColors,
  type,
  radii,
  spacing,
  layout,
  motion,
});

const invertedTheme: Theme = Object.freeze({
  colors: invertedColors,
  type,
  radii,
  spacing,
  layout,
  motion,
});

const ThemeContext = createContext<Theme | null>(null);

export type ThemeProviderProps = {
  children: ReactNode;
  /**
   * Flip the palette to the inverted (paper-on-ink) variant for this
   * subtree. Used by the optional inverted Live screen (Discord
   * 1508984314) and any other surface that wants the PR-celebration
   * palette without each primitive having to opt in.
   */
  invert?: boolean;
};

export const ThemeProvider = ({ children, invert = false }: ThemeProviderProps) =>
  createElement(ThemeContext.Provider, { value: invert ? invertedTheme : baseTheme }, children);

export const useTheme = (): Theme => {
  const ctx = useContext(ThemeContext);
  if (ctx === null) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
};
