import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { ThemeProvider } from '../theme';
import { colors } from '../tokens';
import { MonoBadge } from './MonoBadge';

const wrap = (ui: React.ReactNode) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('MonoBadge', () => {
  it('renders its children', () => {
    const { getByText } = wrap(<MonoBadge>AMRAP</MonoBadge>);
    expect(getByText('AMRAP')).toBeTruthy();
  });

  it('defaults to size="sm" — 9px font, 1.98 letterSpacing, IBMPlexMono-Bold', () => {
    const { getByText } = wrap(<MonoBadge>UP NEXT</MonoBadge>);
    const textStyle = StyleSheet.flatten(getByText('UP NEXT').props.style);
    expect(textStyle.fontFamily).toBe('IBMPlexMono-Bold');
    expect(textStyle.fontSize).toBe(9);
    expect(textStyle.lineHeight).toBe(9);
    expect(textStyle.letterSpacing).toBeCloseTo(1.98);
    expect(textStyle.color).toBe(colors.ink0);
    expect(textStyle.textTransform).toBe('uppercase');
  });

  it('applies size="md" — 10px font, 2.2 letterSpacing', () => {
    const { getByText } = wrap(<MonoBadge size="md">FILED</MonoBadge>);
    const textStyle = StyleSheet.flatten(getByText('FILED').props.style);
    expect(textStyle.fontSize).toBe(10);
    expect(textStyle.lineHeight).toBe(10);
    expect(textStyle.letterSpacing).toBeCloseTo(2.2);
  });

  it('renders 1px ink0 border on transparent background with sharp corners', () => {
    const { getByTestId } = wrap(<MonoBadge testID="badge">x</MonoBadge>);
    const containerStyle = StyleSheet.flatten(getByTestId('badge').props.style);
    expect(containerStyle.borderWidth).toBe(1);
    expect(containerStyle.borderColor).toBe(colors.ink0);
    expect(containerStyle.borderRadius).toBe(0);
    expect(containerStyle.backgroundColor).toBe('transparent');
  });

  it('uses sm padding (2 vertical × 6 horizontal) by default and md padding (5 vertical × 8 horizontal) when size="md"', () => {
    const { getByTestId, rerender } = wrap(<MonoBadge testID="b">x</MonoBadge>);
    let containerStyle = StyleSheet.flatten(getByTestId('b').props.style);
    expect(containerStyle.paddingTop).toBe(2);
    expect(containerStyle.paddingBottom).toBe(2);
    expect(containerStyle.paddingHorizontal).toBe(6);

    rerender(
      <ThemeProvider>
        <MonoBadge testID="b" size="md">
          x
        </MonoBadge>
      </ThemeProvider>,
    );
    containerStyle = StyleSheet.flatten(getByTestId('b').props.style);
    expect(containerStyle.paddingTop).toBe(5);
    expect(containerStyle.paddingBottom).toBe(5);
    expect(containerStyle.paddingHorizontal).toBe(8);
  });

  it('merges user style after defaults', () => {
    const { getByTestId } = wrap(
      <MonoBadge testID="b" style={{ marginLeft: 12 }}>
        x
      </MonoBadge>,
    );
    const containerStyle = StyleSheet.flatten(getByTestId('b').props.style);
    expect(containerStyle.marginLeft).toBe(12);
    // defaults still present
    expect(containerStyle.borderWidth).toBe(1);
  });
});
