import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { Text } from 'react-native';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  // biome-ignore lint/suspicious/noExplicitAny: trivial provider stub
  SafeAreaProvider: ({ children }: any) => children,
}));

import { OnboardingShell } from '../OnboardingShell';

const renderShell = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('OnboardingShell', () => {
  it('renders children inside the shell', () => {
    const screen = renderShell(
      <OnboardingShell>
        <Text testID="step-body">step body</Text>
      </OnboardingShell>,
    );
    expect(screen.getByTestId('step-body')).toBeTruthy();
  });

  it('renders the footer slot when provided', () => {
    const screen = renderShell(
      <OnboardingShell footer={<Text testID="footer-cta">Begin</Text>}>
        <Text>x</Text>
      </OnboardingShell>,
    );
    expect(screen.getByTestId('footer-cta')).toBeTruthy();
  });

  it('omits the footer when not provided', () => {
    const screen = renderShell(
      <OnboardingShell>
        <Text>x</Text>
      </OnboardingShell>,
    );
    expect(screen.queryByTestId('footer-cta')).toBeNull();
  });

  it('renders the back chip when onBack is provided', () => {
    const onBack = jest.fn();
    const screen = renderShell(
      <OnboardingShell onBack={onBack}>
        <Text>x</Text>
      </OnboardingShell>,
    );
    expect(screen.getByTestId('onboarding-back')).toBeTruthy();
    fireEvent.press(screen.getByTestId('onboarding-back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('renders the 531. wordmark when no onBack is supplied (step 1)', () => {
    const screen = renderShell(
      <OnboardingShell>
        <Text>x</Text>
      </OnboardingShell>,
    );
    expect(screen.queryByTestId('onboarding-back')).toBeNull();
    expect(screen.getByText('531')).toBeTruthy();
  });

  it('renders the NN / MM step counter when step + total are provided', () => {
    const screen = renderShell(
      <OnboardingShell step={2} total={4}>
        <Text>x</Text>
      </OnboardingShell>,
    );
    expect(screen.getByText('02 / 04')).toBeTruthy();
  });

  it('renders the small caps label next to the back chip', () => {
    const screen = renderShell(
      <OnboardingShell onBack={() => {}} label="Setup · step 02 of 04">
        <Text>x</Text>
      </OnboardingShell>,
    );
    expect(screen.getByText('Setup · step 02 of 04')).toBeTruthy();
  });
});
