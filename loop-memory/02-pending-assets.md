---
name: pending-assets
description: Image asset work that cannot be done from the Claude seat (no PNG generation). Surface to a designer/handoff.
---

# Pending image assets

Cannot be generated from the loop seat (no PNG tooling); flag to user on each loop until provided.

## Web OG image (1200×630)

- **Need:** `apps/web/public/og.png` — a 1200×630 paper-tone card with
  the 531 wordmark + amber accent dot so social shares of `531.dev`
  and its blog posts get a real preview instead of a missing-image
  placeholder.
- **Spec:** matches the e-ink aesthetic — `#E7E3D6` paper bg, ink-0
  text, the canonical "531" wordmark (IBM Plex Sans Condensed Bold)
  with the amber period (`#8E5345`). Reserve the right half for a
  short tagline ("Train 5/3/1. Skip the spreadsheet.").
- **Wire-up:** once the file lands at `apps/web/public/og.png`,
  update `Base.astro`'s default `ogImage` prop to point at
  `'/og.png'` so every page picks it up unless an override is
  passed.
- **Workaround until asset arrives:** loop-006 wired `og:site_name`
  + `og:locale` so the share card at least gets a richer text-only
  preview. Social platforms that require an image won't show a card
  at all — that's the deliberate tradeoff.

## App Store / Play Store screenshots

- Not built yet. Defer until we have a TestFlight build to capture
  from.

## Favicon PNG fallbacks (loop-040)

- An inline SVG favicon shipped in loop-040
  (`apps/web/public/favicon.svg`, wired in `Base.astro`). All
  modern browsers render it. Older browsers and some social
  preview tools want PNG fallbacks (`favicon-32x32.png`,
  `favicon-16x16.png`, `apple-touch-icon-180x180.png`). These
  need image-export tooling we don't have from the loop seat —
  surface to a designer/handoff when they next produce assets.
- The SVG itself is intentionally minimal — a paper-colored
  square, "531" in a sans-serif fallback chain, and the amber
  brand dot. IBM Plex won't be available without a downloaded
  font file, so the fallback (Helvetica / Arial) carries the
  glyph at favicon scale.
