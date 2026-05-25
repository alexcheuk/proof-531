/**
 * Behavioral test for the Live screen.
 *
 * Asserts:
 *   - expo-keep-awake is activated on mount and deactivated on unmount.
 *   - Rest timer fires the warning haptic at T-3s. (T-0 audio cue was removed
 *     when expo-av was dropped — Expo Go on SDK 55 no longer ships its
 *     native module.)
 *   - Cancel button uses a two-tap pattern: first tap fires the warning
 *     haptic, second tap calls cancelSession.
 *   - The AMRAP bottom sheet is visible while in the `amrap-log` phase.
 *   - On phase==='complete', session-shaped queries are invalidated and the
 *     router replaces to `/session/complete?sessionId=…`.
 *
 * Every cross-cutting dependency is mocked so the screen renders headless
 * under jest-expo. The bottom-sheet mock follows the pattern from
 * `apps/mobile/src/design/primitives/Sheet.test.tsx` — render children
 * directly inside a Fragment.
 */
import { ThemeProvider } from '@/design/theme';
import { _resetSessionRuntimeForTests } from '@/features/session/sessionRuntime';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import type { ReactElement } from 'react';

const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockAppendSetLog = jest.fn();
const mockCompleteSession = jest.fn();
const mockCancelSession = jest.fn();
const mockActivateKeepAwake = jest.fn();
const mockDeactivateKeepAwake = jest.fn();
const mockNotificationAsync = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: mockBack }),
  useLocalSearchParams: () => ({}),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  notificationAsync: (...args: unknown[]) => mockNotificationAsync(...args),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Warning: 'warning', Error: 'error', Success: 'success' },
}));

jest.mock('expo-keep-awake', () => ({
  activateKeepAwakeAsync: (...args: unknown[]) => {
    mockActivateKeepAwake(...args);
    return Promise.resolve();
  },
  deactivateKeepAwake: (...args: unknown[]) => mockDeactivateKeepAwake(...args),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  // biome-ignore lint/suspicious/noExplicitAny: trivial test provider stub
  SafeAreaProvider: ({ children }: any) => children,
}));

const mockBottomSheet = {
  onChange: null as ((idx: number) => void) | null,
  onClose: null as (() => void) | null,
};

type MockBottomSheetProps = {
  index?: number;
  children?: React.ReactNode;
  onChange?: (idx: number) => void;
  onClose?: () => void;
};
type MockViewProps = { children?: React.ReactNode; testID?: string };

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  // Sheet primitive now drives open/close imperatively (snapToIndex /
  // close via ref). The BottomSheet is always mounted in the tree, so
  // the mock always renders children — the Sheet wrapper itself gates
  // visibility with a conditional render inside `BottomSheetView` based
  // on the `open` prop, which the test stub forwards via a sentinel.
  return {
    __esModule: true,
    default: ({ children, onChange, onClose }: MockBottomSheetProps) => {
      mockBottomSheet.onChange = onChange ?? null;
      mockBottomSheet.onClose = onClose ?? null;
      return React.createElement(React.Fragment, null, children);
    },
    BottomSheetBackdrop: () => null,
    BottomSheetView: ({ children }: MockViewProps) => {
      const React = require('react');
      return React.createElement(React.Fragment, null, children);
    },
  };
});

jest.mock('@/data/DbProvider', () => ({
  useDb: () => ({ __stub: 'db' }),
}));

// RestTimer's overtime pulse imports Reanimated; jest can't initialize the
// Worklets bridge, so stub the surface we use.
jest.mock('react-native-reanimated', () => {
  const RN = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: { View: RN.View },
    useSharedValue: (v: unknown) => ({ value: v }),
    useAnimatedStyle: () => ({}),
    withRepeat: (v: unknown) => v,
    withTiming: (v: unknown) => v,
    cancelAnimation: () => {},
    Easing: { inOut: () => () => 0, ease: () => 0 },
  };
});

type MockSessionState = {
  data: unknown;
  isLoading: boolean;
  error: unknown;
};

const mockSessionState: MockSessionState = {
  data: {
    id: 7,
    lift: 'squat',
    cycle: 1,
    week: 1,
    startedAt: 0,
    status: 'in_progress',
    trainingMaxSnapshot: 300,
    storageUnitSnapshot: 'lbs',
    displayUnitSnapshot: 'lbs',
    endedAt: null,
  },
  isLoading: false,
  error: null,
};

jest.mock('@/data/queries/useSession', () => ({
  useSession: () => mockSessionState,
  SESSION_KEY: (id: number | null) => ['session', id],
}));

const mockSetLogsState: { data: Array<{ kind: string; index: number }> } = { data: [] };
jest.mock('@/data/queries/useSetLogsForSession', () => ({
  useSetLogsForSession: () => mockSetLogsState,
  SET_LOGS_FOR_SESSION_KEY: (id: number | null) => ['setLogsForSession', id],
}));

function resetSessionState() {
  mockSessionState.data = {
    id: 7,
    lift: 'squat',
    cycle: 1,
    week: 1,
    startedAt: 0,
    status: 'in_progress',
    trainingMaxSnapshot: 300,
    storageUnitSnapshot: 'lbs',
    displayUnitSnapshot: 'lbs',
    endedAt: null,
  };
  mockSessionState.isLoading = false;
  mockSessionState.error = null;
}

jest.mock('@/data/queries/usePrs', () => ({
  usePrs: () => ({ data: [], isLoading: false, error: null }),
}));

const mockSettingsState: { data: unknown; isLoading: boolean; error: unknown } = {
  data: {
    id: 1,
    storageUnit: 'lbs',
    displayUnit: 'lbs',
    plateSet: 'standard',
    enabledLifts: ['squat', 'bench', 'deadlift', 'press'],
    currentCycle: 1,
    week: 1,
    day: 1,
    restTargetSeconds: 90,
  },
  isLoading: false,
  error: null,
};

jest.mock('@/data/queries/useSettings', () => ({
  useSettings: () => mockSettingsState,
  SETTINGS_KEY: ['settings'],
}));

jest.mock('@/data/accessors/setLog', () => ({
  appendSetLog: (...args: unknown[]) => mockAppendSetLog(...args),
}));

jest.mock('@/data/accessors/session', () => ({
  completeSession: (...args: unknown[]) => mockCompleteSession(...args),
  cancelSession: (...args: unknown[]) => mockCancelSession(...args),
}));

// Import after mocks.
import { LiveScreen } from '../LiveScreen';

let queryClient: QueryClient;
let invalidateSpy: jest.SpyInstance;

const renderScreen = (ui: ReactElement) =>
  render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{ui}</ThemeProvider>
    </QueryClientProvider>,
  );

describe('LiveScreen', () => {
  beforeEach(() => {
    // React 19's act() coordinates state-update batches via the
    // scheduler, which uses MessageChannel/setImmediate under the hood.
    // Faking those primitives deadlocks act() inside testing-library's
    // auto-cleanup. The `doNotFake` list keeps setTimeout/setInterval
    // (the rest-timer driver) fake while leaving the scheduler's
    // primitives real so unmount can complete.
    jest.useFakeTimers({
      doNotFake: [
        'nextTick',
        'queueMicrotask',
        'setImmediate',
        'clearImmediate',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'requestIdleCallback',
        'cancelIdleCallback',
        'performance',
      ],
    });
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: Number.POSITIVE_INFINITY,
          staleTime: Number.POSITIVE_INFINITY,
        },
      },
    });
    invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    resetSessionState();
    mockBack.mockClear();
    mockReplace.mockClear();
    mockAppendSetLog.mockReset();
    mockAppendSetLog.mockResolvedValue({ id: 1 });
    mockCompleteSession.mockReset();
    mockCompleteSession.mockResolvedValue(undefined);
    mockCancelSession.mockReset();
    mockCancelSession.mockResolvedValue(undefined);
    mockActivateKeepAwake.mockClear();
    mockDeactivateKeepAwake.mockClear();
    mockNotificationAsync.mockClear();
    mockBottomSheet.onChange = null;
    mockBottomSheet.onClose = null;
    mockSettingsState.data = {
      id: 1,
      storageUnit: 'lbs',
      displayUnit: 'lbs',
      plateSet: 'standard',
      enabledLifts: ['squat', 'bench', 'deadlift', 'press'],
      currentCycle: 1,
      week: 1,
      day: 1,
      restTargetSeconds: 90,
    };
    mockSettingsState.isLoading = false;
    mockSettingsState.error = null;
    mockSetLogsState.data = [];
    // The session-runtime snapshot lives at module scope so it would leak
    // between tests — explicitly clear it so each case starts from a clean
    // boot state.
    _resetSessionRuntimeForTests();
  });

  afterEach(() => {
    invalidateSpy.mockRestore();
    queryClient.clear();
    jest.useRealTimers();
  });

  it('renders a PlateBar under the big-weight readout during the set phase', () => {
    // Session is week 1, set 0 → prescribed = round(300 * 0.65, lbs) = 195 lb.
    // 195 = bar 45 + per-side (45 + 25 + 5). Not bar-only, so PlateBar renders.
    const screen = renderScreen(<LiveScreen sessionId={7} />);
    expect(screen.getByTestId('live-bigweight-plate-bar')).toBeTruthy();
  });

  it('activates expo-keep-awake on mount and deactivates on unmount', () => {
    const screen = renderScreen(<LiveScreen sessionId={7} />);
    expect(mockActivateKeepAwake).toHaveBeenCalledTimes(1);

    screen.unmount();
    expect(mockDeactivateKeepAwake).toHaveBeenCalledTimes(1);
  });

  it('fires warning haptic at T-3s and "done" success haptic at T-0 during rest', async () => {
    const screen = renderScreen(<LiveScreen sessionId={7} />);

    // Week 1, set 0 → working set (non-AMRAP). Log it to enter rest phase.
    await act(async () => {
      fireEvent.press(screen.getByTestId('cta-log-working'));
    });

    await waitFor(() => {
      expect(mockAppendSetLog).toHaveBeenCalledTimes(1);
    });

    // Rest phase mounted — RestTimer now visible.
    await waitFor(() => {
      expect(screen.getByTestId('rest-phase')).toBeTruthy();
    });

    // Default rest is 90s. Advance to T-3s (87s elapsed) → warning haptic.
    act(() => {
      jest.advanceTimersByTime(87_000);
    });
    expect(mockNotificationAsync).toHaveBeenCalledWith('warning');
    expect(mockNotificationAsync).toHaveBeenCalledTimes(1);

    // Advance to T-0 (90s elapsed) — "done" success haptic fires so the
    // user gets a stronger "time to lift" cue without watching the screen.
    act(() => {
      jest.advanceTimersByTime(3_000);
    });
    expect(mockNotificationAsync).toHaveBeenCalledWith('success');
    expect(mockNotificationAsync).toHaveBeenCalledTimes(2);
  });

  it('on phase=complete: invalidates session-shaped queries and replaces to /session/complete', async () => {
    // Walk through to setIndex=2 AMRAP and save → triggers completeSession +
    // setPhase('complete'), which the screen-level effect then handles.
    const screen = renderScreen(<LiveScreen sessionId={7} />);

    // Set 0.
    await act(async () => {
      fireEvent.press(screen.getByTestId('cta-log-working'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('rest-phase')).toBeTruthy();
    });
    act(() => {
      jest.advanceTimersByTime(90_000);
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('cta-advance-rest'));
    });

    // Set 1.
    await act(async () => {
      fireEvent.press(screen.getByTestId('cta-log-working'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('rest-phase')).toBeTruthy();
    });
    act(() => {
      jest.advanceTimersByTime(90_000);
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('cta-advance-rest'));
    });

    // Set 2 is AMRAP on week 1.
    await act(async () => {
      fireEvent.press(screen.getByTestId('cta-log-amrap'));
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('amrap-save'));
    });

    await waitFor(() => {
      expect(mockCompleteSession).toHaveBeenCalledTimes(1);
    });

    // Flush the Promise.all in the invalidation effect.
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // All three session-shaped query keys invalidated.
    const invalidatedKeys = invalidateSpy.mock.calls.map((call) => call[0]?.queryKey);
    expect(invalidatedKeys).toEqual(
      expect.arrayContaining([['activeSession'], ['sessions'], ['session', 7]]),
    );

    // Router replaced to the BBB prompt screen — the intermediate step
    // between AMRAP completion and the receipt (Discord ask
    // 1508265973554348032). The user closes the day from there.
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: '/session/bbb',
        params: { sessionId: '7' },
      });
    });
  });

  it('does not render the session-cancel pill on the Live screen (cancel moved to Today, loop-004)', async () => {
    const screen = renderScreen(<LiveScreen sessionId={7} />);
    // Discord 1508386540 moved Cancel + Restart pills off the Live
    // screen onto Today. Live now surfaces only the contextual recovery
    // action (Undo during rest). The two-tap cancel flow is covered by
    // the TodayScreen test instead.
    expect(screen.queryByTestId('session-cancel')).toBeNull();
    expect(screen.queryByTestId('session-reset')).toBeNull();
  });

  it('opens the AMRAP bottom sheet when the AMRAP CTA is pressed', async () => {
    // Make the session week=1 with the user already on setIndex=2 by logging
    // the first two non-AMRAP sets. For simplicity, just walk through:
    //   set 0 working → rest → next → set 1 working → rest → next → set 2 AMRAP.
    const screen = renderScreen(<LiveScreen sessionId={7} />);

    // Set 0 (working).
    await act(async () => {
      fireEvent.press(screen.getByTestId('cta-log-working'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('rest-phase')).toBeTruthy();
    });
    // Advance past the rest timer to fully drain side-effect state.
    act(() => {
      jest.advanceTimersByTime(90_000);
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('cta-advance-rest'));
    });

    // Set 1 (working).
    await act(async () => {
      fireEvent.press(screen.getByTestId('cta-log-working'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('rest-phase')).toBeTruthy();
    });
    act(() => {
      jest.advanceTimersByTime(90_000);
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('cta-advance-rest'));
    });

    // Set 2 is AMRAP on week 1 — CTA is "Log AMRAP".
    expect(screen.getByTestId('cta-log-amrap')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByTestId('cta-log-amrap'));
    });

    // The AMRAP sheet body should now be visible.
    await waitFor(() => {
      expect(screen.getByTestId('amrap-reps-stepper')).toBeTruthy();
    });
  });

  it('redirects to "/" when the session row no longer exists', async () => {
    // getSession returns null (not undefined) for missing rows — the exit
    // gate must handle null specifically.
    mockSessionState.data = null;
    mockSessionState.isLoading = false;

    renderScreen(<LiveScreen sessionId={7} />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });

  it('redirects to "/" when the session transitions out of in_progress', async () => {
    mockSessionState.data = {
      id: 7,
      lift: 'squat',
      cycle: 1,
      week: 1,
      startedAt: 0,
      status: 'cancelled',
      trainingMaxSnapshot: 300,
      storageUnitSnapshot: 'lbs',
      displayUnitSnapshot: 'lbs',
      endedAt: 100,
    };
    mockSessionState.isLoading = false;

    renderScreen(<LiveScreen sessionId={7} />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });

  it('uses settings.restTargetSeconds for the rest countdown (warning haptic fires at T-3s from the new target)', async () => {
    // Bump the rest target to 120s. The warning haptic should fire at T-3s,
    // i.e. after 117s advance — not after 87s (which is the default 90s case).
    mockSettingsState.data = {
      id: 1,
      storageUnit: 'lbs',
      displayUnit: 'lbs',
      plateSet: 'standard',
      enabledLifts: ['squat', 'bench', 'deadlift', 'press'],
      currentCycle: 1,
      week: 1,
      day: 1,
      restTargetSeconds: 120,
    };

    const screen = renderScreen(<LiveScreen sessionId={7} />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('cta-log-working'));
    });
    await waitFor(() => {
      expect(mockAppendSetLog).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(screen.getByTestId('rest-phase')).toBeTruthy();
    });

    // At 87s elapsed (T-33s for a 120s target) no warning yet.
    act(() => {
      jest.advanceTimersByTime(87_000);
    });
    expect(mockNotificationAsync).not.toHaveBeenCalled();

    // Advance to 117s elapsed (T-3s for a 120s target) → warning fires.
    act(() => {
      jest.advanceTimersByTime(30_000);
    });
    expect(mockNotificationAsync).toHaveBeenCalledWith('warning');
  });

  it('does not redirect while the session query is loading', async () => {
    mockSessionState.data = undefined;
    mockSessionState.isLoading = true;

    renderScreen(<LiveScreen sessionId={7} />);

    // Flush microtasks so any pending effects run.
    await act(async () => {
      await Promise.resolve();
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('resume regression: bootstrap from persisted setLogs lands on the next un-logged set', async () => {
    // Two working sets already in the DB → resume should land the user on
    // setIndex=2 (set 3, AMRAP on week 1), NOT back at set 1.
    mockSetLogsState.data = [
      { kind: 'working', index: 0 },
      { kind: 'working', index: 1 },
    ];

    const screen = renderScreen(<LiveScreen sessionId={7} />);

    // Flush the bootstrap effect.
    await act(async () => {
      await Promise.resolve();
    });

    // Set 3 on week 1 is AMRAP — the CTA should be the AMRAP one, proving
    // setIndex bootstrapped to 2 (not 0).
    expect(screen.getByTestId('cta-log-amrap')).toBeTruthy();
    // The working-set CTA must NOT be rendered (we'd be at set 0 if state
    // had reset).
    expect(screen.queryByTestId('cta-log-working')).toBeNull();
  });

  it('resume regression: bootstrap with all 3 logs auto-completes the session', async () => {
    // Edge case — session left in_progress with all three slots filled
    // (e.g. completeSession write was interrupted). Resume should call
    // completeSession + transition to the SessionComplete screen rather
    // than re-prompting any set.
    mockSetLogsState.data = [
      { kind: 'working', index: 0 },
      { kind: 'working', index: 1 },
      { kind: 'amrap', index: 2 },
    ];

    renderScreen(<LiveScreen sessionId={7} />);

    await waitFor(() => {
      expect(mockCompleteSession).toHaveBeenCalledWith(expect.anything(), 7);
    });

    // Subsequent navigation effect routes to /session/complete.
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: '/session/complete',
        params: { sessionId: '7' },
      });
    });
  });
});
