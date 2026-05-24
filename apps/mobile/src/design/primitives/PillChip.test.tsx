import { fireEvent, render } from '@testing-library/react-native';
import { ThemeProvider } from '../theme';
import { PillChip } from './PillChip';

function renderWithTheme(node: React.ReactNode) {
  return render(<ThemeProvider>{node}</ThemeProvider>);
}

describe('PillChip', () => {
  it('renders the label', () => {
    const { getByText } = renderWithTheme(
      <PillChip label="All" selected={false} onPress={() => {}} testID="c" />,
    );
    expect(getByText('All')).toBeTruthy();
  });

  it('fires onPress', () => {
    const onPress = jest.fn();
    const { getByTestId } = renderWithTheme(
      <PillChip label="All" selected={false} onPress={onPress} testID="c" />,
    );
    fireEvent.press(getByTestId('c'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('marks selected via accessibilityState.selected', () => {
    const { getByTestId } = renderWithTheme(
      <PillChip label="All" selected onPress={() => {}} testID="c" />,
    );
    expect(getByTestId('c').props.accessibilityState).toEqual({ selected: true });
  });

  it('forwards a custom accessibilityLabel when provided', () => {
    const { getByTestId } = renderWithTheme(
      <PillChip
        label="✕ Clear"
        selected={false}
        onPress={() => {}}
        testID="c"
        accessibilityLabel="Clear filter"
      />,
    );
    expect(getByTestId('c').props.accessibilityLabel).toBe('Clear filter');
  });

  it('composes a default a11y label when none provided', () => {
    const { getByTestId } = renderWithTheme(
      <PillChip label="Squat" selected onPress={() => {}} testID="c" />,
    );
    expect(getByTestId('c').props.accessibilityLabel).toBe('Filter: Squat, selected');
  });

  it('applies dashed border for ghost tone', () => {
    const { getByTestId } = renderWithTheme(
      <PillChip label="Clear" selected={false} tone="ghost" onPress={() => {}} testID="c" />,
    );
    const style = getByTestId('c').props.style;
    // Style is a function (Pressable callback) — invoke it with pressed=false
    // to get the flattened resolved style.
    const resolved = typeof style === 'function' ? style({ pressed: false }) : style;
    const flat = Array.isArray(resolved)
      ? Object.assign({}, ...resolved.filter(Boolean))
      : resolved;
    expect(flat.borderStyle).toBe('dashed');
  });
});
