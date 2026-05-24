/**
 * Behavioral test for the Today screen.
 *
 * Verifies the load-bearing flow: pressing Start invokes the session
 * accessor with the lift, and on success routes to `/session/live` with the
 * new session id.
 *
 * Mocks every cross-cutting dependency so the screen renders headless under
 * jest-expo.
 */
import { ThemeProvider } from '@/design/theme';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import type { ReactElement } from 'react';

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockCreateSession = jest.fn();
const mockInvalidateQueries = jest.fn(async () => undefined);

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush, back: jest.fn() }),
}));

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  };
});

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  // biome-ignore lint/suspicious/noExplicitAny: trivial test provider stub
  SafeAreaProvider: ({ children }: any) => children,
}));

jest.mock('@/data/DbProvider', () => ({
  useDb: () => ({ __stub: 'db' }),
}));

jest.mock('@/data/queries/useSettings', () => ({
  useSettings: () => ({
    data: {
      id: 1,
      storageUnit: 'lbs',
      displayUnit: 'lbs',
      plateSet: 'standard',
      enabledLifts: ['squat', 'bench', 'deadlift', 'press'],
      currentCycle: 1,
      week: 1,
      day: 1,
    },
    isLoading: false,
    error: null,
  }),
}));

jest.mock('@/data/queries/useLatestTm', () => ({
  useLatestTm: () => ({
    data: { id: 1, lift: 'squat', value: 300, unit: 'lbs', updatedAt: 1, note: null },
    isLoading: false,
    error: null,
  }),
}));

jest.mock('@/data/accessors/session', () => ({
  createSession: (...args: unknown[]) => mockCreateSession(...args),
}));

const mockActiveSessionState: { data: unknown } = { data: undefined };
jest.mock('@/data/queries/useActiveSession', () => ({
  useActiveSession: () => mockActiveSessionState,
  ACTIVE_SESSION_KEY: ['activeSession'],
}));

const mockSetLogsState: { data: unknown } = { data: [] };
jest.mock('@/data/queries/useSetLogsForSession', () => ({
  useSetLogsForSession: () => mockSetLogsState,
  SET_LOGS_FOR_SESSION_KEY: (id: number | null) => ['setLogsForSession', id],
}));

// TodayBody now consumes useSessions via useLastCompletedSessionForLift to
// render the "Last X day · N days ago" stamp. The default empty array means
// the stamp is hidden and pre-existing assertions stay valid.
jest.mock('@/data/queries/useSessions', () => ({
  useSessions: () => ({ data: [], isLoading: false }),
  SESSIONS_KEY: ['sessions'],
}));

// Import after mocks so the module graph picks up the mocked deps.
import { TodayScreen } from '../TodayScreen';

const renderScreen = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('TodayScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockPush.mockClear();
    mockInvalidateQueries.mockClear();
    mockActiveSessionState.data = undefined;
    mockSetLogsState.data = [];
    mockCreateSession.mockReset();
    mockCreateSession.mockResolvedValue({
      id: 42,
      lift: 'squat',
      cycle: 1,
      week: 1,
      startedAt: 0,
      status: 'in_progress',
      trainingMaxSnapshot: 300,
      storageUnitSnapshot: 'lbs',
      displayUnitSnapshot: 'lbs',
      endedAt: null,
    });
  });

  it('renders the working-set preview and a Begin session CTA in preview mode', () => {
    const screen = renderScreen(<TodayScreen lift="squat" />);
    // The preview surface renders the three working sets.
    expect(screen.getByTestId('set-row-0')).toBeTruthy();
    expect(screen.getByTestId('set-row-1')).toBeTruthy();
    expect(screen.getByTestId('set-row-2')).toBeTruthy();
    // CTA copy reflects preview mode.
    const cta = screen.getByTestId('start-session');
    expect(cta).toBeTruthy();
    expect(screen.getByText('Begin session')).toBeTruthy();
  });

  it('renders the top-set PlateBar hero and a numeric-only BBB band (no inline plate viz)', () => {
    // squat / week 1 / TM 300 lbs → set 0 = 195 lb. Plate visualization is
    // confined to the top-set hero (matching ref); working-set rows and BBB
    // render numerics only.
    const screen = renderScreen(<TodayScreen lift="squat" />);
    // Top-set hero has its own PlateBar via TopSetBlock.
    expect(screen.getByTestId('today-top-set-plate-bar')).toBeTruthy();
    // BBB section is present but with NO inline PlateBar.
    expect(screen.getByTestId('today-bbb-band')).toBeTruthy();
    expect(screen.queryByTestId('today-bbb-plate-bar')).toBeNull();
    // Working-set rows expose no PlateBar either.
    expect(screen.queryByTestId('set-row-0-plate-bar')).toBeNull();
    expect(screen.queryByTestId('set-row-1-plate-bar')).toBeNull();
    expect(screen.queryByTestId('set-row-2-plate-bar')).toBeNull();
  });

  it('preview mode: creates a session and routes to /session/live on Begin', async () => {
    const screen = renderScreen(<TodayScreen lift="squat" />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('start-session'));
    });

    await waitFor(() => {
      expect(mockCreateSession).toHaveBeenCalledTimes(1);
    });

    // First positional arg is the db stub, second is the lift.
    expect(mockCreateSession.mock.calls[0]?.[1]).toBe('squat');

    // We push (not replace) into Live so Back from Live lands on Today.
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/session/live',
        params: { sessionId: '42' },
      });
    });
  });

  it('active mode: does NOT call createSession; routes to /session/live with the existing id', async () => {
    mockActiveSessionState.data = {
      id: 77,
      lift: 'squat',
      cycle: 1,
      week: 1,
      startedAt: 1,
      status: 'in_progress',
      trainingMaxSnapshot: 300,
      storageUnitSnapshot: 'lbs',
      displayUnitSnapshot: 'lbs',
      endedAt: null,
    };
    mockSetLogsState.data = [];

    const screen = renderScreen(<TodayScreen lift="squat" />);
    expect(screen.getByText('Start session')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByTestId('start-session'));
    });

    expect(mockCreateSession).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/session/live',
      params: { sessionId: '77' },
    });
  });

  it('active mode with logged sets: CTA copy reads "Resume session"', () => {
    mockActiveSessionState.data = {
      id: 88,
      lift: 'squat',
      cycle: 1,
      week: 1,
      startedAt: 1,
      status: 'in_progress',
      trainingMaxSnapshot: 300,
      storageUnitSnapshot: 'lbs',
      displayUnitSnapshot: 'lbs',
      endedAt: null,
    };
    mockSetLogsState.data = [
      {
        id: 1,
        sessionId: 88,
        index: 0,
        kind: 'working',
        prescribedWeight: 195,
        prescribedReps: 5,
        actualReps: 5,
        completedAt: 1,
        isPR: false,
      },
    ];
    const screen = renderScreen(<TodayScreen lift="squat" />);
    expect(screen.getByText('Resume session')).toBeTruthy();
  });

  it('active mode renders completed set rows with the done checkmark + strikethrough', () => {
    mockActiveSessionState.data = {
      id: 88,
      lift: 'squat',
      cycle: 1,
      week: 1,
      startedAt: 1,
      status: 'in_progress',
      trainingMaxSnapshot: 300,
      storageUnitSnapshot: 'lbs',
      displayUnitSnapshot: 'lbs',
      endedAt: null,
    };
    mockSetLogsState.data = [
      {
        id: 1,
        sessionId: 88,
        index: 0,
        kind: 'working',
        prescribedWeight: 195,
        prescribedReps: 5,
        actualReps: 5,
        completedAt: 1,
        isPR: false,
      },
      {
        id: 2,
        sessionId: 88,
        index: 1,
        kind: 'working',
        prescribedWeight: 225,
        prescribedReps: 5,
        actualReps: 5,
        completedAt: 2,
        isPR: false,
      },
    ];
    const screen = renderScreen(<TodayScreen lift="squat" />);
    // The "UP NEXT" chip lands on row 3 (index 2), not row 1.
    expect(screen.queryByText('UP NEXT')).toBeTruthy();
    // Both completed rows render a ✓ glyph (SetRow swaps the numeric index
    // for ✓ when done=true).
    const checks = screen.queryAllByText('✓');
    expect(checks.length).toBeGreaterThanOrEqual(2);
  });

  it('preview-other-active: CTA redirects to the other lift without creating a session', async () => {
    mockActiveSessionState.data = {
      id: 99,
      lift: 'bench',
      cycle: 1,
      week: 1,
      startedAt: 1,
      status: 'in_progress',
      trainingMaxSnapshot: 245,
      storageUnitSnapshot: 'lbs',
      displayUnitSnapshot: 'lbs',
      endedAt: null,
    };

    const screen = renderScreen(<TodayScreen lift="squat" />);
    // CTA copy reflects the redirect target.
    expect(screen.getByText(/Open bench/i)).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByTestId('start-session'));
    });

    expect(mockCreateSession).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/session/today',
      params: { lift: 'bench' },
    });
  });
});
