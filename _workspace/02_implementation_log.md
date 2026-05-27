# TM Test Week — Implementation Log

Tracks the work to convert `_workspace/01_design_spec.md` into working, verified code.

## File plan

Bottom-up implementation order. Domain → data → primitives → features → routes.

### Domain (pure, TDD red → green)

- `apps/mobile/src/domain/types.ts` — extend `SetLogKind` to include `'tm-test'`.
- `apps/mobile/src/domain/schemes.ts` — extend `SetKind`; replace `WEEK_SETS[4]` with single tm-test set; add `tmTestSet()` helper; harden `getWorkingSetByIndex` / `isAmrapSet` so they tolerate `(4, 0)` returning the tm-test set without throwing for `(4, 1)` / `(4, 2)` they still throw.
- `apps/mobile/src/domain/labels.ts` — `weekLabel(4)` → `'TM TEST'`; `weekIntent(4)` → `'Verify the TM · 3 to 5 clean reps'`.
- `apps/mobile/src/domain/progression.ts` — `projectTopSetWeight` day-4 returns full TM (snapped); add `tmAdjustmentSuggestion(reps, lift, unit)`; export `TmAdjustmentKind` / `TmAdjustmentSuggestion`.
- `apps/mobile/src/domain/__tests__/schemes.test.ts` — update week-4 expectations (length-1 tm-test); add tmTestSet tests.
- `apps/mobile/src/domain/__tests__/labels.test.ts` — update tm-test label + intent.
- `apps/mobile/src/domain/__tests__/progression.test.ts` — update day-4 projection; add `tmAdjustmentSuggestion` unit + property tests.

### Data

- `apps/mobile/src/data/drizzle/schema.ts` — widen `kind` enum to include `'tm-test'`.
- `apps/mobile/src/data/accessors/liftProgression.ts` — also surface the TM test set log alongside AMRAP, so the Progress grid can render a tm-test cell. (LEFT JOIN currently filters `kind='amrap'`; widen to amrap OR tm-test, expose `topSet` shape.)
- `apps/mobile/src/data/queries/useLiftProgression.ts` — extend `ProgressionCellPast` to carry `kind: 'amrap' | 'tm-test' | 'working'` (or simpler: `tmTestReps`); pass through to ProgressLiftRow so it can pick the right marker.

Migrations: no schema CHECK constraints are emitted (the SQL is plain `TEXT NOT NULL`), so the enum widening is purely a TypeScript narrowing and no SQL migration is needed. Drizzle's enum option is a TS-only hint here. Verified by reading `migrations/0001_init.sql`.

### Design primitives

- `apps/mobile/src/design/primitives/TopSetBlock.tsx` — add optional `repsRange?: [number, number]` prop, renders `lo–hi` instead of single `reps`.
- `apps/mobile/src/design/primitives/ProgressGridCell.tsx` — widen `marker` union to `'✓' | '↑' | '↓' | '=' | '─' | null`.

### Features — session

- `apps/mobile/src/features/session/components/TodayBody/TopSetHero.tsx` — accept optional `eyebrow`, `pctLabel`, `repsRange` overrides so week-4 can show TM TEST eyebrow / `3–5` reps / `100% TM` pct.
- `apps/mobile/src/features/session/components/TodayBody/TmTestNote.tsx` — new card component (label + body line).
- `apps/mobile/src/features/session/components/TodayBody/TodayBody.tsx` — branch on week=4: render TmTest hero override; no WorkingSetsBand; no BbbBand; render TmTestNote.
- `apps/mobile/src/features/session/components/TmTestLogSheet/` — new folder with index/sheet/footer/caption components. Sibling of AmrapLogSheet.
- `apps/mobile/src/features/session/components/LiveCtaButton.tsx` — add `kind: 'tm-test'` branch → "Log TM test" CTA → opens TmTest sheet.
- `apps/mobile/src/features/session/components/SetPhase.tsx` — accept `kind` discriminator for tm-test eyebrow (TM TEST · TARGET 3–5).
- `apps/mobile/src/features/session/components/LiveHeader.tsx` — accept optional `kind: 'tm-test'`; show TM TEST eyebrow + coaching line.
- `apps/mobile/src/features/session/LiveScreen.tsx` — wire tm-test sheet alongside AMRAP sheet, branch on session.week === 4.
- `apps/mobile/src/features/session/hooks/useLiveScreenState.ts` — add `tm-test-log` phase; tm-test branch reuses single index 0; add `onOpenTmTestSheet`, `onSaveTmTest`, `onCancelTmTestSheet`. Bootstrap recognizes tm-test in addition to amrap.
- `apps/mobile/src/features/session/hooks/useLogWorkingSets.ts` — add `onSaveTmTest(reps)`; logs kind tm-test and completes the session (terminal).
- `apps/mobile/src/features/session/components/TmAdjustmentNote.tsx` — new replacement for AdjustTmCta on week-4 sessions.
- `apps/mobile/src/features/session/components/TmTestReceiptBand.tsx` — one-line "TM test · TM <X> × <reps>" + elapsed.
- `apps/mobile/src/features/session/hooks/useSessionCompleteData.ts` — surface `isTmTestWeek`, `tmTestReps`, `tmTestWeight`, `tmAdjustment`; hide PR cert + AdjustTmCta + ReceiptCard on tm-test; render TmTestReceiptBand + TmAdjustmentNote.
- `apps/mobile/src/features/session/SessionCompleteScreen.tsx` — wire the above.

### Features — home

- `apps/mobile/src/features/home/components/CycleStrip.tsx` — change cell 4 scheme to `'TM TEST'`.

### Features — progress

- `apps/mobile/src/features/progress/components/ProgressGridHeader.tsx` — D4 sub label `'TM'`.
- `apps/mobile/src/features/progress/components/ProgressLiftRow.tsx` — week-4 past cell: derive marker from tm-test reps using `tmAdjustmentSuggestion` → `↑ | = | ↓`; legacy working still shows `✓`.

### Features — settings

- `apps/mobile/src/features/settings/sections/CyclePrescriptionSection.tsx` — Day 4 row to `pct: '100'`, `reps: 'TM × 3–5 · test'`; hint text update.

### Tests

- `apps/mobile/src/domain/__tests__/schemes.test.ts` — week-4 length-1 tm-test, tmTestSet helper, getWorkingSetByIndex(4, 0).
- `apps/mobile/src/domain/__tests__/labels.test.ts` — `weekLabel(4)`, `weekIntent(4)` updates.
- `apps/mobile/src/domain/__tests__/progression.test.ts` — `projectTopSetWeight` day-4 returns TM; add `tmAdjustmentSuggestion` band tests + property tests.

## Implementation notes

### Migrations

The runtime SQL schema (`migrations/0001_init.sql`) declares `kind TEXT NOT NULL` with no CHECK constraint — the drizzle `enum` option is a TypeScript-only narrowing hint. Therefore widening the enum to include `'tm-test'` is a pure TypeScript change; no migration entry needed. Forward-only contract honored automatically: existing `'working'` rows untouched.

### Week-4 narrowing strategy

`prescription(4)` now returns a length-1 array. Per spec Q5/§domain, we route week-4 code paths through a dedicated `tmTestSet()` helper rather than generalizing the index API. `getWorkingSetByIndex(4, 0)` returns the tm-test set; calling it with index 1 or 2 throws (those slots simply do not exist on week 4). The Live state machine bootstraps to `setIndex=0` on week-4 sessions and never advances past it.

### TM Test set kind

Stored as `kind: 'tm-test'` with `prescribedWeight = TM snapshot`, `prescribedReps = 5`, `actualReps = N`. PR rebuild filter (`kind === 'amrap'` in appendSetLog) remains untouched — tm-test sets never produce PRs.

### Composition discipline

- All new feature components live under `features/session/components/`.
- No new tokens. No barrels in features/domain.
- Only one primitive widening: `TopSetBlock.repsRange` (additive), `ProgressGridCell.marker` (union widen). Both adjust an existing prop; no new variant components.

## Files touched

### Domain
- `apps/mobile/src/domain/types.ts` — extend `SetLogKind` with `'tm-test'`.
- `apps/mobile/src/domain/schemes.ts` — extend `SetKind`; replace `WEEK_SETS[4]` with single tm-test set; add `tmTestSet()` and `isTmTestSet()`; widen `nextWorkingSetIndex` with optional `week` arg; harden `isAmrapSet` to short-circuit on week 4.
- `apps/mobile/src/domain/progression.ts` — `projectTopSetWeight` day-4 returns full TM (snapped); add `TmAdjustmentKind`, `TmAdjustmentSuggestion`, `tmAdjustmentSuggestion()`.
- `apps/mobile/src/domain/labels.ts` — `weekLabel(4)` → `'TM TEST'`; `weekIntent(4)` → `'Verify the TM · 3 to 5 clean reps'`.
- `apps/mobile/src/domain/__tests__/schemes.test.ts` — updated week-4 expectations + `tmTestSet` + `getWorkingSetByIndex(4, ·)` cases.
- `apps/mobile/src/domain/__tests__/labels.test.ts` — updated week-4 label/intent.
- `apps/mobile/src/domain/__tests__/progression.test.ts` — updated `projectTopSetWeight` day-4 case; added `tmAdjustmentSuggestion` unit + property tests (band closure, monotone boundaries, delta == tmIncrement, resetPct constant 0.9, defensive negative).

### Data
- `apps/mobile/src/data/drizzle/schema.ts` — widened `kind` enum to include `'tm-test'`.
- `apps/mobile/src/data/accessors/liftProgression.ts` — surface a `topSet` (kind `'amrap' | 'tm-test'`) on completed sessions; LEFT JOIN now filters `kind IN ('amrap', 'tm-test')`.
- `apps/mobile/src/data/accessors/__tests__/liftProgression.test.ts` — added a week-4 tm-test session case.
- `apps/mobile/src/data/queries/useLiftProgression.ts` — `ProgressionCellPast` carries `topSetKind`; past-cell derivation branches between tm-test/legacy-deload/AMRAP/working.

### Design primitives
- `apps/mobile/src/design/primitives/TopSetBlock.tsx` — optional `repsRange?: [number, number]` prop; rendered as `× lo–hi` when set.
- `apps/mobile/src/design/primitives/ProgressGridCell.tsx` — widened `marker` union to `'✓' | '↑' | '↓' | '=' | '─' | null`.

### Features — session
- `apps/mobile/src/features/session/components/TodayBody/TopSetHero.tsx` — added optional `eyebrow`, `pctLabel`, `repsRange` overrides.
- `apps/mobile/src/features/session/components/TodayBody/TmTestNote.tsx` — NEW; guidance card.
- `apps/mobile/src/features/session/components/TodayBody/TodayBody.tsx` — branch on `week === 4`: TM-test hero overrides, hide WorkingSetsBand + BbbBand, render TmTestNote.
- `apps/mobile/src/features/session/components/TmTestLogSheet/TmTestLogSheet.tsx` — NEW; sibling sheet to AmrapLogSheet.
- `apps/mobile/src/features/session/components/TmTestLogSheet/TmTestBandChip.tsx` — NEW; PASS/HOLD/RESET MonoBadge wrapper.
- `apps/mobile/src/features/session/components/TmTestLogSheet/TmTestCaption.tsx` — NEW; live suggestion caption.
- `apps/mobile/src/features/session/components/TmTestLogSheet/TmTestFooter.tsx` — NEW; Cancel/Save pair (mirrors AmrapFooter).
- `apps/mobile/src/features/session/components/TmTestLogSheet/index.ts` — NEW; folder index (matches AmrapLogSheet pattern).
- `apps/mobile/src/features/session/hooks/useTmTestLogState.ts` — NEW; rep/pending state with seed `0` (vs AMRAP's prescribedReps).
- `apps/mobile/src/features/session/hooks/useLogWorkingSets.ts` — added `onSaveTmTest(reps)` writing `kind: 'tm-test'`, completing the session, transitioning to `'complete'`.
- `apps/mobile/src/features/session/hooks/useLiveScreenState.ts` — added `'tm-test-log'` LivePhase; surface `isTmTest`, `onOpenTmTestSheet`, `onSaveTmTest`, `onCancelTmTestSheet`; `computeNextSetIndex` accepts week and counts tm-test rows; safe `setIndex` clamp on week 4.
- `apps/mobile/src/features/session/components/LiveCtaButton.tsx` — added `isTmTest` + `onOpenTmTestSheet` props; "Log TM test" CTA branch.
- `apps/mobile/src/features/session/components/__tests__/LiveCtaButton.test.tsx` — updated for new props; added tm-test CTA cases.
- `apps/mobile/src/features/session/components/SetPhase.tsx` — accepts optional `isTmTest`; eyebrow + repsRange flip on tm-test.
- `apps/mobile/src/features/session/components/LiveHeader.tsx` — accepts optional `isTmTest`; replaces SET-N-OF-3 eyebrow with TM TEST · TARGET 3–5; swaps AMRAP chip for TM TEST badge with guidance copy.
- `apps/mobile/src/features/session/LiveScreen.tsx` — wired tm-test set surface + sheet alongside AMRAP; show set surface during `'tm-test-log'`.
- `apps/mobile/src/features/session/hooks/useTodayScreenState.ts` — filters now include `'tm-test'` set logs.
- `apps/mobile/src/features/session/components/TmTestReceiptBand.tsx` — NEW; trimmed week-4 receipt.
- `apps/mobile/src/features/session/components/TmAdjustmentNote.tsx` — NEW; replaces AdjustTmCta on week-4 sessions (three variants).
- `apps/mobile/src/features/session/hooks/useSessionCompleteData.ts` — surfaces `isTmTestSession`, `tmTestReps`, `tmTestWeight`, `tmAdjustment`.
- `apps/mobile/src/features/session/SessionCompleteScreen.tsx` — branches on `isTmTestSession`: TmAdjustmentNote + TmTestReceiptBand replace PRCertificate + AdjustTmCta + standard ReceiptCard.

### Features — home
- `apps/mobile/src/features/home/HomeScreen.tsx` — completion filter now includes `'tm-test'`.
- `apps/mobile/src/features/home/components/CycleStrip.tsx` — cell 4 scheme → `'TM TEST'`.
- `apps/mobile/src/features/home/components/LiftPage/LiftPage.tsx` — week-4 callout copy updated to `'TM TEST · VERIFY THE TRAINING MAX'`.
- `apps/mobile/src/features/home/hooks/useLiftPageState.ts` — week-4 picks the tm-test set via `tmTestSet()` (instead of `prescription(week)[2]`).
- `apps/mobile/src/features/home/hooks/__tests__/useLiftPageState.test.ts` — added week-4 case.
- `apps/mobile/src/features/home/components/__tests__/CycleStrip.test.tsx` — updated for the new week-4 label.

### Features — progress
- `apps/mobile/src/features/progress/components/ProgressGridHeader.tsx` — D4 sub label → `'TM'`.
- `apps/mobile/src/features/progress/components/ProgressLiftRow.tsx` — accept `lift` + `unit`; tm-test past cell derives `↑ | = | ↓` marker from `tmAdjustmentSuggestion`; updated a11y label.
- `apps/mobile/src/features/progress/components/ProgressLiftPage.tsx` — pass `lift` and `unit` to `ProgressLiftRow`.

### Features — settings
- `apps/mobile/src/features/settings/sections/CyclePrescriptionSection.tsx` — Day 4 row → `'TM × 3–5 · test'` at 100% TM; updated section hint.

## Verification

All four checks exit 0.

### `pnpm typecheck`

```
> 531@0.0.0 typecheck /home/user/proof-531
> pnpm -r --parallel typecheck

Scope: 2 of 3 workspace projects
apps/web typecheck$ astro check
apps/mobile typecheck$ tsc --noEmit
apps/web typecheck: 02:33:20 [content] Synced content
apps/web typecheck: 02:33:20 [check] Getting diagnostics for Astro files in /home/user/proof-531/apps/web...
apps/mobile typecheck: Done
apps/web typecheck: Result (28 files):
apps/web typecheck: - 0 errors
apps/web typecheck: - 0 warnings
apps/web typecheck: - 0 hints
apps/web typecheck: Done
```

Exit code: 0

### `pnpm lint`

```
> 531@0.0.0 lint /home/user/proof-531
> biome check .

Checked 467 files in 351ms. No fixes applied.
```

Exit code: 0

### `pnpm test`

```
apps/mobile test: Test Suites: 152 passed, 152 total
apps/mobile test: Tests:       946 passed, 946 total
apps/mobile test: Snapshots:   0 total
apps/mobile test: Time:        9.311 s
apps/mobile test: Ran all test suites.
apps/mobile test: Done
```

Exit code: 0

### Metro bundle spot-check

```
pnpm --filter @fivethreeone/mobile exec expo export --platform ios \
  --output-dir /tmp/expo-bundle-check --dump-sourcemap=false --dump-assetmap=false
```

```
› ios bundles (2):
_expo/static/js/ios/entry-d254d776339b3d0abbcb8f5bda04d25c.hbc (3.4MB)
_expo/static/js/ios/entry-d254d776339b3d0abbcb8f5bda04d25c.hbc.map (11MB)

› Files (2):
assetmap.json (18KB)
metadata.json (2.3KB)

Exported: /tmp/expo-bundle-check
```

Exit code: 0 — Metro resolved every import.

## Spec deviations

None. The implementation matches the locked spec. One minor structural choice worth flagging:

- The spec floats a `kind: 'standard' | 'tm-test'` prop on `ReceiptCard`. I implemented the week-4 receipt as a separate `TmTestReceiptBand` component instead so neither receipt has to know about the other's row set. This is consistent with the spec's "no boolean-prop proliferation on primitives when the variants share little" guidance and keeps each component's responsibility coherent. `SessionCompleteScreen` selects between them on `isTmTestSession`.
- No SQLite table-rebuild migration was required. The current `migrations/0001_init.sql` declares `kind TEXT NOT NULL` with no CHECK constraint — the drizzle `enum` option is a TypeScript-only narrowing hint. Existing `'working'` rows on legacy week-4 deload sessions are untouched and continue to render under the legacy receipt + the legacy deload `✓` marker on the Progress grid (forward-only contract honored). The spec anticipated this might be necessary; the actual schema does not require it.
- `getWorkingSetByIndex(4, 1|2)` continues to throw (spec called this out as acceptable). The Live state machine clamps `setIndex` to 0 on week 4 so the throw is never hit in practice. `nextWorkingSetIndex` gained an optional `week` arg to advertise the week-4 single-slot contract; the legacy 3-slot behavior is preserved when `week` is omitted.

