/**
 * Behavioral test for RestPhase + RestTimer.
 *
 * Asserts the ported PWA-style layout: caps eyebrow ("LOGGED · REST NOW"),
 * display headline ("Breathe."), LOGGED stat band with optional EST. 1RM
 * column, and the count-up RestTimer below.
 */
import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { RestPhase } from '../RestPhase';

const renderWithTheme = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('RestPhase', () => {
  it('renders the LOGGED · REST NOW eyebrow and a REST eyebrow under the timer', () => {
    const screen = renderWithTheme(
      <RestPhase loggedWeight={225} loggedReps={5} loggedUnit="lbs" remaining={87} target={90} />,
    );
    expect(screen.getByText('LOGGED · REST NOW')).toBeTruthy();
    expect(screen.getByText('REST')).toBeTruthy();
    expect(screen.getByTestId('rest-timer')).toBeTruthy();
  });

  it('renders the "Breathe." headline on a non-PR set', () => {
    const screen = renderWithTheme(
      <RestPhase loggedWeight={225} loggedReps={5} loggedUnit="lbs" remaining={90} target={90} />,
    );
    expect(screen.getByText('Breathe.')).toBeTruthy();
  });

  it('renders the "Stronger." headline and PR eyebrow on a PR set', () => {
    const screen = renderWithTheme(
      <RestPhase
        loggedWeight={225}
        loggedReps={5}
        loggedUnit="lbs"
        remaining={90}
        target={90}
        isPR
      />,
    );
    expect(screen.getByText('Stronger.')).toBeTruthy();
    expect(screen.getByText('NEW PERSONAL RECORD')).toBeTruthy();
  });

  it('renders the LOGGED stat with weight, unit and reps', () => {
    const screen = renderWithTheme(
      <RestPhase loggedWeight={225} loggedReps={5} loggedUnit="lbs" remaining={90} target={90} />,
    );
    expect(screen.getByText('LOGGED')).toBeTruthy();
    expect(screen.getByText('225')).toBeTruthy();
    expect(screen.getByText('lb')).toBeTruthy();
    expect(screen.getByText('× 5')).toBeTruthy();
  });

  it('omits the EST. 1RM column when the set is not an AMRAP', () => {
    const screen = renderWithTheme(
      <RestPhase
        loggedWeight={225}
        loggedReps={5}
        loggedUnit="lbs"
        estimated1RM={262.5}
        remaining={90}
        target={90}
      />,
    );
    expect(screen.queryByTestId('rest-phase-e1rm')).toBeNull();
    expect(screen.queryByText('EST. 1RM')).toBeNull();
  });

  it('renders the EST. 1RM column rounded to an integer when AMRAP + e1RM provided', () => {
    const screen = renderWithTheme(
      <RestPhase
        loggedWeight={225}
        loggedReps={5}
        loggedUnit="lbs"
        estimated1RM={262.5}
        remaining={90}
        target={90}
        isAmrap
      />,
    );
    expect(screen.getByText('EST. 1RM')).toBeTruthy();
    expect(screen.getByTestId('rest-phase-e1rm').props.children).toBe(263);
  });

  it('renders kg as the unit suffix when the session unit is kg', () => {
    const screen = renderWithTheme(
      <RestPhase loggedWeight={102.5} loggedReps={5} loggedUnit="kg" remaining={45} target={120} />,
    );
    expect(screen.getByText('kg')).toBeTruthy();
    expect(screen.getByText('102.5')).toBeTruthy();
  });

  it('formats the timer label as count-UP elapsed (target - remaining)', () => {
    const screen = renderWithTheme(
      <RestPhase loggedWeight={225} loggedReps={5} loggedUnit="lbs" remaining={87} target={90} />,
    );
    // 90 - 87 = 3 → 0:03
    expect(screen.getByTestId('rest-timer-value').props.children).toBe('0:03');
  });

  it('keeps counting past the target when remaining goes negative', () => {
    const screen = renderWithTheme(
      <RestPhase loggedWeight={225} loggedReps={5} loggedUnit="lbs" remaining={-30} target={90} />,
    );
    // 90 - (-30) = 120 → 2:00
    expect(screen.getByTestId('rest-timer-value').props.children).toBe('2:00');
  });

  it('exposes rest-phase and rest-timer testIDs', () => {
    const screen = renderWithTheme(
      <RestPhase loggedWeight={225} loggedReps={5} loggedUnit="lbs" remaining={45} target={90} />,
    );
    expect(screen.getByTestId('rest-phase')).toBeTruthy();
    expect(screen.getByTestId('rest-timer')).toBeTruthy();
  });
});
