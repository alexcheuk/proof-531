/**
 * Behavioral test for LiftTabs.
 *
 * Verifies:
 *  - Each enabled lift renders a tappable tab (`lift-tab-<lift>` testID).
 *  - The 5×5 in-progress dot appears ONLY next to the lift named by
 *    `inProgressLift` and is absent for every other tab.
 *  - Tapping a non-active tab calls `onSelect(lift)` with the tapped lift.
 */
import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { LiftTabs } from '../LiftTabs';

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

const renderWithTheme = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('LiftTabs', () => {
  it('renders all enabled lift labels', () => {
    const { getByTestId } = renderWithTheme(
      <LiftTabs
        enabled={['squat', 'bench', 'deadlift', 'press']}
        selected="squat"
        inProgressLift={null}
        onSelect={() => {}}
      />,
    );
    expect(getByTestId('lift-tab-squat')).toBeTruthy();
    expect(getByTestId('lift-tab-bench')).toBeTruthy();
    expect(getByTestId('lift-tab-deadlift')).toBeTruthy();
    expect(getByTestId('lift-tab-press')).toBeTruthy();
  });

  it('shows the in-progress dot ONLY next to the in-progress lift', () => {
    const { getByTestId, queryByTestId } = renderWithTheme(
      <LiftTabs
        enabled={['squat', 'bench', 'deadlift', 'press']}
        selected="squat"
        inProgressLift="bench"
        onSelect={() => {}}
      />,
    );
    expect(getByTestId('lift-tab-bench-progress-dot')).toBeTruthy();
    expect(queryByTestId('lift-tab-squat-progress-dot')).toBeNull();
    expect(queryByTestId('lift-tab-deadlift-progress-dot')).toBeNull();
    expect(queryByTestId('lift-tab-press-progress-dot')).toBeNull();
  });

  it('renders no in-progress dots when inProgressLift is null', () => {
    const { queryByTestId } = renderWithTheme(
      <LiftTabs
        enabled={['squat', 'bench', 'deadlift', 'press']}
        selected="squat"
        inProgressLift={null}
        onSelect={() => {}}
      />,
    );
    expect(queryByTestId('lift-tab-squat-progress-dot')).toBeNull();
    expect(queryByTestId('lift-tab-bench-progress-dot')).toBeNull();
    expect(queryByTestId('lift-tab-deadlift-progress-dot')).toBeNull();
    expect(queryByTestId('lift-tab-press-progress-dot')).toBeNull();
  });

  it('calls onSelect with the tapped lift', () => {
    const onSelect = jest.fn();
    const { getByTestId } = renderWithTheme(
      <LiftTabs
        enabled={['squat', 'bench']}
        selected="squat"
        inProgressLift={null}
        onSelect={onSelect}
      />,
    );
    fireEvent.press(getByTestId('lift-tab-bench'));
    expect(onSelect).toHaveBeenCalledWith('bench');
  });
});
