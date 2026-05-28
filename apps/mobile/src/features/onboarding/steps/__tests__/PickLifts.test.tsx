/**
 * Behavioral tests for the PickLifts onboarding step.
 *
 * Covers the dashed callout copy + dynamic CTA copy paths from the
 * PWA spec.
 *
 * Mocks:
 *  - `expo-haptics`                       — silence native binding
 *  - `react-native-safe-area-context`    — stable insets in jest
 */
import { ThemeProvider } from '@/design/theme';
import type { Lift } from '@/domain/types';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  // biome-ignore lint/suspicious/noExplicitAny: trivial test provider stub
  SafeAreaProvider: ({ children }: any) => children,
}));

// Import after mocks so the module sees the mocked dependencies.
import { PickLifts } from '../PickLifts';

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

const renderPickLifts = (enabled: Lift[]) =>
  wrap(
    <PickLifts
      enabled={enabled}
      unit="lbs"
      onToggle={() => {}}
      onBack={() => {}}
      onNext={() => {}}
    />,
  );

describe('PickLifts', () => {
  it('shows plural callout + plural CTA copy when all four lifts are selected', () => {
    const screen = renderPickLifts(['squat', 'bench', 'deadlift', 'press']);

    expect(screen.getByText('4 lifts · 16 sessions per cycle')).toBeTruthy();
    expect(screen.getByText('Continue · 4 lifts')).toBeTruthy();
  });

  it('shows single-lift callout + singular CTA copy when only one lift is selected', () => {
    const screen = renderPickLifts(['squat']);

    expect(screen.getByText('Single-lift focus · 4 sessions per cycle')).toBeTruthy();
    expect(screen.getByText('Continue · 1 lift')).toBeTruthy();
  });
});
