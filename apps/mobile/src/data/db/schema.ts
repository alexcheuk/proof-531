import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const lifts = sqliteTable('lifts', {
  id: text('id').primaryKey(),
  label: text('label').notNull(),
  category: text('category').notNull(),
  trainingMax: integer('training_max').notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull(),
});

export const cycles = sqliteTable('cycles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  number: integer('number').notNull(),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cycleId: integer('cycle_id')
    .references(() => cycles.id)
    .notNull(),
  liftId: text('lift_id')
    .references(() => lifts.id)
    .notNull(),
  week: integer('week').notNull(),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

export const sets = sqliteTable('sets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: integer('session_id')
    .references(() => sessions.id)
    .notNull(),
  index: integer('index').notNull(),
  type: text('type').notNull(),
  prescribedWeight: integer('prescribed_weight').notNull(),
  prescribedReps: integer('prescribed_reps').notNull(),
  actualReps: integer('actual_reps'),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

export const assistance = sqliteTable('assistance', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  category: text('category').notNull(),
  defaultSets: integer('default_sets').notNull(),
  defaultReps: integer('default_reps').notNull(),
  favorite: integer('favorite', { mode: 'boolean' }).notNull(),
});
