import { fireEvent, render } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { ThemeProvider } from '../theme';
import { PrimaryPillButton } from './PrimaryPillButton';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('PrimaryPillButton', () => {
  beforeEach(() => {
    (Haptics.impactAsync as jest.Mock).mockClear();
  });

  it('fires onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = renderWithTheme(
      <PrimaryPillButton onPress={onPress} testID="cta">
        Begin
      </PrimaryPillButton>,
    );
    fireEvent.press(getByTestId('cta'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('fires Haptics.impactAsync with light on press', () => {
    const { getByTestId } = renderWithTheme(
      <PrimaryPillButton onPress={() => {}} testID="cta">
        Begin
      </PrimaryPillButton>,
    );
    fireEvent.press(getByTestId('cta'));
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
  });

  it('exposes accessibilityRole="button"', () => {
    const { getByTestId } = renderWithTheme(
      <PrimaryPillButton onPress={() => {}} testID="cta">
        Begin
      </PrimaryPillButton>,
    );
    expect(getByTestId('cta').props.accessibilityRole).toBe('button');
  });

  it('does not fire onPress when disabled, and reports disabled state', () => {
    const onPress = jest.fn();
    const { getByTestId } = renderWithTheme(
      <PrimaryPillButton onPress={onPress} disabled testID="cta">
        Begin
      </PrimaryPillButton>,
    );
    fireEvent.press(getByTestId('cta'));
    expect(onPress).not.toHaveBeenCalled();
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
    expect(getByTestId('cta').props.accessibilityState).toEqual({ disabled: true });
  });

  it('renders the label and the default arrow glyph', () => {
    const { getByText } = renderWithTheme(
      <PrimaryPillButton onPress={() => {}}>Begin</PrimaryPillButton>,
    );
    expect(getByText('Begin')).toBeTruthy();
    expect(getByText('→')).toBeTruthy();
  });

  it('renders a custom glyph when provided', () => {
    const { getByText } = renderWithTheme(
      <PrimaryPillButton onPress={() => {}} glyph="✓">
        Done
      </PrimaryPillButton>,
    );
    expect(getByText('✓')).toBeTruthy();
  });

  it('omits the glyph when glyph={null}', () => {
    const { queryByText } = renderWithTheme(
      <PrimaryPillButton onPress={() => {}} glyph={null}>
        Done
      </PrimaryPillButton>,
    );
    expect(queryByText('→')).toBeNull();
  });

  it('swallows synchronous double-taps (fires onPress only once)', () => {
    const onPress = jest.fn();
    const { getByTestId } = renderWithTheme(
      <PrimaryPillButton onPress={onPress} testID="cta">
        Begin
      </PrimaryPillButton>,
    );
    // Three rapid synchronous taps — happens when a user's finger rebounds.
    fireEvent.press(getByTestId('cta'));
    fireEvent.press(getByTestId('cta'));
    fireEvent.press(getByTestId('cta'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
