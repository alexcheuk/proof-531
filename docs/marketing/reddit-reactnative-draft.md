---
tactic: 8
channel: r/reactnative
status: draft
ready_to_post: false
trigger: iOS live on App Store (post in the monthly side-project showcase thread)
drafted: 2026-05-29 (Expedition 41)
---

# r/reactnative — Post Draft

## Research context

r/reactnative runs a monthly side-project showcase thread. The community is technical. The winning angle here is the stack and the interesting components — not the AI loop (mention it briefly, don't lead with it). Developers who lift will install it. Developers who don't will upvote the engineering angle if there's something technically interesting.

The plate visualization is the interesting component: it decomposes any training weight into real plates (e.g., 2x45 + 1x25 + 1x5 per side for a 225lb lift at 45lb bar), accounting for bar weight and your available plate set. Showing that is more compelling than describing it.

---

## Monthly showcase thread reply (recommended)

**Copy:**

Built a 5/3/1 strength tracker — free, no account, local SQLite.

Stack: Expo SDK 55, React Native New Architecture, Drizzle ORM + expo-sqlite, TanStack Query, Reanimated 4, expo-notifications. IBM Plex Sans/Mono/Condensed from local assets (no Google Fonts).

Interesting component: a plate visualization that decomposes any weight into your actual plate set, shown per side accounting for bar weight. Works in both lbs and kg with configurable available plates.

Architecture enforces layer boundaries — domain math is a pure layer (no React, no async, no DB calls) with property-based tests via fast-check. Biome for lint/format. Custom dev client (expo-dev-client) for native module support.

The app is built by a Claude Code agent harness on a 30-minute cron — 70+ iterations. Mentioned because it's an interesting constraint, not as the main story.

Android: [Play Store link]
iOS: [App Store link]
Source: [GitHub link]

Screenshots from docs/marketing/screenshots/:
1. Screenshot_20260527-003320.png — Live session with plate visualization (155 LB x5, 45+10 per side displayed, full working set list) — the interesting RN component to lead with
2. Screenshot_20260527-003330.png — AMRAP set in progress (Bench now, 200 LB x5+, LOG AMRAP sheet open with e1RM calculation) — shows the bottom sheet interaction
3. Screenshot_20260527-001435.png — Today screen (Cycle 2 Day 1, cycle progress grid, TM/e1RM stats)

---

## If posting standalone (only if r/reactnative rules allow non-thread posts)

**Post title:**
> Show r/reactnative: 531 Strength — a 5/3/1 tracker with plate visualization, built on Expo SDK 55 New Architecture

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

**Architecture:** Four-layer boundary enforcement — design tokens, domain math, persistence, feature composition. Boundary violations fail CI via custom scripts. Domain layer has property-based tests (fast-check) for all training math.

Built by a Claude Code agent harness on a 30-minute cron. 70+ iterations. I mention this not to make the agent story the point, but because the codebase structure reflects it — the boundary rules exist because early agents violated them and breaking tests were the fix.

Free, no account required.

Android: [Play Store link]
iOS: [App Store link]
Source: [GitHub link]

---

## Posting guidance

- Post in the monthly showcase thread if one is active. Check the subreddit sidebar for the current thread before creating a standalone post.
- Lead with technical specifics. The plate visualization and the Reanimated 4 animation are the interesting bits — screenshot or GIF of those if possible.
- The agent-built angle is a secondary mention, not the frame. This community cares about the RN implementation, not the AI methodology.
- Expect technical questions about: SQLite performance at scale, Drizzle schema design, Reanimated 4 vs 3 differences, expo-notifications setup for scheduled timers, New Architecture gotchas.
- If asked "would this work with Expo Go?" — answer: no, uses expo-dev-client for native module support (expo-notifications on Android requires native build).
