import type { Session } from '@/data/accessors/session';
import type { Lift } from '@/domain/types';
import { applyHistoryFilter, historyFilterKey } from '../filter';

function session(id: number, lift: Lift): Session {
  return {
    id,
    lift,
    cycle: 1,
    week: 1,
    startedAt: id,
    endedAt: id + 1,
    status: 'completed',
    trainingMaxSnapshot: 100,
    storageUnitSnapshot: 'lbs',
    displayUnitSnapshot: 'lbs',
  };
}

describe('applyHistoryFilter', () => {
  const rows: Session[] = [
    session(1, 'squat'),
    session(2, 'bench'),
    session(3, 'squat'),
    session(4, 'deadlift'),
  ];

  it('all → returns every row in order', () => {
    expect(applyHistoryFilter(rows, { kind: 'all' }, new Set()).map((s) => s.id)).toEqual([
      1, 2, 3, 4,
    ]);
  });

  it('prs → returns only sessions in the PR set', () => {
    const out = applyHistoryFilter(rows, { kind: 'prs' }, new Set([2, 4]));
    expect(out.map((s) => s.id)).toEqual([2, 4]);
  });

  it('lift → keeps only rows for that lift', () => {
    const out = applyHistoryFilter(rows, { kind: 'lift', lift: 'squat' }, new Set());
    expect(out.map((s) => s.id)).toEqual([1, 3]);
  });

  it('returns a fresh array (does not alias the source)', () => {
    const out = applyHistoryFilter(rows, { kind: 'all' }, new Set());
    expect(out).not.toBe(rows);
  });
});

describe('historyFilterKey', () => {
  it('keys lift filters by their lift', () => {
    expect(historyFilterKey({ kind: 'lift', lift: 'bench' })).toBe('lift:bench');
  });

  it('keys non-lift filters by their kind', () => {
    expect(historyFilterKey({ kind: 'all' })).toBe('all');
    expect(historyFilterKey({ kind: 'prs' })).toBe('prs');
  });
});
