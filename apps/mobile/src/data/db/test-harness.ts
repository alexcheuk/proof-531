import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import Database, { type Database as BetterSqlite3Db } from 'better-sqlite3';
import { type BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const MIGRATIONS_DIR = join(__dirname, 'migrations');

export type TestDb = {
  db: BetterSQLite3Database<typeof schema>;
  sqlite: BetterSqlite3Db;
  close: () => void;
};

function applyMigrations(sqlite: BetterSqlite3Db): void {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();
  for (const f of files) {
    const sql = readFileSync(join(MIGRATIONS_DIR, f), 'utf8');
    // Drizzle-kit uses `--> statement-breakpoint` as a statement separator.
    const stmts = sql.split('--> statement-breakpoint');
    for (const s of stmts) {
      const trimmed = s.trim();
      if (trimmed.length > 0) sqlite.exec(trimmed);
    }
  }
}

/** Creates a fresh in-memory SQLite database with the full schema applied. */
export function createTestDb(): TestDb {
  const sqlite = new Database(':memory:');
  applyMigrations(sqlite);
  const db = drizzle(sqlite, { schema });
  return {
    db,
    sqlite,
    close: () => sqlite.close(),
  };
}
