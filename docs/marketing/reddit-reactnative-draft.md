---
tactic: 8
channel: r/reactnative
status: draft
ready_to_post: false
trigger: iOS live on App Store (post in the monthly side-project showcase thread)
drafted: 2026-05-29 (Expedition 41)
---

# r/reactnative -  Post Draft

## Research context

r/reactnative runs a monthly side-project showcase thread. The community is technical. The winning angle here is the stack and the interesting components -  not the AI loop (mention it briefly, don't lead with it). Developers who lift will install it. Developers who don't will upvote the engineering angle if there's something technically interesting.

The plate visualization is the interesting component: it decomposes any training weight into real plates (e.g., 2x45 + 1x25 + 1x5 per side for a 225lb lift at 45lb bar), accounting for bar weight and your available plate set. Showing that is more compelling than describing it.

---

## Monthly showcase thread reply (recommended)

**Copy:**

Built a 5/3/1 strength tracker -  free, no account, local SQLite.

Stack: Expo SDK 55, React Native New Architecture, Drizzle ORM + expo-sqlite, TanStack Query, Reanimated 4, expo-notifications. IBM Plex Sans/Mono/Condensed from local assets (no Google Fonts).

Interesting component: a plate visualization that decomposes any weight into your actual plate set, shown per side accounting for bar weight. Works in both lbs and kg with configurable available plates.

Architecture enforces layer boundaries -  domain math is a pure layer (no React, no async, no DB calls) with property-based tests via fast-check. Biome for lint/format. Custom dev client (expo-dev-client) for native module support.

The app is built by a Claude Code agent harness on a 30-minute cron -  93+ iterations. Mentioned because it's an interesting constraint, not as the main story.

Android: [Play Store link]
iOS: [App Store link]
Source: [GitHub link]

Screenshots -  use the newer high-quality set from docs/screenshots/ (added Expedition 82):
1. screenshot-6.png -  Today screen (Bench, C2D1, plate viz, START SESSION) -  context shot showing the program flow
2. screenshot-7.png -  Live AMRAP (Bench now., AMRAP sheet open, e1RM calculation) -  lead image for r/reactnative; shows the @gorhom/bottom-sheet interaction and the plate visualization together
3. screenshot-8.png -  Session receipt with embedded PR certificate (In the book., +25 LB) -  shows the receipt design and PR detection

These supersede the older Screenshot_20260527-*.png files for new posts. For the r/reactnative audience, screenshot-7 is the strongest lead: it shows the most technically interesting combination (bottom-sheet API, plate math calculation, AMRAP input) in one view.

---

## If posting standalone (only if r/reactnative rules allow non-thread posts)

**Post title:**
> Show r/reactnative: 531 Strength -  a 5/3/1 tracker with plate visualization, built on Expo SDK 55 New Architecture

**Body:**

Built a focused strength training tracker for the 5/3/1 program. Features I'd expect someone here to find interesting:

**Plate calculator component:** Takes any weight, subtracts bar weight, decomposes the remainder into your available plate set (configurable), displays per-side. Handles both lbs and kg. Uses Reanimated 4 for the reveal animation.

**Stack:**
- Expo SDK 55, React Native 0.83+, New Architecture on
- Drizzle ORM + expo-sqlite (local-first, no backend)
- TanStack Query for data layer
- Reanimated 4 for animations
- expo-notifications (iOS) + react-native-notify-kit (Android live chronometer notification)
- IBM Plex Sans/Mono/Condensed loaded as local assets

**Architecture:** Four-layer boundary enforcement -  design tokens, domain math, persistence, feature composition. Boundary violations fail CI via custom scripts. Domain layer has property-based tests (fast-check) for all training math.

Built by a Claude Code agent harness on a 30-minute cron. 93+ iterations. I mention this not to make the agent story the point, but because the codebase structure reflects it -  the boundary rules exist because early agents violated them and breaking tests were the fix.

Free, no account required.

Android: [Play Store link]
iOS: [App Store link]
Source: [GitHub link]

---

## Posting guidance

- Post in the monthly showcase thread if one is active. Check the subreddit sidebar for the current thread before creating a standalone post.
- Lead with technical specifics. The plate visualization and the Reanimated 4 animation are the interesting bits -  screenshot or GIF of those if possible.
- The agent-built angle is a secondary mention, not the frame. This community cares about the RN implementation, not the AI methodology.
- Expect technical questions about: SQLite performance at scale, Drizzle schema design, Reanimated 4 vs 3 differences, expo-notifications setup for scheduled timers, New Architecture gotchas.
- If asked "would this work with Expo Go?" -  answer: no, uses expo-dev-client for native module support (expo-notifications on Android requires native build).
