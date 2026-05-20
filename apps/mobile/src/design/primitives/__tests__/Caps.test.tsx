import { render } from '@testing-library/react-native';
import { colors, type } from '../../tokens';
import { Caps } from '../Caps';

describe('Caps', () => {
  it('renders children', () => {
    const { getByText } = render(<Caps>label</Caps>);
    expect(getByText('label')).toBeTruthy();
  });

  it('applies token-derived style: mono, 10px/600, letter-spacing 1.8, uppercase, ink2', () => {
    const { getByText } = render(<Caps>label</Caps>);
    const node = getByText('label');
    expect(node.props.style).toEqual(
      expect.objectContaining({
        fontFamily: type.mono,
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 1.8,
        textTransform: 'uppercase',
        color: colors.ink2,
      }),
    );
  });
});
