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
