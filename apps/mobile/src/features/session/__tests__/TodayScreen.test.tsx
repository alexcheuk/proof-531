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
const mockCreateSession = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
}));

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

// Import after mocks so the module graph picks up the mocked deps.
import { TodayScreen } from '../TodayScreen';

const renderScreen = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('TodayScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear();
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

  it('renders the working-set preview and a Start Session CTA', () => {
    const screen = renderScreen(<TodayScreen lift="squat" />);
    // The preview surface renders the three working sets.
    expect(screen.getByTestId('set-row-0')).toBeTruthy();
    expect(screen.getByTestId('set-row-1')).toBeTruthy();
    expect(screen.getByTestId('set-row-2')).toBeTruthy();
    // And the Start CTA.
    expect(screen.getByTestId('start-session')).toBeTruthy();
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
