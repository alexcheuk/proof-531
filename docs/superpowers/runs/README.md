# Run logs

Each time `/initial-implement` processes a task, it appends artifacts here.

## Directory layout

`docs/superpowers/runs/<task-id>/<ISO-timestamp>/`:

- `planner.md` — Planner subagent output (the steps it proposed)
- `implementer.diff` — `git diff` of the worktree after the implementer ran
- `verifier.json` — Verifier output (one file per attempt: `verifier.1.json`, `verifier.2.json`, etc.)
- `fixer.diff` — Diff per fixer attempt (`fixer.1.diff`, `fixer.2.diff`, ...)
- `reviewer.md` — Reviewer output (one per cycle)
- `outcome.md` — Final summary: done | blocked, attempts, total time, link to merged commit

## Reading a log

To see what happened for a specific task:

```bash
ls docs/superpowers/runs/<task-id>/
# pick the latest timestamp
cat docs/superpowers/runs/<task-id>/<timestamp>/outcome.md
```

To find all blocked tasks and why:

```bash
grep -l "BLOCKED" docs/superpowers/runs/**/outcome.md
```

## Not gitignored

These logs are committed alongside the task they describe. They are part of the audit trail.
A logs-only commit is allowed when reviewing a blocked task's history.
