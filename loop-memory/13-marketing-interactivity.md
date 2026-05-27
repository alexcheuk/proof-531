---
name: marketing-interactivity
description: How interactive widgets work on the otherwise-static Astro marketing site. Two live now (goal calculator, plate calculator) — same pattern, no client framework.
---

# Marketing-site interactivity — vanilla JS + bundled TS imports

The marketing site (`apps/web`) is server-rendered Astro with no React /
Vue / Svelte runtime. When a section needs to react to user input (the
goal calculator, the interactive plate calculator), the pattern is:

1. **Server-render the initial state** with the normal Astro template
   (`<PhonePlateBar weight={250} />` for the static snapshot).
2. **Mark the interactive region** with `data-*` attributes
   (`data-plate-calc`, `data-plate-weight`, etc.) so JS can find it
   without depending on CSS class selectors that styling might change.
3. **Add a `<script>` block** at the bottom of the page. Astro
   processes these — `import { decompose, ... } from '~/lib/plates'`
   bundles the imports into the page's emitted JS. No CDN, no
   per-component framework runtime.
4. **On change, re-render the dynamic bits in place.** Keep the
   outer chrome (collars, bar-mid, layout containers) as the SSR
   produced it; replace only the `.stack` children + the readout
   spans. Easier than tearing down + rebuilding the whole widget.

## Live examples

- **Goal calculator** (loop-014, hero phone & program section) —
  lift picker, TM/1RM kind toggle, ± steppers, days-per-week stepper,
  outcome row that says "~N work days away · ≈ K mo at D/wk".
  Math: `cyclesUntilTmGoal` shape, mirrors the mobile `GoalPanel`.
- **Plate calculator** (loop-018, `#plate` section) — ± steppers on
  the target weight, plate stacks + caption + readout (per side /
  bar / plates) re-rendered off `~/lib/plates.decompose`. Discord
  1508988573.

## Rules that emerged

- **Don't re-emit the whole Astro template in JS.** Keep the chrome,
  swap only what depends on the state. The plate-card script
  replaces `.stack-left` + `.stack:not(.stack-left)` + `.caption-r`,
  toggles the collar's `display`, updates the readout spans. The
  Astro template's existing class names + inline styles are reused
  verbatim.
- **Math lives in `~/lib/*.ts`, not the script block.** Both widgets
  import from `~/lib/plates` (or the inline `cyclesUntilGoal`-ish
  function). Bundles cleanly via Astro's script processor.
- **Disable the stepper at the bounds.** `MIN` (empty bar), `MAX`
  (a reasonable ceiling like 600 lb). Cheap a11y win.
- **Re-render once on mount** even if the SSR snapshot already
  shows the right numbers — guarantees the JS state and DOM agree
  before the first user click.
- **Astro `<style>` blocks are scoped — JS-injected elements DON'T
  inherit them.** Loop-020 caught this the hard way: the plate
  calculator's SSR plates rendered with rotated labels (the scoped
  `.plate-label { transform: rotate(-90deg); }` from
  `PhonePlateBar.astro` applied), but the JS-rebuilt plates after
  the first stepper click rendered the labels flat — Astro adds a
  data-attr to scoped selectors that the dynamic spans don't carry.
  Fix: inline the rotation + font styles on the JS-injected label
  via `style.cssText`. Same for the plate layout (`display: flex` +
  centered children) on the parent `<div class="plate">`. Anything
  the JS path emits must carry its layout-critical styles inline,
  even if the matching SSR element has them via the scoped block.
  Don't reach for `is:global` on the component's `<style>` — the
  scope exists for a reason.

## What not to do

- Don't reach for a client-side framework (React island, Solid,
  preact). The site is small and shipping a runtime for two widgets
  would bloat every page. Vanilla works.
- Don't put SVG-based plate geometry math in the script. The
  `sizeFor()` ramp + `plateLabel()` formatting + grouping rules all
  live in `~/lib/plates.ts` so the mobile primitive and the web
  illustration can't drift.
- Don't write per-component scripts in separate files unless the
  widget is reused across pages. Inline at the bottom of the page
  that owns it; Astro will bundle it.
