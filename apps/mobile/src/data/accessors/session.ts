/**
 * Session accessors.
 *
 * Mirrors the PWA accessors at `~/Development/531-pwa/src/db/accessors/session.ts`.
 *
 * Invariant (see docs/technical-design.md §4): `createSession` snapshots the
 * current TM value/unit AND the current display unit into the session row.
 * The snapshot is the source of truth for prescribed weights of this session.
 * Subsequent TM edits — including via `advanceCycle()` — do NOT mutate this
 * session's snapshot. A mid-session display-unit flip in Settings must NOT
 * change which currency this session renders in.
 *
 * Accessors take a Drizzle db handle as the first argument so tests can inject
 * a better-sqlite3-backed db while production callers pass the expo-sqlite-backed
 * `db` from `../drizzle/client`. The Drizzle query API is identical across drivers.
 *
 * Transactional trade-off: the PWA wraps these in Dexie transactions. drizzle-orm's
 * `db.transaction((tx) => ...)` exists but its typing varies across drivers and
 * we'd need to thread the tx through `getSettings` / `getCurrentTrainingMaxes` /
 * `advanceDay` (which take `AnyDb`, not the more specific tx type). Since the
 * mobile DB is single-writer (JS event loop, no concurrent expo-sqlite writers
 * in practice) we skip the wrapper. Each call's reads/writes are still sequential.
 */
import { desc, eq } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type { Lift } from '../../domain/types';
import { sessions } from '../drizzle/schema';
import { advanceDay, getSettings } from './settings';
import { getCurrentTrainingMaxes } from './trainingMax';

// biome-ignore lint/suspicious/noExplicitAny: structural-poly across sqlite drivers
type AnyDb = BaseSQLiteDatabase<any, any, any>;

export type Session = typeof sessions.$inferSelect;

/**
 * Create a new in-progress Session for the given lift, snapshotting the
 * current TrainingMax (value + unit) and current displayUnit into the row.
 *
 * Throws if no TM exists for the lift — callers should gate on onboarding.
 */
export async function createSession(db: AnyDb, lift: Lift): Promise<Session> {
  const settings = await getSettings(db);
  const tms = await getCurrentTrainingMaxes(db);
  const tm = tms.find((t) => t.lift === lift);
  if (!tm) {
    throw new Error(`createSession: no TrainingMax exists for lift '${lift}'`);
  }
  // Snapshot BOTH units:
  //   storageUnitSnapshot ← tm.unit  (drives the snap math + writes for
  //     this session — invariant from docs/technical-design.md §4).
  //   displayUnitSnapshot ← settings.displayUnit (drives the render
  //     conversion). A mid-session display flip in Settings must NOT
  //     change which currency this session renders in.
  const row = {
    lift,
    cycle: settings.currentCycle,
    week: settings.week,
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

/** Look up a session row by id. */
export async function getSession(db: AnyDb, sessionId: number): Promise<Session | undefined> {
  const rows = await Promise.resolve(db.select().from(sessions).where(eq(sessions.id, sessionId)));
  return (rows as Session[])[0];
}

/**
 * Return the (single) currently in-progress session, if any.
 *
 * The data model assumes the single-session invariant (§4): at most one row
 * with `status === 'in_progress'` exists. This accessor returns the first
 * such row.
 */
export async function getActiveSession(db: AnyDb): Promise<Session | undefined> {
  const rows = (await Promise.resolve(
    db.select().from(sessions).where(eq(sessions.status, 'in_progress')),
  )) as Session[];
  return rows[0];
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
 * Mark a session complete and advance the training day (which may wrap into
 * the next week/cycle, bumping TMs — see settings/advanceCycle).
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
  await advanceDay(db);
}

/**
 * Cancel a session. Set logs are kept (per spec §8 — AMRAP PRs achieved
 * before cancel still count). Day is NOT advanced.
 */
export async function cancelSession(db: AnyDb, sessionId: number): Promise<void> {
  await Promise.resolve(
    db
      .update(sessions)
      .set({ status: 'cancelled', endedAt: Date.now() })
      .where(eq(sessions.id, sessionId)),
  );
}
