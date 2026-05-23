/**
 * Behavioral test for the Settings screen.
 *
 * Verifies the PE-08 done_when contract — the PD-04 invariant in particular:
 * editing a Training max via TmEditSheet INSERTs a new training_maxes row;
 * it does NOT update the existing row. After Save, both the old TM (250) and
 * the new TM (260) live in the table.
 *
 * Strategy: render `SettingsScreen` against a real in-memory better-sqlite3
 * db (mirrors `data/accessors/__tests__/trainingMax.test.ts`). The gorhom
 * bottom-sheet is mocked to render its children inline so the test driver
 * can click the Save button.
 */
import { type AppDb, DbProvider } from '@/data/DbProvider';
import { seedDefaultSettings } from '@/data/accessors/settings';
import { setTrainingMax } from '@/data/accessors/trainingMax';
import { runMigrations } from '@/data/drizzle/runMigrations';
import * as schema from '@/data/drizzle/schema';
import { ThemeProvider } from '@/design/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import type { ReactNode } from 'react';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

// Render the gorhom bottom-sheet's children inline so we can drive Save / +
// pressables from the test. Mirrors the LiveScreen test's pattern.
type MockBottomSheetProps = {
  index?: number;
  children?: React.ReactNode;
};
type MockViewProps = { children?: React.ReactNode; testID?: string };

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ index, children }: MockBottomSheetProps) => {
      if ((index ?? -1) < 0) return null;
      return React.createElement(React.Fragment, null, children);
    },
    BottomSheetBackdrop: () => null,
    BottomSheetView: ({ children }: MockViewProps) => {
      const React = require('react');
      return React.createElement(React.Fragment, null, children);
    },
  };
});

// Import after mocks.
import { SettingsScreen } from '../SettingsScreen';

function freshDb(): { db: AppDb; sqlite: BetterSqlite3.Database } {
  const sqlite = new BetterSqlite3(':memory:');
  runMigrations(sqlite);
  // biome-ignore lint/suspicious/noExplicitAny: cross-driver structural typing
  const db = drizzle(sqlite, { schema }) as any;
  return { db, sqlite };
}

function makeWrapper(db: AppDb) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <DbProvider db={db}>
          <ThemeProvider>{children}</ThemeProvider>
        </DbProvider>
      </QueryClientProvider>
    );
  };
}

describe('SettingsScreen', () => {
  it('appends a new training_maxes row when the TM is edited (does not overwrite)', async () => {
    const { db, sqlite } = freshDb();
    await seedDefaultSettings(db);
    // Seed an initial squat TM of 250 lbs.
    await setTrainingMax(db, 'squat', 250, 'lbs');

    const Wrapper = makeWrapper(db);
    const screen = render(
      <Wrapper>
        <SettingsScreen />
      </Wrapper>,
    );

    // Wait for the program section's squat row to be present (data loaded).
    await waitFor(() => {
      expect(screen.getByTestId('settings-tm-row-squat')).toBeTruthy();
    });

    // Open the TmEditSheet for squat.
    fireEvent.press(screen.getByTestId('settings-tm-row-squat'));

    // Bump the stepper by two ticks of 5 lb → 260.
    const plus = await screen.findByTestId('tm-edit-stepper-plus');
    fireEvent.press(plus);
    fireEvent.press(plus);

    // Save.
    await act(async () => {
      fireEvent.press(screen.getByTestId('tm-edit-save'));
    });

    // Verify the table has BOTH rows for squat (append-only invariant).
    await waitFor(() => {
      const rows = sqlite
        .prepare('SELECT id, lift, value, unit FROM training_maxes WHERE lift = ? ORDER BY id ASC')
        .all('squat') as Array<{ id: number; lift: string; value: number; unit: string }>;
      expect(rows).toHaveLength(2);
      expect(rows[0]?.value).toBe(250);
      expect(rows[1]?.value).toBe(260);
      expect(rows[0]?.id).not.toBe(rows[1]?.id);
    });
  });
});
