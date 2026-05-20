import { eq } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type * as schema from '../db/schema';
import { lifts } from '../db/schema';

type Lift = typeof lifts.$inferSelect;
type NewLift = typeof lifts.$inferInsert;

export type LiftRepoDb = BaseSQLiteDatabase<'sync', unknown, typeof schema>;

export function createLiftRepo(db: LiftRepoDb) {
  return {
    list(): Lift[] {
      return db.select().from(lifts).all();
    },
    get(id: string): Lift | undefined {
      return db.select().from(lifts).where(eq(lifts.id, id)).get();
    },
    create(lift: NewLift): Lift {
      const inserted = db.insert(lifts).values(lift).returning().get();
      if (!inserted) {
        throw new Error('createLiftRepo.create: insert returned no row');
      }
      return inserted;
    },
    update(id: string, patch: Partial<NewLift>): Lift | undefined {
      return db.update(lifts).set(patch).where(eq(lifts.id, id)).returning().get();
    },
  };
}

export type LiftRepo = ReturnType<typeof createLiftRepo>;
