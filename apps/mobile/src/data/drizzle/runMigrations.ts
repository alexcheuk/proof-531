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
const ALL_TABLES = ['prs', 'set_logs', 'sessions', 'training_maxes', 'settings'] as const;

/**
 * Columns we require to be present in the current `sessions` table. If any
 * is missing, we treat the on-disk schema as a stale dev artifact and wipe
 * everything before re-running the canonical migration.
 *
 * This is a dev-only safety net: pre-release we re-shape the schema often
 * and `CREATE TABLE IF NOT EXISTS` is silently a no-op against an existing
 * table, so older DBs would carry stale columns forever. Once schema is
 * frozen and we ship the first build, swap this for proper additive
 * migrations (0002, 0003…).
 */
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

/**
 * Mirror of REQUIRED_SESSIONS_COLUMNS for the `settings` table. New columns
 * added to `settings` should be listed here so the dev-time stale-schema
 * reset triggers if the on-disk DB predates the column.
 */
const REQUIRED_SETTINGS_COLUMNS = [
  'storage_unit',
  'display_unit',
  'plate_set',
  'enabled_lifts',
  'current_cycle',
  'week',
  'day',
  'rest_target_seconds',
] as const;

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
 */
function getColumns(db: MigrationTarget, table: string): string[] {
  // biome-ignore lint/suspicious/noExplicitAny: cross-driver query
  const anyDb = db as any;
  // expo-sqlite SDK 55 exposes getAllSync; better-sqlite3 exposes prepare().all().
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
  // Couldn't introspect — assume schema is fine and skip the dev-reset path.
  // Returning a sentinel that contains every required column for both tables
  // so the staleness check below treats it as "not stale".
  return [...REQUIRED_SESSIONS_COLUMNS, ...REQUIRED_SETTINGS_COLUMNS];
}

/**
 * Apply all migrations in order. Idempotent on a clean DB; for dev DBs with
 * stale schema (missing required columns on `sessions`), drops every table
 * first so the canonical 0001 migration can recreate them.
 */
export function runMigrations(database: MigrationTarget): void {
  const sessionsCols = getColumns(database, 'sessions');
  const settingsCols = getColumns(database, 'settings');
  const sessionsStale =
    sessionsCols.length > 0 && REQUIRED_SESSIONS_COLUMNS.some((c) => !sessionsCols.includes(c));
  const settingsStale =
    settingsCols.length > 0 && REQUIRED_SETTINGS_COLUMNS.some((c) => !settingsCols.includes(c));
  const isStale = sessionsStale || settingsStale;

  if (isStale) {
    console.warn(
      '[runMigrations] stale schema detected (missing columns on sessions or settings); dropping all tables to re-seed.',
    );
    for (const t of ALL_TABLES) {
      exec(database, `DROP TABLE IF EXISTS ${t};`);
    }
  }

  const statements = MIGRATION_0001.split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    exec(database, `${stmt};`);
  }
}
