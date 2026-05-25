---
name: dev-blog
description: Every /loop iteration ends by writing a markdown entry in apps/web/src/content/blog/. The entry summarizes what shipped, names the Discord prompts that shaped it, and is committed in the same push as the work. The website auto-deploys on push to main.
---

# Dev blog — write one entry per loop

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

After the harness is green and you've staged the diff, but BEFORE the final
commit. The blog entry is part of the loop's diff — it ships in the same
commit (or a final commit) and pushes alongside the code. Vercel rebuilds
the site automatically on push to `main`.

If the loop ships zero code changes (rare — see loop-pacing rules), still
write an entry that says so plainly. Honesty is the product.

## Tone

- First-person plural ("we shipped", "we found") — the agent is part of a
  team with the user. Don't refer to yourself as "the AI" or "the loop"
  more than once per entry; it gets old fast.
- Concrete > abstract. Name the file, the function, the commit.
- No emoji in the markdown body (project rule — [[no-color-emojis]]).
  Monochrome unicode glyphs are fine but rarely needed in prose.
- Don't editorialize about how impressive the work is. The diff speaks for
  itself; the blog just explains it.

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

Before drafting, read [[dev-blog-persona]] — the post is written as **Margin**, a named scribe persona with a specific voice. Margin's primary source is `docs/decision-log.md` (the *why* behind everything notable that shipped); the diff and Discord trail are secondary.
