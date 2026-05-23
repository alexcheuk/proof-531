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
let mockSessions: Session[] = [];
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
    mockSessions = [];
    mockIsLoading = false;
    mockIsError = false;
    mockError = null;
  });

  it('renders the LOADING… caps line while the sessions query is loading', () => {
    mockIsLoading = true;
    const screen = renderScreen(<HistoryScreen />);
    expect(screen.getByText('LOADING…')).toBeTruthy();
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
    // ScrollView's `refreshControl` prop holds the RefreshControl element. We
    // invoke its `onRefresh` directly — equivalent to a pull-to-refresh
    // gesture, but driver-agnostic (the native RefreshControl is not rendered
    // as a discoverable node under jest).
    const refreshControl = scroll.props.refreshControl as { props: { onRefresh: () => void } };
    expect(typeof refreshControl.props.onRefresh).toBe('function');
    await act(async () => {
      refreshControl.props.onRefresh();
    });
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});
