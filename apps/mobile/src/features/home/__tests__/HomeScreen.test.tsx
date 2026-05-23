/**
 * Behavioral test for the Home screen.
 *
 * Verifies:
 *  - On first render the LiftStats cell for "TM" shows the TM of the first
 *    enabled lift (squat → 315 lb).
 *  - Pressing the second tab (bench) updates the TM cell to bench's TM
 *    (245 lb), proving the lift-switch flow and the LiftPage swap.
 *
 * Mocks every data hook + expo-router + expo-haptics so the screen renders
 * headless under jest-expo. Reanimated 4 is auto-mocked by `jest-expo`.
 */
import { ThemeProvider } from '@/design/theme';
import { fireEvent, render, within } from '@testing-library/react-native';
import type { ReactElement } from 'react';

// Reanimated 4 boots `react-native-worklets` at module load — that native
// init never lands under jest, so any `import 'react-native-reanimated'`
// throws. The shipping `mock.js` also pulls worklets, so we substitute a
// minimal inline mock: `Animated.View` falls through to a plain RN View
// and `LinearTransition` becomes an opaque object — exactly what the
// behavioral test for lift-switch needs.
jest.mock('react-native-reanimated', () => {
  const RN = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: { View: RN.View, Text: RN.Text, ScrollView: RN.ScrollView },
    LinearTransition: { duration: () => ({}) },
    FadeIn: { duration: () => ({}) },
    FadeOut: { duration: () => ({}) },
  };
});

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), back: jest.fn() }),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

jest.mock('@/data/queries/useSettings', () => ({
  useSettings: () => ({
    data: {
      id: 1,
      storageUnit: 'lbs',
      displayUnit: 'lbs',
      plateSet: 'standard',
      enabledLifts: ['squat', 'bench', 'deadlift', 'press'],
      currentCycle: 2,
      week: 1,
      day: 1,
    },
    isLoading: false,
    error: null,
  }),
}));

jest.mock('@/data/queries/useLatestTm', () => ({
  useLatestTms: () => ({
    data: [
      { id: 1, lift: 'squat', value: 315, unit: 'lbs', updatedAt: 1, note: null },
      { id: 2, lift: 'bench', value: 245, unit: 'lbs', updatedAt: 1, note: null },
      { id: 3, lift: 'deadlift', value: 405, unit: 'lbs', updatedAt: 1, note: null },
      { id: 4, lift: 'press', value: 155, unit: 'lbs', updatedAt: 1, note: null },
    ],
    isLoading: false,
    error: null,
  }),
}));

jest.mock('@/data/queries/usePrs', () => ({
  usePrs: () => ({ data: [], isLoading: false, error: null }),
}));

// Import after mocks.
import { HomeScreen } from '../HomeScreen';

const renderScreen = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

const childText = (node: unknown): string => {
  const n = node as { children?: ReadonlyArray<unknown> };
  if (!n.children) return '';
  return n.children
    .map((c) => (typeof c === 'string' || typeof c === 'number' ? String(c) : ''))
    .join('');
};

describe('HomeScreen', () => {
  it('initially renders the first enabled lift (squat) with its TM', () => {
    const screen = renderScreen(<HomeScreen />);

    expect(screen.getByTestId('lift-page-squat')).toBeTruthy();

    const tmCell = screen.getByTestId('lift-stats-cell-0');
    // The cell's body has the caps label + value; we check the value
    // text contains "315".
    const valueText = within(tmCell).getByText(/315/);
    expect(childText(valueText)).toBe('315 lb');
  });

  it('updates the LiftStats TM when a different lift tab is pressed', () => {
    const screen = renderScreen(<HomeScreen />);

    // Bench tab — second entry in enabledLifts.
    fireEvent.press(screen.getByTestId('lift-tabs-rail-bench'));

    expect(screen.getByTestId('lift-page-bench')).toBeTruthy();
    const tmCell = screen.getByTestId('lift-stats-cell-0');
    const valueText = within(tmCell).getByText(/245/);
    expect(childText(valueText)).toBe('245 lb');
  });
});
