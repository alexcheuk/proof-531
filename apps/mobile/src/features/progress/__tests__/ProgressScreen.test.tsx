/**
 * Smoke + behavioral tests for the rewritten Progress screen.
 *
 * Verifies the canonical-driven layout renders without crash and exercises
 * the goal panel and past-cell tap. Visual fidelity (alignment, spacing) is
 * checked manually on-device.
 */
import { ThemeProvider } from '@/design/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

jest.mock('react-native-reanimated', () => {
  const RN = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: { View: RN.View, Text: RN.Text, ScrollView: RN.ScrollView },
    useSharedValue: (v: unknown) => ({ value: v }),
    useAnimatedStyle: () => ({}),
    withTiming: (v: unknown) => v,
  };
});

const mockRouterPush = jest.fn();
const mockRouterSetParams = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: jest.fn(),
    back: jest.fn(),
    setParams: mockRouterSetParams,
  }),
  useLocalSearchParams: () => ({}),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success' },
}));

const mockSetGoal = jest.fn().mockResolvedValue(null);
const mockSetDaysPerWeek = jest.fn().mockResolvedValue(undefined);
jest.mock('@/data/queries/useSettings', () => ({
  useSettings: () => ({
    data: {
      storageUnit: 'lbs',
      displayUnit: 'lbs',
      enabledLifts: ['squat'],
      currentCycle: 3,
      week: 2,
    },
    isLoading: false,
    isError: false,
  }),
}));
jest.mock('@/data/queries/useLatestTm', () => ({
  useLatestTms: () => ({
    data: [{ lift: 'squat', value: 275, unit: 'lbs' }],
    isLoading: false,
    isError: false,
  }),
}));
jest.mock('@/data/queries/usePrs', () => ({
  usePrs: () => ({
    data: [{ lift: 'squat', bestE1RM: 310, setLogId: 1, achievedAt: 1 }],
    isLoading: false,
    isError: false,
  }),
}));
jest.mock('@/data/queries/useLiftGoal', () => ({
  useLiftGoal: () => ({ data: null, isLoading: false, isError: false }),
  LIFT_GOAL_KEY: (lift: string) => ['liftGoal', lift],
}));
jest.mock('@/data/queries/useSetLiftGoal', () => ({
  useSetLiftGoal: () => ({ mutateAsync: mockSetGoal, isPending: false }),
}));
jest.mock('@/data/queries/useSetLiftGoalDaysPerWeek', () => ({
  useSetLiftGoalDaysPerWeek: () => ({ mutateAsync: mockSetDaysPerWeek, isPending: false }),
}));
jest.mock('@/data/queries/useLiftProgression', () => ({
  useLiftProgression: (lift: string) => ({
    data: {
      lift,
      unit: 'lbs',
      tm: 275,
      currentCycle: 3,
      currentWeek: 2,
      rows: [
        {
          cycle: 1,
          isPast: true,
          isCurrent: false,
          isFuture: false,
          tm: 275,
          cells: [
            {
              kind: 'past',
              cycle: 1,
              day: 1,
              sessionId: 11,
              topWeight: 215,
              topReps: 5,
              amrap: true,
              deload: false,
            },
            {
              kind: 'past',
              cycle: 1,
              day: 2,
              sessionId: 12,
              topWeight: 230,
              topReps: 5,
              amrap: true,
              deload: false,
            },
            {
              kind: 'past',
              cycle: 1,
              day: 3,
              sessionId: 13,
              topWeight: 240,
              topReps: 1,
              amrap: true,
              deload: false,
            },
            {
              kind: 'past',
              cycle: 1,
              day: 4,
              sessionId: 14,
              topWeight: 155,
              topReps: 5,
              amrap: false,
              deload: true,
            },
          ],
        },
        {
          cycle: 3,
          isPast: false,
          isCurrent: true,
          isFuture: false,
          tm: 275,
          cells: [
            {
              kind: 'past',
              cycle: 3,
              day: 1,
              sessionId: 31,
              topWeight: 230,
              topReps: 5,
              amrap: true,
              deload: false,
            },
            { kind: 'now', cycle: 3, day: 2, prescribedWeight: 245, deload: false },
            { kind: 'future', cycle: 3, day: 3, projectedWeight: 260, deload: false },
            { kind: 'future', cycle: 3, day: 4, projectedWeight: 165, deload: true },
          ],
        },
        {
          cycle: 4,
          isPast: false,
          isCurrent: false,
          isFuture: true,
          tm: 285,
          cells: [
            { kind: 'future', cycle: 4, day: 1, projectedWeight: 215, deload: false },
            { kind: 'future', cycle: 4, day: 2, projectedWeight: 240, deload: false },
            { kind: 'future', cycle: 4, day: 3, projectedWeight: 270, deload: false },
            { kind: 'future', cycle: 4, day: 4, projectedWeight: 170, deload: true },
          ],
        },
      ],
      goal: null,
      cyclesUntilGoal: null,
    },
    isLoading: false,
    isError: false,
  }),
  LIFT_PROGRESSION_KEY: (lift: string) => ['liftProgression', lift],
}));

import { ProgressScreen } from '../ProgressScreen';

const wrap = (ui: ReactElement) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider>{ui}</ThemeProvider>
    </QueryClientProvider>,
  );

beforeEach(() => {
  mockRouterPush.mockClear();
  mockRouterSetParams.mockClear();
  mockSetGoal.mockClear();
  mockSetDaysPerWeek.mockClear();
});

describe('ProgressScreen', () => {
  it('renders title, stats triplet, grid header, and footnote', () => {
    const screen = wrap(<ProgressScreen lift="squat" />);
    expect(screen.getByText('Progress.')).toBeTruthy();
    expect(screen.getByText('On the back squat')).toBeTruthy();
    expect(screen.getByText('Training max')).toBeTruthy();
    expect(screen.getByText('Best e1rm')).toBeTruthy();
    expect(screen.getByText('D1')).toBeTruthy();
    expect(screen.getByText('D2')).toBeTruthy();
    expect(screen.getByText('D3')).toBeTruthy();
    expect(screen.getByText('D4')).toBeTruthy();
    expect(screen.getByText('→ TM')).toBeTruthy();
    expect(screen.getByText(/per cycle · lower body/)).toBeTruthy();
  });

  it('renders cycle labels (C1, C3, C4 — no leading zeros)', () => {
    const screen = wrap(<ProgressScreen lift="squat" />);
    expect(screen.getByText('C1')).toBeTruthy();
    // C3 appears both in the stats triplet "Cycle" column and as the current-cycle row label.
    expect(screen.getAllByText('C3').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('C4')).toBeTruthy();
  });

  it('shows the NEXT caps label on the current week cell', () => {
    const screen = wrap(<ProgressScreen lift="squat" />);
    expect(screen.getByText('next')).toBeTruthy();
  });

  it('renders goal panel with TM tab selected by default and ±/value steppers', () => {
    const screen = wrap(<ProgressScreen lift="squat" />);
    expect(screen.getByTestId('goal-panel-squat-tab-tm')).toBeTruthy();
    expect(screen.getByTestId('goal-panel-squat-tab-1rm')).toBeTruthy();
    expect(screen.getByTestId('goal-panel-squat-inc')).toBeTruthy();
    expect(screen.getByTestId('goal-panel-squat-dec')).toBeTruthy();
  });

  it('persists a goal when the increment stepper is tapped (creates goal on first tap)', () => {
    const screen = wrap(<ProgressScreen lift="squat" />);
    fireEvent.press(screen.getByTestId('goal-panel-squat-inc'));
    expect(mockSetGoal).toHaveBeenCalledTimes(1);
    expect(mockSetGoal).toHaveBeenCalledWith(
      expect.objectContaining({
        lift: 'squat',
        target: expect.objectContaining({ kind: 'tm', unit: 'lbs' }),
      }),
    );
  });

  it('switches goal kind to 1RM when the 1rm tab is tapped', () => {
    const screen = wrap(<ProgressScreen lift="squat" />);
    fireEvent.press(screen.getByTestId('goal-panel-squat-tab-1rm'));
    expect(mockSetGoal).toHaveBeenCalledTimes(1);
    expect(mockSetGoal).toHaveBeenCalledWith(
      expect.objectContaining({
        lift: 'squat',
        target: expect.objectContaining({ kind: '1rm' }),
      }),
    );
  });

  it('routes to SessionComplete when a past cell is tapped', () => {
    const screen = wrap(<ProgressScreen lift="squat" />);
    fireEvent.press(screen.getByTestId('progress-cell-1-1'));
    expect(mockRouterPush).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/session/complete',
        params: expect.objectContaining({ sessionId: '11', from: 'history' }),
      }),
    );
  });
});
