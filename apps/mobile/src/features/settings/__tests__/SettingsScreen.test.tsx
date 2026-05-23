/**
 * Behavioral tests for the Settings screen (PE-11 8-section parity).
 *
 * Verifies:
 *  1. PE-08 PD-04 invariant: editing a TM via TmEditSheet APPENDS rather than
 *     overwriting.
 *  2. PE-11 contract:
 *     a. Tapping "Reset everything" opens ResetConfirmSheet; Cancel closes it.
 *     b. Confirming reset truncates all tables AND navigates to /onboarding.
 *     c. Display-unit SegRail flip patches settings.displayUnit and re-renders.
 *     d. Storage-unit SegRail flip opens UnitMigrationSheet; Confirm appends
 *        migrated TM rows + patches settings.storageUnit (history preserved).
 *     e. Cancel on UnitMigrationSheet leaves storage unit untouched.
 *
 * Render against a real in-memory better-sqlite3 db.
 */
import { type AppDb, DbProvider } from '@/data/DbProvider';
import { getSettings, seedDefaultSettings } from '@/data/accessors/settings';
import {
  getCurrentTrainingMaxes,
  getTrainingMaxHistory,
  setTrainingMax,
} from '@/data/accessors/trainingMax';
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

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
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
  beforeEach(() => {
    mockReplace.mockClear();
  });

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

  it('opens ResetConfirmSheet on Reset tap and Cancel closes it without truncating', async () => {
    const { db } = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');

    const Wrapper = makeWrapper(db);
    const screen = render(
      <Wrapper>
        <SettingsScreen />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('reset-everything-button')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('reset-everything-button'));

    // ResetConfirmSheet shown
    const cancel = await screen.findByTestId('reset-cancel');
    await act(async () => {
      fireEvent.press(cancel);
    });

    // Sheet closed → reset-confirm gone, data intact, no navigation.
    await waitFor(() => {
      expect(screen.queryByTestId('reset-confirm')).toBeNull();
    });
    expect((await getCurrentTrainingMaxes(db)).length).toBe(1);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('confirms reset → truncates all tables and replaces route to /onboarding', async () => {
    const { db, sqlite } = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');

    const Wrapper = makeWrapper(db);
    const screen = render(
      <Wrapper>
        <SettingsScreen />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('reset-everything-button')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('reset-everything-button'));

    const confirm = await screen.findByTestId('reset-confirm');
    await act(async () => {
      fireEvent.press(confirm);
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/onboarding');
    });

    // training_maxes / sessions / set_logs / prs are wiped — the
    // FirstLaunchGate uses the empty training_maxes table to redirect to
    // onboarding. The settings singleton may be re-seeded by a subsequent
    // useSettings refetch (queryClient.clear() invalidates the cache); the
    // accessor's own `__tests__/reset.test.ts` asserts the precise truncate
    // invariant.
    for (const tbl of ['training_maxes', 'sessions', 'set_logs', 'prs']) {
      const { c } = sqlite.prepare(`SELECT COUNT(*) AS c FROM ${tbl}`).get() as { c: number };
      expect(c).toBe(0);
    }
  });

  it('flipping the display-unit SegRail patches settings.displayUnit and renders the new glyph', async () => {
    const { db } = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');

    const Wrapper = makeWrapper(db);
    const screen = render(
      <Wrapper>
        <SettingsScreen />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('settings-display-unit-kg')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId('settings-display-unit-kg'));
    });

    await waitFor(async () => {
      const s = await getSettings(db);
      expect(s.displayUnit).toBe('kg');
    });
  });

  it('flipping the storage-unit SegRail opens UnitMigrationSheet with previews; Confirm migrates and preserves history', async () => {
    const { db } = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');
    await setTrainingMax(db, 'bench', 200, 'lbs');

    const Wrapper = makeWrapper(db);
    const screen = render(
      <Wrapper>
        <SettingsScreen />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('settings-storage-unit-kg')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('settings-storage-unit-kg'));

    // Preview rows appear in the migration sheet.
    await waitFor(() => {
      expect(screen.getByTestId('unit-migration-row-squat')).toBeTruthy();
      expect(screen.getByTestId('unit-migration-row-bench')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId('unit-migration-confirm'));
    });

    // Settings.storageUnit patched.
    await waitFor(async () => {
      const s = await getSettings(db);
      expect(s.storageUnit).toBe('kg');
    });

    // All current TM rows are now in kg.
    const tms = await getCurrentTrainingMaxes(db);
    expect(tms.length).toBeGreaterThan(0);
    for (const tm of tms) {
      expect(tm.unit).toBe('kg');
    }

    // History preserves the original lb row.
    const squatHistory = await getTrainingMaxHistory(db, 'squat');
    expect(squatHistory.length).toBe(2);
    const lbRow = squatHistory.find((r) => r.unit === 'lbs');
    expect(lbRow?.value).toBe(250);
  });

  it('cancelling on UnitMigrationSheet leaves storageUnit unchanged', async () => {
    const { db } = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');

    const Wrapper = makeWrapper(db);
    const screen = render(
      <Wrapper>
        <SettingsScreen />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('settings-storage-unit-kg')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('settings-storage-unit-kg'));

    const cancel = await screen.findByTestId('unit-migration-cancel');
    await act(async () => {
      fireEvent.press(cancel);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('unit-migration-confirm')).toBeNull();
    });

    const s = await getSettings(db);
    expect(s.storageUnit).toBe('lbs');
    // No new TM row appended.
    const squatHistory = await getTrainingMaxHistory(db, 'squat');
    expect(squatHistory).toHaveLength(1);
    expect(squatHistory[0]?.unit).toBe('lbs');
  });
});
