import type { Session } from '@/data/accessors/session';

export type CycleGroup = {
  cycle: number;
  sessions: Session[];
};

// Missing `cycle` bucketed under 1  -  historical data from pre-cycle migrations has no cycle number.
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
