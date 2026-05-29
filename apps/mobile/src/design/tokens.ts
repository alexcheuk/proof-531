/**
 * Design tokens — ported verbatim from 531-PWA `src/styles/globals.css`
 * (LEDGER v3 e-ink theme).
 *
 * This is the ONLY file in the repo allowed to contain hex/px literals.
 * All other modules must import named tokens from here.
 *
 * Notes on the port:
 * - React Native does not resolve CSS `var()` references. Where the PWA's
 *   `@theme` block aliased one variable to another (e.g.
 *   `--color-hot: var(--color-ink-0)`), the underlying literal is inlined.
 * - Durations are numeric milliseconds (React Native API expects `number`).
 * - Easings are exported both as their PWA cubic-bezier string AND as a
 *   `[number, number, number, number]` tuple for Reanimated consumers.
 * - The PWA's `globals.css` defines NO `--spacing-*` custom properties.
 *   The `spacing` scale below is a 4-pt scale derived from common mobile
 *   defaults; this is a deliberate addition called out by the spec's
 *   §3 token-export contract.
 */

// ── Colors ──────────────────────────────────────────────────────────────
// Source: globals.css `@theme` block. var() aliases resolved inline.
export const colors = {
  // Surfaces (paper)
  bg0: '#E7E3D6', // app canvas — paper
  bg1: '#DCD8CB', // card surface
  bg2: '#D2CEC0', // raised (sheets, modals)
  bg3: '#C7C3B5', // input / hover / pressed

  // Ink (text + lines)
  ink0: '#1A1812', // primary text
  ink1: '#3D3A30', // secondary
  ink2: '#6B6759', // tertiary — caps labels
  ink3: '#8F8B7D', // muted — idle tab labels
  ink4: '#B2AE9F', // very muted — disabled

  // Lines (always ink, three weights)
  line: 'rgba(26, 24, 18, 0.16)',
  lineStrong: 'rgba(26, 24, 18, 0.42)',
  lineFaint: 'rgba(26, 24, 18, 0.08)',

  // Accents collapse to ink (names retained so feature code never branches).
  hot: '#1A1812', // = ink0
  hotSoft: 'rgba(26, 24, 18, 0.10)',
  lime: '#1A1812', // = ink0 (collapsed)
  ice: '#1A1812', // = ink0 (collapsed)
  red: '#1A1812', // = ink0 (collapsed)
  amber: '#8E5345', // = ink0 (collapsed)

  // Paper aliases
  paper: '#E7E3D6', // = bg0
  paperDim: '#D2CEC0', // = bg2
  paperMuted: 'rgba(231, 227, 214, 0.6)', // bg0 @ 60% — for ink-on-paper-inverted eyebrows

  // Paper-over-ink tints — bg0 layered at alpha over ink-0 surface.
  // Used by PRCertificate to shade subdivisions on the inverted (dark bg) certificate.
  paperTint28: 'rgba(231,227,214,0.28)',
  paperTint45: 'rgba(231,227,214,0.45)',
  paperTint55: 'rgba(231,227,214,0.55)',
  paperTint65: 'rgba(231,227,214,0.65)',

  // shadcn aliases — kept verbatim so primitives ported from the PWA
  // map 1:1. All resolved to underlying hex/rgba.
  background: '#E7E3D6', // = bg0
  foreground: '#1A1812', // = ink0
  card: '#DCD8CB', // = bg1
  cardForeground: '#1A1812', // = ink0
  popover: '#DCD8CB', // = bg1
  popoverForeground: '#1A1812', // = ink0
  primary: '#1A1812', // = ink0
  primaryForeground: '#E7E3D6', // = bg0
  secondary: '#D2CEC0', // = bg2
  secondaryForeground: '#1A1812', // = ink0
  muted: '#D2CEC0', // = bg2
  mutedForeground: '#6B6759', // = ink2
  accent: '#D2CEC0', // = bg2
  accentForeground: '#1A1812', // = ink0
  destructive: '#1A1812', // = ink0
  destructiveForeground: '#E7E3D6', // = bg0
  border: 'rgba(26, 24, 18, 0.16)', // = line
  input: 'rgba(26, 24, 18, 0.16)', // = line
  ring: 'rgba(26, 24, 18, 0.42)', // = lineStrong
} as const;

// ── Type ────────────────────────────────────────────────────────────────
// Source: globals.css `--font-*`. RN uses postScript-style family names;
// these match the IBM Plex TTFs that PB-03 will bundle via expo-font.
// Web fallback chains are dropped — RN resolves a single family at a time.
export const type = {
  display: 'IBMPlexSans',
  sans: 'IBMPlexSans',
  mono: 'IBMPlexMono',
  displayCond: 'IBMPlexSansCondensed',
} as const;

// ── Radii ───────────────────────────────────────────────────────────────
// Source: globals.css `--radius-*`. Values are px (RN borderRadius is unitless).
export const radii = {
  xs: 2, // hairline pip
  sm: 4, // input / small card
  md: 6, // default card / button
  lg: 8, // sheet
  pill: 999, // primary CTA pill
} as const;

// ── Spacing ─────────────────────────────────────────────────────────────
// NOTE: the PWA's globals.css defines NO `--spacing-*` custom properties.
// This 4-pt scale is the project's spacing contract going forward — every
// primitive consumes named keys instead of raw px literals (enforced by
// the reviewer's "no px outside src/design/" rule).
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// ── Layout ──────────────────────────────────────────────────────────────
// Named layout aliases on top of the spacing scale — communicate intent
// at the call site. `gutter` is the horizontal page gutter applied to
// screens, mastheads, top bars, ledgers, and onboarding shells.
export const layout = {
  gutter: spacing.xl,
} as const;
export type Layout = typeof layout;
export type LayoutToken = keyof Layout;

// ── Motion ──────────────────────────────────────────────────────────────
// Source: globals.css `--ease-standard` and `--duration-base`.
// `easeStandard` is provided as both the CSS string (for any RN API that
// accepts cubic-bezier strings) and as a 4-tuple for Reanimated's
// `Easing.bezier(...)`.
export const motion = {
  easeStandard: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
  easeStandardBezier: [0.2, 0.7, 0.2, 1] as const,
  durationBase: 220, // ms
} as const;

// ── Type exports — useful for downstream primitives ─────────────────────
export type Colors = typeof colors;
export type ColorToken = keyof Colors;
export type Radii = typeof radii;
export type RadiusToken = keyof Radii;
export type Spacing = typeof spacing;
export type SpacingToken = keyof Spacing;
export type TypeFamily = typeof type;
export type FontToken = keyof TypeFamily;
export type Motion = typeof motion;
