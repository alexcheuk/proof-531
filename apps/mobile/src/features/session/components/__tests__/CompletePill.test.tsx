import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { CompletePill } from '../CompletePill';

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}));

describe('CompletePill', () => {
  it('renders the complete session label', () => {
    const screen = wrap(<CompletePill onPress={() => {}} />);
    // textTransform: 'uppercase' is a style prop  -  the underlying string is lowercase
    expect(screen.getByText('Complete session')).toBeTruthy();
  });

  it('has the correct testID', () => {
    const screen = wrap(<CompletePill onPress={() => {}} />);
    expect(screen.getByTestId('session-complete')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const screen = wrap(<CompletePill onPress={onPress} />);
    fireEvent.press(screen.getByTestId('session-complete'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has the correct accessibility role', () => {
    const screen = wrap(<CompletePill onPress={() => {}} />);
    expect(screen.getByTestId('session-complete').props.accessibilityRole).toBe('button');
  });
});
