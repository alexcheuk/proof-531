import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import type { ReactElement } from 'react';
import { CustomTabBar, type CustomTabBarProps } from '../CustomTabBar';

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 34, left: 0 }),
  // biome-ignore lint/suspicious/noExplicitAny: trivial test provider stub
  SafeAreaProvider: ({ children }: any) => children,
}));

// CustomTabBar now reads `useActiveSession` to surface a tab-bar dot when a
// session is in progress. Stub the hook so the bar can render without a
// QueryClientProvider / DbProvider in test.
const mockActiveSession: { data: { lift: string } | null } = { data: null };
jest.mock('@/data/queries/useActiveSession', () => ({
  useActiveSession: () => mockActiveSession,
}));

function makeProps(activeIdx = 0): CustomTabBarProps {
  return {
    state: {
      index: activeIdx,
      routes: [
        { key: 'index-1', name: 'index' },
        { key: 'history-1', name: 'history' },
        { key: 'settings-1', name: 'settings' },
      ],
    },
    descriptors: {},
    navigation: {
      emit: jest.fn(() => ({ defaultPrevented: false })),
      navigate: jest.fn(),
    },
  };
}

const renderTabBar = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('CustomTabBar', () => {
  beforeEach(() => {
    (Haptics.selectionAsync as jest.Mock).mockClear();
    mockActiveSession.data = null;
  });

  it('renders TODAY, HISTORY, YOU labels', () => {
    const { getByText } = renderTabBar(<CustomTabBar {...makeProps()} />);
    expect(getByText('TODAY')).toBeTruthy();
    expect(getByText('HISTORY')).toBeTruthy();
    expect(getByText('YOU')).toBeTruthy();
  });

  it('fires Haptics.selectionAsync on tab switch', () => {
    const props = makeProps(0);
    const { getByTestId } = renderTabBar(<CustomTabBar {...props} />);
    fireEvent.press(getByTestId('tab-history'));
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
    expect(props.navigation.navigate).toHaveBeenCalledWith('history');
  });

  it('does NOT fire haptic when re-pressing the active tab', () => {
    const props = makeProps(0); // index is active
    const { getByTestId } = renderTabBar(<CustomTabBar {...props} />);
    fireEvent.press(getByTestId('tab-index'));
    expect(Haptics.selectionAsync).not.toHaveBeenCalled();
    expect(props.navigation.navigate).not.toHaveBeenCalled();
  });

  it('marks the active tab via accessibilityState.selected', () => {
    const { getByTestId } = renderTabBar(<CustomTabBar {...makeProps(1)} />);
    expect(getByTestId('tab-index').props.accessibilityState).toEqual({ selected: false });
    expect(getByTestId('tab-history').props.accessibilityState).toEqual({ selected: true });
    expect(getByTestId('tab-settings').props.accessibilityState).toEqual({ selected: false });
  });

  it('shows an in-progress dot on the TODAY tab when a session is active', () => {
    mockActiveSession.data = { lift: 'squat' };
    const { getByTestId, queryByTestId } = renderTabBar(<CustomTabBar {...makeProps(1)} />);
    expect(queryByTestId('tab-index-progress-dot')).not.toBeNull();
    expect(getByTestId('tab-index').props.accessibilityLabel).toBe('TODAY, session in progress');
  });

  it('omits the dot when no session is active', () => {
    mockActiveSession.data = null;
    const { queryByTestId } = renderTabBar(<CustomTabBar {...makeProps()} />);
    expect(queryByTestId('tab-index-progress-dot')).toBeNull();
  });
});
