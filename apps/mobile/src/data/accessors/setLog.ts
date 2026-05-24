/**
 * SetLog accessors.
 *
 * Mirrors the PWA accessors at `~/Development/531-pwa/src/db/accessors/setLog.ts`.
 *
 * `appendSetLog` is the single write path for the `set_logs` table. For AMRAP
 * sets it additionally:
 *   1. Looks up the parent session's lift.
 *   2. Computes the Epley estimated 1RM from `prescribedWeight` × `actualReps`.
 *   3. Compares against the existing `prs` row (if any) for that lift and
 *      stamps `isPR` + `estimated1RM` onto the new row.
 *   4. Upserts the `prs` row pointing back at the new set log id when it is a
 *      new PR.
 *
 * Transactional trade-off: the PWA wraps the AMRAP path in a Dexie transaction
 * so a crash can't produce a SetLog with isPR=true and no PR row, or vice
 * versa. drizzle-orm's `db.transaction((tx) => ...)` exists but its typing
 * varies across drivers and we'd need to thread the tx through the `prs`
 * accessors (which take `AnyDb`). Since the mobile DB is single-writer (JS
 * event loop, no concurrent expo-sqlite writers in practice) we skip the
 * wrapper. Each call's reads/writes are still sequential.
 */
import { eq, sql } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import { estimateOneRm } from '../../domain/epley';
import type { Lift } from '../../domain/types';
import { sessions, setLogs } from '../drizzle/schema';
import { _upsertPR, getPR } from './prs';

// biome-ignore lint/suspicious/noExplicitAny: structural typing for cross-driver drizzle
type AnyDb = BaseSQLiteDatabase<any, any, any>;

export type SetLog = typeof setLogs.$inferSelect;
export type AppendSetLogInput = Omit<SetLog, 'id' | 'completedAt' | 'isPR' | 'estimated1RM'>;

/**
 * Append a row to `set_logs`. For AMRAP sets, computes estimated 1RM,
 * compares to the existing PR for the parent session's lift, and upserts the
 * `prs` row when a new PR is set.
 *
 * Throws if `kind === 'amrap'` and the referenced session does not exist —
 * callers should always create the session first.
 */
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

/** Return every set log row for a given session in insertion order. */
export async function getSetLogsForSession(db: AnyDb, sessionId: number): Promise<SetLog[]> {
  return (await Promise.resolve(
    db.select().from(setLogs).where(eq(setLogs.sessionId, sessionId)),
  )) as SetLog[];
}

/**
 * Return the distinct session ids that have at least one `isPR = true` row.
 *
 * Used by the History tab to render a PR marker on rows that produced a
 * personal record. Returning ids (not full rows) keeps the wire small and
 * matches the consumer's `Set<number>.has(id)` access pattern.
 */
export async function getSessionIdsWithPrs(db: AnyDb): Promise<number[]> {
  const rows = (await Promise.resolve(
    db
      .selectDistinct({ sessionId: setLogs.sessionId })
      .from(setLogs)
      .where(sql`${setLogs.isPR} = 1`),
  )) as Array<{ sessionId: number }>;
  return rows.map((r) => r.sessionId);
}
