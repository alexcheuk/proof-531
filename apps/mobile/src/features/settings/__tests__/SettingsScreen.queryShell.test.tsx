/**
 * Behavioral test for the Settings screen's QueryShell-gated loading/error
 * states (PF-02). Mocks `useSettingsScreenData` so we don't need a real db.
 */
import { ThemeProvider } from '@/design/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), back: jest.fn() }),
}));

// Reanimated 4 boots `react-native-worklets` at module load  -  that native
// init never lands under jest. Substitute a minimal inline mock.
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

// Render the gorhom bottom-sheet's children inline  -  mirrors SettingsScreen.test.tsx.
type MockBottomSheetProps = { index?: number; children?: React.ReactNode };
type MockViewProps = { children?: React.ReactNode; testID?: string };
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ index, children }: MockBottomSheetProps) => {
      if ((index ?? -1) < 0) return null;
      return React.createElement(React.Fragment, null, children);
    },
    BottomSheetBackdrop: () => null,
    BottomSheetView: ({ children }: MockViewProps) => {
      const React = require('react');
      return React.createElement(React.Fragment, null, children);
    },
  };
});

type MockSettingsScreenData = {
  settings: unknown;
  tmsByLift: unknown;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: jest.Mock;
};

const mockScreenDataState: MockSettingsScreenData = {
  settings: undefined,
  tmsByLift: undefined,
  isLoading: false,
  isError: false,
  error: null,
  refetch: jest.fn(),
};

jest.mock('../hooks/useSettingsScreenData', () => ({
  useSettingsScreenData: () => mockScreenDataState,
}));

jest.mock('@/data/DbProvider', () => ({
  useDb: () => ({}),
  DbProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Import after mocks.
import { SettingsScreen } from '../SettingsScreen';

const renderScreen = (ui: ReactElement) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ThemeProvider>{ui}</ThemeProvider>
    </QueryClientProvider>,
  );
};

describe('SettingsScreen  -  QueryShell states', () => {
  beforeEach(() => {
    mockScreenDataState.settings = undefined;
    mockScreenDataState.tmsByLift = undefined;
    mockScreenDataState.isLoading = false;
    mockScreenDataState.isError = false;
    mockScreenDataState.error = null;
  });

  it('renders the LOADING… caps line while the underlying queries are loading', () => {
    mockScreenDataState.isLoading = true;
    const screen = renderScreen(<SettingsScreen />);
    expect(screen.getByText('LOADING…')).toBeTruthy();
  });

  it("renders the COULDN'T LOAD caps line + message when the queries error", () => {
    mockScreenDataState.isError = true;
    mockScreenDataState.error = new Error('schema bust');
    const screen = renderScreen(<SettingsScreen />);
    expect(screen.getByText("COULDN'T LOAD")).toBeTruthy();
    expect(screen.getByText('schema bust')).toBeTruthy();
  });
});
