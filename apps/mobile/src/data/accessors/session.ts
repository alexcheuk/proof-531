// Invariant: createSession snapshots the TM value/unit AND displayUnit into the row.
// That snapshot is the source of truth for prescribed weights — TM edits and unit flips must NOT mutate it.
// No transactions: the mobile DB is single-writer (JS event loop), so sequential reads/writes are safe.
import { and, desc, eq, isNotNull, ne } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type { Lift } from '../../domain/types';
import { prs, sessions, setLogs } from '../drizzle/schema';
import { advanceLift, getLiftProgress } from './liftProgress';
import { getSettings } from './settings';
import { getCurrentTrainingMaxes } from './trainingMax';

// biome-ignore lint/suspicious/noExplicitAny: structural-poly across sqlite drivers
type AnyDb = BaseSQLiteDatabase<any, any, any>;

export type Session = typeof sessions.$inferSelect;

export async function createSession(db: AnyDb, lift: Lift): Promise<Session> {
  // Single-session invariant: reuse any existing in_progress row for this
  // lift; refuse to create a parallel session while another lift's session
  // is open.
  const active = await getActiveSession(db);
  if (active) {
    if (active.lift === lift) return active;
    throw new Error(`createSession: an in-progress session already exists for '${active.lift}'`);
  }
  const settings = await getSettings(db);
  const progress = await getLiftProgress(db, lift);
  const tms = await getCurrentTrainingMaxes(db);
  const tm = tms.find((t) => t.lift === lift);
  if (!tm) {
    throw new Error(`createSession: no TrainingMax exists for lift '${lift}'`);
  }
  // Snapshot BOTH units AND this lift's own cycle/week:
  //   cycle/week ← lift_progress[lift] (per-lift split — each lift moves
  //     through its own 5/3/1 cycle independently; see liftProgress.ts).
  //   storageUnitSnapshot ← tm.unit  (drives the snap math + writes for
  //     this session — invariant from docs/technical-design.md §4).
  //   displayUnitSnapshot ← settings.displayUnit (drives the render
  //     conversion). A mid-session display flip in Settings must NOT
  //     change which currency this session renders in.
  const row = {
    lift,
    cycle: progress.currentCycle,
    week: progress.week,
    startedAt: Date.now(),
    status: 'in_progress' as const,
    trainingMaxSnapshot: tm.value,
    storageUnitSnapshot: tm.unit,
    displayUnitSnapshot: settings.displayUnit ?? settings.storageUnit,
  };
  const inserted = await Promise.resolve(db.insert(sessions).values(row).returning());
  const result = (inserted as Session[])[0];
  if (!result) throw new Error('createSession: insert returned no row');
  return result;
}

/** Look up a session row by id. Returns null when no row matches. */
export async function getSession(db: AnyDb, sessionId: number): Promise<Session | null> {
  const rows = await Promise.resolve(db.select().from(sessions).where(eq(sessions.id, sessionId)));
  return (rows as Session[])[0] ?? null;
}

/**
 * Return the (single) currently in-progress session, if any.
 *
 * The data model assumes the single-session invariant (§4): at most one row
 * with `status === 'in_progress'` exists. This accessor returns the first
 * such row.
 */
export async function getActiveSession(db: AnyDb): Promise<Session | null> {
  const rows = (await Promise.resolve(
    db.select().from(sessions).where(eq(sessions.status, 'in_progress')),
  )) as Session[];
  return rows[0] ?? null;
}

/**
 * Return every session, newest first. Backs the History tab list.
 *
 * Ordered by `startedAt DESC` (then `id DESC` as a tiebreaker for sessions
 * created within the same millisecond — rare in practice, but keeps the
 * ordering deterministic for tests).
 */
export async function getSessions(db: AnyDb): Promise<Session[]> {
  const rows = await Promise.resolve(
    db.select().from(sessions).orderBy(desc(sessions.startedAt), desc(sessions.id)),
  );
  return rows as Session[];
}

/**
 * Mark a session complete and advance THIS lift's progress (which may wrap
 * into the next cycle, bumping that lift's TM — see
 * `liftProgress.advanceLift`). Other lifts' progress is untouched, because
 * each lift runs its own 5/3/1 cycle independently.
 *
 * Idempotent — calling on an already-completed (or cancelled, or missing)
 * session is a no-op. Callers do not need to guard on status.
 */
export async function completeSession(db: AnyDb, sessionId: number): Promise<void> {
  const row = await getSession(db, sessionId);
  if (!row || row.status !== 'in_progress') return;
  await Promise.resolve(
    db
      .update(sessions)
      .set({ status: 'completed', endedAt: Date.now() })
      .where(eq(sessions.id, sessionId)),
  );
  await advanceLift(db, row.lift);
}

/**
 * Mark a session cancelled. Idempotent — no-ops for missing or already-
 * finished sessions. Used when the user disables a lift that still has
 * an in-progress session for it (otherwise that ghost session keeps
 * stealing every Begin-CTA tap on Home — Discord 1508768403).
 */
export async function cancelSession(db: AnyDb, sessionId: number): Promise<void> {
  const row = await getSession(db, sessionId);
  if (!row || row.status !== 'in_progress') return;
  await Promise.resolve(
    db
      .update(sessions)
      .set({ status: 'cancelled', endedAt: Date.now() })
      .where(eq(sessions.id, sessionId)),
  );
}

/**
 * Reset a still-in-progress session: delete every set log for it,
 * stamp a fresh `startedAt`, and rebuild the lift's `prs.bestE1RM`
 * from the remaining (other-session) AMRAP rows. Leaves
 * `status === 'in_progress'`. Used by the Restart pill on the Today
 * top bar (loop-004; previously Live) so the user can scrap a
 * miss-logged attempt and start over without cycling through the
 * cancel → today → begin flow.
 *
 * Throws if the session row is missing or already finished
 * (completed / cancelled).
 *
 * PR-rebuild contract (loop-005): if this session set a PR via its
 * now-deleted AMRAP row, the stale `prs.bestE1RM` would otherwise
 * survive — the History tab's best-lift badge and the AMRAP
 * projection chip would both compare against a number with no
 * supporting set_log. We recompute: select max estimated_1rm across
 * remaining completed/in-progress sessions' AMRAP logs for this
 * lift; if none remain, delete the prs row entirely; otherwise
 * update it. The setLogId pointer is best-effort — we point it at
 * the newest remaining AMRAP row with the new max e1RM.
 */
export async function resetSession(db: AnyDb, sessionId: number): Promise<void> {
  const rows = (await Promise.resolve(
    db.select().from(sessions).where(eq(sessions.id, sessionId)),
  )) as Array<{ status: string; lift: Lift }>;
  const session = rows[0];
  if (!session) {
    throw new Error(`resetSession: session ${sessionId} does not exist`);
  }
  if (session.status !== 'in_progress') {
    throw new Error(`resetSession: session ${sessionId} is ${session.status}, not in_progress`);
  }
  // PR rebuild must happen BEFORE we delete this session's set_logs,
  // because `prs.set_log_id` is a NOT NULL FK to `set_logs.id` with
  // no ON DELETE CASCADE. Deleting a set_log that `prs` points at
  // would fail with `FOREIGN KEY constraint failed`. So: compute the
  // surviving best across other sessions, repoint or delete the prs
  // row, THEN delete this session's set_logs.
  const surviving = (await Promise.resolve(
    db
      .select({ id: setLogs.id, e1rm: setLogs.estimated1RM })
      .from(setLogs)
      .innerJoin(sessions, eq(setLogs.sessionId, sessions.id))
      .where(
        and(
          eq(sessions.lift, session.lift),
          eq(setLogs.kind, 'amrap'),
          isNotNull(setLogs.estimated1RM),
          ne(setLogs.sessionId, sessionId),
        ),
      )
      .orderBy(desc(setLogs.estimated1RM), desc(setLogs.completedAt)),
  )) as Array<{ id: number; e1rm: number | null }>;

  const best = surviving[0];
  if (!best || best.e1rm == null) {
    await Promise.resolve(db.delete(prs).where(eq(prs.lift, session.lift)));
  } else {
    await Promise.resolve(
      db
        .update(prs)
        .set({ bestE1RM: best.e1rm, setLogId: best.id, achievedAt: Date.now() })
        .where(eq(prs.lift, session.lift)),
    );
  }

  await Promise.resolve(db.delete(setLogs).where(eq(setLogs.sessionId, sessionId)));
  await Promise.resolve(
    db.update(sessions).set({ startedAt: Date.now() }).where(eq(sessions.id, sessionId)),
  );
}
