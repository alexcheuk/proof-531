/**
 * Behavioral test for RestPhase + RestTimer.
 *
 * Asserts the current layout: caps eyebrow ("SET COMPLETED" /
 * "SET COMPLETED · NEW PERSONAL RECORD"), display headline
 * ("Rest" / "Stronger" with a separate amber period), optional NEXT SET
 * TopSetBlock the parent passes via `nextSet`, and the count-up
 * RestTimer.
 */
// RestTimer uses Reanimated to pulse the count-up clock when in overtime;
// stub the native bridge so jest doesn't crash on import.
jest.mock('react-native-reanimated', () => {
  const RN = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: { View: RN.View },
    useSharedValue: (v: unknown) => ({ value: v }),
    useAnimatedStyle: () => ({}),
    withRepeat: (v: unknown) => v,
    withTiming: (v: unknown) => v,
    cancelAnimation: () => {},
    Easing: { inOut: () => () => 0, ease: () => 0 },
  };
});

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

  it('formats the timer label as count-UP elapsed (target - remaining)', () => {
    const screen = renderWithTheme(<RestPhase loggedUnit="lbs" remaining={87} target={90} />);
    // 90 - 87 = 3 → 0:03
    expect(screen.getByTestId('rest-timer-value').props.children).toBe('0:03');
  });

  it('switches to "+MM:SS over-by" framing when the user runs ≥5s past target', () => {
    const screen = renderWithTheme(<RestPhase loggedUnit="lbs" remaining={-30} target={90} />);
    // 30s past target → "+0:30" pacing hint
    expect(screen.getByTestId('rest-timer-value').props.children).toBe('+0:30');
  });

  it('still shows count-up framing within the pacing-hint threshold (<5s over)', () => {
    const screen = renderWithTheme(<RestPhase loggedUnit="lbs" remaining={-3} target={90} />);
    // 90 - (-3) = 93 → "1:33"
    expect(screen.getByTestId('rest-timer-value').props.children).toBe('1:33');
  });

  it('exposes rest-phase and rest-timer testIDs', () => {
    const screen = renderWithTheme(<RestPhase loggedUnit="lbs" remaining={45} target={90} />);
    expect(screen.getByTestId('rest-phase')).toBeTruthy();
    expect(screen.getByTestId('rest-timer')).toBeTruthy();
  });
});
