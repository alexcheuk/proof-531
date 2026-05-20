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
