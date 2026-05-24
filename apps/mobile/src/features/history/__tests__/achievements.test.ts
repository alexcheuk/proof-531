import type { Session } from '@/data/accessors/session';
import { computeCycleHint, computeHistoryStats } from '../achievements';

function makeSession(id: number, status: Session['status'] = 'completed'): Session {
  return {
    id,
    lift: 'squat',
    cycle: 1,
    week: 1,
    startedAt: id,
    endedAt: id + 1,
    status,
    trainingMaxSnapshot: 100,
    storageUnitSnapshot: 'lbs',
    displayUnitSnapshot: 'lbs',
  };
}

describe('computeHistoryStats', () => {
  it('counts only completed sessions', () => {
    const sessions = [
      makeSession(1, 'completed'),
      makeSession(2, 'in_progress'),
      makeSession(3, 'cancelled'),
      makeSession(4, 'completed'),
    ];
    expect(computeHistoryStats(sessions, new Set())).toEqual({ filed: 2, prs: 0 });
  });

  it('counts PR sessions only when also completed', () => {
    const sessions = [
      makeSession(1, 'completed'),
      makeSession(2, 'completed'),
      makeSession(3, 'cancelled'),
    ];
    // Cancelled session is in the PR set (PRs survive cancel per spec) but
    // shouldn't count toward "filed" PRs in the lifetime strip.
    expect(computeHistoryStats(sessions, new Set([1, 3]))).toEqual({ filed: 2, prs: 1 });
  });

  it('returns zeros for empty input', () => {
    expect(computeHistoryStats([], new Set())).toEqual({ filed: 0, prs: 0 });
  });
});

describe('computeCycleHint', () => {
  it('shows in-progress fraction with no PR clause when count is zero', () => {
    const sessions = [
      makeSession(1, 'completed'),
      makeSession(2, 'in_progress'),
      makeSession(3, 'completed'),
    ];
    expect(computeCycleHint(sessions, new Set())).toBe('2 of 3 done');
  });

  it('shows total + PR clause when all are completed and PRs exist', () => {
    const sessions = [
      makeSession(1, 'completed'),
      makeSession(2, 'completed'),
      makeSession(3, 'completed'),
    ];
    expect(computeCycleHint(sessions, new Set([1, 3]))).toBe('3 sessions · 2 PRs');
  });

  it('pluralises PR singular', () => {
    const sessions = [makeSession(1, 'completed'), makeSession(2, 'completed')];
    expect(computeCycleHint(sessions, new Set([1]))).toBe('2 sessions · 1 PR');
  });

  it('pluralises session singular', () => {
    expect(computeCycleHint([makeSession(1, 'completed')], new Set([1]))).toBe('1 session · 1 PR');
  });
});
