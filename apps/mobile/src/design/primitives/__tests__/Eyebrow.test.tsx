import { render } from '@testing-library/react-native';
import { colors, type } from '../../tokens';
import { Eyebrow } from '../Eyebrow';

describe('Eyebrow', () => {
  it('renders children', () => {
    const { getByText } = render(<Eyebrow>tag</Eyebrow>);
    expect(getByText('tag')).toBeTruthy();
  });

  it('applies token-derived style: mono, 11px/500, letter-spacing 1.76, uppercase, ink2', () => {
    const { getByText } = render(<Eyebrow>tag</Eyebrow>);
    const node = getByText('tag');
    expect(node.props.style).toEqual(
      expect.objectContaining({
        fontFamily: type.mono,
        fontSize: 11,
        fontWeight: '500',
        letterSpacing: 1.76,
        textTransform: 'uppercase',
        color: colors.ink2,
      }),
    );
  });
});
