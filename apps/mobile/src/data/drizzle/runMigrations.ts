import type { SQLiteDatabase } from 'expo-sqlite';
import { MIGRATION_0001 } from './migrations/0001_init';

/**
 * Database surface used by {@link runMigrations}. Either an expo-sqlite handle
 * (exposes `execSync`) or a better-sqlite3 instance (exposes `exec`).
 */
type MigrationTarget =
  | { execSync: (sql: string) => void }
  | { exec: (sql: string) => void }
  | SQLiteDatabase;

/**
 * Tables the canonical schema defines. Order matters for DROP because of FK
 * references: prs → set_logs → sessions, then leaves.
 */
const ALL_TABLES = [
  'lift_progress',
  'lift_goals',
  'lift_miss_state',
  'prs',
  'set_logs',
  'sessions',
  'training_maxes',
  'settings',
] as const;

const REQUIRED_SESSIONS_COLUMNS = [
  'lift',
  'cycle',
  'week',
  'started_at',
  'status',
  'training_max_snapshot',
  'storage_unit_snapshot',
  'display_unit_snapshot',
] as const;

const REQUIRED_SETTINGS_COLUMNS = [
  'storage_unit',
  'display_unit',
  'plate_set',
  'enabled_lifts',
  'current_cycle',
  'week',
  'day',
  'rest_target_seconds',
  'bbb_rest_target_seconds',
  'live_screen_inverted',
] as const;

const REQUIRED_LIFT_GOALS_COLUMNS = ['kind', 'target_value', 'unit'] as const;

/**
 * Additive columns we can safely add in production via `ALTER TABLE ADD
 * COLUMN`. Each entry MUST supply a default so existing rows acquire a
 * value without further migration work. New schema bumps that need a column
 * should add their entry here BEFORE bumping the REQUIRED_*_COLUMNS lists,
 * so existing user installs receive the column non-destructively.
 */
const ADDITIVE_COLUMNS: ReadonlyArray<{
  table: string;
  column: string;
  ddl: string;
}> = [
  {
    table: 'settings',
    column: 'rest_target_seconds',
    ddl: 'ALTER TABLE settings ADD COLUMN rest_target_seconds INTEGER NOT NULL DEFAULT 90',
  },
  {
    table: 'settings',
    column: 'bbb_rest_target_seconds',
    ddl: 'ALTER TABLE settings ADD COLUMN bbb_rest_target_seconds INTEGER NOT NULL DEFAULT 90',
  },
  {
    table: 'lift_goals',
    column: 'days_per_week',
    ddl: 'ALTER TABLE lift_goals ADD COLUMN days_per_week INTEGER',
  },
  {
    table: 'settings',
    column: 'live_screen_inverted',
    ddl: 'ALTER TABLE settings ADD COLUMN live_screen_inverted INTEGER NOT NULL DEFAULT 0',
  },
];

function exec(db: MigrationTarget, sql: string): void {
  const asExpo = db as { execSync?: (sql: string) => void };
  const asBetter = db as { exec?: (sql: string) => void };
  if (typeof asExpo.execSync === 'function') {
    asExpo.execSync(sql);
  } else if (typeof asBetter.exec === 'function') {
    asBetter.exec(sql);
  } else {
    throw new Error(
      'runMigrations: database must expose execSync (expo-sqlite) or exec (better-sqlite3).',
    );
  }
}

/**
 * Returns the list of column names for a table, or [] if the table doesn't
 * exist. Uses PRAGMA table_info which is supported by both expo-sqlite and
 * better-sqlite3 — but they return rows differently, so we accept either.
 *
 * Returns `null` when introspection isn't possible on this driver — callers
 * must NOT assume the schema is fine in that case (the previous behavior of
 * sentinel-returning the required column list silently skipped real
 * staleness on unfamiliar drivers).
 */
function getColumns(db: MigrationTarget, table: string): string[] | null {
  // biome-ignore lint/suspicious/noExplicitAny: cross-driver query
  const anyDb = db as any;
  if (typeof anyDb.getAllSync === 'function') {
    try {
      const rows = anyDb.getAllSync(`PRAGMA table_info(${table});`) as Array<{ name: string }>;
      return rows.map((r) => r.name);
    } catch {
      return [];
    }
  }
  if (typeof anyDb.prepare === 'function') {
    try {
      const rows = anyDb.prepare(`PRAGMA table_info(${table});`).all() as Array<{ name: string }>;
      return rows.map((r) => r.name);
    } catch {
      return [];
    }
  }
  return null;
}

/**
 * True in dev/test contexts. Production bundles set `__DEV__ === false`.
 * Tests run under Node where `__DEV__` is undefined → treated as dev.
 */
function isDevEnv(): boolean {
  // biome-ignore lint/suspicious/noExplicitAny: __DEV__ is a global injected by Metro
  const dev = (globalThis as any).__DEV__;
  return dev !== false;
}

/**
 * Apply all migrations in order. Idempotent on a clean DB.
 *
 * On a DB whose schema is missing required columns:
 *   - Production: attempt non-destructive `ALTER TABLE ADD COLUMN` for any
 *     known additive column (see {@link ADDITIVE_COLUMNS}). Never drops a
 *     table — user data is preserved.
 *   - Dev (`__DEV__ !== false`): drop every table first so the canonical
 *     migration can recreate them. Convenient while the schema is in flux.
 */
export function runMigrations(database: MigrationTarget): void {
  const sessionsCols = getColumns(database, 'sessions');
  const settingsCols = getColumns(database, 'settings');
  const liftGoalsCols = getColumns(database, 'lift_goals');

  // Try additive ALTER first — safe in both dev and prod, and resolves
  // stale schemas without dropping user data.
  if (settingsCols && settingsCols.length > 0) {
    for (const additive of ADDITIVE_COLUMNS) {
      if (additive.table !== 'settings') continue;
      if (!settingsCols.includes(additive.column)) {
        try {
          exec(database, `${additive.ddl};`);
          settingsCols.push(additive.column);
        } catch (err) {
          console.warn(
            `[runMigrations] additive ALTER failed for settings.${additive.column}`,
            err,
          );
        }
      }
    }
  }
  if (sessionsCols && sessionsCols.length > 0) {
    for (const additive of ADDITIVE_COLUMNS) {
      if (additive.table !== 'sessions') continue;
      if (!sessionsCols.includes(additive.column)) {
        try {
          exec(database, `${additive.ddl};`);
          sessionsCols.push(additive.column);
        } catch (err) {
          console.warn(
            `[runMigrations] additive ALTER failed for sessions.${additive.column}`,
            err,
          );
        }
      }
    }
  }
  if (liftGoalsCols && liftGoalsCols.length > 0) {
    for (const additive of ADDITIVE_COLUMNS) {
      if (additive.table !== 'lift_goals') continue;
      if (!liftGoalsCols.includes(additive.column)) {
        try {
          exec(database, `${additive.ddl};`);
          liftGoalsCols.push(additive.column);
        } catch (err) {
          console.warn(
            `[runMigrations] additive ALTER failed for lift_goals.${additive.column}`,
            err,
          );
        }
      }
    }
  }

  const sessionsStale =
    sessionsCols !== null &&
    sessionsCols.length > 0 &&
    REQUIRED_SESSIONS_COLUMNS.some((c) => !sessionsCols.includes(c));
  const settingsStale =
    settingsCols !== null &&
    settingsCols.length > 0 &&
    REQUIRED_SETTINGS_COLUMNS.some((c) => !settingsCols.includes(c));
  const liftGoalsStale =
    liftGoalsCols !== null &&
    liftGoalsCols.length > 0 &&
    REQUIRED_LIFT_GOALS_COLUMNS.some((c) => !liftGoalsCols.includes(c));
  const isStale = sessionsStale || settingsStale || liftGoalsStale;

  if (isStale) {
    if (isDevEnv()) {
      console.warn(
        '[runMigrations] stale schema detected (missing columns on sessions or settings); dropping all tables to re-seed.',
      );
      for (const t of ALL_TABLES) {
        exec(database, `DROP TABLE IF EXISTS ${t};`);
      }
    } else {
      // Production: never destroy user data. Surface the gap loudly so the
      // failing query reveals what additive entry is missing.
      console.error(
        '[runMigrations] stale schema detected in production build; missing column(s) cannot be added automatically — add an entry to ADDITIVE_COLUMNS.',
      );
    }
  }

  const statements = MIGRATION_0001.split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    exec(database, `${stmt};`);
  }
}
