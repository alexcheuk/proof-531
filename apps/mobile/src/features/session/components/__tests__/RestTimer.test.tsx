// RestTimer uses Reanimated to pulse the clock during overtime — stub the
// native bridge so jest doesn't crash on import.
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
import { RestTimer } from '../RestTimer';

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('RestTimer', () => {
  it('displays the remaining time in mm:ss format', () => {
    const screen = wrap(<RestTimer remaining={90} />);
    expect(screen.getByText('1:30')).toBeTruthy();
  });

  it('shows 0:00 when remaining is exactly 0', () => {
    const screen = wrap(<RestTimer remaining={0} />);
    expect(screen.getByText('0:00')).toBeTruthy();
  });

  it('shows "Rest timer" label and "TARGET" meta when not overtime', () => {
    const screen = wrap(<RestTimer remaining={60} />);
    // CapsLabel applies textTransform via style, not string mutation
    expect(screen.getByText('Rest timer')).toBeTruthy();
    expect(screen.getByTestId('rest-timer-meta').props.children).toBe('TARGET');
  });

  it('shows "OVERTIME" meta when remaining is negative', () => {
    const screen = wrap(<RestTimer remaining={-10} />);
    expect(screen.getByTestId('rest-timer-meta').props.children).toBe('OVERTIME');
  });

  it('shows "+N:NN" over-by display once past threshold', () => {
    const screen = wrap(<RestTimer remaining={-10} />);
    // 10 seconds overtime = +0:10
    expect(screen.getByTestId('rest-timer-value').props.children).toBe('+0:10');
  });

  it('shows "Over by" label once past the hint threshold', () => {
    const screen = wrap(<RestTimer remaining={-10} />);
    expect(screen.getByText('Over by')).toBeTruthy();
  });

  it('still shows the countdown format when only slightly negative (below threshold)', () => {
    // Below PACE_HINT_THRESHOLD_SECONDS (5s) shows 0:00 rather than +0:NN
    const screen = wrap(<RestTimer remaining={-2} />);
    expect(screen.getByTestId('rest-timer-value').props.children).toBe('0:00');
  });

  it('has the correct accessibility role', () => {
    const screen = wrap(<RestTimer remaining={45} testID="timer" />);
    const container = screen.getByTestId('timer');
    expect(container.props.accessibilityRole).toBe('timer');
  });
});
