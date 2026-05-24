# Brief — Workout / Session Flow Redesign (consolidated audit)

**Author:** product owner (via Claude on `claude/workout-session-flow-audit-NMDoN`)
**Date:** 2026-05-24
**Mode:** revision of an existing flow — not a port. PWA reference is not available in this environment, so anchor the spec on the current RN code, `docs/DESIGN.md`, and `docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md`.

---

## Why this spec exists

The current session flow is architecturally clean but has nine UX gaps that fall into three buckets. We are consolidating the fix into a single design spec, staged for implementation in three waves so the design stays cohesive across the redesign.

The flow today:

```
Home → /session/today?lift=X → /session/live?sessionId=N → /session/complete?sessionId=N
                                ↑ phases: set → amrap-log → rest → set → … → complete
                                          ↑ cancel-confirm (overlay)
```

Architectural pieces that **stay**:

- State machine in `apps/mobile/src/features/session/useLiveScreenState.ts` (extend, don't replace)
- Snapshot-on-create at `apps/mobile/src/data/accessors/session.ts:42` (TM + units frozen)
- Tab bar hidden by `apps/mobile/src/app/session/_layout.tsx:3`
- `expo-keep-awake` lifecycle in `LiveScreen.tsx:63`
- Single-session invariant (one in-progress session at a time)
- PRCertificate as a held moment on the complete screen — DO NOT dilute

---

## Friction points the spec must resolve

### Reliability (silent data loss) — Wave 1, P0

1. **Orphaned sessions on app-kill.** `LiveScreen.tsx:95-104` bounces home if status flips, but force-close leaves a permanent `in_progress` row with no surfaced recovery. User starts a new session next day; phantom rows accumulate in history.
2. **No warmup support.** `apps/mobile/src/domain/schemes.ts` exports zero warmup ramps; `apps/mobile/src/features/session/components/TodayBody.tsx` jumps straight to 65 % × 5. Credibility issue for a 5/3/1 app — warmups are the *start* of every session in 5/3/1 culture.
3. **Working sets can't log actual reps less than prescribed.** `useLiveScreenState.onLogWorkingSet` writes `actualReps = prescribedReps` unconditionally. Missed reps require lying or skipping the log → silently overstates volume and breaks the "AMRAP is the only heavy set" assumption.

### Rhythm (gym-floor feel) — Wave 2, P1

4. **Rest phase doesn't surface the next set.** `RestPhase.tsx` shows what you just did + count-up timer. Loading plates blind.
5. **Rest timer counts up, not down.** `RestTimer.tsx:33` = `target − remaining`. Every commercial gym timer counts down. No skip / +30 s controls.
6. **BBB shown but never logged.** `TodayBody.tsx:44-255` renders 5×10 BBB; live flow ends after working set 3. 50 reps vanish from history. Either log it or remove it. (Recommendation: log it.)
7. **Cancel flow is single-shape for two intents.** `CancelConfirmSheet.tsx` two-tap + warning haptic is too heavy for "oops, wrong lift" and too light for "I'm bailing mid-session with a PR on the line."

### Polish — Wave 3, P2

8. **Plate decomposition leftover discarded.** `apps/mobile/src/domain/plates.ts` returns `{ perSide, leftover }`; `LiveBigWeight.tsx` drops `leftover`. User sees 250 when prescribed 252.5 with no warning.
9. **AMRAP rep entry is single-step.** `AmrapLogSheet.tsx` `NumberStepper` for 0–30 reps. Tapping `+` 14 times with chalky thumbs is bad UX.

---

## Wave-by-wave shape

The spec MUST split the implementation guidance into three explicit wave sections so they can be shipped in order without re-spec'ing. Cross-wave token / primitive additions are fine and should be listed once at the top.

### Wave 1 — Reliability (P0)

- **Resume banner on Home.** If `getActiveSession(db)` returns a row, sticky band above the lift tiles. Copy pattern: `★ SQUAT · IN PROGRESS · 14 min ago · Resume →`. Single tap = direct nav to `/session/live?sessionId=N`. No confirm.
- **Warmup ramp on Today.** Insert above the top-set hero. Propose a 5/3/1-orthodox default (e.g. empty bar × 5 / 40 % × 5 / 50 % × 5 / 60 % × 3, computed from TM). Snap each ramp weight to the user's plate set so it's loadable. MVP: static reference text. Stretch goal in the same spec: tappable rows that append `kind: 'warmup'` set logs with no PR detection. The `'warmup'` kind already exists on `SetLog` (`domain/types.ts:88`).
- **Actual-rep logging on working sets.** Pick ONE of:
  - (a) tap "Set complete" once = log prescribed; a separate "Log actual" secondary text button opens a stepper pre-filled to prescribed.
  - (b) split CTA "Got all 5" primary / "Log actual" secondary.
  Decide and justify in the spec.
- **Empty states.** Replace silent `return null` at `app/session/today.tsx:12`, `app/session/live.tsx`, `app/session/complete.tsx` with a `SessionLayout` shell + a "Session not found — back to home" CTA.

### Wave 2 — Rhythm (P1)

- **Rest phase, three sections:** LOGGED (what you just did) · REST (timer + controls) · UP NEXT (next set weight/reps + plate load instructions like `load: 25 + 5 per side over 45 bar`). Restructure `RestPhase.tsx`.
- **Rest timer counts DOWN by default.** Inline `[skip] [+30s]` controls on the timer surface. Haptic ladder: selection at T-10 s, warning at T-3 s, light impact at T-0 + a Reanimated "breathe" pulse on the "Next set" CTA. Tap the count to switch to count-up (rare opt-in, persists per-session only).
- **AMRAP preset chips above the stepper.** `[3] [5] [8] [10] [12] [15]` in `AmrapLogSheet.tsx`. Tap = populate stepper, user can ± from there. Live e1RM stays. Promote the PR indicator from a tiny suffix to its own animated-in row when threshold crosses (this is the single allowed PR-flash leak — see "Keep PRCertificate sacred" below).
- **BBB confirm fork.** After working set 3 → rest → instead of going straight to `/session/complete`, insert a fork: `MAIN WORK · DONE / Boring But Big 5×10 @ 135 / [Skip BBB] [Logged it]`. "Logged it" appends 5 BBB SetLogs with `actualReps = 10`. Volume on the receipt now reflects reality.

### Wave 3 — Polish (P2)

- **Plate leftover surface in `LiveBigWeight.tsx`.** When `leftover > 0.1` (storage units), secondary line: `≈ 252.5 (loaded 250)`. Use display units; round to the user's display step.
- **Cancel split** in `SessionTopBar.tsx`:
  - Tiny X top-right.
  - Tap with 0 working sets logged → close immediately (no confirm).
  - Tap with ≥ 1 set logged → single-tap confirm sheet ("Sets are kept · End session"). Less brutal than the current two-tap.
  - Long-press OR `…` overflow → current two-tap destructive pattern, copy emphasises "sets are kept · session is closed".
- **Complete screen "Next session" handoff.** Append to `SessionCompleteScreen.tsx`: `NEXT SESSION · BENCH · WEEK 1 · DAY 2 · 185 · 5+ / [Schedule reminder] [Close the day]`. The reminder action is a no-op stub for now — leave the surface in place so it can light up later.
- **Cycle grid responsive.** At `Dimensions.get('window').width < 360`, switch the 4×N grid in `SessionCompleteScreen.tsx` to a horizontally-scrollable single-row-per-week layout.

---

## Constraints

- **Don't change boundary architecture.** Phases extend rather than replace. New phases likely needed: `warmup` (if tappable warmup is in scope), `working-set-log` (if option a), `bbb-confirm`. Possibly `next-session-preview` — designer's call.
- **DB schema.** Confirm `'warmup'` and `'bbb'` are already in the `SetLogKind` enum (`apps/mobile/src/domain/types.ts:88`). No table changes expected; if any are needed for resume / warmup logging, call them out in the Data contract section.
- **Keep PRCertificate sacred.** The only allowed PR flash outside the complete screen is the inline AMRAP-sheet indicator (Wave 2 amplifies it to a full row). No PR confetti, toasts, or banners elsewhere.
- **No new dependencies beyond what's already in the stack** (Reanimated 4, `@gorhom/bottom-sheet` v5, `expo-haptics`, `expo-keep-awake`, `expo-status-bar`). `expo-notifications` is out of scope for this spec — leave the "Schedule reminder" button as a stub.
- **No emojis in copy or code.** No drama in microcopy. Editorial / ledger tone consistent with the existing screens.

## What this spec is not

- Not implementation. `rn-frontend` will implement off this spec.
- Not a re-port from the PWA. Inputs are the current RN code + the two anchor docs.
- Not a tab/home redesign — only the resume banner section of Home is in scope. Everything else on Home is unchanged.
- Not a history-screen change beyond whatever is implied by no-longer-orphaned sessions being correctly visible.

## Tenth issue (if found)

Auditor's invitation to the designer: if you spot a tenth friction point in the flow (e.g. cycle-end behaviour, first-launch session edge cases, dark-mode legibility on the live screen, anything in the data layer), flag it as P3 with a one-paragraph recommendation. Do not feature-creep — just record it.

## Output expectations

Write `_workspace/01_design_spec.md` per `.claude/skills/rn-design-spec/SKILL.md` skeleton. Wave structure must be visible. Coverage checklist at the end. Open questions section even if it's just "None — ready for implementation."
