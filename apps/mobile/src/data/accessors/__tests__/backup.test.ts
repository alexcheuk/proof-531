import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import fc from 'fast-check';
import { runMigrations } from '../../drizzle/runMigrations';
import * as schema from '../../drizzle/schema';
import { BACKUP_SCHEMA_VERSION, exportBackup, importBackup, parseBackup } from '../backup';

type TestDb = ReturnType<typeof drizzle<typeof schema>>;

function freshDb(): { db: TestDb; sqlite: BetterSqlite3.Database } {
  const sqlite = new BetterSqlite3(':memory:');
  runMigrations(sqlite);
  return { db: drizzle(sqlite, { schema }), sqlite };
}

const LIFTS = ['squat', 'bench', 'deadlift', 'press'] as const;

// Seed a representative, FK-consistent DB: settings + TMs + sessions
// (completed AND in-progress) + set logs + a PR + goals + miss state.
async function seedFullDb(db: TestDb): Promise<void> {
  await db.insert(schema.settings).values({
    id: 1,
    storageUnit: 'lbs',
    displayUnit: 'lbs',
    plateSet: 'standard',
    enabledLifts: JSON.stringify(['squat', 'bench', 'deadlift', 'press']),
    currentCycle: 2,
    week: 1,
    day: 1,
    restTargetSeconds: 180,
    bbbRestTargetSeconds: 90,
    liveScreenInverted: 0,
    storeReviewRequested: 0,
  });

  for (const lift of LIFTS) {
    await db.insert(schema.trainingMaxes).values({
      lift,
      value: 200,
      unit: 'lbs',
      updatedAt: 1000,
      note: null,
    });
    await db.insert(schema.liftProgress).values({
      lift,
      currentCycle: 1,
      week: 1,
      updatedAt: 1000,
    });
  }

  // One completed session with a set log + PR.
  const completed = await db
    .insert(schema.sessions)
    .values({
      lift: 'squat',
      cycle: 1,
      week: 1,
      startedAt: 100,
      endedAt: 200,
      status: 'completed',
      trainingMaxSnapshot: 200,
      storageUnitSnapshot: 'lbs',
      displayUnitSnapshot: 'lbs',
    })
    .returning();
  const completedId = completed[0]?.id as number;

  // One in-progress session whose set log must NOT appear in the backup.
  const active = await db
    .insert(schema.sessions)
    .values({
      lift: 'bench',
      cycle: 1,
      week: 1,
      startedAt: 300,
      endedAt: null,
      status: 'in_progress',
      trainingMaxSnapshot: 150,
      storageUnitSnapshot: 'lbs',
      displayUnitSnapshot: 'lbs',
    })
    .returning();
  const activeId = active[0]?.id as number;

  const log = await db
    .insert(schema.setLogs)
    .values({
      sessionId: completedId,
      index: 0,
      kind: 'amrap',
      prescribedWeight: 180,
      prescribedReps: 5,
      actualReps: 8,
      completedAt: 150,
      isPR: true,
      estimated1RM: 228,
    })
    .returning();
  const logId = log[0]?.id as number;

  // Set log for the in-progress session  -  excluded from the backup.
  await db.insert(schema.setLogs).values({
    sessionId: activeId,
    index: 0,
    kind: 'working',
    prescribedWeight: 130,
    prescribedReps: 5,
    actualReps: 5,
    completedAt: 350,
    isPR: false,
    estimated1RM: null,
  });

  await db.insert(schema.prs).values({
    lift: 'squat',
    bestE1RM: 228,
    setLogId: logId,
    achievedAt: 150,
  });

  await db.insert(schema.liftGoals).values({
    lift: 'squat',
    kind: '1rm',
    targetValue: 315,
    unit: 'lbs',
    updatedAt: 1000,
    daysPerWeek: 3,
  });

  await db.insert(schema.liftMissState).values({
    lift: 'squat',
    missCount: 1,
    lastMissDate: '2026-06-01',
    updatedAt: '2026-06-01',
  });
}

async function dumpTables(db: TestDb) {
  return {
    settings: await db.select().from(schema.settings),
    trainingMaxes: await db.select().from(schema.trainingMaxes),
    liftProgress: await db.select().from(schema.liftProgress),
    sessions: await db.select().from(schema.sessions),
    setLogs: await db.select().from(schema.setLogs),
    prs: await db.select().from(schema.prs),
    liftGoals: await db.select().from(schema.liftGoals),
    liftMissState: await db.select().from(schema.liftMissState),
  };
}

describe('parseBackup', () => {
  function validEnvelope() {
    return {
      schemaVersion: BACKUP_SCHEMA_VERSION,
      appVersion: '1.0.0',
      exportedAt: '2026-06-13T00:00:00.000Z',
      tables: {
        settings: [],
        trainingMaxes: [],
        liftProgress: [],
        sessions: [],
        setLogs: [],
        prs: [],
        liftGoals: [],
        liftMissState: [],
      },
    };
  }

  it('rejects empty string as invalid-json', () => {
    expect(parseBackup('')).toEqual({ ok: false, reason: 'invalid-json' });
  });

  it('rejects garbage text as invalid-json', () => {
    expect(parseBackup('not json at all {{{')).toEqual({
      ok: false,
      reason: 'invalid-json',
    });
  });

  it('rejects an empty object as wrong-shape', () => {
    expect(parseBackup('{}')).toEqual({ ok: false, reason: 'wrong-shape' });
  });

  it('rejects a JSON array as wrong-shape', () => {
    expect(parseBackup('[]')).toEqual({ ok: false, reason: 'wrong-shape' });
  });

  it('rejects a future schemaVersion as unsupported-version', () => {
    const env = { ...validEnvelope(), schemaVersion: 999 };
    expect(parseBackup(JSON.stringify(env))).toEqual({
      ok: false,
      reason: 'unsupported-version',
    });
  });

  it('rejects an envelope missing a required table key as wrong-shape', () => {
    const env = validEnvelope();
    // biome-ignore lint/performance/noDelete: test mutation to remove a key
    delete (env.tables as Record<string, unknown>).prs;
    expect(parseBackup(JSON.stringify(env))).toEqual({
      ok: false,
      reason: 'wrong-shape',
    });
  });

  it('rejects an envelope whose table value is not an array as wrong-shape', () => {
    const env = validEnvelope();
    (env.tables as Record<string, unknown>).sessions = { not: 'an array' };
    expect(parseBackup(JSON.stringify(env))).toEqual({
      ok: false,
      reason: 'wrong-shape',
    });
  });

  it('accepts a well-formed empty envelope', () => {
    const result = parseBackup(JSON.stringify(validEnvelope()));
    expect(result.ok).toBe(true);
  });
});

describe('exportBackup / importBackup round-trip', () => {
  it('exports only completed sessions and their set logs', async () => {
    const { db } = freshDb();
    await seedFullDb(db);

    const json = await exportBackup(db);
    const parsed = parseBackup(json);
    if (!parsed.ok) throw new Error(`expected ok, got ${parsed.reason}`);

    const { tables } = parsed.envelope;
    expect(tables.sessions).toHaveLength(1);
    expect(tables.sessions[0]?.status).toBe('completed');
    // Only the set log belonging to the completed session.
    expect(tables.setLogs).toHaveLength(1);
    const keptSessionId = tables.sessions[0]?.id;
    expect(tables.setLogs[0]?.sessionId).toBe(keptSessionId);
  });

  it('restores every table byte-for-byte after a wipe (ids preserved for FKs)', async () => {
    const { db } = freshDb();
    await seedFullDb(db);

    const before = await dumpTables(db);
    // Export captures only completed sessions; build the expected post-restore
    // state by dropping in-progress sessions and their orphaned set logs.
    const keptSessionIds = new Set(
      before.sessions.filter((s) => s.status === 'completed').map((s) => s.id),
    );
    const expected = {
      ...before,
      sessions: before.sessions.filter((s) => keptSessionIds.has(s.id)),
      setLogs: before.setLogs.filter((l) => keptSessionIds.has(l.sessionId)),
    };

    const json = await exportBackup(db);
    const result = await importBackup(db, json);
    expect(result.sessionCount).toBe(expected.sessions.length);
    expect(result.tmCount).toBe(expected.trainingMaxes.length);

    const after = await dumpTables(db);
    expect(after).toEqual(expected);
  });

  it('importBackup wipes liftMissState rows not present in the backup', async () => {
    const { db } = freshDb();
    await seedFullDb(db);

    // Export, then add a NEW miss-state row that the backup does not contain.
    const json = await exportBackup(db);
    await db.insert(schema.liftMissState).values({
      lift: 'bench',
      missCount: 5,
      lastMissDate: '2026-06-10',
      updatedAt: '2026-06-10',
    });

    await importBackup(db, json);
    const missRows = await db.select().from(schema.liftMissState);
    // The post-export bench row must be gone  -  importBackup clears liftMissState.
    expect(missRows.map((r) => r.lift)).toEqual(['squat']);
  });
});

describe('importBackup validation safety', () => {
  it('leaves the DB unchanged when the payload is invalid JSON', async () => {
    const { db } = freshDb();
    await seedFullDb(db);
    const before = await dumpTables(db);

    await expect(importBackup(db, 'not valid json')).rejects.toThrow();

    const after = await dumpTables(db);
    expect(after).toEqual(before);
  });

  it('leaves the DB unchanged when the payload has the wrong shape', async () => {
    const { db } = freshDb();
    await seedFullDb(db);
    const before = await dumpTables(db);

    await expect(importBackup(db, '{}')).rejects.toThrow();

    const after = await dumpTables(db);
    expect(after).toEqual(before);
  });

  it('leaves the DB unchanged when the schemaVersion is unsupported', async () => {
    const { db } = freshDb();
    await seedFullDb(db);
    const before = await dumpTables(db);

    const future = JSON.stringify({
      schemaVersion: 999,
      appVersion: '9.9.9',
      exportedAt: '2026-06-13T00:00:00.000Z',
      tables: {
        settings: [],
        trainingMaxes: [],
        liftProgress: [],
        sessions: [],
        setLogs: [],
        prs: [],
        liftGoals: [],
        liftMissState: [],
      },
    });
    await expect(importBackup(db, future)).rejects.toThrow();

    const after = await dumpTables(db);
    expect(after).toEqual(before);
  });
});

describe('parseBackup round-trip property', () => {
  it('any well-formed envelope survives serialize then parse losslessly', () => {
    const tmArb = fc.record({
      id: fc.integer({ min: 1, max: 100000 }),
      lift: fc.constantFrom(...LIFTS),
      value: fc.integer({ min: 1, max: 1000 }),
      unit: fc.constantFrom('lbs', 'kg'),
      updatedAt: fc.integer({ min: 0 }),
      note: fc.option(fc.string(), { nil: null }),
    });

    fc.assert(
      fc.property(fc.array(tmArb, { maxLength: 10 }), (trainingMaxes) => {
        const envelope = {
          schemaVersion: BACKUP_SCHEMA_VERSION,
          appVersion: '1.0.0',
          exportedAt: '2026-06-13T00:00:00.000Z',
          tables: {
            settings: [],
            trainingMaxes,
            liftProgress: [],
            sessions: [],
            setLogs: [],
            prs: [],
            liftGoals: [],
            liftMissState: [],
          },
        };
        const result = parseBackup(JSON.stringify(envelope));
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.envelope).toEqual(envelope);
        }
      }),
    );
  });
});
