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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import type { ReactElement } from 'react';

const mockReplace = jest.fn();
const mockCreateSession = jest.fn();
const mockAppendSetLog = jest.fn();
const mockInvalidateQueries = jest.fn(async () => undefined);

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
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

jest.mock('@/data/accessors/setLog', () => ({
  appendSetLog: (...args: unknown[]) => mockAppendSetLog(...args),
}));

const mockActiveSessionState: { data: unknown; isLoading: boolean; error: unknown } = {
  data: undefined,
  isLoading: false,
  error: null,
};
jest.mock('@/data/queries/useActiveSession', () => ({
  useActiveSession: () => mockActiveSessionState,
  ACTIVE_SESSION_KEY: ['activeSession'],
}));

const mockSetLogsState: { data: unknown; isLoading: boolean; error: unknown } = {
  data: [],
  isLoading: false,
  error: null,
};
jest.mock('@/data/queries/useSetLogsForSession', () => ({
  useSetLogsForSession: () => mockSetLogsState,
}));

// Import after mocks so the module graph picks up the mocked deps.
import { TodayScreen } from '../TodayScreen';

let queryClient: QueryClient;
const renderScreen = (ui: ReactElement) =>
  render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{ui}</ThemeProvider>
    </QueryClientProvider>,
  );

describe('TodayScreen', () => {
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    mockReplace.mockClear();
    mockCreateSession.mockReset();
    mockAppendSetLog.mockReset();
    mockAppendSetLog.mockResolvedValue({ id: 1 });
    mockInvalidateQueries.mockClear();
    mockActiveSessionState.data = undefined;
    mockSetLogsState.data = [];
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

  it('renders the working-set preview and a Start Session CTA', () => {
    const screen = renderScreen(<TodayScreen lift="squat" />);
    // The preview surface renders the three working sets.
    expect(screen.getByTestId('set-row-0')).toBeTruthy();
    expect(screen.getByTestId('set-row-1')).toBeTruthy();
    expect(screen.getByTestId('set-row-2')).toBeTruthy();
    // And the Start CTA.
    expect(screen.getByTestId('start-session')).toBeTruthy();
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

  describe('Warmup ramp', () => {
    it('renders three warmup rows with W1/W2/W3 prefixes', () => {
      const screen = renderScreen(<TodayScreen lift="squat" />);
      expect(screen.getByTestId('today-warmup-ramp')).toBeTruthy();
      expect(screen.getByTestId('warmup-row-0')).toBeTruthy();
      expect(screen.getByTestId('warmup-row-1')).toBeTruthy();
      expect(screen.getByTestId('warmup-row-2')).toBeTruthy();
      expect(screen.getByText('WARMUP')).toBeTruthy();
      expect(screen.getByText('40 / 50 / 60')).toBeTruthy();
    });

    it('does not render the row as a Pressable when no in-progress session exists for this lift', () => {
      mockActiveSessionState.data = undefined;
      const screen = renderScreen(<TodayScreen lift="squat" />);
      expect(screen.queryByTestId('warmup-row-0-pressable')).toBeNull();
    });

    it('writes a warmup row via appendSetLog when a ramp row is tapped during an active session', async () => {
      mockActiveSessionState.data = {
        id: 42,
        lift: 'squat',
        cycle: 1,
        week: 1,
        startedAt: 0,
        status: 'in_progress',
        trainingMaxSnapshot: 300,
        storageUnitSnapshot: 'lbs',
        displayUnitSnapshot: 'lbs',
      };
      const screen = renderScreen(<TodayScreen lift="squat" />);
      await act(async () => {
        fireEvent.press(screen.getByTestId('warmup-row-0-pressable'));
      });
      await waitFor(() => {
        expect(mockAppendSetLog).toHaveBeenCalledTimes(1);
      });
      const arg = mockAppendSetLog.mock.calls[0]?.[1] as {
        sessionId: number;
        index: number;
        kind: string;
        prescribedReps: number;
      };
      expect(arg.sessionId).toBe(42);
      expect(arg.kind).toBe('warmup');
      expect(arg.index).toBe(-1); // -1 - 0
      expect(arg.prescribedReps).toBe(5); // WARMUPS[0].reps
    });

    it('renders no Pressable for an already-logged warmup row (checked state)', () => {
      mockActiveSessionState.data = {
        id: 42,
        lift: 'squat',
        cycle: 1,
        week: 1,
        startedAt: 0,
        status: 'in_progress',
        trainingMaxSnapshot: 300,
        storageUnitSnapshot: 'lbs',
        displayUnitSnapshot: 'lbs',
      };
      mockSetLogsState.data = [
        {
          id: 1,
          sessionId: 42,
          index: -1,
          kind: 'warmup',
          prescribedWeight: 120,
          prescribedReps: 5,
          actualReps: 5,
          completedAt: 0,
          isPR: null,
          estimated1RM: null,
        },
      ];
      const screen = renderScreen(<TodayScreen lift="squat" />);
      expect(screen.queryByTestId('warmup-row-0-pressable')).toBeNull();
      expect(screen.getByTestId('warmup-row-1-pressable')).toBeTruthy();
    });
  });

  it('creates a session and routes to /session/live on Start', async () => {
    const screen = renderScreen(<TodayScreen lift="squat" />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('start-session'));
    });

    await waitFor(() => {
      expect(mockCreateSession).toHaveBeenCalledTimes(1);
    });

    // First positional arg is the db stub, second is the lift.
    expect(mockCreateSession.mock.calls[0]?.[1]).toBe('squat');

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: '/session/live',
        params: { sessionId: '42' },
      });
    });
  });
});
