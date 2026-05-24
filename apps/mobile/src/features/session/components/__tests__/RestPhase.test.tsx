/**
 * Behavioral test for RestPhase + RestTimer.
 *
 * Asserts the current layout: caps eyebrow ("SET COMPLETED" /
 * "SET COMPLETED · NEW PERSONAL RECORD"), display headline
 * ("Rest" / "Stronger" with a separate amber period), optional NEXT SET
 * TopSetBlock the parent passes via `nextSet`, and the count-up
 * RestTimer.
 */
import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { RestPhase } from '../RestPhase';

const renderWithTheme = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('RestPhase', () => {
  it('renders the SET COMPLETED eyebrow and the rest-timer surface', () => {
    const screen = renderWithTheme(<RestPhase loggedUnit="lbs" remaining={87} target={90} />);
    expect(screen.getByText('SET COMPLETED')).toBeTruthy();
    expect(screen.getByTestId('rest-timer')).toBeTruthy();
  });

  it('renders the "Rest" headline word on a non-PR set', () => {
    const screen = renderWithTheme(<RestPhase loggedUnit="lbs" remaining={90} target={90} />);
    // The headline RNText holds a string child plus a sibling amber-period
    // Text — getByText can't match the bare word, so assert on the
    // children array of the testID'd node.
    const headline = screen.getByTestId('rest-phase-headline');
    expect(headline.props.children).toEqual(expect.arrayContaining(['Rest']));
  });

  it('renders the "Stronger" headline and PR eyebrow on a PR set', () => {
    const screen = renderWithTheme(<RestPhase loggedUnit="lbs" remaining={90} target={90} isPR />);
    const headline = screen.getByTestId('rest-phase-headline');
    expect(headline.props.children).toEqual(expect.arrayContaining(['Stronger']));
    expect(screen.getByText('SET COMPLETED · NEW PERSONAL RECORD')).toBeTruthy();
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

  it('formats the timer label as count-DOWN remaining (W2.2)', () => {
    const screen = renderWithTheme(<RestPhase loggedUnit="lbs" remaining={87} target={90} />);
    // 87 → 1:27 in count-down.
    expect(screen.getByTestId('rest-timer-value').props.children).toBe('1:27');
  });

  it('pins the label at 0:00 once remaining drops below zero (W2.2)', () => {
    const screen = renderWithTheme(<RestPhase loggedUnit="lbs" remaining={-30} target={90} />);
    expect(screen.getByTestId('rest-timer-value').props.children).toBe('0:00');
  });

  it('exposes rest-phase and rest-timer testIDs', () => {
    const screen = renderWithTheme(<RestPhase loggedUnit="lbs" remaining={45} target={90} />);
    expect(screen.getByTestId('rest-phase')).toBeTruthy();
    expect(screen.getByTestId('rest-timer')).toBeTruthy();
  });

  it('W2.1 LOGGED band: renders "{weight} {unit} × {reps}" when loggedWeight/Reps are provided', () => {
    const screen = renderWithTheme(
      <RestPhase loggedUnit="lbs" remaining={45} target={90} loggedWeight={185} loggedReps={5} />,
    );
    expect(screen.getByTestId('rest-phase-logged')).toBeTruthy();
    expect(screen.getByText('LOGGED')).toBeTruthy();
    expect(screen.getByTestId('rest-phase-logged-value').props.children).toEqual([
      185,
      ' ',
      'lb',
      ' × ',
      5,
    ]);
  });

  it('W2.1 LOGGED band: shows EST. 1RM with PR suffix on AMRAP + isPR', () => {
    const screen = renderWithTheme(
      <RestPhase
        loggedUnit="lbs"
        remaining={45}
        target={90}
        loggedWeight={195}
        loggedReps={9}
        isAmrap
        isPR
        estimated1RM={245}
      />,
    );
    const e1rm = screen.getByTestId('rest-phase-logged-e1rm');
    // children: ['EST. 1RM ', 245, ' ', 'lb', ' · PR']
    expect(e1rm.props.children).toEqual(['EST. 1RM ', 245, ' ', 'lb', ' · PR']);
  });

  it('W2.1 LOGGED band: hides EST. 1RM when set was not AMRAP', () => {
    const screen = renderWithTheme(
      <RestPhase loggedUnit="lbs" remaining={45} target={90} loggedWeight={185} loggedReps={5} />,
    );
    expect(screen.queryByTestId('rest-phase-logged-e1rm')).toBeNull();
  });

  it('W2.1 LOGGED band: omitted when loggedWeight is not provided', () => {
    const screen = renderWithTheme(<RestPhase loggedUnit="lbs" remaining={45} target={90} />);
    expect(screen.queryByTestId('rest-phase-logged')).toBeNull();
  });

  it('W2.1 plate-load instruction line renders below NEXT SET when provided', () => {
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
        plateInstruction="load: 45 + 10 / side over 45 bar"
      />,
    );
    expect(screen.getByTestId('rest-phase-plate-instruction').props.children).toBe(
      'load: 45 + 10 / side over 45 bar',
    );
  });

  it('W2.2 RestTimer skip/+30s controls render when callbacks provided', () => {
    const onSkip = jest.fn();
    const onAdd = jest.fn();
    const screen = renderWithTheme(
      <RestPhase
        loggedUnit="lbs"
        remaining={45}
        target={90}
        onSkipRest={onSkip}
        onAddRest={onAdd}
      />,
    );
    expect(screen.getByTestId('rest-timer-skip')).toBeTruthy();
    expect(screen.getByTestId('rest-timer-add')).toBeTruthy();
  });

  it('W3.5: RestTimer header shows TARGET {m:ss} for the configured rest target', () => {
    const screen = renderWithTheme(<RestPhase loggedUnit="lbs" remaining={90} target={90} />);
    const targetLabel = screen.getByTestId('rest-timer-target');
    expect(targetLabel.props.children).toEqual(['TARGET ', '1:30']);
  });

  it('W3.5: RestTimer header shows TARGET 3:00 when configured rest target is 180s', () => {
    const screen = renderWithTheme(<RestPhase loggedUnit="lbs" remaining={180} target={180} />);
    const targetLabel = screen.getByTestId('rest-timer-target');
    expect(targetLabel.props.children).toEqual(['TARGET ', '3:00']);
  });
});
