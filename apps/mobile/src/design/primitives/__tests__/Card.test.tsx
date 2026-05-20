import { fireEvent, render } from '@testing-library/react-native';
import { Text as RNText } from 'react-native';
import { colors, shape } from '../../tokens';
import { Card } from '../Card';

const flatten = (s: unknown): Record<string, unknown> =>
  (Array.isArray(s) ? Object.assign({}, ...s) : s) as Record<string, unknown>;

describe('Card', () => {
  it('renders children inside a bg1 container with rMd radius, line border, padding=rMd', () => {
    const { getByTestId, getByText } = render(
      <Card testID="card">
        <RNText>body</RNText>
      </Card>,
    );
    expect(getByText('body')).toBeTruthy();
    const style = flatten(getByTestId('card').props.style);
    expect(style).toEqual(
      expect.objectContaining({
        backgroundColor: colors.bg1,
        borderColor: colors.line,
        borderWidth: 1,
        borderRadius: shape.rMd,
        padding: shape.rMd,
      }),
    );
  });

  it('omits padding when padded={false}', () => {
    const { getByTestId } = render(<Card testID="card" padded={false} />);
    expect(flatten(getByTestId('card').props.style).padding).toBeUndefined();
  });

  it('when interactive with onPress, exposes role=button and fires onPress', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <Card interactive onPress={onPress}>
        <RNText>tap</RNText>
      </Card>,
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('without onPress, does not expose role=button', () => {
    const { queryByRole } = render(
      <Card>
        <RNText>static</RNText>
      </Card>,
    );
    expect(queryByRole('button')).toBeNull();
  });
});
