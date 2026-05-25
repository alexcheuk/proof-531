---
name: status-bar-fill
description: Full-bleed RN screens that need a non-paper status-bar area must use `StatusBarShim` — `expo-status-bar`'s `backgroundColor` is Android-only and ignored when `translucent={true}`.
---

# Full-bleed status bar — use `StatusBarShim`

## The pattern

Any screen that wants the OS status-bar area painted in a non-paper
color (the PR celebration's ink-0 is the canonical case) must use the
two-layer `StatusBarShim` primitive at
`src/design/primitives/StatusBarShim.tsx`. Both layers are required:

1. `<StatusBar translucent={false} backgroundColor={color} />` —
   Android's `backgroundColor` is honored ONLY when `translucent` is
   `false`. With `translucent={true}` the OS draws transparent and
   the prop is silently ignored.
2. An absolute strip with `top: -insets.top, height: insets.top,
   backgroundColor: color` — iOS path. The screen's surface paints
   `color` inside the safe area via the SafeTopFrame negative-margin
   escape, but the sliver ABOVE the safe area needs the strip.

`StatusBarShim` packages both. Don't roll your own.

## Why we wrote it down

The PR celebration screen broke this three times:

- loop-002 (2026-05-24, Discord 1508365993) — first ask. Set
  `<StatusBar style="light" />` + negative-margin escape. iOS worked,
  Android default tint stayed visible.
- loop-003 (2026-05-25 01:30) — added `backgroundColor={colors.ink0}
  translucent={true}`. Still broken because `translucent={true}`
  silently ignores `backgroundColor`.
- loop-004 (2026-05-25 02:00, Discord 1508386282) — finally fixed
  with the two-layer approach. Extracted as primitive in loop-005.

If you find yourself reaching for `<StatusBar backgroundColor=...>`
plus a manual absolute strip, stop and use `StatusBarShim` instead.

## When NOT to use it

For screens that paint paper (`colors.bg0`) at the top — i.e. every
non-full-bleed screen in the app — let the root `SafeTopFrame` handle
the status-bar area. The global `<StatusBar style="dark" />` in
`_layout.tsx` is sufficient there.
