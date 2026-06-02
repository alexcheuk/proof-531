# Retired machinery

Files here are retired, not deleted: kept for reference and recoverable via `git mv` back or git history. Do not treat anything here as live.

## Retired 2026-06-01 (do-work migration)

The `/auto-improve` loop was replaced by the `/do-work` architecture (ported from the koresore-app project). As part of that migration the queue-driven task system was retired, because the queue was fully drained (all 57 tasks `status: done`) and the new single task model is `do-work/work/backlog.md`.

- **`queue.yaml`** (was `docs/superpowers/queue.yaml`): the drained task queue. The do-work work-graph (`do-work/work/backlog.md`) is the only task model now.
- **`initial-implement-skill/`** (was `.claude/skills/initial-implement/`): the five-subagent (planner/implementer/verifier/fixer/reviewer) orchestrator that drained the queue and squash-merged `[auto]`-prefixed commits. Superseded by the do-work loop plus the `rn-expo-pipeline` skill (for feature work). Its `subagent-prompts/`, `scripts/`, and `queue-format.md` moved with it.
- **`initial-implement-command.md`** (was `.claude/commands/initial-implement.md`): the slash command that invoked the skill above.

The decision is recorded in `docs/decision-log.md` and `do-work/DOCTRINE.md` (the migration ADR). Historical references in `docs/superpowers/specs/`, `docs/superpowers/plans/`, and `docs/superpowers/runs/` are left intact as an accurate record of the state at the time they were written.
