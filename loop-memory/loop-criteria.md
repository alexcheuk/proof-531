---
name: loop-criteria
description: The per-iteration coverage requirements for the /auto-improve loop. Edit this file to change what each loop must include — the skill reads it fresh every iteration.
---

# Per-iteration criteria

Every `/auto-improve` iteration MUST include at least one item in each category below. Pick 12–15 substantive items total (see `loop-pacing.md` for sizing).

If a category genuinely has nothing to do this iteration, say so explicitly in the Discord summary — don't silently skip.

## Categories

1. **Component audit / refactor** — repeated patterns to consolidate, large components to split, dead code / useless comments to remove, in-component logic to extract into hooks. Enforce one-component-per-file; promote frequently-edited components into their own directory with co-located hooks/tests and an `index.ts` barrel.

2. **Feature improvement or addition** — something that makes the app feel better to use. Be careful with net-new features: only add if it doesn't complicate the surface and clearly adds value (e.g. "History tab gains a sense-of-achievement signal").

3. **Bug fix** — there is almost always one. If nothing is reported, hunt for it (typecheck warnings, console errors, edge cases in domain math, off-by-one in time helpers, etc.).

4. **Removal** — kill an unused file, dependency, asset, flag, comment, or code path. Subtraction is a feature.

5. **Dev workflow / process improvement** — faster local loops, better CI signal, sharper pre-commit, cleaner scripts, better agent harness, sharper memory files.

6. **Production readiness** — anything that moves the app closer to shippable: marketing copy, store metadata, icon/splash polish, accessibility, automated pipelines, error reporting, store-listing screenshots, CHANGELOG entries.

7. **Margin's beat — website, blog, and self-improvement.** For this item, **assume the [[dev-blog-persona|Margin]] persona** and step out of the implementer seat. Margin's job for the loop:

   - **Make the website better.** Layout, copy, structure, navigation, performance, the listing pages, the post template — whatever a visitor would hit. Sell the app. Sell the dev blog. Sell the vision (vibe-coded ecosystem, agent-built software, free 5/3/1 tracker for serious lifters). Marketing copy that's honest and concrete beats marketing copy that's loud.
   - **Write content that lands with devs of all levels.** A junior should be able to read a post and feel like they learned something about how this kind of system fits together. A staff engineer should find a non-obvious detail. No hand-waving. No "powered by AI" filler. Concrete examples, real file paths, real trade-offs.
   - **Extend the system when it helps.** If Margin notices that a new agent would meaningfully sharpen the loop (e.g. a screenshot-generator agent for store listings, a copy-editor agent that reviews blog drafts, a social-post agent), **add it** — write the agent definition, wire it in, log the decision. Same for new skills.
   - **Tune the loop itself.** If Margin sees that this very file (`loop-criteria.md`) needs a different mix — more weight on production readiness, less on refactor, a new category entirely — **edit it**. Margin has the keys. Log the change in `docs/decision-log.md` with the reasoning so future loops can see how the criteria evolved.

   Constraints: Margin's edits to the website and blog still respect [[dev-blog-persona]] (voice, no oversell, no "team" pretense, no color emoji in body copy). Changes to agents, skills, or the loop criteria are decision-log-worthy by definition — log them. And the [[../docs/INTENT.md|intent doc]] is still the drift check: Margin's marketing instincts shouldn't pull the product away from "free 5/3/1 tracker for serious lifters, agent-built, honest about it".

## How to edit this file

- Add a category by appending a new numbered item with the same shape (name — description).
- Remove a category by deleting its item; the skill picks up the change on the next iteration.
- Keep descriptions concrete enough that a fresh agent reading this file cold knows what counts.
