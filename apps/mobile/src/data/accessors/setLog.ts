// No transaction wrapper: mobile DB is single-writer (JS event loop), so sequential reads/writes are safe.
// A crash between isPR=true and the prs upsert would leave a stale state — accepted trade-off vs. drizzle tx typing.
import { desc, eq, sql } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import { estimateOneRm } from '../../domain/epley';
import type { Lift } from '../../domain/types';
import { sessions, setLogs } from '../drizzle/schema';
import { _upsertPR, getPR } from './prs';

// biome-ignore lint/suspicious/noExplicitAny: structural typing for cross-driver drizzle
type AnyDb = BaseSQLiteDatabase<any, any, any>;

export type SetLog = typeof setLogs.$inferSelect;
type AppendSetLogInput = Omit<SetLog, 'id' | 'completedAt' | 'isPR' | 'estimated1RM'>;

export async function appendSetLog(db: AnyDb, input: AppendSetLogInput): Promise<SetLog> {
  const baseRow = { ...input, completedAt: Date.now() };

  if (input.kind === 'amrap') {
    const sessionRows = (await Promise.resolve(
      db.select().from(sessions).where(eq(sessions.id, input.sessionId)),
    )) as Array<{ lift: Lift }>;
    const session = sessionRows[0];
    if (!session) {
      throw new Error(`appendSetLog: session ${input.sessionId} does not exist`);
    }
    const estimated1RM = estimateOneRm(input.prescribedWeight, input.actualReps);
    const existingPR = await getPR(db, session.lift);
    const isPR = estimated1RM > (existingPR?.bestE1RM ?? 0);
    const fullRow = { ...baseRow, estimated1RM, isPR };
    const inserted = (await Promise.resolve(
      db.insert(setLogs).values(fullRow).returning(),
    )) as SetLog[];
    const row = inserted[0];
    if (!row) throw new Error('appendSetLog: insert returned no row');
    if (isPR) {
      await _upsertPR(db, {
        lift: session.lift,
        bestE1RM: estimated1RM,
        setLogId: row.id ?? -1,
        achievedAt: Date.now(),
      });
    }
    return row;
  }

  const inserted = (await Promise.resolve(
    db.insert(setLogs).values(baseRow).returning(),
  )) as SetLog[];
  const row = inserted[0];
  if (!row) throw new Error('appendSetLog: insert returned no row');
  return row;
}

// Only undoes 'working' rows — undoing 'amrap' would cascade into prs, which is out of scope.
export async function undoLastWorkingSet(db: AnyDb, sessionId: number): Promise<SetLog | null> {
  const rows = (await Promise.resolve(
    db
      .select()
      .from(setLogs)
      .where(eq(setLogs.sessionId, sessionId))
      .orderBy(desc(setLogs.id))
      .limit(1),
  )) as SetLog[];
  const last = rows[0];
  if (!last) return null;
  if (last.kind !== 'working') return null;
  await Promise.resolve(db.delete(setLogs).where(eq(setLogs.id, last.id)));
  return last;
}

// Orders by id (not completedAt) — completedAt can collide on rapid back-to-back writes; autoincrement id is safe.
export async function getSetLogsForSession(db: AnyDb, sessionId: number): Promise<SetLog[]> {
  return (await Promise.resolve(
    db.select().from(setLogs).where(eq(setLogs.sessionId, sessionId)).orderBy(setLogs.id),
  )) as SetLog[];
}

export async function getSessionIdsWithPrs(db: AnyDb): Promise<number[]> {
  const rows = (await Promise.resolve(
    db
      .selectDistinct({ sessionId: setLogs.sessionId })
      .from(setLogs)
      .where(sql`${setLogs.isPR} = 1`),
  )) as Array<{ sessionId: number }>;
  return rows.map((r) => r.sessionId);
}

// BBB included (wired in loop-008): lifetime tally reflects every plate moved. Warmups and assistance excluded.
export async function getLifetimeVolume(db: AnyDb): Promise<number> {
  const rows = (await Promise.resolve(
    db
      .select({
        total: sql<number | null>`
          SUM(${setLogs.prescribedWeight} * ${setLogs.actualReps})
        `,
      })
      .from(setLogs)
      .innerJoin(sessions, eq(setLogs.sessionId, sessions.id))
      .where(
        sql`${sessions.status} = 'completed' AND (${setLogs.kind} = 'working' OR ${setLogs.kind} = 'amrap' OR ${setLogs.kind} = 'bbb')`,
      ),
  )) as Array<{ total: number | null }>;
  const total = rows[0]?.total;
  return total === null || total === undefined ? 0 : total;
}

/**
 * Return the max `estimated1RM` across all set_logs for a given lift,
 * excluding rows from `excludingSessionId`. Used by the SessionComplete
 * PR certificate to render the prior best — the `prs` row alone is
 * insufficient because `appendSetLog` has already overwritten it with
 * THIS session's new best by the time the screen mounts.
 *
 * Returns `0` when no other completed-session AMRAP rows exist for the
 * lift (i.e. this is the first PR ever for that lift).
 */
export async function getPreviousBestE1RM(
  db: AnyDb,
  lift: Lift,
  excludingSessionId: number,
): Promise<number> {
  const rows = (await Promise.resolve(
    db
      .select({ estimated1RM: setLogs.estimated1RM })
      .from(setLogs)
      .innerJoin(sessions, eq(setLogs.sessionId, sessions.id))
      .where(
        sql`${sessions.lift} = ${lift} AND ${sessions.status} = 'completed' AND ${setLogs.sessionId} <> ${excludingSessionId} AND ${setLogs.estimated1RM} IS NOT NULL`,
      ),
  )) as Array<{ estimated1RM: number | null }>;
  let max = 0;
  for (const r of rows) {
    if (r.estimated1RM !== null && r.estimated1RM > max) max = r.estimated1RM;
  }
  return max;
}
