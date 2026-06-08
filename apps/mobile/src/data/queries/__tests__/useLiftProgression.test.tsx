import { type AppDb, DbProvider } from '@/data/DbProvider';
/**
 * Integration test for `useLiftProgression` against an in-memory better-sqlite3
 * db. Focus: the Progress grid's TM column must show each PAST cycle's
 * historical training max (the value the lifter actually trained at), not
 * today's TM. Regression guard for the "previous cycles always show the latest
 * TM" bug (Discord #task-queue 1513368638764093490).
 */
import { completeSession, createSession } from '@/data/accessors/session';
import { appendSetLog } from '@/data/accessors/setLog';
import { seedDefaultSettings } from '@/data/accessors/settings';
import { setTrainingMax } from '@/data/accessors/trainingMax';
import { runMigrations } from '@/data/drizzle/runMigrations';
import * as schema from '@/data/drizzle/schema';
import { useLiftProgression } from '@/data/queries/useLiftProgression';
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
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <DbProvider db={db}>{children}</DbProvider>
      </QueryClientProvider>
    );
  };
}

/** Log a minimal completed session and advance the lift one day. */
async function completeOneDay(db: AppDb) {
  const session = await createSession(db, 'squat');
  await appendSetLog(db, {
    sessionId: session.id,
    index: 2,
    kind: 'amrap',
    prescribedWeight: 200,
    prescribedReps: 5,
    actualReps: 5,
  });
  await completeSession(db, session.id);
}

function ProbeRows() {
  const { data } = useLiftProgression('squat');
  if (!data) return <Text testID="loading">loading</Text>;
  const tmByCycle = data.rows.map((r) => `${r.cycle}:${r.tm}`).join(',');
  return <Text testID="tms">{`current:${data.currentCycle}|${tmByCycle}`}</Text>;
}

describe('useLiftProgression historical TM column', () => {
  it('past cycles show the TM trained at then, not the latest TM', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');

    // Complete a full cycle (4 days). The 4th completion wraps the cycle and
    // bumps squat TM by +10 → 260, landing the lifter in cycle 2.
    for (let i = 0; i < 4; i++) await completeOneDay(db);

    const Wrapper = makeWrapper(db);
    const { findByTestId } = render(
      <Wrapper>
        <ProbeRows />
      </Wrapper>,
    );

    await waitFor(async () => {
      const node = await findByTestId('tms');
      const text = String(node.props.children);
      // Now in cycle 2 at TM 260; cycle 1 (past) must read its historical 250.
      expect(text).toContain('current:2|');
      expect(text).toContain('1:250');
      expect(text).toContain('2:260');
    });
  });
});
