# P8-onboarding — Onboarding flow (4 steps)

> Spec written by the orchestrator on user direction.
> Behavioral source: `design-reference/screens-onboarding.jsx` (all of it; 586 lines).

## Goal

Multi-step intake: user picks unit + lifts, then enters a 1RM or recent set per lift, then reviews. On finish, the app seeds 4 lifts with their training maxes and routes into `(tabs)/home`.

## Behavioral reference

- `OnboardingScreen` (line 18) — orchestrator with `{ step, unit, lifts, computed }` state. Walks Intro → LiftSelect → LiftEntry × N → Review.
- `OnboardingIntro` (line 219) — welcome page + BulletPoint primer + "Begin".
- `OnboardingLiftSelect` (line 80) — toggles for the 4 lifts (squat/bench/deadlift/press).
- `LiftEntryStep` (line 302) — for each enabled lift: NumberStepper for weight + reps, derives e1RM and 90% TM.
- `OnboardingReview` (line 489) — summary table + "Done".
- `epley1RM` (line 4), `LIFT_ORDER` (line 10), `LIFT_META` (line 11), `BulletPoint` (line 282), `NumberStepper` (line 439, local — we already have NumberStepper in src/design/primitives/).

## Files

**Create:**
- `apps/mobile/src/features/onboarding/OnboardingScreen.tsx` — the step orchestrator. Owns the state machine.
- `apps/mobile/src/features/onboarding/steps/IntroStep.tsx`
- `apps/mobile/src/features/onboarding/steps/LiftSelectStep.tsx`
- `apps/mobile/src/features/onboarding/steps/LiftEntryStep.tsx`
- `apps/mobile/src/features/onboarding/steps/ReviewStep.tsx`
- `apps/mobile/src/features/onboarding/lift-meta.ts` — LIFT_ORDER, LIFT_META, epley1RM helper (re-export from `src/domain/e1rm`).
- `apps/mobile/src/features/onboarding/__tests__/OnboardingScreen.test.tsx`

**Modify:**
- `apps/mobile/src/app/onboarding/index.tsx` — render `<OnboardingScreen onFinish={...} />`.
- `apps/mobile/src/app/onboarding/_layout.tsx` — already a Stack (P4-01); just confirm Stack still wraps.

## Component shape

```ts
type OnboardingState = {
  step: 'intro' | 'select' | 'entry' | 'review';
  unit: 'lbs' | 'kg';
  enabled: Record<'squat' | 'bench' | 'deadlift' | 'press', boolean>;
  entries: Record<'squat' | 'bench' | 'deadlift' | 'press', { weight: number; reps: number }>;
};

type OnboardingScreenProps = {
  onFinish: (result: {
    unit: 'lbs' | 'kg';
    lifts: Array<{ id: string; trainingMax: number; enabled: boolean }>;
  }) => void;
};
```

The `entry` step iterates through enabled lifts; track `entryIndex` so back/next move within the entry sequence before going to review.

Use `useReducer` for the state machine (cleaner than nested useState).

Use existing design primitives: `Text`, `Caps`, `Card`, `PressButton`, `SegRail`, `NumberStepper`. Don't re-port the in-reference NumberStepper.

## Tests

Single test file walking the happy path:
1. Mount with `onFinish` mock.
2. Press "Begin" → state moves to `select`.
3. Tap each lift toggle (assert visual state changes).
4. Press "Next" → state moves to `entry`.
5. For each enabled lift: assert step counter "N of total", set weight via the NumberStepper (use `fireEvent.press` on Increment N times to bump), advance.
6. After last lift: state moves to `review`. Assert TMs shown.
7. Press "Done" → `onFinish` called with `{ unit, lifts: [...4 lifts with computed TMs] }`. Use `(0.9 * epley1RM(weight, reps))` rounded to nearest 5 to compute TM.

Tests asserting accessibility role="header" on each step's headline.

## Done_when

- Spec exists.
- 4-step flow works end-to-end via the test.
- Routes wired.
- `pnpm test` passes.
