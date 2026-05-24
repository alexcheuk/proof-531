# @fivethreeone/mobile

Expo SDK 55 / React Native New Arch app — the 531 Strength tracker.

For project goals, architecture, contribution rules, and orchestrator workflow, see the [root README](../../README.md) and [CLAUDE.md](./CLAUDE.md).

## Run it

From the repo root:

```bash
pnpm install
pnpm --filter @fivethreeone/mobile start    # Metro + Expo Go QR
```

In the Expo CLI: press `i` for iOS Simulator, `a` for Android Emulator, or scan the QR with Expo Go.

## App-level scripts

```bash
pnpm --filter @fivethreeone/mobile start         # expo start
pnpm --filter @fivethreeone/mobile typecheck     # tsc --noEmit
pnpm --filter @fivethreeone/mobile lint          # biome check src
pnpm --filter @fivethreeone/mobile test          # jest
pnpm --filter @fivethreeone/mobile doctor        # expo-doctor
```

## Layout

```
src/
  app/           — expo-router routes (thin shells)
  design/        — tokens, theme, primitives (only place hex/px lives)
  domain/        — pure 5/3/1 math; no React, no async, no DB
  data/          — Drizzle ORM + accessors + TanStack Query hooks
  features/      — screen composition
  lib/           — haptics, time helpers
```

Boundary rules live in [CLAUDE.md](./CLAUDE.md). The reviewer enforces them.
