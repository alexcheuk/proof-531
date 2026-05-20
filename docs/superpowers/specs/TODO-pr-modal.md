# P8-pr-modal — PR modal (post-AMRAP celebration)

> Spec written by the orchestrator on user direction.
> Behavioral source: grep `screens-main.jsx` for `isPR` / `predictedE1RM` callsites in RestPhase (line ~856-993).

## Goal

Celebratory modal shown after a user beats their previous e1RM on an AMRAP set. Big number, lift name, before/after, "Continue" to dismiss. No telemetry beyond the existing `pr_detected` PostHog event from P6-02.

## Behavioral reference

The reference doesn't dedicate a standalone modal — the PR feedback in `RestPhase` is inline. For this task we extract it into a proper modal route to match the existing routing scaffold (`app/pr.tsx` is already created as a Stack modal in P4-01).

## Files

**Create:**
- `apps/mobile/src/features/pr/PRModal.tsx`
- `apps/mobile/src/features/pr/__tests__/PRModal.test.tsx`
- `apps/mobile/src/features/pr/__stories__/PRModal.stories.tsx`

**Modify:**
- `apps/mobile/src/app/pr.tsx` — render `<PRModal />` reading params from `useLocalSearchParams`.

## Component shape

```ts
type PRModalProps = {
  liftLabel: string;       // "Squat"
  priorE1RM: number;       // e.g. 360
  newE1RM: number;         // e.g. 380
  unit: 'lbs' | 'kg';
  onContinue: () => void;
};
```

Layout (centered, dark canvas):
1. Caps "New PR" (in hot).
2. Caps for `liftLabel`.
3. Big WeightNum for `newE1RM` (size 'lg', tone via wrapper).
4. Smaller text: "was <priorE1RM> <unit>".
5. `<PressButton variant="ember">Continue</PressButton>`.

Optionally fire a `Haptics.notificationAsync(NotificationFeedbackType.Success)` on mount (one-time).

## Tests

- Renders the new e1RM, lift label, and prior e1RM.
- Pressing "Continue" calls `onContinue`.
- Caps "New PR" present.

## Done_when

- Spec exists.
- Component + route wired.
- Tests pass.
