/**
 * PR (personal record) accessors.
 *
 * Mirrors the PWA accessors at `~/Development/531-pwa/src/db/accessors/prs.ts`.
 * The `prs` table holds at most one row per lift, keyed by `lift`. The row
 * records the best estimated 1RM observed (via the Epley formula on AMRAP
 * sets) along with a pointer to the `set_logs` row that produced it.
 *
 * `_upsertPR` is exported for use by `setLog.appendSetLog` only. External
 * callers should treat PR writes as a side effect of logging an AMRAP set —
 * never write the table directly.
 *
 * Accessors take a Drizzle db handle as the first argument so tests can inject
 * a better-sqlite3-backed db while production callers pass the expo-sqlite-backed
 * `db` from `../drizzle/client`. The Drizzle query API is identical across drivers.
 */
import { eq } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type { Lift } from '../../domain/types';
import { prs } from '../drizzle/schema';

// biome-ignore lint/suspicious/noExplicitAny: structural typing for cross-driver drizzle
type AnyDb = BaseSQLiteDatabase<any, any, any>;

export type PR = typeof prs.$inferSelect;

/** Return every PR row currently persisted, one per lift (or none). */
export async function getPRs(db: AnyDb): Promise<PR[]> {
  return (await Promise.resolve(db.select().from(prs))) as PR[];
}

/** Return the PR row for a single lift, or `undefined` if none has been set. */
export async function getPR(db: AnyDb, lift: Lift): Promise<PR | undefined> {
  const rows = (await Promise.resolve(db.select().from(prs).where(eq(prs.lift, lift)))) as PR[];
  return rows[0];
}

/**
 * Internal upsert used by `setLog.appendSetLog` when an AMRAP set beats the
 * existing PR. Uses sqlite's `ON CONFLICT (lift) DO UPDATE` so the row stays
 * keyed by lift (one PR per lift, ever).
 */
export async function _upsertPR(db: AnyDb, pr: PR): Promise<void> {
  await Promise.resolve(
    db
      .insert(prs)
      .values(pr)
      .onConflictDoUpdate({
        target: prs.lift,
        set: {
          bestE1RM: pr.bestE1RM,
          setLogId: pr.setLogId,
          achievedAt: pr.achievedAt,
        },
      }),
  );
}
