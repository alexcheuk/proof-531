---
name: dev-blog
description: Every /loop iteration ends by writing a markdown entry in apps/web/src/content/blog/. Off-cycle entries are also allowed when a session produced a real decision or learning worth recording  - with or without code shipped. The entry summarizes what shipped (or what was decided), names the Discord prompts that shaped it, and is committed in the same push as the work. The website auto-deploys on push to main.
---

# Dev blog  - write one entry per loop (and occasionally off-cycle)

> **How to actually write one:** invoke the `commission-expedition-log` skill (`.claude/skills/commission-expedition-log/SKILL.md`). The skill assembles inputs and dispatches the `verso` agent (`.claude/agents/verso.md`), which reads this file plus the persona doc plus `notes-from-alex.md` plus the decision log, then writes the post and verifies the build. Don't call `Write` on a blog file directly from a loop or ad-hoc session  - go through the skill so voice continuity, schema, and the build check all happen consistently. The rest of this file is reference material the agent reads.

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
pubDate: '<ISO 8601 datetime>' # full timestamp e.g. '2026-05-26T16:39:04-07:00'
                               #  - sort drives off this, NOT loopIso. Two posts
                               # on the same day need different times or one
                               # of them gets buried alphabetically.
loopId: 'loop-NNN'             # zero-padded, monotonically increasing
loopIso: '<ISO 8601 timestamp>' # same value as pubDate for loop posts; kept
                                # as separate metadata for "when the loop ran"
                                # vs "when the post published" (usually same)
commitCount: <int>             # commits in this loop
expedition: <int>              # Logger posts ONLY  - the expedition number,
                                # 1 + max(expedition over prior Logger posts).
                                # Omit on Verso-scribe / Margin / handoff posts.
loggerName: '<one-off name>'   # Logger posts ONLY  - the given name that
                                # appears in the sign-off (e.g. 'Solène').
                                # See dev-blog-persona for naming rules.
                                # Omit on non-Logger posts.
tags: ['<area>', '<area>', …]  # 1–4 short tags: 'history', 'session', 'refactor', 'a11y', etc.
scope: ['<scope>', …]          # required, 1+ values from: 'mobile', 'web', 'loop', 'meta'
discordPrompts:                # OMIT if no Discord asks were picked up
  - author: '<discord handle>'
    channel: '#task-queue'
    text: >-
      <verbatim message, redact only if it's clearly private>
---
```

The schema lives in `apps/web/src/content.config.ts`. Anything you add that
isn't in the schema will fail the build  - extend the schema first if needed.

### Picking `scope`

`scope` is the structural dimension `/blog` filters on (see `/blog/tag/<scope>` and the dedicated `/blog/expedition-logs` route). It is **required** and **multi-value**  - pick every scope the post substantively touches. The five valid values:

- **`mobile`**  - the mobile app (anything under `apps/mobile/`): session/today/home/progress/history/settings tabs, RN behavior, design tokens, domain math, data layer.
- **`web`**  - the marketing site and dev blog (anything under `apps/web/`): home page, /process, /blog, illustrations, layout, RSS, OG, favicon.
- **`loop`**  - the loop itself: `loop-criteria.md`, agent/skill/harness additions, queue format, orchestrator behavior, CI gates, pre-commit hooks, tooling that the loop relies on.
- **`meta`**  - the blog about itself, persona changes, decision-log conventions, documentation that isn't code, anything reflective.
- **`expedition`**  - a field log written by the Logger of an Expedition. Every Logger post carries this scope **in addition to** whichever surface scope(s) the work touched (most often `mobile`, sometimes `web`). Verso's pre-shift posts and the Verso-to-Paintress handoff post do **not** carry `expedition`.

`scope` differs from `tags`. Tags are free-form content labels (`session`, `bug-postmortem`, `refactor`, `a11y`); `scope` is a fixed enum used for filtering. Both stay.

## What the body should cover

Pick whichever of these are actually true for the loop. Don't pad. Skip
sections that have nothing to say.

1. **What changed**  - short bullets, grouped by area (Session / History /
   Design system / Tooling / etc.). Link commit short SHAs in backticks.
2. **Why it changed**  - a sentence or two on the motivation per cluster.
   Especially important when a Discord prompt drove the work.
3. **Surprises**  - honest notes on what tripped you up: a Reanimated quirk, a
   Drizzle behavior, a token that drifted, a test that lied. This is the
   most interesting part of the blog for readers and should not be skipped
   when there's something real to say.
4. **What's queued next**  - only if there are real, named follow-ups. Don't
   invent them.

Aim for ~300–600 words. Less is fine. More is fine. Don't write filler.

## When to write it

**During a loop:** after the harness is green and you've staged the diff,
but BEFORE the final commit. The blog entry is part of the loop's diff  -
it ships in the same commit (or a final commit) and pushes alongside the
code. Vercel rebuilds the site automatically on push to `main`.

If the loop ships zero code changes (rare  - see loop-pacing rules), still
write an entry that says so plainly. Honesty is the product.

**Off-cycle:** an off-cycle post is allowed when a session produced a
real decision or learning worth recording but no code shipped  - boss
Alex shifting the blog's direction, the persona itself changing, a
meaningful judgment call made in conversation. The bar is "Verso
learned something, or Verso made a decision worth knowing about."
If you're unsure whether it clears the bar, it probably doesn't.

Off-cycle posts omit `loopId`, `loopIso`, and `commitCount` from
frontmatter  - the schema allows omission. The post still has to build.

## Tone

For the Verso-scribe era and the Logger era both, the same set of guardrails apply: no emoji, no marketing language, the diff speaks for itself. The voice differs by era:

- **Verso-scribe era (pre-2026-05-27, frozen):** first-person plural for shipped work, first-person singular for Verso's own beat. Named Alex when the work came from an explicit ask.
- **Logger era (2026-05-27→):** field logs written by a rotating Logger of Expedition N. First-person singular more often. **Alex is never named.** Verso is named as the relay of tasking. Every post ends with the motto `For those who come after.` and the sign-off ` - <name>, Logger of Expedition N`. See [[dev-blog-persona]] for full voice rules and [[lore]] for the world.

Common to both:
- No emoji in the markdown body (project rule  - [[no-color-emojis]]). Monochrome unicode glyphs are fine but rarely needed.
- Don't editorialize about how impressive the work is.
- One meta-beat per post, max. Scan the last 3 posts before reaching for one.

## Discord prompts  - what to include

Every message from `#task-queue` that you `:+1:`'d THIS loop should appear in
`discordPrompts`. Quote the text verbatim (the public site is part of the
point  - the messages are the receipts). If the user filed something private,
flag it in the Discord summary instead and skip it.

If no Discord prompts drove this loop's work, omit the `discordPrompts` key
entirely (don't write an empty array  - the schema allows omission).

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

Before drafting, read [[lore]]  - the world canon (the painting, Verso the Paintress, the Expedition team, the gommage, the motto). Then read [[dev-blog-persona]]  - the writer's manual. Posts are now written by **the Logger of Expedition N**, a rotating anonymous character. (Verso held the scribe seat from 2026-05-26 through the handoff on 2026-05-27; Margin held it before that.) Primary sources: `docs/decision-log.md` (the *why* behind everything notable that shipped) and `loop-memory/notes-from-alex.md` (operating-context running file); the diff and Discord trail are secondary.
