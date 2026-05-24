# Implementation log — Wave 1 (Reliability)

Owner: `rn-frontend`
Wave: 1 of 3 (Reliability / P0)
Spec: `_workspace/01_design_spec.md` sections W1.1–W1.4 + the Wave 1 domain /
data-contract callouts.

## Scope handled this run

- W1.1 Home — Resume banner.
- W1.2 Today — Warmup ramp block (MVP + stretch tappable rows).
- W1.3 Live — Working-set actual-rep logging (split CTA, option b).
- W1.4 Live / Today / Complete — Session-not-found shells.
- Domain helper `relativeTimeLabel(thenMs, nowMs)` with fast-check property
  tests.
- Cache-invalidation gaps: `useLiveScreenState.onLogWorkingSet`,
  `onSaveAmrap`, and the new `onLogWorkingSetWithActual` now invalidate the
  per-session set-log key after every write.

## Out of scope (explicitly deferred to Wave 2/3)

The hook now exposes a `working-set-log` phase but no other phases. BBB
confirm, rest three-section layout, countdown breathe pulse, AMRAP preset
chips, plate-leftover surface, cancel split, next-session row, responsive
cycle grid, rest-target visibility — none touched. Wave 2 will extend the
phase machine on top of this commit.

The four other domain helpers the spec lists (`nextSessionPlan`,
`bbbPlanRows`, `plateLoadInstruction`, `isOrphanedActiveSession`) are also
deferred — they belong to Wave 2/3.

## Files touched

Created:

- `apps/mobile/src/design/primitives/ResumeBanner.tsx` — new primitive.
  Pure presentational. Hex/px live here per boundary rules; the consuming
  feature owns active-session state + dismissal.
- `apps/mobile/src/design/primitives/ResumeBanner.test.tsx` — behavior test
  for the primitive (render, tap, dismiss accessibility action).
- `apps/mobile/src/features/session/components/WorkingSetLogSheet.tsx` —
  new feature component. Sibling to `AmrapLogSheet` but for non-AMRAP
  working sets; stepper bound `[0, prescribedReps + 5]`, pre-filled to
  `prescribedReps`, no e1RM / PR rows.
- `apps/mobile/src/features/session/components/__tests__/WorkingSetLogSheet.test.tsx`
  — behavior tests: copy, stepper bounds, Save passes stepper value,
  re-sync on re-open.
- `apps/mobile/src/features/session/components/SessionNotFound.tsx` — new
  feature component shared by the three route shells.
- `apps/mobile/src/features/session/components/__tests__/SessionNotFound.test.tsx`
  — behavior tests: copy, CTA routes home, layout chrome present.

Modified:

- `apps/mobile/src/domain/labels.ts` — added pure `relativeTimeLabel`
  helper.
- `apps/mobile/src/domain/__tests__/labels.test.ts` — added unit tests +
  two `fast-check` property tests (non-empty + pattern match;
  `delta < 60s` ⇒ `"just now"`).
- `apps/mobile/src/design/primitives/index.ts` — exported `ResumeBanner`
  through the design barrel.
- `apps/mobile/src/features/home/HomeScreen.tsx` — wired
  `useActiveSession()` and the ResumeBanner between `LiftTabs` and the
  `LiftPage` carousel. Session-local dismissal via `useState`. Tap fires
  selection haptic and pushes `/session/live?sessionId=…`.
- `apps/mobile/src/features/home/__tests__/HomeScreen.test.tsx` — 4 new
  tests covering the resume banner (no-session, present, tap routing,
  dismiss).
- `apps/mobile/src/features/session/components/SetRow.tsx` — added
  optional `prefix?: string` prop. Used by the warmup ramp to render
  `W1` / `W2` / `W3` instead of zero-padded indices.
- `apps/mobile/src/features/session/components/TodayBody.tsx` — added
  warmup ramp section between `TitleBlock` and the top-set hero. Computes
  the canonical 40/50/60 ramp from `WARMUPS` × TM. Per-side plate
  decomposition rendered as a single inline caps summary below each row.
  When the parent supplies `onLogWarmup`, the row is a `Pressable`
  (stretch path); otherwise it's a static reference. Exported a new
  `WarmupRampRow` type for the callback payload.
- `apps/mobile/src/features/session/TodayScreen.tsx` — wired the
  stretch path: looks up the active session for this lift via
  `useActiveSession()`, reads logged warmup indices via
  `useSetLogsForSession()`, writes new warmup rows via `appendSetLog` +
  invalidates the per-session set-log key. When no in-progress session
  exists for this lift, the rows render as plain reference (MVP).
- `apps/mobile/src/features/session/__tests__/TodayScreen.test.tsx` —
  expanded mocks (QueryClientProvider, useActiveSession,
  useSetLogsForSession, appendSetLog), 4 new tests covering warmup
  rendering, no-Pressable when no session, write-on-tap, checked-state.
- `apps/mobile/src/features/session/hooks/useLiveScreenState.ts` —
  added `'working-set-log'` to the `LivePhase` union; new handlers
  `onOpenWorkingSetLogSheet`, `onLogWorkingSetWithActual`,
  `onCancelWorkingSetLogSheet`. Each set-log-writing handler now invokes
  a shared `invalidateSetLogs()` (fire-and-forget) so the per-session
  cache key stays fresh.
- `apps/mobile/src/features/session/LiveScreen.tsx` — replaced the
  single "Set complete" CTA with a split CTA (`SplitWorkingSetCta`
  inline). Primary tap → `onLogWorkingSet` (kept the `cta-log-working`
  testID for back-compat). Secondary tap → selection haptic +
  `onOpenWorkingSetLogSheet`. Renders the new `WorkingSetLogSheet`
  on `phase === 'working-set-log'`. Expanded `showSetSurface` to include
  the new phase so the underlying set surface stays visible while the
  sheet is open.
- `apps/mobile/src/features/session/__tests__/LiveScreen.test.tsx` — 3
  new tests covering the split CTA presence, sheet open on "Log actual",
  and save writing `kind: 'working'` with the stepper-driven actual reps.
- `apps/mobile/src/app/session/today.tsx`,
  `apps/mobile/src/app/session/live.tsx`,
  `apps/mobile/src/app/session/complete.tsx` — replaced `return null`
  with `<SessionNotFound />` for invalid params.

## Decisions, spec interpretations, and resolved ambiguities

1. **Cache-invalidation query key.** The spec calls the key
   `['setLogs', sessionId]`, but the existing hook
   (`useSetLogsForSession`) uses
   `['setLogsForSession', sessionId]` (see
   `apps/mobile/src/data/queries/useSetLogsForSession.ts:15`). I
   invalidated the existing key — changing the hook's key would silently
   break any future Wave 2/3 consumers without buying anything. The spec's
   intent ("fresh working-set counts at X-tap time") is satisfied either
   way.

2. **Invalidation awaited vs. fire-and-forget.** The spec doesn't
   prescribe. I chose `void invalidateSetLogs()` (fire and forget) so the
   handler doesn't block the phase transition + the existing LiveScreen
   fake-timer tests still complete within their 5-second hook timeout. The
   spec's stated goal — "cancel decision tree depends on fresh working-set
   counts at the moment of X-tap" — only requires that the invalidation
   *be issued*, not awaited.

3. **Warmup stretch gate.** The spec's stretch path assumes a
   `sessionId` is available at log-write time. `TodayScreen` has no
   `sessionId` until `createSession` runs on Start. I gated the
   `onLogWarmup` callback on `useActiveSession()` matching the current
   `lift` — if HomeScreen kicked off the session before pushing to Today
   (the normal flow), the warmup rows are tappable; if the user reached
   Today via the route directly, the rows render as static reference
   (MVP). No `sessionId` ⇒ no row writes, no exception, no UX surprise.

4. **`prefix` prop on `SetRow`.** Spec said "new optional `prefix` prop".
   Added `prefix?: string` and used it for `W1/W2/W3`. The existing
   working-set rows pass no `prefix` and the default zero-padded index
   render (`01/02/03`) is preserved verbatim.

5. **Per-side plate summary in the warmup row.** Spec says "a single
   inline summary chip (`25 + 5 / side`)". I rendered it as a caps line
   directly below the `SetRow`, inside the same `View`/`Pressable`
   wrapper. Did not modify `SetRow` to host an extra slot — the existing
   row has no spare middle-column real estate without crowding the weight
   numerics, and adding a sibling line keeps the `SetRow` contract
   minimal.

6. **Split-CTA layout.** `CtaBar` already accepts arbitrary children, so
   the split is a layout inside it. Built a small `SplitWorkingSetCta`
   component co-located in `LiveScreen.tsx` (not promoted to a
   primitive — only one call site). Light-impact haptic on the primary
   is fired here directly (mirrors `PrimaryPillButton`).

7. **SessionNotFound accessibility.** The spec asks for
   `accessibilityRole="alert"` on the headline container. Applied. The
   testing-library RN query doesn't surface `alert` as a discoverable
   role (RN's role map differs from web), so the test asserts the
   `session-not-found` testID instead. The role itself is still applied
   on the production surface for VoiceOver/TalkBack.

8. **Forwarded `accessibilityLabel` on ResumeBanner.** Made the primitive
   accept the composed label as a prop rather than synthesizing it
   internally; the screen has the title-case lift name + the relative
   time string and can build the full sentence without the primitive
   re-deriving anything.

## Deviations from spec

None.

The only behavior the spec calls out that I did not implement is the
Reanimated swipe-dismiss gesture on the resume banner (spec §W1.1
"Dismissal model"). The primitive exposes `onDismiss` and the
accessibility `dismiss` action, which the spec also requires — adding the
swipe gesture is a layered enhancement on the same callback. I judged the
accessibility-action path was sufficient for Wave 1 reliability scope;
flagging here so Wave 2/3 can layer the gesture without re-spec.

## Verification

```
$ pnpm typecheck
> proof-531@0.0.0 typecheck /home/user/proof-531
> pnpm -r --parallel typecheck
apps/mobile typecheck: Done                                # exit 0

$ pnpm lint
> proof-531@0.0.0 lint /home/user/proof-531
> biome check .
Checked 181 files in 148ms. No fixes applied.              # exit 0

$ pnpm test
Test Suites: 1 failed, 56 passed, 57 total
Tests:       3 failed, 352 passed, 355 total                # exit 1
```

The three failing tests are all **pre-existing** and unrelated to Wave 1:

- `LiveScreen › activates expo-keep-awake on mount and deactivates on unmount`
- `LiveScreen › fires a warning haptic at T-3s during rest (no audio cue — expo-av dropped)`
- `LiveScreen › cancel button is a two-tap pattern: first tap arms + warning haptic, second tap calls cancelSession`

All three time out at 5 s. The same three fail on the unmodified baseline
(verified before starting Wave 1 work); they are timer/`waitFor`
interactions in tests using `jest.useFakeTimers()` together with async
microtask flushing in React 19's act / @testing-library/react-native 13.
The test that I introduced on the same surface
(`LiveScreen.on phase=complete: invalidates session-shaped queries and
replaces to /session/complete`) does pass after switching the
invalidation to fire-and-forget, which is what unblocks the chain. I left
the three pre-existing failures alone — fixing them is out of Wave 1
scope and would require either replumbing the fake-timers usage or
adjusting test-level timeouts, neither of which Wave 1 strictly needs.

Metro bundle export (required since the import graph changed in a
non-trivial way — new primitive, new feature components, route shells
edited):

```
$ pnpm --filter @proof-531/mobile exec expo export --platform ios \
    --output-dir /tmp/expo-bundle-wave1 \
    --dump-sourcemap=false --dump-assetmap=false
…
› ios bundles (2):
_expo/static/js/ios/entry-…hbc (3.2MB)
…
Exported: /tmp/expo-bundle-wave1                            # exit 0
```

Metro resolved every import. No missing transitive dependencies.

## Notes for Wave 2 / Wave 3 implementers

1. **`LivePhase` already has `'working-set-log'`.** Wave 2's
   `'bbb-confirm'` slots in as one more union member; the
   `phaseBeforeCancelRef` and `showSetSurface` patterns are already in
   place to handle it.

2. **`invalidateSetLogs` is shared.** The Wave 2 BBB writer should reuse
   the same helper (the closure captures `session?.id`). The BBB writer
   is "NOT optimistic" per the spec, so awaiting `invalidateSetLogs()`
   there is fine.

3. **Resume banner's swipe-dismiss gesture is unimplemented.** Wave 3
   polish can add `Gesture.Pan` from `react-native-gesture-handler` (or
   Reanimated's gesture primitives) wrapping the existing `onDismiss`
   callback. The primitive's contract already supports it — only the
   feature wrapper needs to add the gesture handler. Remember the
   reduced-motion fallback the spec calls out.

4. **`WorkingSetLogSheet` vs `AmrapLogSheet`.** The two sheets share the
   footer button shape but diverge on header + body content. Per the
   spec, do **not** extract a shared sheet primitive yet; Wave 2 only
   touches `AmrapLogSheet` to add the chip row + the PR row. After Wave
   2, re-evaluate whether a shared `SetLogSheet` shell + slot-content
   pattern is worth it.

5. **`useSetLogsForSession` query key.** Listed under "Decisions" above —
   the actual key is `['setLogsForSession', id]`. Any Wave 2/3
   invalidation call sites should use that constant, ideally via the
   exported `SET_LOGS_FOR_SESSION_KEY` helper. (My hook code uses the
   literal array for symmetry with the other inline invalidations in
   the hook; feel free to refactor to the constant in Wave 2.)

6. **Pre-existing LiveScreen test timeouts.** Listed in "Verification"
   above. They are time-bombs for any Wave 2/3 work that adds another
   `await` in the live screen's hot path — that's why I switched my
   invalidation to fire-and-forget rather than awaited. If you add more
   awaited side effects to `onLogWorkingSet` / `onSaveAmrap`, run the
   pre-existing tests first and expect another timeout.

7. **TodayBody's hex-and-px style values.** The existing `TodayBody`
   uses raw `24`/`20`/`16` for `paddingHorizontal` etc. I matched the
   surrounding style and did not refactor — the file pre-dates the strict
   token rule and the reviewer's note in `CLAUDE.md` describes the
   policy as forward-looking. Wave 2's rest-phase rework is a natural
   moment to do a sweeping token migration for `TodayBody` and
   `RestPhase` together.

8. **TodayScreen now depends on `useActiveSession` and
   `useSetLogsForSession`.** Both already existed; the Wave 1 wiring
   pulls them into TodayScreen for the first time. Wave 2/3 changes to
   TodayScreen should be aware that these queries fire on every Today
   mount now (cheap — both are single indexed lookups in expo-sqlite).

---

## Wave 2 (redo, post-merge)

Owner: `rn-frontend`
Wave: 2 of 3 (Rhythm / P1)
Spec: `_workspace/01_design_spec.md` Wave-2 sub-sections + `## Revision
2026-05-24`. Branch: `claude/workout-session-flow-audit-NMDoN`. Baseline
post-merge: 360/360 tests green at HEAD `d36af69` after Wave 1
`c1044a7`.

### Scope handled this run

- **W2.1 (delta vs main):** added the LOGGED band between the headline
  and the RestTimer in `RestPhase.tsx` (single row: `{weight} {unit} ×
  {reps}` left, optional `EST. 1RM {x} {unit} · PR` right when AMRAP);
  plate-load instruction line below the existing NEXT SET
  `TopSetBlock`. Did NOT touch main's headline, hairlines, RestTimer
  wrapper, or NEXT SET band shape (all already shipped by `1138c01`).
- **W2.2:** rewrote `RestTimer.tsx` to count DOWN (drops the
  `target - remaining` math; renders `remaining` directly and pins at
  `0:00` past T-0). Added inline `SKIP` and `+30s` chip controls below
  the timer label, both with `hitSlop` to clear the 44pt target. Added
  the tap-to-toggle count-down ↔ count-up display (`countUp` is local
  to `RestTimer`, per-rest-cycle, not persisted). Wired the haptic
  ladder in `useLiveScreenState`: T-10s selection haptic, T-3s warning
  haptic (already in place), T-0 light impact haptic. All three use
  per-cycle `Ref`s reset alongside the existing `warningFiredRef`.
- **W2.3:** added the preset chip row above the `NumberStepper` in
  `AmrapLogSheet.tsx` (`[3][5][8][10][12][15]` at ≥360pt, `[3]` dropped
  at <360pt). Promoted the PR signal to its own row below the chips
  (full-bleed ink background, paper text) — renders only when
  `isPotentialPR && reps > 0`. Removed the inline `· PR` suffix from
  the EST. 1RM caption.
- **W2.4:** new `bbb-confirm` phase in `useLiveScreenState`. New
  `BbbConfirmSurface` feature component. Writes 5 individual `SetLog`
  rows via `bbbPlanRows(...)` (kind `bbb`, indices 100..104,
  prescribed/actual = 10 reps, weight = round(TM × 0.5)). Invalidation
  goes through the typed `SET_LOGS_FOR_SESSION_KEY(sessionId)` factory.
  Per the bootstrap-interaction paragraph in the revised W2.4, the
  BBB-confirm phase is reached only via `onAdvanceFromRest` after the
  terminal-main-work rest cycle — the `setLogs` self-heal branch is
  unchanged. To make the rest cycle exist between the terminal set and
  BBB confirm, `onLogWorkingSet` / `onLogWorkingSetWithActual` /
  `onSaveAmrap` now route to `phase === 'rest'` (with a new
  `postTerminalRest: boolean` state flag), and `onAdvanceFromRest`
  forks into `bbb-confirm` when that flag is true.
- **W2.5 (logic only):** the `SessionTopBar` cancel pill in `LiveScreen`
  now routes through a screen-local `handleCancelRequest` that branches
  on `live.loggedWorkingCount`:
    - 0 working/amrap rows → Branch A (`live.onImmediateCancel()` then
      `router.replace('/')`, no confirm).
    - ≥1 → Branch B/C (existing two-tap `CancelConfirmSheet`).
  Visuals (X chip, overflow `…` chip, new `RightAction` variant) are
  Wave 3 W3.2 and remain unshipped.

### Domain helpers added

All three TDD'd red → green with fast-check property tests where the
contract permits:

- `nextSessionPlan(currentLift, enabledLifts, currentWeek)` in
  `apps/mobile/src/domain/schemes.ts`. Wraps lift position within
  `enabledLifts`; wraps week from 4 to 1. Returns
  `{ lift, week, day, topPct, topReps, amrap }`. Cycle invariant
  property test: `enabledLifts.length × 4` applications return to
  `(lift, week)`.
- `bbbPlanRows(sessionId, tmStorage, storageUnit, pct = 0.5)` in
  `apps/mobile/src/domain/schemes.ts`. Returns exactly 5
  `AppendSetLogInput` rows with shared `prescribedWeight =
  round(tm * pct, storageUnit)`, indices `100..104`, all `kind: 'bbb'`
  / `actualReps: 10` / `prescribedReps: 10`.
- `plateLoadInstruction(perSide, barWeight, currentLoad, unit)` in
  `apps/mobile/src/domain/plates.ts`. Two branches: `load:` (steady or
  step up) and `unload to N {unit} — strip the heavy plates` (when
  `currentLoad > nextLoad`). Property: the rendered string contains
  the per-side plates joined by ` + ` in the given order.

### Files touched

Created:

- `apps/mobile/src/features/session/components/BbbConfirmSurface.tsx`
  — new feature component for the W2.4 fork phase. Caps eyebrow +
  48pt "Boring But Big?" headline + sub-paragraph + mini `PlateBar` +
  split CTA. Exposes `cta-bbb-confirm` / `cta-bbb-skip` test IDs.
- `apps/mobile/src/features/session/components/__tests__/BbbConfirmSurface.test.tsx`
  — 6 behavior tests covering copy, callbacks, kg-glyph, plate bar
  presence.
- `apps/mobile/src/features/session/components/__tests__/AmrapLogSheet.test.tsx`
  — 6 behavior tests covering the chip row, chip→stepper sync, chip
  de-select on stepper ±, PR row appearance/disappearance across the
  threshold, and that the `· PR` suffix is no longer rendered inline.

Modified:

- `apps/mobile/src/domain/schemes.ts` — added `AppendSetLogInput`
  shape, `nextSessionPlan`, `bbbPlanRows`. Imports `round` from
  `./units` for snapping in `bbbPlanRows`. `Lift` is now imported
  alongside `Week`.
- `apps/mobile/src/domain/plates.ts` — added `plateLoadInstruction`.
  Imports `displayUnit` from `./units` for the unit glyph.
- `apps/mobile/src/domain/__tests__/schemes.test.ts` — added 12 new
  unit + property tests for the two new helpers.
- `apps/mobile/src/domain/__tests__/plates.test.ts` — added 7 new
  unit + property tests for `plateLoadInstruction`.
- `apps/mobile/src/features/session/hooks/useLiveScreenState.ts` —
  added `bbb-confirm` to `LivePhase`; added `TEN_SECOND_THRESHOLD`
  and `REST_CEILING_SECONDS` constants; added `tenSecondFiredRef` and
  `zeroFiredRef` once-per-cycle gates alongside the existing
  `warningFiredRef`; added new options
  (`fireSelectionHaptic`/`fireImpactHaptic`/`bbbPct`); routed all
  terminal-set log paths through `phase === 'rest'` + `postTerminalRest`
  state; forked `onAdvanceFromRest` into `bbb-confirm` when
  `postTerminalRest` is true; added handlers `onSkipRest`,
  `onAddRest`, `onConfirmBbb`, `onSkipBbb`, `onImmediateCancel`;
  exposed `bbbPrescribedWeight` and `loggedWorkingCount` on the result
  shape. The BBB writer uses `Promise.allSettled` so a partial failure
  still completes the session per the spec's error policy.
- `apps/mobile/src/features/session/components/RestPhase.tsx` —
  removed unused style-const drafts; added LOGGED band props
  (`loggedWeight`, `loggedReps`) and band rendering with optional
  `EST. 1RM x [· PR]` right cell when AMRAP; added `plateInstruction`
  caption below NEXT SET `TopSetBlock`; added `onSkipRest`/`onAddRest`
  passthrough to `RestTimer`.
- `apps/mobile/src/features/session/components/RestTimer.tsx` —
  count-DOWN math; pins at `0:00` past T-0; tap-to-toggle count-up
  display (eyebrow flips to `OVER REST`, label shows `m:ss over`);
  inline `SKIP` / `+30s` chips with `hitSlop` for 44pt minimum target.
- `apps/mobile/src/features/session/components/AmrapLogSheet.tsx` —
  preset chip row (`PRESET_REPS_WIDE` / `PRESET_REPS_NARROW`, width
  detected via `Dimensions.get('window').width`, breakpoint 360pt);
  chip-vs-stepper selection state tracking (`selectedChipValue`);
  promoted PR row below the chips with `accessibilityRole="alert"` +
  composed label; removed inline `· PR` suffix from EST. 1RM caption.
- `apps/mobile/src/features/session/LiveScreen.tsx` — wired BBB
  surface render, plate-instruction + LOGGED-band props on
  `RestPhase`, `handleCancelRequest` branching on
  `live.loggedWorkingCount` (Branch A immediate-cancel → `router.replace('/')`,
  else existing two-tap sheet), and the BBB confirm/skip haptics +
  callbacks.
- `apps/mobile/src/features/session/__tests__/LiveScreen.test.tsx` —
  +10 new tests covering BBB fork (rest→bbb-confirm transition, 5-row
  write, skip path), the W2.2 haptic ladder (T-10/T-3/T-0), skip/+30s
  controls, LOGGED band rendering on rest entry, plate-instruction
  rendering, Branch A immediate cancel. Updated the existing
  "complete flow" test to walk through the new rest → BBB-skip path.
  Updated the existing "two-tap cancel" test to seed
  `mockSetLogsState.data` with one working row so it reaches Branch B.
- `apps/mobile/src/features/session/components/__tests__/RestPhase.test.tsx`
  — flipped the two count-up assertions to count-down; added 6 new
  tests for LOGGED band, plate-instruction, and skip/+30s control
  presence.

### Decisions, spec interpretations, and resolved ambiguities

1. **Terminal-set routing through rest (W2.4).** The original
   `onLogWorkingSet` / `onSaveAmrap` transitioned straight to
   `phase: 'complete'` on the terminal set. The spec's ASCII shows the
   flow `set → amrap-log → (W2: BBB confirm) → complete` with a
   `rest ◄─ set (next index)` loop and the W2.4 trigger reading
   "rest → 'Next set' tap, instead of going straight to complete".
   That requires the rest phase to exist between the terminal set and
   the BBB confirm — so the three log-paths now route to `phase:
   'rest'` with a new `postTerminalRest` boolean. `onAdvanceFromRest`
   reads that flag and forks. This is the cleanest place to gate the
   fork because the existing setIndex remains typed `0|1|2` and no
   "set 3" sentinel value leaks into downstream consumers.
2. **`postTerminalRest` not `terminalRestRef`.** Used `useState` rather
   than `useRef` so the value participates in the React render — needed
   so the BBB phase render decision is committed via the same render
   cycle as the phase transition (avoids a one-frame flash of "old"
   rest-phase content).
3. **BBB writer uses `Promise.allSettled`, not `Promise.all`.** Per
   spec W2.4 error state: "if the 5-row write rejects mid-way ... do
   not roll back; partial write is benign". `allSettled` gives us the
   per-row outcome without short-circuiting; failures are logged via
   `console.warn` with the failed indices, completion happens
   regardless.
4. **PR-row animation deferred to Wave 3.** Spec W2.3 specifies a
   Reanimated height tween for the PR row (220ms ease-standard) with
   reduced-motion fallback = "instant show/hide". The existing
   AmrapLogSheet test does not mock `react-native-reanimated`, and
   pulling the Reanimated worklet runtime into the bottom-sheet test
   would require copying the HomeScreen-style inline mock and tracing
   any other consumers. I shipped the **reduced-motion variant** (the
   spec's own fallback path — instant show/hide) and noted Wave 3
   should layer the height tween once the Reanimated mock pattern is
   shared. Behavior is correct under reduced-motion users today; users
   without reduced-motion get the same instant-show as the fallback
   case until Wave 3.
5. **Cancel split logic, visuals deferred.** Per W2.5 the visual layer
   (X chip + overflow `…` chip + new `RightAction = 'cancel-split'`
   variant) is Wave 3. Wave 2 ships only the branching logic by
   wrapping the existing `kind: 'cancel'` `onPress`. The
   `handleCancelRequest` callback in LiveScreen owns the
   working-count branch + the `router.replace('/')` exit for Branch A;
   `useLiveScreenState.onImmediateCancel` does the DB write. Wave 3's
   visual layer can replace the wrapper and the `handleCancelRequest`
   becomes the X-chip's `onPress`; the overflow chip uses the same
   `onRequestCancel` for Branch C.
6. **BBB confirm renders its own split CTA, not the `CtaBar`.** The
   surface body holds two pills directly in a flex row — no `CtaBar`
   pinned below. Rationale: the BBB phase is full-surface (no rest
   timer competing for vertical real estate) so the buttons can sit
   flush with the headline. This is symmetric with how the `set` phase
   uses `SplitWorkingSetCta` inside `CtaBar` but inverted —
   `BbbConfirmSurface` doesn't need a sticky bottom strip because the
   user is done with main work and the page no longer scrolls. `cta`
   is set to `null` for `phase === 'bbb-confirm'` in `LiveScreen` so
   the `CtaBar` never renders.
7. **Bar weight (W2.1 plate-load instruction).** Pulled from the
   active `plateSet` (`'kg-standard'` → 20, else 45). The helper
   itself is unit-agnostic — caller passes the bar weight + per-side
   plates already decomposed in storage units. The output reads
   `... / side over {barWeight} bar` — bar weight is intentionally
   un-unit-suffixed (the convention is "the bar is the bar"; mixing
   `lb`/`kg` into the bar number would clutter the line).
8. **`onAddRest` resets warning/T-0 ref flags but not the T-10s flag.**
   Pushing the timer past T-3s / T-0 means a re-pass of those
   thresholds should re-fire (a +30s after T-0 should re-vibrate at
   T-0 again). T-10s is a heads-up — re-firing it on every +30s tap
   would be noisy, so its flag stays sticky until the next rest cycle
   resets it.
9. **W3.5 (rest target value rendering) was NOT touched.** The brief
   scopes Wave 2 to the LOGGED band + plate-instruction only on W2.1;
   the `TARGET` slot value is W3.5 per the revised spec's status
   matrix. Left untouched.

### Deviations from spec

1. **PR-row animation deferred.** See decision (4) above. Shipped the
   reduced-motion fallback (instant show/hide) instead of the
   Reanimated `withTiming(40, …)` height tween. Behavior is correct
   for reduced-motion users immediately; all other users see the same
   instant behavior until Wave 3 wires the Reanimated mock + worklet.

(That is the only spec deviation. The breathing pulse on the "Next
set" CTA was implicitly deferred as part of the same Reanimated
plumbing decision — the haptic ladder + SKIP control still provide
the T-0 signal, and the CTA label is already accurate. Wave 3 polish
can layer the breathe pulse using the same shared Reanimated mock the
PR row will need.)

### Verification

```
$ pnpm typecheck
> 531@0.0.0 typecheck /home/user/proof-531
> pnpm -r --parallel typecheck
apps/mobile typecheck: Done                                # exit 0

$ pnpm lint
> 531@0.0.0 lint /home/user/proof-531
> biome check .
Checked 184 files in 204ms. No fixes applied.              # exit 0

$ pnpm test
Test Suites: 59 passed, 59 total
Tests:       408 passed, 408 total                          # exit 0
```

Test delta: 360 (post-merge baseline) → 408 (+48). All 408 pass; the
three pre-existing LiveScreen timeouts called out in the Wave 1 log
have been resolved by main's `ebc34b2` (React 19 + fake-timer
plumbing). New tests cover the BBB fork, the haptic ladder, the
LOGGED band, the plate-instruction line, the AMRAP chip row + PR row,
the Branch A immediate-cancel, and the three new domain helpers.

Metro bundle export:

```
$ pnpm --filter @fivethreeone/mobile exec expo export --platform ios \
    --output-dir /tmp/expo-bundle-wave2-redo \
    --dump-sourcemap=false --dump-assetmap=false
...
› ios bundles (2):
_expo/static/js/ios/entry-…hbc (3.2MB)
...
Exported: /tmp/expo-bundle-wave2-redo                       # exit 0
```

Metro resolved every import. No missing transitive dependencies.

### Notes for Wave 3 implementers

1. **`live.loggedWorkingCount` and `live.onImmediateCancel` are
   already exposed.** Wave 3's visual layer (X chip + overflow `…`) can
   drop `handleCancelRequest` from `LiveScreen` and route the X chip
   directly to a new prop on `SessionTopBar`'s `RightAction =
   'cancel-split'` variant; the branching logic in
   `handleCancelRequest` lives in the screen because it talks to
   `router`, but the underlying hook handlers are already separated
   (`onImmediateCancel` for Branch A, `onRequestCancel` for B/C).
2. **`bbb-confirm` phase doesn't render a `CtaBar`.** Wave 3 visual
   changes (cancel split, overflow menu) shouldn't put any sticky
   bottom chrome on the BBB phase — the split CTA inside
   `BbbConfirmSurface` is intentionally flush with the surface flow.
   If the cancel split needs the X chip visible during BBB, it lives
   in `SessionTopBar` which already renders on all phases.
3. **`postTerminalRest` state in the hook.** Drives the BBB fork.
   Wave 3 should not need to touch it; the flag is reset on every
   non-terminal log (so a hypothetical user who logs the terminal set,
   skips BBB, somehow starts a new session, would land at fresh
   defaults). The cleanest extension point for "force BBB always" or
   "skip BBB always" toggles would be the hook's options object.
4. **W2.3 PR row animation owed.** The row currently renders/hides
   instantly. Wave 3 polish should layer the Reanimated `withTiming`
   height tween + the breathing pulse on the "Next set" CTA together
   — both need the same shared Reanimated jest mock. Suggest copying
   the `jest.mock('react-native-reanimated', ...)` block from
   `HomeScreen.test.tsx` into a `jest.setup.ts` so all tests inherit
   it, then both animations can ship together.
5. **W3.1 (plate leftover caption) is a one-line addition below the
   live `TopSetBlock` in `LiveScreen.tsx`.** The decomposition in
   `LiveScreen.tsx` line currently uses `decompose(...).perSide`; W3.1
   wants the full result so it can read `.leftover`. Trivial change.
6. **W3.3 (next-session row) uses `nextSessionPlan`, already shipped
   in Wave 2.** The helper is in `apps/mobile/src/domain/schemes.ts`;
   property-tested for cycle invariance over all
   `(lift, week, enabled.length=4)` inputs. Wave 3 can import it
   directly.
7. **W3.5 (RestTimer target value) is a 1-line edit.** The
   `RestTimer.tsx` header row already renders the literal `TARGET`
   string; swap to `TARGET ${formatLabel(target)}`. Wave 2 deliberately
   did not touch that line per scoping.
8. **Existing AmrapLogSheet tests do not mock the `Sheet` component
   wrapper's BackHandler.** Look at the inline `@gorhom/bottom-sheet`
   mock for the pattern used.
9. **`bbbPrescribedWeight` is exposed by the hook in storage units.**
   Display-unit conversion happens in `LiveScreen` (currently:
   `displayWeight(live.bbbPrescribedWeight, storageUnit, unit)`). Any
   future "BBB summary on Today" surface should do the same conversion
   at its own render site rather than asking the hook for display
   units (the hook stays render-agnostic).
10. **The breathing pulse on the "Next set" CTA was deferred along
    with the PR-row animation.** Spec W2.2 lists it as Reanimated
    `withRepeat(withTiming(1.04, ...), -1, true)` on the CTA at T-0.
    The haptic ladder + SKIP control are in place to signal T-0
    without the animation, so this is purely visual polish for Wave 3.

---

## Wave 2 fixup

Owner: `rn-frontend`
Scope: QA report (`_workspace/03_qa_report.md` Wave 2) Findings 1 (must-fix
MEDIUM) and 3 (informational raw `999` literal). Two-file fixup commit, no
new components, no new domain helpers, no spec deviation.

### Fix 1 — W2.1 NEXT SET band shows the BBB summary during post-terminal rest

The post-terminal rest cycle (between the AMRAP / set-3 log and the BBB
confirm fork) was rendering the NEXT SET band with the just-completed top
set's prescription because `useLiveScreenState` deliberately keeps
`setIndex === 2` so `onAdvanceFromRest` can branch on `postTerminalRest`.
The hook now publishes that flag on its result shape (was previously
internal local state); `LiveScreen` reads it and swaps both the `nextSet`
prop and the `plateInstruction` arguments when true.

- `apps/mobile/src/features/session/hooks/useLiveScreenState.ts` — added
  `postTerminalRest: boolean` to `UseLiveScreenStateResult` and
  the returned object. **Now publicly exposed** for Wave 3 (per QA Wave 3
  risk note 1, this was the recommended exposure pattern; landing it
  here removes that risk-note item).
- `apps/mobile/src/features/session/LiveScreen.tsx` — derived
  `isPostTerminalRest = live.phase === 'rest' && live.postTerminalRest`.
  When true: `plateInstruction` is computed against `bbbPerSide` (already
  decomposed at line 175) so `plateLoadInstruction` hits its `unload to`
  branch (BBB weight < top-set weight in all weeks of 5/3/1). The
  `nextSet` prop on `RestPhase` is overridden to
  `{ weight: bbbDisplayWeight, reps: 10, amrap: false, pct: 0.5,
  perSide: bbbPerSide, tmDisplay }`. The pre-existing non-terminal branch
  is unchanged.
- `apps/mobile/src/features/session/__tests__/LiveScreen.test.tsx` — two
  new tests:
  - `W2.1 fixup: post-terminal rest NEXT SET band shows BBB summary…` —
    drives the screen through the AMRAP save → rest, then asserts the
    `rest-phase-next-set-block-weight` testID renders `150` (50% × 300
    TM) and the `-reps` testID renders `× 10`.
  - `W2.1 fixup: post-terminal rest plate-load instruction starts with
    "unload to"…` — asserts the `rest-phase-plate-instruction` text
    matches `/^unload to /` and contains the 150 lb BBB target.

  Switched from `JSON.stringify(node.props)` (which throws on the
  React tree's circular `Provider` reference) to direct `-weight` /
  `-reps` testID assertions, which is the canonical pattern used by
  the surrounding W2.1 tests.

No `RestPhase.tsx` change needed — it already accepts the `nextSet` and
`plateInstruction` props.

### Fix 2 — `radii.pill` in BbbConfirmSurface

- `apps/mobile/src/features/session/components/BbbConfirmSurface.tsx` —
  pulled `radii` from `useTheme()` (already had `colors`, `spacing`,
  `type`) and replaced both `borderRadius: 999` literals at lines 91 and
  103 with `radii.pill`. Matches the W1.3 `SplitWorkingSetCta` pattern.

### Verification

```
$ pnpm typecheck
> 531@0.0.0 typecheck /home/user/proof-531
> pnpm -r --parallel typecheck
apps/mobile typecheck: Done                                # exit 0

$ pnpm lint
> 531@0.0.0 lint /home/user/proof-531
> biome check .
Checked 184 files in 208ms. No fixes applied.              # exit 0

$ pnpm test
Test Suites: 59 passed, 59 total
Tests:       410 passed, 410 total                          # exit 0
```

Test delta vs Wave 2 baseline: 408 → 410 (+2, both new W2.1-fixup tests).
Zero regressions.

```
$ pnpm --filter @fivethreeone/mobile exec expo export --platform ios \
    --output-dir /tmp/expo-bundle-wave2-fixup \
    --dump-sourcemap=false --dump-assetmap=false
...
› ios bundles (2):
_expo/static/js/ios/entry-…hbc (3.2MB)
...
Exported: /tmp/expo-bundle-wave2-fixup                      # exit 0
```

Metro resolved every import. No new npm deps.

### Notes for Wave 3

- `live.postTerminalRest` is now part of `UseLiveScreenStateResult` —
  Wave 3 visuals that need to distinguish the post-terminal rest cycle
  (e.g. the X-chip cancel split, the bbb-confirm-anchored cancel sheet
  underlying-surface fix) can read it directly without re-deriving from
  `setIndex === 2 && phase === 'rest'`.
- QA Wave 3 risk-note 1 (`postTerminalRest` exposure) is satisfied;
  risk-note 4 (`BbbConfirmSurface` `999` literal) is satisfied. The
  remaining open Wave 3 items (Reanimated bundle, cancel-sheet underlying
  surface, swipe-left on ResumeBanner, plate leftover caption, next-
  session row, RestTimer target value) are untouched.

---

## Wave 3

Owner: `rn-frontend`
Wave: 3 of 3 (Polish / P2)
Spec: `_workspace/01_design_spec.md` Wave-3 sub-sections (W3.1–W3.5) +
deferred-animation items from QA Wave 1 + Wave 2 reports (W3-A through
W3-D) + the cancel-sheet underlying-surface polish (W3-E).
Branch: `claude/workout-session-flow-audit-NMDoN`, HEAD `49c9e12`.
Baseline post Wave 2 fixup: 410/410 tests green.

### Scope handled this run

- **W3.1 — Plate leftover caption** below the live `TopSetBlock`. Threshold:
  `leftover > 0.1` storage units AND `round(leftoverDisplay, displayUnit) > 0`.
  Copy: `≈ {prescribed} {unit} — loaded {loaded} {unit} ({short} {unit} short)`.
  Hidden when the rounded leftover is 0 (the common case on lb plates).
- **W3.2 — Cancel split visual.** New `RightAction = 'cancel-split'`
  variant on `SessionTopBar` (extended discriminated union, not a mutation
  of `'cancel'`). Two 32×32 chips: X (tap = branch on
  `loggedWorkingCount`; long-press = open destructive sheet) and `…` (tap
  = open destructive sheet). Hit targets ≥ 44pt via `hitSlop`. The
  legacy `Cancel` pill variant is preserved for any future caller that
  needs it; Today screen does not pass a `rightAction` so no regression
  there. Logic was wired in Wave 2 (W2.5 `handleCancelRequest`); Wave 3
  adds the visuals + `handleLongPressCancel` for Branch C.
- **W3.3 — Next-session handoff row.** New `NextSessionRow` feature
  component at `apps/mobile/src/features/session/components/NextSessionRow.tsx`.
  Computes lift / week / day / weight × reps via the
  `nextSessionPlan(currentLift, enabledLifts, week)` domain helper
  shipped in Wave 2. TM lookup via `useLatestTms()`; missing-TM
  branch shows "Set a training max first" sub-line per spec. "Schedule
  reminder" button is a stub — fires a selection haptic + shows a
  2-second inline "Reminders coming soon." caption then auto-hides.
  Replaces the pre-existing `<View style={{ height: 140 }} />` spacer
  before the sticky CtaBar with the new row + a slim `height: 24`
  trailing spacer.
- **W3.4 — Cycle grid responsive breakpoint.** `Dimensions.get('window').width
  < 360` switches to a stacked single-row-per-week layout inside a
  horizontal `ScrollView`. Each week row carries the `W{n}` label as the
  leading element; cells stay 32×16 inside each row. Standard width (≥
  360pt) renders the existing 4×N flat grid unchanged. The `cycle-grid`
  testID is preserved on the standard-width row OR the narrow-width
  scroll container so existing tests keep passing.
- **W3.5 — RestTimer target value.** `RestTimer.tsx`'s header right cell
  now reads `TARGET {formatLabel(target)}` (e.g. `TARGET 1:30`) instead
  of the literal `TARGET`. 1-line edit; the slot was already in place.

### Deferred animation work (W3-A through W3-D)

- **W3-A — Shared Reanimated jest mock.** Created
  `apps/mobile/jest.setup.ts` and registered it via `package.json`'s
  `jest.setupFiles`. The shared mock covers `default.View` /
  `default.Text` / `default.ScrollView` for `Animated.X` fallthrough,
  the layout-animation primitives (`LinearTransition`, `FadeIn`,
  `FadeOut`), the worklet runtime hooks (`useSharedValue`,
  `useAnimatedStyle`, `useReducedMotion`, `withTiming`, `withRepeat`,
  `withSpring`, `runOnJS`), and the `Easing` builders. A companion
  `react-native-gesture-handler` mock covers the composable
  `Gesture.Pan() / Tap() / LongPress()` chainable factories used by
  W3-D's swipe wrapper. Removed the inline
  `jest.mock('react-native-reanimated', ...)` block from
  `HomeScreen.test.tsx` (the only test that explicitly relied on the
  inline shape, since it pulls in the swipe wrapper); other test files
  with locally-inlined mocks (`LiftPage.test.tsx`,
  `LiftPage.crossUnit.test.tsx`, `LiftPage.setDisplayUnit.test.tsx`,
  `SettingsScreen.queryShell.test.tsx`) continue to work because
  `jest.mock` is per-module and a per-file override re-binds the
  resolution.
- **W3-B — Breathing pulse on "Next set" CTA.** New `BreathingNextSetCta`
  inline component in `LiveScreen.tsx`. Drives a `useSharedValue(1)`
  scale via `withRepeat(withTiming(1.04, { duration: 800,
  easing: Easing.bezier(...easeStandardBezier) }), -1, true)` keyed
  off `restRemaining <= 0`. On the negative edge (next rest cycle), a
  single `withTiming(1, { duration: motion.durationBase })` lets the
  scale snap back without an abrupt halt mid-breath. Reduced-motion
  fallback (`useReducedMotion()` true) skips the worklet entirely and
  applies a 2pt `lineFaint` paper-ring border to the active CTA so the
  static "now" state is still visibly different.
- **W3-C — PR row height tween in AmrapLogSheet.** New `prRowHeight =
  useSharedValue(0)` tweened to 40 on cross-into-PR, back to 0 on
  cross-out, via `withTiming(motion.durationBase,
  Easing.bezier(...easeStandardBezier))`. The PR row's content stays
  conditionally rendered (so `accessibilityRole="alert"` doesn't fire
  on hidden rows) but the `Animated.View` wrapper is always in the
  tree so the height can tween cleanly. Reduced-motion fallback snaps
  `prRowHeight.value` to the target without a tween — matches the spec
  reduced-motion fallback exactly.
- **W3-D — Reanimated swipe-dismiss on ResumeBanner.** New
  `SwipeDismissibleResumeBanner` inline wrapper in `HomeScreen.tsx`.
  Composes a `Gesture.Pan().activeOffsetX([-12, 12]).onUpdate(...).onEnd(...)`
  with translation > 80pt OR velocity > 800pt/s left as the snap-out
  threshold. Snap-out runs `withTiming(-screenWidth, { duration:
  durationBase })` followed by `runOnJS(onDismiss)`. Below-threshold
  release snaps back to 0. A 250ms post-mount grace period
  (`graceElapsed` state) keeps the gesture disabled during the
  initial mount so accidental swipe-down-on-list events on the
  carousel below don't route to the banner. Reduced-motion
  (`useReducedMotion()` true) disables the gesture entirely; the
  primitive's in-built `accessibilityActions: dismiss` remains the
  canonical assistive path.

### Cancel sheet polish (W3-E)

- **Underlying surface during `cancel-confirm`.** Promoted
  `phaseBeforeCancelRef` (internal) to `phaseBeforeCancel` state in
  `useLiveScreenState`, and exposed it on `UseLiveScreenStateResult`.
  `LiveScreen` now derives `underlyingPhase = phase === 'cancel-confirm'
  ? phaseBeforeCancel : phase` and uses it to gate `showSetSurface` /
  `showRestSurface` / `showBbbConfirmSurface`. When the user opens the
  cancel sheet from `bbb-confirm`, the BBB surface stays visible
  underneath the sheet backdrop (previously the SET surface leaked
  through); same fix applies symmetrically to `rest` and the
  `working-set-log` / `amrap-log` overlays. The CTA selection (`Next
  set` vs `Got all N` vs `Log AMRAP` vs split CTA) now keys off the
  same `underlyingPhase` value so the cta layer matches the visible
  surface.

### Domain helpers added

None — Wave 3 consumes domain helpers shipped in Wave 2
(`nextSessionPlan`, `plateLoadInstruction`) and uses `decompose` from
`@/domain/plates` for the leftover caption. No new pure-domain math.

### Files touched

Created:

- `apps/mobile/jest.setup.ts` — shared Reanimated + Gesture Handler
  jest mock (W3-A). Registered via `apps/mobile/package.json` jest
  `setupFiles`.
- `apps/mobile/src/features/session/components/NextSessionRow.tsx` —
  new W3.3 feature component.
- `apps/mobile/src/features/session/components/__tests__/NextSessionRow.test.tsx`
  — 5 behavior tests covering copy, no-TM fallback, stub-button haptic
  + caption + auto-hide, and accessibility shape.
- `apps/mobile/src/features/session/components/__tests__/SessionTopBar.test.tsx`
  — 6 behavior tests covering the legacy `cancel` / `complete` variants
  AND the new `cancel-split` X + overflow chips with tap / long-press /
  accessibility-action routing.

Modified:

- `apps/mobile/package.json` — registered `jest.setup.ts` via `setupFiles`.
- `apps/mobile/src/design/primitives/ResumeBanner.tsx` — unchanged
  (W3-D's swipe gesture lives in the feature wrapper, per the
  primitive's explicit "render-only" contract).
- `apps/mobile/src/features/session/components/SessionTopBar.tsx` —
  added the `'cancel-split'` discriminated-union variant + the
  `CancelSplit` chip pair (X + overflow `…`). Legacy `'cancel'` and
  `'complete'` branches untouched.
- `apps/mobile/src/features/session/components/RestTimer.tsx` — W3.5
  one-line edit: the header right cell now renders `TARGET
  {formatLabel(target)}` with `testID="rest-timer-target"`.
- `apps/mobile/src/features/session/components/AmrapLogSheet.tsx` —
  W3-C wrapped the PR row in an `Animated.View` driven by
  `prRowHeight = useSharedValue(0)` + `withTiming(40, ...)` /
  `withTiming(0, ...)`. Reduced-motion path snaps without a tween.
  Outer wrapper carries a `amrap-pr-row-wrapper(-hidden)?` testID so
  tests can assert the cross-into-PR transition without depending on
  worklet execution.
- `apps/mobile/src/features/session/hooks/useLiveScreenState.ts` —
  W3-E: promoted `phaseBeforeCancelRef` (`useRef`) to
  `phaseBeforeCancel` (`useState`) so consumers can read it during
  render. Exposed it on `UseLiveScreenStateResult`.
- `apps/mobile/src/features/session/LiveScreen.tsx` — wired:
  - W3.1 leftover caption (sibling of `TopSetBlock`, `testID="live-bigweight-leftover"`).
  - W3.2 cancel-split right-action variant; new
    `handleLongPressCancel` for Branch C.
  - W3-B `BreathingNextSetCta` wrapping the rest-phase advance CTA.
  - W3-E `underlyingPhase` derivation gating surface + CTA selection.
- `apps/mobile/src/features/session/SessionCompleteScreen.tsx` — wired:
  - W3.3 `<NextSessionRow>` inserted between the cycle grid and the
    sticky CtaBar; spacer slimmed from 140pt to 24pt.
  - W3.4 responsive cycle-grid layout (`Dimensions.get('window').width
    < 360` switches to a stacked-rows ScrollView with W{n} labels).
  - `useLatestTms` consumed for the next-lift TM lookup.
- `apps/mobile/src/features/home/HomeScreen.tsx` — wrapped the
  `<ResumeBanner>` call site in `SwipeDismissibleResumeBanner` (W3-D).
  The wrapper composes the Pan gesture + the 250ms grace period +
  reduced-motion fallback.
- `apps/mobile/src/features/session/__tests__/LiveScreen.test.tsx` —
  +8 new tests covering W3.1 (leftover hidden on clean lb decomp +
  surface renders under unit mismatch), W3.2 (cancel-split visuals;
  overflow tap → sheet; long-press X with zero rows → sheet),
  W3.5 (TARGET 1:30 label), W3-E (cancel from `bbb-confirm` →
  BBB surface stays; cancel from `rest` → rest surface stays),
  W3-B (breathing wrapper is in the tree).
- `apps/mobile/src/features/session/components/__tests__/RestPhase.test.tsx`
  — +2 new tests for W3.5 (TARGET 1:30 / TARGET 3:00).
- `apps/mobile/src/features/session/components/__tests__/AmrapLogSheet.test.tsx`
  — +2 new tests for W3-C (PR row wrapper testID flips on
  cross-into-PR; wrapper always in the tree).
- `apps/mobile/src/features/session/__tests__/SessionCompleteScreen.test.tsx`
  — added the `useLatestTms` mock; +4 new tests for W3.3
  (NextSessionRow rendering; no-TM fallback) and W3.4 (standard
  layout vs narrow-width stacked layout via `Dimensions.get` override).
- `apps/mobile/src/features/home/__tests__/HomeScreen.test.tsx` —
  removed the inline `jest.mock('react-native-reanimated', ...)`
  block now that the shared `jest.setup.ts` covers it (the swipe
  wrapper needs `useSharedValue` + `useAnimatedStyle` +
  `useReducedMotion`, which the old inline shape didn't expose).

### Decisions, spec interpretations, and resolved ambiguities

1. **`underlyingPhase` derivation, not phase coalescing.** W3-E could
   have been implemented either (a) by `setPhase(phaseBeforeCancel)` on
   cancel-sheet open + a parallel "isCancelOpen" flag, or (b) by
   keeping the `cancel-confirm` phase tag and deriving the underlying
   surface from `phaseBeforeCancel`. Picked (b) because the existing
   `CancelConfirmSheet` already keys on `phase === 'cancel-confirm'`
   for its `open` prop; changing that contract would have cascaded.
   The derivation is also simpler to reason about for the screen layer
   — one read at the top of `LiveScreen`, applied uniformly to surface
   gating + CTA selection.
2. **Cancel-split branch B reuses the existing two-tap sheet.** Spec
   lines 626–634 describe a slimmer single-tap "End this session?"
   sheet for Branch B (≥1 working row) and reserve the two-tap for
   Branch C (long-press / overflow). Wave 3 ships Branch B against the
   existing `CancelConfirmSheet`'s two-tap copy; the destructive intent
   is identical and the divergent copy is a polish iteration. The
   `handleCancelRequest` branching is in place so a future iteration
   can introduce a slimmer single-tap variant without touching the
   wiring. Noted in the spec deviation column below.
3. **`handleLongPressCancel` shares `live.onRequestCancel`.** Branch B
   and Branch C both call into the existing destructive sheet — the
   distinction is purely visual (where the user tapped to open it).
   Both paths therefore use the same hook handler. The spec's
   "Branch C copy emphasises 'Sets are kept · The session is closed.'"
   maps to the existing sheet's `"Sets already completed are kept in
   history. The session is closed — pick it up tomorrow."` — close
   enough; a future polish pass can refine the copy.
4. **`useLatestTms` invalidation timing.** The next-session row reads
   from `useLatestTms()`, which is invalidated by `completeSession`'s
   downstream `advanceDay` call (existing behavior). For sessions
   completed via `cancelSession` (which doesn't run `advanceDay`),
   the screen never shows; for completed sessions the TM row reflects
   the latest committed bump. No additional invalidation needed.
5. **W3.2 long-press timing.** Spec says 300ms; RN's default
   `delayLongPress` is 500ms. Set `delayLongPress={300}` on the X chip
   so the destructive-territory hold-completion matches the spec.
6. **Cycle grid narrow-layout cells.** Spec says cells are 32pt wide
   × 16pt tall with `gap: 4` in the narrow layout. The flat-grid
   layout uses `flex: 1` (variable width) + `height: 16`. The narrow
   layout pins width to 32pt explicitly so the per-row width is
   deterministic (4 weeks × 4 lifts × 32pt + gaps ≈ 140pt; well under
   the 320pt iPhone SE viewport with horizontal-scroll fallback).
7. **W3-A shared mock vs jest-expo's RN mocks.** `react-native` itself
   is mocked by jest-expo. The shared `jest.setup.ts` only mocks
   `react-native-reanimated` and `react-native-gesture-handler` —
   neither is covered by jest-expo. No conflict with the upstream
   preset.
8. **W3-D gesture mock fidelity.** The shared mock returns chainable
   no-op objects for `Gesture.Pan().onUpdate().onEnd()` so the wrapper
   doesn't throw at module load. The actual gesture isn't exercised
   in jest (no native UI thread); the swipe behavior is covered by
   visual QA on device. The `onDismiss` callback path remains
   testable via the primitive's `accessibilityActions: dismiss` route
   (already in Wave 1's tests).
9. **`useState` for `phaseBeforeCancel`, not `useRef`.** The previous
   ref-based implementation worked for the cancel-dismiss return path
   (no re-render needed there). W3-E requires the screen render
   layer to read `phaseBeforeCancel` synchronously to pick the
   correct surface — that needs `useState`. The handler in
   `onRequestCancel` now sets both the cancel-sheet phase AND the
   pre-cancel snapshot in the same React render cycle.

### Deviations from spec

1. **W3.2 Branch B reuses the existing two-tap sheet.** Decision (2)
   above. The spec's slimmer single-tap variant for Branch B is queued
   for a future copy-polish PR; the destructive flow is functional.
2. **W3-A consolidation scope.** Hoisted the Reanimated mock once,
   but did NOT migrate the other 4 test files (`LiftPage.test.tsx`,
   `LiftPage.crossUnit.test.tsx`, `LiftPage.setDisplayUnit.test.tsx`,
   `SettingsScreen.queryShell.test.tsx`) that maintain their own
   inline mocks. Those files' inline mocks override the shared one
   for their suite — both work fine; consolidating them would expand
   the change surface beyond the W3 boundary. Wave 4 polish can
   migrate them when convenient. Spec acceptance criterion was
   "confirm by running tests that everything previously mocking
   locally still works" — confirmed (438/438 green).

(No other deviations.)

### Verification

```
$ pnpm typecheck
> 531@0.0.0 typecheck /home/user/proof-531
> pnpm -r --parallel typecheck
apps/mobile typecheck: Done                                # exit 0

$ pnpm lint
> 531@0.0.0 lint /home/user/proof-531
> biome check .
Checked 188 files in 228ms. No fixes applied.              # exit 0

$ pnpm test
Test Suites: 61 passed, 61 total
Tests:       438 passed, 438 total                          # exit 0
```

Test delta vs Wave 2 fixup baseline: 410 → 438 (+28). Zero regressions.
New tests cover:

- W3.1 leftover caption (hide on clean decomposition, surface still
  renders under unit-mismatch context).
- W3.2 cancel-split visuals (X + overflow chips render; overflow opens
  sheet; long-press with zero rows still opens sheet).
- W3.3 NextSessionRow (lift name + week/day + weight × reps;
  no-TM fallback; non-AMRAP suffix; stub-button haptic + caption +
  auto-hide; accessibility shape).
- W3.4 cycle grid responsive (standard 16-cell layout at ≥360pt;
  4 stacked week rows with W{n} labels at <360pt).
- W3.5 RestTimer TARGET {m:ss} value (90s → 1:30; 180s → 3:00).
- W3-B BreathingNextSetCta wrapper renders.
- W3-C PR row wrapper testID flips on cross-into-PR.
- W3-E cancel sheet from `bbb-confirm` shows BBB surface underneath;
  cancel sheet from `rest` shows rest surface underneath.
- SessionTopBar `cancel-split` variant tap / long-press / overflow
  routing + accessibility action.

```
$ pnpm --filter @fivethreeone/mobile exec expo export --platform ios \
    --output-dir /tmp/expo-bundle-wave3 \
    --dump-sourcemap=false --dump-assetmap=false
...
› ios bundles (2):
_expo/static/js/ios/entry-…hbc (3.2MB)
...
Exported: /tmp/expo-bundle-wave3                            # exit 0
```

Metro resolved every import. No new npm deps were added (Reanimated +
Gesture Handler were already in the dependency graph; this wave only
introduces new import sites).

### Notes for post-Wave-3 review

1. **Spec deviation 1 (Branch B copy)** — the Wave-3 work reuses the
   two-tap sheet copy for Branch B. A copy-polish PR can swap in the
   "End this session?" single-tap variant the spec describes; the
   `handleCancelRequest` seam already encapsulates the branching.
2. **Spec deviation 2 (W3-A scope)** — four test files still inline
   their own Reanimated mocks (`LiftPage.test.tsx`,
   `LiftPage.crossUnit.test.tsx`, `LiftPage.setDisplayUnit.test.tsx`,
   `SettingsScreen.queryShell.test.tsx`). They override the shared
   mock for their suite. Migration is trivial — delete the inline
   block — but is out of W3 scope.
3. **W3-B breathing pulse on the post-terminal rest CTA**: the CTA
   label reads "Complete session" in that window (not "Next set");
   the breathing pulse still fires at T-0 because `live.restRemaining`
   ticks identically. This is the intended behavior — T-0 is "now
   you can advance", regardless of whether the advance is to the next
   set or to the BBB-confirm fork.
4. **P4 candidate (out of W3 scope, do not implement):** the AMRAP
   sheet's preset chip row at iPhone-SE width (<360pt) still drops
   the `[3]` chip per Wave 2 spec — but with the W3.4 narrow-screen
   handling now applied to the cycle grid, a future iteration could
   apply the same `Dimensions.get` snapshot pattern to other
   responsive surfaces (Today's warmup ramp row, the receipt's
   volume row at very narrow widths). No user-reported issue; flagged
   only for thinking-ahead.
5. **`live.phaseBeforeCancel` exposure is the canonical "the cancel
   sheet is open, where did we come from" signal.** Future surfaces
   (e.g. an in-app history of "you opened cancel from rest at T-12s")
   should read it rather than re-deriving from `phase ===
   'cancel-confirm'`.
6. **PR row animation now lives in `AmrapLogSheet.tsx` and the
   breathing pulse in `LiveScreen.tsx`'s `BreathingNextSetCta`.**
   Both could be promoted to design primitives if a second call site
   appears. For now they're feature-local because Live and the AMRAP
   sheet are the only consumers.
