import { render } from '@testing-library/react-native';
import { Text as RNText, StyleSheet } from 'react-native';
import { ThemeProvider } from '../theme';
import { colors } from '../tokens';
import { StatGrid } from './StatGrid';

const wrap = (ui: React.ReactNode) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('StatGrid', () => {
  it('renders all three labels and values', () => {
    const { getByText } = wrap(
      <StatGrid
        testID="grid"
        cells={[
          { label: 'LAST', value: '215' },
          { label: 'BEST', value: '235' },
          { label: 'CYCLE', value: '3' },
        ]}
      />,
    );
    expect(getByText('LAST')).toBeTruthy();
    expect(getByText('BEST')).toBeTruthy();
    expect(getByText('CYCLE')).toBeTruthy();
    expect(getByText('215')).toBeTruthy();
    expect(getByText('235')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
  });

  it('renders sub when provided', () => {
    const { getByText, queryByText } = wrap(
      <StatGrid
        testID="grid"
        cells={[
          { label: 'LAST', value: '215', sub: 'lb' },
          { label: 'BEST', value: '235' },
          { label: 'CYCLE', value: '3', sub: 'wk' },
        ]}
      />,
    );
    expect(getByText('lb')).toBeTruthy();
    expect(getByText('wk')).toBeTruthy();
    // BEST has no sub
    expect(queryByText('lb-best')).toBeNull();
  });

  it('with divided=true (default), cells 2 and 3 have borderLeftWidth 1; cell 1 does not', () => {
    const { getByTestId } = wrap(
      <StatGrid
        testID="grid"
        cells={[
          { label: 'A', value: '1' },
          { label: 'B', value: '2' },
          { label: 'C', value: '3' },
        ]}
      />,
    );
    const cell0 = StyleSheet.flatten(getByTestId('grid-cell-0').props.style);
    const cell1 = StyleSheet.flatten(getByTestId('grid-cell-1').props.style);
    const cell2 = StyleSheet.flatten(getByTestId('grid-cell-2').props.style);
    expect(cell0.borderLeftWidth).toBeUndefined();
    expect(cell1.borderLeftWidth).toBe(1);
    expect(cell1.borderLeftColor).toBe(colors.line);
    expect(cell2.borderLeftWidth).toBe(1);
    expect(cell2.borderLeftColor).toBe(colors.line);
  });

  it('with divided=false, no borderLeftWidth on any cell', () => {
    const { getByTestId } = wrap(
      <StatGrid
        testID="grid"
        divided={false}
        cells={[
          { label: 'A', value: '1' },
          { label: 'B', value: '2' },
          { label: 'C', value: '3' },
        ]}
      />,
    );
    const cell0 = StyleSheet.flatten(getByTestId('grid-cell-0').props.style);
    const cell1 = StyleSheet.flatten(getByTestId('grid-cell-1').props.style);
    const cell2 = StyleSheet.flatten(getByTestId('grid-cell-2').props.style);
    expect(cell0.borderLeftWidth).toBeUndefined();
    expect(cell1.borderLeftWidth).toBeUndefined();
    expect(cell2.borderLeftWidth).toBeUndefined();
  });

  it('value can be a ReactNode', () => {
    const { getByText } = wrap(
      <StatGrid
        testID="grid"
        cells={[
          { label: 'LAST', value: <RNText>{'42 lb'}</RNText> },
          { label: 'BEST', value: '235' },
          { label: 'CYCLE', value: '3' },
        ]}
      />,
    );
    expect(getByText('42 lb')).toBeTruthy();
  });
});
