---
name: pending-assets
description: Image asset work that cannot be done from the Claude seat (no PNG generation). Surface to a designer/handoff.
---

# Pending image assets

Cannot be generated from the loop seat (no PNG tooling); flag to user on each loop until provided.

## 531 logo asset

- **Need:** `apps/mobile/assets/images/splash-icon.png` is currently near-blank (white ~3KB PNG). Discord ask (`#task-queue` id=1508268229855023246) wants the 531 wordmark on the paper splash background.
- **Spec:**
  - Source 531 wordmark — IBM Plex Sans Condensed Bold "531" or similar — exported at 1024×1024 PNG, transparent bg.
  - Trim to a logical 76px-wide footprint at @1x (already configured in `app.json` plugin → `expo-splash-screen.imageWidth: 76`).
  - Dark-variant uses the same mark inverted on `#1A1812`.
- **Workaround until asset arrives:** consider an in-app boot transition that renders the 531 mark via the Plex Condensed font while the JS bundle warms — needs an `useEffect` that hides splash via `expo-splash-screen.hideAsync()` after first frame, with a transient `<View>` painted in `_layout.tsx`.

## App icon (`icon.png`)

- Currently the generic Expo "A" logo on blue. Doesn't match the e-ink paper aesthetic.
- Spec mirrors the splash mark: 531 wordmark on `#E7E3D6` paper, ink-0 stroke.

## Adaptive icon (Android)

- Already correctly configured against `#E7E3D6` paper bg in `app.json` (`android.adaptiveIcon`).
- Foreground PNGs may also need the 531 wordmark — re-export when the logo lands.
