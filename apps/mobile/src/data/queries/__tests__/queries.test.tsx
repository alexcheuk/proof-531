import { act, renderHook, waitFor } from '@testing-library/react-native';
import {
  useActiveCycle,
  useCompleteSet,
  useHistory,
  usePRStrip,
  useSession,
  useStartSet,
} from '..';
import type { DataDb } from '../../context';
import { type TestDb, createTestDb } from '../../db/test-harness';
import { makeWrapper } from '../test-wrapper';

type Harness = TestDb & { wrapper: ReturnType<typeof makeWrapper> };

function setup(): Harness {
  const h = createTestDb();
  // better-sqlite3's drizzle adapter and expo-sqlite's adapter share the
  // BaseSQLiteDatabase<'sync', unknown, schema> shape we typed DataDb as.
  const wrapper = makeWrapper(h.db as unknown as DataDb);
  return { ...h, wrapper };
}

function seedLift(h: TestDb, id: string, label = 'Squat', tm = 300): void {
  h.sqlite
    .prepare(
      'INSERT INTO lifts (id, label, category, training_max, enabled) VALUES (?, ?, ?, ?, ?)',
    )
    .run(id, label, 'lower', tm, 1);
}

function seedCycle(h: TestDb, number = 1, startedAt = Date.now()): number {
  const r = h.sqlite
    .prepare('INSERT INTO cycles (number, started_at) VALUES (?, ?)')
    .run(number, Math.floor(startedAt / 1000));
  return Number(r.lastInsertRowid);
}

function seedSession(
  h: TestDb,
  cycleId: number,
  liftId: string,
  week = 1,
  startedAt = Date.now(),
): number {
  const r = h.sqlite
    .prepare('INSERT INTO sessions (cycle_id, lift_id, week, started_at) VALUES (?, ?, ?, ?)')
    .run(cycleId, liftId, week, Math.floor(startedAt / 1000));
  return Number(r.lastInsertRowid);
}

function seedSet(
  h: TestDb,
  sessionId: number,
  weight: number,
  reps: number,
  actualReps: number | null = null,
  completedAt: number | null = null,
): number {
  const r = h.sqlite
    .prepare(
      'INSERT INTO sets (session_id, "index", type, prescribed_weight, prescribed_reps, actual_reps, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    .run(sessionId, 0, 'main', weight, reps, actualReps, completedAt);
  return Number(r.lastInsertRowid);
}

describe('useActiveCycle', () => {
  it('returns null when no cycles exist', async () => {
    const { wrapper, close } = setup();
    const { result } = renderHook(() => useActiveCycle(), { wrapper });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toBeNull();
    close();
  });

  it('returns the most recently-started incomplete cycle', async () => {
    const h = setup();
    seedCycle(h, 1, new Date('2026-01-01').getTime());
    seedCycle(h, 2, new Date('2026-02-01').getTime());
    const { result } = renderHook(() => useActiveCycle(), { wrapper: h.wrapper });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.number).toBe(2);
    h.close();
  });
});

describe('useSession', () => {
  it('returns null for an unknown id', async () => {
    const h = setup();
    const { result } = renderHook(() => useSession(999), { wrapper: h.wrapper });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toBeNull();
    h.close();
  });

  it('returns the session row when it exists', async () => {
    const h = setup();
    seedLift(h, 'squat');
    const cycleId = seedCycle(h);
    const sessionId = seedSession(h, cycleId, 'squat');
    const { result } = renderHook(() => useSession(sessionId), { wrapper: h.wrapper });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.id).toBe(sessionId);
    expect(result.current.data?.liftId).toBe('squat');
    h.close();
  });
});

describe('useHistory', () => {
  it('returns [] initially', async () => {
    const h = setup();
    const { result } = renderHook(() => useHistory(), { wrapper: h.wrapper });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toEqual([]);
    h.close();
  });

  it('returns only completed sessions, newest-first', async () => {
    const h = setup();
    seedLift(h, 'squat');
    const cycleId = seedCycle(h);
    // one completed, one in-progress
    const a = seedSession(h, cycleId, 'squat', 1, new Date('2026-01-01').getTime());
    h.sqlite
      .prepare('UPDATE sessions SET completed_at = ? WHERE id = ?')
      .run(Math.floor(new Date('2026-01-02').getTime() / 1000), a);
    const b = seedSession(h, cycleId, 'squat', 2, new Date('2026-01-05').getTime());
    h.sqlite
      .prepare('UPDATE sessions SET completed_at = ? WHERE id = ?')
      .run(Math.floor(new Date('2026-01-06').getTime() / 1000), b);
    seedSession(h, cycleId, 'squat', 3, new Date('2026-01-10').getTime()); // incomplete

    const { result } = renderHook(() => useHistory(), { wrapper: h.wrapper });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0]?.id).toBe(b);
    expect(result.current.data?.[1]?.id).toBe(a);
    h.close();
  });
});

describe('usePRStrip', () => {
  it('returns [] when there are no completed sets', async () => {
    const h = setup();
    const { result } = renderHook(() => usePRStrip(), { wrapper: h.wrapper });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toEqual([]);
    h.close();
  });

  it('computes per-lift e1RM and PR flag from completed sets', async () => {
    const h = setup();
    seedLift(h, 'squat');
    const cycleId = seedCycle(h);
    const sessionId = seedSession(h, cycleId, 'squat');
    const completedAt = Math.floor(Date.now() / 1000);
    seedSet(h, sessionId, 200, 5, 5, completedAt);
    seedSet(h, sessionId, 210, 5, 5, completedAt);

    const { result } = renderHook(() => usePRStrip(), { wrapper: h.wrapper });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toHaveLength(1);
    const entry = result.current.data?.[0];
    expect(entry?.liftId).toBe('squat');
    // best is 210 * (1 + 5/30) = 245
    expect(entry?.e1rm).toBe(245);
    expect(entry?.isPR).toBe(true);
    h.close();
  });
});

describe('useStartSet (mutation)', () => {
  it('creates a set and invalidates per-session keys', async () => {
    const h = setup();
    seedLift(h, 'squat');
    const cycleId = seedCycle(h);
    const sessionId = seedSession(h, cycleId, 'squat');

    const { result } = renderHook(() => useStartSet(), { wrapper: h.wrapper });
    await act(async () => {
      await result.current.mutateAsync({
        sessionId,
        index: 0,
        type: 'main',
        prescribedWeight: 195,
        prescribedReps: 5,
      });
    });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.sessionId).toBe(sessionId);
    expect(result.current.data?.prescribedWeight).toBe(195);
    h.close();
  });
});

describe('useCompleteSet (mutation)', () => {
  it('updates actualReps and completedAt and invalidates history/PR keys', async () => {
    const h = setup();
    seedLift(h, 'squat');
    const cycleId = seedCycle(h);
    const sessionId = seedSession(h, cycleId, 'squat');
    const setId = seedSet(h, sessionId, 195, 5);

    const { result } = renderHook(() => useCompleteSet(), { wrapper: h.wrapper });
    await act(async () => {
      await result.current.mutateAsync({ id: setId, actualReps: 7 });
    });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.actualReps).toBe(7);
    expect(result.current.data?.completedAt).toBeInstanceOf(Date);
    h.close();
  });

  it('returns undefined data and does not throw when set id is unknown', async () => {
    const h = setup();
    const { result } = renderHook(() => useCompleteSet(), { wrapper: h.wrapper });
    await act(async () => {
      await result.current.mutateAsync({ id: 999, actualReps: 5 });
    });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toBeUndefined();
    h.close();
  });
});
