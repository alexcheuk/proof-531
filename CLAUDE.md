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
  src/
    app/                # expo-router routes (thin shells) — Expo SDK 55 src/app layout
    design/             # tokens, theme, primitives, plates, icons, motion
    domain/             # pure business logic — NO React, NO async, NO DB
    data/               # Drizzle, repos, query hooks
    features/           # screen composition
    ui-state/           # Zustand
    lib/                # haptics/sentry/posthog init
    components/         # Expo template leftovers (themed-text, app-tabs, etc.)
    hooks/              # Expo template leftovers
    constants/          # Expo template leftovers
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
pnpm expo-doctor                                # expo doctor (renamed to dodge pnpm's `doctor` builtin)
pnpm run ci                                     # full chain (use `run` — `ci` is a pnpm builtin)
```

### pnpm builtins to avoid

`pnpm doctor` and `pnpm ci` are pnpm builtins, not our scripts. Use `pnpm expo-doctor` and `pnpm run ci` instead.

### Prerequisites

- **Node 22** (pinned via `.nvmrc`)
- **pnpm 9.15+** (auto-installed via Corepack: `corepack enable && corepack prepare pnpm@latest --activate`)
- **bash 4+** for the orchestrator scripts (`mapfile`, `declare -A`). macOS ships bash 3.2 — install via `brew install bash`.
- **yq v4** (mikefarah/yq) for queue scripts: `brew install yq` on macOS, or download from https://github.com/mikefarah/yq/releases on Linux/CI.
- **Xcode 26+** for iOS native builds (current spec target SDK 55). JS-only dev works without it.

## How work happens

You will be invoked via `/initial-implement` (and its flags `--batch`, `--max-tasks N`, `--task <id>`, `--retry <id>`, `--status`). The skill picks the next ready task from `docs/superpowers/queue.yaml`, spawns subagents, runs the full harness, and commits.

See `.claude/skills/initial-implement/SKILL.md` for the orchestrator's full behavior. See `.claude/skills/initial-implement/queue-format.md` for the task schema.

Forbidden paths (never edit, regardless of plan): `design-reference/`, `docs/superpowers/specs/`, `docs/superpowers/plans/`. Authorized paths: any file the active plan's `## Files` section lists.

## Test discipline

- **TDD for `src/domain/`**: red → green → commit. Property tests via `fast-check` where applicable.
- **Component tests assert behavior, not pixels.** Pixels are checked via Storybook + Maestro screenshots.
- **No skipped tests** without a comment linking to a tracking issue.

## Commit discipline

- Conventional commits: `feat:`, `fix:`, `test:`, `chore:`, `docs:`.
- Orchestrator squash-merges with prefix `[auto] <task-id> <title>`.
- Direct human commits should not start with `[auto]`.
