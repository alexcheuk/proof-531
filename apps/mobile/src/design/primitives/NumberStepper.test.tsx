import { fireEvent, render } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { ThemeProvider } from '../theme';
import { NumberStepper } from './NumberStepper';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('NumberStepper', () => {
  beforeEach(() => {
    (Haptics.impactAsync as jest.Mock).mockClear();
  });

  it('renders the current value', () => {
    const { getByText } = renderWithTheme(
      <NumberStepper value={185} onChange={() => {}} testID="ns" />,
    );
    expect(getByText('185')).toBeTruthy();
  });

  it('fires onChange with value+step and light haptic on +', () => {
    const onChange = jest.fn();
    const { getByTestId } = renderWithTheme(
      <NumberStepper value={185} onChange={onChange} step={5} testID="ns" />,
    );
    fireEvent.press(getByTestId('ns-plus'));
    expect(onChange).toHaveBeenCalledWith(190);
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
  });

  it('fires onChange with value-step and light haptic on −', () => {
    const onChange = jest.fn();
    const { getByTestId } = renderWithTheme(
      <NumberStepper value={185} onChange={onChange} step={5} testID="ns" />,
    );
    fireEvent.press(getByTestId('ns-minus'));
    expect(onChange).toHaveBeenCalledWith(180);
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
  });

  it('clamps decrement at min', () => {
    const onChange = jest.fn();
    const { getByTestId } = renderWithTheme(
      <NumberStepper value={0} onChange={onChange} min={0} step={1} testID="ns" />,
    );
    fireEvent.press(getByTestId('ns-minus'));
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('clamps increment at max', () => {
    const onChange = jest.fn();
    const { getByTestId } = renderWithTheme(
      <NumberStepper value={30} onChange={onChange} max={30} step={1} testID="ns" />,
    );
    fireEvent.press(getByTestId('ns-plus'));
    expect(onChange).toHaveBeenCalledWith(30);
  });

  it('renders optional label and unit', () => {
    const { getByText } = renderWithTheme(
      <NumberStepper value={185} onChange={() => {}} label="Training max" unit="kg" testID="ns" />,
    );
    expect(getByText('Training max')).toBeTruthy();
    expect(getByText('kg')).toBeTruthy();
  });

  it('maps unit "lbs" to "lb" in display', () => {
    const { getByText, queryByText } = renderWithTheme(
      <NumberStepper value={185} onChange={() => {}} unit="lbs" testID="ns" />,
    );
    expect(getByText('lb')).toBeTruthy();
    expect(queryByText('lbs')).toBeNull();
  });

  it('forwards accessibilityLabel for + and − buttons', () => {
    const { getByTestId } = renderWithTheme(
      <NumberStepper
        value={5}
        onChange={() => {}}
        accessibilityLabelDecrement="Decrease reps"
        accessibilityLabelIncrement="Increase reps"
        testID="ns"
      />,
    );
    expect(getByTestId('ns-minus').props.accessibilityLabel).toBe('Decrease reps');
    expect(getByTestId('ns-plus').props.accessibilityLabel).toBe('Increase reps');
  });
});
