import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import { EMBEDDED_SCHEMA_SQL } from './embedded-schema';
import * as schema from './schema';

export const sqlite = openDatabaseSync('proof-531.db');

// Pragmatic schema bootstrap: drizzle-kit migration bundling isn't wired
// yet (see `migrations.ts`), so apply the inlined schema directly. Uses
// CREATE TABLE IF NOT EXISTS so it's safe to call on every cold start.
sqlite.execSync(EMBEDDED_SCHEMA_SQL);

export const db = drizzle(sqlite, { schema });

export type DB = typeof db;
