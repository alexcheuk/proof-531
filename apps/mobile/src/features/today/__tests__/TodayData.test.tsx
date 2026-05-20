import { ThemeProvider } from '@/design/theme';
import { fireEvent, render, within } from '@testing-library/react-native';
import type React from 'react';
import { TodayData } from '../TodayData';
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
// `prescribedSets(300, 1)`.
const session: TodaySession = {
  cycleNumber: 3,
  liftId: 'squat',
  liftLabel: 'Squat',
  trainingMax: 300,
  unit: 'lbs',
  weekOfCycle: 1,
  sets: [],
};

describe('TodayData', () => {
  it('renders 4 DataStat tiles in the stats strip', () => {
    const { getByTestId } = wrap(<TodayData session={session} />);
    expect(getByTestId('data-stat-cycle')).toBeTruthy();
    expect(getByTestId('data-stat-week')).toBeTruthy();
    expect(getByTestId('data-stat-top')).toBeTruthy();
    expect(getByTestId('data-stat-tm')).toBeTruthy();
  });

  it('renders 3 main SetRows for a week-1 session', () => {
    const { getByTestId } = wrap(<TodayData session={session} />);
    const main = within(getByTestId('today-main-section'));
    expect(main.getAllByTestId(/^set-row-/)).toHaveLength(3);
  });

  it('renders an Assistance section with at least one row', () => {
    const { getByTestId } = wrap(<TodayData session={session} />);
    const assistance = within(getByTestId('today-assistance-section'));
    expect(assistance.getAllByTestId(/^assistance-row-/).length).toBeGreaterThanOrEqual(1);
  });

  it('pressing the next SetRow calls onStartSet with its index', () => {
    const onStartSet = jest.fn();
    const { getByTestId } = wrap(<TodayData session={session} onStartSet={onStartSet} />);
    const main = within(getByTestId('today-main-section'));
    fireEvent.press(main.getByTestId('set-row-next'));
    // With no done sets, the next index is 0.
    expect(onStartSet).toHaveBeenCalledWith(0);
  });

  it('renders the watch button when onOpenWatch is provided', () => {
    const onOpenWatch = jest.fn();
    const { getByTestId } = wrap(<TodayData session={session} onOpenWatch={onOpenWatch} />);
    fireEvent.press(getByTestId('today-open-watch'));
    expect(onOpenWatch).toHaveBeenCalledTimes(1);
  });
});
