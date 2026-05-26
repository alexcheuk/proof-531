# Contributing to 531

This guide covers everything you need to land a change — by hand or via the
`/initial-implement` orchestrator. Read [`CLAUDE.md`](../CLAUDE.md) first; this
document picks up where that leaves off.

## Setup

### Prerequisites

| Tool | Version | Why |
|---|---|---|
| Node | 22 (pinned in `.nvmrc`) | Runtime for Metro and tooling. |
| pnpm | 9.15+ | Workspace manager. Install via Corepack: `corepack enable && corepack prepare pnpm@latest --activate`. |
| bash | 4+ | Orchestrator scripts use `mapfile` and `declare -A`. macOS ships 3.2 — `brew install bash`. |
| yq (mikefarah) | v4 | Queue scripts. `brew install yq`, or download from https://github.com/mikefarah/yq/releases. |
| Expo Go | latest from App Store / Play Store | Run the app on a physical device by scanning Metro's QR. |

### Bootstrap

```bash
git clone <repo>
cd 531
nvm use            # or: fnm use
corepack enable
pnpm install
```

## Daily commands

```bash
pnpm --filter @fivethreeone/mobile start    # boot Metro; scan QR with Expo Go
pnpm typecheck                            # tsc --noEmit across workspace
pnpm lint                                 # biome
pnpm test                                 # jest
pnpm expo-doctor                          # expo doctor (renamed; `pnpm doctor` is a pnpm builtin)
pnpm bundle-check                         # full Metro export — catches missing deps CI doesn't
pnpm run ci                               # full chain — typecheck + lint + boundaries + test
pnpm verify                               # `pnpm run ci` PLUS `pnpm bundle-check` PLUS `build:web`
```

`pnpm verify` is the green-bar gate before every commit. If it does not pass
locally, neither will the orchestrator's verifier (and CI will fail too).

### Local pre-commit hook (optional, recommended)

Run once after cloning:

```bash
bash scripts/install-hooks.sh
```

This drops a husky-free `pre-commit` shell hook into `.git/hooks/` that runs
`pnpm verify` whenever you commit a non-docs change. Docs-only commits skip
the gate so quick CHANGELOG / README edits don't pay the bundle-check tax.
Bypass for a single commit with `git commit -n`.

### Design primitives — single source

Anything that renders pixels lives in `src/design/primitives/`. Before adding
a new primitive, check the catalog — odds are something close already exists:

| Surface           | Primitive                  |
|-------------------|----------------------------|
| Text              | `Text`, `Heading`, `CapsLabel`, `TitleBlock`, `MonoBadge` |
| Layout            | `Row`, `Card`, `Divider`, `SectionBand`, `Masthead`       |
| Tap targets       | `PrimaryPillButton`, `SecondaryLink`, `PillChip`, `CheckboxLedger`, `SegRail`, `LabeledSegRail` |
| Numeric input     | `NumberStepper`, `StatGrid`                                |
| Sheets / surfaces | `Sheet`, `SheetLayout`                                     |
| Top bar pills (session-local) | `TopBarPill` (+ `UndoPill`, `ResetPill`, `CancelPill`, `CompletePill` thin wrappers) |
| Domain composites | `LedgerRow`, `LedgerSection`, `TopSetBlock`, `PlateBar`    |

If your change extends a primitive, prefer adding a variant prop over copying
the file. Drift between near-identical components is the single biggest cause
of visual inconsistency in this app.

## Architecture rules

The repo enforces strict boundaries between layers. The short version:

```
app → features → (design | data | domain)
```

- `src/design/` — the **only** place hex/px literals live.
- `src/domain/` — pure logic. No React, no async, no Drizzle. Property-tested.
- `src/data/` — owns persistence. Components consume via hooks (`useSession()`),
  never `import drizzle` directly.
- `src/features/` — screen composition.
- `src/app/` — thin expo-router shells.
- No barrel files in `features/` or `domain/`.

For the full picture see:

- [`CLAUDE.md`](../CLAUDE.md) — root, boundary rules + dev commands
- [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md) — layer responsibilities
- `src/domain/CLAUDE.md`, `src/design/CLAUDE.md` — folder-scoped rules the
  reviewer enforces

## Adding a task to the queue

The orchestrator's backlog lives in [`docs/superpowers/queue.yaml`](./superpowers/queue.yaml).
To add work:

1. Open `docs/superpowers/queue.yaml`.
2. Append a task entry. The schema:

   ```yaml
   - id: P3-04-press-button         # kebab-case, prefix with phase number
     title: Port PressButton primitive
     phase: 3
     depends_on: [P3-01-tokens]     # ids that must be `done` first
     status: todo
     spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#section
     done_when:
       - "pnpm typecheck passes"
       - "src/design/primitives/PressButton.tsx exists"
       - "jest test for accessibility role passes"
     notes: |
       Port behavior from design-reference/PressButton.jsx.
     behavioral_reference: design-reference/PressButton.jsx
   ```

3. See [`.claude/skills/initial-implement/queue-format.md`](../.claude/skills/initial-implement/queue-format.md)
   for the full schema and invariants.

### `done_when` rules

Every criterion **must be machine-checkable**. The verifier runs them all in
order and aggregates pass/fail.

- Good: `"pnpm typecheck passes"`, `"file X exists"`, `"rg pattern returns empty"`.
- Bad: `"looks good"`, `"accessibility is correct"`, `"works on iOS"`.

### Dependencies

Use `depends_on: [id, id]` to encode ordering. A task is **ready** only when
its status is `todo` and every dep resolves to a task with `status: done`. The
orchestrator picks the lowest-phase ready task first, ties broken by id.

## Running `/initial-implement`

The orchestrator picks the next ready task, spawns subagents, runs the harness,
and merges. Invoke from Claude Code:

| Command | Effect |
|---|---|
| `/initial-implement` | Run exactly one ready task, then stop. |
| `/initial-implement --batch --max-tasks N` | Loop, halt after N tasks (default 5) or on blocker. |
| `/initial-implement --task <id>` | Run a specific ready task (deps must be `done`). |
| `/initial-implement --retry <id>` | Reset `<id>` to `todo` (even if `done`/`blocked`) and run it. |
| `/initial-implement --status` | Print the queue with status icons and exit. |
| `/initial-implement --batch --unsafe-unbounded` | Disable the `--max-tasks` ceiling. Discouraged. |

`--status`, `--task`, `--retry`, and `--batch` are mutually exclusive with each
other (`--max-tasks` is only meaningful with `--batch`).

## The harness

Each task runs through five subagent roles:

```
planner → implementer → verifier → fixer (≤3 attempts) → reviewer (≤2 cycles)
       → squash-merge to main → mark done
```

1. **Planner** — produces an ordered implementation plan.
2. **Implementer** — edits inside `.worktrees/<task-id>` on branch `auto/<task-id>`.
3. **Verifier** — runs every `done_when` criterion, returns structured pass/fail.
4. **Fixer** — up to 3 attempts to address verifier failures.
5. **Reviewer** — checks diff against `done_when` and boundary rules. Up to
   2 fixer cycles if it requests changes.

On success the orchestrator squash-merges to `main` with a commit prefixed
`[auto] <task-id> <title>` and marks the task `done`. On terminal failure it
marks the task `blocked` with a reason and stops (or, in `--batch`, halts after
two consecutive blockers).

All five subagents log to [`docs/superpowers/runs/<task-id>/<timestamp>/`](./superpowers/runs/).
The timestamp is shared across the run via `RUN_LOG_TS`, so every artifact for
one run lands in the same directory:

- `planner.md`, `implementer.diff`, `verifier.json`, `fixer*.diff`,
  `reviewer.md`, `outcome.md`.

### Recovery

| Situation | Action |
|---|---|
| SIGINT mid-task | `/initial-implement --retry <id>` — restarts from scratch. |
| Orphaned `in_progress` | `.claude/skills/initial-implement/scripts/mark-status.sh <id> todo` |
| Stuck worktree | `git worktree remove .worktrees/<id> && git branch -D auto/<id>` |

## Forbidden paths

The orchestrator and its subagents must never edit:

- `design-reference/` — behavioral source of truth, hand-curated.
- `docs/superpowers/specs/` — the engineering spec is frozen for a task.
- `docs/superpowers/plans/` — planner output is read-only for the implementer.

Authorized files for any task are listed in its plan's `## Files` section.

## Conventional commits

Use Conventional Commits for direct human commits:

- `feat:` — new capability
- `fix:` — bug fix
- `test:` — tests only
- `chore:` — tooling, config
- `docs:` — documentation
- `refactor:` — non-behavioral change

Direct human commits **must not** start with `[auto]`. That prefix is reserved
for the orchestrator's squash merges (`[auto] <task-id> <title>`), which carry
the `done_when` checklist and a link to the run log in the body.

## Test discipline

- **TDD for `src/domain/`**: red → green → commit. Property tests via
  [`fast-check`](https://github.com/dubzzz/fast-check) where applicable.
- **Component tests assert behavior, not pixels.** Pixel fidelity is checked
  manually against the PWA reference (screenshot pairs attached to each PR).
  Storybook + Maestro screenshot harnesses from the original spec are
  deferred until a dev-client build is needed.
- **No skipped tests** without a comment linking to a tracking issue.

## Pre-commit and PR review

- `pnpm verify` must pass locally before opening a PR (typecheck + lint +
  boundary check + test + Metro bundle export + web build).
- The orchestrator's reviewer subagent enforces boundary rules (no hex outside
  `tokens.ts`, no React/async/Drizzle in `domain/`, no `drizzle` imports
  outside `data/`, no barrels in `features/` or `domain/`, one-way import
  direction).
- Domain-layer coverage thresholds are configured per-task on the queue when
  needed; there is no global 95% gate today.

If the reviewer requests changes, fix them and re-run `pnpm run ci`. The
orchestrator handles this automatically; humans should follow the same loop.
