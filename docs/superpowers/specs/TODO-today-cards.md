# P8-today-cards — Today screen, set-cards variant

> Spec written by the orchestrator on user direction.
> Behavioral source: `design-reference/screens-main.jsx:210-377` (TodayCards + SetCard 296).

## Goal

Card-stack layout for the Today screen. Each prescribed set is its own `Card` with weight/reps/AMRAP/% on the front and a small embedded plate viz. The next-up card is visually elevated (active state).

Depends on `TodaySession` + `PlateVariant` types defined in `TODO-today-editorial.md` (P8-today-editorial). If that task hasn't landed, create `today-types.ts` here; the other today task will reuse it.

## Behavioral reference

- `TodayCards` (line 210) — `{ session, unit, plateVariant, onStartSet, onOpenWatch }`. Lays out N SetCard components vertically.
- `SetCard` (line 296) — `{ index, weight, reps, amrap, pct, unit, done, next, plateVariant, onClick }`.

## Files

**Create:**
- `apps/mobile/src/features/today/TodayCards.tsx`
- `apps/mobile/src/features/today/SetCard.tsx`
- `apps/mobile/src/features/today/__tests__/TodayCards.test.tsx`
- `apps/mobile/src/features/today/__stories__/TodayCards.stories.tsx`

(`TodayHeader.tsx` and `today-types.ts` come from P8-today-editorial; if those don't exist when this task runs, create them here per that spec.)

## Component shape

```ts
type TodayCardsProps = {
  session: TodaySession;
  plateVariant?: PlateVariant;
  onStartSet?: (index: number) => void;
  onOpenWatch?: () => void;
};

type SetCardProps = {
  index: number;
  weight: number;
  reps: number;
  amrap: boolean;
  pct: number;                   // 0.65, 0.75, etc.
  unit: 'lbs' | 'kg';
  done?: boolean;
  next?: boolean;                // the active/next-to-do card
  plateVariant?: PlateVariant;
  onPress?: () => void;
};
```

`SetCard` styling:
- Default: `bg1` background, `line` border (Card default).
- `done=true`: dim (opacity 0.6), checkmark overlay (use Icon name="check").
- `next=true`: hot border + slightly elevated.

Plate viz is embedded small (width ~120) in the right-hand of each card.

## Tests

- Renders 3 SetCards for a week-1 session.
- The next-undone card has testID `set-card-next`.
- Done cards have testID prefix `set-card-done-*` and reduced opacity in style.
- Pressing the next card calls `onStartSet(index)`.

## Done_when

- Spec exists.
- TodayCards + SetCard created.
- Tests pass.
