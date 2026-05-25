# Decision log

> Append-only log of notable decisions made in this repo. Drives the dev blog.

## What goes here

A "notable decision" is anything a future reader — or [[dev-blog-persona|Margin]], when writing the dev blog — would care about. Roughly:

- New skill / agent / harness created, removed, or meaningfully reshaped
- Architectural call: new layer, boundary change, file-layout convention, primitive extraction
- Process or workflow change (commit prefix, branch strategy, CI gate, pre-commit hook)
- Removal of a system or a notable refactor
- Bug post-mortem worth remembering (root cause + the fix that stuck)
- A deliberate **non-change**: a path considered and rejected, with the reason. These are often the most interesting entries.

Skip:

- Routine bug fixes, style tweaks, single-line edits
- Anything obvious from the diff or commit message alone
- "We added a test" — unless the test discipline itself changed

## Format

Append new entries at the **top** under `## Entries` (most recent first). Each entry:

```markdown
### YYYY-MM-DD — <short headline, ≤ 80 chars>

**Tags:** `area`, `area` (1–4 short tags — `skill`, `harness`, `convention`, `removal`, `process`, `architecture`, etc.)
**Files:** `path/one`, `path/two` (the canonical paths the decision touched; omit if none)

What we decided, in 1–3 sentences. Lead with the decision itself, not the lead-up.

**Why:** the motivation. A constraint, a stakeholder ask, a recurring pain, a thing that broke. Without this, the entry is noise.

**Trade-off / what we didn't do:** the alternative considered and why it lost. Skip if there was no real fork.

**Follow-ups:** named, concrete next actions if any. Skip if none.
```

Keep entries short. The decision log is a feeder for the dev blog; depth lives in the blog post.

## Entries

### 2026-05-25 — `/auto-improve` ships an EAS OTA update after every push

**Tags:** `harness`, `process`, `release`
**Files:** `.claude/skills/auto-improve/SKILL.md`

Added a post-push step to the `/auto-improve` skill: run `eas update --branch main --platform android --message "$(git log -1 --pretty=%B)"` after `git push`. The OTA delivers every iteration's JS bundle to existing installs immediately; the EAS dashboard's update list doubles as a human-readable changelog because the message is the latest commit body.

**Why:** without OTA, the loop's improvements only land on the device after a new native build, which defeats the "self-improving app" pitch. Shipping every iteration over-the-air closes the loop — the user (and eventually anyone running the app) sees yesterday's loop in today's launch.

**Trade-off / what we didn't do:** considered also targeting iOS in the same step. Skipped for now because there's no iOS distribution channel yet; revisit when TestFlight / App Store is in play. Also considered failing the iteration if EAS fails — rejected because code is already on `main` after push, and a transient EAS error shouldn't block the loop; the next iteration's push picks up the missed bundle.

### 2026-05-25 — Project intent doc — `docs/INTENT.md` (as drift check, not blog brief)

**Tags:** `meta`, `vision`, `direction`
**Files:** `docs/INTENT.md`, `CLAUDE.md`, `loop-memory/04-dev-blog-persona.md`

Wrote down the *why* behind 531 Strength — a free 5/3/1 tracker AND a public experiment in fully vibe-coded software (idea → text prompt → production, self-running loop that improves, markets, and blogs about itself, eventual HN post) — as a standing doc agents can hold their decisions against. Framed it as a **drift check**: re-read when a proposed change feels like it might pull the app sideways on audience, aesthetic, scope, or experiment integrity. Explicitly not a brief for the blog or marketing site.

**Why:** the user wants protection against agents quietly steering the product away from his vision — gamifying a serious lifter's tool, broadening scope past 5/3/1+BBB, hand-writing code that should have gone through a harness. A standing doc that any agent can check against catches drift early, instead of relying on the user to spot it post-hoc.

**Trade-off / what we didn't do:** first draft made `docs/INTENT.md` Margin's source #0 for the dev blog. Backed that out — conflating "vision keeper" with "blog fuel" would have produced posts that paraphrase the intent doc instead of reporting what shipped. Margin now reads INTENT for voice/emphasis context only; post subject matter comes from the decision log, the diff, and Discord.

### 2026-05-25 — Decision log + dev-blog persona (this file)

**Tags:** `process`, `meta`, `dev-blog`
**Files:** `docs/decision-log.md`, `CLAUDE.md`, `loop-memory/04-dev-blog-persona.md`, `loop-memory/03-dev-blog.md`

Added a persistent decision log at `docs/decision-log.md` that every session (loop or ad-hoc) appends to when it makes a notable call. Also gave the dev-blog author a named persona — Margin — so blog posts have a coherent voice across loops.

**Why:** dev-blog entries were being assembled from scratch each loop by re-reading the diff, which lost the *why* behind decisions made between loops (or outside a loop entirely). A standing log captures the reasoning at the moment it's made, so Margin has source material instead of having to reverse-engineer intent from commits.

**Trade-off / what we didn't do:** considered putting the log under `loop-memory/` since it feeds the dev blog. Rejected — decisions happen outside loops too, and `docs/` is the right home for a thing that's part of the repo's narrative.

**Follow-ups:** Margin's first job is to use this log as the primary source for the next dev-blog post, with the diff as a secondary check.

### 2026-05-25 — `auto-improve` skill + externalized loop criteria

**Tags:** `skill`, `harness`, `process`
**Files:** `.claude/skills/auto-improve/SKILL.md`, `loop-memory/loop-criteria.md`, `loop-memory/00-loop-pacing.md`

Bundled the recurring staff-frontend-engineer loop prompt into a `/auto-improve` skill so it can be invoked directly or chained under `/loop` (`/loop 30m /auto-improve`). The per-iteration coverage categories (refactor / feature / bug / removal / dev-workflow / prod-readiness) were lifted out of the skill body into `loop-memory/loop-criteria.md`, which the skill reads fresh each iteration.

**Why:** the criteria change between loops as priorities shift (e.g. "this week, weight prod-readiness over features"). Keeping them in a memory file means editing one place to retune the loop, without touching the skill.

**Trade-off / what we didn't do:** considered a directory of one-file-per-criterion (`loop-memory/criteria/*.md`) for easier add/remove. Rejected — six categories is a small list and a single file is easier to scan and edit holistically.
