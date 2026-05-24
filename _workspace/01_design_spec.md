# Design spec: Workout / Session Flow Redesign

## Intent

A lifter on the gym floor needs the session screen to behave like a coaching ledger: tell me what to load, count me down, log what I actually did, then file the day. The current flow leaves three categories of friction — silent data loss (orphaned sessions, no warmup, no actual-rep entry), poor rhythm (count-up rest, blind plate-loading between sets, BBB never logged), and small polish gaps (leftover plate dust, single-step AMRAP entry, single-shape cancel). This redesign closes those gaps in three implementation waves while preserving the architecturally-clean pieces already in place (state machine, snapshot-on-create, keep-awake lifecycle, single-session invariant, PRCertificate as the only PR-celebration surface).

## PWA reference

N/A — PWA reference is not available in this environment. The spec is anchored on the current RN code under `apps/mobile/src/` (every brief-cited file verified to exist), `docs/DESIGN.md` §5.3 / §5.4 / §6 / §12, and `docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md` §6 / §8.

## Screens & flow

```
                    ┌─────────────────────────────┐
                    │           HOME              │
                    │   (Masthead, LiftTabs,      │
                    │    LiftPage carousel)       │
                    │                             │
                    │  ┌───────────────────────┐  │
                    │  │ RESUME BANNER (W1)    │  │ ← only when getActiveSession ≠ null
                    │  │ ★ SQUAT · IN PROGRESS │  │   AND user has not session-dismissed
                    │  │ · 14 min ago · Resume │  │
                    │  └───────────────────────┘  │
                    └──────────────┬──────────────┘
                                   │ tap LiftPage CTA
                                   ▼
                    ┌─────────────────────────────┐
                    │   /session/today?lift=X     │
                    │   (TodayScreen)             │
                    │   - Masthead                │
                    │   - TitleBlock              │
                    │   - WARMUP RAMP (W1, new)   │
                    │   - Top-set hero            │
                    │   - Working sets list       │
                    │   - BBB band                │
                    │   - "Start Session" CTA     │
                    └──────────────┬──────────────┘
                                   │ Start Session → createSession → push /live
                                   ▼
                    ┌──────────────────────────────────────────────────┐
                    │   /session/live?sessionId=N (LiveScreen)         │
                    │   useLiveScreenState phase machine:              │
                    │                                                  │
                    │    set ──► amrap-log ──► (W2: BBB confirm) ──► complete
                    │     │           │                                  │
                    │     ▼           ▼                                  │
                    │    rest ◄─── set (next index)                     │
                    │     │                                              │
                    │     └─► (any phase) cancel-confirm sheet          │
                    │              │                                    │
                    │              └─► dismiss returns to caller phase  │
                    │                                                   │
                    │   W1 also adds: working-set-log (sheet) phase     │
                    │   W2 also adds: bbb-confirm phase                 │
                    └──────────────────────────┬───────────────────────┘
                                               │ phase === 'complete' → replace /complete
                                               ▼
                    ┌─────────────────────────────┐
                    │ /session/complete?sessionId │
                    │ (SessionCompleteScreen)     │
                    │ - Masthead + Filed badge    │
                    │ - Title block / DateStamp   │
                    │ - PRCertificate (gated)     │
                    │ - The record (receipt)      │
                    │ - Cycle grid (W3 responsive)│
                    │ - NEXT SESSION row (W3)     │
                    │ - "Close the day" CTA       │
                    └─────────────────────────────┘
```

Back behavior:
- Home → system back exits the app.
- Today → back chip returns to Home.
- Live → back chip is suppressed in favor of the X / overflow cancel split (Wave 3). The Android hardware back button triggers `onRequestCancel` (mirrors the existing two-tap pattern by default; opens the cancel sheet, NOT the lift-tap branch — see Cancel decision tree below).
- Complete → "Close the day" replaces history with `/`. The user cannot back-navigate into a filed session by design (matches PWA's `router.replace`).

Deep links:
- `/session/today?lift=<lift>` and `/session/live?sessionId=<id>` remain the only sanctioned entry points. The resume banner taps directly into `/session/live?sessionId=N`, bypassing `/today` because the user has already started.

## Per-screen breakdown

Screens are grouped by wave. Each wave is self-contained: Wave 1 ships without depending on Wave 2; Wave 2 builds on Wave 1's phases; Wave 3 is a polish layer on top.

────────────────────────────────────────────────────────────────────────────────

### Wave 1 — Reliability (P0)

────────────────────────────────────────────────────────────────────────────────

#### W1.1 Home — Resume banner

A sticky band that appears between `LiftTabs` and the `LiftPage` carousel inside `HomeScreen.tsx` whenever `useActiveSession()` returns a row. **Above** the carousel, **below** the tab strip — keeps the lift selection visible (so the user can see they're not on the in-progress lift) but unambiguously dominant. The band is one-tap to resume; there is no confirm.

Layout:
- Full-width band, `paddingHorizontal: spacing.xl`, `paddingVertical: spacing.md`.
- Hairline above and below: `borderTopWidth: 1`, `borderBottomWidth: 1`, `borderColor: colors.lineStrong` (this is the "important strip" weight used by `titleSection` in `SessionCompleteScreen`).
- Background: `colors.bg1` (one shade up from canvas — a card surface, not the paper of the carousel below).
- Three columns laid out as `flexDirection: 'row'`, `alignItems: 'center'`, `justifyContent: 'space-between'`:
  - Left: `★ ` glyph (mono) + lift name (sans medium, size 14, uppercase, `letterSpacing: 1.8`) + `· IN PROGRESS` (mono caps, size 10, `color: ink2`). Single string, two visual weights via nested `<Text>`.
  - Middle (auto-shrink): mono caps relative time — `14 min ago`, `1h ago`, `Yesterday` — computed from `session.startedAt`. `color: ink2`.
  - Right: `Resume →` (sans semibold, size 12, uppercase, `letterSpacing: 0.8`, `color: ink0`).
- Tap target: the whole band is one `Pressable` with `hitSlop` of 0 (already ≥ 44pt because of vertical padding); right "Resume →" is purely visual cue, not a separate target.

Tokens used:
- `spacing.md`, `spacing.xl`
- `colors.bg1`, `colors.ink0`, `colors.ink2`, `colors.lineStrong`
- `type.sans`, `type.mono`

States:
- Empty: when `useActiveSession().data` is `null` or `undefined` (no in-progress row OR query still loading) → render nothing. Loading is collapsed into empty rather than a skeleton because the band's role is "you have unfinished business"; an inaccurate skeleton would be worse than a brief absence.
- Loading: same as empty (above). The `useActiveSession` query is cheap (single indexed lookup) so flicker risk is negligible.
- Error: if the query errors, render nothing and log via `console.warn`. Resume is a redundant path (the user can always navigate by tapping the in-progress lift's CTA in the carousel below), so silent suppression is acceptable.
- Success: band visible with lift + relative time + Resume affordance.
- Dismissed: see "Dismissal model" below.

Dismissal model:
- The band can be dismissed via a swipe left gesture (Reanimated `Gesture.Pan`, threshold > 80px translation OR velocity > 800px/s, snap to `translateX = -screenWidth` with `withTiming(durationBase, Easing.bezier(...easeStandardBezier))`, then `display: 'none'`).
- Dismissal is **session-local only**. State is held in a `useState` inside `HomeScreen`. On unmount (tab switch, app background, app kill) the dismissal is lost — next time Home mounts, if `getActiveSession` still returns a row, the band reappears.
- Rationale: the band is a recovery surface for the orphaned-session failure mode. Persisting dismissal would re-create the same silent-loss bug the band exists to fix. A session-local dismiss is enough to handle the "I see it, I'm aware, get out of my way for now" case without re-enabling the failure mode after an app kill.
- The dismissal gesture has a 250ms grace period after mount during which it is disabled — this prevents accidental swipe-down-on-list events from being routed to the band.

Interactions:
- Tap band → `router.push({ pathname: '/session/live', params: { sessionId: String(activeSession.id) } } as never)`. Selection haptic (`Haptics.selectionAsync()`) fires on tap-in.
- Swipe-left dismiss → no haptic (a haptic on a dismiss-and-forget action is too loud per `docs/DESIGN.md` §12).
- Long-press: not used; reserved for future "cancel from home" if we ever surface that.

Accessibility:
- `accessibilityRole="button"` on the outer Pressable.
- `accessibilityLabel`: `"Resume Squat session, started 14 minutes ago"` (composed from the same data the visual uses).
- `accessibilityHint`: `"Opens the live session screen."`
- `accessibilityActions`: `[{ name: 'dismiss', label: 'Dismiss banner' }]` with `onAccessibilityAction` handler — gives VoiceOver/TalkBack users a way to dismiss without performing a swipe gesture.
- VoiceOver reading order: band reads BEFORE the carousel page (it is physically above in the layout).
- Reduced-motion: dismissal animation is replaced by an immediate `display: 'none'` with no translate tween. Detect via `useReducedMotion()` from `react-native-reanimated`.
- Hit target ≥ 44pt: vertical padding of `spacing.md` (12) × 2 + text line height ≥ 20 = ≥ 44 ✓.

#### W1.2 Today — Warmup ramp block

Inserted into `TodayBody.tsx` **above** the top-set hero, **below** the `TitleBlock`. Renders the orthodox 5/3/1 warmup ramp computed from this lift's TM. MVP is static reference text; the stretch goal (tappable rows logging `kind: 'warmup'`) is included in this spec so Wave 1 can ship either form without re-spec.

Orthodox 5/3/1 ramp choice — **40 % × 5 / 50 % × 5 / 60 % × 3** (no empty-bar row). Justification: this is the canonical Wendler 5/3/1 warmup (matches `WARMUPS` already exported from `apps/mobile/src/domain/schemes.ts`, lines 32–36), is the same on every week, and avoids the "empty bar warm up makes no sense for press" debate. Empty-bar reps are part of the lifter's personal pre-ramp, not the prescription. Adding them would be an editorial position and would also make the bar visualization noisy when the bar weight is the entire load.

Week-1-set-1 overlap handling (W1S1 prescription is 65 % × 5):
- The ramp is **always rendered** in its canonical 40/50/60 form. We do not de-duplicate; the ramp lives in its own visual section, and a lifter reading the page expects to see all three warmup rows regardless of how close they get to the work weight.
- When a ramp weight, after snap to the storage step, equals the first working-set weight (which can happen on a deload-week 60% row, e.g. W4 set 3 also 60 %), the **ramp** row is rendered first with a `WARMUP` chip, and the working-set list is unchanged. No de-duplication.
- When ramp weights cross above the next-pending working-set weight (cannot happen on weeks 1–3 with the standard prescription, but is mathematically possible if Settings ever introduces an alternative scheme), the rows still render in their declared order; this is a "no policy needed, math is monotonic" condition.

Layout (Wave 1 MVP):
- Section header row matching the existing `WORKING SETS` row in `TodayBody`: caps label `WARMUP` left, caps hint `40 / 50 / 60` right.
- Three rows reusing the existing `SetRow` primitive, with `index` displayed as `W1` / `W2` / `W3` (this is a new optional `prefix` prop on `SetRow` — see New primitives) and `pct` rendered as a `40%`-style chip.
- Each row's weight is computed from `tm * pct`, snapped via `round(value, storageUnit)`, then converted to display via `displayWeight(...)`. Per-side plate decomposition is computed but rendered as a single inline summary chip (`25 + 5 / side`) rather than a full `PlateBar` — warmup plate viz would visually overpower the top-set hero.
- A `borderBottomWidth: 1, borderColor: colors.line` separator below the warmup block before the WORKING SETS heading.

Layout (Wave 1 stretch — tappable ramp):
- Each ramp row becomes a `Pressable`. Pressed state: `backgroundColor: colors.bg3` (the existing "pressed" surface token). Tap dispatches `appendSetLog(db, { kind: 'warmup', sessionId, index: -1 - rampIndex, prescribedWeight, prescribedReps, actualReps: prescribedReps })`. The `-1` family of indices keeps warmup rows ordering above working sets in any future sort-by-index query without colliding with working-set indices 0–2.
- After a successful tap, the row collapses to a "checked" state: leading `✓` glyph (mono), text in `colors.ink2`, no longer pressable. Selection haptic (`Haptics.selectionAsync()`) fires on tap-in.
- This row is **render-only on the Today screen** — it does not affect the Live phase machine, does not become a Live phase, does not block Start Session. The warmup-tap path is purely "scribble it down for the receipt".

Tokens used:
- `spacing.lg`, `spacing.xl`
- `colors.bg0`, `colors.bg3`, `colors.ink0`, `colors.ink2`, `colors.line`
- `type.mono`, `type.sans`
- `radii.sm` (chip)

States:
- Empty: never — if TM exists, the ramp computes. (TM-missing case is already handled upstream in `TodayScreen` before `TodayBody` renders.)
- Loading: collapsed into the parent's loading shell (TodayScreen already gates `<TodayBody>` on `settings.isLoading || tm.isLoading`).
- Error: if `appendSetLog` rejects in the stretch path, log via `console.error`, fire `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)`, leave the row un-checked. No toast (per "no drama" rule).
- Success: rows visible; tapped rows checked.

Interactions:
- Tap row (stretch): selection haptic + log + check. No undo (warmups are not load-bearing; mis-taps are inconsequential).
- No long-press.

Accessibility:
- Section is a `View` with `accessibilityRole="list"`, header is `accessibilityRole="header"`.
- Each row: `accessibilityRole="button"` (stretch only — MVP leaves these as plain `View`s with `accessibilityRole="text"`).
- `accessibilityLabel`: `"Warmup 1 of 3, 95 pounds, 5 reps, 40 percent"` (composed; `displayUnit(unit) === 'lb'` → "pounds", `'kg'` → "kilograms").
- VoiceOver reading order: header → row 1 → row 2 → row 3 → next section header.
- Reduced-motion: the pressed-state surface flip is instant (no fade), no animation needed.

#### W1.3 Live — Working-set actual-rep logging (split-CTA, option **b**)

Replace the single "Set complete" CTA at the bottom of `LiveScreen` (during `phase === 'set'` on non-AMRAP sets) with a two-button row:

```
┌────────────────────────────────┬────────────────────┐
│     Got all 5  ✓               │   Log actual       │
└────────────────────────────────┴────────────────────┘
```

Decision: **option (b) — split CTA**, not option (a) — text secondary.

Justification:
1. **One-handed input.** A split CTA places both choices in the same thumb arc at the bottom of the screen — the primary "Got all 5 ✓" reads as the happy path and is the larger, weightier target. A text-secondary "Log actual" placed elsewhere (where? above the CTA bar? in the header?) introduces a hand-travel cost on the most common interaction in the flow.
2. **Existing CTA layout.** `CtaBar` (`apps/mobile/src/design/primitives/CtaBar.tsx`) already accepts arbitrary children — splitting horizontally is a layout change inside that container, not a primitive addition. The AMRAP sheet's footer (`AmrapLogSheet.tsx` lines 145–180) already uses a side-by-side "Cancel / Save" pattern, so the visual idiom is established.
3. **Symmetry with AMRAP.** The AMRAP set never has a single-press happy path (`Log AMRAP` always opens a sheet). The split-CTA pattern on working sets aligns the model: every set is either "got it" or "log what I actually did" — no hidden text affordance.
4. **Discoverability.** A text-secondary "Log actual" is too easy to miss in the gym. A split CTA forces the user to see both options once per set; after the second set they've learned the pattern.

Layout:
- `CtaBar` content becomes `flexDirection: 'row', gap: spacing.md`.
- Primary "Got all N ✓": flex 2, `PrimaryPillButton` style (filled `colors.ink0`, paper text, pill radius `radii.pill`), label dynamically derived as `Got all ${prescribedReps}`.
- Secondary "Log actual": flex 1, outlined variant — `borderWidth: 1, borderColor: colors.ink0, backgroundColor: colors.bg0`, radius `radii.pill`, ink text. Label `Log actual` (no glyph).
- Min target 44pt on both: existing pill has `paddingVertical: 14`, line-height ≥ 16 → ≥ 44 ✓.

The "Log actual" branch opens a new bottom sheet — a `WorkingSetLogSheet` component (analogous to `AmrapLogSheet` but with a stepper pre-filled to `prescribedReps` and no e1RM caption, no PR-flash row, no AMRAP framing). On Save, calls a new hook handler `onLogWorkingSetWithActual(reps: number)` which writes `kind: 'working'` with `actualReps = reps`.

New phase value: **`working-set-log`** (extends the `LivePhase` union). Behaves like `amrap-log` — overlays the underlying `set` surface, dismiss returns to `set`. Save advances the same way `onLogWorkingSet` does today (to `rest` or `complete`).

Sheet layout (`WorkingSetLogSheet`):
- Header row: caps eyebrow `LOG ACTUAL` left, mono right showing `{prescribedWeight} {unit glyph} · prescribed {prescribedReps}`.
- `NumberStepper` (existing primitive) with `value = reps`, `min = 0`, `max = prescribedReps + 5` (allow slight overshoot for the rare "I got an extra" on a non-AMRAP day), `step = 1`, pre-filled to `prescribedReps`.
- Footer row: outlined "Cancel" / filled "Save" — same shape as `AmrapLogSheet`'s footer (re-use that visual pattern; do **not** abstract into a new primitive yet — the two sheets share three concrete visual rows but diverge on what they compute below; abstracting now would be premature).

CTA labels by phase + index:
- `phase === 'set'`, working set (non-AMRAP): split — `Got all {prescribedReps} ✓` / `Log actual`.
- `phase === 'set'`, AMRAP set: single `Log AMRAP →` (unchanged from today).
- `phase === 'rest'`: single `Next set →` or `Complete session →` (unchanged from today, until W2 layers on the breathe pulse).
- `phase === 'working-set-log'` or `'amrap-log'` or `'cancel-confirm'`: same CTA as the phase the sheet popped out of (cta is hidden by the sheet's backdrop in practice; logic unchanged).

Tokens used:
- `spacing.md`
- `colors.bg0`, `colors.ink0`
- `radii.pill`

States:
- Empty: not applicable (the CTA always renders when in `phase === 'set'`).
- Loading: while `useSession` is still loading, the existing `LiveScreen` early-return chrome handles it; no CTA visible.
- Error: if `appendSetLog` rejects from the split's primary or from the sheet's Save, log via `console.error`, fire warning haptic, do **not** transition phase. The user retries by tapping again.
- Success: phase transitions to `rest` (or `complete` after set 3 in a non-AMRAP week).

Interactions:
- Primary "Got all N ✓" tap: light impact haptic (`Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`), call `onLogWorkingSet()` (existing handler, unchanged — it writes `actualReps = prescribedReps`).
- Secondary "Log actual" tap: selection haptic, transitions to `phase === 'working-set-log'`, opens the sheet.
- Sheet Save: light impact haptic, calls `onLogWorkingSetWithActual(reps)`.
- Sheet dismiss / Cancel: no haptic, returns to `phase === 'set'`.

Accessibility:
- Primary CTA `accessibilityLabel`: `"Set complete, all {prescribedReps} reps logged"`.
- Secondary CTA `accessibilityLabel`: `"Log actual reps, opens entry sheet"`.
- Sheet stepper: existing `NumberStepper` accessibility (already `accessibilityLabelDecrement` / `Increment`).
- Reduced-motion: sheet open/close animations are already governed by `@gorhom/bottom-sheet`'s reduced-motion handling (set `animateOnMount={false}` when `useReducedMotion()` is true — surfaces a snap-to-final-position).

#### W1.4 Live / Today / Complete — Session-not-found shells

Replace the silent `return null` in:
- `apps/mobile/src/app/session/today.tsx:12` (`isLift(lift)` fail)
- `apps/mobile/src/app/session/live.tsx` (`Number.isNaN(parsed)` fail)
- `apps/mobile/src/app/session/complete.tsx` (`Number.isNaN(parsed)` fail)

…with a `SessionLayout` shell containing a centered "Session not found" surface and a primary CTA back to Home.

This is a **route-shell change**, not a feature-component change, but the visual lives in a new component placed in `apps/mobile/src/features/session/components/SessionNotFound.tsx` so the three route shells stay thin.

Layout:
- `SessionLayout` (existing wrapper, paper canvas + safe area).
- Centered column: caps eyebrow `NOT FOUND` (mono semibold, size 10, `letterSpacing: 2.2`, `color: ink2`).
- Headline: `Session not found.` (sans medium, size 32, `letterSpacing: -0.96`, `color: ink0`).
- Body copy: `This session can't be opened. It may have been cancelled or removed.` (sans regular, size 14, `color: ink2`, `maxWidth: 280`).
- CTA in a `CtaBar`: `PrimaryPillButton` labeled `Back to Home` with glyph `←`, action `router.replace('/')`.

Tokens used:
- `spacing.xl`, `spacing.xxl`
- `colors.bg0`, `colors.ink0`, `colors.ink2`
- `type.sans`, `type.mono`
- `radii.pill`

States:
- This component IS an empty/error state. No further state branches.

Interactions:
- CTA: light impact haptic, `router.replace('/')`.

Accessibility:
- `accessibilityRole="alert"` on the headline container so VoiceOver announces it on mount.
- CTA `accessibilityLabel`: `"Back to Home"`.
- Reduced-motion: no animations, nothing to fall back.

────────────────────────────────────────────────────────────────────────────────

### Wave 2 — Rhythm (P1)

────────────────────────────────────────────────────────────────────────────────

#### W2.1 Live — Rest phase three-section layout

Restructure `RestPhase.tsx`. Today it shows a headline + `LOGGED` stat + `RestTimer`. New layout has three explicit sections, each visually distinct, with the timer dominant.

Visual hierarchy (top to bottom):

```
┌──────────────────────────────────────────────┐
│ LOGGED                                   ⌃   │  ← compact, ink2 caps
│ ─────────────────────────────────────────    │
│ 185 lb × 5    EST. 1RM 215 lb · PR           │  ← single row, paper card
├──────────────────────────────────────────────┤
│                                              │
│              REST                            │  ← caps eyebrow
│                                              │
│            1:23                              │  ← 96pt timer (dominant)
│                                              │
│       [skip]      [+30s]                     │  ← inline controls
│                                              │
├──────────────────────────────────────────────┤
│ UP NEXT                                      │
│ ─────────────────────────────────────────    │
│ 205 lb × 5+      85% TM                      │  ← AMRAP marker if applicable
│ ── plate bar ──                              │  ← compact PlateBar
│ load: 25 + 5 / side over 45 bar              │  ← human-readable instruction
└──────────────────────────────────────────────┘
                                                  ← CtaBar pinned below, "Next set →"
```

Section dominance order — **REST is hierarchically dominant**: 96pt timer label, full vertical space, centered. LOGGED is compact (single row), UP NEXT is moderately weighted (mid-size weight, compact plate bar). Rationale: the lifter is between sets; they're done with the previous one (LOGGED is reference) and they need to load the next bar (UP NEXT is reference plus instruction) — but the *active* moment is the rest itself.

Concrete spacing:
- Outer container: `paddingHorizontal: spacing.xl`, `paddingTop: spacing.lg`, `paddingBottom: spacing.xxl`.
- LOGGED section: full-width with `borderBottomWidth: 1, borderBottomColor: colors.line`, `paddingVertical: spacing.lg`. Single row, `flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'baseline'`. Left: caps `LOGGED` (size 10) over `{weight} {unit} × {reps}` (size 22, sans medium, tabular-nums). Right: `EST. 1RM {x} {unit}` chip only when `isAmrap`. PR marker is the existing inline `· PR` suffix here — promoted to its own row in the AMRAP sheet (see W2.4).
- REST section: `flex: 1` (takes the rest of the available vertical), centered content. `marginTop: spacing.xl` / `marginBottom: spacing.xl`. Timer label at 96pt sans medium tabular-nums, mono caps `REST` eyebrow at 10pt above it. Inline controls below the timer label, `marginTop: spacing.lg`.
- UP NEXT section: `borderTopWidth: 1, borderTopColor: colors.line`, `paddingTop: spacing.lg`, `paddingBottom: spacing.md`. Layout matches LOGGED's row shape inverted — caps `UP NEXT` row at top, weight + reps row below.

UP NEXT computation:
- If `setIndex < 2`: render the next working set — `getWorkingSetByIndex(week, (setIndex + 1) as WorkingSetIndex)`, snap weight via existing math.
- If `setIndex === 2` AND Wave 2 BBB fork is enabled: render the BBB summary — `5 × 10 @ {bbbWeight}` with the same plate decomposition, **no** `UP NEXT` for set 3 → complete transition. The plate-load instruction reads `unload to 135 — strip the heavy plates`.
- If `setIndex === 2` AND BBB fork not yet shipped (pre-W2.5): render `SESSION COMPLETE` placeholder text where UP NEXT normally goes (caps `SESSION COMPLETE` over `Tap "Complete session" to file the day`).

UP NEXT plate-load instruction copy pattern:
- `load: {plate1} + {plate2} + ... / side over {bar weight} bar`
- Examples: `load: 25 + 10 / side over 45 bar` (185 lb), `load: 45 + 5 / side over 45 bar` (145 lb), `load: 45 + 25 + 10 / side over 20 bar` (165 kg metric).
- When the next set decreases from the prior: prepend `unload to`, e.g. `unload to 135 — strip the heavy plates`. Triggered when `nextWeight < currentWeight`.

Tokens used:
- `spacing.md`, `spacing.lg`, `spacing.xl`, `spacing.xxl`
- `colors.bg0`, `colors.ink0`, `colors.ink1`, `colors.ink2`, `colors.line`
- `type.sans`, `type.mono`

States:
- Empty: not applicable (rest phase always has a `lastLogged`).
- Loading: not applicable.
- Error: if next-set computation throws (shouldn't, math is pure), fall back to UP NEXT empty placeholder caps `NEXT SET`.
- Success: full three-section render.

Interactions: see W2.2 for timer controls.

Accessibility:
- Each section is a `View` with `accessibilityRole="region"` and an `accessibilityLabel`: `"Logged set"`, `"Rest timer"`, `"Up next"`.
- VoiceOver reading order: LOGGED → REST (timer label re-reads on countdown updates throttled to once per 5 seconds via `accessibilityLiveRegion="polite"` on the timer label container) → UP NEXT.
- Reduced-motion: no animations introduced by the layout itself; see W2.2 for the breathe pulse fallback.

#### W2.2 Live — Rest timer countdown + breathing animation

Replace the count-up math in `RestTimer.tsx`. Drop `const elapsed = Math.max(0, target - remaining)` and render `remaining` directly. The driver (`useLiveScreenState`) already counts down; this is purely a presentation fix.

Add inline `[skip]` and `[+30s]` controls below the timer label.

Layout (inline controls):
- Below the 96pt timer, `marginTop: spacing.lg`.
- `flexDirection: 'row'`, `gap: spacing.xl`, `justifyContent: 'center'`.
- Two `Pressable` chips, identical shape: `paddingHorizontal: spacing.lg`, `paddingVertical: spacing.sm`, `borderWidth: 1, borderColor: colors.ink0`, `borderRadius: radii.sm`, `backgroundColor: 'transparent'`.
- Label: mono semibold size 10, uppercase, `letterSpacing: 2.2`, `color: ink0`. Texts: `SKIP`, `+30s` (note: `+30s` not uppercased — the lowercase `s` is intentional, mono "second" abbreviation).
- Hit target: padding-derived, ≥ 44pt height ✓ (the chip itself is ~28pt; outer `Pressable` adds `hitSlop: { top: 8, bottom: 8, left: 12, right: 12 }` to reach 44pt without enlarging the visual).

Tap to switch to count-up:
- The entire 96pt timer label is wrapped in a `Pressable`. Single tap toggles between count-down (default) and count-up (rare).
- Mode state is held in `RestPhase` via `useState`, NOT in the hook. It does **not** persist across rest cycles within the same session — each rest cycle starts in count-down. This is a deliberate scoping decision: the use case is "I want to see how long this set is taking today", not "I'm a count-up person forever".
- Visual: in count-up mode, the eyebrow above the timer reads `OVER REST` instead of `REST`, and the time shows elapsed beyond target (e.g. `0:42 over`).

Breathing animation on the "Next set" CTA (T-0 trigger):
- At `remaining === 0`, the `Next set` CTA in `CtaBar` runs a continuous breathing pulse via Reanimated.
- Shared value: `const scale = useSharedValue(1)`.
- Worklet config:
  ```ts
  scale.value = withRepeat(
    withTiming(1.04, {
      duration: 800,
      easing: Easing.bezier(...motion.easeStandardBezier),
    }),
    -1,
    true,  // reverses on each iteration → ease in/out
  );
  ```
- Applied via `useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))` on the CTA's `Animated.View` wrapper.
- The pulse starts at T-0 and continues until the user taps the CTA OR a new rest cycle begins (effect cleanup: `scale.value = withTiming(1, { duration: motion.durationBase })`).

Haptic ladder (no new design, codifying):
- T-10s: selection haptic (`Haptics.selectionAsync()`). New addition — not in current code. Add a second `useEffect` in `useLiveScreenState` next to the T-3s effect, with its own `tenSecondFiredRef`.
- T-3s: warning haptic (`Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)`). Already present.
- T-0: light impact haptic (`Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`). New addition. Add a `zeroFiredRef` and trigger when `restRemaining === 0` for the first time per rest cycle.

Skip control:
- Tap `SKIP` → `setRestRemaining(0)` in the hook (new exposed handler `onSkipRest`). Immediately runs the T-0 light impact + breathe pulse via the existing T-0 path.
- No confirm. Skipping a rest is benign.

+30s control:
- Tap `+30s` → `setRestRemaining(prev => prev + 30)` (new exposed handler `onAddRest`). Resets the warningFiredRef so a re-entry through T-3s re-fires the haptic.
- Cap: if `remaining + 30 > 600` (10-minute ceiling), no-op + warning haptic. Prevents accidental runaway timers.

Tokens used:
- `spacing.sm`, `spacing.lg`, `spacing.xl`
- `colors.ink0`, `colors.bg0`
- `radii.sm`
- `type.mono`, `type.sans`
- `motion.easeStandardBezier`, `motion.durationBase`

States:
- Loading: timer renders `0:00` while session loads (current behavior preserved).
- Error: not applicable (timer math is deterministic).
- Success: countdown ticks; controls work; pulse runs at T-0.

Interactions: see above.

Accessibility:
- Timer label: `accessibilityRole="timer"`, `accessibilityLabel="Rest, 1 minute 23 seconds remaining"` (computed live; `accessibilityLiveRegion="polite"` rate-limited to 5-second updates).
- `SKIP` button: `accessibilityRole="button"`, `accessibilityLabel="Skip rest"`.
- `+30s` button: `accessibilityRole="button"`, `accessibilityLabel="Add 30 seconds to rest"`.
- Timer tap toggle: `accessibilityHint="Double tap to switch to count-up display"`.
- Reduced-motion fallback for breathing pulse:
  - Detect via `useReducedMotion()` from `react-native-reanimated`.
  - When true: do not start the `withRepeat` worklet. Instead, swap the CTA's text color/background once: at T-0, set `backgroundColor: colors.ink0, color: colors.bg0` permanently (or invert if already inverted) until the user taps. This communicates "now" without motion.

#### W2.3 Live — AMRAP preset chips

In `AmrapLogSheet.tsx`, add a row of preset chips **above** the existing `NumberStepper`. Tap = populate stepper, user can ± from there.

Chips: `[3] [5] [8] [10] [12] [15]`. Six chips covers the realistic range for an AMRAP top set (sub-3 is rare even on heavy 1+ weeks; over 15 is a re-test territory and the stepper handles the long tail).

Visual treatment:
- `flexDirection: 'row'`, `gap: spacing.sm`, `justifyContent: 'space-between'`, `marginBottom: spacing.lg`.
- Each chip: `Pressable`, `flex: 1`, `minHeight: 44`, `borderWidth: 1`, `borderColor: colors.ink0`, `backgroundColor: colors.bg0`, `alignItems: 'center'`, `justifyContent: 'center'`, `borderRadius: radii.sm`.
- Label: sans medium, size 18, tabular-nums, `color: ink0`. Number only — no caps "REPS" suffix, the section header already says "HOW MANY REPS?".

Tap states:
- Pressed (active touch): `backgroundColor: colors.bg3`. Standard PWA "pressed" surface.
- Selected (chip matches current stepper value AND user reached it via a chip tap, not a stepper press): `backgroundColor: colors.ink0`, `color: colors.bg0` (inverted). The selected state survives until the user uses the stepper's ± to move away from the chip value.
- After stepper ± from a selected chip: the chip de-selects (background returns to `bg0`, color to `ink0`). This is the "user adjusted" state — no chip is selected, the value persists. Implementation: track a `selectedChipValue: number | null` separately from `reps`; null when stepper-driven, set when chip-driven, cleared on next stepper change.
- Tap chip when it's already selected: no-op (do not toggle off; the user just confirmed their pick).
- Tap different chip while one is selected: instant re-select to the new chip.

Layout at smallest target screen width:
- Smallest target: iPhone SE 1st gen, **320 pt** wide.
- After sheet horizontal padding (`spacing.xl` × 2 = 48), available width is 272 pt.
- Six chips with 5 × `spacing.sm` (8) gaps = 40pt of gap → 232pt for chips → ~38pt each.
- 38pt < 44pt min target. Resolution: drop to **5 chips** at widths < 360pt — remove the `[3]` chip (least common AMRAP rep count). At 320pt: 272 - 32 = 240 / 5 = 48pt each ✓.
- Width detection: `Dimensions.get('window').width < 360` at sheet mount. Static, not responsive within a session.

PR indicator promotion (from `· PR` suffix to its own animated row):
- Currently the AMRAP sheet shows `EST. 1RM 215 lb · PR` inline in the second header row. Wave 2 promotes the `· PR` to its own row, animated in **only** when the user crosses the PR threshold via stepper or chip tap.
- New row, full sheet width, appears below the chips row and above the stepper. Layout: `flexDirection: 'row'`, `gap: spacing.sm`, `alignItems: 'center'`, `paddingVertical: spacing.sm`, `paddingHorizontal: spacing.lg`, `backgroundColor: colors.ink0`, `marginHorizontal: -spacing.xl` (bleed to sheet edges).
- Content: `★ NEW PERSONAL RECORD` (mono bold, size 10, `letterSpacing: 2.2`, `color: bg0`) and on the right `EST. 1RM {x} {unit}` (mono semibold, size 12, `color: bg0`).
- Animation: `Animated.View` wrapping the row. Shared value `prRowHeight = useSharedValue(0)`. When `isPotentialPR && reps > 0` becomes true, animate `prRowHeight.value = withTiming(40, { duration: motion.durationBase, easing: Easing.bezier(...motion.easeStandardBezier) })`. When it becomes false (user stepped down below PR threshold), animate back to 0. Wrap content in `overflow: 'hidden'` and bind to `height: prRowHeight.value` via `useAnimatedStyle`.
- This is **the only allowed PR flash outside the SessionCompleteScreen**. PRCertificate remains the held moment.
- Inline `· PR` suffix in the right column of the second header row is **removed** in Wave 2 — the dedicated row replaces it.

Tokens used:
- `spacing.sm`, `spacing.lg`, `spacing.xl`
- `colors.bg0`, `colors.bg3`, `colors.ink0`
- `radii.sm`
- `type.sans`, `type.mono`
- `motion.easeStandardBezier`, `motion.durationBase`

States:
- Empty: not applicable; the sheet only opens with prescribed context.
- Loading: not applicable.
- Error: existing `onSave` error handling unchanged.
- Success: chips render; selection tracks; PR row animates in/out.

Interactions:
- Chip tap: selection haptic, sets stepper to chip value, sets `selectedChipValue` to chip value.
- Stepper ±: existing behavior; additionally clears `selectedChipValue` to null.
- Save: existing behavior. If PR row was visible at save time, the existing complete-screen PRCertificate path fires (no duplicate flash — the row collapses with the sheet).

Accessibility:
- Each chip: `accessibilityRole="button"`, `accessibilityLabel="{n} reps"`, `accessibilityState={{ selected: selectedChipValue === n }}`.
- PR row: `accessibilityRole="alert"`, `accessibilityLabel="Personal record, estimated 1 rep max {x} {unit}"`. Fires on cross-into-PR only (not on each re-render).
- Reduced-motion: PR row height transition replaced by an instant show/hide. Detect via `useReducedMotion()`.

#### W2.4 Live — BBB confirm fork phase

After the third working set (or AMRAP, when it's the terminal set for the week) is logged → rest → "Next set" tap, **instead of** going straight to `complete`, insert a fork:

New phase: **`bbb-confirm`**.

Trigger: in `onAdvanceFromRest`, when `setIndex === 2` (the last main-work set), transition to `bbb-confirm` rather than `complete`. The terminal-complete transition moves into a handler invoked **from** the fork phase.

Surface:
- Renders inside `LiveScreen` as a full-surface phase (not a sheet) — mirrors the `set` and `rest` surfaces. The cancel-confirm sheet can still overlay it.
- Layout, top to bottom:
  - Caps eyebrow `MAIN WORK · DONE` (mono semibold, size 10, `letterSpacing: 2.2`, `color: ink2`).
  - Headline: `Boring But Big?` (sans medium, size 48, `letterSpacing: -1.44`, `color: ink0`). Period intentional; matches editorial tone.
  - Sub-paragraph: `5 sets of 10 at {bbbWeight} {unit}. Optional assistance — log it if you do it.` (sans regular, size 14, `color: ink2`, `maxWidth: 320`).
  - Compact `PlateBar` showing the BBB load (50% TM by default — wired from existing `bbbSets()`).
- `CtaBar` content: split CTA, side-by-side identical to W1.3:
  - Primary "Logged it ✓" (filled `ink0`, `radii.pill`, glyph `✓`). Action: writes 5 BBB rows + advances to `complete`.
  - Secondary "Skip BBB" (outlined, `radii.pill`). Action: advances to `complete` without writing.

What gets written on "Logged it" — **5 individual `SetLog` rows**, one per BBB set, all with `kind: 'bbb'`, `actualReps = 10`, `prescribedReps = 10`, `prescribedWeight = bbbWeightStorage`, `index = 100 + i` for `i in 0..4`.

Justification — five rows over one summary:
- **Consistency with main work.** Working sets and AMRAP write individual rows. A single summary row for BBB would be the only collapsed-set row in the schema; that special case would leak into every downstream consumer (volume math, receipt grouping, future "rebuild session" features).
- **Receipt grouping is a presentation concern.** `SessionCompleteScreen`'s receipt rows already aggregate working sets into a "Volume" row — BBB rows can be aggregated the same way ("BBB: 5 × 10 @ 135") in `ReceiptRow` without changing storage shape.
- **Future-proofing.** If a future feature lets the user re-rep a single BBB set (4 instead of 10, fatigue), the 5-row shape supports it. A summary row would require a schema change.
- **`index = 100 + i` keeps BBB rows past working-set indices.** Convention-only; no constraint enforces it, but it keeps ordering deterministic and easy to filter in queries.

Cancel sheet behavior from `bbb-confirm` phase:
- `phaseBeforeCancelRef` already captures the current phase at cancel-open time. Dismissing the cancel sheet from BBB returns to `bbb-confirm` (not to `rest`).
- If the user **confirms cancel** from `bbb-confirm`: session moves to `cancelled`, no BBB rows are written. Main-work rows already written are preserved (existing `cancelSession` behavior — sets are kept).
- Bottom-sheet stacking: only one sheet is ever open at a time. The cancel sheet covers the BBB phase surface; dismiss re-shows BBB.

Tokens used:
- `spacing.lg`, `spacing.xl`, `spacing.xxl`
- `colors.bg0`, `colors.ink0`, `colors.ink2`
- `type.sans`, `type.mono`
- `radii.pill`

States:
- Empty: not applicable.
- Loading: not applicable.
- Error: if the 5-row write rejects mid-way (some succeed, some fail), log via `console.error`, fire warning haptic, transition anyway to `complete` (the partial state is correct — sets that wrote, wrote; sets that didn't, didn't). Do **not** roll back; partial write is benign for BBB. Add a `console.warn` capturing the partial-failure indices so we can surface it in a future History view.
- Success: 5 rows written, transition to `complete`.

Interactions:
- "Logged it ✓": light impact haptic, write 5 rows, transition to `complete`.
- "Skip BBB": selection haptic, transition to `complete` directly.
- Back button (Android hardware): treated as cancel-request, opens cancel-confirm sheet (consistent with the rest of Live).

Accessibility:
- Headline `accessibilityRole="header"`.
- Primary CTA `accessibilityLabel="Log Boring But Big, 5 sets of 10 reps at {bbbWeight} {unit}"`.
- Secondary CTA `accessibilityLabel="Skip Boring But Big and finish session"`.
- Reduced-motion: no animations introduced.

#### W2.5 Live — Cancel split (deferred from Wave 3 in brief — see decision tree)

Note: the brief places the cancel split in Wave 3. We move the **decision tree** here in Wave 2 because it interacts with the BBB confirm phase and the working-set-log phase (both new in Waves 1–2), and shipping the decision tree without those phases existing would require re-spec'ing the cancel logic twice. Wave 3 retains the **visual changes** (X glyph, overflow menu); Wave 2 ships the **branching logic**.

See Wave 3 W3.2 for the visual treatment + state diagram.

────────────────────────────────────────────────────────────────────────────────

### Wave 3 — Polish (P2)

────────────────────────────────────────────────────────────────────────────────

#### W3.1 Live — Plate leftover surface in LiveBigWeight

In `LiveBigWeight.tsx`, when the plate decomposition's `leftover > 0.1` (storage units), render a secondary line **below** the main weight row but **above** the plate band.

Threshold: `leftover > 0.1` in **storage units** (not display units — leftover is reported by `decompose()` in the same unit as the input, and the input is `prescribedDisplay` which is in display units; recompute in storage by calling `decompose(prescribedDisplay, plateSet)` and reading `leftover` directly — the existing call site already does this, just discards the value).

Actually — re-reading the call site in `LiveScreen.tsx:135`: `const perSide = decompose(prescribedDisplay, plateSet).perSide;` — `leftover` is discarded right there. Pipe it through to `LiveBigWeight` as a new prop.

Layout:
- Below the existing `weightRow` in `LiveBigWeight`, `marginTop: spacing.xs`.
- Single mono caps line: `≈ {prescribedDisplay} (loaded {prescribedDisplay - leftoverInDisplay}) {unit}`.
- Style: mono medium, size 10, `letterSpacing: 1.8`, `color: ink2`, uppercase.
- Hidden when `leftover` rounds to 0 in display units.

Display calculation:
- `leftoverInDisplay` is the leftover converted to display unit and snapped to the **display** unit's step (round to nearest 5 lb / 2.5 kg).
- If the rounded leftover is 0 (e.g. 0.1 lb leftover rounds to 0), do not render the line.
- Round the displayed "loaded" value down to the nearest plate-loadable weight: `loaded = round(prescribedDisplay - leftoverInDisplay, displayUnit)`.

Tokens used:
- `spacing.xs`
- `colors.ink2`
- `type.mono`

States:
- Hidden: when leftover ≤ 0.1 storage units OR rounded leftover is 0 in display unit.
- Visible: when leftover > 0.1 storage units.

Interactions: none — read-only stat.

Accessibility:
- The line participates in the existing `LiveBigWeight` accessibility group. Add to the existing accessibility label: `"Prescribed {prescribed} {unit}, loaded {loaded} {unit} — {leftoverInDisplay} {unit} leftover"`.
- Reduced-motion: nothing to fall back.

#### W3.2 Live — Cancel split (visual layer)

Visual + state diagram (logic ships in Wave 2 W2.5).

Replace `SessionTopBar`'s right-side "Cancel" pill (currently `kind: 'cancel'`) with a tiny X chip + an overflow `…` chip, both ink-bordered, both 32×32, separated by `spacing.sm`.

Visual:
- X chip: same shape as the existing back chip (32×32, `borderWidth: 1, borderColor: colors.ink0, backgroundColor: colors.bg0`), label glyph `×` (mono semibold, size 13, `color: ink0`).
- Overflow `…` chip: same shape, label glyph `⋯` (mono semibold, size 13, `color: ink0`).

Decision tree — three branches:

**Branch A — Tap X with zero working sets logged:**
- Detect via `useSetLogsForSession(sessionId).data.filter(l => l.kind === 'working' || l.kind === 'amrap').length === 0`.
- Action: immediately call `cancelSession(db, sessionId)`, no confirm sheet, no haptic noise. Selection haptic only on tap (`Haptics.selectionAsync()`).
- Animation: standard route-replace transition to Home.
- Copy: none. The action is unambiguous.

**Branch B — Tap X with ≥ 1 working set logged:**
- Single-tap confirm sheet, lighter than current. Reuse `CancelConfirmSheet` but with `armed` defaulting to true on open and skipping the first-tap arm step.
- Sheet copy:
  - Eyebrow: `CONFIRM` (unchanged).
  - Headline: `End this session?` (sans medium, size 24, `color: ink0`).
  - Sub-paragraph: `Sets already completed are kept in history. The session is closed.` (slightly trimmed from current).
  - Primary button: `End session` (filled `ink0`, paper text). Single tap = `cancelSession`. NO second-tap arm.
  - Secondary button: `Keep training` (outlined).
- Haptic: open-sheet light impact, button-tap selection haptic.
- Animation: standard sheet slide-up (`@gorhom/bottom-sheet` default).

**Branch C — Long-press X OR tap overflow `…`:**
- Long-press X (300ms threshold, fires on hold) → opens the existing two-tap destructive sheet (current behavior, unchanged copy).
- Tap overflow `…` → menu sheet with one option: `Cancel session…` — tapping that opens the same two-tap destructive sheet.
- The two-tap sheet's copy emphasises: `Sets are kept · The session is closed. Tomorrow's day stays the same.`
- Haptics: long-press fires warning haptic on hold-completion (signals "you're entering destructive territory"); first tap on the destructive button = warning haptic (existing); second tap = success haptic + `cancelSession`.

State diagram:

```
                 SessionTopBar right-side
                 ┌─────────────┬──────────┐
                 │     X       │    …     │
                 └──────┬──────┴────┬─────┘
                        │           │
       ┌────tap─────────┤           │
       │                │           │
       │                ▼           │
       │         (working count?)   │
       │           /          \     │
       │         0             ≥1   │
       │         │              │   │
       │         ▼              ▼   │
       │   immediate    single-tap  │
       │   cancel       sheet (B)   │
       │   (A)                      │
       │                            │
       └────long-press──────┐       │
                            ▼       ▼
                        two-tap destructive
                        sheet (C, both paths)
```

Tokens used:
- `spacing.sm`
- `colors.bg0`, `colors.ink0`
- `type.mono`

States:
- A: no visible chrome change; immediate route transition.
- B: single-tap sheet open/closed.
- C: two-tap destructive sheet open/closed/armed.

Interactions: per decision tree above. Long-press uses Reanimated `Gesture.LongPress().minDuration(300)`.

Accessibility:
- X chip: `accessibilityRole="button"`, `accessibilityLabel="Cancel session"`. `accessibilityActions: [{ name: 'longpress', label: 'Force cancel session' }]`.
- Overflow chip: `accessibilityRole="button"`, `accessibilityLabel="More session actions"`, opens a menu.
- Reduced-motion: sheet animations governed by `@gorhom/bottom-sheet`'s reduced-motion path; long-press fires immediately without held-progress animation.

#### W3.3 Complete — "Next session" handoff row

Append to `SessionCompleteScreen`, between the cycle grid and the sticky `CtaBar` (currently a `<View style={{ height: 140 }} />` spacer — replaced by this row).

Layout:
- Full-width section with `paddingHorizontal: spacing.xl`, `paddingTop: spacing.xl`, `paddingBottom: spacing.md`.
- Caps section header `NEXT SESSION` (mono semibold, size 10, `letterSpacing: 2.2`, `color: ink2`, `marginBottom: spacing.sm`).
- Compact card with `borderWidth: 1, borderColor: colors.line`, `padding: spacing.lg`:
  - Row 1: lift name (sans medium, size 24, `color: ink0`) on the left; mono caps `WEEK {n} · DAY {n}` on the right (`color: ink2`).
  - Row 2: weight + reps (sans medium, size 20, tabular-nums, `color: ink0`) — `185 lb × 5+`.
- Button row below the card, `flexDirection: 'row'`, `gap: spacing.md`, `marginTop: spacing.md`:
  - Outlined "Schedule reminder" (text only, no glyph). **Stub button — no-op.** Renders as a normal pressable to preserve the surface; on tap, fires a selection haptic and shows an inline caption below the button for 2 seconds: `Reminders coming soon.` (caps mono, size 10, `color: ink3`, fades in via `withTiming(1, 200ms)` then fades out via `withTiming(0, 200ms, { duration: 200 })` after a 1600ms delay).
  - The existing `Close the day` CTA stays in the `CtaBar` below — this row does **not** duplicate it.

Computing the next session:
- Pure-domain helper (new): `nextSessionPlan(currentLift: Lift, enabledLifts: Lift[], week: Week): { lift: Lift, week: Week, day: number, topPct: number, topReps: number, amrap: boolean }`.
- Position the current lift in `enabledLifts`. Next position wraps to 0 and advances the week.
- Week wraps from 4 to 1 and advances cycle (but this row does not show cycle — only lift / week / day).
- Top-set details from `prescription(nextWeek)[2]`.
- TM for the next lift: read from `useLatestTms()` (already used by `LiftPage`). Snap and display via `displayWeight(...)`.

Tokens used:
- `spacing.sm`, `spacing.md`, `spacing.lg`, `spacing.xl`
- `colors.bg0`, `colors.ink0`, `colors.ink2`, `colors.ink3`, `colors.line`
- `type.sans`, `type.mono`

States:
- Empty: if `useLatestTms()` has no TM for the next lift, render the row with `--` placeholder for weight and a "Set a training max first" subline.
- Loading: while TMs query is loading, render skeleton — caps headers stable, weight row shows `··· {unit}` placeholder.
- Error: TMs query error → hide the row entirely (the rest of the receipt is still useful).
- Success: full render.

Interactions:
- "Schedule reminder" tap: selection haptic + show stub caption (described above).
- The row itself is **not** a tap target — tapping it does nothing. Reminder button is the only interactive surface in the row.

Accessibility:
- Section header `accessibilityRole="header"`.
- Stub button `accessibilityRole="button"`, `accessibilityLabel="Schedule reminder. Coming soon."`, `accessibilityHint="Not yet available."`.
- Reduced-motion: stub caption appears/disappears instantly (no fade).

#### W3.4 Complete — Cycle grid responsive breakpoint

In `SessionCompleteScreen`'s cycle grid (current code: `apps/mobile/src/features/session/SessionCompleteScreen.tsx:395-443`), switch the 4×N grid to a horizontally-scrollable single-row-per-week layout when `Dimensions.get('window').width < 360`.

Width threshold: **< 360 pt**. Justification:
- `Dimensions.get('window').width` returns the window width (logical pixels). 360pt is the boundary between "small" Android phones (e.g. some compact models report 360) and iPhone SE 1st gen (320pt). Anything < 360pt cannot fit a 16-cell row (4 lifts × 4 weeks) with the current 4pt gaps without each cell collapsing below the 4pt-thick fill-line visual.
- The brief specifies `< 360`; this matches. No off-by-one re-examination needed.

Layout at narrow width:
- Replace the single horizontal `cycleGridRow` with a `ScrollView` (horizontal) containing 4 stacked rows, one per week:
  ```
  W1 ──────────────────────  →  horizontal scroll if needed
  W2 ──────────────────────
  W3 ──────────────────────
  W4 ──────────────────────
  ```
- Each week-row is a `flexDirection: 'row'` of `enabledLifts.length` cells, each 32pt wide × 16pt tall, `gap: 4`.
- Snap behavior: `snapToInterval` is **not used** — the rows are short (4 weeks × 32pt + 3 × 4pt gap = 140pt for 4 lifts; fits without scrolling). The horizontal ScrollView only scrolls if `enabledLifts.length` is unusually large (>4, e.g. if a future custom-lifts feature ships); for the current product spec the rows do not scroll.
- Wait — re-read: the brief says "horizontally-scrollable single-row-per-week layout". The single-row layout is the **vertical stacking** (each week is one row); the horizontal scroll is the **fallback if a row overflows** the narrow viewport. Confirmed correct.
- Week labels: `W1`, `W2`, `W3`, `W4` rendered as the leading cell of each row (mono medium, size 9, `letterSpacing: 1.62`, `color: ink3`, `width: 24`, right-padded by `spacing.sm`).

Layout at standard width (≥ 360):
- Existing 4×N grid layout unchanged.

Accessibility for the horizontal scroll:
- Each week row gets `accessibilityRole="list"`, `accessibilityLabel="Week {n} progress"`.
- Each cell `accessibilityRole="text"`, `accessibilityLabel="Session {i+1}, {completed | not yet}"`.
- VoiceOver reading order: Cycle № caps header → Week 1 row (cells left-to-right) → Week 2 row → Week 3 → Week 4. No focus on the scroll container itself; the cells are the focusable units.
- The `current` cell (most recently completed) retains the inset 1pt border indicator.

Tokens used:
- `spacing.sm`, `spacing.md`
- `colors.ink0`, `colors.ink3`, `colors.line`
- `type.mono`

States:
- Empty: never (the grid is bound to settings/session data which is required to reach this screen).
- Loading: parent handles.
- Error: parent handles.
- Success: full render per width branch.

Interactions: scroll only (per row, only when overflow). No tap interactions on cells.

Reduced-motion: scroll is system-default; cells have no animation.

#### W3.5 Tenth issue — Settings rest-target visibility

**Friction (P3):** The rest target is per-user-configurable in Settings (`Settings.restTargetSeconds`, default 90s, consumed via `useSettings().data.restTargetSeconds`), but on the Live screen there is no surface that tells the user what their configured target is — only the elapsed (now count-down) value. A user who set rest to 180s and another who set it to 60s see the same screen with different paces, and neither has visual confirmation that "this is what I asked for."

Recommendation: in the REST section eyebrow (W2.1), append the target after `REST` — `REST · target 1:30`. Mono caps size 10, `color: ink3`, prepended by ` · ` separator. One line, no additional layout. This is a 2-token, 1-line change to `RestTimer.tsx` that closes the loop on a settings value the user actively edits.

Why P3: it's a clarity gap, not a defect. The current code is correct; it just doesn't surface a setting that the user can already verify by visiting Settings. Ships in Wave 3 as part of the rest-phase polish work.

## Data contract

No new tables. All friction points fit within the existing schema (`apps/mobile/src/data/drizzle/schema.ts`).

Confirmed enum coverage:
- `SetLogKind` already includes `'warmup'` and `'bbb'` (`apps/mobile/src/domain/types.ts:29` and `apps/mobile/src/data/drizzle/schema.ts:45`). No migration needed.

New accessor signatures (in `apps/mobile/src/data/accessors/setLog.ts` and `session.ts`):
- None required at the accessor layer. The existing `appendSetLog` handles all new kinds (warmup, bbb) via the non-AMRAP branch. No PR detection runs on either kind — desired behavior.

New TanStack Query hooks:
- None. Existing hooks suffice:
  - `useActiveSession()` — Resume banner consumer. Cache key `['activeSession']`. Invalidated already by `createSession` / `completeSession` / `cancelSession` callers.
  - `useSetLogsForSession(sessionId)` — used in Wave 3 cancel decision tree to count working sets. Cache key `['setLogs', sessionId]`. Already invalidated by `appendSetLog` flow (`LiveScreen.tsx:80` invalidates `['session', sessionId]`; we add `['setLogs', sessionId]` invalidation in the relevant call sites for accuracy, see below).

Cache invalidation gaps to close (small adjustments, not new hooks):
- `useLiveScreenState.onLogWorkingSet`, `onSaveAmrap`, `onLogWorkingSetWithActual` (new), and the BBB 5-row writer must each invalidate `['setLogs', sessionId]` in addition to existing keys. Today these handlers don't invalidate — the queries refresh on `LiveScreen`'s `phase === 'complete'` effect. The cancel decision tree depends on **fresh** working-set counts at the moment of X-tap, so it cannot wait for the complete-effect invalidation. Add an inline `queryClient.invalidateQueries({ queryKey: ['setLogs', sessionId] })` in each handler after the `appendSetLog` resolves.

Optimistic mutations:
- **Warmup row write** (W1.2 stretch): optimistic. `onMutate`: prepend a placeholder `SetLog` row with `id: -Date.now()` to `['setLogs', sessionId]`. `onError`: rollback. `onSettled`: refetch.
- **Working set write** (W1.3 split CTA, both branches): optimistic with same pattern. The Live screen visually advances to `rest` before the DB confirms, which already happens today — making it optimistic just keeps `useSetLogsForSession` in sync.
- **BBB 5-row write** (W2.4): NOT optimistic. The 5 rows are written before transitioning to `complete`; if they fail, the failure is logged and the transition still happens. Optimistic write would imply rollback-on-error, but for BBB partial-success is acceptable (per W2.4 error state) — rollback would erase rows that DID write.
- **Cancel** (W3.2 all branches): NOT optimistic. The session status flip is the source of truth for the `useActiveSession` query the Resume banner depends on. A failed optimistic cancel would re-show the banner mid-route-transition, which is worse than a 100ms wait.

Rollback strategy:
- For optimistic writes, on `onError` restore the previous cache value via the standard TanStack `onMutate` → `context.previousData` → `onError` rollback pattern.

## Domain logic

New pure functions, all in `apps/mobile/src/domain/`:

1. **`nextSessionPlan(currentLift: Lift, enabledLifts: Lift[], currentWeek: Week): { lift: Lift, week: Week, day: number, topPct: number, topReps: number, amrap: boolean }`**
   Location: `apps/mobile/src/domain/schemes.ts` (extends existing module).
   Computes the next session after the current one. Wraps lift order within a week, wraps week within a cycle.
   Property to test (fast-check): for any `(lift, enabledLifts.length ∈ {1..4}, week)`, repeated application of `nextSessionPlan` for `enabledLifts.length * 4` iterations returns to `(lift, week)`. (Cycle invariant.)

2. **`relativeTimeLabel(thenMs: number, nowMs: number): string`**
   Location: `apps/mobile/src/domain/labels.ts` (extends existing module).
   Returns one of: `"just now"`, `"{n} min ago"`, `"{n}h ago"`, `"Yesterday"`, `"{n} days ago"`.
   Property to test (fast-check): for any `delta ∈ [0, 7*24*60*60*1000]`, output is non-empty and matches one of the known patterns; for `delta < 60_000`, returns `"just now"`.

3. **`bbbPlanRows(sessionId: number, tmStorage: number, storageUnit: Unit, pct = 0.5): AppendSetLogInput[]`**
   Location: `apps/mobile/src/domain/schemes.ts`.
   Returns 5 `AppendSetLogInput`-shaped objects ready to feed `appendSetLog`. Uses `index = 100 + i`. Uses `round(tmStorage * pct, storageUnit)` for the snapped weight.
   Property to test: returns exactly 5 rows; all rows share the same `prescribedWeight`; indices are `100, 101, 102, 103, 104`.

4. **`plateLoadInstruction(perSide: readonly number[], barWeight: number, currentLoad: number, unit: Unit): string`**
   Location: `apps/mobile/src/domain/plates.ts` (extends existing module).
   Returns the UP NEXT instruction string. Pattern: `load: {plates} / side over {bar} bar` OR `unload to {weight} — strip the heavy plates` when `currentLoad > nextLoad` (this branch needs the caller to pass `currentLoad`; if `currentLoad <= nextLoad`, returns the load pattern).
   Property to test: for any `perSide`, the instruction string contains all plate values in descending order separated by `+`.

5. **`isOrphanedActiveSession(session: Session | null, nowMs: number, staleAfterMs = 24 * 60 * 60 * 1000): boolean`**
   Location: `apps/mobile/src/domain/schemes.ts`.
   Reserved for a possible future "this session was started over 24h ago — clean it up?" prompt. Not used in Wave 1 (the resume banner does not gate on age — the brief explicitly chose the resume-then-decide path over a stale-session-cleanup prompt). Included here as a documented hook for the post-redesign cleanup discussion.
   Property to test: returns false for null, false for sessions with `startedAt > nowMs - staleAfterMs`, true otherwise.

The remaining work is presentation logic and belongs in `features/session/` or `features/home/`. No additional pure-domain math is required.

## New primitives

New primitives go in `apps/mobile/src/design/primitives/`. Only add when no existing primitive composes cleanly.

1. **`ResumeBanner`** — *new primitive.*
   Path: `apps/mobile/src/design/primitives/ResumeBanner.tsx`.
   Pure presentational; the consuming feature owns the active-session query + dismissal state. Props: `{ liftLabel: string, relativeTime: string, onResume: () => void, onDismiss: () => void }`. Composes `Pressable` + nested `<Text>` rows + the swipe-dismiss gesture. Goes into the `design/primitives/index.ts` barrel.

2. **`SessionNotFound`** — *new feature component, not a primitive.*
   Path: `apps/mobile/src/features/session/components/SessionNotFound.tsx`. Feature-local because it stitches together SessionLayout (feature) + CtaBar (primitive) + Text (primitive); not generic enough to live in `design/`.

3. **`WorkingSetLogSheet`** — *new feature component, not a primitive.*
   Path: `apps/mobile/src/features/session/components/WorkingSetLogSheet.tsx`. Mirrors `AmrapLogSheet` but for actual-rep entry on working sets.

4. **`SetRow` — extend, not add.**
   Add an optional `prefix?: string` prop to render `W1` / `W2` / `W3` instead of the index for warmup ramp rows.

5. **`BbbConfirmSurface`** — *new feature component, not a primitive.*
   Path: `apps/mobile/src/features/session/components/BbbConfirmSurface.tsx`. Renders the `bbb-confirm` phase body.

6. **`PresetChipRow`** — *new primitive.* OPTIONAL.
   Path: `apps/mobile/src/design/primitives/PresetChipRow.tsx`. Reusable horizontal row of selectable chips. Props: `{ values: readonly number[], selected: number | null, onSelect: (value: number) => void, formatLabel?: (value: number) => string }`. Used by the AMRAP sheet; could be reused by future presets. **Decision: ship inline in `AmrapLogSheet.tsx` for Wave 2; promote to a primitive only when a second call site appears.** Listed here as a candidate for future extraction.

7. **`NextSessionRow`** — *new feature component, not a primitive.*
   Path: `apps/mobile/src/features/session/components/NextSessionRow.tsx`. Renders the W3.3 NEXT SESSION card.

## Out of scope

- Notifications system / `expo-notifications` integration. The "Schedule reminder" button is a UI stub only.
- Home screen redesign beyond the Resume banner. LiftTabs, LiftPage, carousel, and Masthead are untouched.
- History screen changes. Filed-session ordering and visibility are unchanged. (The orphan-session fix means History will *correctly* exclude phantom in-progress rows — that's behavior preservation, not a History redesign.)
- Settings screen UX changes. The rest-target value is read but not editable from anywhere in this spec; that's a Settings-screen concern.
- PR threshold visualization beyond the AMRAP sheet PR row (Wave 2). No PR toasts, no banners, no inter-set celebrations. PRCertificate on the complete screen remains the held moment.
- Assistance work beyond BBB (e.g. push/pull/core assistance lifts). Out of scope per product spec.
- Cross-session data (volume trends, weekly summaries on the Live screen). The complete screen's receipt rows are the only post-session aggregation.
- Cycle-end / TM bump UX. `advanceDay` already runs at complete-time; visualizing the cycle wrap is a separate spec.
- Dark mode. The e-ink theme is theme-stable; no dark-mode variant is in scope (per product principles).
- First-launch session edge cases beyond what the existing onboarding gate handles.
- `expo-av` chime at T-0. Removed per `useLiveScreenState.ts:17` comment (Expo Go SDK 55 dropped the native module); the haptic ladder + breathing pulse replace it.
- Plate-set editor / custom plate inventories. The existing `'standard'` / `'kg-standard'` enum is the only supported set.
- Cross-device session sync. Single-device, single-database — explicit per architecture.

## Open questions

None — ready for implementation.

(Resolution notes for the spec's most load-bearing choices are in the per-screen sections above. If `rn-frontend` hits ambiguity during implementation, route a `SendMessage` back to `rn-designer` and the resolution will be inlined into this spec via a `## Revision <date>` block per the skill's revision protocol.)

---

## Coverage checklist

- [x] What screen(s) does the user see, in what order? — See `Screens & flow`.
- [x] What does each screen look like in empty / loading / error / success states? — Each per-screen block enumerates all four.
- [x] What tokens does each screen reference? — Listed under `Tokens used` per screen. None raw hex/px.
- [x] What data is read; what data is written? — `Data contract` enumerates reads, writes, and invalidation rules.
- [x] What domain math is required? — `Domain logic` lists 5 new pure functions with signatures and property tests.
- [x] What happens on every tappable element? — Each `Interactions` block enumerates per-element behavior.
- [x] What does VoiceOver/TalkBack read for each element? — `Accessibility` block per screen enumerates labels, roles, and focus order.
- [x] What is the reduced-motion fallback? — Each animated element explicitly states its `useReducedMotion()` fallback.
- [x] What is explicitly out of scope? — See `Out of scope`.
