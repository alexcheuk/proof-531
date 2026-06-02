# Contributing to 531

This guide covers everything you need to land a change: by hand, via the
`/do-work` loop, or via the `rn-expo-pipeline` feature team. Read
[`CLAUDE.md`](../CLAUDE.md) first; this document picks up where that leaves off.

## Setup

### Prerequisites

| Tool | Version | Why |
|---|---|---|
| Node | 22 (pinned in `.nvmrc`) | Runtime for Metro and tooling. |
| pnpm | 9.15+ | Workspace manager. Install via Corepack: `corepack enable && corepack prepare pnpm@latest --activate`. |
| bash | 4+ | Orchestrator scripts use `mapfile` and `declare -A`. macOS ships 3.2 — `brew install bash`. |
| yq (mikefarah) | v4 | Only needed for the retired queue scripts in `docs/_retired/`. `brew install yq`, or download from https://github.com/mikefarah/yq/releases. |
| Android SDK + JDK 17 | — | For local dev-client builds (`pnpm build:dev`). Alternatively use `eas build` (cloud, no local SDK needed). |

### Bootstrap

```bash
git clone https://github.com/alexcheuk/proof-531.git
cd proof-531
nvm use            # or: fnm use
corepack enable
pnpm install
```

## Daily commands

```bash
pnpm build:dev                              # build the dev-client APK (needs Android SDK + JDK 17)
pnpm --filter @fivethreeone/mobile start    # boot Metro; connect the dev-client APK on device/emulator
pnpm typecheck                            # tsc --noEmit across workspace
pnpm lint                                 # biome
pnpm test                                 # jest
pnpm expo-doctor                          # expo doctor (renamed; `pnpm doctor` is a pnpm builtin)
pnpm bundle-check                         # full Metro export — catches missing deps CI doesn't
pnpm run ci                               # full chain — typecheck + lint + boundaries + test
pnpm verify                               # `pnpm run ci` PLUS `pnpm bundle-check` PLUS `build:web`
```

`pnpm verify` is the green-bar gate before every commit. If it does not pass
locally, the `/do-work` loop will not ship the change (and CI will fail too).

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
| Session layout    | `CtaBar`, `CtaBarReserve`                                  |
| Top bar pills (session-local) | `TopBarPill` (+ `UndoPill`, `ResetPill`, `CancelPill`, `CompletePill` thin wrappers) |
| Domain composites | `LedgerRow`, `LedgerSection`, `TopSetBlock`, `PlateBar`, `ProgressGridCell`, `ProgressGridRow`, `TmCell` |

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
- `src/domain/CLAUDE.md`, `src/design/CLAUDE.md`, `src/data/CLAUDE.md`,
  `src/features/CLAUDE.md` — folder-scoped rules the reviewer enforces

## Adding a task

The single task model is the work-graph at [`do-work/work/backlog.md`](../do-work/work/backlog.md).
To add work, append an item there; the `/do-work` loop prioritizes via the
impact-rubric in `do-work/DOCTRINE.md` and ships items end-to-end. Idea-driven
feature work goes through the `rn-expo-pipeline` skill instead (design →
frontend → QA team to a PR-ready commit on `feat/<slug>`).

When you write an item, keep its "done" condition machine-checkable where it
can be:

- Good: `"pnpm typecheck passes"`, `"file X exists"`, `"rg pattern returns empty"`.
- Bad: `"looks good"`, `"accessibility is correct"`, `"works on iOS"`.

## How the loop ships work

The `/do-work` loop orients on `do-work/SOUL.md` + `do-work/DOCTRINE.md` + the
work-graph, picks items, implements them across layers, runs `pnpm verify`,
commits, and pushes. OTA is published automatically by CI on the push.

> **Retired:** the old queue-driven `/initial-implement` orchestrator (a
> five-subagent planner → implementer → verifier → fixer → reviewer pipeline
> over `docs/superpowers/queue.yaml`) is no longer in use. The queue was fully
> drained and the machinery, including the queue file and the per-task
> `done_when` schema, now lives under [`docs/_retired/`](./_retired/). New work
> uses `/do-work` or `rn-expo-pipeline`; it is not replaced one-for-one.

## Forbidden paths

Any orchestrator-run work (`/do-work`, `rn-expo-pipeline`) must never edit:

- `docs/superpowers/specs/`: the engineering spec is frozen.
- `docs/superpowers/plans/`: per-task plans are read-only.

Authorized files for a given task are whatever its active plan or work-graph
item scopes.

## Conventional commits

Use Conventional Commits for direct human commits:

- `feat:` — new capability
- `fix:` — bug fix
- `test:` — tests only
- `chore:` — tooling, config
- `docs:` — documentation
- `refactor:` — non-behavioral change

Direct human commits **must not** start with `[auto]`. That prefix is reserved
for orchestrator squash merges (`[auto] <task-id> <title>`).

## Test discipline

- **TDD for `src/domain/`**: red → green → commit. Property tests via
  [`fast-check`](https://github.com/dubzzz/fast-check) where applicable.
- **Component tests assert behavior, not pixels.** Visual fidelity is checked
  manually against the running mobile app (the port from the PWA reference is
  complete; the mobile app is now self-referential). Storybook screenshot
  harnesses are deferred.
- **Maestro e2e flows live in `.maestro/flows/`.** Run them with `maestro test .maestro/flows/`
  against a running dev client. Install Maestro: `curl -Ls "https://get.maestro.mobile.dev" | bash`.
  Requires the dev-client APK installed on device/emulator and Metro running.
- **No skipped tests** without a comment linking to a tracking issue.

## Pre-commit and PR review

- `pnpm verify` must pass locally before opening a PR (typecheck + lint +
  boundary check + test + Metro bundle export + web build).
- The `rn-qa` reviewer (and `pnpm check-boundaries`) enforces boundary rules
  (no hex outside `tokens.ts`, no React/async/Drizzle in `domain/`, no
  `drizzle` imports outside `data/`, no barrels in `features/` or `domain/`,
  one-way import direction).
- There is no global 95% domain-coverage gate today.

If review requests changes, fix them and re-run `pnpm run ci`. The `/do-work`
loop and `rn-expo-pipeline` handle this automatically; humans follow the same loop.
