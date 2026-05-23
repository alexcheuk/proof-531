import { fireEvent, render } from '@testing-library/react-native';
import { ThemeProvider } from '../theme';
import { CheckboxLedger } from './CheckboxLedger';

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('CheckboxLedger', () => {
  it('exposes accessibilityRole="checkbox"', () => {
    const { getByTestId } = renderWithTheme(<CheckboxLedger checked={false} testID="cb" />);
    expect(getByTestId('cb').props.accessibilityRole).toBe('checkbox');
  });

  it('reflects checked=true in accessibilityState', () => {
    const { getByTestId } = renderWithTheme(<CheckboxLedger checked={true} testID="cb" />);
    expect(getByTestId('cb').props.accessibilityState.checked).toBe(true);
  });

  it('reflects checked=false in accessibilityState', () => {
    const { getByTestId } = renderWithTheme(<CheckboxLedger checked={false} testID="cb" />);
    expect(getByTestId('cb').props.accessibilityState.checked).toBe(false);
  });

  it('reflects disabled prop in accessibilityState', () => {
    const { getByTestId } = renderWithTheme(
      <CheckboxLedger checked={false} disabled testID="cb" />,
    );
    expect(getByTestId('cb').props.accessibilityState.disabled).toBe(true);
  });

  it('fires onChange with negated value when pressed (false → true)', () => {
    const onChange = jest.fn();
    const { getByTestId } = renderWithTheme(
      <CheckboxLedger checked={false} onChange={onChange} testID="cb" />,
    );
    fireEvent.press(getByTestId('cb'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('fires onChange with negated value when pressed (true → false)', () => {
    const onChange = jest.fn();
    const { getByTestId } = renderWithTheme(
      <CheckboxLedger checked={true} onChange={onChange} testID="cb" />,
    );
    fireEvent.press(getByTestId('cb'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('does NOT fire onChange when disabled', () => {
    const onChange = jest.fn();
    const { getByTestId } = renderWithTheme(
      <CheckboxLedger checked={false} disabled onChange={onChange} testID="cb" />,
    );
    fireEvent.press(getByTestId('cb'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders ✓ glyph when checked', () => {
    const { getByText } = renderWithTheme(<CheckboxLedger checked={true} />);
    expect(getByText('✓')).toBeTruthy();
  });

  it('does not render ✓ glyph when unchecked', () => {
    const { queryByText } = renderWithTheme(<CheckboxLedger checked={false} />);
    expect(queryByText('✓')).toBeNull();
  });
});
