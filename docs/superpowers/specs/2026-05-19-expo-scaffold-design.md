# 531 Strength — Expo project scaffold & autonomous build harness

> Companion to `docs/DESIGN.md`. Where `DESIGN.md` defines *what* the app is, this spec defines *how* it gets built — the production stack, the architecture, the harness that catches mistakes, and the `/initial-implement` orchestrator that lets Claude work through the backlog autonomously.

**Status:** 2026-05-19 — sections approved conversationally; pending user review of this written form before transitioning to implementation planning.

---

## 1 · Goals & non-goals

### Goals
- Stand up an Expo SDK 55 (New Architecture) project structured so an AI agent can port `design-reference/` into production code without human babysitting.
- Build the harness *before* the screens: types, lints, tests, Storybook, E2E, perf budgets, observability, CI.
- Ship a `/initial-implement` skill that orchestrates subagents through a queue of leaf-level tasks, each verified against a machine-checkable Definition of Done.
- Make every change atomic, reversible, and logged.

### Non-goals (this spec)
- Implementing screens beyond Home (the pipeline-prover). Each remaining screen — Onboarding, Today × 3 variants, Live, Cycle, History, Library, Settings, PR modal — gets its own brainstorm/spec/plan cycle.
- Apple Watch app. Deferred to v2 per `DESIGN.md` §10; project structure must remain compatible.
- Auth, cloud sync, IAP, push notifications. Out of scope: this is a public free portfolio app, single-user, device-local.

### Audience
Public free release on App Store + Play Store. No monetization, no auth, no nag. Opt-in anonymous analytics. Crash reporting on.

---

## 2 · Tech stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | Expo SDK 55 (RN 0.81+, New Arch enabled) | Latest stable; Fabric + TurboModules required for Reanimated 4 / Skia perf |
| Workflow | Expo **Dev Client** (not Expo Go) | Skia, Sentry, future native modules need it |
| Language | TypeScript strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) | End-to-end type chain from DB → UI |
| Navigation | Expo Router v6 (file-based) | Wraps React Navigation; matches screen list 1:1 |
| Persistence | `expo-sqlite` + Drizzle ORM | Type-safe schema, migrations, devtools plugin |
| Prefs | `expo-sqlite/kv-store` | Sync API, replaces AsyncStorage (Expo SDK 54+ recommendation) |
| Data layer | TanStack Query | Cache, invalidation, optimistic mutations between DB and UI |
| UI state | Zustand | Tiny; modal flags, demo overrides |
| Animation | Reanimated 4 + react-native-gesture-handler | Standard for native-thread animation |
| Custom drawing | `@shopify/react-native-skia` | Plate viz (3 variants), PR confetti, watch ring |
| Haptics | `expo-haptics` | Set complete, PR detection |
| Blur | `expo-blur` | Tab bar glass effect |
| Fonts | `expo-font` + locally bundled Space Grotesk + JetBrains Mono | No runtime Google Fonts fetch |
| Crash | `@sentry/react-native` | Sourcemaps via EAS Build hooks |
| Analytics | `posthog-react-native` | Opt-in toggle, default off |
| Lint + format | Biome | Single tool, ~10× faster than ESLint + Prettier |
| Unit tests | Jest + `@testing-library/react-native` | Standard |
| Property tests | `fast-check` | Critical for plate calc + 5/3/1 math |
| E2E | Maestro | YAML flows, screenshot diff built-in |
| Component sandbox | Storybook 8 for React Native (on-device) | Reviewable visual surface |
| Perf budgets | Reassure | Tracked screens fail PR if regress >10% |
| Build / deploy | EAS Build + EAS Update + EAS Submit | Cloud builds, OTA, store delivery |
| CI | GitHub Actions | Runs full harness on every PR |
| Package mgr | pnpm + workspaces | Monorepo-ready from day one |

### Stack decisions explicitly rejected
- **Nativewind / Tailwind.** `DESIGN.md` already defines a rigid token system. A typed `tokens.ts` + `StyleSheet` is more honest about constraints than utility classes here.
- **WatermelonDB.** Overkill for a single-user offline app; Drizzle gives type safety without the sync engine we don't need.
- **react-native-mmkv (initially).** `expo-sqlite/kv-store` ships with the SDK and keeps the dependency surface smaller. Swap in MMKV later if profiling demands.
- **React Navigation directly.** Expo Router is React Navigation underneath with file-based routing on top. Lower setup cost, identical capabilities.

---

## 3 · Architecture

### Top-level layout

```
proof-531/
├── apps/
│   └── mobile/                       # Expo app (only app now; monorepo-ready)
│       ├── app/                      # expo-router file-based routes
│       │   ├── _layout.tsx           # Root: theme, query client, db migration boot
│       │   ├── (tabs)/
│       │   │   ├── _layout.tsx       # Bottom tab bar (Home/Train/Cycle/History/You)
│       │   │   ├── home.tsx
│       │   │   ├── today.tsx
│       │   │   ├── cycle.tsx
│       │   │   ├── history.tsx
│       │   │   └── settings.tsx
│       │   ├── live.tsx              # Modal: full-screen lift overlay
│       │   ├── pr.tsx                # Modal: PR celebration
│       │   ├── library.tsx           # Pushed screen
│       │   └── onboarding/
│       │       ├── _layout.tsx
│       │       ├── index.tsx         # Intro
│       │       ├── lifts.tsx         # Lift selection
│       │       ├── enter/[lift].tsx  # Per-lift entry (1RM or calc)
│       │       └── review.tsx
│       ├── src/
│       │   ├── design/               # The "PROOF" implementation
│       │   │   ├── tokens.ts         # Single source of truth (color/type/shape/motion)
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
│       │   │   ├── db/
│       │   │   │   ├── schema.ts     # Drizzle tables
│       │   │   │   ├── client.ts     # openDatabase + migrate
│       │   │   │   └── migrations/   # drizzle-kit output
│       │   │   ├── repositories/
│       │   │   └── queries/          # TanStack Query hooks
│       │   ├── features/             # Screen composition
│       │   │   ├── home/
│       │   │   ├── today/            # 3 hero variants
│       │   │   ├── live/
│       │   │   ├── cycle/
│       │   │   ├── history/
│       │   │   ├── library/
│       │   │   ├── settings/
│       │   │   └── onboarding/
│       │   ├── ui-state/             # Zustand stores
│       │   └── lib/                  # haptics, sentry init, posthog init
│       ├── assets/
│       │   ├── fonts/
│       │   └── icons/
│       ├── .storybook/
│       ├── .maestro/
│       ├── app.config.ts             # Typed Expo config
│       └── eas.json
├── packages/                         # Reserved for shared code (watch app, etc.)
├── docs/
│   ├── DESIGN.md
│   ├── ARCHITECTURE.md               # NEW
│   └── superpowers/
│       ├── specs/                    # This file + future screen specs
│       ├── queue.yaml                # Orchestrator backlog
│       └── runs/                     # Per-task run logs
├── design-reference/                 # Behavioral source of truth (don't modify)
├── .claude/
│   ├── skills/
│   │   └── initial-implement/        # The orchestrator skill
│   └── commands/
│       └── initial-implement.md
├── CLAUDE.md                         # Repo-root agent orientation
└── README.md
```

### Boundary rules

1. **`domain/` is pure.** No React imports. No async. No Drizzle. Plain functions over plain values. Property-tested with `fast-check`. 95% coverage gate.
2. **`data/` owns persistence.** Components never `import drizzle`. They call `useSession()`, `useStartSet()`, etc.
3. **`design/` owns the visual language.** `tokens.ts` is the *only* place hex/px literals exist. Every primitive consumes via `useTheme()`.
4. **`features/` is where composition happens.** Each folder mirrors a screen; routes in `app/` are thin shells importing a feature component.
5. **No barrel files for `features/` or `domain/`.** Barrels OK inside `design/primitives/`.
6. **Import direction is one-way:** `app → features → (design | data | domain)`. A lint rule enforces this.

### Why this shape
- Pure `domain/` is the surface where AI work is most reliable — pure functions, dense tests, no environmental coupling.
- The strict layering means coupling violations are caught by tooling, not code review.
- File-based routes mirror the screen list in `DESIGN.md` 1:1, so reading the codebase mirrors reading the design.

---

## 4 · The harness

Nine layers, each catching a distinct class of mistake.

### Layer 1 — Type safety
- TypeScript strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
- Drizzle generates table types → repositories return typed rows → query hooks expose typed data → screens consume typed props.
- `app.config.ts` (typed) instead of `app.json`.
- `zod` schemas at boundaries: kv reads, route params, anything crossing trust zones.

### Layer 2 — Static analysis
- Biome (lint + format), runs in pre-commit and CI.
- `tsc --noEmit` in CI.
- `expo-doctor` in CI catches drift from SDK 55 baseline.

### Layer 3 — Unit + property tests
- Jest + `@testing-library/react-native`.
- **95% coverage gate on `src/domain/`**.
- `fast-check` for plate calc and 5/3/1 math.
- Repository tests against `:memory:` SQLite.
- Component tests for primitives assert accessibility + token consumption (not pixels).

### Layer 4 — Storybook on device
- Storybook 8 for RN at a dev-only route (`/_storybook`).
- One story per primitive × variant; one per screen × demo-stage; one per plate-viz variant × weight; one per onboarding step.
- Stories are the surface against which agents verify visual work.

### Layer 5 — E2E with Maestro
- Flows in `apps/mobile/.maestro/`:
  - `onboarding.yaml`
  - `first-lift.yaml`
  - `pr.yaml`
  - `cycle-advance.yaml`
  - `single-lift.yaml`
- Screenshots committed; diffs reviewed on PR.

### Layer 6 — Perf budgets
- Reassure with budgets on Home, Today, Live.
- Skia plate-viz render budget < 4 ms.
- CI fails on >10% regression.

### Layer 7 — Crash + behavior monitoring
- Sentry from day one; sourcemaps via EAS Build hooks; auto release tags.
- PostHog opt-in (toggle in Settings, default off). Four critical events only: `onboarding_complete`, `set_completed`, `pr_detected`, `cycle_advanced`.

### Layer 8 — CI
GitHub Actions on every PR:
1. `pnpm install --frozen-lockfile`
2. `biome ci`
3. `tsc --noEmit`
4. `expo-doctor`
5. `jest --coverage` with thresholds (`domain/` ≥ 95%)
6. Dev-client build on iOS sim → Maestro flows → upload screenshots
7. Reassure vs base branch
- Branch protection: no merge without green.

### Layer 9 — Agent working agreements (`CLAUDE.md`)
- `/CLAUDE.md` — stack summary, where things live, boundary rules, dev commands, the design-reference policy ("port faithfully, do not reinvent").
- `apps/mobile/src/domain/CLAUDE.md` — "pure, no React, no async, no DB. Property tests required."
- `apps/mobile/src/design/CLAUDE.md` — "tokens only. every primitive needs a story. accessibility roles mandatory."

---

## 5 · The `/initial-implement` orchestrator

The skill that turns this spec into running code without human intervention.

### Surface

| Invocation | Behavior |
|---|---|
| `/initial-implement` | Pick next ready task. Implement, verify, fix, review, commit. Stop. |
| `/initial-implement --batch` | Loop. Stop on: queue empty, blocked task, two consecutive failures, `--max-tasks` reached, user interrupt. |
| `/initial-implement --batch --max-tasks N` | As above, ceiling N. Default 5. |
| `/initial-implement --status` | Print queue with checkboxes. No work. |
| `/initial-implement --retry <task-id>` | Reset task to `todo` and run it. |
| `/initial-implement --task <task-id>` | Run a specific task by id (must have deps satisfied). |

### Queue format (`docs/superpowers/queue.yaml`)

```yaml
version: 1
tasks:
  - id: P0-01-bootstrap
    title: Bootstrap pnpm workspace + Expo SDK 55 app
    phase: 0
    depends_on: []
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-19-expo-scaffold-design.md#71-phase-0
    done_when:
      - "pnpm install --frozen-lockfile succeeds"
      - "pnpm --filter mobile expo-doctor passes"
      - "pnpm typecheck passes"
      - "pnpm biome ci passes"
      - "apps/mobile/app/_layout.tsx exists"
    notes: |
      Use `npx create-expo-app --template default@sdk-55` inside apps/mobile.
      Configure strict TS + Biome + .nvmrc.
```

Status transitions: `todo → in_progress → done`, with `blocked` (reason) as terminal-until-retried.
A task is ready when status is `todo` AND every `depends_on` task is `done`.

### Execution flow

```
1. Read queue.yaml. Pick next ready task.
2. Mark in_progress (atomic file write + git add + commit on a meta branch).
3. Create worktree at /tmp/proof-531-<task-id> on branch auto/<task-id>.
4. Spawn PLANNER → returns numbered implementation steps.
5. Spawn IMPLEMENTER (in worktree) → executes steps.
6. Spawn VERIFIER → runs harness against done_when. Structured report.
7. If verify fails:
     spawn FIXER with diff + failures.
     re-run VERIFIER.
     bounded: max 3 fix attempts.
8. Spawn REVIEWER → reads diff against done_when. Catches scope drift.
9. If reviewer rejects: back to step 5 (max 2 review cycles).
10. Squash-merge worktree into main as `[auto] <task-id> <title>`.
    Body: done_when checklist + DoD evidence + run log link.
11. Mark task done in queue.yaml. Commit queue update.
12. If --batch: goto 1. Else stop.
```

### Subagent roles

| Role | Tools | Job | May edit? |
|---|---|---|---|
| Planner | Read, Grep, Bash (read-only) | Turn task → numbered steps using spec_ref + design-reference | No |
| Implementer | Read, Edit, Write, Bash | Execute plan in worktree | Yes |
| Verifier | Bash | Run typecheck → biome → jest → coverage → expo-doctor → maestro (if DoD asks) → reassure (if relevant) | No |
| Fixer | Read, Edit, Bash | Given failures + diff, make targeted fixes | Yes |
| Reviewer | Read, Grep, Bash (read-only) | `git diff` vs done_when; flag scope drift, dead code, hex literals, etc. | No |

Each subagent receives a context-bounded prompt: task spec, relevant files, prior subagent output. They never see full conversation history.

### Isolation

- **One worktree per task** via `superpowers:using-git-worktrees`.
- **Squash commit to main** per completed task: `[auto] <task-id> <title>`.
- Body includes the DoD checklist and a link to the run log.
- The orchestrator never force-pushes, deletes user-created branches, or amends published commits.

### Safety

- Default `--max-tasks 5` per `--batch` invocation. Override via flag, or `--unsafe-unbounded` for truly unbounded.
- **Two consecutive task failures → halt batch.** Smell test for systemic problems.
- Every subagent run logs to `docs/superpowers/runs/<task-id>/<ISO-timestamp>/`:
  - `planner.md` (steps), `implementer.diff`, `verifier.json`, `fixer.diff` (if any), `reviewer.md`
- Run logs are committed alongside the task's squash merge so history is auditable.

### Hand-off to existing skills

`/initial-implement` is glue, not a from-scratch agent:
- `superpowers:using-git-worktrees` — worktree per task
- `superpowers:subagent-driven-development` — orchestrator pattern
- `superpowers:verification-before-completion` — verifier + reviewer
- `superpowers:test-driven-development` — implementer follows TDD for logic-heavy tasks

### Smoke task (P0-99)

Final Phase 0 task: a deliberately small task that exercises the orchestrator end-to-end. Adds a no-op file, runs the full pipeline, asserts each subagent produced output, asserts the squash merge landed cleanly. If P0-99 fails, the orchestrator itself is broken and we fix that before running Phase 1.

---

## 6 · Data model (Drizzle schema sketch)

Translated from `DESIGN.md` §8 into Drizzle tables. Finalized in P3-01.

```ts
// src/data/db/schema.ts (sketch)

export const lifts = sqliteTable('lifts', {
  id: text('id').primaryKey(),                  // 'squat' | 'bench' | 'deadlift' | 'press'
  label: text('label').notNull(),
  category: text('category').notNull(),         // 'upper' | 'lower'
  trainingMax: integer('training_max').notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull(),
});

export const cycles = sqliteTable('cycles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  number: integer('number').notNull(),          // 1, 2, 3, ...
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cycleId: integer('cycle_id').references(() => cycles.id).notNull(),
  liftId: text('lift_id').references(() => lifts.id).notNull(),
  week: integer('week').notNull(),              // 1 | 2 | 3 | 4
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

export const sets = sqliteTable('sets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: integer('session_id').references(() => sessions.id).notNull(),
  index: integer('index').notNull(),            // 0, 1, 2 for main; 3-7 for BBB
  type: text('type').notNull(),                 // 'main' | 'bbb' | 'amrap'
  prescribedWeight: integer('prescribed_weight').notNull(),
  prescribedReps: integer('prescribed_reps').notNull(),
  actualReps: integer('actual_reps'),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

export const assistance = sqliteTable('assistance', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  category: text('category').notNull(),         // 'push' | 'pull' | 'legs' | 'core'
  defaultSets: integer('default_sets').notNull(),
  defaultReps: integer('default_reps').notNull(),
  favorite: integer('favorite', { mode: 'boolean' }).notNull(),
});

// Settings are kv via expo-sqlite/kv-store: units, plateSet, accentColor, restTimer, ...
```

PRs/e1RMs are computed views over `sets`, not stored — single source of truth.

---

## 7 · Sequencing (the queue, by phase)

Each phase decomposes into leaf tasks tracked in `queue.yaml`. Below is the phase summary; full task list is generated as the first deliverable of Phase 0.

### 7.1 Phase 0 — Bootstrap + orchestrator (~1.5 days)
- `P0-01` Bootstrap pnpm workspace + Expo SDK 55 app
- `P0-02` Configure TypeScript strict + Biome + .nvmrc + .editorconfig
- `P0-03` GitHub Actions baseline (install + typecheck + lint)
- `P0-04` Three `CLAUDE.md` files (root, domain, design)
- `P0-05` `/initial-implement` skill scaffold
- `P0-06` Subagent definitions (planner, implementer, verifier, fixer, reviewer)
- `P0-07` Queue file + queue parser
- `P0-08` Generate queue.yaml from this spec
- `P0-09` `docs/superpowers/runs/` log infra
- `P0-99` Orchestrator smoke task — exercises full pipeline end-to-end

### 7.2 Phase 1 — Design system (~1-2 days)
- `P1-01` Port `tokens.css` → typed `tokens.ts`
- `P1-02` `ThemeProvider` + `useTheme` + accent override
- `P1-03` Bundle Space Grotesk + JetBrains Mono via `expo-font`
- `P1-04` Primitives: `Box`, `Text`, `Caps`, `Eyebrow`, `WeightNum`
- `P1-05` `PressButton` (ember, inverse, ghost × sm/md/lg)
- `P1-06` `Card`, `SegRail`, `NumberStepper`
- `P1-07` Storybook 8 configured + dev-only route
- `P1-08` Story coverage for every primitive variant
- `P1-09` Icon set port from `components.jsx`

### 7.3 Phase 2 — Domain layer (~1 day)
- `P2-01` 5/3/1 program math (week scheme, percentages, reps, deload)
- `P2-02` `calcPlates` with bar weight + plate inventory inputs
- `P2-03` Epley e1RM + PR detection
- `P2-04` TM bump rules + cycle advance
- `P2-05` `fast-check` property tests for all of the above
- `P2-06` 95% coverage gate enforced in CI

### 7.4 Phase 3 — Data layer (~1 day)
- `P3-01` Drizzle schema + migration setup
- `P3-02` `drizzle-studio-expo` plugin
- `P3-03` Repositories: `liftRepo`, `cycleRepo`, `sessionRepo`, `setRepo`, `assistanceRepo`
- `P3-04` In-memory SQLite test harness for repos
- `P3-05` TanStack Query hooks: `useActiveCycle`, `useSession`, `useStartSet`, `useCompleteSet`, `useHistory`, `usePRStrip`
- `P3-06` Seed script for the four demo states (freshStart / midCycle / benchOnly / advanced)

### 7.5 Phase 4 — Navigation shell + Home (~1 day) — pipeline-prover
- `P4-01` Expo Router layout: root + `(tabs)` + modals + onboarding stack
- `P4-02` Tab bar component (glassy hot-on-bg-2 pill)
- `P4-03` Home screen ported from `screens-meta.jsx`
- `P4-04` Lift picker grid + cycle status pill + stats row
- `P4-05` Maestro flow `home-renders.yaml` + screenshots
- `P4-06` Storybook stories for Home × all 4 demo stages

### 7.6 Phase 5 — Plate visualization (~1 day)
- `P5-01` Skia Barbell variant
- `P5-02` Skia Chips variant
- `P5-03` Skia Numerical variant
- `P5-04` Per-variant × weight-range stories
- `P5-05` Reassure perf budget locked at < 4 ms

### 7.7 Phase 6 — Observability + delivery (~half day)
- `P6-01` Sentry wired with sourcemap upload via EAS Build hooks
- `P6-02` PostHog with opt-in toggle (stub Settings entry)
- `P6-03` `eas.json` with development, preview, production profiles
- `P6-04` First TestFlight + Internal-track build from a tagged commit

### 7.8 Phase 7 — Hand-off (~half day)
- `P7-01` `docs/ARCHITECTURE.md` distilled from this spec
- `P7-02` `docs/CONTRIBUTING.md` — how to work in this repo
- `P7-03` Queue extended with future screen tasks (Onboarding, Today × 3, Live, Cycle, History, Library, Settings, PR modal) as `todo`
- `P7-04` README written

### Backlog (post-foundation, separate specs)
Each remaining screen is its own brainstorm → spec → plan → queue addition:
- Onboarding flow (4 steps)
- Today screen × 3 hero variants (Editorial, Cards, Data)
- Live lift overlay + rest phase
- Cycle overview
- History
- Exercise library
- Settings
- PR modal
- Apple Watch (v2 — separate roadmap doc)

---

## 8 · Definitions of done (project-level)

The foundation (Phases 0-7) is complete when:
1. `pnpm install && pnpm --filter mobile typecheck && pnpm biome ci && pnpm test` all pass.
2. `pnpm --filter mobile start` boots Expo Dev Client.
3. Home screen renders against demo data on iOS and Android simulators.
4. Storybook accessible at the dev-only route with all primitive + Home stories.
5. Maestro `home-renders.yaml` flow passes on iOS sim in CI.
6. Domain coverage ≥ 95%, Skia plate-viz under 4 ms budget.
7. Sentry + PostHog initialized; first TestFlight build green.
8. `queue.yaml` shows Phases 0-7 all `done`, with backlog tasks listed `todo`.
9. `/initial-implement --status` reports the above accurately.

---

## 9 · Open questions

None blocking. Captured for visibility:

- **Parallel task execution in `--batch`?** Current spec is sequential. Could add `--parallel N` with worktrees later if it proves slow.
- **PR mode for individual tasks?** Direct-to-main with run logs is the default per user preference. A `--pr` flag could open PRs instead if desired.
- **Self-healing CI?** If CI fails after a task lands on main, should the orchestrator pick that up and create a fix task? Out of scope for foundation, easy to add later.

---

_Last updated: 2026-05-19._
