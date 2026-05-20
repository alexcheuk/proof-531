import { render } from '@testing-library/react-native';
import type React from 'react';
import { ThemeProvider } from '../../theme';
import { colors, type } from '../../tokens';
import { Text } from '../Text';

const wrap = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('Text', () => {
  it('renders children', () => {
    const { getByText } = wrap(<Text>hello</Text>);
    expect(getByText('hello')).toBeTruthy();
  });

  it('applies default variant + tone (ink0, 15px/400, sans family)', () => {
    const { getByText } = wrap(<Text>hi</Text>);
    const node = getByText('hi');
    expect(node.props.style).toEqual(
      expect.objectContaining({
        fontFamily: type.sans,
        fontSize: 15,
        fontWeight: '400',
        color: colors.ink0,
      }),
    );
  });

  it('applies the title variant sizing', () => {
    const { getByText } = wrap(<Text variant="title">hi</Text>);
    const node = getByText('hi');
    expect(node.props.style).toEqual(
      expect.objectContaining({
        fontSize: 28,
        fontWeight: '600',
        letterSpacing: -0.5,
      }),
    );
  });

  it('applies the hot tone using the theme accent (so accent overrides flow through)', () => {
    const { getByText } = wrap(<Text tone="hot">hi</Text>);
    const node = getByText('hi');
    expect(node.props.style).toEqual(expect.objectContaining({ color: colors.hot }));
  });

  it('applies the lime tone via tokens', () => {
    const { getByText } = wrap(<Text tone="lime">hi</Text>);
    const node = getByText('hi');
    expect(node.props.style).toEqual(expect.objectContaining({ color: colors.lime }));
  });
});
