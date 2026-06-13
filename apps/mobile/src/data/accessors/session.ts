// Invariant: createSession snapshots the TM value/unit AND displayUnit into the row.
// That snapshot is the source of truth for prescribed weights  -  TM edits and unit flips must NOT mutate it.
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
  // displayUnitSnapshot is snapshotted at creation so a mid-session Settings flip doesn't
  // change which unit this session renders in.
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

export async function getSession(db: AnyDb, sessionId: number): Promise<Session | null> {
  const rows = await Promise.resolve(db.select().from(sessions).where(eq(sessions.id, sessionId)));
  return (rows as Session[])[0] ?? null;
}

export async function getActiveSession(db: AnyDb): Promise<Session | null> {
  const rows = (await Promise.resolve(
    db.select().from(sessions).where(eq(sessions.status, 'in_progress')),
  )) as Session[];
  return rows[0] ?? null;
}

// id DESC tiebreaker for sessions created in the same millisecond  -  rare but keeps ordering deterministic in tests.
export async function getSessions(db: AnyDb): Promise<Session[]> {
  const rows = await Promise.resolve(
    db.select().from(sessions).orderBy(desc(sessions.startedAt), desc(sessions.id)),
  );
  return rows as Session[];
}

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

// Cancelling a session for a disabled lift prevents the ghost session from stealing every
// Begin-CTA tap on Home (Discord 1508768403).
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

// PR rebuild: if this session set a PR via its now-deleted AMRAP row, the stale prs.bestE1RM
// would otherwise survive and give the badge/chip a ghost number with no supporting set_log.
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
  // Must rebuild PRs BEFORE deleting set_logs: prs.set_log_id is a NOT NULL FK with no
  // ON DELETE CASCADE  -  deleting a set_log that prs points at would fail with FK constraint.
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
