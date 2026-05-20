import { fireEvent, render } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import type React from 'react';
import { ThemeProvider } from '../../theme';
import { colors, shape } from '../../tokens';
import { PressButton } from '../PressButton';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

const wrap = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

beforeEach(() => {
  (Haptics.impactAsync as jest.Mock).mockClear();
});

const flatten = (s: unknown): Record<string, unknown> =>
  (Array.isArray(s) ? Object.assign({}, ...s) : s) as Record<string, unknown>;

describe('PressButton', () => {
  it('renders with accessibilityRole="button" and the label', () => {
    const { getByRole, getByText } = wrap(<PressButton onPress={() => {}}>Go</PressButton>);
    expect(getByRole('button')).toBeTruthy();
    expect(getByText('Go')).toBeTruthy();
  });

  it('fires onPress and triggers haptic feedback when pressed', () => {
    const onPress = jest.fn();
    const { getByRole } = wrap(<PressButton onPress={onPress}>Tap</PressButton>);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
  });

  it('does not fire onPress or haptic when disabled, and exposes accessibilityState.disabled', () => {
    const onPress = jest.fn();
    const { getByRole } = wrap(
      <PressButton onPress={onPress} disabled>
        Nope
      </PressButton>,
    );
    const node = getByRole('button');
    expect(node.props.accessibilityState).toEqual(expect.objectContaining({ disabled: true }));
    fireEvent.press(node);
    expect(onPress).not.toHaveBeenCalled();
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });

  it('ember variant uses theme hot background and md size paddings', () => {
    const { getByRole } = wrap(
      <PressButton variant="ember" size="md" onPress={() => {}}>
        Ember
      </PressButton>,
    );
    const style = flatten(getByRole('button').props.style);
    expect(style).toEqual(
      expect.objectContaining({
        backgroundColor: colors.hot,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: shape.rMd,
      }),
    );
  });

  it('inverse variant uses ink0 background and bg0 text color', () => {
    const { getByRole, getByText } = wrap(
      <PressButton variant="inverse" onPress={() => {}}>
        Inverse
      </PressButton>,
    );
    expect(flatten(getByRole('button').props.style)).toEqual(
      expect.objectContaining({ backgroundColor: colors.ink0 }),
    );
    expect(flatten(getByText('Inverse').props.style)).toEqual(
      expect.objectContaining({ color: colors.bg0 }),
    );
  });

  it('ghost variant is transparent with hot-colored border + hot text', () => {
    const { getByRole, getByText } = wrap(
      <PressButton variant="ghost" onPress={() => {}}>
        Ghost
      </PressButton>,
    );
    expect(flatten(getByRole('button').props.style)).toEqual(
      expect.objectContaining({
        backgroundColor: 'transparent',
        borderColor: colors.hot,
        borderWidth: 1,
      }),
    );
    expect(flatten(getByText('Ghost').props.style)).toEqual(
      expect.objectContaining({ color: colors.hot }),
    );
  });

  it('sm size has smaller paddings/fontSize than lg', () => {
    const { getByRole, getByText, rerender } = wrap(
      <PressButton size="sm" onPress={() => {}}>
        X
      </PressButton>,
    );
    expect(flatten(getByRole('button').props.style)).toEqual(
      expect.objectContaining({ paddingVertical: 8, paddingHorizontal: 14 }),
    );
    expect(flatten(getByText('X').props.style)).toEqual(expect.objectContaining({ fontSize: 13 }));

    rerender(
      <ThemeProvider>
        <PressButton size="lg" onPress={() => {}}>
          X
        </PressButton>
      </ThemeProvider>,
    );
    expect(flatten(getByRole('button').props.style)).toEqual(
      expect.objectContaining({ paddingVertical: 16, paddingHorizontal: 28 }),
    );
  });
});
