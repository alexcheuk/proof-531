# Phase 0 Bootstrap & Orchestrator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap the proof-531 monorepo (pnpm + Expo SDK 55 + Dev Client + TS strict + Biome + CI), install the `/initial-implement` orchestrator skill and its five subagent prompt templates, generate `queue.yaml` containing every leaf task for Phases 1-7, and prove the pipeline with a smoke task. After this plan lands, `/initial-implement --batch` becomes the executor for all remaining work.

**Architecture:** Repo-root pnpm workspace with `apps/mobile` as the Expo app. Shared config at root (TS, Biome, CI). The orchestrator lives at `.claude/skills/initial-implement/` as a markdown-defined Claude Code skill that spawns subagents via the `Agent` tool, reads/writes a structured `docs/superpowers/queue.yaml`, and logs every subagent run to `docs/superpowers/runs/`. The skill is glue around existing superpowers skills (`using-git-worktrees`, `subagent-driven-development`, `verification-before-completion`, `test-driven-development`).

**Tech Stack:** Expo SDK 55, React Native 0.81+, TypeScript strict, Biome, pnpm 9, Node 22 LTS, GitHub Actions, YAML for the queue, Bash + `yq` for queue scripting, Markdown for skill + subagent prompts.

**Spec reference:** [`docs/superpowers/specs/2026-05-19-expo-scaffold-design.md`](../specs/2026-05-19-expo-scaffold-design.md) §5 (orchestrator), §7.1 (Phase 0 task list).

---

## File structure created by this plan

```
proof-531/
├── .editorconfig                                # NEW
├── .github/workflows/ci.yml                     # NEW
├── .nvmrc                                       # NEW
├── biome.json                                   # NEW
├── package.json                                 # NEW (root, workspace)
├── pnpm-workspace.yaml                          # NEW
├── tsconfig.base.json                           # NEW
├── CLAUDE.md                                    # NEW (root orientation)
├── README.md                                    # NEW
├── apps/
│   └── mobile/                                  # NEW (created by create-expo-app)
│       ├── app.config.ts                        # NEW (replaces app.json)
│       ├── tsconfig.json                        # MODIFIED (extend base)
│       ├── package.json                         # MODIFIED (rename + scripts)
│       └── src/
│           ├── design/CLAUDE.md                 # NEW
│           ├── design/.gitkeep                  # NEW
│           ├── domain/CLAUDE.md                 # NEW
│           ├── domain/.gitkeep                  # NEW
│           ├── data/.gitkeep                    # NEW
│           ├── features/.gitkeep                # NEW
│           ├── ui-state/.gitkeep                # NEW
│           └── lib/.gitkeep                     # NEW
├── docs/superpowers/
│   ├── queue.yaml                               # NEW
│   └── runs/.gitkeep                            # NEW
└── .claude/
    ├── commands/
    │   └── initial-implement.md                 # NEW (slash command entry)
    └── skills/
        └── initial-implement/
            ├── SKILL.md                         # NEW (orchestrator flow)
            ├── queue-format.md                  # NEW (schema doc)
            ├── subagent-prompts/
            │   ├── planner.md                   # NEW
            │   ├── implementer.md               # NEW
            │   ├── verifier.md                  # NEW
            │   ├── fixer.md                     # NEW
            │   └── reviewer.md                  # NEW
            └── scripts/
                ├── pick-next.sh                 # NEW
                ├── mark-status.sh               # NEW
                ├── ready-tasks.sh               # NEW
                └── write-run-log.sh             # NEW
```

---

## Tasks

Ten tasks. Each lands as one or more focused commits on `main` (we have no orchestrator yet — Phase 0 is executed by a human or by `superpowers:executing-plans` / `superpowers:subagent-driven-development`).

| Task | Outcome |
|---|---|
| P0-01 | pnpm workspace + Expo SDK 55 app created, dev client boots |
| P0-02 | TS strict + Biome configured, both green |
| P0-03 | GitHub Actions CI runs typecheck + lint + expo-doctor on every push |
| P0-04 | `/initial-implement` skill scaffold (SKILL.md + command entry) |
| P0-05 | Five subagent prompt templates |
| P0-06 | `queue.yaml` schema + bash scripts for reading/updating it |
| P0-07 | `queue.yaml` populated with every leaf task for Phases 1-7 |
| P0-08 | Run-log infra and writer script |
| P0-09 | Three `CLAUDE.md` files (root, domain, design) |
| P0-99 | Orchestrator smoke task runs end-to-end against a no-op task |

---

## Task P0-01: Bootstrap pnpm workspace + Expo SDK 55 app

**Files:**
- Create: `.nvmrc`
- Create: `.editorconfig`
- Create: `package.json` (root)
- Create: `pnpm-workspace.yaml`
- Create: `apps/mobile/` (via `create-expo-app`)
- Modify: `apps/mobile/package.json` (rename, add scripts)
- Create: `README.md`

- [ ] **Step 1: Verify Node, pnpm, and npx are available**

```bash
node --version    # expect v22.x
pnpm --version    # expect 9.x; if missing: corepack enable && corepack prepare pnpm@latest --activate
npx --version
```

Expected: all three print versions without error. If `pnpm` is missing, run `corepack enable && corepack prepare pnpm@latest --activate`. Stop and report if Node is below v22.

- [ ] **Step 2: Pin Node version**

Create `/Users/alexcheuk/Development/proof-531/.nvmrc`:

```
22
```

- [ ] **Step 3: Add `.editorconfig`**

Create `/Users/alexcheuk/Development/proof-531/.editorconfig`:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_size = 2
indent_style = space
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

- [ ] **Step 4: Create the root workspace package.json**

Create `/Users/alexcheuk/Development/proof-531/package.json`:

```json
{
  "name": "proof-531",
  "version": "0.0.0",
  "private": true,
  "packageManager": "pnpm@9.15.0",
  "engines": {
    "node": ">=22",
    "pnpm": ">=9"
  },
  "scripts": {
    "typecheck": "pnpm -r --parallel typecheck",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write .",
    "test": "pnpm -r --parallel test",
    "doctor": "pnpm --filter mobile exec expo-doctor",
    "ci": "pnpm typecheck && pnpm lint && pnpm test"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.4"
  }
}
```

- [ ] **Step 5: Create the workspace manifest**

Create `/Users/alexcheuk/Development/proof-531/pnpm-workspace.yaml`:

```yaml
packages:
  - apps/*
  - packages/*
```

- [ ] **Step 6: Install root deps**

Run from `/Users/alexcheuk/Development/proof-531`:

```bash
pnpm install
```

Expected: pnpm-lock.yaml created, biome binary appears under `node_modules/.bin/biome`.

- [ ] **Step 7: Scaffold the Expo app**

Run from `/Users/alexcheuk/Development/proof-531`:

```bash
mkdir -p apps && cd apps && npx --yes create-expo-app@latest mobile --template default@sdk-55 --no-install && cd ..
```

Expected: `apps/mobile/` exists with `app/`, `package.json`, `app.json`, `tsconfig.json`, etc. The `--no-install` skips npm install (we'll use pnpm next).

- [ ] **Step 8: Rename the workspace package and add scripts**

Edit `/Users/alexcheuk/Development/proof-531/apps/mobile/package.json`:
- Change `"name"` from `"mobile"` (or whatever create-expo-app set) to `"@proof-531/mobile"`.
- Inside `"scripts"`, ensure these keys exist (add or replace):

```json
{
  "start": "expo start --dev-client",
  "ios": "expo run:ios",
  "android": "expo run:android",
  "typecheck": "tsc --noEmit",
  "test": "jest --passWithNoTests",
  "lint": "biome check src app",
  "doctor": "expo-doctor"
}
```

Leave the rest of the file as `create-expo-app` generated it.

- [ ] **Step 9: Install workspace dependencies**

Run from `/Users/alexcheuk/Development/proof-531`:

```bash
pnpm install
```

Expected: dependencies resolved across workspace, single root `node_modules`. No errors.

- [ ] **Step 10: Add `expo-dev-client`**

Run from `/Users/alexcheuk/Development/proof-531`:

```bash
pnpm --filter @proof-531/mobile add expo-dev-client
```

Expected: `expo-dev-client` appears in `apps/mobile/package.json` dependencies.

- [ ] **Step 11: Verify the Expo app is healthy**

Run from `/Users/alexcheuk/Development/proof-531`:

```bash
pnpm doctor
```

Expected: every expo-doctor check prints `✔` or the run exits 0 with at most informational warnings. If any check fails, stop and report — do not proceed.

- [ ] **Step 12: Write a one-page README**

Create `/Users/alexcheuk/Development/proof-531/README.md`:

```markdown
# 531 Strength

Production scaffold for a 5/3/1 + BBB + Assistance training tracker.
Expo SDK 55, React Native New Architecture, iOS + Android.

## Quick start

```bash
pnpm install
pnpm --filter @proof-531/mobile start
```

Press `i` for iOS simulator or `a` for Android emulator (requires a dev-client build — see EAS docs).

## Docs

- `docs/DESIGN.md` — product + visual spec
- `docs/superpowers/specs/` — engineering specs
- `docs/superpowers/plans/` — implementation plans
- `docs/superpowers/queue.yaml` — orchestrator backlog

## Working in this repo

Use `/initial-implement` to let Claude pick up the next ready task from the queue,
implement it, run the full harness, and commit. See `.claude/skills/initial-implement/`.

## License

UNLICENSED (portfolio piece — open for inspection, not for redistribution).
```

- [ ] **Step 13: Commit**

```bash
cd /Users/alexcheuk/Development/proof-531
git add .nvmrc .editorconfig package.json pnpm-workspace.yaml pnpm-lock.yaml apps/ README.md
git commit -m "$(cat <<'EOF'
P0-01: bootstrap pnpm workspace + Expo SDK 55 dev-client app

- Root pnpm workspace, apps/mobile scaffolded via create-expo-app SDK 55
- expo-dev-client installed
- expo-doctor passes
- Node pinned to 22 via .nvmrc

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task P0-02: Configure TypeScript strict + Biome

**Files:**
- Create: `tsconfig.base.json`
- Modify: `apps/mobile/tsconfig.json`
- Create: `biome.json`

- [ ] **Step 1: Create a shared TS config**

Create `/Users/alexcheuk/Development/proof-531/tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "useUnknownInCatchVariables": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler",
    "module": "esnext",
    "target": "esnext",
    "jsx": "react-jsx",
    "lib": ["esnext", "dom"]
  }
}
```

- [ ] **Step 2: Update the mobile app tsconfig to extend base**

Read the current `apps/mobile/tsconfig.json` (created by create-expo-app — it extends `expo/tsconfig.base`).

Replace its contents with:

```json
{
  "extends": ["expo/tsconfig.base", "../../tsconfig.base.json"],
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    },
    "baseUrl": "."
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
```

Note: `expo/tsconfig.base` ships sensible RN defaults (`jsx: 'react-jsx'`, `allowSyntheticDefaultImports`, etc.). Our base layers strict on top.

- [ ] **Step 3: Create Biome config**

Create `/Users/alexcheuk/Development/proof-531/biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "vcs": { "enabled": true, "clientKind": "git", "useIgnoreFile": true },
  "files": {
    "ignore": [
      "node_modules",
      "apps/*/node_modules",
      "apps/*/.expo",
      "apps/*/ios",
      "apps/*/android",
      "apps/*/dist",
      "design-reference",
      "docs/superpowers/runs",
      "**/*.lock",
      "**/pnpm-lock.yaml"
    ]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100,
    "lineEnding": "lf"
  },
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error",
        "noUnusedImports": "error",
        "useExhaustiveDependencies": "warn"
      },
      "style": {
        "useImportType": "error",
        "noNonNullAssertion": "error",
        "useConst": "error"
      },
      "suspicious": {
        "noExplicitAny": "error"
      },
      "complexity": {
        "noBannedTypes": "error"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "always",
      "trailingCommas": "all",
      "arrowParentheses": "always"
    }
  }
}
```

- [ ] **Step 4: Run typecheck**

Run from `/Users/alexcheuk/Development/proof-531`:

```bash
pnpm typecheck
```

Expected: no errors. The create-expo-app template typechecks clean. If you see errors about `noUncheckedIndexedAccess` in template files, fix the template file inline (e.g., add `as string` or non-null guards) — note each in the commit message.

- [ ] **Step 5: Run Biome and auto-fix the template**

Run from `/Users/alexcheuk/Development/proof-531`:

```bash
pnpm lint:fix
```

Expected: any template files reformatted to match config. Re-run `pnpm lint` after; should be green.

- [ ] **Step 6: Commit**

```bash
git add tsconfig.base.json apps/mobile/tsconfig.json biome.json apps/mobile/
git commit -m "$(cat <<'EOF'
P0-02: TypeScript strict + Biome configured

- tsconfig.base.json: strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes
- apps/mobile/tsconfig.json extends base; adds @/* path alias to src
- biome.json: 100-col, single quotes, semicolons, organize-imports
- pnpm typecheck and pnpm lint both green

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task P0-03: GitHub Actions CI baseline

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create the workflow**

Create `/Users/alexcheuk/Development/proof-531/.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  static:
    name: Static checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9.15.0

      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - name: Biome
        run: pnpm lint

      - name: TypeScript
        run: pnpm typecheck

      - name: expo-doctor
        run: pnpm doctor

  test:
    name: Tests
    runs-on: ubuntu-latest
    needs: static
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9.15.0

      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - name: Jest
        run: pnpm test
```

- [ ] **Step 2: Verify the workflow file is valid YAML**

Run from `/Users/alexcheuk/Development/proof-531`:

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))" && echo OK
```

Expected: prints `OK`. If python3 is unavailable, skip — the next push will surface syntax errors.

- [ ] **Step 3: Commit**

```bash
git add .github/
git commit -m "$(cat <<'EOF'
P0-03: GitHub Actions baseline (lint + typecheck + doctor + tests)

CI runs on every push and PR. Two jobs: static checks (Biome, tsc,
expo-doctor) and tests (Jest). Tests block on static passing.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task P0-04: `/initial-implement` skill scaffold

**Files:**
- Create: `.claude/commands/initial-implement.md`
- Create: `.claude/skills/initial-implement/SKILL.md`
- Create: `.claude/skills/initial-implement/queue-format.md`

- [ ] **Step 1: Create the slash-command entry**

Create `/Users/alexcheuk/Development/proof-531/.claude/commands/initial-implement.md`:

```markdown
---
description: Pick the next ready task from docs/superpowers/queue.yaml, implement it via subagents, verify with the full harness, and commit. Flags: --batch (loop), --max-tasks N (default 5), --status (print queue), --task <id>, --retry <id>.
---

Invoke the `initial-implement` skill with arguments: $ARGUMENTS

See `.claude/skills/initial-implement/SKILL.md` for full behavior.
```

- [ ] **Step 2: Create the main skill document**

Create `/Users/alexcheuk/Development/proof-531/.claude/skills/initial-implement/SKILL.md`:

````markdown
---
name: initial-implement
description: Orchestrator that picks the next ready task from docs/superpowers/queue.yaml, implements it via five subagents (planner, implementer, verifier, fixer, reviewer), runs the full harness, and commits. Supports --batch (loop until done/blocked/limit), --max-tasks N (default 5), --status, --task <id>, --retry <id>.
---

# /initial-implement — autonomous task runner

You are the orchestrator. Your job is to move tasks from `docs/superpowers/queue.yaml` from `todo` to `done` without human intervention, while keeping every change atomic, verified, and reversible.

## Flags (parsed from $ARGUMENTS)

| Flag | Effect |
|---|---|
| _(none)_ | Run exactly one ready task, then stop. |
| `--batch` | Loop after each task. Halt on: queue empty, blocked task, two consecutive failures, `--max-tasks` reached, user interrupt. |
| `--max-tasks N` | Safety ceiling for `--batch`. Default 5. Override with any positive integer. Use `--unsafe-unbounded` for no ceiling (discouraged). |
| `--status` | Print the queue with checkboxes and exit. No work. |
| `--task <id>` | Run a specific task by id. Dependencies must already be `done`. |
| `--retry <id>` | Reset `<id>` to `todo` (whether currently `done` or `blocked`) and run it. |

## Required reading before you start

1. `docs/superpowers/specs/2026-05-19-expo-scaffold-design.md` — the source of truth for what we're building and why.
2. `CLAUDE.md` (repo root) — boundary rules, dev commands, design-reference policy.
3. `.claude/skills/initial-implement/queue-format.md` — schema of `queue.yaml`.
4. `.claude/skills/initial-implement/subagent-prompts/*.md` — the templates you fill in when spawning subagents.

## Execution flow (one task)

```
1. Parse $ARGUMENTS into flags.
2. If --status: cat queue with status icons, exit.
3. Pick a task:
     - If --task <id>: load that task. Verify deps are done. Verify status is todo.
     - If --retry <id>: load that task. Reset status to todo. (User-initiated reset, no dep check beyond normal.)
     - Otherwise: run `.claude/skills/initial-implement/scripts/pick-next.sh`. It prints the id of the next ready task, or empty if none.
4. Mark task in_progress via scripts/mark-status.sh.
5. Create worktree at /tmp/proof-531-<task-id> on branch auto/<task-id> via the using-git-worktrees skill or `git worktree add`.
6. Spawn PLANNER subagent (template: subagent-prompts/planner.md).
     Output: ordered list of implementation steps.
     Log to docs/superpowers/runs/<task-id>/<ISO-timestamp>/planner.md.
7. Spawn IMPLEMENTER subagent (template: subagent-prompts/implementer.md) in the worktree.
     Input: planner steps + task spec.
     Output: edits committed locally in the worktree.
8. Spawn VERIFIER subagent (template: subagent-prompts/verifier.md) in the worktree.
     Input: task done_when criteria.
     Output: structured pass/fail JSON.
9. If verifier reports failure:
     For attempt in 1..3:
       Spawn FIXER subagent (template: subagent-prompts/fixer.md).
         Input: verifier failures, current diff, planner steps.
         Output: targeted fixes.
       Re-run verifier.
       If verifier passes, break.
     If still failing after 3 attempts: mark task blocked with the last failure summary, abandon the worktree, exit (or in --batch, halt).
10. Spawn REVIEWER subagent (template: subagent-prompts/reviewer.md).
     Input: git diff between main and the worktree branch, task done_when.
     Output: approve | request-changes <list>.
11. If reviewer requests changes:
     For cycle in 1..2:
       Spawn fixer again with reviewer's notes (no verifier failure this time).
       Re-run reviewer.
       If approved, break.
     If still rejected after 2 cycles: mark task blocked, exit.
12. Squash-merge worktree into main:
     - Switch to main in the primary working directory.
     - `git merge --squash auto/<task-id>`.
     - `git commit -m "[auto] <task-id> <title>"` with the done_when checklist and a link to docs/superpowers/runs/<task-id>/ in the body.
     - `git worktree remove /tmp/proof-531-<task-id>`.
     - `git branch -D auto/<task-id>`.
13. Mark task done via scripts/mark-status.sh. Commit queue update.
14. If --batch and tasks remaining and no halt condition: goto step 3.
15. Print one-line summary per task processed and exit.
```

## Halt conditions for `--batch`

Stop the loop and exit on any of:
- Queue contains no ready tasks (all done, or remaining are blocked by failed deps).
- The current task was marked `blocked` (verifier or reviewer gave up).
- Two consecutive tasks in this invocation were marked `blocked`.
- `--max-tasks N` reached.
- User sends SIGINT (Ctrl+C).
- `--unsafe-unbounded` was not passed and we processed `--max-tasks` worth of tasks.

After halting, print a final report: tasks completed, tasks blocked (with reasons), tasks remaining, link to run logs.

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

- Edit files outside `/tmp/proof-531-<task-id>` directly. Implementer and fixer do edits, inside the worktree.
- Force-push, delete user branches, amend published commits.
- Bypass `done_when` criteria. If a criterion is impossible, mark the task blocked and surface the gap.
- Continue past two consecutive blocked tasks in `--batch` mode.
- Spawn subagents without filling out the template prompt completely.

## Subagent invocation

Use the `Agent` tool with `subagent_type: general-purpose` for all five roles. The templates in `subagent-prompts/` contain the full prompts; substitute `{{placeholders}}` with task-specific content before calling. Constrain behavior in the prompt itself ("you must not edit files", "your only output is JSON matching this schema", etc.) — `general-purpose` agents respect role constraints stated in the prompt.

## Reference

- Spec: `docs/superpowers/specs/2026-05-19-expo-scaffold-design.md` §5.
- Queue schema: `.claude/skills/initial-implement/queue-format.md`.
- Subagent templates: `.claude/skills/initial-implement/subagent-prompts/*.md`.
- Existing superpowers skills to leverage: `using-git-worktrees`, `subagent-driven-development`, `verification-before-completion`, `test-driven-development`.
````

- [ ] **Step 3: Create the queue format spec**

Create `/Users/alexcheuk/Development/proof-531/.claude/skills/initial-implement/queue-format.md`:

````markdown
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
    spec_ref: <string>      # path-with-anchor into docs/superpowers/specs/...
    done_when:              # ordered list of machine-checkable assertions
      - <string>
    notes: |                # implementation hints (no code)
      <multi-line>
    behavioral_reference: <string>  # optional: path into design-reference/ that this task ports
```

## Status semantics

- `todo`: not yet started.
- `in_progress`: orchestrator is currently working on it. If you see this and no orchestrator is running, manually reset to `todo` via `scripts/mark-status.sh <id> todo`.
- `done`: every `done_when` criterion satisfied, reviewer approved, merged to main.
- `blocked`: orchestrator gave up after retries. `blocked_reason` describes why. Recover with `/initial-implement --retry <id>` after addressing the cause.

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

## Tools

| Script | Purpose |
|---|---|
| `scripts/pick-next.sh` | Print id of next ready task (lowest phase number, then lowest id). Empty if none. |
| `scripts/ready-tasks.sh` | Print all ready tasks (one id per line). |
| `scripts/mark-status.sh <id> <status> [reason]` | Update a task's status. Validates status enum. |
| `scripts/write-run-log.sh <id> <subagent> <file>` | Append to `docs/superpowers/runs/<id>/<timestamp>/<subagent>.md`. |

All scripts require `yq` (https://github.com/mikefarah/yq) v4. The orchestrator should `command -v yq || brew install yq` on first run.
````

- [ ] **Step 4: Commit**

```bash
cd /Users/alexcheuk/Development/proof-531
mkdir -p .claude/skills/initial-implement/subagent-prompts .claude/skills/initial-implement/scripts
git add .claude/commands/initial-implement.md .claude/skills/initial-implement/SKILL.md .claude/skills/initial-implement/queue-format.md
git commit -m "$(cat <<'EOF'
P0-04: scaffold /initial-implement skill (SKILL.md + queue-format.md)

The orchestrator skill that picks the next ready task, spawns five
subagents (planner/implementer/verifier/fixer/reviewer), and squash-merges
verified work into main. SKILL.md documents the 15-step flow; queue-format.md
specifies the queue.yaml schema.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task P0-05: Five subagent prompt templates

**Files:**
- Create: `.claude/skills/initial-implement/subagent-prompts/planner.md`
- Create: `.claude/skills/initial-implement/subagent-prompts/implementer.md`
- Create: `.claude/skills/initial-implement/subagent-prompts/verifier.md`
- Create: `.claude/skills/initial-implement/subagent-prompts/fixer.md`
- Create: `.claude/skills/initial-implement/subagent-prompts/reviewer.md`

- [ ] **Step 1: Planner prompt**

Create `/Users/alexcheuk/Development/proof-531/.claude/skills/initial-implement/subagent-prompts/planner.md`:

````markdown
# Planner subagent prompt template

Substitute every `{{placeholder}}` before passing to the Agent tool.

---

You are the **planner** for an autonomous build pipeline. You produce an ordered, concrete implementation plan for a single task. You write no code, edit no files, and run no commands except read-only inspection (Read, Grep, `git log`, `git diff`, `find`, `cat`, `head`, `tail`).

## Task

- **id:** {{task_id}}
- **title:** {{task_title}}
- **phase:** {{task_phase}}
- **done_when:**
{{done_when_bullets}}
- **notes:** {{task_notes}}
- **behavioral_reference:** {{behavioral_reference_or_none}}

## Required reading

1. The spec: `{{spec_ref}}`
2. The repo CLAUDE.md: `/CLAUDE.md`
3. If the task touches `src/domain/`: also read `apps/mobile/src/domain/CLAUDE.md`.
4. If the task touches `src/design/`: also read `apps/mobile/src/design/CLAUDE.md`.
5. If `behavioral_reference` is set: read that file to understand the behavior being ported.
6. `git log --oneline -20` to see recent context.

## Your output

A numbered list of 5-20 implementation steps in this exact Markdown shape:

```markdown
# Plan for {{task_id}}: {{task_title}}

## Approach
(2-4 sentences. What is the high-level strategy?)

## Files

- Create: `path/to/new.ts` — (one-line purpose)
- Modify: `path/to/existing.ts` — (what changes)
- Test: `path/to/test.ts` — (what it covers)

## Steps

1. Write failing test for X at `path/to/test.ts`. Test code:
   ```ts
   ...
   ```
2. Run `pnpm test path/to/test.ts`. Expected: FAIL with "...".
3. Implement X at `path/to/file.ts`. Code:
   ```ts
   ...
   ```
4. Run `pnpm test path/to/test.ts`. Expected: PASS.
5. ...
```

## Constraints

- TDD where applicable: test first, then implementation.
- Every step shows the actual code or command. No "write the test" without the test body.
- Files match repo conventions (see CLAUDE.md).
- Do not invent dependencies. If the task needs a new package, the plan must include the install command.
- Do not duplicate work — if a primitive or function already exists, plan to use it.

## Stop conditions

If the task is ambiguous or contradicts the spec, output a single line `BLOCKED: <reason>` instead of a plan. The orchestrator will halt the task.
````

- [ ] **Step 2: Implementer prompt**

Create `/Users/alexcheuk/Development/proof-531/.claude/skills/initial-implement/subagent-prompts/implementer.md`:

````markdown
# Implementer subagent prompt template

You are the **implementer**. You execute a plan inside a git worktree. You write code, run tests, and commit incrementally.

## Working directory

`{{worktree_path}}` — a git worktree on branch `auto/{{task_id}}`. All your edits must be confined to this directory. Do not touch the primary working tree.

## Task

- **id:** {{task_id}}
- **title:** {{task_title}}
- **done_when:**
{{done_when_bullets}}

## Plan to execute

{{planner_output}}

## Required reading before you start

- `/CLAUDE.md` in the worktree.
- Any folder-level `CLAUDE.md` for paths your plan touches.

## Rules

1. Execute the plan steps in order. Do not skip or reorder.
2. After each TDD test passes, commit immediately with a conventional-commit message:
   ```
   git add <files>
   git commit -m "feat({{task_id}}): <what passed>"
   ```
   Many small commits are good — the orchestrator squashes at the end.
3. If a step fails (test won't pass, command errors), do not improvise. Stop and emit `IMPLEMENTER_HALT: <step-number> <reason>` then exit. The fixer will be invoked.
4. Do not add packages not listed in the plan. If the plan is missing a needed package, halt as above.
5. Never edit `design-reference/`, `docs/`, or anything outside `apps/mobile/` and `packages/` unless the plan explicitly says so.
6. Never run `git push`, `git rebase`, or destructive operations.

## Definition of done (your scope)

You're done when:
- Every numbered step in the plan has been executed.
- `git status` is clean (everything committed).
- The plan's "Files" section is consistent with what you actually wrote.

Then exit with `IMPLEMENTER_DONE` on its own line.

## Output

Whatever Claude Code naturally surfaces during edits/runs. The orchestrator captures `git diff main...auto/{{task_id}}` as your effective artifact.
````

- [ ] **Step 3: Verifier prompt**

Create `/Users/alexcheuk/Development/proof-531/.claude/skills/initial-implement/subagent-prompts/verifier.md`:

````markdown
# Verifier subagent prompt template

You are the **verifier**. You run the harness against a task's `done_when` criteria and emit a structured pass/fail report. You **never edit code**.

## Working directory

`{{worktree_path}}` (git worktree on `auto/{{task_id}}`).

## Task

- **id:** {{task_id}}
- **title:** {{task_title}}
- **done_when:**
{{done_when_bullets}}

## How to verify each criterion

Each `done_when` string is a machine-checkable assertion. Run whatever command(s) demonstrate it. Examples:

| Criterion shape | How to check |
|---|---|
| `pnpm <script> passes` | `pnpm <script>`; exit code 0 = pass |
| `<path> exists` | `test -e <path>` |
| `<path> contains <substring>` | `grep -q <substring> <path>` |
| `<jest test name> passes` | `pnpm --filter @proof-531/mobile test -t "<name>"` |
| `coverage on <path> >= <pct>` | parse `pnpm test --coverage` output for the path |
| `no hex literals outside <path>` | `rg -n '#[0-9a-fA-F]{3,8}' <scope> \| grep -v <path>` returns empty |
| `<maestro flow> passes` | `pnpm --filter @proof-531/mobile maestro test .maestro/<flow>.yaml` |

If a criterion is ambiguous, fail it with `reason: "criterion is not machine-checkable — needs revision"`.

## Standard harness sweep (always run before checking criteria)

```bash
pnpm install --frozen-lockfile      # must succeed
pnpm typecheck                       # must exit 0
pnpm lint                            # must exit 0
pnpm test                            # must exit 0 (or "no tests" if none added yet)
```

If any harness command fails, the verifier result is `fail` even if every `done_when` was satisfied — the change broke something else.

## Output

Print **only** a single JSON object on stdout, no other text:

```json
{
  "task_id": "{{task_id}}",
  "result": "pass | fail",
  "harness": {
    "install": "pass | fail",
    "typecheck": "pass | fail",
    "lint": "pass | fail",
    "test": "pass | fail"
  },
  "criteria": [
    { "criterion": "...", "result": "pass | fail", "evidence": "command output snippet, ≤200 chars" }
  ],
  "summary": "one sentence"
}
```

The orchestrator parses this JSON. Any non-JSON output corrupts the pipeline.
````

- [ ] **Step 4: Fixer prompt**

Create `/Users/alexcheuk/Development/proof-531/.claude/skills/initial-implement/subagent-prompts/fixer.md`:

````markdown
# Fixer subagent prompt template

You are the **fixer**. You read a failure report and make the smallest possible edits to make the failing criteria pass. You do not add features.

## Working directory

`{{worktree_path}}` (worktree on `auto/{{task_id}}`).

## Task

- **id:** {{task_id}}
- **title:** {{task_title}}
- **done_when:**
{{done_when_bullets}}

## Original plan

{{planner_output}}

## Current diff

{{git_diff}}

## Failure report

{{failure_report}}

## Rules

1. Read the failure report. Identify the *minimum* change required to fix each failed criterion.
2. Make the change. Run the failing command locally to confirm the fix.
3. Commit each fix with `fix({{task_id}}): <what was failing>`.
4. If you cannot fix a failure (criterion is impossible, contradicts the plan, requires a missing dependency), emit `FIXER_HALT: <reason>` and exit. The task will be marked blocked.
5. Do not introduce new functionality. Do not refactor unrelated code. Do not add packages without explicit need.
6. After your edits, exit with `FIXER_DONE`.

The verifier will run again after you exit.
````

- [ ] **Step 5: Reviewer prompt**

Create `/Users/alexcheuk/Development/proof-531/.claude/skills/initial-implement/subagent-prompts/reviewer.md`:

````markdown
# Reviewer subagent prompt template

You are the **reviewer**. You read the diff between `main` and the task branch and check it against `done_when` plus repo conventions. You do not edit code.

## Working directory

`{{worktree_path}}` (worktree on `auto/{{task_id}}`).

## Task

- **id:** {{task_id}}
- **title:** {{task_title}}
- **done_when:**
{{done_when_bullets}}

## Required reading

- `/CLAUDE.md` in the worktree.
- Any folder-level `CLAUDE.md` for paths the diff touches.
- `docs/superpowers/specs/2026-05-19-expo-scaffold-design.md` boundary rules in §3.

## Diff to review

Run `git diff main...HEAD` in the worktree to see the full change.

## Checklist (apply each item; flag every violation)

- **done_when coverage** — every criterion has a corresponding change in the diff. If a criterion is "X exists," X must actually exist.
- **scope drift** — does the diff include unrelated edits? List each.
- **boundary rules** — `src/design/` is the only place hex/px literals live. `src/domain/` has no React or async or DB imports. `src/data/` is the only thing that imports drizzle. Routes in `app/` are thin shells.
- **types** — no `any` (rg returns empty for ` any[\s)\[]` in changed files), no non-null assertions, no `@ts-ignore` without a comment explaining why.
- **dead code** — no unused exports, no commented-out blocks, no stub functions.
- **commit messages** — conventional commits (`feat:`, `fix:`, `test:`, `chore:`).
- **test parity** — any new production code in `src/` has accompanying tests, unless the task is explicitly a config/scaffold task.

## Output

Print **only** this JSON object:

```json
{
  "task_id": "{{task_id}}",
  "decision": "approve | request-changes",
  "violations": [
    { "rule": "<checklist item>", "where": "<file:line or general>", "detail": "<one sentence>" }
  ],
  "summary": "one sentence overall assessment"
}
```

`approve` is valid only when `violations` is empty.
````

- [ ] **Step 6: Commit**

```bash
cd /Users/alexcheuk/Development/proof-531
git add .claude/skills/initial-implement/subagent-prompts/
git commit -m "$(cat <<'EOF'
P0-05: five subagent prompt templates for /initial-implement

planner / implementer / verifier / fixer / reviewer. Each template
documents inputs, outputs, allowed actions, and exit signals. Verifier
and reviewer emit machine-parseable JSON. Implementer and fixer halt
explicitly rather than improvise.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task P0-06: Queue schema + bash scripts

**Files:**
- Create: `docs/superpowers/queue.yaml` (seed)
- Create: `.claude/skills/initial-implement/scripts/pick-next.sh`
- Create: `.claude/skills/initial-implement/scripts/ready-tasks.sh`
- Create: `.claude/skills/initial-implement/scripts/mark-status.sh`
- Create: `.claude/skills/initial-implement/scripts/write-run-log.sh`

- [ ] **Step 1: Verify `yq` is installed**

```bash
command -v yq || brew install yq
yq --version       # expect mikefarah/yq v4.x
```

Expected: prints `yq (https://github.com/mikefarah/yq) version v4.x`. If on a non-Mac system, install via the project's docs.

- [ ] **Step 2: Seed `queue.yaml`**

Create `/Users/alexcheuk/Development/proof-531/docs/superpowers/queue.yaml`:

```yaml
version: 1
tasks: []
```

(Phase 1-7 tasks are added in P0-07. This seed exists so the scripts can be tested.)

- [ ] **Step 3: Create `pick-next.sh`**

Create `/Users/alexcheuk/Development/proof-531/.claude/skills/initial-implement/scripts/pick-next.sh`:

```bash
#!/usr/bin/env bash
# pick-next.sh — print the id of the next ready task in queue.yaml, or empty.
# A task is ready when status=todo and every depends_on id has status=done.
# Order: lowest phase, then lexicographic id.

set -euo pipefail

QUEUE="${QUEUE_PATH:-docs/superpowers/queue.yaml}"

if [[ ! -f "$QUEUE" ]]; then
  echo "error: queue not found at $QUEUE" >&2
  exit 2
fi

# Build a map of id -> status to evaluate dependencies.
mapfile -t ALL_IDS < <(yq -r '.tasks[].id' "$QUEUE")
declare -A STATUS
for id in "${ALL_IDS[@]}"; do
  STATUS["$id"]="$(yq -r ".tasks[] | select(.id == \"$id\") | .status" "$QUEUE")"
done

# Iterate tasks in order (lowest phase, then id alpha).
yq -r '.tasks | sort_by(.phase, .id) | .[] | [.id, .status, (.depends_on // [] | join(","))] | @tsv' "$QUEUE" \
  | while IFS=$'\t' read -r id status deps; do
      [[ "$status" != "todo" ]] && continue
      ready=true
      IFS=',' read -ra dep_array <<< "$deps"
      for dep in "${dep_array[@]}"; do
        [[ -z "$dep" ]] && continue
        if [[ "${STATUS[$dep]:-missing}" != "done" ]]; then
          ready=false
          break
        fi
      done
      if $ready; then
        echo "$id"
        exit 0
      fi
    done
```

Make it executable:

```bash
chmod +x .claude/skills/initial-implement/scripts/pick-next.sh
```

- [ ] **Step 4: Create `ready-tasks.sh`**

Create `/Users/alexcheuk/Development/proof-531/.claude/skills/initial-implement/scripts/ready-tasks.sh`:

```bash
#!/usr/bin/env bash
# ready-tasks.sh — print all ready task ids, one per line.

set -euo pipefail

QUEUE="${QUEUE_PATH:-docs/superpowers/queue.yaml}"

mapfile -t ALL_IDS < <(yq -r '.tasks[].id' "$QUEUE")
declare -A STATUS
for id in "${ALL_IDS[@]}"; do
  STATUS["$id"]="$(yq -r ".tasks[] | select(.id == \"$id\") | .status" "$QUEUE")"
done

yq -r '.tasks | sort_by(.phase, .id) | .[] | [.id, .status, (.depends_on // [] | join(","))] | @tsv' "$QUEUE" \
  | while IFS=$'\t' read -r id status deps; do
      [[ "$status" != "todo" ]] && continue
      ready=true
      IFS=',' read -ra dep_array <<< "$deps"
      for dep in "${dep_array[@]}"; do
        [[ -z "$dep" ]] && continue
        if [[ "${STATUS[$dep]:-missing}" != "done" ]]; then
          ready=false
          break
        fi
      done
      $ready && echo "$id"
    done
```

```bash
chmod +x .claude/skills/initial-implement/scripts/ready-tasks.sh
```

- [ ] **Step 5: Create `mark-status.sh`**

Create `/Users/alexcheuk/Development/proof-531/.claude/skills/initial-implement/scripts/mark-status.sh`:

```bash
#!/usr/bin/env bash
# mark-status.sh <task-id> <status> [reason]
#   status must be one of: todo | in_progress | done | blocked
#   reason is only meaningful for blocked.

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "usage: $0 <task-id> <status> [blocked-reason]" >&2
  exit 64
fi

TASK_ID="$1"
NEW_STATUS="$2"
REASON="${3:-}"
QUEUE="${QUEUE_PATH:-docs/superpowers/queue.yaml}"

case "$NEW_STATUS" in
  todo|in_progress|done|blocked) ;;
  *)
    echo "error: invalid status '$NEW_STATUS' (allowed: todo|in_progress|done|blocked)" >&2
    exit 64
    ;;
esac

# Confirm the task exists.
EXISTS="$(yq -r ".tasks[] | select(.id == \"$TASK_ID\") | .id" "$QUEUE")"
if [[ "$EXISTS" != "$TASK_ID" ]]; then
  echo "error: task '$TASK_ID' not found in $QUEUE" >&2
  exit 65
fi

# Update status in-place.
yq -i "(.tasks[] | select(.id == \"$TASK_ID\") | .status) = \"$NEW_STATUS\"" "$QUEUE"

# Update or clear blocked_reason.
if [[ "$NEW_STATUS" == "blocked" ]]; then
  yq -i "(.tasks[] | select(.id == \"$TASK_ID\") | .blocked_reason) = \"$REASON\"" "$QUEUE"
else
  yq -i "del(.tasks[] | select(.id == \"$TASK_ID\") | .blocked_reason)" "$QUEUE"
fi

echo "marked $TASK_ID -> $NEW_STATUS"
```

```bash
chmod +x .claude/skills/initial-implement/scripts/mark-status.sh
```

- [ ] **Step 6: Create `write-run-log.sh`**

Create `/Users/alexcheuk/Development/proof-531/.claude/skills/initial-implement/scripts/write-run-log.sh`:

```bash
#!/usr/bin/env bash
# write-run-log.sh <task-id> <subagent-name> [content-file]
#   If content-file is omitted, reads from stdin.
#   Output goes to docs/superpowers/runs/<task-id>/<ISO-timestamp>/<subagent>.md

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "usage: $0 <task-id> <subagent-name> [content-file]" >&2
  exit 64
fi

TASK_ID="$1"
SUBAGENT="$2"
CONTENT_SRC="${3:-/dev/stdin}"
TS="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
LOG_DIR="docs/superpowers/runs/$TASK_ID/$TS"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/${SUBAGENT}.md"

if [[ "$CONTENT_SRC" == "/dev/stdin" ]]; then
  cat > "$LOG_FILE"
else
  cp "$CONTENT_SRC" "$LOG_FILE"
fi

echo "$LOG_FILE"
```

```bash
chmod +x .claude/skills/initial-implement/scripts/write-run-log.sh
```

- [ ] **Step 7: Sanity-test the scripts with a fake task**

Add a temporary task and exercise the scripts:

```bash
cd /Users/alexcheuk/Development/proof-531

# Append a fake task.
yq -i '.tasks += [{"id": "TEST-01", "title": "fake", "phase": 0, "depends_on": [], "status": "todo", "spec_ref": "none", "done_when": ["fake"], "notes": ""}]' docs/superpowers/queue.yaml

# pick-next.sh should print TEST-01
NEXT="$(./.claude/skills/initial-implement/scripts/pick-next.sh)"
[[ "$NEXT" == "TEST-01" ]] && echo "pick-next OK" || { echo "FAIL: got '$NEXT'"; exit 1; }

# ready-tasks.sh should print TEST-01
./.claude/skills/initial-implement/scripts/ready-tasks.sh | grep -q '^TEST-01$' && echo "ready-tasks OK"

# mark-status.sh should update status to done
./.claude/skills/initial-implement/scripts/mark-status.sh TEST-01 done
STATUS_NOW="$(yq -r '.tasks[] | select(.id == "TEST-01") | .status' docs/superpowers/queue.yaml)"
[[ "$STATUS_NOW" == "done" ]] && echo "mark-status OK"

# After done, pick-next should print empty
NEXT_AFTER="$(./.claude/skills/initial-implement/scripts/pick-next.sh)"
[[ -z "$NEXT_AFTER" ]] && echo "pick-next-empty OK"

# write-run-log.sh
echo "test content" | ./.claude/skills/initial-implement/scripts/write-run-log.sh TEST-01 planner
test -f "$(find docs/superpowers/runs/TEST-01 -name planner.md | head -1)" && echo "write-run-log OK"

# Clean up
yq -i 'del(.tasks[] | select(.id == "TEST-01"))' docs/superpowers/queue.yaml
rm -rf docs/superpowers/runs/TEST-01
```

Expected: all four lines `... OK` print. If any fail, fix the relevant script before continuing.

- [ ] **Step 8: Commit**

```bash
cd /Users/alexcheuk/Development/proof-531
git add docs/superpowers/queue.yaml .claude/skills/initial-implement/scripts/
git commit -m "$(cat <<'EOF'
P0-06: queue.yaml seed + four bash scripts for queue operations

- queue.yaml: empty seed (Phase 1-7 tasks added in P0-07).
- pick-next.sh: print next ready task id (resolves depends_on, orders by phase/id).
- ready-tasks.sh: print all ready ids.
- mark-status.sh: update task status with enum validation.
- write-run-log.sh: append subagent output to docs/superpowers/runs/<id>/<ts>/.

Sanity-tested with a synthetic task — all four operations pass.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task P0-07: Populate `queue.yaml` with Phase 1-7 tasks

**Files:**
- Modify: `docs/superpowers/queue.yaml`

This task expands every Phase 1-7 task from the spec into the queue. Every entry is concrete enough that the orchestrator's planner subagent can produce an implementation plan from it.

- [ ] **Step 1: Write the full queue**

Replace `/Users/alexcheuk/Development/proof-531/docs/superpowers/queue.yaml` with the following. (Long file — every task here is one entry the orchestrator will eventually process.)

```yaml
version: 1
tasks:
  # ───────────────────────────────── Phase 1 — Design system ─────────────────────────────────
  - id: P1-01-tokens
    title: Port tokens.css to typed tokens.ts
    phase: 1
    depends_on: []
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#72-phase-1--design-system-1-2-days
    behavioral_reference: design-reference/tokens.css
    done_when:
      - "apps/mobile/src/design/tokens.ts exists with named exports for colors, type, shape, motion"
      - "Every variable in design-reference/tokens.css has a matching export"
      - "pnpm typecheck passes"
      - "pnpm lint passes"
      - "rg -n '#[0-9a-fA-F]{3,8}' apps/mobile/src --type ts | grep -v tokens.ts returns empty"
    notes: |
      Tokens must be plain TS constants (not theme objects). Theme provider
      will consume these. Match all alias variables (--ember, --sage, etc.).

  - id: P1-02-theme-provider
    title: ThemeProvider + useTheme + accent override hook
    phase: 1
    depends_on: [P1-01-tokens]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#72-phase-1--design-system-1-2-days
    behavioral_reference: design-reference/app.jsx
    done_when:
      - "apps/mobile/src/design/theme.ts exports ThemeProvider, useTheme, useAccentOverride"
      - "useAccentOverride supports the 5 accent swatches from design-reference"
      - "jest test verifies useTheme returns tokens unchanged when no override"
      - "jest test verifies useAccentOverride mutates only the hot accent"
      - "pnpm test passes"

  - id: P1-03-fonts
    title: Bundle Space Grotesk + JetBrains Mono via expo-font
    phase: 1
    depends_on: [P1-01-tokens]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#72-phase-1--design-system-1-2-days
    done_when:
      - "Both font families downloaded into apps/mobile/assets/fonts/ (5 weights each)"
      - "expo-font useFonts hook called in root layout"
      - "App boots without 'font not loaded' warnings"
      - "Fonts referenced by name match the strings used in tokens.ts"
    notes: |
      Download Space Grotesk and JetBrains Mono from Google Fonts as TTF.
      File names: SpaceGrotesk-{Regular,Medium,SemiBold,Bold}.ttf,
      JetBrainsMono-{Regular,Medium,SemiBold,Bold}.ttf.

  - id: P1-04-primitives-base
    title: Box, Text, Caps, Eyebrow, WeightNum primitives
    phase: 1
    depends_on: [P1-02-theme-provider, P1-03-fonts]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#72-phase-1--design-system-1-2-days
    behavioral_reference: design-reference/components.jsx
    done_when:
      - "apps/mobile/src/design/primitives/{Box,Text,Caps,Eyebrow,WeightNum}.tsx exist"
      - "Each primitive has a Jest test asserting it renders and applies tokens"
      - "rg -n '#[0-9a-fA-F]{3,8}' apps/mobile/src/design/primitives returns empty"
      - "pnpm test passes"

  - id: P1-05-press-button
    title: PressButton primitive (ember, inverse, ghost x sm/md/lg)
    phase: 1
    depends_on: [P1-04-primitives-base]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#72-phase-1--design-system-1-2-days
    behavioral_reference: design-reference/components.jsx
    done_when:
      - "apps/mobile/src/design/primitives/PressButton.tsx exists"
      - "Supports variants: ember, inverse, ghost; sizes: sm, md, lg"
      - "Jest test asserts accessibilityRole='button' and disabled state"
      - "Jest test asserts onPress fires; haptic feedback fires on press"

  - id: P1-06-card-segrail-stepper
    title: Card, SegRail, NumberStepper primitives
    phase: 1
    depends_on: [P1-04-primitives-base]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#72-phase-1--design-system-1-2-days
    behavioral_reference: design-reference/components.jsx
    done_when:
      - "apps/mobile/src/design/primitives/{Card,SegRail,NumberStepper}.tsx exist"
      - "Each has accessibility roles set (button for SegRail items, adjustable for NumberStepper)"
      - "NumberStepper jest test asserts ± buttons clamp to min/max and step value"
      - "pnpm test passes"

  - id: P1-07-storybook
    title: Storybook 8 for React Native + dev-only route
    phase: 1
    depends_on: [P1-05-press-button, P1-06-card-segrail-stepper]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#layer-4--storybook-on-device
    done_when:
      - "apps/mobile/.storybook/ configured for RN Storybook 8"
      - "apps/mobile/app/_storybook.tsx route mounts the storybook UI"
      - "Route is gated behind __DEV__ — production build omits it"
      - "pnpm typecheck passes"

  - id: P1-08-primitive-stories
    title: Storybook stories for every primitive variant
    phase: 1
    depends_on: [P1-07-storybook]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#layer-4--storybook-on-device
    done_when:
      - "Stories exist for: PressButton (ember/inverse/ghost x sm/md/lg), Card, SegRail, NumberStepper, WeightNum (sm/md/lg)"
      - "Each story renders without a warning"
      - "Storybook builds via `pnpm --filter @proof-531/mobile storybook:build` (or equivalent)"

  - id: P1-09-icons
    title: Icon set ported from design-reference/components.jsx
    phase: 1
    depends_on: [P1-04-primitives-base]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#72-phase-1--design-system-1-2-days
    behavioral_reference: design-reference/components.jsx
    done_when:
      - "apps/mobile/src/design/icons/index.tsx exports Icon component with name prop"
      - "Icon names cover at least: home, dumbbell, calendar, history, settings, arrow-right, plus, minus, check, x"
      - "Story exists rendering the full icon catalog"

  # ───────────────────────────────── Phase 2 — Domain ─────────────────────────────────
  - id: P2-01-program-math
    title: 5/3/1 program math (week scheme, percentages, reps, deload)
    phase: 2
    depends_on: []
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#73-phase-2--domain-layer-1-day
    behavioral_reference: design-reference/app.jsx
    done_when:
      - "apps/mobile/src/domain/program/index.ts exports prescribedSets(trainingMax, week) returning Set[]"
      - "Week 1 returns 5/5/5+ at 65/75/85%; week 2 returns 3/3/3+ at 70/80/90%; week 3 returns 5/3/1+ at 75/85/95%; week 4 deload at 40/50/60%"
      - "fast-check property test asserts AMRAP set is always last and >= prescribed reps"
      - "pnpm test passes"
      - "Coverage on src/domain/program/ is 100%"

  - id: P2-02-plates
    title: calcPlates with bar weight + inventory
    phase: 2
    depends_on: []
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#73-phase-2--domain-layer-1-day
    behavioral_reference: design-reference/components.jsx
    done_when:
      - "apps/mobile/src/domain/plates/index.ts exports calcPlates({ target, bar, inventory }) returning { plates, remainder }"
      - "Greedy algorithm: largest plate first, plates returned for one side"
      - "fast-check property: sum(plates) * 2 + bar + remainder === target for valid inputs"
      - "Unit tests for: 135lb std bar, 225lb std bar, 315lb std bar, metric (20kg bar), insufficient inventory"

  - id: P2-03-e1rm
    title: Epley e1RM + PR detection
    phase: 2
    depends_on: []
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#73-phase-2--domain-layer-1-day
    done_when:
      - "apps/mobile/src/domain/e1rm/index.ts exports epley(weight, reps), isPR(currentE1RM, history)"
      - "epley(100, 10) === 133 (rounded), epley(100, 1) === 100"
      - "fast-check property: epley is monotonically increasing in reps"
      - "isPR returns true iff currentE1RM > max(history)"

  - id: P2-04-progression
    title: TM bump rules + cycle advance
    phase: 2
    depends_on: [P2-01-program-math]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#73-phase-2--domain-layer-1-day
    done_when:
      - "apps/mobile/src/domain/progression/index.ts exports nextTrainingMax(current, category)"
      - "upper categories bump +5; lower categories bump +10"
      - "Cycle advance helper returns next cycle number and resets week to 1"
      - "Unit tests cover both categories and an edge case (TM=0 ignored)"

  - id: P2-05-domain-coverage-gate
    title: Enforce 95% coverage gate on src/domain/
    phase: 2
    depends_on: [P2-01-program-math, P2-02-plates, P2-03-e1rm, P2-04-progression]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#layer-3--unit--property-tests
    done_when:
      - "apps/mobile/jest.config.ts (or .js) has coverageThreshold for src/domain/ at 95%"
      - "pnpm test --coverage exits 0 and prints domain coverage >= 95%"
      - "CI workflow runs pnpm test --coverage"

  # ───────────────────────────────── Phase 3 — Data ─────────────────────────────────
  - id: P3-01-drizzle-schema
    title: Drizzle schema + migration setup
    phase: 3
    depends_on: []
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#6--data-model-drizzle-schema-sketch
    done_when:
      - "apps/mobile/src/data/db/schema.ts defines tables: lifts, cycles, sessions, sets, assistance"
      - "drizzle-kit configured; pnpm --filter mobile run db:generate creates migration files"
      - "pnpm typecheck passes"

  - id: P3-02-drizzle-studio
    title: drizzle-studio-expo plugin for in-app DB inspection
    phase: 3
    depends_on: [P3-01-drizzle-schema]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#layer-1--type-safety
    done_when:
      - "drizzle-studio-expo plugin installed and configured"
      - "Dev menu shows 'Open Drizzle Studio' entry in dev client"
      - "Studio reads the running app's database without crashes"

  - id: P3-03-repos
    title: Repositories for every domain table
    phase: 3
    depends_on: [P3-01-drizzle-schema]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#74-phase-3--data-layer-1-day
    done_when:
      - "apps/mobile/src/data/repositories/{liftRepo,cycleRepo,sessionRepo,setRepo,assistanceRepo}.ts exist"
      - "Each repo exposes: list/get/create/update where applicable"
      - "Each repo has a jest test against in-memory SQLite (':memory:')"
      - "pnpm test passes"

  - id: P3-04-repo-memory-harness
    title: Reusable in-memory SQLite test harness
    phase: 3
    depends_on: [P3-01-drizzle-schema]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#layer-3--unit--property-tests
    done_when:
      - "apps/mobile/src/data/db/test-harness.ts exports createTestDb() that runs all migrations"
      - "Used by every repo test"

  - id: P3-05-query-hooks
    title: TanStack Query hooks for session, cycle, history, PR strip
    phase: 3
    depends_on: [P3-03-repos]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#74-phase-3--data-layer-1-day
    done_when:
      - "apps/mobile/src/data/queries/ exposes: useActiveCycle, useSession, useStartSet, useCompleteSet, useHistory, usePRStrip"
      - "Mutations invalidate the correct query keys"
      - "Hook tests use @tanstack/react-query test utilities"

  - id: P3-06-demo-seed
    title: Seed script producing the four demo states
    phase: 3
    depends_on: [P3-03-repos]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#74-phase-3--data-layer-1-day
    behavioral_reference: design-reference/app.jsx
    done_when:
      - "apps/mobile/src/data/db/seed.ts exports seedDemo(db, stage) for stages: freshStart, midCycle, benchOnly, advanced"
      - "Each seed produces values matching design-reference/app.jsx buildDemoSession()"
      - "Storybook screen stories will consume this"

  # ───────────────────────────────── Phase 4 — Nav + Home ─────────────────────────────────
  - id: P4-01-router-layout
    title: Expo Router root layout + tabs + modals + onboarding stack
    phase: 4
    depends_on: [P1-07-storybook, P3-05-query-hooks]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#75-phase-4--navigation-shell--home-1-day--pipeline-prover
    done_when:
      - "apps/mobile/app/_layout.tsx mounts QueryClientProvider and ThemeProvider and runs db migrations"
      - "(tabs)/_layout.tsx defines 5 tabs"
      - "live and pr exist as modal screens"
      - "onboarding/ is a separate stack"
      - "App boots in dev client with no warnings"

  - id: P4-02-tab-bar
    title: Glassy tab bar component (hot-on-bg-2 pill)
    phase: 4
    depends_on: [P4-01-router-layout, P1-05-press-button, P1-09-icons]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#75-phase-4--navigation-shell--home-1-day--pipeline-prover
    behavioral_reference: design-reference/app.jsx
    done_when:
      - "apps/mobile/src/features/navigation/TabBar.tsx renders 5 tabs with the glassy backdrop blur"
      - "Active tab shows label + icon in hot; inactive shows icon only in 55% ink"
      - "Story renders all 5 tab-active states"

  - id: P4-03-home-screen
    title: Home screen ported from screens-meta.jsx
    phase: 4
    depends_on: [P4-02-tab-bar, P3-06-demo-seed]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#52-home--the-free-picker
    behavioral_reference: design-reference/screens-meta.jsx
    done_when:
      - "apps/mobile/src/features/home/HomeScreen.tsx exists"
      - "Greeting, headline, cycle status pill, lift picker grid, stats row all render"
      - "Single-lift mode renders one full-width card instead of grid"
      - "Last-cycle progression notice appears when cycle just advanced"

  - id: P4-04-home-stories
    title: Home stories for all four demo stages
    phase: 4
    depends_on: [P4-03-home-screen, P3-06-demo-seed]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#layer-4--storybook-on-device
    done_when:
      - "Storybook stories: home/freshStart, home/midCycle, home/benchOnly, home/advanced"
      - "Each story seeds the in-memory db with the matching seed function"

  - id: P4-05-maestro-home
    title: Maestro flow home-renders.yaml + committed screenshots
    phase: 4
    depends_on: [P4-03-home-screen]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#layer-5--e2e-with-maestro
    done_when:
      - "apps/mobile/.maestro/home-renders.yaml exists"
      - "maestro test passes on iOS simulator"
      - "apps/mobile/.maestro/screenshots/home-renders/ contains baseline PNGs"
      - "CI runs the flow against iOS simulator"

  # ───────────────────────────────── Phase 5 — Plate viz ─────────────────────────────────
  - id: P5-01-skia-barbell
    title: Skia Barbell plate-viz variant
    phase: 5
    depends_on: [P2-02-plates, P1-04-primitives-base]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#6--plate-visualization-a-centerpiece
    behavioral_reference: design-reference/components.jsx
    done_when:
      - "apps/mobile/src/design/plates/Barbell.tsx renders side-view bar with stacked plates via Skia"
      - "Plate diameter scales 42%–100%; sleeves silver gradient; collars between bar/plate"
      - "Story: Barbell variant for 5 representative weights (135/225/315/405/495 lbs)"

  - id: P5-02-skia-chips
    title: Skia Chips plate-viz variant
    phase: 5
    depends_on: [P2-02-plates, P1-04-primitives-base]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#6--plate-visualization-a-centerpiece
    behavioral_reference: design-reference/components.jsx
    done_when:
      - "apps/mobile/src/design/plates/Chips.tsx renders colored pill chips per plate per side"
      - "Story covers the same 5 weights as Barbell"

  - id: P5-03-skia-numerical
    title: Numerical plate-viz variant
    phase: 5
    depends_on: [P2-02-plates, P1-04-primitives-base]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#6--plate-visualization-a-centerpiece
    behavioral_reference: design-reference/components.jsx
    done_when:
      - "apps/mobile/src/design/plates/Numerical.tsx renders grouped count × weight"
      - "Per-side caption rendered"
      - "Story covers the same 5 weights"

  - id: P5-04-plate-perf-budget
    title: Reassure perf budget for plate variants
    phase: 5
    depends_on: [P5-01-skia-barbell, P5-02-skia-chips, P5-03-skia-numerical]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#layer-6--perf-budgets
    done_when:
      - "Reassure measurement under 4ms render for each variant at 225 lbs"
      - "CI fails if any variant regresses >10% from baseline"

  # ───────────────────────────────── Phase 6 — Observability + delivery ─────────────────────────────────
  - id: P6-01-sentry
    title: Sentry wired with sourcemap upload via EAS Build
    phase: 6
    depends_on: [P4-01-router-layout]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#layer-7--crash--behavior-monitoring
    done_when:
      - "@sentry/react-native installed and initialized in apps/mobile/src/lib/sentry.ts"
      - "DSN read from EXPO_PUBLIC_SENTRY_DSN env var"
      - "Test event sent successfully (manual or scripted)"
      - "EAS Build hook uploads sourcemaps"

  - id: P6-02-posthog
    title: PostHog opt-in analytics
    phase: 6
    depends_on: [P4-01-router-layout]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#layer-7--crash--behavior-monitoring
    done_when:
      - "posthog-react-native installed and initialized"
      - "Default OFF; user toggle in Settings (stub) flips the switch"
      - "Four events wired: onboarding_complete, set_completed, pr_detected, cycle_advanced"
      - "No tracking when toggle is off (verified via test)"

  - id: P6-03-eas-profiles
    title: eas.json with development, preview, production profiles
    phase: 6
    depends_on: [P0-01-bootstrap]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#75-phase-4--navigation-shell--home-1-day--pipeline-prover
    done_when:
      - "apps/mobile/eas.json defines development (dev client), preview (internal), production (store) profiles"
      - "EAS CLI accepts the config (eas build:configure --profile production --dry-run if available, otherwise eas build --dry-run for each)"

  - id: P6-04-testflight
    title: First TestFlight + Internal-track build
    phase: 6
    depends_on: [P6-01-sentry, P6-02-posthog, P6-03-eas-profiles, P4-05-maestro-home]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#77-phase-6--observability--delivery-half-day
    done_when:
      - "iOS production build succeeds via EAS Build"
      - "Build uploaded to TestFlight"
      - "Android production build succeeds via EAS Build"
      - "Build uploaded to Play Console internal track"

  # ───────────────────────────────── Phase 7 — Hand-off ─────────────────────────────────
  - id: P7-01-architecture-doc
    title: docs/ARCHITECTURE.md distilled from the spec
    phase: 7
    depends_on: [P4-03-home-screen]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#3--architecture
    done_when:
      - "docs/ARCHITECTURE.md exists summarizing stack, layout, boundary rules"
      - "Document references the spec without restating it verbatim"

  - id: P7-02-contributing-doc
    title: docs/CONTRIBUTING.md
    phase: 7
    depends_on: [P0-04-skill-scaffold]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md
    done_when:
      - "docs/CONTRIBUTING.md exists explaining /initial-implement, queue.yaml, the harness, and how to add a new task"

  - id: P7-03-backlog-screens
    title: Append future screen tasks to queue.yaml
    phase: 7
    depends_on: []
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#backlog-post-foundation-separate-specs
    done_when:
      - "queue.yaml contains placeholder tasks (status todo, depends_on empty, body to be specified) for: onboarding, today-editorial, today-cards, today-data, live, cycle, history, library, settings, pr-modal"
      - "Each task's spec_ref points to a still-to-be-written spec path under docs/superpowers/specs/"
    notes: |
      These tasks are markers — they cannot be started until their per-screen
      spec is written via a brainstorm/spec cycle. The orchestrator will
      decline them (planner returns BLOCKED) until specs exist.

  - id: P7-04-readme
    title: Final README pass
    phase: 7
    depends_on: [P4-03-home-screen]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md
    done_when:
      - "README.md includes: project goal, dev quick-start, link to DESIGN.md, link to ARCHITECTURE.md, /initial-implement usage"
```

- [ ] **Step 2: Validate the queue with the scripts**

```bash
cd /Users/alexcheuk/Development/proof-531

# All tasks parse
yq '.tasks | length' docs/superpowers/queue.yaml
# Expect: 32

# pick-next prints something (the first ready task)
./.claude/skills/initial-implement/scripts/pick-next.sh
# Expect one of: P1-01-tokens, P2-01-program-math, P2-02-plates, P2-03-e1rm, P3-01-drizzle-schema, P7-03-backlog-screens (any phase-N task with no deps)

# ready-tasks should list all dependency-free tasks
./.claude/skills/initial-implement/scripts/ready-tasks.sh
# Expect at least: P1-01-tokens, P2-01-program-math, P2-02-plates, P2-03-e1rm, P3-01-drizzle-schema, P7-03-backlog-screens
```

- [ ] **Step 3: Detect dependency cycles**

```bash
yq -r '.tasks[] | .id + ": " + ((.depends_on // []) | join(","))' docs/superpowers/queue.yaml
```

Manually scan for cycles. (32 tasks, all dependencies forward-only by phase — no cycles by construction.)

- [ ] **Step 4: Detect broken dependency references**

```bash
ALL_IDS=$(yq -r '.tasks[].id' docs/superpowers/queue.yaml | sort -u)
BAD=0
for dep in $(yq -r '.tasks[].depends_on // [] | .[]' docs/superpowers/queue.yaml | sort -u); do
  if ! echo "$ALL_IDS" | grep -q "^${dep}$"; then
    echo "BROKEN DEP: $dep"
    BAD=1
  fi
done
[[ "$BAD" -eq 0 ]] && echo "all deps resolve"
```

Expected: `all deps resolve`. If any dep is broken, fix the queue entry that references it.

> NOTE: `P6-03-eas-profiles` depends on `P0-01-bootstrap`, and `P7-02-contributing-doc` depends on `P0-04-skill-scaffold`. These ids must exist somewhere — they refer to the Phase-0 work completed by *this plan* (not future orchestrator runs). Since the orchestrator only sees `queue.yaml`, we explicitly add Phase-0 ids as already-done entries so the deps resolve. Do that in the next step.

- [ ] **Step 5: Add already-done Phase-0 marker entries**

Append to the bottom of `docs/superpowers/queue.yaml` (under `tasks:`):

```yaml
  # ───────── Phase 0 markers (already shipped by Phase 0 plan; deps reference these) ─────────
  - id: P0-01-bootstrap
    title: Bootstrap pnpm workspace + Expo SDK 55 app
    phase: 0
    depends_on: []
    status: done
    spec_ref: docs/superpowers/plans/2026-05-19-phase-0-bootstrap.md#task-p0-01-bootstrap-pnpm-workspace--expo-sdk-55-app
    done_when:
      - "Marker — see plan task P0-01"
  - id: P0-04-skill-scaffold
    title: /initial-implement skill scaffold
    phase: 0
    depends_on: []
    status: done
    spec_ref: docs/superpowers/plans/2026-05-19-phase-0-bootstrap.md#task-p0-04-initial-implement-skill-scaffold
    done_when:
      - "Marker — see plan task P0-04"
```

Re-run Step 4. Expected: `all deps resolve`.

- [ ] **Step 6: Commit**

```bash
cd /Users/alexcheuk/Development/proof-531
git add docs/superpowers/queue.yaml
git commit -m "$(cat <<'EOF'
P0-07: populate queue.yaml with Phase 1-7 backlog (32 tasks)

Each task has a phase number, dependency list, machine-checkable
done_when criteria, spec_ref into the scaffold spec, and a
behavioral_reference into design-reference/ when applicable.

Phase 0 marker entries added so cross-phase deps (P6-03 → P0-01,
P7-02 → P0-04) resolve cleanly.

Dependency graph verified: all references resolve, no cycles.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task P0-08: Run-log infrastructure

**Files:**
- Create: `docs/superpowers/runs/.gitkeep`
- Create: `docs/superpowers/runs/README.md`

- [ ] **Step 1: Create the directory and .gitkeep**

```bash
cd /Users/alexcheuk/Development/proof-531
mkdir -p docs/superpowers/runs
touch docs/superpowers/runs/.gitkeep
```

- [ ] **Step 2: Add a README explaining the log structure**

Create `/Users/alexcheuk/Development/proof-531/docs/superpowers/runs/README.md`:

```markdown
# Run logs

Each time `/initial-implement` processes a task, it appends artifacts here:

```
docs/superpowers/runs/<task-id>/<ISO-timestamp>/
├── planner.md         # Planner subagent output (the steps it proposed)
├── implementer.diff   # git diff of the worktree after the implementer ran
├── verifier.json      # Verifier output (one file per attempt: verifier.1.json, etc.)
├── fixer.diff         # Diff per fixer attempt (fixer.1.diff, fixer.2.diff, ...)
├── reviewer.md        # Reviewer output (one per cycle)
└── outcome.md         # Final summary: done | blocked, attempts, total time, link to merged commit
```

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
```

- [ ] **Step 3: Commit**

```bash
cd /Users/alexcheuk/Development/proof-531
git add docs/superpowers/runs/
git commit -m "$(cat <<'EOF'
P0-08: run-log infra under docs/superpowers/runs/

Per-task subagent artifacts committed alongside the work they describe.
README documents the directory layout. .gitkeep keeps the empty tree
checked in.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task P0-09: Three `CLAUDE.md` files

**Files:**
- Create: `CLAUDE.md` (repo root)
- Create: `apps/mobile/src/domain/CLAUDE.md`
- Create: `apps/mobile/src/design/CLAUDE.md`
- Create: `apps/mobile/src/{data,features,ui-state,lib}/.gitkeep`

- [ ] **Step 1: Create placeholder directories so commits hold the shape**

```bash
cd /Users/alexcheuk/Development/proof-531
mkdir -p apps/mobile/src/{design,domain,data,features,ui-state,lib}
touch apps/mobile/src/{data,features,ui-state,lib}/.gitkeep
```

- [ ] **Step 2: Repo-root CLAUDE.md**

Create `/Users/alexcheuk/Development/proof-531/CLAUDE.md`:

````markdown
# Working in proof-531

> Welcome. Read this first.

## What this repo is

A production scaffold for **531 Strength** — a 5/3/1 + BBB training tracker for iOS and Android.
The product spec is in `docs/DESIGN.md`. The engineering spec is in `docs/superpowers/specs/2026-05-19-expo-scaffold-design.md`.

## Stack

- Expo SDK 55, React Native 0.81+ (New Architecture on), Dev Client workflow
- TypeScript strict, Biome, pnpm workspaces, Node 22
- expo-router (file-based), Drizzle ORM + expo-sqlite, TanStack Query, Zustand
- Reanimated 4, react-native-skia, expo-haptics, expo-blur
- Sentry, PostHog (opt-in)
- Jest + RTL, Maestro, Storybook 8 for RN, Reassure

## Layout

```
apps/mobile/
  app/                  # expo-router routes (thin shells)
  src/
    design/             # tokens, theme, primitives, plates, icons, motion
    domain/             # pure business logic — NO React, NO async, NO DB
    data/               # Drizzle, repos, query hooks
    features/           # screen composition
    ui-state/           # Zustand
    lib/                # haptics/sentry/posthog init
```

## Boundary rules (enforced by reviewer)

1. **`src/design/` is the only place hex/px literals live.** All others import from `tokens.ts`.
2. **`src/domain/` is pure.** No `import React`, no `async`, no Drizzle. Property-tested.
3. **`src/data/` owns persistence.** Components consume via `useSession()` etc., never `import drizzle`.
4. **`features/` is composition.** Routes in `app/` are thin shells importing feature components.
5. **No barrel files** in `features/` or `domain/`. Barrels OK inside `design/primitives/`.
6. **Import direction is one-way:** `app → features → (design | data | domain)`. Reviewer flags violations.

## Design reference

`design-reference/` is the **behavioral source of truth** for visuals and interactions. When porting a screen or component, read the matching `design-reference/*.jsx` file and port faithfully — do not reinvent.

`design-reference/` is **never modified** by orchestrator-run tasks.

## Dev commands

```bash
pnpm install                                    # workspace install
pnpm --filter @proof-531/mobile start           # boot dev client
pnpm typecheck                                  # tsc --noEmit across workspace
pnpm lint                                       # biome
pnpm test                                       # jest
pnpm doctor                                     # expo-doctor
```

## How work happens

You will be invoked via `/initial-implement` (and its flags `--batch`, `--max-tasks N`, `--task <id>`, `--retry <id>`, `--status`). The skill picks the next ready task from `docs/superpowers/queue.yaml`, spawns subagents, runs the full harness, and commits.

See `.claude/skills/initial-implement/SKILL.md` for the orchestrator's full behavior. See `.claude/skills/initial-implement/queue-format.md` for the task schema.

## Test discipline

- **TDD for `src/domain/`**: red → green → commit. Property tests via `fast-check` where applicable.
- **Component tests assert behavior, not pixels.** Pixels are checked via Storybook + Maestro screenshots.
- **No skipped tests** without a comment linking to a tracking issue.

## Commit discipline

- Conventional commits: `feat:`, `fix:`, `test:`, `chore:`, `docs:`.
- Orchestrator squash-merges with prefix `[auto] <task-id> <title>`.
- Direct human commits should not start with `[auto]`.
````

- [ ] **Step 3: Domain folder CLAUDE.md**

Create `/Users/alexcheuk/Development/proof-531/apps/mobile/src/domain/CLAUDE.md`:

````markdown
# Working in src/domain/

## Rules

- **No React.** No imports from `react`, `react-native`, or any UI library.
- **No async.** No `async`/`await`, no Promises, no setTimeout. Functions are synchronous.
- **No IO.** No DB, no fetch, no file system, no AsyncStorage.
- **No environment access.** No `process.env`, no `Date.now()` directly — accept time as a parameter.
- **Property tests required** for anything mathematical. Use `fast-check` from `@fast-check/jest`.
- **Coverage gate: 95%.** CI fails below this.

## Why

This is the part of the app a future-you (or a future-Claude) can stare at and immediately understand. No environmental coupling means tests are fast and deterministic. No async means call sites are easy to reason about. The 5/3/1 math, plate calc, e1RM formula, and progression rules are the product's truth — they get the most expensive testing because everything else depends on them.

## File organization

```
domain/
  program/     # 5/3/1 percentages, week scheme, AMRAP rules, deload
  plates/      # calcPlates: greedy plate fill given bar + inventory
  e1rm/        # Epley formula + PR detection
  progression/ # TM bump rules, cycle advance
```

Each subfolder exports a `index.ts` with the public API. Implementation files (`epley.ts`, `pr.ts`, ...) are colocated. Tests live in `__tests__/` next to source.

## Naming

- Public functions: `prescribedSets`, `calcPlates`, `epley`, `isPR`, `nextTrainingMax`.
- No abbreviated parameter names except units (`reps`, `lbs`, `tm`).
- Booleans named with `is`/`has`/`should` prefix.
````

- [ ] **Step 4: Design folder CLAUDE.md**

Create `/Users/alexcheuk/Development/proof-531/apps/mobile/src/design/CLAUDE.md`:

````markdown
# Working in src/design/

## Rules

- **`tokens.ts` is the only file with hex/px literals.** Every other file imports tokens.
- **Every primitive has a Storybook story** covering every variant.
- **Accessibility roles are mandatory.** `Pressable` → `accessibilityRole="button"`; `NumberStepper` → `accessibilityRole="adjustable"`. Tested.
- **No inline styles** referencing colors or sizes. Compose with token-derived `StyleSheet.create` or with `useTheme()`.
- **Primitives don't fetch data.** Pass data in as props. Composition happens in `features/`.

## File organization

```
design/
  tokens.ts         # All hex, all px, all motion timings. Single source.
  theme.ts          # ThemeProvider + useTheme + useAccentOverride
  primitives/       # Box, Text, Caps, Eyebrow, WeightNum, Card, PressButton, SegRail, NumberStepper
  plates/           # Barbell, Chips, Numerical (Skia)
  icons/            # Icon component + name registry
  motion/           # Shared eases, durations, layout-animation presets
```

## Naming

- Component names: `PressButton`, `WeightNum`, `Caps`, not `Button`, `Number`, `Label`.
- Props: explicit, no `style` passthrough unless documented (we want consistent typography).
- Variants: `variant: 'ember' | 'inverse' | 'ghost'`. Sizes: `size: 'sm' | 'md' | 'lg'`.

## Tokens consumption

```ts
// good
import { colors, type, shape } from '@/design/tokens';

// bad — never, even for "just one color"
const c = '#FF5530';
```

The reviewer runs `rg -n '#[0-9a-fA-F]{3,8}'` on every diff inside `src/design/` (excluding `tokens.ts`). Any hit is rejected.
````

- [ ] **Step 5: Commit**

```bash
cd /Users/alexcheuk/Development/proof-531
git add CLAUDE.md apps/mobile/src/
git commit -m "$(cat <<'EOF'
P0-09: three CLAUDE.md files (root, domain, design)

Repo-root orientation covers stack, layout, boundary rules, dev
commands, and the /initial-implement workflow. Domain CLAUDE.md
codifies purity rules (no React, no async, no IO). Design CLAUDE.md
locks tokens.ts as the only home for hex/px literals.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task P0-99: Orchestrator smoke task

A no-op task that exercises the full orchestrator pipeline end-to-end before we trust it for real work.

**Files:**
- Modify: `docs/superpowers/queue.yaml` (append `P0-99` task)
- Run: `/initial-implement --task P0-99` (manually, in this session)
- Verify: smoke task lands on `main` as a clean squash commit, run logs exist, queue marks done

- [ ] **Step 1: Append the smoke task to `queue.yaml`**

Append at the bottom of `docs/superpowers/queue.yaml` under `tasks:` (after the Phase 0 marker entries from P0-07):

```yaml
  - id: P0-99-smoke
    title: Orchestrator smoke test — write a no-op marker file
    phase: 0
    depends_on: []
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#smoke-task-p0-99
    done_when:
      - "apps/mobile/SMOKE.md exists"
      - "apps/mobile/SMOKE.md contains the string 'orchestrator smoke ok'"
      - "pnpm typecheck passes"
      - "pnpm lint passes"
    notes: |
      Smallest possible task. Create the file with exactly:
        # Smoke
        orchestrator smoke ok
      Nothing else. This task proves the planner, implementer, verifier,
      and reviewer agents wire together correctly before real work begins.
```

- [ ] **Step 2: Invoke the orchestrator against the smoke task**

In this Claude Code session (or a fresh one), run the slash command:

```
/initial-implement --task P0-99-smoke
```

Watch for:
- A run-log directory appearing at `docs/superpowers/runs/P0-99-smoke/<timestamp>/`.
- Files inside: `planner.md`, `implementer.diff`, `verifier.json`, `reviewer.md`, `outcome.md`.
- A new commit on `main` with subject `[auto] P0-99-smoke Orchestrator smoke test — write a no-op marker file`.

- [ ] **Step 3: Verify the artifacts**

Run from `/Users/alexcheuk/Development/proof-531`:

```bash
# Smoke file landed on main with the expected content.
test -f apps/mobile/SMOKE.md
grep -q "orchestrator smoke ok" apps/mobile/SMOKE.md && echo "smoke file OK"

# Run logs exist.
ls docs/superpowers/runs/P0-99-smoke/*/{planner.md,implementer.diff,verifier.json,reviewer.md,outcome.md} >/dev/null && echo "logs OK"

# Queue marks the task done.
STATUS=$(yq -r '.tasks[] | select(.id == "P0-99-smoke") | .status' docs/superpowers/queue.yaml)
[[ "$STATUS" == "done" ]] && echo "queue OK"

# Commit message has the expected prefix.
git log -1 --format="%s" | grep -q "\[auto\] P0-99-smoke" && echo "commit OK"
```

Expected: all four `... OK` lines print. If any fail, the orchestrator has a defect — diagnose by reading the run log and stop before running any real Phase 1+ task.

- [ ] **Step 4: If anything failed, fix the orchestrator and re-run**

Common failure modes:
- `pick-next.sh` didn't find the task → check that `--task` flag bypasses pick-next correctly in `SKILL.md`.
- Worktree creation failed → check `using-git-worktrees` skill is installed and `/tmp` is writable.
- Verifier emitted non-JSON → tighten the verifier prompt.
- Reviewer rejected a clean diff → soften the reviewer prompt (probably over-strict on a no-op file).

After each fix, re-run `/initial-implement --retry P0-99-smoke` and re-verify.

- [ ] **Step 5: Commit (only the smoke task entry — the smoke file itself was committed by the orchestrator)**

```bash
cd /Users/alexcheuk/Development/proof-531

# The orchestrator already committed SMOKE.md and the run logs.
# This commit captures only the queue.yaml change (if not already committed by orchestrator's queue-update step).
git status --short

# If queue.yaml is uncommitted:
if ! git diff --quiet docs/superpowers/queue.yaml; then
  git add docs/superpowers/queue.yaml
  git commit -m "$(cat <<'EOF'
P0-99: orchestrator smoke test passed

Smoke task added to queue.yaml, run end-to-end by /initial-implement,
landed on main as expected. Pipeline verified: planner → implementer →
verifier → reviewer → squash merge → queue update → run logs committed.

/initial-implement is now trusted for Phase 1+ batch runs.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
fi
```

---

## Post-Phase-0 checklist

After P0-99 passes, the foundation is complete. Before declaring done:

- [ ] `pnpm install && pnpm typecheck && pnpm lint && pnpm doctor` all green.
- [ ] CI passes on the branch (or main if these commits landed directly).
- [ ] `docs/superpowers/queue.yaml` shows all P0 tasks `done` and Phase 1-7 backlog `todo`.
- [ ] `/initial-implement --status` runs and prints the queue with status icons.
- [ ] One end-to-end run log exists at `docs/superpowers/runs/P0-99-smoke/`.

After that, hand off:

```
/initial-implement --batch --max-tasks 10
```

Walk away. The orchestrator will work through Phase 1 (design system) one task at a time, each verified and committed. Come back, read the run logs, decide what to do next.

---

## Self-review notes

- **Spec coverage:** every Phase 0 item in `specs/2026-05-19-expo-scaffold-design.md` §7.1 maps to a task here (P0-01..P0-09 + P0-99). The original spec listed `P0-04 CLAUDE.md files` and `P0-05 skill scaffold`; this plan reorders them to P0-09 (CLAUDE.md last) and P0-04 (skill first) so CLAUDE.md can reference the already-existing skill. Functionally equivalent.
- **Type consistency:** the queue schema in P0-06/P0-07 matches the schema in P0-04's `queue-format.md`. Subagent prompt placeholders (`{{task_id}}`, `{{done_when_bullets}}`, etc.) are consistent across all five templates.
- **Dependency closure:** P6-03 depends on P0-01, and P7-02 depends on P0-04 — Phase-0 marker entries in P0-07 Step 5 satisfy these.
- **No placeholders:** every step shows actual content. Subagent prompts use `{{placeholder}}` syntax — those are templated by the orchestrator at runtime, not human gaps.
