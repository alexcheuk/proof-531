/**
 * Behavioral test for RestPhase + RestTimer.
 *
 * Asserts the ported layout vocabulary (caps eyebrow, weight×reps headline,
 * optional e1RM line, m:ss timer with "of m:ss" context).
 */
import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { RestPhase } from '../RestPhase';

const renderWithTheme = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('RestPhase', () => {
  it('renders the JUST LOGGED eyebrow and a REST eyebrow under the timer', () => {
    const screen = renderWithTheme(
      <RestPhase loggedWeight={225} loggedReps={5} loggedUnit="lbs" remaining={87} target={90} />,
    );
    expect(screen.getByText('Just logged')).toBeTruthy();
    expect(screen.getByText('REST')).toBeTruthy();
    expect(screen.getByTestId('rest-timer')).toBeTruthy();
  });

  it('renders the weight × reps headline with the display unit', () => {
    const screen = renderWithTheme(
      <RestPhase loggedWeight={225} loggedReps={5} loggedUnit="lbs" remaining={90} target={90} />,
    );
    // The headline is a composite Text node — `getByText` matches the joined
    // text content across nested Text children. The display unit is `lb`
    // (not `lbs`), per `displayUnit()` in domain/units.ts.
    expect(screen.getByText(/225\s*×\s*5\s*lb/)).toBeTruthy();
  });

  it('omits the est-1RM line when estimated1RM is not provided', () => {
    const screen = renderWithTheme(
      <RestPhase loggedWeight={225} loggedReps={5} loggedUnit="lbs" remaining={90} target={90} />,
    );
    expect(screen.queryByTestId('rest-phase-e1rm')).toBeNull();
  });

  it('renders the est-1RM line rounded to an integer when provided', () => {
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
    expect(screen.getByText(/e1RM\s*263\s*lb/)).toBeTruthy();
  });

  it('renders kg as the unit suffix when the session unit is kg', () => {
    const screen = renderWithTheme(
      <RestPhase loggedWeight={102.5} loggedReps={5} loggedUnit="kg" remaining={45} target={120} />,
    );
    expect(screen.getByText(/102\.5\s*×\s*5\s*kg/)).toBeTruthy();
  });

  it('formats the timer label as m:ss from the remaining seconds', () => {
    const screen = renderWithTheme(
      <RestPhase loggedWeight={225} loggedReps={5} loggedUnit="lbs" remaining={87} target={90} />,
    );
    expect(screen.getByTestId('rest-timer-value').props.children).toBe('1:27');
  });

  it('renders the target context line as "of m:ss"', () => {
    const screen = renderWithTheme(
      <RestPhase loggedWeight={225} loggedReps={5} loggedUnit="lbs" remaining={87} target={90} />,
    );
    expect(screen.getByText(/of\s*1:30/)).toBeTruthy();
  });

  it('floors negative or sub-zero remaining to 0:00', () => {
    const screen = renderWithTheme(
      <RestPhase loggedWeight={225} loggedReps={5} loggedUnit="lbs" remaining={-3} target={90} />,
    );
    expect(screen.getByTestId('rest-timer-value').props.children).toBe('0:00');
  });

  it('exposes rest-phase and rest-timer testIDs', () => {
    const screen = renderWithTheme(
      <RestPhase loggedWeight={225} loggedReps={5} loggedUnit="lbs" remaining={45} target={90} />,
    );
    expect(screen.getByTestId('rest-phase')).toBeTruthy();
    expect(screen.getByTestId('rest-timer')).toBeTruthy();
  });
});
