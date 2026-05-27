/**
 * Behavioral test for the SessionComplete screen.
 *
 * Asserts the PE-06 done_when contract:
 *   - DateStamp, title, and receipt rows render for a completed session.
 *   - When a set log carries `isPR === true`, `Haptics.notificationAsync` is
 *     called with the `success` notification type exactly once.
 *   - When no log carries a PR, the success haptic is NOT called.
 *   - The "Close the day" CTA dismisses the session stack first, then navigates
 *     to Progress (navigate, not replace, avoids duplicate tabs entries on
 *     consecutive sessions).
 *
 * Every cross-cutting dependency is mocked so the screen renders headless
 * under jest-expo.
 */
import { ThemeProvider } from '@/design/theme';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import type { ReactElement } from 'react';

const mockReplace = jest.fn();
const mockNavigate = jest.fn();
const mockPush = jest.fn();
const mockBack = jest.fn();
const mockDismissAll = jest.fn();
const mockNotificationAsync = jest.fn();
const routerCanGoBack = { value: true };
const routerCanDismiss = { value: true };

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
    navigate: mockNavigate,
    push: mockPush,
    back: mockBack,
    canGoBack: () => routerCanGoBack.value,
    canDismiss: () => routerCanDismiss.value,
    dismissAll: mockDismissAll,
  }),
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

jest.mock('react-native-reanimated', () => {
  const RN = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: { View: RN.View, Text: RN.Text, ScrollView: RN.ScrollView },
    useSharedValue: (v: unknown) => ({ value: v }),
    useAnimatedStyle: () => ({}),
    withTiming: (v: unknown) => v,
    withDelay: (_d: unknown, v: unknown) => v,
    cancelAnimation: () => {},
    Easing: {
      out: () => () => 0,
      inOut: () => () => 0,
      ease: () => 0,
      cubic: () => 0,
    },
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
    kind: 'working' | 'amrap' | 'bbb';
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
      bbbRestTargetSeconds: 90,
      liveScreenInverted: false,
    },
    isLoading: false,
    error: null,
  }),
}));

jest.mock('@/data/queries/usePreviousBestE1RM', () => ({
  usePreviousBestE1RM: () => ({ data: 0, isLoading: false, error: null }),
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
    mockNavigate.mockClear();
    mockDismissAll.mockClear();
    routerCanDismiss.value = true;
    mockPush.mockClear();
    mockBack.mockClear();
    mockNotificationAsync.mockClear();
    routerCanGoBack.value = true;
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

  it('omits the receipt-bbb row when the user skipped BBB (no bbb set_logs, loop-016)', async () => {
    setLogsState.rows = buildLogs({ isPR: false });
    const screen = renderScreen(<SessionCompleteScreen sessionId={42} />);
    await waitFor(() => {
      expect(screen.getByTestId('receipt-volume')).toBeTruthy();
    });
    expect(screen.queryByTestId('receipt-bbb')).toBeNull();
  });

  it('renders the receipt-bbb row when 5 bbb set_logs exist (loop-016)', async () => {
    setLogsState.rows = [
      ...buildLogs({ isPR: false }),
      ...Array.from({ length: 5 }, (_, i) => ({
        id: 10 + i,
        sessionId: 42,
        index: i,
        kind: 'bbb' as const,
        prescribedWeight: 150,
        prescribedReps: 10,
        actualReps: 10,
        completedAt: startedAt + (26 + i) * 60 * 1000,
      })),
    ];
    const screen = renderScreen(<SessionCompleteScreen sessionId={42} />);
    await waitFor(() => {
      expect(screen.getByTestId('receipt-bbb')).toBeTruthy();
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

  it('"Close the day" CTA routes to the Progress tab for this lift', async () => {
    setLogsState.rows = buildLogs({ isPR: false });
    const screen = renderScreen(<SessionCompleteScreen sessionId={42} />);

    await waitFor(() => {
      expect(screen.getByTestId('session-complete-close')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId('session-complete-close'));
    });

    // Discord 1508935241 / 1509284142 — session stack is popped FIRST so
    // the cross-stack hop lands on a clean tab navigator. navigate()
    // from inside the session group was not reliably switching tabs in the
    // parent navigator (Discord 1509284142 regression), so we dismiss
    // first, then navigate.
    expect(mockDismissAll).toHaveBeenCalled();
    // Discord 1508779267 — navigate to Progress (not Home) so the one-time
    // fill-in animation can play on the just-completed cell.
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/(tabs)/progress',
      params: { lift: 'squat' },
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  describe('origin = "history"', () => {
    it('renders the "Back to history" CTA instead of close + secondary link', async () => {
      setLogsState.rows = buildLogs({ isPR: false });
      const screen = renderScreen(<SessionCompleteScreen sessionId={42} origin="history" />);

      await waitFor(() => {
        expect(screen.getByTestId('session-complete-back-to-history')).toBeTruthy();
      });
      expect(screen.queryByTestId('session-complete-close')).toBeNull();
      expect(screen.queryByTestId('session-complete-history-link')).toBeNull();
    });

    it('"Back to history" pushes the history tab route directly', async () => {
      setLogsState.rows = buildLogs({ isPR: false });
      const screen = renderScreen(<SessionCompleteScreen sessionId={42} origin="history" />);

      await waitFor(() => {
        expect(screen.getByTestId('session-complete-back-to-history')).toBeTruthy();
      });

      await act(async () => {
        fireEvent.press(screen.getByTestId('session-complete-back-to-history'));
      });

      // router.back() is unreliable across the tabs→session group push.
      // The CTA pushes the history tab route directly instead.
      expect(mockBack).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/(tabs)/history');
    });

    it('hardwareBackPress override routes to history via push, not router.back()', async () => {
      const RN = jest.requireActual('react-native');
      const addSpy = jest.spyOn(RN.BackHandler, 'addEventListener');
      setLogsState.rows = buildLogs({ isPR: false });
      const screen = renderScreen(<SessionCompleteScreen sessionId={42} origin="history" />);

      await waitFor(() => {
        expect(screen.getByTestId('session-complete-back-to-history')).toBeTruthy();
      });

      const call = addSpy.mock.calls.find(([event]) => event === 'hardwareBackPress');
      expect(call).toBeDefined();
      const handler = call?.[1] as () => boolean;
      const swallowed = handler();
      expect(swallowed).toBe(true);
      expect(mockBack).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/(tabs)/history');
      addSpy.mockRestore();
    });

    it('does NOT register the hardwareBackPress override when origin is live', async () => {
      const RN = jest.requireActual('react-native');
      const addSpy = jest.spyOn(RN.BackHandler, 'addEventListener');
      setLogsState.rows = buildLogs({ isPR: false });
      renderScreen(<SessionCompleteScreen sessionId={42} />);

      await waitFor(() => {
        // give the effect a chance to (not) run
        expect(true).toBe(true);
      });

      const call = addSpy.mock.calls.find(([event]) => event === 'hardwareBackPress');
      expect(call).toBeUndefined();
      addSpy.mockRestore();
    });
  });
});
