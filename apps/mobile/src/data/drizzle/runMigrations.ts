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
 * Apply all migrations in order. Idempotent: each migration's statements
 * use `IF NOT EXISTS` so re-running on an initialized DB is a no-op.
 *
 * Pass any expo-sqlite-compatible database in production. Tests inject
 * better-sqlite3 (which exposes `exec` instead of `execSync`).
 */
export function runMigrations(database: MigrationTarget): void {
  // Split on `;` so we issue one statement at a time. Filter empty fragments.
  const statements = MIGRATION_0001.split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const asExpo = database as { execSync?: (sql: string) => void };
  const asBetter = database as { exec?: (sql: string) => void };

  for (const stmt of statements) {
    if (typeof asExpo.execSync === 'function') {
      asExpo.execSync(`${stmt};`);
    } else if (typeof asBetter.exec === 'function') {
      asBetter.exec(`${stmt};`);
    } else {
      throw new Error(
        'runMigrations: database must expose execSync (expo-sqlite) or exec (better-sqlite3).',
      );
    }
  }
}
