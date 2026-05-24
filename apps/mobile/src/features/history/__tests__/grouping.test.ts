import type { Session } from '@/data/accessors/session';
import { groupByCycle } from '../grouping';

function makeSession(id: number, cycle: number | null = 1): Session {
  return {
    id,
    lift: 'squat',
    cycle: cycle as number,
    week: 1,
    startedAt: id,
    endedAt: id + 1,
    status: 'completed',
    trainingMaxSnapshot: 100,
    storageUnitSnapshot: 'lbs',
    displayUnitSnapshot: 'lbs',
  };
}

describe('groupByCycle', () => {
  it('returns an empty array for no input', () => {
    expect(groupByCycle([])).toEqual([]);
  });

  it('preserves first-seen cycle order', () => {
    const sessions = [
      makeSession(1, 3),
      makeSession(2, 3),
      makeSession(3, 1),
      makeSession(4, 2),
      makeSession(5, 1),
    ];
    const grouped = groupByCycle(sessions);
    expect(grouped.map((g) => g.cycle)).toEqual([3, 1, 2]);
  });

  it('buckets all sessions of the same cycle into one group', () => {
    const sessions = [
      makeSession(1, 1),
      makeSession(2, 2),
      makeSession(3, 1),
      makeSession(4, 2),
      makeSession(5, 1),
    ];
    const grouped = groupByCycle(sessions);
    expect(grouped.find((g) => g.cycle === 1)?.sessions.map((s) => s.id)).toEqual([1, 3, 5]);
    expect(grouped.find((g) => g.cycle === 2)?.sessions.map((s) => s.id)).toEqual([2, 4]);
  });

  it('defaults a null/undefined cycle to bucket 1', () => {
    const sessions = [makeSession(1, null), makeSession(2, 1), makeSession(3, null)];
    const grouped = groupByCycle(sessions);
    expect(grouped).toHaveLength(1);
    expect(grouped[0]?.cycle).toBe(1);
    expect(grouped[0]?.sessions.map((s) => s.id)).toEqual([1, 2, 3]);
  });
});
