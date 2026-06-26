/**
 * Behavioral tests for the BBB prompt screen.
 *
 * Asserts:
 *   - Shows 5 set rows with BBB weight (50% TM) and 10 reps each.
 *   - "Complete set" marks one set at a time (calls appendSetLog once).
 *   - "Mark x/5 complete" marks all remaining sets (calls appendSetLog N times).
 *   - When N sets already logged, "Mark N/5" and completed rows show done state.
 *   - Skip routes to /session/complete without logging any sets.
 *   - Rest hint reads settings.bbbRestTargetSeconds, not restTargetSeconds.
 */
import { ThemeProvider } from '@/design/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import type { ReactElement } from 'react';

const mockReplace = jest.fn();
const mockAppendSetLog = jest.fn();
const mockInvalidateQueries = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));

jest.mock('@/data/DbProvider', () => ({
  useDb: () => ({ __stub: 'db' }),
}));

jest.mock('@/data/accessors/setLog', () => ({
  appendSetLog: (...args: unknown[]) => mockAppendSetLog(...args),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  // biome-ignore lint/suspicious/noExplicitAny: trivial test provider stub
  SafeAreaProvider: ({ children }: any) => children,
}));

const mockSessionState: {
  data: {
    id: number;
    lift: 'squat';
    cycle: number;
    week: 1;
    startedAt: number;
    status: 'completed';
    trainingMaxSnapshot: number;
    storageUnitSnapshot: 'lbs';
    displayUnitSnapshot: 'lbs';
    endedAt: number | null;
  } | null;
} = { data: null };
jest.mock('@/data/queries/useSession', () => ({
  useSession: () => mockSessionState,
  SESSION_KEY: (id: number | null) => ['session', id],
}));

const mockSettingsState: {
  data: {
    storageUnit: 'lbs';
    displayUnit: 'lbs';
    plateSet: 'standard';
    week: 1;
    currentCycle: number;
    enabledLifts: Array<'squat' | 'bench' | 'deadlift' | 'press'>;
    restTargetSeconds: number;
    bbbRestTargetSeconds: number;
  } | null;
} = { data: null };
jest.mock('@/data/queries/useSettings', () => ({
  useSettings: () => mockSettingsState,
}));

// Mutable so tests can simulate 0, 2, or 5 BBB sets already logged.
const mockSetLogsState: { data: Array<{ kind: string; id: number }> } = { data: [] };
jest.mock('@/data/queries/useSetLogsForSession', () => ({
  useSetLogsForSession: () => mockSetLogsState,
  SET_LOGS_FOR_SESSION_KEY: (id: number | null) => ['setLogsForSession', id],
}));

import { BbbPromptScreen } from '../BbbPromptScreen';

let queryClient: QueryClient;

const renderScreen = (ui: ReactElement) =>
  render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{ui}</ThemeProvider>
    </QueryClientProvider>,
  );

describe('BbbPromptScreen', () => {
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    mockReplace.mockClear();
    mockInvalidateQueries.mockClear();
    mockAppendSetLog.mockReset();
    mockAppendSetLog.mockResolvedValue({});
    mockSetLogsState.data = [];
    mockSessionState.data = {
      id: 7,
      lift: 'squat',
      cycle: 1,
      week: 1,
      startedAt: 0,
      status: 'completed',
      // TM 300 → BBB 50% = 150 lb.
      trainingMaxSnapshot: 300,
      storageUnitSnapshot: 'lbs',
      displayUnitSnapshot: 'lbs',
      endedAt: 1,
    };
    mockSettingsState.data = {
      storageUnit: 'lbs',
      displayUnit: 'lbs',
      plateSet: 'standard',
      week: 1,
      currentCycle: 1,
      enabledLifts: ['squat', 'bench', 'deadlift', 'press'],
      restTargetSeconds: 180,
      bbbRestTargetSeconds: 90,
    };
  });

  it('renders the BBB plan with lift label and 5 set rows at the correct weight', () => {
    const screen = renderScreen(<BbbPromptScreen sessionId={7} />);
    expect(screen.getByText('Boring But Big.')).toBeTruthy();
    expect(screen.getByText(/Squat · supplementary/)).toBeTruthy();
    // 5 individual set rows each showing 150 lb (TM 300 × 0.5).
    for (let i = 0; i < 5; i += 1) {
      expect(screen.getByTestId(`bbb-set-row-${i}`)).toBeTruthy();
    }
    // Weight appears in each row; getByText finds at least one.
    expect(screen.getAllByText('150').length).toBeGreaterThanOrEqual(1);
  });

  it('shows "MARK 5/5 COMPLETE" and "Complete set" when no sets are done', () => {
    const screen = renderScreen(<BbbPromptScreen sessionId={7} />);
    expect(screen.getByTestId('bbb-complete-set')).toBeTruthy();
    expect(screen.getByText('MARK 5/5 COMPLETE')).toBeTruthy();
    expect(screen.getByTestId('bbb-skip')).toBeTruthy();
    // Should NOT show the all-done CTA yet.
    expect(screen.queryByTestId('bbb-close')).toBeNull();
  });

  it('Complete set calls appendSetLog once and does not navigate', async () => {
    const screen = renderScreen(<BbbPromptScreen sessionId={7} />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('bbb-complete-set'));
    });
    await waitFor(() => {
      expect(mockAppendSetLog).toHaveBeenCalledTimes(1);
    });
    const call = mockAppendSetLog.mock.calls[0]?.[1] as {
      sessionId: number;
      index: number;
      kind: string;
      prescribedWeight: number;
      prescribedReps: number;
      actualReps: number;
    };
    expect(call.sessionId).toBe(7);
    expect(call.index).toBe(0);
    expect(call.kind).toBe('bbb');
    expect(call.prescribedReps).toBe(10);
    expect(call.actualReps).toBe(10);
    expect(call.prescribedWeight).toBe(150);
    // Does not navigate after one set.
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('Mark all remaining writes 5 set_logs and routes to /session/complete', async () => {
    const screen = renderScreen(<BbbPromptScreen sessionId={7} />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('bbb-mark-all'));
    });
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: '/session/complete',
        params: { sessionId: '7' },
      });
    });
    expect(mockAppendSetLog).toHaveBeenCalledTimes(5);
    for (let i = 0; i < 5; i += 1) {
      const call = mockAppendSetLog.mock.calls[i]?.[1] as {
        sessionId: number;
        index: number;
        kind: string;
        prescribedWeight: number;
        prescribedReps: number;
        actualReps: number;
      };
      expect(call.sessionId).toBe(7);
      expect(call.index).toBe(i);
      expect(call.kind).toBe('bbb');
      expect(call.prescribedReps).toBe(10);
      expect(call.actualReps).toBe(10);
      expect(call.prescribedWeight).toBe(150);
    }
  });

  it('when 2 sets already logged, shows "MARK 3/5 COMPLETE" and calls appendSetLog 3 times', async () => {
    mockSetLogsState.data = [
      { kind: 'bbb', id: 1 },
      { kind: 'bbb', id: 2 },
    ];
    const screen = renderScreen(<BbbPromptScreen sessionId={7} />);
    expect(screen.getByText('MARK 3/5 COMPLETE')).toBeTruthy();
    expect(screen.getByText(/BORING BUT BIG · 2 OF 5 DONE/)).toBeTruthy();
    await act(async () => {
      fireEvent.press(screen.getByTestId('bbb-mark-all'));
    });
    await waitFor(() => expect(mockReplace).toHaveBeenCalled());
    expect(mockAppendSetLog).toHaveBeenCalledTimes(3);
    // Logs start at index 2 (the first un-logged set).
    const indices = mockAppendSetLog.mock.calls.map(
      (c: unknown[]) => (c[1] as { index: number }).index,
    );
    expect(indices).toEqual([2, 3, 4]);
  });

  it('when 5 sets already logged, shows Close the day CTA and no complete/skip buttons', () => {
    mockSetLogsState.data = [
      { kind: 'bbb', id: 1 },
      { kind: 'bbb', id: 2 },
      { kind: 'bbb', id: 3 },
      { kind: 'bbb', id: 4 },
      { kind: 'bbb', id: 5 },
    ];
    const screen = renderScreen(<BbbPromptScreen sessionId={7} />);
    expect(screen.getByTestId('bbb-close')).toBeTruthy();
    expect(screen.queryByTestId('bbb-complete-set')).toBeNull();
    expect(screen.queryByTestId('bbb-mark-all')).toBeNull();
  });

  it('Skip does NOT write any BBB set_logs and routes to /session/complete', () => {
    const screen = renderScreen(<BbbPromptScreen sessionId={7} />);
    fireEvent.press(screen.getByTestId('bbb-skip'));
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/session/complete',
      params: { sessionId: '7' },
    });
    expect(mockAppendSetLog).not.toHaveBeenCalled();
  });

  it('rest hint reads settings.bbbRestTargetSeconds, NOT settings.restTargetSeconds', () => {
    // restTargetSeconds = 180 (working sets) vs bbbRestTargetSeconds = 90.
    const screen = renderScreen(<BbbPromptScreen sessionId={7} />);
    expect(screen.getByText(/REST 1:30 BETWEEN SETS/)).toBeTruthy();
    expect(screen.queryByText(/REST 3:00 BETWEEN SETS/)).toBeNull();
  });
});
