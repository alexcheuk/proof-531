# Phase A — Reset proof-531 for the RN Port from PWA

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hard-reset `apps/mobile/` and the docs/orchestrator queue so the rest of the RN-port-from-PWA work has a clean foundation. End-state: `apps/mobile/` boots in Expo Go with a single empty screen, `CLAUDE.md` matches the new stack, the new `queue.yaml` lists every Phase B–F task for `/initial-implement` to consume.

**Architecture:** This plan is human-driven (not orchestrator-driven). Reasoning: it rewrites `queue.yaml` itself and removes packages that current queue tasks reference, so the orchestrator must be quiescent throughout. After Phase A lands on `main`, the next move is `/initial-implement --batch`, which will execute Phases B–F from the new queue.

**Tech Stack:** Expo SDK 55 (Expo Go, no dev client), expo-router, expo-sqlite + Drizzle ORM, TanStack Query, IBM Plex via expo-font, `@gorhom/bottom-sheet`, expo-haptics/blur/av/keep-awake, Jest + RTL + fast-check, Biome.

**Spec reference:** [`docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md`](../specs/2026-05-22-rn-port-from-pwa-design.md)

---

## File structure created/modified by this plan

```
proof-531/
├── CLAUDE.md                                       # MODIFIED — stack reset, Expo Go, new spec ref
├── design-reference/                               # DELETED entirely
├── docs/superpowers/
│   ├── plans/2026-05-22-phase-a-reset.md           # NEW (this file)
│   ├── queue.yaml                                  # REWRITTEN with Phase B–F tasks
│   └── specs/
│       ├── 2026-05-19-expo-scaffold-design.md      # DELETED
│       └── TODO-*.md                               # DELETED (all of them)
└── apps/mobile/
    ├── android/                                    # DELETED (prebuild artifact, not needed for Expo Go)
    ├── coverage/                                   # DELETED (gitignored anyway, but clean it)
    ├── drizzle.config.ts                           # DELETED (regen in Phase D)
    ├── eas.json                                    # DELETED (no EAS until shipping)
    ├── SMOKE.md                                    # DELETED
    ├── AGENTS.md                                   # DELETED
    ├── global.d.ts                                 # DELETED
    ├── scripts/                                    # DELETED (reset-project.js, storybook-generate.mjs)
    ├── .maestro/                                   # DELETED if present (none yet, defensive)
    ├── app.json                                    # MODIFIED — drop dev-client plugin & native config
    ├── package.json                                # MODIFIED — drop Skia/Sentry/PostHog/Storybook/Reassure/etc.; add gorhom-bottom-sheet, expo-av, expo-keep-awake
    ├── tsconfig.json                               # unchanged
    └── src/                                        # WIPED then re-scaffolded minimally
        ├── app/
        │   ├── _layout.tsx                         # NEW — minimal root, renders <Slot />
        │   └── index.tsx                           # NEW — empty <View>, smoke-test screen
        └── (everything else under src/ deleted)
```

After Phase A lands, `apps/mobile/src/` contains exactly two files. Phase B begins the rebuild.

---

## Task 1: Pre-flight — confirm clean state

**Files:** none

- [ ] **Step 1.1: Confirm working tree is clean**

Run: `git status`
Expected: `nothing to commit, working tree clean`. If not, stash or commit first — Phase A's `rm -rf`s will swallow uncommitted work.

- [ ] **Step 1.2: Confirm on `main`**

Run: `git branch --show-current`
Expected: `main`. If not, switch (`git checkout main`).

- [ ] **Step 1.3: Verify Node + pnpm versions**

Run: `node --version && pnpm --version`
Expected: Node 22.x, pnpm 9.15+. If wrong, fix via `nvm use` / Corepack before continuing.

- [ ] **Step 1.4: Verify yq present (for queue scripts)**

Run: `command -v yq && yq --version`
Expected: a path and `yq (https://github.com/mikefarah/yq/) version v4.x`. If missing: `brew install yq`.

No commit for Task 1.

---

## Task 2: Delete retired spec & queue files

**Files:**
- Delete: `docs/superpowers/specs/2026-05-19-expo-scaffold-design.md`
- Delete: `docs/superpowers/specs/TODO-*.md` (all)
- Delete: `docs/superpowers/queue.yaml` (will be rewritten in Task 9)

- [ ] **Step 2.1: Delete the old spec**

Run:
```bash
rm docs/superpowers/specs/2026-05-19-expo-scaffold-design.md
```

- [ ] **Step 2.2: Delete the TODO specs**

Run:
```bash
rm docs/superpowers/specs/TODO-cycle.md \
   docs/superpowers/specs/TODO-history.md \
   docs/superpowers/specs/TODO-library.md \
   docs/superpowers/specs/TODO-live.md \
   docs/superpowers/specs/TODO-onboarding.md \
   docs/superpowers/specs/TODO-pr-modal.md \
   docs/superpowers/specs/TODO-settings.md \
   docs/superpowers/specs/TODO-today-cards.md \
   docs/superpowers/specs/TODO-today-data.md \
   docs/superpowers/specs/TODO-today-editorial.md
```

- [ ] **Step 2.3: Delete the old queue**

Run: `rm docs/superpowers/queue.yaml`

- [ ] **Step 2.4: Verify only the new spec + this plan remain**

Run: `ls docs/superpowers/specs/ && ls docs/superpowers/plans/`
Expected:
- `specs/` contains only `2026-05-22-rn-port-from-pwa-design.md`
- `plans/` contains `2026-05-19-phase-0-bootstrap.md` and `2026-05-22-phase-a-reset.md`

- [ ] **Step 2.5: Commit**

```bash
git add -A docs/superpowers/
git commit -m "chore: retire 2026-05-19 spec, TODOs, and old queue.yaml"
```

---

## Task 3: Delete `design-reference/`

**Files:**
- Delete: `design-reference/` (whole directory)

Rationale: PWA at `~/Development/531-pwa` is the new behavioral source of truth.

- [ ] **Step 3.1: Delete the directory**

Run: `rm -rf design-reference/`

- [ ] **Step 3.2: Verify gone**

Run: `ls design-reference 2>&1`
Expected: `ls: design-reference: No such file or directory`

- [ ] **Step 3.3: Commit**

```bash
git add -A design-reference
git commit -m "chore: retire design-reference; PWA at ~/Development/531-pwa is the new reference"
```

---

## Task 4: Wipe `apps/mobile/src/`

**Files:**
- Delete: every file inside `apps/mobile/src/`

- [ ] **Step 4.1: Delete src**

Run: `rm -rf apps/mobile/src`

- [ ] **Step 4.2: Verify gone**

Run: `ls apps/mobile/src 2>&1`
Expected: `ls: apps/mobile/src: No such file or directory`

- [ ] **Step 4.3: Commit**

```bash
git add -A apps/mobile/src
git commit -m "chore(mobile): wipe src/ for PWA port reset"
```

---

## Task 5: Delete native + tooling artifacts under `apps/mobile/`

**Files:**
- Delete: `apps/mobile/android/`
- Delete: `apps/mobile/coverage/`
- Delete: `apps/mobile/scripts/`
- Delete: `apps/mobile/eas.json`
- Delete: `apps/mobile/drizzle.config.ts`
- Delete: `apps/mobile/SMOKE.md`
- Delete: `apps/mobile/AGENTS.md`
- Delete: `apps/mobile/global.d.ts`
- Delete: `apps/mobile/.maestro/` (if exists)

- [ ] **Step 5.1: Delete prebuild + tooling artifacts**

Run:
```bash
rm -rf apps/mobile/android \
       apps/mobile/coverage \
       apps/mobile/scripts \
       apps/mobile/eas.json \
       apps/mobile/drizzle.config.ts \
       apps/mobile/SMOKE.md \
       apps/mobile/AGENTS.md \
       apps/mobile/global.d.ts \
       apps/mobile/.maestro
```

- [ ] **Step 5.2: Verify a minimal apps/mobile/ remains**

Run: `ls apps/mobile/`
Expected (order may differ): `app.json  assets  CLAUDE.md  expo-env.d.ts  node_modules  package.json  README.md  tsconfig.json`

- [ ] **Step 5.3: Commit**

```bash
git add -A apps/mobile
git commit -m "chore(mobile): drop android prebuild, eas, drizzle config, scripts, maestro"
```

---

## Task 6: Rewrite `apps/mobile/package.json`

**Files:**
- Modify: `apps/mobile/package.json`

End state matches the new stack: Expo Go runnable, no Skia/Sentry/PostHog/Storybook/Reassure/glass-effect/symbols/web/image/device/web-browser, no dev-client, no `--dev-client` start flag. Adds `@gorhom/bottom-sheet`, `expo-av`, `expo-keep-awake`, `expo-blur`. Drizzle stays (Phase D will wire it). `react-native-svg` is removed (PlateBar is plain Views per spec).

- [ ] **Step 6.1: Overwrite `apps/mobile/package.json`**

Replace the file with:

```json
{
  "name": "@fivethreeone/mobile",
  "main": "expo-router/entry",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "typecheck": "tsc --noEmit",
    "test": "jest --passWithNoTests --testPathIgnorePatterns=/node_modules/",
    "lint": "biome check src",
    "doctor": "expo-doctor"
  },
  "dependencies": {
    "@gorhom/bottom-sheet": "^5.1.6",
    "@react-native-async-storage/async-storage": "2.2.0",
    "@tanstack/react-query": "^5.100.11",
    "drizzle-orm": "^0.45.2",
    "expo": "~55.0.25",
    "expo-av": "~15.0.2",
    "expo-blur": "~15.0.7",
    "expo-constants": "~55.0.16",
    "expo-font": "~55.0.8",
    "expo-haptics": "~55.0.14",
    "expo-keep-awake": "~14.0.3",
    "expo-linking": "~55.0.15",
    "expo-router": "~55.0.15",
    "expo-splash-screen": "~55.0.21",
    "expo-sqlite": "~55.0.16",
    "expo-status-bar": "~55.0.6",
    "expo-system-ui": "~55.0.18",
    "react": "19.2.0",
    "react-native": "0.83.6",
    "react-native-gesture-handler": "~2.30.0",
    "react-native-reanimated": "4.2.1",
    "react-native-safe-area-context": "~5.6.2",
    "react-native-screens": "~4.23.0",
    "react-native-worklets": "0.7.4",
    "zustand": "^5.0.13"
  },
  "devDependencies": {
    "@fast-check/jest": "^2.2.0",
    "@testing-library/react-native": "^13.3.3",
    "@types/jest": "~29.5.14",
    "@types/react": "~19.2.2",
    "expo-doctor": "^1.18.22",
    "fast-check": "^4.8.0",
    "jest": "~29.7.0",
    "jest-expo": "^55.0.18",
    "react-test-renderer": "^19.2.0",
    "typescript": "~5.9.2"
  },
  "jest": {
    "preset": "jest-expo",
    "transformIgnorePatterns": [
      "node_modules/(?!(\\.pnpm/[^/]+/node_modules/)?((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|native-base))"
    ]
  },
  "private": true
}
```

Notes embedded in the change:
- `start` no longer passes `--dev-client` → Expo Go boots.
- Removed: `@sentry/*`, `@shopify/react-native-skia`, `posthog-react-native`, `expo-dev-client`, `expo-drizzle-studio-plugin`, `expo-device`, `expo-glass-effect`, `expo-image`, `expo-symbols`, `expo-web-browser`, `react-dom`, `react-native-web`, `react-native-svg`, `ts-dedent`, `@react-navigation/*` (expo-router pulls what it needs), `@types/react-test-renderer` (unused).
- Removed devDeps: `@callstack/reassure-cli`, `@storybook/react-native`, `@types/better-sqlite3`, `better-sqlite3`, `drizzle-kit` (re-add in Phase D), `reassure`.
- Removed scripts: `reset-project`, `android`, `ios`, `storybook:*`, `maestro:*`, `db:generate`, `perf*`.
- Removed jest coverage thresholds (re-add in Phase C when domain code exists).

- [ ] **Step 6.2: Reinstall**

Run from repo root:
```bash
pnpm install
```

Expected: install completes with no errors; `node_modules` is rewritten; the deleted packages are gone.

- [ ] **Step 6.3: Sanity check — lockfile updated**

Run: `git diff --stat pnpm-lock.yaml`
Expected: pnpm-lock.yaml shows changes (deletions + additions).

- [ ] **Step 6.4: Commit**

```bash
git add apps/mobile/package.json pnpm-lock.yaml
git commit -m "feat(mobile): reset deps to Expo Go stack (drop Skia/Sentry/PostHog/Storybook/Reassure; add @gorhom/bottom-sheet, expo-av/blur/keep-awake)"
```

---

## Task 7: Rewrite `apps/mobile/app.json`

**Files:**
- Modify: `apps/mobile/app.json`

Strip plugins/permissions tied to removed packages (Sentry, expo-dev-client, glass-effect, symbols), preserve plugins still in use (router, font, splash-screen, sqlite).

- [ ] **Step 7.1: Read current `apps/mobile/app.json`**

Run: `cat apps/mobile/app.json`

This is for context — do not modify keys you don't recognize without checking. The required edits are:
- Remove from `plugins`: `expo-dev-client`, anything Sentry-related, `expo-glass-effect`, `expo-symbols`, `expo-image`, `expo-web-browser`, `expo-device` (if present).
- Keep in `plugins`: `expo-router`, `expo-font`, `expo-splash-screen`, `expo-sqlite`.
- Add to `plugins`: nothing new (gorhom/expo-av/expo-blur/expo-haptics/expo-keep-awake don't need plugin entries in SDK 55).
- Under top-level `expo`: ensure `"newArchEnabled": true` (matches spec §3).
- Under `expo`: remove `"android"` / `"ios"` blocks that reference Sentry config keys.

- [ ] **Step 7.2: Apply the edits**

Use Edit tool to remove the offending plugin entries and any Sentry config blocks. Preserve `name`, `slug`, `version`, `orientation`, `icon`, `userInterfaceStyle: "dark"` (set if absent), `splash`, `assetBundlePatterns`, `web` (delete the whole `web` block — no web target), `experiments` if any.

If the resulting file is uncertain, replace `plugins` with a minimal explicit list:

```json
"plugins": [
  "expo-router",
  "expo-font",
  "expo-splash-screen",
  ["expo-sqlite", { "useSQLCipher": false }]
]
```

- [ ] **Step 7.3: Sanity — typecheck still parses config**

Run: `pnpm --filter @fivethreeone/mobile expo config --type prebuild 2>&1 | tail -5`
Expected: no plugin-resolution errors. (We're not actually prebuilding — this just validates config.)

- [ ] **Step 7.4: Commit**

```bash
git add apps/mobile/app.json
git commit -m "chore(mobile): strip app.json plugins for removed packages"
```

---

## Task 8: Re-scaffold minimal `src/app/` and verify Expo Go boots

**Files:**
- Create: `apps/mobile/src/app/_layout.tsx`
- Create: `apps/mobile/src/app/index.tsx`

- [ ] **Step 8.1: Create the directory**

Run: `mkdir -p apps/mobile/src/app`

- [ ] **Step 8.2: Write `apps/mobile/src/app/_layout.tsx`**

Content:

```tsx
import { Slot } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#0B0C0E" }}>
      <Slot />
    </GestureHandlerRootView>
  );
}
```

Note: the hex literal here is a temporary smoke-test color (matches the spec's dark canvas). It will be replaced by `tokens.bg[0]` in Phase B once tokens land — that's the only acceptable hex outside `design/` and only because `design/` does not exist yet.

- [ ] **Step 8.3: Write `apps/mobile/src/app/index.tsx`**

Content:

```tsx
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0B0C0E",
      }}
    >
      <Text style={{ color: "#FAFAF5", fontSize: 16 }}>
        proof-531 — phase A boot
      </Text>
    </View>
  );
}
```

- [ ] **Step 8.4: Typecheck**

Run: `pnpm --filter @fivethreeone/mobile typecheck`
Expected: zero errors.

- [ ] **Step 8.5: Lint**

Run: `pnpm --filter @fivethreeone/mobile lint`
Expected: zero errors. If Biome complains about the hex literals, add a Biome ignore comment OR rely on Biome's default (it does not flag hex literals; this should be clean).

- [ ] **Step 8.6: Test (smoke)**

Run: `pnpm --filter @fivethreeone/mobile test`
Expected: `No tests found, exiting with code 0` (we passed `--passWithNoTests`). PASS.

- [ ] **Step 8.7: Metro export smoke**

Run:
```bash
pnpm --filter @fivethreeone/mobile exec expo export --platform ios \
  --output-dir /tmp/expo-bundle-check --dump-sourcemap=false --dump-assetmap=false
```
Expected: exits 0; prints bundle output info. Catches missing transitive deps.

- [ ] **Step 8.8: Boot in Expo Go (interactive — user runs this)**

Run: `pnpm --filter @fivethreeone/mobile start`

Tell the user: scan the QR code with **Expo Go** (not a custom build). Expected: the screen shows `proof-531 — phase A boot` on a dark background. If it fails: read the Metro/Expo Go error in the terminal, fix, retry.

Stop the dev server with `q` once verified.

- [ ] **Step 8.9: Commit**

```bash
git add apps/mobile/src
git commit -m "feat(mobile): minimal Expo Go boot — empty index screen"
```

---

## Task 9: Rewrite `docs/superpowers/queue.yaml` with Phase B–F tasks

**Files:**
- Create (rewrite): `docs/superpowers/queue.yaml`

This is the big deliverable. Every leaf task for Phases B–F goes here. The orchestrator picks from this queue after Phase A lands.

- [ ] **Step 9.1: Write the new queue.yaml**

Replace contents with the YAML below. (Long but enumerated — every task has an id, deps, status, spec ref, and machine-checkable `done_when` criteria per `.claude/skills/initial-implement/queue-format.md`.)

```yaml
version: 1
tasks:
  # ───────────────────────── Phase B — Design system ─────────────────────────
  - id: PB-01-tokens
    title: Port PWA globals.css to typed tokens.ts
    phase: 2
    depends_on: []
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#3--stack
    behavioral_reference: ~/Development/531-pwa/src/styles/globals.css
    done_when:
      - "apps/mobile/src/design/tokens.ts exists"
      - "tokens.ts exports named const objects: colors, type, radii, spacing, motion"
      - "Every CSS custom property in the PWA's globals.css has a matching named export"
      - "pnpm --filter @fivethreeone/mobile typecheck passes"
      - "pnpm --filter @fivethreeone/mobile lint passes"
    notes: |
      Tokens are plain TS constants — not theme objects. Match the PWA names
      verbatim where possible. Hex values are the only hex literals allowed
      outside tests.

  - id: PB-02-theme
    title: ThemeProvider + useTheme hook
    phase: 2
    depends_on: [PB-01-tokens]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#3--stack
    done_when:
      - "apps/mobile/src/design/theme.ts exports ThemeProvider and useTheme"
      - "Jest test: useTheme inside ThemeProvider returns tokens; outside throws"
      - "pnpm --filter @fivethreeone/mobile test passes"

  - id: PB-03-fonts
    title: Bundle IBM Plex Sans + Mono + Sans Condensed via expo-font
    phase: 2
    depends_on: [PB-01-tokens]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#3--stack
    done_when:
      - "apps/mobile/assets/fonts/ contains IBMPlexSans-{Regular,Medium,SemiBold,Bold}.ttf"
      - "apps/mobile/assets/fonts/ contains IBMPlexMono-{Regular,Medium,SemiBold,Bold}.ttf"
      - "apps/mobile/assets/fonts/ contains IBMPlexSansCondensed-{Regular,Medium,SemiBold,Bold}.ttf"
      - "apps/mobile/src/design/fonts.ts exports a useAppFonts() hook wrapping expo-font's useFonts"
      - "apps/mobile/src/app/_layout.tsx gates render on useAppFonts() (splash held until loaded)"
      - "App boots in Expo Go with no font-not-loaded warnings in Metro logs"
    notes: |
      Download IBM Plex TTFs from the official IBM repo or Google Fonts.

  - id: PB-04-primitive-box-text
    title: Box, Text primitives
    phase: 2
    depends_on: [PB-02-theme]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#4--architecture
    behavioral_reference: ~/Development/531-pwa/src/components/ui
    done_when:
      - "apps/mobile/src/design/primitives/Box.tsx exists"
      - "apps/mobile/src/design/primitives/Text.tsx exists with variant prop (sans|mono|condensed) and weight/size from tokens"
      - "Jest render tests pass for both"
      - "rg -n '#[0-9a-fA-F]{3,8}' apps/mobile/src/design/primitives returns empty (no inline hex)"
      - "pnpm --filter @fivethreeone/mobile test passes"

  - id: PB-05-primitive-button-pill
    title: Button + PrimaryPillButton primitives with haptics
    phase: 2
    depends_on: [PB-04-primitive-box-text]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#6--mobile-ux-defaults
    behavioral_reference: ~/Development/531-pwa/src/components/ui/button.tsx
    done_when:
      - "apps/mobile/src/design/primitives/Button.tsx exists with variants matching PWA"
      - "apps/mobile/src/design/primitives/PrimaryPillButton.tsx exists"
      - "Jest test asserts onPress fires"
      - "Jest test asserts Haptics.impactAsync('light') is called on press (mocked)"
      - "Jest test asserts accessibilityRole='button' and disabled state"
      - "pnpm --filter @fivethreeone/mobile test passes"

  - id: PB-06-primitive-mono-badge
    title: MonoBadge primitive
    phase: 2
    depends_on: [PB-04-primitive-box-text]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#4--architecture
    behavioral_reference: ~/Development/531-pwa/src/components/ui/mono-badge.tsx
    done_when:
      - "apps/mobile/src/design/primitives/MonoBadge.tsx exists"
      - "Jest render test passes"
      - "pnpm --filter @fivethreeone/mobile test passes"

  - id: PB-07-primitive-section-band
    title: SectionBand primitive
    phase: 2
    depends_on: [PB-04-primitive-box-text]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#4--architecture
    behavioral_reference: ~/Development/531-pwa/src/components/ui/section-band.tsx
    done_when:
      - "apps/mobile/src/design/primitives/SectionBand.tsx exists"
      - "Jest render test passes"

  - id: PB-08-primitive-title-block
    title: TitleBlock primitive
    phase: 2
    depends_on: [PB-04-primitive-box-text]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#4--architecture
    behavioral_reference: ~/Development/531-pwa/src/components/ui/title-block.tsx
    done_when:
      - "apps/mobile/src/design/primitives/TitleBlock.tsx exists"
      - "Jest render test passes"

  - id: PB-09-primitive-seg-rail
    title: SegRail primitive (haptics on segment change)
    phase: 2
    depends_on: [PB-04-primitive-box-text]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#6--mobile-ux-defaults
    behavioral_reference: ~/Development/531-pwa/src/components/ui/seg-rail.tsx
    done_when:
      - "apps/mobile/src/design/primitives/SegRail.tsx exists"
      - "Jest test asserts selectionAsync fires on segment change (mocked)"
      - "pnpm --filter @fivethreeone/mobile test passes"

  - id: PB-10-primitive-number-stepper
    title: NumberStepper primitive with haptics
    phase: 2
    depends_on: [PB-04-primitive-box-text]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#6--mobile-ux-defaults
    behavioral_reference: ~/Development/531-pwa/src/components/ui/number-stepper.tsx
    done_when:
      - "apps/mobile/src/design/primitives/NumberStepper.tsx exists"
      - "Increment/decrement props enforce min/max clamping"
      - "Jest test asserts onChange fires with clamped value"
      - "Jest test asserts impactAsync('light') fires on step (mocked)"

  - id: PB-11-primitive-checkbox-ledger
    title: CheckboxLedger primitive
    phase: 2
    depends_on: [PB-04-primitive-box-text]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#4--architecture
    behavioral_reference: ~/Development/531-pwa/src/components/ui/checkbox-ledger.tsx
    done_when:
      - "apps/mobile/src/design/primitives/CheckboxLedger.tsx exists"
      - "Jest test asserts toggled state and accessibilityRole='checkbox'"

  - id: PB-12-primitive-ledger-row-section
    title: LedgerRow + LedgerSection primitives
    phase: 2
    depends_on: [PB-04-primitive-box-text]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#4--architecture
    behavioral_reference: ~/Development/531-pwa/src/components/ui/ledger-row.tsx
    done_when:
      - "apps/mobile/src/design/primitives/LedgerRow.tsx exists"
      - "apps/mobile/src/design/primitives/LedgerSection.tsx exists"
      - "Jest render tests pass for both"

  - id: PB-13-primitive-sheet
    title: Sheet primitive wrapping @gorhom/bottom-sheet
    phase: 2
    depends_on: [PB-04-primitive-box-text]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#6--mobile-ux-defaults
    behavioral_reference: ~/Development/531-pwa/src/components/ui/sheet.tsx
    done_when:
      - "apps/mobile/src/design/primitives/Sheet.tsx exists"
      - "Backdrop tap dismisses (jest test with mocked gesture handler)"
      - "Android hardware-back dismisses sheet first, not screen (jest test asserts handler registered)"
      - "Haptics.impactAsync('light') fires on snap to opened position"

  - id: PB-14-primitive-cta-bar
    title: CtaBar primitive
    phase: 2
    depends_on: [PB-05-primitive-button-pill]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#4--architecture
    behavioral_reference: ~/Development/531-pwa/src/components/cta-bar.tsx
    done_when:
      - "apps/mobile/src/design/primitives/CtaBar.tsx exists"
      - "Bottom-safe-area inset respected"

  - id: PB-15-primitive-masthead
    title: Masthead primitive
    phase: 2
    depends_on: [PB-04-primitive-box-text]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#4--architecture
    behavioral_reference: ~/Development/531-pwa/src/components/masthead.tsx
    done_when:
      - "apps/mobile/src/design/primitives/Masthead.tsx exists"

  - id: PB-16-primitive-stat-grid
    title: StatGrid primitive
    phase: 2
    depends_on: [PB-04-primitive-box-text]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#4--architecture
    behavioral_reference: ~/Development/531-pwa/src/components/stat-grid.tsx
    done_when:
      - "apps/mobile/src/design/primitives/StatGrid.tsx exists"

  - id: PB-17-primitive-top-set-block
    title: TopSetBlock primitive
    phase: 2
    depends_on: [PB-04-primitive-box-text]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#4--architecture
    behavioral_reference: ~/Development/531-pwa/src/components/top-set-block.tsx
    done_when:
      - "apps/mobile/src/design/primitives/TopSetBlock.tsx exists"

  - id: PB-18-primitive-plate-bar
    title: PlateBar primitive — plain Views, no SVG
    phase: 2
    depends_on: [PB-04-primitive-box-text]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#3--stack
    behavioral_reference: ~/Development/531-pwa/src/components/plate-bar.tsx
    done_when:
      - "apps/mobile/src/design/primitives/PlateBar.tsx exists"
      - "Implementation uses only View + flex (no react-native-svg, no Skia)"
      - "Jest test: given a plate decomposition, renders one View per plate with flex proportional to plate value"
      - "rg -n 'react-native-svg|@shopify/react-native-skia' apps/mobile/src returns empty"

  # ───────────────────────── Phase C — Domain (TDD) ─────────────────────────
  - id: PC-01-domain-types
    title: domain/types.ts — Lift, Unit, PlateSet, Week, Day
    phase: 3
    depends_on: []
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#4--architecture
    behavioral_reference: ~/Development/531-pwa/src/db/schema.ts
    done_when:
      - "apps/mobile/src/domain/types.ts exists with Lift, Unit, PlateSet, Week, Day exports"
      - "Type definitions match PWA schema verbatim"
      - "rg -n '\\b(useState|useEffect|import React|async|await)\\b' apps/mobile/src/domain returns empty"

  - id: PC-02-domain-epley
    title: domain/epley.ts — estimated 1RM math (TDD + property test)
    phase: 3
    depends_on: [PC-01-domain-types]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#4--architecture
    behavioral_reference: ~/Development/531-pwa/src/features/session/domain/epley.ts
    done_when:
      - "apps/mobile/src/domain/epley.ts exports estimateOneRm(weight, reps)"
      - "apps/mobile/src/domain/__tests__/epley.test.ts has ≥1 property test using fast-check"
      - "Property: reps=1 ⇒ result === weight"
      - "Property: result monotonically increases with reps"
      - "pnpm --filter @fivethreeone/mobile test src/domain/__tests__/epley passes"

  - id: PC-03-domain-units
    title: domain/units.ts — lbs↔kg, rounding (TDD + property tests)
    phase: 3
    depends_on: [PC-01-domain-types]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#4--architecture
    behavioral_reference: ~/Development/531-pwa/src/features/session/domain/units.ts
    done_when:
      - "apps/mobile/src/domain/units.ts exports convert, round"
      - "Property test: round(round(x)) === round(x) (idempotent)"
      - "Property test: convert(convert(x, 'lbs', 'kg'), 'kg', 'lbs') ≈ x within rounding tolerance"

  - id: PC-04-domain-plates
    title: domain/plates.ts — plate decomposition (TDD + property test)
    phase: 3
    depends_on: [PC-01-domain-types, PC-03-domain-units]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#4--architecture
    behavioral_reference: ~/Development/531-pwa/src/features/session/domain/plates.ts
    done_when:
      - "apps/mobile/src/domain/plates.ts exports decompose(target, plateSet)"
      - "Property test: sum of decomposed plates + bar ≈ target (within smallest plate)"
      - "Returns greedy descending decomposition matching PWA behavior"

  - id: PC-05-domain-increments
    title: domain/increments.ts — TM bumps (TDD)
    phase: 3
    depends_on: [PC-01-domain-types]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#4--architecture
    behavioral_reference: ~/Development/531-pwa/src/features/session/domain/increments.ts
    done_when:
      - "apps/mobile/src/domain/increments.ts exports nextTm(currentTm, lift, unit)"
      - "Test: bench/press → +5lb (or +2.5kg); squat/deadlift → +10lb (or +5kg)"

  - id: PC-06-domain-schemes
    title: domain/schemes.ts — week 1–4 prescription (TDD)
    phase: 3
    depends_on: [PC-01-domain-types]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#4--architecture
    behavioral_reference: ~/Development/531-pwa/src/features/session/domain/schemes.ts
    done_when:
      - "apps/mobile/src/domain/schemes.ts exports prescription(week)"
      - "Returns the 3-set scheme for weeks 1, 2, 3 and the 3-set deload for week 4"
      - "Tests cover all 4 weeks"

  - id: PC-07-domain-labels-summary
    title: domain/{labels,summary}.ts (TDD)
    phase: 3
    depends_on: [PC-06-domain-schemes, PC-02-domain-epley]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#4--architecture
    behavioral_reference: ~/Development/531-pwa/src/features/session/domain/labels.ts
    done_when:
      - "apps/mobile/src/domain/labels.ts exists with PWA-matching string outputs"
      - "apps/mobile/src/domain/summary.ts exists with session summary math"
      - "Tests cover at least one happy path per exported function"

  # ───────────────────────── Phase D — Data ─────────────────────────
  - id: PD-01-drizzle-init
    title: Drizzle + expo-sqlite client + schema
    phase: 4
    depends_on: [PC-01-domain-types]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#43-data-model
    behavioral_reference: ~/Development/531-pwa/src/db/schema.ts
    done_when:
      - "apps/mobile/src/data/drizzle/client.ts exists, exports db from drizzle(expo-sqlite)"
      - "apps/mobile/src/data/drizzle/schema.ts defines tables: settings, training_maxes, sessions, set_logs, prs"
      - "Column shapes match PWA's Dexie types per spec §4.3"
      - "enabledLifts column is TEXT (JSON-encoded)"
      - "pnpm --filter @fivethreeone/mobile typecheck passes"

  - id: PD-02-migration-0001
    title: First migration + runMigrations() boot helper
    phase: 4
    depends_on: [PD-01-drizzle-init]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#43-data-model
    done_when:
      - "apps/mobile/src/data/drizzle/migrations/0001_init.sql exists creating all 5 tables"
      - "apps/mobile/src/data/drizzle/runMigrations.ts exists"
      - "_layout.tsx calls runMigrations() once on app boot"
      - "Jest integration test opens :memory: sqlite, runs migration, asserts all 5 tables present"

  - id: PD-03-accessor-settings
    title: data/accessors/settings.ts (port from PWA)
    phase: 4
    depends_on: [PD-02-migration-0001]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#43-data-model
    behavioral_reference: ~/Development/531-pwa/src/db/accessors/settings.ts
    done_when:
      - "apps/mobile/src/data/accessors/settings.ts ports every exported function from the PWA"
      - "Integration test (in-memory sqlite) for each function"

  - id: PD-04-accessor-training-max
    title: data/accessors/trainingMax.ts (versioned, append-only)
    phase: 4
    depends_on: [PD-02-migration-0001]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#43-data-model
    behavioral_reference: ~/Development/531-pwa/src/db/accessors/trainingMax.ts
    done_when:
      - "apps/mobile/src/data/accessors/trainingMax.ts exists; setTm INSERTs (never UPDATEs)"
      - "getLatestTm returns most recent row per lift"
      - "Integration tests cover both"

  - id: PD-05-accessor-session
    title: data/accessors/session.ts (snapshots TM + unit)
    phase: 4
    depends_on: [PD-04-accessor-training-max]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#43-data-model
    behavioral_reference: ~/Development/531-pwa/src/db/accessors/session.ts
    done_when:
      - "createSession() persists trainingMaxSnapshot and unitSnapshot from current settings"
      - "Integration test: changing TM mid-session does not change session snapshot"

  - id: PD-06-accessor-set-log-prs
    title: data/accessors/{setLog,prs}.ts
    phase: 4
    depends_on: [PD-05-accessor-session]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#43-data-model
    behavioral_reference: ~/Development/531-pwa/src/db/accessors
    done_when:
      - "apps/mobile/src/data/accessors/setLog.ts exists"
      - "apps/mobile/src/data/accessors/prs.ts exists"
      - "PR detection: AMRAP set with estimated1RM > prior best bestE1RM marks isPR + upserts prs row"
      - "Integration tests for set logging and PR upsert"

  - id: PD-07-accessor-onboarding
    title: data/accessors/onboarding.ts
    phase: 4
    depends_on: [PD-05-accessor-session]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#43-data-model
    behavioral_reference: ~/Development/531-pwa/src/db/accessors/onboarding.ts
    done_when:
      - "apps/mobile/src/data/accessors/onboarding.ts ports completeOnboarding() behavior"
      - "Integration test: completeOnboarding inserts settings + initial TMs in one transaction"

  - id: PD-08-query-hooks
    title: data/queries — TanStack Query hooks wrapping accessors
    phase: 4
    depends_on: [PD-07-accessor-onboarding, PD-06-accessor-set-log-prs]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#3--stack
    done_when:
      - "apps/mobile/src/data/queries/{useSettings,useLatestTm,useSession,usePrs,latestByLift}.ts exist"
      - "QueryClient is provided in src/app/_layout.tsx"
      - "Jest test renders a hook with a memory db and asserts the query resolves"

  # ───────────────────────── Phase E — Features ─────────────────────────
  - id: PE-01-tab-layout
    title: (tabs)/_layout.tsx with custom bottom nav (matches PWA)
    phase: 5
    depends_on: [PB-04-primitive-box-text, PB-05-primitive-button-pill]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#4--architecture
    behavioral_reference: ~/Development/531-pwa/src/app/layout/BottomNav.tsx
    done_when:
      - "apps/mobile/src/app/(tabs)/_layout.tsx exists using expo-router Tabs"
      - "tabBar={(props) => <CustomTabBar {...props} />} renders a PWA-matching bar"
      - "Tab switch fires Haptics.selectionAsync (mocked test)"
      - "Bottom-safe-area inset respected"

  - id: PE-02-onboarding
    title: Onboarding flow (Intro → PickLifts → OneRmEntry → Review)
    phase: 5
    depends_on: [PD-07-accessor-onboarding, PB-10-primitive-number-stepper, PB-11-primitive-checkbox-ledger, PB-14-primitive-cta-bar]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#5--phasing
    behavioral_reference: ~/Development/531-pwa/src/features/onboarding
    done_when:
      - "apps/mobile/src/features/onboarding/{OnboardingScreen.tsx,components,steps,hooks,lifts.ts} match PWA structure"
      - "apps/mobile/src/app/onboarding.tsx is a thin shell rendering OnboardingScreen"
      - "Completing the flow invokes the onboarding accessor and routes to /"
      - "Jest test: stepping through all 4 steps with mock accessor calls onboarding accessor with the entered data"

  - id: PE-03-home
    title: Home screen (CycleStrip, LiftTabs, LiftPage, LiftStats)
    phase: 5
    depends_on: [PD-08-query-hooks, PB-09-primitive-seg-rail, PB-16-primitive-stat-grid, PB-17-primitive-top-set-block]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#5--phasing
    behavioral_reference: ~/Development/531-pwa/src/features/home
    done_when:
      - "apps/mobile/src/features/home/{HomeScreen.tsx,components,hooks} match PWA structure"
      - "apps/mobile/src/app/(tabs)/index.tsx renders HomeScreen"
      - "Reanimated LinearTransition applied on LiftTabs/CycleStrip lift switch"
      - "Jest test: lift switch updates rendered LiftStats"

  - id: PE-04-session-today
    title: Today screen (entry to a session)
    phase: 5
    depends_on: [PD-08-query-hooks, PB-12-primitive-ledger-row-section]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#5--phasing
    behavioral_reference: ~/Development/531-pwa/src/features/session/TodayScreen.tsx
    done_when:
      - "apps/mobile/src/features/session/TodayScreen.tsx + components/{SessionLayout,SessionTopBar,TodayBody,SetRow}.tsx exist"
      - "apps/mobile/src/app/session/today.tsx renders TodayScreen"
      - "Tapping Start Session creates a session row and routes to /session/live"

  - id: PE-05-session-live
    title: Live screen (BigWeight, RestTimer, AmrapLogSheet, CancelConfirmSheet)
    phase: 5
    depends_on: [PE-04-session-today, PB-13-primitive-sheet]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#6--mobile-ux-defaults
    behavioral_reference: ~/Development/531-pwa/src/features/session/LiveScreen.tsx
    done_when:
      - "apps/mobile/src/features/session/LiveScreen.tsx + every component in the PWA's session/components dir exists"
      - "Rest timer counts down; T-3s fires Haptics.notificationAsync('warning'); T-0 plays a chime via expo-av (mocked in test)"
      - "AmrapLogSheet uses gorhom bottom-sheet"
      - "expo-keep-awake is active during the session (activateKeepAwake on enter, deactivate on leave)"
      - "Cancel confirmation requires the warning haptic + a second tap"

  - id: PE-06-session-complete
    title: Session Complete screen (PRCertificate, ReceiptRow, DateStamp)
    phase: 5
    depends_on: [PE-05-session-live]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#5--phasing
    behavioral_reference: ~/Development/531-pwa/src/features/session/SessionCompleteScreen.tsx
    done_when:
      - "apps/mobile/src/features/session/SessionCompleteScreen.tsx + 3 components exist"
      - "On PR, Haptics.notificationAsync('success') fires (mocked test)"
      - "apps/mobile/src/app/session/complete.tsx renders the screen"

  - id: PE-07-history
    title: History screen + pull-to-refresh
    phase: 5
    depends_on: [PD-08-query-hooks, PB-12-primitive-ledger-row-section]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#6--mobile-ux-defaults
    behavioral_reference: ~/Development/531-pwa/src/features/history/HistoryScreen.tsx
    done_when:
      - "apps/mobile/src/features/history/HistoryScreen.tsx exists"
      - "apps/mobile/src/app/(tabs)/history.tsx renders it"
      - "RefreshControl wired to refetch underlying query"

  - id: PE-08-settings
    title: Settings screen + TmEditSheet
    phase: 5
    depends_on: [PD-04-accessor-training-max, PD-03-accessor-settings, PB-13-primitive-sheet, PB-10-primitive-number-stepper]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#5--phasing
    behavioral_reference: ~/Development/531-pwa/src/features/settings
    done_when:
      - "apps/mobile/src/features/settings/{SettingsScreen.tsx,components/TmEditSheet.tsx,hooks,lifts.ts,nextEnabledLifts.ts,plateSetMapping.ts} match PWA structure"
      - "apps/mobile/src/app/(tabs)/settings.tsx renders SettingsScreen"
      - "Saving a new TM creates a new training_maxes row (does not overwrite)"

  # ───────────────────────── Phase F — Integration polish ─────────────────────────
  - id: PF-01-first-launch
    title: First-launch routing (no settings → onboarding; else → home)
    phase: 6
    depends_on: [PE-02-onboarding, PE-03-home]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#5--phasing
    done_when:
      - "Root layout checks useSettings(); redirects to /onboarding if no row, else /(tabs)"
      - "Jest test: with no settings row, root mounts onboarding shell"
      - "Jest test: with a settings row, root mounts tabs"

  - id: PF-02-empty-loading-error
    title: Empty/loading/error states sweep across all screens
    phase: 6
    depends_on: [PE-03-home, PE-07-history, PE-08-settings]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#5--phasing
    done_when:
      - "Each TanStack Query consumer renders an explicit loading and error state (not a blank screen)"
      - "rg -n 'isLoading|isError|isPending' apps/mobile/src/features returns matches for Home, History, Settings"

  - id: PF-03-status-bar
    title: Per-screen status-bar styling
    phase: 6
    depends_on: [PE-02-onboarding, PE-05-session-live]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#6--mobile-ux-defaults
    done_when:
      - "Each feature screen renders <StatusBar style='light' /> (expo-status-bar)"
      - "Manual: status bar is readable on the dark canvas across all screens"

  - id: PF-04-screenshot-pairs
    title: Manual screenshot-pair audit (RN vs PWA)
    phase: 6
    depends_on: [PE-02-onboarding, PE-03-home, PE-05-session-live, PE-06-session-complete, PE-07-history, PE-08-settings]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#7--testing-strategy
    done_when:
      - "For each feature PR, the description contains a screenshot pair (PWA + RN) confirming pixel-faithful port"
      - "Reviewer signs off on every pair"

  - id: PF-05-ci-green-metro-smoke
    title: CI green + Metro export smoke
    phase: 6
    depends_on: [PF-01-first-launch, PF-02-empty-loading-error]
    status: todo
    spec_ref: docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md#7--testing-strategy
    done_when:
      - "pnpm run ci passes (typecheck + lint + test)"
      - "pnpm --filter @fivethreeone/mobile exec expo export --platform ios --output-dir /tmp/x --dump-sourcemap=false --dump-assetmap=false exits 0"
```

- [ ] **Step 9.2: Validate the YAML parses**

Run: `yq '.tasks | length' docs/superpowers/queue.yaml`
Expected: prints a number ≥ 35. (We have ~40 tasks.)

- [ ] **Step 9.3: Spot-check `pick-next.sh` returns the right first task**

Run: `bash .claude/skills/initial-implement/scripts/pick-next.sh`
Expected: `PB-01-tokens` (lowest phase, lowest id, no deps).

- [ ] **Step 9.4: Spot-check `ready-tasks.sh` lists the no-dep tasks**

Run: `bash .claude/skills/initial-implement/scripts/ready-tasks.sh`
Expected: includes `PB-01-tokens` and `PC-01-domain-types` (both have empty `depends_on`).

- [ ] **Step 9.5: Commit**

```bash
git add docs/superpowers/queue.yaml
git commit -m "feat(queue): rewrite queue.yaml with Phase B-F tasks for RN port from PWA"
```

---

## Task 10: Update root `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 10.1: Rewrite the Stack section**

Use Edit tool to replace lines 10–17 (the `## Stack` block) with:

```markdown
## Stack

- Expo SDK 55, React Native 0.83+ (New Architecture on), **Expo Go workflow** (no custom dev client)
- TypeScript strict, Biome, pnpm workspaces, Node 22
- expo-router (file-based), Drizzle ORM + expo-sqlite, TanStack Query, Zustand (only when earned)
- React Native Reanimated 4, expo-haptics, expo-blur, expo-av, expo-keep-awake
- `@gorhom/bottom-sheet` v5 for sheets; IBM Plex Sans/Mono/Sans-Condensed via expo-font
- Jest + @testing-library/react-native + fast-check (domain property tests)
- No Sentry, no PostHog, no Skia, no Storybook, no Maestro, no Reassure (all deferred until dev-client build)
```

- [ ] **Step 10.2: Replace the spec reference at top**

Edit the line starting with `The product spec is in` — replace `2026-05-19-expo-scaffold-design.md` with `2026-05-22-rn-port-from-pwa-design.md`.

- [ ] **Step 10.3: Rewrite the Layout block**

Find the `## Layout` heading in `CLAUDE.md` and replace the entire section (heading + the fenced code block beneath it) with this exact text (note: the fence is a literal triple backtick):

~~~markdown
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
~~~

(The `components/`, `hooks/`, `constants/`, `ui-state/` lines from the old layout are dropped — those template leftovers are gone.)

- [ ] **Step 10.4: Rewrite the Design reference section (lines 45–49)**

Replace with:

```markdown
## Design reference

`~/Development/531-pwa` is the **behavioral source of truth** for visuals, interactions, and screen flow. When porting a screen or component, open the matching file under `~/Development/531-pwa/src/` and port faithfully — do not reinvent.

The PWA repo is **never modified** by orchestrator-run tasks. Treat it as read-only reference.
```

- [ ] **Step 10.5: Update the Dev commands block**

Edit the `pnpm --filter @fivethreeone/mobile start` line — drop the trailing `# boot dev client` and change comment to `# boot Expo Go`. Drop the `Xcode 26+` prerequisite line; replace with: `- **Expo Go** installed on a physical device, or iOS Simulator / Android Emulator if doing JS-only work.`

- [ ] **Step 10.6: Update forbidden paths line**

Find the line that begins `Forbidden paths (never edit, regardless of plan):` and change it.

Change:

```
Forbidden paths (never edit, regardless of plan): `design-reference/`, `docs/superpowers/specs/`, `docs/superpowers/plans/`.
```

To:

```
Forbidden paths (never edit, regardless of plan): `~/Development/531-pwa/` (read-only reference), `docs/superpowers/specs/`, `docs/superpowers/plans/`.
```

- [ ] **Step 10.7: Verify the changes**

Run: `git diff CLAUDE.md | head -80`
Expected: the listed sections updated, no other text touched.

- [ ] **Step 10.8: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for Expo Go stack and PWA-as-reference"
```

---

## Task 11: Final verification

**Files:** none new

- [ ] **Step 11.1: Full CI chain**

Run: `pnpm run ci`
Expected: typecheck + lint + test all pass.

- [ ] **Step 11.2: Metro export smoke**

Run:
```bash
pnpm --filter @fivethreeone/mobile exec expo export --platform ios \
  --output-dir /tmp/expo-bundle-check --dump-sourcemap=false --dump-assetmap=false
```
Expected: exits 0.

- [ ] **Step 11.3: Manual Expo Go boot (interactive)**

Run: `pnpm --filter @fivethreeone/mobile start`. Scan with Expo Go. Expected: the "phase A boot" screen renders. Press `q` to stop.

- [ ] **Step 11.4: Confirm queue is orchestrator-ready**

Run: `bash .claude/skills/initial-implement/scripts/pick-next.sh`
Expected: `PB-01-tokens`.

- [ ] **Step 11.5: Confirm clean tree**

Run: `git status`
Expected: `nothing to commit, working tree clean`.

No final commit — every meaningful change was committed in its own task. Phase A is done. Next: `/initial-implement --batch` to begin Phase B.

---

## Self-review notes

- ✅ Spec §2 (Scope of the reset) → Tasks 2–5.
- ✅ Spec §3 (Stack) → Task 6 (deps), Task 7 (app.json), Task 8 (smoke boot).
- ✅ Spec §4 (Architecture / boundary rules) → queue tasks PB/PC/PD/PE enforce via `done_when`.
- ✅ Spec §5 (Phasing) → queue.yaml mirrors Phases B–F task-for-task.
- ✅ Spec §6 (Mobile UX defaults) → embedded in individual queue `done_when` (haptics, gorhom, keep-awake, status bar, refresh control, Reanimated transitions).
- ✅ Spec §7 (Testing) → queue tasks include in-memory sqlite integration tests, property tests, mocked-haptic tests.
- ✅ Spec §8 (Risks) → mitigations baked into queue `done_when` (PlateBar uses only View+flex; gorhom snap + back-button test; fonts gate splash; runMigrations boot helper).
- ✅ Spec §10 (Done definition) → covered by Tasks 11.1–11.4 plus PF-04 and PF-05.
- No placeholder steps. No "TBD" or "similar to". Every code block contains the actual code. Every command has expected output.
