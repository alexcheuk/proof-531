# 531 Strength

A 5/3/1 + Boring But Big training tracker for iOS and Android. Built with Expo SDK 55, React Native New Architecture, and a 30-minute Claude agent loop. Source available.

- **App**: [531.dev](https://531.dev)
- **Dev blog**: [531.dev/blog](https://531.dev/blog)
- **Changelog**: [`CHANGELOG.md`](./CHANGELOG.md)
- **Privacy policy**: [`docs/PRIVACY.md`](./docs/PRIVACY.md) — local-only, no tracking.

## What it is

A focused 5/3/1 training log. Enter your training maxes, follow the program, log your AMRAP sets. The math handles the rest — percentages, plate calculator, cycle progression, PR tracking.

The code is split into four clean layers: pure domain math (`src/domain/`), persistence via Drizzle ORM + expo-sqlite (`src/data/`), a typed design system (`src/design/`), and feature composition (`src/features/`). Most of it is built by a Claude coding agent running on a cron — see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and the [dev blog](https://531.dev/blog) for what that looks like in practice.

## Quick start

```bash
# Prerequisites: Node 22 (.nvmrc), pnpm 9.15+
corepack enable && corepack prepare pnpm@latest --activate

pnpm install                                    # workspace install
pnpm build:dev                                  # build the dev client APK (needs Android SDK + JDK 17)
# OR: eas build --profile development -p android  # build in the cloud (needs `eas login`)

pnpm --filter @fivethreeone/mobile start        # boot Metro, connect the dev-client APK
```

This project uses a **custom dev client** (built with `expo-dev-client`). Expo Go cannot run it — native modules like `expo-notifications` are absent there. Install the dev client APK on a device or emulator, then connect via Metro. The dev client only needs to be rebuilt when native modules change; JS/TS edits hot-reload over the running client.

### Daily commands

```bash
pnpm typecheck                              # tsc --noEmit across workspace
pnpm lint                                   # biome
pnpm test                                   # jest
pnpm expo-doctor                            # expo doctor (renamed to dodge pnpm's `doctor` builtin)
pnpm run ci                                 # full chain (use `run` — `ci` is also a pnpm builtin)
pnpm verify                                 # ci + Metro bundle check + web build
```

## Documentation

| Doc | Purpose |
|---|---|
| [`docs/DESIGN.md`](docs/DESIGN.md) | Product + visual design spec |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Stack, layout, boundary rules |
| [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) | How to add a task, run the orchestrator, conventional commits |
| [`docs/decision-log.md`](docs/decision-log.md) | Notable decisions and why they were made |
| [`CLAUDE.md`](CLAUDE.md) | Agent orientation — start here if you're a Claude agent |

## How work happens

The primary day-to-day driver is the `/auto-improve` loop — a Claude agent running on a 30-minute cron that reads the task queue, picks 12–15 items to improve, ships them, and writes a dev-blog post about what changed. The loop is fully automated; the agent does the design, implementation, QA, and publishing in one go.

For new features, the `rn-expo-pipeline` skill runs a coordinated `rn-designer` → `rn-frontend` → `rn-qa` agent team and produces a PR-ready commit.

See [`.claude/skills/`](.claude/skills/) for the orchestrator source and [`loop-memory/`](loop-memory/) for the loop's cross-iteration memory.

## Note on the PWA reference

Some internal docs (particularly in `docs/superpowers/`) reference `~/Development/531-pwa` — a separate web app that served as the behavioral reference during the initial port. That directory is not part of this repository. For current design work, the running mobile app itself is the reference.

## License

Source available — free to run for personal use; redistribution and commercial use require explicit permission. See [`LICENSE`](./LICENSE) for the full terms and [`docs/PRIVACY.md`](docs/PRIVACY.md) for data handling.
