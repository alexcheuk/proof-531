/**
 * Behavioral test for the Home screen.
 *
 * Verifies:
 *  - On first render the LiftStats cell for "TM" shows the TM of the first
 *    enabled lift (squat → 315 lb).
 *  - Pressing the second tab (bench) updates the TM cell to bench's TM
 *    (245 lb), proving the lift-switch flow and the LiftPage swap.
 *  - When another lift is mid-session, tapping Begin on a different lift
 *    routes to the in-progress lift and skips createSession (single-session
 *    invariant, §4).
 *
 * Mocks every data hook + expo-router + expo-haptics so the screen renders
 * headless under jest-expo. Reanimated 4 is auto-mocked by `jest-expo`.
 */
import { ThemeProvider } from '@/design/theme';
import { fireEvent, render, within } from '@testing-library/react-native';
import type { ReactElement } from 'react';

// Reanimated 4 boots `react-native-worklets` at module load — that native
// init never lands under jest, so any `import 'react-native-reanimated'`
// throws. The shipping `mock.js` also pulls worklets, so we substitute a
// minimal inline mock: `Animated.View` falls through to a plain RN View
// and `LinearTransition` becomes an opaque object — exactly what the
// behavioral test for lift-switch needs.
jest.mock('react-native-reanimated', () => {
  const RN = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: { View: RN.View, Text: RN.Text, ScrollView: RN.ScrollView },
    LinearTransition: { duration: () => ({}) },
    FadeIn: { duration: () => ({}) },
    FadeOut: { duration: () => ({}) },
  };
});

const mockRouterPush = jest.fn();
const mockRouterReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockRouterReplace,
    push: mockRouterPush,
    back: jest.fn(),
  }),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

const mockCreateSession = jest.fn(async (..._args: unknown[]) => ({ id: 999 }));
jest.mock('@/data/accessors/session', () => ({
  createSession: (...args: unknown[]) => mockCreateSession(...args),
}));

const mockInvalidateQueries = jest.fn(async () => undefined);
jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  };
});

jest.mock('@/data/DbProvider', () => ({
  useDb: () => ({ __mock: 'db' }),
}));

type MockQueryState = {
  data?: unknown;
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  refetch?: jest.Mock;
};

const mockSettingsState: MockQueryState = {
  data: {
    id: 1,
    storageUnit: 'lbs',
    displayUnit: 'lbs',
    plateSet: 'standard',
    enabledLifts: ['squat', 'bench', 'deadlift', 'press'],
    currentCycle: 2,
    week: 1,
    day: 1,
  },
  isLoading: false,
  isError: false,
  error: null,
  refetch: jest.fn(),
};

const mockTmsState: MockQueryState = {
  data: [
    { id: 1, lift: 'squat', value: 315, unit: 'lbs', updatedAt: 1, note: null },
    { id: 2, lift: 'bench', value: 245, unit: 'lbs', updatedAt: 1, note: null },
    { id: 3, lift: 'deadlift', value: 405, unit: 'lbs', updatedAt: 1, note: null },
    { id: 4, lift: 'press', value: 155, unit: 'lbs', updatedAt: 1, note: null },
  ],
  isLoading: false,
  isError: false,
  error: null,
  refetch: jest.fn(),
};

const mockPrsState: MockQueryState = {
  data: [],
  isLoading: false,
  isError: false,
  error: null,
  refetch: jest.fn(),
};

const mockActiveSessionState: MockQueryState = {
  data: undefined,
  isLoading: false,
  isError: false,
  error: null,
  refetch: jest.fn(),
};

function resetMockState() {
  mockSettingsState.data = {
    id: 1,
    storageUnit: 'lbs',
    displayUnit: 'lbs',
    plateSet: 'standard',
    enabledLifts: ['squat', 'bench', 'deadlift', 'press'],
    currentCycle: 2,
    week: 1,
    day: 1,
  };
  mockSettingsState.isLoading = false;
  mockSettingsState.isError = false;
  mockSettingsState.error = null;
  mockTmsState.data = [
    { id: 1, lift: 'squat', value: 315, unit: 'lbs', updatedAt: 1, note: null },
    { id: 2, lift: 'bench', value: 245, unit: 'lbs', updatedAt: 1, note: null },
    { id: 3, lift: 'deadlift', value: 405, unit: 'lbs', updatedAt: 1, note: null },
    { id: 4, lift: 'press', value: 155, unit: 'lbs', updatedAt: 1, note: null },
  ];
  mockTmsState.isLoading = false;
  mockTmsState.isError = false;
  mockTmsState.error = null;
  mockPrsState.data = [];
  mockPrsState.isLoading = false;
  mockPrsState.isError = false;
  mockPrsState.error = null;
  mockActiveSessionState.data = undefined;
  mockActiveSessionState.isLoading = false;
  mockActiveSessionState.isError = false;
  mockActiveSessionState.error = null;
  mockRouterPush.mockClear();
  mockRouterReplace.mockClear();
  mockCreateSession.mockClear();
  mockInvalidateQueries.mockClear();
}

jest.mock('@/data/queries/useSettings', () => ({
  useSettings: () => mockSettingsState,
}));

jest.mock('@/data/queries/useLatestTm', () => ({
  useLatestTms: () => mockTmsState,
}));

jest.mock('@/data/queries/usePrs', () => ({
  usePrs: () => mockPrsState,
}));

jest.mock('@/data/queries/useActiveSession', () => ({
  useActiveSession: () => mockActiveSessionState,
  ACTIVE_SESSION_KEY: ['activeSession'],
}));

// Import after mocks.
import { HomeScreen } from '../HomeScreen';
import { __resetHomeScreenStateForTests } from '../hooks/useHomeScreenState';

const renderScreen = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

const childText = (node: unknown): string => {
  const n = node as { children?: ReadonlyArray<unknown> };
  if (!n.children) return '';
  return n.children
    .map((c) => (typeof c === 'string' || typeof c === 'number' ? String(c) : ''))
    .join('');
};

describe('HomeScreen', () => {
  beforeEach(() => {
    resetMockState();
    __resetHomeScreenStateForTests();
  });

  it('renders the LOADING… caps line while any query is loading', () => {
    mockSettingsState.isLoading = true;
    const screen = renderScreen(<HomeScreen />);
    expect(screen.getByText('LOADING…')).toBeTruthy();
  });

  it("renders the COULDN'T LOAD caps line + message when a query errors", () => {
    mockTmsState.isError = true;
    mockTmsState.error = new Error('boom');
    const screen = renderScreen(<HomeScreen />);
    expect(screen.getByText("COULDN'T LOAD")).toBeTruthy();
    expect(screen.getByText('boom')).toBeTruthy();
  });

  it('initially renders the first enabled lift (squat) with its TM', () => {
    const screen = renderScreen(<HomeScreen />);

    // The carousel mounts every enabled lift page at once; assert the
    // squat page's own LiftStats TM cell value.
    const squatPage = screen.getByTestId('lift-page-squat');
    const tmCell = within(squatPage).getByTestId('lift-stats-cell-0');
    const valueText = within(tmCell).getByText(/315/);
    expect(childText(valueText)).toBe('315 lb');

    // Squat tab is selected initially.
    expect(screen.getByTestId('lift-tab-squat').props.accessibilityState.selected).toBe(true);
  });

  it('updates LiftTabs selection when a different lift tab is pressed', () => {
    const screen = renderScreen(<HomeScreen />);

    // Bench tab — second entry in enabledLifts.
    fireEvent.press(screen.getByTestId('lift-tab-bench'));

    expect(screen.getByTestId('lift-tab-bench').props.accessibilityState.selected).toBe(true);
    // Bench page is mounted in the carousel with its own TM value.
    const benchPage = screen.getByTestId('lift-page-bench');
    const tmCell = within(benchPage).getByTestId('lift-stats-cell-0');
    const valueText = within(tmCell).getByText(/245/);
    expect(childText(valueText)).toBe('245 lb');
  });

  it('updates selectedLift when the carousel swipes (onMomentumScrollEnd)', () => {
    const screen = renderScreen(<HomeScreen />);

    // Squat starts selected.
    expect(screen.getByTestId('lift-tab-squat').props.accessibilityState.selected).toBe(true);

    // Simulate a swipe to the second page. jest-expo's Dimensions returns
    // a 750px window — pageWidth = 750 → contentOffset.x = 750 for idx 1.
    const carousel = screen.getByTestId('home-lift-carousel');
    fireEvent(carousel, 'momentumScrollEnd', {
      nativeEvent: {
        contentOffset: { x: 750, y: 0 },
        contentSize: { width: 3000, height: 600 },
        layoutMeasurement: { width: 750, height: 600 },
      },
    });

    expect(screen.getByTestId('lift-tab-bench').props.accessibilityState.selected).toBe(true);
    expect(screen.getByTestId('lift-tab-squat').props.accessibilityState.selected).toBe(false);
  });

  it('cross-lift Begin redirects to the in-progress lift and skips createSession', async () => {
    // Bench is mid-session. Squat tab is active by default.
    mockActiveSessionState.data = {
      id: 42,
      lift: 'bench',
      cycle: 2,
      week: 1,
      startedAt: 1,
      status: 'in_progress',
      trainingMaxSnapshot: 245,
      storageUnitSnapshot: 'lbs',
      displayUnitSnapshot: 'lbs',
    };

    const screen = renderScreen(<HomeScreen />);

    // Squat page is the default. Tap its primary CTA ("Begin session").
    fireEvent.press(screen.getByTestId('lift-page-squat-cta'));

    // createSession must NOT be called — we're redirecting to bench.
    expect(mockCreateSession).not.toHaveBeenCalled();

    // Router should be pushed to the bench session.
    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    const [arg] = mockRouterPush.mock.calls[0] as [{ pathname: string; params: { lift: string } }];
    expect(arg.pathname).toBe('/session/today');
    expect(arg.params.lift).toBe('bench');
  });
});
