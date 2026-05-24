import { render } from '@testing-library/react-native';
import { ThemeProvider } from '../theme';
import { Heading } from './Heading';

function renderWithTheme(node: React.ReactNode) {
  return render(<ThemeProvider>{node}</ThemeProvider>);
}

function flatStyle(node: { props: { style: unknown } }) {
  const style = node.props.style;
  return Array.isArray(style) ? Object.assign({}, ...style) : style;
}

describe('Heading', () => {
  it('renders children', () => {
    const { getByText } = renderWithTheme(<Heading>Hello</Heading>);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('applies the m variant fontSize + letter-spacing by default', () => {
    const { getByTestId } = renderWithTheme(<Heading testID="h">x</Heading>);
    const style = flatStyle(getByTestId('h'));
    expect(style.fontSize).toBe(26);
    expect(style.letterSpacing).toBe(-0.78);
    expect(style.fontFamily).toMatch(/-Bold$/);
  });

  it('honors size variants', () => {
    const { getByTestId } = renderWithTheme(
      <Heading testID="h" size="huge">
        92
      </Heading>,
    );
    const style = flatStyle(getByTestId('h'));
    expect(style.fontSize).toBe(92);
    expect(style.letterSpacing).toBe(-4.6);
    expect(style.lineHeight).toBe(90);
  });

  it('switches to Medium weight when requested', () => {
    const { getByTestId } = renderWithTheme(
      <Heading testID="h" weight="medium">
        x
      </Heading>,
    );
    const style = flatStyle(getByTestId('h'));
    expect(style.fontFamily).toMatch(/-Medium$/);
  });

  it('applies tabular-nums when numeric', () => {
    const { getByTestId } = renderWithTheme(
      <Heading testID="h" numeric>
        92
      </Heading>,
    );
    const style = flatStyle(getByTestId('h'));
    expect(style.fontVariant).toEqual(['tabular-nums', 'lining-nums']);
  });

  it('respects lineHeight override', () => {
    const { getByTestId } = renderWithTheme(
      <Heading testID="h" lineHeight={120}>
        x
      </Heading>,
    );
    const style = flatStyle(getByTestId('h'));
    expect(style.lineHeight).toBe(120);
  });
});
