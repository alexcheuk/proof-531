import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { type DataDb, DataProvider } from '../context';

/**
 * Build a wrapper component for renderHook() that provides both a fresh
 * QueryClient (retries off, gcTime zero) and a DataProvider bound to the
 * passed test database.
 *
 * Each call returns an independent QueryClient so tests don't share cache.
 */
export function makeWrapper(db: DataDb) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <DataProvider db={db}>{children}</DataProvider>
      </QueryClientProvider>
    );
  };
}
