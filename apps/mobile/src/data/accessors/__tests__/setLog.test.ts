import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { runMigrations } from '../../drizzle/runMigrations';
import * as schema from '../../drizzle/schema';
import { getPR, getPRs } from '../prs';
import { createSession } from '../session';
import { appendSetLog, getSetLogsForSession } from '../setLog';
import { seedDefaultSettings } from '../settings';
import { setTrainingMax } from '../trainingMax';

function freshDb() {
  const sqlite = new BetterSqlite3(':memory:');
  runMigrations(sqlite);
  // biome-ignore lint/suspicious/noExplicitAny: structural typing
  return drizzle(sqlite, { schema }) as any;
}

async function setup() {
  const db = freshDb();
  await seedDefaultSettings(db);
  await setTrainingMax(db, 'squat', 250, 'lbs');
  const session = await createSession(db, 'squat');
  return { db, session };
}

describe('setLog + prs accessors', () => {
  it('appendSetLog persists a non-AMRAP row without PR side effects', async () => {
    const { db, session } = await setup();
    const log = await appendSetLog(db, {
      sessionId: session.id as number,
      index: 0,
      kind: 'working',
      prescribedWeight: 162.5,
      prescribedReps: 5,
      actualReps: 5,
    });
    expect(log.kind).toBe('working');
    expect(log.estimated1RM).toBeNull();
    expect(log.isPR).toBeFalsy();
    expect(await getPRs(db)).toEqual([]);
  });

  it('AMRAP set computes estimated1RM and marks isPR when there is no prior PR', async () => {
    const { db, session } = await setup();
    const log = await appendSetLog(db, {
      sessionId: session.id as number,
      index: 2,
      kind: 'amrap',
      prescribedWeight: 212.5,
      prescribedReps: 5,
      actualReps: 8,
    });
    // estimate = 212.5 * (1 + 8/30) ≈ 269.166...
    expect(log.estimated1RM).toBeCloseTo(269.166, 2);
    expect(log.isPR).toBe(true);
    const pr = await getPR(db, 'squat');
    expect(pr?.bestE1RM).toBeCloseTo(269.166, 2);
    expect(pr?.setLogId).toBe(log.id);
  });

  it('AMRAP set with lower estimated1RM than prior PR is NOT a PR', async () => {
    const { db, session } = await setup();
    // First AMRAP — sets the PR at ~269
    await appendSetLog(db, {
      sessionId: session.id as number,
      index: 2,
      kind: 'amrap',
      prescribedWeight: 212.5,
      prescribedReps: 5,
      actualReps: 8,
    });
    // Second AMRAP — lower estimate
    const log = await appendSetLog(db, {
      sessionId: session.id as number,
      index: 2,
      kind: 'amrap',
      prescribedWeight: 200,
      prescribedReps: 5,
      actualReps: 6,
    });
    // 200 * (1 + 6/30) = 240 < 269.166
    expect(log.isPR).toBe(false);
    const pr = await getPR(db, 'squat');
    expect(pr?.bestE1RM).toBeCloseTo(269.166, 2); // unchanged
  });

  it('AMRAP set with higher estimated1RM upserts the PR row', async () => {
    const { db, session } = await setup();
    await appendSetLog(db, {
      sessionId: session.id as number,
      index: 2,
      kind: 'amrap',
      prescribedWeight: 212.5,
      prescribedReps: 5,
      actualReps: 8,
    });
    const log = await appendSetLog(db, {
      sessionId: session.id as number,
      index: 2,
      kind: 'amrap',
      prescribedWeight: 212.5,
      prescribedReps: 5,
      actualReps: 12,
    });
    // 212.5 * (1 + 12/30) = 297.5 > 269.166
    expect(log.isPR).toBe(true);
    const pr = await getPR(db, 'squat');
    expect(pr?.bestE1RM).toBeCloseTo(297.5, 2);
    expect(pr?.setLogId).toBe(log.id);
  });

  it('getSetLogsForSession returns logs for a session', async () => {
    const { db, session } = await setup();
    await appendSetLog(db, {
      sessionId: session.id as number,
      index: 0,
      kind: 'working',
      prescribedWeight: 162.5,
      prescribedReps: 5,
      actualReps: 5,
    });
    await appendSetLog(db, {
      sessionId: session.id as number,
      index: 1,
      kind: 'working',
      prescribedWeight: 187.5,
      prescribedReps: 5,
      actualReps: 5,
    });
    const logs = await getSetLogsForSession(db, session.id as number);
    expect(logs).toHaveLength(2);
  });

  it('throws if session does not exist (AMRAP path)', async () => {
    const db = freshDb();
    await expect(
      appendSetLog(db, {
        sessionId: 999,
        index: 2,
        kind: 'amrap',
        prescribedWeight: 200,
        prescribedReps: 5,
        actualReps: 6,
      }),
    ).rejects.toThrow();
  });
});
