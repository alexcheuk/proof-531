import { useQuery } from '@tanstack/react-query';
import {
  cyclesUntilTmGoal,
  goalTargetTm,
  projectCycleRows,
  projectTopSetWeight,
} from '../../domain/progression';
import type { Lift, Unit } from '../../domain/types';
import { convertWeight, displayWeight, round } from '../../domain/units';
import { useDb } from '../DbProvider';
import { type LiftGoalKind, getLiftGoal } from '../accessors/liftGoal';
import { getLiftProgress } from '../accessors/liftProgress';
import {
  type CompletedSessionWithAmrap,
  getCompletedSessionsWithAmrapForLift,
} from '../accessors/liftProgression';
import { getSettings } from '../accessors/settings';
import { getCurrentTrainingMaxes } from '../accessors/trainingMax';

const LIFT_PROGRESSION_KEY = (lift: Lift) => ['liftProgression', lift] as const;

type ProgressionCellPast = {
  cycle: number;
  day: 1 | 2 | 3 | 4;
  kind: 'past' | 'last-done';
  sessionId: number;
  topWeight: number;
  topReps: number;
  amrap: boolean;
  /**
   * Set-kind of the top-set row this cell summarises, when one is present.
   *   - `'amrap'`   — weeks 1–3 AMRAP top set.
   *   - `'tm-test'` — week-4 TM Test set (post-migration).
   *   - `null`      — no top set logged. Legacy week-4 `'working'` deload
   *                    sessions land here; the cell renders the existing
   *                    deload `✓` glyph rather than a TM-test band marker.
   */
  topSetKind: 'amrap' | 'tm-test' | null;
  deload: boolean;
};

type ProgressionCellNow = {
  cycle: number;
  day: 1 | 2 | 3 | 4;
  kind: 'now';
  prescribedWeight: number;
  deload: boolean;
};

type ProgressionCellFuture = {
  cycle: number;
  day: 1 | 2 | 3 | 4;
  kind: 'future';
  projectedWeight: number;
  deload: boolean;
};

type ProgressionCell = ProgressionCellPast | ProgressionCellNow | ProgressionCellFuture;

type ProgressionRow = {
  cycle: number;
  isPast: boolean;
  isCurrent: boolean;
  isFuture: boolean;
  cells: ProgressionCell[];
  tm: number;
  crossesGoal?: true;
};

export type LiftProgression = {
  lift: Lift;
  unit: Unit;
  tm: number;
  currentCycle: number;
  currentWeek: 1 | 2 | 3 | 4;
  rows: ProgressionRow[];
  goal: {
    kind: LiftGoalKind;
    value: number;
    unit: Unit;
    targetTm: number;
  } | null;
  cyclesUntilGoal: number | null;
};

const FUTURE_COUNT = 6;

export function useLiftProgression(lift: Lift) {
  const db = useDb();
  return useQuery({
    queryKey: LIFT_PROGRESSION_KEY(lift),
    queryFn: async (): Promise<LiftProgression> => {
      const [settings, tms, goalRow, sessions, progress] = await Promise.all([
        getSettings(db),
        getCurrentTrainingMaxes(db),
        getLiftGoal(db, lift),
        getCompletedSessionsWithAmrapForLift(db, lift),
        getLiftProgress(db, lift),
      ]);
      const displayU = settings.displayUnit ?? settings.storageUnit;
      const tmRow = tms.find((t) => t.lift === lift);
      const currentTmStorage = tmRow?.value ?? 0;
      const currentTmStorageUnit = tmRow?.unit ?? settings.storageUnit;
      const tmDisplay = round(
        displayWeight(currentTmStorage, currentTmStorageUnit, displayU),
        displayU,
      );
      // Per-lift split: cycle/week come from `lift_progress[lift]`, not
      // from the global `settings` row (those columns are legacy and only
      // used to seed new lift_progress rows on first read).
      const currentCycle = progress.currentCycle;
      const currentWeek = clampWeek(progress.week);

      // Resolve goal → targetTm (display units) up front so it can drive
      // the chart's end cycle. Without this the chart would clip the goal
      // marker when the user's target is more than FUTURE_COUNT cycles out.
      const goal = goalRow
        ? (() => {
            const valueDisplay = round(
              displayWeight(goalRow.targetValue, goalRow.unit, displayU),
              displayU,
            );
            const targetTm = round(goalTargetTm(goalRow.kind, valueDisplay, displayU), displayU);
            return { kind: goalRow.kind, value: valueDisplay, unit: displayU, targetTm };
          })()
        : null;

      const cyclesUntilGoal = cyclesUntilTmGoal(
        goal?.targetTm ?? null,
        tmDisplay,
        currentCycle,
        lift,
        displayU,
      );

      const startCycle = 1;
      // Always show at least FUTURE_COUNT cycles forward; extend further
      // when the goal is past that horizon so the user can see exactly
      // which cycle their target lands on.
      const futureSpan = Math.max(FUTURE_COUNT, cyclesUntilGoal ?? 0);
      const endCycle = currentCycle + futureSpan;

      // Map sessions by cycle then day.
      const byCycleDay = new Map<number, Map<1 | 2 | 3 | 4, CompletedSessionWithAmrap>>();
      for (const s of sessions) {
        const day = weekToDay(s.week);
        const day2session = byCycleDay.get(s.cycle) ?? new Map();
        day2session.set(day, s);
        byCycleDay.set(s.cycle, day2session);
      }

      // Most-recent completed session for the outlined "you are here" cell.
      const mostRecentSessionId = sessions[0]?.sessionId ?? null;

      // Skeleton: cycle range with projected TM and day weights (used for
      // 'now' / 'future' cells; past cells overlay with real data).
      const skeleton = projectCycleRows(
        startCycle,
        endCycle,
        tmDisplay,
        currentCycle,
        lift,
        displayU,
      );

      const rows: ProgressionRow[] = skeleton.map((s) => {
        const day2session = byCycleDay.get(s.cycle);
        const cells: ProgressionCell[] = ([1, 2, 3, 4] as const).map((day) => {
          const sess = day2session?.get(day);
          const isPastCycle = s.cycle < currentCycle;
          const isCurrentCycle = s.cycle === currentCycle;
          const isPastInCurrent = isCurrentCycle && day < currentWeek;
          const isNow = isCurrentCycle && day === currentWeek;

          if (sess) {
            return makePastCell(
              s.cycle,
              day,
              sess,
              mostRecentSessionId,
              currentTmStorageUnit,
              displayU,
            );
          }
          if (isPastCycle || isPastInCurrent) {
            // No session logged for a past/current-past slot — render as ghosted
            // future-style cell anchored to the projected weight for that day.
            const projected = projectTopSetWeight(
              s.cycle,
              day,
              tmDisplay,
              currentCycle,
              lift,
              displayU,
            );
            return {
              cycle: s.cycle,
              day,
              kind: 'future',
              projectedWeight: projected,
              deload: day === 4,
            } satisfies ProgressionCellFuture;
          }
          if (isNow) {
            return {
              cycle: s.cycle,
              day,
              kind: 'now',
              prescribedWeight: projectTopSetWeight(
                s.cycle,
                day,
                tmDisplay,
                currentCycle,
                lift,
                displayU,
              ),
              deload: day === 4,
            } satisfies ProgressionCellNow;
          }
          // Pure future.
          return {
            cycle: s.cycle,
            day,
            kind: 'future',
            projectedWeight: projectTopSetWeight(
              s.cycle,
              day,
              tmDisplay,
              currentCycle,
              lift,
              displayU,
            ),
            deload: day === 4,
          } satisfies ProgressionCellFuture;
        });
        return {
          cycle: s.cycle,
          isPast: s.cycle < currentCycle,
          isCurrent: s.cycle === currentCycle,
          isFuture: s.cycle > currentCycle,
          cells,
          tm: round(s.tm, displayU),
        };
      });

      // Mark crossesGoal on the first row (with cycle > currentCycle) whose
      // tm reaches the target. The current cycle is excluded — we treat the
      // goal as a forward-looking target.
      if (goal) {
        for (const row of rows) {
          if (row.cycle <= currentCycle) continue;
          if (row.tm >= goal.targetTm) {
            row.crossesGoal = true;
            break;
          }
        }
      }

      return {
        lift,
        unit: displayU,
        tm: tmDisplay,
        currentCycle,
        currentWeek,
        rows,
        goal,
        cyclesUntilGoal,
      };
    },
  });
}

function clampWeek(w: number): 1 | 2 | 3 | 4 {
  if (w <= 1) return 1;
  if (w === 2) return 2;
  if (w === 3) return 3;
  return 4;
}

function weekToDay(week: number): 1 | 2 | 3 | 4 {
  if (week === 1) return 1;
  if (week === 2) return 2;
  if (week === 3) return 3;
  return 4;
}

function makePastCell(
  cycle: number,
  day: 1 | 2 | 3 | 4,
  s: CompletedSessionWithAmrap,
  mostRecentSessionId: number | null,
  currentTmStorageUnit: Unit,
  displayU: Unit,
): ProgressionCellPast {
  const storageU = s.storageUnitSnapshot ?? currentTmStorageUnit;
  // Top-set weight resolution:
  //   - AMRAP / TM-test rows → use the row's prescribed weight (already
  //     plate-snapped at log time).
  //   - Legacy week-4 'working' deload sessions → fall back to the historical
  //     0.6×TM display (preserves the pre-migration visual; no retroactive
  //     re-labelling).
  const isLegacyDeload = day === 4 && s.amrap === null;
  const weight =
    s.amrap !== null
      ? convertWeight(s.amrap.prescribedWeight, storageU, displayU)
      : isLegacyDeload
        ? round(convertWeight(s.trainingMaxSnapshot * 0.6, storageU, displayU), displayU)
        : 0;
  const reps = s.amrap ? s.amrap.actualReps : 5;
  // `amrap: true` historically meant "AMRAP top set" specifically. The
  // Progress grid uses it to drive `× N` reps under the weight (vs. a deload
  // ✓ marker). TM-test cells render through a band marker (↑/=/↓) instead of
  // `× N`, so they intentionally pass `amrap: false` here even though
  // `topSetKind === 'tm-test'`.
  const isAmrap = s.amrap?.kind === 'amrap';
  return {
    cycle,
    day,
    kind: s.sessionId === mostRecentSessionId ? 'last-done' : 'past',
    sessionId: s.sessionId,
    topWeight: round(weight, displayU),
    topReps: reps,
    amrap: isAmrap,
    topSetKind: s.amrap?.kind ?? null,
    deload: day === 4,
  };
}
