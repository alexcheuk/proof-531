# Working in 531

> Welcome. Read this first.

## What this repo is

A production scaffold for **531 Strength** — a 5/3/1 + BBB training tracker for iOS and Android.
The product spec is in `docs/DESIGN.md`. The engineering spec is in `docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md`.

The companion marketing site + dev blog (`apps/web/`) is deployed at **https://531strength.com**. That is the canonical production domain — set as `const SITE` in `apps/web/astro.config.mjs`, which drives `context.site` for canonical URLs, the sitemap, and the RSS/OPML feeds. Anything that emits an absolute URL should read `context.site` rather than hardcode, and default fallbacks to `https://531strength.com` (older config used a `531.dev` placeholder — not the live domain).

**The product vision lives in `docs/INTENT.md`.** It is a **drift check** — re-read it when a proposed change feels like it might be pulling the app sideways from what the user wants it to be (audience, aesthetic, scope, or the integrity of the vibe-coded experiment). It is *not* a brief for the blog or marketing site; those are downstream artifacts. Most decisions don't need this file. The ones that do, need it badly.

## Stack

- Expo SDK 55, React Native 0.83+ (New Architecture on), **custom dev-client workflow** (`expo-dev-client`; Expo Go was retired 2026-05-28 because it can't run native modules like notifications on Android)
- TypeScript strict, Biome, pnpm workspaces, Node 22
- expo-router (file-based), Drizzle ORM + expo-sqlite, TanStack Query
- React Native Reanimated 4, expo-haptics, expo-keep-awake
- Notifications: `expo-notifications` (iOS scheduled "Rest complete"); `react-native-notify-kit` (notifee successor) for the Android live rest-countdown chronometer notification
- `@gorhom/bottom-sheet` v5 for sheets; IBM Plex Sans/Mono/Sans-Condensed via expo-font
- Jest + @testing-library/react-native + fast-check (domain property tests)
- No Sentry, no PostHog, no Skia, no Storybook, no Reassure (deferred). Maestro e2e is adopted — flows live in `.maestro/flows/` (onboarding, home navigation, begin-session, settings smoke tests). Reassure perf tests remain deferred.

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

The **running mobile app** is the behavioral source of truth for all current work. When making a visual or interaction change, look at the matching live screen and port faithfully — do not reinvent.

The original port was from a local PWA (`~/Development/531-pwa`) that served as the reference during the initial build. That directory is not part of this repository and won't exist on external contributors' machines. The port is complete; the mobile app is now self-referential.

## Dev commands

```bash
pnpm install                                    # workspace install
eas build --profile development -p android      # build the dev client in the cloud (needs `eas login`)
pnpm build:dev                                  # OR build it locally → apps/mobile/531-dev.apk (needs Android SDK + JDK 17)
pnpm build:prod                                 # local release-signed APK → apps/mobile/531-prod.apk (production-apk profile, for on-device QA)
pnpm --filter @fivethreeone/mobile start           # Metro for the dev client (sets APP_VARIANT=development, --dev-client)
pnpm typecheck                                  # tsc --noEmit across workspace
pnpm lint                                       # biome
pnpm test                                       # jest
pnpm expo-doctor                                # expo doctor (renamed to dodge pnpm's `doctor` builtin)
pnpm run ci                                     # full chain (use `run` — `ci` is a pnpm builtin)
```

The dev client is a real native build (the `development` profile in `eas.json`), so it must be rebuilt only when native modules change (a new `expo-*` package, a config-plugin change). Pure JS/TS edits hot-reload over `--dev-client` with no rebuild.

### pnpm builtins to avoid

`pnpm doctor` and `pnpm ci` are pnpm builtins, not our scripts. Use `pnpm expo-doctor` and `pnpm run ci` instead.

### Known harness gap: Metro bundler is not exercised

`pnpm run ci` runs `typecheck && lint && check-boundaries && check-line-heights && check-temp-markers && test`. None of those load the Metro bundler, so a runtime npm dep that's missing from the install graph (e.g., a third-party package that declares a needed dep only as a `devDependency`) will pass CI green but break `expo start`. We hit this with `ts-dedent` (transitive of `@storybook/react-native-ui`).

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
- A **custom dev-client build** installed on a physical device or simulator/emulator (`eas build --profile development`). Expo Go no longer runs this app: native modules (notifications) are absent there, and on Android importing them throws.

## How work happens

There are two entry points, each with its own orchestrator. Pick the one that matches the input.

### Idea-driven entry: `rn-expo-pipeline`

**Goal:** take an idea, description, or wireframe → coordinated design / frontend / QA team → PR-ready commit on `feat/<slug>`.

**Trigger:** when the user describes a new feature, attaches a wireframe, says "port / build / add / implement X", or asks the design+frontend+QA team to ship a feature end-to-end. Also handles follow-ups ("revise the spec", "fix the QA findings", "re-run QA only"). Use the `rn-expo-pipeline` skill — do not bypass.

Team: `rn-designer` → `rn-frontend` → `rn-qa` (agent team mode). Audit trail in `_workspace/`. The orchestrator commits but does not push, PR, or merge.

### Autonomous improvement loop: `do-work`

**Goal:** drive the app toward its SOUL through whatever work matters most, every iteration, unattended.

Invoked via `/do-work` (directly or under `/loop`, e.g. `/loop 30m /do-work`). Each tick orients on `do-work/SOUL.md` + `do-work/DOCTRINE.md` + the work-graph (`do-work/work/backlog.md`), prioritizes by the impact rubric, covers the `loop-memory/loop-criteria.md` categories, ships 12 to 15 substantive items end-to-end, and never claims an item done without the proof its type requires. It pulls Discord `#task-queue`, reads `#loop-criteria` pins and `#needs-input` answers, commits and pushes (OTA on CI), posts a `#auto-improvements` summary, and commissions the Expedition field-log as a downstream side-effect. Self-edits are scoped: `loop-memory/` learnings and the backlog are free; `do-work/SOUL.md`, `do-work/DOCTRINE.md`, and the skill itself go through the `do-work-auditor`.

See `.claude/skills/do-work/SKILL.md` for the full seven-phase tick. (`/auto-improve` is a deprecated alias that redirects here.) The earlier `queue.yaml` + `initial-implement` five-subagent pipeline was retired on 2026-06-01 once the queue fully drained; it now lives under `docs/_retired/`.

### Forbidden paths

Never edit, regardless of plan: `docs/superpowers/specs/`, `docs/superpowers/plans/`. Authorized paths: any file the active plan's `## Files` section lists.

### Skill scoping

- **`frontend-design`** (Anthropic) is scoped to `apps/web/` (the marketing site) only. Its own SKILL.md mandates "BOLD aesthetic direction" — brutalism, maximalist chaos, experimental typography — which directly conflicts with the e-ink monochrome system the mobile app is locked into. **Do not invoke `frontend-design` for any work under `apps/mobile/`**; use `rn-designer` (via the `rn-expo-pipeline` skill) instead. For `apps/web/` it remains available.
- **`vercel-react-native-skills`** (vendored at `.claude/skills/vercel-react-native-skills/`) is the RN/Expo runtime-quality reference. `rn-frontend` consults it during implementation, `rn-qa` consults it during audit. Read `531-INTEGRATION.md` in that folder for local adaptations (which rules don't apply, which need translating to the token system).
- **`rn-design-audit`** (`.claude/skills/rn-design-audit/`) is the standalone visual-audit skill — invoke when you want a phased polish plan for an existing screen or the whole app, separate from the per-feature spec/implement/QA loop.

## Harness: rn-expo (design + frontend + QA pipeline)

**Goal:** ship a 531 feature end-to-end (idea → PR-ready commit) via a coordinated design/frontend/QA agent team.

**Trigger:** any feature work originating from an idea, description, or wireframe - use the `rn-expo-pipeline` skill. Unattended improvement work runs under the `do-work` loop (the queue-driven `initial-implement` pipeline is retired). Simple questions and small fixes do not need the pipeline.

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

Posts under `apps/web/src/content/blog/` are written through the **`commission-expedition-log` skill**, which dispatches the **`verso` agent file**. As of 2026-05-27, the per-invocation persona inside that agent is **the Logger of Expedition N** — a rotating anonymous character who writes a **field log** addressed to the next expedition. Verso himself is the **Paintress** in the fiction now: he relays Alex's tasking through `#task-queue` slips, presides over the gommage, and no longer writes posts. The skill and agent filenames are unchanged for call-site stability.

When to invoke `commission-expedition-log`:

- At the end of any `/loop` iteration (`/do-work`, `rn-expo-pipeline`) once the harness is green and the diff is staged - the post ships in the same commit as the code.
- Off-cycle, when an ad-hoc session produced a real decision or learning worth recording. Bar: "the Logger would have something to say."

The skill expects the caller to assemble inputs (what shipped, loop metadata, Discord prompts, any notes — including an optional `expedition_number`) and to handle the commit. It does NOT commit, push, or open a PR.

The lore canon lives in `loop-memory/14-lore.md` (the painting, the Paintress, the Expedition team, the gommage, the motto). The Logger's voice rules and beat menu live in `loop-memory/04-dev-blog-persona.md`. Schema and procedure in `loop-memory/03-dev-blog.md`. Standing operating context in `loop-memory/notes-from-alex.md`. The agent reads all four fresh on every invocation.

The dev-blog frontmatter schema gained two optional Logger-only fields on 2026-05-27 (`expedition: number`, `loggerName: string`) and an additional `scope` value (`'expedition'`). Verso-era and Margin-era posts continue to validate against the schema without changes.

## Test discipline

- **TDD for `src/domain/`**: red → green → commit. Property tests via `fast-check` where applicable.
- **Component tests assert behavior, not pixels.** Visual fidelity is checked manually against the PWA (screenshot pairs attached to each PR — see spec §7).
- **No skipped tests** without a comment linking to a tracking issue.

## Commit discipline

- Conventional commits: `feat:`, `fix:`, `test:`, `chore:`, `docs:`.
- Orchestrator squash-merges with prefix `[auto] <task-id> <title>`.
- Direct human commits should not start with `[auto]`.
