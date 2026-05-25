/**
 * Per-lift session + AMRAP accessor for the Progress screen.
 *
 * Returns, for one lift, every completed session paired with that
 * session's AMRAP row (if any). The Progress grid uses this to render
 * each past cycle's right-column e1RM (max across the cycle's AMRAP
 * sets) and to drive the past-cell tap target → SessionComplete.
 *
 * Implemented as a LEFT JOIN: a completed session might not have an
 * AMRAP row if logging was interrupted, so we surface it as a row with
 * `amrap === null`. Rows are returned newest-first by `startedAt` for
 * deterministic ordering (matching `getSessions`).
 *
 * One row per session — the spec's reshape hook groups by `cycle` /
 * `day` downstream. Working sets are NOT joined here; PAST e1RM
 * displayed in the grid is computed from AMRAP rows alone (the
 * heaviest e1RM event of any cycle is always the AMRAP top set). Per
 * the spec's `bestE1RMForCycle` contract, the caller could expand to
 * include working sets too, but the Progress feature only needs the
 * AMRAP top per (session, day).
 */
import { and, desc, eq } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type { Lift } from '../../domain/types';
import { sessions, setLogs } from '../drizzle/schema';

// biome-ignore lint/suspicious/noExplicitAny: structural typing for cross-driver drizzle
type AnyDb = BaseSQLiteDatabase<any, any, any>;

export type CompletedSessionWithAmrap = {
  sessionId: number;
  lift: Lift;
  cycle: number;
  week: number;
  startedAt: number;
  trainingMaxSnapshot: number;
  storageUnitSnapshot: 'lbs' | 'kg' | null;
  displayUnitSnapshot: 'lbs' | 'kg' | null;
  amrap: {
    setLogId: number;
    prescribedWeight: number;
    prescribedReps: number;
    actualReps: number;
    estimated1RM: number | null;
  } | null;
};

/**
 * Every completed session for `lift`, newest first, each paired with its
 * AMRAP set-log row (or `null` if no AMRAP was logged).
 *
 * Cross-driver LEFT JOIN: drizzle returns `{ session, amrap }` shaped
 * rows; we flatten to the export shape so consumers don't need to know
 * about the join wrapper. The AMRAP filter sits inside the join `ON`
 * clause — otherwise a session without an AMRAP would be filtered out
 * by the WHERE.
 */
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
        prescribedWeight: setLogs.prescribedWeight,
        prescribedReps: setLogs.prescribedReps,
        actualReps: setLogs.actualReps,
        estimated1RM: setLogs.estimated1RM,
      })
      .from(sessions)
      .leftJoin(setLogs, and(eq(setLogs.sessionId, sessions.id), eq(setLogs.kind, 'amrap')))
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
    prescribedWeight: number | null;
    prescribedReps: number | null;
    actualReps: number | null;
    estimated1RM: number | null;
  }>;

  // Multiple amrap rows per session are possible in pathological data; pick
  // the highest-e1RM row per session to surface the best AMRAP attempt.
  // Same `sessionId` could appear multiple times in the join; collapse.
  const bySessionId = new Map<number, CompletedSessionWithAmrap>();
  for (const r of rows) {
    const existing = bySessionId.get(r.sessionId);
    const amrap =
      r.setLogId !== null &&
      r.prescribedWeight !== null &&
      r.prescribedReps !== null &&
      r.actualReps !== null
        ? {
            setLogId: r.setLogId,
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
        amrap,
      });
      continue;
    }
    // Replace amrap if this row beats the prior one.
    if (
      amrap !== null &&
      (existing.amrap === null || (amrap.estimated1RM ?? 0) > (existing.amrap.estimated1RM ?? 0))
    ) {
      existing.amrap = amrap;
    }
  }
  return Array.from(bySessionId.values()).sort(
    (a, b) => b.startedAt - a.startedAt || b.sessionId - a.sessionId,
  );
}
