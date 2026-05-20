import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type React from 'react';
import { PRModal } from '../PRModal';

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: 'medium' },
}));

const wrap = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('PRModal', () => {
  it('renders new e1RM, lift label, prior e1RM, and New PR caption', () => {
    const { getByText } = wrap(
      <PRModal liftLabel="Squat" priorE1RM={360} newE1RM={380} unit="lbs" onContinue={() => {}} />,
    );
    expect(getByText('New PR')).toBeTruthy();
    expect(getByText('Squat')).toBeTruthy();
    expect(getByText('was 360 lbs')).toBeTruthy();
  });

  it('fires onContinue when Continue is pressed', () => {
    const onContinue = jest.fn();
    const { getByTestId } = wrap(
      <PRModal
        liftLabel="Bench"
        priorE1RM={215}
        newE1RM={230}
        unit="lbs"
        onContinue={onContinue}
      />,
    );
    fireEvent.press(getByTestId('pr-continue'));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
