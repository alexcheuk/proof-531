/**
 * Behavioral test for the BBB prompt screen  -  the intermediate stop
 * between AMRAP completion and the SessionComplete receipt.
 *
 * Asserts that:
 *   - The plan shows 5×10 at 50% TM with the lift label.
 *   - Both the "Mark BBB complete" CTA and the "Skip · close the day"
 *     pressable route to /session/complete?sessionId=… (replace).
 */
import { ThemeProvider } from '@/design/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import type { ReactElement } from 'react';

const mockReplace = jest.fn();
const mockAppendSetLog = jest.fn();

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
    mockAppendSetLog.mockReset();
    mockAppendSetLog.mockResolvedValue({});
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

  it('renders the BBB plan (5×10 @ 50% TM) with the lift label', () => {
    const screen = renderScreen(<BbbPromptScreen sessionId={7} />);
    expect(screen.getByText('Boring But Big.')).toBeTruthy();
    expect(screen.getByText(/Squat · supplementary/)).toBeTruthy();
    expect(screen.getByText('5 sets of 10 · 50% TM')).toBeTruthy();
    // The big weight readout is the displayed BBB weight (TM 300 × 0.5 = 150).
    expect(screen.getByText('150')).toBeTruthy();
  });

  it('writes 5 BBB set_logs and routes to /session/complete on Mark BBB complete', async () => {
    const screen = renderScreen(<BbbPromptScreen sessionId={7} />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('bbb-mark-done'));
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
      // TM 300 × 0.5 = 150 in storage units.
      expect(call.prescribedWeight).toBe(150);
    }
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
    // The BBB rest hint must render the 1:30 from the BBB-specific field.
    const screen = renderScreen(<BbbPromptScreen sessionId={7} />);
    expect(screen.getByText(/REST 1:30 BETWEEN SETS/)).toBeTruthy();
    expect(screen.queryByText(/REST 3:00 BETWEEN SETS/)).toBeNull();
  });
});
