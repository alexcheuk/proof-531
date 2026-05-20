# Architecture

A short tour of how `proof-531` is laid out and why. For the full rationale — including rejected alternatives, harness layering, and the orchestrator design — see the engineering spec at [`docs/superpowers/specs/2026-05-19-expo-scaffold-design.md`](./superpowers/specs/2026-05-19-expo-scaffold-design.md). This document is a quick reference for working in the codebase; the spec is the source of truth.

## Stack

| Layer | Choice |
|---|---|
| Runtime | Expo SDK 55, React Native 0.81+ (New Architecture on) |
| Workflow | Expo Dev Client (not Expo Go) |
| Language | TypeScript strict — `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` |
| Package manager | pnpm 9.15+ workspaces, Node 22 |
| Navigation | expo-router v6 (file-based) |
| Persistence | `expo-sqlite` + Drizzle ORM; `expo-sqlite/kv-store` for prefs |
| Data layer | TanStack Query |
| UI state | Zustand |
| Animation / drawing | Reanimated 4, react-native-gesture-handler, `@shopify/react-native-skia` |
| Haptics / blur / fonts | `expo-haptics`, `expo-blur`, `expo-font` (Space Grotesk + JetBrains Mono bundled) |
| Lint + format | Biome (single tool) |
| Tests | Jest + RTL, `fast-check` (property), Maestro (E2E), Storybook 8 for RN, Reassure (perf) |
| Observability | Sentry (always), PostHog (opt-in, default off) |
| Build / deploy | EAS Build + EAS Update + EAS Submit |
| CI | GitHub Actions |

Rejected alternatives (Nativewind, WatermelonDB, MMKV, raw React Navigation) and their reasons live in [spec §2](./superpowers/specs/2026-05-19-expo-scaffold-design.md#2--tech-stack).

## Layout

```
proof-531/
├── apps/
│   └── mobile/                       # the Expo app
│       ├── src/
│       │   ├── app/                  # expo-router routes (Expo SDK 55 src/app layout)
│       │   │   ├── _layout.tsx       # root: theme, query client, db migration boot
│       │   │   ├── (tabs)/           # Home / Train / Cycle / History / You
│       │   │   ├── live.tsx          # modal: full-screen lift overlay
│       │   │   ├── pr.tsx            # modal: PR celebration
│       │   │   ├── library.tsx       # pushed screen
│       │   │   └── onboarding/       # intro / lifts / enter / review
│       │   ├── design/               # the visual language
│       │   │   ├── tokens.ts         # single source of truth (color/type/shape/motion)
│       │   │   ├── theme.ts          # ThemeProvider + useTheme
│       │   │   ├── primitives/       # Box, Text, Caps, Eyebrow, WeightNum, PressButton, ...
│       │   │   ├── plates/           # Barbell, Chips, Numerical (Skia)
│       │   │   ├── icons/
│       │   │   └── motion/
│       │   ├── domain/               # PURE business logic — no React, no IO
│       │   │   ├── program/          # 5/3/1 math
│       │   │   ├── plates/           # calcPlates()
│       │   │   ├── e1rm/             # Epley + PR detection
│       │   │   └── progression/      # TM bump rules
│       │   ├── data/
│       │   │   ├── db/               # schema, client, migrations
│       │   │   ├── repositories/
│       │   │   └── queries/          # TanStack Query hooks
│       │   ├── features/             # screen composition
│       │   ├── ui-state/             # Zustand stores
│       │   ├── lib/                  # haptics, sentry, posthog init
│       │   ├── components/           # Expo template leftovers
│       │   ├── hooks/                # Expo template leftovers
│       │   └── constants/            # Expo template leftovers
│       ├── assets/                   # bundled fonts + icons
│       ├── .storybook/
│       ├── .maestro/
│       ├── app.config.ts             # typed Expo config (not app.json)
│       └── eas.json
├── packages/                         # reserved for shared code (e.g. future watch app)
├── docs/
│   ├── DESIGN.md                     # product spec (what)
│   ├── ARCHITECTURE.md               # this file
│   └── superpowers/
│       ├── specs/                    # engineering specs
│       ├── plans/                    # per-task plans
│       ├── queue.yaml                # orchestrator backlog
│       └── runs/                     # per-task run logs
├── design-reference/                 # behavioral source of truth for visuals — never modified
├── .claude/                          # orchestrator skill, subagent prompts, commands
├── CLAUDE.md                         # repo-root agent orientation
└── README.md
```

See [spec §3 — Architecture](./superpowers/specs/2026-05-19-expo-scaffold-design.md#3--architecture) for the long-form rationale.

## Boundary rules

These are enforced by lint rules and the reviewer subagent. Violating them blocks merge.

1. **`src/design/` is the only place hex/px literals live.** Every other layer imports from `tokens.ts` via `useTheme()`.
2. **`src/domain/` is pure.** No `import React`, no `async`, no Drizzle, no IO. Plain functions over plain values. Property-tested with `fast-check`. 95% coverage gate.
3. **`src/data/` owns persistence.** Components never `import drizzle`. They call hooks like `useSession()`, `useStartSet()`, `useCompleteSet()`.
4. **`features/` is composition.** Each folder mirrors a screen. Routes in `src/app/` are thin shells importing a feature component.
5. **No barrel files** in `features/` or `domain/`. Barrels are OK inside `design/primitives/`.
6. **Import direction is one-way:** `app → features → (design | data | domain)`. No reverse edges.

The shape exists because pure `domain/` is the surface where AI work is most reliable — dense tests, no environmental coupling — and the strict layering means coupling violations are caught by tooling, not code review.

## Tests

Nine harness layers in total ([spec §4](./superpowers/specs/2026-05-19-expo-scaffold-design.md#4--the-harness)); the test-facing ones are:

- **Unit + property** — Jest + `@testing-library/react-native`, `fast-check` for plate calc and 5/3/1 math. 95% coverage gate on `src/domain/`.
- **Repository tests** — against `:memory:` SQLite.
- **Component tests** — assert accessibility roles and token consumption, not pixels.
- **Storybook on device** — one story per primitive × variant, per screen × demo stage, per plate-viz variant × weight. Visible at a dev-only route. The surface against which agents verify visual work.
- **E2E** — Maestro flows in `apps/mobile/.maestro/` (`onboarding`, `first-lift`, `pr`, `cycle-advance`, `single-lift`). Screenshots committed; diffs reviewed on PR.
- **Perf** — Reassure budgets on Home, Today, Live. Skia plate-viz render < 4 ms. CI fails on >10% regression.

Tests are TDD-discipline for `src/domain/` (red → green → commit). Skipped tests must link to a tracking issue in a comment.

## Build & release

EAS Build with three profiles ([spec §2](./superpowers/specs/2026-05-19-expo-scaffold-design.md#2--tech-stack), [§7.7](./superpowers/specs/2026-05-19-expo-scaffold-design.md#77-phase-6--observability--delivery-half-day)):

- **development** — internal distribution, dev client, simulators and devices.
- **preview** — internal distribution, production-like, used for TestFlight + Play Internal track.
- **production** — store submission via EAS Submit.

OTA updates via EAS Update. Sourcemaps are uploaded to Sentry by an EAS Build hook and tagged with the release. No release happens off a non-green CI pipeline.

## Observability

- **Sentry** is wired from day one. Sourcemaps uploaded via EAS Build hooks; releases auto-tagged.
- **PostHog** is opt-in. The toggle lives in Settings, defaults to off. Only four events are emitted: `onboarding_complete`, `set_completed`, `pr_detected`, `cycle_advanced`.

No third-party analytics or tracking otherwise. This is a free portfolio app — no auth, no IAP, no push, no cloud sync.

## CI

GitHub Actions on every PR ([spec §4 layer 8](./superpowers/specs/2026-05-19-expo-scaffold-design.md#4--the-harness)):

1. `pnpm install --frozen-lockfile`
2. `biome ci`
3. `tsc --noEmit`
4. `expo-doctor`
5. `jest --coverage` (with `domain/` ≥ 95% threshold)
6. Dev-client build on iOS sim → Maestro flows → upload screenshots
7. Reassure vs base branch

Branch protection: no merge without green.

## How work happens

Tasks are queued in `docs/superpowers/queue.yaml` and executed by the `/initial-implement` orchestrator, which spawns five subagents per task (planner, implementer, verifier, fixer, reviewer) inside a per-task git worktree, then squash-merges to `main` as `[auto] <task-id> <title>`. Full details in [spec §5](./superpowers/specs/2026-05-19-expo-scaffold-design.md#5--the-initial-implement-orchestrator) and `.claude/skills/initial-implement/SKILL.md`.

Forbidden paths for orchestrator-run tasks: `design-reference/`, `docs/superpowers/specs/`, `docs/superpowers/plans/`. The `design-reference/` directory is the behavioral source of truth for visuals — port faithfully, do not reinvent.

## See also

- [`docs/DESIGN.md`](./DESIGN.md) — product spec (what the app is)
- [`docs/superpowers/specs/2026-05-19-expo-scaffold-design.md`](./superpowers/specs/2026-05-19-expo-scaffold-design.md) — engineering spec (how it gets built)
- [`CLAUDE.md`](../CLAUDE.md) — agent orientation (boundary rules, dev commands)
- [`apps/mobile/src/domain/CLAUDE.md`](../apps/mobile/src/domain/CLAUDE.md) — domain-layer rules
- [`apps/mobile/src/design/CLAUDE.md`](../apps/mobile/src/design/CLAUDE.md) — design-system rules
