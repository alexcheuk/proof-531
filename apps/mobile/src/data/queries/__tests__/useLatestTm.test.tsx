import { type AppDb, DbProvider } from '@/data/DbProvider';
/**
 * Hook smoke test: renders `useLatestTms()` against an in-memory better-sqlite3
 * db and asserts the query resolves to the most-recent TM row per lift.
 */
import { setTrainingMax } from '@/data/accessors/trainingMax';
import { runMigrations } from '@/data/drizzle/runMigrations';
import * as schema from '@/data/drizzle/schema';
import { useLatestTm, useLatestTms } from '@/data/queries/useLatestTm';
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

function ListProbe() {
  const { data } = useLatestTms();
  if (!data) return <Text testID="loading">loading</Text>;
  return <Text testID="count">{`count:${data.length}`}</Text>;
}

function SquatProbe() {
  const { data } = useLatestTm('squat');
  if (!data) return <Text testID="loading">loading</Text>;
  return <Text testID="squat">{`squat:${data.value}`}</Text>;
}

describe('useLatestTms / useLatestTm (hook smoke tests)', () => {
  it('resolves to the inserted training maxes', async () => {
    const db = freshDb();
    await setTrainingMax(db, 'squat', 315, 'lbs');
    await setTrainingMax(db, 'bench', 225, 'lbs');
    const Wrapper = makeWrapper(db);

    const { findByTestId } = render(
      <Wrapper>
        <ListProbe />
      </Wrapper>,
    );

    await waitFor(async () => {
      const node = await findByTestId('count');
      const text = Array.isArray(node.props.children)
        ? node.props.children.join('')
        : String(node.props.children);
      expect(text).toBe('count:2');
    });
  });

  it('useLatestTm returns the row for a specific lift', async () => {
    const db = freshDb();
    await setTrainingMax(db, 'squat', 315, 'lbs');
    const Wrapper = makeWrapper(db);

    const { findByTestId } = render(
      <Wrapper>
        <SquatProbe />
      </Wrapper>,
    );

    await waitFor(async () => {
      const node = await findByTestId('squat');
      const text = Array.isArray(node.props.children)
        ? node.props.children.join('')
        : String(node.props.children);
      expect(text).toBe('squat:315');
    });
  });
});
