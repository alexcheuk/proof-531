# P8-today-data — Today screen, data-dense variant

> Spec written by the orchestrator on user direction.
> Behavioral source: `design-reference/screens-main.jsx:379-602` (TodayData + DataStat 532 + SetRow 554 + AssistanceRow 604).

## Goal

The most information-dense Today variant. A compact stats strip up top (cycle, week, last-AMRAP performance, e1RM), then a single tabular list of sets, then a small assistance block (BBB sets + accessory rows).

The "wiring" framing in the original task name is misleading — this is the third visual variant of Today, not a data-layer task.

## Behavioral reference

- `TodayData` (line 379) — `{ session, unit, plateVariant, onStartSet, onOpenWatch }`. Top-level for this variant.
- `DataStat` (line 532) — `{ label, value, sub, mono }`. Tiny stat tile.
- `SetRow` (line 554) — `{ index, weight, reps, amrap, pct, unit, done, next, onClick }`. Single tabular row.
- `AssistanceRow` (line 604) — `{ item, compact }`. Accessory row.
- `bbbSets(pct = 0.5)` (line ~27) — derives BBB 5x10 sets at given percent.
- `ASSISTANCE_COLOR` (line 599) — push/pull/legs/core → token color.

## Files

**Create:**
- `apps/mobile/src/features/today/TodayData.tsx`
- `apps/mobile/src/features/today/SetRow.tsx`
- `apps/mobile/src/features/today/DataStat.tsx`
- `apps/mobile/src/features/today/AssistanceRow.tsx`
- `apps/mobile/src/features/today/__tests__/TodayData.test.tsx`
- `apps/mobile/src/features/today/__stories__/TodayData.stories.tsx`

(Re-uses TodayHeader + today-types from P8-today-editorial.)

## Component shape

```ts
type DataStatProps = { label: string; value: string | number; sub?: string; mono?: boolean };

type SetRowProps = {
  index: number;
  weight: number;
  reps: number;
  amrap: boolean;
  pct: number;
  unit: 'lbs' | 'kg';
  done?: boolean;
  next?: boolean;
  onPress?: () => void;
};

type AssistanceRowProps = {
  item: {
    name: string;
    category: 'push' | 'pull' | 'legs' | 'core';
    sets: number;
    reps: number | string;
  };
  compact?: boolean;
};

type TodayDataProps = {
  session: TodaySession;
  plateVariant?: PlateVariant;     // not heavily used here; small embed on next-set row only
  onStartSet?: (index: number) => void;
  onOpenWatch?: () => void;
};
```

`TodayData` layout:
1. TodayHeader at top.
2. Stats strip: 4 DataStat tiles (Cycle, Week, Top set lbs, e1RM).
3. "Main sets" Caps + SetRow list.
4. "BBB" Caps + collapsed BBB row (or 5 rows of `bbbSets()`).
5. "Assistance" Caps + 2-3 AssistanceRow examples.

## Tests

- Renders 4 DataStat tiles.
- Renders 3 main-set SetRows for a week-1 session.
- Renders an Assistance section with at least one row.
- Pressing the next SetRow calls `onStartSet(index)`.

## Done_when

- Spec exists.
- 4 components created.
- Tests pass.
