/**
 * Behavioral test for the SessionComplete screen.
 *
 * Asserts the PE-06 done_when contract:
 *   - DateStamp, title, and receipt rows render for a completed session.
 *   - When a set log carries `isPR === true`, `Haptics.notificationAsync` is
 *     called with the `success` notification type exactly once.
 *   - When no log carries a PR, the success haptic is NOT called.
 *   - The "Close the day" CTA calls `router.replace('/')`.
 *
 * Every cross-cutting dependency is mocked so the screen renders headless
 * under jest-expo.
 */
import { ThemeProvider } from '@/design/theme';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import type { ReactElement } from 'react';

const mockReplace = jest.fn();
const mockNotificationAsync = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  notificationAsync: (...args: unknown[]) => mockNotificationAsync(...args),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Warning: 'warning', Error: 'error', Success: 'success' },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  // biome-ignore lint/suspicious/noExplicitAny: trivial test provider stub
  SafeAreaProvider: ({ children }: any) => children,
}));

jest.mock('@/data/DbProvider', () => ({
  useDb: () => ({ __stub: 'db' }),
}));

// Session row — happy path: endedAt set, lift = squat, week 1, lbs.
// startedAt + endedAt give a 30s elapsed for the receipt row.
const startedAt = 1_700_000_000_000;
const endedAt = startedAt + 30 * 60 * 1000; // +30 min

jest.mock('@/data/queries/useSession', () => ({
  useSession: () => ({
    data: {
      id: 42,
      lift: 'squat',
      cycle: 1,
      week: 1,
      startedAt,
      endedAt,
      status: 'completed',
      trainingMaxSnapshot: 300,
      storageUnitSnapshot: 'lbs',
      displayUnitSnapshot: 'lbs',
    },
    isLoading: false,
    error: null,
  }),
}));

// Mutable holder so each test can swap the set logs the hook returns. The
// shape mirrors the persisted `SetLog` row.
const setLogsState: {
  rows: Array<{
    id: number;
    sessionId: number;
    index: number;
    kind: 'working' | 'amrap';
    prescribedWeight: number;
    prescribedReps: number;
    actualReps: number;
    completedAt: number;
    isPR?: boolean;
    estimated1RM?: number;
  }>;
} = { rows: [] };

jest.mock('@/data/queries/useSetLogsForSession', () => ({
  useSetLogsForSession: () => ({
    data: setLogsState.rows,
    isLoading: false,
    error: null,
  }),
}));

jest.mock('@/data/queries/useSettings', () => ({
  useSettings: () => ({
    data: {
      displayUnit: 'lbs',
      storageUnit: 'lbs',
      plateSet: 'standard',
      enabledLifts: ['squat', 'bench', 'deadlift', 'press'],
      currentCycle: 1,
      week: 1,
      restTargetSeconds: 90,
    },
    isLoading: false,
    error: null,
  }),
}));

jest.mock('@/data/queries/usePrs', () => ({
  usePrs: () => ({ data: [], isLoading: false, error: null }),
}));

// Wave 3 W3.3 — `SessionCompleteScreen` now reads the next-lift TM for the
// NextSessionRow. Default to a populated set so the row shows a real weight;
// individual tests can override via `latestTmsState.data = …`.
const latestTmsState: { data: unknown; isLoading: boolean; error: unknown } = {
  data: [
    { id: 1, lift: 'squat', value: 300, unit: 'lbs', updatedAt: 1, note: null },
    { id: 2, lift: 'bench', value: 200, unit: 'lbs', updatedAt: 1, note: null },
    { id: 3, lift: 'deadlift', value: 400, unit: 'lbs', updatedAt: 1, note: null },
    { id: 4, lift: 'press', value: 150, unit: 'lbs', updatedAt: 1, note: null },
  ],
  isLoading: false,
  error: null,
};
jest.mock('@/data/queries/useLatestTm', () => ({
  useLatestTms: () => latestTmsState,
  TM_KEY: ['trainingMaxes'],
}));

// Import after mocks so the screen sees the stubs.
import { SessionCompleteScreen } from '../SessionCompleteScreen';

const renderScreen = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

const buildLogs = (opts: { isPR: boolean }) => [
  {
    id: 1,
    sessionId: 42,
    index: 0,
    kind: 'working' as const,
    prescribedWeight: 195,
    prescribedReps: 5,
    actualReps: 5,
    completedAt: startedAt + 5 * 60 * 1000,
  },
  {
    id: 2,
    sessionId: 42,
    index: 1,
    kind: 'working' as const,
    prescribedWeight: 225,
    prescribedReps: 5,
    actualReps: 5,
    completedAt: startedAt + 15 * 60 * 1000,
  },
  {
    id: 3,
    sessionId: 42,
    index: 2,
    kind: 'amrap' as const,
    prescribedWeight: 255,
    prescribedReps: 5,
    actualReps: 8,
    completedAt: startedAt + 25 * 60 * 1000,
    isPR: opts.isPR,
    estimated1RM: 323,
  },
];

describe('SessionCompleteScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockNotificationAsync.mockClear();
    setLogsState.rows = [];
  });

  it('renders the date stamp, title, and receipt rows for a completed session', async () => {
    setLogsState.rows = buildLogs({ isPR: false });
    const screen = renderScreen(<SessionCompleteScreen sessionId={42} />);

    await waitFor(() => {
      expect(screen.getByTestId('session-complete-title')).toBeTruthy();
      expect(screen.getByTestId('session-complete-stamp')).toBeTruthy();
      expect(screen.getByTestId('session-complete-receipt')).toBeTruthy();
      expect(screen.getByTestId('receipt-top')).toBeTruthy();
      expect(screen.getByTestId('receipt-volume')).toBeTruthy();
    });
  });

  it('fires a success notification haptic once when a log has isPR=true', async () => {
    setLogsState.rows = buildLogs({ isPR: true });
    renderScreen(<SessionCompleteScreen sessionId={42} />);

    await waitFor(() => {
      expect(mockNotificationAsync).toHaveBeenCalledWith('success');
    });
    expect(mockNotificationAsync).toHaveBeenCalledTimes(1);
  });

  it('does NOT fire the success haptic when no log has isPR=true', async () => {
    setLogsState.rows = buildLogs({ isPR: false });
    renderScreen(<SessionCompleteScreen sessionId={42} />);

    // Allow any effect to flush.
    await act(async () => {
      await Promise.resolve();
    });
    expect(mockNotificationAsync).not.toHaveBeenCalled();
  });

  it('renders the masthead wordmark + Filed chip and the cycle grid', async () => {
    setLogsState.rows = buildLogs({ isPR: false });
    const screen = renderScreen(<SessionCompleteScreen sessionId={42} />);

    await waitFor(() => {
      expect(screen.getByTestId('session-complete-masthead')).toBeTruthy();
      expect(screen.getByText('Filed')).toBeTruthy();
      expect(screen.getByTestId('cycle-grid')).toBeTruthy();
      // 4 lifts × 4 weeks = 16 cells.
      expect(screen.getAllByTestId('cycle-cell')).toHaveLength(16);
    });
  });

  it('renders the "In the / book." headline and a "See full record" secondary link', async () => {
    setLogsState.rows = buildLogs({ isPR: false });
    const screen = renderScreen(<SessionCompleteScreen sessionId={42} />);

    await waitFor(() => {
      expect(screen.getByText(/In the\s*book\./)).toBeTruthy();
      expect(screen.getByTestId('session-complete-history-link')).toBeTruthy();
    });
  });

  it('"Close the day" CTA calls router.replace("/")', async () => {
    setLogsState.rows = buildLogs({ isPR: false });
    const screen = renderScreen(<SessionCompleteScreen sessionId={42} />);

    await waitFor(() => {
      expect(screen.getByTestId('session-complete-close')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId('session-complete-close'));
    });

    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  // ── Wave 3 ──────────────────────────────────────────────────────────────

  it('W3.3: NextSessionRow renders with the next lift, week/day, and weight × reps', async () => {
    setLogsState.rows = buildLogs({ isPR: false });
    const screen = renderScreen(<SessionCompleteScreen sessionId={42} />);

    await waitFor(() => {
      expect(screen.getByTestId('session-complete-next-session')).toBeTruthy();
    });
    // Current lift is `squat` (index 0 in enabled), week 1. Next session
    // wraps to `bench` (index 1), week stays at 1. Bench TM = 200.
    // Top set on week 1 is 85% × 5 (AMRAP) → 170 × 5+.
    expect(screen.getByTestId('next-session-row-lift').props.children).toBe('Bench');
    const weekDay = screen.getByTestId('next-session-row-week-day');
    expect(weekDay.props.children).toEqual(['Week ', 1, ' · Day ', 2]);
    expect(screen.getByTestId('next-session-row-weight').props.children).toBe('170 lb × 5+');
  });

  it('W3.3: NextSessionRow shows "Set a training max first" when the next lift has no TM', async () => {
    setLogsState.rows = buildLogs({ isPR: false });
    latestTmsState.data = [
      // Only squat — bench/deadlift/press have no row.
      { id: 1, lift: 'squat', value: 300, unit: 'lbs', updatedAt: 1, note: null },
    ];
    const screen = renderScreen(<SessionCompleteScreen sessionId={42} />);

    await waitFor(() => {
      expect(screen.getByTestId('next-session-row-no-tm')).toBeTruthy();
    });
    // Reset for the next test.
    latestTmsState.data = [
      { id: 1, lift: 'squat', value: 300, unit: 'lbs', updatedAt: 1, note: null },
      { id: 2, lift: 'bench', value: 200, unit: 'lbs', updatedAt: 1, note: null },
      { id: 3, lift: 'deadlift', value: 400, unit: 'lbs', updatedAt: 1, note: null },
      { id: 4, lift: 'press', value: 150, unit: 'lbs', updatedAt: 1, note: null },
    ];
  });

  it('W3.4: cycle grid at standard width renders the flat 16-cell row (`cycle-grid` testID)', async () => {
    setLogsState.rows = buildLogs({ isPR: false });
    const screen = renderScreen(<SessionCompleteScreen sessionId={42} />);

    await waitFor(() => {
      expect(screen.getByTestId('cycle-grid')).toBeTruthy();
    });
    // 16 cells in the flat layout.
    expect(screen.getAllByTestId('cycle-cell')).toHaveLength(16);
    // The narrow-layout week labels are NOT present.
    expect(screen.queryByTestId('cycle-grid-week-1')).toBeNull();
  });

  it('W3.4: cycle grid at narrow width (<360pt) renders 4 stacked week rows with labels', async () => {
    // Swap Dimensions.get to return a narrow window for this test only.
    const originalGet = require('react-native').Dimensions.get;
    require('react-native').Dimensions.get = (which: string) =>
      which === 'window' ? { width: 320, height: 568 } : originalGet(which);

    setLogsState.rows = buildLogs({ isPR: false });
    const screen = renderScreen(<SessionCompleteScreen sessionId={42} />);

    await waitFor(() => {
      expect(screen.getByTestId('cycle-grid-week-1')).toBeTruthy();
    });
    expect(screen.getByTestId('cycle-grid-week-2')).toBeTruthy();
    expect(screen.getByTestId('cycle-grid-week-3')).toBeTruthy();
    expect(screen.getByTestId('cycle-grid-week-4')).toBeTruthy();
    // Each week row carries a leading W{n} label.
    expect(screen.getByTestId('cycle-grid-week-label-1').props.children).toEqual(['W', 1]);

    // Reset Dimensions for subsequent tests.
    require('react-native').Dimensions.get = originalGet;
  });
});
