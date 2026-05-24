import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { runMigrations } from '../../drizzle/runMigrations';
import * as schema from '../../drizzle/schema';
import { _upsertPR, getPR, getPRs } from '../prs';
import { createSession } from '../session';
import { appendSetLog } from '../setLog';
import { seedDefaultSettings } from '../settings';
import { setTrainingMax } from '../trainingMax';

function freshDb() {
  const sqlite = new BetterSqlite3(':memory:');
  runMigrations(sqlite);
  // biome-ignore lint/suspicious/noExplicitAny: structural typing
  return drizzle(sqlite, { schema }) as any;
}

async function setupWithSession() {
  const db = freshDb();
  await seedDefaultSettings(db);
  await setTrainingMax(db, 'squat', 250, 'lbs');
  const session = await createSession(db, 'squat');
  return { db, session };
}

describe('getPRs', () => {
  it('returns an empty array when no PRs have been set', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    expect(await getPRs(db)).toEqual([]);
  });

  it('returns one row per lift that has a PR', async () => {
    const { db, session } = await setupWithSession();
    await appendSetLog(db, {
      sessionId: session.id as number,
      index: 2,
      kind: 'amrap',
      prescribedWeight: 212.5,
      prescribedReps: 5,
      actualReps: 8,
    });
    const rows = await getPRs(db);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.lift).toBe('squat');
  });
});

describe('getPR', () => {
  it('returns undefined when no PR exists for the lift', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    expect(await getPR(db, 'press')).toBeUndefined();
  });

  it('returns the PR row when one exists for the lift', async () => {
    const { db, session } = await setupWithSession();
    await appendSetLog(db, {
      sessionId: session.id as number,
      index: 2,
      kind: 'amrap',
      prescribedWeight: 212.5,
      prescribedReps: 5,
      actualReps: 8,
    });
    const pr = await getPR(db, 'squat');
    expect(pr).toBeDefined();
    expect(pr?.lift).toBe('squat');
    expect(pr?.bestE1RM).toBeGreaterThan(0);
  });

  it('does NOT bleed across lifts', async () => {
    const { db, session } = await setupWithSession();
    await appendSetLog(db, {
      sessionId: session.id as number,
      index: 2,
      kind: 'amrap',
      prescribedWeight: 212.5,
      prescribedReps: 5,
      actualReps: 8,
    });
    expect(await getPR(db, 'bench')).toBeUndefined();
  });
});

describe('_upsertPR', () => {
  it('inserts a fresh PR row when none exists for the lift', async () => {
    const { db, session } = await setupWithSession();
    // Pre-create a setLog the PR can reference (PR.setLogId is FK).
    const log = await appendSetLog(db, {
      sessionId: session.id as number,
      index: 0,
      kind: 'working',
      prescribedWeight: 200,
      prescribedReps: 5,
      actualReps: 5,
    });
    const ts = Date.now();
    await _upsertPR(db, {
      lift: 'squat',
      bestE1RM: 300,
      setLogId: log.id,
      achievedAt: ts,
    });
    const pr = await getPR(db, 'squat');
    expect(pr?.bestE1RM).toBe(300);
    expect(pr?.setLogId).toBe(log.id);
    expect(pr?.achievedAt).toBe(ts);
  });

  it('updates the existing row via ON CONFLICT(lift) instead of duplicating', async () => {
    const { db, session } = await setupWithSession();
    const firstLog = await appendSetLog(db, {
      sessionId: session.id as number,
      index: 0,
      kind: 'working',
      prescribedWeight: 200,
      prescribedReps: 5,
      actualReps: 5,
    });
    const secondLog = await appendSetLog(db, {
      sessionId: session.id as number,
      index: 1,
      kind: 'working',
      prescribedWeight: 225,
      prescribedReps: 5,
      actualReps: 5,
    });
    await _upsertPR(db, {
      lift: 'squat',
      bestE1RM: 280,
      setLogId: firstLog.id,
      achievedAt: 1000,
    });
    await _upsertPR(db, {
      lift: 'squat',
      bestE1RM: 310,
      setLogId: secondLog.id,
      achievedAt: 2000,
    });
    const rows = await getPRs(db);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.bestE1RM).toBe(310);
    expect(rows[0]?.setLogId).toBe(secondLog.id);
    expect(rows[0]?.achievedAt).toBe(2000);
  });
});
