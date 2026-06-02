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
