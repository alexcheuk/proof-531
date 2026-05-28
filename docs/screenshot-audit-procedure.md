# Screenshot audit procedure

The port from the original PWA reference is complete. The mobile app is now
self-referential — new screen work is compared against the running mobile app,
not the PWA.

## When to do an audit

After any change that touches a screen's visual API — a primitive change, a
new component, or a layout update. Catch visual regressions before they land.

## What to capture

For each screen affected by the change, take **before/after screenshots**:

1. **Before** — boot the app on a device or iOS Simulator at the last
   green commit (`git stash`, start Metro, connect via dev-client). Navigate
   to the affected screen. Screenshot.

2. **After** — apply the change (or `git stash pop`), restart Metro,
   navigate to the same screen. Screenshot.

Boot Metro: `pnpm --filter @fivethreeone/mobile start`, then open the
dev-client APK on device/emulator and connect. iOS Simulator: press `i`
after Metro starts (requires the dev-client build — Expo Go does not run
this app; see README for build instructions).

Save comparison pairs under `docs/screenshots/<screen>/before.png` and
`docs/screenshots/<screen>/after.png` for any PR that touches layout
or primitives.

## Acceptance criteria

A screen change passes when:

- Before/after screenshots are committed under `docs/screenshots/<screen>/`.
- A maintainer confirms the after shot matches the intended design.
- Any divergence from the intended behavior is either fixed or explicitly
  noted in the PR description.

## Common platform divergences (expected, not regressions)

- **Native status bar** — Expo renders the OS status bar; adjust using
  `StatusBar` component from `expo-status-bar`.
- **Native bottom safe-area inset** — screens reserve home-indicator
  space via `useSafeAreaInsets`.
- **System fonts at 100% scale** — if IBM Plex fails to load, the app
  falls back to system fonts. Flag and re-test with a clean Metro cache.
