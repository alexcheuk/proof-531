// Tests inject a better-sqlite3-backed db so hooks can render headless without mocking the import graph.
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import { type ReactNode, createContext, createElement, useContext } from 'react';

// Structural-poly across sqlite drivers  -  see accessors/trainingMax.ts.
// biome-ignore lint/suspicious/noExplicitAny: structural-poly across sqlite drivers
export type AppDb = BaseSQLiteDatabase<any, any, any>;

const DbContext = createContext<AppDb | null>(null);

export function DbProvider({ db, children }: { db: AppDb; children: ReactNode }) {
  return createElement(DbContext.Provider, { value: db }, children);
}

export function useDb(): AppDb {
  const db = useContext(DbContext);
  if (db === null) {
    throw new Error('useDb must be used within a <DbProvider>');
  }
  return db;
}
