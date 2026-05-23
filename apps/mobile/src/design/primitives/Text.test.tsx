import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { ThemeProvider } from '../theme';
import { colors } from '../tokens';
import { Text } from './Text';

const wrap = (ui: React.ReactNode) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('Text', () => {
  it('renders text content', () => {
    const { getByText } = wrap(
      <Text variant="sans" weight="regular" size={14}>
        hello
      </Text>,
    );
    expect(getByText('hello')).toBeTruthy();
  });

  it('maps sans+regular → IBMPlexSans-Regular', () => {
    const { getByText } = wrap(
      <Text variant="sans" weight="regular" size={16}>
        x
      </Text>,
    );
    const style = StyleSheet.flatten(getByText('x').props.style);
    expect(style.fontFamily).toBe('IBMPlexSans-Regular');
    expect(style.fontSize).toBe(16);
  });

  it('maps mono+semibold → IBMPlexMono-SemiBold', () => {
    const { getByText } = wrap(
      <Text variant="mono" weight="semibold" size={14}>
        x
      </Text>,
    );
    const style = StyleSheet.flatten(getByText('x').props.style);
    expect(style.fontFamily).toBe('IBMPlexMono-SemiBold');
  });

  it('maps condensed+bold → IBMPlexSansCondensed-Bold', () => {
    const { getByText } = wrap(
      <Text variant="condensed" weight="bold" size={20}>
        x
      </Text>,
    );
    const style = StyleSheet.flatten(getByText('x').props.style);
    expect(style.fontFamily).toBe('IBMPlexSansCondensed-Bold');
  });

  it('defaults color to ink0; color prop overrides', () => {
    const { getByText, rerender } = wrap(
      <Text variant="sans" weight="regular" size={12}>
        a
      </Text>,
    );
    let style = StyleSheet.flatten(getByText('a').props.style);
    expect(style.color).toBe(colors.ink0);

    rerender(
      <ThemeProvider>
        <Text variant="sans" weight="regular" size={12} color="ink2">
          a
        </Text>
      </ThemeProvider>,
    );
    style = StyleSheet.flatten(getByText('a').props.style);
    expect(style.color).toBe(colors.ink2);
  });

  it('merges user style last', () => {
    const { getByText } = wrap(
      <Text variant="sans" weight="regular" size={12} style={{ letterSpacing: 1 }}>
        a
      </Text>,
    );
    const style = StyleSheet.flatten(getByText('a').props.style);
    expect(style.letterSpacing).toBe(1);
  });
});
