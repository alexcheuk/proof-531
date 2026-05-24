import { render } from '@testing-library/react-native';
import { ThemeProvider } from '../theme';
import { Divider } from './Divider';

function flat(node: { props: { style: unknown } }) {
  const s = node.props.style;
  return Array.isArray(s) ? Object.assign({}, ...s) : s;
}

function renderWithTheme(node: React.ReactNode) {
  return render(<ThemeProvider>{node}</ThemeProvider>);
}

describe('Divider', () => {
  it('renders a 1px hairline using the line token by default', () => {
    const { getByTestId } = renderWithTheme(<Divider testID="d" />);
    const style = flat(getByTestId('d'));
    expect(style.height).toBe(1);
    expect(style.backgroundColor).toBe('rgba(26, 24, 18, 0.16)'); // colors.line
  });

  it('switches to the strong line token when tone="strong"', () => {
    const { getByTestId } = renderWithTheme(<Divider testID="d" tone="strong" />);
    const style = flat(getByTestId('d'));
    expect(style.backgroundColor).toBe('rgba(26, 24, 18, 0.42)'); // colors.lineStrong
  });

  it('forwards style overrides', () => {
    const { getByTestId } = renderWithTheme(<Divider testID="d" style={{ marginTop: 12 }} />);
    const style = flat(getByTestId('d'));
    expect(style.marginTop).toBe(12);
  });
});
