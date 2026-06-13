---
name: typography
description: Typographic correctness for the dev blog. Verso applies these rules to every post  - Butterick's *Practical Typography* distilled to what survives in markdown rendered by Astro. Read at the start of every post.
---

# Typography rules for blog posts

These rules are not stylistic. They're correctness  - the same way a misspelled word is a correctness issue. Apply them every time, without asking and without explaining. Source: Matthew Butterick, *Practical Typography*.

## What Verso writes

Markdown files under `apps/web/src/content/blog/`. Astro renders these to HTML with no special typographic processing  - so Unicode characters in the markdown render exactly as written. Use real characters, not entities, not ASCII approximations.

## Characters

### Quotes and apostrophes  - always curly

Curly: `‘ ’ “ ”`. Straight: `' " ' "`. Straight quotes are typewriter artifacts; they should not appear in prose.

- Double quotes around speech, quoted phrases, titles inline: `“like this.”`
- Single quotes for nested quotes inside doubles: `“She said ‘no.’”`
- Apostrophe is the closing single quote `’`  - never the opening one. Common typo: `'70s` → fix to `’70s`. `'n'` → `’n’`.

Smart-quote engines get word-initial contractions wrong (open quote before `’cause`, `’tis`, `’70s`). When pasting, scan for that bug and replace.

### Dashes  - three distinct characters, never approximated

| Char | Use | Examples |
|------|-----|----------|
| `-` (hyphen) | compound words | `e-ink`, `5/3/1`, `boss-Alex` (no, just kidding  - see below) |
| `–` (en dash) | ranges, connections | `1–10`, `pages 4–7`, `Margin–Verso handoff` |
| ` -` (em dash) | sentence breaks | `we shipped it  - then backed it out` |

Never `--` or `---` in published prose. If a sentence break feels right with `--`, write ` -`. Em dashes are usually flush (no surrounding spaces in print typography), but in the markdown-rendered blog context the spaced form (`  - `) reads better at body sizes  - use spaced em dashes. Consistency matters more than the choice; do not mix within a post.

Hyphenate phrasal adjectives (`five-dollar bills`, `agent-built app`). No hyphen after `-ly` adverbs (`carefully designed`, not `carefully-designed`).

### Ellipses  - one character

`…` not `...`. Three dots run together visually wrong and break across lines. Space before and after.

For interrupted speech or trailing thought, prefer the em dash to the ellipsis  - em dash interrupts, ellipsis trails off. Different beats.

### Other punctuation

- **Multiplication**: `×`, not the letter `x`. (`2 × 3`, `6 × 5`.) The 531 program name itself is `5/3/1`, not `5×3×1`.
- **Times in dimensions**: `6′ 2″` uses the *prime* (`′`) and *double prime* (`″`)  - but you will almost never need this in blog prose. If you reach for it, use the actual prime characters.
- **Ampersand** (`&`) only in proper names that include it (`Procter & Gamble`). In body text, write `and`.
- **Exclamation points**: budget one per post. Often zero. Never two in a row.
- **Question marks**: underused. A topic sentence as a question often reads better than a declarative.
- **Emoticons / color emoji**: never in blog body copy. Monochrome Unicode glyphs (★ ✓ ↑) are allowed but rarely needed.

## Spacing

- **One space after a period.** Always. Not two.
- **Non-breaking space** isn't expressible in plain markdown, so this rule lapses  - but be aware that `Dr. Smith`, `§ 1782`, `Fig. 3`, `© 2026` would all take a non-breaking space in HTML. In markdown body text, accept the loss.

## Emphasis

- **Bold OR italic, never both.** Markdown: `**bold**` or `*italic*`. Not `***bolditalic***`.
- **Use sparingly.** If three things in a paragraph are emphasized, none of them read as emphasized.
- **Never use quotation marks for emphasis** (`it was "fine"` to mean *it was not fine*). That's sarcasm punctuation, not emphasis.
- **Never underline.** Markdown has no underline anyway; some renderers allow `<u>`. Don't.
- **All caps**: short labels only, sparingly. The 531 blog has occasional all-caps for headlines and emphasis (`NEXT`, `AMRAP`)  - fine when those are the actual UI labels. Don't all-caps sentences.

## Numbers and units

- **Spell out one through nine in prose**, numerals for 10+. The exception: technical context (`fontSize 9`, `5×5`, `1RM`) keeps numerals throughout. Blog prose leans toward spelled-out: "we shipped four things this loop", not "we shipped 4 things".
- **Numerals and units share a non-breaking space** in formal typography (`30 minutes`, `5 reps`). Markdown can't express it; just live with the rendering.

## Structure

- **Headings**: at most three levels in a post. `#` is the post title (set by frontmatter, not body), so body headings start at `##`. Don't all-caps headings unless very short and intentional.
- **Lists**: real markdown lists (`-` or `1.`), not manual bullets typed as `*` or `>`. Hollow-bullet style (`-`) over asterisks.
- **Block quotes** (`>`) for actual quoted material. Not for emphasis or decoration.
- **Inline code** (`backticks`): only for things the reader has *seen on screen* (the `NEXT` cell, the AMRAP chip if there's a screenshot). Never for filenames, function names, or library names  - the audience rule trumps the typography rule.

## Maxim

> When in doubt, write it both ways and read each aloud. The right one will be obvious.

 - Adapted from Butterick

---

This file is referenced from `04-dev-blog-persona.md` (Verso reads it on every post). If a typography rule changes, edit it here; the persona doc links to this file rather than restating the rules.
