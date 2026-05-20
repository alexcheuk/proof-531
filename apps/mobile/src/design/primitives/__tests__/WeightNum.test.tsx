import { render } from '@testing-library/react-native';
import { colors, type } from '../../tokens';
import { WeightNum } from '../WeightNum';

describe('WeightNum', () => {
  it('renders the numeric value', () => {
    const { getByText } = render(<WeightNum value={225} />);
    expect(getByText('225')).toBeTruthy();
  });

  it('renders string values verbatim', () => {
    const { getByText } = render(<WeightNum value="—" />);
    expect(getByText('—')).toBeTruthy();
  });

  it('applies default (md) sizing: mono, 22px/500, -0.88 letter-spacing, tabular-nums, ink0', () => {
    const { getByText } = render(<WeightNum value={100} />);
    const node = getByText('100');
    expect(node.props.style).toEqual(
      expect.objectContaining({
        fontFamily: type.mono,
        fontSize: 22,
        fontWeight: '500',
        letterSpacing: -22 * 0.04,
        color: colors.ink0,
        fontVariant: ['tabular-nums'],
      }),
    );
  });

  it('applies sm sizing (14px)', () => {
    const { getByText } = render(<WeightNum value={50} size="sm" />);
    const node = getByText('50');
    expect(node.props.style).toEqual(
      expect.objectContaining({
        fontSize: 14,
        letterSpacing: -14 * 0.04,
      }),
    );
  });

  it('applies lg sizing (36px)', () => {
    const { getByText } = render(<WeightNum value={315} size="lg" />);
    const node = getByText('315');
    expect(node.props.style).toEqual(
      expect.objectContaining({
        fontSize: 36,
        letterSpacing: -36 * 0.04,
      }),
    );
  });
});
