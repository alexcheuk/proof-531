// TM history is append-only — setTrainingMax always INSERTs, never overwrites.
import { desc, eq } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type { Lift, Unit } from '../../domain/types';
import { trainingMaxes } from '../drizzle/schema';

// Drizzle's BaseSQLiteDatabase generic params vary by driver (expo-sqlite vs
// better-sqlite3); this structural-poly accessor only needs the common
// `.insert` / `.select` surface which is identical across drivers.
// biome-ignore lint/suspicious/noExplicitAny: structural-poly across sqlite drivers
type AnyDb = BaseSQLiteDatabase<any, any, any>;

export type TrainingMax = typeof trainingMaxes.$inferSelect;

export async function setTrainingMax(
  db: AnyDb,
  lift: Lift,
  value: number,
  unit: Unit,
): Promise<TrainingMax> {
  const updatedAt = Date.now();
  const inserted = await Promise.resolve(
    db.insert(trainingMaxes).values({ lift, value, unit, updatedAt }).returning(),
  );
  const row = (inserted as TrainingMax[])[0];
  if (!row) throw new Error('setTrainingMax: insert returned no row');
  return row;
}

export async function getCurrentTrainingMaxes(db: AnyDb): Promise<TrainingMax[]> {
  const allRows = (await Promise.resolve(
    db.select().from(trainingMaxes).orderBy(desc(trainingMaxes.updatedAt), desc(trainingMaxes.id)),
  )) as TrainingMax[];
  const seen = new Set<Lift>();
  const out: TrainingMax[] = [];
  for (const row of allRows) {
    const lift = row.lift as Lift;
    if (seen.has(lift)) continue;
    seen.add(lift);
    out.push(row);
  }
  return out;
}

export async function getTrainingMaxHistory(db: AnyDb, lift: Lift): Promise<TrainingMax[]> {
  const rows = await Promise.resolve(
    db
      .select()
      .from(trainingMaxes)
      .where(eq(trainingMaxes.lift, lift))
      .orderBy(desc(trainingMaxes.updatedAt), desc(trainingMaxes.id)),
  );
  return rows as TrainingMax[];
}
