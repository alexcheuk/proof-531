---
name: astro-css-dynamic-injection
description: Gotcha — Astro scoped CSS does not apply to HTML injected via innerHTML in <script is:inline> blocks. Use <style is:global> for those rules.
---

# Astro CSS scoping — the innerHTML trap

## The problem

Astro scopes `<style>` blocks by:
1. Adding a `data-astro-cid-xxxxxxxx` attribute to every element in the static template
2. Rewriting CSS selectors to include that attribute: `.cycle-row { }` → `.cycle-row[data-astro-cid-xxxxxxxx] { }`

When JavaScript uses `element.innerHTML = html` to inject new DOM, those new elements are **created at runtime** and **never receive the `data-astro-cid-xxx` attribute**. Result: the scoped CSS selectors don't match them, so they render completely unstyled.

## Symptom

The static wrapper elements look fine (borders, padding, backgrounds from scoped CSS). But the content *inside* those wrappers — injected by JS — has no grid layout, no flex, no typography. In the goal-calendar, cycle rows showed as inline spans concatenated like "1295 LB4 WK". In the plate-math barbell, the flex diagram collapsed.

## Root cause discovered

`apps/web/src/pages/tools/goal-calendar.astro` and `apps/web/src/pages/tools/plate-math.astro` — both use `<script is:inline>` blocks that set `element.innerHTML` to render dynamic output. All the CSS for that injected content lived in the scoped `<style>` block.

## The fix (expedition 51)

Added a second `<style is:global>` block after the existing `<style>` block in each file, containing only the rules for dynamically injected elements. The original scoped block was NOT modified (it still correctly styles static elements).

## Rule for future work

**Any time an Astro page uses `element.innerHTML = htmlString` to inject content, the CSS for those injected elements MUST go in a `<style is:global>` block, not the default scoped `<style>` block.**

Two options:
1. Add a second `<style is:global>` block for just the dynamic-element rules (preferred for standalone pages)
2. Use `:global(.selector)` syntax inline in the scoped block

Use option 1 for pages where the dynamic content is the primary content (tools, calculators). Use option 2 when only a few selectors need it.

## Harness gap

CI (`typecheck + lint + test`) does NOT catch this. The HTML renders correctly in build output (static elements have correct structure), and the CSS is valid. The bug only manifests in a browser. There is no automated browser test yet.

**What would catch this:** a Playwright or Puppeteer smoke test that loads each tool page and checks that key elements have the expected `display` computed style (e.g., assert `.cycle-row` has `display: grid`). Not yet in the harness — flagged here as a future improvement.
