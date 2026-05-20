import { type DemoStage, seedDemo } from '../seed';
import { createTestDb } from '../test-harness';

type Count = { n: number };

function count(sqlite: { prepare: (sql: string) => { get: () => unknown } }, sql: string): number {
  return (sqlite.prepare(sql).get() as Count).n;
}

describe('seedDemo', () => {
  describe('freshStart', () => {
    it('seeds 4 lifts (all enabled) and no cycles/sessions/sets', () => {
      const { db, sqlite, close } = createTestDb();
      try {
        seedDemo(db, 'freshStart');
        expect(count(sqlite, 'SELECT COUNT(*) AS n FROM lifts')).toBe(4);
        expect(count(sqlite, 'SELECT COUNT(*) AS n FROM lifts WHERE enabled = 1')).toBe(4);
        expect(count(sqlite, 'SELECT COUNT(*) AS n FROM cycles')).toBe(0);
        expect(count(sqlite, 'SELECT COUNT(*) AS n FROM sessions')).toBe(0);
        expect(count(sqlite, 'SELECT COUNT(*) AS n FROM sets')).toBe(0);
      } finally {
        close();
      }
    });

    it('uses the canonical training maxes from buildDemoSession', () => {
      const { db, sqlite, close } = createTestDb();
      try {
        seedDemo(db, 'freshStart');
        const rows = sqlite
          .prepare('SELECT id, training_max FROM lifts ORDER BY id')
          .all() as Array<{ id: string; training_max: number }>;
        const tm = Object.fromEntries(rows.map((r) => [r.id, r.training_max]));
        expect(tm).toEqual({ squat: 235, bench: 175, deadlift: 305, press: 115 });
      } finally {
        close();
      }
    });
  });

  describe('midCycle', () => {
    it('seeds 4 lifts with 3 enabled (no press) and matches canonical TMs', () => {
      const { db, sqlite, close } = createTestDb();
      try {
        seedDemo(db, 'midCycle');
        expect(count(sqlite, 'SELECT COUNT(*) AS n FROM lifts')).toBe(4);
        expect(count(sqlite, 'SELECT COUNT(*) AS n FROM lifts WHERE enabled = 1')).toBe(3);
        const enabledRow = sqlite.prepare('SELECT id FROM lifts WHERE enabled = 0').get() as {
          id: string;
        };
        expect(enabledRow.id).toBe('press');
        const rows = sqlite
          .prepare('SELECT id, training_max FROM lifts ORDER BY id')
          .all() as Array<{ id: string; training_max: number }>;
        const tm = Object.fromEntries(rows.map((r) => [r.id, r.training_max]));
        expect(tm).toEqual({ squat: 275, bench: 195, deadlift: 345, press: 0 });
      } finally {
        close();
      }
    });

    it('seeds 3 cycles (2 completed, cycle 3 active) and one active session', () => {
      const { db, sqlite, close } = createTestDb();
      try {
        seedDemo(db, 'midCycle');
        expect(count(sqlite, 'SELECT COUNT(*) AS n FROM cycles')).toBe(3);
        expect(
          count(sqlite, 'SELECT COUNT(*) AS n FROM cycles WHERE completed_at IS NOT NULL'),
        ).toBe(2);
        // 8 completed sessions + 1 active = 9
        expect(
          count(sqlite, 'SELECT COUNT(*) AS n FROM sessions WHERE completed_at IS NOT NULL'),
        ).toBe(8);
        expect(count(sqlite, 'SELECT COUNT(*) AS n FROM sessions WHERE completed_at IS NULL')).toBe(
          1,
        );
        // Sets: 3 per completed session
        expect(count(sqlite, 'SELECT COUNT(*) AS n FROM sets')).toBe(24);
      } finally {
        close();
      }
    });
  });

  describe('benchOnly', () => {
    it('seeds only bench as enabled with TM 215', () => {
      const { db, sqlite, close } = createTestDb();
      try {
        seedDemo(db, 'benchOnly');
        expect(count(sqlite, 'SELECT COUNT(*) AS n FROM lifts WHERE enabled = 1')).toBe(1);
        const row = sqlite
          .prepare('SELECT id, training_max FROM lifts WHERE enabled = 1')
          .get() as { id: string; training_max: number };
        expect(row.id).toBe('bench');
        expect(row.training_max).toBe(215);
        // Other lifts present but TM=0
        const others = sqlite
          .prepare('SELECT training_max FROM lifts WHERE enabled = 0')
          .all() as Array<{ training_max: number }>;
        expect(others).toHaveLength(3);
        for (const o of others) expect(o.training_max).toBe(0);
      } finally {
        close();
      }
    });

    it('seeds cycle 4 active with 1 completed bench session', () => {
      const { db, sqlite, close } = createTestDb();
      try {
        seedDemo(db, 'benchOnly');
        expect(count(sqlite, 'SELECT COUNT(*) AS n FROM cycles')).toBe(4);
        expect(count(sqlite, 'SELECT COUNT(*) AS n FROM cycles WHERE completed_at IS NULL')).toBe(
          1,
        );
        expect(count(sqlite, 'SELECT COUNT(*) AS n FROM sessions')).toBe(1);
        const session = sqlite.prepare('SELECT lift_id, completed_at FROM sessions').get() as {
          lift_id: string;
          completed_at: number | null;
        };
        expect(session.lift_id).toBe('bench');
        expect(session.completed_at).not.toBeNull();
      } finally {
        close();
      }
    });
  });

  describe('advanced', () => {
    it('seeds 6 cycles (5 completed, cycle 6 active) with canonical TMs', () => {
      const { db, sqlite, close } = createTestDb();
      try {
        seedDemo(db, 'advanced');
        expect(count(sqlite, 'SELECT COUNT(*) AS n FROM cycles')).toBe(6);
        expect(
          count(sqlite, 'SELECT COUNT(*) AS n FROM cycles WHERE completed_at IS NOT NULL'),
        ).toBe(5);
        const rows = sqlite
          .prepare('SELECT id, training_max FROM lifts ORDER BY id')
          .all() as Array<{ id: string; training_max: number }>;
        const tm = Object.fromEntries(rows.map((r) => [r.id, r.training_max]));
        expect(tm).toEqual({ squat: 320, bench: 220, deadlift: 405, press: 145 });
      } finally {
        close();
      }
    });

    it('seeds 13 completed sessions and 1 active session with 2 completed sets', () => {
      const { db, sqlite, close } = createTestDb();
      try {
        seedDemo(db, 'advanced');
        expect(
          count(sqlite, 'SELECT COUNT(*) AS n FROM sessions WHERE completed_at IS NOT NULL'),
        ).toBe(13);
        expect(count(sqlite, 'SELECT COUNT(*) AS n FROM sessions WHERE completed_at IS NULL')).toBe(
          1,
        );
        const active = sqlite
          .prepare('SELECT id, lift_id FROM sessions WHERE completed_at IS NULL')
          .get() as { id: number; lift_id: string };
        expect(active.lift_id).toBe('bench');
        // 2 of 3 sets done on the active session
        const completedSetsOnActive = count(
          sqlite,
          `SELECT COUNT(*) AS n FROM sets WHERE session_id = ${active.id} AND completed_at IS NOT NULL`,
        );
        expect(completedSetsOnActive).toBe(2);
        const totalSetsOnActive = count(
          sqlite,
          `SELECT COUNT(*) AS n FROM sets WHERE session_id = ${active.id}`,
        );
        expect(totalSetsOnActive).toBe(3);
      } finally {
        close();
      }
    });
  });

  it('throws on an unknown stage', () => {
    const { db, close } = createTestDb();
    try {
      expect(() => seedDemo(db, 'bogus' as unknown as DemoStage)).toThrow(/unknown stage/);
    } finally {
      close();
    }
  });

  it('is idempotent per-fresh-db across stages (separate dbs)', () => {
    for (const stage of ['freshStart', 'midCycle', 'benchOnly', 'advanced'] as const) {
      const { db, sqlite, close } = createTestDb();
      try {
        expect(() => seedDemo(db, stage)).not.toThrow();
        // At minimum lifts must be populated for every stage.
        expect(count(sqlite, 'SELECT COUNT(*) AS n FROM lifts')).toBe(4);
      } finally {
        close();
      }
    }
  });
});
