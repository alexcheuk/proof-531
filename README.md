# 531 Strength

A free, local-first 5/3/1 + BBB strength training tracker for iOS and Android. No account. No ads. No data leaves your phone. Built with Expo SDK 55, React Native New Architecture, and a 30-minute Claude agent loop.

- **App**: [531.dev](https://531.dev)
- **Dev blog**: [531.dev/blog](https://531.dev/blog)
- **How it's built**: [531.dev/process](https://531.dev/process)
- **Changelog**: [`CHANGELOG.md`](./CHANGELOG.md)
- **Privacy policy**: [`docs/PRIVACY.md`](./docs/PRIVACY.md) — SQLite on-device, zero telemetry.

## What it is

A focused 5/3/1 training log for Jim Wendler's 5/3/1 program. Enter your training maxes, follow the program, log your AMRAP sets, run the Boring But Big (BBB) accessory work. The math handles the rest — percentages, plate calculator, cycle progression, PR tracking, lbs/kg support.

Everything stays on your device. No account required. No subscription. No data collection.

The code is split into four clean layers: pure domain math (`src/domain/`), persistence via Drizzle ORM + expo-sqlite (`src/data/`), a typed design system (`src/design/`), and feature composition (`src/features/`). Most of it is built by a Claude coding agent running on a 30-minute cron — see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and the [dev blog](https://531.dev/blog) for what that looks like in practice. The agent loop has run 36+ iterations; everything you see is the product of 30-minute autonomous sessions committing real code.

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
