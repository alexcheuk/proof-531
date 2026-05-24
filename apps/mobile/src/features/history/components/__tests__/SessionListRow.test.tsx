/**
 * Behavioral tests for SessionListRow — the History list row.
 *
 * Covers the navigation matrix (completed → /session/complete,
 * in_progress → /session/today, cancelled → no nav), the PR ★ chip
 * (visible when hasPr, dispatches onPressPr with the row's lift), and
 * the composed a11y label.
 */
import type { Session } from '@/data/accessors/session';
import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: jest.fn() }),
}));

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn().mockResolvedValue(undefined),
}));

import { SessionListRow } from '../SessionListRow';

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

function makeSession(over: Partial<Session> = {}): Session {
  // 2026-05-01 noon — far enough from "today" so isToday is false
  // unless overridden by the test.
  const base = new Date(2026, 4, 1, 12).getTime();
  return {
    id: 42,
    lift: 'squat',
    cycle: 2,
    week: 3,
    startedAt: base,
    endedAt: base + 60_000,
    status: 'completed',
    trainingMaxSnapshot: 315,
    storageUnitSnapshot: 'lbs',
    displayUnitSnapshot: 'lbs',
    ...over,
  };
}

describe('SessionListRow', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
  });

  it('renders the lift label, dated caption, cycle/week glyph, and COMPLETED status', () => {
    const screen = wrap(<SessionListRow session={makeSession()} />);
    expect(screen.getByText('Squat')).toBeTruthy();
    expect(screen.getByText('FRI · MAY 1')).toBeTruthy();
    expect(screen.getByText('C2 · W3')).toBeTruthy();
    expect(screen.getByText('COMPLETED')).toBeTruthy();
  });

  it('renders the IN PROGRESS status caps for in-progress sessions', () => {
    const screen = wrap(<SessionListRow session={makeSession({ status: 'in_progress' })} />);
    expect(screen.getByText('IN PROGRESS')).toBeTruthy();
  });

  it('renders the CANCELLED status caps for cancelled sessions', () => {
    const screen = wrap(<SessionListRow session={makeSession({ status: 'cancelled' })} />);
    expect(screen.getByText('CANCELLED')).toBeTruthy();
  });

  it('navigates to /session/complete with from=history when a completed row is pressed', () => {
    const screen = wrap(<SessionListRow session={makeSession({ id: 7, status: 'completed' })} />);
    fireEvent.press(screen.getByTestId('history-row-7'));
    expect(mockPush).toHaveBeenCalled();
    const [arg] = mockPush.mock.calls[0] ?? [];
    expect(arg).toMatchObject({
      pathname: '/session/complete',
      params: { sessionId: '7', from: 'history' },
    });
  });

  it('navigates to /session/today when an in-progress row is pressed', () => {
    const screen = wrap(
      <SessionListRow session={makeSession({ id: 9, status: 'in_progress', lift: 'bench' })} />,
    );
    fireEvent.press(screen.getByTestId('history-row-9'));
    expect(mockPush).toHaveBeenCalled();
    const [arg] = mockPush.mock.calls[0] ?? [];
    expect(arg).toMatchObject({
      pathname: '/session/today',
      params: { lift: 'bench' },
    });
  });

  it('is non-tappable when the session is cancelled', () => {
    const screen = wrap(<SessionListRow session={makeSession({ id: 11, status: 'cancelled' })} />);
    fireEvent.press(screen.getByTestId('history-row-11'));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('hides the PR chip when hasPr is false', () => {
    const screen = wrap(<SessionListRow session={makeSession({ id: 21 })} />);
    expect(screen.queryByTestId('history-row-21-pr')).toBeNull();
  });

  it('renders the ★ PR chip when hasPr is true', () => {
    const screen = wrap(<SessionListRow session={makeSession({ id: 22 })} hasPr />);
    expect(screen.getByTestId('history-row-22-pr')).toBeTruthy();
    expect(screen.getByText('★ PR')).toBeTruthy();
  });

  it('fires onPressPr with the row lift when the PR chip is tapped', () => {
    const onPressPr = jest.fn();
    const screen = wrap(
      <SessionListRow
        session={makeSession({ id: 23, lift: 'deadlift' })}
        hasPr
        onPressPr={onPressPr}
      />,
    );
    fireEvent.press(screen.getByTestId('history-row-23-pr'));
    expect(onPressPr).toHaveBeenCalledWith('deadlift');
  });

  it('exposes a composed a11y label including the PR clause when hasPr', () => {
    const screen = wrap(<SessionListRow session={makeSession({ id: 31 })} hasPr />);
    const row = screen.getByTestId('history-row-31');
    expect(row.props.accessibilityLabel).toBe('Squat, Cycle 2, Week 3, completed, personal record');
  });

  it('omits the personal-record clause from the a11y label when hasPr is false', () => {
    const screen = wrap(<SessionListRow session={makeSession({ id: 32 })} />);
    const row = screen.getByTestId('history-row-32');
    expect(row.props.accessibilityLabel).toBe('Squat, Cycle 2, Week 3, completed');
  });
});
