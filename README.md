# 531 Strength

A production scaffold for a 5/3/1 + BBB + assistance training tracker. Expo SDK 55, React Native New Architecture, iOS + Android. The goal is a polished, native-feeling lifting app that ships to TestFlight and Play Console internal track from day one.

- **Changelog**: [`CHANGELOG.md`](./CHANGELOG.md)
- **Marketing source**: [`docs/MARKETING.md`](./docs/MARKETING.md)
- **Privacy policy**: [`docs/PRIVACY.md`](./docs/PRIVACY.md) — single user, local-only, no tracking.

## Project goal

The 5/3/1 program math, plate calculator, e1RM, and PR detection are pure modules under `src/domain/` — well-tested and easy to reason about. The on-device experience is built from a small typed design system (`src/design/`) and composed in `src/features/`. Persistence is Drizzle ORM + expo-sqlite (`src/data/`). The whole thing is wired through an orchestrator (`/initial-implement`) that picks the next task from a queue, dispatches subagents, runs the harness, and commits.

## Quick start

```bash
# Prerequisites: Node 22 (.nvmrc), pnpm 9.15+, bash 4+, yq v4, Xcode 26+ for iOS native builds
corepack enable && corepack prepare pnpm@latest --activate

pnpm install                                # workspace install
pnpm --filter @fivethreeone/mobile start       # boot dev client (Metro)
```

Press `i` for iOS simulator or `a` for Android emulator. A dev client build is required — see [EAS docs](https://docs.expo.dev/build/setup/) and the `eas.json` profiles (`development` / `preview` / `production`).

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

## How work happens — `/initial-implement`

Most code in this repo is written via the `/initial-implement` orchestrator. It picks the next ready task from `docs/superpowers/queue.yaml`, spawns planner → implementer → verifier → fixer → reviewer subagents, runs the full harness, squash-merges to `main`, and marks the task done.

```bash
/initial-implement                     # one ready task
/initial-implement --batch             # loop until queue empty / 2 blocked / --max-tasks
/initial-implement --batch --max-tasks 20
/initial-implement --task P2-01-program-math   # specific task
/initial-implement --retry P4-05-maestro-home  # re-run blocked task
/initial-implement --status            # print queue
```

See [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) for the full flow, and [`.claude/skills/initial-implement/`](.claude/skills/initial-implement/) for the skill's source.

## License

UNLICENSED (portfolio piece — open for inspection, not for redistribution).
