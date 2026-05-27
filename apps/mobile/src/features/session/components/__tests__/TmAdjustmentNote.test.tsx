import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { TmAdjustmentNote } from '../TmAdjustmentNote';

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('TmAdjustmentNote', () => {
  it('renders increment value and tap caption', () => {
    const screen = wrap(
      <TmAdjustmentNote
        suggestion={{ kind: 'increment', delta: 10 }}
        tmDisplay={275}
        unit="lbs"
        onPress={() => {}}
      />,
    );
    expect(screen.getByTestId('tm-adjustment-value')).toBeTruthy();
    expect(screen.getByText('+10 lb')).toBeTruthy();
    expect(screen.getByText('Tap to apply')).toBeTruthy();
  });

  it('renders hold value', () => {
    const screen = wrap(
      <TmAdjustmentNote
        suggestion={{ kind: 'hold' }}
        tmDisplay={275}
        unit="lbs"
        onPress={() => {}}
      />,
    );
    expect(screen.getByText('Hold')).toBeTruthy();
  });

  it('renders reset value with computed reset TM', () => {
    const screen = wrap(
      <TmAdjustmentNote
        suggestion={{ kind: 'reset', resetPct: 0.9 }}
        tmDisplay={275}
        unit="lbs"
        onPress={() => {}}
      />,
    );
    // round(275 * 0.9, lbs) = round(247.5, lbs) = 250
    expect(screen.getByText('−10% · reset to 250 lb')).toBeTruthy();
  });

  it('fires onPress when tapped', () => {
    const onPress = jest.fn();
    const screen = wrap(
      <TmAdjustmentNote
        suggestion={{ kind: 'increment', delta: 10 }}
        tmDisplay={275}
        unit="lbs"
        onPress={onPress}
      />,
    );
    fireEvent.press(screen.getByTestId('session-complete-tm-adjustment'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('accepts a custom testID', () => {
    const screen = wrap(
      <TmAdjustmentNote
        suggestion={{ kind: 'hold' }}
        tmDisplay={275}
        unit="lbs"
        onPress={() => {}}
        testID="custom-tm-note"
      />,
    );
    expect(screen.getByTestId('custom-tm-note')).toBeTruthy();
    expect(screen.queryByTestId('session-complete-tm-adjustment')).toBeNull();
  });
});
