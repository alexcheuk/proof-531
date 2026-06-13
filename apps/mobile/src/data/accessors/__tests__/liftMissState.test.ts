import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { missResetTm } from '../../../domain/progression';
import { runMigrations } from '../../drizzle/runMigrations';
import * as schema from '../../drizzle/schema';
import { applyMissReset, clearMissState, getMissState, recordMiss } from '../liftMissState';
import { getCurrentTrainingMaxes, setTrainingMax } from '../trainingMax';

function freshDb() {
  const sqlite = new BetterSqlite3(':memory:');
  runMigrations(sqlite);
  // biome-ignore lint/suspicious/noExplicitAny: structural typing
  return drizzle(sqlite, { schema }) as any;
}

describe('liftMissState accessors', () => {
  it('returns null when no miss state exists', async () => {
    const db = freshDb();
    expect(await getMissState(db, 'squat')).toBeNull();
  });

  it('recordMiss seeds missCount 1 on first miss', async () => {
    const db = freshDb();
    const row = await recordMiss(db, 'squat');
    expect(row.missCount).toBe(1);
    expect(row.lift).toBe('squat');
    expect(typeof row.lastMissDate).toBe('string');
    expect(typeof row.updatedAt).toBe('string');
  });

  it('recordMiss increments missCount on a second consecutive miss', async () => {
    const db = freshDb();
    await recordMiss(db, 'squat');
    const second = await recordMiss(db, 'squat');
    expect(second.missCount).toBe(2);
    const read = await getMissState(db, 'squat');
    expect(read?.missCount).toBe(2);
  });

  it('keeps miss state per lift independent', async () => {
    const db = freshDb();
    await recordMiss(db, 'squat');
    await recordMiss(db, 'squat');
    await recordMiss(db, 'bench');
    expect((await getMissState(db, 'squat'))?.missCount).toBe(2);
    expect((await getMissState(db, 'bench'))?.missCount).toBe(1);
  });

  it('clearMissState removes the row idempotently', async () => {
    const db = freshDb();
    await recordMiss(db, 'press');
    await clearMissState(db, 'press');
    expect(await getMissState(db, 'press')).toBeNull();
    // Second clear is a no-op.
    await clearMissState(db, 'press');
    expect(await getMissState(db, 'press')).toBeNull();
  });

  it('applyMissReset writes a 10% reset TM and clears miss state', async () => {
    const db = freshDb();
    await setTrainingMax(db, 'squat', 275, 'lbs');
    await recordMiss(db, 'squat');
    const result = await applyMissReset(db, 'squat');
    // round(275 * 0.9, lbs) = 250
    expect(result.newTm).toBe(missResetTm(275, 'lbs'));
    expect(result.newTm).toBe(250);
    expect(result.unit).toBe('lbs');
    // New TM is the current TM (append-only history).
    const tms = await getCurrentTrainingMaxes(db);
    expect(tms.find((t) => t.lift === 'squat')?.value).toBe(250);
    // Miss state cleared.
    expect(await getMissState(db, 'squat')).toBeNull();
  });

  it('applyMissReset throws when no training max exists for the lift', async () => {
    const db = freshDb();
    await recordMiss(db, 'deadlift');
    await expect(applyMissReset(db, 'deadlift')).rejects.toThrow();
  });
});
