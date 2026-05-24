/**
 * Behavioral test for RestPhase + RestTimer.
 *
 * Asserts the current layout: caps eyebrow ("LOGGED · REST NOW"),
 * display headline ("Rest." / "Stronger."), optional EST. 1RM column
 * (AMRAP only), and the count-up RestTimer below. The LOGGED weight ×
 * reps band was removed in favor of a "NEXT SET" TopSetBlock the parent
 * passes via `nextSet`.
 */
import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { RestPhase } from '../RestPhase';

const renderWithTheme = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('RestPhase', () => {
  it('renders the LOGGED · REST NOW eyebrow and the rest-timer surface', () => {
    const screen = renderWithTheme(<RestPhase loggedUnit="lbs" remaining={87} target={90} />);
    expect(screen.getByText('LOGGED · REST NOW')).toBeTruthy();
    expect(screen.getByTestId('rest-timer')).toBeTruthy();
  });

  it('renders the "Rest." headline on a non-PR set', () => {
    const screen = renderWithTheme(<RestPhase loggedUnit="lbs" remaining={90} target={90} />);
    expect(screen.getByText('Rest.')).toBeTruthy();
  });

  it('renders the "Stronger." headline and PR eyebrow on a PR set', () => {
    const screen = renderWithTheme(<RestPhase loggedUnit="lbs" remaining={90} target={90} isPR />);
    expect(screen.getByText('Stronger.')).toBeTruthy();
    expect(screen.getByText('NEW PERSONAL RECORD')).toBeTruthy();
  });

  it('omits the EST. 1RM column when the set is not an AMRAP', () => {
    const screen = renderWithTheme(
      <RestPhase loggedUnit="lbs" estimated1RM={262.5} remaining={90} target={90} />,
    );
    expect(screen.queryByTestId('rest-phase-e1rm')).toBeNull();
    expect(screen.queryByText('EST. 1RM')).toBeNull();
  });

  it('renders the EST. 1RM column rounded to an integer when AMRAP + e1RM provided', () => {
    const screen = renderWithTheme(
      <RestPhase loggedUnit="lbs" estimated1RM={262.5} remaining={90} target={90} isAmrap />,
    );
    expect(screen.getByText('EST. 1RM')).toBeTruthy();
    expect(screen.getByTestId('rest-phase-e1rm').props.children).toBe(263);
  });

  it('renders kg as the EST. 1RM unit suffix when the session unit is kg', () => {
    const screen = renderWithTheme(
      <RestPhase loggedUnit="kg" estimated1RM={110.4} remaining={45} target={120} isAmrap />,
    );
    expect(screen.getByText('kg')).toBeTruthy();
  });

  it('renders the optional NEXT SET TopSetBlock when nextSet is provided', () => {
    const screen = renderWithTheme(
      <RestPhase
        loggedUnit="lbs"
        remaining={45}
        target={90}
        nextSet={{
          weight: 245,
          reps: 5,
          amrap: false,
          pct: 0.75,
          perSide: [45, 10],
          tmDisplay: 300,
        }}
      />,
    );
    expect(screen.getByTestId('rest-phase-next-set')).toBeTruthy();
    expect(screen.getByText('NEXT SET')).toBeTruthy();
  });

  it('formats the timer label as count-UP elapsed (target - remaining)', () => {
    const screen = renderWithTheme(<RestPhase loggedUnit="lbs" remaining={87} target={90} />);
    // 90 - 87 = 3 → 0:03
    expect(screen.getByTestId('rest-timer-value').props.children).toBe('0:03');
  });

  it('keeps counting past the target when remaining goes negative', () => {
    const screen = renderWithTheme(<RestPhase loggedUnit="lbs" remaining={-30} target={90} />);
    // 90 - (-30) = 120 → 2:00
    expect(screen.getByTestId('rest-timer-value').props.children).toBe('2:00');
  });

  it('exposes rest-phase and rest-timer testIDs', () => {
    const screen = renderWithTheme(<RestPhase loggedUnit="lbs" remaining={45} target={90} />);
    expect(screen.getByTestId('rest-phase')).toBeTruthy();
    expect(screen.getByTestId('rest-timer')).toBeTruthy();
  });
});
