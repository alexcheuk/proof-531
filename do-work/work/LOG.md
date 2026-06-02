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

## 2026-06-01 tick-0: do-work architecture migrated from /auto-improve
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
