/**
 * Behavior tests for SessionTopBar (W3.2 cancel-split addition).
 *
 * Asserts:
 *   - The legacy `cancel` and `complete` variants still render their original
 *     pills.
 *   - The new `cancel-split` variant renders both the X chip and the overflow
 *     `…` chip.
 *   - Tap on X chip calls `onTapCancel`; long-press on X calls `onLongPressCancel`;
 *     tap on `…` calls `onTapOverflow`.
 *   - The X chip carries an accessibility action for `longpress`.
 */
import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SessionTopBar } from '../SessionTopBar';

const renderWithTheme = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('SessionTopBar', () => {
  it('renders the back chip and a Cancel pill for the legacy `cancel` variant', () => {
    const onBack = jest.fn();
    const onPress = jest.fn();
    const screen = renderWithTheme(
      <SessionTopBar onBack={onBack} rightAction={{ kind: 'cancel', onPress }} />,
    );
    expect(screen.getByTestId('session-back')).toBeTruthy();
    expect(screen.getByTestId('session-cancel')).toBeTruthy();
    // The legacy pill is rendered (not the split chips).
    expect(screen.queryByTestId('session-cancel-split')).toBeNull();
    expect(screen.queryByTestId('session-cancel-overflow')).toBeNull();
  });

  it('renders the back chip + Complete pill for the `complete` variant', () => {
    const onBack = jest.fn();
    const onPress = jest.fn();
    const screen = renderWithTheme(
      <SessionTopBar onBack={onBack} rightAction={{ kind: 'complete', onPress }} />,
    );
    expect(screen.getByTestId('session-complete')).toBeTruthy();
  });

  it('W3.2: renders X chip + overflow chip when rightAction.kind === "cancel-split"', () => {
    const onBack = jest.fn();
    const onTapCancel = jest.fn();
    const onLongPressCancel = jest.fn();
    const onTapOverflow = jest.fn();
    const screen = renderWithTheme(
      <SessionTopBar
        onBack={onBack}
        rightAction={{
          kind: 'cancel-split',
          onTapCancel,
          onLongPressCancel,
          onTapOverflow,
        }}
      />,
    );
    expect(screen.getByTestId('session-cancel-split')).toBeTruthy();
    // The X chip preserves the legacy `session-cancel` testID for back-compat
    // with existing screen-level tests that asserted on it.
    expect(screen.getByTestId('session-cancel')).toBeTruthy();
    expect(screen.getByTestId('session-cancel-overflow')).toBeTruthy();
  });

  it('W3.2: tap on X chip invokes onTapCancel; tap on overflow invokes onTapOverflow', () => {
    const onTapCancel = jest.fn();
    const onTapOverflow = jest.fn();
    const screen = renderWithTheme(
      <SessionTopBar
        onBack={jest.fn()}
        rightAction={{
          kind: 'cancel-split',
          onTapCancel,
          onLongPressCancel: jest.fn(),
          onTapOverflow,
        }}
      />,
    );
    fireEvent.press(screen.getByTestId('session-cancel'));
    expect(onTapCancel).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByTestId('session-cancel-overflow'));
    expect(onTapOverflow).toHaveBeenCalledTimes(1);
  });

  it('W3.2: long-press on X chip invokes onLongPressCancel', () => {
    const onLongPressCancel = jest.fn();
    const screen = renderWithTheme(
      <SessionTopBar
        onBack={jest.fn()}
        rightAction={{
          kind: 'cancel-split',
          onTapCancel: jest.fn(),
          onLongPressCancel,
          onTapOverflow: jest.fn(),
        }}
      />,
    );
    fireEvent(screen.getByTestId('session-cancel'), 'longPress');
    expect(onLongPressCancel).toHaveBeenCalledTimes(1);
  });

  it('W3.2: X chip exposes accessibility action `longpress` that routes to onLongPressCancel', () => {
    const onLongPressCancel = jest.fn();
    const screen = renderWithTheme(
      <SessionTopBar
        onBack={jest.fn()}
        rightAction={{
          kind: 'cancel-split',
          onTapCancel: jest.fn(),
          onLongPressCancel,
          onTapOverflow: jest.fn(),
        }}
      />,
    );
    const chip = screen.getByTestId('session-cancel');
    expect(chip.props.accessibilityActions).toEqual([
      { name: 'longpress', label: 'Force cancel session' },
    ]);
    fireEvent(chip, 'accessibilityAction', { nativeEvent: { actionName: 'longpress' } });
    expect(onLongPressCancel).toHaveBeenCalledTimes(1);
  });
});
