/**
 * Integration test for the storage / display unit split.
 *
 * Scenario (done_when):
 *   1. Write a TM in lbs.
 *   2. Flip displayUnit→kg via `setDisplayUnit`.
 *   3. Render LiftPage with the resulting (storageUnit, displayUnit, tm).
 *   4. Assert Home renders kg-snapped numbers AND the underlying TM row
 *      in the storage table is untouched (still 250 lb).
 *
 * Asserts the contract that `setDisplayUnit` is a display-only flip — no
 * weights are migrated, no rows mutated, just the per-render conversion
 * function picks up the new currency.
 */
import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import type { ReactElement } from 'react';
import { getSettings, seedDefaultSettings, setDisplayUnit } from '../../../data/accessors/settings';
import { getCurrentTrainingMaxes, setTrainingMax } from '../../../data/accessors/trainingMax';
import { runMigrations } from '../../../data/drizzle/runMigrations';
import * as schema from '../../../data/drizzle/schema';

jest.mock('react-native-reanimated', () => {
  const RN = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: { View: RN.View, Text: RN.Text, ScrollView: RN.ScrollView },
    LinearTransition: { duration: () => ({}) },
    FadeIn: { duration: () => ({}) },
    FadeOut: { duration: () => ({}) },
  };
});

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

jest.mock('@/data/queries/useLastCompletedSessionForLift', () => ({
  useLastCompletedSessionForLift: () => ({ startedAt: null, isLoading: false }),
}));

import { LiftPage } from '../components/LiftPage/LiftPage';

type TestDb = ReturnType<typeof drizzle<typeof schema>>;

function freshDb(): TestDb {
  const sqlite = new BetterSqlite3(':memory:');
  runMigrations(sqlite);
  return drizzle(sqlite, { schema });
}

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('Home cross-unit render via setDisplayUnit (integration)', () => {
  it('flips displayUnit→kg without mutating the storage TM row', async () => {
    const db = freshDb();
    await seedDefaultSettings(db); // storageUnit=lbs, displayUnit=lbs
    await setTrainingMax(db, 'squat', 250, 'lbs');

    // Sanity — initial settings.
    const before = await getSettings(db);
    expect(before.storageUnit).toBe('lbs');
    expect(before.displayUnit).toBe('lbs');

    // Flip displayUnit only — must not touch any TM row.
    await setDisplayUnit(db, 'kg');

    const after = await getSettings(db);
    expect(after.storageUnit).toBe('lbs'); // storage untouched
    expect(after.displayUnit).toBe('kg');

    const tms = await getCurrentTrainingMaxes(db);
    const squat = tms.find((t) => t.lift === 'squat');
    // Storage row is untouched — still 250 lb (no migration row appended).
    expect(squat?.value).toBe(250);
    expect(squat?.unit).toBe('lbs');
    expect(tms.filter((t) => t.lift === 'squat')).toHaveLength(1);

    // Now render the LiftPage with the resulting settings + TM. The screen
    // should show the kg-snapped top-set weight, not the lbs-storage number.
    //   prescription(week=1) → top set is 85% TM.
    //   snapWeight(250 * 0.85, 'lbs') = 215 lb.
    //   displayWeight(215, 'lbs', 'kg') = 97.5 kg.
    //   displayWeight(250, 'lbs', 'kg') = 112.5 kg (TM caption).
    const screen = wrap(
      <LiftPage
        lift="squat"
        week={1}
        cycle={1}
        storageUnit={squat?.unit ?? 'lbs'}
        displayUnit={after.displayUnit}
        plateSet={after.plateSet}
        tm={squat?.value ?? 0}
        isInProgress={false}
        onBegin={() => {}}
        onResume={() => {}}
      />,
    );

    // Hero + compact-ladder top-set row both render the kg-snapped weight.
    expect(screen.getAllByText('97.5').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/TM\s+112\.5\s+kg/).length).toBeGreaterThanOrEqual(1);
    // Raw lbs storage number must not surface as the top weight.
    expect(screen.queryByText('215')).toBeNull();
    expect(screen.queryByText('250')).toBeNull();
  });
});
