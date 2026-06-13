# Tick log

> The loop's own lightweight per-tick continuity. At the start of each iteration the Orient step reads the
> last few entries here to recall what the previous tick actually did (what shipped, what was proven, what
> was deferred or escalated) so it can pick up without re-deriving state from the diff.
>
> Keep this trimmed to roughly the last 12 entries. Older detail lives in two durable places and does not
> need to be duplicated here: git history (the commits themselves) and `docs/decision-log.md` (the notable
> decisions). When trimming, drop the oldest entries; do not rewrite history.
>
> CRUCIAL: this is the loop's INTERNAL memory. The Expedition dev-blog
> (`commission-expedition-log` / Verso / the Logger) is a separate, purely DOWNSTREAM side-effect written
> at the Record step as output only. The blog is outward-facing fiction; this LOG is not the blog, the blog
> does not read this LOG, and the loop never reads the blog to decide work. Orient reads this file and only
> this file for per-tick continuity.

## Entry format
```
## <YYYY-MM-DD> tick-<n>: <one-line headline>
- shipped: <what landed this tick>
- proof: <how it was proven - tsc/lint/jest/git grep for logic, or a build smoke result for UI>
- deferred / escalated: <what was punted to a later tick or sent to #needs-input, or "none">
```
Two to four bullets per entry. Add the newest entry at the top, under `## Entries`.

## Entries

## 2026-06-12 tick-4 (Exp 82): Rest timer accuracy + per-day warmup ramps + CI em-dash guard
- shipped (BUG, task 1515166601270530048): useRestTimer now arms a precise setTimeout at the exact deadline
  for the done haptic/alarm; setInterval(1000) accumulated 1-2s of jitter over a 3-min rest. addTime,
  subtractTime, setDeadline each re-arm it; doneFiredRef guard prevents double-fire. 5 new tests.
- shipped (FEAT, WARMUP-PERDAY, task 1512218815356862494): warmupsForDay(week) in schemes.ts; D1 40/50/60%,
  D2 45/55/65%, D3 50/60/70/80%, D4 50/60/70/80/90%; WarmupsBand accepts week prop + dynamic collapsed label;
  TodayBody passes week through; SetRow.index widened to 1|2|3|4|5; 9 property+unit tests.
- shipped (LOOP/CI, LOOP-EMDASH-GUARD): scripts/check-no-em-dash.sh scans do-work/+loop-memory/+decision-log;
  wired into pnpm run ci after check-temp-markers; 23 loop-memory files swept clean of em dashes; LOOP-EMDASH-MOBILE
  filed for the ~200 pre-existing em dashes in apps/mobile/src/** (tracked separately, CI scope expanded later).
- shipped (docs): README iteration count 78+ -> 82+; em dashes swept from docs/decision-log.md.
- proof: pnpm typecheck clean (mobile+web); pnpm lint clean (505 files); 1135/1135 tests (181 suites, +14 new);
  pnpm run ci green including new check-no-em-dash gate; do-work-auditor PASS (after fixing em dash in new comment
  and setting REST-TIMER-ACCURACY to doing not done). Pushed to main.
- deferred / escalated: MISSED-REP implementation -> next tick (rn-expo-pipeline). WARMUP-PERDAY and
  REST-TIMER-ACCURACY owe on-device Maestro smokes (accrued in validation-debt). WEB-SIGNOFF still blocked on
  Alex's #needs-input reply. LOOP-EMDASH-MOBILE -> future tick (apps/mobile em-dash sweep).

## 2026-06-07 tick-3 (Exp 81): Progress-grid correctness cluster (3 task-queue bugs) + warmup spec
- shipped (BUG, logic, task 1513375490184843334): `projectTopSetWeight` in `domain/progression.ts` mapped
  every Progress-grid day through `prescription(3)[day-1]`, so day 1 read 75% and day 2 read 85% of TM instead
  of that week's real top set. Now maps day d -> week d top set `prescription(d)[2]` (85/90/95%), matching the
  live Today/Home headline. This corrected BOTH the future projections AND the "now"/next cell. SOUL math line.
- shipped (BUG, data, task 1513368638764093490): past cycles in the Progress TM column always showed the
  latest TM (`projectCycleRows` flattens past cycles to current TM). `useLiftProgression` now reads the
  historical `trainingMaxSnapshot` from a logged session in each past cycle; falls back to projected only for
  a gap cycle with no session. New integration test (complete a cycle -> past row 250, current 260).
- shipped (FEAT, UI, task 1513375762559008789): D4 (TM test) cells now show reps AND direction. `ProgressGridCell`
  secondary line renders marker + reps together ("↑ × 5"); `ProgressLiftRow` passes reps on tm-test cells. New
  primitive behavior test (marker+reps / reps-only / marker-only). UI -> accrued validation debt for the smoke.
- shipped (Q-QUALITY mandatory slice): de-duplicated the twin `ProgressGridCell` render paths in
  `ProgressLiftRow` (plain vs JustCompletedAnimator-wrapped) into one typed `cellProps` object - the exact
  duplication that forced a two-site `reps` edit minutes earlier. Behavior-preserving; tests unchanged-green.
- shipped (DESIGN routing, task 1512218815356862494): rn-designer spec for per-day warmup ramps
  (`apps/mobile/_workspace/warmup-per-day-spec.md`) - bridges to each day's top set so the TM-test day goes
  90 -> 100 instead of 60 -> 100; pure `warmupsForDay(Week)`, 10 fast-check invariants. Backlog WARMUP-PERDAY
  filed (doing); implementation routes through rn-expo-pipeline next tick.
- proof: `pnpm typecheck` clean (mobile+web); `pnpm lint` clean; full `pnpm test` 1121/1121 (181 suites, +6).
  `projectTopSetWeight`/`projectCycleRows` consumed ONLY by `useLiftProgression`, so the fix is contained to
  the Progress screen (verified by grep). Days-of-Cycle pin: audited mobile, already consistent (Cycle/Day
  labels; the only "week" strings are a legit calendar "This week" window + "days per week" frequency) - no change.
- deferred / escalated: WARMUP-PERDAY + MISSED-REP implementations -> next tick via rn-expo-pipeline.
  WEB-SIGNOFF still blocked on Alex's em-dash reply in `#needs-input` (no response yet). PROG-GRID-FIX D4
  visual owes one Progress Maestro smoke before `done`. TTS departure fired but homelab unreachable (non-blocking).

## 2026-06-01 tick-2: Days-not-Week consistency, plate-hint truth fix, barrel purge, missed-rep design
- shipped (WEB / live pin 1510485259): `apps/web/src/pages/index.astro` user-facing cycle-position labels
  Week->Day (ledger header + Week01-04 -> Day 01-04; matrix W1-W4 -> D1-D4; renamed dead `week-num` class
  to `day-num`; "week over week" -> "cycle over cycle"; "Every four weeks the TM bumps" -> "At the end of
  each cycle the TM bumps", which fixes a self-contradiction with the page's own "not 4 calendar weeks"
  line). Left legit concepts intact ("7th Week Protocol", "days per week" frequency, "not 4 calendar weeks").
- shipped (bug fix): `livePlateHint.ts` per-side delta rounding 1-decimal -> 2-decimal. Two snapped weights
  differ by a multiple of 2.5lb/1.25kg, so per-side is a multiple of 1.25kg; the old `*10)/10` showed a real
  1.25 kg/side as a lying "1.3". New test asserts `+1.25 kg per side`. lb cases (15, 7.5) unchanged.
- shipped (Q-QUALITY mandatory slice + removal): deleted all 8 `features/` barrel `index.ts` files
  (features/CLAUDE.md rule 3 violation CI wasn't catching), rewired ~12 import sites to concrete files, and
  added a barrel guard to `scripts/check-boundaries.sh` so it can't regress (allows design/primitives/).
- shipped (feature design, task-queue 1511224654327447663): rn-designer produced the missed-rep program-
  correction spec (`_workspace/01_design_spec.md`) reusing the TM-Test suggestion card + apply sheet;
  suggest-never-mutate, first-miss Reset(-10%)/off-day choice, forced reset on 2nd consecutive miss, new
  `lift_miss_state` table, pure property-tested `missResetTm`/`classifyAmrapMiss`. Backlog item MISSED-REP
  filed (doing); implementation is next major slice via rn-expo-pipeline. :+1:'d the task (design in flight).
- shipped (LOOP / escalation): posted the WEB-SIGNOFF em-dash either/or to `#needs-input` (Discord reachable
  now), broadened to the wider ~157-instance web em-dash debt (options C/D). Filed
  `loop-memory/22-web-em-dash-debt.md` (do NOT blind-sweep; placeholder glyphs must stay).
- proof: `pnpm typecheck` (mobile+web) clean; `pnpm lint` clean (503 files); full `jest` 1115/1115 (179
  suites); `check-boundaries.sh` exit 0; Astro build 153 pages exit 0. do-work-auditor PASS on all 4 code
  items (independently re-ran the full suite + boundary check, confirmed behavior-preserving).
- deferred / escalated: WEB-SIGNOFF + web em-dash policy -> awaiting Alex's reply in `#needs-input`.
  MISSED-REP implementation -> next tick. No UI-visual item marked done; no Maestro debt accrued (web copy +
  import-only structure + pure-logic fixes, all test-proven). TTS departure fired but homelab unreachable
  from this seat (non-blocking).

## 2026-06-01 tick-1: first real do-work tick (steady-state, Discord offline)
- shipped: committed the do-work migration seed (43 files: SOUL/DOCTRINE/skill/agents/scripts/work-tree
  + retired-machinery moves). Then one correctness/consistency slice and one loop-maintenance slice.
- shipped (correctness, Q-QUALITY): `useGoalState.ts` `defaultValueFor` 1rm branch `Math.round(currentTm/0.9)`
  -> `round(currentTm/0.9, displayU)`. The recurring Math.round-vs-round bug class (exps 71/78); aligns
  with onKindChange. Branch is unreachable today so it is behavior-preserving (latent-correctness fix).
- shipped (LOOP): retargeted `loop-memory/loop-criteria.md` from /auto-improve to /do-work terminology and
  swept its em dashes; added DISCORD_TOKEN-absent graceful-degradation guidance to `discord-channels.md`.
- proof: `pnpm typecheck` + `pnpm lint` (511 files) clean; full `pnpm test` 1104/178 green (via auditor);
  do-work-auditor PASS on the useGoalState slice (behavior-preserving + genuine improvement confirmed).
- CORRECTION (same tick, after Alex flagged it): Discord was NOT offline. The token is present and valid;
  the loop's own source recipe `. .env.claude.local` (no leading ./) silently fails under zsh (source
  searches $PATH, not cwd). Fixed the recipe to `. ./.env.claude.local` in the do-work SKILL, the
  distiller agent, discord-channels.md, and 17-website-improve-strategy.md; added a load-assert and a
  gotcha note. THEN read Discord for real: 1 active #loop-criteria pin ("Days of Cycle, not Week"), 1
  UNACKED #task-queue item (1511224654327447663: design help for correcting a program after a missed
  rep/set), rest acked. Posted the corrected #auto-improvements summary.
- pending: the unacked missing-rep/set feature is a sizable rn-expo-pipeline design task; surfaced to Alex
  rather than auto-started mid-correction. Not :+1:'d yet (only ack when shipping).
- honest-pacing note: still a steady-state code tick (mature green codebase, 1104 tests); surveyed both
  FlatLists + the PrCelebration animation hooks and found them already correct, so no surface area was
  manufactured. TTS departure was skipped (the same sourcing bug suppressed HOME_TTS_URL too, and the
  expedition had already "departed").
- shipped: the do-work working tree landed - SOUL.md, DOCTRINE.md, the work-graph (`work/backlog.md`),
  this LOG plus the validation-debt ledger, the `scripts/` (check-memory, validation, build-and-validate),
  and the do-work-auditor + distiller agents. The loop's durable knowledge stays in `loop-memory/`.
- shipped: the old machinery is retired - `docs/superpowers/queue.yaml` is fully drained and the
  `initial-implement` pipeline is no longer live. do-work agents plus the `rn-expo-pipeline` skill (for
  features) are now the executors; `work/backlog.md` is the only task model.
- proof: bootstrap migration, no code-behavior change to the app; validated by structure (this is the seed
  tick, not a work tick).
- deferred / escalated: the first real tick orients on this tree - reads this LOG and `work/backlog.md`,
  ranks ready items, and begins the normal Orient -> Prioritize -> Work -> Record cadence.
