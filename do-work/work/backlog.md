# Work-graph (531)

> The standing work-graph the do-work loop prioritizes. This file holds **standing workstreams**
> (long-running, never-"done") and **discrete tracked items** (bugs, removals, features with a clear
> definition-of-done). It is parsed by `do-work/scripts/check-memory.mjs`, so the grammar below is
> load-bearing.

## Item grammar (enforced by check-memory.mjs)

Each item is a block in this shape (the header line is shown indented here only so the
check-memory parser does not read this example as a real item; real headers start at column 0):

```
    ## <ID>: <Title>
    - status: <todo | doing | done | blocked>
    - blocked_by: <none | comma-separated IDs>
    - proof: <one-line summary>
      - [ ] discrete checkable criterion
      - [x] a criterion that is met
```

- **Header:** `## <ID>: <Title>`. The separator is a **colon**, never a dash and never an em dash.
  `<ID>` is a single token (e.g. `Q-QUALITY`, `WEB`, `LAUNCH`, `LOOP`). The colon split is what
  `check-memory.mjs` keys on, so keep it exact.
- **status:** exactly one of `todo`, `doing`, `done`, `blocked` (no parentheticals on that line). Use
  `blocked` when an item waits on an external or human action; put the human-readable reason on a
  separate `- note:` line, and if the blocker is another backlog item list it in `blocked_by`.
- **blocked_by:** `none`, or a comma-separated list of IDs (`check-memory.mjs` splits on commas). Any
  prose reason goes on a `- note:` line, not here.
- **proof:** a one-line summary of the definition-of-done, optionally followed by indented GFM
  checkbox sub-bullets (`  - [ ]` for open, `  - [x]` for met). The checklist is the
  definition-of-done: an item may be marked **`status: done` only when there are ZERO unchecked
  `- [ ]` boxes** (check-memory enforces this). For standing workstreams the proof is a per-slice /
  ongoing rule rather than a checklist, and the item never reaches `done` (see those items below).

## This file is not the only source of work

Per-tick BREADTH does not come from this backlog alone. Each iteration also pulls coverage from:

- the category list in `loop-memory/loop-criteria.md` (component audit/refactor, bug fix, removal, the
  outside-the-painting marketing/agents/loop-maintenance beat),
- the live pinned messages in Discord `#loop-criteria` (additive criteria on top of the categories),
- and `#task-queue` (specific work Alex wants).

The backlog holds the standing workstreams and the discrete tracked items; the criteria + pins +
`#task-queue` keep each iteration broad. Treat them together when picking the iteration's 12 to 15
items (sizing per `loop-memory/00-loop-pacing.md`).

## Standing workstreams

## Q-QUALITY: Continuous code quality
- status: doing
- blocked_by: none
- proof: per-slice - each change is behavior-preserving and proven by `tsc --noEmit` + lint (biome) +
  `jest` green, plus a `do-work-auditor` review confirming no behavior change and a genuine
  improvement; UI-touching slices also accrue validation debt (`validation.mjs debt`) for the eventual
  smoke. Never "done" (ongoing): the marker of health is a trend - tsc-clean, lint-clean, shrinking
  duplication, view and logic separated, React hygiene holding.
- note: this is the loop-criteria category-1 standing workstream (component audit / refactor). Scope:
  maintainability, readability, React hygiene, proper abstraction, and view to logic separation,
  guided by the `vercel-react-native-skills` rules (list-performance, animation, navigation, ui,
  state, rendering). Each iteration MUST ship at least one bounded, behavior-preserving quality slice
  here, unless preempted by a P0 / security item. Respect the boundary rules in CLAUDE.md: hex/px only
  in `src/design/`, `src/domain/` stays pure, persistence stays in `src/data/`, one-way imports
  `app -> features -> (design | data | domain)`.

## WEB: Marketing site + dev-blog framework
- status: doing
- blocked_by: none
- proof: per-slice - each `apps/web/` change builds clean (Astro build green) and is honest about what
  the app is (a free 5/3/1 + BBB tracker, agent-built, local-first); absolute URLs read
  `context.site` rather than hardcode (default fallback `https://531strength.com`). Never "done"
  (ongoing): the marker of health is a site that ranks, reads cleanly, and sells the app and the dev
  blog without overselling.
- note: covers layout, copy, SEO (the Track-A levers in `loop-memory/17-website-improve-strategy.md`),
  the blog listing pages (including `/blog/expedition-logs`), the post template, and the Logger
  framework (the frame around posts: persona doc, lore canon, schema, listing pages, colophon - NOT
  the prose of any single post, which the Logger writes via `commission-expedition-log`). The
  `frontend-design` skill is in-scope for `apps/web/` but its bold/brutalist direction must not leak
  into the e-ink mobile aesthetic. `docs/INTENT.md` is the drift check for marketing copy.

## LAUNCH: Organic launch strategy execution
- status: doing
- blocked_by: none
- proof: per-slice - advance one item in `loop-memory/16-organic-launch-strategy.md` per iteration and
  update its tracker; drafts (README polish, subreddit posts, Show HN copy) are produced autonomously,
  but anything PUBLIC-FACING (an actual post to a subreddit, HN, or social) waits for Alex. Never
  "done" (ongoing): the marker of health is steady, sequenced progress through the 12 tactics, with
  the right story told to the right audience and no oversell.
- note: two stories, never mixed in one post - the lifting-app story (r/531Discussion, r/weightroom,
  T-Nation: "a clean 5/3/1 + BBB tracker that leaves everything else out") and the AI-experiment story
  (Show HN, r/vibecoding, r/reactnative: "a coding agent that commits and blogs every iteration").
  Honest and concrete beats loud. No Jim Wendler affiliation; disclaim it where the strategy file says
  to.

## LOOP: Loop + harness maintenance
- status: doing
- blocked_by: none
- proof: per-slice - tune `loop-memory/loop-criteria.md`, mint or refine agents and skills, and keep
  the do-work memory tree healthy (`check-memory.mjs` green; `loop-memory/` learnings current). Every
  such change is decision-log-worthy by definition: append to `docs/decision-log.md` with the
  reasoning. Self-edits to `do-work/SOUL.md`, `do-work/DOCTRINE.md`, or the do-work skill itself must
  pass the `do-work-auditor` agent (and constitution-level changes additionally wait for Alex's
  blessing in `#needs-input`). Never "done" (ongoing): the marker of health is a loop that stays
  legible, well-paced (12 to 15 substantive items per iteration), and honest about its own machinery.
- note: this is the loop-criteria "outside-the-painting" beat for agents/skills/criteria (the website
  and blog-framework halves of that beat live under WEB). Edits to `loop-memory/` learnings and to
  this backlog are free (self-edit gate is scoped); the gated paths are SOUL / DOCTRINE / the skill.

## Discrete tracked items

> Discrete bugs, removals, and features are added here as they are identified (audit -> backlog is the
> refill mechanism); P0 / security always jumps the queue.

## WEB-SIGNOFF: Logger sign-off uses an em dash across the whole blog corpus
- status: blocked
- blocked_by: none
- proof: a ratified convention decision plus a corpus-wide normalization. Done when either (a) every
  `apps/web/src/content/blog/*.md` Logger sign-off uses the blessed glyph and the persona doc records the
  rule, or (b) Alex blesses the em dash as the one allowed exception and the hard-line note carves it out.
  - [x] escalate the either/or to Alex in `#needs-input` (normalize all sign-offs to a spaced hyphen, OR
        bless the em dash as a sign-off-only exception) -- posted 2026-06-01 tick-2, msg in `#needs-input`;
        broadened to also ask about the wider ~157-instance web-corpus em-dash debt (options C/D)
  - [ ] apply the chosen resolution across all existing posts (or record the blessed exception)
- note: every prior Logger post signs off `— Name, Logger of Expedition N` (em dash), which the no-em-dash
  hard line forbids for any file the loop writes. Expedition 79's post used a spaced hyphen (`- Soren, ...`)
  to honor the hard line, which makes it visually inconsistent with the corpus. This needs a single
  convention decision rather than per-post divergence. Escalation is now POSTED (Discord reachable since the
  source-line fix); blocked on Alex's reply (which letters A/B for the blog, C/D for the web corpus). See
  also `loop-memory/22-web-em-dash-debt.md` for the corpus inventory.

## MISSED-REP: Program correction when a lifter misses a prescribed rep/set
- status: doing
- blocked_by: none
- proof: a shipped, validated feature that surfaces a calm, non-punitive correction suggestion when a lifter
  misses the prescribed reps on a main set, mirroring the existing TM-Test suggestion card + apply sheet.
  Logic proven by `tsc`/lint/`jest` (the pure domain functions are property-tested); the UI surfaces ship +
  accrue validation debt for the eventual Maestro smoke. Done only when the smoke passes.
  - [x] design spec produced (rn-designer, `_workspace/01_design_spec.md`): reuse `TmAdjustmentNote` +
        `TmApplySheet`; derive miss from `row.kind==='amrap' && actualReps<prescribedReps` on cycle-days 1-3;
        suggest-never-mutate; first-miss offers Reset(-10%)/off-day, second consecutive miss forces reset;
        new `lift_miss_state` table; pure `missResetTm()` + `classifyAmrapMiss()` in `progression.ts`
  - [ ] implement the pure domain functions (`missResetTm`, `classifyAmrapMiss`) + property tests (TDD)
  - [ ] implement the `lift_miss_state` data layer (table + accessor + query hook)
  - [ ] wire the suggestion card + apply sheet on SessionCompleteScreen (+ Today re-surface)
  - [ ] optional BBB session-scoped back-off adjustment
  - [ ] Maestro smoke passes for the miss -> reset flow
- note: task-queue `1511224654327447663` (Alex). Headline feature; design landed tick-2, implementation is the
  next major slice. Route the implementation through `rn-expo-pipeline` (frontend -> QA) per DOCTRINE feature
  policy. Correctness is sacred: the 10% reset uses `round()` from `domain/units` so the new TM is plate- and
  unit-correct.
