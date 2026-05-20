import { render } from '@testing-library/react-native';
import { Text as RNText } from 'react-native';
import { colors, shape } from '../../tokens';
import { Box } from '../Box';

describe('Box', () => {
  it('renders children', () => {
    const { getByText } = render(
      <Box>
        <RNText>hello</RNText>
      </Box>,
    );
    expect(getByText('hello')).toBeTruthy();
  });

  it('applies token-derived padding, radius, bg, and gap', () => {
    const { getByTestId } = render(
      <Box testID="box" padding="rMd" margin="rSm" gap="rSm" radius="rLg" bg="bg1" />,
    );
    const node = getByTestId('box');
    expect(node.props.style).toEqual(
      expect.objectContaining({
        padding: shape.rMd,
        margin: shape.rSm,
        gap: shape.rSm,
        borderRadius: shape.rLg,
        backgroundColor: colors.bg1,
      }),
    );
  });

  it('applies a 1px border when borderColor is set', () => {
    const { getByTestId } = render(<Box testID="box" borderColor="line" />);
    const node = getByTestId('box');
    expect(node.props.style).toEqual(
      expect.objectContaining({
        borderColor: colors.line,
        borderWidth: 1,
      }),
    );
  });
});
