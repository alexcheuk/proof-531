import { eq } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type * as schema from '../db/schema';
import { sessions } from '../db/schema';

type Session = typeof sessions.$inferSelect;
type NewSession = typeof sessions.$inferInsert;

export type SessionRepoDb = BaseSQLiteDatabase<'sync', unknown, typeof schema>;

export function createSessionRepo(db: SessionRepoDb) {
  return {
    list(): Session[] {
      return db.select().from(sessions).all();
    },
    get(id: number): Session | undefined {
      return db.select().from(sessions).where(eq(sessions.id, id)).get();
    },
    listByCycle(cycleId: number): Session[] {
      return db.select().from(sessions).where(eq(sessions.cycleId, cycleId)).all();
    },
    create(session: NewSession): Session {
      const inserted = db.insert(sessions).values(session).returning().get();
      if (!inserted) {
        throw new Error('createSessionRepo.create: insert returned no row');
      }
      return inserted;
    },
    update(id: number, patch: Partial<NewSession>): Session | undefined {
      return db.update(sessions).set(patch).where(eq(sessions.id, id)).returning().get();
    },
  };
}

export type SessionRepo = ReturnType<typeof createSessionRepo>;
