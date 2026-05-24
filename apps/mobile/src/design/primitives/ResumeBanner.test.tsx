/**
 * Behavioral test for the ResumeBanner primitive.
 *
 * Asserts the rendered copy + the tap → onResume callback + the accessibility
 * dismiss-action → onDismiss callback. Pixels are out of scope.
 */
import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { ResumeBanner } from './ResumeBanner';

const renderWithTheme = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ResumeBanner', () => {
  it('renders the lift label, IN PROGRESS hint, relative time, and Resume affordance', () => {
    const screen = renderWithTheme(
      <ResumeBanner
        liftLabel="Squat"
        relativeTime="14 min ago"
        onResume={() => {}}
        onDismiss={() => {}}
        testID="resume-banner"
      />,
    );
    expect(screen.getByText('Squat')).toBeTruthy();
    expect(screen.getByText('· IN PROGRESS')).toBeTruthy();
    expect(screen.getByText('14 min ago')).toBeTruthy();
    expect(screen.getByText('Resume →')).toBeTruthy();
    expect(screen.getByText('★')).toBeTruthy();
  });

  it('calls onResume when the band is pressed', () => {
    const onResume = jest.fn();
    const screen = renderWithTheme(
      <ResumeBanner
        liftLabel="Bench"
        relativeTime="1h ago"
        onResume={onResume}
        onDismiss={() => {}}
        testID="resume-banner"
      />,
    );
    fireEvent.press(screen.getByTestId('resume-banner'));
    expect(onResume).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when the dismiss accessibility action fires', () => {
    const onDismiss = jest.fn();
    const screen = renderWithTheme(
      <ResumeBanner
        liftLabel="Deadlift"
        relativeTime="Yesterday"
        onResume={() => {}}
        onDismiss={onDismiss}
        testID="resume-banner"
      />,
    );
    fireEvent(screen.getByTestId('resume-banner'), 'accessibilityAction', {
      nativeEvent: { actionName: 'dismiss' },
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('forwards the composed accessibilityLabel to the outer Pressable', () => {
    const screen = renderWithTheme(
      <ResumeBanner
        liftLabel="Squat"
        relativeTime="just now"
        onResume={() => {}}
        onDismiss={() => {}}
        accessibilityLabel="Resume Squat session, just now"
        testID="resume-banner"
      />,
    );
    expect(screen.getByLabelText('Resume Squat session, just now')).toBeTruthy();
  });
});
