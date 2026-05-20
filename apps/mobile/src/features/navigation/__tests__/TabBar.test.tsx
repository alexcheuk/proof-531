import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TabBar, type TabBarProps } from '../TabBar';

// Minimal props factory matching the local TabBarProps shape we ported from
// @react-navigation/bottom-tabs' BottomTabBarProps.
function makeProps(activeIndex = 0): TabBarProps & { navigation: TabBarProps['navigation'] } {
  const emit = jest.fn(() => ({ defaultPrevented: false }));
  const navigate = jest.fn();
  return {
    state: {
      index: activeIndex,
      routes: [
        { key: 'home-1', name: 'home', params: undefined },
        { key: 'train-1', name: 'train', params: undefined },
        { key: 'cycle-1', name: 'cycle', params: undefined },
        { key: 'history-1', name: 'history', params: undefined },
        { key: 'settings-1', name: 'settings', params: undefined },
      ],
    },
    navigation: { emit, navigate },
  };
}

// Seed insets so `useSafeAreaInsets()` returns deterministic values in tests.
const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 320, height: 640 },
  insets: { top: 0, right: 0, bottom: 16, left: 0 },
};

const wrap = (ui: React.ReactElement) =>
  render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );

describe('TabBar', () => {
  it('renders one button per route (5 tabs)', () => {
    const { getAllByRole } = wrap(<TabBar {...makeProps(0)} />);
    expect(getAllByRole('button')).toHaveLength(5);
  });

  it('marks only the active tab as selected', () => {
    const { getAllByRole } = wrap(<TabBar {...makeProps(2)} />);
    const buttons = getAllByRole('button');
    const [home, , cycle, , settings] = buttons;
    expect(cycle?.props.accessibilityState).toEqual(expect.objectContaining({ selected: true }));
    expect(home?.props.accessibilityState).toEqual(expect.objectContaining({ selected: false }));
    expect(settings?.props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false }),
    );
  });

  it('exposes a humanised accessibilityLabel per tab', () => {
    const { getByLabelText } = wrap(<TabBar {...makeProps(0)} />);
    expect(getByLabelText('Home')).toBeTruthy();
    expect(getByLabelText('Train')).toBeTruthy();
    expect(getByLabelText('Cycle')).toBeTruthy();
    expect(getByLabelText('History')).toBeTruthy();
    expect(getByLabelText('You')).toBeTruthy();
  });

  it('navigates to the tapped route when an inactive tab is pressed', () => {
    const props = makeProps(0);
    const { getByLabelText } = wrap(<TabBar {...props} />);
    fireEvent.press(getByLabelText('Train'));
    expect(props.navigation.emit).toHaveBeenCalledWith({
      type: 'tabPress',
      target: 'train-1',
      canPreventDefault: true,
    });
    expect(props.navigation.navigate).toHaveBeenCalledWith('train', undefined);
  });

  it('does not navigate when the already-active tab is pressed', () => {
    const props = makeProps(2);
    const { getByLabelText } = wrap(<TabBar {...props} />);
    fireEvent.press(getByLabelText('Cycle'));
    expect(props.navigation.emit).toHaveBeenCalledTimes(1);
    expect(props.navigation.navigate).not.toHaveBeenCalled();
  });

  it('does not navigate when the tabPress event is preventDefault-ed', () => {
    const props = makeProps(0);
    (props.navigation.emit as jest.Mock).mockReturnValueOnce({ defaultPrevented: true });
    const { getByLabelText } = wrap(<TabBar {...props} />);
    fireEvent.press(getByLabelText('History'));
    expect(props.navigation.navigate).not.toHaveBeenCalled();
  });

  it('renders the active tab label (only) — inactive tabs show icon only', () => {
    const { queryByText } = wrap(<TabBar {...makeProps(1)} />);
    // Train is active → label rendered.
    expect(queryByText('Train')).toBeTruthy();
    // Home is inactive → label suppressed.
    expect(queryByText('Home')).toBeNull();
    expect(queryByText('Cycle')).toBeNull();
  });
});
