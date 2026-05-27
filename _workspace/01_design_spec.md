# Design spec: TM Test Week — replace Wendler deload with 7th Week Protocol

## Intent

Replace the mechanically-redundant Week 4 deload with a single TM Test set at 100% of the current training max, target 3–5 reps. The week stops being a ghost week and starts doing real work: it *verifies* the TM the lifter has been working off for three weeks. The number achieved either confirms the TM (3–4 reps → hold), greenlights the standard +5/+10 increment (≥5 reps), or surfaces a calm suggestion to reset −10% (0–2 reps). The lifter decides; the app suggests. No automation, no celebration motion, no streak-chasing — the number is the celebration.

This is the **opinionated replacement** per `docs/INTENT.md`. No "deload vs. test" toggle. The app is for a serious 5/3/1 lifter; we pick the version of Week 4 that respects their time.

## PWA reference

**N/A — net-new feature.** The PWA at `~/Development/531-pwa/` is not present in this environment, and the brief explicitly confirms it has been verified absent. The PWA never shipped a TM Test week; this design is entirely net-new within the existing 531-mobile token system and primitive library. No port, no behavioral source to honor — only the existing `apps/mobile/src/design/` and `apps/mobile/src/features/session/` patterns to compose against.

## Screens & flow

```
HOME (CycleStrip)                              → Week 4 cell reads "TM TEST"
   │                                             (replaces "Deload"). Tap lift tile
   │                                             → Today as usual.
   ▼
TODAY (lift, week=4)
   ┌─────────────────────────────────────────┐
   │ Masthead · c<N>·d4                       │
   │ Title block "<Lift>." · "Week 4 · VERIFY"│
   │ TopSetHero        ← 100% TM, 3–5 reps,   │
   │                     PlateBar, eyebrow    │
   │                     reads "TM TEST"      │
   │ WarmupsBand       ← unchanged (5/5/3 ×   │
   │                     40/50/60)            │
   │ (NO WorkingSetsBand on week 4)           │
   │ (NO BbbBand on week 4)                   │
   │ TmTestNote        ← calm one-liner       │
   │                     "Aim for 3 to 5      │
   │                     clean reps."         │
   │ — END OF SESSION —                       │
   └─────────────────────────────────────────┘
   │  CTA: "Begin session" → LIVE
   ▼
LIVE (sessionId, week=4)
   warmups (3 sets, existing flow)
   ─ rest ─
   set 4 (the TM test set)
      SetPhase
        eyebrow "TM TEST · TARGET 3–5"  (replaces "AMRAP")
        weight = TM (no %, since 100%)
        reps prescribed = 5 (top of band)
        PlateBar shows TM weight
   ─ tap "Log TM test" CTA ─
   TmTestLogSheet (new sibling to AmrapLogSheet)
      NumberStepper 0..maxReps (cap chosen below)
      live band readout: "≥5 increment · 3–4 hold · 0–2 reset"
      no e1RM projection chip (this is not an AMRAP)
      no PR-edge haptic (this is not a max-effort set)
      Save → appendSetLog(kind='tm-test')
   ─ no rest screen after, no further sets ─
   ▼
SESSION COMPLETE (sessionId)
   Masthead + Title (existing chrome, no celebration variant)
   No PRCertificate (TM tests do not produce e1RM PRs)
   TmTestReceiptBand (new): one-line "TM test · TM <X> × <reps_done>"
   TmAdjustmentNote (new, replaces AdjustTmCta on week-4 sessions):
      label    "Suggested TM next cycle"
      body     "+5 lb"   |   "Hold"   |   "−10% reset to <Y> lb"
      caption  "Your call — open settings to apply"
      pressable → goTo.settings(router) [training max section]
   CycleGrid (existing)
   CTA: "Close the day" → Progress

PROGRESS
   Week-4 column now reads "D4 · TM" (header) and cells show:
     • past:    weight = TM at test, reps = actualReps, glyph derived
                from band: ✓ for ≥3 (passed), ✗ for 0–2 (reset)
     • now:     "next" eyebrow + TM (100%) weight readout
     • future:  projected TM, deload marker replaced with "—" still
                (we don't project a TM test result; the column shows
                the TM the test will use)

SETTINGS → Cycle prescription
   Day 4 row replaced. New copy in the LedgerRow:
     label   "Day 4"
     sub     "TM × 3–5"
     value   "100 %"   sub "TM"
```

Back behavior: unchanged across all surfaces. Hardware back on Today returns Home; Live returns to Today (replace) per existing `useHardwareBack` wiring. Deep links: none new — `/session/today/[lift]` and `/session/live/[sessionId]` already cover week 4 sessions; the visual is the only thing that branches.

## Per-screen breakdown

### 1. Home — CycleStrip (`apps/mobile/src/features/home/components/CycleStrip.tsx`)

**Layout.** Existing 4-cell grid, no structural change. Only the data in `CELLS[3]` changes:

```ts
{ w: 4, scheme: 'TM TEST', deload: true }   // was: scheme: 'Deload'
```

The existing `deload: true` branch already renders monospace caps with letterspacing — `'TM TEST'` (7 chars including the space) fits the cell at fontSize 10. Verified against the existing `'5·5·5+'` scheme width on a 320pt-wide screen (4 cells × ~80pt minus padding). If "TM TEST" overruns on narrow devices, fall back to `'TEST'` — see Open Questions.

**Tokens used.** No new tokens. Reuses `colors.ink0/bg0/ink1/ink3/paperMuted`, `type.mono`, existing spacing/layout from `useTheme()`.

**States.** No change from current — strip is read-only.

**Interactions.** None — the cell is non-interactive in the current component. No change.

**Accessibility.** `testID="cycle-strip-cell-4"` unchanged. Update the implicit screen-reader content: when active, VoiceOver should read "Day 4, TM Test" rather than "Day 4, Deload". The `CapsLabel` content drives this automatically once `scheme` text changes.

### 2. Today — `apps/mobile/src/features/session/components/TodayBody/TodayBody.tsx`

**Layout.** The week-4 branch composes a different body shape:

```
Masthead
TitleBlock          eyebrow uses new weekLabel(4) = "WEEK 4 · TM TEST"
                    (or "VERIFY" — see Open Questions)
intent line         weekIntent(4) = "Verify the TM · 3 to 5 clean reps"
TopSetHero          set = { pct: 1.0, reps: 5, kind: 'tm-test' }
                    eyebrow override = "TM TEST"  (was "NEXT SET")
                    reps render as "3–5" range (NOT "5+")
                    pctLabel = "100% TM"
WarmupsBand         unchanged
TmTestNote          NEW: paper-card with one-line guidance
— END OF SESSION —
```

Notably **absent** on week 4:
- `WorkingSetsBand` (no 3-set scheme; the test set IS the work)
- `BbbBand` (BBB skipped on test week per brief)

**TopSetHero override.** `TopSetBlock` already accepts `eyebrow`, `reps`, and a custom `pctLabel`. Two additions needed at the primitive (see New primitives):
- A `repsRange` prop that, when set to `[3, 5]`, renders "3–5" instead of "5". Cleaner than overloading `reps` with a string.
- The `amrap` flag stays `false` — there's no "+" suffix on a TM test. The whole point is the rep cap.

**TmTestNote.** A new local presentation component (not a primitive — lives in `TodayBody/`). One `Card` with a `CapsLabel` and a body line:

```
┌─────────────────────────────────────────┐
│ TM TEST · GUIDANCE                       │
│ Aim for 3 to 5 clean reps.              │
│ Stop when bar speed drops.               │
└─────────────────────────────────────────┘
```

Padded with `spacing.lg`; uses `colors.bg1` (card surface) with `borderColor: line`. Same visual weight as the BBB band it replaces — keeps the screen rhythm intact.

**Tokens used.** All existing — `colors.bg0/bg1/ink0/ink1/ink2/line`, `type.sans/mono`, `spacing.{sm,md,lg,xl}`, `layout.gutter`. No new tokens.

**States.**
- **Loading** — same `SessionLayout` blank-paper treatment as week 1–3 (TodayScreen already handles).
- **Empty (no TM set)** — same `NoTrainingMaxState` empty screen; nothing changes.
- **Error** — TanStack Query error states stay handled at TodayScreen; week-4-specific failure modes are none.
- **Success** — the layout above renders.

**Interactions.** Single CTA "Begin session" → starts a normal session via `useTodaySessionActions`. No new gestures. Existing reset sheet still applies.

**Accessibility.**
- TopSetHero eyebrow announces as "TM Test, prescribed 3 to 5 reps at training max".
- TmTestNote is a `View` with `accessibilityRole="text"` and a combined label "TM test guidance: aim for 3 to 5 clean reps. Stop when bar speed drops."
- Hit targets unchanged (no new interactive elements on Today).
- Reduced motion: no animation on Today; no fallback needed.

### 3. Live — `apps/mobile/src/features/session/LiveScreen.tsx` + `SetPhase`, new `TmTestLogSheet`

**Layout.** Same `SessionLayout` chrome. The set phase shows the warmups (3 sets, unchanged), then the TM test set in place of the AMRAP. Differences from a week-3 AMRAP day:

- `SetPhase` eyebrow reads **"TM TEST · TARGET 3–5"** (not "AMRAP — push the +").
- The set-card weight display reads the TM (no percentage suffix; 100% is implicit).
- No plate-change-hint variation needed (the TM Test weight may match the 60% warmup weight in some cases — the hint logic already handles "no plate change", just verify with a manual test that the hint doesn't spuriously appear).

**CTA wiring** (`LiveCtaButton`):

| Phase                                       | Label             | Behavior                            |
|---------------------------------------------|-------------------|-------------------------------------|
| `set` on a working warmup                   | "Log warmup"      | unchanged                           |
| `set` on the test set (kind === 'tm-test')  | **"Log TM test"** | opens `TmTestLogSheet`              |
| `tm-test-log` phase (new)                   | (no CTA — sheet)  | sheet's own Save button             |
| post-test → `rest` skipped                  | (none)            | session completes immediately       |

Add a new `LiveScreenPhase` value: `'tm-test-log'` mirroring the existing `'amrap-log'`. The state machine in `useLiveScreenState` resolves week + setIndex into the right phase.

**`TmTestLogSheet`** — new sibling to `AmrapLogSheet`. Composes the same `Sheet` primitive. Body:

```
LOG TM TEST                              <Lift>
                                          <TM weight> <unit>

Reps achieved at TM                      [band-result chip: PASS / HOLD / RESET]

         ┌───┐  ┌───┐  ┌───┐
         │ – │  │ N │  │ + │     ← NumberStepper, min=0, max=10
         └───┘  └───┘  └───┘     (cap at 10; brief says ≥5 is the
                                  high band — no need to track 30 reps)

below the stepper, a small caption that changes with reps:
   N = 0..2:  "Suggests −10% reset · TM might be too high"
   N = 3..4:  "Suggests hold · TM is honest"
   N >= 5:    "Suggests +5 lb · TM was conservative"   (or +10 lb for lower)

[Cancel]  [Save]
```

The band-result chip on the right of the question line shows one of `PASS`, `HOLD`, `RESET` in caps mono — a `MonoBadge`. Reuses existing primitive.

**Why no e1RM chip?** The TM test is not a max-effort set, and the Epley estimate at 5-rep cap of TM produces a near-identical number to the lifter's current TM — it would just clutter. The band suggestion replaces it.

**Tokens used.** `colors.ink0/ink1/ink2/ink3/bg0/bg1/bg2/line`, `type.mono/sans`, `spacing.xl/lg/md/sm`. No new tokens.

**States.**
- **Sheet closed / open** — driven by `live.phase`.
- **Pending save** — disable both buttons; show no spinner per existing AmrapFooter convention.
- **Save error** — re-enable buttons; existing pattern.
- **Cap reached** — NumberStepper's `max=10` blocks `+` from incrementing; no banner.

**Interactions.**
- Stepper buttons are existing primitive; hit target 44pt+ guaranteed by `NumberStepper`.
- Haptics:
  - On `+`/`−` tap: existing NumberStepper `selectionAsync` haptic.
  - On Save: existing `notificationAsync('success')` from sheet flow.
  - **No PR-edge haptic.** The `useAmrapPrEdgeHaptic` hook is AMRAP-specific — do NOT call it here. The TM test crossing 5 reps is not a "PR moment" in the celebratory sense; it's information.
- Animation: existing `Sheet` open/dismiss spring; no new motion.

**Accessibility.**
- Sheet labelled "Log TM Test".
- Stepper buttons: "Decrease reps" / "Increase reps" (reuse AmrapLogSheet copy).
- Band chip is `accessibilityRole="text"` with announcement "Result band: pass" (or hold / reset).
- Caption line is read after the stepper, announcing the suggestion. Reading order: title → weight → question → stepper → caption → save/cancel.
- Reduced motion: existing sheet motion respects `prefersReducedMotion` via the bottom-sheet primitive's own handling (verify in QA).

### 4. Session Complete — `SessionCompleteScreen.tsx`

**Layout.** Week-4 sessions follow the existing chrome (Masthead, Title, CycleGrid, CTAs) but swap two sections:

| Slot                            | Week 1–3 (current)                       | Week 4 (TM test)                                  |
|---------------------------------|------------------------------------------|---------------------------------------------------|
| Hero record                     | `PRCertificate` if e1RM PR; otherwise -- | **Hidden always.** A TM test is not a PR.        |
| Adjust-TM nudge                 | `AdjustTmCta` when e1RM delta is large   | **`TmAdjustmentNote`** (new) — always shown.     |
| Receipt                         | `ReceiptCard` (top set, volume, etc.)    | **`TmTestReceiptCard`** (new lightweight variant)|
| Cycle grid                      | `CycleGrid`                               | unchanged                                         |
| CTA                             | "Close the day" → Progress               | unchanged                                         |

**`TmTestReceiptCard`.** A trimmed `ReceiptCard` variant — same primitive, fewer rows:

```
TM test · TM 225 lb       ← display TM at the test
× 5 reps                   ← actual reps
Elapsed · 14:22            ← session length, existing
(no working volume row — there are no working sets)
(no BBB row — BBB skipped)
```

Implementation: do NOT branch on week inside `ReceiptCard` — add a new `kind` prop with values `'standard' | 'tm-test'`, and render the trimmed row set when `kind === 'tm-test'`. Keeps the primitive's responsibility coherent.

**`TmAdjustmentNote`.** Replaces `AdjustTmCta` on week 4. Same visual chassis (bordered Pressable, ink/paper, no color) — different content:

```
┌─────────────────────────────────────────┐
│ SUGGESTED TM · NEXT CYCLE                │
│ +5 lb                                    │   ← bold sans, size 17
│ Your call — open settings to apply    ›  │   ← mono caption + chevron
└─────────────────────────────────────────┘
```

Three variants by suggestion kind:
- `increment` — bold value `+{delta} {unit}`.
- `hold` — bold word `Hold`.
- `reset` — bold value `−10% · reset to {newTm} {unit}` (compute `newTm = round(oldTm * 0.9, unit)` in the view layer).

Pressable opens settings → training max section (`goTo.settings(router)` — existing helper). The brief explicitly says **suggestion, never automatic** — this CTA must NOT auto-apply the change. Tapping it routes to the existing TM-edit UI where the user types or steps the new value.

**Tokens used.** Reuses the entire `AdjustTmCta` token set. No new tokens.

**States.**
- **Loading** — existing `SessionLayout` blank.
- **Test was logged with 0 reps** — band is `reset`; suggestion shows the −10% line. (Edge case: a 0-rep test is still a logged set; the user attempted and missed. Do NOT silently hide the suggestion — that's the lifter's data.)
- **Test never logged (session cancelled mid-test)** — no `TmTestReceiptCard`, no `TmAdjustmentNote`. Existing `cancelled` handling bounces to Home; nothing extra needed.

**Interactions.** Tap on `TmAdjustmentNote` → settings. No haptic on render (the brief is emphatic: no celebration).

**Accessibility.**
- `TmAdjustmentNote` is a Pressable with role `button`, label "Suggested training max change: <value>. Tap to open settings.", hint "Opens the training max section of settings."
- Reading order: masthead → title → receipt → suggestion → cycle grid → CTA.
- Reduced motion: nothing animates here; n/a.

### 5. Progress — `apps/mobile/src/features/progress/` (`ProgressGridHeader.tsx`, `ProgressLiftRow.tsx`, `ProgressGridCell.tsx`)

**Layout.** The cycle×day matrix keeps its 4-day column structure. Two changes:

1. **Header column 4 label** (`ProgressGridHeader.tsx`):
   - `{ label: 'D4', scheme: 'del' }` → `{ label: 'D4', scheme: 'TM' }`.
   - The sub label `'TM'` (was `'del'`) in mono 8pt, ink3 — fits the existing slot without geometry change.

2. **Cell glyphs** (`ProgressGridCell.tsx`): `past` and `outlined` variants currently render `marker={'✓' | '─' | null}` as a second-line content for deload cells. We need an additional glyph set for TM test outcomes:
   - `✓` — passed (≥3 reps) — kept as-is.
   - `↑` — strong pass (≥5 reps, increment suggested) — distinguishes a "go up" cell from a "hold" cell.
   - `=` — hold (3–4 reps) — flat-line glyph.
   - `↓` — reset (0–2 reps) — distinguishes a "go down" cell.
   - `─` — projected/future deload-style cell (kept for future TM-test cells with no result yet).

The cell visual otherwise stays identical — same fill, same typography, same 64-px height. The glyph replaces the `× N` rep line on week-4 cells. Weight shown is the TM at test time.

**Why four glyphs.** Honors the e-ink principle: no color band. Direction-of-change is encoded in the arrow shape (up/down/flat). At a glance the lifter sees which cycles passed strong, held steady, or fell back — without color and without a streak counter.

**Past sessions that used the old deload prescription** keep their existing `✓` marker (they logged `kind='working'`, not `'tm-test'`). The data hook (`useLiftProgression`) reshapes set logs into cells; it must:

- Detect a week-4 cell whose top set has `kind === 'tm-test'` → produce a glyph from the rep band (`tmAdjustmentSuggestion`).
- Fall through to the existing `deload: true` + `'✓'` rendering for legacy `kind === 'working'` deload sessions.

This is the forward-only contract: no retroactive re-labelling of history.

**Tokens used.** Existing — `colors.ink0/bg0/ink2/ink3`, `type.mono/sans`. The four glyph characters (`↑ ↓ = ✓ ─`) are existing Unicode and render in IBM Plex Mono.

**States.**
- **Past TM test with rep data** → variant `past` (or `outlined` for last-done) + glyph from band.
- **Current cycle, week-4 cell, before the test happens** → variant `now`, "next" eyebrow + TM readout, no glyph.
- **Future cycles** → variant `future`, projected TM weight, marker `─`.

**Interactions.** Past-cell tap opens SessionComplete in history origin (existing). For a TM test session, that screen renders the TmTest variants (per §4).

**Accessibility.** Update `ProgressLiftRow`'s accessibilityLabel for week-4 past cells:

```
Cycle <N>, day 4: TM test <weight> <unit>, <reps> reps, suggests <band>.
```

The band word ("increment" / "hold" / "reset") gives the screen-reader user the meaning of the glyph.

### 6. Settings — `CyclePrescriptionSection.tsx`

**Layout.** One row changes:

```ts
// Before
{ label: 'Day 4', pct: '40 · 50 · 60', reps: '5 / 5 / 5 · deload' },
// After
{ label: 'Day 4', pct: '100',           reps: 'TM × 3–5 · test' },
```

The `LedgerRowValue` `value` becomes `"100 %"` (vs `"40 · 50 · 60 %"`) and `sub` stays `"TM %"`. The label's secondary line reads `"TM × 3–5 · test"`.

Also update the section's `hint` prop: `"the original 5/3/1 · read only"` → `"5/3/1 · week 4 verifies the TM · read only"`. Keeps the surface honest about what changed.

**Tokens used.** None new — `LedgerRow`/`LedgerRowLabel`/`LedgerRowValue` already token-driven.

**States.** Read-only section; no interactive states.

**Interactions.** None.

**Accessibility.** The row's label/value pair is read in order by the existing primitive; no overrides needed.

## Data contract

### Drizzle schema changes

**`set_logs.kind`** — add `'tm-test'` to the enum:

```ts
// apps/mobile/src/data/drizzle/schema.ts
kind: text('kind', {
  enum: ['warmup', 'working', 'amrap', 'bbb', 'assistance', 'tm-test'],
}).notNull(),
```

SQLite's `text` column with a `CHECK` constraint generated by Drizzle's enum option needs the migration to widen the CHECK. **Approach:**

1. **In dev (`__DEV__`)**, the existing stale-schema detector drops and re-creates tables — the new enum lands automatically.
2. **In production**, SQLite does not support `ALTER TABLE ... DROP CHECK`. The migration runner needs a new entry: detect the stale CHECK (introspect `sqlite_master` for the table's create-sql, look for `'tm-test'` substring). If absent, perform a table-rebuild migration:
   - `CREATE TABLE set_logs_new (...)` with the new enum.
   - `INSERT INTO set_logs_new SELECT * FROM set_logs;`
   - `DROP TABLE set_logs;`
   - `ALTER TABLE set_logs_new RENAME TO set_logs;`
   - Re-create the FK from `prs.set_log_id` (which already references `set_logs.id` — SQLite re-binds FKs on rename when foreign_keys pragma is set; verify with a test).

This rebuild is the first production-side schema change the project has needed beyond ALTER ADD COLUMN — flag it in QA. The brief's migration discipline is "forward-only": old `'working'` rows logged for week-4 sessions stay literally `'working'` in the DB and continue to render under the legacy visual.

**`TmTestNote` table?** No. The TM-test result is fully expressible as a row in `set_logs` (kind=`'tm-test'`, prescribedReps=5, actualReps=N, prescribedWeight=TM at test time). No additional persisted state.

### Domain types (`apps/mobile/src/domain/types.ts`)

Add to `SetLogKind`:

```ts
export type SetLogKind = 'warmup' | 'working' | 'amrap' | 'bbb' | 'assistance' | 'tm-test';
```

Mirror in `schemes.ts` `SetKind` (the alias union).

### TanStack Query hooks

No new hooks. Reuses:

- `useSession(sessionId)` — returns the session row; week 4 is detectable from `session.week`.
- `useSessionLogs(sessionId)` — already exists implicitly via the receipt builder; the TM test set is just one row in the returned array, identifiable by `kind === 'tm-test'`.
- `useLiftProgression(lift)` — needs an internal reshape change: for week-4 cells, branch on the underlying set log's `kind`. **Cache key unchanged.** Invalidates on the same triggers (new set log, new session completion).
- `useSettings()` — no schema additions, no key change.
- `useLatestTm(lift)` — unchanged.

**Mutation surface:**
- `appendSetLog` (existing) — already accepts any `SetLogKind`; passing `'tm-test'` works once the enum widens.
- The TM-adjustment suggestion does NOT mutate anything. Tapping the suggestion routes to settings; the existing TM edit flow handles the write. **No optimistic UI**, because the user's act is "open settings", not "apply change".

### Optimistic mutations

`TmTestLogSheet` save uses the existing `appendSetLog` mutation. Optimistic behavior identical to AMRAP save:

1. Sheet shows pending state (Save/Cancel disabled).
2. Mutation fires; the LiveScreen flips phase to `completed` on success.
3. On rejection: re-enable buttons, leave reps value intact, surface a one-line error via existing pattern (verify the pattern with the frontend agent — `useAmrapLogState` may already encapsulate this).

No rollback needed beyond what the existing AMRAP save provides — there's no second mutation chained here.

## Domain logic

### New pure function: `tmAdjustmentSuggestion`

```ts
// apps/mobile/src/domain/progression.ts (extend the existing module — keeps
// all per-cycle TM math in one file).

export type TmAdjustmentKind = 'increment' | 'hold' | 'reset';

export type TmAdjustmentSuggestion =
  | { kind: 'increment'; deltaLb: number }   // delta in the lift's unit
  | { kind: 'hold' }
  | { kind: 'reset'; resetPct: number };     // 0.9 = reset to 90% of current TM

/**
 * Maps reps achieved on the Week-4 TM test set to a suggested adjustment
 * for the *next cycle's* training max. Bands from Wendler's Forever 5/3/1
 * 7th-week protocol:
 *
 *   reps ≥ 5  → increment (+5 upper / +10 lower in lbs; +2.5 / +5 in kg)
 *   reps 3–4  → hold (TM is honest; no change)
 *   reps 0–2  → reset (−10%, i.e. resetPct = 0.9)
 *
 * Pure; no React, no async, no DB. Signature accepts lift + unit so the
 * increment is correct without forcing the caller to know lower/upper
 * (matches the existing `tmIncrement` API).
 */
export function tmAdjustmentSuggestion(
  repsAchieved: number,
  lift: Lift,
  unit: Unit,
): TmAdjustmentSuggestion {
  if (repsAchieved >= 5) {
    return { kind: 'increment', deltaLb: tmIncrement(unit, lift) };
  }
  if (repsAchieved >= 3) {
    return { kind: 'hold' };
  }
  return { kind: 'reset', resetPct: 0.9 };
}
```

**Note on the `deltaLb` field name.** The brief proposed `deltaLb` but the field carries a value in whatever unit the lift uses (lb *or* kg). Renamed conceptually but kept the literal field name `deltaLb` for compatibility with the brief's signature — open question below on whether to rename to `delta` and document the unit semantic.

### Property tests (fast-check)

1. **Band closure.** For all `reps ∈ [0, 100]` and all (lift, unit) combos, `tmAdjustmentSuggestion` returns exactly one of `'increment'`/`'hold'`/`'reset'`. Total function, no throws.
2. **Monotone band boundaries.** `reps < 3 → 'reset'`, `reps ∈ [3,4] → 'hold'`, `reps ≥ 5 → 'increment'`. Exhaustive over `reps ∈ [0..50]`.
3. **Increment matches `tmIncrement`.** For all (lift, unit), if `kind === 'increment'` then `deltaLb === tmIncrement(unit, lift)`. This ties the new function to the existing per-cycle bump so future changes to TM increments propagate.
4. **Reset percentage is constant 0.9.** For all reps in the reset band.
5. **Negative reps are treated as reset.** Defensive: `repsAchieved < 0` → `'reset'` (mirrors the 0–2 band's intent: "you missed entirely"). Document this in the function's JSDoc.

### Other domain updates

**`schemes.ts` `WEEK_SETS[4]`** — replace the three deload sets with a single test set:

```ts
4: [
  { pct: 1.0, reps: 5, kind: 'tm-test' },   // top of the rep band
] as const,
```

Note `prescription(week)` currently returns `WorkingSet[]` (3 entries for weeks 1–3); week 4 will now return a length-1 array. This **changes the function's invariant** — all call sites that assume `sets.length === 3` need updating:

- `WorkingSetsBand.tsx` — gated by week-4 branch in TodayBody now, won't be rendered.
- `getWorkingSetByIndex` / `nextWorkingSetIndex` — narrow type from `WorkingSetIndex = 0|1|2` to support `0` only on week 4. **Decision:** introduce a `WorkingSetCount = 1 | 3` runtime expectation and a `safeGetSet(week, setIndex)` that returns `null` for out-of-range rather than throwing. Or: keep the existing index API for week 1–3 paths and route week-4 through a dedicated `tmTestSet(week)` helper. **Designer's preferred call:** the second — a separate `tmTestSet(): WorkingSet` helper used only by week-4 code paths keeps the existing API surface intact for weeks 1–3. Flag this for the frontend agent: do not generalize prematurely.

**`progression.ts` `projectTopSetWeight`** — day 4 currently returns `round(tm * 0.6, unit)`. Change to `return round(tm, unit)` (the TM test set is 100% TM). This changes what `useLiftProgression` projects for future week-4 cells; visually the cell shows the TM. Add a comment pointing at this spec.

**`labels.ts` `weekLabel(4)`** — change `'DELOAD'` → `'TM TEST'`. Update `weekIntent(4)` from `'Deload · stay sharp, recover'` to `'Verify the TM · 3 to 5 clean reps'`.

**Pure-function preservation:** all of the above stay within `src/domain/` — no React, no async, no DB. Property tests need to be updated for `projectTopSetWeight` (day 4 returns `currentTm`, not `0.6 × currentTm`).

## New primitives

Reuse first. Only one primitive needs a small extension; everything else is feature-local composition.

### Extension to `TopSetBlock`

Add an optional `repsRange?: [number, number]` prop. When set, renders the reps line as `"<lo>–<hi>"` (e.g. `"3–5"`) instead of `"<reps>"`. When unset, the existing `reps` prop drives. The `amrap` flag continues to add the `"+"` suffix to a single `reps` value (does not combine with `repsRange`). This is a single new optional prop on an existing primitive — does not trigger boolean-prop proliferation; does not need a new variant component.

### `TmTestLogSheet` (feature-local, NOT a primitive)

Lives at `apps/mobile/src/features/session/components/TmTestLogSheet/` mirroring the `AmrapLogSheet/` folder layout:

```
TmTestLogSheet/
  index.ts
  TmTestLogSheet.tsx          — sheet composition
  TmTestBandChip.tsx           — the PASS / HOLD / RESET MonoBadge wrapper
  TmTestCaption.tsx            — the dynamic band-suggestion caption
  __tests__/
```

Composes `Sheet`, `NumberStepper`, `MonoBadge`, `CapsLabel`, `Text` — all existing primitives.

**Composition discipline (per the Vercel design-system rules):**

- No boolean-prop proliferation — the sheet takes `open`, `lift`, `tm`, `unit`, `onSave`, `onCancel`. No `mode`, no `variant`, no toggle props. Two booleans at most.
- Children over render-props — caption and band chip are sub-components, not `renderCaption` props.
- State is internal to the sheet (rep count, pending) — no provider needed; no sibling cross-talk.

### `TmAdjustmentNote` (feature-local, NOT a primitive)

Lives at `apps/mobile/src/features/session/components/TmAdjustmentNote.tsx`. Borrows the `AdjustTmCta` visual chassis but renders TM-test-specific copy with the three suggestion variants. Composition of `Pressable` + `Text` + `CapsLabel` — no new primitive needed.

### `TmTestNote` (feature-local, NOT a primitive)

Lives at `apps/mobile/src/features/session/components/TodayBody/TmTestNote.tsx`. Card with a label and a body line. Composes `Card` + `CapsLabel` + `Text`.

### `ProgressGridCell` marker extension

Widen the `marker` prop's union from `'✓' | '─' | null` to `'✓' | '↑' | '↓' | '=' | '─' | null`. No new variant component — the existing `past`/`outlined`/`now`/`future` set covers the cell states; the glyph is a content detail, not a variant. The mono font already renders these characters; verify in QA that letterspacing on `=` and `↑`/`↓` matches the existing `✓`/`─` weight (spec a manual screenshot diff in the QA checklist).

### Tokens

**No new tokens.** Every surface above resolves to existing ink/paper/line tokens. The brief explicitly forbids new tokens unless justified, and the e-ink palette already accommodates this design.

## Component-level behavioral assertions for QA

The QA agent will run against this checklist. Each item is testable.

### Today (week 4)

- [ ] Week-4 title-block eyebrow reads "WEEK 4 · TM TEST" (or "VERIFY" if open question resolved that way).
- [ ] `TopSetHero` shows `100% TM` pct label, reps render as `"3–5"`, not `"5"` or `"5+"`.
- [ ] `WorkingSetsBand` is NOT rendered.
- [ ] `BbbBand` is NOT rendered.
- [ ] `TmTestNote` IS rendered with the guidance copy.
- [ ] `WarmupsBand` IS rendered (unchanged from week 1–3).
- [ ] CTA reads "Begin session" (existing copy).

### Live (week 4)

- [ ] Three warmup sets log normally (existing flow).
- [ ] After the third warmup completes, the next set surface shows eyebrow "TM TEST · TARGET 3–5".
- [ ] Set weight equals the session's TM snapshot (in display unit).
- [ ] CTA reads "Log TM test".
- [ ] Tapping CTA opens `TmTestLogSheet`.
- [ ] Sheet shows the TM weight in the header, lift name, NumberStepper with min=0, max=10.
- [ ] Band chip starts at the default rep value's band (verify default rep is 5 — top of range; or 0 to force a choice — open question).
- [ ] Caption updates live as reps change.
- [ ] **No PR-edge haptic fires** at any rep count.
- [ ] **No e1RM projection chip is rendered.**
- [ ] Save logs a set with `kind: 'tm-test'`, `prescribedReps: 5`, `actualReps: N`.
- [ ] After save, session flips to `completed` (no rest screen, no further sets).

### Session Complete (week 4)

- [ ] `PRCertificate` does NOT render even if the e1RM math happens to exceed the prior best.
- [ ] `AdjustTmCta` does NOT render.
- [ ] `TmTestReceiptCard` renders with `TM × <reps>` line.
- [ ] `TmAdjustmentNote` renders with copy matching the rep band:
  - reps ≥ 5: `+5 lb` (or +10 lower body / +2.5 / +5 kg).
  - reps 3–4: `Hold`.
  - reps 0–2: `−10% · reset to <newTm> <unit>`.
- [ ] Tapping `TmAdjustmentNote` routes to settings (NOT auto-applying any TM change).
- [ ] CycleGrid is unchanged.
- [ ] CTAs ("Close the day" / "See full record") unchanged.

### Progress

- [ ] Column 4 header reads `D4 · TM` (not `D4 · del`).
- [ ] Past week-4 cells with a `tm-test` set log show the TM weight and the band glyph (`↑` / `=` / `↓`).
- [ ] Past week-4 cells with a legacy `working` set log (pre-migration cycles) still show the deload `✓` glyph.
- [ ] Current cycle's week-4 cell (before test) shows the `now` variant with TM readout.
- [ ] Future week-4 cells show the projected TM (not 60% of TM) with the `─` marker.
- [ ] Cell accessibility label includes the band word for week-4 past cells.

### Home

- [ ] CycleStrip cell 4 reads "TM TEST" instead of "Deload".
- [ ] Active-week styling (when currentWeek === 4) renders correctly with the longer label.
- [ ] Done-week styling (when past cycle) shows the ✓ corner mark.

### Settings

- [ ] Day 4 row in `CyclePrescriptionSection` reads `Day 4 · TM × 3–5 · test · 100 % TM`.
- [ ] Section hint reflects the new prescription.

### Domain

- [ ] `prescription(4)` returns `[{ pct: 1.0, reps: 5, kind: 'tm-test' }]` (length 1).
- [ ] `weekLabel(4)` returns `'TM TEST'`.
- [ ] `weekIntent(4)` returns the new intent string.
- [ ] `tmAdjustmentSuggestion(0, 'bench', 'lbs')` → `{ kind: 'reset', resetPct: 0.9 }`.
- [ ] `tmAdjustmentSuggestion(3, 'bench', 'lbs')` → `{ kind: 'hold' }`.
- [ ] `tmAdjustmentSuggestion(5, 'bench', 'lbs')` → `{ kind: 'increment', deltaLb: 5 }`.
- [ ] `tmAdjustmentSuggestion(5, 'deadlift', 'lbs')` → `{ kind: 'increment', deltaLb: 10 }`.
- [ ] `tmAdjustmentSuggestion(5, 'bench', 'kg')` → `{ kind: 'increment', deltaLb: 2.5 }`.
- [ ] `projectTopSetWeight(futureCycle, 4, tm, ..., unit)` returns the TM (snapped), not 60% of TM.
- [ ] Existing property tests for weeks 1–3 still pass.

### Migration

- [ ] On a clean install, the new `set_logs.kind` enum accepts `'tm-test'`.
- [ ] On an existing install with logged week-4 deload sessions (`kind='working'` rows), the migration runs without data loss.
- [ ] The historic week-4 sessions render with their original visual (no retroactive re-labelling).
- [ ] A new week-4 session created post-migration logs the test set with `kind='tm-test'`.

## Out of scope

Explicit non-goals for this feature. Do NOT widen during implementation:

- **No setting to revert to the classic Wendler deload.** Per INTENT.md, opinionated replacement. If the user requests a toggle later, it's a separate spec.
- **No assistance-set prescription change.** The brief leaves accessories to the designer's call and leans "keep them optional/light". The current app has no assistance-tracking surface; we do not add one in this feature. If the user runs accessories on Week 4, they run them off-app — same as today.
- **No retroactive history rewrite.** Old `'working'` week-4 deload rows stay `'working'`. No migration touches `set_logs.kind` values.
- **No automatic TM adjustment.** The `TmAdjustmentNote` routes to settings; it does not write to `training_maxes`. A future "auto-apply suggestion" feature is a separate decision the user must make explicitly.
- **No celebration animation on a passed TM test.** No `usePrSuccessHaptic`, no fill-in scale animation, no PR certificate. The Progress cell's `↑` glyph is the entire visual signal.
- **No e1RM PR detection on `tm-test` set logs.** Even if Epley says the lifter PR'd at 100%×5, the set kind disqualifies it from PR computation. This requires a single guard in the PR-rebuild SQL (filter `kind='amrap'` already — verify this stays the case post-migration).
- **No estimated 1RM projection chip in the TmTestLogSheet.** The TM test is not a max-effort set.
- **No "skip the test" flow.** If the user opens Live on week 4 and bails, the existing cancel-session path handles it — no new affordance.
- **No tutorial / explainer modal.** Per INTENT.md "no onboarding handholding". The intent line and `TmTestNote` are the only education; a serious 5/3/1 lifter recognizes the protocol by name.
- **No A/B test, no feature flag.** Ships to everyone on first install of the new build.

## Open questions

These need user input before implementation. The pipeline pauses while these are open.

1. **CycleStrip label.** The brief asks for designer's pick among `TEST` / `TM TEST` / `VERIFY` in 5–6 chars. The Today/Live screens read "TM TEST" comfortably (the cells there are wider). On the home strip, "TM TEST" is 7 characters (incl. space); the existing "DELOAD" is 6 and renders fine. Proposed: **"TM TEST"** on the strip, with a fallback to **"TEST"** if the QA agent reports visual overflow on a narrow device (≤320pt logical width). User confirms: TM TEST · TEST · VERIFY?

2. **Title-block eyebrow on Today.** Two phrasings work:
   - `WEEK 4 · TM TEST` (parallel with existing `WEEK 4 · DELOAD`).
   - `WEEK 4 · VERIFY` (matches the verb in the intent line).
   Proposed: **TM TEST** for parallelism with the strip and the set eyebrow. User confirms?

3. **Rep cap in `TmTestLogSheet`.** The protocol says the top of the band is 5 reps — past that you've already proven the TM is conservative. Should the stepper hard-cap at:
   - **5** (forces the lifter to stop logging once they've cleared the band)?
   - **10** (allows recording "I did 8" because that's data the lifter might want)?
   - **30** (matches AmrapLogSheet's existing cap)?
   Proposed: **10**. Honest record-keeping without making the stepper feel infinite. User confirms?

4. **Default rep value when the sheet opens.** Three choices:
   - **0** (forces a deliberate count input).
   - **5** (the top of the prescribed band — most lifters will land here on a well-set TM).
   - **3** (the bottom of the band — conservative starting point).
   Proposed: **0**. Logging a TM test should be a deliberate act; pre-filling 5 risks accidental saves and would also pre-pop the `↑` glyph in the band chip, which feels like editorial pressure to "achieve" a number. User confirms?

5. **TmAdjustmentSuggestion field naming.** The brief's signature uses `deltaLb`, but the field carries a value in whichever unit the lift uses (kg lifters get kg). Three options:
   - Keep `deltaLb` (matches brief, but misleading on kg).
   - Rename to `delta` and document the unit semantic in JSDoc.
   - Add a `unit` field to the return type to make it self-describing.
   Proposed: **rename to `delta`** with JSDoc note that the field is in the lift's unit (same convention as `tmIncrement`). User confirms?

6. **BBB on week 4 — entirely skipped, or shown as "optional"?** The brief says "BBB skipped on Week 4. Test set IS the work." It also says accessories are "designer's call — lean toward keeping accessories optional/light." Two readings:
   - **Hard skip** (cleaner): `BbbBand` does not render on week 4, period. The cycle's BBB volume bookkeeping treats week 4 as a zero-volume day.
   - **Soft skip**: `BbbBand` renders with a note "BBB is optional on TM test week — listen to recovery." Lets the lifter still log BBB if they want.
   Proposed: **hard skip**. Honors the brief's first sentence (test set IS the work), and the "no toggle" stance from INTENT.md. The lifter who wants BBB on a test week can run it un-tracked, same way assistance work is un-tracked today. User confirms?

7. **Test-set kind for the PR-rebuild SQL.** The existing PR rebuild filters `kind = 'amrap'` to find PR candidates. With `tm-test` joining the enum, do we want to allow PR detection on TM tests that happen to project above the lifter's prior best? Proposed: **no, never**. The TM test is bounded by definition — it cannot produce a "max-effort" e1RM. The PR rebuild stays AMRAP-only; the new kind is invisible to PR logic. User confirms? (If yes, this is a one-line guard, not a real design question — but flagging because the brief mentions e1RM math in passing.)

---

## Revision history

(none — initial spec on 2026-05-27)
