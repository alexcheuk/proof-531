# RN Port from 531-PWA — Design Spec

> **Status:** Draft for review
> **Date:** 2026-05-22
> **Replaces:** `2026-05-19-expo-scaffold-design.md` (retired alongside this spec landing)
> **Behavioral reference:** `~/Development/531-pwa` (the running PWA)

---

## 1 · Goal

Replace the current `proof-531` Expo scaffold with a fresh React Native port of the
existing **531-PWA**. The RN app reproduces the PWA pixel-faithfully and ships in
**Expo Go** — no custom dev client, no native modules requiring `expo prebuild`.

Behavioral source of truth is the running PWA at `~/Development/531-pwa`. The current
`design-reference/*.jsx` mockups and the in-progress onboarding screens in
`apps/mobile/src/` are retired.

## 2 · Scope of the reset

**Wiped:**
- `apps/mobile/src/**` (tokens, fonts, primitives, onboarding work, all leftovers)
- `design-reference/`
- `docs/superpowers/specs/2026-05-19-expo-scaffold-design.md`
- `docs/superpowers/specs/TODO-*.md`
- `docs/superpowers/queue.yaml` (current Phase 1 / onboarding tasks)

**Survives:**
- Monorepo plumbing: `pnpm-workspace.yaml`, root scripts, Biome config, `tsconfig.base.json`
- Expo SDK 55 install in `apps/mobile/`
- `/initial-implement` orchestrator skill + `docs/superpowers/{specs,plans,queue.yaml,runs}/` workflow
- Boundary rules from `CLAUDE.md` (re-stated below — updated for the new stack)

## 3 · Stack

| Concern | Choice | Notes |
|---|---|---|
| Runtime | Expo SDK 55, React Native 0.81+, New Architecture **off** unless required | Expo Go compatible |
| Language | TypeScript strict, Biome | unchanged |
| Routing | `expo-router` (file-based) | tabs + stack |
| Persistence | `expo-sqlite` + **Drizzle ORM** | mirrors PWA's relational schema 1:1 |
| Query/caching | TanStack Query, wrapping Drizzle accessors | replaces `dexie-react-hooks` |
| Ephemeral UI state | Local `useState`/`useReducer` first; Zustand only where it earns its keep | |
| Styling | Handwritten primitives over typed `tokens.ts` | no Tailwind/NativeWind/shadcn |
| Fonts | `expo-font` bundling IBM Plex Sans, Mono, Sans Condensed (TTF) | matches PWA |
| Modal sheet | `@gorhom/bottom-sheet` v5 | Reanimated + Gesture Handler, both Expo Go ✓ |
| Bottom nav | `expo-router` `Tabs` with a custom tab bar matching the PWA | |
| Plate visuals | Plain `View`s with `flex` proportional widths | **no SVG, no Skia** |
| Haptics | `expo-haptics` | Tap on every primary action, success on set-complete, notification on PR |
| Blur | `expo-blur` | sheet backdrops |
| Audio | `expo-av` | rest-timer chime |
| Unit tests | Jest + `@testing-library/react-native` + `fast-check` (domain) | |
| E2E | **None.** | per user direction — skipped |
| Error tracking / analytics | **Deferred.** | Sentry / PostHog require dev client |

**Expo Go landmines explicitly avoided:** `react-native-skia`, `@sentry/react-native`,
`posthog-react-native`, `react-native-mmkv`, `react-native-purchases`.

## 4 · Architecture

### 4.1 Folder layout

```
apps/mobile/
  assets/fonts/                       # IBM Plex TTFs (Sans, Mono, Sans Condensed)
  src/
    app/                              # expo-router routes — THIN shells
      _layout.tsx                     # theme + query client + fonts gate + sheet provider
      onboarding.tsx
      (tabs)/
        _layout.tsx                   # custom tab bar
        index.tsx                     # Home
        history.tsx
        settings.tsx
      session/
        today.tsx
        live.tsx
        complete.tsx

    design/                           # ONLY place hex/px literals live
      tokens.ts
      theme.ts
      fonts.ts
      primitives/                     # one file each
        Box, Text, Button, PrimaryPillButton, MonoBadge, SectionBand,
        TitleBlock, SegRail, NumberStepper, CheckboxLedger, LedgerRow,
        LedgerSection, Sheet, CtaBar, Masthead, StatGrid, TopSetBlock,
        PlateBar  (flex Views)

    domain/                           # PURE — no React, no async, no DB
      types, epley, increments, schemes, plates, units, labels, summary

    data/                             # ONLY place that touches the DB
      drizzle/{schema,client,migrations/}
      accessors/{settings,trainingMax,session,setLog,prs,onboarding}
      queries/                        # TanStack Query hooks wrapping accessors

    features/                         # composition — no barrels
      onboarding/{OnboardingScreen, components/, steps/, hooks/, lifts.ts}
      home/{HomeScreen, components/, hooks/}
      session/{TodayScreen, LiveScreen, SessionCompleteScreen, components/, hooks/}
      history/{HistoryScreen}
      settings/{SettingsScreen, components/, hooks/, lifts.ts, nextEnabledLifts.ts, plateSetMapping.ts}

    lib/
      haptics.ts                      # tap/success/warn wrappers
      time.ts
```

### 4.2 Import direction (one-way; reviewer-enforced)

```
app → features → (design | data | domain)
data → domain (types only)
domain → (nothing internal)
```

Reviewer rejects any violation, plus:
1. Hex/px literals outside `design/`.
2. `import React`, `async`, or DB import inside `domain/`.
3. Drizzle import outside `data/`.
4. Barrel files inside `features/` or `domain/`.

### 4.3 Data model

Ported 1:1 from PWA `src/db/schema.ts`. Tables, columns, and types match. Differences:
- `id` columns are SQLite `INTEGER PRIMARY KEY AUTOINCREMENT` (Drizzle).
- `enabledLifts: Lift[]` stored as JSON-encoded text column.
- All timestamp columns are SQLite `INTEGER` (milliseconds since epoch).

Tables: `settings` (singleton, id=1), `training_maxes` (versioned, append-only),
`sessions` (with `training_max_snapshot` + `unit_snapshot` for mid-session safety),
`set_logs`, `prs`.

### 4.4 Domain math

Lifted from PWA `src/features/session/domain/*` and promoted to top-level
`src/domain/` because the math is reused by Home, History, Settings — not session-only.
PWA's colocation works only because TS imports there are unrestricted; the boundary
rules in this project mandate the hoist.

Property tests via `fast-check`:
- `plates.decompose(target, plateSet)` sums (within rounding) to `target`.
- `units.round(x, unit)` is idempotent.
- `increments.next(currentTm, lift)` returns `currentTm + 5` for upper, `+10` for lower.

## 5 · Phasing

Phases are ordered; tasks within a phase parallelize where `depends_on` allows.
Each becomes a row in `docs/superpowers/queue.yaml` for `/initial-implement`.

**Phase A — Reset (manual, single commit, not orchestrated)**
- A-01 Delete `apps/mobile/src/*`, `design-reference/`, old specs & TODOs, old `queue.yaml`.
- A-02 Update `CLAUDE.md`: stack reset (drop Skia/Sentry/PostHog, drop "Dev Client"
  language, point `design-reference` references at `~/Development/531-pwa`).
- A-03 Re-scaffold minimal `apps/mobile/src/app/_layout.tsx` rendering an empty view.
  Confirm Expo Go boots.

**Phase B — Design system**
- B-01 `tokens.ts` (colors, type scale, radii, spacing) ported from PWA `globals.css`.
- B-02 Theme provider + `useTheme`.
- B-03 IBM Plex fonts via `expo-font`; root layout gates on `useFonts()`.
- B-04..B-12 Primitives, one per file, each with a Jest test + zero hex outside `design/`.

**Phase C — Domain (TDD)**
- C-01..C-07 types, epley, units, plates, increments, schemes, labels+summary.
  Property tests where applicable. Red → green → commit per file.

**Phase D — Data**
- D-01 Drizzle + `expo-sqlite` init.
- D-02 Migration `0001_init.sql`; auto-runs on boot.
- D-03 Accessors (ported 1:1 from PWA `db/accessors/`).
- D-04 TanStack Query hooks layer over accessors.
- D-05 `latestByLift` analytic query.

**Phase E — Features (parallelizable, one queue item per screen)**
- E-01 Onboarding (Intro → PickLifts → OneRmEntry → Review)
- E-02 Home (CycleStrip, LiftTabs, LiftPage, LiftStats)
- E-03 Session/Today
- E-04 Session/Live (LiveBigWeight, RestPhase, RestTimer, AmrapLogSheet, CancelConfirmSheet)
- E-05 Session/Complete (PRCertificate, ReceiptRow, DateStamp)
- E-06 History
- E-07 Settings + TmEditSheet
- E-08 Tab layout + custom bottom nav

**Phase F — Integration polish**
- F-01 Haptics wiring (set complete → success; PR → notification; sheet snap → tap; primary CTA → light).
- F-02 Empty/loading/error states sweep.
- F-03 First-launch routing: no settings row → onboarding, else → home.
- F-04 Manual screenshot pairs vs PWA per feature, attached to each PR.
- F-05 CI green: `pnpm run ci` + `expo export --platform ios` Metro smoke.

**Estimated queue size: ~40 items.**

## 6 · Mobile UX defaults

These are decided up-front rather than per-screen. Workers implementing features apply
them by default; deviation requires a callout in the PR description.

- **Bottom sheets:** `@gorhom/bottom-sheet` v5 with native physics. Snap points
  documented per sheet. Backdrop tap dismisses. Pan-down dismisses. Hardware-back
  closes the sheet, not the screen, on Android.
- **Haptics:**
  - `Haptics.selectionAsync()` on tab switch, lift tab switch, segmented control.
  - `Haptics.impactAsync('light')` on every primary button press.
  - `Haptics.notificationAsync('success')` on set complete and session complete.
  - `Haptics.notificationAsync('warning')` on cancel-confirm.
- **Rest timer:** countdown with `expo-haptics` warning at T-3s and a single chime via
  `expo-av` at T-0. Screen stays awake during a session (`expo-keep-awake`).
- **Status bar:** dark canvas → light status-bar content per screen via
  `expo-status-bar` in screen-level shells.
- **Pull-to-refresh:** History screen only.
- **Swipe-back:** native iOS gesture preserved; expo-router default.
- **Layout transitions:** Reanimated `LinearTransition` on `LiftTabs` and `CycleStrip`
  when the lift switches.
- **Safe areas:** root `SafeAreaProvider`, screen-level `SafeAreaView` only where
  needed; tab bar respects bottom inset.
- **Splash:** Expo splash screen held until `useFonts()` resolves; no font-flash.
- **Keyboard:** `KeyboardAvoidingView` around any numeric-stepper sheet
  (OneRmEntry, TmEdit, AmrapLog).

## 7 · Testing strategy

- **Domain:** Jest + `fast-check`, red→green→commit, ≥1 property test per pure module.
- **Primitives:** `@testing-library/react-native` render tests asserting tokens
  applied and accessibility props present. No pixel snapshots.
- **Features:** behavior tests against query hooks backed by an in-memory SQLite
  (`expo-sqlite`'s `:memory:`). Mock the minimum; DB integration tests hit real SQLite.
- **Manual:** per-feature screenshot pair (RN vs PWA) attached to each PR description.
- **CI:** `pnpm run ci` (typecheck + lint + Jest) plus
  `pnpm --filter @proof-531/mobile exec expo export --platform ios --output-dir /tmp/x`
  as a Metro-resolution smoke (catches the `ts-dedent` class of bug).
- **No e2e harness.** No Maestro, no Playwright, no device farm. Revisit when shipping.

## 8 · Risks and mitigations

1. **Gorhom sheet stacking.** PWA's `ModalSheetContext` is a stack; Gorhom is
   single-root. Mitigation: start single; if AMRAP + Cancel ever need to layer, drop
   the secondary one to a native `Modal` overlay.
2. **PlateBar parity with plain Views.** Should be trivial — proportional widths via
   `flex: <plateValue>`. Validate against PWA screenshots in B-12 acceptance.
3. **Font flash on cold start.** Mitigated by `useFonts()` + held splash.
4. **Drizzle + expo-sqlite version drift.** Pin to versions known good for SDK 55;
   bake a `runMigrations()` helper at boot rather than relying on CLI codegen.
5. **Reanimated babel plugin omission.** A-03 acceptance includes a worklet smoke.
6. **Custom tab bar.** Use `Tabs.tabBar={(props) => <CustomTabBar {...props} />}`.

## 9 · Out of scope

- Data import from existing PWA users (treated as a fresh install).
- iOS/Android native error reporting (Sentry deferred).
- Analytics (PostHog deferred).
- Deep linking (expo-router gives it for free if/when needed).
- Tablet/iPad layout (phone-only).
- Localization (English-only).
- Light theme (dark-only, matching PWA).
- Accessibility audit beyond default `accessibilityRole` + `accessibilityLabel` on
  interactives. (A11y polish lives in a future spec.)

## 10 · Done definition

- `apps/mobile/` boots in Expo Go.
- Every PWA screen has a pixel-faithful RN counterpart.
- All Drizzle tables and accessors match the PWA's Dexie shapes.
- `pnpm run ci` is green, including Metro export smoke.
- Each feature PR has a side-by-side RN/PWA screenshot pair.
- Boundary rules pass: no hex outside `design/`, no React/DB in `domain/`,
  no Drizzle outside `data/`, no barrels in `features/`.
