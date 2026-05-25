import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { runMigrations } from '../../drizzle/runMigrations';
import * as schema from '../../drizzle/schema';
import { getPR, getPRs } from '../prs';
import { createSession } from '../session';
import { completeSession } from '../session';
import {
  appendSetLog,
  getLifetimeVolume,
  getSessionIdsWithPrs,
  getSetLogsForSession,
  undoLastWorkingSet,
} from '../setLog';
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

describe('getSessionIdsWithPrs', () => {
  it('returns an empty array when no PRs have been set', async () => {
    const { db } = await setup();
    expect(await getSessionIdsWithPrs(db)).toEqual([]);
  });

  it('returns the sessionId of a PR-bearing AMRAP set', async () => {
    const { db, session } = await setup();
    await appendSetLog(db, {
      sessionId: session.id as number,
      index: 2,
      kind: 'amrap',
      prescribedWeight: 212.5,
      prescribedReps: 5,
      actualReps: 8,
    });
    expect(await getSessionIdsWithPrs(db)).toEqual([session.id]);
  });

  it('does NOT include sessions whose AMRAP did not beat the prior PR', async () => {
    const { db, session: first } = await setup();
    // First AMRAP — sets the PR
    await appendSetLog(db, {
      sessionId: first.id as number,
      index: 2,
      kind: 'amrap',
      prescribedWeight: 212.5,
      prescribedReps: 5,
      actualReps: 8,
    });
    // Complete the first session so the single-session invariant lets us
    // start a fresh one for the same lift.
    await completeSession(db, first.id as number);
    const second = await createSession(db, 'squat');
    await appendSetLog(db, {
      sessionId: second.id as number,
      index: 2,
      kind: 'amrap',
      prescribedWeight: 200,
      prescribedReps: 5,
      actualReps: 6,
    });
    const ids = await getSessionIdsWithPrs(db);
    expect(ids).toEqual([first.id]);
    expect(ids).not.toContain(second.id);
  });

  it('deduplicates a session that produced multiple PRs', async () => {
    const { db, session } = await setup();
    // Two AMRAPs in the same session, both PRs (each one beats the prior).
    await appendSetLog(db, {
      sessionId: session.id as number,
      index: 2,
      kind: 'amrap',
      prescribedWeight: 212.5,
      prescribedReps: 5,
      actualReps: 8,
    });
    await appendSetLog(db, {
      sessionId: session.id as number,
      index: 2,
      kind: 'amrap',
      prescribedWeight: 212.5,
      prescribedReps: 5,
      actualReps: 12,
    });
    const ids = await getSessionIdsWithPrs(db);
    expect(ids).toEqual([session.id]);
  });
});

describe('undoLastWorkingSet', () => {
  it('returns null when the session has no set logs', async () => {
    const { db, session } = await setup();
    const removed = await undoLastWorkingSet(db, session.id as number);
    expect(removed).toBeNull();
    expect(await getSetLogsForSession(db, session.id as number)).toEqual([]);
  });

  it('deletes the most recent working set and returns the deleted row', async () => {
    const { db, session } = await setup();
    await appendSetLog(db, {
      sessionId: session.id as number,
      index: 0,
      kind: 'working',
      prescribedWeight: 162.5,
      prescribedReps: 5,
      actualReps: 5,
    });
    const second = await appendSetLog(db, {
      sessionId: session.id as number,
      index: 1,
      kind: 'working',
      prescribedWeight: 187.5,
      prescribedReps: 5,
      actualReps: 5,
    });
    const removed = await undoLastWorkingSet(db, session.id as number);
    expect(removed?.id).toBe(second.id);
    expect(removed?.index).toBe(1);
    const remaining = await getSetLogsForSession(db, session.id as number);
    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.index).toBe(0);
  });

  it('returns null and leaves the row in place when the most recent row is AMRAP', async () => {
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
      index: 2,
      kind: 'amrap',
      prescribedWeight: 212.5,
      prescribedReps: 5,
      actualReps: 8,
    });
    const removed = await undoLastWorkingSet(db, session.id as number);
    expect(removed).toBeNull();
    const remaining = await getSetLogsForSession(db, session.id as number);
    expect(remaining).toHaveLength(2);
  });

  it('getLifetimeVolume counts working + amrap + bbb rows on completed sessions (warmups excluded)', async () => {
    const { db, session } = await setup();
    // 1 working: 200×5 = 1000
    await appendSetLog(db, {
      sessionId: session.id as number,
      index: 0,
      kind: 'working',
      prescribedWeight: 200,
      prescribedReps: 5,
      actualReps: 5,
    });
    // 1 amrap: 250×8 = 2000
    await appendSetLog(db, {
      sessionId: session.id as number,
      index: 2,
      kind: 'amrap',
      prescribedWeight: 250,
      prescribedReps: 5,
      actualReps: 8,
    });
    // 5 bbb: 125×10×5 = 6250
    for (let i = 0; i < 5; i += 1) {
      await appendSetLog(db, {
        sessionId: session.id as number,
        index: i,
        kind: 'bbb',
        prescribedWeight: 125,
        prescribedReps: 10,
        actualReps: 10,
      });
    }
    // 1 warmup: 100×5 = 500 — must be excluded.
    await appendSetLog(db, {
      sessionId: session.id as number,
      index: 0,
      kind: 'warmup',
      prescribedWeight: 100,
      prescribedReps: 5,
      actualReps: 5,
    });
    // Volume only counts on completed sessions.
    await completeSession(db, session.id as number);
    const total = await getLifetimeVolume(db);
    expect(total).toBe(1000 + 2000 + 6250);
  });
});
