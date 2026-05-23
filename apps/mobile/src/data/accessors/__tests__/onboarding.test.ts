import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { runMigrations } from '../../drizzle/runMigrations';
import * as schema from '../../drizzle/schema';
import { completeOnboarding } from '../onboarding';
import { getSettings } from '../settings';
import { getCurrentTrainingMaxes } from '../trainingMax';

type TestDb = ReturnType<typeof drizzle<typeof schema>>;

function freshDb(): TestDb {
  const sqlite = new BetterSqlite3(':memory:');
  runMigrations(sqlite);
  return drizzle(sqlite, { schema });
}

describe('completeOnboarding', () => {
  it('inserts settings + initial TMs in a single onboarding call', async () => {
    const db = freshDb();
    await completeOnboarding(db, {
      unit: 'lbs',
      enabledLifts: ['squat', 'bench', 'deadlift', 'press'],
      oneRMs: { squat: 300, bench: 225, deadlift: 400, press: 155 },
    });

    const s = await getSettings(db);
    expect(s.storageUnit).toBe('lbs');
    expect(s.displayUnit).toBe('lbs');
    expect(s.enabledLifts).toEqual(['squat', 'bench', 'deadlift', 'press']);

    const tms = await getCurrentTrainingMaxes(db);
    const find = (l: string) => tms.find((t) => t.lift === l)?.value;
    // 90% snapped to 5 lb step
    expect(find('squat')).toBe(270); // 90% of 300 = 270
    expect(find('bench')).toBe(205); // 90% of 225 = 202.5 → 205
    expect(find('deadlift')).toBe(360); // 90% of 400 = 360
    expect(find('press')).toBe(140); // 90% of 155 = 139.5 → 140
  });

  it('supports kg unit with kg snap step', async () => {
    const db = freshDb();
    await completeOnboarding(db, {
      unit: 'kg',
      enabledLifts: ['squat'],
      oneRMs: { squat: 140 },
    });
    const s = await getSettings(db);
    expect(s.storageUnit).toBe('kg');
    const tms = await getCurrentTrainingMaxes(db);
    // 90% of 140 = 126; snap to 2.5 kg step = 125 (Math.round(126/2.5)*2.5 = 125)
    expect(tms[0]?.value).toBe(125);
  });

  it('throws if enabledLifts is empty', async () => {
    const db = freshDb();
    await expect(
      completeOnboarding(db, { unit: 'lbs', enabledLifts: [], oneRMs: {} }),
    ).rejects.toThrow();
  });

  it('throws if any enabled lift has missing or non-positive oneRM (no partial writes)', async () => {
    const db = freshDb();
    await expect(
      completeOnboarding(db, {
        unit: 'lbs',
        enabledLifts: ['squat', 'bench'],
        oneRMs: { squat: 300 },
      }),
    ).rejects.toThrow();
    // Verify NO TMs were written.
    const tms = await getCurrentTrainingMaxes(db);
    expect(tms).toEqual([]);
  });
});
