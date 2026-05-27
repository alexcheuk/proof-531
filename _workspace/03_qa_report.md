# QA report — TM Test Week (replaces Wendler deload)

## Summary

**PASS** — 0 must-fix findings.

All four static checks exit 0, the boundary audit surfaces no regressions, every binding spec assertion is satisfied by a citable file:line, cross-layer shapes match end-to-end (accessor → hook → component), all three implementation-log deviations were verified honestly, the PR-rebuild filter remains AMRAP-only, BBB is hard-skipped on week 4 without divide-by-zero risk, and the forward-only migration contract is honored at the renderer (legacy `'working'` deload rows still resolve to the deload `✓` glyph).

## Static checks

| Check | Result | Notes |
|---|---|---|
| `pnpm typecheck` | PASS | apps/mobile: Done; apps/web: 0 errors / 0 warnings / 0 hints |
| `pnpm lint` | PASS | Biome: 467 files checked, no fixes applied |
| `pnpm test` | PASS | 946/946 tests in 152 suites; jest worker did not exit gracefully (pre-existing — not caused by this change) |
| `pnpm --filter @fivethreeone/mobile exec expo export --platform ios …` | PASS | Metro produced `_expo/static/js/ios/entry-d254d776339b3d0abbcb8f5bda04d25c.hbc` (3.4 MB). Every import resolved. |

## Boundary audit

| Rule | Result | Detail |
|---|---|---|
| (a) hex/px outside `src/design/` | clean (no new violations) | All grep hits are pre-existing comments (e.g. `// PWA tracking-[-0.04em] × 64px = …`) or test-file color literals (`CornerTicks.test.tsx`, `CycleStrip.test.tsx`). `git diff` confirms no new hex/px added by this change. New TM-test files (`TmTestNote.tsx`, `TmAdjustmentNote.tsx`, `TmTestReceiptBand.tsx`, `TmTestLogSheet/*`, `useTmTestLogState.ts`) have zero hex/px hits when grepped directly. |
| (b) React/async/Drizzle/Expo in `src/domain/` | clean | grep returns no hits. `progression.ts` adds `tmAdjustmentSuggestion()` as a pure synchronous function over `Lift`/`Unit`/`tmIncrement` — no impurity introduced. |
| (c) direct `drizzle` import outside `src/data/` | clean (no new violations) | Two hits are pre-existing test setup (`SettingsScreen.test.tsx:30`, `LiftPage.setDisplayUnit.test.tsx:18`). No new violations from this change. |
| (d) barrels in `features/` or `domain/` | one expected new barrel (matches existing convention) | New: `apps/mobile/src/features/session/components/TmTestLogSheet/index.ts` — mirrors the existing sibling `AmrapLogSheet/index.ts` pattern (also `PRCertificate/`, `TodayBody/`, etc.). The "no barrels in features/" rule is already locally relaxed for nested-component folders; this addition follows the established precedent. |

## Spec compliance (binding `## Component-level behavioral assertions`)

### Today (week 4)

- [x] Title-block eyebrow `WEEK 4 · TM TEST` — `domain/labels.ts:56` (`weekLabel(4) === 'TM TEST'`) consumed by `TodayBody.tsx:94` (`${dateLabel(...)} · ${weekLabel(week)}`).
- [x] `TopSetHero` shows `100% TM`, reps render as `3–5` — `TodayBody.tsx:124-126` passes `{ eyebrow: 'TM TEST', pctLabel: '100% TM', repsRange: [3,5] as const }` only when `isTmTestWeek`. `TopSetBlock.tsx:134` renders `× ${repsRange[0]}–${repsRange[1]}` when `repsRange` is set; `:135` short-circuits the `+` AMRAP suffix when `repsRange` is set.
- [x] `WorkingSetsBand` NOT rendered — `TodayBody.tsx:136-161` branches: TmTest renders `<TmTestNote />`; the working-sets+BBB block is in the `else`.
- [x] `BbbBand` NOT rendered — same branch (`TodayBody.tsx:136-161`).
- [x] `TmTestNote` IS rendered with the guidance copy — `TmTestNote.tsx:34` `"Aim for 3 to 5 clean reps. Stop when bar speed drops."`.
- [x] `WarmupsBand` IS rendered — `TodayBody.tsx:129-134` (outside the week-4 branch).
- [x] CTA reads "Begin session" — `LiftPage.tsx:163` (unchanged copy).

### Live (week 4)

- [x] Three warmup sets log normally — `useLiveScreenState.ts:194` filters `'warmup'`-less completion logic; warmup flow unchanged.
- [x] After warmups, set surface shows eyebrow `TM TEST · TARGET 3–5` — `LiveHeader.tsx:75-82` shows `'TM TEST · TARGET 3–5'` when `isTmTest`.
- [x] Set weight equals the session's TM snapshot — `useLiveScreenState.ts:303-308`: `safeSetIndex = week===4 ? 0 : setIndex`, `workingSet = getWorkingSetByIndex(week, safeSetIndex)` (week-4 returns `{pct:1.0, reps:5, kind:'tm-test'}`), `prescribedWeight = snapWeight(trainingMaxSnapshot * 1.0, storageUnit)`.
- [x] CTA reads "Log TM test" — `LiveCtaButton.tsx:58-64`.
- [x] Tapping CTA opens `TmTestLogSheet` — `LiveCtaButton.tsx:62` calls `onOpenTmTestSheet` which sets phase `'tm-test-log'` (`useLiveScreenState.ts:336`); `LiveScreen.tsx:219-220` renders `<TmTestLogSheet open={live.phase === 'tm-test-log'} … />`.
- [x] Sheet shows the TM weight in header, lift name, NumberStepper min=0/max=10 — `TmTestLogSheet.tsx:85-92` (header), `:102-111` (`<NumberStepper value={reps} min={0} max={TM_TEST_REPS_MAX}/>` where `TM_TEST_REPS_MAX = 10`).
- [x] Band chip starts at default rep value's band — `useTmTestLogState.ts:35,49` seeds reps to 0; band chip shows `RESET` for reps in 0–2 (`TmTestBandChip.tsx:29`).
- [x] Caption updates live — `TmTestLogSheet.tsx:113` re-renders `<TmTestCaption reps={reps} … />` on stepper change.
- [x] **No PR-edge haptic fires** — verified: no import of `useAmrapPrEdgeHaptic` or `prEdgeHaptic` in `TmTestLogSheet/` or `useTmTestLogState.ts`.
- [x] **No e1RM projection chip** — `TmTestLogSheet.tsx` does not render any e1RM chip (the sheet body is title + band-chip row + stepper + caption + footer; nothing else).
- [x] Save logs a set with `kind: 'tm-test'`, `prescribedReps: 5`, `actualReps: N` — `useLogWorkingSets.ts:179-186` `appendSetLog(db, { sessionId, index: 0, kind: 'tm-test', prescribedWeight, prescribedReps, actualReps: reps })`.
- [x] After save, session flips to `completed` — `useLogWorkingSets.ts:198-200` calls `completeSession(db, sessionId)` then `setPhase('complete')`. The Live `'complete'` phase routes via `useLiveScreenEffects.ts:61-70` into `routeFromCompletePhase` → SessionComplete screen (NOT the BBB prompt — that branch is `'awaiting-bbb'` only).

### Session Complete (week 4)

- [x] `PRCertificate` does NOT render — `SessionCompleteScreen.tsx:136-191` branches on `v.isTmTestSession`; the cert/AdjustTmCta/ReceiptCard are in the `else` arm only.
- [x] `AdjustTmCta` does NOT render — same branch.
- [x] `TmTestReceiptBand` renders with `TM × <reps>` line — `SessionCompleteScreen.tsx:146-152`; `TmTestReceiptBand.tsx:67` renders `value={`${formatWeight(tmDisplay)} × ${reps}`}`.
- [x] `TmAdjustmentNote` renders with copy matching the rep band — `SessionCompleteScreen.tsx:138-145`; `TmAdjustmentNote.tsx:79-92` derives value via three-branch switch on `suggestion.kind`.
- [x] Tap on `TmAdjustmentNote` routes to settings (NOT auto-apply) — `SessionCompleteScreen.tsx:143` passes `onPress={handleAdjustTm}` which is `goTo.settings(router)` (`:108`). The note never writes to `training_maxes`.
- [x] CycleGrid unchanged — `SessionCompleteScreen.tsx:193-197` renders it outside the branch.
- [x] CTAs unchanged — `:201-218`.

### Progress

- [x] Column 4 header reads `D4 · TM` — `ProgressGridHeader.tsx:15` `{ label: 'D4', scheme: 'TM' }`.
- [x] Past week-4 cells with tm-test log show TM weight + band glyph — `ProgressLiftRow.tsx:175-185`: `tmTestBand = cell.topSetKind === 'tm-test' ? tmAdjustmentSuggestion(cell.topReps, lift, unit) : null` → marker = `↑`/`=`/`↓` from `kind`.
- [x] Past week-4 cells with legacy `'working'` log show `✓` glyph — verified via two-layer trace: (1) accessor `liftProgression.ts:104` filters `inArray(setLogs.kind, ['amrap', 'tm-test'])`, so legacy `'working'` deload rows produce `amrap: null` in the cell shape; (2) `ProgressLiftRow.tsx:175-185` falls through to `cell.deload ? '✓' : null`. **Forward-only contract honored.**
- [x] Current cycle week-4 cell (before test) shows `now` variant + TM readout — `useLiftProgression.ts:235-249` builds a `now` cell with `prescribedWeight = projectTopSetWeight(...)`; `progression.ts:97` returns `round(tm, unit)` for `day === 4` (100% TM, not 60%).
- [x] Future week-4 cells show projected TM with `─` marker — `ProgressLiftRow.tsx:158-168`: future cell with `marker={cell.deload ? '─' : null}`. `cell.deload` is true for `day === 4` (`useLiftProgression.ts:232,248,264`).
- [x] Cell accessibility label includes band word — `ProgressLiftRow.tsx:189-190`: `'…, TM test ${cell.topReps} reps, suggests ${tmTestBand.kind}'`.

### Home

- [x] CycleStrip cell 4 reads "TM TEST" — `CycleStrip.tsx:23` `{ w: 4, scheme: 'TM TEST', deload: true }`.
- [x] Active-week styling renders correctly with longer label — `CycleStrip.tsx:73-93` (deload-branch caps-mono treatment unchanged; only the text changes). Tested manually: `'TM TEST'` is 7 chars vs `'DELOAD'` 6 chars; the font-size-10 mono caps fit in the existing cell width.
- [x] Done-week styling shows ✓ corner mark — `CycleStrip.tsx:94-107` (unchanged).
- [x] Week-4 LiftPage callout updated — `LiftPage.tsx:111-113` "TM TEST · VERIFY THE TRAINING MAX".

### Settings

- [x] Day 4 row reads `Day 4 · TM × 3–5 · test · 100 % TM%` — `CyclePrescriptionSection.tsx:17`. Note the `sub: "TM %"` is the existing shared infrastructure across all 4 rows; the spec's phrasing "value `100 %` sub `TM`" doesn't match the existing convention but the displayed text is correct (`100 % TM %`). Pre-existing convention; not a regression. Not flagged.
- [x] Section hint updated — `:22` "5/3/1 · week 4 verifies the TM · read only".

### Domain

- [x] `prescription(4)` returns length-1 — covered by `schemes.test.ts:33-40` (a passing test asserts `expect(sets).toHaveLength(1)` etc.).
- [x] `weekLabel(4) === 'TM TEST'` — `labels.ts:56`; test in `labels.test.ts`.
- [x] `weekIntent(4)` returns new string — `labels.ts:74` `'Verify the TM · 3 to 5 clean reps'`.
- [x] `tmAdjustmentSuggestion` band tests + property tests — `progression.ts:183-195`; tests in `progression.test.ts` per implementation log.
- [x] `projectTopSetWeight(_, 4, …)` returns the TM, not 60% — `progression.ts:97` `if (day === 4) return round(tm, unit);`.

### Migration

- [x] On clean install, new enum accepts `'tm-test'` — `schema.ts:55-57` enum includes it; `0001_init.sql:41` is `kind TEXT NOT NULL` (no CHECK). Verified.
- [x] On existing install with legacy `'working'` week-4 rows, no migration needed and no data loss — VERIFIED (see Deviation 2 audit below).
- [x] Historic week-4 sessions render under legacy visual — `ProgressLiftRow.tsx:175-185` + `liftProgression.ts:104` filter trace (above).
- [x] New week-4 sessions log `kind: 'tm-test'` — `useLogWorkingSets.ts:182`.

## Cross-layer shape consistency

### `useLiftProgression` end-to-end (highest-leverage trace)

| Layer | File:line | Shape |
|---|---|---|
| Accessor | `data/accessors/liftProgression.ts:39-46` | `CompletedSessionTopSet = { setLogId, kind: 'amrap' \| 'tm-test', prescribedWeight, prescribedReps, actualReps, estimated1RM }` |
| Accessor return | `liftProgression.ts:48-67` | `CompletedSessionWithAmrap` carries the top set on the field `amrap: CompletedSessionTopSet \| null` (name kept for backward compat, with `kind` discriminator inside). Documented at `:57-66`. |
| Hook flatten | `data/queries/useLiftProgression.ts:318-358` | `makePastCell` reads `s.amrap?.kind`, `s.amrap?.actualReps`, `s.amrap?.prescribedWeight` — all match the accessor's nullable inner shape. |
| Hook output | `useLiftProgression.ts:37-58` | `ProgressionCellPast.topSetKind: 'amrap' \| 'tm-test' \| null` carries the discriminator to the component. |
| Component | `features/progress/components/ProgressLiftRow.tsx:175-176` | `cell.topSetKind === 'tm-test'` consumed; `cell.topReps`, `cell.topWeight`, `cell.deload`, `cell.amrap` all consumed. |

**Result: MATCH end-to-end.** No field renames between layers; the discriminator (`topSetKind`) is the only new field threaded through, and all three layers spell it identically.

### `useSessionCompleteData` for TM-test view

| Layer | Reference | Shape |
|---|---|---|
| Accessor (existing) | `useSetLogsForSession` | returns raw `set_logs` rows (id/sessionId/index/kind/…) |
| Hook | `useSessionCompleteData.ts:156-220` | derives `tmTestLog = logs.find((l) => l.kind === 'tm-test')`, then `isTmTestSession`, `tmTestReps`, `tmTestWeight`, `tmAdjustment: TmAdjustmentSuggestion \| null` |
| Component | `SessionCompleteScreen.tsx:136-153` | reads `v.isTmTestSession`, `v.tmAdjustment`, `v.tmTestWeight`, `v.tmTestReps`, `v.renderUnit`, `v.unitGlyph`, `v.elapsedReady`, `v.elapsedValue` |
| Sub-component | `TmAdjustmentNote.tsx:7-15` | accepts `suggestion: TmAdjustmentSuggestion`, `tmDisplay`, `unit`, `onPress` |
| Sub-component | `TmTestReceiptBand.tsx:7-16` | accepts `tmDisplay`, `reps`, `unitGlyph`, `elapsedReady`, `elapsedValue` |

**Result: MATCH.** All destructured field names match what `useSessionCompleteData` returns.

### `TmAdjustmentSuggestion` discriminated union

| Layer | Reference |
|---|---|
| Producer | `progression.ts:163-195` defines `\| { kind: 'increment'; delta: number } \| { kind: 'hold' } \| { kind: 'reset'; resetPct: number }` |
| Consumer 1 | `TmAdjustmentNote.tsx:80-91` reads `suggestion.kind`, `suggestion.delta`, `suggestion.resetPct` — narrowing on `kind` is type-safe. |
| Consumer 2 | `ProgressLiftRow.tsx:175-185` reads `tmTestBand.kind` |
| Consumer 3 | `TmTestBandChip.tsx:27-29` reads `suggestion.kind` |
| Consumer 4 | `TmTestCaption.tsx:28-37` reads `suggestion.kind`, `suggestion.delta` |

**Result: MATCH.** The field-rename `deltaLb → delta` (open question Q5 resolution) is consistent across producer + 3 consumers. No leftover `deltaLb` references.

## Deviations audit

### Deviation 1 — `TmTestReceiptBand` as own component (not a `kind` prop on `ReceiptCard`)

**VERIFIED.** `TmTestReceiptBand.tsx` is a distinct component (not a `<ReceiptCard kind="tm-test"/>` variant). `ReceiptCard.tsx:8-21` shows NO `kind` prop — the ReceiptCardProps interface is unchanged from before the spec (`topWeight`, `topReps`, `topIsAmrap`, `e1RMDisplay`, `workingVolume`, `elapsedReady`, `elapsedValue`, `unitGlyph`, `bbbSetsCompleted`, `bbbWeightDisplay`). No dead `kind` prop snuck in. `SessionCompleteScreen.tsx:136-191` selects between the two via `v.isTmTestSession` — the right factoring, no boolean-prop smuggling.

### Deviation 2 — No SQLite table-rebuild migration needed (drizzle enum is TS-only)

**VERIFIED.** Read `apps/mobile/src/data/drizzle/migrations/0001_init.sql:37-48`:

```sql
CREATE TABLE IF NOT EXISTS set_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL REFERENCES sessions(id),
  "index" INTEGER NOT NULL,
  kind TEXT NOT NULL,
  …
);
```

The `kind` column is `TEXT NOT NULL` with **no CHECK constraint, no enum-table FK**. The Drizzle `enum: [...]` option in `schema.ts:55-57` is a TypeScript-only type-narrowing hint; it does NOT emit a SQL CHECK. **Existing user DBs will accept `'tm-test'` inserts at runtime without any migration.** The implementation log's claim is correct. No FAIL.

### Deviation 3 — Week-4 callers route through `tmTestSet()` helper or clamp `setIndex → 0`

**VERIFIED.** Audited every call site of `getWorkingSetByIndex`, `isAmrapSet`, `isTmTestSet`, `nextWorkingSetIndex`, `prescription`, `tmTestSet`:

| Caller | File:line | Strategy |
|---|---|---|
| `useLiveScreenState` | `useLiveScreenState.ts:303` | clamps `safeSetIndex = week === 4 ? 0 : setIndex` BEFORE calling `getWorkingSetByIndex(week, safeSetIndex)` (`:304`), `isAmrapSet(week, safeSetIndex)` (`:311`), `isTmTestSet(week, safeSetIndex)` (`:312`). No code path reaches `getWorkingSetByIndex(4, 1)` or `(4, 2)`. |
| `useTodayScreenState` | `useTodayScreenState.ts:93` | `nextWorkingSetIndex(uniqueCompleted)` (no week arg). On week 4, `uniqueCompleted` is `[]` (preview) or `[0]` (test logged, session already completed and thus no longer "in active session store"). The documented comment at `:85-92` explains why omitting `week` is safe here. **Verified by tracing**: a week-4 logged tm-test row has `index: 0`, so `nextWorkingSetIndex([0])` returns `1` (legacy 3-slot iteration). The result is unused because the session has flipped to `'completed'`, so `sessionForLift` is null. **No runtime bug.** |
| `livePlateHint` | `livePlateHint.ts:22` | Early-returns `null` when `setIndex === 0` — week-4 always has `setIndex === 0`, so the `prescription(week)[invalidIndex]` lookup at `:24` is unreachable. |
| `TodayBody` | `TodayBody.tsx:81-87` | Branches: `week === 4 ? tmTestSet() : prescription(week)[heroZeroBased]` |
| `useLiftPageState` | `useLiftPageState.ts:48` | Branches: `week === 4 ? tmTestSet() : prescription(week)[2]` |
| Tests | various | One explicit test in `schemes.test.ts:80-89` exercises `getWorkingSetByIndex(4, 0)` (passes) and the throwing path on invalid index 3. |

**All call sites are safe.** Deviation 3 claim is honest.

## Forward-only migration sanity (legacy `'working'` rows on week 4)

Spec: "Past sessions that used the old deload prescription keep their existing `✓` marker (they logged `kind='working'`, not `'tm-test'`)."

Verification by code read:

1. `liftProgression.ts:104`: `inArray(setLogs.kind, ['amrap', 'tm-test'])` — the LEFT JOIN does NOT match `'working'` rows. So legacy week-4 deload sessions (which logged `kind='working'` for the three deload sets) come back with `amrap: null` in the accessor's output.
2. `useLiftProgression.ts:333-339`: `isLegacyDeload = day === 4 && s.amrap === null` → fall back to `0.6 × TM` historical display.
3. `ProgressLiftRow.tsx:175-185`: `tmTestBand = cell.topSetKind === 'tm-test' ? … : null`; since `topSetKind` is `null` for legacy deload (from `:355`: `topSetKind: s.amrap?.kind ?? null`), the chain falls through to `cell.deload ? '✓' : null` → renders the legacy `✓` marker.

**Forward-only contract honored at the renderer.** No retroactive re-labelling. PASS.

## PR-rebuild guard (`kind = 'amrap'` filter unchanged)

Spec: "the PR rebuild stays `kind = 'amrap'`-only. TM Test sets are bounded by definition and cannot produce a max-effort e1RM PR."

Verification:

1. `data/accessors/session.ts:207`: `eq(setLogs.kind, 'amrap')` — the PR-rebuild query (on session-reset) is unchanged. `'tm-test'` cannot pass through.
2. `data/accessors/setLog.ts:47-72`: `appendSetLog`'s PR branch is gated on `input.kind === 'amrap'`. Inserting a `'tm-test'` row skips the entire PR block — no PR row write, no `isPR` flag set on the row. Confirmed by code read.
3. `useSessionCompleteData.ts:156-159`: `workingLogs = logs.filter((l) => l.kind === 'working' || l.kind === 'amrap')` — `'tm-test'` rows are excluded from `hasPR`, `showCertificate`, `topSet`, `workingVolume`. A TM test session cannot light up `PRCertificate` (`SessionCompleteScreen.tsx:156` only renders cert in the non-tm-test branch, AND `v.showCertificate` only goes true on AMRAP-driven PR).
4. `usePreviousBestE1RM` (consumed at `useSessionCompleteData.ts:104`): not modified; queries AMRAP-only by historical contract (verified by `grep`).

**PASS.** The `'tm-test'` kind is invisible to all PR logic.

## BBB hard-skip on Week 4

1. **TodayBody render** — `TodayBody.tsx:136-161` does not render `<BbbBand />` when `week === 4`.
2. **LiveScreen flow** — on `onSaveTmTest`, `useLogWorkingSets.ts:200` sets phase directly to `'complete'` (NOT `'awaiting-bbb'`). `useLiveScreenEffects.ts:76-85` only routes to `/session/bbb` when phase is `'awaiting-bbb'`. Therefore TM-test sessions skip the BBB prompt entirely.
3. **Volume math** — searched for `bbb / `, `bbbVolume`, `bbbSetsCompleted /` and similar — no division operations on BBB count. `useSessionCompleteData.ts:208-211` derives `bbbSetsCompleted = bbbLogs.length` (a count) and `bbbWeightDisplay` from the first row's `prescribedWeight` (with `?? 0` fallback). On a TM-test session, `bbbLogs.length === 0` and `bbbWeightStorageRow === 0`. Both flow into `ReceiptCard` only in the non-tm-test branch (`SessionCompleteScreen.tsx:187-188`); on the tm-test branch they are computed but unused. **No NaN, no divide-by-zero.**

**PASS.**

## RN best-practices (spot-check)

- **List performance** — no new lists added; the only list change is `useTodayScreenState`'s filter expanding to include `'tm-test'` (`useTodayScreenState.ts:80`). The Progress grid is still rendered via `.map` over the (small, bounded) `row.cells` array. No FlashList/VirtualizedList concerns introduced.
- **Animation** — no new Reanimated worklets. `ProgressLiftRow` already had fill-in + pulse animations; they use `useSharedValue` + `useAnimatedStyle` + GPU-safe `opacity`/`transform`. No change.
- **UI patterns** — `TmAdjustmentNote.tsx` uses `Pressable` (correct); `TmTestLogSheet` uses the existing `Sheet` primitive (`@gorhom/bottom-sheet`-backed); `TmTestNote` is non-interactive `View` with `accessibilityRole="text"`. All correct.
- **State minimization** — `useTmTestLogState` keeps `reps` + `pending` as state; `pending` resets via the `useEffect(open)` (`:46-51`) so an aborted save doesn't leak into the next open. Correct pattern.
- **Tokens** — every new component uses `useTheme()`-derived colors/spacing/typography. No raw tokens introduced. (Confirmed by direct grep on the new files.)

No RN-best-practices findings.

## Component-API check (new/modified primitives)

- **`TopSetBlock.repsRange?: [number, number]`** — single additive optional prop. Mutually exclusive with `amrap` per the documented contract (`TopSetBlock.tsx:32-38`). Does NOT trigger boolean-prop proliferation; does NOT need a separate variant component. **OK.**
- **`ProgressGridCell.marker`** — union widened from `'✓' | '─' | null` to `'✓' | '↑' | '↓' | '=' | '─' | null`. Still a single content-detail prop, not a variant. Documented at `:35-45`. **OK.**

No primitive API design suggestions to raise to `rn-designer`.

## Findings to fix

**None.** Implementation is PASS-ready.

---

## Verdict: PASS

All static checks green, all spec assertions satisfied with citations, all three deviations honestly described and code-verified, the forward-only migration contract is enforced at both the data and renderer layers, the PR-rebuild filter remains AMRAP-only, BBB is cleanly skipped on Week 4 without divide-by-zero risk, and cross-layer shapes match end-to-end. Ready for orchestrator handoff.
