---
name: scripted-corpus-edits
description: How to run a scripted find-replace across many files without corrupting YAML frontmatter. The tick-10 blog em-dash sweep broke frontmatter indentation; the fix is to never let a body regex touch the frontmatter block.
---

# Scripted edits across a file corpus (found 2026-06-13, tick-10, Expedition 88)

When you run a single regex across many Markdown/MDX files at once, the YAML frontmatter
block at the top of each file is a different language from the body and must be edited under
different rules. A regex that is correct for prose can silently corrupt structured YAML.

## The bug

Tick-10 swept 1218 em dashes from 143 blog posts. The first attempt used a replacement that
included a rule like `re.sub(r'  - ', ' - ')` (collapse a leading double-space before a hyphen).
That rule is fine for prose, but in YAML it stripped the indentation of list items:
`  - author:` became `- author:`. That changes the YAML structure (a nested list item becomes
a top-level one), which breaks the frontmatter parse or silently re-shapes the document tree.

The fix: split the sweep into two passes:

- a **frontmatter-safe** pass that only does substitutions known to be inert inside YAML
  (e.g. replacing a literal em dash inside a quoted scalar), and
- a **body-only** pass for everything that depends on surrounding whitespace.

## The rule for future ticks

1. **Split the frontmatter from the body before any whitespace-sensitive regex.** Markdown
   frontmatter is delimited by the first two `---` lines. Apply body-targeting substitutions
   to the body slice only; never let a "collapse spaces" or "trim before hyphen" rule run over
   the frontmatter.
2. **Never collapse or trim leading whitespace in YAML.** Indentation is load-bearing: it
   encodes nesting. `  - x` and `- x` are different documents.
3. **Verify with a parse, not a grep.** After a corpus sweep, run the build that parses the
   frontmatter (for blog: the Astro build, which validates the content-collection schema). A
   grep can confirm the target glyph is gone while the document tree is quietly wrong. The
   schema parse is the real proof. Astro build "clean (N pages)" is the green light.
4. **Round-trip on one file first.** Run the script against a single representative file,
   diff it, and eyeball the frontmatter before fanning out to the whole corpus.

## Why this generalizes beyond em dashes

This is not an em-dash lesson; it is a scripted-corpus-edit lesson. Any mass find-replace on
files that carry frontmatter (blog posts, MDX, anything with a YAML or TOML header) has the
same trap. See `22-web-em-dash-debt.md` for the em-dash-specific placeholder-glyph handling,
and treat the frontmatter split as the first step of any such sweep.
