---
name: dev-blog
description: Every /loop iteration ends by writing a markdown entry in apps/web/src/content/blog/. Off-cycle entries are also allowed when a session produced a real decision or learning worth recording — with or without code shipped. The entry summarizes what shipped (or what was decided), names the Discord prompts that shaped it, and is committed in the same push as the work. The website auto-deploys on push to main.
---

# Dev blog — write one entry per loop (and occasionally off-cycle)

> **How to actually write one:** invoke the `post-as-verso` skill (`.claude/skills/post-as-verso/SKILL.md`). The skill assembles inputs and dispatches the `verso` agent (`.claude/agents/verso.md`), which reads this file plus the persona doc plus `notes-from-alex.md` plus the decision log, then writes the post and verifies the build. Don't call `Write` on a blog file directly from a loop or ad-hoc session — go through the skill so voice continuity, schema, and the build check all happen consistently. The rest of this file is reference material the agent reads.

## Where it lives

`apps/web/src/content/blog/<YYYY-MM-DD>-<kebab-slug>.md`

If two loops land on the same day, append `-2`, `-3`, … so filenames stay unique
and sortable. The slug should be a short headline, e.g.
`2026-05-24-history-tab-gets-honest`, not the full title.

## What every entry MUST include (frontmatter)

```yaml
---
title: '<headline, ≤ 70 chars, no trailing period>'
summary: >-
  <2–3 sentence elevator pitch for the loop. Lead with the most interesting
  thing that shipped, not a list of everything.>
pubDate: <YYYY-MM-DD>          # the date the loop ran
loopId: 'loop-NNN'             # zero-padded, monotonically increasing
loopIso: '<ISO 8601 timestamp>'
commitCount: <int>             # commits in this loop
tags: ['<area>', '<area>', …]  # 1–4 short tags: 'history', 'session', 'refactor', 'a11y', etc.
discordPrompts:                # OMIT if no Discord asks were picked up
  - author: '<discord handle>'
    channel: '#task-queue'
    text: >-
      <verbatim message, redact only if it's clearly private>
---
```

The schema lives in `apps/web/src/content.config.ts`. Anything you add that
isn't in the schema will fail the build — extend the schema first if needed.

## What the body should cover

Pick whichever of these are actually true for the loop. Don't pad. Skip
sections that have nothing to say.

1. **What changed** — short bullets, grouped by area (Session / History /
   Design system / Tooling / etc.). Link commit short SHAs in backticks.
2. **Why it changed** — a sentence or two on the motivation per cluster.
   Especially important when a Discord prompt drove the work.
3. **Surprises** — honest notes on what tripped you up: a Reanimated quirk, a
   Drizzle behavior, a token that drifted, a test that lied. This is the
   most interesting part of the blog for readers and should not be skipped
   when there's something real to say.
4. **What's queued next** — only if there are real, named follow-ups. Don't
   invent them.

Aim for ~300–600 words. Less is fine. More is fine. Don't write filler.

## When to write it

**During a loop:** after the harness is green and you've staged the diff,
but BEFORE the final commit. The blog entry is part of the loop's diff —
it ships in the same commit (or a final commit) and pushes alongside the
code. Vercel rebuilds the site automatically on push to `main`.

If the loop ships zero code changes (rare — see loop-pacing rules), still
write an entry that says so plainly. Honesty is the product.

**Off-cycle:** an off-cycle post is allowed when a session produced a
real decision or learning worth recording but no code shipped — boss
Alex shifting the blog's direction, the persona itself changing, a
meaningful judgment call made in conversation. The bar is "Verso
learned something, or Verso made a decision worth knowing about."
If you're unsure whether it clears the bar, it probably doesn't.

Off-cycle posts omit `loopId`, `loopIso`, and `commitCount` from
frontmatter — the schema allows omission. The post still has to build.

## Tone

- First-person plural ("we shipped", "we found") for the shipped work;
  first-person singular for Verso's own beat (decisions, learning,
  near-misses). The team is Alex + every agent that touched the iteration.
- When the work came from an explicit ask, name Alex. Don't abstract to
  "the user".
- Concrete > abstract. Name the file, the function, the commit.
- No emoji in the markdown body (project rule — [[no-color-emojis]]).
  Monochrome unicode glyphs are fine but rarely needed in prose.
- Don't editorialize about how impressive the work is. The diff speaks for
  itself; the blog just explains it.
- See [[dev-blog-persona]] for voice and the meta-beat menu (rate-limited
  to one per post).

## Discord prompts — what to include

Every message from `#task-queue` that you `:+1:`'d THIS loop should appear in
`discordPrompts`. Quote the text verbatim (the public site is part of the
point — the messages are the receipts). If the user filed something private,
flag it in the Discord summary instead and skip it.

If no Discord prompts drove this loop's work, omit the `discordPrompts` key
entirely (don't write an empty array — the schema allows omission).

## Verification before commit

```bash
pnpm --filter @fivethreeone/web build
```

Exit 0 ⇒ the entry parses and the site builds. If this fails because of
schema (frontmatter), fix the frontmatter; if it fails because of MDX/markdown
syntax, fix the markdown. Don't disable the schema.

## Crosslinks

- The website itself: `apps/web/`
- Schema: `apps/web/src/content.config.ts`
- Listing page: `apps/web/src/pages/blog/index.astro`
- Decision log (primary source): `docs/decision-log.md`
- Author persona: [[dev-blog-persona]]
- Loop pacing rules: [[loop-pacing]]

## Persona & sources

Before drafting, read [[dev-blog-persona]] — the post is written as **Verso**, a named scribe persona with a specific voice. (Margin held this seat for the first twenty-four entries and was let go on 2026-05-26.) Verso's primary sources are `docs/decision-log.md` (the *why* behind everything notable that shipped) and `loop-memory/notes-from-alex.md` (the operating-context running file); the diff and Discord trail are secondary.
