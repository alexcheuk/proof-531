import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

jest.mock('react-native-reanimated', () => {
  const RN = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: { View: RN.View, Text: RN.Text },
    useSharedValue: (v: unknown) => ({ value: v }),
    useAnimatedStyle: () => ({}),
    withTiming: (v: unknown) => v,
    withDelay: (_d: unknown, v: unknown) => v,
    cancelAnimation: () => {},
    Easing: {
      out: () => () => 0,
      cubic: () => 0,
    },
  };
});

import { PrCelebrationComparison } from '../PrCelebrationComparison';

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('PrCelebrationComparison', () => {
  it('renders previous best and delta values', () => {
    const screen = wrap(
      <PrCelebrationComparison prevE1RMDisplay={215} e1RMDelta={15} unitGlyph="lb" visible />,
    );
    expect(screen.getByTestId('pr-celebration-prev')).toBeTruthy();
    expect(screen.getByTestId('pr-celebration-delta')).toBeTruthy();
  });

  it('displays the formatted previous e1RM with unit glyph', () => {
    const screen = wrap(
      <PrCelebrationComparison prevE1RMDisplay={200} e1RMDelta={10} unitGlyph="lb" visible />,
    );
    expect(screen.getByText('200 lb')).toBeTruthy();
  });

  it('displays the formatted delta with + prefix', () => {
    const screen = wrap(
      <PrCelebrationComparison prevE1RMDisplay={180} e1RMDelta={20} unitGlyph="kg" visible />,
    );
    expect(screen.getByText('+20')).toBeTruthy();
    expect(screen.getByText('kg')).toBeTruthy();
  });

  it('renders correctly when not visible', () => {
    const screen = wrap(
      <PrCelebrationComparison
        prevE1RMDisplay={215}
        e1RMDelta={15}
        unitGlyph="lb"
        visible={false}
      />,
    );
    expect(screen.getByTestId('pr-celebration-prev')).toBeTruthy();
  });
});
