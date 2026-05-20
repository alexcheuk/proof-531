# P8-history — History screen (filterable session log)

> Spec written by the orchestrator on user direction.
> Behavioral source: `design-reference/screens-progress.jsx:251-401` (HistoryScreen + HistorySessionRow).

## Goal

Reverse-chronological list of completed sessions. Filterable by lift via a SegRail. Each row shows date, lift, week, top set, e1RM, and a small PR badge if that session set a PR.

## Behavioral reference

- `HistoryScreen` (line 251) — Props `{ history, unit, enabledLifts }`. Renders title, lift-filter SegRail, then scrollable rows.
- `HistorySessionRow` (line 340) — Per-session row.

## Files

**Create:**
- `apps/mobile/src/features/history/HistoryScreen.tsx`
- `apps/mobile/src/features/history/HistorySessionRow.tsx`
- `apps/mobile/src/features/history/__tests__/HistoryScreen.test.tsx`
- `apps/mobile/src/features/history/__stories__/HistoryScreen.stories.tsx`

**Modify:**
- `apps/mobile/src/app/(tabs)/history.tsx` — render `<HistoryScreen />` with mock-or-data-wired props.

## Component shape

```ts
type HistorySession = {
  id: number;
  completedAt: Date;
  liftId: string;
  liftLabel: string;
  week: 1 | 2 | 3 | 4;
  cycleNumber: number;
  topWeight: number;
  topReps: number;       // actualReps on AMRAP set; if !amrap, just prescribedReps
  amrap: boolean;
  e1rm: number;
  isPR: boolean;
};

type HistoryScreenProps = {
  history: HistorySession[];          // pre-sorted desc by completedAt
  unit: 'lbs' | 'kg';
  enabledLifts: { id: string; label: string }[];
};
```

State: a local `filterLift: string | 'all'`. Filter the list before rendering.

`HistorySessionRow` renders inside a `Card` (interactive=false):
- Top line: date (e.g. "May 14, 2026") + Caps for lift + week pill.
- Middle line: WeightNum (topWeight) + "× <reps>" (with "+" suffix when amrap).
- Right: e1RM (Caps) + optional `<Caps tone="hot">PR</Caps>` badge.

## Tests

- Renders title "History".
- Renders one row per session.
- SegRail filter present with options [All, ...enabledLifts.labels].
- Pressing a lift in the filter calls setState — verify by re-render assertion that filtered rows are reduced. (Use a small history fixture: 3 sessions, 2 lifts.)
- PR badge renders only on rows with `isPR === true`.

## Done_when

- Spec exists.
- 2 components created.
- Filter SegRail works.
- Wired into `(tabs)/history.tsx`.
- Tests pass.
