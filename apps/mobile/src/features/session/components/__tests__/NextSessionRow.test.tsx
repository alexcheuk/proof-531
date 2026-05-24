/**
 * Behavior tests for NextSessionRow (W3.3).
 *
 * Asserts:
 *   - Renders the lift name + Week N · Day N + weight × reps line.
 *   - Renders "Set a training max first" sub-line when `weight === null`.
 *   - Tapping "Schedule reminder" fires a selection haptic AND shows the
 *     "Reminders coming soon." caption.
 *   - The caption disappears after the 2-second timeout.
 */
import { ThemeProvider } from '@/design/theme';
import { act, fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

const mockSelectionAsync = jest.fn();
jest.mock('expo-haptics', () => ({
  selectionAsync: (...args: unknown[]) => mockSelectionAsync(...args),
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

import { NextSessionRow } from '../NextSessionRow';

const renderWithTheme = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('NextSessionRow (W3.3)', () => {
  beforeEach(() => {
    mockSelectionAsync.mockClear();
  });

  it('renders lift name, week/day, and weight × reps', () => {
    const screen = renderWithTheme(
      <NextSessionRow
        liftLabel="Bench"
        week={2}
        day={2}
        weight={185}
        reps={5}
        amrap={true}
        unit="lbs"
      />,
    );
    expect(screen.getByTestId('next-session-row-lift').props.children).toBe('Bench');
    const weekDay = screen.getByTestId('next-session-row-week-day');
    expect(weekDay.props.children).toEqual(['Week ', 2, ' · Day ', 2]);
    expect(screen.getByTestId('next-session-row-weight').props.children).toBe('185 lb × 5+');
  });

  it('renders "Set a training max first" when weight is null', () => {
    const screen = renderWithTheme(
      <NextSessionRow
        liftLabel="Press"
        week={1}
        day={4}
        weight={null}
        reps={5}
        amrap={true}
        unit="lbs"
      />,
    );
    expect(screen.getByTestId('next-session-row-no-tm')).toBeTruthy();
  });

  it('non-AMRAP weeks render without the `+` suffix', () => {
    const screen = renderWithTheme(
      <NextSessionRow
        liftLabel="Squat"
        week={4}
        day={1}
        weight={180}
        reps={5}
        amrap={false}
        unit="lbs"
      />,
    );
    expect(screen.getByTestId('next-session-row-weight').props.children).toBe('180 lb × 5');
  });

  it('tapping "Schedule reminder" fires selection haptic + shows stub caption', () => {
    jest.useFakeTimers();
    const screen = renderWithTheme(
      <NextSessionRow
        liftLabel="Squat"
        week={1}
        day={1}
        weight={195}
        reps={5}
        amrap={true}
        unit="lbs"
      />,
    );
    expect(screen.queryByTestId('next-session-row-stub-caption')).toBeNull();

    fireEvent.press(screen.getByTestId('next-session-row-schedule-reminder'));
    expect(mockSelectionAsync).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('next-session-row-stub-caption')).toBeTruthy();

    // Caption disappears after 2 seconds.
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(screen.queryByTestId('next-session-row-stub-caption')).toBeNull();
    jest.useRealTimers();
  });

  it('exposes accessibility-only stub status on the schedule-reminder button', () => {
    const screen = renderWithTheme(
      <NextSessionRow
        liftLabel="Bench"
        week={1}
        day={2}
        weight={140}
        reps={5}
        amrap={true}
        unit="lbs"
      />,
    );
    const btn = screen.getByTestId('next-session-row-schedule-reminder');
    expect(btn.props.accessibilityLabel).toBe('Schedule reminder. Coming soon.');
    expect(btn.props.accessibilityHint).toBe('Not yet available.');
  });
});
