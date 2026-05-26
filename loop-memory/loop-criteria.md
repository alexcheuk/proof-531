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

7. **Verso's beat — website, blog, and self-improvement.** For this item, **assume the [[dev-blog-persona|Verso]] persona** and step out of the implementer seat. (Margin held this seat through 2026-05-26 and was let go; the role is the same, the voice is different. See `apps/web/src/content/blog/2026-05-26-margin-signs-off.md` and `2026-05-26-verso-day-one.md`.) Verso's job for the loop:

   - **Make the website better.** Layout, copy, structure, navigation, performance, the listing pages, the post template — whatever a visitor would hit. Sell the app. Sell the dev blog. Sell the vision (vibe-coded ecosystem, agent-built software, free 5/3/1 tracker for serious lifters). Marketing copy that's honest and concrete beats marketing copy that's loud. Outside-reader rule still applies (see [[dev-blog-persona]]): the visitor has not opened the repo.
   - **Write content that lands with the right audience.** Per the audience rule, posts are for a curious outside reader interested in the product and in agent-built software — not for teammates in the codebase. No file paths, no library names, no internal type/component names, no test counts. User-visible feature names stay. The meta framing (boss Alex, the 30-minute loops, "the previous dev", agent-built premise) stays — that's the honest hook.
   - **Extend the system when it helps.** If Verso notices that a new agent would meaningfully sharpen the loop (e.g. a screenshot-generator agent for store listings, a copy-editor agent that reviews blog drafts, a social-post agent), **add it** — write the agent definition, wire it in, log the decision. Same for new skills.
   - **Tune the loop itself.** If Verso sees that this very file (`loop-criteria.md`) needs a different mix — more weight on production readiness, less on refactor, a new category entirely — **edit it**. Verso has the keys. Log the change in `docs/decision-log.md` with the reasoning so future loops can see how the criteria evolved.

   Constraints: Verso's edits to the website and blog still respect [[dev-blog-persona]] (voice, no oversell, no "team" pretense, no color emoji in body copy, outside-reader rule overrides everything else). Posts are commissioned via the `post-as-verso` skill, never written by direct Write call. Changes to agents, skills, or the loop criteria are decision-log-worthy by definition — log them. And the [[../docs/INTENT.md|intent doc]] is still the drift check: Verso's marketing instincts shouldn't pull the product away from "free 5/3/1 tracker for serious lifters, agent-built, honest about it".

8. **Home page** — every iteration MUST pick one improvement targeting `apps/web/src/pages/index.astro` or a component/asset it depends on (e.g. `components/Hero.astro`, `components/illustrations/*`, the layout `Base.astro`, site styles). The home page is the front door; until it's top-notch, it gets a dedicated slot. Verso owns this category — same voice and constraints as category 7.

   Pick *one* facet per iteration; don't try to do all of them in one slot. The facets, in rough priority order:

   - **Hero & first viewport.** Title, eyebrow, lead, primary CTA, ledger row. Does the first screenful land the value prop in three seconds for someone who has not opened the repo? Outside-reader rule applies.
   - **Accurate UI showcase.** The on-page illustrations (`HeroPhone`, `PlateBar`, `SessionTape`, `AmrapMath`, `WeekLedger`, and any successors) must match what the mobile app actually shows. Boot the app, compare side by side, fix drift. When the app gains a feature the home page doesn't yet show (history, settings, deload, plate-loader edge cases), add a faithful illustration for it. The page promises an aesthetic and a behavior — both must be true.
   - **Trust & provenance.** Sells "agent-built, honest about it" without overdoing it. GitHub link discoverability, decision-log signal, dev-blog teaser quality, current-state cues (what's working today, what's next, last shipped). No fake stats, no fabricated testimonials, no "trusted by N lifters" filler.
   - **Objections, audience-fit, CTAs.** Filters in serious lifters who already know 5/3/1; filters out the wrong audience. Addresses obvious objections without burying them (no accounts? offline really? free forever? where do I install it? who is this *not* for?). The "get it" path must be honest about today's reality — until there's a real store listing, no fake download button; a "follow until launch" / TestFlight / RSS signal is fine if it doesn't oversell.
   - **Page craft & polish.** Section pacing, scroll rhythm, mobile layout, performance (LCP, font swap, image weight, asset count), accessibility (semantic HTML, alt text, focus rings, contrast), OG image, favicon, meta tags, share-preview rendering. The site is a flex of mobile-first taste; act like it.
   - **Adjacent surfaces in service of the home page.** Verso's discretion: footer, nav, `/process`, `/blog` index, site stylesheets, share-preview image — when the move clearly elevates the impression a first-time visitor forms. Don't drift into mobile-app work or unrelated blog refactors. If you're not sure the change pulls the home page up, it doesn't belong in this slot — log it under category 7 instead.

   Constraints: same as category 7 — outside-reader rule, no oversell, `INTENT.md` is the drift check. Keep all four words of "free 5/3/1 tracker for serious lifters, agent-built, honest about it" pulling weight; if a change is making one of them weaker, it's wrong. Structural changes (new section, removed section, CTA change, illustration swap) are decision-log-worthy.

## How to edit this file

- Add a category by appending a new numbered item with the same shape (name — description).
- Remove a category by deleting its item; the skill picks up the change on the next iteration.
- Keep descriptions concrete enough that a fresh agent reading this file cold knows what counts.
