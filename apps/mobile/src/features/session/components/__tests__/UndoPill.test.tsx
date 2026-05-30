import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { UndoPill } from '../UndoPill';

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}));

describe('UndoPill', () => {
  it('renders the undo label', () => {
    const screen = wrap(<UndoPill onPress={() => {}} />);
    expect(screen.getByText(/UNDO/i)).toBeTruthy();
  });

  it('has the correct testID', () => {
    const screen = wrap(<UndoPill onPress={() => {}} />);
    expect(screen.getByTestId('session-undo')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const screen = wrap(<UndoPill onPress={onPress} />);
    fireEvent.press(screen.getByTestId('session-undo'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has the correct accessibility role', () => {
    const screen = wrap(<UndoPill onPress={() => {}} />);
    expect(screen.getByTestId('session-undo').props.accessibilityRole).toBe('button');
  });
});
