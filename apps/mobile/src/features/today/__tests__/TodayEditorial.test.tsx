import { ThemeProvider } from '@/design/theme';
import { fireEvent, render } from '@testing-library/react-native';
import type React from 'react';
import { TodayEditorial } from '../TodayEditorial';
import type { TodaySession } from '../today-types';

jest.mock('@shopify/react-native-skia', () => {
  const ReactMock = require('react');
  const passthrough = ({ children }: { children?: unknown }) =>
    ReactMock.createElement(ReactMock.Fragment, null, children);
  return {
    Canvas: passthrough,
    Group: passthrough,
    Rect: passthrough,
    RoundedRect: () => null,
    Path: () => null,
    LinearGradient: () => null,
    vec: (x: number, y: number) => ({ x, y }),
    Skia: { Path: { Make: () => ({ addCircle() {}, addArc() {} }) } },
  };
});

const wrap = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

// Empty `sets` so the component derives 3 prescribed sets for week 1 via
// `prescribedSets(300, 1)`: [195×5, 225×5, 250×5+] at 65/75/85%.
const session: TodaySession = {
  cycleNumber: 3,
  liftId: 'squat',
  liftLabel: 'Squat',
  trainingMax: 300,
  unit: 'lbs',
  weekOfCycle: 1,
  sets: [],
};

describe('TodayEditorial', () => {
  it('renders the editorial container and header', () => {
    const { getByTestId } = wrap(<TodayEditorial session={session} />);
    expect(getByTestId('today-editorial')).toBeTruthy();
    expect(getByTestId('today-header')).toBeTruthy();
  });

  it('header shows cycle and week info', () => {
    const { getByText } = wrap(<TodayEditorial session={session} />);
    expect(getByText('Cycle 3 · Week 1')).toBeTruthy();
    expect(getByText('Squat')).toBeTruthy();
  });

  it('renders the week scheme label', () => {
    const { getByText } = wrap(<TodayEditorial session={session} />);
    expect(getByText('5 / 5 / 5+')).toBeTruthy();
  });

  it('renders 3 prescribed set rows for a week-1 session', () => {
    const { getAllByTestId } = wrap(<TodayEditorial session={session} />);
    expect(getAllByTestId(/^set-(row|amrap)/)).toHaveLength(3);
  });

  it('last set is marked as AMRAP via testID', () => {
    const { getByTestId } = wrap(<TodayEditorial session={session} />);
    expect(getByTestId('set-amrap')).toBeTruthy();
  });

  it('pressing a set calls onStartSet with the index', () => {
    const onStartSet = jest.fn();
    const { getByTestId } = wrap(<TodayEditorial session={session} onStartSet={onStartSet} />);
    fireEvent.press(getByTestId('set-row-0'));
    expect(onStartSet).toHaveBeenCalledWith(0);
    fireEvent.press(getByTestId('set-amrap'));
    expect(onStartSet).toHaveBeenCalledWith(2);
  });

  it('renders the watch button when onOpenWatch is provided', () => {
    const onOpenWatch = jest.fn();
    const { getByTestId } = wrap(<TodayEditorial session={session} onOpenWatch={onOpenWatch} />);
    fireEvent.press(getByTestId('today-open-watch'));
    expect(onOpenWatch).toHaveBeenCalledTimes(1);
  });

  it('uses pre-computed sets when session.sets is populated', () => {
    const explicit: TodaySession = {
      ...session,
      sets: [
        { index: 0, type: 'main', weight: 100, reps: 5, amrap: false, pct: 0.65 },
        { index: 1, type: 'main', weight: 120, reps: 5, amrap: true, pct: 0.85 },
      ],
    };
    const { getAllByTestId } = wrap(<TodayEditorial session={explicit} />);
    expect(getAllByTestId(/^set-(row|amrap)/)).toHaveLength(2);
  });
});
