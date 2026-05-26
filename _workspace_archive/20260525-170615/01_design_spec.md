# Design spec: Progress screen (single-lift cycle×day grid)

## Intent

A scannable "where am I, where am I going" view for a single lift. The lifter
opens this screen on a chosen lift and instantly sees: their current cycle, the
AMRAP performance behind them (top-set weight × reps), the projected weights
ahead, the e1RM trajectory per cycle, and how many cycles until they cross
their e1RM goal. It is meant to make slow 5/3/1 progress *feel* legible — the
kind of thing a lifter would draw in a notebook. Aesthetic: e-ink ledger,
monochrome. No charts, no curves; a grid that reads like a printed training
log. Reached from TODAY by tapping the lift name; swipe between the 4 lifts.

## PWA reference

The PWA at `~/Development/531-pwa/` has **no Progress screen** — `HistoryScreen.tsx`
is a placeholder. Progress is **net-new** for mobile. These PWA files supply
the visual / mathematical / interaction vocabulary the spec aligns with:

- `~/Development/531-pwa/src/features/home/components/CycleStrip.tsx` —
  e-ink cell vocabulary: `bg-ink-0` (active/filled), corner `✓` glyph (done),
  `text-ink-3 opacity-70` (ghosted/future), `border border-line-strong` outer,
  `border-l border-line` between cells. **Ported wholesale** as the grid-cell
  visual baseline. The Progress grid generalizes the same vocabulary across N
  rows instead of 1.
- `~/Development/531-pwa/src/features/session/domain/epley.ts` — Epley 1RM
  formula `weight × (1 + reps/30)` with `reps === 1` short-circuit. **Already
  ported** to `apps/mobile/src/domain/epley.ts` as `estimateOneRm`. Spec
  reuses verbatim.
- `~/Development/531-pwa/src/features/session/domain/schemes.ts` — week scheme
  table (5·5·5+ / 3·3·3+ / 5·3·1+ / Deload) with `setsForWeek(week)` returning
  the percentage + rep prescription. **Already ported** to
  `apps/mobile/src/domain/schemes.ts` as `prescription(week)` / `setsForWeek`.
  Spec reuses verbatim for projecting future top-set weights.
- `~/Development/531-pwa/src/features/session/domain/increments.ts` — per-cycle
  TM bump rules (+5 lb upper / +10 lb lower; +2.5 kg / +5 kg). **Already
  ported** to `apps/mobile/src/domain/increments.ts` as `tmIncrement`/`nextTm`.
  Spec reuses verbatim for the cycle-over-cycle TM projection used by future
  rows.
- `~/Development/531-pwa/src/features/history/HistoryScreen.tsx` — establishes
  the tab-screen chrome (Masthead + TitleBlock). Progress reuses the Masthead
  pattern but is **not** itself a tab — it's a stack-pushed sub-screen, so the
  TitleBlock is replaced with a Progress-specific top region (lift name,
  pager dots, goal strip). See "Per-screen breakdown" below.
- `~/Development/531-pwa/src/features/session/SessionCompleteScreen.tsx` —
  the past-cell tap target. **Already ported** to
  `apps/mobile/src/features/session/SessionCompleteScreen.tsx`, reachable via
  `goTo.complete(router, sessionId, { from: 'history' })`. The Progress
  screen routes to it with `{ from: 'history' }` for back-affordance parity
  with how History entries already open it.
- `~/Development/531-pwa/src/features/home/HomeScreen.tsx` /
  `apps/mobile/src/features/home/HomeScreen.tsx` — defines the TODAY screen
  with a horizontal `pagingEnabled` FlatList of `LiftPage`s. **Existing.** The
  Progress screen's lift-pager mirrors this exact pattern — same FlatList,
  same `useHomeCarouselSync`-style page sync — so swiping the Progress pager
  feels identical to swiping TODAY.

**Net-new:** the multi-cycle grid layout, the e1RM goal model (data table +
sheet UI), the projection math (`projectFutureCycles`, `projectE1RMForFuture`,
`cyclesUntilGoal`, `bestE1RMForCycle`), the achievement glyph + dashed
goal-rule. These have no PWA antecedent.

## Screens & flow

```
                ┌──────────────────────────┐
                │  TODAY (tabs/index)      │
                │  • LiftPageTitle "Squat" │
                │  ─ tap title ────────────┼──┐
                └──────────────────────────┘  │
                                              │  router.push
                                              ▼
                ┌─────────────────────────────────────────┐
                │  PROGRESS /progress/[lift]              │
                │  ┌─── lift pager (FlatList) ─────────┐  │
                │  │ press │ deadlift │ bench │ squat │  │
                │  └────────────────────────────────────┘ │
                │                                         │
                │  ─ tap goal strip ──┐                   │
                │                     │                   │
                │  ─ tap past cell ──┐│                   │
                │                    ││                   │
                └────────────────────┬┬───────────────────┘
                  back ↑              ▼▼
            ┌──────────┐  ┌────────────────┐  ┌──────────────────┐
            │ TODAY    │  │ GoalSheet      │  │ SessionComplete  │
            │          │  │ (bottom sheet) │  │ /session/        │
            │          │  │ • NumberStepper│  │ complete?        │
            │          │  │ • Save / Clear │  │ sessionId=X      │
            │          │  └────────────────┘  │ &from=history    │
            └──────────┘                      └──────────────────┘
```

- **Entry:** push from TODAY's `LiftPageTitle` (the giant "Squat." headline) →
  `router.push({ pathname: '/progress/[lift]', params: { lift } })`. Pager
  enters on the tapped lift; user can swipe between the 4 enabled lifts.
- **Back:** hardware/swipe back → returns to TODAY (whichever tab). Stack
  default is correct here — no custom `useHardwareBack`.
- **Goal sheet:** opens over the Progress screen via `@gorhom/bottom-sheet` v5
  (`Sheet` primitive). Dismiss closes the sheet, Progress remains.
- **Past cell → SessionComplete:** `goTo.complete(router, sessionId, { from: 'history' })`.
  Back from SessionComplete returns to Progress (stack push). Origin parameter
  `from: 'history'` keeps SessionComplete's CTA matrix sensible — it already
  handles this case for History-tab entries.
- **Future cell tap:** no-op (read-only). Render as non-interactive (`<View>`,
  no `Pressable`) so VoiceOver does not announce a phantom button.
- **Deep link:** `/progress/squat` works directly. Invalid lift → redirect
  home (use `isLift` guard in route shell, identical to `app/session/today.tsx`
  pattern).
- **No tab nav change:** bottom tabs remain TODAY / HISTORY / YOU.

## Per-screen breakdown

### Progress screen

#### Layout (top → bottom)

```
┌── Masthead (existing primitive) ────────────────────────────┐
│   "531 . ledger"            ← back chip (CapsLabel "‹ TODAY")│
├──────────────────────────────────────────────────────────────┤
│  ProgressHeader (per-lift, swappable via pager)              │
│   ┌── LiftNameStrip ────────────────────────────────┐        │
│   │           SQUAT                                  │        │
│   │      TM 230 lb · e1RM 248 lb                     │        │
│   └──────────────────────────────────────────────────┘        │
│   ┌── PagerDots ────────────────────────────────────┐        │
│   │            ○   ●   ○   ○                         │        │
│   └──────────────────────────────────────────────────┘        │
│   ┌── GoalStrip (Pressable) ────────────────────────┐        │
│   │  ╌╌╌╌╌╌╌  GOAL · e1RM 285 lb  ╌╌╌╌╌╌╌           │        │
│   │            ~4 cycles to go                       │        │
│   └──────────────────────────────────────────────────┘        │
├──────────────────────────────────────────────────────────────┤
│  ScrollView (vertical, anchored to current cycle)            │
│   ┌── ProgressGridHeader ───────────────────────────┐        │
│   │       D1     D2     D3    Deload   e1RM         │        │
│   └──────────────────────────────────────────────────┘        │
│   ┌── ProgressGridRow (one per cycle) ──────────────┐        │
│   │  C5  ▓190▓ ▓210▓ ▓230▓ ▓140▓  245              │ past   │
│   │      ×7    ×4    ×2    ✓                       │        │
│   │                                                 │        │
│   │  C7  ▓200▓ ▓220▓ ┃240┃ ·150·  262              │ ◄ now  │
│   │      ×6    ×4    ×3    ─                       │        │
│   │                                                 │        │
│   │  C8  ·205· ·225· ·245· ·155·  268              │ future │
│   │  C9  ·210· ·230· ·250· ·160·  275              │        │
│   │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  GOAL 285 ─ ─ ─ ─ ─ ─  │ goal   │
│   │  C11 ·220· ·240· ·260· ·170·  288 ★            │        │
│   └──────────────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────────────┘
```

**Sizing rules:**

- Page horizontal gutter = `layout.gutter` (24 px), matching the rest of the
  app.
- LiftNameStrip headline = 56 px (one step down from `LiftPageTitle.tsx`'s
  64 px — the headline isn't this screen's primary affordance). Use
  `Text variant="sans" weight="bold" size={56}` with `letterSpacing: -2.24`
  (-0.04em × 56) and `lineHeight: 64`. Lowercased lift name with the same
  amber-period treatment as `LiftPageTitle`.
- Subline `TM {n} · e1RM {n}` rendered as `CapsLabel size="sm" color="ink2"`,
  `marginTop: spacing.xs`.
- PagerDots block height = 16 px; dot size 6 px, gap `spacing.sm`; vertical
  margin `spacing.md` above and below.
- GoalStrip block height ~64 px; padding `spacing.md` vertical,
  `spacing.lg` horizontal; full-bleed dashed top and bottom rules.
- Grid header row height 28 px; column widths via flex distribution: 4 day
  cells `flex: 1` each, e1RM column `flex: 0.8`. Outer border
  `colors.lineStrong`, inter-cell `colors.line` (mirrors CycleStrip).
- Grid row height = 56 px (room for weight + ×reps stacked); deload row
  has the same height for visual rhythm.
- Goal-rule row height = 18 px; dashed horizontal rule using a `Divider`
  variant (see "New primitives").
- Achievement glyph (★) inline-trailing the e1RM cell on the cycle where
  projected e1RM ≥ goal.

**Safe areas:** Top inset handled by the shared `Masthead` (already accounts
for status bar). Bottom inset handled by `ScrollView` `contentInset` /
`contentContainerStyle.paddingBottom: spacing.xxl` so the last future cycle
isn't pinned against the home indicator.

**Scroll behavior:**

- Show **current cycle + 6 future cycles** by default. Anchor the initial
  scroll so the current-cycle row sits at the top of the scroll viewport's
  visible area (just under the header). Implementation hint for the frontend
  agent: render `ScrollView` with `contentOffset.y` derived from past-row
  count × row height, or use a `FlatList`'s `initialScrollIndex` if the row
  count is large enough to want windowing.
- Past cycles available by scrolling **up** (negative direction from the
  anchor).
- Goal-rule row is a real list item (renders only when goal is set AND
  projection crosses it).
- No sticky header; the lift name + goal strip scroll with the content. The
  Masthead does not scroll (it sits in the route shell, outside the
  ScrollView).
- Pager (horizontal FlatList) wraps the entire screen body **below** the
  Masthead. Each page is a vertical `ScrollView` with its own
  ProgressHeader + grid for that lift, so swiping reveals an independent
  vertical scroll position per lift. This mirrors `HomeScreen`'s nested
  list/page structure.

#### Tokens used (from `apps/mobile/src/design/tokens.ts`)

| Region                       | Token reference                            |
|------------------------------|--------------------------------------------|
| Page background              | `colors.bg0`                               |
| Masthead text                | `colors.ink0` / `colors.ink3`              |
| Lift headline                | `colors.ink0` (period: `colors.amber`)     |
| Sub-line (TM · e1RM)         | `colors.ink2`                              |
| PagerDots — active           | `colors.ink0`                              |
| PagerDots — inactive         | `colors.ink3`                              |
| GoalStrip background         | `colors.bg0` (no fill — dashed rules only) |
| GoalStrip dashed rule        | `colors.lineStrong`                        |
| GoalStrip label              | `colors.ink2` (caps), value `colors.ink0`  |
| Grid outer border            | `colors.lineStrong`                        |
| Grid inter-cell line         | `colors.line`                              |
| Grid header label            | `colors.ink3`                              |
| Cell — filled (past)         | bg `colors.ink0`, fg `colors.bg0`          |
| Cell — outlined (last done)  | bg `colors.bg0`, border 2 px `colors.ink0` |
| Cell — ghosted (future)      | bg `colors.bg0`, fg `colors.ink3`, dashed outline `colors.line` |
| Goal-rule (dashed across grid)| `colors.lineStrong`                       |
| ★ achievement glyph          | `colors.ink0`                              |
| ✓ deload-done glyph          | `colors.ink2`                              |
| em-dash (deload future)      | `colors.ink3`                              |
| Fonts (numbers)              | `type.mono`                                |
| Fonts (caps labels)          | `type.mono`                                |
| Fonts (lift headline)        | `type.sans`                                |
| Spacing                      | `spacing.xs`/`sm`/`md`/`lg`/`xl`/`xxl`     |
| Radii                        | None (grid is square; no rounded corners — matches CycleStrip) |
| Motion                       | `motion.durationBase` / `motion.easeStandardBezier` for any pager-snap follow-through (gestures are handled by FlatList's native paging — minimal explicit animation needed) |

**Proposed new tokens (none strictly required):**

- The "ghosted dashed outline" cell style could either (a) be drawn with a
  `borderStyle: 'dashed'` on a `View` using `colors.line` (RN supports dashed
  borders, with platform quirks on Android), or (b) emulated with a series of
  short `View` segments. **Recommendation:** use `borderStyle: 'dashed'` and
  accept the platform quirk; if Android renders unevenly, fall back to an SVG
  via `react-native-svg` (already in the stack via Reanimated? Verify; if not
  in deps, prefer the plain border to avoid a new dependency). No new token
  needed. If Android dashing proves visually broken in QA, propose
  `borders.dashed` later as a styled-segment helper rather than a token.

#### Per-cell visual treatments (mapped from the brief's ▓ / ┃ / · vocabulary)

| Treatment | Brief glyph | Mobile rendering                                                              | When |
|-----------|-------------|-------------------------------------------------------------------------------|------|
| Filled    | `▓`         | `backgroundColor: colors.ink0`, weight text `colors.bg0`, reps text `colors.paperMuted` | Past completed days (every cell of every completed cycle except the most-recent day). |
| Outlined  | `┃`         | `backgroundColor: colors.bg0`, `borderWidth: 2`, `borderColor: colors.ink0`, text `colors.ink0` | The most-recent completed day across all cycles — the single "you are here" cell. |
| Ghosted   | `·`         | `backgroundColor: colors.bg0`, `borderWidth: 1`, `borderStyle: 'dashed'`, `borderColor: colors.line`, text `colors.ink3` | Future / projected days (current-cycle days that haven't happened yet, plus all days of future cycles). |
| Deload ✓ | `▓140▓ ✓`  | Same as Filled, with the `✓` glyph centered in place of `×N` on the second line. | Completed deload days. |
| Deload —  | `· ─ ·`     | Same as Ghosted, with an em-dash (`─`) in place of `×N`/`✓`.                  | Future deload days. |
| e1RM cell — past | `245` | Right-column, mono, no border, weight color `colors.ink0`, sub-line cycle number to the left (already in row label).| Per-cycle actual e1RM (max across that cycle's AMRAP sets). |
| e1RM cell — future | `268` | Same, color `colors.ink2` to read as "projected".                          | Per-cycle projected e1RM. |
| Goal-rule | `╌╌╌╌╌`     | Full-width dashed `View` (1 px tall, `borderTopWidth: 1`, dashed, `colors.lineStrong`), with a centered `CapsLabel`: `GOAL 285 lb`. Inserted between the two cycle rows whose projected e1RMs straddle the goal. | Visible only when a goal is set AND projection crosses it within the rendered range. |
| Achievement ★ | `★`     | Inline-trailing the e1RM number, `colors.ink0`, mono, 1 px gap. Applied to the **first future cycle** whose projected e1RM ≥ goal. | Same condition as goal-rule. |

These mappings are a direct generalization of the PWA's CycleStrip vocabulary:
filled = `bg-ink-0`, ghosted = `text-ink-3 opacity-70`. The outlined "you are
here" treatment is net-new (CycleStrip's "you are here" is implied by the
active fill alone, but Progress has *N* completed cells, so we need an extra
treatment to distinguish "the last one you finished" from the rest of the
filled-past block).

#### States

- **Empty (brand-new user, zero completed cycles for this lift):**
  - Goal strip renders the "no goal set" state (see below).
  - Grid renders 7 ghosted future rows starting at `C{currentCycle}` (i.e.
    `C1` for a fresh install). No outlined "you are here" cell — there is
    no completed day to anchor it to. The current-cycle row is still
    ghosted (no completed cells yet) but is labeled with a small caps
    eyebrow `CURRENT CYCLE` to the left of the row label `C1`, so the
    user understands which row they're on.
  - Below the grid (still within the ScrollView), render a single
    `CapsLabel` line centered: `LOG A SESSION TO LIGHT UP THIS GRID`,
    `colors.ink3`. No CTA — TODAY is the place to start a session, this
    screen does not duplicate it.
  - No goal-rule, no ★.

- **Goal strip "no goal set":**
  - Single Pressable row, dashed top + bottom rules same as goal-set state.
  - Copy line 1 (caps, `colors.ink2`): `SET AN e1RM GOAL`
  - Copy line 2 (mono small, `colors.ink3`): `TAP TO PICK A TARGET`
  - Tap → opens the same GoalSheet, NumberStepper seeded at the lift's
    current best e1RM rounded up to the next 5 (or 100 if there's no
    history yet, in display unit).

- **Loading:**
  - Whole-screen Skeleton scaffold: Masthead (real), then a Skeleton block
    for the headline (`width: '60%'`, `height: 56`), a Skeleton block for
    the goal strip (`height: 64`), and 7 Skeleton rows
    (`height: 56`). Mirrors `HomeSkeleton.tsx`'s approach — paper-toned
    placeholders, no pulse.

- **Error:**
  - Wrap the content in the existing `QueryShell` primitive
    (`apps/mobile/src/features/shared/QueryShell.tsx`, already used by
    HomeScreen). It surfaces a retry affordance. Same chrome as Home;
    visual parity matters here so users don't see an unfamiliar error UI.

- **Success:** the happy-path layout above.

#### Interactions

- **Tap lift headline** (on TODAY) → push Progress with `lift` param.
  Hit-target the entire `LiftPageTitle` Pressable; minimum tappable area
  64 × 64 (the headline is already 64 px tall — wrap in `Pressable` with
  `hitSlop: { top: spacing.sm, bottom: spacing.sm }`). Haptic:
  `Haptics.selectionAsync()` on press-in (matches PWA's tab-style feedback).
  **This is a follow-up edit** to `LiftPageTitle.tsx` and must be called
  out as such in the frontend implementation (the title is currently a
  plain `Text`, not a `Pressable`).

- **Horizontal swipe** between lifts → `pagingEnabled` `FlatList`,
  `onMomentumScrollEnd` updates the route's lift param via
  `router.setParams({ lift })`. Pattern lifted directly from
  `useHomeCarouselSync.ts` — frontend agent should reuse the hook or copy
  its structure into a sibling `useProgressCarouselSync.ts`. PagerDots
  reflect `selectedLift`. No haptics on swipe (matches Home — repeated
  haptics during a swipe feel noisy).

- **Tap PagerDots:** non-interactive in v1 (Home's `LiftTabs` is tappable,
  but Progress uses dots-only per locked decision). Decorative only.

- **Tap goal strip** → opens `GoalSheet` (Sheet primitive). Haptic:
  `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` on press
  (handled automatically by the Sheet primitive on open).

- **Tap past cell** → `goTo.complete(router, sessionId, { from: 'history' })`.
  Haptic: `Haptics.selectionAsync()` on press-in. Cell must expose a
  `Pressable` with `accessibilityRole="button"` and `hitSlop` so the
  effective tap target is ≥44pt even though the visible cell may be ~48 px
  wide × 56 px tall (already ≥44 in both axes; `hitSlop` is a safety net).

- **Tap future cell** → no-op. Render as `View` (not `Pressable`).
  Accessibility-role: none. VoiceOver announcement only describes the cell
  (see Accessibility).

- **Tap outlined "you are here" cell:** treat as a past cell (it IS a
  completed day — same `goTo.complete` target).

- **Animations:** none beyond the FlatList's native page-snap. Goal-rule
  appearance is not animated (per "Out of scope" in the brief). Reduced-
  motion is a no-op since there are no explicit animations on this screen.

- **Pull-to-refresh:** not in v1. (The data is already live via TanStack
  Query invalidation when a session completes; manual refresh is
  redundant.)

#### Accessibility

- **Screen role:** entire screen wrapped in `View` with
  `accessibilityRole: 'none'`; rely on per-element roles.

- **Lift headline:** `accessibilityRole: 'header'`,
  `accessibilityLabel: '{Lift} progress'`.

- **Pager:** `accessibilityRole: 'tablist'` on the FlatList wrapper;
  each LiftPage announces `accessibilityLabel: '{Lift} progress, {index} of
  {count}'`. PagerDots are `accessibilityElementsHidden: true` on iOS /
  `importantForAccessibility: 'no-hide-descendants'` on Android — purely
  decorative; the page itself reads the position.

- **Goal strip (no goal):** `accessibilityRole: 'button'`,
  `accessibilityLabel: 'Set an e1RM goal'`,
  `accessibilityHint: 'Opens a sheet to pick a target'`.

- **Goal strip (goal set):** `accessibilityRole: 'button'`,
  `accessibilityLabel: 'e1RM goal {N} {unit}, about {M} cycles to go'`,
  `accessibilityHint: 'Opens a sheet to edit the target'`.

- **Grid header row:** `accessibilityElementsHidden: true` — redundant
  with the per-cell announcements that include "Day 1" etc.

- **Past cell:** `accessibilityRole: 'button'`,
  `accessibilityLabel:` `'Cycle {C}, day {D}: top set {weight} {unit} for
  {reps} reps'` (deload variant: `'… deload set logged'`).
  `accessibilityHint: 'Opens the session detail'`.

- **Outlined "you are here" cell:** same as past cell, but label is
  prefixed `'Most recent. '` so screen-reader users hear the anchor.

- **Future cell:** `accessibilityRole: 'text'` (non-interactive),
  `accessibilityLabel: 'Cycle {C}, day {D}: projected {weight} {unit}'`.

- **e1RM cell — past:** `accessibilityLabel: 'Cycle {C} estimated 1RM
  {value} {unit}'`.

- **e1RM cell — future:** `accessibilityLabel: 'Cycle {C} projected
  estimated 1RM {value} {unit}'`.

- **Goal-rule row:** `accessibilityLabel: 'Goal line, {N} {unit}'`.

- **Achievement ★:** rendered as a child of the e1RM cell, with the cell's
  label extended: `'… projected to reach goal'`.

- **Focus order:** top-to-bottom, left-to-right per row. The grid header is
  hidden (above), so the first focusable cell after the goal strip is
  `Cycle {first-rendered}, day 1`.

- **Hit targets:** every interactive element ≥44 × 44 pt. Goal strip is
  full-width × 64 pt (well over). Past cells are ~48 × 56 with
  `hitSlop` of `{ top: 4, bottom: 4 }` to clear 44 pt vertically; horizontal
  is already ≥44 at typical widths.

- **Reduced-motion:** no animations on this screen, so reduced-motion is a
  no-op. The pager's native snap follows the OS reduced-motion setting
  automatically.

### Goal sheet

#### Layout

A `Sheet` (bottom sheet) at the standard `50%` snap point. Inside, use the
existing `SheetLayout` primitive for the title-row + body + actions chrome.

```
┌────────────────────────────────────────┐
│  ═════ (grabber, auto)                  │
│                                         │
│  GOAL · SQUAT e1RM           ✕ close   │
│  ───────────────────────────────────    │
│                                         │
│           ┌─────────┐                   │
│           │  − 285 + │   lb              │
│           └─────────┘                   │
│                                         │
│         in ~4 cycles                   │
│                                         │
│  [    Save goal    ]                    │
│      Clear goal                         │
└────────────────────────────────────────┘
```

- Title (caps eyebrow): `GOAL · {LIFT} e1RM`
- Body centered: a `NumberStepper` (existing primitive). Step = display
  unit's plate step (5 lb / 2.5 kg) via `round()`. Initial value =
  current goal if set, else `round(bestE1RM × 1.15, displayUnit)` (a
  reasonable stretch), else `round(currentTm × 1.15, displayUnit)`, else
  100 (lb) / 50 (kg).
- Live recompute line below stepper: `in ~{M} cycles` updates as the
  user steps. When `M === 0`, render `already past — pick a higher
  target`.
- Actions: `PrimaryPillButton` "Save goal"; below it, a secondary
  `SecondaryLink` "Clear goal" (only shown when a goal currently exists).

#### Tokens used

| Region        | Token                                            |
|---------------|--------------------------------------------------|
| Sheet bg      | `colors.bg0` (default, supplied by Sheet)        |
| Title eyebrow | `colors.ink2`                                    |
| Stepper value | `colors.ink0`, `type.mono`                       |
| Sub line      | `colors.ink3`                                    |
| CTA           | `PrimaryPillButton` defaults                     |
| Clear link    | `SecondaryLink` defaults (already `colors.ink2`) |

#### States

- **Loading (initial mount while query resolves):** Skeleton in body
  (`height: 64` for the stepper, `height: 12` for the sub-line). Rare —
  the goal query is small.
- **No prior goal:** stepper seeded as above; "Clear goal" hidden.
- **Existing goal:** stepper seeded to current; "Clear goal" visible.
- **Saving:** optimistic — the goal strip on the underlying screen
  updates immediately on Save tap. Sheet closes immediately.
- **Save error:** rollback the optimistic update; surface a toast-free
  inline error in the goal strip ("couldn't save — tap to retry"). This
  is acceptable for the single-row case; a banner is heavier than the
  failure warrants.

#### Interactions

- Stepper press-and-hold accelerates per existing `NumberStepper`
  behavior. Haptics on each step (per primitive default).
- Save → calls the mutation, closes the sheet. Haptic:
  `Haptics.notificationAsync(Success)`.
- Clear → same mutation with `null` value, closes sheet. Haptic: same.
- Backdrop tap / pan-down → dismisses without saving (standard Sheet
  behavior).

#### Accessibility

- Sheet inherits gorhom's accessibility defaults (modal trap).
- Stepper labels read by the underlying `NumberStepper` primitive.
- `Save goal` button: `accessibilityLabel: 'Save goal of {N} {unit}'`,
  state read via `accessibilityState: { busy: isSaving }`.
- Reduced-motion: gorhom respects OS reduced-motion for the open/close
  spring.

## Data contract

### New Drizzle table: `lift_goals`

Append to `apps/mobile/src/data/drizzle/schema.ts`:

```ts
export const liftGoals = sqliteTable('lift_goals', {
  lift: text('lift', { enum: ['squat', 'bench', 'deadlift', 'press'] }).primaryKey(),
  targetE1RM: real('target_e1rm').notNull(),       // stored in storageUnit
  unit: text('unit', { enum: ['lbs', 'kg'] }).notNull(),
  updatedAt: integer('updated_at').notNull(),
});
```

Notes:
- Stored in storage units (matches `trainingMaxes`); displayed via
  `displayWeight()` / `convertWeight()` at the render boundary.
- Single row per lift; `lift` is PK so "set" and "update" are an upsert.
- Migration: additive `CREATE TABLE` — add to `runMigrations.ts`'s
  table-creation step. No backfill (zero rows by default = "no goal set"
  for every lift, which is the correct empty state).

### New accessors (`apps/mobile/src/data/accessors/liftGoal.ts`)

```ts
export type LiftGoal = typeof liftGoals.$inferSelect;

export async function getLiftGoal(db: AnyDb, lift: Lift): Promise<LiftGoal | null>;
export async function getLiftGoals(db: AnyDb): Promise<LiftGoal[]>;
export async function setLiftGoal(
  db: AnyDb,
  lift: Lift,
  targetE1RM: number,
  unit: Unit,
): Promise<LiftGoal>;
export async function clearLiftGoal(db: AnyDb, lift: Lift): Promise<void>;
```

### New TanStack Query hooks (`apps/mobile/src/data/queries/`)

- `useLiftGoal(lift: Lift)`
  - Key: `['liftGoal', lift] as const`.
  - Returns `UseQueryResult<LiftGoal | null>`.

- `useSetLiftGoal()`
  - `useMutation` over `setLiftGoal` / `clearLiftGoal`.
  - **Optimistic:** in `onMutate`, `queryClient.setQueryData(['liftGoal',
    lift], optimistic)`. In `onError`, restore previous via the snapshot
    returned by `onMutate`. In `onSettled`, invalidate
    `['liftGoal', lift]` AND `['liftProgression', lift]` (because the
    projection's "cycles to goal" depends on it).

- `useLiftProgression(lift: Lift)`
  - Key: `['liftProgression', lift] as const`.
  - Reads (server-side under the hood):
    - `getCurrentTrainingMaxes(db)` → current TM for the lift.
    - `getSessions(db)` filtered to `lift === lift` && `status === 'completed'`.
    - For each session: `getSetLogsForSession(db, sessionId)` to pull the
      AMRAP row(s). (Or denormalize via a single SQL join — preferred for
      perf. The frontend agent should add a per-lift accessor like
      `getCompletedSessionsWithAmrapForLift(db, lift)` that returns
      `{ session, amrapLog }[]`.)
    - `getSettings(db)` for `currentCycle` and `enabledLifts`.
    - `getLiftGoal(db, lift)`.
  - Reshapes via the pure functions in "Domain logic" below into:

    ```ts
    type ProgressionCellPast = {
      cycle: number;
      day: 1 | 2 | 3 | 4;
      kind: 'past';
      sessionId: number;
      topWeight: number;       // display unit
      topReps: number;
      amrap: boolean;
    };
    type ProgressionCellOutlined = ProgressionCellPast & { kind: 'last-done' };
    type ProgressionCellFuture = {
      cycle: number;
      day: 1 | 2 | 3 | 4;
      kind: 'future';
      projectedWeight: number; // display unit
    };
    type ProgressionRow = {
      cycle: number;
      cells: [Cell, Cell, Cell, DeloadCell];
      e1rm: number;            // display unit, rounded for render
      e1rmKind: 'past' | 'projected';
      crossesGoal?: true;      // true on the first row whose e1rm >= goal
    };
    type LiftProgression = {
      lift: Lift;
      tm: number;              // display unit
      currentCycle: number;
      pastRows: ProgressionRow[];
      currentRow: ProgressionRow; // mixed past + future cells within
      futureRows: ProgressionRow[];
      goal: { value: number; unit: Unit } | null; // display unit pre-converted
      cyclesUntilGoal: number | null;
    };
    ```

  - **Cache invalidation:** invalidated by the existing session-complete
    mutation chain. Frontend agent should ensure
    `completeSession`'s `onSuccess` (or wherever the existing invalidation
    list lives) adds `['liftProgression']` (prefix invalidate). Same for
    `useSetLiftGoal` (see above).

### No new write paths beyond the goal

This screen is read-only over session/setLog data. The only mutations are
on `lift_goals`. Past-cell taps navigate to SessionComplete, which is
itself read-only.

## Domain logic

All under `apps/mobile/src/domain/progression.ts` (new file). Pure: no
React, no async, no DB. Property-tested with `fast-check`.

### Already-ported (reuse, do not re-port)

- `estimateOneRm(weight, reps)` from `domain/epley.ts` — the brief calls
  this "epley1RM"; same function.
- `prescription(week)` / `setsForWeek(week)` from `domain/schemes.ts` —
  returns the 3-set prescription for a week.
- `nextTm(currentTm, lift, unit)` / `tmIncrement(unit, lift)` from
  `domain/increments.ts` — TM bump rules.
- `round(weight, unit)` from `domain/units.ts` — plate-snap. Used to
  snap projected weights so they read as loadable numbers.

### New pure functions

```ts
/**
 * Best (max) Epley e1RM across the 3 working/amrap rows of a single
 * completed cycle for one lift. Iterates over rows; uses `estimateOneRm`
 * per row. Returns 0 when no rows for that cycle.
 */
export function bestE1RMForCycle(
  rowsInCycle: Array<{ prescribedWeight: number; actualReps: number; kind: SetLogKind }>,
): number;

/**
 * Rolling AMRAP rep-margin: for each of the most recent `N` (default 3)
 * completed cycles, take the AMRAP row's (actualReps - prescribedReps),
 * average them. Used to project future AMRAP reps. Returns 0 when no
 * completed cycles exist (caller decides fallback).
 */
export function rollingAmrapMargin(
  completedCycles: Array<{ amrapPrescribedReps: number; amrapActualReps: number }>,
  windowSize?: number,
): number;

/**
 * Project the TM for a future cycle: start from `currentTm`, apply
 * `nextTm` once per cycle delta. Pure linear projection — no failure /
 * reset handling (deferred per brief).
 */
export function projectTmForCycle(
  currentTm: number,
  currentCycle: number,
  targetCycle: number,
  lift: Lift,
  unit: Unit,
): number;

/**
 * For a future (cycle, day) coordinate, return the projected top-set
 * weight in display units: project the TM forward, multiply by the
 * week-3 (for D1/D2/D3) percentage from `prescription(day)`,
 * `round()` to the unit's step.
 *
 * For Deload (day=4), use the week-4 top-set percentage (60% × TM).
 */
export function projectTopSetWeight(
  futureCycle: number,
  day: 1 | 2 | 3 | 4,
  currentTm: number,
  currentCycle: number,
  lift: Lift,
  unit: Unit,
): number;

/**
 * Project the e1RM for a future cycle: use `projectTopSetWeight` for
 * day 3 (the heaviest AMRAP day, week-3 5/3/1+), assume reps =
 * prescribed (1) + rollingAmrapMargin (rounded to integer, min 0),
 * then `estimateOneRm(weight, reps)`. Fallback when there's <3
 * completed cycles to average: assume the minimum prescribed reps for
 * the week (1 for week 3) — i.e. margin = 0.
 *
 * Note: projects from week 3 specifically because week 3's top single
 * with extra reps is the highest-e1RM event of any cycle. The brief's
 * "best AMRAP across D1/D2/D3" reduces to week 3 for the projection.
 */
export function projectE1RMForFuture(
  futureCycle: number,
  currentTm: number,
  currentCycle: number,
  rollingMargin: number,
  lift: Lift,
  unit: Unit,
): number;

/**
 * Number of future cycles (>= 0) before projected e1RM reaches or
 * exceeds `goal`. Returns `null` when `goal` is null, or when no
 * cycle within the search bound (default 60) crosses it (guards
 * against runaway loops on a goal placed past any realistic horizon).
 *
 * Searches forward from `currentCycle + 1` — the current cycle's
 * projected e1RM does NOT count as a "future" cycle for "cycles to
 * go" copy (a user mid-cycle 7 with goal already passed should see
 * "0 cycles to go", not "−1").
 */
export function cyclesUntilGoal(
  goal: number | null,
  currentE1RM: number,           // computed from current cycle's best AMRAP, else 0
  currentTm: number,
  currentCycle: number,
  rollingMargin: number,
  lift: Lift,
  unit: Unit,
  maxLookahead?: number,
): number | null;

/**
 * Build the full list of future ProgressionRows from currentCycle+1
 * through currentCycle+`count` (default 6). Each row uses
 * projectTopSetWeight per day + projectE1RMForFuture for the e1RM
 * column.
 */
export function projectFutureCycles(
  count: number,
  currentTm: number,
  currentCycle: number,
  rollingMargin: number,
  lift: Lift,
  unit: Unit,
): Array<{ cycle: number; days: Array<{ day: 1|2|3|4; weight: number }>; e1rm: number }>;
```

### Property-testable invariants (for `fast-check`)

- **Monotonicity of TM:** `projectTmForCycle(tm, c, c + k, lift, u) >
  projectTmForCycle(tm, c, c, lift, u)` for `k >= 1` and `tm > 0`.
- **Monotonicity of projected e1RM (given fixed margin ≥ 0):**
  `projectE1RMForFuture(c+k+1, …) >= projectE1RMForFuture(c+k, …)` for
  `k >= 0` — strictly greater if `tmIncrement > 0`, which is always.
- **Goal hit ⇒ cycles non-null:** if there exists `k` in
  `[1, maxLookahead]` such that `projectE1RMForFuture(currentCycle + k,
  …) >= goal`, then `cyclesUntilGoal(...) === k_min`. Otherwise `null`.
- **AMRAP margin window respected:** `rollingAmrapMargin([a, b, c, d, e],
  3)` ignores `a, b` (uses `c, d, e` only); empty input returns 0.
- **Plate snap of projected weights:** every weight in
  `projectFutureCycles(...)` satisfies `round(w, unit) === w`.
- **`bestE1RMForCycle` reduces to per-row `estimateOneRm`:** for any input
  of rows, the returned value equals `max(rows.map(r =>
  estimateOneRm(r.prescribedWeight, r.actualReps)))`.

## New primitives

Add under `apps/mobile/src/design/primitives/`. Justify each: reuse first.

### `ProgressGridCell.tsx` (new)

Single grid cell with three visual variants. Encapsulates the weight + reps
stacked layout, the variant border/background, and the optional ✓ / ─ /
star glyph. Justification: nothing in `design/primitives/` composes the
mixed border-style + dual-line text vocabulary; `Card` / `Row` /
`LedgerRow` are all too coarse.

```ts
export type ProgressGridCellProps = {
  variant: 'filled' | 'outlined' | 'ghosted';
  weight: number;                    // already in display unit
  unitGlyph: 'lb' | 'kg';            // only rendered if `showUnit` is true
  reps?: number | null;              // null → no second line
  marker?: '✓' | '─' | null;        // deload variants
  showUnit?: boolean;                // default false — header strip carries the unit
  onPress?: () => void;              // omit → non-Pressable View
  testID?: string;
  accessibilityLabel?: string;
};
```

Renders the dashed-border ghosted variant via `borderStyle: 'dashed'` and
`colors.line`. All hex/px tokens read from `useTheme()`.

### `ProgressGridRow.tsx` (new)

Composes one cycle's row: a leading `CycleLabel` (`C7`), 4
`ProgressGridCell`s, and the trailing `E1rmCell` (see below). Justification:
keeps the per-cell mapping logic out of the screen file; the row is the
unit consumers reason about.

### `E1rmCell.tsx` (new — small)

Right-column number cell. Variants `past` (color `ink0`) and `projected`
(color `ink2`); optional trailing `★`. Could be inlined in
`ProgressGridRow`, but lifting it makes the achievement-glyph variant
testable in isolation.

### `GoalStrip.tsx` (new)

The full-width Pressable with dashed top + bottom rules and the two-line
copy (set / unset states). Justification: this is the only place dashed
horizontal rules are used in the app today; the next "rule" need would
likely want a token rather than another inlining.

### `PagerDots.tsx` (new)

The N-dot indicator: takes `count` and `selectedIndex`, renders dots
sized 6 px (`colors.ink0` active, `colors.ink3` inactive) with
`spacing.sm` gap. Decorative — `accessibilityElementsHidden`. Justification:
not specific to Progress; could be reused if the LiftTabs pattern ever
collapses to dots-only elsewhere.

### `GoalRuleRow.tsx` (new, screen-local)

The dashed `╌╌╌ GOAL {N} {unit} ╌╌╌` divider that slots between two
cycle rows. May live in `features/progress/components/` rather than
`design/primitives/` since it's progression-screen-specific. Frontend
agent's call.

### Existing primitives reused (no changes)

- `Masthead` — top chrome.
- `Sheet`, `SheetLayout` — goal sheet.
- `NumberStepper` — goal value stepper.
- `PrimaryPillButton`, `SecondaryLink` — sheet actions.
- `Skeleton` — loading states.
- `Text`, `CapsLabel`, `Row`, `Divider` — small composition pieces.
- `QueryShell` — error envelope (from `features/shared/`).

## Decisions on open questions

1. **Empty state (zero completed cycles).** Resolved: ghosted future rows
   starting at the user's current cycle (1 on a fresh install). Goal strip
   in "no goal set" mode. Single `CapsLabel` footer below grid: `LOG A
   SESSION TO LIGHT UP THIS GRID`. No CTA — TODAY is the start point.

2. **Goal strip "no goal set" copy / visual.** Resolved: same Pressable
   chrome (dashed top + bottom rules). Line 1 caps `colors.ink2`: `SET AN
   e1RM GOAL`. Line 2 mono small `colors.ink3`: `TAP TO PICK A TARGET`. No
   "+" glyph or fill — the dashed rules already establish "this is a slot
   waiting to be filled".

3. **Session detail target.** Resolved: mobile **already has**
   `SessionCompleteScreen` (at `apps/mobile/src/features/session/
   SessionCompleteScreen.tsx`, routed via `apps/mobile/src/app/session/
   complete.tsx` with `sessionId` + optional `from` params; `goTo.complete`
   helper exists in `apps/mobile/src/app/routes.ts`). Past-cell tap calls
   `goTo.complete(router, sessionId, { from: 'history' })`. No "Coming
   soon" placeholder needed.

4. **TM display.** Resolved: **header-only** (in the lift sub-line:
   `TM 230 · e1RM 248`). Per-row TM is omitted. Rationale: TM is constant
   inside any cycle (and increments by a known amount cycle-to-cycle); the
   row's e1RM already conveys "the lift is moving up". Adding per-row TM
   would either repeat the same number across all cells of a row (wasted
   ink) or compete with the e1RM column for the eye. The header sub-line
   places TM next to e1RM at the top where their relationship is
   meaningful, and frees the grid to be about *progress*, not *parameters*.

5. **e-ink token mapping.** Resolved — full table in "Per-cell visual
   treatments" above. Recap:
   - filled (▓) → `colors.ink0` bg / `colors.bg0` text
   - outlined (┃) → `colors.bg0` bg / `colors.ink0` border 2 px
   - ghosted (·) → `colors.bg0` bg / dashed `colors.line` border /
     `colors.ink3` text
   - goal-rule (╌╌╌) → dashed `colors.lineStrong` 1 px
   - achievement (★) → `colors.ink0` mono glyph
   All four roles already exist in `tokens.ts`; the only choice is the
   dashed-border treatment for ghosted, which is a style flag, not a new
   token. The mapping works identically in light/dark theme because the
   token system collapses to a single ink palette (theme.ts confirms there
   is no dark variant yet — and the app's e-ink aesthetic deliberately
   doesn't have one).

6. **TODAY entry affordance.** Resolved: tap the lift headline
   (`LiftPageTitle.tsx`'s giant "Squat." text) on the active TODAY
   `LiftPage`. This is the unambiguous "I want to know more about this
   lift" affordance — the headline is already visually dominant. Required
   follow-up edit:
   - Wrap `LiftPageTitle`'s `<Text>` in a `<Pressable>` with
     `accessibilityRole: 'button'`,
     `accessibilityLabel: 'Open {Lift} progress'`, and `hitSlop` for ≥44pt.
   - Add an optional `onPress` prop to `LiftPageTitleProps`.
   - In `LiftPage.tsx`, pass `onPress={() => goTo.progress(router, lift)}`.
   - Add `goTo.progress(router, lift)` helper in `apps/mobile/src/app/
     routes.ts`.
   No other TODAY UI changes. The visual headline is unchanged.

7. **expo-router path.** Resolved: `/progress/[lift]` — file at
   `apps/mobile/src/app/progress/[lift].tsx` (thin shell, parses + guards
   the param via `isLift`, renders `<ProgressScreen lift={...} />`). The
   `[lift]` segment matches the existing pattern of `app/session/today.tsx`
   reading a `lift` query param, except here the lift IS the path so deep
   links read naturally. No `(tabs)` group — Progress is a stack push, not
   a tab.

## Out of scope

- **AMRAP failure / TM reset.** No UI for it. The projection assumes
  on-pace progress forever. The frontend agent must not invent a "you
  missed your AMRAP, want to reset?" affordance. Known gap — surfaced
  here so QA does not flag it as a missing case.
- **Charts, graphs, sparklines.** The grid IS the visualization.
- **Animated goal-line entry / achievement burst.** No motion on the
  goal-rule or ★ glyph. (PRs already have their own celebration screen
  in the post-session flow.)
- **User editing of projected future cells.** Read-only projection.
- **Notifications / nudges** ("you'll hit your goal in N weeks!"). The
  goal strip is the only "where you're headed" surface.
- **Social / sharing** of the progression grid.
- **Per-row TM display** (see decision 4).
- **Pull-to-refresh.** Query invalidation on session-complete is
  sufficient.
- **Pager-dot tap to switch lift.** Dots are decorative in v1 (locked
  decision: dots only, no chevrons, no tabs).
- **Cross-lift progression view** (all 4 lifts on one screen). Out of
  scope; pager handles the switching.
- **Goal-cycle countdown notifications / haptic** when crossing into
  the goal cycle in real life. Pure visual.

## Open questions

None — every brief-flagged question is decided above with rationale.
The frontend agent should implement directly against this spec; any
mid-implementation ambiguity should be raised back to the designer via
`SendMessage` rather than guessed.
