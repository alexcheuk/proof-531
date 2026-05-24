import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ThemeProvider } from '../theme';
import { Card } from './Card';

function renderWithTheme(node: React.ReactNode) {
  return render(<ThemeProvider>{node}</ThemeProvider>);
}

function flat(node: { props: { style: unknown } }) {
  const s = node.props.style;
  return Array.isArray(s) ? Object.assign({}, ...s) : s;
}

describe('Card', () => {
  it('renders a 1-px ink border by default', () => {
    const { getByTestId } = renderWithTheme(
      <Card testID="c">
        <Text>x</Text>
      </Card>,
    );
    const s = flat(getByTestId('c'));
    expect(s.borderWidth).toBe(1);
    expect(s.borderColor).toBe('rgba(26, 24, 18, 0.16)'); // colors.line
  });

  it('switches to the strong border token when tone="strong"', () => {
    const { getByTestId } = renderWithTheme(
      <Card testID="c" tone="strong">
        <Text>x</Text>
      </Card>,
    );
    const s = flat(getByTestId('c'));
    expect(s.borderColor).toBe('rgba(26, 24, 18, 0.42)'); // colors.lineStrong
  });

  it('applies dashed borderStyle for tone="dashed"', () => {
    const { getByTestId } = renderWithTheme(
      <Card testID="c" tone="dashed">
        <Text>x</Text>
      </Card>,
    );
    const s = flat(getByTestId('c'));
    expect(s.borderStyle).toBe('dashed');
  });

  it('resolves spacing tokens', () => {
    const { getByTestId } = renderWithTheme(
      <Card testID="c" padding="md" bg="bg2">
        <Text>x</Text>
      </Card>,
    );
    const s = flat(getByTestId('c'));
    expect(s.padding).toBe(12);
    expect(s.backgroundColor).toBe('#D2CEC0');
  });
});
