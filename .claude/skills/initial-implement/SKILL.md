---
name: initial-implement
description: Orchestrator that picks the next ready task from docs/superpowers/queue.yaml, implements it via five subagents (planner, implementer, verifier, fixer, reviewer), runs the full harness, and commits. Supports --batch (loop until done/blocked/limit), --max-tasks N (default 5), --status, --task <id>, --retry <id>.
---

# /initial-implement — autonomous task runner

> **Scaffolding status:** The orchestrator is staged across three tasks. After P0-04 (this task), `SKILL.md` and `queue-format.md` exist but the slash command is **not yet invokable** — `subagent-prompts/*.md` arrive in P0-05 and `scripts/*.sh` arrive in P0-06. Do not invoke until P0-06 lands. P0-99 verifies the full pipeline end-to-end.

You are the orchestrator. Your job is to move tasks from `docs/superpowers/queue.yaml` from `todo` to `done` without human intervention, while keeping every change atomic, verified, and reversible.

## Flags (parsed from $ARGUMENTS)

| Flag | Effect |
|---|---|
| _(none)_ | Run exactly one ready task, then stop. |
| `--batch` | Loop after each task. Halt on: queue empty, blocked task, two consecutive failures, `--max-tasks` reached, user interrupt. |
| `--max-tasks N` | Safety ceiling for `--batch`. Default 5. Override with any positive integer. Use `--unsafe-unbounded` for no ceiling (discouraged). |
| `--unsafe-unbounded` | Disable the `--max-tasks` ceiling. Only meaningful with `--batch`. Use with caution. |
| `--status` | Print the queue with checkboxes and exit. No work. |
| `--task <id>` | Run a specific task by id. Dependencies must already be `done`. |
| `--retry <id>` | Reset `<id>` to `todo` (whether currently `done` or `blocked`) and run it. |

### Flag combinations

- `--status`, `--task <id>`, `--retry <id>` are mutually exclusive with each other and with `--batch`. They run a one-shot operation and exit.
- `--max-tasks` and `--unsafe-unbounded` are only meaningful with `--batch`; ignored otherwise.
- If multiple mutually-exclusive flags are passed, print an error and exit non-zero.

## Required reading before you start

1. `docs/superpowers/specs/2026-05-19-expo-scaffold-design.md` — the source of truth for what we're building and why.
2. `CLAUDE.md` (repo root) — boundary rules, dev commands, design-reference policy.
3. `.claude/skills/initial-implement/queue-format.md` — schema of `queue.yaml`.
4. `.claude/skills/initial-implement/subagent-prompts/*.md` — the templates you fill in when spawning subagents.

## Execution flow (one task)

1. Parse $ARGUMENTS into flags.
2. If `--status`: cat queue with status icons, exit.
3. Pick a task:
   - If `--task <id>`: load that task. Verify deps are done. If status is not `todo`, print "task <id> is <status>; use --retry to re-run" and exit non-zero. Otherwise proceed.
   - If `--retry <id>`: load that task. Reset status to todo. (User-initiated reset, no dep check beyond normal.)
   - Otherwise: run `.claude/skills/initial-implement/scripts/pick-next.sh`. It prints the id of the next ready task, or empty if none.
4. Mark task `in_progress` via `scripts/mark-status.sh`.
5. Create worktree at `.worktrees/<task-id>` on branch `auto/<task-id>` via the `using-git-worktrees` skill or `git worktree add`. Immediately after creating the worktree, run `pnpm install` inside it — git worktrees do not share `node_modules` with the primary checkout, and tests/typecheck/lint will fail with `Cannot find module` errors until deps are installed. If install fails, mark the task `blocked` with the install error and abort the task.
6. Spawn PLANNER subagent (template: `subagent-prompts/planner.md`).
   - **Before spawning ANY subagent for this task**, pin the run-log timestamp:
     `export RUN_LOG_TS="$(date -u +%Y-%m-%dT%H-%M-%SZ)"`. Every `write-run-log.sh`
     invocation for this task will then land in the same `docs/superpowers/runs/<id>/<RUN_LOG_TS>/`
     directory. Without this, each subagent's log lands in its own timestamp dir.
   - Output: ordered list of implementation steps.
   - Log to `docs/superpowers/runs/<task-id>/<ISO-timestamp>/planner.md`.
7. Spawn IMPLEMENTER subagent (template: `subagent-prompts/implementer.md`) in the worktree.
   - Input: planner steps + task spec.
   - Output: edits committed locally in the worktree.
8. Spawn VERIFIER subagent (template: `subagent-prompts/verifier.md`) in the worktree.
   - Input: task `done_when` criteria.
   - Output: structured pass/fail JSON.
9. If verifier reports failure:
   - For attempt in 1..3:
     - Spawn FIXER subagent (template: `subagent-prompts/fixer.md`).
       - Input: verifier failures, current diff, planner steps.
       - Output: targeted fixes.
     - Re-run verifier.
     - If verifier passes, break.
   - If still failing after 3 attempts: mark task `blocked` with the last failure summary, abandon the worktree, exit (or in `--batch`, halt).
10. Spawn REVIEWER subagent (template: `subagent-prompts/reviewer.md`).
    - Input: git diff between main and the worktree branch, task `done_when`.
    - Output: `approve` | `request-changes <list>`.
11. If reviewer requests changes:
    - For cycle in 1..2:
      - Spawn fixer again with reviewer's notes (no verifier failure this time).
      - Re-run reviewer.
      - If approved, break.
    - If still rejected after 2 cycles: mark task `blocked`, exit.
12. Squash-merge worktree into main. (Direct-to-main commits are intentional per spec §5; the run log + DoD checklist in the commit body provide the audit trail.)
    - Switch to main in the primary working directory.
    - `git merge --squash auto/<task-id>`.
    - `git commit -m "[auto] <task-id> <title>"` with the done_when checklist and a link to `docs/superpowers/runs/<task-id>/` in the body.
    - `git worktree remove .worktrees/<task-id>`.
    - `git branch -D auto/<task-id>`.
13. Mark task `done` via `scripts/mark-status.sh`. Commit queue update.
14. If `--batch` and tasks remaining and no halt condition: goto step 3.
15. Print one-line summary per task processed and exit.

## Halt conditions for `--batch`

Stop the loop and exit on any of:
- Queue contains no ready tasks (all done, or remaining are blocked by failed deps).
- The current task was marked `blocked` (verifier or reviewer gave up).
- Two consecutive tasks in this invocation were marked `blocked`. The counter resets to 0 on any task that finishes `done`.
- `--max-tasks N` reached.
- User sends SIGINT (Ctrl+C).
- `--unsafe-unbounded` was not passed and we processed `--max-tasks` worth of tasks.

After halting, print a final report: tasks completed, tasks blocked (with reasons), tasks remaining, link to run logs.

## Recovery

**On SIGINT mid-task:** the queue stays at `in_progress` and the worktree is preserved. To resume: run `/initial-implement --retry <id>`. It resets the task to `todo`, rebuilds the worktree if needed, and restarts the task from scratch (planner → implementer → verifier → reviewer). To clean up manually instead: `.claude/skills/initial-implement/scripts/mark-status.sh <id> todo && git worktree remove .worktrees/<id> 2>/dev/null && git branch -D auto/<id> 2>/dev/null`.

**On worktree creation failure (step 5):** revert the task status from `in_progress` back to `todo`, print the error, and exit non-zero. Do not proceed to step 6.

**On orphaned `in_progress` (orchestrator was killed externally):** manual reset is the recovery path. See `queue-format.md` "Status semantics."

## Logging

For each task, create `docs/superpowers/runs/<task-id>/<ISO-timestamp>/`:
- `planner.md` — full output of the planner subagent
- `implementer.diff` — `git diff` of the worktree
- `verifier.json` — verifier's structured output (one per attempt)
- `fixer.diff` — diff of each fixer attempt (numbered)
- `reviewer.md` — reviewer's output (one per cycle)
- `outcome.md` — summary: done | blocked, attempts, total time, link to merged commit

Use the helper `scripts/write-run-log.sh <task-id> <subagent-name> <content-path-or-stdin>`.

## What you (the orchestrator) MUST NOT do

- Edit files outside `.worktrees/<task-id>` directly. Implementer and fixer do edits, inside the worktree.
- Force-push, delete user branches, amend published commits.
- Bypass `done_when` criteria. If a criterion is impossible, mark the task `blocked` and surface the gap.
- Continue past two consecutive blocked tasks in `--batch` mode.
- Spawn subagents without filling out the template prompt completely.

## Subagent invocation

Use the subagent-spawn tool available in this environment (typically `Task`, may also appear as `Agent`) with `subagent_type: general-purpose` for all five roles. The templates in `subagent-prompts/` contain the full prompts; substitute `{{placeholders}}` with task-specific content before calling. Constrain behavior in the prompt itself ("you must not edit files", "your only output is JSON matching this schema", etc.) — `general-purpose` agents respect role constraints stated in the prompt.

## Reference

- Spec: `docs/superpowers/specs/2026-05-19-expo-scaffold-design.md` §5.
- Queue schema: `.claude/skills/initial-implement/queue-format.md`.
- Subagent templates: `.claude/skills/initial-implement/subagent-prompts/*.md` (created in P0-05).
- Helper scripts: `.claude/skills/initial-implement/scripts/*.sh` (created in P0-06).
- Existing superpowers skills to leverage: `using-git-worktrees`, `subagent-driven-development`, `verification-before-completion`, `test-driven-development`.
