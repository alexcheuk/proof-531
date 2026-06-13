import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// `settings` is a singleton  -  id is always 1.
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
  // BBB rest is shorter than the working-set rest by design  -  the BBB
  // sets are 5×10 at 50% TM, light enough that 3 minutes between is
  // wasted time. Default 90s. Additive column; see ADDITIVE_COLUMNS in
  // runMigrations.ts so existing installs pick it up via ALTER TABLE.
  bbbRestTargetSeconds: integer('bbb_rest_target_seconds').notNull(),
  // Flips Live set + rest screens to inverted (ink-0 surface, paper
  // text), matching the PR celebration palette. Default 0 (off).
  // Additive column; existing installs pick it up via ALTER TABLE in
  // `runMigrations.ts`. Discord 1508984314.
  liveScreenInverted: integer('live_screen_inverted').notNull(),
  reviewPromptedAt: integer('review_prompted_at'),
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
  kind: text('kind', {
    enum: ['warmup', 'working', 'amrap', 'bbb', 'assistance', 'tm-test'],
  }).notNull(),
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

/**
 * Per-lift e1RM goal  -  the Progress screen's "where am I headed" target.
 *
 * One row per lift (lift is PK), stored in storage units to match
 * `trainingMaxes`. Zero rows for a lift = "no goal set" (the correct
 * empty state). Created/updated via `setLiftGoal`, removed via
 * `clearLiftGoal`. See `apps/mobile/src/data/accessors/liftGoal.ts`.
 */
/**
 * Per-lift progression state. Each lift runs its own 5/3/1 cycle and
 * week-of-cycle independently  -  completing a bench session advances bench's
 * (cycle, week) without touching squat. Replaces the global
 * `settings.currentCycle` / `settings.week` for app code; the old columns
 * stay on `settings` as legacy + a migration source until callers stop
 * reading them. One row per lift; lazily seeded on first read.
 */
export const liftProgress = sqliteTable('lift_progress', {
  lift: text('lift', { enum: ['squat', 'bench', 'deadlift', 'press'] }).primaryKey(),
  currentCycle: integer('current_cycle').notNull(),
  week: integer('week').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const liftGoals = sqliteTable('lift_goals', {
  lift: text('lift', { enum: ['squat', 'bench', 'deadlift', 'press'] }).primaryKey(),
  kind: text('kind', { enum: ['tm', '1rm'] }).notNull(),
  targetValue: real('target_value').notNull(),
  unit: text('unit', { enum: ['lbs', 'kg'] }).notNull(),
  updatedAt: integer('updated_at').notNull(),
  // Optional per-lift workout frequency. `null` = unset; when set, the
  // Goal Panel uses it to convert "days until goal" into a weeks/months
  // estimate. Each lift is independent so a user can train e.g. squat 2x
  // a week while pressing once.
  daysPerWeek: integer('days_per_week'),
});

/**
 * Per-lift missed-rep state for the Program Correction feature. One row per
 * lift (lift is PK), lazily seeded on the first miss. `missCount` counts
 * consecutive AMRAP misses on cycle-days 1..3; a hit or an applied reset /
 * off-day clears the row. `lastMissDate` and `updatedAt` are ISO-8601 strings
 * (per the brief: TEXT, human-readable), unlike `trainingMaxes.updatedAt`'s
 * INTEGER epoch.
 */
export const liftMissState = sqliteTable('lift_miss_state', {
  lift: text('lift', { enum: ['squat', 'bench', 'deadlift', 'press'] }).primaryKey(),
  missCount: integer('miss_count').notNull().default(0),
  lastMissDate: text('last_miss_date'),
  updatedAt: text('updated_at').notNull(),
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
  liveScreenInverted: 0 as 0 | 1,
};
