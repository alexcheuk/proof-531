# P8-today-editorial — Today screen, editorial hero variant

> Spec written by the orchestrator on user direction.
> Behavioral source: `design-reference/screens-main.jsx:84-208` (TodayEditorial + TodayHeader 42-82).

## Goal

The "editorial" hero variant of the Today screen — wide, magazine-style title with the lift name + week scheme, prescribed sets listed as a clean stack, AMRAP set highlighted, plate-viz embedded for the top working set.

This is one of three Today variants. The plate-viz variant is configurable (Barbell / Chips / Numerical) via a `plateVariant` prop — keep that flexibility.

## Behavioral reference

- `TodayHeader` (line 42) — `{ session, onOpenWatch, dark }`. Renders top-of-screen header with cycle/week info + watch icon button.
- `TodayEditorial` (line 84) — `{ session, unit, plateVariant, onStartSet, onOpenWatch }`. Body content for the editorial layout.
- Helpers used:
  - `setsForWeek(week)` (line ~10) — returns the 5/3/1 percentages + reps; equivalent to our `prescribedSets()` in `src/domain/program/`.
  - `snapWeight(w, unit)` — rounds. Use `roundToNearest` semantics from `src/domain/plates/` or domain/program/ helpers.
  - `WEEK_LABEL` (line ~14) — `{ 1: '5 / 5 / 5+', 2: '3 / 3 / 3+', 3: '5 / 3 / 1+', 4: 'deload' }`.

## Files

**Create:**
- `apps/mobile/src/features/today/TodayHeader.tsx`
- `apps/mobile/src/features/today/TodayEditorial.tsx`
- `apps/mobile/src/features/today/today-types.ts` — `TodaySession`, `PlateVariant` shared types.
- `apps/mobile/src/features/today/__tests__/TodayEditorial.test.tsx`
- `apps/mobile/src/features/today/__stories__/TodayEditorial.stories.tsx`

## Component shape

```ts
export type TodaySession = {
  cycleNumber: number;
  liftId: string;
  liftLabel: string;
  trainingMax: number;
  week: 1 | 2 | 3 | 4;
  unit: 'lbs' | 'kg';
};

export type PlateVariant = 'barbell' | 'chips' | 'numerical';

type TodayHeaderProps = {
  session: TodaySession;
  onOpenWatch?: () => void;
};

type TodayEditorialProps = {
  session: TodaySession;
  plateVariant?: PlateVariant;   // default 'barbell'
  onStartSet?: (index: number) => void;
  onOpenWatch?: () => void;
};
```

Compute sets via `prescribedSets(session.trainingMax, session.week)` from `src/domain/program/`. AMRAP set is the last; highlight it (e.g. hot border, larger WeightNum).

Plate viz embed: switch on `plateVariant` and render the appropriate component from `src/design/plates/` for the top working set's weight.

`WEEK_LABEL` lives in this module as a `const` map.

## Tests

- Renders TodayHeader with cycle/week info ("Cycle 3 · Week 2").
- Renders 3 prescribed-set rows for a week-1 session.
- AMRAP row has a distinguishing testID `set-amrap`.
- Plate viz embed renders (smoke; mock skia in test).
- Pressing a set calls `onStartSet(index)`.

## Done_when

- Spec exists.
- Components created.
- Tests pass; pnpm test green.
