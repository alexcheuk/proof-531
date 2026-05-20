import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import { type ReactNode, createContext, useContext, useMemo } from 'react';
import type * as schema from './db/schema';
import { createAssistanceRepo } from './repositories/assistanceRepo';
import { createCycleRepo } from './repositories/cycleRepo';
import { createLiftRepo } from './repositories/liftRepo';
import { createSessionRepo } from './repositories/sessionRepo';
import { createSetRepo } from './repositories/setRepo';

// All repos share the same drizzle SQLite database shape (sync mode + schema).
// We use `unknown` for the runResult slot because expo-sqlite and better-sqlite3
// produce different run-result shapes but both fit the same query surface.
export type DataDb = BaseSQLiteDatabase<'sync', unknown, typeof schema>;

export type Repos = {
  lifts: ReturnType<typeof createLiftRepo>;
  cycles: ReturnType<typeof createCycleRepo>;
  sessions: ReturnType<typeof createSessionRepo>;
  sets: ReturnType<typeof createSetRepo>;
  assistance: ReturnType<typeof createAssistanceRepo>;
};

const DataContext = createContext<Repos | null>(null);

export function DataProvider({
  db,
  children,
}: {
  db: DataDb;
  children: ReactNode;
}) {
  const repos = useMemo<Repos>(
    () => ({
      lifts: createLiftRepo(db),
      cycles: createCycleRepo(db),
      sessions: createSessionRepo(db),
      sets: createSetRepo(db),
      assistance: createAssistanceRepo(db),
    }),
    [db],
  );
  return <DataContext.Provider value={repos}>{children}</DataContext.Provider>;
}

export function useRepos(): Repos {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useRepos must be used inside <DataProvider>');
  }
  return ctx;
}
