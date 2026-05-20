import { eq } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type * as schema from '../db/schema';
import { assistance } from '../db/schema';

type Assistance = typeof assistance.$inferSelect;
type NewAssistance = typeof assistance.$inferInsert;

export type AssistanceRepoDb = BaseSQLiteDatabase<'sync', unknown, typeof schema>;

export function createAssistanceRepo(db: AssistanceRepoDb) {
  return {
    list(): Assistance[] {
      return db.select().from(assistance).all();
    },
    get(id: number): Assistance | undefined {
      return db.select().from(assistance).where(eq(assistance.id, id)).get();
    },
    create(a: NewAssistance): Assistance {
      const inserted = db.insert(assistance).values(a).returning().get();
      if (!inserted) {
        throw new Error('createAssistanceRepo.create: insert returned no row');
      }
      return inserted;
    },
    update(id: number, patch: Partial<NewAssistance>): Assistance | undefined {
      return db.update(assistance).set(patch).where(eq(assistance.id, id)).returning().get();
    },
  };
}

export type AssistanceRepo = ReturnType<typeof createAssistanceRepo>;
