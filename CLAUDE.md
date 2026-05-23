# Working in proof-531

> Welcome. Read this first.

## What this repo is

A production scaffold for **531 Strength** — a 5/3/1 + BBB training tracker for iOS and Android.
The product spec is in `docs/DESIGN.md`. The engineering spec is in `docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md`.

## Stack

- Expo SDK 55, React Native 0.83+ (New Architecture on), **Expo Go workflow** (no custom dev client)
- TypeScript strict, Biome, pnpm workspaces, Node 22
- expo-router (file-based), Drizzle ORM + expo-sqlite, TanStack Query, Zustand (only when earned)
- React Native Reanimated 4, expo-haptics, expo-blur, expo-av, expo-keep-awake
- `@gorhom/bottom-sheet` v5 for sheets; IBM Plex Sans/Mono/Sans-Condensed via expo-font
- Jest + @testing-library/react-native + fast-check (domain property tests)
- No Sentry, no PostHog, no Skia, no Storybook, no Maestro, no Reassure (all deferred until dev-client build)

## Layout

```
apps/mobile/
  src/
    app/                # expo-router routes (thin shells)
    design/             # tokens, theme, primitives (ONLY place hex/px lives)
    domain/             # pure 5/3/1 math — NO React, NO async, NO DB
    data/               # Drizzle, accessors, TanStack Query hooks
    features/           # screen composition (no barrels here)
    lib/                # haptics, time helpers
```

## Boundary rules (enforced by reviewer)

1. **`src/design/` is the only place hex/px literals live.** All others import from `tokens.ts`.
2. **`src/domain/` is pure.** No `import React`, no `async`, no Drizzle. Property-tested.
3. **`src/data/` owns persistence.** Components consume via `useSession()` etc., never `import drizzle`.
4. **`features/` is composition.** Routes in `app/` are thin shells importing feature components.
5. **No barrel files** in `features/` or `domain/`. Barrels OK inside `design/primitives/`.
6. **Import direction is one-way:** `app → features → (design | data | domain)`. Reviewer flags violations.

## Design reference

`~/Development/531-pwa` is the **behavioral source of truth** for visuals, interactions, and screen flow. When porting a screen or component, open the matching file under `~/Development/531-pwa/src/` and port faithfully — do not reinvent.

The PWA repo is **never modified** by orchestrator-run tasks. Treat it as read-only reference.

## Dev commands

```bash
pnpm install                                    # workspace install
pnpm --filter @proof-531/mobile start           # boot Expo Go (scan QR with Expo Go app)
pnpm typecheck                                  # tsc --noEmit across workspace
pnpm lint                                       # biome
pnpm test                                       # jest
pnpm expo-doctor                                # expo doctor (renamed to dodge pnpm's `doctor` builtin)
pnpm run ci                                     # full chain (use `run` — `ci` is a pnpm builtin)
```

### pnpm builtins to avoid

`pnpm doctor` and `pnpm ci` are pnpm builtins, not our scripts. Use `pnpm expo-doctor` and `pnpm run ci` instead.

### Known harness gap: Metro bundler is not exercised

`pnpm run ci` runs `typecheck && lint && test`. None of those load the Metro bundler, so a runtime npm dep that's missing from the install graph (e.g., a third-party package that declares a needed dep only as a `devDependency`) will pass CI green but break `expo start`. We hit this with `ts-dedent` (transitive of `@storybook/react-native-ui`).

If a task touches the import graph in non-trivial ways (adds a primitive that pulls in a new npm package, modifies storybook plumbing, edits route entry points), spot-check with:

```bash
pnpm --filter @proof-531/mobile exec expo export --platform ios \
  --output-dir /tmp/expo-bundle-check --dump-sourcemap=false --dump-assetmap=false
```

Exit 0 ⇒ Metro resolved every import.

### Prerequisites

- **Node 22** (pinned via `.nvmrc`)
- **pnpm 9.15+** (auto-installed via Corepack: `corepack enable && corepack prepare pnpm@latest --activate`)
- **bash 4+** for the orchestrator scripts (`mapfile`, `declare -A`). macOS ships bash 3.2 — install via `brew install bash`.
- **yq v4** (mikefarah/yq) for queue scripts: `brew install yq` on macOS, or download from https://github.com/mikefarah/yq/releases on Linux/CI.
- **Expo Go** installed on a physical device, or iOS Simulator / Android Emulator if doing JS-only work.

## How work happens

You will be invoked via `/initial-implement` (and its flags `--batch`, `--max-tasks N`, `--task <id>`, `--retry <id>`, `--status`). The skill picks the next ready task from `docs/superpowers/queue.yaml`, spawns subagents, runs the full harness, and commits.

See `.claude/skills/initial-implement/SKILL.md` for the orchestrator's full behavior. See `.claude/skills/initial-implement/queue-format.md` for the task schema.

Forbidden paths (never edit, regardless of plan): `~/Development/531-pwa/` (read-only reference), `docs/superpowers/specs/`, `docs/superpowers/plans/`. Authorized paths: any file the active plan's `## Files` section lists.

## Test discipline

- **TDD for `src/domain/`**: red → green → commit. Property tests via `fast-check` where applicable.
- **Component tests assert behavior, not pixels.** Pixels are checked via Storybook + Maestro screenshots.
- **No skipped tests** without a comment linking to a tracking issue.

## Commit discipline

- Conventional commits: `feat:`, `fix:`, `test:`, `chore:`, `docs:`.
- Orchestrator squash-merges with prefix `[auto] <task-id> <title>`.
- Direct human commits should not start with `[auto]`.
