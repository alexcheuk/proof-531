import { useLiftProgression } from '@/data/queries/useLiftProgression';
import type { Lift, Week } from '@/domain/types';
import { useMemo } from 'react';

/**
 * Resolves the `sessionId` of a COMPLETED past day of a given (cycle, week)
 * for a lift, by reading the already-cached `useLiftProgression` query. Used
 * by Home's `CycleStrip` to decide whether tapping `Dn` should pass a session
 * id (mini-receipt) or `null` (prescription only) to the DayPreviewSheet.
 *
 * Returns `null` when:
 *   - the progression query has not resolved yet, or
 *   - no completed session exists for that (cycle, day) — i.e. the day is the
 *     current day, a future day, or a skipped/uncompleted past day.
 *
 * Pure selector over an existing query — no new accessor, no new persistence.
 * `week` and `day` are 1:1 in this app (Week === day index), so the cell's
 * `day` is compared directly against `week`.
 */
export function useCycleDaySessionId(lift: Lift, cycle: number, week: Week): number | null {
  const { data } = useLiftProgression(lift);
  return useMemo<number | null>(() => {
    if (!data) return null;
    const row = data.rows.find((r) => r.cycle === cycle);
    if (!row) return null;
    for (const cell of row.cells) {
      if (cell.day !== week) continue;
      if (cell.kind === 'past' || cell.kind === 'last-done') return cell.sessionId;
      return null;
    }
    return null;
  }, [data, cycle, week]);
}
