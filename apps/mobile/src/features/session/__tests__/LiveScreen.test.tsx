/**
 * Behavioral test for the Live screen.
 *
 * Asserts the PE-05 done_when contract:
 *   - expo-keep-awake is activated on mount and deactivated on unmount.
 *   - Rest timer fires the warning haptic at T-3s and the chime at T-0.
 *   - Cancel button uses a two-tap pattern: first tap fires the warning
 *     haptic, second tap calls cancelSession.
 *   - The AMRAP bottom sheet is visible while in the `amrap-log` phase.
 *
 * Every cross-cutting dependency is mocked so the screen renders headless
 * under jest-expo. The bottom-sheet mock follows the pattern from
 * `apps/mobile/src/design/primitives/Sheet.test.tsx` — render children
 * directly inside a Fragment.
 */
import { ThemeProvider } from '@/design/theme';
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
const mockSoundCreateAsync = jest.fn();

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
  activateKeepAwake: (...args: unknown[]) => mockActivateKeepAwake(...args),
  deactivateKeepAwake: (...args: unknown[]) => mockDeactivateKeepAwake(...args),
}));

jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: (...args: unknown[]) => {
        mockSoundCreateAsync(...args);
        return Promise.resolve({ sound: { unloadAsync: jest.fn() } });
      },
    },
  },
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
  return {
    __esModule: true,
    default: ({ index, children, onChange, onClose }: MockBottomSheetProps) => {
      mockBottomSheet.onChange = onChange ?? null;
      mockBottomSheet.onClose = onClose ?? null;
      // Render children only when open (index >= 0) so the AMRAP sheet test
      // can assert visibility cleanly.
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

jest.mock('@/data/DbProvider', () => ({
  useDb: () => ({ __stub: 'db' }),
}));

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

jest.mock('@/data/accessors/setLog', () => ({
  appendSetLog: (...args: unknown[]) => mockAppendSetLog(...args),
}));

jest.mock('@/data/accessors/session', () => ({
  completeSession: (...args: unknown[]) => mockCompleteSession(...args),
  cancelSession: (...args: unknown[]) => mockCancelSession(...args),
}));

// Import after mocks.
import { LiveScreen } from '../LiveScreen';

const renderScreen = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('LiveScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
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
    mockSoundCreateAsync.mockClear();
    mockBottomSheet.onChange = null;
    mockBottomSheet.onClose = null;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('activates expo-keep-awake on mount and deactivates on unmount', () => {
    const screen = renderScreen(<LiveScreen sessionId={7} />);
    expect(mockActivateKeepAwake).toHaveBeenCalledTimes(1);

    screen.unmount();
    expect(mockDeactivateKeepAwake).toHaveBeenCalledTimes(1);
  });

  it('fires a warning haptic at T-3s and plays the chime at T-0 during rest', async () => {
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

    // Advance to T-0 (90s elapsed) → chime via expo-av.
    act(() => {
      jest.advanceTimersByTime(3_000);
    });
    expect(mockSoundCreateAsync).toHaveBeenCalledTimes(1);
  });

  it('cancel button is a two-tap pattern: first tap arms + warning haptic, second tap calls cancelSession', async () => {
    const screen = renderScreen(<LiveScreen sessionId={7} />);

    // Open the cancel-confirm sheet via the topbar pill.
    await act(async () => {
      fireEvent.press(screen.getByTestId('session-cancel'));
    });

    // First tap on the destructive confirm — fires warning haptic, arms state.
    await act(async () => {
      fireEvent.press(screen.getByTestId('cancel-confirm-destructive'));
    });
    expect(mockNotificationAsync).toHaveBeenCalledWith('warning');
    expect(mockCancelSession).not.toHaveBeenCalled();

    // Second tap — actually cancel.
    await act(async () => {
      fireEvent.press(screen.getByTestId('cancel-confirm-destructive'));
    });
    await waitFor(() => {
      expect(mockCancelSession).toHaveBeenCalledTimes(1);
    });
    // Cancel session is invoked with (db, sessionId).
    expect(mockCancelSession.mock.calls[0]?.[1]).toBe(7);
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
    mockSessionState.data = undefined;
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
});
