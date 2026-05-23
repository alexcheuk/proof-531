/**
 * Behavioral test for `FirstLaunchGate`.
 *
 * Three states are exercised:
 *   1. `useLatestTms()` reports data with at least one row → render children.
 *   2. `useLatestTms()` reports an empty array → render `<Redirect href="/onboarding" />`.
 *   3. `useLatestTms()` is still loading → render nothing (no flash).
 *
 * Mocks:
 *  - `expo-router` `Redirect`             — record the `href` it was called with
 *  - `@/data/queries/useLatestTm`         — drive the gate's decision
 */
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

const mockRedirect = jest.fn();

jest.mock('expo-router', () => ({
  Redirect: (props: { href: string }) => {
    mockRedirect(props.href);
    return null;
  },
}));

const mockUseLatestTms = jest.fn();

jest.mock('@/data/queries/useLatestTm', () => ({
  useLatestTms: () => mockUseLatestTms(),
}));

// Import after mocks so the module picks them up.
import { FirstLaunchGate } from '../FirstLaunchGate';

describe('FirstLaunchGate', () => {
  beforeEach(() => {
    mockRedirect.mockClear();
    mockUseLatestTms.mockReset();
  });

  it('renders children when at least one TM row exists (settings present → tabs path)', () => {
    mockUseLatestTms.mockReturnValue({
      data: [{ lift: 'squat', value: 315, unit: 'lbs' }],
      isLoading: false,
    });

    const { getByText } = render(
      <FirstLaunchGate>
        <Text>tabs</Text>
      </FirstLaunchGate>,
    );

    expect(getByText('tabs')).toBeTruthy();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('redirects to /onboarding when no TM rows exist (no settings → onboarding shell)', () => {
    mockUseLatestTms.mockReturnValue({ data: [], isLoading: false });

    const { queryByText } = render(
      <FirstLaunchGate>
        <Text>tabs</Text>
      </FirstLaunchGate>,
    );

    expect(queryByText('tabs')).toBeNull();
    expect(mockRedirect).toHaveBeenCalledTimes(1);
    expect(mockRedirect).toHaveBeenCalledWith('/onboarding');
  });

  it('renders nothing while the query is loading', () => {
    mockUseLatestTms.mockReturnValue({ data: undefined, isLoading: true });

    const { queryByText } = render(
      <FirstLaunchGate>
        <Text>tabs</Text>
      </FirstLaunchGate>,
    );

    expect(queryByText('tabs')).toBeNull();
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
