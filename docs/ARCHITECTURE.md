# Architecture

A short tour of how `531` is laid out and why. For the full rationale — including rejected alternatives, harness layering, and the orchestrator design — see the engineering spec at [`docs/superpowers/specs/2026-05-19-expo-scaffold-design.md`](./superpowers/specs/2026-05-19-expo-scaffold-design.md). This document is a quick reference for working in the codebase; the spec is the source of truth for *intent*. `CLAUDE.md` at the repo root is the source of truth for *what's actually shipped today*.

> **Status note (2026-05-28).** Phase A of the build pivoted from the original
> spec's full Skia + Storybook + Maestro + Sentry + PostHog stack to a leaner
> dev-client workflow without those harnesses. A custom dev client is required
> (Expo Go cannot run `expo-notifications` on Android). See `CLAUDE.md` for
> the canonical short list.

## Stack

| Layer | Choice |
|---|---|
| Runtime | Expo SDK 55, React Native 0.83+ (New Architecture on) |
| Workflow | **Custom dev client** (`expo-dev-client`; Expo Go retired 2026-05-28) |
| Language | TypeScript strict — `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` |
| Package manager | pnpm 9.15+ workspaces, Node 22 |
| Navigation | expo-router (file-based) |
| Persistence | `expo-sqlite` + Drizzle ORM |
| Data layer | TanStack Query |
| UI state | React state + module-level subjects via `useSyncExternalStore`; no Zustand (removed loop-043) |
| Animation | Reanimated 4 + react-native-gesture-handler (no Skia — deferred until dev-client build) |
| Haptics / fonts / notifications | `expo-haptics`, `expo-keep-awake`, `expo-font` (IBM Plex Sans / Mono / Sans-Condensed bundled), `expo-notifications` (rest-timer background alerts) |
| Sheets | `@gorhom/bottom-sheet` v5 |
| Lint + format | Biome (single tool) |
| Tests | Jest + `@testing-library/react-native`, `fast-check` (domain property tests). No E2E / Storybook / Reassure yet (deferred). |
| Observability | None shipped — Sentry + PostHog are deferred. |
| Build / deploy | EAS Update for OTA; EAS Build for store APKs/IPAs when needed |
| CI | GitHub Actions |

Rejected alternatives (Nativewind, WatermelonDB, MMKV, raw React Navigation) and their reasons live in [spec §2](./superpowers/specs/2026-05-19-expo-scaffold-design.md#2--tech-stack).

## Layout

```
531/
├── apps/
│   ├── mobile/                       # the Expo app
│   │   ├── src/
│   │   │   ├── app/                  # expo-router routes (thin shells)
│   │   │   │   ├── _layout.tsx       # root: theme, query client, db migration boot
│   │   │   │   ├── (tabs)/           # Today / Progress / History / Settings
│   │   │   │   ├── session/          # today / live / bbb / pr-celebration / complete
│   │   │   │   └── onboarding.tsx    # single-screen onboarding flow
│   │   │   ├── design/               # tokens, theme, primitives (ONLY place hex/px lives)
│   │   │   ├── domain/               # PURE 5/3/1 math + helpers — no React, no async, no DB
│   │   │   ├── data/                 # Drizzle accessors + TanStack Query hooks
│   │   │   │   ├── accessors/        # raw DB reads/writes
│   │   │   │   ├── drizzle/          # schema, client, runMigrations
│   │   │   │   └── queries/          # query-key + hook layer
│   │   │   ├── features/             # screen composition (no barrels)
│   │   │   └── lib/                  # haptics, time helpers, etc.
│   │   ├── assets/                   # bundled fonts (IBM Plex) + icons
│   │   ├── app.json
│   │   └── eas.json
│   └── web/                          # Astro marketing + dev-log site
│       └── src/                      # pages, layouts, components, blog content
├── docs/
│   ├── DESIGN.md                     # product spec (what)
│   ├── ARCHITECTURE.md               # this file
│   ├── INTENT.md                     # vision + drift-check
│   ├── decision-log.md               # what we decided and why
│   └── superpowers/
│       ├── specs/                    # engineering specs (read-only to orchestrators)
│       ├── plans/                    # per-task plans (read-only to orchestrators)
│       └── queue.yaml                # orchestrator backlog
├── loop-memory/                      # /auto-improve loop's cross-iteration memory
├── .claude/                          # skills, subagents, slash commands
├── CLAUDE.md                         # repo-root agent orientation
└── README.md
```

The original port referenced `~/Development/531-pwa/` (a local PWA) as the visual and behavioral source of truth. That port is complete — the mobile app is now self-referential. The PWA directory is not part of this repository and will not exist on contributor machines.

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

- **Unit + property** — Jest + `@testing-library/react-native`, `fast-check` for plate calc and 5/3/1 math. The original spec set a 95% coverage gate on `src/domain/`; the current harness runs the suite without enforcing the threshold (the gate is deferred along with the broader CI build).
- **Accessor tests** — Drizzle accessors run against a `:memory:` better-sqlite3 driver so test code can call the real query API without an Expo runtime.
- **Component tests** — assert behavior and accessibility roles, not pixels. Visual fidelity is checked manually against the PWA reference (screenshot pairs attached to each PR — see spec §7).
- **Bundle resolution** — `pnpm bundle-check` runs `expo export --platform ios` to spot-check that every import resolves in Metro; this gate exists because `pnpm test` doesn't exercise the bundler and a missing transitive dep can pass test green while breaking `expo start`.

Deferred until a dev-client build is needed: Storybook on device, Maestro E2E flows, Reassure perf budgets.

Tests are TDD-discipline for `src/domain/` (red → green → commit). Skipped tests must link to a tracking issue in a comment.

## Build & release

OTA updates are the day-to-day delivery channel, shipped via EAS Update on every loop. The wrapper script is `pnpm release-ota` (run from the repo root); it calls `eas update --branch main --platform android --environment production --non-interactive` with the commit subject as the message. `runtimeVersion: { policy: "fingerprint" }` means changes to native deps (adding/removing a module with autolinked code) advance the runtime version — existing installs stay on the prior OTA until a fresh native build ships.

EAS Build profiles in `eas.json` (development / preview / production) build APKs or IPAs for each track. The dev-client profile produces the `expo-dev-client` APK needed for local development. Preview and production are for store distribution.

## Observability

None shipped. Sentry and PostHog are deferred. This is a free, local-first app — no auth, no IAP, no cloud sync.

## CI

GitHub Actions on every PR:

1. `pnpm install --frozen-lockfile`
2. `biome ci`
3. `tsc --noEmit` (root + all workspaces)
4. `pnpm check-boundaries` (hex outside `src/design/`, React/async in `src/domain/`, Drizzle outside `src/data/`)
5. `pnpm check-line-heights` (fontSize + lineHeight pairs — catches clipped descenders before a screenshot PR)
6. `pnpm check-temp-markers` (TEMP:/FIXME markers left in non-test files)
7. `expo-doctor`
8. `jest`
9. `pnpm bundle-check` (Metro export, catches missing transitive deps that `jest` doesn't)
10. `pnpm --filter @fivethreeone/web build` (Astro static-build smoke)

Maestro flows + Reassure regression checks are deferred.

Branch protection: no merge without green.

## How work happens

Three entry points, each with its own orchestrator:

- **`/auto-improve`** — the standing 30-minute loop. Polls Discord `#task-queue`, picks queue items + at least one item per category from `loop-memory/loop-criteria.md`, ships them, commits, pushes, ships an OTA. Pacing rules in `loop-memory/00-loop-pacing.md`.
- **`rn-expo-pipeline`** — idea-driven feature work. A coordinated design / frontend / QA team (`rn-designer` → `rn-frontend` → `rn-qa`) takes an idea or wireframe and produces a PR-ready commit on `feat/<slug>`.
- **`/initial-implement`** — queue-driven backlog drain. Picks the next ready task from `docs/superpowers/queue.yaml`, spawns planner → implementer → verifier → fixer → reviewer subagents inside a per-task git worktree, then squash-merges to `main` as `[auto] <task-id> <title>`. Used when a spec + plan already exist.

Forbidden paths for orchestrator-run tasks: `docs/superpowers/specs/`, `docs/superpowers/plans/`. The running mobile app itself is the behavioral reference for any new work — port the existing interaction model faithfully, do not reinvent.

## See also

- [`docs/DESIGN.md`](./DESIGN.md) — product spec (what the app is)
- [`docs/superpowers/specs/2026-05-19-expo-scaffold-design.md`](./superpowers/specs/2026-05-19-expo-scaffold-design.md) — engineering spec (how it gets built)
- [`CLAUDE.md`](../CLAUDE.md) — agent orientation (boundary rules, dev commands)
- [`apps/mobile/src/domain/CLAUDE.md`](../apps/mobile/src/domain/CLAUDE.md) — domain-layer rules
- [`apps/mobile/src/design/CLAUDE.md`](../apps/mobile/src/design/CLAUDE.md) — design-system rules
