---
name: status-bar-fill
description: Full-bleed RN screens that need a non-paper status-bar area use `StatusBarShim` + the global tint layer in `_layout.tsx`. Per-screen `marginTop: -insets.top` escapes do NOT work  - the native-stack card clips them.
---

# Full-bleed status bar  - use `StatusBarShim` + the global tint layer

## The pattern (loop-018)

Any screen that wants the OS status-bar area painted in a non-paper
color (the PR celebration's ink-0 is the canonical case) uses two
pieces:

1. **`StatusBarShim` (still the public API).** Lives at
   `src/design/primitives/StatusBarShim.tsx`. Renders
   `<StatusBar style="…" backgroundColor={color} translucent={false}>`
   (Android opaque-bar path) AND calls `useStatusBarTint(color)` to push
   the color into the global tint subject.
2. **`SafeTopFrame` (in `_layout.tsx`).** Reads
   `useStatusBarTintValue()` and, when non-null, paints an
   absolute strip over its own paper bg in the safe-area area. This is
   the iOS path; it also belt-and-braces Android.

The screen does **nothing else**. Specifically: do NOT add a
per-screen `marginTop: -insets.top, paddingTop: insets.top` escape on
the surface. That trick was used in loops 002–005 and the user kept
reporting "still not black" because the native-stack card has
`overflow: hidden` and clipped the escape at the card boundary.
Loop-018 finally pinned down that root cause.

## Why we wrote it down

The PR celebration screen broke this four times:

- loop-002 (2026-05-24, Discord 1508365993)  - first ask. Set
  `<StatusBar style="light" />` + negative-margin escape. iOS worked
  on the simulator, Android default tint stayed visible on device.
- loop-003 (2026-05-25 01:30)  - added `backgroundColor={colors.ink0}
  translucent={true}`. Still broken because `translucent={true}`
  silently ignores `backgroundColor`.
- loop-004 (2026-05-25 02:00, Discord 1508386282)  - fixed Android
  with the two-layer approach (`translucent={false}` + StatusBar BG).
  Extracted as `StatusBarShim` in loop-005.
- loop-018 (2026-05-25 08:30, Discord 1508489171)  - user reported
  iOS *still* showed a paper sliver above. Root cause:
  `marginTop: -insets.top` was visually clipped by the native-stack
  card's overflow:hidden. Fix: drop the negative margin, paint the
  iOS strip OUTSIDE the card (from `SafeTopFrame`) via a global tint
  subject (`src/design/statusBarTint.ts`).

If you find yourself reaching for `<StatusBar backgroundColor=...>`
plus a manual absolute strip plus a negative-margin escape  - stop.
Use `StatusBarShim` and the tint layer.

## When NOT to use it

For screens that paint paper (`colors.bg0`) at the top  - i.e. every
non-full-bleed screen in the app  - let the root `SafeTopFrame` handle
the status-bar area. The global `<StatusBar style="dark" />` in
`_layout.tsx` is sufficient there.

## Files involved

- `src/design/statusBarTint.ts`  - module-level subject +
  `useStatusBarTint` / `useStatusBarTintValue` /
  `_resetStatusBarTintForTests`.
- `src/design/primitives/StatusBarShim.tsx`  - the screen-facing
  primitive.
- `src/app/_layout.tsx`  - `SafeTopFrame` mounts the absolute strip
  when tint is non-null.
- `src/features/session/PrCelebrationScreen.tsx`  - the only consumer
  in the app today.
