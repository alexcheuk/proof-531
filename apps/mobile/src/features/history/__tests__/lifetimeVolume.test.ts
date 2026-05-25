import type { Session } from '@/data/accessors/session';
/**
 * Unit tests for the lifetime-volume aggregator + its formatter. Mirrors
 * the per-session `volumeOfWorkingSets` style — plain unit assertions plus a
 * fast-check property on the formatter's bucket boundaries.
 */
import type { SetLog } from '@/domain/types';
import fc from 'fast-check';
import { computeLifetimeVolume, formatLifetimeVolume } from '../lifetimeVolume';

function makeSession(overrides: Omit<Partial<Session>, 'id'> & { id: number }): Session {
  return {
    lift: 'squat',
    cycle: 1,
    week: 1,
    startedAt: 0,
    endedAt: 0,
    status: 'completed',
    trainingMaxSnapshot: 250,
    storageUnitSnapshot: 'lbs',
    displayUnitSnapshot: 'lbs',
    ...overrides,
  };
}

function makeLog(overrides: Omit<Partial<SetLog>, 'sessionId'> & { sessionId: number }): SetLog {
  return {
    index: 0,
    kind: 'working',
    prescribedWeight: 100,
    prescribedReps: 5,
    actualReps: 5,
    completedAt: 0,
    ...overrides,
  };
}

describe('computeLifetimeVolume', () => {
  it('returns 0 for empty session list', () => {
    expect(computeLifetimeVolume([], new Map())).toBe(0);
  });

  it('sums prescribedWeight × actualReps across completed sessions', () => {
    const sessions = [makeSession({ id: 1 }), makeSession({ id: 2 })];
    const logs = new Map<number, SetLog[]>([
      [
        1,
        [
          makeLog({ sessionId: 1, kind: 'working', prescribedWeight: 100, actualReps: 5 }), // 500
          makeLog({ sessionId: 1, kind: 'working', prescribedWeight: 150, actualReps: 5 }), // 750
          makeLog({ sessionId: 1, kind: 'amrap', prescribedWeight: 200, actualReps: 8 }), //  1600
        ],
      ],
      [2, [makeLog({ sessionId: 2, kind: 'amrap', prescribedWeight: 100, actualReps: 10 })]], // 1000
    ]);
    expect(computeLifetimeVolume(sessions, logs)).toBe(500 + 750 + 1600 + 1000);
  });

  it('skips non-counted kinds (warmup, assistance) but COUNTS bbb (loop-012)', () => {
    // BBB is counted as of loop-012 — `getLifetimeVolume`'s SQL filter
    // was widened in loop-008 when BbbPromptScreen started writing
    // `kind: 'bbb'` rows, and this in-memory helper finally matches.
    // The single-session `volumeOfWorkingSets` in `domain/summary.ts`
    // still excludes BBB (different contract for the receipt's
    // working-set band).
    const sessions = [makeSession({ id: 1 })];
    const logs = new Map<number, SetLog[]>([
      [
        1,
        [
          makeLog({ sessionId: 1, kind: 'warmup', prescribedWeight: 95, actualReps: 5 }), // skip
          makeLog({ sessionId: 1, kind: 'bbb', prescribedWeight: 135, actualReps: 10 }), // 1350
          makeLog({
            sessionId: 1,
            kind: 'assistance',
            prescribedWeight: 100,
            actualReps: 12,
          }), // skip
          makeLog({ sessionId: 1, kind: 'working', prescribedWeight: 200, actualReps: 5 }), // 1000
        ],
      ],
    ]);
    expect(computeLifetimeVolume(sessions, logs)).toBe(1000 + 1350);
  });

  it('skips sessions whose status is not completed', () => {
    const sessions = [
      makeSession({ id: 1, status: 'in_progress' }),
      makeSession({ id: 2, status: 'cancelled' }),
      makeSession({ id: 3, status: 'completed' }),
    ];
    const logs = new Map<number, SetLog[]>([
      [1, [makeLog({ sessionId: 1, kind: 'working', prescribedWeight: 100, actualReps: 5 })]],
      [2, [makeLog({ sessionId: 2, kind: 'working', prescribedWeight: 100, actualReps: 5 })]],
      [3, [makeLog({ sessionId: 3, kind: 'working', prescribedWeight: 100, actualReps: 5 })]],
    ]);
    expect(computeLifetimeVolume(sessions, logs)).toBe(500);
  });

  it('tolerates sessions with no logs in the map', () => {
    const sessions = [makeSession({ id: 1 }), makeSession({ id: 2 })];
    const logs = new Map<number, SetLog[]>([
      [1, [makeLog({ sessionId: 1, kind: 'working', prescribedWeight: 100, actualReps: 5 })]],
      // session 2 omitted intentionally
    ]);
    expect(computeLifetimeVolume(sessions, logs)).toBe(500);
  });
});

describe('formatLifetimeVolume', () => {
  it('renders under 10,000 with comma-separated integer + glyph', () => {
    expect(formatLifetimeVolume(8400, 'lbs')).toBe('8,400 lb');
    expect(formatLifetimeVolume(8400, 'kg')).toBe('8,400 kg');
    expect(formatLifetimeVolume(999, 'lbs')).toBe('999 lb');
    expect(formatLifetimeVolume(1234, 'lbs')).toBe('1,234 lb');
  });

  it('renders 10,000 .. 999,999 as `k` with one decimal', () => {
    expect(formatLifetimeVolume(12_400, 'lbs')).toBe('12.4k lb');
    expect(formatLifetimeVolume(10_000, 'lbs')).toBe('10k lb');
    expect(formatLifetimeVolume(125_500, 'kg')).toBe('125.5k kg');
  });

  it('renders 1M+ as `M` with one decimal, drops trailing zero', () => {
    expect(formatLifetimeVolume(1_200_000, 'lbs')).toBe('1.2M lb');
    expect(formatLifetimeVolume(1_000_000, 'lbs')).toBe('1M lb');
    expect(formatLifetimeVolume(2_500_000, 'kg')).toBe('2.5M kg');
  });

  it('treats zero / negative / NaN as 0 with correct glyph', () => {
    expect(formatLifetimeVolume(0, 'lbs')).toBe('0 lb');
    expect(formatLifetimeVolume(-100, 'kg')).toBe('0 kg');
    expect(formatLifetimeVolume(Number.NaN, 'lbs')).toBe('0 lb');
  });

  it('property: the unit glyph is always lb for lbs and kg for kg', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: Math.fround(50_000_000), noNaN: true }),
        fc.constantFrom('lbs' as const, 'kg' as const),
        (n, unit) => {
          const out = formatLifetimeVolume(n, unit);
          return out.endsWith(unit === 'lbs' ? ' lb' : ' kg');
        },
      ),
    );
  });
});
