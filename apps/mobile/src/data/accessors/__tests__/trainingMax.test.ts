import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { runMigrations } from '../../drizzle/runMigrations';
import * as schema from '../../drizzle/schema';
import { getCurrentTrainingMaxes, getTrainingMaxHistory, setTrainingMax } from '../trainingMax';

type TestDb = ReturnType<typeof drizzle<typeof schema>>;

function freshDb(): TestDb {
  const sqlite = new BetterSqlite3(':memory:');
  runMigrations(sqlite);
  return drizzle(sqlite, { schema });
}

describe('trainingMax accessor', () => {
  describe('setTrainingMax', () => {
    it('INSERTs a new row (never UPDATEs)', async () => {
      const db = freshDb();
      const a = await setTrainingMax(db, 'squat', 250, 'lbs');
      const b = await setTrainingMax(db, 'squat', 255, 'lbs');
      expect(a.id).not.toBe(b.id);
      expect(a.id).toBeGreaterThan(0);
      expect(b.id).toBe((a.id ?? 0) + 1);
    });

    it('returns a row with id, lift, value, unit, updatedAt populated', async () => {
      const db = freshDb();
      const row = await setTrainingMax(db, 'press', 140, 'lbs');
      expect(row).toMatchObject({
        lift: 'press',
        value: 140,
        unit: 'lbs',
      });
      expect(row.id).toBeGreaterThan(0);
      expect(row.updatedAt).toBeGreaterThan(0);
    });
  });

  describe('getCurrentTrainingMaxes', () => {
    it('returns latest row per lift (one row per lift)', async () => {
      const db = freshDb();
      await setTrainingMax(db, 'squat', 250, 'lbs');
      await setTrainingMax(db, 'squat', 255, 'lbs');
      await setTrainingMax(db, 'bench', 200, 'lbs');
      const current = await getCurrentTrainingMaxes(db);
      const bySquat = current.find((r) => r.lift === 'squat');
      const byBench = current.find((r) => r.lift === 'bench');
      expect(bySquat?.value).toBe(255); // most recent squat
      expect(byBench?.value).toBe(200);
      expect(current.filter((r) => r.lift === 'squat')).toHaveLength(1);
    });

    it('returns empty array when no TMs set', async () => {
      const db = freshDb();
      expect(await getCurrentTrainingMaxes(db)).toEqual([]);
    });
  });

  describe('getTrainingMaxHistory', () => {
    it('returns all rows for a lift newest first', async () => {
      const db = freshDb();
      await setTrainingMax(db, 'squat', 250, 'lbs');
      // Force distinct updatedAt timestamps even on fast machines
      await new Promise((r) => setTimeout(r, 2));
      await setTrainingMax(db, 'squat', 255, 'lbs');
      const history = await getTrainingMaxHistory(db, 'squat');
      expect(history.map((r) => r.value)).toEqual([255, 250]);
    });
  });
});
