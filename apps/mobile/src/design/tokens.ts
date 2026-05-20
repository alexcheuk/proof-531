/**
 * 531 Strength — design tokens.
 *
 * Ported verbatim from `design-reference/tokens.css`. This is the ONLY file
 * in `apps/mobile/src` that may contain hex / px / motion literals. Every
 * other file in the design system imports from here.
 *
 * Boundary rule (enforced by reviewer):
 *   rg -n '#[0-9a-fA-F]{3,8}' apps/mobile/src --type ts | grep -v tokens.ts
 * MUST return empty.
 */

// ── surfaces ───────────────────────────────────────────────────────────────
// ── ink (text) ─────────────────────────────────────────────────────────────
// ── lines (with alpha) ────────────────────────────────────────────────────
// ── accents ────────────────────────────────────────────────────────────────
// ── light surfaces (rare — modals, splash) ────────────────────────────────
export const colors = {
  // surfaces
  bg0: '#0B0C0E', // app canvas, deepest
  bg1: '#131519', // card surface
  bg2: '#1B1E24', // raised surface
  bg3: '#262A32', // input / hover

  // ink
  ink0: '#FAFAF5', // primary text
  ink1: '#D8D8D2', // secondary
  ink2: '#8E8F8A', // tertiary
  ink3: '#5C5E5A', // muted
  ink4: '#3A3C3F', // very muted

  // lines
  line: 'rgba(250, 250, 245, 0.08)',
  lineStrong: 'rgba(250, 250, 245, 0.14)',
  lineFaint: 'rgba(250, 250, 245, 0.04)',

  // accents
  hot: '#FF5530', // primary accent — vivid orange, "fire"
  hotSoft: '#3A1A0E', // dim accent bg
  hotText: '#FFB59C', // accent text on dark
  lime: '#D4FE3F', // energy / PR
  limeSoft: '#2A3209',
  ice: '#5BB6F0', // info
  red: '#F03A3A', // warning / over-time
  amber: '#FFB13A', // deload

  // light surfaces
  paper: '#FAFAF5',
  paperDim: '#E8E8E2',
} as const;

export type Colors = typeof colors;

// ── type families ─────────────────────────────────────────────────────────
export const type = {
  display: "'Space Grotesk', 'Inter Display', system-ui, sans-serif",
  sans: "'Space Grotesk', 'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, 'SF Mono', monospace",
} as const;

export type TypeTokens = typeof type;

// ── shape (radii, in px) ──────────────────────────────────────────────────
export const shape = {
  rXs: 4,
  rSm: 8,
  rMd: 12,
  rLg: 18,
  rPill: 999,
} as const;

export type Shape = typeof shape;

// ── motion ────────────────────────────────────────────────────────────────
// `ease` is the CSS-format string for use with Reanimated `Easing.bezier(...)` callers
// that want a string; `easeBezier` is the numeric tuple suitable for
// `Easing.bezier(...controlPoints)`. `dur` is in milliseconds.
export const motion = {
  ease: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
  easeBezier: [0.2, 0.7, 0.2, 1] as const,
  dur: 220,
} as const;

export type Motion = typeof motion;

// ── backwards-compat aliases for legacy refs ──────────────────────────────
// Mirrors the `--ember`, `--sage`, `--night`, etc. names that some
// design-reference components still use. New code should prefer the
// canonical names above; aliases exist so a 1:1 port of a reference
// component doesn't have to rename every identifier.
export const aliases = {
  ember: colors.hot,
  emberDeep: '#B83A1F',
  emberSoft: colors.hotSoft,
  sage: colors.lime,
  sageSoft: colors.limeSoft,
  night: colors.bg0,
  nightSoft: colors.bg1,
  nightLine: colors.line,
  slate: colors.ice,
  ink: colors.ink0,
  paperSoft: colors.bg1,
  paperBright: colors.bg2,
  amberSoft: '#3A2810',
  serif: type.display,
  muted: colors.ink2,
} as const;

export type Aliases = typeof aliases;
