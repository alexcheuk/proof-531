import { type AppDb, DbProvider } from '@/data/DbProvider';
/**
 * Hook smoke test: renders `useSettings()` against an in-memory better-sqlite3
 * db and asserts the query resolves to the seeded singleton row.
 *
 * Mirrors the accessor tests' `freshDb()` pattern — the structural db type
 * crosses driver boundaries cleanly via the AnyDb pattern in accessors.
 */
import { seedDefaultSettings } from '@/data/accessors/settings';
import { runMigrations } from '@/data/drizzle/runMigrations';
import * as schema from '@/data/drizzle/schema';
import { useSettings } from '@/data/queries/useSettings';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react-native';
import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import type { ReactNode } from 'react';
import { Text } from 'react-native';

function freshDb(): AppDb {
  const sqlite = new BetterSqlite3(':memory:');
  runMigrations(sqlite);
  // biome-ignore lint/suspicious/noExplicitAny: cross-driver structural typing
  return drizzle(sqlite, { schema }) as any;
}

function makeWrapper(db: AppDb) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <DbProvider db={db}>{children}</DbProvider>
      </QueryClientProvider>
    );
  };
}

function Probe() {
  const { data, isLoading } = useSettings();
  if (isLoading || !data) return <Text testID="loading">loading</Text>;
  return <Text testID="result">{`unit:${data.storageUnit}`}</Text>;
}

describe('useSettings (hook smoke test)', () => {
  it('resolves to the seeded settings against an in-memory db', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    const Wrapper = makeWrapper(db);

    const { findByTestId } = render(
      <Wrapper>
        <Probe />
      </Wrapper>,
    );

    await waitFor(async () => {
      const node = await findByTestId('result');
      expect(node).toBeTruthy();
    });
    const node = await findByTestId('result');
    // children may be a string or array depending on RN version — normalise.
    const text = Array.isArray(node.props.children)
      ? node.props.children.join('')
      : String(node.props.children);
    expect(text).toBe('unit:lbs');
  });

  it('seeds defaults on first call when no row exists', async () => {
    const db = freshDb();
    // NOTE: no explicit seed — getSettings should self-seed via the accessor.
    const Wrapper = makeWrapper(db);

    const { findByTestId } = render(
      <Wrapper>
        <Probe />
      </Wrapper>,
    );

    await waitFor(async () => {
      const node = await findByTestId('result');
      const text = Array.isArray(node.props.children)
        ? node.props.children.join('')
        : String(node.props.children);
      expect(text).toBe('unit:lbs');
    });
  });
});
