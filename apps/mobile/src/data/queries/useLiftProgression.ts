/**
 * `useLiftProgression(lift)` — assembles the Progress screen's view model:
 * past rows (one per completed cycle, with the AMRAP-based actual e1RM and
 * tap-target session ids per day), the current row (the one anchored as
 * "you are here"), future rows (projected via the domain functions), and
 * the goal/cycles-to-go shape for the goal strip.
 *
 * The hook is a thin orchestration over four upstream queries (settings,
 * TMs, lift goal, completed-sessions-with-AMRAP) plus the pure projection
 * math in `domain/progression.ts`. Reshape logic lives here (not in the
 * domain layer) because it has to thread display-unit conversion and DB
 * shape juggling that doesn't belong in the pure layer.
 *
 * Cache key is prefixed with `'liftProgression'` so the session-complete
 * invalidation chain (see `useLiveScreenEffects`) can blow this surface
 * away with a single prefix invalidate. The goal-set mutation invalidates
 * the same prefix.
 */
import { useQuery } from '@tanstack/react-query';
import {
  bestE1RMForCycle,
  cyclesUntilGoal,
  projectFutureCycles,
  rollingAmrapMargin,
} from '../../domain/progression';
import type { Lift, Unit } from '../../domain/types';
import { convertWeight, displayWeight, round } from '../../domain/units';
import { useDb } from '../DbProvider';
import { getLiftGoal } from '../accessors/liftGoal';
import {
  type CompletedSessionWithAmrap,
  getCompletedSessionsWithAmrapForLift,
} from '../accessors/liftProgression';
import { getSettings } from '../accessors/settings';
import { getCurrentTrainingMaxes } from '../accessors/trainingMax';

export const LIFT_PROGRESSION_KEY = (lift: Lift) => ['liftProgression', lift] as const;

/**
 * One day cell inside a {@link ProgressionRow}. All weights are in display
 * units, rounded to the unit's plate step for render.
 */
export type ProgressionCellPast = {
  cycle: number;
  day: 1 | 2 | 3 | 4;
  /** `'last-done'` is the outlined "you are here" treatment. */
  kind: 'past' | 'last-done';
  sessionId: number;
  topWeight: number;
  topReps: number;
  /** True when this cell is the AMRAP top set. Deload sessions have no AMRAP. */
  amrap: boolean;
  /** True for the week-4 deload cell. */
  deload: boolean;
};

export type ProgressionCellFuture = {
  cycle: number;
  day: 1 | 2 | 3 | 4;
  kind: 'future';
  projectedWeight: number;
  /** True for the week-4 deload cell. */
  deload: boolean;
};

export type ProgressionCell = ProgressionCellPast | ProgressionCellFuture;

export type ProgressionRow = {
  cycle: number;
  cells: ProgressionCell[];
  /** Display-unit e1RM (rounded). */
  e1rm: number;
  e1rmKind: 'past' | 'projected';
  /** True on the first projected row whose e1rm ≥ goal (for ★ + dashed goal-rule). */
  crossesGoal?: true;
};

export type LiftProgression = {
  lift: Lift;
  /** Current TM in display units, rounded for render. */
  tm: number;
  /** Current actual e1RM in display units (max across the current cycle's AMRAPs), or 0. */
  currentE1RM: number;
  currentCycle: number;
  /** Display unit at view-time. */
  unit: Unit;
  /** Past cycles (every fully-completed cycle), oldest first. */
  pastRows: ProgressionRow[];
  /** Future cycles (currentCycle+1 .. currentCycle+6). */
  futureRows: ProgressionRow[];
  /** Goal in display units, or null when no goal is set. */
  goal: { value: number; unit: Unit } | null;
  /** Number of future cycles until projection crosses goal, or null. */
  cyclesUntilGoal: number | null;
};

const FUTURE_COUNT = 6;

export function useLiftProgression(lift: Lift) {
  const db = useDb();
  return useQuery({
    queryKey: LIFT_PROGRESSION_KEY(lift),
    queryFn: async (): Promise<LiftProgression> => {
      const [settings, tms, goalRow, sessions] = await Promise.all([
        getSettings(db),
        getCurrentTrainingMaxes(db),
        getLiftGoal(db, lift),
        getCompletedSessionsWithAmrapForLift(db, lift),
      ]);
      const displayU = settings.displayUnit ?? settings.storageUnit;
      const tmRow = tms.find((t) => t.lift === lift);
      const currentTmStorage = tmRow?.value ?? 0;
      const currentTmStorageUnit = tmRow?.unit ?? settings.storageUnit;
      const tmDisplay = displayWeight(currentTmStorage, currentTmStorageUnit, displayU);
      const currentCycle = settings.currentCycle;

      // Group sessions by cycle. Each cycle gets one row of up-to-4 day cells.
      const byCycle = groupByCycle(sessions);

      // PAST rows: cycles strictly less than current. Each row's e1rm = max
      // bestE1RMForCycle across all the cycle's amrap rows (display unit).
      const pastCycles = Array.from(byCycle.keys())
        .filter((c) => c < currentCycle)
        .sort((a, b) => a - b);
      const currentRowSessions = byCycle.get(currentCycle) ?? [];

      // Future-projection inputs.
      const completedAmrapPerCycle: Array<{
        amrapPrescribedReps: number;
        amrapActualReps: number;
      }> = [];
      for (const c of pastCycles) {
        const sessionsForCycle = byCycle.get(c) ?? [];
        // Pick the heaviest-e1RM amrap in the cycle for the rolling-margin sample.
        let best: { prescribedReps: number; actualReps: number; e1rm: number } | null = null;
        for (const s of sessionsForCycle) {
          if (!s.amrap) continue;
          const e1 = s.amrap.estimated1RM ?? 0;
          if (!best || e1 > best.e1rm) {
            best = {
              prescribedReps: s.amrap.prescribedReps,
              actualReps: s.amrap.actualReps,
              e1rm: e1,
            };
          }
        }
        if (best) {
          completedAmrapPerCycle.push({
            amrapPrescribedReps: best.prescribedReps,
            amrapActualReps: best.actualReps,
          });
        }
      }
      const margin = rollingAmrapMargin(completedAmrapPerCycle, 3);

      // Identify the "you are here" session — the most recently completed
      // session row for this lift (greatest startedAt). Per the spec this
      // outlined treatment is the **single** last-completed cell across
      // all rows, so we mark exactly one cell.
      const mostRecentSessionId = sessions[0]?.sessionId ?? null;

      const pastRows: ProgressionRow[] = pastCycles.map((cycle) => {
        const cycleSessions = byCycle.get(cycle) ?? [];
        const cells = buildPastCells(
          cycle,
          cycleSessions,
          mostRecentSessionId,
          currentTmStorageUnit,
          displayU,
        );
        // e1rm = best across this cycle's amrap rows, in DISPLAY units.
        const rows = cycleSessions
          .filter((s) => s.amrap)
          .map((s) => {
            // amrap weight is stored in the session's storage snapshot unit.
            const storageU = s.storageUnitSnapshot ?? currentTmStorageUnit;
            const wDisplay = convertWeight(
              // biome-ignore lint/style/noNonNullAssertion: filter above
              s.amrap!.prescribedWeight,
              storageU,
              displayU,
            );
            return {
              prescribedWeight: wDisplay,
              // biome-ignore lint/style/noNonNullAssertion: filter above
              actualReps: s.amrap!.actualReps,
              kind: 'amrap' as const,
            };
          });
        const e1rm = Math.round(bestE1RMForCycle(rows));
        return {
          cycle,
          cells,
          e1rm,
          e1rmKind: 'past',
        };
      });

      // CURRENT row: a row at currentCycle whose cells mix past (if any
      // sessions logged in this cycle) and future (projected for days not
      // yet logged). We render this as part of the future tail so the
      // grid is one continuous scroll list; mark days that have a session
      // as past, the rest as future projection from currentTm itself.
      const currentRowCells = buildCurrentRowCells(
        currentCycle,
        currentRowSessions,
        mostRecentSessionId,
        currentTmStorage,
        currentTmStorageUnit,
        displayU,
        lift,
      );
      // Current e1RM = best across the current cycle's amrap rows.
      const currentE1rmRows = currentRowSessions
        .filter((s) => s.amrap)
        .map((s) => {
          const storageU = s.storageUnitSnapshot ?? currentTmStorageUnit;
          const wDisplay = convertWeight(
            // biome-ignore lint/style/noNonNullAssertion: filter above
            s.amrap!.prescribedWeight,
            storageU,
            displayU,
          );
          return {
            prescribedWeight: wDisplay,
            // biome-ignore lint/style/noNonNullAssertion: filter above
            actualReps: s.amrap!.actualReps,
            kind: 'amrap' as const,
          };
        });
      const currentE1RM = Math.round(bestE1RMForCycle(currentE1rmRows));

      // FUTURE rows: projected from currentTm forward. Convert all weights
      // through displayWeight at construction time so the render boundary
      // just consumes display numbers.
      const futureRaw = projectFutureCycles(
        FUTURE_COUNT,
        // Project in display units so the snap matches the displayed step.
        tmDisplay,
        currentCycle,
        margin,
        lift,
        displayU,
      );
      const futureRowsList: ProgressionRow[] = futureRaw.map((r) => {
        const cells: ProgressionCellFuture[] = r.days.map((d) => ({
          cycle: r.cycle,
          day: d.day,
          kind: 'future',
          projectedWeight: d.weight,
          deload: d.day === 4,
        }));
        return {
          cycle: r.cycle,
          cells,
          e1rm: Math.round(r.e1rm),
          e1rmKind: 'projected',
        };
      });

      // Prepend the current row (cycle === currentCycle).
      const allFutureRows: ProgressionRow[] = [
        {
          cycle: currentCycle,
          cells: currentRowCells,
          e1rm:
            currentE1RM > 0
              ? currentE1RM
              : // No completed AMRAP yet this cycle; project from current TM.
                Math.round(
                  projectFutureCycles(1, tmDisplay, currentCycle - 1, margin, lift, displayU)[0]
                    ?.e1rm ?? 0,
                ),
          e1rmKind: currentE1RM > 0 ? 'past' : 'projected',
        },
        ...futureRowsList,
      ];

      // Goal computation (display units).
      const goalDisplay = goalRow
        ? {
            value: displayWeight(goalRow.targetE1RM, goalRow.unit, displayU),
            unit: displayU,
          }
        : null;

      const k = cyclesUntilGoal(
        goalDisplay?.value ?? null,
        currentE1RM,
        tmDisplay,
        currentCycle,
        margin,
        lift,
        displayU,
      );

      // Mark the first future row whose e1rm crosses the goal as
      // crossesGoal=true.
      if (goalDisplay) {
        for (const row of allFutureRows) {
          if (row.cycle <= currentCycle) continue;
          if (row.e1rm >= goalDisplay.value) {
            row.crossesGoal = true;
            break;
          }
        }
      }

      return {
        lift,
        tm: round(tmDisplay, displayU),
        currentE1RM,
        currentCycle,
        unit: displayU,
        pastRows,
        futureRows: allFutureRows,
        goal: goalDisplay,
        cyclesUntilGoal: k,
      };
    },
  });
}

/** Group sessions by their `cycle` field. */
function groupByCycle(
  sessions: CompletedSessionWithAmrap[],
): Map<number, CompletedSessionWithAmrap[]> {
  const m = new Map<number, CompletedSessionWithAmrap[]>();
  for (const s of sessions) {
    const list = m.get(s.cycle);
    if (list) list.push(s);
    else m.set(s.cycle, [s]);
  }
  return m;
}

/**
 * Map a session's `week` (1..4) to its `day` in the progression grid.
 * 5/3/1 trains one lift per week, so within a cycle a lift has at most
 * 4 sessions: week 1 → D1 (5×5+), week 2 → D2 (3×3+), week 3 → D3
 * (5/3/1+), week 4 → Deload. The Progress grid uses day columns to
 * match this: D1 = week 1, D2 = week 2, D3 = week 3, Deload = week 4.
 */
function weekToDay(week: number): 1 | 2 | 3 | 4 {
  if (week === 1) return 1;
  if (week === 2) return 2;
  if (week === 3) return 3;
  return 4;
}

function buildPastCells(
  cycle: number,
  cycleSessions: CompletedSessionWithAmrap[],
  mostRecentSessionId: number | null,
  currentTmStorageUnit: Unit,
  displayU: Unit,
): ProgressionCell[] {
  const byDay = new Map<1 | 2 | 3 | 4, CompletedSessionWithAmrap>();
  for (const s of cycleSessions) {
    byDay.set(weekToDay(s.week), s);
  }
  const cells: ProgressionCell[] = [];
  for (const day of [1, 2, 3, 4] as const) {
    const s = byDay.get(day);
    if (s) {
      // Map session to PAST cell. Use AMRAP if present; otherwise fall
      // back to the prescribed top set (week-1/2 day-cells of the cycle
      // still show the *top set* — the third 'working' set's prescribed
      // weight, which equals the AMRAP's prescribed weight). Since we
      // only joined AMRAP rows, a session without amrap (deload) gets
      // weight from the TM snapshot × week-4 60% (mirrors the projection
      // path).
      const storageU = s.storageUnitSnapshot ?? currentTmStorageUnit;
      const weight =
        s.amrap !== null
          ? convertWeight(s.amrap.prescribedWeight, storageU, displayU)
          : // Deload (week 4): TM × 0.60 in display units.
            round(convertWeight(s.trainingMaxSnapshot * 0.6, storageU, displayU), displayU);
      const reps = s.amrap ? s.amrap.actualReps : 5; // deload reps placeholder; cell renders ✓
      cells.push({
        cycle,
        day,
        kind: s.sessionId === mostRecentSessionId ? 'last-done' : 'past',
        sessionId: s.sessionId,
        topWeight: round(weight, displayU),
        topReps: reps,
        amrap: !!s.amrap,
        deload: day === 4,
      } satisfies ProgressionCellPast);
    } else {
      // Past cycle, missing day — render as ghosted future-style cell
      // anchored to the TM at this cycle. The user finished the cycle
      // (it's < currentCycle) but didn't log this day; we can't fabricate
      // a session id, so the cell is non-interactive.
      cells.push({
        cycle,
        day,
        kind: 'future',
        projectedWeight: 0,
        deload: day === 4,
      } satisfies ProgressionCellFuture);
    }
  }
  return cells;
}

function buildCurrentRowCells(
  cycle: number,
  cycleSessions: CompletedSessionWithAmrap[],
  mostRecentSessionId: number | null,
  currentTmStorage: number,
  currentTmStorageUnit: Unit,
  displayU: Unit,
  lift: Lift,
): ProgressionCell[] {
  const byDay = new Map<1 | 2 | 3 | 4, CompletedSessionWithAmrap>();
  for (const s of cycleSessions) {
    byDay.set(weekToDay(s.week), s);
  }
  const cells: ProgressionCell[] = [];
  for (const day of [1, 2, 3, 4] as const) {
    const s = byDay.get(day);
    if (s) {
      const storageU = s.storageUnitSnapshot ?? currentTmStorageUnit;
      const weight =
        s.amrap !== null
          ? convertWeight(s.amrap.prescribedWeight, storageU, displayU)
          : round(convertWeight(s.trainingMaxSnapshot * 0.6, storageU, displayU), displayU);
      const reps = s.amrap ? s.amrap.actualReps : 5;
      cells.push({
        cycle,
        day,
        kind: s.sessionId === mostRecentSessionId ? 'last-done' : 'past',
        sessionId: s.sessionId,
        topWeight: round(weight, displayU),
        topReps: reps,
        amrap: !!s.amrap,
        deload: day === 4,
      } satisfies ProgressionCellPast);
    } else {
      // Project the missing day from the current TM (display units).
      // Reuse the same projection function the future rows use so the
      // numbers match exactly (no drift from a parallel formula).
      const tmDisplay = displayWeight(currentTmStorage, currentTmStorageUnit, displayU);
      // projectTopSetWeight in domain expects future cycles; pass cycle as
      // the "future" and currentCycle = cycle so delta = 0 → no TM bump.
      const futureRows = projectFutureCycles(1, tmDisplay, cycle - 1, 0, lift, displayU);
      const projected = futureRows[0]?.days.find((d) => d.day === day)?.weight ?? 0;
      cells.push({
        cycle,
        day,
        kind: 'future',
        projectedWeight: projected,
        deload: day === 4,
      } satisfies ProgressionCellFuture);
    }
  }
  return cells;
}
