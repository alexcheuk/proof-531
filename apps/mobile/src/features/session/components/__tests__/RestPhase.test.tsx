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

  it('formats the timer label as count-DOWN remaining', () => {
    // Flipped from count-up 2026-05-24 per user feedback — lifters time
    // rests in their head as "N left", and 0:00 is the cleaner "go" cue.
    const screen = renderWithTheme(<RestPhase loggedUnit="lbs" remaining={87} target={180} />);
    // remaining 87 → 1:27 (was 90-87=3 → 0:03 under count-up framing)
    expect(screen.getByTestId('rest-timer-value').props.children).toBe('1:27');
  });

  it('switches to "+MM:SS over-by" framing when the user runs ≥5s past target', () => {
    const screen = renderWithTheme(<RestPhase loggedUnit="lbs" remaining={-30} target={180} />);
    // 30s past target → "+0:30" pacing hint (unchanged by direction flip)
    expect(screen.getByTestId('rest-timer-value').props.children).toBe('+0:30');
  });

  it('clamps to 0:00 inside the pacing-hint threshold (<5s over)', () => {
    // Count-down view: just past zero still reads "0:00" until the over-by
    // pacing hint kicks in at ≥5s overtime.
    const screen = renderWithTheme(<RestPhase loggedUnit="lbs" remaining={-3} target={180} />);
    expect(screen.getByTestId('rest-timer-value').props.children).toBe('0:00');
  });

  it('does not render an inline undo affordance (lives on the top bar now)', () => {
    // The undo affordance was removed from RestPhase on 2026-05-24 per user
    // feedback — undo lives on the SessionTopBar during rest, no duplicate
    // inside the rest body.
    const screen = renderWithTheme(<RestPhase loggedUnit="lbs" remaining={45} target={90} />);
    expect(screen.queryByTestId('rest-phase-undo')).toBeNull();
    expect(screen.queryByText('↶ Undo last set')).toBeNull();
  });

  it('exposes rest-phase and rest-timer testIDs', () => {
    const screen = renderWithTheme(<RestPhase loggedUnit="lbs" remaining={45} target={90} />);
    expect(screen.getByTestId('rest-phase')).toBeTruthy();
    expect(screen.getByTestId('rest-timer')).toBeTruthy();
  });
});
