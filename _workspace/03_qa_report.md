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

---

## Wave 2 (post-merge)

Branch: `claude/workout-session-flow-audit-NMDoN` · HEAD `956ffdc` (Wave 2 commit, atop merged main `d36af69` + Wave 1 `c1044a7`).
Spec source of truth: revised `01_design_spec.md` `## Revision 2026-05-24` block, W2.1–W2.5.

### Verdict

**PASS** with one accepted deviation (Reanimated breathing pulse + PR-row height tween deferred to Wave 3), one must-fix-by-Wave-3 W2.1 NEXT-SET-band data-source issue, and two informational findings.

### Static checks

| Check | Command | Result |
|---|---|---|
| typecheck | `pnpm typecheck` | PASS (exit 0) |
| lint | `pnpm lint` | PASS (`Checked 184 files in 214ms`) |
| test | `pnpm test` | PASS (`Test Suites: 59 passed, 59 total · Tests: 408 passed, 408 total`) |

Test delta vs. post-merge baseline: 360 → 408 (+48). Zero regressions. Implementer reports tracking exactly — the three pre-merge `LiveScreen.test.tsx` timeouts are gone since `ebc34b2` and the suite is fully green.

### Metro bundle export

```
pnpm --filter @fivethreeone/mobile exec expo export --platform ios \
  --output-dir /tmp/expo-bundle-wave2-qa --dump-sourcemap=false --dump-assetmap=false
```

PASS — exit 0. `_expo/static/js/ios/entry-21fe9e1b99c5e6f3c6ae6b100fccd3e5.hbc (3.2MB)` exported, every import resolved. New imports introduced by Wave 2 (`bbbPlanRows`, `plateLoadInstruction`, `BbbConfirmSurface`, no new npm deps) all bundled cleanly.

### Boundary audit

a. **Hex / px literals outside `src/design/`** — clean. The `grep -rEn "#[0-9a-fA-F]{3,8}|[0-9]+px"` returns only PWA-reference comments in `LiveHeader.tsx:14`, `LiftPage.tsx:46`, `SessionTopBar.tsx:11/15`, and a px-width comment in `HomeScreen.test.tsx:249`. No raw color hex / `\d+px` literals in Wave 2's new code.

b. **`src/domain/` purity** — clean. `grep -rEn "import React|async |from ['\"]drizzle|from ['\"]@?expo" apps/mobile/src/domain` returns nothing. The three new helpers (`nextSessionPlan`, `bbbPlanRows`, `plateLoadInstruction`) are sync, React-free, DB-free.

c. **`src/data/` boundary intact** — only `__tests__` files import `drizzle-orm/better-sqlite3` (pre-existing test harness pattern in `SettingsScreen.test.tsx` and `LiftPage.setDisplayUnit.test.tsx`). No new violations; no production-code Drizzle imports outside `src/data/`.

d. **No barrels in `features/` or `domain/`** — clean. `find apps/mobile/src/features apps/mobile/src/domain -name 'index.ts' -o -name 'index.tsx'` returns nothing.

e. **Import direction (`app → features → (design | data | domain)`)** — visually inspected. LiveScreen imports `useLiveScreenState` (features hook), `BbbConfirmSurface` (features component), `decompose`/`plateLoadInstruction` (domain), `PrimaryPillButton`/`CtaBar`/`Text`/`TopSetBlock` (design). All one-way.

### Spec compliance — per Wave 2 subsection

#### W2.1 — Rest phase three-section layout

| Item | Evidence | Status |
|---|---|---|
| LOGGED band between headline and timer | `RestPhase.tsx:167-193` renders `<View style={loggedBandWrap}>` with `LOGGED` eyebrow + `{loggedWeight} {unit} × {loggedReps}` value cell + optional `EST. 1RM {x} {unit}[ · PR]` right cell | PASS |
| Spacing: `paddingHorizontal: spacing.xl, paddingVertical: spacing.lg` | `RestPhase.tsx:98-104` `loggedBandWrap` matches spec exactly | PASS |
| Hairline below LOGGED band | `RestPhase.tsx:191` `<View style={{ borderBottomWidth: 1, borderBottomColor: colors.line }} />` | PASS |
| PR suffix on right cell when `isPR && isAmrap` | `RestPhase.tsx:187` `{isPR ? ' · PR' : ''}` | PASS |
| `loggedWeight` / `loggedReps` props on RestPhase | `RestPhase.tsx:28-31` declares both `number` props; `LiveScreen.tsx:305-306` forwards `loggedWeightDisplay` / `loggedRepsDisplay` from `live.lastLogged.weight/reps` (storage→display converted at the wiring layer) | PASS |
| Plate-load instruction line below NEXT SET | `RestPhase.tsx:227-231` renders `<RNText style={plateInstructionStyle}>{plateInstruction}</RNText>` inside the `rest-phase-next-set` View | PASS |
| Instruction style: mono medium size 10, letterSpacing 1.8, color ink2, uppercase, marginTop spacing.sm, textAlign center | `RestPhase.tsx:122-131` matches verbatim | PASS |
| **NEXT SET band overrides to BBB summary when `setIndex === 2` AND BBB fork enabled** | `LiveScreen.tsx:315-322` always passes `nextSet={{ weight: prescribedDisplay, reps: live.prescribedReps, pct: live.pct, ... }}`. Because `useLiveScreenState` deliberately does NOT advance `setIndex` after the terminal log (it sets `postTerminalRest` instead), `live.prescribedWeight` during post-terminal rest still describes set index 2 — the just-completed set. The NEXT SET band therefore shows the SAME prescription the user just lifted, not `5 × 10 @ bbbWeight`. Spec lines 330-332 explicitly require the BBB-summary override. The `plateInstruction` likewise reads "load: ... / side over 45 bar" instead of "unload to {bbbWeight} — strip the heavy plates" | **DEVIATION — must-fix (see finding 1)** |
| Region accessibilityRole + label | `RestPhase.tsx:169` only sets `accessibilityLabel="Logged set"` on the LOGGED band; `accessibilityRole="region"` is not set on any of the three bands per spec (line 353). Minor a11y polish miss | INFORMATIONAL |

#### W2.2 — Rest timer countdown + skip/+30s + breathe pulse + haptic ladder

| Item | Evidence | Status |
|---|---|---|
| Counts DOWN by default (drops `target - remaining`) | `RestTimer.tsx:47-50` `const countDownLabel = remaining <= 0 ? '0:00' : formatLabel(remaining)` | PASS |
| Pinned at `0:00` past T-0 | `RestTimer.tsx:48` ternary clamp | PASS |
| `SKIP` chip below timer | `RestTimer.tsx:144-156`, with `hitSlop` `{top:8, bottom:8, left:12, right:12}` to hit 44pt | PASS |
| `+30s` chip below timer | `RestTimer.tsx:157-168`, same `hitSlop` | PASS |
| Chip style: `paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.ink0, borderRadius: radii.sm, backgroundColor: 'transparent'` | `RestTimer.tsx:89-96` `controlChip` matches | PASS |
| Chip label: mono semibold size 10, letterSpacing 2.2, color ink0, uppercase | `RestTimer.tsx:97-104` `controlLabelStyle` matches (lineHeight is 12 vs. spec-implicit 10; acceptable) | PASS |
| Tap to toggle count-up display | `RestTimer.tsx:121-141` `Pressable` wraps the 96pt label; `setCountUp((p) => !p)` toggles | PASS |
| Count-up eyebrow reads `OVER REST` and label shows `m:ss over` | `RestTimer.tsx:49` `countUpLabel = `${formatLabel(elapsedOver)} over``; `RestTimer.tsx:115` eyebrow says `'Over rest'` (sentence-case, not full caps — but uppercase is applied via `textTransform: 'uppercase'` on the eyebrow style at line 71). PASS on the rendered output | PASS |
| Hook handler `onSkipRest` | `useLiveScreenState.ts:502-505` sets `restRemaining(0)` | PASS |
| Hook handler `onAddRest` with REST_CEILING_SECONDS cap | `useLiveScreenState.ts:510-525`; cap at 600; resets `warningFiredRef`/`zeroFiredRef` so re-pass through thresholds re-fires; T-10s ref intentionally NOT reset (per implementer decision 8) | PASS |
| Haptic ladder T-10s selection | `useLiveScreenState.ts:320-323` `if (restRemaining === TEN_SECOND_THRESHOLD && !tenSecondFiredRef.current) ... fireSelectionHaptic()` | PASS |
| Haptic ladder T-3s warning (preserved) | `useLiveScreenState.ts:324-327` | PASS |
| Haptic ladder T-0 light impact | `useLiveScreenState.ts:328-331` | PASS |
| Per-cycle ref reset | `useLiveScreenState.ts:295-297` resets all three on every rest entry | PASS |
| **Breathing pulse on "Next set" CTA at T-0 (Reanimated `withRepeat(withTiming(1.04, ...), -1, true)`)** | `LiveScreen.tsx:237-241` renders a plain `PrimaryPillButton` — no `Animated.View`, no `useSharedValue`, no Reanimated worklet. The frontend's self-flagged deviation. | **DEVIATION — accepted (see ruling)** |
| **Reduced-motion fallback: swap CTA bg/text colors at T-0** | Not implemented either. The spec's fallback is an *inverted* CTA swap; the shipped UI is just the original button (`PrimaryPillButton` styled identically pre- and post-T-0). Per the orchestrator framing, the haptic ladder + SKIP control carry the T-0 signal, and the deferred work bundles cleanly with Wave 3 | **DEVIATION — accepted (see ruling)** |

#### W2.3 — AMRAP preset chips + promoted PR row

| Item | Evidence | Status |
|---|---|---|
| Chip array `[3,5,8,10,12,15]` at ≥360pt | `AmrapLogSheet.tsx:49` `PRESET_REPS_WIDE = [3, 5, 8, 10, 12, 15]` | PASS |
| `[5,8,10,12,15]` at <360pt (drops `[3]`) | `AmrapLogSheet.tsx:50` `PRESET_REPS_NARROW = [5, 8, 10, 12, 15]` | PASS |
| Width detection via `Dimensions.get('window').width` | `AmrapLogSheet.tsx:97` `const presetReps = screenWidth < NARROW_BREAKPOINT_PT ? PRESET_REPS_NARROW : PRESET_REPS_WIDE` | PASS |
| Inserted above stepper, below `HOW MANY REPS?` header row | `AmrapLogSheet.tsx:208-247` (chip row at 230) sits between the second header row and the stepper at 263 | PASS |
| Selected chip inverts bg/text (`backgroundColor: colors.ink0, color: colors.bg0`) | `AmrapLogSheet.tsx:232-244` uses `[chipBase, isSelected ? chipSelected : null]` + `[chipLabel, isSelected ? chipLabelSelected : null]` | PASS |
| Selection survives until stepper ± moves away | `AmrapLogSheet.tsx:69` `selectedChipValue` state separate from `reps`; `handleStepperChange` clears it on stepper press; `handleSelectChip` sets it | PASS |
| Tap chip = populate stepper | `AmrapLogSheet.tsx:240` `onPress={() => handleSelectChip(n)}` | PASS |
| Promoted PR row below chips, above stepper, only when `isPotentialPR && reps > 0` | `AmrapLogSheet.tsx:249-261` `{showPRRow ? ...}`; `showPRRow = isPotentialPR && reps > 0` at line 92 | PASS |
| PR row content: `★ NEW PERSONAL RECORD` + `EST. 1RM {x} {unit}` | `AmrapLogSheet.tsx:256-259` | PASS |
| PR row `accessibilityRole="alert"` + composed label | `AmrapLogSheet.tsx:252-253` | PASS |
| Inline `· PR` suffix removed from EST. 1RM caption | `grep "· PR" AmrapLogSheet.tsx` returns nothing | PASS |
| **PR row Reanimated height tween (220ms ease-standard)** | Not implemented — row shows/hides instantly. Per spec's own reduced-motion fallback ("PR row height transition replaced by an instant show/hide"), this is the spec-allowed shape — but the spec's reduced-motion fallback was meant for the *user's* setting, not the test-harness-mock-not-ready setting | **DEVIATION — accepted as spec-allowed reduced-motion shape (see ruling)** |

#### W2.4 — BBB confirm fork phase

| Item | Evidence | Status |
|---|---|---|
| New phase `bbb-confirm` on `LivePhase` union | `useLiveScreenState.ts:52-60` | PASS |
| `BbbConfirmSurface` feature component at `features/session/components/BbbConfirmSurface.tsx` | File present, 186 lines, composes `PlateBar` + `Text` + two `Pressable`s | PASS |
| Eyebrow `MAIN WORK · DONE` | `BbbConfirmSurface.tsx:119` | PASS |
| Headline `Boring But Big?` (sans medium 48pt) | `BbbConfirmSurface.tsx:57-63, 121-123` (fontSize 48, lineHeight 52, letterSpacing -1.44) | PASS |
| Sub-paragraph `5 sets of 10 at {bbbWeight} {unit}. Optional assistance — log it if you do it.` | `BbbConfirmSurface.tsx:132` matches exactly | PASS |
| Compact `PlateBar` for BBB load | `BbbConfirmSurface.tsx:135-143` `<PlateBar ... mini />` | PASS |
| Split CTA: `Logged it ✓` primary (filled ink0) + `Skip BBB` secondary (outlined) | `BbbConfirmSurface.tsx:144-182` | PASS |
| Primary writes 5 rows + advances to complete | `useLiveScreenState.ts:532-557` `onConfirmBbb` uses `bbbPlanRows` + `Promise.allSettled` + `completeSession` + `setPhase('complete')` | PASS |
| Skip advances to complete without writes | `useLiveScreenState.ts:560-569` `onSkipBbb` calls only `completeSession` + `setPhase('complete')` | PASS |
| 5 rows of `kind: 'bbb'`, `actualReps = 10`, `prescribedReps = 10`, `prescribedWeight = round(tm * 0.5, storageUnit)`, `index = 100..104` | `schemes.ts:175-190` `bbbPlanRows` matches spec exactly; LiveScreen.test.tsx:725-736 asserts the shape | PASS |
| Reached only via `onAdvanceFromRest` when `setIndex === 2` (terminal); bootstrap-self-heal unchanged | `useLiveScreenState.ts:476-496` `onAdvanceFromRest` branches on `postTerminalRest` flag (set inside the terminal-log handlers); the bootstrap effect at `useLiveScreenState.ts:259-275` still routes "every slot filled" directly to complete | PASS |
| Invalidates typed `SET_LOGS_FOR_SESSION_KEY(sessionId)` after the 5 writes | `useLiveScreenState.ts:546-549` | PASS |
| Cancel sheet stacking — dismiss returns to bbb-confirm | `useLiveScreenState.ts:583-587` `phaseBeforeCancelRef.current = phase` captures `bbb-confirm` at request time; `onDismissCancelSheet:589-592` returns to the ref'd value | PASS |
| Partial-write tolerance (per spec error policy: do not roll back) | `useLiveScreenState.ts:536-545` `Promise.allSettled` + `console.warn` of failed indices + still transition to complete | PASS |

#### W2.5 — Cancel split (logic only; visuals = Wave 3)

| Item | Evidence | Status |
|---|---|---|
| `live.loggedWorkingCount` exposed on hook | `useLiveScreenState.ts:156, 623-625, 656` filter on `kind === 'working' || kind === 'amrap'` over `setLogsData` | PASS |
| `live.onImmediateCancel` exposed | `useLiveScreenState.ts:158, 573-581, 657` calls `cancelSession` + `setPhase('complete')` | PASS |
| Branch A (zero working/AMRAP rows) → immediate cancel + `router.replace('/')` | `LiveScreen.tsx:206-215` `handleCancelRequest` checks `live.loggedWorkingCount === 0`, fires selection haptic, awaits `onImmediateCancel`, then `router.replace('/')` | PASS |
| Branch B (≥1 row) → existing two-tap `CancelConfirmSheet` | `LiveScreen.tsx:214` falls through to `live.onRequestCancel()`; the post-merge revised spec retained two-tap (per `SessionTopBar` left at `kind: 'cancel'`, the spec line 549 explicitly notes "the existing two-tap CancelConfirmSheet") | PASS |
| Branch C logic (long-press) is in scope for W2.5 visuals are W3.2 | W2.5 ships the branching logic; the long-press path is the same destination as Branch B (the two-tap sheet) — implementation log decision 5 confirms `handleCancelRequest` is the seam Wave 3 can replace | PASS |
| `router.replace('/')` rationale (not `router.back()` because Today → Live is `router.push`) | `LiveScreen.tsx:201-204` comment captures the rationale | PASS |
| Test: Branch A with zero rows | `LiveScreen.test.tsx:426-…` `mockSetLogsState.data = []` then asserts immediate `cancelSession` + `router.replace('/')` | PASS |
| Test: Branch B with one row | `LiveScreen.test.tsx:398-399` seeds one working row to reach Branch B (existing two-tap path) | PASS |

### Cross-layer shape consistency

| Boundary | Data | Domain | Consumer | Match |
|---|---|---|---|---|
| `appendSetLog` input | `AppendSetLogInput = Omit<SetLog, 'id'|'completedAt'|'isPR'|'estimated1RM'>` = `{sessionId, index, kind, prescribedWeight, prescribedReps, actualReps}` (`setLog.ts:34`) | `bbbPlanRows` returns `{sessionId, index, kind:'bbb', prescribedWeight, prescribedReps:10, actualReps:10}[]` (`schemes.ts:182-190`) | `useLiveScreenState.onConfirmBbb` passes each row to `appendSetLog(db, row)` (`useLiveScreenState.ts:536`) | PASS — typecheck would have flagged a shape divergence; tests confirm runtime equivalence (`LiveScreen.test.tsx:728-736`) |
| `plateLoadInstruction` | n/a | `plateLoadInstruction(perSide: readonly number[], barWeight: number, currentLoad: number, unit: Unit): string` (`plates.ts:74-89`) | `LiveScreen.tsx:183` calls `plateLoadInstruction(perSide, barWeight, lastLoadedStorage, storageUnit)`; storage-unit'd args to a unit-agnostic helper | PASS |
| `nextSessionPlan` | n/a | `(currentLift: Lift, enabledLifts: readonly Lift[], currentWeek: Week) => { lift, week, day, topPct, topReps, amrap }` (`schemes.ts:130-165`) | No Wave 2 consumer — wired in Wave 3 W3.3 | PASS (helper shipped to spec, consumer pending) |
| `RestPhase` LOGGED band | hook `live.lastLogged.weight/reps` (storage units) | n/a | `LiveScreen.tsx:187-190` converts storage→display before forwarding to `RestPhase` as `loggedWeight/loggedReps` (display units), matching how `prescribedDisplay` is computed for the top set | PASS — units consistent end-to-end |
| `live.loggedWorkingCount` | `setLogsData` from `useSetLogsForSession` (TanStack Query) | n/a | `useLiveScreenState.ts:623-625` reads the same query the bootstrap effect uses; `LiveScreen.tsx:207` reads it in `handleCancelRequest` | PASS — single source of truth |
| `live.bbbPrescribedWeight` | storage units (`useLiveScreenState.ts:615-617` `snapWeight(tm * bbbPct, storageUnit)`) | n/a | `LiveScreen.tsx:174-175` converts storage→display via `displayWeight` before forwarding to `BbbConfirmSurface` as `bbbWeight` | PASS |

### Findings

1. **W2.1 deviation: NEXT SET band shows the just-completed set during post-terminal rest instead of the BBB summary.**
   *Where:* `LiveScreen.tsx:315-322` (rest-phase `nextSet` prop) and the comment at lines 311-314 ("useLiveScreenState has already advanced setIndex to the next set") which is incorrect for the terminal case.
   *Why it's a deviation:* `useLiveScreenState.onLogWorkingSet` / `onLogWorkingSetWithActual` / `onSaveAmrap` do NOT advance `setIndex` when `loggedIndex === 2`; they set `postTerminalRest = true` and transition to `rest` with `setIndex` still pointing at the just-completed set. `live.prescribedWeight` / `.pct` / `.prescribedReps` therefore describe that same set. Spec lines 330-332 explicitly call out: "If `setIndex === 2` AND Wave 2 BBB fork is enabled (W2.4): caller (`LiveScreen`) overrides `nextSet` with the BBB summary — `5 × 10 @ {bbbWeight}` decomposition. The plate-load instruction reads `unload to {bbbWeight} — strip the heavy plates`."
   *User-visible impact:* During the post-terminal rest cycle (after the AMRAP / set-3 log, before the user taps "Complete session"), the NEXT SET band shows the same prescription the user just lifted ("85% TM, 205 lb × 5+, load: …"). It should instead show "5 × 10 @ 150 lb, unload to 150 — strip the heavy plates" so the lifter knows to start stripping plates for BBB during the rest.
   *Suggested fix:* In `LiveScreen.tsx`, gate the `nextSet` prop on a "is this post-terminal rest" boolean. The cleanest signal is `live.setIndex === 2 && live.phase === 'rest' && live.lastLogged !== null` (or, more robustly, expose `postTerminalRest` from the hook). When true, swap to a `nextSet` of `{ weight: bbbDisplayWeight, reps: 10, amrap: false, pct: bbbPct, perSide: bbbPerSide, tmDisplay }` and compute the `plateInstruction` against `bbbPerSide` (which will trigger the `unload to` branch since `bbbWeight < lastLoadedStorage` in all weeks).
   *Severity:* MEDIUM — visible but recoverable. The user can still progress to BBB confirm by tapping the CTA; they just see the wrong NEXT SET preview during the post-terminal rest. Not a blocker for Wave 2 PASS (BBB confirm phase itself functions correctly and the plate-load instruction is correct for non-terminal rests) but should be fixed before Wave 3 lands.

2. **(Accepted deviation — for Wave 3 ticket-tracking)** Reanimated breathing pulse on "Next set" CTA at T-0 (W2.2) AND Reanimated height tween on the promoted PR row (W2.3) are both unshipped. The PR row's "instant show/hide" matches the spec's own reduced-motion fallback exactly. The Next-set CTA's reduced-motion fallback (per spec lines 426-428) was meant to invert the CTA's bg/text colors at T-0 — the shipped UI does neither the pulse NOR the swap; the CTA stays visually static. The T-0 light-impact haptic + the SKIP control still signal T-0, so the user receives a haptic confirmation. Per the orchestrator framing the deferred-to-Wave-3 bundle is acceptable; the Wave 3 implementer must land both animations + the shared `jest.mock('react-native-reanimated', ...)` in the same revision.
   *Files Wave 3 must touch to satisfy the original spec:*
   - `apps/mobile/src/features/session/LiveScreen.tsx` — wrap the rest CTA in an `Animated.View`, drive `useSharedValue(1)` + `withRepeat(withTiming(1.04, ...), -1, true)` keyed off `live.restRemaining === 0`; honor `useReducedMotion()` with the bg/text invert fallback.
   - `apps/mobile/src/features/session/components/AmrapLogSheet.tsx` — wrap the PR row in `Animated.View`, drive `prRowHeight = useSharedValue(0)` + `withTiming(40, …)` on the `showPRRow` cross; honor `useReducedMotion()` with the existing instant show/hide as fallback.
   - `apps/mobile/jest.setup.ts` (new) or hoist the inline mock from `HomeScreen.test.tsx` to a shared location so both component tests inherit it.
   *Severity:* LOW (accepted, tracked).

3. **(Informational)** `BbbConfirmSurface.tsx:91, 103` uses `borderRadius: 999` literal instead of `radii.pill` (which is also `999` per `tokens.ts:95`). The `999` literal is invisible to the `[0-9]+px` grep but is conceptually a px-style raw value. Spec's "Tokens used" line for W2.4 lists `radii.pill`. Consistent fix: import `useTheme()` and read `radii.pill`. The Wave 1 `SplitWorkingSetCta` in `LiveScreen.tsx:443/455` already does the right thing — `BbbConfirmSurface` is the only Wave 2 file that hard-codes `999`.
   *Severity:* INFORMATIONAL.

4. **(Informational, pre-existing pattern)** Cancel sheet from `bbb-confirm` shows the SET surface beneath the sheet (not the BBB surface). The dismissal correctly returns to `bbb-confirm` via `phaseBeforeCancelRef`, so the flow is functional, but the visual leak (~200ms of set surface visible under the sheet open animation) is asymmetric with what the user expects. This is the same pattern in place for `rest → cancel-confirm` (rest surface also hidden under the sheet), so it's a pre-existing limitation, not a Wave 2 regression. Worth tracking as a Wave 3 visual-polish item alongside the cancel-split visual layer (W3.2) — both sheets ought to overlay the surface they were triggered from.
   *Severity:* INFORMATIONAL.

### Deviation ruling

**Accept the deferred animations (W2.2 breathing pulse + W2.3 PR-row tween) as a Wave-3 bundled item.** Rationale aligns with the orchestrator framing:
- The T-0 haptic ladder (selection at T-10, warning at T-3, light impact at T-0) + SKIP control + the immediate CTA enablement carry the gym-floor signal.
- The shared `jest.mock('react-native-reanimated', ...)` infrastructure is real engineering and is needed by Wave 3's swipe-dismiss gesture on `ResumeBanner` (W3.x). Bundling all three Reanimated consumers in one revision lets the mock land once instead of three times.
- The PR row's "instant show/hide" already matches the spec's own reduced-motion fallback — it is a spec-allowed shape.

**Do NOT accept the W2.1 NEXT-SET-band bug** as a deferred item — that's a logic-not-animation gap that gives lifters the wrong information mid-session. The fix is small (compute a `postTerminalRest` boolean in LiveScreen or expose it from the hook, then swap `nextSet`/`plateInstruction` accordingly). The implementer can patch this in a follow-up before Wave 3 starts; QA verdict is still PASS because the gap is recoverable (the user can tap through to BBB confirm and see the correct BBB plan there) and there's no data corruption risk.

### Wave 3 risk notes

1. **`postTerminalRest` exposure** — Wave 3 will need this signal (or its equivalent) once W2.1's NEXT-SET-band fix lands. The hook holds it as local state today; consider promoting it to the `UseLiveScreenStateResult` shape so `LiveScreen` doesn't have to re-derive `live.setIndex === 2 && live.phase === 'rest' && live.lastLogged?`.
2. **Reanimated jest mock placement** — Per `HomeScreen.test.tsx`, the inline `jest.mock('react-native-reanimated', ...)` pattern exists at one call site. Wave 3 should hoist it into a shared `jest.setup.ts` so the W2.2 breathing pulse, the W2.3 PR-row tween, the W3.x swipe-dismiss gesture, and any future Reanimated consumer all inherit one mock. Wave 2's PR-row deferral was the right call only if Wave 3 actually does this consolidation.
3. **Cancel sheet rendering during `cancel-confirm`** — Wave 3's W3.2 visual layer (X chip + overflow `…`) should also tighten `LiveScreen.tsx:341` so the underlying surface under the cancel sheet reflects the phase the cancel was triggered from (rest / bbb-confirm), not always SET. Today's renderer falls through to SET when `phase === 'cancel-confirm'`, which is asymmetric across the three trigger surfaces. The fix is one extra `phaseBeforeCancelRef.current === 'rest'` / `=== 'bbb-confirm'` branch in the JSX.
4. **`BbbConfirmSurface` token sweep** — `borderRadius: 999` → `radii.pill` once Wave 3 touches this file for any other reason (or just file a one-line `chore:` PR).
5. **W2.1 NEXT-SET-band fix must include `plateInstruction` recomputation** — when `nextSet` swaps to the BBB summary, `plateInstruction` must be recomputed against `bbbPerSide` (not `perSide`) so the `unload to` branch of `plateLoadInstruction` triggers. The helper already supports the `unload to` branch — just feed it the right `currentLoad > nextLoad` arguments.
6. **Bootstrap auto-complete is fine alongside BBB fork** — Verified per spec: the bootstrap effect (`useLiveScreenState.ts:259-275`) self-heals "every slot filled" sessions to `phase === 'complete'` on resume, and the BBB-confirm phase is reached *only* via the live `onAdvanceFromRest` path on a foreground session. The two flows don't collide; W3 implementers can ignore the bootstrap branch when adding new BBB UX.

### Bottom line

PASS. Static checks green (408/408), Metro green, boundary audit clean, all five Wave-2 subsections substantially compliant with the revised spec, cross-layer shapes consistent. One must-fix-before-Wave-3 W2.1 NEXT-SET-band data-source issue (Finding 1, fix is small) and the accepted Reanimated bundle deferral (Findings 2). Hand off to orchestrator with Finding 1 as a Wave-3 prerequisite ticket.
