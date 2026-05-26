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

### 2026-05-26 — Progress promoted to a first-class tab; six Discord asks shipped together

**Tags:** `feature`, `navigation`, `progress`, `home`, `removal`
**Files:** `apps/mobile/src/app/(tabs)/{_layout,progress}.tsx`, `apps/mobile/src/app/progress/` (deleted), `apps/mobile/src/app/routes.ts`, `apps/mobile/src/features/tabs/TabBarItem.tsx`, `apps/mobile/src/design/primitives/{ProgressGridCell,ProgressGridRow,TmCell}.tsx`, `apps/mobile/src/features/progress/components/{StatsTriplet,ProgressLiftRow}.tsx`, `apps/mobile/src/features/home/HomeScreen.tsx`, `apps/mobile/src/features/home/components/StreakBadge.tsx` (deleted), `apps/mobile/src/features/home/hooks/useActivityStreak.ts` (deleted), tests, plus `apps/mobile/src/features/home/__tests__/HomeScreen.test.tsx`

Six task-queue items landed together. Progress is now a top-level tab between Today and History — `(tabs)/progress.tsx` reads an optional `?lift=` param and defaults to `enabledLifts[0]`; the screen's existing LiftTabs + swipe pager handle within-screen lift switching. The old stack route `/progress/[lift]` and its `_layout.tsx` were deleted. As a side effect, the "going back from Progress lands on History" complaint disappears — tabs have no back stack; the user just taps another tab.

The cycle labels lost their leading zero (`C01 → C1`) in both the Progress grid and the StatsTriplet — Settings's CycleProgressSection still uses `Cycle 0N` for the ledger row where the row label format is its own thing. The day cell rep count brightened from `paperMuted` to `bg0` and grew from fontSize 9 → 10 so it reads at glance on the ink-filled cells. TmCells lost their per-row unit glyph — the column header already carries `→ TM lb`; the per-row duplication was just noise. The "NOW" cell renamed to "NEXT" with a 1-px inset ink ring, mirroring the just-done marker in the Settings cycle-progress grid so the two surfaces speak the same visual language.

Removed the StreakBadge + `useActivityStreak` hook entirely. User: *"Days streaks function doesn't make sense if you don't lift everyday, which is intended if I just do bench."* The streak math is fine for a daily-training population; 5/3/1 + BBB lifters train 3–4×/week, and single-lift users train less. The right answer is to drop the surface, not pivot to a smaller cadence — Settings already exposes cycle progress, which is the actual signal a serious lifter watches.

**Why bundled:** all six items converge on the same surface (Progress + tab bar + Home). Shipping piecemeal would have meant six diffs that each had to keep the carousel + lift selection + back nav coherent. One commit, one decision-log entry, one OTA.

**Trade-offs:**
- The `now` variant token in `ProgressGridCell` kept its name in the data model (`kind: 'now'`) while the rendered label changed to "NEXT". The variant lives across `useLiftProgression`'s `ProgressionCellNow` type and the cell prop union — renaming would have rippled into the SQL projection and three accessor sites for no real win. The display copy is decoupled from the data token.
- Settings's "Cycle 0N" ledger label was left zero-padded. The user's complaint was about the Progress grid; the Settings ledger has its own typographic rhythm (`Cycle 03 · day 7 of 16`) that the leading zero supports.

### 2026-05-26 — Routes `goTo` helpers DRY'd via a shared `go(router, target, opts)`

**Tags:** `refactor`, `routes`
**Files:** `apps/mobile/src/app/routes.ts`

Five of the seven `goTo.*` helpers (`today`, `bbb`, `prCelebration`, `complete`, `progress`) repeated the same three-line `if (opts?.replace) router.replace(target); else router.push(target)` tail. Extracted to a local `go(router, target, opts)` helper; each call site is now one line. No behavioural change, no test changes — purely structural. Found during the steady-state audit pass; the trigger for extraction is "≥3 near-identical fragments" and this was five.

### 2026-05-26 — Dev-only "REPLAY" button removed from PR celebration; `pnpm check-temp-markers` added

**Tags:** `bug-fix`, `removal`, `tooling`, `production-readiness`
**Files:** `apps/mobile/src/features/session/PrCelebrationScreen.tsx`, `apps/mobile/src/features/session/components/PrCelebration/usePrCelebrationSequence.ts`, `scripts/check-temp-markers.sh`, `package.json`

Audit found a dev-only "REPLAY" Pressable, comment-tagged `TEMP: dev-only replay trigger ... Remove before shipping`, still rendering on the PR celebration screen. It was production-visible — a small black-on-paper REPLAY button in the top-right corner of the celebration. Removed the button, the local Pressable/RNText imports it required, the unused `type` destructure from `useTheme`, and the now-orphan `replay` callback on `usePrCelebrationSequence` (return type and impl). No tests depended on either.

Added `scripts/check-temp-markers.sh` and wired it into `pnpm verify`. The script greps `apps/mobile/src` (non-test files) for `TEMP:` / `Remove before shipping` / `FIXME` markers; non-zero exit if any survive. This is the third "leftover dev artifact" caught in five iterations — the first two were a red typecheck (loop-016) and the line-height pattern (loop-020). A grep-based gate is the cheapest possible insurance and keeps the gauntlet honest.

**Why:** the comment was unambiguous and yet the button shipped — review-time vigilance is not enough, and screenshot diff doesn't catch a one-pixel REPLAY chip on a dark background. The audit also flagged: this class of bug (visible-but-dev-only artifact) had no automated gate.

### 2026-05-26 — `useLiftCarouselSync` extracted to shared; per-screen wrappers deleted

**Tags:** `refactor`, `home`, `progress`, `shared`
**Files:** `apps/mobile/src/features/shared/hooks/useLiftCarouselSync.ts` (new), `apps/mobile/src/features/shared/hooks/__tests__/useLiftCarouselSync.test.tsx` (new), `apps/mobile/src/features/home/HomeScreen.tsx`, `apps/mobile/src/features/progress/ProgressScreen.tsx`, deleted `apps/mobile/src/features/home/hooks/useHomeCarouselSync.ts`, deleted `apps/mobile/src/features/home/hooks/__tests__/useHomeCarouselSync.test.tsx`, deleted `apps/mobile/src/features/progress/hooks/useProgressCarouselSync.ts`

The two carousel-sync hooks were ~95% identical — same listRef pattern, same momentum-end → setSelectedLift dispatch, same scrollToIndex error swallow. Consolidated to one `useLiftCarouselSync` in `features/shared/hooks/`. The progress hooks directory is now empty and removed. HomeScreen also had a biome-organizer artifact where the file-header docblock was wedged between imports, and a stale comment referring to the removed SEE FULL SESSION CTA — both fixed in the same touch.

**Why:** "three near-identical fragments" is the trigger for extraction; this was two but the divergence pressure was zero (both screens share the same FlatList carousel shape and same `setSelectedLift` signature). Keeping two copies invited drift the next time someone tunes the scroll behaviour.

### 2026-05-26 — Line-height clipping rule codified as `pnpm check-line-heights`

**Tags:** `bug-class`, `tooling`, `convention`, `process`
**Files:** `scripts/check-line-heights.sh`, `package.json`, `loop-memory/09-rn-text-clipping.md`, `apps/mobile/src/design/primitives/Heading.tsx`, `apps/mobile/src/features/progress/components/ProgressTitleBlock.tsx`, `apps/mobile/src/features/session/components/RestPhase.tsx`, `apps/mobile/src/features/onboarding/steps/PickLifts.tsx`, plus four annotation-only touches in PR celebration / GoalPanel / StatsTriplet for legitimately digit-only displays

User reported the Progress screen masthead clipping the "Progress." descender — *again*, with the explicit frustration "why do we keep getting lineheight font cut off issues". The recurring root cause: PWA Tailwind designs use `leading-[0.92]`-style ratios that look fine in browsers (which let glyphs bleed below the line box) but RN strictly clips. Porters keep transcribing the tight ratio verbatim. Codified the rule as a CI check: for any inline `fontSize: N` + `lineHeight: M` pair in display-size text (≥ 24 px), require `M ≥ 1.14 × N`. Digit-only displays (`numeric` props, countdown clocks, tabular-num stat values) can opt out with a `// rn-line-height-ok: <reason>` comment on the preceding line. Wired the script into `pnpm verify` so the next time a porter writes `lineHeight: 52` against `fontSize: 56`, the gauntlet refuses to ship.

The audit found one additional unreported bug — RestPhase's "Stronger" headline (PR-mode top of rest phase) was rendering at fontSize 64 / lineHeight 64; the 'g' was clipped. Fixed (64/74, matching LiftPageTitle's tested ratio).

**Why:** the bug class repeats; the loop-memory note alone was not enough. A CI gate forces correctness at commit time instead of relying on screenshot pairs.

**Trade-off:** the heuristic is grep-based, so it misses fontSize/lineHeight pairs that aren't adjacent inline literals (e.g. constants defined elsewhere and referenced by name). That's an accepted gap — the inline pattern is where the bug actually lives.

### 2026-05-26 — Home LiftPage: SEE FULL SESSION removed; SEE PROGRESS hoisted to under the stats triplet

**Tags:** `feature`, `removal`, `home`
**Files:** `apps/mobile/src/features/home/components/LiftPage/LiftPage.tsx`, `apps/mobile/src/features/home/HomeScreen.tsx`, `apps/mobile/src/features/home/__tests__/LiftPage.{,setDisplayUnit,crossUnit}.test.tsx`

User: "Remove the See full Session CTA in home screen. It's duplicate behavior as the primary CTA." Both `onResume` and `onOpenPlan` already routed to the same `handleOpenToday(lift)` — the chip was a true no-op alternative. Dropped the chip, the SecondaryLink import in that screen, the `onOpenPlan` prop on `LiftPage`, the corresponding wire-up in HomeScreen, and the test that exercised it. Then moved the remaining SEE PROGRESS chip from below the primary CTA to directly under the LiftStats triplet (per the user's "right under the three metrics" framing), so the lifter can hop to the projection without scanning past the CTA.

**Why:** the duplicate affordance was confusing — two ways to start the same action; lifters explored which differed and learned the answer was "nothing". Putting SEE PROGRESS near the metrics keeps the projection accessible without giving it the same visual weight as Begin/Resume.

### 2026-05-25 — ProgressScreen split into one-component-per-file; LiftPage adopts SecondaryLink

**Tags:** `refactor`, `progress`, `home`, `convention`
**Files:** `apps/mobile/src/features/progress/{ProgressScreen,labels,goalDefaults}.{ts,tsx}`, `apps/mobile/src/features/progress/components/{ProgressLiftPage,ProgressLiftRow,ProgressGridHeader,ProgressSkeleton,ProgressTitleBlock}.tsx`, `apps/mobile/src/features/home/components/LiftPage/LiftPage.tsx`

ProgressScreen.tsx was a 655-line file holding seven components (the screen, the per-lift page, a grid header, a row, a skeleton, a caps label, and a local helper named `Row` that collided semantically with the `Row` primitive). Split into one component per file under `components/`, with two small helper modules (`labels.ts`, `goalDefaults.ts`) for the pure helpers. The local `Row` is now `ProgressLiftRow` — distinct from the design-system `Row`, which is a flex layout primitive. LiftPage.tsx's two bottom action chips ("SEE FULL SESSION", "SEE PROGRESS") were inline `Pressable + CapsLabel` blocks that exactly matched the `SecondaryLink` primitive added in loop-018; swapped both. Also dropped the local `unitGlyphFor` in favour of `domain/units.displayUnit`, and downgraded six unused `export`s on `useLiftProgression` / `useSetLiftGoal` to module-local types now that `find-unused` is wired into the loop.

**Why:** the criteria explicitly call for one-component-per-file and primitive consolidation when three near-identical fragments exist. ProgressScreen had been touched in seven of the last seven commits — exactly the "frequently-edited" smell the rule points at. The SecondaryLink swap is the same shape lesson: a primitive existed, two sites still hand-rolled the same Pressable+CapsLabel chrome.

**Trade-off:** no behavioural change, no test changes — the refactor is purely structural. The grid header, skeleton, and lift row are now testable on their own if a future iteration needs to assert pixel-level behaviour; today they remain covered through `ProgressScreen.test.tsx`'s screen-level assertions.

### 2026-05-25 — Progress screen rebuilt against canonical design (TM/1RM goal, stats triplet)

**Tags:** `redesign`, `progress`, `goals`, `data-migration`
**Files:** `apps/mobile/src/features/progress/`, `apps/mobile/src/design/primitives/{ProgressGridCell,ProgressGridRow,TmCell,PagerDots}.tsx`, `apps/mobile/src/domain/progression.ts`, `apps/mobile/src/data/drizzle/{schema,migrations/0001_init,runMigrations}.ts`, `apps/mobile/src/data/accessors/liftGoal.ts`, `apps/mobile/src/data/queries/{useLiftGoal,useSetLiftGoal,useLiftProgression}.ts`, `_workspace/00_input/canonical-progress-v3.jsx`

User surfaced the canonical Claude-Design HTML/JSX file for the Progress screen ("531 v3.html" bundle, screen `screens-progress-v3.jsx`) and asked us to implement against it. The earlier brainstorm-derived implementation diverged enough that we threw it out and rebuilt: stats triplet (TM · Best e1RM · Cycle) above a TM/1RM-toggle goal panel above a cycle-matrix grid with TM right column and a horizontal goal rule + beyond-chart footer; +N per cycle footnote. Past + current + future cycles render in one continuous range C01..currentCycle+6 with a `now` cell on the current week (caps "NOW" eyebrow + prescribed weight on a tinted row). Lift switcher kept as our swipe pager + dots (the one deliberate divergence from the canonical's tabs).

**Schema change:** `lift_goals` table `target_e1rm` column replaced with `kind ∈ ('tm','1rm')` + `target_value`. Dev DBs heal via the existing staleness-drop path (extended to `lift_goals`).

**Why:** the brainstorm-derived goal model (e1RM-only with rolling AMRAP rep-margin projection) was clever but the canonical design's TM/1RM toggle is simpler and matches how 5/3/1 lifters actually think about progression. Right column = TM (not e1RM) — TM is what gets projected; e1RM lives in the stats triplet as the "best lifetime PR" anchor. Goal panel is inline (not a sheet) so stepping the value gives an immediate visual response on the goal-rule placement.

**Trade-offs / what we didn't do:**
- **Kept swipe pager**, not the canonical's full-width tabs. User decision — tabs would compete with bottom-nav style elsewhere; the swipe gesture matches Today.
- **Domain functions dropped:** `projectE1RMForFuture`, `cyclesUntilGoal` (both e1RM-based). Added `tmFromOneRm`, `goalTargetTm`, `cyclesUntilTmGoal`, `projectCycleRows`. `bestE1RMForCycle` + `rollingAmrapMargin` kept (latter is informational only now — projection is pure TM-linear).
- **AMRAP failure / TM reset still deferred** (carried over from prior decision).
- **Pre-prod data migration:** the brief existence of the e1RM-goal schema means no users had real data; dev DBs drop+recreate via the existing staleness mechanism. No production users to migrate.

### 2026-05-25 — Progress screen: per-lift cycle×day grid + e1RM goal projection

**Tags:** `feature`, `architecture`, `progress`, `goals`
**Files:** `apps/mobile/src/domain/progression.ts`, `apps/mobile/src/data/drizzle/schema.ts` (new `lift_goals` table), `apps/mobile/src/data/accessors/{liftGoal,liftProgression}.ts`, `apps/mobile/src/data/queries/{useLiftGoal,useSetLiftGoal,useLiftProgression}.ts`, `apps/mobile/src/design/primitives/{ProgressGridCell,ProgressGridRow,E1rmCell,GoalStrip,PagerDots}.tsx`, `apps/mobile/src/features/progress/`, `apps/mobile/src/app/progress/[lift].tsx`, `apps/mobile/src/features/home/components/LiftPage/LiftPageTitle.tsx` (now Pressable), `_workspace/01_design_spec.md`

New screen reached by tapping the giant lift headline on TODAY. Renders a single lift's progression as a grid (rows = cycles with absolute numbering, cols = D1/D2/D3/Deload), with filled cells for completed days, an outlined "you are here" cell on the most-recent completed day, and ghosted future cells out to current + 6 cycles. A right-column e1RM (Epley, ported from the PWA) shows past-actual and future-projected values. A dashed goal-rule renders between the two cycles whose projected e1RMs straddle the user's goal; the ★ glyph sits on the crossing cycle. Lifts switched via horizontal swipe pager, dots only.

**Why this shape:** the brief wanted "a grid that reads like a notebook" — the e-ink/CycleStrip vocabulary generalizes cleanly to N rows. Goal was set to e1RM (not TM) because lifters internalize PRs as 1RMs; the goal strip is tappable and lives at the top so the answer to "how long until?" is always one tap away. Future projection uses a rolling AMRAP rep-margin average over the last 3 cycles (fallback to minimum prescribed reps for new users), projects from week-3 specifically because that's mathematically the highest-e1RM event of any cycle.

**Trade-offs / what we didn't do:**
- **No AMRAP failure / TM-reset handling.** Projection assumes on-pace forever. Known gap, called out in the spec.
- **Per-row TM dropped.** Header sub-line carries `TM 230 · e1RM 248`; per-row would have either repeated (wasted ink) or competed with the e1RM column.
- **No new design tokens.** Filled/outlined/ghosted all map to existing `ink0`/`bg0`/`line`/`ink3`; the ghosted dashed border uses RN's `borderStyle: 'dashed'` directly with an accepted Android-rendering risk (SVG fallback deferred until QA hits it).
- **Past-cell tap reuses `SessionCompleteScreen`** via `goTo.complete(router, sessionId, { from: 'history' })` — no new detail screen needed.

### 2026-05-25 — Cancel session removed end-to-end; Restart is now the only mid-session escape

**Tags:** `removal`, `product`, `session`
**Files:** `apps/mobile/src/features/session/components/CancelPill.tsx` (deleted), `apps/mobile/src/features/session/components/CancelConfirmSheet.tsx` (deleted), `apps/mobile/src/data/accessors/session.ts`, `apps/mobile/src/features/session/hooks/useLiveScreenState.ts`, `apps/mobile/src/features/session/hooks/useTodaySessionActions.ts`, `apps/mobile/src/features/session/components/SessionTopBar.tsx`, `apps/mobile/src/features/session/TodayScreen.tsx`

Deleted the cancel-session surface entirely: the pill, the two-tap confirm sheet, the `cancelSession` accessor, the `'cancel-confirm'` phase in the live-screen state machine, and all the wiring on Today + Live + tests. The `'cancelled'` status enum value stays in the schema for legacy data, but nothing in the app writes it anymore. Restart (`resetSession`) is now the only mid-session escape — and it keeps the session in_progress at set 1 rather than closing it.

**Why:** user ask — cancel was the second destructive flow on a screen that already has Restart, and the two reads as redundant. Removing one collapses the recovery model to "you're either training or starting over."

**Trade-off / what we didn't do:** kept the `'cancelled'` status in the schema rather than migrating it out. Cheap to leave, expensive to drop with no benefit.

### 2026-05-25 — Live-screen exit gate must exclude `'awaiting-bbb'` and `'pr-celebration'`, or the SESSION_KEY refetch races the BBB redirect

**Tags:** `bug`, `architecture`, `rn`
**Files:** `apps/mobile/src/features/session/hooks/useLiveScreenEffects.ts`

After AMRAP, fast-tapping through the rep entry dropped the user on Home instead of BBB. Root cause: `onSaveAmrap` runs `completeSession` BEFORE `setPhase('awaiting-bbb')`, so by the time the `'awaiting-bbb'` effect fires `invalidateSessionSurface`, the `SESSION_KEY` refetch can land `status: 'completed'` and re-render. The exit gate effect only excluded `phase === 'complete'`, so on that intermediate render it saw `status !== 'in_progress'` and fired `goTo.home(router)` — clobbering the in-flight redirect to BBB. Fix: exclude `'awaiting-bbb'` and `'pr-celebration'` from the gate too. Those phases own their own routing.

**Why:** the dedicated routing effect and the defensive exit gate were both listening to the same state, and the exit gate's "non-in_progress = go home" was too aggressive for phases that intentionally outlive the status transition.

**Trade-off / what we didn't do:** considered moving the status check fully inside the routing effects and dropping the gate. Rejected — the gate is what catches "session deleted from another surface", which the routing effects don't model. The fix is additive: the gate now bails for any phase that owns its own navigation.

### 2026-05-25 — Full-bleed status bar uses a global tint subject; native-stack card was clipping the per-screen escape (loop-018)

**Tags:** `bug`, `architecture`, `rn`
**Files:** `apps/mobile/src/design/statusBarTint.ts`, `apps/mobile/src/design/primitives/StatusBarShim.tsx`, `apps/mobile/src/app/_layout.tsx`, `apps/mobile/src/features/session/PrCelebrationScreen.tsx`, `loop-memory/07-status-bar-fill.md`

The PR celebration's status-bar paint had broken three times across loops 002–005, "fixed" each time with a per-screen `marginTop: -insets.top` escape on the surface. Loop-018's report ("still not black, is it because it's not a normal screen?") finally got us to root cause: react-navigation's native-stack card has `overflow: hidden`, which visually clipped the escape at the card boundary on real devices. Fix: paint the safe-area strip from outside the card. Added a module-level subject (`src/design/statusBarTint.ts`) that screens push into via `useStatusBarTint(color)`, and `SafeTopFrame` reads via `useSyncExternalStore` and renders an absolute strip when non-null. `StatusBarShim` keeps its existing API but is now the one component that does both effects (Android `<StatusBar backgroundColor translucent={false}>` + push tint). The PR celebration screen lost the negative-margin escape entirely.

**Why:** the fix had to be ABOVE the native-stack card in the tree; you can't paint past an `overflow: hidden` ancestor from inside it.

**Trade-off / what we didn't do:** considered moving safe-area handling per-screen (delete `SafeTopFrame`). Rejected — every other screen depends on it and the refactor surface would be large. The global tint subject is a few lines and the consumer surface is one hook call.

### 2026-05-25 — Pre-commit hook + `pnpm verify` script both had silent gaps (loop-017)

**Tags:** `bug`, `process`, `tooling`
**Files:** `package.json`, `loop-memory/00-loop-pacing.md`, `.git/hooks/pre-commit` (local, via `scripts/install-hooks.sh`)

Loop-016 pushed a commit with a typecheck failure (fixture row used `kind: 'bbb' as const` against a `'working' | 'amrap'` union). The pre-commit hook that exists for exactly this case had never been installed on this seat — `.git/hooks/pre-commit` was empty. And `pnpm verify` (what the hook runs) invoked `pnpm ci` instead of `pnpm run ci`, hitting the pnpm builtin instead of our script — so even with the hook installed, verify would have errored before running typecheck. Fixed all three: widened the union, installed the hook, swapped `pnpm ci` → `pnpm run ci` in the verify script. Added the recovery steps to `loop-memory/00-loop-pacing.md` so the next fresh-context loop doesn't repeat the chain.

**Why:** the gap between two safety layers you assume are independent is where the failure hides. Worth a decision-log entry because the fix is structural (the verify-script bug applies to every contributor, not just this seat).

**Trade-off / what we didn't do:** considered auto-installing the hook on every loop run. Rejected — the loop shouldn't mutate the contributor's `.git/hooks/` invisibly. Pacing memory now documents the manual install instead.

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
