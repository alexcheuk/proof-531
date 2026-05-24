import { render } from '@testing-library/react-native';
import type { TextStyle } from 'react-native';
import { ThemeProvider } from '../theme';
import { CapsLabel } from './CapsLabel';

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

/**
 * RN style props can be a value, an array, or an array of arrays. Recursively
 * flatten so the assertion can look up a key without caring about the shape
 * `Text` happens to use this week.
 */
function flatten(style: unknown): Record<string, unknown> {
  if (style == null) return {};
  if (Array.isArray(style)) return Object.assign({}, ...style.map(flatten));
  return style as Record<string, unknown>;
}

function readStyle(node: { props: { style?: unknown } }): TextStyle {
  return flatten(node.props.style) as TextStyle;
}

describe('CapsLabel', () => {
  it('renders children uppercased via textTransform', () => {
    const { getByTestId } = renderWithTheme(<CapsLabel testID="caps">settings</CapsLabel>);
    expect(readStyle(getByTestId('caps')).textTransform).toBe('uppercase');
  });

  it('defaults to the sm size preset (10/2.2)', () => {
    const { getByTestId } = renderWithTheme(<CapsLabel testID="caps">settings</CapsLabel>);
    const flatStyle = readStyle(getByTestId('caps'));
    expect(flatStyle.fontSize).toBe(10);
    expect(flatStyle.letterSpacing).toBe(2.2);
  });

  it('honors size + weight overrides', () => {
    const { getByTestId } = renderWithTheme(
      <CapsLabel testID="caps" size="md" weight="bold">
        history
      </CapsLabel>,
    );
    const flatStyle = readStyle(getByTestId('caps'));
    expect(flatStyle.fontSize).toBe(11);
    expect(flatStyle.fontFamily).toBe('IBMPlexMono-Bold');
  });
});
