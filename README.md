# 531 Strength

A production scaffold for a 5/3/1 + BBB + assistance training tracker. Expo SDK 55, React Native New Architecture, iOS + Android. The goal is a polished, native-feeling lifting app that ships to TestFlight and Play Console internal track from day one.

- **Changelog**: [`CHANGELOG.md`](./CHANGELOG.md)
- **Marketing source**: [`docs/MARKETING.md`](./docs/MARKETING.md)
- **Privacy policy**: [`docs/PRIVACY.md`](./docs/PRIVACY.md) — single user, local-only, no tracking.

## Project goal

The 5/3/1 program math, plate calculator, e1RM, and PR detection are pure modules under `src/domain/` — well-tested and easy to reason about. The on-device experience is built from a small typed design system (`src/design/`) and composed in `src/features/`. Persistence is Drizzle ORM + expo-sqlite (`src/data/`). The whole thing is wired through an orchestrator (`/initial-implement`) that picks the next task from a queue, dispatches subagents, runs the harness, and commits.

## Quick start

```bash
# Prerequisites: Node 22 (.nvmrc), pnpm 9.15+, bash 4+, yq v4
corepack enable && corepack prepare pnpm@latest --activate

pnpm install                                # workspace install
pnpm --filter @fivethreeone/mobile start       # boot Metro
```

This project uses the **Expo Go workflow** — no custom dev client. Scan the QR code with the Expo Go app on a physical device, or press `i` / `a` for iOS Simulator / Android Emulator. EAS is used for OTA updates and store builds, not for local development.

### Daily commands

```bash
pnpm typecheck                              # tsc --noEmit across workspace
pnpm lint                                   # biome
pnpm test                                   # jest (with --coverage on src/domain/, gate 95%)
pnpm expo-doctor                            # expo doctor (renamed to dodge pnpm's `doctor` builtin)
pnpm run ci                                 # full chain (use `run` — `ci` is also a pnpm builtin)
```

## Documentation

| Doc | Purpose |
|---|---|
| [`docs/DESIGN.md`](docs/DESIGN.md) | Product + visual design spec |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Stack, layout, boundary rules |
| [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) | How to add a task, run the orchestrator, conventional commits |
| [`docs/superpowers/specs/`](docs/superpowers/specs/) | Engineering specs |
| [`docs/superpowers/plans/`](docs/superpowers/plans/) | Implementation plans |
| [`docs/superpowers/queue.yaml`](docs/superpowers/queue.yaml) | Orchestrator backlog |
| [`CLAUDE.md`](CLAUDE.md) | Agent orientation (root); see also `apps/mobile/src/{design,domain}/CLAUDE.md` |

## How work happens

Three entry points, each with its own orchestrator. Pick the one that matches the input.

### `/auto-improve` — the standing 30-minute loop

The primary day-to-day driver. Reads `loop-memory/`, polls the `#task-queue` Discord channel for unacknowledged messages, picks 12–15 substantive items (or 2–4 in steady state when the queue is empty), ships them, commits, pushes, ships OTA, writes a Verso dev-blog entry. Usually invoked via `/loop 30m /auto-improve`. See [`.claude/skills/auto-improve/`](.claude/skills/auto-improve/) for the skill source and `loop-memory/00-loop-pacing.md` for the pacing rules.

### `rn-expo-pipeline` — idea-driven feature work

Triggered when an idea, description, or wireframe comes in. Runs a coordinated design / frontend / QA team (`rn-designer` → `rn-frontend` → `rn-qa`) to ship a PR-ready commit on `feat/<slug>`. See [`.claude/skills/rn-expo-pipeline/`](.claude/skills/rn-expo-pipeline/).

### `/initial-implement` — queue-driven backlog drain

For when a spec + plan already exist in `docs/superpowers/`. Picks the next ready task from `docs/superpowers/queue.yaml`, spawns planner → implementer → verifier → fixer → reviewer subagents, runs the full harness, squash-merges to `main`.

```bash
/initial-implement                     # one ready task
/initial-implement --batch             # loop until queue empty / 2 blocked / --max-tasks
/initial-implement --batch --max-tasks 20
/initial-implement --task P2-01-program-math   # specific task
/initial-implement --retry P4-05-maestro-home  # re-run blocked task
/initial-implement --status            # print queue
```

See [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) for the full flow.

## License

UNLICENSED (portfolio piece — open for inspection, not for redistribution).
