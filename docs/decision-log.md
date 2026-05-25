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

### 2026-05-25 — `computeLifetimeVolume` counts BBB (matches `getLifetimeVolume`'s SQL, loop-008 carryover)

**Tags:** `bug`, `data`, `consistency`
**Files:** `apps/mobile/src/features/history/lifetimeVolume.ts`, `apps/mobile/src/features/history/__tests__/lifetimeVolume.test.ts`

`getLifetimeVolume`'s SQL was widened in loop-008 to count `kind = 'bbb'` rows, but the in-memory sibling `computeLifetimeVolume` (used by tests + any caller with rows already in JS) still filtered to working+amrap only. The two would have diverged on real data the moment any caller used the in-memory path. Fixed; test renamed + assertion flipped so the gap is now actively prevented.

**Why:** found while looking for a real bug during a quiet steady-state loop. The doc-vs-SQL drift was the bug class.

### 2026-05-25 — Steady-state loops are first-class (Margin tunes the loop-pacing)

**Tags:** `process`, `meta`, `loop-criteria`
**Files:** `loop-memory/00-loop-pacing.md`

Loops 005 through 011 ran with no Discord asks and a steady codebase. Each iteration found *something* substantive (BBB rest target, BBB logging, BBB on the receipt, warmups band, AMRAP-chip polish) but the loop-pacing memory still asked for "12–15 items per iteration." That created implicit pressure to manufacture work. Margin (per loop-criteria.md #7) amended the pacing memory: when the queue is empty AND there are no obvious gaps, 2–4 honest items is correct. Forced 12–15 in steady state inflates surface area without earning it.

**Why:** the 12–15 target was set during the active-build phase when the backlog was real. Holding that target after the backlog drained meant the loop would have started inventing work — exactly the failure mode `INTENT.md` warns against ("vibe-coded software, agent-built, honest about it").

**Trade-off / what we didn't do:** considered slowing the cron from 30m to 1h or 2h. Rejected for now — the cadence is the messenger, and the user can interrupt it with a Discord ask any time. Slowing the cron would slow the response window too. The amendment fixes the pacing bar without touching the cadence.

### 2026-05-25 — BBB row on the session-complete receipt (conditional on actual completion)

**Tags:** `feature`, `ui`
**Files:** `apps/mobile/src/features/session/components/ReceiptCard.tsx`, `apps/mobile/src/features/session/hooks/useSessionCompleteData.ts`

ReceiptCard renders a `BBB · 150 lb · 5×10` row when `bbbSetsCompleted > 0`. `deriveView` rolls the BBB logs into `bbbSetsCompleted` + `bbbWeightDisplay` view fields. The "Skip · close the day" path keeps the receipt clean — no zero-row, no false completion. `volumeOfWorkingSets` stays working-only (the receipt's volume band is still 5/3/1 main work specifically); the BBB row is a sibling, not a sum.

**Why:** loop-008 logged the rows but didn't surface them. The receipt is the moment-of-truth view; showing only the 5/3/1 main work after a BBB-complete session was understating what the user did.

**Trade-off / what we didn't do:** considered showing total volume (working + BBB) in one combined number. Rejected — combining loses the "the working sets are what 5/3/1 is about" signal that the receipt is meant to honor.

### 2026-05-25 — BBB sets are logged on "Mark complete" (skip stays honest)

**Tags:** `feature`, `data`
**Files:** `apps/mobile/src/features/session/BbbPromptScreen.tsx`, `apps/mobile/src/data/accessors/setLog.ts`, `apps/mobile/src/features/session/hooks/useLiveScreenEffects.ts`, `apps/mobile/src/data/queries/useLifetimeVolume.ts`

`BbbPromptScreen`'s "Mark BBB complete" CTA now writes 5 `kind: 'bbb'` set_logs (10 reps each at 50% TM). "Skip · close the day" still bypasses the writes — the honest "AMRAP happened, BBB didn't" record. `getLifetimeVolume` widened to include `kind = 'bbb'` so the History tab's volume stat counts every BBB set the user actually moved. `useLiveScreenEffects` invalidator picked up `LIFETIME_VOLUME_KEY` (was missing), so the volume stat refreshes on session close. Exported `LIFETIME_VOLUME_KEY` from `useLifetimeVolume.ts` so invalidators share the constant.

**Why:** loop-007's blog post called out the unlogged-BBB gap. The skip path is non-negotiable: silently logging skipped work would corrupt lifetime volume and obscure actual training patterns.

**Trade-off / what we didn't do:** considered asking the user for per-set actual reps on each BBB set. Rejected for now — BBB is supposed to be at a weight you can hit 10 reps with; if you can't, you went too heavy. All-or-nothing is honest enough for the 95% case. Revisit if a user reports needing the granularity.

**Follow-ups:** receipt's working-sets band doesn't show the BBB rows yet — pure presentation, no schema work. Going on loop-009.

### 2026-05-25 — Separate `settings.bbbRestTargetSeconds` column (additive migration, default 90s)

**Tags:** `feature`, `data`, `migration`
**Files:** `apps/mobile/src/data/drizzle/schema.ts`, `apps/mobile/src/data/drizzle/migrations/0001_init.{sql,ts}`, `apps/mobile/src/data/drizzle/runMigrations.ts`, `apps/mobile/src/domain/types.ts`, `apps/mobile/src/data/accessors/{settings,onboarding}.ts`, `apps/mobile/src/features/settings/sections/RestTargetSection.tsx`, `apps/mobile/src/features/session/{BbbPromptScreen.tsx,components/TodayBody/{TodayBody,BbbBand}.tsx}`

BBB sets are 5×10 at 50% TM — much lighter than the working sets, so the rest target should be shorter. Was inheriting the working-set rest; users with `rest = 3:00` configured were resting 3 minutes between back-off sets too. Added `bbb_rest_target_seconds INTEGER NOT NULL DEFAULT 90` as a new additive column; existing installs pick it up via the ALTER pathway in `runMigrations.ts`. Settings UI now has two stacked rails ("Working sets" + "BBB sets"). BbbPromptScreen + TodayBody's BBB band both read the new field.

**Why:** called out as a deferred fix in loop-006's "the timer that counts down" blog post. Honest-receivable follow-through.

**Trade-off / what we didn't do:** considered overloading `restTargetSeconds` with a `context: 'working' | 'bbb'` param at read time. Rejected — sub-second value, but a long-tail correctness liability (callers forgetting to pass the right context). A dedicated column is one schema row + one switch case at every consumer.

**Follow-ups:** logged the five-file coordination shape in `loop-memory/08-additive-column-checklist.md` so the next column add is fill-in-the-blank.

### 2026-05-25 — `getSetLogsForSession` enforces `ORDER BY id` (docstring contract → SQL contract)

**Tags:** `data`, `correctness`
**Files:** `apps/mobile/src/data/accessors/setLog.ts`

The accessor's docstring promised "insertion order" but the SELECT had no `ORDER BY`. SQLite returns rows in insertion order from a single-table SELECT in practice, but it's not guaranteed by SQL. Added `ORDER BY id ASC` so the contract is enforced by the query, not by happenstance. No consumer relied on the order today, but a future one would have hit a non-determinism bug that's hard to repro.

**Why:** found during loop-006 bug-hunt. The doc-vs-code gap is the bug-class; enforcing made it cheap.

### 2026-05-25 — `resetSession` rebuilds `prs.bestE1RM` from surviving AMRAP rows; ordering fix for FK constraint

**Tags:** `bug`, `data`
**Files:** `apps/mobile/src/data/accessors/session.ts`, `apps/mobile/src/data/accessors/__tests__/resetSession.test.ts`

`resetSession` previously left `prs.bestE1RM` untouched (documented as out-of-scope). A user who set a PR via an AMRAP and then reset the session kept the stale PR forever — best-lift badge and AMRAP chip both compared against a number with no supporting set_log. Now: compute the surviving max e1RM across other sessions for this lift, repoint or delete the prs row, THEN delete this session's set_logs. Order matters — `prs.set_log_id` is a NOT NULL FK with no ON DELETE CASCADE, so deleting set_logs first triggers `FOREIGN KEY constraint failed`. New `__tests__/resetSession.test.ts` covers the two rebuild paths + the FK ordering trap.

**Why:** the gap was real and silent. The first integration test failure made it loud (the FK error fires immediately on the simple "delete prs row when no AMRAP survives" case), so it can't drift again.

**Trade-off / what we didn't do:** considered adding `ON DELETE SET NULL` to the FK via a schema migration. Rejected — migration churn for a fix we can do in one accessor by reordering operations. The migration option stays on the table if we ever need to delete set_logs from other call sites without rebuilding prs.

### 2026-05-25 — `StatusBarShim` primitive extracted for full-bleed status-bar fills

**Tags:** `design-system`, `architecture`
**Files:** `apps/mobile/src/design/primitives/StatusBarShim.tsx`, `loop-memory/07-status-bar-fill.md`

Extracted the two-layer status-bar fill pattern (StatusBar with `translucent={false}` + absolute strip at `top: -insets.top`) into `StatusBarShim`. PrCelebrationScreen now uses the primitive instead of two inline `View`s. Loop-memory note `07-status-bar-fill.md` records the gotcha + why both layers are needed.

**Why:** the same pattern broke three times in three loops (Discord 1508365993, then 1508386282) because Android's `StatusBar.backgroundColor` is silently ignored when `translucent={true}`. Each iteration re-derived the fix from scratch. Naming the primitive + writing the memory file means the next agent / screen reaches for `<StatusBarShim color=... style=... />` and doesn't think about it.

### 2026-05-25 — Cancel + Restart pills move from Live to Today; LiveScreen surfaces only contextual recovery

**Tags:** `feature`, `architecture`, `ux`
**Files:** `apps/mobile/src/features/session/LiveScreen.tsx`, `apps/mobile/src/features/session/TodayScreen.tsx`, `apps/mobile/src/features/session/hooks/useTodaySessionActions.ts`

Lifted Cancel + Restart pills off the Live screen onto the Today screen's top bar, surfaced only when the lift has an in-progress session (`state.mode === 'active'`). New `useTodaySessionActions` hook wraps both flows in the same two-tap arm pattern. Live screen now surfaces only the contextual Undo affordance during rest. The cancel/reset state-machine phases inside `useLiveScreenState` are left in place but unreachable from this screen — kept around as tested infrastructure if we ever want them back inline.

**Why:** Discord 1508386540 — destructive pills sitting next to the rest timer and AMRAP CTA were noisy and easy to mis-tap mid-effort. The right place to abort a session is the place where you start it: Today is the entry point, Live is the workspace.

**Trade-off / what we didn't do:** considered deleting the cancel/reset phases from `useLiveScreenState` entirely. Rejected — the state machine is heavily tested and a future iteration may want an inline shortcut (e.g. long-press the back chip). Cheaper to leave the unit and re-wire it later than to rebuild it.

### 2026-05-25 — Web split: `/` is the product page, `/process` is the meta narrative

**Tags:** `web`, `marketing`, `structure`
**Files:** `apps/web/src/pages/index.astro`, `apps/web/src/pages/process.astro`, `apps/web/src/components/TopBar.astro`

Rebuilt the homepage to sell the app first. Moved the "how it's built" narrative + agent process to a new `/process` page. TopBar nav: App · Process · Dev log. Added a real `/404` page to replace the browser default.

**Why:** Discord 1508388591 — the previous homepage led with vibe-coded process and only mentioned the app incidentally. A visitor coming for "free 5/3/1 + BBB tracker" had to scroll past the meta narrative to find the product. The product is the point; the process belongs as a "if you're curious" side door.

### 2026-05-25 — Migrate `prs.bestE1RM` to the new unit inside `migrateStorageUnit`

**Tags:** `bug`, `data`, `migration`
**Files:** `apps/mobile/src/data/accessors/migrateStorageUnit.ts`, `apps/mobile/src/data/accessors/__tests__/migrateStorageUnit.test.ts`

`prs.bestE1RM` is stored as a bare number with no unit column. The single-unit invariant kept this honest pre-migration. On a lbs → kg migration, future PRs land in kg while old PRs sit as raw lb-magnitude numbers in the same column — and `pickBestLift` compares with numeric `>`, so a 220 lb PR beats a 100 kg PR for the "best lift" badge. `migrateStorageUnit` now walks `prs` after the TM rows and updates every `bestE1RM` through `convertWeight(value, oldUnit, newUnit)`. Test added.

**Why:** the comparison bug is silent and persistent — once a user migrates, the wrong "best lift" sticks until a new PR rewrites the value. Caught during a relativeTime / data-layer audit in loop-003.

**Trade-off / what we didn't do:** considered adding a `unit` column to `prs` and tracking each PR in its own unit, then converting at display time. Rejected — pre-migration data is uniform-unit by invariant, so a one-shot convert at migration time keeps the column simple. If the model ever supports per-session unit choice (it doesn't today), revisit.

### 2026-05-25 — Tried date-fns for `formatRelativeTime`, reverted under jest-expo

**Tags:** `tooling`, `tests`, `removal`
**Files:** `apps/mobile/src/domain/relativeTime.ts`, `loop-memory/06-date-fns-attempted.md`

Discord asked us to swap the hand-rolled `formatRelativeTime` bucketing for `date-fns.formatDistanceStrict`. The subpath import added enough first-parse latency to `TrainingMaxSection`'s render that 7 `SettingsScreen` integration tests deterministically blew their default 1000 ms `waitFor` budget with "Unable to find node on an unmounted component". Reverted to the ~20-line bucketing; documented in `loop-memory/06-date-fns-attempted.md` so the next agent doesn't burn the same hour.

**Why:** the test gauntlet is a hard gate — a broken pnpm test trumps a cleaner one-liner. Honest record beats silent revert.

**Trade-off / what we didn't do:** considered bumping the waitFor timeout to mask the perf gap. Rejected — that hides the symptom and leaves the loop slower for everyone. Also considered keeping date-fns as a dep for other callers; rejected because no other domain code wanted it this loop.

### 2026-05-25 — Sheet primitive drives gorhom v5 open/close via ref, not the `index` prop

**Tags:** `bug`, `architecture`, `design-system`
**Files:** `apps/mobile/src/design/primitives/Sheet.tsx`, `scripts/check-boundaries.sh`, `loop-memory/05-gorhom-sheet-index.md`

Rewrote `Sheet.tsx` so the BottomSheet's open/closed state is driven imperatively (`sheetRef.current?.snapToIndex(0)` / `.close()` in a `useEffect` on `open`), with `index={-1}` as the permanent initial. Added a `check-boundaries.sh` rule that flags any future `index={X ? 0 : -1}` pattern.

**Why:** gorhom v5 documents `index` as the *initial* snap point; re-rendering with `index={-1}` does not reliably close an open sheet. The AMRAP cancel button broke twice in three days (Discord `1508312977…` then `1508365310…`) because the previous "fix" only patched a symptom of that inconsistency. Catching the regression class with a script is cheaper than catching the bug again with a user.

**Trade-off / what we didn't do:** considered leaving the prop-driven pattern and adding a parallel imperative call. Rejected — two sources of truth is worse than one wrong one. Going imperative also meant updating three test mocks that conditionally rendered children on `index >= 0`; tests now treat sheets as always-mounted, which matches gorhom's actual runtime behavior.

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
