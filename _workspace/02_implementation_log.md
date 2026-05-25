# Progress screen — implementation log

## Summary

Built the Progress screen end-to-end per `_workspace/01_design_spec.md`:
new pure domain math, new Drizzle table + accessors + TanStack hooks, five
new design primitives, the feature screen + goal sheet + carousel hook,
the route shell, and the TODAY entry-point edit. All four verification
gates green.

## Files changed

### Domain
- `apps/mobile/src/domain/progression.ts` (new) — pure projection math:
  `bestE1RMForCycle`, `rollingAmrapMargin`, `projectTmForCycle`,
  `projectTopSetWeight`, `projectE1RMForFuture`, `cyclesUntilGoal`,
  `projectFutureCycles`. JSDoc on `bestE1RMForCycle` explains why past
  uses all 3 days while future projects from week-3 D3 alone.
- `apps/mobile/src/domain/__tests__/progression.test.ts` (new) — TDD red
  → green per spec invariants. 27 tests, includes `fast-check`
  properties for TM monotonicity, e1RM monotonicity, goal-hit ⇒ cycles
  non-null, AMRAP margin window, plate-snap of projected weights,
  `bestE1RMForCycle` ≡ max(per-row epley).

### Data
- `apps/mobile/src/data/drizzle/schema.ts` — added `liftGoals` table (PK
  on `lift`, stored in storage units, `updatedAt`).
- `apps/mobile/src/data/drizzle/migrations/0001_init.ts` — `CREATE TABLE
  IF NOT EXISTS lift_goals`.
- `apps/mobile/src/data/drizzle/runMigrations.ts` — added `lift_goals` to
  `ALL_TABLES` so dev-mode drop-and-recreate handles the table.
- `apps/mobile/src/data/accessors/liftGoal.ts` (new) — `getLiftGoal`,
  `getLiftGoals`, `setLiftGoal` (upsert via ON CONFLICT(lift)),
  `clearLiftGoal`.
- `apps/mobile/src/data/accessors/__tests__/liftGoal.test.ts` (new) —
  cross-driver accessor smoke tests using BetterSqlite3.
- `apps/mobile/src/data/accessors/liftProgression.ts` (new) — per-lift
  session+AMRAP accessor `getCompletedSessionsWithAmrapForLift`. LEFT
  JOIN sessions ⨝ amrap setLogs; flattens to `{ session, amrap | null }`
  rows newest first; collapses pathological multi-amrap rows per
  session to the highest-e1RM attempt.
- `apps/mobile/src/data/accessors/__tests__/liftProgression.test.ts` (new) —
  smoke tests for the accessor (empty, with AMRAP, working-only,
  cross-lift isolation).
- `apps/mobile/src/data/queries/useLiftGoal.ts` (new) — read hook.
- `apps/mobile/src/data/queries/useSetLiftGoal.ts` (new) — mutation
  with optimistic update + onError rollback + onSettled prefix-
  invalidates `['liftProgression']`.
- `apps/mobile/src/data/queries/useLiftProgression.ts` (new) — assembles
  the view model: past rows (with sessionId per cell + "last-done"
  outlined marker on the single most-recent session), the current
  cycle row (mixed past/future cells), 6 future rows projected via
  `projectFutureCycles`, goal in display units, `cyclesUntilGoal`,
  `crossesGoal` flag on the first future row that meets the goal.
- `apps/mobile/src/features/session/hooks/useLiveScreenEffects.ts` —
  added `['liftProgression']` prefix invalidation to the
  session-complete chain.

### Design primitives
- `apps/mobile/src/design/primitives/ProgressGridCell.tsx` (new) — three
  variants (`filled` / `outlined` / `ghosted`); Pressable when
  `onPress` supplied, plain `View` (accessibilityRole `text`) when
  omitted. Dashed border via `borderStyle: 'dashed'`.
- `apps/mobile/src/design/primitives/ProgressGridRow.tsx` (new) —
  leading C{n} label, child wrapping with hairline `borderLeft`, outer
  `lineStrong` border.
- `apps/mobile/src/design/primitives/E1rmCell.tsx` (new) — past/projected
  variant + trailing ★.
- `apps/mobile/src/design/primitives/GoalStrip.tsx` (new) — dashed top
  + bottom rules, no-goal vs goal-set copy, accessibility labels
  consistent with the spec.
- `apps/mobile/src/design/primitives/PagerDots.tsx` (new) — decorative
  N-dot indicator, hidden from accessibility.
- `apps/mobile/src/design/primitives/index.ts` — barrel exports for the
  five new primitives.
- `apps/mobile/src/design/primitives/GoalStrip.test.tsx` (new) — behavior:
  copy, onPress, "already past" subline.
- `apps/mobile/src/design/primitives/ProgressGridCell.test.tsx` (new) —
  behavior: tap, deload marker, future-cell role=text.

### Feature
- `apps/mobile/src/features/progress/ProgressScreen.tsx` (new) —
  Masthead, PagerDots, lift FlatList carousel; each page = ScrollView
  with LiftHeader + GoalStrip + ProgressGridHeader + ProgressGridBody
  + GoalSheet. Past-cell tap fires `Haptics.selectionAsync()` and
  routes via `goTo.complete(..., { from: 'history' })`. Goal-rule row
  rendered immediately before the first row whose `crossesGoal === true`.
- `apps/mobile/src/features/progress/components/GoalSheet.tsx` (new) —
  SheetLayout body with `NumberStepper`, live `in ~{M} cycles` recompute
  using `cyclesUntilGoal`, Save / Clear actions, success haptic on
  Save/Clear close.
- `apps/mobile/src/features/progress/components/GoalRuleRow.tsx` (new) —
  `╌╌╌ GOAL {N} {unit} ╌╌╌` dashed divider.
- `apps/mobile/src/features/progress/hooks/useProgressCarouselSync.ts` (new) —
  copy of the Home carousel sync hook, identical structure so swipe
  feel matches TODAY exactly.
- `apps/mobile/src/features/progress/__tests__/ProgressScreen.test.tsx`
  (new) — five integration tests against a real in-memory DB: empty
  state, goal sheet opens, save updates strip optimistically, past
  cell calls `router.push` with `from=history`, future cells render
  accessibilityRole `text`.

### Route shell + helper
- `apps/mobile/src/app/progress/_layout.tsx` (new) — Stack layout with
  headerShown false.
- `apps/mobile/src/app/progress/[lift].tsx` (new) — thin shell:
  `isLift` guard, redirect home on invalid via `useEffect` (Stack
  pattern), renders `<ProgressScreen lift={...} />`.
- `apps/mobile/src/app/routes.ts` — added `goTo.progress(router, lift,
  opts?)`.

### TODAY entry
- `apps/mobile/src/features/home/components/LiftPage/LiftPageTitle.tsx`
  — added optional `onPress` prop. When provided, headline is wrapped
  in a `Pressable` with `accessibilityRole='button'`,
  `accessibilityLabel='Open {Lift} progress'`, hitSlop ≥ 44 pt, and
  `Haptics.selectionAsync()` on press-in.
- `apps/mobile/src/features/home/components/LiftPage/LiftPage.tsx` —
  imports `goTo` + `useRouter`; passes `onPress={openProgress}` to
  `LiftPageTitle` so tapping the lift headline on TODAY routes into
  Progress.

## Notable decisions

- **Per-lift session+AMRAP accessor name.** Spec suggested
  `getCompletedSessionsWithAmrapForLift` — kept that name verbatim.
  Lives in its own file `apps/mobile/src/data/accessors/liftProgression.ts`
  rather than extending `session.ts`, because the join shape is
  specific to the Progress screen and doesn't fit the existing
  session accessor's "return a `Session` row" contract.
- **Week → Day mapping.** A lift trains once per week in 5/3/1, so a
  cycle contains up-to-4 sessions (week 1 → D1, week 2 → D2, week 3 →
  D3, week 4 → Deload). The data hook maps `session.week` directly
  to the day cell index. Documented in
  `useLiftProgression.weekToDay`.
- **Current-row e1RM fallback.** When the user is mid-cycle with no
  AMRAP rows yet, the current row's e1RM column shows the projected
  e1RM (from the current TM) rather than `0` so the column never
  reads as "missing data". Marked `e1rmKind: 'projected'`.
- **"You are here" outlined cell.** Exactly ONE cell across the entire
  grid is rendered as the outlined "last-done" variant: the cell whose
  `sessionId === mostRecentSessionId`. mostRecent = `sessions[0]`
  (newest by `startedAt`). Matches the spec's "the most-recent
  completed day across all cycles".
- **Past cycle, missing day.** If a past cycle has fewer than 4
  completed sessions, the missing day cells are rendered as
  ghosted/future (non-interactive — no sessionId to route to). Spec
  doesn't enumerate this case; the choice keeps the grid uniform
  without fabricating data.
- **Dashed-border treatment.** Used `borderStyle: 'dashed'` directly
  per spec's accepted-risk recommendation. No new token, no SVG
  fallback yet. **Flagged for QA on Android.**
- **Current-cycle scroll anchor.** Implemented as a single linear
  `ScrollView` rather than `FlatList` with `initialScrollIndex`. Spec
  rendered with currentCycle as the first FUTURE row (per the data
  hook's `futureRows[0]`) — labelled with the `CURRENT` eyebrow.
  Past rows render above. No explicit `contentOffset.y` math — the
  current cycle is naturally the first row that isn't a past row,
  and on first paint the user sees a screen-fitting window of
  past+current+a few future rows. If QA wants the current row pinned
  to the top of the viewport, that can be added with a layout
  measurement pass.
- **Goal sheet eyebrow + empty title.** SheetLayout requires a `title`.
  The spec's layout shows the heading as just an eyebrow caps line
  (`GOAL · SQUAT e1RM`) with no separate H2. To keep the SheetLayout
  contract, I pass `title=" "` (single space) — visually invisible,
  satisfies the required prop. Worth refactoring SheetLayout to
  accept an eyebrow-only header in a follow-up if more sheets adopt
  this shape.
- **GoalSheet seeded value.** Falls back through goal → bestE1RM ×
  1.15 → currentTm × 1.15 → 100 lb / 50 kg per spec.
- **Goal mutation `unit` source.** When saving a new goal, the
  mutation needs a storage unit. The sheet writes in the user's
  display unit; the mutation translates by passing
  `unit: tmRow.unit` from `useLatestTms` (matches `trainingMaxes`
  convention).

## Verification

```
$ pnpm typecheck
> tsc --noEmit
(exit 0)

$ pnpm lint
> biome check src
Checked 429 files in 44ms. No fixes applied.
(exit 0)

$ pnpm test
Test Suites: 155 passed, 155 total
Tests:       939 passed, 939 total
(exit 0)

$ pnpm --filter @fivethreeone/mobile exec expo export --platform ios \
    --output-dir /tmp/expo-bundle-progress --dump-sourcemap=false --dump-assetmap=false
› ios bundles (2):
_expo/static/js/ios/entry-70a4a937920325173ab7f6ef05767563.hbc (3.4MB)
Exported: /tmp/expo-bundle-progress
(exit 0)
```

## Open items for QA

- **Android dashed borders.** `borderStyle: 'dashed'` may render
  unevenly on some Android driver/skia combinations. Used directly
  per spec's recommendation; if QA flags it, the next iteration
  should swap the ghosted-cell and goal-strip rules to a styled
  short-segment fallback rather than introducing react-native-svg as
  a new dependency.
- **Pager dot count when fewer than 4 lifts are enabled.** Settings
  allows the user to disable lifts; the PagerDots count is driven by
  `settings.enabledLifts`, so the dots will collapse correctly — but
  worth eyeballing in QA with 2 / 3 enabled.
- **Mid-cycle "you are here" placement.** When the user has logged
  D1 and D2 of the current cycle, the outlined treatment lands on
  the D2 cell (`sessions[0]` is newest, which corresponds to the
  most recent week's session). Worth a screenshot check to confirm
  the marker reads correctly as "you finished THIS one most
  recently" rather than "you're starting THIS one next".
- **Goal-rule placement vs. visible viewport.** The dashed goal-rule
  is inserted between rows; if the goal crosses *within* the
  rendered range it appears. If the goal is past the last rendered
  future row (cycle > currentCycle + 6), no rule renders. Spec
  accepts this. QA may want to verify the cycles-to-go copy on the
  goal strip still reads correctly when the rule is off-screen below.
- **GoalSheet `title=" "` workaround.** Listed under "Notable
  decisions" above — visual review on a device to confirm no stray
  whitespace bumps the layout.
- **Reanimated mock in ProgressScreen test.** Mirrors the HomeScreen
  test pattern; the carousel uses `LinearTransition` indirectly via
  Reanimated. The behavior tests don't exercise the swipe-snap so
  this is fine, but a future QA pass that touches the carousel snap
  feel should run on a device.
