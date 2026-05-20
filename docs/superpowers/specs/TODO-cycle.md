# P8-cycle — Cycle screen (4-week grid + progress ring)

> Spec written by the orchestrator on user direction.
> Behavioral source: `design-reference/screens-progress.jsx:6-249` (CycleScreen + CycleCell + ProgressRing).

## Goal

4-week × N-lift grid showing the current 5/3/1 cycle. Each cell is a lift-on-a-week, colored by state (current/done/deload/future). A progress ring at the top shows cycle completion. Tapping a cell opens that session (out of scope — call `onSelectDay`).

## Behavioral reference

- `CycleScreen` (line 6) — top. Props `{ session, unit, history, onSelectDay }`. Renders header (ProgressRing + week-of-cycle text) + 4-week grid.
- `CycleCell` (line 177) — Props `{ week, lift, current, done, deload, tm, unit, onClick }`. Pressable square; shows lift initial + TM.
- `ProgressRing` (line 223) — Skia circular progress, used here for "X of 4 weeks done."

## Files

**Create:**
- `apps/mobile/src/features/cycle/CycleScreen.tsx`
- `apps/mobile/src/features/cycle/CycleCell.tsx`
- `apps/mobile/src/features/cycle/ProgressRing.tsx`
- `apps/mobile/src/features/cycle/__tests__/CycleScreen.test.tsx`
- `apps/mobile/src/features/cycle/__stories__/CycleScreen.stories.tsx`

**Modify:**
- `apps/mobile/src/app/(tabs)/cycle.tsx` — render `<CycleScreen />` with mock props for now.

## Component shape

```ts
type CycleScreenProps = {
  cycleNumber: number;             // 1, 2, ...
  weekOfCycle: 1 | 2 | 3 | 4;
  lifts: { id: string; label: string; trainingMax: number }[];   // enabled lifts only
  completedSessions: Array<{ week: 1 | 2 | 3 | 4; liftId: string }>;
  unit: 'lbs' | 'kg';
  onSelectDay?: (week: number, liftId: string) => void;
};

type CycleCellProps = {
  week: 1 | 2 | 3 | 4;
  liftId: string;
  liftLabel: string;
  trainingMax: number;
  unit: 'lbs' | 'kg';
  state: 'current' | 'done' | 'future' | 'deload';
  onPress?: () => void;
};

type ProgressRingProps = {
  /** 0..1. */ progress: number;
  size?: number;        // default 60
  stroke?: number;      // default 4
  color?: string;       // default colors.hot
  trackColor?: string;  // default colors.lineFaint
};
```

`ProgressRing` is a Skia `Canvas` with a `Path` arc — adapt the reference's SVG to Skia.

`CycleScreen` layout (top to bottom):
1. Header card: ProgressRing on the left, "Cycle 3 · Week 2 of 4" + small caption on the right.
2. Grid: 4 rows (one per week) × N columns (one per lift). Cell labels each show first letter of liftId and TM. Current week's row highlighted.

## Tests

- Renders 4 week-rows × N-lift cells = 4×lifts.length cells (use testID `cycle-cell-<week>-<liftId>`).
- Cells matching `completedSessions` get `state="done"`.
- Cells matching `weekOfCycle` get `state="current"`.
- Week 4 cells get `state="deload"`.
- ProgressRing renders (smoke).

## Done_when

- Spec exists.
- 3 components created.
- Grid + ring render; state mapping correct.
- Wired into `(tabs)/cycle.tsx`.
- Tests pass.
