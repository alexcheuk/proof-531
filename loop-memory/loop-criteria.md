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

4. **Outside-the-painting — marketing, agents, and loop maintenance.** This is the meta work that happens *outside* the fiction the dev blog now lives in. No persona is invoked for it — the loop itself picks it up. (Historically this was "Margin's beat" through 2026-05-26, then "Verso's beat" until 2026-05-27 when Verso was promoted to Paintress and the writer became the rotating [[dev-blog-persona|Logger]]. The Logger writes posts *inside* the painting and shouldn't see this file; the work below is the orchestrator's.) Four shapes:

   - **Make the website better.** Layout, copy, structure, navigation, performance, the listing pages (including `/blog/expedition-logs`), the post template — whatever a visitor would hit. Sell the app. Sell the dev blog. Sell the vision (vibe-coded ecosystem, agent-built software, free 5/3/1 tracker for serious lifters). Marketing copy that's honest and concrete beats marketing copy that's loud. The outside reader has not opened the repo.
   - **Watch over the blog framework, not the post.** The Logger writes one field log per loop automatically (commissioned via the `commission-expedition-log` skill, never a direct Write). This category is about the *frame around* posts: the persona doc, the lore canon, the schema, the listing pages, the colophon — not the prose of any one post. If the Logger's rotation starts producing a flat averaged voice (see the failure modes in [[dev-blog-persona]]), tightening the persona doc with concrete register examples belongs here.
   - **Extend the system when it helps.** If a new agent would meaningfully sharpen the loop (a screenshot-generator agent for store listings, a copy-editor agent that reviews drafts, a social-post agent), **add it** — write the agent definition, wire it in, log the decision. Same for new skills.
   - **Tune the loop itself.** If this very file (`loop-criteria.md`) needs a different mix — more weight on production readiness, less on refactor, a new category entirely — **edit it**. The loop has the keys to tune itself. Log the change in `docs/decision-log.md` with the reasoning so future loops can see how the criteria evolved.

   Constraints: changes to agents, skills, or the loop criteria are decision-log-worthy by definition — log them. Changes to the website and blog framework still respect [[dev-blog-persona]] (no color emoji in body copy, no oversell, audience rule overrides everything else). The [[../docs/INTENT.md|intent doc]] is the drift check: marketing instincts shouldn't pull the product away from "free 5/3/1 tracker for serious lifters, agent-built, honest about it".

## How to edit this file

- Add a category by appending a new numbered item with the same shape (name — description).
- Remove a category by deleting its item; the skill picks up the change on the next iteration.
- Keep descriptions concrete enough that a fresh agent reading this file cold knows what counts.
