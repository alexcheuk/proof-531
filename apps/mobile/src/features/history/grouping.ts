import type { Session } from '@/data/accessors/session';

export type CycleGroup = {
  cycle: number;
  sessions: Session[];
};

/**
 * Group sessions by their `cycle` field, preserving first-seen order so the
 * caller's row ordering decides which cycle's group appears first.
 *
 * Sessions with a missing `cycle` are bucketed under cycle `1` — historical
 * data from pre-cycle migrations carries no cycle number; collapsing to 1
 * keeps the History list legible without a "cycle ?" bucket.
 *
 * Pure helper — kept out of the screen file so the grouping rule is
 * independently testable and reusable.
 */
export function groupByCycle(sessions: ReadonlyArray<Session>): CycleGroup[] {
  const order: number[] = [];
  const byCycle = new Map<number, Session[]>();
  for (const s of sessions) {
    const cycle = s.cycle ?? 1;
    const bucket = byCycle.get(cycle);
    if (bucket) {
      bucket.push(s);
    } else {
      byCycle.set(cycle, [s]);
      order.push(cycle);
    }
  }
  return order.map((cycle) => ({
    cycle,
    sessions: byCycle.get(cycle) ?? [],
  }));
}
