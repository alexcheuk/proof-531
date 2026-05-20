import { eq } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type * as schema from '../db/schema';
import { sets } from '../db/schema';

type SetRow = typeof sets.$inferSelect;
type NewSet = typeof sets.$inferInsert;

export type SetRepoDb = BaseSQLiteDatabase<'sync', unknown, typeof schema>;

export function createSetRepo(db: SetRepoDb) {
  return {
    list(): SetRow[] {
      return db.select().from(sets).all();
    },
    get(id: number): SetRow | undefined {
      return db.select().from(sets).where(eq(sets.id, id)).get();
    },
    listBySession(sessionId: number): SetRow[] {
      return db.select().from(sets).where(eq(sets.sessionId, sessionId)).all();
    },
    create(set: NewSet): SetRow {
      const inserted = db.insert(sets).values(set).returning().get();
      if (!inserted) {
        throw new Error('createSetRepo.create: insert returned no row');
      }
      return inserted;
    },
    update(id: number, patch: Partial<NewSet>): SetRow | undefined {
      return db.update(sets).set(patch).where(eq(sets.id, id)).returning().get();
    },
  };
}

export type SetRepo = ReturnType<typeof createSetRepo>;
