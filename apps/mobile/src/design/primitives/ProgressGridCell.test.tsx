import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import { ProgressGridCell } from './ProgressGridCell';

const wrap = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ProgressGridCell', () => {
  it('renders weight + ×reps on past cells', () => {
    const { getByText } = wrap(
      <ProgressGridCell variant="filled" weight={230} reps={3} onPress={jest.fn()} />,
    );
    expect(getByText('230')).toBeTruthy();
    expect(getByText('×3')).toBeTruthy();
  });

  it('fires onPress on past (interactive) cells', () => {
    const onPress = jest.fn();
    const { getByTestId } = wrap(
      <ProgressGridCell
        variant="filled"
        weight={230}
        reps={3}
        onPress={onPress}
        testID="cell-past"
      />,
    );
    fireEvent.press(getByTestId('cell-past'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders a non-Pressable view when onPress is omitted (future cells)', () => {
    const { getByTestId } = wrap(
      <ProgressGridCell variant="ghosted" weight={250} testID="cell-future" />,
    );
    const node = getByTestId('cell-future');
    // accessibilityRole on the cell — future cells are 'text', not 'button'.
    expect(node.props.accessibilityRole).toBe('text');
  });

  it('renders the deload marker ✓ in place of reps', () => {
    const { getByText, queryByText } = wrap(
      <ProgressGridCell variant="filled" weight={140} marker="✓" onPress={jest.fn()} />,
    );
    expect(getByText('✓')).toBeTruthy();
    expect(queryByText(/×/)).toBeNull();
  });
});
