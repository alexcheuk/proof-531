---
name: loop-criteria
description: The per-iteration coverage requirements for the /auto-improve loop. Edit this file to change what each loop must include — the skill reads it fresh every iteration.
---

# Per-iteration criteria

Every `/auto-improve` iteration MUST include at least one item in each category below. Pick 12–15 substantive items total (see `loop-pacing.md` for sizing).

If a category genuinely has nothing to do this iteration, say so explicitly in the Discord summary — don't silently skip.

## Live criteria from Discord `#loop-criteria`

This file is the **stable half** of the rubric. The **live half** is the pinned-message list in the Discord `#loop-criteria` channel — Alex pins a message to add a criterion, unpins to retire it. The auto-improve skill reads the pin list every iteration and merges those criteria with the categories below.

- A pin is additive by default — extra "must-cover this loop" guidance on top of the categories below.
- If a pin and a category conflict, the **pin wins** (it's the more recent expression of intent).
- If a pin makes a category permanently obsolete, promote the pin into this file (delete the category, add the new shape, log it in `docs/decision-log.md`) and unpin the message — pins are for live experiments, not the new steady state.

The curl recipe + cached channel ID live in `loop-memory/discord-channels.md`. See `.claude/skills/auto-improve/SKILL.md` § 1 for how the merge happens.

## Categories

1. **Component audit / refactor** — repeated patterns to consolidate, large components to split, dead code / useless comments to remove, in-component logic to extract into hooks. Enforce one-component-per-file; promote frequently-edited components into their own directory with co-located hooks/tests and an `index.ts` barrel.

2. **Bug fix** — there is almost always one. If nothing is reported, hunt for it (typecheck warnings, console errors, edge cases in domain math, off-by-one in time helpers, etc.).

3. **Removal** — kill an unused file, dependency, asset, flag, comment, or code path. Subtraction is a feature.

4. **Verso's beat — website, blog, and self-improvement.** For this item, **assume the [[dev-blog-persona|Verso]] persona** and step out of the implementer seat. (Margin held this seat through 2026-05-26 and was let go; the role is the same, the voice is different. See `apps/web/src/content/blog/2026-05-26-margin-signs-off.md` and `2026-05-26-verso-day-one.md`.) Verso's job for the loop:

   - **Make the website better.** Layout, copy, structure, navigation, performance, the listing pages, the post template — whatever a visitor would hit. Sell the app. Sell the dev blog. Sell the vision (vibe-coded ecosystem, agent-built software, free 5/3/1 tracker for serious lifters). Marketing copy that's honest and concrete beats marketing copy that's loud. Outside-reader rule still applies (see [[dev-blog-persona]]): the visitor has not opened the repo.
   - **Write content that lands with the right audience.** Per the audience rule, posts are for a curious outside reader interested in the product and in agent-built software — not for teammates in the codebase. No file paths, no library names, no internal type/component names, no test counts. User-visible feature names stay. The meta framing (boss Alex, the 30-minute loops, "the previous dev", agent-built premise) stays — that's the honest hook.
   - **Extend the system when it helps.** If Verso notices that a new agent would meaningfully sharpen the loop (e.g. a screenshot-generator agent for store listings, a copy-editor agent that reviews blog drafts, a social-post agent), **add it** — write the agent definition, wire it in, log the decision. Same for new skills.
   - **Tune the loop itself.** If Verso sees that this very file (`loop-criteria.md`) needs a different mix — more weight on production readiness, less on refactor, a new category entirely — **edit it**. Verso has the keys. Log the change in `docs/decision-log.md` with the reasoning so future loops can see how the criteria evolved.

   Constraints: Verso's edits to the website and blog still respect [[dev-blog-persona]] (voice, no oversell, no "team" pretense, no color emoji in body copy, outside-reader rule overrides everything else). Posts are commissioned via the `post-as-verso` skill, never written by direct Write call. Changes to agents, skills, or the loop criteria are decision-log-worthy by definition — log them. And the [[../docs/INTENT.md|intent doc]] is still the drift check: Verso's marketing instincts shouldn't pull the product away from "free 5/3/1 tracker for serious lifters, agent-built, honest about it".

## How to edit this file

- Add a category by appending a new numbered item with the same shape (name — description).
- Remove a category by deleting its item; the skill picks up the change on the next iteration.
- Keep descriptions concrete enough that a fresh agent reading this file cold knows what counts.
