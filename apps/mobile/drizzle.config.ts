import type { Config } from 'drizzle-kit';

export default {
  dialect: 'sqlite',
  schema: './src/data/db/schema.ts',
  out: './src/data/db/migrations',
  // expo-sqlite driver for runtime; drizzle-kit generates SQLite-flavored migrations.
} satisfies Config;
