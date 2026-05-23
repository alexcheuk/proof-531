import { fireEvent, render } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { ThemeProvider } from '../theme';
import { Button } from './Button';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('Button', () => {
  beforeEach(() => {
    (Haptics.impactAsync as jest.Mock).mockClear();
  });

  it('fires onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = renderWithTheme(
      <Button onPress={onPress} testID="btn">
        Go
      </Button>,
    );
    fireEvent.press(getByTestId('btn'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('fires Haptics.impactAsync with light on press', () => {
    const { getByTestId } = renderWithTheme(
      <Button onPress={() => {}} testID="btn">
        Go
      </Button>,
    );
    fireEvent.press(getByTestId('btn'));
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
  });

  it('exposes accessibilityRole="button"', () => {
    const { getByTestId } = renderWithTheme(
      <Button onPress={() => {}} testID="btn">
        Go
      </Button>,
    );
    expect(getByTestId('btn').props.accessibilityRole).toBe('button');
  });

  it('does not fire onPress or haptics when disabled, and reports disabled state', () => {
    const onPress = jest.fn();
    const { getByTestId } = renderWithTheme(
      <Button onPress={onPress} disabled testID="btn">
        Go
      </Button>,
    );
    fireEvent.press(getByTestId('btn'));
    expect(onPress).not.toHaveBeenCalled();
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
    expect(getByTestId('btn').props.accessibilityState).toEqual({ disabled: true });
  });

  it('renders children content', () => {
    const { getByText } = renderWithTheme(<Button onPress={() => {}}>Hello</Button>);
    expect(getByText('Hello')).toBeTruthy();
  });
});
