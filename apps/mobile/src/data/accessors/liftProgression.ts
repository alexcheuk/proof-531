import { and, desc, eq, inArray } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type { Lift } from '../../domain/types';
import { sessions, setLogs } from '../drizzle/schema';

// biome-ignore lint/suspicious/noExplicitAny: structural typing for cross-driver drizzle
type AnyDb = BaseSQLiteDatabase<any, any, any>;

/**
 * Per-cycle "headline" set surfaced to the Progress grid. AMRAP for weeks
 * 1–3; TM test for week 4 (post-migration); `null` when the session was
 * logged without one (interrupted session, legacy `'working'` deload).
 *
 * `kind` distinguishes AMRAP rows from TM-test rows so the Progress grid
 * can render the right marker glyph (band-derived for tm-test; rep count
 * for AMRAP).
 */
type CompletedSessionTopSet = {
  setLogId: number;
  kind: 'amrap' | 'tm-test';
  prescribedWeight: number;
  prescribedReps: number;
  actualReps: number;
  estimated1RM: number | null;
};

export type CompletedSessionWithAmrap = {
  sessionId: number;
  lift: Lift;
  cycle: number;
  week: number;
  startedAt: number;
  trainingMaxSnapshot: number;
  storageUnitSnapshot: 'lbs' | 'kg' | null;
  displayUnitSnapshot: 'lbs' | 'kg' | null;
  /**
   * AMRAP set for weeks 1–3 (`kind === 'amrap'`). On week-4 TM-test sessions
   * (post-migration) the same field surfaces the tm-test top set
   * (`kind === 'tm-test'`). Legacy `'working'` deload sessions still resolve
   * to `null` — they had no AMRAP and predate the TM test.
   *
   * Field name unchanged for backward compatibility with the consumer; the
   * Progress grid branches on the inner `kind` to pick the right cell shape.
   */
  amrap: CompletedSessionTopSet | null;
};

// AMRAP filter is inside the JOIN ON clause (not WHERE) so sessions without an AMRAP aren't dropped.
export async function getCompletedSessionsWithAmrapForLift(
  db: AnyDb,
  lift: Lift,
): Promise<CompletedSessionWithAmrap[]> {
  const rows = (await Promise.resolve(
    db
      .select({
        sessionId: sessions.id,
        lift: sessions.lift,
        cycle: sessions.cycle,
        week: sessions.week,
        startedAt: sessions.startedAt,
        trainingMaxSnapshot: sessions.trainingMaxSnapshot,
        storageUnitSnapshot: sessions.storageUnitSnapshot,
        displayUnitSnapshot: sessions.displayUnitSnapshot,
        setLogId: setLogs.id,
        setLogKind: setLogs.kind,
        prescribedWeight: setLogs.prescribedWeight,
        prescribedReps: setLogs.prescribedReps,
        actualReps: setLogs.actualReps,
        estimated1RM: setLogs.estimated1RM,
      })
      .from(sessions)
      .leftJoin(
        setLogs,
        and(eq(setLogs.sessionId, sessions.id), inArray(setLogs.kind, ['amrap', 'tm-test'])),
      )
      .where(and(eq(sessions.lift, lift), eq(sessions.status, 'completed')))
      .orderBy(desc(sessions.startedAt), desc(sessions.id)),
  )) as Array<{
    sessionId: number;
    lift: Lift;
    cycle: number;
    week: number;
    startedAt: number;
    trainingMaxSnapshot: number;
    storageUnitSnapshot: 'lbs' | 'kg' | null;
    displayUnitSnapshot: 'lbs' | 'kg' | null;
    setLogId: number | null;
    setLogKind: 'amrap' | 'tm-test' | null;
    prescribedWeight: number | null;
    prescribedReps: number | null;
    actualReps: number | null;
    estimated1RM: number | null;
  }>;

  // Multiple top-set rows per session are possible in pathological data
  // (e.g. an amrap re-attempt; a session that somehow logged both kinds).
  // Pick the row with the highest e1RM-equivalent magnitude per session.
  // Same `sessionId` can appear multiple times in the join; collapse.
  const bySessionId = new Map<number, CompletedSessionWithAmrap>();
  for (const r of rows) {
    const existing = bySessionId.get(r.sessionId);
    const topSet: CompletedSessionTopSet | null =
      r.setLogId !== null &&
      r.setLogKind !== null &&
      r.prescribedWeight !== null &&
      r.prescribedReps !== null &&
      r.actualReps !== null
        ? {
            setLogId: r.setLogId,
            kind: r.setLogKind,
            prescribedWeight: r.prescribedWeight,
            prescribedReps: r.prescribedReps,
            actualReps: r.actualReps,
            estimated1RM: r.estimated1RM,
          }
        : null;
    if (!existing) {
      bySessionId.set(r.sessionId, {
        sessionId: r.sessionId,
        lift: r.lift,
        cycle: r.cycle,
        week: r.week,
        startedAt: r.startedAt,
        trainingMaxSnapshot: r.trainingMaxSnapshot,
        storageUnitSnapshot: r.storageUnitSnapshot,
        displayUnitSnapshot: r.displayUnitSnapshot,
        amrap: topSet,
      });
      continue;
    }
    // Replace the existing top set when this row's e1RM is strictly higher.
    // tm-test rows carry `estimated1RM === null` (no PR semantics), so the
    // existing amrap row wins ties — keeping the AMRAP preference on the
    // pathological "both kinds logged for one session" path. A session that
    // only logged a tm-test stores it via the !existing branch above.
    if (
      topSet !== null &&
      (existing.amrap === null || (topSet.estimated1RM ?? 0) > (existing.amrap.estimated1RM ?? 0))
    ) {
      existing.amrap = topSet;
    }
  }
  return Array.from(bySessionId.values()).sort(
    (a, b) => b.startedAt - a.startedAt || b.sessionId - a.sessionId,
  );
}
