# queue.yaml format

The orchestrator's backlog. Single source of truth for "what's left to build."

## Schema

```yaml
version: 1                  # integer; bump when schema changes
tasks:
  - id: <string>            # unique, kebab-case, prefix with phase (e.g., "P1-04-press-button")
    title: <string>         # one-line human description
    phase: <integer>        # 0..7
    depends_on: [<id>, ...] # other task ids that must be done first
    status: todo | in_progress | done | blocked
    blocked_reason: <string>  # only present when status=blocked
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#5--the-initial-implement-orchestrator
    done_when:              # ordered list of machine-checkable assertions
      - <string>
    notes: |                # implementation hints (no code)
      <multi-line>
    behavioral_reference: apps/mobile/src/...  # optional: existing file the task ports behavior from
```

## Status semantics

- `todo`: not yet started.
- `in_progress`: orchestrator is currently working on it. If you see this and no orchestrator is running, manually reset to `todo` via `scripts/mark-status.sh <id> todo`.
- `done`: every `done_when` criterion satisfied, reviewer approved, merged to main.
- `blocked`: orchestrator gave up after retries. `blocked_reason` describes why. Recover with `/initial-implement --retry <id>` after addressing the cause.

## Invariants

- `blocked_reason` MUST be present when `status == blocked` and MUST be absent otherwise. `mark-status.sh` enforces this — clears `blocked_reason` on any transition out of `blocked`.

## Readiness

A task is **ready** to start when `status == todo` AND every id in `depends_on` resolves to a task with `status == done`.

## done_when

Every criterion must be machine-checkable. Good examples:
- `"pnpm typecheck passes"`
- `"src/design/primitives/PressButton.tsx exists"`
- `"jest test for accessibility role passes"`
- `"no hex literals outside tokens.ts (rg -n '#[0-9a-fA-F]{3,8}' src/design/ | grep -v tokens.ts returns empty)"`

Bad examples (vague — reviewer will reject):
- `"PressButton looks good"`
- `"accessibility is correct"`
- `"works on iOS"`

## done_when evaluation

Criteria are run **in order, all of them**. The verifier does not short-circuit — it executes every criterion, then aggregates pass/fail. This gives a complete picture of what's broken (vs. only the first failure).

## Tools

| Script | Purpose |
|---|---|
| `scripts/pick-next.sh` | Print id of next ready task (lowest phase number, then lowest id). Empty if none. |
| `scripts/ready-tasks.sh` | Print all ready tasks (one id per line). Useful for `--status` and for diagnostics. |
| `scripts/mark-status.sh <id> <status> [reason]` | Update a task's status. Validates status enum. |
| `scripts/write-run-log.sh <id> <subagent> <file>` | Append to `docs/superpowers/runs/<id>/<timestamp>/<subagent>.md`. |

All scripts require `yq` (https://github.com/mikefarah/yq) v4.
- macOS: `brew install yq`
- Linux / CI: download from https://github.com/mikefarah/yq/releases (e.g., `wget -qO /usr/local/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 && chmod +x /usr/local/bin/yq`)
- The orchestrator should `command -v yq || (echo "yq required: see queue-format.md for install" && exit 1)` on first run.
