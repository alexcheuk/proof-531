import { and, desc, eq, inArray, isNotNull, not } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type { Lift, Unit } from '../../domain/types';
import { liftProgress, prs, sessions, setLogs } from '../drizzle/schema';
import { setTrainingMax } from './trainingMax';

// biome-ignore lint/suspicious/noExplicitAny: structural-poly across sqlite drivers
type AnyDb = BaseSQLiteDatabase<any, any, any>;

type Session = typeof sessions.$inferSelect;

export async function rollbackLift(db: AnyDb, lift: Lift, n: number): Promise<number> {
  if (n < 1) return 0;

  const completed = (await Promise.resolve(
    db
      .select()
      .from(sessions)
      .where(and(eq(sessions.lift, lift), eq(sessions.status, 'completed')))
      .orderBy(desc(sessions.startedAt), desc(sessions.id))
      .limit(n),
  )) as Session[];

  if (completed.length === 0) return 0;

  // completed is non-empty (checked above), so the last element always exists
  // biome-ignore lint/style/noNonNullAssertion: length > 0 guaranteed
  const oldest = completed[completed.length - 1]!;
  const sessionIds = completed.map((s) => s.id);

  // Rebuild PR: find best AMRAP from sessions NOT being deleted.
  // Must happen before deleting set_logs (FK constraint: prs.set_log_id
  // references set_logs.id, no ON DELETE CASCADE).
  const surviving = (await Promise.resolve(
    db
      .select({ id: setLogs.id, e1rm: setLogs.estimated1RM })
      .from(setLogs)
      .innerJoin(sessions, eq(setLogs.sessionId, sessions.id))
      .where(
        and(
          eq(sessions.lift, lift),
          eq(setLogs.kind, 'amrap'),
          isNotNull(setLogs.estimated1RM),
          not(inArray(setLogs.sessionId, sessionIds)),
        ),
      )
      .orderBy(desc(setLogs.estimated1RM), desc(setLogs.completedAt)),
  )) as Array<{ id: number; e1rm: number | null }>;

  const best = surviving[0];
  if (!best || best.e1rm == null) {
    await Promise.resolve(db.delete(prs).where(eq(prs.lift, lift)));
  } else {
    await Promise.resolve(
      db
        .update(prs)
        .set({ bestE1RM: best.e1rm, setLogId: best.id, achievedAt: Date.now() })
        .where(eq(prs.lift, lift)),
    );
  }

  await Promise.resolve(db.delete(setLogs).where(inArray(setLogs.sessionId, sessionIds)));
  await Promise.resolve(db.delete(sessions).where(inArray(sessions.id, sessionIds)));

  await Promise.resolve(
    db
      .update(liftProgress)
      .set({ currentCycle: oldest.cycle, week: oldest.week, updatedAt: Date.now() })
      .where(eq(liftProgress.lift, lift)),
  );

  await setTrainingMax(
    db,
    lift,
    oldest.trainingMaxSnapshot,
    (oldest.storageUnitSnapshot ?? 'lbs') as Unit,
  );

  return completed.length;
}

export async function countCompletedSessionsForLift(db: AnyDb, lift: Lift): Promise<number> {
  const rows = (await Promise.resolve(
    db
      .select({ id: sessions.id })
      .from(sessions)
      .where(and(eq(sessions.lift, lift), eq(sessions.status, 'completed'))),
  )) as Array<{ id: number }>;
  return rows.length;
}
