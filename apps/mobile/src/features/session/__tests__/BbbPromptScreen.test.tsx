/**
 * Behavioral test for the BBB prompt screen — the intermediate stop
 * between AMRAP completion and the SessionComplete receipt.
 *
 * Asserts that:
 *   - The plan shows 5×10 at 50% TM with the lift label.
 *   - Both the "Mark BBB complete" CTA and the "Skip · close the day"
 *     pressable route to /session/complete?sessionId=… (replace).
 */
import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
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
  } | null;
} = { data: null };
jest.mock('@/data/queries/useSettings', () => ({
  useSettings: () => mockSettingsState,
}));

import { BbbPromptScreen } from '../BbbPromptScreen';

const renderScreen = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('BbbPromptScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear();
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

  it('routes to /session/complete (replace) on Mark BBB complete', () => {
    const screen = renderScreen(<BbbPromptScreen sessionId={7} />);
    fireEvent.press(screen.getByTestId('bbb-mark-done'));
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/session/complete',
      params: { sessionId: '7' },
    });
  });

  it('routes to /session/complete (replace) on Skip', () => {
    const screen = renderScreen(<BbbPromptScreen sessionId={7} />);
    fireEvent.press(screen.getByTestId('bbb-skip'));
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/session/complete',
      params: { sessionId: '7' },
    });
  });
});
