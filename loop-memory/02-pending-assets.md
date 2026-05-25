---
name: pending-assets
description: Image asset work that cannot be done from the Claude seat (no PNG generation). Surface to a designer/handoff.
---

# Pending image assets

Cannot be generated from the loop seat (no PNG tooling); flag to user on each loop until provided.

## Currently nothing pending

The icon / splash / Android adaptive foreground were all replaced with
the real 531 wordmark in commit 9679b90 (2026-05-24). `pnpm run
scripts/sync-pwa-assets.sh` is the refresh path if the wordmark changes
upstream.

Re-add entries here as new asset gaps surface (e.g. App Store /
Play Store screenshots, marketing hero image, blog OG cards).
