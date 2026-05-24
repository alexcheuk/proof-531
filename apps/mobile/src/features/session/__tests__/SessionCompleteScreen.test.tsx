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

// PRCertificate uses Reanimated's FadeInDown for its mount animation; under
// jest the Worklets native module is absent, so swap Animated.View for a
// plain RN View.
jest.mock('react-native-reanimated', () => {
  const RN = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: { View: RN.View, Text: RN.Text, ScrollView: RN.ScrollView },
    FadeInDown: { duration: () => ({ springify: () => ({ damping: () => ({}) }) }) },
    FadeIn: { duration: () => ({}) },
    FadeOut: { duration: () => ({}) },
    LinearTransition: { duration: () => ({}) },
  };
});

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

  it('renders the PR certificate + delta + Adjust TM CTA when a PR was set', async () => {
    setLogsState.rows = buildLogs({ isPR: true });
    const screen = renderScreen(<SessionCompleteScreen sessionId={42} />);

    await waitFor(() => {
      expect(screen.getByTestId('session-complete-cert')).toBeTruthy();
      // The e1RM hero number renders ...
      expect(screen.getByTestId('session-complete-cert-e1rm')).toBeTruthy();
      // ... and the delta column shows a "+N" string.
      const delta = screen.getByTestId('session-complete-cert-delta');
      expect(delta.props.children).toEqual(expect.stringMatching(/^\+\d+$/));
      // Post-PR CTA routes to settings.
      expect(screen.getByTestId('session-complete-adjust-tm')).toBeTruthy();
    });
  });

  it('does NOT render the PR certificate or Adjust TM CTA without a PR', async () => {
    setLogsState.rows = buildLogs({ isPR: false });
    const screen = renderScreen(<SessionCompleteScreen sessionId={42} />);

    await waitFor(() => {
      expect(screen.getByTestId('session-complete-title')).toBeTruthy();
    });
    expect(screen.queryByTestId('session-complete-cert')).toBeNull();
    expect(screen.queryByTestId('session-complete-adjust-tm')).toBeNull();
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
});
