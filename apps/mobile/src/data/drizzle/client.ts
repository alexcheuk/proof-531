import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

// SQLite filename for the app's local database.
const DB_NAME = '531.db';

/** Raw expo-sqlite handle. Exposed so the migration runner can issue
 * statements directly without going through drizzle. */
export const expoDb = openDatabaseSync(DB_NAME);

/** Drizzle client bound to the app's local SQLite database. */
export const db = drizzle(expoDb, { schema });

export { schema };
