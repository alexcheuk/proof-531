import type { Session } from '@/data/accessors/session';
/**
 * Behavioral test for the History screen.
 *
 * Verifies:
 *  - When `useSessions()` returns rows, each one renders as a list row
 *    keyed by the session id.
 *  - When `useSessions()` returns an empty array, the empty-state caps
 *    line is shown.
 *  - Pull-to-refresh on the ScrollView's `RefreshControl` invokes the
 *    underlying query's `refetch()` (done_when in the queue entry).
 *
 * Mocks `useSessions` directly (mirrors `HomeScreen.test.tsx`) so the
 * screen renders headless without a real db.
 */
import { ThemeProvider } from '@/design/theme';
import { act, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

const mockRefetch = jest.fn(() => Promise.resolve({ data: [] as Session[] }));
const mockPrIdsRefetch = jest.fn(() => Promise.resolve({ data: new Set<number>() }));
let mockSessions: Session[] = [];
let mockPrIds: Set<number> = new Set();
let mockIsLoading = false;
let mockIsError = false;
let mockError: unknown = null;

jest.mock('@/data/queries/useSessions', () => ({
  useSessions: () => ({
    data: mockSessions,
    isLoading: mockIsLoading,
    isError: mockIsError,
    error: mockError,
    refetch: mockRefetch,
  }),
}));

jest.mock('@/data/queries/useSessionPrIds', () => ({
  useSessionPrIds: () => ({
    data: mockPrIds,
    isLoading: false,
    isError: false,
    error: null,
    refetch: mockPrIdsRefetch,
  }),
}));

const mockPrsRefetch = jest.fn(() => Promise.resolve({ data: [] }));
// HistoryScreen now reads usePrs to derive the "best lift" badge  -  stub
// with an empty list so the badge stays hidden in existing assertions.
jest.mock('@/data/queries/usePrs', () => ({
  usePrs: () => ({
    data: [],
    isLoading: false,
    isError: false,
    error: null,
    refetch: mockPrsRefetch,
  }),
}));

const mockSettingsRefetch = jest.fn(() => Promise.resolve({ data: null }));
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
      restTargetSeconds: 90,
      bbbRestTargetSeconds: 90,
      liveScreenInverted: false,
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: mockSettingsRefetch,
  }),
}));

const mockLifetimeVolumeRefetch = jest.fn(() => Promise.resolve({ data: 0 }));
const mockLifetimeVolume = 0;
jest.mock('@/data/queries/useLifetimeVolume', () => ({
  useLifetimeVolume: () => ({
    data: mockLifetimeVolume,
    isLoading: false,
    isError: false,
    error: null,
    refetch: mockLifetimeVolumeRefetch,
  }),
}));

// Import after mocks.
import { HistoryScreen } from '../HistoryScreen';

const renderScreen = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

function makeSession(overrides: Partial<Session>): Session {
  return {
    id: 1,
    lift: 'squat',
    cycle: 1,
    week: 1,
    startedAt: new Date('2026-05-01T10:00:00Z').getTime(),
    endedAt: new Date('2026-05-01T11:00:00Z').getTime(),
    status: 'completed',
    trainingMaxSnapshot: 250,
    storageUnitSnapshot: 'lbs',
    displayUnitSnapshot: 'lbs',
    ...overrides,
  };
}

describe('HistoryScreen', () => {
  beforeEach(() => {
    mockRefetch.mockClear();
    mockPrIdsRefetch.mockClear();
    mockPrsRefetch.mockClear();
    mockSettingsRefetch.mockClear();
    mockSessions = [];
    mockPrIds = new Set();
    mockIsLoading = false;
    mockIsError = false;
    mockError = null;
  });

  it('renders the loading skeleton while the sessions query is loading', () => {
    mockIsLoading = true;
    const screen = renderScreen(<HistoryScreen />);
    expect(screen.getByTestId('history-skeleton')).toBeTruthy();
  });

  it("renders the COULDN'T LOAD caps line + message when the sessions query errors", () => {
    mockIsError = true;
    mockError = new Error('db offline');
    const screen = renderScreen(<HistoryScreen />);
    expect(screen.getByText("COULDN'T LOAD")).toBeTruthy();
    expect(screen.getByText('db offline')).toBeTruthy();
  });

  it('renders empty-state caps line when no sessions exist', () => {
    mockSessions = [];
    const screen = renderScreen(<HistoryScreen />);
    expect(screen.getByTestId('history-empty')).toBeTruthy();
  });

  it('renders one row per session, newest-first ordering preserved', () => {
    mockSessions = [
      makeSession({ id: 7, lift: 'bench', cycle: 2, week: 3 }),
      makeSession({ id: 4, lift: 'squat', cycle: 1, week: 4, status: 'cancelled' }),
    ];
    const screen = renderScreen(<HistoryScreen />);
    expect(screen.getByTestId('history-row-7')).toBeTruthy();
    expect(screen.getByTestId('history-row-4')).toBeTruthy();
    // Empty state must NOT render when rows exist.
    expect(screen.queryByTestId('history-empty')).toBeNull();
  });

  it('pull-to-refresh fires the underlying query refetch', async () => {
    mockSessions = [makeSession({ id: 1 })];
    const screen = renderScreen(<HistoryScreen />);
    const scroll = screen.getByTestId('history-scroll');
    const refreshControl = scroll.props.refreshControl as { props: { onRefresh: () => void } };
    expect(typeof refreshControl.props.onRefresh).toBe('function');
    await act(async () => {
      refreshControl.props.onRefresh();
    });
    expect(mockRefetch).toHaveBeenCalledTimes(1);
    expect(mockPrIdsRefetch).toHaveBeenCalledTimes(1);
    // Bug fix: pull-to-refresh must also refetch the PRs + settings queries
    // that feed the best-lift chip  -  otherwise stale-after-refresh.
    expect(mockPrsRefetch).toHaveBeenCalledTimes(1);
    expect(mockSettingsRefetch).toHaveBeenCalledTimes(1);
  });

  it('renders the achievement strip with sessions + PRs totals once filed', () => {
    mockSessions = [
      makeSession({ id: 1, status: 'completed' }),
      makeSession({ id: 2, status: 'completed' }),
      makeSession({ id: 3, status: 'cancelled' }),
    ];
    mockPrIds = new Set([2]);
    const screen = renderScreen(<HistoryScreen />);
    expect(screen.getByTestId('history-achievements')).toBeTruthy();
    expect(screen.getByText('sessions filed')).toBeTruthy();
    expect(screen.getByTestId('history-achievements-prs').props.children).toBe(1);
  });

  it('renders a PR star on the rows that produced personal records', () => {
    mockSessions = [
      makeSession({ id: 11, status: 'completed' }),
      makeSession({ id: 22, status: 'completed' }),
    ];
    mockPrIds = new Set([22]);
    const screen = renderScreen(<HistoryScreen />);
    expect(screen.queryByTestId('history-row-11-pr')).toBeNull();
    expect(screen.getByTestId('history-row-22-pr')).toBeTruthy();
  });
});
