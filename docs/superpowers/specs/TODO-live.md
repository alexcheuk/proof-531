# P8-live — Live screen (active set + rest timer)

> Spec written by the orchestrator on user direction.
> Behavioral source: `design-reference/screens-main.jsx:670-993` (LiveScreen + RestPhase 856).

## Goal

The lifting-mode modal: a focused, distraction-free screen showing the current set with a giant weight number, a rep counter, and a "Complete" CTA. After completing a set, it transitions to RestPhase — a countdown timer with a preview of the next set.

If the completed set is an AMRAP that beats the prior e1RM, fire `onPRDetected` (the PR modal — P8-pr-modal — is wired in that task).

## Behavioral reference

- `LiveScreen` (line 670) — `{ session, unit, plateVariant, setIndex, onComplete, onClose, onPRDetected }`. Top-level. Owns phase state ('lifting' | 'rest').
- `RestPhase` (line 856) — `{ unit, weight, reps, amrap, elapsed, target, nextSet, nextWeight, plateVariant, predictedE1RM, isPR, onNext }`.
- `DarkStepper` (line ~830) — local stepper styled for dark/full-screen context. We'll reuse our existing NumberStepper but with `tone="dark"`-equivalent — wrap it in a container with `colors.bg0` background instead.

## Files

**Create:**
- `apps/mobile/src/features/live/LiveScreen.tsx`
- `apps/mobile/src/features/live/LiftingPhase.tsx`
- `apps/mobile/src/features/live/RestPhase.tsx`
- `apps/mobile/src/features/live/useRestTimer.ts` — small hook returning `{ elapsed, start, reset }` using `useEffect` + `setInterval`. Pure-ish; accepts a `now()` provider for testability.
- `apps/mobile/src/features/live/__tests__/LiveScreen.test.tsx`
- `apps/mobile/src/features/live/__stories__/LiveScreen.stories.tsx`

**Modify:**
- `apps/mobile/src/app/live.tsx` — render `<LiveScreen />` reading session from route params (use Expo Router's `useLocalSearchParams`).

## Component shape

```ts
type LiveScreenProps = {
  session: TodaySession;
  setIndex: number;                   // which prescribed set is "current"
  plateVariant?: PlateVariant;
  onComplete: (input: { index: number; actualReps: number }) => void;
  onClose: () => void;
  onPRDetected?: (input: { liftId: string; newE1RM: number }) => void;
};

type Phase = 'lifting' | 'rest';
```

State machine: start in 'lifting' with the prescribed set. User adjusts `actualReps` (default = prescribed). Pressing "Complete":
1. Compute e1RM via `epley(weight, actualReps)` (from `src/domain/e1rm/`).
2. If `set.amrap && isPR(e1RM, history)`: call `onPRDetected({ liftId, newE1RM: e1RM })`. (Pass history as `[]` for the v1 — wiring real history is downstream.)
3. Call `onComplete({ index: setIndex, actualReps })`.
4. Transition to 'rest' phase.

`RestPhase` shows a countdown timer (target 60s, 90s, or 180s based on set type), the next prescribed set, and a "Next set" button that calls `onClose` or transitions to lifting the next set (out of scope — keep it simple: on next-press, call `onClose`).

`useRestTimer` returns `{ elapsed }` updated every second.

Styling: pitch dark — `colors.bg0` background everywhere. Use very large WeightNum (size 'lg' or larger via custom). Heavy use of Caps for labels.

## Tests

- LiftingPhase: renders weight + reps + "Complete" button.
- LiftingPhase: pressing Complete calls `onComplete({ index, actualReps })`.
- LiftingPhase + AMRAP: actualReps starts equal to prescribed; can bump via NumberStepper.
- RestPhase: renders timer text starting at "0:00" (use a deterministic now() mock).
- Phase transition: after Complete, RestPhase renders.
- PR detection: on AMRAP complete with a large actualReps, `onPRDetected` called with `liftId` and e1RM.

## Done_when

- Spec exists.
- 3 components + hook created.
- Modal route wired.
- Tests pass.
