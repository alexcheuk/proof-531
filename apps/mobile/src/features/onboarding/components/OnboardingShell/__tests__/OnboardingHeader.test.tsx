import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { OnboardingHeader } from '../OnboardingHeader';

const renderHeader = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('OnboardingHeader', () => {
  it('renders the wordmark on the first step (no onBack)', () => {
    const screen = renderHeader(<OnboardingHeader />);
    expect(screen.getByText('531')).toBeTruthy();
    expect(screen.queryByTestId('onboarding-back')).toBeNull();
  });

  it('renders the back chip when onBack is provided', () => {
    const onBack = jest.fn();
    const screen = renderHeader(<OnboardingHeader onBack={onBack} />);
    const back = screen.getByTestId('onboarding-back');
    expect(back).toBeTruthy();
    expect(back.props.accessibilityLabel).toBe('Back');
    fireEvent.press(back);
    expect(onBack).toHaveBeenCalledTimes(1);
    // When onBack is supplied, the wordmark is replaced by the chip.
    expect(screen.queryByText('531')).toBeNull();
  });

  it('omits the step counter when only one of step/total is provided', () => {
    const a = renderHeader(<OnboardingHeader step={2} />);
    expect(a.queryByText(/02 \/ \d+/)).toBeNull();

    const b = renderHeader(<OnboardingHeader total={4} />);
    expect(b.queryByText(/\d+ \/ 04/)).toBeNull();
  });

  it('renders the step counter zero-padded to 2 digits', () => {
    const screen = renderHeader(<OnboardingHeader step={3} total={4} />);
    expect(screen.getByText('03 / 04')).toBeTruthy();
  });

  it('renders the supplied label as a caps eyebrow', () => {
    const screen = renderHeader(<OnboardingHeader label="Setup · review" />);
    expect(screen.getByText('Setup · review')).toBeTruthy();
  });
});
