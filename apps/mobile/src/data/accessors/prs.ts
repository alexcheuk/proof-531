// _upsertPR is for setLog.appendSetLog only — PR writes are side effects of AMRAP logging, never direct.
import { eq } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type { Lift } from '../../domain/types';
import { prs } from '../drizzle/schema';

// biome-ignore lint/suspicious/noExplicitAny: structural typing for cross-driver drizzle
type AnyDb = BaseSQLiteDatabase<any, any, any>;

export type PR = typeof prs.$inferSelect;

export async function getPRs(db: AnyDb): Promise<PR[]> {
  return (await Promise.resolve(db.select().from(prs))) as PR[];
}

export async function getPR(db: AnyDb, lift: Lift): Promise<PR | undefined> {
  const rows = (await Promise.resolve(db.select().from(prs).where(eq(prs.lift, lift)))) as PR[];
  return rows[0];
}

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
