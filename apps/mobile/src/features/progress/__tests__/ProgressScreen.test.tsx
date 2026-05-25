/**
 * Behavioral tests for the Progress screen using a real in-memory
 * better-sqlite3 DB and DbProvider, so the data layer (accessors +
 * useLiftProgression reshape) is exercised end-to-end.
 */
import { type AppDb, DbProvider } from '@/data/DbProvider';
import { completeSession, createSession } from '@/data/accessors/session';
import { appendSetLog } from '@/data/accessors/setLog';
import { seedDefaultSettings } from '@/data/accessors/settings';
import { setTrainingMax } from '@/data/accessors/trainingMax';
import { runMigrations } from '@/data/drizzle/runMigrations';
import * as schema from '@/data/drizzle/schema';
import { ThemeProvider } from '@/design/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, waitFor, within } from '@testing-library/react-native';
import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import type { ReactNode } from 'react';

// Reanimated 4 boots react-native-worklets at module load — not present in
// jest; inline-mock to plain RN views (mirrors HomeScreen test).
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

const mockRouterPush = jest.fn();
const mockSetParams = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: jest.fn(),
    back: jest.fn(),
    setParams: mockSetParams,
  }),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

// Gorhom's BottomSheet needs the gesture-handler context; for the goal-sheet
// behavior tests we render the body shell directly without the gorhom mount.
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const RN = require('react-native');
  const BottomSheet = ({ children }: { children: ReactNode }) =>
    React.createElement(RN.View, null, children);
  const BottomSheetView = ({ children }: { children: ReactNode }) =>
    React.createElement(RN.View, null, children);
  const BottomSheetBackdrop = () => null;
  return {
    __esModule: true,
    default: BottomSheet,
    BottomSheetView,
    BottomSheetBackdrop,
  };
});

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
      <ThemeProvider>
        <QueryClientProvider client={client}>
          <DbProvider db={db}>{children}</DbProvider>
        </QueryClientProvider>
      </ThemeProvider>
    );
  };
}

async function seedSquatHistory(db: AppDb) {
  await seedDefaultSettings(db);
  await setTrainingMax(db, 'squat', 230, 'lbs');
  // Two completed cycles: cycle 1 week 3 amrap, cycle 2 week 3 amrap.
  // Settings starts at cycle=1; we'll set rows up directly.
  // Use createSession + appendSetLog + completeSession (which advances day);
  // for the test we just want completed rows with amrap.
  const s1 = await createSession(db, 'squat');
  // Bypass the cycle-walk: write the row directly via drizzle to set cycle.
  // s1.cycle = 1 (from default settings).
  await appendSetLog(db, {
    sessionId: s1.id,
    index: 2,
    kind: 'amrap',
    prescribedWeight: 218,
    prescribedReps: 1,
    actualReps: 5,
  });
  await completeSession(db, s1.id);
  return s1.id;
}

import { ProgressScreen } from '../ProgressScreen';

const renderScreen = (db: AppDb) => {
  const Wrapper = makeWrapper(db);
  return render(
    <Wrapper>
      <ProgressScreen lift="squat" />
    </Wrapper>,
  );
};

describe('ProgressScreen', () => {
  beforeEach(() => {
    mockRouterPush.mockClear();
    mockSetParams.mockClear();
  });

  it('renders empty-state CTA when no sessions are logged', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 230, 'lbs');
    const screen = renderScreen(db);
    const page = await screen.findByTestId('progress-page-squat');
    await waitFor(() => {
      expect(within(page).queryByTestId('progress-empty')).toBeTruthy();
    });
    expect(within(page).getByText('LOG A SESSION TO LIGHT UP THIS GRID')).toBeTruthy();
  });

  it('renders the goal strip in no-goal state and opens the sheet on press', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 230, 'lbs');
    const screen = renderScreen(db);
    const page = await screen.findByTestId('progress-page-squat');
    const strip = within(page).getByTestId('goal-strip-squat');
    expect(within(page).getByText('SET AN e1RM GOAL')).toBeTruthy();
    fireEvent.press(strip);
    await waitFor(() => {
      expect(within(page).queryByTestId('goal-sheet-squat-save')).toBeTruthy();
    });
  });

  it('saves a goal optimistically: strip swaps to goal-set copy after Save', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 230, 'lbs');
    const screen = renderScreen(db);
    const page = await screen.findByTestId('progress-page-squat');
    fireEvent.press(within(page).getByTestId('goal-strip-squat'));
    const save = within(page).getByTestId('goal-sheet-squat-save');
    await act(async () => {
      fireEvent.press(save);
    });
    await waitFor(() => {
      // After save the strip swaps from "SET AN e1RM GOAL" to "GOAL · e1RM …".
      expect(within(page).queryByText(/GOAL · e1RM/)).toBeTruthy();
    });
  });

  it('tapping a past cell calls router.push to SessionComplete with from=history', async () => {
    const db = freshDb();
    const sessionId = await seedSquatHistory(db);
    const screen = renderScreen(db);
    const page = await screen.findByTestId('progress-page-squat');
    // seedSquatHistory creates a session at cycle=1 week=1 → day=1;
    // completeSession bumps day, so the session row stays inside the
    // current cycle row. The week-1 session lands in cell D1 of cycle 1.
    const cell = await within(page).findByTestId('progress-cell-1-1');
    fireEvent.press(cell);
    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    const call = mockRouterPush.mock.calls[0]?.[0] as {
      pathname: string;
      params: Record<string, string>;
    };
    expect(call.pathname).toContain('complete');
    expect(call.params.sessionId).toBe(String(sessionId));
    expect(call.params.from).toBe('history');
  });

  it('future cells render with accessibilityRole text (not button)', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 230, 'lbs');
    const screen = renderScreen(db);
    const page = await screen.findByTestId('progress-page-squat');
    // CurrentCycle starts at 1; future row at cycle 2 day 1 should be ghosted.
    const future = await within(page).findByTestId('progress-cell-2-1');
    expect(future.props.accessibilityRole).toBe('text');
  });
});
