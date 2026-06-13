/**
 * End-to-end behavioral test for the onboarding wizard.
 *
 * Walks all four steps with default inputs and asserts that the final
 * Start press invokes `completeOnboarding` with the expected payload and
 * routes to `/`.
 *
 * Mocks:
 *  - `expo-router` `useRouter`            -  capture `replace` calls
 *  - `expo-haptics`                        -  silence native binding
 *  - `@/data/accessors/onboarding`        -  capture accessor args
 *  - `@/data/DbProvider` `useDb`          -  return a stub `{}`
 *  - `@/data/queries/useSettings`         -  return `{ data: undefined }`
 *  - `react-native-safe-area-context`     -  stable insets in jest
 */
import { ThemeProvider } from '@/design/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import type { ReactElement } from 'react';

const mockReplace = jest.fn();
const mockCompleteOnboarding = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
}));

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

jest.mock('@/data/DbProvider', () => ({
  useDb: () => ({}),
}));

jest.mock('@/data/queries/useSettings', () => ({
  useSettings: () => ({ data: undefined, isLoading: false, error: null }),
}));

jest.mock('@/data/accessors/onboarding', () => ({
  completeOnboarding: (...args: unknown[]) => mockCompleteOnboarding(...args),
}));

// Import after mocks so the module sees the mocked dependencies.
import { OnboardingScreen } from '../OnboardingScreen';

const renderScreen = (ui: ReactElement) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ThemeProvider>{ui}</ThemeProvider>
    </QueryClientProvider>,
  );
};

describe('OnboardingScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockCompleteOnboarding.mockClear();
    mockCompleteOnboarding.mockResolvedValue(undefined);
  });

  it('walks all four steps and invokes completeOnboarding with the entered data', async () => {
    const screen = renderScreen(<OnboardingScreen />);

    // Step 1  -  Intro. Press Begin.
    fireEvent.press(screen.getByTestId('onboarding-begin'));

    // Step 2  -  PickLifts. Default state has all four lifts enabled. Press Next.
    fireEvent.press(screen.getByTestId('onboarding-picklifts-next'));

    // Step 3  -  OneRmEntry. The wizard renders four screens, one per
    // enabled lift, with sensible defaults preloaded. Press Next on each.
    for (let i = 0; i < 4; i++) {
      fireEvent.press(screen.getByTestId('onboarding-onerm-next'));
    }

    // Step 4  -  Review. Press Start.
    await act(async () => {
      fireEvent.press(screen.getByTestId('onboarding-finish'));
    });

    await waitFor(() => {
      expect(mockCompleteOnboarding).toHaveBeenCalledTimes(1);
    });

    const [, input] = mockCompleteOnboarding.mock.calls[0] as [
      unknown,
      {
        unit: 'lbs' | 'kg';
        enabledLifts: string[];
        oneRMs: Record<string, number>;
      },
    ];

    expect(input.unit).toBe('lbs');
    expect(input.enabledLifts).toEqual(['squat', 'bench', 'deadlift', 'press']);
    // Epley(weight, reps): w * (1 + r/30) → plate-snapped to nearest 5 lb
    // (same rounding as all other e1RM display sites  -  expedition 61 fix).
    // Defaults: squat 225×5, bench 185×5, deadlift 275×5, press 115×5.
    expect(input.oneRMs.squat).toBe(265); // 262.5 → 265
    expect(input.oneRMs.bench).toBe(215); // 215.83 → 215
    expect(input.oneRMs.deadlift).toBe(320); // 320.83 → 320
    expect(input.oneRMs.press).toBe(135); // 134.17 → 135

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });
});
