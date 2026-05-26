/**
 * Behavioral tests for LiftPage CTAs + eyebrow + cycle strip.
 *
 * Mocks reanimated + expo-router + expo-haptics so the component renders
 * headless under jest-expo.
 */
import { ThemeProvider } from '@/design/theme';
import { fireEvent, render, within } from '@testing-library/react-native';
import type { ReactElement } from 'react';

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

const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockRouterPush, replace: jest.fn(), back: jest.fn() }),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

const mockLastTrained: { startedAt: number | null } = { startedAt: null };
jest.mock('@/data/queries/useLastCompletedSessionForLift', () => ({
  useLastCompletedSessionForLift: () => ({
    startedAt: mockLastTrained.startedAt,
    isLoading: false,
  }),
}));

import { colors } from '@/design/tokens';
// Import after mocks.
import { LiftPage } from '../components/LiftPage';

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

type RequiredProps = Parameters<typeof LiftPage>[0];

const baseProps: RequiredProps = {
  lift: 'squat',
  week: 1,
  cycle: 2,
  storageUnit: 'lbs',
  displayUnit: 'lbs',
  plateSet: 'standard',
  tm: 315,
  bestE1RM: null,
  isInProgress: false,
  onBegin: () => {},
  onResume: () => {},
};

describe('LiftPage', () => {
  beforeEach(() => {
    mockRouterPush.mockClear();
    mockLastTrained.startedAt = null;
  });

  it('renders the Begin session CTA when not in progress', () => {
    const screen = wrap(<LiftPage {...baseProps} isInProgress={false} />);
    const cta = screen.getByTestId('lift-page-squat-cta');
    expect(within(cta).getByText('Begin session')).toBeTruthy();
    expect(within(cta).getByText('→')).toBeTruthy();
  });

  it('renders the Resume session CTA + ↩ glyph when in progress with no logged sets', () => {
    const screen = wrap(<LiftPage {...baseProps} isInProgress={true} />);
    const cta = screen.getByTestId('lift-page-squat-cta');
    expect(within(cta).getByText('Resume session')).toBeTruthy();
    expect(within(cta).getByText('↩')).toBeTruthy();
  });

  it('upgrades the Resume CTA copy to "Resume · set N of 3" once partial progress exists', () => {
    const screen = wrap(<LiftPage {...baseProps} isInProgress={true} completedCount={1} />);
    const cta = screen.getByTestId('lift-page-squat-cta');
    expect(within(cta).getByText('Resume · set 2 of 3')).toBeTruthy();
  });

  it('falls back to plain "Resume session" copy once all 3 sets are logged (avoids "set 4 of 3")', () => {
    // The brief window between the third set log and the session-complete
    // transition can leave isInProgress=true while completedCount===3. The
    // CTA should not surface a nonsensical "Resume · set 4 of 3".
    const screen = wrap(<LiftPage {...baseProps} isInProgress={true} completedCount={3} />);
    const cta = screen.getByTestId('lift-page-squat-cta');
    expect(within(cta).getByText('Resume session')).toBeTruthy();
  });

  it('fires onBegin when primary CTA is pressed (not in progress)', () => {
    const onBegin = jest.fn();
    const onResume = jest.fn();
    const screen = wrap(
      <LiftPage {...baseProps} isInProgress={false} onBegin={onBegin} onResume={onResume} />,
    );
    fireEvent.press(screen.getByTestId('lift-page-squat-cta'));
    expect(onBegin).toHaveBeenCalledTimes(1);
    expect(onResume).not.toHaveBeenCalled();
  });

  it('fires onResume when primary CTA is pressed (in progress)', () => {
    const onBegin = jest.fn();
    const onResume = jest.fn();
    const screen = wrap(
      <LiftPage {...baseProps} isInProgress={true} onBegin={onBegin} onResume={onResume} />,
    );
    fireEvent.press(screen.getByTestId('lift-page-squat-cta'));
    expect(onResume).toHaveBeenCalledTimes(1);
    expect(onBegin).not.toHaveBeenCalled();
  });

  it('routes to the Progress tab when the "SEE PROGRESS" link is pressed', () => {
    const screen = wrap(<LiftPage {...baseProps} />);
    fireEvent.press(screen.getByTestId('lift-page-squat-see-progress'));
    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/(tabs)/progress', params: { lift: 'squat' } }),
    );
  });

  it('renders 4 CycleStrip cells and inverts the active week', () => {
    const screen = wrap(<LiftPage {...baseProps} week={2} />);
    // All four cells present.
    expect(screen.getByTestId('cycle-strip-cell-1')).toBeTruthy();
    const active = screen.getByTestId('cycle-strip-cell-2');
    expect(active).toBeTruthy();
    expect(screen.getByTestId('cycle-strip-cell-3')).toBeTruthy();
    expect(screen.getByTestId('cycle-strip-cell-4')).toBeTruthy();

    // Active cell is inverted (ink0 background). Style may be an array.
    const flatten = (s: unknown): Record<string, unknown> => {
      if (Array.isArray(s)) return Object.assign({}, ...s.map(flatten));
      if (s && typeof s === 'object') return s as Record<string, unknown>;
      return {};
    };
    const style = flatten(active.props.style);
    expect(style.backgroundColor).toBe(colors.ink0);
  });

  it('renders the "In progress" eyebrow only when isInProgress', () => {
    const off = wrap(<LiftPage {...baseProps} isInProgress={false} />);
    expect(off.queryByTestId('lift-page-squat-in-progress')).toBeNull();
    expect(off.queryByText('In progress')).toBeNull();

    off.unmount();

    const on = wrap(<LiftPage {...baseProps} isInProgress={true} />);
    expect(on.getByTestId('lift-page-squat-in-progress')).toBeTruthy();
    expect(on.getByText('In progress')).toBeTruthy();
  });

  it('renders a "LAST TRAINED …" hint when the lift has prior completed sessions', () => {
    mockLastTrained.startedAt = Date.now() - 3 * 24 * 60 * 60 * 1000; // 3 days ago
    const screen = wrap(<LiftPage {...baseProps} isInProgress={false} />);
    const hint = screen.getByTestId('lift-page-squat-last-trained');
    expect(hint).toBeTruthy();
    expect((hint.props.children as string).startsWith('LAST TRAINED')).toBe(true);
  });

  it('hides the LAST TRAINED hint when in progress', () => {
    mockLastTrained.startedAt = Date.now() - 3 * 24 * 60 * 60 * 1000;
    const screen = wrap(<LiftPage {...baseProps} isInProgress={true} />);
    expect(screen.queryByTestId('lift-page-squat-last-trained')).toBeNull();
  });

  it('hides the LAST TRAINED hint when no prior completed session exists', () => {
    mockLastTrained.startedAt = null;
    const screen = wrap(<LiftPage {...baseProps} isInProgress={false} />);
    expect(screen.queryByTestId('lift-page-squat-last-trained')).toBeNull();
  });

  it('renders the empty state (NO TRAINING MAX SET) when tm is null', () => {
    const screen = wrap(<LiftPage {...baseProps} tm={null} />);
    expect(screen.getByText('NO TRAINING MAX SET')).toBeTruthy();
    expect(screen.getByTestId('lift-page-squat-open-settings')).toBeTruthy();
    // No primary CTA in empty state.
    expect(screen.queryByTestId('lift-page-squat-cta')).toBeNull();
  });
});
