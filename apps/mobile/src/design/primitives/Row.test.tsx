import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ThemeProvider } from '../theme';
import { Row } from './Row';

function renderWithTheme(node: React.ReactNode) {
  return render(<ThemeProvider>{node}</ThemeProvider>);
}

describe('Row', () => {
  it('defaults to row + center alignment', () => {
    const { getByTestId } = renderWithTheme(
      <Row testID="row">
        <Text>hi</Text>
      </Row>,
    );
    const style = getByTestId('row').props.style;
    const flat = Array.isArray(style) ? Object.assign({}, ...style) : style;
    expect(flat.flexDirection).toBe('row');
    expect(flat.alignItems).toBe('center');
  });

  it('applies gap from spacing token', () => {
    const { getByTestId } = renderWithTheme(
      <Row testID="row" gap="md">
        <Text>a</Text>
      </Row>,
    );
    const style = getByTestId('row').props.style;
    const flat = Array.isArray(style) ? Object.assign({}, ...style) : style;
    expect(flat.gap).toBe(12);
  });

  it('honors justify + wrap', () => {
    const { getByTestId } = renderWithTheme(
      <Row testID="row" justify="space-between" wrap>
        <Text>a</Text>
      </Row>,
    );
    const style = getByTestId('row').props.style;
    const flat = Array.isArray(style) ? Object.assign({}, ...style) : style;
    expect(flat.justifyContent).toBe('space-between');
    expect(flat.flexWrap).toBe('wrap');
  });
});
