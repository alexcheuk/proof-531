import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

jest.mock('react-native-reanimated', () => {
  const RN = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: { View: RN.View },
    useReducedMotion: () => false,
    Easing: { bezier: () => () => 0 },
    useSharedValue: (init: number) => ({ value: init }),
    useAnimatedStyle: (fn: () => object) => fn(),
    withTiming: (val: number) => val,
    cancelAnimation: () => {},
  };
});

import { MissCorrectionCard } from '../MissCorrectionCard';

function wrap(ui: ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('MissCorrectionCard', () => {
  it('choice variant exposes both Reset and Off-day controls', () => {
    const onReset = jest.fn();
    const onOffDay = jest.fn();
    const screen = wrap(
      <MissCorrectionCard
        variant="choice"
        tmDisplay={275}
        unit="lbs"
        onReset={onReset}
        onOffDay={onOffDay}
      />,
    );
    expect(screen.getByTestId('miss-correction-card-reset')).toBeTruthy();
    expect(screen.getByTestId('miss-correction-card-off-day')).toBeTruthy();
  });

  it('choice variant fires onReset and onOffDay on press', () => {
    const onReset = jest.fn();
    const onOffDay = jest.fn();
    const screen = wrap(
      <MissCorrectionCard
        variant="choice"
        tmDisplay={275}
        unit="lbs"
        onReset={onReset}
        onOffDay={onOffDay}
      />,
    );
    fireEvent.press(screen.getByTestId('miss-correction-card-reset'));
    expect(onReset).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByTestId('miss-correction-card-off-day'));
    expect(onOffDay).toHaveBeenCalledTimes(1);
  });

  it('forced variant hides Off-day and shows a single Review control', () => {
    const onReset = jest.fn();
    const screen = wrap(
      <MissCorrectionCard variant="forced" tmDisplay={275} unit="lbs" onReset={onReset} />,
    );
    expect(screen.getByTestId('miss-correction-card-reset')).toBeTruthy();
    expect(screen.queryByTestId('miss-correction-card-off-day')).toBeNull();
    expect(screen.getByText('Review reset')).toBeTruthy();
  });

  it('shows the plate-snapped reset target in the action label (275 lbs -> 250)', () => {
    const screen = wrap(
      <MissCorrectionCard
        variant="choice"
        tmDisplay={275}
        unit="lbs"
        onReset={jest.fn()}
        onOffDay={jest.fn()}
      />,
    );
    // round(275 * 0.9, lbs) = 250
    expect(screen.getByText('−10% · reset to 250 lb')).toBeTruthy();
  });
});
