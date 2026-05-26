# Working in 531

> Welcome. Read this first.

## What this repo is

A production scaffold for **531 Strength** — a 5/3/1 + BBB training tracker for iOS and Android.
The product spec is in `docs/DESIGN.md`. The engineering spec is in `docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md`.

**The product vision lives in `docs/INTENT.md`.** It is a **drift check** — re-read it when a proposed change feels like it might be pulling the app sideways from what the user wants it to be (audience, aesthetic, scope, or the integrity of the vibe-coded experiment). It is *not* a brief for the blog or marketing site; those are downstream artifacts. Most decisions don't need this file. The ones that do, need it badly.

## Stack

- Expo SDK 55, React Native 0.83+ (New Architecture on), **Expo Go workflow** (no custom dev client)
- TypeScript strict, Biome, pnpm workspaces, Node 22
- expo-router (file-based), Drizzle ORM + expo-sqlite, TanStack Query
- React Native Reanimated 4, expo-haptics, expo-keep-awake
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
pnpm --filter @fivethreeone/mobile start           # boot Expo Go (scan QR with Expo Go app)
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
pnpm --filter @fivethreeone/mobile exec expo export --platform ios \
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

There are two entry points, each with its own orchestrator. Pick the one that matches the input.

### Idea-driven entry: `rn-expo-pipeline`

**Goal:** take an idea, description, or wireframe → coordinated design / frontend / QA team → PR-ready commit on `feat/<slug>`.

**Trigger:** when the user describes a new feature, attaches a wireframe, says "port / build / add / implement X", or asks the design+frontend+QA team to ship a feature end-to-end. Also handles follow-ups ("revise the spec", "fix the QA findings", "re-run QA only"). Use the `rn-expo-pipeline` skill — do not bypass.

Team: `rn-designer` → `rn-frontend` → `rn-qa` (agent team mode). Audit trail in `_workspace/`. The orchestrator commits but does not push, PR, or merge.

### Queue-driven entry: `initial-implement`

**Goal:** drain `docs/superpowers/queue.yaml` autonomously when a plan already exists.

Invoked via `/initial-implement` (and its flags `--batch`, `--max-tasks N`, `--task <id>`, `--retry <id>`, `--status`). Spawns planner/implementer/verifier/fixer/reviewer subagents, runs the full harness, squash-merges to main.

See `.claude/skills/initial-implement/SKILL.md` for the orchestrator's full behavior. See `.claude/skills/initial-implement/queue-format.md` for the task schema.

### Forbidden paths

Never edit, regardless of plan: `~/Development/531-pwa/` (read-only reference), `docs/superpowers/specs/`, `docs/superpowers/plans/`. Authorized paths: any file the active plan's `## Files` section lists.

## Harness: rn-expo (design + frontend + QA pipeline)

**Goal:** ship a 531 feature end-to-end (idea → PR-ready commit) via a coordinated design/frontend/QA agent team.

**Trigger:** any feature work originating from an idea, description, or wireframe — use the `rn-expo-pipeline` skill. Queue-driven work continues to use `initial-implement`. Simple questions and small fixes do not need the pipeline.

**Components:** agents at `.claude/agents/{rn-designer,rn-frontend,rn-qa}.md`; role skills at `.claude/skills/{rn-design-spec,rn-feature-implementation,rn-feature-qa}/`; orchestrator at `.claude/skills/rn-expo-pipeline/`.

**Change log:**

| Date | Change | Target | Reason |
|------|--------|--------|--------|
| 2026-05-23 | Initial build — designer/frontend/QA team + role skills + orchestrator | `.claude/agents/`, `.claude/skills/` | New harness request |

## Decision log

`docs/decision-log.md` is an append-only record of notable decisions made in this repo. It is the primary source the dev-blog persona ([[dev-blog-persona|Verso]], since 2026-05-26; Margin held the seat before) reads when writing posts — without it, posts have to be reverse-engineered from diffs and lose the *why*.

**When you make a notable decision in any session — loop or ad-hoc — append an entry before the work is done.** Notable = anything a future reader would want context on: new/removed skills, harnesses, agents, conventions; architectural calls; process changes; bug post-mortems worth remembering; a path considered and rejected. Routine fixes, single-line edits, and anything obvious from the diff alone do NOT belong.

Entry format and examples live in `docs/decision-log.md` itself. Append new entries at the top under `## Entries`. Keep them short — depth lives in the eventual blog post.

If you're unsure whether something is notable, log it. Verso can ignore an entry that turns out to be noise; Verso cannot recover a decision that was never written down.

## Dev blog

Posts under `apps/web/src/content/blog/` are written by the **`verso` agent**, commissioned via the **`post-as-verso` skill**. This is the canonical and only entry point — direct `Write` calls on blog files are not the way, because the skill is what guarantees voice continuity, frontmatter-schema validity, the build check, and bit continuity (no repeating a meta-beat across consecutive posts).

When to invoke `post-as-verso`:

- At the end of any `/loop` iteration (`/auto-improve`, `/initial-implement`, `rn-expo-pipeline`) once the harness is green and the diff is staged — the post ships in the same commit as the code.
- Off-cycle, when an ad-hoc session produced a real decision or learning worth recording (Alex shifting blog direction, a meaningful judgment call). Bar: "Verso would have something to say."

The skill expects the caller to assemble inputs (what shipped, loop metadata, Discord prompts, any notes) and to handle the commit. It does NOT commit, push, or open a PR — that's the caller's job, so the post can land atomically with the code it describes.

The persona's voice rules, beat menu, and operating context live in `loop-memory/04-dev-blog-persona.md`, `loop-memory/03-dev-blog.md`, and `loop-memory/notes-from-alex.md`. Change those if the voice or rules need to shift; the agent reads them fresh on every invocation.

## Test discipline

- **TDD for `src/domain/`**: red → green → commit. Property tests via `fast-check` where applicable.
- **Component tests assert behavior, not pixels.** Visual fidelity is checked manually against the PWA (screenshot pairs attached to each PR — see spec §7).
- **No skipped tests** without a comment linking to a tracking issue.

## Commit discipline

- Conventional commits: `feat:`, `fix:`, `test:`, `chore:`, `docs:`.
- Orchestrator squash-merges with prefix `[auto] <task-id> <title>`.
- Direct human commits should not start with `[auto]`.
