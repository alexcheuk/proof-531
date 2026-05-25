import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// `settings` is a singleton — id is always 1.
export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey(),
  storageUnit: text('storage_unit', { enum: ['lbs', 'kg'] }).notNull(),
  displayUnit: text('display_unit', { enum: ['lbs', 'kg'] }).notNull(),
  plateSet: text('plate_set', { enum: ['standard', 'kg-standard'] }).notNull(),
  // enabledLifts: JSON-encoded array of Lift strings.
  enabledLifts: text('enabled_lifts').notNull(),
  currentCycle: integer('current_cycle').notNull(),
  week: integer('week').notNull(),
  day: integer('day').notNull(),
  restTargetSeconds: integer('rest_target_seconds').notNull(),
  // BBB rest is shorter than the working-set rest by design — the BBB
  // sets are 5×10 at 50% TM, light enough that 3 minutes between is
  // wasted time. Default 90s. Additive column; see ADDITIVE_COLUMNS in
  // runMigrations.ts so existing installs pick it up via ALTER TABLE.
  bbbRestTargetSeconds: integer('bbb_rest_target_seconds').notNull(),
});

export const trainingMaxes = sqliteTable('training_maxes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  lift: text('lift', { enum: ['squat', 'bench', 'deadlift', 'press'] }).notNull(),
  value: real('value').notNull(),
  unit: text('unit', { enum: ['lbs', 'kg'] }).notNull(),
  updatedAt: integer('updated_at').notNull(),
  note: text('note'),
});

export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  lift: text('lift', { enum: ['squat', 'bench', 'deadlift', 'press'] }).notNull(),
  cycle: integer('cycle').notNull(),
  week: integer('week').notNull(),
  startedAt: integer('started_at').notNull(),
  endedAt: integer('ended_at'),
  status: text('status', { enum: ['in_progress', 'completed', 'cancelled'] }).notNull(),
  trainingMaxSnapshot: real('training_max_snapshot').notNull(),
  storageUnitSnapshot: text('storage_unit_snapshot', { enum: ['lbs', 'kg'] }),
  displayUnitSnapshot: text('display_unit_snapshot', { enum: ['lbs', 'kg'] }),
});

export const setLogs = sqliteTable('set_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: integer('session_id')
    .notNull()
    .references(() => sessions.id),
  index: integer('index').notNull(),
  kind: text('kind', { enum: ['warmup', 'working', 'amrap', 'bbb', 'assistance'] }).notNull(),
  prescribedWeight: real('prescribed_weight').notNull(),
  prescribedReps: integer('prescribed_reps').notNull(),
  actualReps: integer('actual_reps').notNull(),
  completedAt: integer('completed_at').notNull(),
  isPR: integer('is_pr', { mode: 'boolean' }),
  estimated1RM: real('estimated_1rm'),
});

export const prs = sqliteTable('prs', {
  lift: text('lift', { enum: ['squat', 'bench', 'deadlift', 'press'] }).primaryKey(),
  bestE1RM: real('best_e1rm').notNull(),
  setLogId: integer('set_log_id')
    .notNull()
    .references(() => setLogs.id),
  achievedAt: integer('achieved_at').notNull(),
});

export const DEFAULT_SETTINGS_VALUES = {
  id: 1,
  storageUnit: 'lbs' as const,
  displayUnit: 'lbs' as const,
  plateSet: 'standard' as const,
  enabledLifts: JSON.stringify(['squat', 'bench', 'deadlift', 'press']),
  currentCycle: 1,
  week: 1,
  day: 1,
  restTargetSeconds: 180,
  bbbRestTargetSeconds: 90,
};
