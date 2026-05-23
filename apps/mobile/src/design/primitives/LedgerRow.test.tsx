import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { ThemeProvider } from '../theme';
import { colors } from '../tokens';
import { LedgerRow, LedgerRowLabel, LedgerRowValue } from './LedgerRow';

const wrap = (ui: React.ReactNode) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('LedgerRow', () => {
  it('renders children', () => {
    const { getByText } = wrap(
      <LedgerRow testID="row">
        <Text>inside</Text>
      </LedgerRow>,
    );
    expect(getByText('inside')).toBeTruthy();
  });

  it('first=true → borderTopColor = lineStrong', () => {
    const { getByTestId } = wrap(
      <LedgerRow testID="row" first>
        <Text>x</Text>
      </LedgerRow>,
    );
    const style = StyleSheet.flatten(getByTestId('row').props.style);
    expect(style.borderTopColor).toBe(colors.lineStrong);
    expect(style.borderTopWidth).toBe(1);
  });

  it('first=false (default) → borderTopColor = line', () => {
    const { getByTestId } = wrap(
      <LedgerRow testID="row">
        <Text>x</Text>
      </LedgerRow>,
    );
    const style = StyleSheet.flatten(getByTestId('row').props.style);
    expect(style.borderTopColor).toBe(colors.line);
  });

  it('onPress provided → renders Pressable and fires onPress', () => {
    const onPress = jest.fn();
    const { getByTestId } = wrap(
      <LedgerRow testID="row" onPress={onPress}>
        <Text>x</Text>
      </LedgerRow>,
    );
    fireEvent.press(getByTestId('row'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('onPress + disabled → renders a View (no onPress prop, accessibilityState disabled)', () => {
    const onPress = jest.fn();
    const { getByTestId } = wrap(
      <LedgerRow testID="row" onPress={onPress} disabled>
        <Text>x</Text>
      </LedgerRow>,
    );
    const node = getByTestId('row');
    // The non-pressable branch renders a plain View — no onPress prop is forwarded.
    expect(node.props.onPress).toBeUndefined();
    expect(node.props.accessibilityState).toEqual({ disabled: true });
  });

  it('no onPress → renders a View (no onPress prop forwarded)', () => {
    const { getByTestId } = wrap(
      <LedgerRow testID="row">
        <Text>x</Text>
      </LedgerRow>,
    );
    const node = getByTestId('row');
    expect(node.props.onPress).toBeUndefined();
  });
});

describe('LedgerRowLabel', () => {
  it('renders primary text', () => {
    const { getByText } = wrap(<LedgerRowLabel primary="Hello" />);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('renders secondary when provided', () => {
    const { getByText } = wrap(<LedgerRowLabel primary="Hello" secondary="caps" />);
    expect(getByText('caps')).toBeTruthy();
  });

  it('does not render secondary when omitted', () => {
    const { queryByText } = wrap(<LedgerRowLabel primary="Hello" />);
    expect(queryByText('caps')).toBeNull();
  });
});

describe('LedgerRowValue', () => {
  it('renders value', () => {
    const { getByText } = wrap(<LedgerRowValue value="100" />);
    expect(getByText('100')).toBeTruthy();
  });

  it('tone="muted" applies ink3 color', () => {
    const { getByText } = wrap(<LedgerRowValue value="100" tone="muted" />);
    const style = StyleSheet.flatten(getByText('100').props.style);
    expect(style.color).toBe(colors.ink3);
  });

  it('default tone applies ink0 color', () => {
    const { getByText } = wrap(<LedgerRowValue value="100" />);
    const style = StyleSheet.flatten(getByText('100').props.style);
    expect(style.color).toBe(colors.ink0);
  });

  it('numeric=true sets tabular-nums fontVariant', () => {
    const { getByText } = wrap(<LedgerRowValue value="100" numeric />);
    const style = StyleSheet.flatten(getByText('100').props.style);
    expect(style.fontVariant).toEqual(['tabular-nums', 'lining-nums']);
  });

  it('renders sub when provided', () => {
    const { getByText } = wrap(<LedgerRowValue value="100" sub="lb" />);
    expect(getByText('lb')).toBeTruthy();
  });
});
