import { eq } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type * as schema from '../db/schema';
import { cycles } from '../db/schema';

type Cycle = typeof cycles.$inferSelect;
type NewCycle = typeof cycles.$inferInsert;

export type CycleRepoDb = BaseSQLiteDatabase<'sync', unknown, typeof schema>;

export function createCycleRepo(db: CycleRepoDb) {
  return {
    list(): Cycle[] {
      return db.select().from(cycles).all();
    },
    get(id: number): Cycle | undefined {
      return db.select().from(cycles).where(eq(cycles.id, id)).get();
    },
    create(cycle: NewCycle): Cycle {
      const inserted = db.insert(cycles).values(cycle).returning().get();
      if (!inserted) {
        throw new Error('createCycleRepo.create: insert returned no row');
      }
      return inserted;
    },
    update(id: number, patch: Partial<NewCycle>): Cycle | undefined {
      return db.update(cycles).set(patch).where(eq(cycles.id, id)).returning().get();
    },
  };
}

export type CycleRepo = ReturnType<typeof createCycleRepo>;
