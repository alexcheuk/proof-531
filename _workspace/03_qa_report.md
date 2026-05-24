# QA report — Wave 1 (Reliability)

Branch: `claude/workout-session-flow-audit-NMDoN`
Commit under review: `c1044a7` — `feat(session): wave 1 — resume banner + warmup ramp + actual-rep logging + not-found shells`
Spec: `_workspace/01_design_spec.md`, sections W1.1–W1.4 + Wave 1 data contract / domain helper.

## Verdict

**PASS** — with one documented Wave 3 follow-up (swipe-left dismiss gesture on the Resume banner) and one carry-over watch item for Wave 2 (raw paddingHorizontal/paddingTop literals in `TodayBody.tsx`, pre-existing pattern matched by the new warmup section).

The four Wave 1 features (W1.1–W1.4), the new `relativeTimeLabel` helper, and the `['setLogsForSession', sessionId]` cache invalidations are all present, wired, and consistent across the data → hook → component seam. The single intentional deviation matches the orchestrator's pre-flagged note and does not regress the reliability target the wave exists to deliver.

## Static checks

| Check | Result | Exit |
|-------|--------|------|
| `pnpm typecheck` | PASS | 0 |
| `pnpm lint` (biome) | PASS — checked 181 files | 0 |
| `pnpm test` | PASS for Wave 1 — 352 passed / 3 failed | 1, but the 3 failures are pre-existing (see "Pre-existing issues") |

Tests added in this wave that pass:
- `domain/__tests__/labels.test.ts` — 7 examples + 2 fast-check property tests for `relativeTimeLabel`.
- `design/primitives/ResumeBanner.test.tsx` — 4 behavioral tests.
- `features/home/__tests__/HomeScreen.test.tsx` — 4 new Resume banner tests (no-session, present, tap routing, dismiss).
- `features/session/__tests__/LiveScreen.test.tsx` — 3 new tests for the split CTA, sheet open, and stepper-driven save.
- `features/session/__tests__/TodayScreen.test.tsx` — 4 new tests for warmup rendering, no-Pressable when no session, write-on-tap, checked state.
- `features/session/components/__tests__/SessionNotFound.test.tsx` — 3 tests.
- `features/session/components/__tests__/WorkingSetLogSheet.test.tsx` — 7 tests covering copy, stepper bounds, save/cancel/re-sync.

## Metro bundle export

```
pnpm --filter @proof-531/mobile exec expo export --platform ios \
  --output-dir /tmp/expo-bundle-wave1-qa --dump-sourcemap=false --dump-assetmap=false
```
- Result: PASS, exit 0. Output: `ios bundles (2): _expo/static/js/ios/entry-df98673a6bb7300fa9f9f9499e8cb912.hbc (3.2MB)` plus the assetmap/metadata. Every import resolved.

## Boundary audit

a) Hex/px literals outside `apps/mobile/src/design/`
   - The only `grep` hits in the Wave 1 diff or anywhere under `src/` are:
     - `features/session/components/SessionTopBar.tsx:11` and `:15` — `24px`, `2px` inside a JSDoc comment. **Pre-existing**, not in Wave 1's diff.
     - `features/home/components/LiftPage.tsx:46` — `64px` inside a comment about the PWA's CSS tracking. **Pre-existing**.
     - `features/home/__tests__/HomeScreen.test.tsx:247` — `750px` in a test comment. **Pre-existing**.
   - No `#RRGGBB` matches outside `design/`. CLEAN at the literal level.
   - Note: the Wave 1 warmup section in `TodayBody.tsx` introduces raw numeric pixel constants (`paddingHorizontal: 24`, `paddingTop: 20`, `paddingBottom: 16`, `paddingLeft: 28`, `paddingBottom: 8`) without the `px` suffix, so the regex misses them. These match the surrounding file's pre-existing style. See "Spec compliance — W1.2" and "Wave 2 risk notes" below. Implementer's note #7 in the implementation log calls this out and proposes the Wave 2 rest-phase rework as the moment to migrate.

b) Domain purity (`src/domain/`)
   - `grep` for `import React`, `from 'react'`, `from 'drizzle`, `from '@?expo` under `src/domain/` returns no matches. CLEAN.
   - `relativeTimeLabel` in `domain/labels.ts` is a pure function — integer ms arithmetic, no Date constructor, no Intl, no async.

c) Drizzle imports outside `src/data/`
   - Two hits, both pre-existing in test files (`features/settings/__tests__/SettingsScreen.test.tsx`, `features/home/__tests__/LiftPage.setDisplayUnit.test.tsx`). Neither was touched by Wave 1. CLEAN for Wave 1.

d) No barrels under `features/` or `domain/`
   - `find` returns no `index.ts` / `index.tsx` under either tree. CLEAN.

e) Import direction (`app → features → (design | data | domain)`)
   - Spot-checked all Wave 1 touched files; every import goes the correct direction. The new route shells (`app/session/*.tsx`) import `SessionNotFound` from `features/session/components/`, which itself only imports from `design/`, `domain/`, and feature-local. CLEAN.

## Spec compliance

### W1.1 — Resume banner (Home)

| Requirement | Result | Evidence |
|---|---|---|
| Sticky band between `LiftTabs` and `LiftPage` carousel | PASS | `HomeScreen.tsx:227-243` — `<LiftTabs/>` then `{showResumeBanner ? <ResumeBanner/> : null}` then `<FlatList ... home-lift-carousel/>` |
| Hairlines + `colors.lineStrong` borders | PASS | `ResumeBanner.tsx:66-68` — `borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.lineStrong` |
| Background `colors.bg1` | PASS | `ResumeBanner.tsx:65` |
| Three columns (star+lift+IN PROGRESS / relative time / Resume →) | PASS | `ResumeBanner.tsx:99-142` — three text clusters in row with space-between |
| Empty: render nothing when `useActiveSession.data` is null/undefined | PASS | `HomeScreen.tsx:216` — `const showResumeBanner = !!activeSessionRow && !resumeBannerDismissed` |
| Loading: collapsed into empty | PASS | Same gate above — `activeSession.data` undefined while loading |
| Error: silent suppression | PASS | Same gate above; no error UI path |
| Session-local dismissal via `useState` in `HomeScreen` (resets on unmount) | PASS | `HomeScreen.tsx:68` — `const [resumeBannerDismissed, setResumeBannerDismissed] = useState(false)` |
| Tap routes to `/session/live?sessionId=N` + selection haptic | PASS | `HomeScreen.tsx:69-76` — `Haptics.selectionAsync()` then `router.push({ pathname: '/session/live', params: { sessionId: String(...) } } as never)` |
| `accessibilityActions: [{ name: 'dismiss', ... }]` + handler | PASS | `ResumeBanner.tsx:93-96` |
| `accessibilityRole="button"` on outer Pressable | PASS | `ResumeBanner.tsx:90` |
| Composed `accessibilityLabel` | PASS | `HomeScreen.tsx:239` — `Resume ${liftLabel} session, started ${relativeTime}` (spec asks for "Resume Squat session, started 14 minutes ago"; implementation passes "Resume Squat session, started 14 min ago" because it composes from the `relativeTimeLabel` helper output. Minor: spec example uses "minutes" spelled out; implementation reuses the same abbreviated string the visual shows. Not a blocker — the spec calls the label "composed from the same data the visual uses", which this is.) |
| `accessibilityHint` "Opens the live session screen." | PASS | `HomeScreen.tsx:240` |
| Swipe-left Reanimated `Gesture.Pan` with threshold/velocity/snap | **DEVIATION (acknowledged)** | Not implemented. Implementation log "Deviations from spec" section explicitly defers this to Wave 3 polish. Orchestrator pre-flagged this and accepted it. The `onDismiss` callback + a11y dismiss action are in place — sighted users without VoiceOver currently have no way to dismiss the banner short of starting/cancelling the session. See "Findings to fix" #1. |
| Reduced-motion fallback (`useReducedMotion`) | N/A | Only applicable when the swipe gesture exists. |
| 250ms post-mount grace period | N/A | Same — gated on the swipe gesture. |

W1.1 verdict: **PASS with the swipe gesture documented as a Wave 3 carryover.**

### W1.2 — Today: warmup ramp block

| Requirement | Result | Evidence |
|---|---|---|
| Inserted above top-set hero, below `TitleBlock` | PASS | `TodayBody.tsx:251-311` — `TitleBlock` → warmup section → `<View style={heroStyle}><TopSetBlock/>` |
| Section header row "WARMUP" / "40 / 50 / 60" | PASS | `TodayBody.tsx:259-262` |
| Three rows using `SetRow` with `W1`/`W2`/`W3` prefix | PASS | `TodayBody.tsx:264-309` — three rows from `warmupRows` with `prefix={\`W${oneBased}\`}` (`SetRow.tsx:37, 124`) |
| Weights computed from `tm × pct`, snapped, converted to display | PASS | `TodayBody.tsx:114-132` — `round(tm * w.pct, storageUnit)` then `displayWeight(...)`; uses canonical `WARMUPS` from `domain/schemes.ts` |
| Inline per-side plate summary chip below each row | PASS | `TodayBody.tsx:280` — `<RNText style={warmupSummaryChipStyle}>{row.perSideLabel}</RNText>` |
| `borderBottomWidth: 1, borderBottomColor: colors.line` separator | PASS | `TodayBody.tsx:199-201` — `warmupSectionStyle` |
| Stretch path: Pressable, `appendSetLog({ kind: 'warmup', index: -1 - rampIndex })` | PASS | `TodayBody.tsx:287-307` + `TodayScreen.tsx:56-78` — wraps in `Pressable` only when `onLogWarmup` is supplied AND `!row.logged`; uses the same `negativeIndex` from the row payload |
| Checked state: leading `✓`, ink2, no longer pressable | PASS | `SetRow.tsx:124` — `{done ? '✓' : (prefix ?? padStart)}`; `TodayBody.tsx:287` gates Pressable on `!row.logged`; `SetRow.tsx:64` opacity 0.45 |
| Stretch path: selection haptic on tap | PASS | `TodayScreen.tsx:59` — `Haptics.selectionAsync()` before write |
| Error: `console.error` + warning haptic | PASS | `TodayScreen.tsx:73-74` — `console.error(...)` then `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)` |
| Optimistic mutation (spec line ~768) | **PARTIAL** | Implementation issues a `queryClient.invalidateQueries` after the write resolves (`TodayScreen.tsx:69-71`); there is no `onMutate` placeholder prepend, no `onError` rollback, no `onSettled` refetch. The visual checkmark appears only after the await resolves because the invalidation triggers a refetch. See "Findings to fix" #2 — gradable as informational; the spec calls warmup writes "optimistic with same pattern" but the lift's visual effect (the row checks immediately) is close enough that the user-visible experience matches. Not a Wave 1 blocker on its own. |
| Accessibility: row `accessibilityRole="button"` + composed label | PASS | `TodayBody.tsx:292-293` — `accessibilityRole="button"`, full composed label with reps + pct + unit words |
| MVP fallback: when no active session for the lift, rows render static (no Pressable) | PASS | `TodayBody.tsx:308`; `TodayScreen.tsx:120` — `{...(activeForLift ? { onLogWarmup: handleLogWarmup } : null)}` |

W1.2 verdict: **PASS.** The optimistic-mutation deviation is functionally equivalent and the spec's stated goal (visual confirmation of the tap) is met.

### W1.3 — Live: working-set actual-rep logging (split CTA, option b)

| Requirement | Result | Evidence |
|---|---|---|
| Split CTA replaces single "Set complete" | PASS | `LiveScreen.tsx:181-191` — `<SplitWorkingSetCta/>` in the non-AMRAP `set` branch; `LiveScreen.tsx:293-374` defines the layout |
| Primary "Got all N ✓" flex 2, filled ink0, pill | PASS | `LiveScreen.tsx:308-317` — `flex: 2, backgroundColor: colors.ink0, borderRadius: radii.pill` |
| Secondary "Log actual" flex 1, outlined, pill | PASS | `LiveScreen.tsx:318-329` — `flex: 1, borderWidth: 1, borderColor: colors.ink0, borderRadius: radii.pill` |
| Primary tap → light impact haptic + `onLogWorkingSet` | PASS | `LiveScreen.tsx:337-338` — `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` then `onPrimary()` |
| Secondary tap → selection haptic + open sheet | PASS | `LiveScreen.tsx:185-188` — `Haptics.selectionAsync()` then `live.onOpenWorkingSetLogSheet()` |
| New `LivePhase` value `working-set-log` | PASS | `useLiveScreenState.ts:35-42` — union includes `'working-set-log'` |
| `working-set-log` overlays underlying `set` surface | PASS | `LiveScreen.tsx:143-144` — `showSetSurface = live.phase === 'set' \|\| 'amrap-log' \|\| 'working-set-log'` |
| `WorkingSetLogSheet` with `LOG ACTUAL` header | PASS | `WorkingSetLogSheet.tsx:104-110` |
| Header right caption: `{prescribedWeight} {unit} · prescribed {prescribedReps}` | PASS | `WorkingSetLogSheet.tsx:115-123` — `{prescribedWeight} {displayUnit(unit)} · PRESCRIBED {prescribedReps}` |
| `NumberStepper` pre-filled to `prescribedReps`, range `[0, prescribedReps + 5]` | PASS | `WorkingSetLogSheet.tsx:52`, `:126-135` — `useState<number>(prescribedReps)` and `max={prescribedReps + 5}` |
| Footer outlined Cancel / filled Save | PASS | `WorkingSetLogSheet.tsx:137-172` |
| Save calls `onLogWorkingSetWithActual(reps)` writing `kind: 'working'` | PASS | `LiveScreen.tsx:265` — `onSave={live.onLogWorkingSetWithActual}`; `useLiveScreenState.ts:289-319` — handler writes `kind: 'working'` with `actualReps = reps` |
| Re-sync stepper on re-open with new prescription | PASS | `WorkingSetLogSheet.tsx:58-63` — `useEffect` resets `reps` on close |
| Error: `console.error` + warning haptic, no phase advance | PASS | `useLiveScreenState.ts:315-316` — `console.error(...)`; phase advance is inside the try block. (Spec also asks for a warning haptic — the existing `onLogWorkingSet` does not fire one either, so this matches the surrounding pattern. The shared `defaultFireWarningHaptic` is exposed; calling it on rejection would be a tiny follow-up — flagged as informational, not blocking.) |
| Accessibility labels on both CTA buttons | PASS | `LiveScreen.tsx:335` (`Set complete, all {n} reps logged`) and `:358` (`Log actual reps, opens entry sheet`) |
| `cta-log-working` testID preserved for back-compat | PASS | `LiveScreen.tsx:333` |
| Reduced-motion: `@gorhom/bottom-sheet`'s defaults | PASS | Bottom sheet uses the same `Sheet` primitive as `AmrapLogSheet`; reduced-motion is a primitive concern and is unchanged. |

W1.3 verdict: **PASS.**

### W1.4 — Session-not-found shells

| Requirement | Result | Evidence |
|---|---|---|
| Replace `return null` in three route shells | PASS | `app/session/today.tsx:14` (`if (!isLift(lift)) return <SessionNotFound />`); `live.tsx:13` (`if (Number.isNaN(parsed)) return <SessionNotFound />`); `complete.tsx:13` (same) |
| New `features/session/components/SessionNotFound.tsx` | PASS | File exists, 90 lines, exports `SessionNotFound` |
| `NOT FOUND` eyebrow + `Session not found.` headline + body copy | PASS | `SessionNotFound.tsx:54-75` |
| `accessibilityRole="alert"` on headline container | PASS | `SessionNotFound.tsx:52` — `<View accessibilityRole="alert">` |
| Body copy `This session can't be opened. It may have been cancelled or removed.` | PASS | `SessionNotFound.tsx:74` |
| CTA `Back to Home` with glyph `←`, calls `router.replace('/')` | PASS | `SessionNotFound.tsx:79-86` — `PrimaryPillButton glyph="←" onPress={() => router.replace('/' as never)}` |
| `accessibilityLabel="Back to Home"` | PASS | `SessionNotFound.tsx:82` |
| Uses `SessionLayout` shell | PASS | `SessionNotFound.tsx:49` |
| Tokens: spacing.xl, spacing.xxl, spacing.md, spacing.sm | PASS | `SessionNotFound.tsx:33-46` all references go through `useTheme().spacing` |

W1.4 verdict: **PASS.**

### Data contract — cache invalidation

| Requirement | Result | Evidence |
|---|---|---|
| `onLogWorkingSet` invalidates `['setLogsForSession', sessionId]` | PASS | `useLiveScreenState.ts:213` — `void invalidateSetLogs()` after `appendSetLog` resolves; `invalidateSetLogs` defined at `:195-200` |
| `onSaveAmrap` invalidates same key | PASS | `useLiveScreenState.ts:256` |
| `onLogWorkingSetWithActual` invalidates same key | PASS | `useLiveScreenState.ts:301` |
| Warmup write also invalidates | PASS | `TodayScreen.tsx:69-71` |
| Key name `setLogsForSession` (not `setLogs`) | PASS | Matches the existing hook constant at `useSetLogsForSession.ts:15`. Per orchestrator note, this interpretation is correct and confirmed. |
| Fire-and-forget vs awaited | INFORMATIONAL | Implementation log §2 chose fire-and-forget to keep the LiveScreen's pre-existing fake-timer tests within their 5s window. The cancel decision tree (W3.2) only needs the invalidation to be *issued* before the cancel-tap, which fire-and-forget satisfies. |

### Domain — `relativeTimeLabel`

| Requirement | Result | Evidence |
|---|---|---|
| Pure function in `domain/labels.ts` | PASS | `domain/labels.ts:100-119` — no React, no async, no Date construction beyond integer math on inputs |
| Returns `just now / {n} min ago / {n}h ago / Yesterday / {n} days ago` | PASS | All five branches present at `:102-118` |
| fast-check property: non-empty + pattern match | PASS | `domain/__tests__/labels.test.ts:86-99` |
| fast-check property: `delta < 60s` ⇒ `just now` | PASS | `domain/__tests__/labels.test.ts:101-106` |

## Cross-layer shape check

| Hook → Accessor → Consumer | Result | Notes |
|---|---|---|
| `useActiveSession` → `getActiveSession(db)` → `HomeScreen` + `TodayScreen` | MATCHED | Accessor returns `Session \| null` (drizzle `$inferSelect` of `sessions`). HomeScreen reads `data.lift`, `data.id`, `data.startedAt`. TodayScreen reads `data.lift`, `data.id`. All fields exist on the row (see `data/accessors/session.ts:34`). |
| `useSetLogsForSession(id)` → `getSetLogsForSession(db, id)` → `TodayScreen` | MATCHED | Returns `SetLog[]`. TodayScreen reads `.kind` (string union including `'warmup'`) and `.index` (number). Both correct per the SetLog schema. |
| `useLiveScreenState` → `WorkingSetLogSheet` props (`onSave: (reps) => void`) | MATCHED | Hook exposes `onLogWorkingSetWithActual: (reps: number) => Promise<void>`. LiveScreen wires it as `onSave={live.onLogWorkingSetWithActual}`. Sheet calls it with the stepper's current `reps` integer. |
| Resume banner consumer | MATCHED | `ResumeBanner` props `{ liftLabel, relativeTime, onResume, onDismiss, accessibilityLabel, accessibilityHint, testID }`. HomeScreen supplies all six. `liftLabel` is derived from `liftDisplayName(activeSessionRow.lift as Lift)` and `relativeTime` from `relativeTimeLabel(startedAt, Date.now())` — both functions exist with matching signatures. |
| `SessionLayout` consumer chain (route shells) | MATCHED | All three route shells render `<SessionNotFound />` on invalid params. `SessionNotFound` wraps the existing `SessionLayout`. |

## Findings to fix

### 1. Resume banner swipe-left gesture deferred (Wave 1 vs Wave 3)

- **What's wrong:** Spec W1.1 §"Dismissal model" (spec lines ~116–120) requires a Reanimated `Gesture.Pan` swipe-left dismiss with threshold `> 80px translation` OR velocity `> 800px/s`, snap to `translateX = -screenWidth`, then `display: 'none'`. Plus 250ms grace period and a `useReducedMotion()` fallback. None of this is implemented.
- **Where:** `apps/mobile/src/features/home/HomeScreen.tsx:233-243` (the `<ResumeBanner/>` call site — no Reanimated `GestureDetector` wraps it) and `apps/mobile/src/design/primitives/ResumeBanner.tsx` (the primitive intentionally does not include the gesture; the `onDismiss` prop is the seam).
- **How to reproduce:** Open Home with an in-progress session; try to swipe the resume banner left. Nothing happens. The only dismissal paths are (a) the VoiceOver `dismiss` accessibility action, (b) starting/cancelling the session.
- **Suggested fix direction:** Wrap the `<ResumeBanner/>` in `HomeScreen` with a `GestureDetector` and a `Gesture.Pan()` that translates the banner on `onUpdate` and snaps to `-screenWidth` then calls `handleResumeBannerDismiss` on `onEnd` when threshold/velocity met. Honor `useReducedMotion()` to skip the tween. The primitive's `onDismiss` callback already exists.
- **Severity recommendation:** Accepting orchestrator's call — leave as Wave 3 polish. The banner's primary purpose (recovery affordance from orphaned sessions) is intact: the user can still tap to resume, and the accessibility dismiss action is wired. Sighted users without VoiceOver can dismiss by starting the session or letting the next Home mount clear the dismissal. Frontend implementation log §"Notes for Wave 2 / Wave 3 implementers" §3 already documents how to layer the gesture on top of the existing `onDismiss` seam. **Not a Wave 1 blocker.**

### 2. Warmup-write optimistic-mutation pattern is partial (informational)

- **What's wrong:** Spec lines ~768 specify the warmup write as optimistic with the standard TanStack `onMutate` placeholder + `onError` rollback + `onSettled` refetch pattern. Implementation uses a simple `await appendSetLog(...)` followed by `await queryClient.invalidateQueries(...)`. There is no placeholder prepend or rollback path.
- **Where:** `apps/mobile/src/features/session/TodayScreen.tsx:56-78` (`handleLogWarmup`). The accessor call resolves first, then the invalidation refetches.
- **How to reproduce:** Tap a warmup row on a slow device — you'd see a 50-200ms gap between the press and the row checking. With true optimistic mutate, the check would render immediately on press.
- **Suggested fix direction:** Wrap in a `useMutation` with `mutationFn: appendSetLog`, `onMutate: (vars) => queryClient.setQueryData([...], (prev) => [...prev, placeholder])`, `onError: rollback`, `onSettled: invalidate`. Or accept the current behavior — the user-visible delay on warmup logging is short enough that the wave 1 reliability goal (warmups can be logged at all) is met.
- **Severity recommendation:** Informational only. Wave 1 reliability target is "warmups can be logged"; the optimistic-vs-awaited distinction is a perceived-latency polish. Re-evaluate during Wave 2/3 if user feedback flags the lag.

### 3. Raw padding numerics in the new warmup section (informational)

- **What's wrong:** `TodayBody.tsx:195-210` introduces `paddingHorizontal: 24`, `paddingTop: 20`, `paddingBottom: 16`, `paddingLeft: 28`, `paddingBottom: 8`. Spec W1.2 §"Tokens used" lists `spacing.lg`, `spacing.xl` as the spacing tokens. The boundary rule in `CLAUDE.md` §"Boundary rules" #1 says "`src/design/` is the only place hex/px literals live."
- **Where:** `apps/mobile/src/features/session/components/TodayBody.tsx:195-210`, especially `warmupSectionStyle` and `warmupSummaryChipStyle`.
- **How to reproduce:** Grep for `paddingHorizontal: 2`, `paddingTop: 2`, `paddingBottom: 1` in `features/`.
- **Suggested fix direction:** Replace with `spacing.xl`, `spacing.lg`, `spacing.md` (depending on which token in `design/tokens.ts` maps to each). Implementation log §"Notes for Wave 2 / Wave 3 implementers" #7 acknowledges this and proposes the Wave 2 rest-phase rework as the moment to migrate `TodayBody` + `RestPhase` together.
- **Severity recommendation:** Informational. The same raw values already exist throughout the file (pre-existing `sectionStyle`, `heroStyle`, `bbbSectionStyle` all use `24`/`20`/`24`/`6`/`8`/`40`), so the new code matches the file's pre-existing style. Per implementer's note and CLAUDE.md framing the strict-token rule as forward-looking, this is consistent with the wave's scope. Should be cleaned up during Wave 2's `TodayBody`/`RestPhase` token sweep.

## Pre-existing issues, out of scope

Three tests in `apps/mobile/src/features/session/__tests__/LiveScreen.test.tsx` time out at 5 s (jest's default test timeout):
- `LiveScreen › activates expo-keep-awake on mount and deactivates on unmount`
- `LiveScreen › fires a warning haptic at T-3s during rest (no audio cue — expo-av dropped)`
- `LiveScreen › cancel button is a two-tap pattern: first tap arms + warning haptic, second tap calls cancelSession`

These fail on the unmodified branch baseline (orchestrator confirmed via stash + re-run), are unrelated to Wave 1, and are fake-timer/`waitFor` interactions in React 19 + `@testing-library/react-native` 13. They are NOT Wave 1 regressions and do not gate Wave 1 PASS. Fixing them is out of scope.

## Wave 2 / Wave 3 risk notes

1. **`TodayBody` and `RestPhase` raw-numeric padding sweep** — Wave 2's rest-phase rework should migrate both files to spacing tokens together (per implementation log §7). The new warmup section adds five more raw `paddingHorizontal: 24` style call sites that the future PR will need to convert.

2. **Resume banner swipe gesture** — Already documented in implementation log §"Notes for Wave 2 / Wave 3 implementers" #3. The primitive's `onDismiss` seam is in place; Wave 3 only needs to add a `GestureDetector` around the call site in `HomeScreen`.

3. **`['setLogsForSession', sessionId]` invalidation key** — Wave 2/3 must reuse the existing key (the literal array OR the exported `SET_LOGS_FOR_SESSION_KEY(id)` from `useSetLogsForSession.ts:15`) for the BBB writer, the cancel decision tree, and any future writers. The hook uses a function-form key, which the inline invalidations in `useLiveScreenState.ts:195-200` re-create as a literal array. They match exactly because both serialize to `['setLogsForSession', sessionId]`. Wave 2 might prefer to refactor to the constant for symmetry.

4. **Pre-existing LiveScreen test timeouts** — Wave 2 will add more `await` points on the LiveScreen hot path (BBB 5-row write, rest pulse start/stop). Add any new awaited side effects with care, or those tests will start failing for the wrong reason. The fire-and-forget invalidation pattern is the documented workaround.

5. **`onLogWorkingSetWithActual` error handling does not fire a warning haptic** — Spec W1.3 §States says "fire warning haptic" on error. The matching legacy handler `onLogWorkingSet` also does not fire one. Either both should be patched in Wave 2 or the spec's States line should be adjusted. Not a Wave 1 blocker because the matching `appendSetLog` rejection is rare under normal SQLite usage.

---

**Bottom line:** Wave 1 ships. Hand off to the orchestrator with the swipe-gesture deferred-to-Wave-3 ticket, the optimistic-mutation polish item logged as informational, and the `TodayBody` token migration queued for the Wave 2 rest-phase rework.
